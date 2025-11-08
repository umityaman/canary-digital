// ============================================
// 🎨 CANARY DESIGN SYSTEM - Design Tokens
// ============================================
// Version: 1.0.0
// Date: November 3, 2025
// Purpose: Centralized design tokens for consistent UI

export const DESIGN_TOKENS = {
  // ========== SPACING ==========
  spacing: {
    xs: {
      padding: 'p-2',
      gap: 'gap-2',
    },
    sm: {
      padding: 'p-4',
      gap: 'gap-3',
    },
    md: {
      padding: 'p-6',
      gap: 'gap-4',
    },
    lg: {
      padding: 'p-8',
      gap: 'gap-6',
    },
  },
  
  // ========== BORDER RADIUS ==========
  radius: {
    sm: 'rounded-lg',      // 8px  - Dropdown, small elements
    md: 'rounded-xl',      // 12px - Button, input, compact card
    lg: 'rounded-2xl',     // 16px - Card, container, section
    full: 'rounded-full',  // Badge, avatar, pill
  },
  
  // ========== SHADOWS ==========
  shadow: {
    none: '',
    sm: 'shadow-sm',       // Base cards (z: 0)
    md: 'shadow-md',       // Raised elements (z: 10)
    lg: 'shadow-lg',       // Dropdown, popover (z: 20)
    xl: 'shadow-xl',       // Modal, dialog (z: 50)
  },
  
  // ========== COLORS ==========
  colors: {
    // Background
    bg: {
      base: 'bg-white',
      subtle: 'bg-neutral-50',
      muted: 'bg-neutral-100',
    },
    
    // Border
    border: {
      light: 'border-neutral-200',
      dark: 'border-neutral-300',
    },
    
    // Text
    text: {
      primary: 'text-neutral-900',
      secondary: 'text-neutral-700',
      tertiary: 'text-neutral-600',
      muted: 'text-neutral-500',
    },
    
    // Interactive
    interactive: {
      default: 'bg-neutral-900 text-white',
      hover: 'hover:bg-neutral-800',
      active: 'active:bg-neutral-700',
    },
    
    // Semantic (Status)
    semantic: {
      success: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        gradient: 'bg-gradient-to-br from-green-50 to-green-100',
      },
      warning: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
        gradient: 'bg-gradient-to-br from-orange-50 to-orange-100',
      },
      error: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        gradient: 'bg-gradient-to-br from-red-50 to-red-100',
      },
      info: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        gradient: 'bg-gradient-to-br from-blue-50 to-blue-100',
      },
      neutral: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        gradient: 'bg-gradient-to-br from-neutral-50 to-neutral-100',
      },
    },
  },
  
  // ========== TYPOGRAPHY ==========
  typography: {
    // Display (Hero, Page title)
    display: {
      xl: 'text-4xl font-bold',
      lg: 'text-3xl font-bold',
      md: 'text-2xl font-bold',
    },
    
    // Heading
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-lg font-semibold',
    h4: 'text-base font-semibold',
    
    // Body
    body: {
      lg: 'text-base font-normal',
      md: 'text-sm font-normal',
      sm: 'text-xs font-normal',
    },
    
    // Label
    label: {
      lg: 'text-sm font-medium',
      md: 'text-xs font-medium',
      sm: 'text-xs font-normal',
    },
    
    // Stat/Number
    stat: {
      lg: 'text-4xl font-bold',
      md: 'text-3xl font-bold',
      sm: 'text-2xl font-bold',
    },
  },
  
  // ========== BUTTON ==========
  button: {
    base: 'inline-flex items-center justify-center gap-2 font-medium transition-colors',
    
    size: {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    },
    
    variant: {
      primary: 'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-700',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
      outline: 'bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50 active:bg-neutral-100',
      ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    },
    
    icon: {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    },
  },
  
  // ========== INPUT ==========
  input: {
    base: 'w-full border focus:outline-none focus:ring-2 focus:border-transparent transition-all',
    
    size: {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-base',
    },
    
    variant: {
      default: 'bg-white border-neutral-300 focus:ring-neutral-900',
      filled: 'bg-neutral-50 border-neutral-300 focus:ring-neutral-900',
    },
    
    state: {
      error: 'border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:ring-green-500',
      disabled: 'bg-neutral-100 text-neutral-500 cursor-not-allowed',
    },
  },
  
  // ========== CARD ==========
  card: {
    base: 'bg-white border border-neutral-200',
    
    size: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    
    elevation: {
      flat: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    },
    
    variant: {
      default: 'bg-white',
      subtle: 'bg-neutral-50',
      interactive: 'hover:shadow-lg transition-shadow cursor-pointer',
    },
  },
  
  // ========== BADGE ==========
  badge: {
    base: 'px-2 py-1 text-xs font-medium inline-flex items-center gap-1',
    
    size: {
      sm: 'px-1.5 py-0.5 text-[10px]',
      md: 'px-2 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    },
    
    variant: {
      solid: '',
      outline: 'border bg-transparent',
      subtle: 'bg-opacity-50',
    },
  },
  
  // ========== STATUS ==========
  status: {
    invoice: {
      draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
      paid: { label: 'Ödendi', color: 'bg-green-100 text-green-700' },
      partial_paid: { label: 'Kısmi Ödeme', color: 'bg-orange-100 text-orange-700' },
      cancelled: { label: 'İptal', color: 'bg-red-100 text-red-700' },
      overdue: { label: 'Vadesi Geçmiş', color: 'bg-red-100 text-red-700' },
    },
    
    offer: {
      draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-700' },
      sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
      accepted: { label: 'Kabul Edildi', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
      converted: { label: 'Faturaya Dönüştü', color: 'bg-purple-100 text-purple-700' },
      expired: { label: 'Süresi Doldu', color: 'bg-orange-100 text-orange-700' },
    },
  },
}

// ========== HELPER FUNCTIONS ==========

/**
 * Combine multiple class names, filtering out falsy values
 */
export const cx = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Build button class name with design tokens
 * @example button('md', 'primary') // Returns complete button classes
 */
export const button = (
  size: keyof typeof DESIGN_TOKENS.button.size = 'md',
  variant: keyof typeof DESIGN_TOKENS.button.variant = 'primary',
  radius: keyof typeof DESIGN_TOKENS.radius = 'md'
) => {
  return cx(
    DESIGN_TOKENS.button.base,
    DESIGN_TOKENS.button.size[size],
    DESIGN_TOKENS.button.variant[variant],
    DESIGN_TOKENS.radius[radius]
  )
}

/**
 * Build icon button class name with design tokens
 * @example iconButton('md') // Returns icon button classes
 */
export const iconButton = (
  size: keyof typeof DESIGN_TOKENS.button.icon = 'md',
  variant: 'ghost' | 'subtle' = 'ghost',
  radius: keyof typeof DESIGN_TOKENS.radius = 'md'
) => {
  const baseHover = variant === 'ghost' 
    ? 'hover:bg-neutral-100' 
    : 'hover:bg-neutral-200'
  
  return cx(
    'inline-flex items-center justify-center transition-colors',
    DESIGN_TOKENS.button.icon[size],
    baseHover,
    DESIGN_TOKENS.radius[radius]
  )
}

/**
 * Build card class name with design tokens
 * @example card('md', 'sm', 'default') // Returns complete card classes
 */
export const card = (
  size: keyof typeof DESIGN_TOKENS.card.size = 'md',
  elevation: keyof typeof DESIGN_TOKENS.card.elevation = 'sm',
  variant: keyof typeof DESIGN_TOKENS.card.variant = 'default',
  radius: keyof typeof DESIGN_TOKENS.radius = 'lg'
) => {
  return cx(
    DESIGN_TOKENS.card.base,
    DESIGN_TOKENS.card.size[size],
    DESIGN_TOKENS.card.elevation[elevation],
    DESIGN_TOKENS.card.variant[variant],
    DESIGN_TOKENS.radius[radius]
  )
}

/**
 * Build input class name with design tokens
 * @example input('md', 'default') // Returns complete input classes
 */
export const input = (
  size: keyof typeof DESIGN_TOKENS.input.size = 'md',
  variant: keyof typeof DESIGN_TOKENS.input.variant = 'default',
  state?: keyof typeof DESIGN_TOKENS.input.state,
  radius: keyof typeof DESIGN_TOKENS.radius = 'md'
) => {
  return cx(
    DESIGN_TOKENS.input.base,
    DESIGN_TOKENS.input.size[size],
    DESIGN_TOKENS.input.variant[variant],
    state && DESIGN_TOKENS.input.state[state],
    DESIGN_TOKENS.radius[radius]
  )
}

/**
 * Build badge class name with design tokens and get label
 * @example badge('paid', 'invoice') // Returns { className, label }
 */
export const badge = (
  status: string,
  type: 'invoice' | 'offer' = 'invoice',
  size: keyof typeof DESIGN_TOKENS.badge.size = 'md',
  variant: keyof typeof DESIGN_TOKENS.badge.variant = 'solid'
) => {
  const statusConfig = DESIGN_TOKENS.status[type][status as keyof typeof DESIGN_TOKENS.status.invoice]
  
  if (!statusConfig) {
    // Fallback for unknown status
    return {
      className: cx(
        DESIGN_TOKENS.badge.base,
        DESIGN_TOKENS.badge.size[size],
        DESIGN_TOKENS.badge.variant[variant],
        DESIGN_TOKENS.radius.full,
        'bg-gray-100 text-gray-700'
      ),
      label: status
    }
  }
  
  return {
    className: cx(
      DESIGN_TOKENS.badge.base,
      DESIGN_TOKENS.badge.size[size],
      DESIGN_TOKENS.badge.variant[variant],
      DESIGN_TOKENS.radius.full,
      statusConfig.color
    ),
    label: statusConfig.label
  }
}

/**
 * Get stat card gradient based on type and value
 * @example getStatGradient('profit', 1000) // Returns gradient classes
 */
export const getStatGradient = (type: 'revenue' | 'expense' | 'profit' | 'overdue', value?: number) => {
  if (type === 'revenue') return DESIGN_TOKENS?.colors?.semantic.success.gradient
  if (type === 'expense') return DESIGN_TOKENS?.colors?.semantic.error.gradient
  if (type === 'overdue') return DESIGN_TOKENS?.colors?.semantic.error.gradient
  if (type === 'profit') {
    return value && value >= 0 
      ? DESIGN_TOKENS?.colors?.semantic.info.gradient 
      : DESIGN_TOKENS?.colors?.semantic.error.gradient
  }
  return DESIGN_TOKENS?.colors?.semantic.neutral.gradient
}

/**
 * Get semantic color classes
 * @example getSemanticColor('success') // Returns success color classes
 */
export const getSemanticColor = (type: keyof typeof DESIGN_TOKENS?.colors?.semantic) => {
  return DESIGN_TOKENS?.colors?.semantic[type]
}

// Export individual tokens for direct usage
export const { spacing, radius, shadow, colors, typography } = DESIGN_TOKENS
