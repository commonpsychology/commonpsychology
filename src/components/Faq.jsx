import { useState } from 'react'
import { TOKENS, sectionGradientCSS } from '../styles/oceanTheme'

const FAQS = [
  { q: 'What is  Mental Wellness Center?', a: 'Common Psychology is Nepal\'s leading digital mental health platform, connecting individuals with licensed psychologists, counselors, and psychiatrists. We offer online and in-person therapy, free assessments, educational resources, and community support — all rooted in Nepali culture.' },
  { q: 'Are the therapists licensed and qualified?', a: 'Yes. Every therapist on our platform is verified by the Nepal Psychologists\' Council (NPC) and adheres to the Nepal Psychological Association\'s Code of Ethics. You can view each therapist\'s credentials, experience, and specializations on their profile page.' },
  { q: 'Is everything I share completely confidential?', a: 'Absolutely. All sessions and communications are strictly confidential under Nepali professional ethics standards. Information is only disclosed in rare cases required by law — such as imminent risk of harm. We use encrypted systems to protect your data.' },
  { q: 'How do I book a session?', a: 'Click "Book Session" from any page. You\'ll choose your session type (individual, couples, family, group), preferred therapist, and a convenient time slot. We offer both online (video/audio) and in-person sessions at our Kathmandu clinic.' },
  { q: 'How much does a session cost?', a: 'Session fees range from NPR 1,500 to NPR 3,000 depending on the therapist and session type. Group sessions start from NPR 500. We also offer sliding-scale fees for those with financial hardship — contact us to discuss.' },
  { q: 'What payment methods do you accept?', a: 'We accept eSewa, Khalti, credit/debit cards (Visa, Mastercard), and direct bank transfers. Payment is collected securely at the time of booking.' },
  { q: 'Can I use this platform if I\'m not in Kathmandu?', a: 'Yes! Our online sessions are accessible from anywhere in Nepal and abroad. You only need a stable internet connection and a private space. In-person sessions are available at our Kathmandu and Pokhara locations.' },
  { q: 'What if I need help urgently or I\'m in crisis?', a: 'If you are in immediate danger, please call Nepal Police (100) or the Mental Health Helpline (1800-210-1494). Our crisis section lists emergency contacts. Our team also offers same-day emergency consultations where possible — contact us directly.' },
  { q: 'Do you offer services in Nepali language?', a: 'Yes. All our therapists are fluent in Nepali and provide therapy in Nepali, English, or Hindi depending on your preference. Our platform also supports Nepali-language content throughout.' },
  { q: 'What mental health conditions do you treat?', a: 'Our therapists work with anxiety, depression, trauma/PTSD, OCD, bipolar disorder, relationship issues, grief, burnout, addiction, child and adolescent issues, and many more. Use our Disorders section to learn about specific conditions, or contact us if you are unsure.' },
]

export default function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section className="faq-section" id="faq">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap');
        ${sectionGradientCSS('faq-section')}

        .faq-section { padding: 3.5rem 1.5rem 4rem; }
        .faq-inner { position: relative; z-index: 1; max-width: 780px; margin: 0 auto; }

        .faq-header { text-align: center; margin-bottom: 2.25rem; }
        .faq-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; margin-bottom: 0.7rem;
          border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #0f3460; background: ${TOKENS.skyLight};
        }
        .faq-title {
          font-family: 'Fraunces', serif; font-weight: 800;
          font-size: clamp(1.5rem, 3vw, 2.05rem); line-height: 1.2;
          color: ${TOKENS.oceanInk}; margin: 0 0 0.5rem;
        }
        .faq-title em { font-style: italic; color: ${TOKENS.oceanBright}; }
        .faq-desc { font-family: 'Inter', sans-serif; font-size: 0.9rem; color: ${TOKENS.dim}; line-height: 1.55; margin: 0 auto; max-width: 480px; }

        .faq-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .faq-item {
          background: ${TOKENS.white};
          border-radius: 12px;
          border: 1.5px solid ${TOKENS.bluePale};
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .faq-item.is-open { border-color: ${TOKENS.oceanBright}; box-shadow: 0 4px 16px rgba(0,123,168,0.08); }
        .faq-q-btn {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%; padding: 1rem 1.25rem;
          background: none; border: none; cursor: pointer;
          text-align: left; gap: 1rem;
        }
        .faq-q-text {
          font-family: 'Inter', sans-serif; font-size: 0.92rem; font-weight: 700;
          line-height: 1.4; color: ${TOKENS.oceanDeep};
        }
        .faq-q-text.is-open { color: ${TOKENS.oceanBright}; }
        .faq-toggle {
          width: 26px; height: 26px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 0.8rem; color: ${TOKENS.oceanDeep};
          background: ${TOKENS.skyLight};
          transition: all 0.2s; transform: rotate(0deg);
        }
        .faq-toggle.is-open { background: ${TOKENS.oceanBright}; color: #fff; transform: rotate(45deg); }
        .faq-answer { padding: 0 1.25rem 1rem; border-top: 1px solid ${TOKENS.bluePale}; }
        .faq-answer p { font-family: 'Inter', sans-serif; font-size: 0.88rem; color: ${TOKENS.dim}; line-height: 1.75; margin-top: 0.75rem; }
      `}</style>

      <div className="faq-inner">
        <div className="faq-header">
          <span className="faq-eyebrow">❓ FAQ</span>
          <h2 className="faq-title">Frequently Asked <em>Questions</em></h2>
          <p className="faq-desc">Everything you need to know before taking the first step.</p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={i} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                <button className="faq-q-btn" onClick={() => setOpen(isOpen ? null : i)}>
                  <span className={`faq-q-text ${isOpen ? 'is-open' : ''}`}>{faq.q}</span>
                  <span className={`faq-toggle ${isOpen ? 'is-open' : ''}`}>+</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}