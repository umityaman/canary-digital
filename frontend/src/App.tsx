import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import { ToastContainer } from './components/Toast'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Reservations from './pages/Reservations'
import NewOrder from './pages/NewOrder'
import OrderDetail from './pages/OrderDetail'
import Inventory from './pages/Inventory'
import NewEquipment from './pages/NewEquipment'
import EquipmentDetail from './pages/EquipmentDetail'
import Customers from './pages/Customers'
import CustomerCreate from './pages/CustomerCreate'
import Calendar from './pages/Calendar'
import Documents from './pages/Documents'
import Suppliers from './pages/Suppliers'
import Accounting from './pages/Accounting'
import InvoiceDetail from './pages/InvoiceDetail'
import OfferDetail from './pages/OfferDetail'
import CreateInvoice from './pages/CreateInvoice'
import CreateOffer from './pages/CreateOffer'
import EditInvoice from './pages/EditInvoice'
import EditOffer from './pages/EditOffer'
import DeliveryNotes from './pages/DeliveryNotes'
import Social from './pages/Social'
import Website from './pages/Website'
import SiteBuilder from './pages/website/SiteBuilder'
import ContentManagement from './pages/website/ContentManagement'
import UserManagement from './pages/website/UserManagement'
import RentalManagement from './pages/website/RentalManagement'
import SEOMarketing from './pages/website/SEOMarketing'
import FinanceReports from './pages/website/FinanceReports'
import SecuritySettings from './pages/website/SecuritySettings'
import Todo from './pages/Todo'
import Messaging from './pages/Messaging'
import Meetings from './pages/Meetings'
import Tools from './pages/Tools'
import CustomerService from './pages/CustomerService'
import Production from './pages/Production'
import ProjectManagement from './pages/production/ProjectManagement'
import BudgetManagement from './pages/production/BudgetManagement'
import TeamManagement from './pages/production/TeamManagement'
import SchedulePlanning from './pages/production/SchedulePlanning'
import PostProduction from './pages/production/PostProduction'
import Contracts from './pages/production/Contracts'
import EquipmentRental from './pages/production/EquipmentRental'
import Clients from './pages/production/Clients'
import Reports from './pages/production/Reports'
import Communications from './pages/production/Communications'
import Integrations from './pages/production/Integrations'
import ProductionSettings from './pages/production/ProductionSettings'
import TechSupport from './pages/TechSupport'
import TechnicalService from './pages/TechnicalService'
import Admin from './pages/Admin'
import Inspection from './pages/Inspection'
import InspectionCreate from './pages/InspectionCreate'
import InspectionDetail from './pages/InspectionDetail'
import Settings from './pages/Settings'
import Pricing from './pages/Pricing'
import Analytics from './pages/Analytics'
import FloatingChatWidget from './components/FloatingChatWidget'
import FloatingToolsWidget from './components/FloatingToolsWidget'

export default function App(){
  const { isAuthenticated, loadUserFromStorage } = useAuthStore()

  // Load user from localStorage on mount
  useEffect(() => {
    loadUserFromStorage()
  }, [loadUserFromStorage])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <>
      <NotificationProvider>
        <ToastContainer />
        <FloatingChatWidget />
        <FloatingToolsWidget />
        <Layout>
          <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/profile' element={<Profile/>} />
          <Route path='/orders' element={<Reservations/>} />
          <Route path='/orders/new' element={<NewOrder/>} />
          <Route path='/orders/:id' element={<OrderDetail/>} />
          <Route path='/inventory' element={<Inventory/>} />
          <Route path='/inventory/new' element={<NewEquipment/>} />
          <Route path='/inventory/:id' element={<EquipmentDetail/>} />
          <Route path='/customers' element={<Customers/>} />
          <Route path='/customers/create' element={<CustomerCreate/>} />
          <Route path='/calendar' element={<Calendar/>} />
          <Route path='/documents' element={<Documents/>} />
          <Route path='/suppliers' element={<Suppliers/>} />
          <Route path='/accounting' element={<Accounting/>} />
          <Route path='/invoices/create' element={<CreateInvoice/>} />
          <Route path='/invoices/:id/edit' element={<EditInvoice/>} />
          <Route path='/invoices/:id' element={<InvoiceDetail/>} />
          <Route path='/offers/create' element={<CreateOffer/>} />
          <Route path='/offers/:id/edit' element={<EditOffer/>} />
          <Route path='/offers/:id' element={<OfferDetail/>} />
          <Route path='/delivery-notes' element={<DeliveryNotes/>} />
          <Route path='/social' element={<Social/>} />
          <Route path='/website' element={<Website/>} />
          <Route path='/website/builder' element={<SiteBuilder/>} />
          <Route path='/website/cms' element={<ContentManagement/>} />
          <Route path='/website/users' element={<UserManagement/>} />
          <Route path='/website/rental' element={<RentalManagement/>} />
          <Route path='/website/seo' element={<SEOMarketing/>} />
          <Route path='/website/finance' element={<FinanceReports/>} />
          <Route path='/website/security' element={<SecuritySettings/>} />
          <Route path='/todo' element={<Todo/>} />
          <Route path='/messaging' element={<Messaging/>} />
          <Route path='/meetings' element={<Meetings/>} />
          <Route path='/tools' element={<Tools/>} />
          <Route path='/customer-service' element={<CustomerService/>} />
          <Route path='/production' element={<Production/>} />
          <Route path='/production/projects' element={<ProjectManagement/>} />
          <Route path='/production/budget' element={<BudgetManagement/>} />
          <Route path='/production/team' element={<TeamManagement/>} />
          <Route path='/production/schedule' element={<SchedulePlanning/>} />
          <Route path='/production/post-production' element={<PostProduction/>} />
          <Route path='/production/contracts' element={<Contracts/>} />
          <Route path='/production/equipment' element={<EquipmentRental/>} />
          <Route path='/production/clients' element={<Clients/>} />
          <Route path='/production/reports' element={<Reports/>} />
          <Route path='/production/communications' element={<Communications/>} />
          <Route path='/production/integrations' element={<Integrations/>} />
          <Route path='/production/settings' element={<ProductionSettings/>} />
          <Route path='/tech-support' element={<TechSupport/>} />
          <Route path='/technical-service' element={<TechnicalService/>} />
          <Route path='/admin' element={<Admin/>} />
          <Route path='/inspection' element={<Inspection/>} />
          <Route path='/inspection/new' element={<InspectionCreate/>} />
          <Route path='/inspection/:id' element={<InspectionDetail/>} />
          <Route path='/pricing' element={<Pricing/>} />
          <Route path='/analytics' element={<Analytics/>} />
          <Route path='/settings' element={<Settings/>} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      </NotificationProvider>
    </>
  )
}
