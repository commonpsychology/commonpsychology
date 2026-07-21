// // src/pages/ServiceDetailPage.jsx
// import { useState } from 'react'
// import { useRouter } from '../context/RouterContext'
// import { allServices, slugify } from './ServicesPage'

// // ── Glass card palette (matches ServicesPage) ──────────────────
// const GLASS = {
//   bg: 'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
//   border: '1px solid rgba(255,255,255,0.55)',
// }

// function FaqItem({ q, a, isOpen, onToggle }) {
//   return (
//     <div
//       style={{
//         borderRadius: '16px',
//         background: GLASS.bg,
//         backdropFilter: 'blur(12px)',
//         WebkitBackdropFilter: 'blur(12px)',
//         border: GLASS.border,
//         overflow: 'hidden',
//         boxShadow: '0 4px 14px rgba(0,123,168,0.08)',
//       }}
//     >
//       <button
//         onClick={onToggle}
//         style={{
//           width: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: '1rem',
//           padding: '1.1rem 1.4rem',
//           background: 'none',
//           border: 'none',
//           cursor: 'pointer',
//           textAlign: 'left',
//           font: 'inherit',
//         }}
//       >
//         <span style={{ fontSize: '0.98rem', fontWeight: 600, color: '#1a2b26' }}>{q}</span>
//         <span
//           style={{
//             flexShrink: 0,
//             width: 26,
//             height: 26,
//             borderRadius: '50%',
//             background: 'rgba(29,158,117,0.12)',
//             color: '#1d9e75',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '1rem',
//             fontWeight: 700,
//             transform: isOpen ? 'rotate(45deg)' : 'none',
//             transition: 'transform 0.25s ease',
//           }}
//         >
//           +
//         </span>
//       </button>
//       <div
//         style={{
//           maxHeight: isOpen ? '300px' : '0px',
//           transition: 'max-height 0.3s ease',
//           overflow: 'hidden',
//         }}
//       >
//         <p style={{ margin: 0, padding: '0 1.4rem 1.2rem', fontSize: '0.92rem', lineHeight: 1.7, color: '#4a5a55' }}>
//           {a}
//         </p>
//       </div>
//     </div>
//   )
// }

// export default function ServiceDetailPage({ slug: slugProp }) {
//   const { navigate, params } = useRouter()
//   const slug = slugProp || params?.slug
//   const service = allServices.find(s => slugify(s.title) === slug)
//   const [openFaq, setOpenFaq] = useState(0)

//   if (!service) {
//     return (
//       <div className="page-wrapper">
//         <div className="section" style={{ background: 'var(--white)', textAlign: 'center', padding: '6rem 2rem' }}>
//           <h2 className="section-title">Service not found</h2>
//           <p className="section-desc">We couldn't find the service you're looking for.</p>
//           <button
//             className="btn btn-primary"
//             style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)', border: 'none' }}
//             onClick={() => navigate('/services')}
//           >
//             Back to Services
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const quickFacts = [
//     { label: 'Duration', value: service.duration, icon: '⏱️' },
//     { label: 'Format', value: service.format, icon: '📍' },
//     { label: 'Frequency', value: service.frequency, icon: '🔁' },
//   ].filter(f => f.value)

//   return (
//     <div className="page-wrapper">
//       {/* Hero */}
//       <div
//         className="page-hero"
//         style={{
//           position: 'relative',
//           overflow: 'hidden',
//           padding: '4rem 2rem 5rem',
//           textAlign: 'center',
//           borderRadius: '0 0 60% 60% / 0 0 40px 40px',
//           background: `
//             radial-gradient(ellipse 80% 60% at 20% 40%, rgba(180,230,210,0.55) 0%, transparent 70%),
//             radial-gradient(ellipse 70% 80% at 80% 20%, rgba(186,220,248,0.5) 0%, transparent 65%),
//             radial-gradient(ellipse 60% 50% at 60% 80%, rgba(254,243,199,0.45) 0%, transparent 60%),
//             linear-gradient(160deg, #f0faf5 0%, #e8f4fb 45%, #fefce8 100%)
//           `,
//         }}
//       >
//         <div style={{
//           position: 'absolute', width: 220, height: 220, borderRadius: '50%',
//           background: 'rgba(0,123,168,0.12)', filter: 'blur(32px)',
//           top: -40, right: '5%', pointerEvents: 'none',
//         }} />
//         <div style={{
//           position: 'absolute', width: 180, height: 180, borderRadius: '50%',
//           background: 'rgba(29,158,117,0.1)', filter: 'blur(32px)',
//           bottom: -20, left: '8%', pointerEvents: 'none',
//         }} />

//         <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
//           <button
//             onClick={() => navigate('/services')}
//             style={{
//               display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
//               background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.7)',
//               borderRadius: '999px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600,
//               color: '#3a4a45', cursor: 'pointer', marginBottom: '1.5rem',
//             }}
//           >
//             ← All Services
//           </button>

//           <div
//             className={`service-icon ${service.iconClass}`}
//             style={{ margin: '0 auto 1rem', width: 72, height: 72, fontSize: '2.2rem' }}
//           >
//             {service.icon}
//           </div>

//           <span className="section-tag">{service.specialties?.[0]}</span>
//           <h1 className="section-title">{service.title}</h1>
//           <p className="section-desc">{service.desc}</p>

//           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginTop: '1.2rem' }}>
//             {service.specialties.map(tag => (
//               <span
//                 key={tag}
//                 style={{
//                   fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.8rem',
//                   borderRadius: '999px', background: 'rgba(255,255,255,0.65)',
//                   border: '1px solid rgba(255,255,255,0.8)', color: '#1d9e75',
//                 }}
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="section" style={{ background: 'var(--white)' }}>
//         <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

//           {/* Quick facts */}
//           {quickFacts.length > 0 && (
//             <div style={{ display: 'grid', gridTemplateColumns: `repeat(${quickFacts.length}, 1fr)`, gap: '1rem' }}>
//               {quickFacts.map(f => (
//                 <div
//                   key={f.label}
//                   style={{
//                     borderRadius: '16px', padding: '1.2rem 1rem', textAlign: 'center',
//                     background: GLASS.bg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
//                     border: GLASS.border, boxShadow: '0 4px 14px rgba(0,123,168,0.08)',
//                   }}
//                 >
//                   <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{f.icon}</div>
//                   <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#7a8a85', marginBottom: '0.3rem' }}>
//                     {f.label}
//                   </div>
//                   <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a2b26', lineHeight: 1.4 }}>
//                     {f.value}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Overview */}
//           {service.overview && (
//             <div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2b26', marginBottom: '0.8rem' }}>Overview</h2>
//               <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#4a5a55' }}>{service.overview}</p>
//             </div>
//           )}

//           {/* Features */}
//           {service.features?.length > 0 && (
//             <div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2b26', marginBottom: '1rem' }}>What's included</h2>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
//                 {service.features.map((f, i) => (
//                   <div
//                     key={i}
//                     style={{
//                       display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
//                       padding: '0.9rem 1rem', borderRadius: '14px',
//                       background: GLASS.bg, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
//                       border: GLASS.border,
//                     }}
//                   >
//                     <span style={{ color: '#1d9e75', fontWeight: 700 }}>✓</span>
//                     <span style={{ fontSize: '0.9rem', color: '#33423e', fontWeight: 500 }}>{f}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Who it's for */}
//           {service.whoFor?.length > 0 && (
//             <div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2b26', marginBottom: '1rem' }}>Is this right for you?</h2>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
//                 {service.whoFor.map((w, i) => (
//                   <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
//                     <span style={{
//                       flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
//                       background: 'rgba(0,123,168,0.12)', color: '#007ba8',
//                       display: 'flex', alignItems: 'center', justifyContent: 'center',
//                       fontSize: '0.75rem', fontWeight: 700, marginTop: '2px',
//                     }}>✓</span>
//                     <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6, color: '#33423e' }}>{w}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Benefits (optional field) */}
//           {service.benefits?.length > 0 && (
//             <div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2b26', marginBottom: '1rem' }}>What you'll gain</h2>
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
//                 {service.benefits.map((b, i) => (
//                   <div
//                     key={i}
//                     style={{
//                       padding: '1rem', borderRadius: '14px',
//                       background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.15)',
//                       fontSize: '0.9rem', color: '#0f6e56', fontWeight: 500, lineHeight: 1.5,
//                     }}
//                   >
//                     {b}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Process */}
//           {service.process?.length > 0 && (
//             <div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2b26', marginBottom: '1.2rem' }}>How it works</h2>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
//                 {service.process.map((step, i) => (
//                   <div key={i} style={{ display: 'flex', gap: '1rem' }}>
//                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                       <div style={{
//                         width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
//                         background: 'linear-gradient(135deg, #1d9e75, #007ba8)', color: '#fff',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontSize: '0.85rem', fontWeight: 700,
//                       }}>
//                         {i + 1}
//                       </div>
//                       {i < service.process.length - 1 && (
//                         <div style={{ width: 2, flex: 1, background: 'rgba(29,158,117,0.2)', minHeight: '24px' }} />
//                       )}
//                     </div>
//                     <div style={{ paddingBottom: i < service.process.length - 1 ? '1.5rem' : 0 }}>
//                       <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a2b26', margin: '0 0 0.3rem' }}>{step.title}</h3>
//                       <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#4a5a55', margin: 0 }}>{step.desc}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* FAQs */}
//           {service.faqs?.length > 0 && (
//             <div>
//               <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2b26', marginBottom: '1rem' }}>Common questions</h2>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
//                 {service.faqs.map((faq, i) => (
//                   <FaqItem
//                     key={i}
//                     q={faq.q}
//                     a={faq.a}
//                     isOpen={openFaq === i}
//                     onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* CTA */}
//           <div
//             style={{
//               textAlign: 'center', padding: '2.5rem 1.5rem', borderRadius: '20px',
//               background: 'linear-gradient(160deg, rgba(29,158,117,0.08), rgba(0,123,168,0.08))',
//               border: '1px solid rgba(29,158,117,0.15)',
//             }}
//           >
//             <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a2b26', marginBottom: '0.5rem' }}>
//               Ready to get started?
//             </h2>
//             <p style={{ fontSize: '0.95rem', color: '#4a5a55', marginBottom: '1.5rem' }}>
//               Book {service.title.toLowerCase()} with one of our certified therapists.
//             </p>
//             <button
//               className="btn btn-primary"
//               style={{
//                 background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
//                 boxShadow: '0 6px 18px rgba(0,150,210,0.3)', border: 'none',
//                 padding: '0.85rem 2.2rem', fontSize: '1rem',
//               }}
//               onClick={() => navigate('/book', { serviceTitle: service.title, serviceSpecialties: service.specialties })}
//             >
//               Book This Service
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }