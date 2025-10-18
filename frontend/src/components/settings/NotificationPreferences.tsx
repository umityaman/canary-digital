import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Smartphone, Save, Loader2 } from 'lucide-react';
import { useNotificationAPI } from '../../hooks/useNotificationAPI';
import { toast } from 'react-hot-toast';

interface NotificationPreferences {
  id?: number;
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  reservationEmail: boolean;
  reservationSms: boolean;
  reservationPush: boolean;
  orderEmail: boolean;
  orderSms: boolean;
  orderPush: boolean;
  equipmentEmail: boolean;
  equipmentSms: boolean;
  equipmentPush: boolean;
  reminderEmail: boolean;
  reminderSms: boolean;
  reminderPush: boolean;
  alertEmail: boolean;
  alertSms: boolean;
  alertPush: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

const defaultPreferences: Partial<NotificationPreferences> = {
  emailEnabled: true,
  smsEnabled: false,
  pushEnabled: true,
  inAppEnabled: true,
  reservationEmail: true,
  reservationSms: false,
  reservationPush: true,
  orderEmail: true,
  orderSms: false,
  orderPush: true,
  equipmentEmail: true,
  equipmentSms: false,
  equipmentPush: true,
  reminderEmail: true,
  reminderSms: true,
  reminderPush: true,
  alertEmail: true,
  alertSms: true,
  alertPush: true,
  dailyDigest: false,
  weeklyDigest: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<Partial<NotificationPreferences>>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { fetchNotificationPreferences, updateNotificationPreferences } = useNotificationAPI();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await fetchNotificationPreferences();
      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Bildirim tercihleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences(preferences);
      toast.success('Bildirim tercihleri başarıyla kaydedildi');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Bildirim tercihleri kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bildirim Tercihleri</h1>
          <p className="text-gray-600 mt-1">
            Hangi bildirimleri almak istediğinizi seçin
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Genel Ayarlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <label className="text-sm font-medium">E-posta Bildirimleri</label>
                  <p className="text-xs text-gray-500">E-posta ile bildirim al</p>
                </div>
              </div>
              <Switch
                checked={preferences.emailEnabled || false}
                onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <div>
                  <label className="text-sm font-medium">SMS Bildirimleri</label>
                  <p className="text-xs text-gray-500">SMS ile bildirim al</p>
                </div>
              </div>
              <Switch
                checked={preferences.smsEnabled || false}
                onCheckedChange={(checked) => updatePreference('smsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <div>
                  <label className="text-sm font-medium">Push Bildirimleri</label>
                  <p className="text-xs text-gray-500">Mobil push bildirimleri</p>
                </div>
              </div>
              <Switch
                checked={preferences.pushEnabled || false}
                onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <div>
                  <label className="text-sm font-medium">Uygulama İçi Bildirimler</label>
                  <p className="text-xs text-gray-500">Uygulama içinde bildirim göster</p>
                </div>
              </div>
              <Switch
                checked={preferences.inAppEnabled || false}
                onCheckedChange={(checked) => updatePreference('inAppEnabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category-specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reservations */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Rezervasyonlar</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">E-posta</span>
                <Switch
                  checked={preferences.reservationEmail || false}
                  onCheckedChange={(checked) => updatePreference('reservationEmail', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS</span>
                <Switch
                  checked={preferences.reservationSms || false}
                  onCheckedChange={(checked) => updatePreference('reservationSms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push</span>
                <Switch
                  checked={preferences.reservationPush || false}
                  onCheckedChange={(checked) => updatePreference('reservationPush', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Orders */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Siparişler</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">E-posta</span>
                <Switch
                  checked={preferences.orderEmail || false}
                  onCheckedChange={(checked) => updatePreference('orderEmail', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS</span>
                <Switch
                  checked={preferences.orderSms || false}
                  onCheckedChange={(checked) => updatePreference('orderSms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push</span>
                <Switch
                  checked={preferences.orderPush || false}
                  onCheckedChange={(checked) => updatePreference('orderPush', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipment */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Ekipman</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">E-posta</span>
                <Switch
                  checked={preferences.equipmentEmail || false}
                  onCheckedChange={(checked) => updatePreference('equipmentEmail', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS</span>
                <Switch
                  checked={preferences.equipmentSms || false}
                  onCheckedChange={(checked) => updatePreference('equipmentSms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push</span>
                <Switch
                  checked={preferences.equipmentPush || false}
                  onCheckedChange={(checked) => updatePreference('equipmentPush', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Reminders */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Hatırlatmalar</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">E-posta</span>
                <Switch
                  checked={preferences.reminderEmail || false}
                  onCheckedChange={(checked) => updatePreference('reminderEmail', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS</span>
                <Switch
                  checked={preferences.reminderSms || false}
                  onCheckedChange={(checked) => updatePreference('reminderSms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push</span>
                <Switch
                  checked={preferences.reminderPush || false}
                  onCheckedChange={(checked) => updatePreference('reminderPush', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Alerts */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Uyarılar</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">E-posta</span>
                <Switch
                  checked={preferences.alertEmail || false}
                  onCheckedChange={(checked) => updatePreference('alertEmail', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS</span>
                <Switch
                  checked={preferences.alertSms || false}
                  onCheckedChange={(checked) => updatePreference('alertSms', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push</span>
                <Switch
                  checked={preferences.alertPush || false}
                  onCheckedChange={(checked) => updatePreference('alertPush', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Digest and Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Özet ve Sessiz Saatler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Günlük Özet</label>
                <p className="text-xs text-gray-500">Günün sonunda özet e-posta al</p>
              </div>
              <Switch
                checked={preferences.dailyDigest || false}
                onCheckedChange={(checked) => updatePreference('dailyDigest', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Haftalık Özet</label>
                <p className="text-xs text-gray-500">Hafta sonunda özet e-posta al</p>
              </div>
              <Switch
                checked={preferences.weeklyDigest || false}
                onCheckedChange={(checked) => updatePreference('weeklyDigest', checked)}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sessiz Saatler</h4>
            <p className="text-sm text-gray-600 mb-4">
              Bu saatler arasında bildirim gönderilmez
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Başlangıç</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart || '22:00'}
                  onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bitiş</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd || '08:00'}
                  onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="lg"
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Tercihleri Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;