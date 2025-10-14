import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

interface Equipment {
  id: number;
  name: string;
  code: string;
  qrCode: string | null;
  barcode: string | null;
  category: string | null;
  status: string;
  description: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchasePrice: number | null;
  dailyRate: number | null;
  location: string | null;
}

interface ScanHistory {
  id: string;
  code: string;
  type: string;
  timestamp: Date;
  result: 'success' | 'error';
  equipmentName?: string;
}

export default function ScannerScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Kamera izni iste
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Scan history'yi load et
  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = () => {
    // AsyncStorage'dan geçmiş scan'leri yükle (opsiyonel)
    // Şimdilik state'te tutuyoruz
  };

  const saveScanToHistory = (scan: Omit<ScanHistory, 'id'>) => {
    const newScan: ScanHistory = {
      ...scan,
      id: Date.now().toString(),
    };
    setScanHistory((prev) => [newScan, ...prev].slice(0, 50)); // Son 50 scan
  };

  const handleBarCodeScanned = async ({ type, data }: BarCodeScannerResult) => {
    if (scanned) return;

    setScanned(true);
    setScanning(false);
    Vibration.vibrate(100); // Haptic feedback

    console.log(`Scanned ${type}: ${data}`);

    try {
      // Backend'den equipment'i ara
      const response = await api.get(`/equipment/scan/${encodeURIComponent(data)}`);
      
      if (response.data) {
        setSelectedEquipment(response.data);
        setShowDetailsModal(true);
        
        saveScanToHistory({
          code: data,
          type: type || 'unknown',
          timestamp: new Date(),
          result: 'success',
          equipmentName: response.data.name,
        });
      } else {
        throw new Error('Equipment not found');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      
      saveScanToHistory({
        code: data,
        type: type || 'unknown',
        timestamp: new Date(),
        result: 'error',
      });

      Alert.alert(
        'Ekipman Bulunamadı',
        `QR/Barkod: ${data}\n\nBu kod veritabanında bulunamadı. Lütfen kodu kontrol edin veya ekipmanı manuel olarak arayın.`,
        [
          {
            text: 'Tekrar Tara',
            onPress: () => {
              setScanned(false);
              setScanning(true);
            },
          },
          {
            text: 'Manuel Ara',
            onPress: () => navigation.navigate('Equipment' as never),
          },
        ]
      );
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEquipment(null);
    setScanned(false);
    setScanning(true);
  };

  const navigateToEquipmentDetail = () => {
    if (selectedEquipment) {
      closeDetailsModal();
      navigation.navigate('EquipmentDetail' as never, { id: selectedEquipment.id } as never);
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return '#10b981';
      case 'rented':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'Müsait';
      case 'rented':
        return 'Kiralandı';
      case 'maintenance':
        return 'Bakımda';
      default:
        return status;
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>Kamera izni bekleniyor...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color="#6b7280" />
        <Text style={styles.noPermissionText}>Kamera izni verilmedi</Text>
        <Text style={styles.noPermissionSubtext}>
          QR/Barkod tarayıcıyı kullanmak için kamera iznine ihtiyacınız var.
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => Alert.alert('Ayarlar', 'Lütfen uygulama ayarlarından kamera iznini aktifleştirin.')}
        >
          <Text style={styles.settingsButtonText}>Ayarlara Git</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scanner View */}
      {scanning && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barCodeTypes={[
            BarCodeScanner.Constants.BarCodeType.qr,
            BarCodeScanner.Constants.BarCodeType.ean13,
            BarCodeScanner.Constants.BarCodeType.ean8,
            BarCodeScanner.Constants.BarCodeType.code128,
            BarCodeScanner.Constants.BarCodeType.code39,
            BarCodeScanner.Constants.BarCodeType.upc_e,
            BarCodeScanner.Constants.BarCodeType.pdf417,
          ]}
          flashMode={
            flashOn
              ? BarCodeScanner.Constants.FlashMode.torch
              : BarCodeScanner.Constants.FlashMode.off
          }
        />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>QR/Barkod Tara</Text>
          <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.iconButton}>
            <Ionicons name="time-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanningArea}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
          
          {scanned && (
            <View style={styles.scanningOverlay}>
              <Text style={styles.scanningText}>İşleniyor...</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            QR kodu veya barkodu çerçeve içine getirin
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
            <Ionicons
              name={flashOn ? 'flash' : 'flash-off'}
              size={32}
              color={flashOn ? '#fbbf24' : '#fff'}
            />
            <Text style={styles.controlButtonText}>Flaş</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setScanned(false);
              setScanning(true);
            }}
            style={[styles.controlButton, styles.scanButton]}
          >
            <Ionicons name="scan" size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Equipment' as never)}
            style={styles.controlButton}
          >
            <Ionicons name="search-outline" size={32} color="#fff" />
            <Text style={styles.controlButtonText}>Manuel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Equipment Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                <Text style={styles.modalTitle}>Ekipman Bulundu</Text>
              </View>
              <TouchableOpacity onPress={closeDetailsModal}>
                <Ionicons name="close" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Equipment Details */}
            {selectedEquipment && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.equipmentName}>{selectedEquipment.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedEquipment.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(selectedEquipment.status)}
                    </Text>
                  </View>
                </View>

                {selectedEquipment.description && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Açıklama</Text>
                    <Text style={styles.detailValue}>{selectedEquipment.description}</Text>
                  </View>
                )}

                {selectedEquipment.code && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ekipman Kodu</Text>
                    <Text style={styles.detailValue}>{selectedEquipment.code}</Text>
                  </View>
                )}

                {selectedEquipment.serialNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Seri No</Text>
                    <Text style={styles.detailValue}>{selectedEquipment.serialNumber}</Text>
                  </View>
                )}

                {selectedEquipment.category && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Kategori</Text>
                    <Text style={styles.detailValue}>{selectedEquipment.category}</Text>
                  </View>
                )}

                {selectedEquipment.location && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Konum</Text>
                    <Text style={styles.detailValue}>{selectedEquipment.location}</Text>
                  </View>
                )}

                {selectedEquipment.dailyRate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Günlük Fiyat</Text>
                    <Text style={styles.detailValue}>
                      {selectedEquipment.dailyRate.toLocaleString('tr-TR')} TL
                    </Text>
                  </View>
                )}

                {selectedEquipment.purchaseDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Satın Alma Tarihi</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedEquipment.purchaseDate).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={closeDetailsModal}
              >
                <Text style={styles.modalButtonSecondaryText}>Tekrar Tara</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={navigateToEquipmentDetail}
              >
                <Text style={styles.modalButtonPrimaryText}>Detayları Gör</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scan History Modal */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Ionicons name="time-outline" size={32} color="#3b82f6" />
                <Text style={styles.modalTitle}>Tarama Geçmişi</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Ionicons name="close" size={28} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {scanHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="scan-outline" size={64} color="#d1d5db" />
                  <Text style={styles.emptyStateText}>Henüz tarama yapılmadı</Text>
                </View>
              ) : (
                scanHistory.map((scan) => (
                  <View key={scan.id} style={styles.historyItem}>
                    <View style={styles.historyItemLeft}>
                      <Ionicons
                        name={scan.result === 'success' ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color={scan.result === 'success' ? '#10b981' : '#ef4444'}
                      />
                      <View style={styles.historyItemInfo}>
                        <Text style={styles.historyItemName}>
                          {scan.equipmentName || 'Bilinmeyen Ekipman'}
                        </Text>
                        <Text style={styles.historyItemCode}>{scan.code}</Text>
                        <Text style={styles.historyItemTime}>
                          {new Date(scan.timestamp).toLocaleString('tr-TR')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.historyItemType}>{scan.type}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  noPermissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
  },
  noPermissionSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  settingsButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scanningArea: {
    alignSelf: 'center',
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
    borderBottomRightRadius: 8,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    opacity: 0.9,
  },
  scanButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 50,
    padding: 20,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  equipmentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonSecondaryText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyItemCode: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  historyItemTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  historyItemType: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
});
