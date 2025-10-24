import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  User,
} from 'lucide-react';

interface LeaveRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  leaveType: 'annual' | 'sick' | 'excuse' | 'unpaid' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approver?: string;
}

const LeaveManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const leaveRequests: LeaveRequest[] = [
    {
      id: 1,
      employeeId: 'EMP-2025-001',
      employeeName: 'Ahmet Yılmaz',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      leaveType: 'annual',
      startDate: '2024-11-01',
      endDate: '2024-11-10',
      days: 10,
      reason: 'Yıllık izin kullanmak istiyorum.',
      status: 'pending',
      requestDate: '2024-10-20',
    },
    {
      id: 2,
      employeeId: 'EMP-2025-002',
      employeeName: 'Ayşe Kaya',
      employeeAvatar: '👩‍💼',
      department: 'Prodüksiyon',
      leaveType: 'sick',
      startDate: '2024-10-25',
      endDate: '2024-10-27',
      days: 3,
      reason: 'Sağlık problemleri nedeniyle rapor aldım.',
      status: 'approved',
      requestDate: '2024-10-24',
      approver: 'Fatma Öz',
    },
    {
      id: 3,
      employeeId: 'EMP-2025-005',
      employeeName: 'Can Yıldız',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      leaveType: 'excuse',
      startDate: '2024-10-30',
      endDate: '2024-10-30',
      days: 1,
      reason: 'Özel durum, ev işleri.',
      status: 'approved',
      requestDate: '2024-10-28',
      approver: 'Mehmet Demir',
    },
    {
      id: 4,
      employeeId: 'EMP-2025-003',
      employeeName: 'Mehmet Demir',
      employeeAvatar: '👨‍💼',
      department: 'Yazılım',
      leaveType: 'annual',
      startDate: '2024-12-20',
      endDate: '2024-12-31',
      days: 12,
      reason: 'Yılbaşı tatili.',
      status: 'pending',
      requestDate: '2024-10-22',
    },
  ];

  const leaveTypes = {
    annual: { label: 'Yıllık İzin', color: 'bg-blue-100 text-blue-800' },
    sick: { label: 'Sağlık Raporu', color: 'bg-red-100 text-red-800' },
    excuse: { label: 'Mazeret İzni', color: 'bg-yellow-100 text-yellow-800' },
    unpaid: { label: 'Ücretsiz İzin', color: 'bg-purple-100 text-purple-800' },
    maternity: { label: 'Doğum İzni', color: 'bg-pink-100 text-pink-800' },
    paternity: { label: 'Babalık İzni', color: 'bg-green-100 text-green-800' },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            <Clock size={12} />
            Bekliyor
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            <CheckCircle size={12} />
            Onaylandı
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <XCircle size={12} />
            Reddedildi
          </span>
        );
    }
  };

  const filteredRequests = leaveRequests.filter((req) => {
    const matchesSearch =
      req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesType = filterType === 'all' || req.leaveType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = [
    {
      label: 'Bekleyen Talepler',
      value: leaveRequests.filter((r) => r.status === 'pending').length,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Onaylanan',
      value: leaveRequests.filter((r) => r.status === 'approved').length,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'İzinli Personel',
      value: 12,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Toplam Talepler',
      value: leaveRequests.length,
      color: 'bg-neutral-50 text-neutral-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-neutral-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="İzin talebi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="all">Tüm İzin Türleri</option>
            {Object.entries(leaveTypes).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Bekliyor</option>
            <option value="approved">Onaylandı</option>
            <option value="rejected">Reddedildi</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Download size={18} />
            Excel İndir
          </button>
        </div>
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Çalışan</th>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">İzin Türü</th>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Tarih</th>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Gün</th>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Sebep</th>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Durum</th>
              <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                      {request.employeeAvatar}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{request.employeeName}</p>
                      <p className="text-xs text-neutral-600">{request.employeeId} • {request.department}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${leaveTypes[request.leaveType].color}`}>
                    {leaveTypes[request.leaveType].label}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm">
                    <p className="text-neutral-900 font-medium">
                      {new Date(request.startDate).toLocaleDateString('tr-TR')}
                    </p>
                    <p className="text-neutral-600">
                      {new Date(request.endDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm font-medium text-neutral-900">{request.days} gün</span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-neutral-700 max-w-xs truncate" title={request.reason}>
                    {request.reason}
                  </p>
                </td>
                <td className="py-4 px-6">{getStatusBadge(request.status)}</td>
                <td className="py-4 px-6">
                  {request.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <CheckCircle size={14} />
                        Onayla
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <XCircle size={14} />
                        Reddet
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-600 text-right">
                      {request.approver && `Onaylayan: ${request.approver}`}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveManagement;
