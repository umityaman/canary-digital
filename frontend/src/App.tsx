import { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import { ToastContainer } from './components/Toast'
import FloatingChatWidget from './components/FloatingChatWidget'
import FloatingToolsWidget from './components/FloatingToolsWidget'

const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Reservations = lazy(() => import('./pages/Reservations'))
const NewOrder = lazy(() => import('./pages/NewOrder'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Inventory = lazy(() => import('./pages/Inventory'))
const NewEquipment = lazy(() => import('./pages/NewEquipment'))
const EquipmentDetail = lazy(() => import('./pages/EquipmentDetail'))
const Customers = lazy(() => import('./pages/Customers'))
const CustomerCreate = lazy(() => import('./pages/CustomerCreate'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Documents = lazy(() => import('./pages/Documents'))
const Suppliers = lazy(() => import('./pages/Suppliers'))
const Accounting = lazy(() => import('./pages/Accounting'))
const InvoiceForm = lazy(() => import('./pages/InvoiceForm'))
const QuoteForm = lazy(() => import('./pages/QuoteForm'))
const AccountCardList = lazy(() => import('./pages/AccountCardList'))
const AccountCardDetail = lazy(() => import('./pages/AccountCardDetail'))
const Social = lazy(() => import('./pages/Social'))
const Website = lazy(() => import('./pages/Website'))
const SiteBuilder = lazy(() => import('./pages/website/SiteBuilder'))
const ContentManagement = lazy(() => import('./pages/website/ContentManagement'))
const UserManagement = lazy(() => import('./pages/website/UserManagement'))
const RentalManagement = lazy(() => import('./pages/website/RentalManagement'))
const SEOMarketing = lazy(() => import('./pages/website/SEOMarketing'))
const FinanceReports = lazy(() => import('./pages/website/FinanceReports'))
const SecuritySettings = lazy(() => import('./pages/website/SecuritySettings'))
const Todo = lazy(() => import('./pages/Todo'))
const Messaging = lazy(() => import('./pages/Messaging'))
const Meetings = lazy(() => import('./pages/Meetings'))
const Tools = lazy(() => import('./pages/Tools'))
const CustomerService = lazy(() => import('./pages/CustomerService'))
const Production = lazy(() => import('./pages/Production'))
const ProjectManagement = lazy(() => import('./pages/production/ProjectManagement'))
const BudgetManagement = lazy(() => import('./pages/production/BudgetManagement'))
const TeamManagement = lazy(() => import('./pages/production/TeamManagement'))
const SchedulePlanning = lazy(() => import('./pages/production/SchedulePlanning'))
const PostProduction = lazy(() => import('./pages/production/PostProduction'))
const Contracts = lazy(() => import('./pages/production/Contracts'))
const EquipmentRental = lazy(() => import('./pages/production/EquipmentRental'))
const Clients = lazy(() => import('./pages/production/Clients'))
const Reports = lazy(() => import('./pages/production/Reports'))
const Communications = lazy(() => import('./pages/production/Communications'))
const Integrations = lazy(() => import('./pages/production/Integrations'))
const ProductionSettings = lazy(() => import('./pages/production/ProductionSettings'))
const TechSupport = lazy(() => import('./pages/TechSupport'))
const TechnicalService = lazy(() => import('./pages/TechnicalService'))
const Admin = lazy(() => import('./pages/Admin'))
const Inspection = lazy(() => import('./pages/Inspection'))
const InspectionCreate = lazy(() => import('./pages/InspectionCreate'))
const InspectionDetail = lazy(() => import('./pages/InspectionDetail'))
const Settings = lazy(() => import('./pages/Settings'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Analytics = lazy(() => import('./pages/Analytics'))
const StockManagement = lazy(() => import('./pages/StockManagement'))
const CostAccounting = lazy(() => import('./pages/CostAccounting'))
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
          <Suspense fallback={<div className="p-6 text-neutral-600">Yükleniyor...</div>}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/orders' element={<Reservations />} />
              <Route path='/orders/new' element={<NewOrder />} />
              <Route path='/orders/:id' element={<OrderDetail />} />
              <Route path='/inventory' element={<Inventory />} />
              <Route path='/inventory/new' element={<NewEquipment />} />
              <Route path='/inventory/:id' element={<EquipmentDetail />} />
              <Route path='/customers' element={<Customers />} />
              <Route path='/customers/create' element={<CustomerCreate />} />
              <Route path='/calendar' element={<Calendar />} />
              <Route path='/documents' element={<Documents />} />
              <Route path='/suppliers' element={<Suppliers />} />
              <Route path='/accounting' element={<Accounting />} />
              <Route path='/accounting/invoice/new' element={<InvoiceForm />} />
              <Route path='/accounting/invoice/:id' element={<InvoiceForm />} />
              <Route path='/accounting/quote/new' element={<QuoteForm />} />
              <Route path='/accounting/quote/:id' element={<QuoteForm />} />
              <Route path='/account-cards' element={<AccountCardList />} />
              <Route path='/account-cards/:id' element={<AccountCardDetail />} />
              <Route path='/social' element={<Social />} />
              <Route path='/website' element={<Website />} />
              <Route path='/website/builder' element={<SiteBuilder />} />
              <Route path='/website/cms' element={<ContentManagement />} />
              <Route path='/website/users' element={<UserManagement />} />
              <Route path='/website/rental' element={<RentalManagement />} />
              <Route path='/website/seo' element={<SEOMarketing />} />
              <Route path='/website/finance' element={<FinanceReports />} />
              <Route path='/website/security' element={<SecuritySettings />} />
              <Route path='/todo' element={<Todo />} />
              <Route path='/messaging' element={<Messaging />} />
              <Route path='/meetings' element={<Meetings />} />
              <Route path='/tools' element={<Tools />} />
              <Route path='/customer-service' element={<CustomerService />} />
              <Route path='/production' element={<Production />} />
              <Route path='/production/projects' element={<ProjectManagement />} />
              <Route path='/production/budget' element={<BudgetManagement />} />
              <Route path='/production/team' element={<TeamManagement />} />
              <Route path='/production/schedule' element={<SchedulePlanning />} />
              <Route path='/production/post-production' element={<PostProduction />} />
              <Route path='/production/contracts' element={<Contracts />} />
              <Route path='/production/equipment' element={<EquipmentRental />} />
              <Route path='/production/clients' element={<Clients />} />
              <Route path='/production/reports' element={<Reports />} />
              <Route path='/production/communications' element={<Communications />} />
              <Route path='/production/integrations' element={<Integrations />} />
              <Route path='/production/settings' element={<ProductionSettings />} />
              <Route path='/tech-support' element={<TechSupport />} />
              <Route path='/technical-service' element={<TechnicalService />} />
              <Route path='/admin' element={<Admin />} />
              <Route path='/inspection' element={<Inspection />} />
              <Route path='/inspection/new' element={<InspectionCreate />} />
              <Route path='/inspection/:id' element={<InspectionDetail />} />
              <Route path='/pricing' element={<Pricing />} />
              <Route path='/analytics' element={<Analytics />} />
              <Route path='/stock' element={<StockManagement />} />
              <Route path='/cost-accounting' element={<CostAccounting />} />
              <Route path='/settings' element={<Settings />} />
              <Route path='*' element={<Navigate to='/' replace />} />
            </Routes>
          </Suspense>
      </Layout>
      </NotificationProvider>
    </>
  )
}
