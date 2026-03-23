import { useEffect, useState } from 'react'
import HeroEmotional from '../components/HeroEmotional'
import TrustBar from '../components/Trustbar'
import Services from '../components/Services'
import Therapists from '../components/Therapists'
import Assessment from '../components/Assessment'
import VideoReviews from '../components/Videoreviews'
import Resources from '../components/Resources'
import FAQ from '../components/Faq'
import NewsSection from '../components/Newssection'
import Testimonials from '../components/Testimonials'
import PsychologicalEye from '../components/PsychologicalEye'
import Crisis from '../components/Crisis'
import PollPopup from '../components/Pollpopup'

export default function HomePage() {
  const [showPoll, setShowPoll] = useState(false)

  // Show poll after 3 seconds on first visit
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
      {showPoll && <PollPopup onClose={() => setShowPoll(false)} />}
      <HeroEmotional />
      <TrustBar />
      <Services />
      <Therapists />
      <Assessment />
      <VideoReviews />
      <Resources />
      <NewsSection />
      <FAQ />
      <Testimonials />
      <Crisis />
      <PsychologicalEye />
      
    </>
  )
}