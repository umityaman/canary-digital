import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  CreditCard, 
  Shield, 
  Lock, 
  AlertTriangle,
  Check,
  Loader2,
  Info
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentFormProps {
  contractId: number;
  amount: number;
  currency?: string;
  onPaymentSuccess?: (payment: any) => void;
  onPaymentError?: (error: string) => void;
}

interface PaymentCard {
  holderName: string;
  number: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
}

interface InstallmentOption {
  installmentNumber: number;
  totalPrice: string;
  installmentPrice: string;
  bankName: string;
  commissionRate: number;
}

export default function PaymentForm({ 
  contractId, 
  amount, 
  currency = 'TRY',
  onPaymentSuccess,
  onPaymentError 
}: PaymentFormProps) {
  const { toast } = useToast();

  // Form state
  const [paymentCard, setPaymentCard] = useState<PaymentCard>({
    holderName: '',
    number: '',
    expireMonth: '',
    expireYear: '',
    cvc: ''
  });

  const [use3D, setUse3D] = useState(true);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [installmentOptions, setInstallmentOptions] = useState<InstallmentOption[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingInstallments, setLoadingInstallments] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast: showToast } = useToast();

  // Format card number input
  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s+/g, '')
      .replace(/[^0-9]/gi, '')
      .substr(0, 16)
      .match(/.{1,4}/g)?.join(' ') || '';
  };

  // Format expiry input
  const formatExpiry = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentCard.holderName.trim()) {
      newErrors.holderName = 'Kart sahibi adı gerekli';
    }

    const cardNumber = paymentCard.number.replace(/\s/g, '');
    if (!cardNumber || cardNumber.length < 16) {
      newErrors.number = 'Geçerli bir kart numarası girin';
    }

    if (!paymentCard.expireMonth || !paymentCard.expireYear) {
      newErrors.expiry = 'Son kullanma tarihi gerekli';
    }

    if (!paymentCard.cvc || paymentCard.cvc.length < 3) {
      newErrors.cvc = 'CVC kodu gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get installment options
  const getInstallmentOptions = async (binNumber: string) => {
    if (binNumber.length < 6) return;

    setLoadingInstallments(true);
    try {
      const response = await fetch(
        `/api/payments/installments?price=${amount}&binNumber=${binNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.installments?.installmentDetails) {
          setInstallmentOptions(data.installments.installmentDetails);
        }
      }
    } catch (error) {
      console.error('Installment fetch error:', error);
    } finally {
      setLoadingInstallments(false);
    }
  };

  // Handle card number change
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setPaymentCard(prev => ({ ...prev, number: formatted }));

    // Get installment options when we have 6+ digits
    const binNumber = value.replace(/\s/g, '').substr(0, 6);
    if (binNumber.length >= 6) {
      getInstallmentOptions(binNumber);
    }
  };

  // Handle expiry change
  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    const [month, year] = formatted.split('/');
    
    setPaymentCard(prev => ({
      ...prev,
      expireMonth: month || '',
      expireYear: year ? `20${year}` : ''
    }));
  };

  // Submit payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doğru şekilde doldurun',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/payments/contracts/${contractId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          amount,
          currency,
          paymentCard: {
            ...paymentCard,
            number: paymentCard.number.replace(/\s/g, '')
          },
          use3D,
          description: `Sözleşme ${contractId} ödemesi`
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.iyzipay.threeDSHtmlContent) {
          // 3D Secure flow
          const popup = window.open('', '_blank', 'width=600,height=600');
          if (popup) {
            popup.document.write(data.iyzipay.threeDSHtmlContent);
            popup.document.close();
            
            // Monitor popup
            const checkClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkClosed);
                // Check payment status
                window.location.reload();
              }
            }, 1000);
          }
        } else {
          // Direct payment success
          showToast({
            title: 'Başarılı',
            description: 'Ödeme başarıyla tamamlandı',
          });
          
          onPaymentSuccess?.(data.payment);
        }
      } else {
        throw new Error(data.error || 'Ödeme işlemi başarısız');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ödeme işlemi başarısız';
      
      showToast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive'
      });
      
      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Ödeme Bilgileri
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Amount Display */}
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {amount.toLocaleString('tr-TR', {
              style: 'currency',
              currency: currency
            })}
          </div>
          <div className="text-sm text-gray-600">Ödenecek Tutar</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="holderName">Kart Sahibi Adı</Label>
            <Input
              id="holderName"
              value={paymentCard.holderName}
              onChange={(e) => setPaymentCard(prev => ({ 
                ...prev, 
                holderName: e.target.value.toUpperCase() 
              }))}
              placeholder="AD SOYAD"
              className={errors.holderName ? 'border-red-500' : ''}
            />
            {errors.holderName && (
              <p className="text-sm text-red-500">{errors.holderName}</p>
            )}
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Kart Numarası</Label>
            <Input
              id="cardNumber"
              value={paymentCard.number}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className={errors.number ? 'border-red-500' : ''}
            />
            {errors.number && (
              <p className="text-sm text-red-500">{errors.number}</p>
            )}
          </div>

          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Son Kullanma</Label>
              <Input
                id="expiry"
                value={paymentCard.expireMonth && paymentCard.expireYear ? 
                  `${paymentCard.expireMonth}/${paymentCard.expireYear.slice(-2)}` : ''}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                className={errors.expiry ? 'border-red-500' : ''}
              />
              {errors.expiry && (
                <p className="text-sm text-red-500">{errors.expiry}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={paymentCard.cvc}
                onChange={(e) => setPaymentCard(prev => ({ 
                  ...prev, 
                  cvc: e.target.value.replace(/\D/g, '').substr(0, 4) 
                }))}
                placeholder="123"
                type="password"
                className={errors.cvc ? 'border-red-500' : ''}
              />
              {errors.cvc && (
                <p className="text-sm text-red-500">{errors.cvc}</p>
              )}
            </div>
          </div>

          {/* Installment Options */}
          {installmentOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Taksit Seçenekleri</Label>
              <div className="grid gap-2">
                {installmentOptions.slice(0, 6).map((option) => (
                  <label
                    key={option.installmentNumber}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedInstallment === option.installmentNumber 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="installment"
                        value={option.installmentNumber}
                        checked={selectedInstallment === option.installmentNumber}
                        onChange={(e) => setSelectedInstallment(Number(e.target.value))}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium">
                          {option.installmentNumber === 1 ? 'Peşin' : `${option.installmentNumber} Taksit`}
                        </div>
                        {option.installmentNumber > 1 && (
                          <div className="text-sm text-gray-600">
                            {option.installmentPrice} TL x {option.installmentNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{option.totalPrice} TL</div>
                      {option.installmentNumber > 1 && option.commissionRate > 0 && (
                        <div className="text-sm text-orange-600">
                          +%{option.commissionRate} komisyon
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {loadingInstallments && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Taksit seçenekleri yükleniyor...
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* 3D Secure */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <Label htmlFor="use3d" className="text-sm">3D Secure</Label>
            </div>
            <Switch
              id="use3d"
              checked={use3D}
              onCheckedChange={setUse3D}
            />
          </div>

          {use3D && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Info className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <div className="font-medium">3D Secure Aktif</div>
                <div>Ödemeniz banka tarafından güvenlik kontrolünden geçecektir.</div>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <Lock className="w-4 h-4 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <div className="font-medium">Güvenli Ödeme</div>
              <div>Kart bilgileriniz SSL ile şifrelenir ve saklanmaz.</div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                {amount.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: currency
                })} Öde
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}