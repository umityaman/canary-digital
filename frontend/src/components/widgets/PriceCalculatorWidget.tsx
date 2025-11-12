import React, { useState, useEffect } from 'react';
import { pricingAPI } from '../../services/api';

interface PriceCalculatorProps {
  equipmentId: number;
  equipmentName: string;
  dailyPrice: number;
  onAddToCart?: (priceInfo: any) => void;
}

const PriceCalculatorWidget: React.FC<PriceCalculatorProps> = ({
  equipmentId,
  equipmentName,
  dailyPrice,
  onAddToCart
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [error, setError] = useState('');
  const [promoError, setPromoError] = useState('');

  // Set default dates (today + 7 days)
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  // Auto-calculate when dates or quantity change
  useEffect(() => {
    if (startDate && endDate) {
      calculatePrice();
    }
  }, [startDate, endDate, quantity]);

  const calculatePrice = async () => {
    if (!startDate || !endDate) {
      setError('Başlangıç ve bitiş tarihi gerekli');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError('Bitiş tarihi başlangıç tarihinden sonra olmalı');
      return;
    }

    setError('');
    setCalculating(true);

    try {
      const result = await pricingAPI.calculatePrice({
        equipmentId,
        startDate,
        endDate,
        quantity,
        promoCode: promoCode || undefined
      });

      if (result.success) {
        setPriceBreakdown(result.data);
        setPromoError('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fiyat hesaplanamadı');
    } finally {
      setCalculating(false);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await pricingAPI.validateDiscount(promoCode.trim().toUpperCase());
      
      if (result.success) {
        setPromoError('');
        // Re-calculate with promo code
        calculatePrice();
      } else {
        setPromoError(result.message || 'Geçersiz kod');
        setPromoCode('');
      }
    } catch (err: any) {
      setPromoError('Kod doğrulanamadı');
    }
  };

  const handleAddToCart = () => {
    if (priceBreakdown && onAddToCart) {
      onAddToCart({
        equipmentId,
        equipmentName,
        startDate,
        endDate,
        quantity,
        promoCode,
        priceBreakdown
      });
    }
  };

  const getDurationText = () => {
    if (!priceBreakdown) return '';
    
    const days = priceBreakdown.durationDays;
    const hours = priceBreakdown.durationHours;
    
    if (hours < 24) {
      return `${hours} saat`;
    } else if (days === 1) {
      return '1 gün';
    } else if (days < 7) {
      return `${days} gün`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return `${weeks} hafta${remainingDays > 0 ? ` ${remainingDays} gün` : ''}`;
    } else {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return `${months} ay${remainingDays > 0 ? ` ${remainingDays} gün` : ''}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Fiyat Hesapla</h3>
      
      {/* Equipment Info */}
      <div className="mb-4 pb-4 border-b">
        <p className="text-sm text-neutral-600">{equipmentName}</p>
        <p className="text-lg font-semibold text-blue-600">{dailyPrice} TL/gün</p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-500 focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-500 focus:border-neutral-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Miktar
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-500 focus:border-neutral-500"
          />
        </div>
      </div>

      {/* Promo Code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Promosyon Kodu (Opsiyonel)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="WELCOME20"
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-500 focus:border-neutral-500 uppercase"
          />
          <button
            onClick={validatePromoCode}
            disabled={!promoCode.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Uygula
          </button>
        </div>
        {promoError && (
          <p className="text-xs text-red-600 mt-1">{promoError}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Price Breakdown */}
      {calculating && (
        <div className="mb-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-600 text-center">Hesaplanıyor...</p>
        </div>
      )}

      {priceBreakdown && !calculating && (
        <div className="mb-4 space-y-3">
          {/* Duration */}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Süre</span>
            <span className="font-medium">{getDurationText()}</span>
          </div>

          {/* Base Price */}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Temel Fiyat</span>
            <span className="font-medium">{priceBreakdown.basePrice.toFixed(2)} TL</span>
          </div>

          {/* Discounts */}
          {priceBreakdown.discounts.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-sm font-medium text-neutral-700 mb-2">İndirimler</p>
              {priceBreakdown.discounts.map((discount: any, index: number) => (
                <div key={index} className="flex justify-between text-sm mb-1">
                  <span className="text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {discount.name}
                  </span>
                  <span className="text-green-600 font-medium">
                    -{discount.amount.toFixed(2)} TL
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total Discount */}
          {priceBreakdown.totalDiscount > 0 && (
            <div className="flex justify-between text-sm font-medium text-green-600 border-t pt-2">
              <span>Toplam İndirim</span>
              <span>-{priceBreakdown.totalDiscount.toFixed(2)} TL</span>
            </div>
          )}

          {/* Final Price */}
          <div className="flex justify-between text-lg font-bold text-neutral-900 border-t-2 pt-3">
            <span>Toplam</span>
            <span className="text-blue-600">{priceBreakdown.finalPrice.toFixed(2)} TL</span>
          </div>

          {/* Price per Day */}
          <div className="text-center text-sm text-neutral-600">
            {priceBreakdown.pricePerDay.toFixed(2)} TL/gün (ortalama)
          </div>

          {/* Applied Rules Info */}
          {priceBreakdown.appliedRules.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700">
                ✓ {priceBreakdown.appliedRules.length} indirim kuralı uygulandı
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      {priceBreakdown && onAddToCart && (
        <button
          onClick={handleAddToCart}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Sepete Ekle
        </button>
      )}

      {/* Calculate Button (if no auto-calc) */}
      {!priceBreakdown && !calculating && (
        <button
          onClick={calculatePrice}
          disabled={!startDate || !endDate}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Fiyat Hesapla
        </button>
      )}
    </div>
  );
};

export default PriceCalculatorWidget;
