import { useEffect, useMemo, useState } from 'react'

/* ─── injected CSS ─── */
const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Caveat:wght@500;600;700&family=Special+Elite&family=Nunito:wght@400;600;700;800&display=swap');

  @keyframes nb-fadein   { from{opacity:0} to{opacity:1} }
  @keyframes nb-drop     { from{opacity:0; transform:translateY(-14px) rotate(var(--r,0deg))} to{opacity:1; transform:translateY(0) rotate(var(--r,0deg))} }
  @keyframes nb-sway     { 0%,100%{ transform: rotate(var(--r,0deg)) } 50%{ transform: rotate(calc(var(--r,0deg) + 0.6deg)) } }
  @keyframes nb-shine    { 0%,100%{ opacity:0.5 } 50%{ opacity:0.85 } }

  :root {
    --wood-dark:  #4a2f1c;
    --wood-mid:   #8a5a34;
    --wood-light: #c9925a;
    --cork:       #c9a86e;
    --cork-dark:  #b28c56;
    --paper-cream:#faf5e6;
    --paper-white:#fffdf7;
    --paper-yellow:#f3dd8f;
    --paper-blue: #dcebf2;
    --ink:        #2b2018;
    --ink-soft:   #4a3b2c;
    --pin-red:    #c0392b;
    --pin-blue:   #2b6ca8;
    --pin-green:  #3f7d4e;
    --pin-gold:   #c9932c;
    --brass:      #b6892f;
  }

  * { box-sizing: border-box; }

  .nb-page {
    min-height: 100vh;
    background:
      radial-gradient(
    ellipse at 50% -10%,
    rgba(255,255,255,0.9),
    rgba(220,245,255,0.35) 45%,
    transparent 65%
  ),
  linear-gradient(
    180deg,
    #87cefa 0%,
    #aee8ff 35%,
    #dff7ff 70%,
    #ffffff 100%
  );
    padding: 3.5rem 1.5rem 5rem;
    display: flex; flex-direction: column; align-items: center;
    font-family: 'Nunito', sans-serif;
  }

  /* ───────────── Header + Filters ───────────── */
  .nb-header { text-align: center; max-width: 640px; margin-bottom: 2.25rem; animation: nb-fadein 0.8s ease both; }
  .nb-kicker {
    font-size: 0.68rem; font-weight: 800; letter-spacing: 0.24em; text-transform: uppercase;
    color: var(--wood-mid); margin-bottom: 0.6rem; display: block;
  }
  .nb-title {
    font-family: 'Playfair Display', serif; font-weight: 800;
    font-size: clamp(1.7rem, 3.6vw, 2.5rem); color: var(--wood-dark); line-height: 1.15;
  }
  .nb-title em { font-style: italic; color: var(--pin-blue); }
  .nb-sub { font-size: 0.9rem; color: var(--ink-soft); margin-top: 0.6rem; line-height: 1.6; }

  .nb-filterbar {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem;
    max-width: 760px; margin-bottom: 0.9rem; animation: nb-fadein 0.9s 0.1s ease both;
  }
  .nb-pill {
    font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.78rem;
    padding: 0.5rem 1.05rem; border-radius: 100px; cursor: pointer;
    border: 1.5px solid rgba(74,47,28,0.25); background: rgba(255,253,247,0.7);
    color: var(--ink-soft); transition: all 0.2s ease; letter-spacing: 0.01em;
    display: inline-flex; align-items: center; gap: 0.4rem;
  }
  .nb-pill:hover { border-color: var(--wood-mid); background: #fff; transform: translateY(-1px); }
  .nb-pill.active {
    background: var(--wood-dark); border-color: var(--wood-dark); color: #fff4de;
    box-shadow: 0 4px 14px rgba(74,47,28,0.35);
  }
  .nb-pill-count {
    font-size: 0.68rem; font-weight: 800; background: rgba(0,0,0,0.12);
    border-radius: 100px; padding: 0.08rem 0.45rem; min-width: 1.2rem; text-align: center;
  }
  .nb-pill.active .nb-pill-count { background: rgba(255,255,255,0.22); }

  .nb-resultline {
    font-size: 0.76rem; color: var(--ink-soft); font-style: italic; margin-bottom: 2.25rem;
    animation: nb-fadein 1s 0.15s ease both;
  }

  /* ───────────── Standalone board (plaque + frame + posts) ───────────── */
  .nb-standalone { display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 1040px; }

  .nb-plaque {
    position: relative;
    background: linear-gradient(180deg, var(--wood-mid) 0%, var(--wood-dark) 100%);
    border-radius: 16px 16px 0 0;
    padding: 0.85rem 2.5rem 1.4rem;
    box-shadow: 0 -2px 0 rgba(255,255,255,0.08) inset, 0 8px 18px rgba(0,0,0,0.25);
    z-index: 2; margin-bottom: -14px;
  }
  .nb-plaque::before {
    content: ''; position: absolute; inset: 5px 5px auto 5px; height: 3px;
    background: rgba(255,255,255,0.12); border-radius: 3px;
  }
  .nb-plaque-text {
    font-family: 'Playfair Display', serif; font-weight: 800; letter-spacing: 0.06em;
    text-transform: uppercase; font-size: clamp(0.95rem, 2.1vw, 1.3rem);
    color: #f1dcae; text-align: center; white-space: nowrap;
    text-shadow: 0 1px 0 rgba(255,235,180,0.25), 0 2px 3px rgba(0,0,0,0.6);
  }

  .nb-frame {
    position: relative;
    background: linear-gradient(160deg, var(--wood-light) 0%, var(--wood-mid) 45%, var(--wood-dark) 100%);
    border-radius: 10px;
    padding: 22px;
    box-shadow: 0 22px 46px rgba(30,18,8,0.35), 0 2px 0 rgba(255,255,255,0.15) inset;
    width: 100%;
  }
  .nb-frame::before {
    content: '';
    position: absolute; inset: 10px;
    border: 2px solid rgba(0,0,0,0.18);
    border-radius: 6px;
    pointer-events: none;
  }

  .nb-hinge {
    position: absolute; width: 20px; height: 34px; background: linear-gradient(180deg, #9bd1f5, var(--brass));
    border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.25);
    z-index: 4;
  }
  .nb-hinge::after { content:''; position:absolute; top:50%; left:50%; width:5px; height:5px; background:#5c4419; border-radius:50%; transform:translate(-50%,-50%); }
  .nb-hinge.tl { top: 14px; left: 14px; }
  .nb-hinge.bl { bottom: 14px; left: 14px; }
  .nb-hinge.tr { top: 14px; right: 14px; }
  .nb-hinge.br { bottom: 14px; right: 14px; }

  .nb-latch {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 16px; height: 44px; background: linear-gradient(90deg, var(--brass), #a6f9e6, var(--brass));
    border-radius: 4px; z-index: 5; box-shadow: 0 2px 5px rgba(0,0,0,0.45);
  }
  .nb-latch::after { content:''; position:absolute; top:50%; left:50%; width:7px; height:7px; background:#5c4419; border-radius:50%; transform:translate(-50%,-50%); box-shadow: 0 0 0 2px rgba(255,255,255,0.15); }

  .nb-glasspane {
    position: relative;
    background: var(--cork);
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0, transparent 2px),
      radial-gradient(circle at 60% 70%, rgba(0,0,0,0.08) 0, transparent 2px),
      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0, transparent 2px),
      radial-gradient(circle at 35% 85%, rgba(0,0,0,0.07) 0, transparent 2px),
      radial-gradient(circle at 90% 55%, rgba(0,0,0,0.06) 0, transparent 2px),
      radial-gradient(circle at 10% 65%, rgba(0,0,0,0.06) 0, transparent 2px);
    background-size: 34px 34px;
    border-radius: 4px;
    box-shadow: inset 0 3px 18px rgba(0,0,0,0.35), inset 0 0 60px rgba(90,60,20,0.18);
    padding: 2.75rem 2rem 3rem;
    overflow: hidden;
  }
  .nb-glasspane::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 18%, transparent 32%, transparent 100%);
    pointer-events: none; animation: nb-shine 6s ease-in-out infinite;
  }
  .nb-divider {
    position: absolute; top: 0; bottom: 0; left: 50%; width: 3px; transform: translateX(-50%);
    background: linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.12), rgba(0,0,0,0.28));
    z-index: 3; box-shadow: 0 0 6px rgba(0,0,0,0.25);
  }

  .nb-board {
    position: relative; z-index: 1;
    display: flex; flex-wrap: wrap; align-content: flex-start;
    gap: 1.6rem 1.4rem;
    min-height: 320px;
  }
  .nb-empty {
    width: 100%; text-align: center; padding: 3rem 1rem; color: rgba(43,32,24,0.55);
    font-family: 'Caveat', cursive; font-size: 1.5rem;
  }

  .nb-posts { display: flex; justify-content: space-between; width: 74%; max-width: 640px; }
  .nb-post {
    width: 26px; height: 90px;
    background: linear-gradient(90deg, var(--wood-dark), var(--wood-mid) 45%, var(--wood-dark));
    border-radius: 0 0 4px 4px; box-shadow: 3px 0 8px rgba(0,0,0,0.2);
  }

  /* ───────────── Notice cards ───────────── */
  .nb-note {
    --r: 0deg;
    position: relative;
    width: 218px;
    padding: 1.1rem 1.05rem 1.2rem;
    transform: rotate(var(--r));
    box-shadow: 3px 6px 14px rgba(20,12,4,0.32), 0 1px 0 rgba(255,255,255,0.3) inset;
    animation: nb-drop 0.6s ease both, nb-sway 7s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .nb-note:hover {
    transform: rotate(0deg) translateY(-4px) scale(1.035);
    box-shadow: 4px 12px 26px rgba(20,12,4,0.4);
    z-index: 6;
  }
  .nb-note.paper-cream  { background: var(--paper-cream); }
  .nb-note.paper-white  { background: var(--paper-white); }
  .nb-note.paper-yellow { background: var(--paper-yellow); }
  .nb-note.paper-blue   { background: var(--paper-blue); }
  .nb-note.paper-lined  {
    background:
      repeating-linear-gradient(180deg, transparent 0, transparent 25px, rgba(80,120,160,0.18) 26px),
      var(--paper-white);
  }

  .nb-tag {
    display: inline-block; font-family: 'Nunito', sans-serif; font-weight: 800;
    font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: #fff; padding: 0.16rem 0.5rem; border-radius: 4px; margin-bottom: 0.55rem;
  }
  .nb-note-title {
    font-weight: 800; color: var(--ink); line-height: 1.28; margin-bottom: 0.45rem;
  }
  .nb-note.font-serif  .nb-note-title { font-family: 'Playfair Display', serif; font-size: 1.02rem; }
  .nb-note.font-hand   .nb-note-title { font-family: 'Caveat', cursive; font-size: 1.4rem; font-weight: 700; }
  .nb-note.font-type   .nb-note-title { font-family: 'Special Elite', monospace; font-size: 0.92rem; text-transform: uppercase; letter-spacing: 0.02em; }

  .nb-note-body { color: var(--ink-soft); line-height: 1.55; }
  .nb-note.font-serif  .nb-note-body { font-family: 'Lora', Georgia, serif; font-size: 0.78rem; }
  .nb-note.font-hand   .nb-note-body { font-family: 'Caveat', cursive; font-size: 1.1rem; line-height: 1.35; }
  .nb-note.font-type   .nb-note-body { font-family: 'Special Elite', monospace; font-size: 0.72rem; line-height: 1.7; }

  .nb-note-date {
    display: block; margin-top: 0.65rem; font-size: 0.64rem; font-weight: 700;
    color: rgba(43,32,24,0.5); letter-spacing: 0.04em; text-transform: uppercase;
  }

  /* pin */
  .nb-pin {
    position: absolute; top: -11px; left: 50%; transform: translateX(-50%);
    width: 18px; height: 18px; border-radius: 50%; z-index: 3;
    box-shadow: 0 3px 5px rgba(0,0,0,0.45), inset -2px -2px 3px rgba(0,0,0,0.25), inset 2px 2px 3px rgba(255,255,255,0.5);
  }
  .nb-pin.red   { background: radial-gradient(circle at 35% 30%, #ec6f5e, var(--pin-red)); }
  .nb-pin.blue  { background: radial-gradient(circle at 35% 30%, #6fa8d8, var(--pin-blue)); }
  .nb-pin.green { background: radial-gradient(circle at 35% 30%, #74c68a, var(--pin-green)); }
  .nb-pin.gold  { background: radial-gradient(circle at 35% 30%, #edc873, var(--pin-gold)); }

  /* tape */
  .nb-tape {
    position: absolute; width: 58px; height: 22px;
    background: rgba(255,255,255,0.55);
    border: 1px solid rgba(255,255,255,0.3);
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    z-index: 3;
  }
  .nb-tape.top-center { top: -12px; left: 50%; transform: translateX(-50%) rotate(-3deg); }
  .nb-tape.corner-l    { top: -10px; left: -14px; transform: rotate(-42deg); width: 46px; }
  .nb-tape.corner-r    { top: -10px; right: -14px; transform: rotate(42deg); width: 46px; }

  /* tear tabs */
  .nb-tearblock { margin-top: 0.7rem; display: flex; border-top: 1px dashed rgba(43,32,24,0.35); padding-top: 0.15rem; }
  .nb-tab {
    flex: 1; border-right: 1px dashed rgba(43,32,24,0.35);
    display: flex; align-items: center; justify-content: center;
    padding: 0.3rem 0.1rem;
  }
  .nb-tab:last-child { border-right: none; }
  .nb-tab span {
    writing-mode: vertical-rl; text-orientation: mixed;
    font-family: 'Special Elite', monospace; font-size: 0.6rem; color: var(--ink-soft);
    letter-spacing: 0.02em;
  }

  .nb-corner-fold {
    position: absolute; bottom: 0; right: 0; width: 0; height: 0;
    border-style: solid; border-width: 0 0 16px 16px;
    border-color: transparent transparent rgba(0,0,0,0.12) transparent;
  }

  /* ───────────── Responsive ───────────── */
  @media (max-width: 720px) {
    .nb-glasspane { padding: 2.25rem 1rem 2.5rem; }
    .nb-board { justify-content: center; gap: 1.4rem 1rem; }
    .nb-note { width: 45%; min-width: 150px; }
    .nb-divider { display: none; }
    .nb-posts { width: 60%; }
  }
  @media (max-width: 460px) {
    .nb-note { width: 100%; }
    .nb-plaque-text { font-size: 0.85rem; white-space: normal; }
    .nb-post { height: 60px; }
  }
`

function injectCSS(id, css) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id; el.textContent = css
  document.head.appendChild(el)
}

/* ── Data ── */
const CATEGORY_META = {
  All:            { color: '#1ea0f7' },
  Workshops:      { color: 'var(--pin-blue)' },
  'Support Groups': { color: 'var(--pin-green)' },
  Events:         { color: 'var(--pin-gold)' },
  Announcements:  { color: 'var(--pin-red)' },
  Community:      { color: '#51aff7' },
}

const NOTICES = [
  {
    id: 1, category: 'Workshops', title: 'Managing Exam Stress — Free Workshop',
    body: '2026-04-30 AWARNESS PROGRAM IN COLLABORATION WITH ABC FOUNDATION AT TRIBHUVAN UNIVERSITY २०८३-०१-१७ मा ABC फाउन्डेसनको सहकार्यमा त्रिभुवन विश्वविद्यालयमा चेतनामूलक कार्यक्रम आयोजना गरिने छ।',
    date: 'Sat 04 OCT · 10 AM', paper: 'cream', attach: 'pin', pinColor: 'blue', font: 'serif', rotate: -3,
//   },
//   {
//     id: 2, category: 'Support Groups', title: 'New Parents Circle',
//     body: 'A quiet weekly space for new mothers and fathers to talk openly about the adjustment to parenthood. Tea provided. Childcare available on request.',
//     date: 'Every Thursday · 4 PM', paper: 'blue', attach: 'pin', pinColor: 'green', font: 'hand', rotate: 2,
//   },
//   {
//     id: 3, category: 'Announcements', title: 'OFFICE CLOSED — DASHAIN FESTIVAL',
//     body: 'The centre will be closed from Kojagrat Purnima through Dashain Tika. All bookings during this period have been rescheduled — check your inbox for new times.',
//     date: 'Closed 6–19 Oct', paper: 'yellow', attach: 'tape-double', font: 'type', rotate: -1.5,
//   },
//   {
//     id: 4, category: 'Community', title: 'Volunteer Counsellors Needed',
//     body: 'We are recruiting trained volunteers for our Pokhara outreach programme. Weekend commitment, full supervision provided. Ideal for psychology graduates.',
//     date: 'Apply by 30 Jul', paper: 'cream', attach: 'pin', pinColor: 'gold', font: 'serif', rotate: 3,
//     tearTabs: ['9841-0000', '9841-0000', '9841-0000', '9841-0000', '9841-0000'],
//   },
//   {
//     id: 5, category: 'Events', title: 'World Mental Health Day Walk',
//     body: 'Join staff, clients, and families for a morning awareness walk through Bhrikutimandap, ending with music and a short talk in the park.',
//     date: 'Fri 10 Oct · 7 AM', paper: 'white', attach: 'pin', pinColor: 'red', font: 'hand', rotate: -2,
//   },
//   {
//     id: 6, category: 'Announcements', title: 'New Sliding-Scale Fee Schedule',
//     body: 'From next month, session fees will be assessed on a wider income-based scale so more families can access regular therapy. Ask reception for details.',
//     date: 'Effective 1 Aug', paper: 'lined', attach: 'tape', font: 'type', rotate: 1.5,
//   },
//   {
//     id: 7, category: 'Workshops', title: 'Teen Mindfulness Circle',
//     body: 'A relaxed after-school group for ages 13–17 covering focus, sleep, and screen-time habits through simple guided practice. No experience needed.',
//     date: 'Saturdays · 4 PM', paper: 'cream', attach: 'pin', pinColor: 'blue', font: 'hand', rotate: -3.5,
//   },
//   {
//     id: 8, category: 'Events', title: 'Free Screening Camp — Butwal Schools',
//     body: 'Our outreach team will run confidential wellbeing screenings in partnership with three local secondary schools. Parents welcome to attend the info session.',
//     date: 'Mon 3 Aug · All day', paper: 'white', attach: 'pin', pinColor: 'gold', font: 'serif', rotate: 2.5,
//   },
//   {
//     id: 9, category: 'Community', title: 'Clinical Psychologist — Vacancy',
//     body: 'Full-time position open for a licensed clinical psychologist to join our Kathmandu team. Nepali and English fluency required. Send CV to reception.',
//     date: 'Rolling applications', paper: 'yellow', attach: 'tape-double', font: 'type', rotate: -2,
//   },
//   {
//     id: 10, category: 'Support Groups', title: 'Grief & Loss Group',
//     body: 'A gentle, confidential space held twice monthly for anyone navigating bereavement. Facilitated by a trained grief counsellor. First session is free.',
//     date: '2nd & 4th Tue · 5 PM', paper: 'blue', attach: 'pin', pinColor: 'green', font: 'serif', rotate: 3,
  }
]

const CATEGORIES = ['All', ...Array.from(new Set(NOTICES.map(n => n.category)))]

/* ── Notice card ── */
function NoticeCard({ n, index }) {
  const style = { '--r': `${n.rotate}deg`, animationDelay: `${index * 0.05}s` }
  return (
    <div className={`nb-note paper-${n.paper} font-${n.font}`} style={style}>
      {n.attach === 'pin' && <span className={`nb-pin ${n.pinColor}`} />}
      {n.attach === 'tape' && <span className="nb-tape top-center" />}
      {n.attach === 'tape-double' && (
        <>
          <span className="nb-tape corner-l" />
          <span className="nb-tape corner-r" />
        </>
      )}
      <span className="nb-tag" style={{ background: CATEGORY_META[n.category]?.color || '#4a2f1c' }}>
        {n.category}
      </span>
      <div className="nb-note-title">{n.title}</div>
      <div className="nb-note-body">{n.body}</div>
      <span className="nb-note-date">{n.date}</span>
      {n.tearTabs && (
        <div className="nb-tearblock">
          {n.tearTabs.map((t, i) => (
            <div className="nb-tab" key={i}><span>{t}</span></div>
          ))}
        </div>
      )}
      <span className="nb-corner-fold" />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function NoticeBoardPage() {
  const [active, setActive] = useState('All')

  useEffect(() => {
useEffect(() => {
    injectCSS('notice-board-page-css', PAGE_CSS)
    return () => document.getElementById('notice-board-page-css')?.remove()
  }, [])  }, [])

  const counts = useMemo(() => {
    const c = { All: NOTICES.length }
    NOTICES.forEach(n => { c[n.category] = (c[n.category] || 0) + 1 })
    return c
  }, [])

  const filtered = useMemo(
    () => (active === 'All' ? NOTICES : NOTICES.filter(n => n.category === active)),
    [active]
  )

  return (
    <div className="nb-page">

      <div className="nb-header">
        <span className="nb-kicker">Common Psychology · Kathmandu</span>
        <h1 className="nb-title">The <em>Notice Board</em></h1>
        <p className="nb-sub">Workshops, support groups, and news from the centre — pinned up and updated as they happen.</p>
      </div>

      <div className="nb-filterbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`nb-pill${active === cat ? ' active' : ''}`}
            onClick={() => setActive(cat)}
          >
            {cat}
            <span className="nb-pill-count">{counts[cat] || 0}</span>
          </button>
        ))}
      </div>
      <div className="nb-resultline">
        Showing {filtered.length} of {NOTICES.length} notices
      </div>

      <div className="nb-standalone">
        <div className="nb-plaque">
          <div className="nb-plaque-text">Common Psychology Notice Board</div>
        </div>

        <div className="nb-frame">
          <span className="nb-hinge tl" />
          <span className="nb-hinge bl" />
          <span className="nb-hinge tr" />
          <span className="nb-hinge br" />
          <span className="nb-latch" />

          <div className="nb-glasspane">
            <span className="nb-divider" />
            <div className="nb-board">
              {filtered.length === 0 && (
                <div className="nb-empty">Nothing pinned here yet — try another category.</div>
              )}
              {filtered.map((n, i) => <NoticeCard key={n.id} n={n} index={i} />)}
            </div>
          </div>
        </div>

        <div className="nb-posts">
          <div className="nb-post" />
          <div className="nb-post" />
        </div>
      </div>

    </div>
  )
}