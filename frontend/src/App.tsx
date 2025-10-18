import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import { ToastContainer } from './components/Toast'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Inventory from './pages/Inventory'
import Equipment from './pages/Equipment'
import EquipmentDetail from './pages/EquipmentDetail'
import Customers from './pages/Customers'
import Calendar from './pages/Calendar'
import Documents from './pages/Documents'
import Suppliers from './pages/Suppliers'
import Accounting from './pages/Accounting'
import Social from './pages/Social'
import SocialMedia from './pages/SocialMedia'
import Website from './pages/Website'
import Todo from './pages/Todo'
import Messaging from './pages/Messaging'
import Meetings from './pages/Meetings'
import Tools from './pages/Tools'
import CustomerService from './pages/CustomerService'
import Production from './pages/Production'
import TechSupport from './pages/TechSupport'
import TechnicalService from './pages/TechnicalService'
import Admin from './pages/Admin'
import Inspection from './pages/Inspection'
import InspectionCreate from './pages/InspectionCreate'
import InspectionDetail from './pages/InspectionDetail'
import Settings from './pages/Settings'
import Pricing from './pages/Pricing'
import Analytics from './pages/Analytics'
import PagesManagement from './pages/cms/PagesManagement'
import BlogManagement from './pages/cms/BlogManagement'
import MediaLibrary from './pages/cms/MediaLibrary'
import MenuEditor from './pages/cms/MenuEditor'
import AIChatbot from './pages/AIChatbot'

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
      <ToastContainer />
      <Layout>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/profile' element={<Profile/>} />
          <Route path='/orders' element={<Orders/>} />
          <Route path='/inventory' element={<Inventory/>} />
          <Route path='/equipment' element={<Equipment/>} />
          <Route path='/equipment/:id' element={<EquipmentDetail/>} />
          <Route path='/customers' element={<Customers/>} />
          <Route path='/calendar' element={<Calendar/>} />
          <Route path='/documents' element={<Documents/>} />
          <Route path='/suppliers' element={<Suppliers/>} />
          <Route path='/accounting' element={<Accounting/>} />
          <Route path='/social' element={<Social/>} />
          <Route path='/social-media' element={<SocialMedia/>} />
          <Route path='/website' element={<Website/>} />
          <Route path='/todo' element={<Todo/>} />
          <Route path='/messaging' element={<Messaging/>} />
          <Route path='/meetings' element={<Meetings/>} />
          <Route path='/tools' element={<Tools/>} />
          <Route path='/customer-service' element={<CustomerService/>} />
          <Route path='/production' element={<Production/>} />
          <Route path='/tech-support' element={<TechSupport/>} />
          <Route path='/technical-service' element={<TechnicalService/>} />
          <Route path='/admin' element={<Admin/>} />
          <Route path='/inspection' element={<Inspection/>} />
          <Route path='/inspection/new' element={<InspectionCreate/>} />
          <Route path='/inspection/:id' element={<InspectionDetail/>} />
          <Route path='/pricing' element={<Pricing/>} />
          <Route path='/analytics' element={<Analytics/>} />
          <Route path='/settings' element={<Settings/>} />
          <Route path='/cms/pages' element={<PagesManagement/>} />
          <Route path='/cms/blog' element={<BlogManagement/>} />
          <Route path='/cms/media' element={<MediaLibrary/>} />
          <Route path='/cms/menus' element={<MenuEditor/>} />
          <Route path='/ai-chatbot' element={<AIChatbot/>} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  )
}
