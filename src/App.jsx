import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SushiStackScroll } from './components/ui/stack-card'
import { MenuBar } from './components/ui/glow-menu'
import { UtensilsCrossed, CalendarDays, MapPin, PhoneCall } from 'lucide-react'

const NAV_ITEMS = [
  {
    icon: UtensilsCrossed,
    label: 'Menu',
    href: '#menu',
    gradient: 'radial-gradient(circle, rgba(200,134,10,0.18) 0%, rgba(200,134,10,0.06) 50%, transparent 100%)',
    iconColor: '#C8860A',
  },
  {
    icon: CalendarDays,
    label: 'Events',
    href: '#events',
    gradient: 'radial-gradient(circle, rgba(242,201,109,0.18) 0%, rgba(242,201,109,0.06) 50%, transparent 100%)',
    iconColor: '#F2C96D',
  },
  {
    icon: MapPin,
    label: 'Find Us',
    href: '#contact',
    gradient: 'radial-gradient(circle, rgba(200,134,10,0.18) 0%, rgba(200,134,10,0.06) 50%, transparent 100%)',
    iconColor: '#C8860A',
  },
  {
    icon: PhoneCall,
    label: 'Reserve',
    href: 'tel:5152883381',
    gradient: 'radial-gradient(circle, rgba(242,201,109,0.2) 0%, rgba(200,134,10,0.08) 50%, transparent 100%)',
    iconColor: '#F2C96D',
  },
]

gsap.registerPlugin(ScrollTrigger)

// ── Easing (Anton Skvortsov) ───────────────────────────────────────────────
const EASE_OUT_QUART = [0.25, 0.8, 0.25, 1]
const EASE_SPRING = { type: 'spring', stiffness: 280, damping: 22 }
const EASE_SPRING_SOFT = { type: 'spring', stiffness: 180, damping: 24 }

// ── Framer variants (stagger + directional slide) ──────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36, filter: 'blur(8px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE_OUT_QUART, delay: i * 0.08 },
  }),
}
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const cardReveal = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT_QUART, delay: i * 0.07 },
  }),
}

// ── Data ──────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Courtney H.', role: 'Yelp Reviewer', avatar: 'CH', quote: 'Hands down the best sushi I have ever had. There is no place we even consider comparable. The quality is exceptionally good.' },
  { name: 'Kenneth S.',  role: 'Yelp Reviewer', avatar: 'KS', quote: 'Sushi is fantastic! Drinks were fantastic! Service was fantastic! This place gets very busy but it is absolutely worth the wait.' },
  { name: 'Abby K.',     role: 'Yelp Reviewer', avatar: 'AK', quote: 'Sakari is my go-to for sushi in Des Moines. The food is amazing, the service is wonderful and they are so wonderfully kind.' },
  { name: 'Nate R.',     role: 'Yelp Reviewer', avatar: 'NR', quote: 'Always great service and food — whether you order rolls or something off the menu. The steak had amazing flavor and was cooked perfect.' },
  { name: 'Andrea B.',   role: 'Yelp Reviewer', avatar: 'AB', quote: 'Everything was delicious! All the different choices of sushi roll and nigiri. It was all fresh and so beautifully presented.' },
]

const MENU = [
  { name: 'Godzilla Roll',      tag: 'House Roll',      img: '/assets/sushi-explosion.png', desc: 'Monster-sized, bold flavors — built for those who refuse to compromise.' },
  { name: 'Iowa Surf & Turf',   tag: 'Chef Signature',  img: '/assets/sushi-plated.png',    desc: 'Premium beef meets the freshest catch, plated like a work of art.' },
  { name: 'Tuna Tataki',        tag: 'Sashimi',         img: '/assets/sushi-plated.png',    desc: 'Seared bluefin, yuzu ponzu, micro herbs — precision on a plate.' },
  { name: 'Craft Cocktails',    tag: 'Bar Program',     img: '/assets/cocktail.png',        desc: 'Amsterdam Martinis, Sake Bombs, seasonal creations — same care as the food.' },
]

const FEATURES = [
  { icon: '◈', title: 'Private Events',   desc: 'Seat up to 30 guests in our private lounge. Birthdays, corporate, weddings.' },
  { icon: '◉', title: 'Happy Hour',       desc: 'Friday 2–5 PM: house rolls $3.50, Kirin draft, Sake Bombs, Amsterdam martinis.' },
  { icon: '◈', title: 'Online Ordering',  desc: 'Order pickup or delivery direct, through Grubhub, or DoorDash.' },
  { icon: '◉', title: 'Catering',         desc: 'Full catering packages for any occasion. Sakari anywhere you need it.' },
  { icon: '◈', title: 'Gift Cards',       desc: 'Give someone an experience worth having. Available in any amount.' },
  { icon: '◉', title: 'Reservations',     desc: 'Book ahead. Walk-ins always welcome, but the best seats are reserved.' },
]

const STATS = [
  { value: 15, suffix: '+', label: 'Years on Ingersoll' },
  { value: 22, suffix: '',  label: 'Signature Rolls'    },
  { value: 5,  suffix: '★', label: 'Yelp Rating'        },
  { value: 30, suffix: '',  label: 'Private Event Seats' },
]

const FRAME_COUNT = 90
const frames = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`
)
const ANNOTATIONS = [
  { progress: 0.18, text: 'Every roll, made to order',          sub: 'Nothing frozen. Nothing rushed.', side: 'left'  },
  { progress: 0.42, text: 'Cinematic presentation',             sub: 'You eat with your eyes first.',   side: 'right' },
  { progress: 0.68, text: 'Summit-level craft',                 sub: "Sakari — to be at one's peak.",  side: 'left'  },
  { progress: 0.88, text: 'Des Moines never tasted like this',  sub: '2605 Ingersoll Ave',              side: 'right' },
]

// ── Starscape ──────────────────────────────────────────────────────────────
function Starscape() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    let raf
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.1 + 0.3,
      drift: (Math.random() - 0.5) * 0.00007,
      ts: Math.random() * 0.016 + 0.004,
      tp: Math.random() * Math.PI * 2,
      ba: Math.random() * 0.5 + 0.15,
    }))
    function resize() {
      c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio
      c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize(); addEventListener('resize', resize)
    function draw(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      for (const s of stars) {
        s.x += s.drift; if (s.x > 1) s.x = 0; if (s.x < 0) s.x = 1
        const a = s.ba + Math.sin(t * s.ts + s.tp) * 0.18
        ctx.beginPath()
        ctx.arc(s.x * innerWidth, s.y * innerHeight, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, a)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} id="starscape" />
}

// ── Cursor (Framer Motion useSpring) ───────────────────────────────────────
function Cursor() {
  const curRef = useRef(null), folRef = useRef(null)
  useEffect(() => {
    const cur = curRef.current, fol = folRef.current
    let fx = 0, fy = 0, mx = 0, my = 0, raf
    const move = e => { mx = e.clientX; my = e.clientY }
    addEventListener('mousemove', move)
    function tick() {
      cur.style.left = mx + 'px'; cur.style.top = my + 'px'
      fx += (mx - fx) * 0.11; fy += (my - fy) * 0.11
      fol.style.left = fx + 'px'; fol.style.top = fy + 'px'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const on  = () => { cur.classList.add('hover'); fol.classList.add('hover') }
    const off = () => { cur.classList.remove('hover'); fol.classList.remove('hover') }
    document.querySelectorAll('a,button,.feature-card,.testimonial-card,.tilt-card').forEach(el => {
      el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off)
    })
    return () => { cancelAnimationFrame(raf); removeEventListener('mousemove', move) }
  }, [])
  return <><div ref={curRef} className="cursor" /><div ref={folRef} className="cursor-follower" /></>
}

// ── Scroll Progress ────────────────────────────────────────────────────────
function ScrollProgressBar() {
  const ref = useRef(null)
  useEffect(() => {
    const fn = () => {
      const d = document.documentElement
      if (ref.current) ref.current.style.transform = `scaleX(${scrollY / (d.scrollHeight - d.clientHeight)})`
    }
    addEventListener('scroll', fn, { passive: true })
    return () => removeEventListener('scroll', fn)
  }, [])
  return <div ref={ref} className="scroll-progress" />
}

// ── Preloader (AnimatePresence exit) ───────────────────────────────────────
function Preloader({ onDone }) {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let loaded = 0
    const total = frames.length
    frames.forEach(src => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        setPct(Math.round((loaded / total) * 100))
        if (loaded === total) setTimeout(() => { setDone(true); setTimeout(onDone, 700) }, 350)
      }
      img.src = src
    })
  }, [onDone])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="preloader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
            style={{ textAlign: 'center' }}
          >
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Loading Experience</p>
            {/* Space Grotesk bold heading — Marcelo / TDS style */}
            <h1 style={{ fontFamily: '"Space Grotesk", system-ui', fontSize: 'clamp(2.5rem,6vw,5.5rem)', fontWeight: 700, letterSpacing: '0.22em', color: '#fff', lineHeight: 1 }}>
              SAKARI
            </h1>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(200,134,10,0.7)', letterSpacing: '0.15em', marginTop: '0.3rem', marginBottom: '1.75rem' }}>
              Sushi Lounge
            </p>
            <div style={{ width: '180px', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 auto 0.6rem', position: 'relative', overflow: 'hidden' }}>
              <motion.div
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'linear-gradient(90deg,#C8860A,#F2C96D)' }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>
            <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.62rem', color: 'rgba(200,134,10,0.65)', letterSpacing: '0.1em' }}>{pct}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Navbar — GlowMenu (21st.dev) + Framer Motion pill transform ────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeItem, setActiveItem] = useState('Menu')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(scrollY > 60)
    addEventListener('scroll', fn, { passive: true })
    return () => removeEventListener('scroll', fn)
  }, [])

  const handleNavClick = (label) => {
    setActiveItem(label)
    const item = NAV_ITEMS.find(i => i.label === label)
    if (item?.href?.startsWith('#')) {
      document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
    } else if (item?.href?.startsWith('tel:')) {
      window.location.href = item.href
    }
    setMobileOpen(false)
  }

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: scrolled ? '0' : '1.5rem 2.5rem',
        transition: 'padding 0.4s cubic-bezier(0.25,0.8,0.25,1)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.2 }}
    >
      {scrolled ? (
        /* ── Scrolled: single pill containing brand + glow menu ── */
        <motion.div
          layout
          style={{
            margin: '14px auto 0',
            width: 'calc(100% - 2rem)',
            maxWidth: '860px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.6rem 1.25rem 0.6rem 1.5rem',
            borderRadius: '100px',
            background: 'rgba(8,8,8,0.9)',
            backdropFilter: 'blur(28px)',
            border: '1px solid rgba(200,134,10,0.18)',
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={EASE_SPRING_SOFT}
        >
          <a href="#hero" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.2em', color: '#fff' }}>SAKARI</span>
          </a>
          {/* GlowMenu inline — desktop only */}
          <div className="nav-links">
            <MenuBar
              items={NAV_ITEMS}
              activeItem={activeItem}
              onItemClick={handleNavClick}
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', backdropFilter: 'none', padding: '0' }}
            />
          </div>
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </motion.div>
      ) : (
        /* ── Top: full-width bar with brand + menu pill ── */
        <>
          <a href="#hero" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.22em', color: '#fff' }}>SAKARI</span>
            <span style={{ display: 'block', fontFamily: '"JetBrains Mono",monospace', fontSize: '0.5rem', letterSpacing: '0.28em', color: '#C8860A', marginTop: '-1px' }}>SUSHI LOUNGE</span>
          </a>
          <div className="nav-links">
            <MenuBar items={NAV_ITEMS} activeItem={activeItem} onItemClick={handleNavClick} />
          </div>
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </>
      )}

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            style={{ position: 'absolute', top: '100%', left: '1rem', right: '1rem', marginTop: '0.5rem', background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(200,134,10,0.18)', borderRadius: '20px', padding: '1.5rem', zIndex: 900 }}
          >
            {NAV_ITEMS.map(item => (
              <button key={item.label} onClick={() => handleNavClick(item.label)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', background: 'none', border: 'none', color: activeItem === item.label ? '#C8860A' : 'rgba(255,255,255,0.65)', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.75rem 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <item.icon size={16} />{item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── TiltCard — TDS / Anton Skvortsov tilt-on-hover ─────────────────────────
function TiltCard({ children, className = '', style = {} }) {
  const ref = useRef(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-60, 60], [10, -10]), { stiffness: 220, damping: 22 })
  const rotateY = useSpring(useTransform(x, [-60, 60], [-10, 10]), { stiffness: 220, damping: 22 })

  const onMove = useCallback(e => {
    const r = ref.current.getBoundingClientRect()
    x.set(e.clientX - r.left - r.width / 2)
    y.set(e.clientY - r.top - r.height / 2)
  }, [x, y])
  const onLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.div
      ref={ref}
      className={`tilt-card perspective-container ${className}`}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ scale: { duration: 0.3, ease: EASE_OUT_QUART } }}
    >
      {children}
    </motion.div>
  )
}

// ── Hero — full-screen video background ────────────────────────────────────
function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity    = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const yContent   = useTransform(scrollYProgress, [0, 1], [0, -100])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <section ref={ref} id="hero" style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* ── Video background (cover-fit, slow zoom on scroll) ── */}
      <motion.video
        src="/assets/hero.mp4"
        autoPlay loop muted playsInline
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          scale: videoScale,
          transformOrigin: 'center center',
        }}
      />

      {/* ── Multi-layer dark overlay so text pops ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.55) 50%, rgba(8,8,8,0.85) 100%)',
        pointerEvents: 'none',
      }} />
      {/* Vignette edges */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Gold glow accent ── */}
      <div style={{ position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(200,134,10,0.12) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />

      {/* ── Centered content ── */}
      <motion.div
        style={{ y: yContent, opacity, position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 2rem', maxWidth: '900px' }}
      >
        <motion.p
          className="section-label"
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ marginBottom: '1.5rem', opacity: 0.8 }}
        >
          Des Moines, Iowa · Est. 2005
        </motion.p>

        <motion.h1
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{
            fontFamily: '"Space Grotesk",system-ui',
            fontSize: 'clamp(3.5rem,9vw,8.5rem)',
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: '1.5rem',
            textShadow: '0 4px 40px rgba(0,0,0,0.5)',
          }}
        >
          AT THE<br />
          <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.05em', color: '#F2C96D' }}>
            Peak
          </span>
          <br />OF CRAFT.
        </motion.h1>

        <motion.p
          custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(0.95rem,1.5vw,1.1rem)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 2.5rem', fontWeight: 300 }}
        >
          Sakari — to be at one's best. Fresh rolls, premium fish, craft cocktails, and a lounge built for the moment.
        </motion.p>

        <motion.div
          custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-gold">
            Order Online ↗
          </a>
          <a href="#menu" className="btn-outline">Explore Menu</a>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          custom={4} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}
        >
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '2rem', fontWeight: 700, color: '#F2C96D', lineHeight: 1 }}>
                {s.value}{s.suffix}
              </p>
              <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        style={{ opacity, position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 3 }}
      >
        <p className="section-label" style={{ opacity: 0.4, marginBottom: '0.5rem', fontSize: '0.55rem' }}>Scroll</p>
        <motion.div
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom,#C8860A,transparent)', margin: '0 auto' }}
        />
      </motion.div>
    </section>
  )
}

// ── Scroll Video (GSAP ScrollTrigger + Framer annotation cards) ────────────
function ScrollVideo() {
  const sectionRef = useRef(null)
  const canvasRef  = useRef(null)
  const frameObjs  = useRef([])
  const [activeCard, setActiveCard] = useState(null)

  useEffect(() => {
    frameObjs.current = frames.map(src => { const img = new Image(); img.src = src; return img })
    const canvas = canvasRef.current, ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio
      canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize(); addEventListener('resize', resize)

    function drawFrame(img) {
      if (!img?.complete || !img.naturalWidth) return
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      const { naturalWidth: iw, naturalHeight: ih } = img
      const s = Math.max(innerWidth / iw, innerHeight / ih)
      ctx.drawImage(img, (innerWidth - iw * s) / 2, (innerHeight - ih * s) / 2, iw * s, ih * s)
    }
    if (frameObjs.current[0].complete) drawFrame(frameObjs.current[0])
    else frameObjs.current[0].onload = () => drawFrame(frameObjs.current[0])

    let last = -1
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top', end: 'bottom bottom',
      scrub: true,
      onUpdate(self) {
        const idx = Math.min(Math.floor(self.progress * (frames.length - 1)), frames.length - 1)
        if (idx !== last) { drawFrame(frameObjs.current[idx]); last = idx }
        const a = ANNOTATIONS.find(a => self.progress >= a.progress - 0.07 && self.progress <= a.progress + 0.13)
        setActiveCard(a ? a.progress : null)
      },
    })
    return () => { st.kill(); removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="about" ref={sectionRef} className="scroll-section" style={{ height: '500vh' }}>
      <div className="scroll-sticky">
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(8,8,8,0.35) 0%,transparent 25%,transparent 75%,rgba(8,8,8,0.6) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <p className="section-label" style={{ opacity: 0.7 }}>The Experience</p>
        </div>

        {ANNOTATIONS.map(a => (
          <div key={a.progress}
            className={`annotation-card glass-gold ${activeCard === a.progress ? 'visible' : ''}`}
            style={{ [a.side === 'left' ? 'left' : 'right']: 'clamp(1rem,5vw,5rem)', top: '50%', transform: 'translateY(-50%)', maxWidth: '270px', padding: '1.25rem 1.5rem', zIndex: 10 }}
          >
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: '0.35rem' }}>{a.text}</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontFamily: '"Cormorant Garamond",serif', fontSize: '0.95rem' }}>{a.sub}</p>
          </div>
        ))}

        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <p className="section-label" style={{ opacity: 0.3 }}>Keep Scrolling</p>
        </div>
      </div>
    </section>
  )
}

// ── SectionHeading helper ──────────────────────────────────────────────────
function SectionHeading({ label, headline, accent, sub }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
      <motion.p variants={fadeUp} className="section-label" style={{ marginBottom: '1rem' }}>{label}</motion.p>
      <motion.h2 variants={fadeUp}
        style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05, marginBottom: '0' }}
      >
        {headline}<br />
        <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: '#C8860A', fontSize: '1.05em' }}>{accent}</span>
      </motion.h2>
      <motion.div variants={fadeUp} className="gold-divider" style={{ margin: '1.25rem 0' }} />
      {sub && <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, fontSize: '0.9375rem', maxWidth: '520px' }}>{sub}</motion.p>}
    </motion.div>
  )
}

// ── Menu ───────────────────────────────────────────────────────────────────
function Menu() {
  return (
    <section id="menu" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        {/* Two-column layout: sticky copy left, scroll stack right */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          {/* Left — sticky copy */}
          <div style={{ position: 'sticky', top: '20vh' }}>
            <SectionHeading
              label="Signature Dishes"
              headline="The Menu That"
              accent="Started the Conversation"
              sub="Every dish is built around one principle: if it's not exceptional, it's not on the plate."
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, ease: EASE_OUT_QUART, delay: 0.35 }}
              style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Quick-glance feature list */}
              {[
                { icon: '◈', text: '22+ signature rolls made fresh daily' },
                { icon: '◉', text: 'Premium fish flown in weekly' },
                { icon: '◈', text: 'Full bar with craft cocktails & sake' },
                { icon: '◉', text: 'Happy Hour every Friday 2–5 PM' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: '#C8860A', fontSize: '0.875rem', marginTop: '1px', flexShrink: 0 }}>{f.icon}</span>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>{f.text}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE_OUT_QUART, delay: 0.5 }}
              style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <a href="https://www.sakarisushilounge.com" target="_blank" rel="noopener noreferrer" className="btn-gold">View Full Menu ↗</a>
              <a href="tel:5152883381" className="btn-outline">Reserve a Table</a>
            </motion.div>
          </div>

          {/* Right — Framer Motion stack scroll cards (the user's component) */}
          <div>
            <SushiStackScroll />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Features ───────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="events" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <SectionHeading label="Everything We Offer" headline="More Than a" accent="Restaurant" />
        </div>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(255px,1fr))', gap: '1.25rem' }}
        >
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} variants={cardReveal} custom={i % 3}>
              <TiltCard>
                <div className="glass feature-card" style={{ padding: '2rem', height: '100%' }}>
                  {/* Icon badge */}
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: 8 }}
                    transition={EASE_SPRING}
                    style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(200,134,10,0.1)', border: '1px solid rgba(200,134,10,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#C8860A', marginBottom: '1.25rem' }}
                  >{f.icon}</motion.div>
                  <h3 style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.9375rem', fontWeight: 700, color: '#fff', letterSpacing: '0.01em', marginBottom: '0.6rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.46)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <SectionHeading label="What People Say" headline="The Verdict Is" accent="Unanimous" />
        </div>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(275px,1fr))', gap: '1.25rem' }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name} variants={cardReveal} custom={i % 3}
              whileHover={{ y: -5, transition: { duration: 0.3, ease: EASE_OUT_QUART } }}
            >
              <div className="glass testimonial-card" style={{ padding: '2rem', height: '100%' }}>
                <div style={{ color: '#C8860A', fontSize: '0.875rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>★★★★★</div>
                <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(200,134,10,0.1)', border: '1px solid rgba(200,134,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#C8860A', flexShrink: 0, fontFamily: '"Space Grotesk",system-ui' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{t.name}</p>
                    <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.36)', letterSpacing: '0.06em' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Location ───────────────────────────────────────────────────────────────
function Location() {
  return (
    <section id="contact" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
        >
          <SectionHeading label="Find Us" headline="On Ingersoll," accent="Where It Belongs" />
          <motion.div variants={fadeUp} className="glass" style={{ padding: '1.75rem', marginBottom: '1.25rem', marginTop: '2rem' }}>
            <p className="section-label" style={{ marginBottom: '0.6rem' }}>Address</p>
            <p style={{ fontSize: '1.0625rem', color: '#fff', lineHeight: 1.65 }}>2605 Ingersoll Avenue<br />Des Moines, IA 50312</p>
          </motion.div>
          <motion.div variants={fadeUp} className="glass" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
            <p className="section-label" style={{ marginBottom: '0.6rem' }}>Contact</p>
            <p style={{ lineHeight: 1.8 }}>
              <a href="tel:5152883381" style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.1rem', fontWeight: 700, color: '#C8860A', textDecoration: 'none' }}>(515) 288-3381</a><br />
              <a href="mailto:sakarisushilounge@gmail.com" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>sakarisushilounge@gmail.com</a>
            </p>
          </motion.div>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="tel:5152883381" className="btn-gold">Call to Reserve</a>
            <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-outline">Order Online ↗</a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay: 0.15 }}
        >
          <p className="section-label" style={{ marginBottom: '1.5rem' }}>Hours</p>
          <div className="glass" style={{ padding: '2rem' }}>
            {[
              { day: 'Monday',   hours: 'Lunch 11AM–2PM · Dinner 5–10PM' },
              { day: 'Tue–Thu',  hours: 'Lunch 11AM–2PM · Dinner 5–9PM' },
              { day: 'Friday',   hours: '11AM–11PM · Happy Hour 2–5PM' },
              { day: 'Saturday', hours: '11AM–11PM' },
              { day: 'Sunday',   hours: '5PM–9PM' },
            ].map((h, i) => (
              <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.85rem 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: '1rem' }}>
                <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', minWidth: '72px' }}>{h.day}</span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.46)', textAlign: 'right' }}>{h.hours}</span>
              </div>
            ))}
            <div style={{ marginTop: '1.25rem', padding: '0.9rem 1rem', background: 'rgba(200,134,10,0.07)', borderRadius: '12px', border: '1px solid rgba(200,134,10,0.15)' }}>
              <p className="section-label" style={{ marginBottom: '0.3rem' }}>Friday Happy Hour</p>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.52)' }}>House rolls $3.50 · Kirin Draft $3.50 · Sake Bombs $7</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── CTA Band ───────────────────────────────────────────────────────────────
function CTABand() {
  return (
    <section style={{ padding: '5rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
          className="glass-gold noise"
          style={{ padding: 'clamp(3rem,6vw,5rem) clamp(2rem,5vw,4rem)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}
        >
          {/* Glow orb */}
          <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(200,134,10,0.14) 0%,transparent 70%)', top: '-50%', left: '-10%', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
            className="section-label" style={{ position: 'relative', marginBottom: '0.75rem' }}>Ready When You Are</motion.p>

          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1, marginBottom: '1.25rem', position: 'relative' }}
          >
            RESERVE YOUR<br />
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: '#C8860A', fontSize: '1.1em' }}>Table Tonight</span>
          </motion.h2>

          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', lineHeight: 1.75, maxWidth: '400px', margin: '0 auto 2.5rem', position: 'relative' }}
          >
            Call ahead or walk in. Either way, we'll take you to the summit.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}
          >
            <a href="tel:5152883381" className="btn-gold">(515) 288-3381</a>
            <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-outline">Order for Delivery</a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
      style={{ padding: '4rem 2.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}
    >
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '3rem', alignItems: 'start', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.22em', color: '#fff' }}>SAKARI</p>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.5rem', letterSpacing: '0.28em', color: '#C8860A', marginTop: '-2px', marginBottom: '1rem' }}>SUSHI LOUNGE</p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, maxWidth: '210px' }}>
              Summit-level Japanese cuisine.<br />2605 Ingersoll Ave, Des Moines IA.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', paddingLeft: '2rem' }}>
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>Visit</p>
              {['Menu', 'Happy Hour', 'Private Events', 'Catering', 'Gift Cards'].map(l => (
                <a key={l} href="#menu"
                  style={{ display: 'block', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.25s ease' }}
                  onMouseEnter={e => (e.target.style.color = '#C8860A')}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.42)')}>{l}</a>
              ))}
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>Contact</p>
              {[
                { label: '(515) 288-3381',     href: 'tel:5152883381' },
                { label: 'Email Us',            href: 'mailto:sakarisushilounge@gmail.com' },
                { label: 'Get Directions',      href: 'https://maps.google.com/?q=2605+Ingersoll+Ave+Des+Moines+IA' },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.25s ease' }}
                  onMouseEnter={e => (e.target.style.color = '#C8860A')}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.42)')}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: '1rem' }}>Follow</p>
            {[
              { label: '@sakarisushilounge', href: 'https://www.instagram.com/sakarisushilounge' },
              { label: 'TikTok',             href: 'https://www.tiktok.com/@sakarisushilounge' },
              { label: 'Facebook',           href: 'https://www.facebook.com/131847286851728' },
              { label: 'Yelp Reviews',       href: 'https://www.yelp.com/biz/sakari-sushi-lounge-des-moines' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.25s ease' }}
                onMouseEnter={e => (e.target.style.color = '#C8860A')}
                onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.42)')}>{s.label}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>© 2026 Sakari Sushi Lounge · Des Moines, Iowa</p>
          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.875rem', color: 'rgba(255,255,255,0.2)' }}>Sakari — To Be At One's Best</p>
        </div>
      </div>
    </motion.footer>
  )
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [ready, setReady] = useState(false)
  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      {ready && (
        <>
          <Starscape />
          <Cursor />
          <ScrollProgressBar />
          <Navbar />
          <main style={{ position: 'relative', zIndex: 1 }}>
            <Hero />
            <ScrollVideo />
            <Menu />
            <Features />
            <Testimonials />
            <Location />
            <CTABand />
          </main>
          <Footer />
        </>
      )}
    </>
  )
}
