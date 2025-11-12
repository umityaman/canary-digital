// ============================================
// 🎨 CANARY DESIGN SYSTEM - Design Tokens
// ============================================
// Version: 1.0.0
// Date: November 3, 2025
// Purpose: Centralized design tokens for consistent UI

const DESIGN_TOKENS_RAW = {
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
  
  // ========== TABLE ==========
  table: {
    base: 'w-full',
    container: 'overflow-x-auto',
    
    header: {
      row: 'border-b border-neutral-200',
      cell: 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider',
      bg: 'bg-neutral-50',
    },
    
    body: {
      row: 'border-b border-neutral-100 hover:bg-neutral-50 transition-colors',
      cell: 'px-6 py-4 text-sm text-neutral-900',
      cellMuted: 'px-6 py-4 text-sm text-neutral-600',
    },
    
    empty: 'p-12 text-center text-neutral-600',
  },
  
  // ========== DROPDOWN ==========
  dropdown: {
    container: 'relative',
    trigger: 'inline-flex items-center justify-center transition-colors',
    
    menu: {
      base: 'absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-20',
      width: {
        sm: 'w-40',
        md: 'w-48',
        lg: 'w-56',
      },
    },
    
    item: {
      base: 'w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2',
      danger: 'text-red-600 hover:bg-red-50',
      success: 'text-green-600 hover:bg-green-50',
    },
    
    divider: 'my-1 border-t border-neutral-200',
  },
  
  // ========== STAT CARD ==========
  statCard: {
    container: 'bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all',
    
    icon: {
      wrapper: 'w-10 h-10 rounded-lg flex items-center justify-center',
      colors: {
        primary: 'bg-neutral-900 text-white',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-orange-100 text-orange-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        neutral: 'bg-neutral-100 text-neutral-700',
      },
    },
    
    value: 'text-2xl font-bold text-neutral-900 mb-1',
    label: 'text-sm font-medium text-neutral-600',
    subtitle: 'text-xs text-neutral-500 mt-1',
    
    badge: 'text-xs font-medium text-neutral-600',
  },
  
  // ========== TAB ==========
  tab: {
    container: 'flex gap-1',
    
    button: {
      base: 'px-4 py-2.5 text-sm font-medium transition-all rounded-lg',
      active: 'bg-neutral-900 text-white',
      inactive: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
    },
    
    // Vertical tabs (sidebar)
    vertical: {
      container: 'flex flex-col gap-1',
      button: {
        base: 'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg text-left',
        active: 'bg-neutral-900 text-white',
        inactive: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
      },
    },
    
    // Underline tabs
    underline: {
      container: 'flex gap-4 border-b border-neutral-200',
      button: {
        base: 'px-6 py-3 text-sm font-medium transition-colors relative',
        active: 'text-neutral-900 border-b-2 border-neutral-900 -mb-px',
        inactive: 'text-neutral-600 hover:text-neutral-900',
      },
    },
  },
  
  // ========== PAGINATION ==========
  pagination: {
    container: 'flex items-center justify-between px-6 py-4 bg-neutral-50 border-t border-neutral-200',
    info: 'text-sm text-neutral-600',
    buttons: 'flex gap-2',
  },
  
  // ========== FILTER ==========
  filter: {
    container: 'bg-white border border-neutral-200 rounded-xl p-4 shadow-sm space-y-4',
    section: 'space-y-3',
    label: 'block text-sm font-medium text-neutral-700 mb-2',
    divider: 'border-t border-neutral-200',
    actions: 'flex justify-end gap-2 pt-4',
  },
  
  // ========== MODAL ==========
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4',
    container: 'bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden',
    
    header: {
      container: 'px-6 py-4 border-b border-neutral-200 flex items-center justify-between',
      title: 'text-xl font-semibold text-neutral-900',
      close: 'text-neutral-500 hover:text-neutral-700 transition-colors',
    },
    
    body: 'px-6 py-4 overflow-y-auto',
    
    footer: {
      container: 'px-6 py-4 border-t border-neutral-200 flex justify-end gap-3',
    },
  },
  
  // ========== ALERT ==========
  alert: {
    base: 'p-4 rounded-xl flex items-start gap-3',
    
    variant: {
      success: 'bg-green-50 border border-green-200 text-green-800',
      warning: 'bg-orange-50 border border-orange-200 text-orange-800',
      error: 'bg-red-50 border border-red-200 text-red-800',
      info: 'bg-blue-50 border border-blue-200 text-blue-800',
    },
    
    icon: 'flex-shrink-0 w-5 h-5',
    content: 'flex-1',
    title: 'font-medium mb-1',
    message: 'text-sm',
  },
  
  // ========== LOADING ==========
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900',
    overlay: 'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center',
    text: 'ml-3 text-sm text-neutral-600',
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
  size: keyof typeof DESIGN_TOKENS_RAW.button.size = 'md',
  variant: keyof typeof DESIGN_TOKENS_RAW.button.variant = 'primary',
  radius: keyof typeof DESIGN_TOKENS_RAW.radius = 'md'
) => {
  return cx(
    DESIGN_TOKENS_RAW.button.base,
    DESIGN_TOKENS_RAW.button.size[size],
    DESIGN_TOKENS_RAW.button.variant[variant],
    DESIGN_TOKENS_RAW.radius[radius]
  )
}

/**
 * Build icon button class name with design tokens
 * @example iconButton('md') // Returns icon button classes
 */
export const iconButton = (
  size: keyof typeof DESIGN_TOKENS_RAW.button.icon = 'md',
  variant: 'ghost' | 'subtle' = 'ghost',
  radius: keyof typeof DESIGN_TOKENS_RAW.radius = 'md'
) => {
  const baseHover = variant === 'ghost' 
    ? 'hover:bg-neutral-100' 
    : 'hover:bg-neutral-200'
  
  return cx(
    'inline-flex items-center justify-center transition-colors',
    DESIGN_TOKENS_RAW.button.icon[size],
    baseHover,
    DESIGN_TOKENS_RAW.radius[radius]
  )
}

/**
 * Build card class name with design tokens
 * @example card('md', 'sm', 'default') // Returns complete card classes
 */
export const card = (
  size: keyof typeof DESIGN_TOKENS_RAW.card.size = 'md',
  elevation: keyof typeof DESIGN_TOKENS_RAW.card.elevation = 'sm',
  variant: keyof typeof DESIGN_TOKENS_RAW.card.variant = 'default',
  radius: keyof typeof DESIGN_TOKENS_RAW.radius = 'lg'
) => {
  return cx(
    DESIGN_TOKENS_RAW.card.base,
    DESIGN_TOKENS_RAW.card.size[size],
    DESIGN_TOKENS_RAW.card.elevation[elevation],
    DESIGN_TOKENS_RAW.card.variant[variant],
    DESIGN_TOKENS_RAW.radius[radius]
  )
}

/**
 * Build input class name with design tokens
 * @example input('md', 'default') // Returns complete input classes
 */
export const input = (
  size: keyof typeof DESIGN_TOKENS_RAW.input.size = 'md',
  variant: keyof typeof DESIGN_TOKENS_RAW.input.variant = 'default',
  state?: keyof typeof DESIGN_TOKENS_RAW.input.state,
  radius: keyof typeof DESIGN_TOKENS_RAW.radius = 'md'
) => {
  return cx(
    DESIGN_TOKENS_RAW.input.base,
    DESIGN_TOKENS_RAW.input.size[size],
    DESIGN_TOKENS_RAW.input.variant[variant],
    state && DESIGN_TOKENS_RAW.input.state[state],
    DESIGN_TOKENS_RAW.radius[radius]
  )
}

/**
 * Build badge class name with design tokens and get label
 * @example badge('paid', 'invoice') // Returns { className, label }
 */
export const badge = (
  status: string,
  type: 'invoice' | 'offer' = 'invoice',
  size: keyof typeof DESIGN_TOKENS_RAW.badge.size = 'md',
  variant: keyof typeof DESIGN_TOKENS_RAW.badge.variant = 'solid'
) => {
  const statusMap = DESIGN_TOKENS_RAW.status[type] as Record<string, { label: string; color: string }>
  const statusConfig = statusMap[status]
  
  if (!statusConfig) {
    // Fallback for unknown status
    return {
      className: cx(
        DESIGN_TOKENS_RAW.badge.base,
        DESIGN_TOKENS_RAW.badge.size[size],
        DESIGN_TOKENS_RAW.badge.variant[variant],
        DESIGN_TOKENS_RAW.radius.full,
        'bg-gray-100 text-gray-700'
      ),
      label: status
    }
  }
  
  return {
    className: cx(
      DESIGN_TOKENS_RAW.badge.base,
      DESIGN_TOKENS_RAW.badge.size[size],
      DESIGN_TOKENS_RAW.badge.variant[variant],
      DESIGN_TOKENS_RAW.radius.full,
      statusConfig.color
    ),
    label: statusConfig.label
  }
}

/**
 * Build table header cell class name
 * @example tableHeaderCell() // Returns complete table header cell classes
 */
export const tableHeaderCell = () => {
  const cell = DESIGN_TOKENS_RAW?.table?.header?.cell || 'px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider'
  const bg = DESIGN_TOKENS_RAW?.table?.header?.bg || 'bg-neutral-50'
  return cx(cell, bg)
}

/**
 * Build table body cell class name
 * @example tableBodyCell(false) // Returns complete table body cell classes
 */
export const tableBodyCell = (muted = false) => {
  if (muted) {
    return DESIGN_TOKENS_RAW?.table?.body?.cellMuted || 'px-6 py-4 text-sm text-neutral-600'
  }
  return DESIGN_TOKENS_RAW?.table?.body?.cell || 'px-6 py-4 text-sm text-neutral-900'
}

/**
 * Build stat card with icon color
 * @example statCard('success') // Returns stat card icon classes
 */
export const statCardIcon = (
  color: keyof typeof DESIGN_TOKENS_RAW.statCard.icon.colors = 'primary'
) => {
  return cx(
    DESIGN_TOKENS_RAW.statCard.icon.wrapper,
    DESIGN_TOKENS_RAW.statCard.icon.colors[color]
  )
}

/**
 * Build tab button class name
 * @example tab(true, 'horizontal') // Returns tab button classes
 */
export const tab = (
  active: boolean,
  variant: 'horizontal' | 'vertical' | 'underline' = 'horizontal'
) => {
  if (variant === 'vertical') {
    return cx(
      DESIGN_TOKENS_RAW.tab.vertical.button.base,
      active ? DESIGN_TOKENS_RAW.tab.vertical.button.active : DESIGN_TOKENS_RAW.tab.vertical.button.inactive
    )
  }
  
  if (variant === 'underline') {
    return cx(
      DESIGN_TOKENS_RAW.tab.underline.button.base,
      active ? DESIGN_TOKENS_RAW.tab.underline.button.active : DESIGN_TOKENS_RAW.tab.underline.button.inactive
    )
  }
  
  return cx(
    DESIGN_TOKENS_RAW.tab.button.base,
    active ? DESIGN_TOKENS_RAW.tab.button.active : DESIGN_TOKENS_RAW.tab.button.inactive
  )
}

/**
 * Get stat card gradient based on type and value
 * @example getStatGradient('profit', 1000) // Returns gradient classes
 */
export const getStatGradient = (type: 'revenue' | 'expense' | 'profit' | 'overdue', value?: number) => {
  if (type === 'revenue') return DESIGN_TOKENS_RAW.colors.semantic.success.gradient
  if (type === 'expense') return DESIGN_TOKENS_RAW.colors.semantic.error.gradient
  if (type === 'overdue') return DESIGN_TOKENS_RAW.colors.semantic.error.gradient
  if (type === 'profit') {
    return value && value >= 0 
      ? DESIGN_TOKENS_RAW.colors.semantic.info.gradient 
      : DESIGN_TOKENS_RAW.colors.semantic.error.gradient
  }
  return DESIGN_TOKENS_RAW.colors.semantic.neutral.gradient
}

/**
 * Get semantic color classes
 * @example getSemanticColor('success') // Returns success color classes
 */
export const getSemanticColor = (type: keyof typeof DESIGN_TOKENS_RAW.colors.semantic) => {
  return DESIGN_TOKENS_RAW.colors.semantic[type]
}

// Safe getter with fallback for undefined values
const createSafeProxy = (obj: any, fallback: string = ''): any => {
  if (typeof obj !== 'object' || obj === null) return fallback
  
  return new Proxy(obj, {
    get(target, prop) {
      const value = target[prop as keyof typeof target]
      if (value === undefined) return fallback
      if (typeof value === 'object' && value !== null) {
        return createSafeProxy(value, fallback)
      }
      return value
    }
  })
}

// Create safe proxied version
const SAFE_DESIGN_TOKENS = createSafeProxy(DESIGN_TOKENS_RAW)

// Export as DESIGN_TOKENS (the name everyone imports)
export const DESIGN_TOKENS = SAFE_DESIGN_TOKENS

// Export as default for better bundling
export default SAFE_DESIGN_TOKENS

// Export individual tokens for direct usage (with Proxy protection)
export const spacing = createSafeProxy(DESIGN_TOKENS_RAW.spacing)
export const radius = createSafeProxy(DESIGN_TOKENS_RAW.radius)
export const shadow = createSafeProxy(DESIGN_TOKENS_RAW.shadow)
export const colors = createSafeProxy(DESIGN_TOKENS_RAW.colors)
export const typography = createSafeProxy(DESIGN_TOKENS_RAW.typography)
export const tableStyles = createSafeProxy(DESIGN_TOKENS_RAW.table)
export const dropdownStyles = createSafeProxy(DESIGN_TOKENS_RAW.dropdown)
export const statCardStyles = createSafeProxy(DESIGN_TOKENS_RAW.statCard)
export const tabStyles = createSafeProxy(DESIGN_TOKENS_RAW.tab)
export const paginationStyles = createSafeProxy(DESIGN_TOKENS_RAW.pagination)
export const filterStyles = createSafeProxy(DESIGN_TOKENS_RAW.filter)
export const modalStyles = createSafeProxy(DESIGN_TOKENS_RAW.modal)
export const alertStyles = createSafeProxy(DESIGN_TOKENS_RAW.alert)
export const loadingStyles = createSafeProxy(DESIGN_TOKENS_RAW.loading)
