import { useState, useEffect } from 'react';
import { reminderAPI, Reminder, ReminderStats } from '../../services/reminders';
import { Clock, Bell, AlertCircle, CheckCircle, XCircle, Plus, Calendar, Mail, MessageSquare, Smartphone, Edit2, Trash2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ReminderFormModal from './ReminderFormModal';

const ReminderManagement = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'overdue'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    loadReminders();
    loadStats();
  }, [filter, statusFilter, typeFilter, priorityFilter]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      let data: Reminder[];
      
      if (filter === 'upcoming') {
        data = await reminderAPI.getUpcoming();
      } else if (filter === 'overdue') {
        data = await reminderAPI.getOverdue();
      } else {
        data = await reminderAPI.getAll({
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          priority: priorityFilter || undefined,
        });
      }
      
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Hatırlatmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await reminderAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await reminderAPI.markAsCompleted(id);
      toast.success('Hatırlatma tamamlandı');
      loadReminders();
      loadStats();
    } catch (error) {
      toast.error('Hatırlatma tamamlanamadı');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await reminderAPI.cancel(id);
      toast.success('Hatırlatma iptal edildi');
      loadReminders();
      loadStats();
    } catch (error) {
      toast.error('Hatırlatma iptal edilemedi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu hatırlatmayı silmek istediğinize emin misiniz?')) return;
    
    try {
      await reminderAPI.delete(id);
      toast.success('Hatırlatma silindi');
      loadReminders();
      loadStats();
    } catch (error) {
      toast.error('Hatırlatma silinemedi');
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingReminder(null);
  };

  const handleFormSuccess = () => {
    loadReminders();
    loadStats();
    handleFormClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-neutral-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'sent': return 'text-blue-600 bg-blue-50 border-neutral-200';
      case 'cancelled': return 'text-neutral-600 bg-neutral-50 border-neutral-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <Bell size={16} />;
      case 'invoice': return <Calendar size={16} />;
      case 'due_date': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOverdue = (reminderDate: string, status: string) => {
    return status === 'pending' && new Date(reminderDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Hatırlatmalar</h2>
          <p className="text-sm text-neutral-600 mt-1">Ödeme ve vade tarih hatırlatmaları</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Plus size={20} />
          Yeni Hatırlatma
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-900">Toplam</h4>
              <Clock className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-orange-900">Bekleyen</h4>
              <Bell className="text-orange-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-purple-900">Yaklaşan</h4>
              <Calendar className="text-purple-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-purple-900">{stats.upcoming}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-red-900">Gecikmiş</h4>
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-red-900">{stats.overdue}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-900">Tamamlanan</h4>
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={20} className="text-neutral-600" />
          
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              filter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Tümü
          </button>
          
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              filter === 'upcoming'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Yaklaşan
          </button>
          
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              filter === 'overdue'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Gecikmiş
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700"
          >
            <option value="">Durum (Tümü)</option>
            <option value="pending">Bekleyen</option>
            <option value="sent">Gönderildi</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700"
          >
            <option value="">Tür (Tümü)</option>
            <option value="payment">Ödeme</option>
            <option value="invoice">Fatura</option>
            <option value="due_date">Vade Tarihi</option>
            <option value="custom">Özel</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700"
          >
            <option value="">Öncelik (Tümü)</option>
            <option value="urgent">Acil</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
        </div>
      </div>

      {/* Reminder List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
            <p className="text-neutral-600 mt-4">Yükleniyor...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
            <Clock className="mx-auto text-neutral-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Hatırlatma Bulunamadı</h3>
            <p className="text-neutral-600">Yeni bir hatırlatma oluşturarak başlayın</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                isOverdue(reminder.reminderDate, reminder.status)
                  ? 'border-red-300 bg-red-50'
                  : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(reminder.type)}
                      <h3 className="font-semibold text-neutral-900">{reminder.title}</h3>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority === 'urgent' && 'Acil'}
                      {reminder.priority === 'high' && 'Yüksek'}
                      {reminder.priority === 'medium' && 'Orta'}
                      {reminder.priority === 'low' && 'Düşük'}
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reminder.status)}`}>
                      {reminder.status === 'pending' && 'Bekleyen'}
                      {reminder.status === 'sent' && 'Gönderildi'}
                      {reminder.status === 'completed' && 'Tamamlandı'}
                      {reminder.status === 'cancelled' && 'İptal'}
                    </span>

                    {isOverdue(reminder.reminderDate, reminder.status) && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        GECİKMİŞ
                      </span>
                    )}
                  </div>

                  {reminder.description && (
                    <p className="text-sm text-neutral-600 mb-3">{reminder.description}</p>
                  )}

                  <div className="flex items-center gap-6 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{formatDate(reminder.reminderDate)}</span>
                    </div>

                    {reminder.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Vade: {formatDate(reminder.dueDate)}</span>
                      </div>
                    )}

                    {reminder.customer && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reminder.customer.name}</span>
                      </div>
                    )}

                    {reminder.invoice && (
                      <div className="flex items-center gap-2">
                        <span>Fatura: {reminder.invoice.invoiceNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    {reminder.sendEmail && (
                      <div className="flex items-center gap-1 text-xs text-neutral-600">
                        <Mail size={14} />
                        Email
                      </div>
                    )}
                    {reminder.sendSms && (
                      <div className="flex items-center gap-1 text-xs text-neutral-600">
                        <MessageSquare size={14} />
                        SMS
                      </div>
                    )}
                    {reminder.sendPush && (
                      <div className="flex items-center gap-1 text-xs text-neutral-600">
                        <Smartphone size={14} />
                        Push
                      </div>
                    )}
                    {reminder.isRecurring && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg border border-purple-200">
                        Tekrarlı
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {reminder.status === 'pending' && (
                    <button
                      onClick={() => handleComplete(reminder.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Tamamla"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  
                  {reminder.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(reminder.id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="İptal Et"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(reminder)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Edit2 size={20} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <ReminderFormModal
          open={isFormOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          reminder={editingReminder || undefined}
        />
      )}
    </div>
  );
};

export default ReminderManagement;
