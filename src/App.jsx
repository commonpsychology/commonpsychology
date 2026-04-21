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
import AssessmentTakePage  from './pages/AssessmentTakePage'
import ResourcesPage       from './pages/ResourcesPage'
import VerifyAccountPage   from './pages/VerifyAccountPage'
import OurNews             from './pages/OurNews'
import DisasterManagement  from './pages/DisasterManagement'
import NewsDetailPage      from './pages/NewsDetailPage'
import PsychologicalArticlePage from './pages/PsychologicalArticlePage'
import CoursesPage         from './pages/CoursesPage'
import BlogPage            from './pages/BlogPage'            // ← list page
import BlogDetailPage      from './pages/BlogDetailPage'      // ← detail page
import ResearchPage        from './pages/ResearchPage'        // ← list page
import ResearchDetailPage  from './pages/ResearchDetailPage'  // ← detail page
import ContactPage         from './pages/ContactPage'
import PaymentEthicsPage   from './pages/PaymentEthicsPage'
import SignInPage          from './pages/SignInPage'
import RegisterPage        from './pages/RegisterPage'
import StorePage           from './pages/StorePage'
import OnlineCourses      from './pages/OnlineCourses'
import MessagesPage        from './pages/MessagesPage'
import PrivacyPage         from './pages/PrivacyPage'
import OurPlacePage        from './pages/OurplacePage'
import PaymentInfoPage     from './pages/PaymentInfoPage'
import UpdatePasswordPage  from './pages/UpdataPasswordPage'
import UpgradePage         from './pages/UpgradePage'
import ClientPortalPage    from './pages/ClientsPortalPage'
import CommunityPage       from './pages/CommunityPage'
import RegisterStaffPage   from './pages/RegisterStaffPage'
import AIToolsPage         from './pages/AitoolsPage'
import NeurosciencePage    from './pages/NeuroScience'
import MyAccountPage       from './pages/MyaccountPage'
import DisordersPage       from './pages/DisordersPage'
import PsychologicalViewPage from './pages/PsychologicalViewPage'
import WorkshopsPage       from './pages/WorkshopPage'
import ReviewsPage         from './pages/ReviewsPage'
import SocialWorkPage      from './pages/SocialworkPage'
import GalleryPage         from './pages/GalleryPage'
import VolunteerPage       from './pages/VolunteerPage'
import PaymentPage         from './pages/Paymentpage'
import StaffLoginPage      from './pages/StaffloginPage'
import AdminDashboard      from './pages/AdmindashboardPage'
import TherapistDashboard  from './pages/TherapistdashboardPage'

const ROUTES = {
  '/':                   HomePage,
  '/services':           ServicesPage,
  '/therapists':         TherapistsPage,
  '/book':               BookingPage,
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
  '/my-orders':          MyOrdersPage,
  '/our-news':           OurNews,
  '/courses-videos':     OnlineCourses,
  '/register':           RegisterPage,
  '/disaster-management': DisasterManagement,
  '/store':              StorePage,
  '/portal':             ClientPortalPage,
  '/community':          CommunityPage,
  '/ai-tools':           AIToolsPage,
  '/verify':             VerifyAccountPage,
  '/account':            MyAccountPage,
  '/disorders':          DisordersPage,
  '/psychological-view': PsychologicalViewPage,
  '/workshops':          WorkshopsPage,
  '/privacy':            PrivacyPage,
  '/social-work':        SocialWorkPage,
  '/update-password':    UpdatePasswordPage,
  '/pay':                PaymentInfoPage,
  '/upgrade':            UpgradePage,
  '/reviews':            ReviewsPage,
  '/gallery':            GalleryPage,
  '/volunteer':          VolunteerPage,
  '/staff':              StaffLoginPage,
  '/staff/admin':        AdminDashboard,
  '/our-values':         MessagesPage,
  '/staff/therapist':    TherapistDashboard,
  '/ashram':             OurPlacePage,
}

const NO_SHELL_PAGES  = new Set(['/signin','/register','/payment','/staff','/staff/admin','/staff/therapist','/verify'])
const NO_FOOTER_PAGES = new Set(['/portal','/account','/verify'])

const DYNAMIC_ROUTES = [
  { prefix: '/news/',               Component: NewsDetailPage           },
  { prefix: '/psychological-view/', Component: PsychologicalArticlePage },
  { prefix: '/blog/',               Component: BlogDetailPage           },
  { prefix: '/research/',           Component: ResearchDetailPage       },
]

function resolveDynamicRoute(path) {
  for (const { prefix, Component } of DYNAMIC_ROUTES) {
    if (path.startsWith(prefix) && path.length > prefix.length) {
      return Component
    }
  }
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
              <div className="app"><AppRoutes /></div>
            </TherapistsProvider>
          </PaymentProvider>
        </LanguageProvider>
      </AuthProvider>
    </RouterProvider>
  )
}
