import React, { useState } from 'react';
import {
  Film,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

interface Project {
  id: number;
  projectNumber: string;
  name: string;
  type: string; // film, series, commercial, clip
  status: string; // planning, pre-production, production, post-production, completed
  director: string;
  producer: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  currentSpent: number;
  completionPercentage: number;
}

const ProjectManagement: React.FC = () => {
  const [projects] = useState<Project[]>([
    {
      id: 1,
      projectNumber: 'PROJ-2025-001',
      name: 'Yeni Nesil Reklam Filmi',
      type: 'commercial',
      status: 'production',
      director: 'Ahmet Yılmaz',
      producer: 'Mehmet Demir',
      startDate: '2025-10-01',
      endDate: '2025-11-15',
      totalBudget: 250000,
      currentSpent: 125000,
      completionPercentage: 60,
    },
    {
      id: 2,
      projectNumber: 'PROJ-2025-002',
      name: 'Kurumsal Tanıtım Videosu',
      type: 'clip',
      status: 'pre-production',
      director: 'Ayşe Kaya',
      producer: 'Can Öztürk',
      startDate: '2025-10-20',
      endDate: '2025-12-01',
      totalBudget: 150000,
      currentSpent: 35000,
      completionPercentage: 25,
    },
    {
      id: 3,
      projectNumber: 'PROJ-2025-003',
      name: 'Mini Dizi Projesi',
      type: 'series',
      status: 'post-production',
      director: 'Zeynep Arslan',
      producer: 'Burak Çelik',
      startDate: '2025-08-01',
      endDate: '2025-10-30',
      totalBudget: 500000,
      currentSpent: 475000,
      completionPercentage: 95,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-neutral-100 text-neutral-900',
      'pre-production': 'bg-neutral-200 text-neutral-900',
      production: 'bg-neutral-700 text-white',
      'post-production': 'bg-neutral-800 text-white',
      completed: 'bg-neutral-900 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-900';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      film: '🎬 Film',
      series: '📺 Dizi',
      commercial: '📢 Reklam',
      clip: '🎥 Klip',
      documentary: '📹 Belgesel',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      planning: 'Planlama',
      'pre-production': 'Ön Prodüksiyon',
      production: 'Prodüksiyon',
      'post-production': 'Post Prodüksiyon',
      completed: 'Tamamlandı',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Film size={32} className="text-neutral-900" />
              Proje Yönetimi
            </h1>
            <p className="text-neutral-600 mt-1">
              Film, dizi, reklam ve video projelerinizi yönetin
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-lg">
            <Plus size={20} />
            Yeni Proje
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Proje</span>
              <Film size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{projects.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Aktif Projeler</span>
              <Clock size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {projects.filter((p) => p.status === 'production').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Toplam Bütçe</span>
              <DollarSign size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              ₺{projects.reduce((acc, p) => acc + p.totalBudget, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-sm">Tamamlanan</span>
              <CheckCircle2 size={20} className="text-neutral-700" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {projects.filter((p) => p.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Proje ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-10 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 appearance-none bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="planning">Planlama</option>
              <option value="pre-production">Ön Prodüksiyon</option>
              <option value="production">Prodüksiyon</option>
              <option value="post-production">Post Prodüksiyon</option>
              <option value="completed">Tamamlandı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs text-neutral-500 font-medium">
                    {project.projectNumber}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 mt-1">
                    {project.name}
                  </h3>
                </div>
                <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                  <MoreVertical size={18} className="text-neutral-600" />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">{getTypeLabel(project.type)}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              {/* Team */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Yönetmen</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {project.director}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Yapımcı</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {project.producer}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Calendar size={16} />
                <span>
                  {new Date(project.startDate).toLocaleDateString('tr-TR')} -{' '}
                  {new Date(project.endDate).toLocaleDateString('tr-TR')}
                </span>
              </div>

              {/* Budget */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-600">Bütçe Kullanımı</span>
                  <span className="font-medium text-neutral-900">
                    ₺{project.currentSpent.toLocaleString()} / ₺
                    {project.totalBudget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-neutral-900 h-full transition-all"
                    style={{
                      width: `${(project.currentSpent / project.totalBudget) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-600">İlerleme</span>
                  <span className="font-medium text-neutral-900">
                    {project.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-neutral-900 h-full transition-all"
                    style={{ width: `${project.completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex gap-2">
              <button className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors">
                Detaylar
              </button>
              <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors">
                Düzenle
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-neutral-400 mb-4" />
          <p className="text-neutral-600">Proje bulunamadı</p>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
