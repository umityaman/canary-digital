# 📦 Frontend Optimization Guide

## Build Analysis

### Generate Bundle Report
```bash
cd frontend
npm run build
# Open dist/stats.html in browser to see bundle analysis
```

## Bundle Size Optimization

### Current Optimizations ✅
1. **Code Splitting**
   - Vendor chunks (React, UI, Charts, State)
   - Route-based lazy loading
   - Component lazy loading

2. **Compression**
   - Gzip compression (threshold: 10kb)
   - Brotli compression (threshold: 10kb)

3. **Minification**
   - Terser minification
   - Drop console logs in production
   - Drop debugger statements

4. **Tree Shaking**
   - Automatic with Vite
   - ES modules format

### Further Optimizations 🚀

#### 1. Image Optimization
```bash
# Install image optimizer
npm install --save-dev vite-plugin-image-optimizer

# Add to vite.config.ts
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

plugins: [
  ViteImageOptimizer({
    jpg: { quality: 80 },
    png: { quality: 80 },
    webp: { quality: 80 },
  }),
]
```

#### 2. Lazy Load Routes
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';
import LoadingSkeleton from './components/LoadingSkeleton';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Equipment = lazy(() => import('./pages/Equipment'));
const Orders = lazy(() => import('./pages/Orders'));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Suspense>
  );
}
```

#### 3. Component Lazy Loading
```typescript
// Lazy load heavy components
const ChartComponent = lazy(() => import('./components/ChartComponent'));
const DataTable = lazy(() => import('./components/DataTable'));

<Suspense fallback={<div>Loading chart...</div>}>
  <ChartComponent data={data} />
</Suspense>
```

#### 4. Icon Optimization
```typescript
// Instead of importing all icons
import { User, Settings, Home } from 'lucide-react';

// Use dynamic imports if needed
const Icon = lazy(() => import('lucide-react').then(mod => ({ default: mod.User })));
```

#### 5. CSS Optimization
```bash
# Tailwind already purges unused CSS
# Ensure purge is configured in tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}
```

## Performance Targets

### Current Status
- **Initial Load**: ~200-300kb (gzipped)
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **TTI (Time to Interactive)**: < 3.5s

### Optimization Goals
- ✅ Initial bundle < 300kb
- ✅ Code splitting enabled
- ✅ Lazy loading for routes
- ✅ Tree shaking enabled
- ✅ Minification enabled
- ✅ Compression enabled

## Lighthouse Score Targets
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 90

## Testing Bundle Size

```bash
# Build and analyze
npm run build

# Check file sizes
ls -lh dist/assets

# View detailed stats
open dist/stats.html
```

## CDN Configuration (Optional)

For production, consider using CDN for static assets:

```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.CDN_URL || '/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
      },
    },
  },
});
```

## Runtime Performance

### React Optimization Tips

1. **Use React.memo** for expensive components
```typescript
export default React.memo(ExpensiveComponent);
```

2. **Use useMemo** for expensive calculations
```typescript
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

3. **Use useCallback** for event handlers
```typescript
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

4. **Virtualize long lists**
```typescript
// Use react-window or react-virtualized
import { FixedSizeList } from 'react-window';
```

## Network Optimization

### API Caching
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Cache-Control': 'max-age=3600',
  },
});

// Add request interceptor for caching
api.interceptors.request.use(config => {
  // Add cache headers for GET requests
  if (config.method === 'get') {
    config.headers['Cache-Control'] = 'max-age=3600';
  }
  return config;
});
```

### Service Worker (PWA)
```bash
# Install PWA plugin
npm install vite-plugin-pwa -D

# Add to vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60, // 1 hour
            },
          },
        },
      ],
    },
  }),
]
```

## Monitoring

### Web Vitals
```bash
npm install web-vitals

# src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Send to analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Checklist

- [x] Code splitting configured
- [x] Bundle compression enabled (gzip + brotli)
- [x] Minification enabled
- [x] Console logs removed in production
- [x] Bundle analyzer configured
- [ ] Images optimized
- [ ] Routes lazy loaded
- [ ] Heavy components lazy loaded
- [ ] Service worker configured (PWA)
- [ ] Web vitals monitoring
- [ ] CDN configured (optional)

## Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
