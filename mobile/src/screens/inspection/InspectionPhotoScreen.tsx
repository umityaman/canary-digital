import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');
const MAX_PHOTOS = 10;

interface Photo {
  uri: string;
  id: string;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
}

interface RouteParams {
  inspectionId?: number;
  equipmentId?: number;
  orderId?: number;
  type: 'pickup' | 'return' | 'damage' | 'inspection';
}

export default function InspectionPhotoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  
  const cameraRef = useRef<Camera>(null);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showCamera, setShowCamera] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraStatus = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(cameraStatus.status === 'granted');

    if (Platform.OS !== 'web') {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Aşıldı', `Maksimum ${MAX_PHOTOS} fotoğraf çekebilirsiniz.`);
      return;
    }

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      // Fotoğrafı optimize et
      const optimizedPhoto = await optimizeImage(photo.uri);

      const newPhoto: Photo = {
        uri: optimizedPhoto,
        id: Date.now().toString(),
        uploaded: false,
        uploading: false,
      };

      setPhotos((prev) => [...prev, newPhoto]);
      setShowCamera(false);
    } catch (error) {
      console.error('Take picture error:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Aşıldı', `Maksimum ${MAX_PHOTOS} fotoğraf seçebilirsiniz.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const newPhotos: Photo[] = [];
        
        for (const asset of result.assets.slice(0, MAX_PHOTOS - photos.length)) {
          const optimizedUri = await optimizeImage(asset.uri);
          newPhotos.push({
            uri: optimizedUri,
            id: Date.now().toString() + Math.random(),
            uploaded: false,
            uploading: false,
          });
        }

        setPhotos((prev) => [...prev, ...newPhotos]);
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Pick from gallery error:', error);
      Alert.alert('Hata', 'Galeri açılırken bir hata oluştu.');
    }
  };

  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }], // Max 1200px width
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Optimize image error:', error);
      return uri; // Return original if optimization fails
    }
  };

  const deletePhoto = (photoId: string) => {
    Alert.alert(
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
          },
        },
      ]
    );
  };

  const uploadPhotos = async () => {
    if (photos.length === 0) {
      Alert.alert('Hata', 'Yüklemek için en az bir fotoğraf çekmelisiniz.');
      return;
    }

    if (!params.inspectionId && !params.equipmentId) {
      Alert.alert('Hata', 'Inspection ID veya Equipment ID bulunamadı.');
      return;
    }

    try {
      setUploadProgress(0);
      const totalPhotos = photos.filter((p) => !p.uploaded).length;
      let uploadedCount = 0;

      for (const photo of photos) {
        if (photo.uploaded) continue;

        // Mark as uploading
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, uploading: true } : p))
        );

        try {
          const formData = new FormData();
          
          // @ts-ignore - React Native handles File differently
          formData.append('photo', {
            uri: photo.uri,
            type: 'image/jpeg',
            name: `inspection_${photo.id}.jpg`,
          });

          if (params.inspectionId) {
            formData.append('inspectionId', params.inspectionId.toString());
          }
          if (params.equipmentId) {
            formData.append('equipmentId', params.equipmentId.toString());
          }
          if (params.orderId) {
            formData.append('orderId', params.orderId.toString());
          }
          formData.append('type', params.type || 'inspection');

          const response = await api.post('/inspection-photos', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          // Mark as uploaded
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id
                ? { ...p, uploaded: true, uploading: false }
                : p
            )
          );

          uploadedCount++;
          setUploadProgress((uploadedCount / totalPhotos) * 100);
        } catch (error: any) {
          console.error('Upload photo error:', error);
          
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photo.id
                ? {
                    ...p,
                    uploading: false,
                    error: error.response?.data?.message || 'Yükleme hatası',
                  }
                : p
            )
          );
        }
      }

      const allUploaded = photos.every((p) => p.uploaded);
      
      if (allUploaded) {
        Alert.alert(
          'Başarılı',
          'Tüm fotoğraflar başarıyla yüklendi.',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Kısmi Yükleme',
          `${uploadedCount} / ${totalPhotos} fotoğraf yüklendi. Başarısız yüklemeler için tekrar deneyin.`,
          [
            { text: 'Tamam' },
            { text: 'Tekrar Dene', onPress: uploadPhotos },
          ]
        );
      }
    } catch (error) {
      console.error('Upload photos error:', error);
      Alert.alert('Hata', 'Fotoğraflar yüklenirken bir hata oluştu.');
    }
  };

  const toggleCameraType = () => {
    setCameraType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlash = () => {
    setFlashMode((current) =>
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  if (hasCameraPermission === null || hasGalleryPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>İzinler kontrol ediliyor...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color="#6b7280" />
        <Text style={styles.noPermissionText}>Kamera izni verilmedi</Text>
        <Text style={styles.noPermissionSubtext}>
          Fotoğraf çekmek için kamera iznine ihtiyacınız var.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermissions}
        >
          <Text style={styles.permissionButtonText}>İzinleri Yenile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {showCamera ? (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
            flashMode={flashMode}
          >
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.iconButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.photoCount}>
                {photos.length} / {MAX_PHOTOS}
              </Text>
              <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                <Ionicons
                  name={flashMode === FlashMode.on ? 'flash' : 'flash-off'}
                  size={28}
                  color={flashMode === FlashMode.on ? '#fbbf24' : '#fff'}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity
                onPress={pickFromGallery}
                style={styles.controlButton}
              >
                <Ionicons name="images-outline" size={32} color="#fff" />
                <Text style={styles.controlButtonText}>Galeri</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePicture}
                style={[styles.captureButton, isCapturing && styles.capturingButton]}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator size="large" color="#fff" />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleCameraType}
                style={styles.controlButton}
              >
                <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
                <Text style={styles.controlButtonText}>Çevir</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      ) : (
        /* Photo Gallery */
        <View style={styles.galleryContainer}>
          {/* Header */}
          <View style={styles.galleryHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.galleryTitle}>
              Fotoğraflar ({photos.length}/{MAX_PHOTOS})
            </Text>
            <TouchableOpacity onPress={() => setShowCamera(true)}>
              <Ionicons name="camera" size={28} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Photo Grid */}
          <ScrollView contentContainerStyle={styles.photoGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoCard}>
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                
                {/* Status Overlay */}
                {photo.uploading && (
                  <View style={styles.photoOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.overlayText}>Yükleniyor...</Text>
                  </View>
                )}
                
                {photo.uploaded && (
                  <View style={styles.uploadedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  </View>
                )}
                
                {photo.error && (
                  <View style={styles.errorBadge}>
                    <Ionicons name="alert-circle" size={24} color="#ef4444" />
                  </View>
                )}

                {/* Delete Button */}
                {!photo.uploaded && !photo.uploading && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePhoto(photo.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Add More Button */}
            {photos.length < MAX_PHOTOS && (
              <TouchableOpacity
                style={styles.addMoreCard}
                onPress={() => setShowCamera(true)}
              >
                <Ionicons name="add-circle-outline" size={48} color="#9ca3af" />
                <Text style={styles.addMoreText}>Fotoğraf Ekle</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
          )}

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera-outline" size={20} color="#3b82f6" />
              <Text style={styles.secondaryButtonText}>Daha Fazla Çek</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.primaryButton,
                photos.length === 0 && styles.disabledButton,
              ]}
              onPress={uploadPhotos}
              disabled={photos.length === 0}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                Yükle ({photos.filter((p) => !p.uploaded).length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
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
  permissionButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
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
  photoCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  capturingButton: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  photoCard: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
  uploadedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  errorBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreCard: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    margin: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
});
