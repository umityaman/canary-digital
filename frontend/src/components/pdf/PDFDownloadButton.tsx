import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface PDFDownloadButtonProps {
  type: 'invoice' | 'order' | 'equipment';
  id?: number;
  label?: string;
  filters?: any;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PDFDownloadButton({
  type,
  id,
  label,
  filters,
  variant = 'secondary',
  size = 'md',
  className = ''
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      let filename = 'document.pdf';
      let method: 'get' | 'post' = 'post';
      let data: any = null;

      switch (type) {
        case 'invoice':
          if (!id) throw new Error('Invoice ID required');
          endpoint = `/pdf/invoice/${id}`;
          filename = `invoice-${id}.pdf`;
          break;

        case 'order':
          if (!id) throw new Error('Order ID required');
          endpoint = `/pdf/order/${id}`;
          filename = `order-${id}.pdf`;
          break;

        case 'equipment':
          endpoint = '/pdf/equipment';
          filename = 'equipment-list.pdf';
          data = filters || {};
          break;

        default:
          throw new Error('Invalid PDF type');
      }

      // Make API request
      const response = await api.request({
        url: endpoint,
        method,
        data,
        responseType: 'blob', // Important for file download
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error('PDF download error:', err);
      setError(err.response?.data?.error || 'PDF indirilemedi');
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantClasses = {
      primary: 'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-700',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-300',
      ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getLabel = () => {
    if (label) return label;
    
    switch (type) {
      case 'invoice':
        return 'Fatura İndir';
      case 'order':
        return 'Sipariş İndir';
      case 'equipment':
        return 'Liste İndir';
      default:
        return 'PDF İndir';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={getButtonClasses()}
        title={getLabel()}
      >
        {loading ? (
          <Loader2 size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} className="animate-spin" />
        ) : (
          <FileDown size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
        )}
        <span>{loading ? 'İndiriliyor...' : getLabel()}</span>
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-2 bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}
