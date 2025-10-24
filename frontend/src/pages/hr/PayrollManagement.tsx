import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
  TrendingUp,
  Users,
} from 'lucide-react';

interface Payroll {
  id: number;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  position: string;
  baseSalary: number;
  overtime: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  month: string;
  year: number;
  status: 'pending' | 'processed' | 'paid';
}

const PayrollManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('2024-10');

  const payrolls: Payroll[] = [
    {
      id: 1,
      employeeId: 'EMP-2025-001',
      employeeName: 'Ahmet Yılmaz',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      position: 'Senior Developer',
      baseSalary: 45000,
      overtime: 3000,
      bonus: 5000,
      deductions: 8500,
      netSalary: 44500,
      month: 'Ekim',
      year: 2024,
      status: 'paid',
    },
    {
      id: 2,
      employeeId: 'EMP-2025-002',
      employeeName: 'Ayşe Kaya',
      employeeAvatar: '👩‍💼',
      department: 'Prodüksiyon',
      position: 'Proje Yöneticisi',
      baseSalary: 38000,
      overtime: 2000,
      bonus: 3000,
      deductions: 6800,
      netSalary: 36200,
      month: 'Ekim',
      year: 2024,
      status: 'paid',
    },
    {
      id: 3,
      employeeId: 'EMP-2025-003',
      employeeName: 'Mehmet Demir',
      employeeAvatar: '👨‍💼',
      department: 'Yazılım',
      position: 'Yazılım Müdürü',
      baseSalary: 65000,
      overtime: 0,
      bonus: 10000,
      deductions: 15000,
      netSalary: 60000,
      month: 'Ekim',
      year: 2024,
      status: 'paid',
    },
    {
      id: 4,
      employeeId: 'EMP-2025-004',
      employeeName: 'Fatma Öz',
      employeeAvatar: '👩‍💼',
      department: 'Prodüksiyon',
      position: 'Prodüksiyon Müdürü',
      baseSalary: 58000,
      overtime: 1500,
      bonus: 7000,
      deductions: 13300,
      netSalary: 53200,
      month: 'Ekim',
      year: 2024,
      status: 'paid',
    },
    {
      id: 5,
      employeeId: 'EMP-2025-005',
      employeeName: 'Can Yıldız',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      position: 'Junior Developer',
      baseSalary: 28000,
      overtime: 1000,
      bonus: 1000,
      deductions: 4800,
      netSalary: 25200,
      month: 'Ekim',
      year: 2024,
      status: 'processed',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Bekliyor</span>;
      case 'processed':
        return <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">İşlendi</span>;
      case 'paid':
        return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Ödendi</span>;
    }
  };

  const filteredPayrolls = payrolls.filter((payroll) => {
    const matchesSearch =
      payroll.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalGross = payrolls.reduce((sum, p) => sum + p.baseSalary + p.overtime + p.bonus, 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const stats = [
    {
      label: 'Toplam Brüt Maaş',
      value: `₺${totalGross.toLocaleString('tr-TR')}`,
      icon: <DollarSign size={20} />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Toplam Kesinti',
      value: `₺${totalDeductions.toLocaleString('tr-TR')}`,
      icon: <TrendingUp size={20} />,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Toplam Net Maaş',
      value: `₺${totalNet.toLocaleString('tr-TR')}`,
      icon: <DollarSign size={20} />,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Personel Sayısı',
      value: payrolls.length,
      icon: <Users size={20} />,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-neutral-900 mb-1">{stat.value}</div>
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
              placeholder="Personel ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-neutral-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <Download size={18} />
            Bordro İndir
          </button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Çalışan</th>
              <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">Brüt Maaş</th>
              <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">Mesai</th>
              <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">Prim</th>
              <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">Kesintiler</th>
              <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">Net Maaş</th>
              <th className="text-left py-4 px-6 font-semibold text-sm text-neutral-700">Durum</th>
              <th className="text-right py-4 px-6 font-semibold text-sm text-neutral-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredPayrolls.map((payroll) => (
              <tr key={payroll.id} className="hover:bg-neutral-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                      {payroll.employeeAvatar}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{payroll.employeeName}</p>
                      <p className="text-xs text-neutral-600">
                        {payroll.employeeId} • {payroll.position}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-medium text-neutral-900">
                    ₺{payroll.baseSalary.toLocaleString('tr-TR')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm text-green-600 font-medium">
                    +₺{payroll.overtime.toLocaleString('tr-TR')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm text-green-600 font-medium">
                    +₺{payroll.bonus.toLocaleString('tr-TR')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm text-red-600 font-medium">
                    -₺{payroll.deductions.toLocaleString('tr-TR')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-base font-bold text-neutral-900">
                    ₺{payroll.netSalary.toLocaleString('tr-TR')}
                  </span>
                </td>
                <td className="py-4 px-6">{getStatusBadge(payroll.status)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Görüntüle">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Bordro İndir">
                      <FileText size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollManagement;
