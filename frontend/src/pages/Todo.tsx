import { useState } from 'react'
import {
  CheckSquare, Square, Plus, Calendar, User, Flag,
  Clock, Filter, Search, MoreVertical, Edit3, Trash2,
  Users, Tag, Paperclip, Bell, RefreshCw, Sun, ChevronDown
} from 'lucide-react'

type Priority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus = 'pending' | 'in-progress' | 'completed'

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  dueDate: string
  priority: Priority
  status: TaskStatus
  tags: string[]
  subTasks: SubTask[]
  attachments: number
  isRecurring: boolean
  createdAt: string
  completedAt?: string
}

export default function Todo() {
  const [activeView, setActiveView] = useState<'all' | 'my-day' | 'assigned' | 'completed'>('all')
  const [showNewTask, setShowNewTask] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')

  // Mock data
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Yeni kamera ekipmanları için fiyat teklifi hazırla',
      description: 'Sony FX6 ve RED Komodo için tedarikçilerden fiyat al',
      assignedTo: 'umit',
      assignedToName: 'Ümit Yılmaz',
      dueDate: '2025-10-12',
      priority: 'high',
      status: 'in-progress',
      tags: ['Satın Alma', 'Ekipman'],
      subTasks: [
        { id: 's1', title: 'Sony FX6 fiyat araştırması', completed: true },
        { id: 's2', title: 'RED Komodo fiyat araştırması', completed: false },
        { id: 's3', title: 'Karşılaştırmalı tablo hazırla', completed: false }
      ],
      attachments: 2,
      isRecurring: false,
      createdAt: '2025-10-08'
    },
    {
      id: '2',
      title: 'ABC Film Yapım ile toplantı',
      description: 'Yeni proje için kiralama şartları görüşülecek',
      assignedTo: 'ayse',
      assignedToName: 'Ayşe Demir',
      dueDate: '2025-10-09',
      priority: 'urgent',
      status: 'pending',
      tags: ['Toplantı', 'Müşteri'],
      subTasks: [],
      attachments: 0,
      isRecurring: false,
      createdAt: '2025-10-08'
    },
    {
      id: '3',
      title: 'Envanter sayımı yap',
      description: 'Tüm kamera ekipmanlarının fiziki kontrolü',
      assignedTo: 'mehmet',
      assignedToName: 'Mehmet Kaya',
      dueDate: '2025-10-15',
      priority: 'medium',
      status: 'pending',
      tags: ['Envanter', 'Depo'],
      subTasks: [
        { id: 's4', title: 'Kameralar', completed: false },
        { id: 's5', title: 'Lensler', completed: false },
        { id: 's6', title: 'Işık ekipmanları', completed: false },
        { id: 's7', title: 'Ses ekipmanları', completed: false }
      ],
      attachments: 1,
      isRecurring: true,
      createdAt: '2025-10-05'
    },
    {
      id: '4',
      title: 'Sosyal medya içerikleri hazırla',
      description: 'Bu hafta için Instagram ve LinkedIn paylaşımları',
      assignedTo: 'zeynep',
      assignedToName: 'Zeynep Arslan',
      dueDate: '2025-10-11',
      priority: 'low',
      status: 'completed',
      tags: ['Pazarlama', 'Sosyal Medya'],
      subTasks: [
        { id: 's8', title: '3 Instagram postu', completed: true },
        { id: 's9', title: '2 LinkedIn yazısı', completed: true }
      ],
      attachments: 5,
      isRecurring: true,
      createdAt: '2025-10-01',
      completedAt: '2025-10-08'
    },
    {
      id: '5',
      title: 'Teknik servis raporu tamamla',
      description: 'Canon C70 bakım ve onarım işlemleri belgelenmeli',
      assignedTo: 'ali',
      assignedToName: 'Ali Yıldız',
      dueDate: '2025-10-10',
      priority: 'high',
      status: 'in-progress',
      tags: ['Teknik Servis', 'Döküman'],
      subTasks: [
        { id: 's10', title: 'Arıza tespiti', completed: true },
        { id: 's11', title: 'Parça değişimi', completed: true },
        { id: 's12', title: 'Rapor yazımı', completed: false }
      ],
      attachments: 3,
      isRecurring: false,
      createdAt: '2025-10-07'
    }
  ]

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-neutral-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-neutral-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-neutral-200'
      case 'low': return 'bg-neutral-100 text-neutral-700 border-neutral-200'
    }
  }

  const getPriorityLabel = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'Acil'
      case 'high': return 'Yüksek'
      case 'medium': return 'Orta'
      case 'low': return 'Düşük'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in-progress': return 'text-neutral-700'
      case 'pending': return 'text-gray-400'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && tasks.find(t => t.dueDate === dueDate)?.status !== 'completed'
  }

  const filteredTasks = tasks.filter(task => {
    if (activeView === 'my-day') {
      const today = new Date().toISOString().split('T')[0]
      return task.dueDate === today
    }
    if (activeView === 'completed') return task.status === 'completed'
    if (activeView === 'assigned') return task.assignedTo === 'umit' // Current user
    
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    
    return true
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate)).length
  }

  const teamStats = [
    { name: 'Ümit Yılmaz', completed: 12, pending: 3, avatar: 'UY' },
    { name: 'Ayşe Demir', completed: 18, pending: 5, avatar: 'AD' },
    { name: 'Mehmet Kaya', completed: 9, pending: 2, avatar: 'MK' },
    { name: 'Zeynep Arslan', completed: 15, pending: 1, avatar: 'ZA' },
    { name: 'Ali Yıldız', completed: 11, pending: 4, avatar: 'AY' }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Toplam</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stats.total}</h3>
          <p className="text-sm text-neutral-600">Tüm Görevler</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <CheckSquare className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Tamamlandı</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stats.completed}</h3>
          <p className="text-sm text-neutral-600">Biten Görevler</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Clock className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Devam Eden</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stats.inProgress}</h3>
          <p className="text-sm text-neutral-600">Aktif Görevler</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Bell className="text-neutral-700" size={24} />
            </div>
            <span className="text-xs text-neutral-700 font-medium">Gecikmiş</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-1">{stats.overdue}</h3>
          <p className="text-sm text-neutral-600">Süre Aşımı</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task List */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Tabs & Actions */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeView === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Tüm Görevler
                </button>
                <button
                  onClick={() => setActiveView('my-day')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeView === 'my-day' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Sun size={16} />
                  <span>Günüm</span>
                </button>
                <button
                  onClick={() => setActiveView('assigned')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeView === 'assigned' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Atananlar
                </button>
                <button
                  onClick={() => setActiveView('completed')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeView === 'completed' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Tamamlanan
                </button>
              </div>
              <button
                onClick={() => setShowNewTask(true)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <Plus size={18} />
                <span>Yeni Görev</span>
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Görev ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                  className="pl-4 pr-10 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Tüm Öncelikler</option>
                  <option value="urgent">Acil</option>
                  <option value="high">Yüksek</option>
                  <option value="medium">Orta</option>
                  <option value="low">Düşük</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button className={`mt-1 ${getStatusColor(task.status)}`}>
                      {task.status === 'completed' ? <CheckSquare size={22} /> : <Square size={22} />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-neutral-900 mb-1 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">{task.description}</p>
                      
                      {/* Sub-tasks */}
                      {task.subTasks.length > 0 && (
                        <div className="mb-3 space-y-1">
                          {task.subTasks.map((subTask) => (
                            <div key={subTask.id} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" checked={subTask.completed} className="rounded" readOnly />
                              <span className={subTask.completed ? 'line-through text-gray-500' : 'text-neutral-700'}>
                                {subTask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center flex-wrap gap-2">
                        {/* Priority */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          <Flag size={12} />
                          <span>{getPriorityLabel(task.priority)}</span>
                        </span>

                        {/* Due Date */}
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isOverdue(task.dueDate) ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          <Calendar size={12} />
                          <span>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                        </span>

                        {/* Assigned To */}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                          <User size={12} />
                          <span>{task.assignedToName}</span>
                        </span>

                        {/* Tags */}
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                            <Tag size={12} />
                            <span>{tag}</span>
                          </span>
                        ))}

                        {/* Recurring */}
                        {task.isRecurring && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                            <RefreshCw size={12} />
                            <span>Tekrarlı</span>
                          </span>
                        )}

                        {/* Attachments */}
                        {task.attachments > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                            <Paperclip size={12} />
                            <span>{task.attachments}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors" title="Düzenle">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors" title="Daha Fazla">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Team Stats */}
        <div className="space-y-6">
          {/* Team Performance */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 tracking-tight mb-4 flex items-center">
              <Users className="mr-2 text-neutral-700" size={20} />
              Ekip Performansı
            </h3>
            <div className="space-y-4">
              {teamStats.map((member, idx) => (
                <div key={idx} className="border-b border-neutral-200 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-700 font-semibold text-sm">
                        {member.avatar}
                      </div>
                      <span className="font-medium text-neutral-900">{member.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">✓ {member.completed} tamamlandı</span>
                    <span className="text-neutral-700 font-medium">⏳ {member.pending} bekliyor</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 tracking-tight mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                <Filter className="text-neutral-700" size={18} />
                <span className="text-neutral-700">Filtrele ve Sırala</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                <Calendar className="text-neutral-700" size={18} />
                <span className="text-neutral-700">Takvim Görünümü</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-left">
                <Users className="text-neutral-700" size={18} />
                <span className="text-neutral-700">Ekip Üyesi Ekle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900">Yeni Görev Oluştur</h3>
              <button
                onClick={() => setShowNewTask(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center">
                <CheckSquare className="mx-auto text-neutral-400 mb-4" size={64} />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Görev Formu</h3>
                <p className="text-neutral-600 mb-6">
                  Detaylı görev oluşturma formu yakında eklenecek.
                  <br />
                  Görev başlığı, açıklama, atama, tarih, öncelik ve etiketler burada olacak.
                </p>
                <button
                  onClick={() => setShowNewTask(false)}
                  className="px-6 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}