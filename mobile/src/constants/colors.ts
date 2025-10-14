// Color palette
export const colors = {
  // Primary colors
  primary: '#3b82f6',      // Blue-500
  primaryDark: '#2563eb',  // Blue-600
  primaryLight: '#60a5fa', // Blue-400
  
  // Secondary colors
  secondary: '#8b5cf6',    // Purple-500
  secondaryDark: '#7c3aed',// Purple-600
  secondaryLight: '#a78bfa',// Purple-400
  
  // Status colors
  success: '#10b981',      // Green-500
  warning: '#f59e0b',      // Yellow-500
  error: '#ef4444',        // Red-500
  info: '#06b6d4',         // Cyan-500
  
  // Neutral colors
  background: '#f9fafb',   // Gray-50
  surface: '#ffffff',      // White
  surfaceVariant: '#f3f4f6',// Gray-100
  
  // Text colors
  text: '#1f2937',         // Gray-800
  textSecondary: '#6b7280',// Gray-500
  textDisabled: '#9ca3af', // Gray-400
  textOnPrimary: '#ffffff',// White
  
  // Border colors
  border: '#e5e7eb',       // Gray-200
  borderDark: '#d1d5db',   // Gray-300
  
  // Special
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Status color mappings
export const statusColors = {
  PENDING: colors.warning,
  CONFIRMED: colors.info,
  IN_PROGRESS: colors.primary,
  COMPLETED: colors.success,
  CANCELLED: colors.error,
};

// Equipment category colors
export const categoryColors = {
  'Kamera': '#ef4444',     // Red
  'Lens': '#f59e0b',       // Orange
  'Işık': '#eab308',       // Yellow
  'Ses': '#10b981',        // Green
  'Tripod': '#06b6d4',     // Cyan
  'Drone': '#3b82f6',      // Blue
  'Gimbal': '#8b5cf6',     // Purple
  'Aksesuar': '#ec4899',   // Pink
  default: colors.textSecondary,
};
