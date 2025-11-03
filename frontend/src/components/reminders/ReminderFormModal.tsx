import { useState, useEffect } from 'react';
import { reminderAPI, Reminder, CreateReminderDTO } from '../../services/reminders';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReminderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reminder?: Reminder;
}

const ReminderFormModal = ({ open, onClose, onSuccess, reminder }: ReminderFormModalProps) => {
  const [formData, setFormData] = useState<CreateReminderDTO>({
    title: '',
    description: '',
    type: 'payment',
    priority: 'medium',
    reminderDate: '',
    dueDate: '',
    sendEmail: true,
    sendSms: false,
    sendPush: true,
    isRecurring: false,
    recurrence: '',
    recurrenceEnd: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description || '',
        type: reminder.type,
        priority: reminder.priority,
        reminderDate: reminder.reminderDate.split('T')[0] + 'T' + reminder.reminderDate.split('T')[1].substring(0, 5),
        dueDate: reminder.dueDate ? reminder.dueDate.split('T')[0] : '',
        sendEmail: reminder.sendEmail,
        sendSms: reminder.sendSms,
        sendPush: reminder.sendPush,
        isRecurring: reminder.isRecurring,
        recurrence: reminder.recurrence || '',
        recurrenceEnd: reminder.recurrenceEnd ? reminder.recurrenceEnd.split('T')[0] : '',
        invoiceId: reminder.invoiceId,
        customerId: reminder.customerId,
      });
    }
  }, [reminder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.reminderDate) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    try {
      setLoading(true);
      
      if (reminder) {
        await reminderAPI.update(reminder.id, formData);
        toast.success('Hatırlatma güncellendi');
      } else {
        await reminderAPI.create(formData);
        toast.success('Hatırlatma oluşturuldu');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast.error('Hatırlatma kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">
            {reminder ? 'Hatırlatmayı Düzenle' : 'Yeni Hatırlatma'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Ödeme hatırlatması"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Detaylı açıklama..."
              rows={3}
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tür
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="payment">Ödeme</option>
                <option value="invoice">Fatura</option>
                <option value="due_date">Vade Tarihi</option>
                <option value="custom">Özel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Öncelik
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Hatırlatma Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.reminderDate}
                onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Vade Tarihi
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Notification Channels */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Bildirim Kanalları
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  className="w-5 h-5 text-neutral-900 rounded focus:ring-2 focus:ring-neutral-900"
                />
                <span className="text-sm text-neutral-700">Email Gönder</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sendSms}
                  onChange={(e) => setFormData({ ...formData, sendSms: e.target.checked })}
                  className="w-5 h-5 text-neutral-900 rounded focus:ring-2 focus:ring-neutral-900"
                />
                <span className="text-sm text-neutral-700">SMS Gönder</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sendPush}
                  onChange={(e) => setFormData({ ...formData, sendPush: e.target.checked })}
                  className="w-5 h-5 text-neutral-900 rounded focus:ring-2 focus:ring-neutral-900"
                />
                <span className="text-sm text-neutral-700">Push Bildirimi</span>
              </label>
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-5 h-5 text-neutral-900 rounded focus:ring-2 focus:ring-neutral-900"
              />
              <span className="text-sm font-medium text-neutral-700">Tekrarlayan Hatırlatma</span>
            </label>

            {formData.isRecurring && (
              <div className="grid grid-cols-2 gap-4 ml-8">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tekrar Sıklığı
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="">Seçiniz</option>
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.recurrenceEnd}
                    onChange={(e) => setFormData({ ...formData, recurrenceEnd: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : reminder ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderFormModal;
