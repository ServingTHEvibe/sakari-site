import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Menu as MenuIcon, X, ShoppingBag, Plus, Minus, Phone, MapPin, Clock, Search,
  ChevronLeft, ChevronRight, Star, Users, CalendarDays, ArrowRight, ArrowUpRight, Check, Gift, Truck,
} from 'lucide-react'
import { TESTIMONIALS, MENU_TABS, MENU_DATA, SPECIALS } from './data.js'

gsap.registerPlugin(ScrollTrigger)

const PHONE = '5152883381'
const PHONE_FMT = '(515) 288-3381'
const EMAIL = 'sakarisushilounge@gmail.com'
const ADDRESS = '2605 Ingersoll Ave, Des Moines, IA 50312'
const MAPS = 'https://maps.google.com/?q=Sakari+Sushi+Lounge+2605+Ingersoll+Ave+Des+Moines+IA'
const GRUBHUB = 'https://www.grubhub.com/search?queryText=sakari%20sushi%20lounge'
const DOORDASH = 'https://www.doordash.com/search/store/sakari%20sushi%20lounge/'
const img = (n) => `/img/spot_${n}.webp`
const ease = [0.22, 1, 0.36, 1]

// Hours in minutes from midnight, America/Chicago. 0=Sun
const HOURS = {
  0: [[17 * 60, 21 * 60]],
  1: [[11 * 60, 14 * 60], [17 * 60, 22 * 60]],
  2: [[11 * 60, 14 * 60], [17 * 60, 21 * 60]],
  3: [[11 * 60, 14 * 60], [17 * 60, 21 * 60]],
  4: [[11 * 60, 14 * 60], [17 * 60, 21 * 60]],
  5: [[11 * 60, 23 * 60]],
  6: [[11 * 60, 23 * 60]],
}
const HOURS_LIST = [
  ['Monday', 'Lunch 11–2 · Dinner 5–10'],
  ['Tue – Thu', 'Lunch 11–2 · Dinner 5–9'],
  ['Friday', '11AM – 11PM'],
  ['Saturday', '11AM – 11PM'],
  ['Sunday', '5PM – 9PM'],
]
const fmtT = (m) => { const h = Math.floor(m / 60), mm = m % 60; return `${((h + 11) % 12) + 1}${mm ? ':' + String(mm).padStart(2, '0') : ''}${h < 12 ? 'AM' : 'PM'}` }
function chicagoNow() {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date())
  const g = (t) => p.find((x) => x.type === t)?.value
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday'))
  return { day, min: (parseInt(g('hour')) % 24) * 60 + parseInt(g('minute')) }
}
function useOpenStatus() {
  const [s, setS] = useState(null)
  useEffect(() => {
    const calc = () => {
      const { day, min } = chicagoNow()
      const cur = HOURS[day].find(([a, b]) => min >= a && min < b)
      if (cur) return setS({ open: true, text: `Open now · until ${fmtT(cur[1])}`, day })
      const later = HOURS[day].find(([a]) => a > min)
      if (later) return setS({ open: false, text: `Closed · opens ${fmtT(later[0])} today`, day })
      const nd = (day + 1) % 7
      setS({ open: false, text: `Closed · opens ${fmtT(HOURS[nd][0][0])} ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][nd]}`, day })
    }
    calc(); const t = setInterval(calc, 60000); return () => clearInterval(t)
  }, [])
  return s
}
const priceNum = (p) => { const m = String(p).match(/[\d.]+/); return m ? parseFloat(m[0]) : 0 }
const money = (n) => `$${n.toFixed(2)}`

// ── Reveal helper ───────────────────────────────────────────────
const Reveal = ({ children, delay = 0, y = 40, className = '', as = 'div' }) => {
  const M = motion[as]
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9, ease, delay }}>
      {children}
    </M>
  )
}
const SplitWords = ({ text, className = '', delay = 0 }) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((w, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
        <motion.span className="inline-block" initial={{ y: '110%' }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease, delay: delay + i * 0.06 }}>
          {w}&nbsp;
        </motion.span>
      </span>
    ))}
  </span>
)
const Eyebrow = ({ children, light }) => (
  <p className={`eyebrow ${light ? 'text-ink/60' : ''}`}><span className="eyebrow-dot" />{children}</p>
)

// ── Preloader ───────────────────────────────────────────────────
function Preloader({ done }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="fixed inset-0 z-[100] bg-[#0b0908] flex items-center justify-center" exit={{ clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 1, ease }}>
          <div className="text-center">
            <motion.img src="/img/logo_top.png" alt="Sakari" className="w-48 mx-auto" initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 1, ease }} />
            <motion.div className="h-px bg-[#c41230] mt-6 mx-auto" initial={{ width: 0 }} animate={{ width: 180 }} transition={{ duration: 1.3, ease }} />
            <motion.p className="mt-4 font-jp text-[#c41230] tracking-[0.5em] text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>サカリ</motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Nav ─────────────────────────────────────────────────────────
function Nav({ cartCount, onCart, onReserve, status }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => { const f = () => setScrolled(window.scrollY > 40); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])
  const links = [['Menu', '#menu'], ['Specials', '#specials'], ['Gallery', '#gallery'], ['Events', '#events'], ['Visit', '#visit']]
  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-[#0b0908]/85 backdrop-blur-xl border-b border-white/5' : 'py-6'}`}>
        <div className="wrap flex items-center justify-between gap-6">
          <a href="#top" className="shrink-0"><img src="/img/logo_top.png" alt="Sakari Sushi Lounge" className={`transition-all duration-500 ${scrolled ? 'h-9' : 'h-12'}`} /></a>
          <nav className="hidden lg:flex items-center gap-9">
            {links.map(([l, h]) => <a key={l} href={h} className="navlink">{l}</a>)}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {status && <span className="hidden xl:inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white/60"><span className={`w-1.5 h-1.5 rounded-full ${status.open ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />{status.text}</span>}
            <button onClick={onCart} className="relative icon-btn" aria-label="Open order">
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#c41230] text-[10px] font-semibold grid place-items-center">{cartCount}</span>}
            </button>
            <button onClick={onReserve} className="btn-primary hidden sm:inline-flex">Reserve</button>
            <button onClick={() => setOpen(true)} className="icon-btn lg:hidden" aria-label="Menu"><MenuIcon size={18} /></button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] bg-[#0b0908] flex flex-col" initial={{ clipPath: 'circle(0% at 100% 0%)' }} animate={{ clipPath: 'circle(150% at 100% 0%)' }} exit={{ clipPath: 'circle(0% at 100% 0%)' }} transition={{ duration: 0.7, ease }}>
            <div className="wrap flex justify-between items-center py-6"><img src="/img/logo_top.png" className="h-10" alt="" /><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>
            <div className="wrap flex-1 flex flex-col justify-center gap-4">
              {links.map(([l, h], i) => (
                <motion.a key={l} href={h} onClick={() => setOpen(false)} className="font-display text-6xl text-white" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06, ease }}>{l}</motion.a>
              ))}
              <button onClick={() => { setOpen(false); onReserve() }} className="btn-primary mt-8 self-start">Reserve a table</button>
            </div>
            <div className="wrap py-8 text-white/50 text-sm">{ADDRESS} · <a href={`tel:${PHONE}`}>{PHONE_FMT}</a></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Hero ────────────────────────────────────────────────────────
function Hero({ ready, onReserve, status }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  return (
    <section id="top" ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-black">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <video className="w-full h-full object-cover opacity-80" src="/img/hero.mp4" poster="/img/video_poster.jpg" autoPlay muted loop playsInline />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-[#0b0908]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
      <motion.div style={{ opacity: fade }} className="relative z-10 h-full wrap flex flex-col justify-end pb-16 md:pb-24">
        <motion.p className="font-jp text-[#c41230] text-xs md:text-sm tracking-[0.3em] md:tracking-[0.6em] mb-6" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.3 }}>
          サカリ — SA·KA·RI — THE PEAK
        </motion.p>
        <h1 className="font-display text-white leading-[0.88] text-[17vw] md:text-[11vw] lg:text-[9.5rem] tracking-tight">
          {['Sushi at', 'its summit.'].map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span className={`block ${i === 1 ? 'italic text-[#e8d9c4]' : ''}`} initial={{ y: '105%' }} animate={ready ? { y: 0 } : {}} transition={{ duration: 1.2, ease, delay: 0.15 + i * 0.12 }}>{line}</motion.span>
            </span>
          ))}
        </h1>
        <motion.div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8" initial={{ opacity: 0, y: 30 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease, delay: 0.6 }}>
          <p className="max-w-md text-white/70 text-lg leading-relaxed">
            Ingersoll Avenue&apos;s sushi lounge. Creative rolls, prime steaks off the grill, sake bombs and a room that hums every night of the week.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#menu" className="btn-primary">Order pickup <ArrowRight size={16} /></a>
            <button onClick={onReserve} className="btn-ghost">Book a table</button>
          </div>
        </motion.div>
        {status && (
          <motion.div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 text-[11px] uppercase tracking-[0.2em] text-white/50 border-t border-white/10 pt-6" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 1 }}>
            <span className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${status.open ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'}`} />{status.text}</span>
            <span>4.5★ · 1,700+ reviews</span>
            <span>Voted Best Sushi in Des Moines</span>
            <span className="hidden md:inline">{ADDRESS}</span>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

// ── Marquee ─────────────────────────────────────────────────────
function Marquee() {
  const items = ['Godzilla', 'Iowa Surf & Turf', 'Phoenix', 'Bruce Lee', 'Sake Bombs', 'Dynamite Shrimp', 'Wagyu', 'Volcano', 'Happy Hour', 'White Tiger']
  return (
    <div className="border-y border-white/5 py-6 overflow-hidden bg-[#0b0908]">
      <div className="marquee">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="font-display italic text-4xl md:text-5xl text-white/80 px-8 flex items-center gap-16 shrink-0">{t}<span className="text-[#c41230] not-italic text-2xl">✦</span></span>
        ))}
      </div>
    </div>
  )
}

// ── Story ───────────────────────────────────────────────────────
function Counter({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null); const [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect()
      const o = { v: 0 }; gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => setV(o.v) })
    }); io.observe(el); return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>
}
function Story() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [80, -80])
  const y2 = useTransform(scrollYProgress, [0, 1], [-40, 120])
  return (
    <section ref={ref} className="relative py-28 md:py-40 bg-[#0b0908] overflow-hidden">
      <div className="absolute -right-10 top-10 font-jp text-[28vw] leading-none text-white/[0.025] select-none pointer-events-none">盛</div>
      <div className="wrap grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-5 relative z-10">
          <Eyebrow>Our story</Eyebrow>
          <h2 className="h2 mt-6"><SplitWords text="To be at one's" /><br /><SplitWords className="italic text-[#e8d9c4]" text="very best." delay={0.2} /></h2>
          <Reveal delay={0.2}>
            <p className="body mt-8">
              <em className="text-white">Sakari</em> (sa·kar·i) — summit, peak, prime. It&apos;s the bar we set for every plate that leaves the line. Tucked on Ingersoll near Gray&apos;s Lake and downtown, we pair a full sushi bar with a hot grill and a full liquor bar — so the sashimi purist and the ribeye guy both leave happy.
            </p>
            <p className="body mt-5">Fresh fish, rolls built to order, award-winning wings, and a lounge that turns into the best party on the block after dark.</p>
          </Reveal>
          <div className="grid grid-cols-3 gap-6 mt-12 border-t border-white/10 pt-8">
            {[[4.5, '★', 1, 'Average rating'], [22, '', 0, 'Signature rolls'], [30, '', 0, 'Seat party room']].map(([n, s, d, l]) => (
              <div key={l}><p className="font-display text-5xl text-white"><Counter to={n} suffix={s} decimals={d} /></p><p className="text-[11px] uppercase tracking-[0.18em] text-white/45 mt-2">{l}</p></div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-7 relative h-[560px] md:h-[680px]">
          <motion.div style={{ y: y1 }} className="absolute right-0 top-0 w-[68%] h-[78%] overflow-hidden rounded-sm img-frame"><img src="/img/about_us_1.webp" alt="Sakari sushi" className="w-full h-full object-cover" loading="lazy" /></motion.div>
          <motion.div style={{ y: y2 }} className="absolute left-0 bottom-0 w-[50%] h-[55%] overflow-hidden rounded-sm img-frame border-8 border-[#0b0908]"><img src="/img/about_us_2.webp" alt="Sakari lounge" className="w-full h-full object-cover" loading="lazy" /></motion.div>
          <div className="absolute left-[44%] top-[12%] w-28 h-28 rounded-full border border-[#c41230]/60 grid place-items-center spin-slow">
            <svg viewBox="0 0 100 100" className="w-full h-full absolute"><defs><path id="c" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs><text fill="#e8d9c4" fontSize="9" letterSpacing="3"><textPath href="#c">EST. ON INGERSOLL · DES MOINES · </textPath></text></svg>
            <span className="font-jp text-[#c41230] text-2xl">盛</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Scroll film (frame sequence) ────────────────────────────────
const FRAME_COUNT = 90
function ScrollFilm() {
  const wrap = useRef(null); const canvas = useRef(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    const c = canvas.current; const ctx = c.getContext('2d'); const imgs = []; let cur = 0
    const draw = (i) => {
      const im = imgs[i]; if (!im || !im.complete || !im.naturalWidth) return
      const dpr = Math.min(window.devicePixelRatio, 2); c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr
      const s = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight)
      const w = im.naturalWidth * s, h = im.naturalHeight * s
      ctx.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h)
    }
    for (let i = 0; i < FRAME_COUNT; i++) { const im = new Image(); im.src = `/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`; if (i === 0) im.onload = () => draw(0); imgs.push(im) }
    const st = ScrollTrigger.create({
      trigger: wrap.current, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (s) => { const i = Math.min(FRAME_COUNT - 1, Math.floor(s.progress * FRAME_COUNT)); setP(s.progress); if (i !== cur) { cur = i; requestAnimationFrame(() => draw(i)) } },
    })
    const r = () => draw(cur); window.addEventListener('resize', r)
    return () => { st.kill(); window.removeEventListener('resize', r) }
  }, [])
  const notes = [
    [0.12, 0.34, 'Rolled to order', 'Nothing sits. Nothing waits.'],
    [0.38, 0.62, 'Fish you can taste', 'Tuna, salmon, hamachi, escolar — cut daily.'],
    [0.66, 0.95, 'Built to be photographed', 'You eat with your eyes first.'],
  ]
  return (
    <section ref={wrap} className="relative h-[320vh] bg-black">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvas} className="w-full h-full block" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        {notes.map(([a, b, t, s], i) => {
          const on = p >= a && p <= b
          return (
            <div key={i} className={`absolute ${i % 2 ? 'right-6 md:right-16 text-right' : 'left-6 md:left-16'} bottom-24 md:bottom-32 max-w-sm transition-all duration-700 ${on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <p className="text-[11px] tracking-[0.3em] text-[#c41230] uppercase mb-3">0{i + 1} / 03</p>
              <p className="font-display text-4xl md:text-6xl text-white leading-none">{t}</p>
              <p className="text-white/60 mt-3">{s}</p>
            </div>
          )
        })}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-40 h-px bg-white/15"><div className="h-full bg-[#c41230]" style={{ width: `${p * 100}%` }} /></div>
      </div>
    </section>
  )
}

// ── Signature (horizontal pinned) ───────────────────────────────
const SIGS = [
  { n: 34, name: 'Volcano', d: 'Spicy tuna, cucumber, seared red tuna, honey wasabi.', p: 16 },
  { n: 12, name: 'Godzilla', d: 'Tempura shrimp, cream cheese, spicy tuna, unagi. The legend.', p: 17 },
  { n: 32, name: 'Incredible Hulk', d: 'Tempura shrimp & crab, avocado, crunch, unagi.', p: 16 },
  { n: 20, name: 'Tuna Tataki Roll', d: 'Marinated tuna, seaweed salad, honey wasabi.', p: 18 },
  { n: 35, name: 'Beef Roll Up', d: 'Seared top sirloin over tempura shrimp & cream cheese.', p: 18 },
  { n: 29, name: 'Dragon', d: 'Tempura shrimp under eel, avocado & unagi.', p: 16 },
]
function Signature({ addItem }) {
  const sec = useRef(null); const track = useRef(null)
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 900px)', () => {
      const t = track.current
      const tw = gsap.to(t, { x: () => -(t.scrollWidth - window.innerWidth), ease: 'none', scrollTrigger: { trigger: sec.current, start: 'top top', end: () => `+=${t.scrollWidth - window.innerWidth}`, scrub: 1, pin: true, invalidateOnRefresh: true } })
      return () => tw.kill()
    })
    return () => mm.revert()
  }, [])
  return (
    <section ref={sec} className="relative bg-[#0b0908] overflow-hidden">
      <div className="min-h-[100svh] flex flex-col justify-center py-24">
        <div className="wrap mb-12 flex items-end justify-between gap-6">
          <div><Eyebrow>Signature rolls</Eyebrow><h2 className="h2 mt-5">The ones people <span className="italic text-[#e8d9c4]">drive in for.</span></h2></div>
          <p className="hidden md:block text-white/50 max-w-xs">Scroll the line-up. Tap + to add any roll to your pickup order.</p>
        </div>
        <div ref={track} className="flex gap-6 md:gap-8 px-5 md:pl-[max(2rem,calc((100vw-1320px)/2))] md:pr-16 overflow-x-auto md:overflow-visible snap-x no-scrollbar">
          {SIGS.map((s, i) => (
            <article key={s.name} className="group relative shrink-0 w-[80vw] sm:w-[420px] snap-start">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm img-frame">
                <img src={img(s.n)} alt={s.name} className="w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <span className="absolute top-5 left-5 text-[11px] tracking-[0.25em] text-white/70">N°{String(i + 1).padStart(2, '0')}</span>
                <button onClick={() => addItem({ name: s.name, price: `$${s.p}.00` })} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white text-black grid place-items-center hover:bg-[#c41230] hover:text-white transition-colors" aria-label={`Add ${s.name}`}><Plus size={18} /></button>
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <div className="flex items-baseline justify-between"><h3 className="font-display text-4xl text-white">{s.name}</h3><span className="text-[#e8d9c4]">${s.p}</span></div>
                  <p className="text-white/60 text-sm mt-2">{s.d}</p>
                </div>
              </div>
            </article>
          ))}
          <div className="shrink-0 w-[80vw] sm:w-[420px] aspect-[4/5] border border-white/10 rounded-sm flex flex-col justify-center items-center text-center p-10">
            <p className="font-display text-5xl text-white">+16 more</p>
            <p className="text-white/50 mt-3">Fire Cracker, Phoenix, Lion King, White Tiger, Hawkeye…</p>
            <a href="#menu" className="btn-primary mt-8">Full menu <ArrowRight size={16} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Menu ────────────────────────────────────────────────────────
const TAB_IMG = { signature: 41, house: 30, apps: 38, sashimi: 33, grill: 25, bar: 24, desserts: 17 }
function MenuSection({ addItem, cart }) {
  const [tab, setTab] = useState('signature')
  const [q, setQ] = useState('')
  const items = useMemo(() => {
    if (q.trim()) {
      const s = q.toLowerCase()
      return Object.entries(MENU_DATA).flatMap(([k, arr]) => arr.filter((x) => (x.name + x.desc).toLowerCase().includes(s)).map((x) => ({ ...x, cat: k })))
    }
    return MENU_DATA[tab]
  }, [tab, q])
  const qty = (n) => cart.find((c) => c.name === n)?.qty || 0
  return (
    <section id="menu" className="relative py-28 md:py-36 bg-[#f3ece2] text-ink">
      <div className="wrap">
        <div className="grid lg:grid-cols-12 gap-10 items-end mb-14">
          <div className="lg:col-span-7"><Eyebrow light>The menu</Eyebrow><h2 className="h2 mt-5 text-ink">Order it. <span className="italic text-[#c41230]">Pick it up hot.</span></h2></div>
          <div className="lg:col-span-5">
            <p className="text-ink/70">Build your pickup order right here, then send it straight to the kitchen. Prefer delivery? We&apos;re on Grubhub & DoorDash.</p>
            <div className="relative mt-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rolls, nigiri, steak…" className="w-full bg-white/70 border border-ink/10 rounded-full py-3.5 pl-11 pr-4 outline-none focus:border-[#c41230] transition" />
            </div>
          </div>
        </div>
        {!q && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-10 -mx-5 px-5">
            {MENU_TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`relative shrink-0 px-5 py-2.5 rounded-full text-sm transition ${tab === t.id ? 'text-white' : 'text-ink/70 hover:text-ink border border-ink/10'}`}>
                {tab === t.id && <motion.span layoutId="tabpill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="grid lg:grid-cols-12 gap-10">
          {!q && (
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-28">
                <AnimatePresence mode="wait">
                  <motion.div key={tab} initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease }} className="aspect-[3/4] overflow-hidden rounded-sm">
                    <img src={img(TAB_IMG[tab])} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                </AnimatePresence>
                <p className="mt-4 text-xs tracking-[0.2em] uppercase text-ink/50">{MENU_TABS.find((t) => t.id === tab)?.label} · {MENU_DATA[tab].length} items</p>
              </div>
            </div>
          )}
          <div className={q ? 'lg:col-span-12' : 'lg:col-span-8'}>
            {q && <p className="mb-6 text-ink/60">{items.length} result{items.length !== 1 && 's'} for “{q}”</p>}
            <div className={`grid gap-x-10 ${q ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
              <AnimatePresence mode="popLayout">
                {items.map((it, i) => (
                  <motion.div layout key={(it.cat || tab) + it.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: Math.min(i * 0.02, 0.3) }} className="group py-5 border-b border-ink/10 flex gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-display text-2xl text-ink leading-tight">{it.name}</h3>
                        <span className="flex-1 border-b border-dotted border-ink/20 translate-y-[-4px]" />
                        <span className="font-medium text-ink">{it.price}</span>
                      </div>
                      <p className="text-sm text-ink/60 mt-1.5 leading-relaxed">{it.desc}</p>
                      {it.tag && <span className="inline-block mt-2 text-[10px] uppercase tracking-[0.18em] text-[#c41230]">{it.tag}</span>}
                    </div>
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button onClick={() => addItem(it)} className="w-9 h-9 rounded-full border border-ink/15 grid place-items-center hover:bg-[#c41230] hover:border-[#c41230] hover:text-white transition" aria-label={`Add ${it.name}`}><Plus size={16} /></button>
                      {qty(it.name) > 0 && <span className="text-[11px] text-[#c41230] font-semibold">×{qty(it.name)}</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-12 flex flex-wrap gap-3">
              <a href={GRUBHUB} target="_blank" rel="noreferrer" className="btn-dark"><Truck size={16} /> Delivery · Grubhub</a>
              <a href={DOORDASH} target="_blank" rel="noreferrer" className="btn-dark-ghost"><Truck size={16} /> Delivery · DoorDash</a>
              <a href="https://sakarisushilounge.com/des-moines-sakari-sushi-lounge-food-menu" target="_blank" rel="noreferrer" className="btn-dark-ghost">Full printable menu <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Specials ────────────────────────────────────────────────────
const DAY_IDX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
function Specials({ status }) {
  const today = status?.day ?? new Date().getDay()
  const [sel, setSel] = useState(null)
  const active = SPECIALS.find((s) => DAY_IDX[s.day] === (sel ?? today)) || SPECIALS[0]
  const photos = { Mon: 9, Tue: 25, Wed: 19, Thu: 24, Fri: 31, Sat: 3, Sun: 28 }
  return (
    <section id="specials" className="relative py-28 md:py-36 bg-[#0b0908] overflow-hidden">
      <div className="wrap">
        <Eyebrow>Every night is a night</Eyebrow>
        <h2 className="h2 mt-5 max-w-3xl">Seven days. <span className="italic text-[#e8d9c4]">Seven reasons</span> to come back.</h2>
        <div className="mt-14 grid grid-cols-7 border border-white/10 rounded-sm overflow-hidden">
          {SPECIALS.map((s) => {
            const idx = DAY_IDX[s.day]; const isSel = idx === (sel ?? today)
            return (
              <button key={s.day} onClick={() => setSel(idx)} className={`relative py-5 md:py-7 text-center transition ${isSel ? 'bg-[#c41230] text-white' : 'text-white/60 hover:bg-white/5'} border-r border-white/10 last:border-r-0`}>
                <span className="font-display text-xl md:text-3xl block">{s.day}</span>
                {idx === today && <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] block mt-1">{isSel ? 'Today' : '• today'}</span>}
              </button>
            )
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease }} className="grid md:grid-cols-2 gap-0 border border-t-0 border-white/10">
            <div className="aspect-[16/11] md:aspect-auto overflow-hidden"><img src={img(photos[active.day])} alt="" className="w-full h-full object-cover" /></div>
            <div className="p-8 md:p-14 flex flex-col justify-center">
              <p className="text-[11px] tracking-[0.25em] uppercase text-[#c41230]">{active.time}</p>
              <h3 className="font-display text-5xl md:text-7xl text-white mt-4 leading-none">{active.name}</h3>
              <p className="text-white/70 text-lg mt-6">{active.highlight}</p>
              <div className="mt-10 flex gap-3 flex-wrap"><a href="#menu" className="btn-primary">See the menu</a><a href={`tel:${PHONE}`} className="btn-ghost"><Phone size={15} /> {PHONE_FMT}</a></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ── Gallery + lightbox ──────────────────────────────────────────
const GALLERY = [5, 3, 22, 6, 21, 40, 13, 1, 23, 27, 36, 14, 26, 15, 7, 18, 10, 37]
function Gallery() {
  const [lb, setLb] = useState(-1)
  const go = useCallback((d) => setLb((i) => (i + d + GALLERY.length) % GALLERY.length), [])
  useEffect(() => {
    if (lb < 0) return
    const k = (e) => { if (e.key === 'Escape') setLb(-1); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [lb, go])
  return (
    <section id="gallery" className="py-28 md:py-36 bg-[#0b0908]">
      <div className="wrap flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div><Eyebrow>Inside Sakari</Eyebrow><h2 className="h2 mt-5">The room. <span className="italic text-[#e8d9c4]">The plates.</span></h2></div>
        <a href="https://www.instagram.com/sakarisushilounge" target="_blank" rel="noreferrer" className="navlink">@sakarisushilounge <ArrowUpRight size={14} className="inline" /></a>
      </div>
      <div className="px-3 md:px-6 columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
        {GALLERY.map((n, i) => (
          <Reveal key={n} delay={(i % 4) * 0.06} y={30} className="mb-3 md:mb-4 break-inside-avoid">
            <button onClick={() => setLb(i)} className={`group relative block w-full overflow-hidden rounded-sm ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'}`}>
              <img src={img(n)} alt="Sakari Sushi Lounge" loading="lazy" className="w-full h-full object-cover transition duration-[1.2s] group-hover:scale-105" />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
            </button>
          </Reveal>
        ))}
      </div>
      <AnimatePresence>
        {lb >= 0 && (
          <motion.div className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLb(-1)}>
            <AnimatePresence mode="wait">
              <motion.img key={lb} src={img(GALLERY[lb])} className="max-h-[85vh] max-w-[90vw] object-contain" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={(e) => e.stopPropagation()} />
            </AnimatePresence>
            <button className="icon-btn absolute top-6 right-6" onClick={() => setLb(-1)} aria-label="Close"><X size={18} /></button>
            <button className="icon-btn absolute left-4 md:left-8" onClick={(e) => { e.stopPropagation(); go(-1) }} aria-label="Previous"><ChevronLeft size={20} /></button>
            <button className="icon-btn absolute right-4 md:right-8" onClick={(e) => { e.stopPropagation(); go(1) }} aria-label="Next"><ChevronRight size={20} /></button>
            <p className="absolute bottom-6 text-white/50 text-sm">{lb + 1} / {GALLERY.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Events / private parties ────────────────────────────────────
function Field({ label, as, children, ...p }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">{label}</span>
      {as === 'textarea' ? <textarea {...p} className="field min-h-24" /> : as === 'select' ? <select {...p} className="field">{children}</select> : <input {...p} className="field" />}
    </label>
  )
}
function Events() {
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({ name: '', phone: '', email: '', date: '', guests: '20', type: 'Birthday', notes: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const body = `Private event inquiry\n\nName: ${f.name}\nPhone: ${f.phone}\nEmail: ${f.email}\nDate: ${f.date}\nGuests: ${f.guests}\nOccasion: ${f.type}\n\n${f.notes}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Private Party Inquiry — ${f.name} (${f.guests} guests)`)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }
  return (
    <section id="events" className="relative py-28 md:py-36 bg-[#120d0c] overflow-hidden">
      <div className="wrap grid lg:grid-cols-2 gap-14 lg:gap-20">
        <div>
          <Eyebrow>Private parties & catering</Eyebrow>
          <h2 className="h2 mt-5">Your night. <span className="italic text-[#e8d9c4]">Our room.</span></h2>
          <p className="body mt-8 max-w-lg">Our private party room seats 30 comfortably — birthdays, holiday parties, rehearsal dinners, team nights. Full bar, sushi platters, grill trays and a team that runs it all so you don&apos;t have to. We cater off-site too.</p>
          <div className="grid grid-cols-2 gap-3 mt-10">
            <div className="aspect-[4/3] overflow-hidden rounded-sm"><img src={img(13)} alt="Private party room" className="w-full h-full object-cover" loading="lazy" /></div>
            <div className="aspect-[4/3] overflow-hidden rounded-sm"><img src={img(42)} alt="Party set-up" className="w-full h-full object-cover" loading="lazy" /></div>
          </div>
          <ul className="mt-10 grid sm:grid-cols-2 gap-4 text-white/70">
            {['Private room · up to 30 guests', 'Custom sushi & grill platters', 'Full bar & sake bomb packages', 'Off-site catering & food truck'].map((t) => <li key={t} className="flex gap-3 items-start"><Check size={18} className="text-[#c41230] mt-0.5 shrink-0" />{t}</li>)}
          </ul>
        </div>
        <div className="lg:pt-16">
          <div className="border border-white/10 bg-white/[0.02] backdrop-blur p-7 md:p-10 rounded-sm">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-[#c41230] grid place-items-center mx-auto"><Check /></div>
                  <h3 className="font-display text-4xl text-white mt-6">Inquiry ready to send</h3>
                  <p className="text-white/60 mt-3">Your email app opened with the details filled in. Hit send — or call us at <a className="text-white underline" href={`tel:${PHONE}`}>{PHONE_FMT}</a> to lock the date.</p>
                  <button onClick={() => setSent(false)} className="btn-ghost mt-8">Edit inquiry</button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} className="grid sm:grid-cols-2 gap-5">
                  <h3 className="sm:col-span-2 font-display text-4xl text-white">Plan your party</h3>
                  <Field label="Name" required value={f.name} onChange={set('name')} />
                  <Field label="Phone" required type="tel" value={f.phone} onChange={set('phone')} />
                  <div className="sm:col-span-2"><Field label="Email" required type="email" value={f.email} onChange={set('email')} /></div>
                  <Field label="Date" required type="date" value={f.date} onChange={set('date')} min={new Date().toISOString().slice(0, 10)} />
                  <Field label="Guests" as="select" value={f.guests} onChange={set('guests')}>{['10', '15', '20', '25', '30', '30+ / catering'].map((g) => <option key={g}>{g}</option>)}</Field>
                  <div className="sm:col-span-2"><Field label="Occasion" as="select" value={f.type} onChange={set('type')}>{['Birthday', 'Holiday party', 'Corporate', 'Rehearsal dinner', 'Catering (off-site)', 'Other'].map((g) => <option key={g}>{g}</option>)}</Field></div>
                  <div className="sm:col-span-2"><Field label="Anything we should know?" as="textarea" value={f.notes} onChange={set('notes')} /></div>
                  <button className="btn-primary sm:col-span-2 justify-center py-4">Send inquiry <ArrowRight size={16} /></button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ────────────────────────────────────────────────
function Reviews() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % TESTIMONIALS.length), 6000); return () => clearInterval(t) }, [])
  const r = TESTIMONIALS[i]
  return (
    <section className="relative py-28 md:py-40 bg-[#c41230] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07] font-jp text-[40vw] leading-none -left-10 -top-20 select-none pointer-events-none">盛</div>
      <div className="wrap relative text-center max-w-4xl">
        <div className="flex justify-center gap-1 mb-10">{Array.from({ length: 5 }).map((_, k) => <Star key={k} size={18} fill="currentColor" />)}</div>
        <AnimatePresence mode="wait">
          <motion.blockquote key={i} initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7, ease }}>
            <p className="font-display text-3xl md:text-5xl leading-[1.15]">“{r.quote}”</p>
            <footer className="mt-10 text-[12px] uppercase tracking-[0.25em] text-white/80">{r.name} · {r.role}</footer>
          </motion.blockquote>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-10">{TESTIMONIALS.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className={`h-1 rounded-full transition-all ${k === i ? 'w-10 bg-white' : 'w-4 bg-white/40'}`} />)}</div>
        <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-10 text-white/80 hover:text-white text-sm">Read 1,700+ reviews <ArrowUpRight size={14} /></a>
      </div>
    </section>
  )
}

// ── Visit ───────────────────────────────────────────────────────
function Visit({ status, onReserve }) {
  return (
    <section id="visit" className="py-28 md:py-36 bg-[#0b0908]">
      <div className="wrap grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <Eyebrow>Visit</Eyebrow>
          <h2 className="h2 mt-5">On Restaurant Row, <span className="italic text-[#e8d9c4]">Ingersoll Ave.</span></h2>
          <div className="mt-10 space-y-6 text-white/75">
            <a href={MAPS} target="_blank" rel="noreferrer" className="flex gap-4 hover:text-white"><MapPin className="text-[#c41230] shrink-0" size={20} /><span>{ADDRESS}<br /><span className="text-white/45 text-sm">Free parking across the street</span></span></a>
            <a href={`tel:${PHONE}`} className="flex gap-4 hover:text-white"><Phone className="text-[#c41230] shrink-0" size={20} />{PHONE_FMT}</a>
            <div className="flex gap-4"><Clock className="text-[#c41230] shrink-0" size={20} />
              <div className="flex-1">
                {status && <p className={`mb-3 text-sm ${status.open ? 'text-emerald-400' : 'text-white/50'}`}>{status.text}</p>}
                <dl className="space-y-2">
                  {HOURS_LIST.map(([d, h]) => <div key={d} className="flex justify-between gap-4 border-b border-white/5 pb-2 text-sm"><dt className="text-white">{d}</dt><dd className="text-white/55 text-right">{h}</dd></div>)}
                </dl>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3"><button onClick={onReserve} className="btn-primary">Reserve a table</button><a href={MAPS} target="_blank" rel="noreferrer" className="btn-ghost">Directions <ArrowUpRight size={15} /></a></div>
        </div>
        <div className="lg:col-span-7 min-h-[420px] rounded-sm overflow-hidden border border-white/10">
          <iframe title="Map to Sakari" className="w-full h-full min-h-[420px] map-dark" loading="lazy" src="https://www.google.com/maps?q=Sakari+Sushi+Lounge,+2605+Ingersoll+Ave,+Des+Moines,+IA+50312&output=embed" />
        </div>
      </div>
    </section>
  )
}

// ── CTA + Footer ────────────────────────────────────────────────
function Footer({ onReserve }) {
  return (
    <footer className="relative bg-black pt-28 overflow-hidden">
      <div className="absolute inset-0 opacity-30"><img src={img(36)} alt="" className="w-full h-full object-cover" /></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0908] via-black/80 to-black" />
      <div className="wrap relative">
        <div className="text-center">
          <p className="font-jp text-[#c41230] tracking-[0.5em] text-sm">今夜</p>
          <h2 className="font-display text-white text-6xl md:text-[8rem] leading-[0.9] mt-6">See you <span className="italic text-[#e8d9c4]">tonight.</span></h2>
          <div className="mt-12 flex flex-wrap justify-center gap-3"><button onClick={onReserve} className="btn-primary">Reserve a table</button><a href="#menu" className="btn-ghost">Order pickup</a><a href={`tel:${PHONE}`} className="btn-ghost"><Gift size={15} /> Gift cards</a></div>
        </div>
        <div className="mt-28 border-t border-white/10 py-10 grid md:grid-cols-4 gap-10 text-sm text-white/55">
          <div><img src="/img/logo_top.png" alt="Sakari" className="h-12" /><p className="mt-4">Japanese cuisine, sushi & lounge on Ingersoll Avenue, Des Moines.</p></div>
          <div><p className="text-white mb-3">Visit</p><p>{ADDRESS}</p><a href={`tel:${PHONE}`} className="block mt-2 hover:text-white">{PHONE_FMT}</a><a href={`mailto:${EMAIL}`} className="block mt-1 hover:text-white">{EMAIL}</a></div>
          <div><p className="text-white mb-3">Explore</p>{[['Menu', '#menu'], ['Specials', '#specials'], ['Private parties', '#events'], ['Gallery', '#gallery']].map(([l, h]) => <a key={l} href={h} className="block hover:text-white mb-1">{l}</a>)}</div>
          <div><p className="text-white mb-3">Follow</p>{[['Instagram', 'https://www.instagram.com/sakarisushilounge'], ['TikTok', 'https://www.tiktok.com/@sakarisushilounge'], ['Facebook', 'https://www.facebook.com/131847286851728'], ['Yelp', 'https://www.yelp.com/biz/sakari-sushi-lounge-des-moines']].map(([l, h]) => <a key={l} href={h} target="_blank" rel="noreferrer" className="block hover:text-white mb-1">{l}</a>)}</div>
        </div>
        <div className="border-t border-white/10 py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/35"><span>© {new Date().getFullYear()} Sakari Sushi Lounge · Des Moines, Iowa</span><span>Site by Serving The Vibe Media</span></div>
      </div>
    </footer>
  )
}

// ── Cart drawer ─────────────────────────────────────────────────
function Cart({ open, onClose, cart, setQty, clear }) {
  const [step, setStep] = useState('cart')
  const [info, setInfo] = useState({ name: '', phone: '', time: 'ASAP (~25 min)', notes: '' })
  useEffect(() => { if (!open) setTimeout(() => setStep('cart'), 400) }, [open])
  const sub = cart.reduce((a, c) => a + priceNum(c.price) * c.qty, 0)
  const tax = sub * 0.07
  const lines = cart.map((c) => `${c.qty}x ${c.name} (${c.price})`).join('\n')
  const msg = `Sakari pickup order\nName: ${info.name}\nPhone: ${info.phone}\nPickup: ${info.time}\n\n${lines}\n\nEst. subtotal: ${money(sub)}${info.notes ? `\nNotes: ${info.notes}` : ''}`
  const send = (e) => { e.preventDefault(); window.location.href = `sms:${PHONE}?&body=${encodeURIComponent(msg)}`; setStep('done') }
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside className="fixed right-0 top-0 bottom-0 z-[80] w-full max-w-md bg-[#f3ece2] text-ink flex flex-col" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.6, ease }}>
            <div className="flex items-center justify-between p-6 border-b border-ink/10">
              <h3 className="font-display text-3xl">{step === 'done' ? 'Order sent' : step === 'info' ? 'Pickup details' : 'Your order'}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full border border-ink/15 grid place-items-center" aria-label="Close"><X size={18} /></button>
            </div>
            {step === 'done' ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#c41230] text-white grid place-items-center"><Check /></div>
                <p className="mt-6 text-ink/70">Your messages app opened with the full order. Hit send and we&apos;ll text back to confirm. In a rush? Call <a href={`tel:${PHONE}`} className="underline">{PHONE_FMT}</a>.</p>
                <button className="btn-dark mt-8" onClick={() => { clear(); onClose() }}>Done</button>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center text-center text-ink/60">
                <ShoppingBag size={36} className="text-ink/30" /><p className="mt-4">Nothing here yet. Tap + on anything on the menu.</p>
                <a href="#menu" onClick={onClose} className="btn-dark mt-6">Browse the menu</a>
              </div>
            ) : step === 'cart' ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.map((c) => (
                    <div key={c.name} className="flex items-center gap-4 border-b border-ink/10 pb-4">
                      <div className="flex-1"><p className="font-display text-xl leading-tight">{c.name}</p><p className="text-sm text-ink/55">{c.price}</p></div>
                      <div className="flex items-center gap-2 border border-ink/15 rounded-full px-1">
                        <button onClick={() => setQty(c.name, c.qty - 1)} className="w-8 h-8 grid place-items-center" aria-label="Less"><Minus size={14} /></button>
                        <span className="w-4 text-center text-sm">{c.qty}</span>
                        <button onClick={() => setQty(c.name, c.qty + 1)} className="w-8 h-8 grid place-items-center" aria-label="More"><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-ink/10 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{money(sub)}</span></div>
                  <div className="flex justify-between text-ink/55"><span>Est. tax</span><span>{money(tax)}</span></div>
                  <div className="flex justify-between font-display text-2xl pt-2"><span>Total</span><span>{money(sub + tax)}</span></div>
                  <button onClick={() => setStep('info')} className="btn-dark w-full justify-center mt-4 py-4">Continue to pickup <ArrowRight size={16} /></button>
                  <p className="text-xs text-ink/45 text-center pt-1">Pay at pickup. Prices may vary slightly.</p>
                </div>
              </>
            ) : (
              <form onSubmit={send} className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {[['name', 'Name', 'text'], ['phone', 'Phone', 'tel']].map(([k, l, t]) => (
                    <label key={k} className="block"><span className="text-[11px] uppercase tracking-[0.18em] text-ink/50">{l}</span><input required type={t} value={info[k]} onChange={(e) => setInfo({ ...info, [k]: e.target.value })} className="field-light" /></label>
                  ))}
                  <label className="block"><span className="text-[11px] uppercase tracking-[0.18em] text-ink/50">Pickup time</span>
                    <select value={info.time} onChange={(e) => setInfo({ ...info, time: e.target.value })} className="field-light">{['ASAP (~25 min)', 'In 45 min', 'In 1 hour', 'In 90 min'].map((t) => <option key={t}>{t}</option>)}</select></label>
                  <label className="block"><span className="text-[11px] uppercase tracking-[0.18em] text-ink/50">Notes / allergies</span><textarea value={info.notes} onChange={(e) => setInfo({ ...info, notes: e.target.value })} className="field-light min-h-20" /></label>
                  <div className="bg-white/60 rounded-sm p-4 text-sm text-ink/70 whitespace-pre-line">{lines}</div>
                </div>
                <div className="p-6 border-t border-ink/10">
                  <button className="btn-dark w-full justify-center py-4">Text order to Sakari · {money(sub + tax)}</button>
                  <button type="button" onClick={() => setStep('cart')} className="w-full text-sm text-ink/55 mt-3">← Back to order</button>
                </div>
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Reservation modal ───────────────────────────────────────────
function Reserve({ open, onClose }) {
  const today = new Date().toISOString().slice(0, 10)
  const [r, setR] = useState({ date: today, time: '7:00 PM', size: 2, name: '', phone: '', notes: '' })
  const [done, setDone] = useState(false)
  useEffect(() => { if (!open) setTimeout(() => setDone(false), 400) }, [open])
  const times = ['11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM']
  const submit = (e) => {
    e.preventDefault()
    const msg = `Reservation request — Sakari\n${r.name}, party of ${r.size}\n${new Date(r.date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${r.time}\nPhone: ${r.phone}${r.notes ? `\nNotes: ${r.notes}` : ''}`
    window.location.href = `sms:${PHONE}?&body=${encodeURIComponent(msg)}`
    setDone(true)
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl bg-[#0b0908] border border-white/10 grid md:grid-cols-5 overflow-hidden max-h-[92vh] overflow-y-auto" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ duration: 0.6, ease }}>
            <div className="hidden md:block md:col-span-2 relative"><img src={img(39)} alt="" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><p className="absolute bottom-6 left-6 right-6 font-display text-3xl text-white">A seat at the summit.</p></div>
            <div className="md:col-span-3 p-7 md:p-10 relative">
              <button onClick={onClose} className="icon-btn absolute top-5 right-5" aria-label="Close"><X size={16} /></button>
              {done ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#c41230] grid place-items-center mx-auto"><Check /></div>
                  <h3 className="font-display text-4xl text-white mt-6">Request ready</h3>
                  <p className="text-white/60 mt-3">Send the text that just opened and we&apos;ll confirm your table. Or call <a href={`tel:${PHONE}`} className="underline text-white">{PHONE_FMT}</a>.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div><Eyebrow>Reservations</Eyebrow><h3 className="font-display text-4xl text-white mt-3">Book a table</h3></div>
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">Party size</span>
                    <div className="flex gap-2 mt-2 flex-wrap">{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <button type="button" key={n} onClick={() => setR({ ...r, size: n })} className={`w-10 h-10 rounded-full border text-sm transition ${r.size === n ? 'bg-[#c41230] border-[#c41230] text-white' : 'border-white/15 text-white/70 hover:border-white/40'}`}>{n}{n === 8 ? '+' : ''}</button>)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Date" type="date" required min={today} value={r.date} onChange={(e) => setR({ ...r, date: e.target.value })} />
                    <Field label="Time" as="select" value={r.time} onChange={(e) => setR({ ...r, time: e.target.value })}>{times.map((t) => <option key={t}>{t}</option>)}</Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Name" required value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} />
                    <Field label="Phone" type="tel" required value={r.phone} onChange={(e) => setR({ ...r, phone: e.target.value })} />
                  </div>
                  <Field label="Occasion / notes" value={r.notes} onChange={(e) => setR({ ...r, notes: e.target.value })} placeholder="Birthday, bar seats, high chair…" />
                  <button className="btn-primary w-full justify-center py-4">Request reservation <ArrowRight size={16} /></button>
                  <p className="text-xs text-white/40 text-center flex items-center justify-center gap-2"><Users size={12} /> Parties of 9+? <a href="#events" onClick={onClose} className="underline">Book the private room</a></p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Mobile sticky bar ───────────────────────────────────────────
function MobileBar({ onReserve, onCart, count }) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0b0908]/95 backdrop-blur border-t border-white/10 grid grid-cols-3 text-[11px] uppercase tracking-[0.15em]">
      <a href={`tel:${PHONE}`} className="py-4 flex flex-col items-center gap-1 text-white/70"><Phone size={16} />Call</a>
      <button onClick={onCart} className="py-4 flex flex-col items-center gap-1 text-white/70"><ShoppingBag size={16} />Order{count ? ` (${count})` : ''}</button>
      <button onClick={onReserve} className="py-4 flex flex-col items-center gap-1 bg-[#c41230] text-white"><CalendarDays size={16} />Reserve</button>
    </div>
  )
}

// ── Toast ───────────────────────────────────────────────────────
function Toast({ msg }) {
  return (
    <AnimatePresence>
      {msg && <motion.div key={msg.id} className="fixed z-[95] bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-3 rounded-full text-sm shadow-2xl flex items-center gap-2" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}><Check size={15} className="text-[#c41230]" />{msg.text}</motion.div>}
    </AnimatePresence>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('sakari-cart') || '[]') } catch { return [] } })
  const [cartOpen, setCartOpen] = useState(false)
  const [resOpen, setResOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const status = useOpenStatus()
  useEffect(() => { const t = setTimeout(() => setReady(true), 1600); return () => clearTimeout(t) }, [])
  useEffect(() => { try { localStorage.setItem('sakari-cart', JSON.stringify(cart)) } catch { /* ignore */ } }, [cart])
  useEffect(() => { if (ready) setTimeout(() => ScrollTrigger.refresh(), 300) }, [ready])
  const addItem = (it) => {
    setCart((c) => { const f = c.find((x) => x.name === it.name); return f ? c.map((x) => (x.name === it.name ? { ...x, qty: x.qty + 1 } : x)) : [...c, { name: it.name, price: it.price, qty: 1 }] })
    setToast({ id: Date.now(), text: `${it.name} added` }); setTimeout(() => setToast(null), 1800)
  }
  const setQty = (name, q) => setCart((c) => (q <= 0 ? c.filter((x) => x.name !== name) : c.map((x) => (x.name === name ? { ...x, qty: q } : x))))
  const count = cart.reduce((a, c) => a + c.qty, 0)
  const openRes = () => setResOpen(true)
  return (
    <div className="bg-[#0b0908] text-white antialiased">
      <Preloader done={ready} />
      <Nav cartCount={count} onCart={() => setCartOpen(true)} onReserve={openRes} status={status} />
      <main>
        <Hero ready={ready} onReserve={openRes} status={status} />
        <Marquee />
        <Story />
        <ScrollFilm />
        <Signature addItem={addItem} />
        <MenuSection addItem={addItem} cart={cart} />
        <Specials status={status} />
        <Gallery />
        <Reviews />
        <Events />
        <Visit status={status} onReserve={openRes} />
      </main>
      <Footer onReserve={openRes} />
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setQty={setQty} clear={() => setCart([])} />
      <Reserve open={resOpen} onClose={() => setResOpen(false)} />
      <MobileBar onReserve={openRes} onCart={() => setCartOpen(true)} count={count} />
      <Toast msg={toast} />
    </div>
  )
}
