// src/pages/TherapistsPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { therapists as therapistsApi } from '../services/api'

const SPECIALIZATIONS = ['All','Anxiety','Depression','Trauma','Relationships','Child Psychology','Mindfulness','Addiction']

export default function TherapistsPage() {
  const { navigate }        = useRouter()
  const [list, setList]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [page, setPage]     = useState(1)
  const [total, setTotal]   = useState(0)
  const LIMIT = 9

  useEffect(() => {
    setLoading(true)
    therapistsApi.list({ page, limit: LIMIT, ...(filter !== 'All' ? { specialization: filter } : {}) })
      .then(d => { setList(d.therapists || []); setTotal(d.pagination?.total || 0) })
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [filter, page])

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background: 'var(--green-deep)' }}>
        <span className="section-tag" style={{ color: 'var(--green-pale)' }}>Our Team</span>
        <h1 className="section-title" style={{ color: 'white' }}>Find Your <em>Therapist</em></h1>
        <p className="section-desc" style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 560 }}>
          All our therapists are licensed, experienced, and committed to culturally sensitive care.
        </p>
      </div>

      <div style={{ background: 'var(--white)', padding: '1.5rem 2rem', borderBottom: '1px solid var(--earth-cream)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {SPECIALIZATIONS.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1) }}
            style={{ padding: '0.45rem 1.1rem', borderRadius: '100px', border: `1.5px solid ${filter===s ? 'var(--green-deep)' : 'var(--earth-cream)'}`, background: filter===s ? 'var(--green-deep)' : 'var(--white)', color: filter===s ? 'white' : 'var(--text-mid)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="section" style={{ background: 'var(--off-white)' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {Array.from({length:6}).map((_,i) => <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', minHeight:220, opacity:0.4 }}/>)}
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--text-light)' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔍</div>
            <p>No therapists found for this filter.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.5rem' }}>
            {list.map(t => {
              const pr = t.profiles || {}
              return (
                <div key={t.id} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'2rem', border:'1px solid var(--earth-cream)', cursor:'pointer', transition:'box-shadow 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-strong)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
                  onClick={()=>navigate('/therapist-detail',{therapistId:t.id})}>

                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1rem' }}>
                    <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--green-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, overflow:'hidden' }}>
                      {pr.avatar_url ? <img src={pr.avatar_url} alt={pr.full_name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '👩‍⚕️'}
                    </div>
                    <div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--green-deep)', fontWeight:600 }}>{pr.full_name||'Therapist'}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--text-light)', marginTop:2 }}>{t.license_type||'Licensed Therapist'}</div>
                      <span style={{ display:'inline-block', padding:'0.15rem 0.6rem', borderRadius:'100px', fontSize:'0.68rem', fontWeight:700, background: t.is_available?'#e8f8f0':'#f8f0e8', color: t.is_available?'#1a7a4a':'#8a5a1a', marginTop:4 }}>
                        {t.is_available ? '● Available' : '○ Busy'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.75rem' }}>
                    {(t.specializations||[]).slice(0,3).map((s,i)=>(
                      <span key={i} style={{ padding:'0.2rem 0.6rem', borderRadius:'100px', background:'var(--green-mist)', color:'var(--green-deep)', fontSize:'0.72rem', fontWeight:600 }}>{s}</span>
                    ))}
                  </div>

                  {pr.bio && <p style={{ fontSize:'0.82rem', color:'var(--text-light)', lineHeight:1.6, marginBottom:'0.75rem' }}>{pr.bio.slice(0,100)}…</p>}

                  <div style={{ display:'flex', justifyContent:'space-between', paddingTop:'0.75rem', borderTop:'1px solid var(--earth-cream)', marginBottom:'1rem' }}>
                    <span style={{ fontSize:'0.82rem', color:'var(--text-mid)' }}>⭐ {t.rating||'—'} · {t.experience_years||'—'} yrs</span>
                    <span style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--green-deep)' }}>NPR {t.consultation_fee?.toLocaleString()||'—'}</span>
                  </div>

                  <div style={{ display:'flex', gap:'0.75rem' }}>
                    <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', fontSize:'0.82rem', padding:'0.55rem 1rem' }}
                      onClick={e=>{e.stopPropagation();navigate('/book',{therapist:t})}}>Book Session</button>
                    <button className="btn btn-outline" style={{ fontSize:'0.82rem', padding:'0.55rem 1rem' }}
                      onClick={e=>{e.stopPropagation();navigate('/therapist-detail',{therapistId:t.id})}}>Profile</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {Math.ceil(total/LIMIT)>1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'2.5rem', alignItems:'center' }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn btn-outline" style={{opacity:page===1?0.4:1}}>← Prev</button>
            <span style={{ fontSize:'0.85rem', color:'var(--text-light)', padding:'0 1rem' }}>Page {page} of {Math.ceil(total/LIMIT)}</span>
            <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/LIMIT)} className="btn btn-outline" style={{opacity:page>=Math.ceil(total/LIMIT)?0.4:1}}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}