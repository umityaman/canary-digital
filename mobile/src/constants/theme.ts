// Theme System for Mobile App
export const theme = {
  // Colors
  colors: {
    // Primary
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    
    // Secondary
    secondary: '#8B5CF6',
    secondaryLight: '#A78BFA',
    secondaryDark: '#7C3AED',
    
    // Success
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',
    
    // Warning
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',
    
    // Error
    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',
    
    // Info
    info: '#3B82F6',
    infoLight: '#60A5FA',
    infoDark: '#2563EB',
    
    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Surface
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    
    // Text
    text: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    
    // Border
    border: '#E5E7EB',
    borderFocus: '#3B82F6',
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    h5: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    h6: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    body1: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
    },
    overline: {
      fontSize: 10,
      fontWeight: '600' as const,
      lineHeight: 14,
      textTransform: 'uppercase' as const,
    },
  },
  
  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  },
  
  // Animations
  animations: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300,
    },
    timing: {
      linear: 'linear' as const,
      easeIn: 'ease-in' as const,
      easeOut: 'ease-out' as const,
      easeInOut: 'ease-in-out' as const,
    },
  },
};

// Dark theme colors (for future implementation)
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textDisabled: '#9CA3AF',
    border: '#374151',
  },
};

export type Theme = typeof theme;
