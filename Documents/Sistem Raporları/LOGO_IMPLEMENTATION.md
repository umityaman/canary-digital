# 🐤 Canary Logo Implementation

## Logo Özellikleri

### Tasarım
- **Format**: SVG (Scalable Vector Graphics)
- **Boyut**: Responsive, tüm ekranlara uyumlu
- **Renk Paleti**:
  - Primary: `#1F2937` (Neutral-900) - Kuş gövdesi
  - Accent: `#F59E0B` (Amber-500) - Gaga ve ayaklar
  - Background: White/Transparent

### Logo Kullanım Alanları

#### 1. Sidebar Logo (Normal View)
- **Boyut**: 32x32px
- **Konum**: Sol üst köşe
- **Text**: "CANARY" + "Rental Software"
- **Dosya**: `frontend/src/components/Sidebar.tsx` (line 58-71)

```tsx
<svg width="32" height="32" viewBox="0 0 100 100" fill="none">
  <!-- Canary bird SVG paths -->
</svg>
<div className="flex flex-col">
  <span className="font-bold text-lg">CANARY</span>
  <span className="text-xs text-neutral-500">Rental Software</span>
</div>
```

#### 2. Sidebar Logo (Collapsed View)
- **Boyut**: 28x28px
- **Konum**: Merkezde
- **Sadece**: SVG icon (text yok)
- **Dosya**: `frontend/src/components/Sidebar.tsx` (line 76-84)

#### 3. Login Page Logo
- **Boyut**: 48x48px
- **Konum**: Sayfa üst-orta
- **Text**: "CANARY" + "RENTAL SOFTWARE"
- **Dosya**: `frontend/src/pages/Login.tsx` (line 45-55)

```tsx
<svg width="48" height="48" viewBox="0 0 100 100">
  <!-- Canary bird SVG -->
</svg>
<div className="flex flex-col">
  <span className="font-bold text-2xl">CANARY</span>
  <span className="text-sm text-neutral-500">RENTAL SOFTWARE</span>
</div>
```

#### 4. Browser Favicon
- **Boyut**: Auto-scaled by browser
- **Format**: SVG (native support)
- **Dosya**: `frontend/public/logo.svg`
- **HTML**: `frontend/index.html` (line 5)

```html
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

#### 5. Standalone SVG File
- **Boyut**: 200x200px (original)
- **Kullanım**: Raporlar, dökümanlarda kullanım için
- **Dosya**: `frontend/public/logo.svg`

## SVG Anatomisi

```
Canary Bird Components:
├── Body (Main outline)
│   └── Stroke: 6-8px, color: #1F2937
├── Eye (Circle)
│   └── Radius: 3-5px, fill: #1F2937
├── Beak (Triangle/Path)
│   └── Stroke: 5-6px, color: #F59E0B
├── Wing (Detail lines)
│   └── Stroke: 4px, color: #1F2937
├── Tail (Feathers)
│   └── Stroke: 6-8px, color: #1F2937
├── Feet (Left + Right)
│   └── Stroke: 5-6px, color: #F59E0B
└── Perch (Horizontal line)
    └── Stroke: 5-6px, color: #1F2937
```

## Responsive Davranış

### Desktop (>1024px)
- Sidebar expanded: Logo + "CANARY" text + subtitle
- Full logo visibility

### Tablet (640px - 1024px)
- Sidebar expanded: Logo + text
- Full features

### Mobile (<640px)
- Sidebar hidden (`hidden md:block`)
- Logo görünmez (sidebar kapalı)
- Login page'de tam logo görünür

## Renk Sistemi

### Dark Mode Support
- Background: White → Transparent
- Stroke colors remain consistent
- Text: Adapts to theme

### Brand Colors
```css
--canary-primary: #1F2937;    /* Neutral-900 */
--canary-accent: #F59E0B;     /* Amber-500 */
--canary-text: #6B7280;       /* Neutral-500 */
--canary-bg: #FFFFFF;         /* White */
```

## Dosya Yapısı

```
project/
├── frontend/
│   ├── public/
│   │   └── logo.svg                    # Standalone logo file (200x200)
│   ├── index.html                      # Favicon reference
│   └── src/
│       ├── components/
│       │   └── Sidebar.tsx             # Sidebar logos (32px, 28px)
│       └── pages/
│           └── Login.tsx               # Login logo (48px)
├── docs/
│   └── logo.png                        # PNG version for README
└── README.md                           # Logo display in header
```

## Güncelleme Notları

**Date**: October 13, 2025

### Yapılan Değişiklikler:
1. ✅ Gradient badge → SVG Canary bird logo
2. ✅ Sidebar logo implementation (normal + collapsed)
3. ✅ Login page logo redesign
4. ✅ Favicon update (SVG format)
5. ✅ README header logo section
6. ✅ Brand consistency across all pages

### Önceki Durum:
```tsx
// OLD - Gradient Badge
<div className="w-8 h-8 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-lg">
  <span className="text-white font-bold">C</span>
</div>
```

### Yeni Durum:
```tsx
// NEW - SVG Canary Bird
<svg width="32" height="32" viewBox="0 0 100 100">
  <path d="M45 15C45 15..." stroke="#1F2937" />
  <circle cx="60" cy="25" r="3" fill="#1F2937" />
  <!-- Complete bird illustration -->
</svg>
```

## Bakım Notları

### Logo Güncellemesi İçin:
1. `frontend/public/logo.svg` dosyasını düzenle
2. Sidebar'daki inline SVG'leri güncelle (`Sidebar.tsx`)
3. Login page SVG'sini güncelle (`Login.tsx`)
4. Browser cache'ini temizle: `Ctrl+F5`

### Yeni Logo Varyantları:
- Monochrome version için tüm `stroke` renkleri tek renge çevir
- Colored version için accent renkler ekle
- Simplified version için detay çizgilerini kaldır

## Lisans

Logo, Canary Rental Software'in tescilli markasıdır.
Kullanım izni gerektirir.

---

**Last Updated**: October 13, 2025
**Version**: 2.0
**Status**: ✅ Production Ready
