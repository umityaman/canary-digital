import { useState } from 'react'
import { 
  DollarSign, Search, Download, Calendar, 
  CheckCircle, Clock, User
} from 'lucide-react'

interface PayrollRecord {
  id: number
  employeeName: string
  employeeAvatar: string
  department: string
  baseSalary: number
  bonus: number
  deductions: number
  netSalary: number
  month: string
  status: 'paid' | 'pending' | 'processing'
  paymentDate: string
}

export default function PayrollManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('Ekim 2024')

  const payrollRecords: PayrollRecord[] = [
    {
      id: 1,
      employeeName: 'Ahmet Yılmaz',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      baseSalary: 25000,
      bonus: 3000,
      deductions: 2500,
      netSalary: 25500,
      month: 'Ekim 2024',
      status: 'paid',
      paymentDate: '30 Ekim 2024'
    },
    {
      id: 2,
      employeeName: 'Ayşe Kaya',
      employeeAvatar: '👩‍💼',
      department: 'Proje',
      baseSalary: 28000,
      bonus: 4000,
      deductions: 3000,
      netSalary: 29000,
      month: 'Ekim 2024',
      status: 'paid',
      paymentDate: '30 Ekim 2024'
    },
    {
      id: 3,
      employeeName: 'Mehmet Demir',
      employeeAvatar: '👨‍🎨',
      department: 'Tasarım',
      baseSalary: 22000,
      bonus: 2000,
      deductions: 2000,
      netSalary: 22000,
      month: 'Ekim 2024',
      status: 'paid',
      paymentDate: '30 Ekim 2024'
    },
    {
      id: 4,
      employeeName: 'Zeynep Şahin',
      employeeAvatar: '👩‍💼',
      department: 'Pazarlama',
      baseSalary: 20000,
      bonus: 2500,
      deductions: 1800,
      netSalary: 20700,
      month: 'Ekim 2024',
      status: 'paid',
      paymentDate: '30 Ekim 2024'
    },
    {
      id: 5,
      employeeName: 'Can Öztürk',
      employeeAvatar: '👨‍💻',
      department: 'Yazılım',
      baseSalary: 24000,
      bonus: 2800,
      deductions: 2300,
      netSalary: 24500,
      month: 'Ekim 2024',
      status: 'paid',
      paymentDate: '30 Ekim 2024'
    },
    {
      id: 6,
      employeeName: 'Elif Yıldırım',
      employeeAvatar: '👩‍💼',
      department: 'İnsan Kaynakları',
      baseSalary: 26000,
      bonus: 3200,
      deductions: 2600,
      netSalary: 26600,
      month: 'Ekim 2024',
      status: 'paid',
      paymentDate: '30 Ekim 2024'
    }
  ]

  const monthlySummary = {
    totalGross: 145000,
    totalBonus: 17500,
    totalDeductions: 14200,
    totalNet: 148300,
    employeeCount: 6
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700'
    }
    const labels = {
      paid: 'Ödendi',
      pending: 'Bekliyor',
      processing: 'İşleniyor'
    }
    const icons = {
      paid: <CheckCircle size={14} />,
      pending: <Clock size={14} />,
      processing: <Clock size={14} />
    }
    return { 
      class: badges[status as keyof typeof badges], 
      label: labels[status as keyof typeof labels],
      icon: icons[status as keyof typeof icons]
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 tracking-tight mb-2">Bordro Yönetimi</h2>
        <p className="text-neutral-600">
          Maaş ödemelerini görüntüleyin, hesaplayın ve yönetin.
        </p>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-neutral-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-blue-700" size={20} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900">{formatCurrency(monthlySummary.totalGross)}</h3>
          <p className="text-xs text-neutral-600">Brüt Toplam</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-green-700" size={20} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900">{formatCurrency(monthlySummary.totalBonus)}</h3>
          <p className="text-xs text-neutral-600">Prim/Bonus</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-red-700" size={20} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900">{formatCurrency(monthlySummary.totalDeductions)}</h3>
          <p className="text-xs text-neutral-600">Kesintiler</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="text-purple-700" size={20} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900">{formatCurrency(monthlySummary.totalNet)}</h3>
          <p className="text-xs text-neutral-600">Net Toplam</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-neutral-200">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
              <User className="text-neutral-700" size={20} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-900">{monthlySummary.employeeCount}</h3>
          <p className="text-xs text-neutral-600">Çalışan</p>
        </div>
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

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <option value="Ekim 2024">Ekim 2024</option>
            <option value="Eylül 2024">Eylül 2024</option>
            <option value="Ağustos 2024">Ağustos 2024</option>
          </select>
        </div>

        {/* Export Button */}
        <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">
          <Download size={18} />
          <span>Rapor İndir</span>
        </button>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Çalışan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Brüt Maaş</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Prim/Bonus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Kesintiler</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Net Maaş</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {payrollRecords.map((record) => {
              const statusBadge = getStatusBadge(record.status)
              return (
                <tr key={record.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">
                        {record.employeeAvatar}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{record.employeeName}</div>
                        <div className="text-sm text-neutral-500">{record.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {formatCurrency(record.baseSalary)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-700">
                    +{formatCurrency(record.bonus)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-red-700">
                    -{formatCurrency(record.deductions)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-900">
                    {formatCurrency(record.netSalary)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${statusBadge.class} text-xs font-medium rounded-lg inline-flex items-center gap-1`}>
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-neutral-600">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar size={14} />
                      {record.paymentDate}
                    </div>
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
