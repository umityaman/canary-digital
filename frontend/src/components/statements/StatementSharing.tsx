import { useState, useEffect } from 'react';
import { statementAPI, StatementData, StatementFilters } from '../../services/statements';
import { FileText, Download, Mail, MessageCircle, Calendar, TrendingUp, TrendingDown, Clock, User, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

const StatementSharing = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Share options
  const [shareFormat, setShareFormat] = useState<'pdf' | 'excel'>('pdf');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [message, setMessage] = useState('Sayın müşterimiz, hesap özet ekstreniz ektedir.');

  useEffect(() => {
    loadCustomers();
    loadHistory();
    
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const loadCustomers = async () => {
    try {
      // This would come from your customer API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await statementAPI.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedCustomer || !startDate || !endDate) {
      toast.error('Lütfen müşteri ve tarih aralığı seçin');
      return;
    }

    try {
      setLoading(true);
      const filters: StatementFilters = {
        customerId: selectedCustomer,
        startDate,
        endDate,
        includePayments: true,
        includeInvoices: true,
        includeOrders: true,
      };

      const data = await statementAPI.generate(filters);
      setStatement(data);
      toast.success('Ekstre oluşturuldu');
    } catch (error) {
      console.error('Error generating statement:', error);
      toast.error('Ekstre oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'excel') => {
    if (!selectedCustomer || !startDate || !endDate) {
      toast.error('Lütfen ekstre oluşturun');
      return;
    }

    try {
      setLoading(true);
      const filters: StatementFilters = {
        customerId: selectedCustomer,
        startDate,
        endDate,
        includePayments: true,
        includeInvoices: true,
        includeOrders: true,
      };

      const blob = format === 'pdf' 
        ? await statementAPI.downloadPDF(filters)
        : await statementAPI.downloadExcel(filters);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ekstre-${selectedCustomer}-${startDate}-${endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Ekstre ${format.toUpperCase()} olarak indirildi`);
    } catch (error) {
      console.error('Error downloading statement:', error);
      toast.error('İndirme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedCustomer || !startDate || !endDate) {
      toast.error('Lütfen ekstre oluşturun');
      return;
    }

    if (!sendEmail && !sendWhatsApp) {
      toast.error('En az bir gönderim yöntemi seçin');
      return;
    }

    try {
      setSharing(true);
      const result = await statementAPI.share({
        customerId: selectedCustomer,
        startDate,
        endDate,
        format: shareFormat,
        sendEmail,
        sendWhatsApp,
        message,
        includePayments: true,
        includeInvoices: true,
        includeOrders: true,
      });

      if (result.success) {
        toast.success('Ekstre başarıyla gönderildi!');
        loadHistory();
      } else {
        toast.error(result.message || 'Gönderim başarısız');
      }
    } catch (error) {
      console.error('Error sharing statement:', error);
      toast.error('Gönderim başarısız');
    } finally {
      setSharing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Ekstre Paylaşımı</h2>
        <p className="text-sm text-neutral-600 mt-1">Müşterilere hesap ekstresi gönderin</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4">
        <h3 className="font-semibold text-neutral-900 mb-4">Ekstre Oluştur</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Müşteri <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCustomer || ''}
              onChange={(e) => setSelectedCustomer(Number(e.target.value))}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Müşteri Seçin</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Başlangıç Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Bitiş Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <button
          onClick={handleGeneratePreview}
          disabled={loading || !selectedCustomer || !startDate || !endDate}
          className="w-full bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Oluşturuluyor...
            </>
          ) : (
            <>
              <FileText size={20} />
              Ekstre Oluştur
            </>
          )}
        </button>
      </div>

      {/* Statement Preview */}
      {statement && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-6">
          {/* Customer Info */}
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">{statement.customer.name}</h3>
              {statement.customer.email && (
                <p className="text-sm text-neutral-600 flex items-center gap-2 mt-1">
                  <Mail size={14} />
                  {statement.customer.email}
                </p>
              )}
              {statement.customer.phone && (
                <p className="text-sm text-neutral-600 flex items-center gap-2 mt-1">
                  <MessageCircle size={14} />
                  {statement.customer.phone}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-600">Dönem</p>
              <p className="font-semibold text-neutral-900">
                {formatDate(statement.period.start)} - {formatDate(statement.period.end)}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-900">Açılış Bakiyesi</span>
                <TrendingUp className="text-blue-600" size={16} />
              </div>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(statement.summary.openingBalance)}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-900">Toplam Faturalar</span>
                <FileText className="text-green-600" size={16} />
              </div>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(statement.summary.totalInvoices)}
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-orange-900">Toplam Ödemeler</span>
                <TrendingDown className="text-orange-600" size={16} />
              </div>
              <p className="text-xl font-bold text-orange-900">
                {formatCurrency(statement.summary.totalPayments)}
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-900">Kapanış Bakiyesi</span>
                <TrendingUp className="text-purple-600" size={16} />
              </div>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(statement.summary.closingBalance)}
              </p>
            </div>
          </div>

          {/* Transactions */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">İşlemler</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-neutral-700">Tarih</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-neutral-700">Açıklama</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-neutral-700">Referans</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-neutral-700">Borç</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-neutral-700">Alacak</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-neutral-700">Bakiye</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.transactions.map((tx, index) => (
                    <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-2 text-sm text-neutral-600">{formatDate(tx.date)}</td>
                      <td className="py-3 px-2 text-sm text-neutral-900">{tx.description}</td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{tx.reference || '-'}</td>
                      <td className="py-3 px-2 text-sm text-right text-red-600">
                        {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-green-600">
                        {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-semibold text-neutral-900">
                        {formatCurrency(tx.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-200 space-y-4">
            <h4 className="font-semibold text-neutral-900">Ekstre İşlemleri</h4>
            
            {/* Download Options */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Download size={20} />
                PDF İndir
              </button>
              <button
                onClick={() => handleDownload('excel')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download size={20} />
                Excel İndir
              </button>
            </div>

            {/* Share Options */}
            <div className="bg-neutral-50 rounded-xl p-4 space-y-4">
              <h5 className="font-medium text-neutral-900">Müşteriye Gönder</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Format
                  </label>
                  <select
                    value={shareFormat}
                    onChange={(e) => setShareFormat(e.target.value as 'pdf' | 'excel')}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Gönderim Yöntemi
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="w-4 h-4 text-neutral-900 rounded"
                      />
                      <Mail size={16} />
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sendWhatsApp}
                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                        className="w-4 h-4 text-neutral-900 rounded"
                      />
                      <MessageCircle size={16} />
                      <span className="text-sm">WhatsApp</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Mesaj
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="Müşteriye gönderilecek mesaj..."
                />
              </div>

              <button
                onClick={handleShare}
                disabled={sharing || (!sendEmail && !sendWhatsApp)}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {sharing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Gönder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200">
        <h3 className="font-semibold text-neutral-900 mb-4">Gönderim Geçmişi</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto text-neutral-400 mb-3" size={40} />
            <p className="text-neutral-600">Henüz gönderim yapılmamış</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{item.customerName}</p>
                    <p className="text-sm text-neutral-600">
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                    {item.format.toUpperCase()} • {item.sentVia}
                  </span>
                  <p className="text-xs text-neutral-600 mt-1">{formatDate(item.sentAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatementSharing;
