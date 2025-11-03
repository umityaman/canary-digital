# 🎨 MUHASEBE SAYFASI TASARIM ANALİZİ VE TUTARSIZLIKLAR
**Tarih:** 3 Kasım 2025  
**Dosya:** `frontend/src/pages/Accounting.tsx`  
**Durum:** 🔴 Tasarım Bütünlüğü Yok - Acil İyileştirme Gerekli

---

## 🚨 TESPİT EDİLEN TASARIM SORUNLARI

### 1. ❌ Border Radius Tutarsızlıkları

**Farklı Kullanılan Değerler:**
```css
rounded          /* 4px - Bazı yerlerde */
rounded-lg       /* 8px - Dropdown'larda */
rounded-xl       /* 12px - Butonlarda, inputlarda */
rounded-2xl      /* 16px - Kartlarda */
rounded-full     /* Badge'lerde */
```

**Sorun:** Aynı tip elementlerde farklı border-radius kullanılıyor!

**Örnekler:**
- ✅ Stat kartları: `rounded-2xl` (doğru)
- ❌ Sidebar nav: `rounded-lg` (tutarsız, `rounded-xl` olmalı)
- ❌ Modal backdrop: `rounded` (tutarsız)
- ✅ Butonlar: `rounded-xl` (doğru)
- ❌ Bazı inputlar: `rounded-lg` (tutarsız, `rounded-xl` olmalı)

**Çözüm Önerisi:**
```typescript
// Design tokens - Consistent border radius
const BORDER_RADIUS = {
  sm: 'rounded-lg',      // 8px  - Dropdown, popover
  md: 'rounded-xl',      // 12px - Button, input, small card
  lg: 'rounded-2xl',     // 16px - Card, container
  full: 'rounded-full'   // Badge, avatar, pill
}
```

---

### 2. ❌ Shadow Tutarsızlıkları

**Farklı Kullanılan Değerler:**
```css
shadow-sm        /* Kartlarda */
shadow-lg        /* Dropdown'larda */
shadow-xl        /* Bazı modal'larda */
hover:shadow-lg  /* Hover effects */
```

**Sorun:** Shadow hierarchy belirsiz, hangi element ne kadar yüksekte olmalı belli değil!

**Örnekler:**
- ✅ Kartlar: `shadow-sm` (doğru - base level)
- ❌ Dropdown: `shadow-lg` bazen `shadow-xl` (tutarsız)
- ❌ Modal: Bazen shadow yok! (hata)
- ✅ Hover effect: `hover:shadow-lg` (doğru)

**Çözüm Önerisi:**
```typescript
// Design tokens - Shadow hierarchy
const SHADOWS = {
  none: '',                    // Flat elements
  sm: 'shadow-sm',            // Base cards (z-index: 0)
  md: 'shadow-md',            // Raised cards (z-index: 10)
  lg: 'shadow-lg',            // Dropdown, popover (z-index: 20)
  xl: 'shadow-xl',            // Modal, dialog (z-index: 50)
  '2xl': 'shadow-2xl',        // Drawer, overlay (z-index: 100)
}
```

---

### 3. ❌ Spacing Tutarsızlıkları

**Farklı Kullanılan Değerler:**
```css
gap-2    /* 8px - Bazı yerlerde */
gap-3    /* 12px - Bazı yerlerde */
gap-4    /* 16px - Çoğu yerde */
gap-6    /* 24px - Bazı yerlerde */

p-3      /* 12px - Bazı kartlarda */
p-4      /* 16px - Bazı kartlarda */
p-6      /* 24px - Çoğu kartlarda */
p-8      /* 32px - Bazı kartlarda */
```

**Sorun:** Aynı seviyedeki elementlerde farklı padding/gap kullanılıyor!

**Örnekler:**
- ❌ Stat kartları: `p-6` (24px)
- ❌ İçerik alanı: `p-8` (32px)
- ❌ Bazı kartlar: `p-4` (16px)
- ❌ Keyboard shortcuts: `p-3` (12px)

**Çözüm Önerisi:**
```typescript
// Design tokens - Consistent spacing
const SPACING = {
  xs: 'p-2 gap-2',    // 8px  - Compact, tight
  sm: 'p-4 gap-3',    // 12px - Small cards
  md: 'p-6 gap-4',    // 16px - Default cards
  lg: 'p-8 gap-6',    // 24px - Large sections
}
```

---

### 4. ❌ Color Palette Tutarsızlıkları

**Kullanılan Renkler:**
```css
/* Neutral Shades - TOO MANY! */
neutral-50
neutral-100
neutral-200
neutral-300    /* Kullanılmıyor? */
neutral-400    /* Kullanılmıyor? */
neutral-500
neutral-600
neutral-700
neutral-800
neutral-900

/* Background colors - Tutarsız */
bg-white       /* Çoğu yerde */
bg-neutral-50  /* Bazı yerlerde */
bg-gray-50     /* FARKLI GRI! */

/* Border colors - Tutarsız */
border-neutral-200  /* Çoğu yerde */
border-neutral-300  /* Bazı yerlerde */
border-gray-200     /* FARKLI GRI! */
```

**Sorun:** Neutral ve Gray karışık kullanılıyor! Hangi tonun ne için olduğu belirsiz!

**Örnekler:**
- ❌ `bg-gray-50` ve `bg-neutral-50` AYNI ANDA kullanılıyor
- ❌ `border-gray-200` ve `border-neutral-200` karışık
- ❌ 10 farklı neutral ton ama sadece 5-6'sı kullanılıyor

**Çözüm Önerisi:**
```typescript
// Design tokens - Simplified color palette
const COLORS = {
  // Background
  bg: {
    base: 'bg-white',           // Ana background
    subtle: 'bg-neutral-50',    // Hover, subtle areas
    muted: 'bg-neutral-100',    // Disabled, muted
  },
  
  // Border
  border: {
    light: 'border-neutral-200',   // Default borders
    dark: 'border-neutral-300',    // Emphasized borders
  },
  
  // Text
  text: {
    primary: 'text-neutral-900',   // Headlines, important
    secondary: 'text-neutral-700', // Body text
    tertiary: 'text-neutral-600',  // Supporting text
    muted: 'text-neutral-500',     // Placeholder, disabled
  },
  
  // Interactive
  interactive: {
    default: 'bg-neutral-900',
    hover: 'bg-neutral-800',
    active: 'bg-neutral-700',
  }
}
```

---

### 5. ❌ Typography Tutarsızlıkları

**Kullanılan Font Sizes:**
```css
text-xs      /* 12px - Çok fazla kullanılıyor */
text-sm      /* 14px - En çok kullanılan */
text-base    /* 16px - Bazen */
text-lg      /* 18px - Başlıklarda */
text-xl      /* 20px - Bazı başlıklarda */
text-2xl     /* 24px - Ana başlıklarda */
text-3xl     /* 30px - Sayılarda */

/* Font Weights - Tutarsız */
font-normal   /* 400 */
font-medium   /* 500 - EN ÇOK */
font-semibold /* 600 - Başlıklarda */
font-bold     /* 700 - Bazı sayılarda */
```

**Sorun:** Hierarchy belirsiz, hangi font size ne için kullanılmalı belli değil!

**Örnekler:**
- ❌ Stat kartları başlık: `text-sm font-medium`
- ❌ Stat kartları değer: `text-3xl font-bold`
- ❌ Tab label: `text-sm font-medium`
- ❌ Bazı başlıklar: `text-lg font-semibold`
- ❌ Bazı başlıklar: `text-2xl font-bold`

**Çözüm Önerisi:**
```typescript
// Design tokens - Typography hierarchy
const TYPOGRAPHY = {
  // Display
  display: {
    xl: 'text-4xl font-bold',      // Hero
    lg: 'text-3xl font-bold',      // Page title
    md: 'text-2xl font-bold',      // Section title
  },
  
  // Heading
  h1: 'text-2xl font-bold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  
  // Body
  body: {
    lg: 'text-base font-normal',   // Large body
    md: 'text-sm font-normal',     // Default body
    sm: 'text-xs font-normal',     // Small body
  },
  
  // Label
  label: {
    lg: 'text-sm font-medium',
    md: 'text-xs font-medium',
    sm: 'text-xs font-normal',
  },
  
  // Number/Stat
  stat: {
    lg: 'text-4xl font-bold',
    md: 'text-3xl font-bold',
    sm: 'text-2xl font-bold',
  }
}
```

---

### 6. ❌ Button Style Tutarsızlıkları

**Farklı Button Stilleri:**
```tsx
// Primary button - EN AZ 3 FARKLI STYLE!
className="px-4 py-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800"
className="px-6 py-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800"
className="bg-neutral-900 text-white py-2 rounded-xl hover:bg-neutral-800"

// Secondary button - 2 FARKLI STYLE!
className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200"
className="bg-white border border-neutral-300 px-4 py-2 rounded-xl hover:bg-neutral-50"

// Icon button - STYLE YOK, inline class!
className="p-2 hover:bg-neutral-100 rounded-lg"
```

**Sorun:** Aynı tip butonlar farklı padding, farklı border-radius kullanıyor!

**Örnekler:**
- ❌ "Yeni Fatura" butonu: `px-4 py-2`
- ❌ "Gönder" butonu: `px-6 py-3`
- ❌ "Ara" butonu: `py-2` (px yok!)
- ❌ Icon butonlar: `p-2` bazen `p-1`

**Çözüm Önerisi:**
```typescript
// Design tokens - Button variants
const BUTTON = {
  // Size
  size: {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  },
  
  // Variant
  variant: {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
    outline: 'bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-50',
    ghost: 'bg-transparent text-neutral-900 hover:bg-neutral-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  },
  
  // Icon button
  icon: {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  },
  
  // Base
  base: 'rounded-xl font-medium transition-colors inline-flex items-center justify-center gap-2'
}

// Usage:
<button className={`${BUTTON.base} ${BUTTON.size.md} ${BUTTON.variant.primary}`}>
  Yeni Fatura
</button>
```

---

### 7. ❌ Input Style Tutarsızlıkları

**Farklı Input Stilleri:**
```tsx
// Text input - EN AZ 3 FARKLI STYLE!
className="w-full border border-neutral-300 rounded-xl px-4 py-2"
className="border border-neutral-300 rounded-lg px-3 py-2"
className="w-full px-4 py-2 border border-neutral-300 rounded-xl"

// Select/Dropdown - 2 FARKLI STYLE!
className="border border-neutral-300 rounded-xl px-4 py-2"
className="px-3 py-2 border border-neutral-300 rounded-lg"
```

**Sorun:** Aynı input elementleri farklı padding, farklı border-radius!

**Çözüm Önerisi:**
```typescript
// Design tokens - Input variants
const INPUT = {
  base: 'w-full border border-neutral-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all',
  
  size: {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  },
  
  variant: {
    default: 'bg-white',
    filled: 'bg-neutral-50',
  },
  
  state: {
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
    disabled: 'bg-neutral-100 text-neutral-500 cursor-not-allowed',
  }
}
```

---

### 8. ❌ Card Style Tutarsızlıkları

**Farklı Card Stilleri:**
```tsx
// Stat cards - 1 STYLE
className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6"

// Content cards - 2 FARKLI STYLE!
className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6"

// Small cards - 3 FARKLI STYLE!
className="bg-white rounded-xl p-4 border border-neutral-200"
className="bg-neutral-50 rounded-xl p-4"
className="bg-white p-4 border border-neutral-200 rounded-lg"
```

**Sorun:** Kartlar inconsistent, bazen `rounded-xl`, bazen `rounded-2xl`, bazen `shadow-sm` var, bazen yok!

**Çözüm Önerisi:**
```typescript
// Design tokens - Card variants
const CARD = {
  base: 'bg-white border border-neutral-200',
  
  size: {
    sm: 'p-4 rounded-xl',
    md: 'p-6 rounded-2xl',
    lg: 'p-8 rounded-2xl',
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
  }
}

// Usage:
<div className={`${CARD.base} ${CARD.size.md} ${CARD.elevation.sm}`}>
  Content
</div>
```

---

### 9. ❌ Status Badge Tutarsızlıkları

**Farklı Badge Stilleri:**
```tsx
// AYNI COMPONENT İÇİNDE 2 FARKLI STYLE!

// getStatusBadge fonksiyonu - 1. style
return { 
  label: '...', 
  color: 'bg-green-100 text-green-700'  // Sadece bg + text
}

// getOfferStatusBadge fonksiyonu - 2. style (AYNI!)
return { 
  label: '...', 
  color: 'bg-blue-100 text-blue-700'
}

// Render:
<span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
  {badge.label}
</span>
```

**Sorun:** Badge style'ları doğru ANCAK renk seçimleri tutarsız!

**Renk Tutarsızlıkları:**
- ✅ `draft`: gray (doğru)
- ✅ `sent`: blue (doğru)
- ✅ `paid`: green (doğru)
- ❌ `partial_paid`: yellow (turuncu olmalı - uyarı)
- ✅ `cancelled`: red (doğru)
- ❌ `overdue`: orange (doğru AMA kod tutarsız)

**Çözüm Önerisi:**
```typescript
// Design tokens - Status colors
const STATUS_COLORS = {
  // Semantic colors
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  
  // Status-specific (invoice)
  invoice: {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-orange-100 text-orange-700',  // TUTARLI: orange
    cancelled: 'bg-red-100 text-red-700',
    overdue: 'bg-red-100 text-red-700',        // TUTARLI: red (urgent)
  },
  
  // Status-specific (offer)
  offer: {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    converted: 'bg-purple-100 text-purple-700',
    expired: 'bg-orange-100 text-orange-700',
  }
}

// Badge base style
const BADGE = {
  base: 'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1',
  
  // Variant
  variant: {
    solid: '',  // Default
    outline: 'border bg-transparent',
    subtle: 'bg-opacity-50',
  },
  
  // Size
  size: {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }
}
```

---

### 10. ❌ Gradient Tutarsızlıkları

**Kullanılan Gradient'ler:**
```css
/* Stat cards - HER KART FARKLI RENK! */
from-green-50 to-green-100     /* Gelir */
from-red-50 to-red-100         /* Gider */
from-blue-50 to-blue-100       /* Net Kâr (bazen) */
from-purple-50 to-purple-100   /* Net Kâr (bazen) */
from-orange-50 to-orange-100   /* Vade Geçmiş */

/* Tools/Advisor cards - DAHA FAZLA RENK! */
from-blue-50 to-blue-100
from-green-50 to-green-100
from-purple-50 to-purple-100
from-orange-50 to-orange-100
```

**Sorun:** Gradient kullanımı tutarlı değil, renk seçimleri semantic değil!

**Semantic Sorunlar:**
- ✅ Gelir = yeşil (doğru)
- ✅ Gider = kırmızı (doğru)
- ❌ Net Kâr = mavi VEYA mor? (tutarsız, yeşil veya kırmızı olmalı - pozitif/negatif)
- ❌ Vade Geçmiş = turuncu (doğru AMA kırmızı olmalı - urgent!)

**Çözüm Önerisi:**
```typescript
// Design tokens - Semantic gradients
const GRADIENT = {
  // Financial
  revenue: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
  expense: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
  profit: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
  loss: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
  
  // Status
  success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
  warning: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
  error: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
  info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
  neutral: 'bg-gradient-to-br from-neutral-50 to-neutral-100 border-neutral-200',
}

// Usage with semantic logic:
const getStatGradient = (type: string, value: number) => {
  if (type === 'revenue') return GRADIENT.revenue
  if (type === 'expense') return GRADIENT.expense
  if (type === 'profit') return value >= 0 ? GRADIENT.profit : GRADIENT.loss
  if (type === 'overdue') return GRADIENT.error  // URGENT!
  return GRADIENT.neutral
}
```

---

## 🎯 ÖNERİLEN TASARIM SİSTEMİ

### Design Tokens (Tek Kaynak)

```typescript
// ============================================
// 🎨 CANARY DESIGN SYSTEM - Accounting Module
// ============================================

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

// Combine classes
export const cx = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Button builder
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

// Card builder
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

// Input builder
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

// Badge builder
export const badge = (
  status: keyof typeof DESIGN_TOKENS.status.invoice | keyof typeof DESIGN_TOKENS.status.offer,
  type: 'invoice' | 'offer' = 'invoice',
  size: keyof typeof DESIGN_TOKENS.badge.size = 'md',
  variant: keyof typeof DESIGN_TOKENS.badge.variant = 'solid'
) => {
  const statusConfig = DESIGN_TOKENS.status[type][status as any]
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
```

---

## 📋 UYGULAMA PLANI

### Phase 1: Design Tokens Oluşturma (2 saat)
1. `frontend/src/styles/design-tokens.ts` dosyası oluştur
2. Yukarıdaki DESIGN_TOKENS'ı kopyala
3. Export et
4. Test et (bir component'te dene)

### Phase 2: Accounting.tsx Refactor (4-6 saat)
1. Design tokens import et
2. Tüm hardcoded classları token'larla değiştir
3. Helper fonksiyonları kullan (button(), card(), input(), badge())
4. Tutarlılığı sağla

### Phase 3: Alt Component'leri Güncelle (4-6 saat)
1. IncomeTab, ExpenseTab, vb. componentlerde tokens kullan
2. Tutarlılığı kontrol et
3. Responsive testi yap

### Phase 4: Documentation (2 saat)
1. Storybook setup (opsiyonel)
2. Design system guide oluştur
3. Usage examples ekle

**Toplam Tahmini Süre:** 12-16 saat (2 iş günü)

---

## 🎯 SONUÇ VE DEĞERLENDİRME

### Mevcut Durum: 3/10 ⭐

**Sorunlar:**
- ❌ Border radius: 5 farklı değer
- ❌ Shadow: 4 farklı değer, tutarsız kullanım
- ❌ Spacing: 8+ farklı değer
- ❌ Colors: Gray ve Neutral karışık
- ❌ Typography: Hierarchy belirsiz
- ❌ Buttons: 3+ farklı style
- ❌ Inputs: 3+ farklı style
- ❌ Cards: 3+ farklı style
- ❌ Badges: Renk seçimi tutarsız
- ❌ Gradients: Semantic değil

### Hedef Durum: 9/10 ⭐

**Çözümler:**
- ✅ Design tokens tek kaynak
- ✅ Helper functions kullanımı
- ✅ Semantic color system
- ✅ Typography hierarchy
- ✅ Consistent spacing
- ✅ Unified component styles
- ✅ Status color logic
- ✅ Maintainable & scalable

---

**📅 Rapor Tarihi:** November 3, 2025  
**👤 Hazırlayan:** GitHub Copilot  
**🎨 Durum:** Design System Required  
**📊 Öncelik:** HIGH - Kullanıcı deneyimi etkileniyor  
**⏱️ Tahmini Süre:** 12-16 saat (2 iş günü)
