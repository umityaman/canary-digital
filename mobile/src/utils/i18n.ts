import i18n from '../i18n/config';

/**
 * Format date according to current language
 */
export const formatDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

/**
 * Format short date
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
};

/**
 * Format date with time
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format time only
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Format relative time
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  // Use simple logic for React Native compatibility
  if (Math.abs(diffInSeconds) < 60) {
    return i18n.language === 'tr' ? 'Az önce' : 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return i18n.language === 'tr' 
      ? `${diffInMinutes} dakika önce` 
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return i18n.language === 'tr'
      ? `${diffInHours} saat önce`
      : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return i18n.language === 'tr'
      ? `${diffInDays} gün önce`
      : `${diffInDays} days ago`;
  }

  return formatShortDate(dateObj);
};

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'TRY'
): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  // For React Native, use manual formatting for better compatibility
  const formatted = amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  
  if (currency === 'TRY') {
    return i18n.language === 'tr' ? `${formatted} ₺` : `₺${formatted}`;
  } else if (currency === 'USD') {
    return `$${formatted}`;
  } else if (currency === 'EUR') {
    return `€${formatted}`;
  }

  return `${formatted} ${currency}`;
};

/**
 * Format number with locale-specific separators
 */
export const formatNumber = (number: number): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format compact number
 */
export const formatCompactNumber = (number: number): string => {
  if (number < 1000) return number.toString();
  if (number < 1000000) return `${(number / 1000).toFixed(1)}K`;
  return `${(number / 1000000).toFixed(1)}M`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  const units = i18n.language === 'tr' 
    ? ['B', 'KB', 'MB', 'GB', 'TB'] 
    : ['B', 'KB', 'MB', 'GB', 'TB'];

  if (bytes === 0) return `0 ${units[0]}`;

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(2)} ${units[i]}`;
};

/**
 * Format duration
 */
export const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(i18n.language === 'tr' ? `${days}g` : `${days}d`);
  }
  if (hours > 0) {
    parts.push(i18n.language === 'tr' ? `${hours}s` : `${hours}h`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(i18n.language === 'tr' ? `${minutes}dk` : `${minutes}m`);
  }

  return parts.join(' ');
};

export default {
  formatDate,
  formatShortDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatCompactNumber,
  formatFileSize,
  formatDuration,
};
