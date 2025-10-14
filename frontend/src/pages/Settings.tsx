import { Settings as SettingsIcon, User, Bell, Shield, Calendar } from 'lucide-react';
import GoogleAuthButton from '../components/calendar/GoogleAuthButton';

export default function Settings() {
  return (
    <div className="p-6">

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button className="border-b-2 border-neutral-900 py-4 px-1 text-sm font-medium text-neutral-900">
            <Calendar className="inline-block h-5 w-5 mr-2" />
            Entegrasyonlar
          </button>
          <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
            <User className="inline-block h-5 w-5 mr-2" />
            Profil
          </button>
          <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
            <Bell className="inline-block h-5 w-5 mr-2" />
            Bildirimler
          </button>
          <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
            <Shield className="inline-block h-5 w-5 mr-2" />
            Güvenlik
          </button>
        </nav>
      </div>

      {/* Content */}
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
    </div>
  );
}
