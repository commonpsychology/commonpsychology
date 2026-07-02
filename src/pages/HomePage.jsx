// src/pages/HomePage.jsx
import { useEffect, useState } from 'react'
import { useAuth }       from '../context/AuthContext'
import HeroEmotional    from '../components/HeroEmotional'
import TrustBar         from '../components/Trustbar'
import Services         from '../components/Services'
import Therapists       from '../components/Therapists'
import Assessment       from '../components/Assessment'
import VideoReviews     from '../components/Videoreviews'
import Resources        from '../components/Resources'
import FAQ              from '../components/Faq'
import Umbrella         from '../components/Umbrella'
import NewsSection      from '../components/Newssection'
import Testimonials     from '../components/Testimonials'
import PsychologicalEye from '../components/PsychologicalEye'
import Crisis           from '../components/Crisis'
// import Donate           from '../components/Donate'
import Balance          from '../components/Balance'
import NoticePopup      from '../components/NoticePopup'
import NamasteLoader    from '../components/NamasteLoader'
import PollPopup        from '../components/Pollpopup'
import DailyReturnHook  from '../components/DailyReturnHook'
import ImageSlider from '../components/ImageSlider'
import FloatingActions  from '../components/FloatingActions'

const API = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [showPoll, setShowPoll] = useState(false)
  const [loading, setLoading]   = useState(true)

  // ── Poll trigger: logged-in users who haven't answered yet ──
  useEffect(() => {
    if (authLoading) return        // wait for auth to resolve first
    if (!user) return               // logged-out users never see the poll

    let cancelled = false

    async function checkPollStatus() {
      try {
        const token = localStorage.getItem('accessToken')
        const res = await fetch(`${API}/polls/has-answered`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && !data.answered) {
          setShowPoll(true)
        }
      } catch {
        // Network/API error: fail silently, don't show poll on uncertainty
      }
    }

    checkPollStatus()
    return () => { cancelled = true }
  }, [user, authLoading])

  return (
    <>

     <NoticePopup
    title="Clinic closed on public holidays"
    message="Our in-person sessions are unavailable next week. Online assessments and resources remain fully accessible. Please reschedule any upcoming appointments."
    storageKey="notice_may_2025"
  />
      {loading && (
        <NamasteLoader
          duration={2800}
          onDone={() => setLoading(false)}
        />
      )}

      {/* Single FAB — replaces FloatingOrders + FloatingEye + DonateButton */}
      <FloatingActions />

      {/* Poll — shown only to logged-in users who haven't answered yet */}
      {showPoll && <PollPopup onClose={() => setShowPoll(false)} />}

      {/* Page sections */}
      <HeroEmotional />
      <TrustBar />
      <Umbrella />
      <Services />
      <Balance />
      <Therapists />
      <Assessment />
      <Donate />
      <VideoReviews />
      <ImageSlider />
      <Resources />
      <NewsSection />
      <FAQ />
      <Testimonials />
      <Crisis />

      {/*
        FIX: DailyReturnHook is ALWAYS rendered — never tied to showPoll.
        Mounting/unmounting it caused hasAnimated to reset and the
        IntersectionObserver to never re-fire, making the section invisible.
      */}
      <DailyReturnHook />

      {/* Give PsychologicalEye an id so FloatingActions can scroll to it */}
      <div id="psych-eye-section">
        <PsychologicalEye />
      </div>
    </>
  )
}