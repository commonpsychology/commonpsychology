import { useEffect } from 'react'
import { RouterProvider, useRouter } from './context/RouterContext'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { PaymentProvider } from './components/PaymentModal'
import { TherapistsProvider } from './context/TherapistsContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MyOrdersPage from './pages/MyOrdersPage'
import HomePage            from './pages/HomePage'
import ServicesPage        from './pages/ServicesPage'
import TherapistsPage      from './pages/TherapistsPage'
import TherapistDetailPage from './pages/TherapistDetailPage'
import BookingPage         from './pages/BookingPage'
import AssessmentsPage     from './pages/AssessmentsPage'
import OurMembers from './pages/OurMembers'
import AssessmentTakePage  from './pages/AssessmentTakePage'
import ResourcesPage       from './pages/ResourcesPage'
import VerifyAccountPage   from './pages/VerifyAccountPage'
import NoticeDemoCheck      from './pages/NoticeDemoCheck'
import OurNews             from './pages/OurNews'
import ReturnRefundPage      from './pages/ReturnRefundPage'
import DisasterManagement  from './pages/DisasterManagement'
import NewsDetailPage      from './pages/NewsDetailPage'
import PsychologicalArticlePage from './pages/PsychologicalArticlePage'
import ServiceDetailPage from './pages/ServiceDetailPage'
import CoursesPage         from './pages/CoursesPage'
import BlogPage            from './pages/BlogPage'            // ← list page
import BlogDetailPage      from './pages/BlogDetailPage'      // ← detail page
import ResearchPage        from './pages/ResearchPage'        // ← list page
import ResearchDetailPage  from './pages/ResearchDetailPage'  // ← detail page
import ContactPage         from './pages/ContactPage'
import PaymentEthicsPage   from './pages/PaymentEthicsPage'
import SignInPage          from './pages/SignInPage'
import ForgotPasswordPage   from './pages/ForgotPasswordPage'
import RegisterPage        from './pages/RegisterPage'
import StorePage           from './pages/StorePage'
import OnlineCourses      from './pages/OnlineCourses'
import AnnualReports from './pages/AnnualReports'
import CartPage            from './pages/CartPage'
import MessagesPage        from './pages/MessagesPage'
import PrivacyPage         from './pages/PrivacyPage'
import OurPlacePage        from './pages/OurplacePage'
import BookingDebugPanel from './components/BookingDebugPanel'
import IntegratePage from './pages/IntegratePage'
import Storepage     from './pages/StorePage'
import NoticePage    from './pages/NoticePage'
import StaffportalPage      from './pages/StaffportalPage'
import PaymentInfoPage     from './pages/PaymentInfoPage'
import UpdatePasswordPage  from './pages/UpdataPasswordPage'
import UpgradePage         from './pages/UpgradePage'
import ClientPortalPage    from './pages/ClientsPortalPage'
import CommunityPage       from './pages/CommunityPage'
import MentalFitness     from './pages/MentalFitness'
import RegisterStaffPage   from './pages/RegisterStaffPage'
import AIToolsPage         from './pages/AitoolsPage'
import NeurosciencePage    from './pages/NeuroScience'
import MyAccountPage       from './pages/MyaccountPage'
import DisordersPage       from './pages/DisordersPage'
import PsychologicalViewPage from './pages/PsychologicalViewPage'
import WorkshopsPage       from './pages/WorkshopPage'
import ReviewsPage         from './pages/ReviewsPage'
import SocialWorkPage      from './pages/SocialworkPage'
import StaffPage            from './pages/StaffPage'
import GalleryPage         from './pages/GalleryPage'
import VolunteerPage       from './pages/VolunteerPage'
import PaymentPage         from './pages/Paymentpage'
import StaffLoginPage      from './pages/StaffloginPage'
import MyBookings     from './pages/MyBookings'
import AdminDashboard      from './pages/AdmindashboardPage'
import TherapistDashboard  from './pages/TherapistdashboardPage'
import EsewaSuccessPage from './pages/EsewaSuccessPage'
import EsewaFailurePage from './pages/EsewaFailurePage'
import DeliveryDashboardPage from './pages/DeliveryDashboardPage'
import DeliveryLoginPage from './pages/DeliveryLoginPage'  

const API_BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}/api`

async function checkUnreadNotifications() {
  console.log('[notif] checkUnreadNotifications fired')
  const token = localStorage.getItem('accessToken')
  if (!token) {
    console.log('[notif] no token, skipping')
    return
  }

  try {
    const res = await fetch(`${API_BASE}/notifications?unread=true`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const data = await res.json()

    console.log('[notif] unreadCount:', data.unreadCount)
    if (data.unreadCount > 0) {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const perm = await LocalNotifications.requestPermissions()
      console.log('[notif] permission result:', perm)
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Common Psychology',
          body: `You have ${data.unreadCount} new notification(s)`,
          id: Date.now() % 100000,
        }],
      })
      console.log('[notif] scheduled successfully')
    }
  } catch (err) {
    console.log('[notif] ERROR:', err)
  }
}

const ROUTES = {
  '/':                   HomePage,
  '/services':           ServicesPage,
  '/therapists':         TherapistsPage,
  '/book':               BookingPage,
  '/cart':               CartPage,
  '/payment':            PaymentPage,
  '/payment-info':       PaymentEthicsPage,
  '/assessments':        AssessmentsPage,
  '/assessment-take':    AssessmentTakePage,
  '/resources':          ResourcesPage,
  '/courses':            CoursesPage,
  '/register-staffs':    RegisterStaffPage,
  '/blog':               BlogPage,       // ← now the list page
  '/research':           ResearchPage,   // ← now the list page
  '/contact':            ContactPage,
  '/about':              ContactPage,
  '/signin':             SignInPage,
  '/neuro-science':       NeurosciencePage,
  '/mental-fitness':     MentalFitness,
  '/my-orders':          MyOrdersPage,
  '/our-members':        OurMembers,
  '/notices-demo':       NoticeDemoCheck,
  '/our-news':           OurNews,
  '/my-bookings':        MyBookings,
  '/staff-detail':      StaffPage,
  '/forgot-password':     ForgotPasswordPage, 
'/payment/esewa/success': EsewaSuccessPage,
  '/payment/esewa/failure':      EsewaFailurePage,
  '/courses-videos':     OnlineCourses,
  '/register':           RegisterPage,
  '/return-refund':       ReturnRefundPage,
  '/integrate':          IntegratePage,
  '/disaster-management': DisasterManagement,
  '/store':              StorePage,
  '/portal':             ClientPortalPage,
  '/community':          CommunityPage,  
  '/notices':             NoticePage,
  '/annual-reports':     AnnualReports,
  '/ai-tools':           AIToolsPage,
  '/verify':             VerifyAccountPage,
  '/staff/portal':        StaffportalPage,
  '/account':            MyAccountPage,
  '/disorders':          DisordersPage,
  '/psychological-view': PsychologicalViewPage,
  '/workshops':          WorkshopsPage,
  '/privacy':            PrivacyPage,
  '/project-work':        SocialWorkPage,
  '/update-password':    UpdatePasswordPage,
  '/pay':                PaymentInfoPage,
  '/upgrade':            UpgradePage,
  '/delivery/login':     DeliveryLoginPage,
  '/delivery/dashboard': DeliveryDashboardPage,
  '/reviews':            ReviewsPage,
  '/gallery':            GalleryPage,
  '/volunteer':          VolunteerPage,
  '/staff':              StaffLoginPage,
  '/staff/admin':        AdminDashboard,
  '/our-values':         MessagesPage,
  '/staff/therapist':    TherapistDashboard,
  '/ashram':             OurPlacePage,
}

const NO_SHELL_PAGES  = new Set(['/signin','/register','/register-staffs','/payment','/staff','/staff/admin','/staff/therapist','/verify','/delivery/login','/staff/portal','/delivery/dashboard','/update-password','/forgot-password'])
const NO_FOOTER_PAGES = new Set(['/portal','/account','/verify', '/register-staffs','/delivery/login', '/staff/portal','/delivery/dashboard','/update-password','/forgot-password'])

const DYNAMIC_ROUTES = [
  { prefix: '/news/',               Component: NewsDetailPage           },
  { prefix: '/psychological-view/', Component: PsychologicalArticlePage },
  { prefix: '/blog/',               Component: BlogDetailPage           },
  { prefix: '/research/',           Component: ResearchDetailPage       },
  { prefix: '/services/',           Component: ServiceDetailPage        },
]

function resolveDynamicRoute(path) {
  for (const { prefix, Component } of DYNAMIC_ROUTES) {
    if (path.startsWith(prefix) && path.length > prefix.length) {
      return Component
    }
  }
  return null
}

function BackButtonHandler() {
  useEffect(() => {
    console.log('[capacitor] window.Capacitor exists?', !!window.Capacitor)
    if (!window.Capacitor) return

    let backListener, stateListener
    let lastBackPressTime = 0

    import('@capacitor/app').then(async ({ App }) => {
      console.log('[capacitor] @capacitor/app loaded, registering backButton listener')

      backListener = await App.addListener('backButton', ({ canGoBack }) => {
        console.log('[capacitor] backButton fired, canGoBack:', canGoBack, 'pathname:', window.location.pathname)

        const atHome = window.location.pathname === '/' || window.location.pathname === ''

        if (!atHome) {
          // Not on the home screen — always just go back a step, regardless
          // of what canGoBack reports (it can be stale/false right after a
          // programmatic pushState on some Android WebView versions).
          window.history.back()
          return
        }

        // On home screen: require a second press within 2s to actually exit,
        // so a single accidental back-press doesn't kill the app.
        const now = Date.now()
        if (now - lastBackPressTime < 2000) {
          App.exitApp()
        } else {
          lastBackPressTime = now
          console.log('[capacitor] press back again to exit')
        }
      })

      console.log('[capacitor] backButton listener registered:', !!backListener)

      stateListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) checkUnreadNotifications()
      })

      // run once on cold launch too, not just on resume
      checkUnreadNotifications()
    }).catch(err => console.error('[capacitor] failed to load @capacitor/app', err))

    return () => {
      backListener?.remove()
      stateListener?.remove()
    }
  }, [])
  return null
}

function AppRoutes() {
  const { currentPath } = useRouter()

  const DynamicPage = resolveDynamicRoute(currentPath)
  if (DynamicPage) {
    return (
      <>
        <Navbar />
        <DynamicPage />
        <Footer />
      </>
    )
  }

  const Page       = ROUTES[currentPath] || HomePage
  const hideShell  = NO_SHELL_PAGES.has(currentPath)
  const hideFooter = NO_FOOTER_PAGES.has(currentPath)

  if (hideShell) return <Page />
  return (
    <>
      <Navbar />
      <Page />
      {!hideFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <LanguageProvider>
          <PaymentProvider>
            <TherapistsProvider>
              <div className="app">
                <BackButtonHandler />
                <AppRoutes />
                <BookingDebugPanel />
              
              </div>
            </TherapistsProvider>
          </PaymentProvider>
        </LanguageProvider>
      </AuthProvider>
    </RouterProvider>
  )
}