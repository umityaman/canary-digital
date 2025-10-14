import { useLocation } from 'react-router-dom'
import { 
  Home, ShoppingCart, Users, Package, Calendar as CalendarIcon, 
  FileText, Truck, Calculator, CheckSquare, User, Share2, 
  MessageSquare, Video, HelpCircle, Headphones, Film, 
  Wrench, Globe, Shield, LucideIcon
} from 'lucide-react'

interface PageInfo {
  title: string
  icon: LucideIcon
}

const pageMap: Record<string, PageInfo> = {
  '/': {
    title: 'Ana Sayfa',
    icon: Home
  },
  '/orders': {
    title: 'Siparişler',
    icon: ShoppingCart
  },
  '/customers': {
    title: 'Müşteriler',
    icon: Users
  },
  '/inventory': {
    title: 'Envanter',
    icon: Package
  },
  '/calendar': {
    title: 'Takvim',
    icon: CalendarIcon
  },
  '/documents': {
    title: 'Belgeler',
    icon: FileText
  },
  '/suppliers': {
    title: 'Tedarikçiler',
    icon: Truck
  },
  '/accounting': {
    title: 'Muhasebe',
    icon: Calculator
  },
  '/todo': {
    title: 'Yapılacaklar',
    icon: CheckSquare
  },
  '/profile': {
    title: 'Profil',
    icon: User
  },
  '/social': {
    title: 'Sosyal Medya',
    icon: Share2
  },
  '/messaging': {
    title: 'Mesajlaşma',
    icon: MessageSquare
  },
  '/meetings': {
    title: 'Toplantılar',
    icon: Video
  },
  '/tech-support': {
    title: 'Teknik Destek',
    icon: HelpCircle
  },
  '/customer-service': {
    title: 'Müşteri Hizmetleri',
    icon: Headphones
  },
  '/production': {
    title: 'Yapım & Prodüksiyon',
    icon: Film
  },
  '/tools': {
    title: 'Araçlar',
    icon: Wrench
  },
  '/technical-service': {
    title: 'Teknik Servis',
    icon: Wrench
  },
  '/website': {
    title: 'Web Sitesi',
    icon: Globe
  },
  '/admin': {
    title: 'Admin',
    icon: Shield
  }
}

export const usePageInfo = (): PageInfo => {
  const location = useLocation()
  const pathname = location.pathname

  return pageMap[pathname] || {
    title: 'Canary',
    icon: Home
  }
}
