// src/context/LanguageContext.jsx
import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

// ── Translations ──────────────────────────────────────────────
export const T = {
  EN: {
    // Nav
    bookSession:   'Book Session',
    signIn:        'Sign In',
    myAccount:     'My Account',
    myPortal:      'My Portal',
    logOut:        'Log Out',
    // Common
    loading:       'Loading…',
    viewAll:       'View All',
    learnMore:     'Learn More →',
    free:          'FREE',
    premium:       'Premium',
    // Assessment
    assessmentTag: 'Self Assessment',
    assessmentTitle: 'Understand Where You Are',
    assessmentDesc:  'Our clinically validated tools give you honest insight into your mental health — completely free, private, and confidential.',
    startAssessment: 'Start a Free Assessment →',
    freeMin:         'FREE · 5 min',
    // Therapists
    therapistsTag:   'Our Team',
    therapistsTitle: 'Find Your Therapist',
    bookNow:         'Book Session',
    viewProfile:     'View Profile',
    available:       '● Available',
    busy:            '○ Busy',
    yrsExp:          'yrs exp',
    // Blog
    readMore:        'Read More',
    // Gallery
    galleryTag:      'Photo Gallery',
    galleryTitle:    'Moments That Matter',
    // Store
    addToCart:       '+ Add to Cart',
    outOfStock:      'Out of Stock',
    // Community
    joinGroup:       '🤝 Join Group',
    leaveGroup:      '✓ Joined — Leave Group',
    // Courses
    enrollFree:      '🎓 Enroll Free →',
    enrollNow:       '💳 Enroll Now',
    goCourse:        '▶ Go to Course',
    // Resources
    downloadFree:    '⬇ Download Free',
    getPremium:      '🔒 Get Premium',
    // Workshops
    registerFree:    'Register Free →',
    registerNow:     'Register Now →',
    // Social Work
    partnerUs:       'Partner With Us',
    // Contact
    sendMessage:     'Send Message →',
  },
  NP: {
    // Nav
    bookSession:   'सत्र बुक गर्नुहोस्',
    signIn:        'साइन इन',
    myAccount:     'मेरो खाता',
    myPortal:      'मेरो पोर्टल',
    logOut:        'लग आउट',
    // Common
    loading:       'लोड हुँदैछ…',
    viewAll:       'सबै हेर्नुहोस्',
    learnMore:     'थप जान्नुहोस् →',
    free:          'निःशुल्क',
    premium:       'प्रिमियम',
    // Assessment
    assessmentTag: 'स्व-मूल्यांकन',
    assessmentTitle: 'अहिले आफू कहाँ छु बुझ्नुहोस्',
    assessmentDesc:  'हाम्रा क्लिनिकल रूपमा प्रमाणित उपकरणहरूले तपाईंलाई मानसिक स्वास्थ्यको बारेमा इमानदार जानकारी दिन्छन् — पूर्णतः निःशुल्क, निजी र गोपनीय।',
    startAssessment: 'निःशुल्क मूल्यांकन सुरु गर्नुहोस् →',
    freeMin:         'निःशुल्क · ५ मिनेट',
    // Therapists
    therapistsTag:   'हाम्रो टिम',
    therapistsTitle: 'आफ्नो थेरापिस्ट खोज्नुहोस्',
    bookNow:         'सत्र बुक गर्नुहोस्',
    viewProfile:     'प्रोफाइल हेर्नुहोस्',
    available:       '● उपलब्ध',
    busy:            '○ व्यस्त',
    yrsExp:          'वर्ष अनुभव',
    // Blog
    readMore:        'थप पढ्नुहोस्',
    // Gallery
    galleryTag:      'फोटो ग्यालेरी',
    galleryTitle:    'महत्त्वपूर्ण क्षणहरू',
    // Store
    addToCart:       '+ कार्टमा थप्नुहोस्',
    outOfStock:      'स्टकमा छैन',
    // Community
    joinGroup:       '🤝 समूहमा सामेल हुनुहोस्',
    leaveGroup:      '✓ सामेल — समूह छोड्नुहोस्',
    // Courses
    enrollFree:      '🎓 निःशुल्क भर्ना हुनुहोस् →',
    enrollNow:       '💳 अहिले भर्ना हुनुहोस्',
    goCourse:        '▶ कोर्समा जानुहोस्',
    // Resources
    downloadFree:    '⬇ निःशुल्क डाउनलोड',
    getPremium:      '🔒 प्रिमियम पाउनुहोस्',
    // Workshops
    registerFree:    'निःशुल्क दर्ता गर्नुहोस् →',
    registerNow:     'अहिले दर्ता गर्नुहोस् →',
    // Social Work
    partnerUs:       'हामीसँग साझेदारी गर्नुहोस्',
    // Contact
    sendMessage:     'सन्देश पठाउनुहोस् →',
  },
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('EN')
  const toggle = () => setLang(l => l === 'EN' ? 'NP' : 'EN')
  const t = (key) => T[lang][key] || T['EN'][key] || key

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  return useContext(LanguageContext)
}