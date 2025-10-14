import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera, Flashlight, FlashlightOff, Type } from 'lucide-react-native';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { colors } from '../../constants/colors';
import type { EquipmentStackNavigationProp } from '../../types';

const QRScannerScreen = () => {
  const navigation = useNavigation<EquipmentStackNavigationProp>();
  
  const { fetchEquipmentByQR } = useEquipmentStore();
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    await searchEquipment(data);
  };

  const searchEquipment = async (qrCode: string) => {
    try {
      const equipment = await fetchEquipmentByQR(qrCode);
      
      if (equipment) {
        navigation.navigate('EquipmentDetail', { equipmentId: equipment.id });
      } else {
        Alert.alert(
          'Ekipman Bulunamadı',
          `"${qrCode}" kodlu ekipman bulunamadı.`,
          [
            { text: 'Tekrar Tara', onPress: () => setScanned(false) },
            { text: 'İptal', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        'Ekipman aranırken bir hata oluştu.',
        [{ text: 'Tekrar Dene', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleManualSearch = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir kod girin.');
      return;
    }
    
    await searchEquipment(manualCode.trim());
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Camera size={64} color={colors.textSecondary} />
          <Text style={styles.messageText}>Kamera izni isteniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Camera size={64} color={colors.error} />
          <Text style={styles.messageText}>Kamera erişimi reddedildi</Text>
          <Text style={styles.subMessageText}>
            QR kod taramak için kamera iznine ihtiyaç var
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
            <Text style={styles.buttonText}>İzin Ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!showManualInput ? (
          <>
            {/* Scanner View */}
            <View style={styles.scannerContainer}>
              <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                torchMode={torchOn ? 'on' : 'off'}
              />
              
              {/* Scanning Frame */}
              <View style={styles.overlay}>
                <View style={styles.unfocusedContainer}>
                  <View style={styles.middleContainer}>
                    <View style={styles.unfocusedContainer} />
                    <View style={styles.focusedContainer}>
                      {/* Corner decorations */}
                      <View style={[styles.corner, styles.topLeft]} />
                      <View style={[styles.corner, styles.topRight]} />
                      <View style={[styles.corner, styles.bottomLeft]} />
                      <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.unfocusedContainer} />
                  </View>
                </View>
                <View style={styles.unfocusedContainer} />
              </View>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                  {scanned ? 'Ekipman aranıyor...' : 'QR kodu çerçeve içine alın'}
                </Text>
              </View>

              {/* Controls */}
              <View style={styles.controlsContainer}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleTorch}
                >
                  {torchOn ? (
                    <Flashlight size={28} color={colors.primary} />
                  ) : (
                    <FlashlightOff size={28} color={colors.textOnPrimary} />
                  )}
                </TouchableOpacity>

                {scanned && (
                  <TouchableOpacity
                    style={[styles.controlButton, styles.rescanButton]}
                    onPress={() => setScanned(false)}
                  >
                    <Text style={styles.rescanButtonText}>Tekrar Tara</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setShowManualInput(true)}
                >
                  <Type size={28} color={colors.textOnPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Manual Input View */}
            <View style={styles.manualContainer}>
              <View style={styles.manualContent}>
                <Text style={styles.manualTitle}>Manuel Kod Girişi</Text>
                <Text style={styles.manualSubtitle}>
                  Ekipman kodunu manuel olarak girebilirsiniz
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ekipman Kodu"
                  placeholderTextColor={colors.textDisabled}
                  value={manualCode}
                  onChangeText={setManualCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus
                />

                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleManualSearch}
                >
                  <Text style={styles.searchButtonText}>Ara</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setShowManualInput(false);
                    setManualCode('');
                  }}
                >
                  <Text style={styles.backButtonText}>Tarayıcıya Dön</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    textAlign: 'center',
  },
  subMessageText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rescanButton: {
    width: 'auto',
    paddingHorizontal: 24,
  },
  rescanButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  manualContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  manualContent: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  manualSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QRScannerScreen;
