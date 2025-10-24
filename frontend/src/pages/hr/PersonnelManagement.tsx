import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  FileText,
  Download,
  Upload,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  manager: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'probation' | 'notice';
  avatar: string;
  salary: number;
  birthDate: string;
  address: string;
  idNumber: string;
  education: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

const PersonnelManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const employees: Employee[] = [
    {
      id: 1,
      employeeId: 'EMP-2025-001',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@canary.com',
      phone: '+90 532 123 45 67',
      position: 'Senior Developer',
      department: 'Yazılım',
      manager: 'Mehmet Demir',
      joinDate: '2023-01-15',
      status: 'active',
      avatar: '👨‍💻',
      salary: 45000,
      birthDate: '1990-05-20',
      address: 'İstanbul, Türkiye',
      idNumber: '12345678901',
      education: 'Yüksek Lisans - Bilgisayar Mühendisliği',
      emergencyContact: {
        name: 'Ayşe Yılmaz',
        phone: '+90 532 987 65 43',
        relation: 'Eş',
      },
    },
    {
      id: 2,
      employeeId: 'EMP-2025-002',
      name: 'Ayşe Kaya',
      email: 'ayse@canary.com',
      phone: '+90 532 234 56 78',
      position: 'Proje Yöneticisi',
      department: 'Prodüksiyon',
      manager: 'Fatma Öz',
      joinDate: '2022-06-10',
      status: 'active',
      avatar: '👩‍💼',
      salary: 38000,
      birthDate: '1988-08-15',
      address: 'Ankara, Türkiye',
      idNumber: '23456789012',
      education: 'Lisans - İşletme',
      emergencyContact: {
        name: 'Mehmet Kaya',
        phone: '+90 532 876 54 32',
        relation: 'Kardeş',
      },
    },
    {
      id: 3,
      employeeId: 'EMP-2025-003',
      name: 'Mehmet Demir',
      email: 'mehmet@canary.com',
      phone: '+90 532 345 67 89',
      position: 'Yazılım Müdürü',
      department: 'Yazılım',
      manager: 'CEO',
      joinDate: '2020-03-01',
      status: 'active',
      avatar: '👨‍💼',
      salary: 65000,
      birthDate: '1985-12-10',
      address: 'İstanbul, Türkiye',
      idNumber: '34567890123',
      education: 'Yüksek Lisans - Yazılım Mühendisliği',
      emergencyContact: {
        name: 'Zeynep Demir',
        phone: '+90 532 765 43 21',
        relation: 'Eş',
      },
    },
    {
      id: 4,
      employeeId: 'EMP-2025-004',
      name: 'Fatma Öz',
      email: 'fatma@canary.com',
      phone: '+90 532 456 78 90',
      position: 'Prodüksiyon Müdürü',
      department: 'Prodüksiyon',
      manager: 'CEO',
      joinDate: '2021-07-15',
      status: 'active',
      avatar: '👩‍💼',
      salary: 58000,
      birthDate: '1987-03-25',
      address: 'İzmir, Türkiye',
      idNumber: '45678901234',
      education: 'Lisans - İletişim',
      emergencyContact: {
        name: 'Ali Öz',
        phone: '+90 532 654 32 10',
        relation: 'Eş',
      },
    },
    {
      id: 5,
      employeeId: 'EMP-2025-005',
      name: 'Can Yıldız',
      email: 'can@canary.com',
      phone: '+90 532 567 89 01',
      position: 'Junior Developer',
      department: 'Yazılım',
      manager: 'Mehmet Demir',
      joinDate: '2024-09-01',
      status: 'probation',
      avatar: '👨‍💻',
      salary: 28000,
      birthDate: '1998-11-05',
      address: 'Bursa, Türkiye',
      idNumber: '56789012345',
      education: 'Lisans - Bilgisayar Mühendisliği',
      emergencyContact: {
        name: 'Emine Yıldız',
        phone: '+90 532 543 21 09',
        relation: 'Anne',
      },
    },
  ];

  const departments = ['Yazılım', 'Prodüksiyon', 'Muhasebe', 'İK', 'Pazarlama'];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      probation: 'bg-yellow-100 text-yellow-800',
      notice: 'bg-red-100 text-red-800',
    };
    const labels = {
      active: 'Aktif',
      inactive: 'Pasif',
      probation: 'Deneme Süresi',
      notice: 'İhbar Süresi',
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters Card - Social Media Style */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Personel ara (isim, email, ID, pozisyon)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="all">Tüm Departmanlar</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="probation">Deneme Süresi</option>
            <option value="notice">İhbar Süresi</option>
            <option value="inactive">Pasif</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border border-neutral-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <Upload size={18} />
            <span>İçe Aktar</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
            <Download size={18} />
            <span>Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-neutral-600">
          <span className="font-semibold text-neutral-900">{filteredEmployees.length}</span> personel gösteriliyor
        </p>
      </div>

      {/* Employee Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
            >
              {/* Card Header - Like Social Media Post */}
              <div className="p-4 border-b border-neutral-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
                    {employee.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 truncate">{employee.name}</h3>
                    <p className="text-sm text-neutral-600">{employee.position}</p>
                    <p className="text-xs text-neutral-500">{employee.employeeId}</p>
                  </div>
                  <button className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0">
                    <MoreVertical size={18} className="text-neutral-600" />
                  </button>
                </div>
              </div>

              {/* Card Body - Content Area */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-600">Departman</span>
                  <span className="text-sm font-semibold text-neutral-900">{employee.department}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-600">Durum</span>
                  {getStatusBadge(employee.status)}
                </div>
                
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <Mail size={14} />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <Phone size={14} />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <Calendar size={14} />
                    <span>{new Date(employee.joinDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer - Actions */}
              <div className="border-t border-neutral-100 px-4 py-2 flex items-center justify-around">
                <button className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                  <Eye size={16} />
                  <span>Profil</span>
                </button>
                <div className="w-px h-6 bg-neutral-200"></div>
                <button className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit size={16} />
                  <span>Düzenle</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Personel</th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Pozisyon</th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Departman</th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">İletişim</th>
                <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Durum</th>
                <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                        {employee.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{employee.name}</p>
                        <p className="text-xs text-neutral-600">{employee.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-neutral-900">{employee.position}</p>
                    <p className="text-xs text-neutral-600">Yönetici: {employee.manager}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-neutral-900">{employee.department}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail size={14} />
                        <span className="truncate max-w-[180px]">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone size={14} />
                        <span>{employee.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(employee.status)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Görüntüle">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" title="Düzenle">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PersonnelManagement;
