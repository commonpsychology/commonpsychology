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
import Balance         from '../components/Balance'
import NamasteLoader    from '../components/NamasteLoader'
import PollPopup        from '../components/Pollpopup'
import DailyReturnHook  from '../components/DailyReturnHook'
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
      {loading && (
        <NamasteLoader
          duration={2800}
          onDone={() => setLoading(false)}
        />
      )}

      {/* Single FAB — replaces FloatingOrders + FloatingEye + DonateButton */}
      <FloatingActions />

      {/* Poll */}
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
      <Resources />
      <NewsSection />
      <FAQ />
      <Testimonials />
      <Crisis />
      <DailyReturnHook visible={!showPoll} />

      {/* Give PsychologicalEye an id so FloatingActions can scroll to it */}
      <div id="psych-eye-section">
        <PsychologicalEye />
      </div>
    </>
  )
}