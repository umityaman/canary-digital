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
 * Format short date (DD/MM/YYYY or MM/DD/YYYY)
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
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  // Seconds
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  // Minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  // Hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  // Days
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 7) {
    return rtf.format(-diffInDays, 'day');
  }

  // Weeks
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (Math.abs(diffInWeeks) < 4) {
    return rtf.format(-diffInWeeks, 'week');
  }

  // Months
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  // Years
  const diffInYears = Math.floor(diffInDays / 365);
  return rtf.format(-diffInYears, 'year');
};

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'TRY',
  options?: Intl.NumberFormatOptions
): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat(locale, defaultOptions).format(amount);
};

/**
 * Format number with locale-specific separators
 */
export const formatNumber = (
  number: number,
  options?: Intl.NumberFormatOptions
): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  
  return new Intl.NumberFormat(locale, options).format(number);
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Format compact number (e.g., 1.2K, 3.5M)
 */
export const formatCompactNumber = (number: number): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
};

/**
 * Parse date from locale-specific string
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Get current locale
 */
export const getCurrentLocale = (): string => {
  return i18n.language === 'tr' ? 'tr-TR' : 'en-US';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const units = i18n.language === 'tr' 
    ? ['B', 'KB', 'MB', 'GB', 'TB'] 
    : ['B', 'KB', 'MB', 'GB', 'TB'];

  if (bytes === 0) return `0 ${units[0]}`;

  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} ${units[i]}`;
};

/**
 * Format duration (e.g., "2h 30m", "1d 5h")
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

/**
 * Get localized month names
 */
export const getMonthNames = (format: 'long' | 'short' = 'long'): string[] => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const formatter = new Intl.DateTimeFormat(locale, { month: format });

  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return formatter.format(date);
  });
};

/**
 * Get localized day names
 */
export const getDayNames = (format: 'long' | 'short' = 'long'): string[] => {
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format });

  return Array.from({ length: 7 }, (_, i) => {
    // Start from Sunday
    const date = new Date(2024, 0, i);
    return formatter.format(date);
  });
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
  parseDate,
  getCurrentLocale,
  formatFileSize,
  formatDuration,
  getMonthNames,
  getDayNames,
};
