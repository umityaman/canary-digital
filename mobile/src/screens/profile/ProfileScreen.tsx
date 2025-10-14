import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Settings, User, Shield, Info, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      id: 'profile',
      icon: User,
      title: 'Profil Bilgileri',
      subtitle: 'Ad, email ve iletişim bilgileri',
      onPress: () => {},
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Güvenlik',
      subtitle: 'Şifre değiştir, güvenlik ayarları',
      onPress: () => {},
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Ayarlar',
      subtitle: 'Bildirimler, tema ve uygulama ayarları',
      onPress: () => navigation.navigate('Settings' as never),
    },
    {
      id: 'about',
      icon: Info,
      title: 'Hakkında',
      subtitle: 'Versiyon bilgisi ve destek',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.menu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuIcon}>
                  <Icon size={22} color={colors.primary} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.primaryLight,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menu: {
    flex: 1,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});

export default ProfileScreen;
