// Email validator
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validator (Turkish format)
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  // Turkish phone: starts with 5, 10 digits total, or 11 with leading 0
  return (cleaned.length === 10 && cleaned[0] === '5') || 
         (cleaned.length === 11 && cleaned[0] === '0' && cleaned[1] === '5');
};

// Password strength validator
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Şifre en az 6 karakter olmalıdır');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Required field validator
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// Min length validator
export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

// Max length validator
export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

// Number range validator
export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// Date validator
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Future date validator
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset time to start of day
  return date >= now;
};

// Date range validator
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// URL validator
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Positive number validator
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0;
};

// Integer validator
export const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

// QR code format validator
export const isValidQRCode = (code: string): boolean => {
  // QR code format: EQ-XXXX-XXXX (equipment code)
  const qrRegex = /^[A-Z]{2,5}-\d{4}-\d{4}$/;
  return qrRegex.test(code);
};

// Form validation helper
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export const validateField = (
  value: any,
  rules: ValidationRule[]
): { isValid: boolean; error?: string } => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return { isValid: false, error: rule.message };
    }
  }
  return { isValid: true };
};

// Reservation form validator
export const validateReservationForm = (form: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  items: any[];
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!isRequired(form.customerName)) {
    errors.customerName = 'Müşteri adı gereklidir';
  }
  
  if (!isRequired(form.customerEmail)) {
    errors.customerEmail = 'E-posta gereklidir';
  } else if (!isValidEmail(form.customerEmail)) {
    errors.customerEmail = 'Geçersiz e-posta adresi';
  }
  
  if (!isRequired(form.customerPhone)) {
    errors.customerPhone = 'Telefon numarası gereklidir';
  } else if (!isValidPhone(form.customerPhone)) {
    errors.customerPhone = 'Geçersiz telefon numarası';
  }
  
  if (!isRequired(form.startDate)) {
    errors.startDate = 'Başlangıç tarihi gereklidir';
  } else if (!isFutureDate(form.startDate)) {
    errors.startDate = 'Başlangıç tarihi bugünden önce olamaz';
  }
  
  if (!isRequired(form.endDate)) {
    errors.endDate = 'Bitiş tarihi gereklidir';
  } else if (!isValidDateRange(form.startDate, form.endDate)) {
    errors.endDate = 'Bitiş tarihi başlangıç tarihinden önce olamaz';
  }
  
  if (!form.items || form.items.length === 0) {
    errors.items = 'En az bir ekipman seçilmelidir';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
