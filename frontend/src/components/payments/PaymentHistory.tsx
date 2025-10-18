import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Download, 
  RefreshCw, 
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod: string;
  description?: string;
  createdAt: string;
  paidAt?: string;
  iyzipayPaymentId?: string;
  contract?: {
    id: number;
    contractNumber: string;
    customer: {
      name: string;
      email: string;
    };
  };
}

interface PaymentHistoryProps {
  contractId?: number;
  customerId?: number;
  showActions?: boolean;
  onRefund?: (paymentId: number) => void;
}

export default function PaymentHistory({ 
  contractId, 
  customerId, 
  showActions = true,
  onRefund 
}: PaymentHistoryProps) {
  const { toast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);

  // Load payments
  const loadPayments = async () => {
    setLoading(true);
    try {
      let url = '/api/payments';
      
      if (contractId) {
        url = `/api/payments/contracts/${contractId}`;
      } else if (customerId) {
        url = `/api/payments?customerId=${customerId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        throw new Error('Ödemeler yüklenemedi');
      }
    } catch (error) {
      console.error('Load payments error:', error);
      toast({
        title: 'Hata',
        description: 'Ödemeler yüklenemedi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter payments based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPayments(payments);
    } else {
      const filtered = payments.filter(payment =>
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.contract?.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.contract?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.iyzipayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPayments(filtered);
    }
  }, [payments, searchTerm]);

  // Load on mount
  useEffect(() => {
    loadPayments();
  }, [contractId, customerId]);

  // Get status badge
  const getStatusBadge = (status: Payment['status']) => {
    const configs = {
      PENDING: { variant: 'secondary' as const, icon: Clock, text: 'Beklemede' },
      COMPLETED: { variant: 'default' as const, icon: CheckCircle, text: 'Tamamlandı' },
      FAILED: { variant: 'destructive' as const, icon: XCircle, text: 'Başarısız' },
      REFUNDED: { variant: 'outline' as const, icon: RotateCcw, text: 'İade Edildi' },
      CANCELLED: { variant: 'secondary' as const, icon: XCircle, text: 'İptal Edildi' }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  // Handle refund
  const handleRefund = async (paymentId: number) => {
    if (!confirm('Bu ödemeyi iade etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          reason: 'Müşteri talebi'
        })
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Ödeme iadesi başlatıldı'
        });
        
        loadPayments(); // Refresh
        onRefund?.(paymentId);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'İade işlemi başarısız');
      }
    } catch (error) {
      console.error('Refund error:', error);
      toast({
        title: 'Hata',
        description: error instanceof Error ? error.message : 'İade işlemi başarısız',
        variant: 'destructive'
      });
    }
  };

  // Download receipt (mock)
  const handleDownloadReceipt = (payment: Payment) => {
    toast({
      title: 'Bilgi',
      description: 'Makbuz indirme özelliği yakında eklenecek'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Ödeme Geçmişi
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadPayments}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Sözleşme no, müşteri adı veya açıklama ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Ödemeler yükleniyor...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz ödeme yok'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Farklı terimlerle arama yapın' : 'İlk ödeme yapıldığında burada görünecek'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredPayments.filter(p => p.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Tamamlanan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredPayments.filter(p => p.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Beklemede</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredPayments.filter(p => p.status === 'FAILED').length}
                </div>
                <div className="text-sm text-gray-600">Başarısız</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredPayments
                    .filter(p => p.status === 'COMPLETED')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </div>
                <div className="text-sm text-gray-600">Toplam Tahsilat</div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    {!contractId && <TableHead>Sözleşme</TableHead>}
                    <TableHead>Açıklama</TableHead>
                    {showActions && <TableHead>İşlemler</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium">
                          {payment.amount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: payment.currency
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.paymentMethod}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      
                      {!contractId && (
                        <TableCell>
                          {payment.contract && (
                            <div>
                              <div className="font-medium">
                                {payment.contract.contractNumber}
                              </div>
                              <div className="text-sm text-gray-600">
                                {payment.contract.customer.name}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {payment.description || '-'}
                        </div>
                        {payment.iyzipayPaymentId && (
                          <div className="text-xs text-gray-500">
                            ID: {payment.iyzipayPaymentId.slice(-8)}
                          </div>
                        )}
                      </TableCell>
                      
                      {showActions && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            
                            {payment.status === 'COMPLETED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRefund(payment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}