import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Moon, 
  Globe, 
  Lock, 
  Info, 
  LogOut,
  ChevronRight,
  Database,
  Trash2
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import offlineManager from '../../services/offlineManager';
import notificationService from '../../services/notificationService';
import { colors } from '../../constants/colors';

const SettingsScreen = () => {
  const { logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Oturumu kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Önbelleği Temizle',
      'Tüm önbelleği temizlemek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            await offlineManager.clearCache();
            Alert.alert('Başarılı', 'Önbellek temizlendi.');
          },
        },
      ]
    );
  };

  const handleClearSyncQueue = async () => {
    const queueSize = offlineManager.getSyncQueueSize();
    
    if (queueSize === 0) {
      Alert.alert('Bilgi', 'Senkronizasyon kuyruğu zaten boş.');
      return;
    }

    Alert.alert(
      'Senkronizasyon Kuyruğunu Temizle',
      `${queueSize} bekleyen işlemi silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            await offlineManager.clearSyncQueue();
            Alert.alert('Başarılı', 'Senkronizasyon kuyruğu temizlendi.');
          },
        },
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    
    if (value) {
      await notificationService.initialize();
    } else {
      await notificationService.unregisterToken();
    }
  };

  const handleThemeToggle = (value: boolean) => {
    setDarkMode(value);
    // TODO: Implement theme switching
    Alert.alert('Yakında', 'Karanlık mod yakında eklenecek.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Push Bildirimleri</Text>
                <Text style={styles.settingDescription}>
                  Önemli güncellemeler için bildirim al
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.textDisabled}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Moon size={20} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Karanlık Mod</Text>
                <Text style={styles.settingDescription}>
                  Koyu tema kullan
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.secondary + '60' }}
              thumbColor={darkMode ? colors.secondary : colors.textDisabled}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Globe size={20} color={colors.info} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Dil</Text>
                <Text style={styles.settingDescription}>Türkçe</Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri & Depolama</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Database size={20} color={colors.warning} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Önbelleği Temizle</Text>
                <Text style={styles.settingDescription}>
                  Geçici dosyaları sil
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearSyncQueue}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Trash2 size={20} color={colors.error} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Senkronizasyon Kuyruğu</Text>
                <Text style={styles.settingDescription}>
                  {offlineManager.getSyncQueueSize()} bekleyen işlem
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Güvenlik</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Lock size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Şifre Değiştir</Text>
                <Text style={styles.settingDescription}>
                  Hesap şifrenizi güncelleyin
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Info size={20} color={colors.info} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Uygulama Hakkında</Text>
                <Text style={styles.settingDescription}>
                  Sürüm 1.0.0
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error + '15',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  },
});

export default SettingsScreen;
