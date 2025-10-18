import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Calendar } from 'lucide-react';
import GoogleAuthButton from '../components/calendar/GoogleAuthButton';
import NotificationPreferences from '../components/settings/NotificationPreferences';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('integrations');

  const tabs = [
    { id: 'integrations', label: 'Entegrasyonlar', icon: Calendar },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Takvim Entegrasyonları</h2>
              <GoogleAuthButton />
            </div>

            {/* Placeholder for future integrations */}
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3" />
                <p className="text-sm font-medium">Daha fazla entegrasyon yakında...</p>
                <p className="text-xs mt-1">Microsoft Outlook, Apple Calendar</p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-400">
                <User className="h-12 w-12 mx-auto mb-3" />
                <p className="text-sm font-medium">Profil ayarları yakında...</p>
                <p className="text-xs mt-1">Kişisel bilgiler, avatar, dil tercihleri</p>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return <NotificationPreferences />;

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <div className="text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-3" />
                <p className="text-sm font-medium">Güvenlik ayarları yakında...</p>
                <p className="text-xs mt-1">Şifre değiştirme, 2FA, oturum yönetimi</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 py-4 px-1 text-sm font-medium flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
}
