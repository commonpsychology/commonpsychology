// src/pages/HomePage.jsx
import { useEffect, useState } from 'react'
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
import Balance          from '../components/Balance'
import NoticePopup      from '../components/NoticePopup'
import NamasteLoader    from '../components/NamasteLoader'
import PollPopup        from '../components/Pollpopup'
import DailyReturnHook  from '../components/DailyReturnHook'
import ImageSlider from '../components/ImageSlider'
import FloatingActions  from '../components/FloatingActions'

export default function HomePage() {
  const [showPoll, setShowPoll] = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const seen = sessionStorage.getItem('poll_seen')
    if (!seen) {
      const t = setTimeout(() => {
        setShowPoll(true)
        sessionStorage.setItem('poll_seen', '1')
      }, 3000)
      return () => clearTimeout(t)
    }
  }, [])

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

      {/* Poll — rendered independently, does NOT affect DailyReturnHook */}
      {showPoll && <PollPopup onClose={() => setShowPoll(false)} />}

      {/* Page sections */}
      <HeroEmotional />
      <TrustBar />
      <Umbrella />
      <Services />
      <Balance />
      <Therapists />
      <Assessment />
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
