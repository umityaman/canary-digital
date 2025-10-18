import React, { useState } from 'react';
import {
  Clapperboard,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Play,
  Download,
  Upload,
  Film,
  Volume2,
  Palette,
  Sparkles,
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  type: 'editing' | 'color' | 'sound' | 'vfx';
  assignee: string;
  progress: number;
  deadline: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const PostProduction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'editing' | 'color' | 'sound' | 'vfx'>('all');

  const tasks: Task[] = [
    {
      id: 1,
      title: 'Ana Montaj - Bölüm 1',
      type: 'editing',
      assignee: 'Ahmet Yılmaz',
      progress: 75,
      deadline: '22 Eki 2024',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Renk Düzeltme - Outdoor Sahneler',
      type: 'color',
      assignee: 'Mehmet Demir',
      progress: 45,
      deadline: '24 Eki 2024',
      status: 'in-progress',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Ses Miksajı - Final',
      type: 'sound',
      assignee: 'Ayşe Kaya',
      progress: 100,
      deadline: '20 Oki 2024',
      status: 'completed',
      priority: 'high',
    },
    {
      id: 4,
      title: 'VFX - Patlama Sahnesi',
      type: 'vfx',
      assignee: 'Fatma Öz',
      progress: 30,
      deadline: '25 Eki 2024',
      status: 'in-progress',
      priority: 'high',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'editing':
        return <Film size={16} className="text-neutral-700" />;
      case 'color':
        return <Palette size={16} className="text-neutral-700" />;
      case 'sound':
        return <Volume2 size={16} className="text-neutral-700" />;
      case 'vfx':
        return <Sparkles size={16} className="text-neutral-700" />;
      default:
        return <Film size={16} className="text-neutral-700" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'editing':
        return 'Kurgu';
      case 'color':
        return 'Renk';
      case 'sound':
        return 'Ses';
      case 'vfx':
        return 'VFX';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-neutral-200 text-neutral-700';
      case 'in-progress':
        return 'bg-neutral-700 text-white';
      case 'review':
        return 'bg-neutral-500 text-white';
      case 'completed':
        return 'bg-neutral-900 text-white';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-neutral-900';
      case 'medium':
        return 'text-neutral-600';
      case 'low':
        return 'text-neutral-400';
      default:
        return 'text-neutral-700';
    }
  };

  const filteredTasks = activeTab === 'all' ? tasks : tasks.filter((t) => t.type === activeTab);

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Clapperboard size={32} className="text-neutral-900" />
              Post Prodüksiyon
            </h1>
            <p className="text-neutral-600 mt-1">Kurgu, renk, ses ve efekt takibi</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Görev
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Görev</span>
              <Clapperboard size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">24</div>
            <div className="text-xs text-neutral-600 mt-1">8 devam ediyor</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Tamamlanan</span>
              <CheckCircle2 size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">12</div>
            <div className="text-xs text-neutral-600 mt-1">%50 tamamlandı</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Son Teslim</span>
              <Clock size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">4</div>
            <div className="text-xs text-neutral-600 mt-1">Bu hafta</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Geciken</span>
              <AlertCircle size={20} className="text-neutral-700" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">0</div>
            <div className="text-xs text-neutral-600 mt-1">Zamanında</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {['all', 'editing', 'color', 'sound', 'vfx'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {tab === 'all' ? 'Tümü' : getTypeText(tab)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-neutral-100 rounded-lg">{getTypeIcon(task.type)}</div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">{task.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-neutral-600">{task.assignee}</span>
                      <span className="text-sm text-neutral-600">• {task.deadline}</span>
                      <AlertCircle size={14} className={getPriorityColor(task.priority)} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {task.status === 'pending' && 'Bekliyor'}
                  {task.status === 'in-progress' && 'Devam Ediyor'}
                  {task.status === 'review' && 'İncelemede'}
                  {task.status === 'completed' && 'Tamamlandı'}
                </span>
                <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <Edit size={16} className="text-neutral-700" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600">İlerleme</span>
                <span className="text-sm font-bold text-neutral-900">{task.progress}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-3">
                <div
                  className="bg-neutral-900 h-full rounded-full transition-all"
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm">
                <Play size={14} />
                Önizleme
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                <Upload size={14} />
                Dosya Yükle
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                <Download size={14} />
                İndir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostProduction;
