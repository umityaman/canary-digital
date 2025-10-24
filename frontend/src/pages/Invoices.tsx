import React, { useState } from 'react';
import { 
  Search, Plus, FileText, Download, Mail, Eye, Clock, 
  CheckCircle, XCircle, AlertCircle, DollarSign, Calendar,
  Filter, TrendingUp, CreditCard, User, Building
} from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNo: string;
  customerName: string;
  companyName?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'overdue' | 'partial';
  currency: string;
  items: number;
}

const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNo: 'INV-2025-001',
    customerName: 'Ahmet Yılmaz',
    companyName: 'Yılmaz Ltd.',
    issueDate: '2025-01-15',
    dueDate: '2025-02-15',
    amount: 12500,
    paidAmount: 12500,
    status: 'paid',
    currency: '₺',
    items: 3
  },
  {
    id: 2,
    invoiceNo: 'INV-2025-002',
    customerName: 'Mehmet Demir',
    issueDate: '2025-01-20',
    dueDate: '2025-02-20',
    amount: 8750,
    paidAmount: 4375,
    status: 'partial',
    currency: '₺',
    items: 2
  },
  {
    id: 3,
    invoiceNo: 'INV-2025-003',
    customerName: 'Ayşe Kaya',
    companyName: 'Kaya A.Ş.',
    issueDate: '2025-01-10',
    dueDate: '2025-01-25',
    amount: 15000,
    paidAmount: 0,
    status: 'overdue',
    currency: '₺',
    items: 5
  },
  {
    id: 4,
    invoiceNo: 'INV-2025-004',
    customerName: 'Can Arslan',
    issueDate: '2025-01-22',
    dueDate: '2025-02-22',
    amount: 6200,
    paidAmount: 0,
    status: 'unpaid',
    currency: '₺',
    items: 1
  },
];

const Invoices: React.FC = () => {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Ödendi',
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'partial':
        return {
          label: 'Kısmi Ödeme',
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200'
        };
      case 'overdue':
        return {
          label: 'Vadesi Geçti',
          icon: XCircle,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      case 'unpaid':
        return {
          label: 'Ödenmedi',
          icon: Clock,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          label: 'Bilinmiyor',
          icon: AlertCircle,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.companyName && invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              Toplam
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{invoices.length}</p>
          <p className="text-sm text-gray-600">Fatura</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Tahsil
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">₺{paidAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Ödenen</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              Bekleyen
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">₺{unpaidAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Tahsilat</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <CreditCard className="text-white" size={24} />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              Oran
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-600">Tahsilat Oranı</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Fatura no, müşteri adı veya şirket ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="paid">Ödendi</option>
            <option value="partial">Kısmi Ödeme</option>
            <option value="unpaid">Ödenmedi</option>
            <option value="overdue">Vadesi Geçti</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={20} />
            Filtrele
          </button>
          
          <button className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap">
            <Plus size={20} />
            Yeni Fatura
          </button>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => {
          const statusConfig = getStatusConfig(invoice.status);
          const StatusIcon = statusConfig.icon;
          const remainingAmount = invoice.amount - invoice.paidAmount;
          const paymentPercentage = (invoice.paidAmount / invoice.amount) * 100;

          return (
            <div 
              key={invoice.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-neutral-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={18} className="text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNo}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} />
                    <span className="font-medium">{invoice.customerName}</span>
                  </div>
                  {invoice.companyName && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Building size={12} />
                      <span>{invoice.companyName}</span>
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                  <StatusIcon size={14} />
                  <span className="text-xs font-medium">{statusConfig.label}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Calendar size={12} />
                    <span>Kesim Tarihi</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <Clock size={12} />
                    <span>Vade Tarihi</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Amount Info */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Toplam Tutar</span>
                  <span className="text-lg font-bold text-gray-900">
                    {invoice.currency}{invoice.amount.toLocaleString()}
                  </span>
                </div>
                
                {invoice.status !== 'paid' && (
                  <>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">Ödenen</span>
                      <span className="font-medium text-green-600">
                        {invoice.currency}{invoice.paidAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-600">Kalan</span>
                      <span className="font-medium text-red-600">
                        {invoice.currency}{remainingAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Payment Progress */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${paymentPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      %{Math.round(paymentPercentage)} ödendi
                    </p>
                  </>
                )}
              </div>

              {/* Items Count */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">{invoice.items}</span>
                </div>
                <span>Kalem</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <Eye size={16} />
                  <span>Görüntüle</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download size={16} />
                  <span>İndir</span>
                </button>
                <button className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Mail size={16} />
                  <span>Gönder</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500 text-lg">Fatura bulunamadı</p>
          <p className="text-neutral-400 text-sm mt-2">Arama kriterlerinizi değiştirin veya yeni fatura oluşturun</p>
        </div>
      )}
    </div>
  );
};

export default Invoices;
