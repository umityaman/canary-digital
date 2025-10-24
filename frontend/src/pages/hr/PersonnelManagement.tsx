import { useState } from 'react'
import { 
  Users, Search, Filter, Plus, Mail, Phone, 
  MapPin, Calendar, Award, Edit, Trash2, MoreVertical
} from 'lucide-react'

interface Employee {
  id: number
  name: string
  position: string
  department: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'leave' | 'remote'
  avatar: string
}

export default function PersonnelManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const employees: Employee[] = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      position: 'Senior Developer',
      department: 'Yazılım',
      email: 'ahmet.yilmaz@canary.com',
      phone: '+90 532 123 4567',
      joinDate: '15 Ocak 2022',
      status: 'active',
      avatar: '👨‍💻'
    },
    {
      id: 2,
      name: 'Ayşe Kaya',
      position: 'Proje Yöneticisi',
      department: 'Proje',
      email: 'ayse.kaya@canary.com',
      phone: '+90 533 234 5678',
      joinDate: '03 Mart 2021',
      status: 'active',
      avatar: '👩‍💼'
    },
    {
      id: 3,
      name: 'Mehmet Demir',
      position: 'UI/UX Designer',
      department: 'Tasarım',
      email: 'mehmet.demir@canary.com',
      phone: '+90 534 345 6789',
      joinDate: '20 Haziran 2023',
      status: 'remote',
      avatar: '👨‍🎨'
    },
    {
      id: 4,
      name: 'Zeynep Şahin',
      position: 'Marketing Specialist',
      department: 'Pazarlama',
      email: 'zeynep.sahin@canary.com',
      phone: '+90 535 456 7890',
      joinDate: '12 Şubat 2022',
      status: 'active',
      avatar: '👩‍💼'
    },
    {
      id: 5,
      name: 'Can Öztürk',
      position: 'Backend Developer',
      department: 'Yazılım',
      email: 'can.ozturk@canary.com',
      phone: '+90 536 567 8901',
      joinDate: '08 Eylül 2023',
      status: 'leave',
      avatar: '👨‍💻'
    },
    {
      id: 6,
      name: 'Elif Yıldırım',
      position: 'HR Manager',
      department: 'İnsan Kaynakları',
      email: 'elif.yildirim@canary.com',
      phone: '+90 537 678 9012',
      joinDate: '01 Nisan 2020',
      status: 'active',
      avatar: '👩‍💼'
    }
  ]

  const departments = ['Tümü', 'Yazılım', 'Tasarım', 'Pazarlama', 'İnsan Kaynakları', 'Proje']

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      leave: 'bg-yellow-100 text-yellow-700',
      remote: 'bg-blue-100 text-blue-700'
    }
    const labels = {
      active: 'Aktif',
      leave: 'İzinde',
      remote: 'Uzaktan'
    }
    return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Personel Yönetimi</h2>
        <p className="text-neutral-600">
          Çalışan bilgilerini görüntüleyin, düzenleyin ve yönetin.
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Çalışan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            {departments.map(dept => (
              <option key={dept} value={dept.toLowerCase()}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Add Button */}
        <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus size={18} />
          <span>Yeni Personel</span>
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            viewMode === 'grid' 
              ? 'bg-neutral-900 text-white' 
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Kart Görünümü
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            viewMode === 'list' 
              ? 'bg-neutral-900 text-white' 
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Liste Görünümü
        </button>
      </div>

      {/* Employees Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => {
            const statusBadge = getStatusBadge(employee.status)
            return (
              <div key={employee.id} className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-2xl">
                      {employee.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{employee.name}</h3>
                      <p className="text-sm text-neutral-600">{employee.position}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
                    <MoreVertical size={18} className="text-neutral-400" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-3 py-1 ${statusBadge.class} text-xs font-medium rounded-lg inline-block`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm text-neutral-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-neutral-400" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-neutral-400" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-neutral-400" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-neutral-400" />
                    <span>{employee.joinDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors text-sm flex items-center justify-center gap-2">
                    <Edit size={16} />
                    <span>Düzenle</span>
                  </button>
                  <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors text-sm flex items-center justify-center gap-2">
                    <Award size={16} />
                    <span>Detay</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Employees List */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Çalışan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Pozisyon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Departman</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">İletişim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {employees.map((employee) => {
                const statusBadge = getStatusBadge(employee.status)
                return (
                  <tr key={employee.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">
                          {employee.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900">{employee.name}</div>
                          <div className="text-sm text-neutral-500">{employee.joinDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{employee.position}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{employee.department}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1 text-neutral-600">
                          <Mail size={14} />
                          <span>{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-600">
                          <Phone size={14} />
                          <span>{employee.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 ${statusBadge.class} text-xs font-medium rounded-lg inline-block`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Edit size={16} className="text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <Award size={16} className="text-neutral-600" />
                        </button>
                        <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                          <MoreVertical size={16} className="text-neutral-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
