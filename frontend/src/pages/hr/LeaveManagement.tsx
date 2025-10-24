import { useState } from 'react'
import { 
  Calendar, Search, Plus, Clock, CheckCircle, XCircle,
  AlertCircle, Filter, User, Mail
} from 'lucide-react'

interface LeaveRequest {
  id: number
  employeeName: string
  employeeAvatar: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  submittedDate: string
}

export default function LeaveManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const leaveRequests: LeaveRequest[] = [
    {
      id: 1,
      employeeName: 'Ahmet Yılmaz',
      employeeAvatar: '👨‍💻',
      leaveType: 'Yıllık İzin',
      startDate: '01 Kasım 2024',
      endDate: '05 Kasım 2024',
      days: 5,
      reason: 'Aile ziyareti',
      status: 'pending',
      submittedDate: '20 Ekim 2024'
    },
    {
      id: 2,
      employeeName: 'Ayşe Kaya',
      employeeAvatar: '👩‍💼',
      leaveType: 'Hastalık İzni',
      startDate: '25 Ekim 2024',
      endDate: '27 Ekim 2024',
      days: 3,
      reason: 'Sağlık sorunu',
      status: 'approved',
      submittedDate: '24 Ekim 2024'
    },
    {
      id: 3,
      employeeName: 'Mehmet Demir',
      employeeAvatar: '👨‍🎨',
      leaveType: 'Yıllık İzin',
      startDate: '10 Kasım 2024',
      endDate: '20 Kasım 2024',
      days: 11,
      reason: 'Uzun tatil',
      status: 'approved',
      submittedDate: '15 Ekim 2024'
    },
    {
      id: 4,
      employeeName: 'Zeynep Şahin',
      employeeAvatar: '👩‍💼',
      leaveType: 'Mazeret İzni',
      startDate: '28 Ekim 2024',
      endDate: '28 Ekim 2024',
      days: 1,
      reason: 'Kişisel işler',
      status: 'pending',
      submittedDate: '26 Ekim 2024'
    },
    {
      id: 5,
      employeeName: 'Can Öztürk',
      employeeAvatar: '👨‍💻',
      leaveType: 'Yıllık İzin',
      startDate: '05 Kasım 2024',
      endDate: '08 Kasım 2024',
      days: 4,
      reason: 'Kısa tatil',
      status: 'rejected',
      submittedDate: '22 Ekim 2024'
    }
  ]

  const leaveTypes = [
    { name: 'Yıllık İzin', count: 156, color: 'bg-blue-100 text-blue-700' },
    { name: 'Hastalık İzni', count: 42, color: 'bg-red-100 text-red-700' },
    { name: 'Mazeret İzni', count: 28, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Ücretsiz İzin', count: 12, color: 'bg-purple-100 text-purple-700' }
  ]

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    }
    const labels = {
      pending: 'Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi'
    }
    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />
    }
    return { 
      class: badges[status as keyof typeof badges], 
      label: labels[status as keyof typeof labels],
      icon: icons[status as keyof typeof icons]
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">İzin Yönetimi</h2>
        <p className="text-neutral-600">
          İzin taleplerini görüntüleyin, onaylayın veya reddedin.
        </p>
      </div>

      {/* Leave Type Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveTypes.map((type, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-neutral-200">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                <Calendar className="text-neutral-700" size={20} />
              </div>
              <span className={`px-2 py-1 ${type.color} text-xs font-medium rounded-lg`}>
                {type.count} Talep
              </span>
            </div>
            <h3 className="font-medium text-neutral-900 text-sm">{type.name}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
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

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Bekleyen</option>
            <option value="approved">Onaylanan</option>
            <option value="rejected">Reddedilen</option>
          </select>
        </div>

        {/* Add Button */}
        <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">
          <Plus size={18} />
          <span>Yeni İzin Talebi</span>
        </button>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Çalışan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">İzin Türü</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Tarihler</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Süre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {leaveRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status)
              return (
                <tr key={request.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">
                        {request.employeeAvatar}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{request.employeeName}</div>
                        <div className="text-sm text-neutral-500">{request.submittedDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-neutral-900">{request.leaveType}</span>
                    <div className="text-xs text-neutral-500 mt-1">{request.reason}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div className="text-neutral-900">{request.startDate}</div>
                      <div className="text-neutral-500">{request.endDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg">
                      {request.days} Gün
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${statusBadge.class} text-xs font-medium rounded-lg inline-flex items-center gap-1`}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {request.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium">
                          Onayla
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium">
                          Reddet
                        </button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <button className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-xs font-medium">
                        Detaylar
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
