<div align="center">
  <img src="./docs/logo.png" alt="Canary Logo" width="200"/>
  
  # 🐤 Canary Rental Software
  
  **Professional Camera & Equipment Rental Management System**
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
  
</div>

---

## 🚀 HIZLI BAŞLATMA (TEK KOMUT)

### Otomatik Script ile (ÖNERİLİR) ⭐
```batch
# Her şeyi otomatik başlat
start-dev.bat

# Sunucuları durdur
stop-dev.bat

# Hızlı restart
restart-dev.bat
```

### Docker ile (Gelecek için hazır) 🐳
```powershell
# Docker Desktop kurduktan sonra
docker-compose up --build
```

## 📋 ÖZELLIKLER

✅ **Tamamlanan Modüller:**
- 🔐 Authentication (Login/Register) 
- 🏠 **Advanced Dashboard** (4 Chart Types, Date Range, Export)
- 📦 Equipment Management
- 👥 Customer Management  
- 📋 Order Management
- 🔍 Inspection System (Photos, Signatures, Damage Reports)
- 📱 **Mobile QR/Barcode Scanner** (Multi-format, Real-time)
- 📧 **Email Automation System** (11 Templates, Cron Jobs)
- 💬 **WhatsApp Integration** (Twilio API, Auto-messaging)
- 🧾 **Invoice Templates** (3 Professional PDF Designs)
- 🚚 Supplier Management

🔧 **Teknoloji Stack:**
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + Prisma + PostgreSQL
- Mobile: React Native + Expo (SDK 49)
- Charts: Chart.js + react-chartjs-2
---

## 🔒 Security Features

- ✅ JWT with refresh tokens
- ✅ Helmet.js security headers
- ✅ Rate limiting (tiered: general, auth, registration)
- ✅ CORS with whitelist
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection

---

## 🌟 Key Highlights

### Mobile App
- **QR/Barcode Scanner** with 7 format support (QR, EAN-13/8, Code 128/39, UPC-E, PDF417)
- **Camera Integration** for inspection photos (max 10, auto-optimized to 1200px)
- **Offline-first architecture** with sync queue
- **Push notifications** with Expo
- **Advanced search & filters** with debouncing
- **Error boundaries** for crash prevention
- **Loading skeletons** for better UX
- **Performance optimizations** (OptimizedFlatList, memoization)
- **8+ custom hooks** for reusable logic

### Web Frontend
- **Real-time dashboard** with live statistics
- **Notification system** (panel + urgent banners)
- **Dark mode support**
- **Responsive design** (mobile, tablet, desktop)
- **Toast notifications** for user feedback
- **Global search** functionality

### Backend
- **RESTful API** with 60+ endpoints
- **Swagger/OpenAPI docs** at `/api-docs`
- **Multi-channel notifications** (email, SMS, push, in-app, **WhatsApp**)
- **WhatsApp Integration** with Twilio (10 message templates, auto-send on orders)
- **Smart pricing rules** with dynamic calculation
- **QR/Barcode scanning** with 7 format support (QR, EAN-13/8, Code 128/39, UPC-E, PDF417)
- **Email automation** with 11 Handlebars templates + cron schedulers
- **Google Calendar** & **Booqable** integrations
- **Comprehensive logging** & error handling

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

### Mobile (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npx prisma generate
npm run dev
```

### Frontend build fails
```bash
cd frontend
npm cache clean --force
rm -rf node_modules
npm install
npm run dev
```

### Mobile app can't connect
- Ensure backend is running on `http://localhost:3000`
- For physical device: Update API URL to your computer's IP
- Check firewall settings

### Database issues
```bash
cd backend
npx prisma migrate reset
npx prisma db push
npx prisma db seed
```

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Team

- **Project:** CANARY Equipment Rental Management
- **Status:** ✅ Production Ready
- **Version:** 1.0.0
- **Last Updated:** October 13, 2025

---

## 🎉 What's Next?

Now that the project is 100% complete:

1. ✅ **Deploy to production** - See [DEPLOYMENT.md](./DEPLOYMENT.md)
2. ✅ **Test thoroughly** - See [TESTING.md](./TESTING.md)
3. ✅ **Monitor performance** - Setup Sentry, analytics
4. ✅ **Gather feedback** - User acceptance testing
5. ✅ **Iterate & improve** - Based on real-world usage

---

<div align="center">
  
  ### 🚀 CANARY is Production Ready! 🎊
  
  **Start building your equipment rental empire today!**
  
  [Documentation](./PROJECT_COMPLETE_SUMMARY.md) • [Testing Guide](./TESTING.md) • [Deployment](./DEPLOYMENT.md) • [API Docs](http://localhost:3000/api-docs)
  
  Made with ❤️ by the CANARY Team
  
</div> 
