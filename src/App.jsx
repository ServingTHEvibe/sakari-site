import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring, useMotionValue,
} from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MenuBar } from './components/ui/glow-menu'
import { UtensilsCrossed, CalendarDays, MapPin, PhoneCall, Star } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const RED  = '#C41230'
const GOLD = '#C8860A'

// V2: slower, more confident easing
const EASE  = [0.25, 0.1, 0.25, 1]
const EASE_OUT = [0.16, 1, 0.3, 1]   // expo out — premium feel
const SPRING = { type: 'spring', stiffness: 120, damping: 24 }

// V2: slower reveals — 0.9–1.1s
const reveal = {
  hidden:  { opacity: 0, y: 50, filter: 'blur(6px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE_OUT, delay: i * 0.12 },
  }),
}
const revealX = (dir = 1) => ({
  hidden:  { opacity: 0, x: dir * 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 1.0, ease: EASE_OUT } },
})

const NAV_ITEMS = [
  { icon: UtensilsCrossed, label: 'Menu',     href: '#chef',     gradient: 'radial-gradient(circle,rgba(196,18,48,0.2) 0%,transparent 100%)',  iconColor: RED  },
  { icon: Star,            label: 'Specials', href: '#happyhour',gradient: 'radial-gradient(circle,rgba(200,134,10,0.2) 0%,transparent 100%)', iconColor: GOLD },
  { icon: CalendarDays,    label: 'Events',   href: '#events',   gradient: 'radial-gradient(circle,rgba(196,18,48,0.2) 0%,transparent 100%)',  iconColor: RED  },
  { icon: MapPin,          label: 'Find Us',  href: '#contact',  gradient: 'radial-gradient(circle,rgba(200,134,10,0.2) 0%,transparent 100%)', iconColor: GOLD },
  { icon: PhoneCall,       label: 'Reserve',  href: 'tel:5152883381', gradient: 'radial-gradient(circle,rgba(196,18,48,0.22) 0%,transparent 100%)', iconColor: RED },
]

// Chef favorites — just 3, large treatment
const CHEF_PICKS = [
  {
    name: 'Godzilla Roll',
    price: '$17',
    tag: 'Most Ordered',
    desc: 'Tempura shrimp, avocado, cream cheese — crowned with spicy tuna & unagi.',
    img: '/assets/sushi_hero_01.png',
    accentRGB: '196,18,48',
  },
  {
    name: 'Iowa Surf & Turf',
    price: '$18.50',
    tag: "Chef's Signature",
    desc: 'Seared sirloin meets the freshest catch. Bacon, cream cheese, spicy mayo.',
    img: '/assets/food_ai_01.png',
    accentRGB: '200,134,10',
  },
  {
    name: 'Phoenix Roll',
    price: '$18',
    tag: "Chef's Pick",
    desc: 'Seared salmon, garlic mayo, jalapeño — alive with heat, restrained by craft.',
    img: '/assets/sushi_hero_02.png',
    accentRGB: '196,18,48',
  },
]

const FRAME_COUNT = 90
const frames = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`
)
const ANNOTATIONS = [
  { progress: 0.25, text: 'Every roll, made to order', sub: 'Nothing frozen. Nothing rushed.', side: 'left'  },
  { progress: 0.65, text: 'Summit-level craft',         sub: "Sakari — to be at one's peak.", side: 'right' },
]

const GALLERY_IMAGES = [
  '/assets/slide1.jpg',
  '/assets/food_ai_01.png',
  '/assets/slide2.jpg',
  '/assets/sushi_hero_01.png',
  '/assets/food_00.jpg',
  '/assets/slide3.jpg',
  '/assets/food_ai_02.png',
  '/assets/sushi_hero_02.png',
  '/assets/food_01.jpg',
]

// ── Starscape (fewer, dimmer — luxury restraint) ───────────────────────────
function Starscape() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    let raf
    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 0.9 + 0.2,
      drift: (Math.random() - 0.5) * 0.00005,
      ts: Math.random() * 0.01 + 0.003,
      tp: Math.random() * Math.PI * 2,
      ba: Math.random() * 0.3 + 0.08,
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
        const a = s.ba + Math.sin(t * s.ts + s.tp) * 0.1
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

// ── Cursor with glow ────────────────────────────────────────────────────────
function Cursor() {
  const curRef = useRef(null), folRef = useRef(null)
  useEffect(() => {
    const cur = curRef.current, fol = folRef.current
    let fx = 0, fy = 0, mx = 0, my = 0, raf
    const move = e => { mx = e.clientX; my = e.clientY }
    addEventListener('mousemove', move)
    function tick() {
      cur.style.left = mx + 'px'; cur.style.top = my + 'px'
      fx += (mx - fx) * 0.09; fy += (my - fy) * 0.09
      fol.style.left = fx + 'px'; fol.style.top = fy + 'px'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const on  = () => { cur.classList.add('hover'); fol.classList.add('hover') }
    const off = () => { cur.classList.remove('hover'); fol.classList.remove('hover') }
    document.querySelectorAll('a,button,.card-v2').forEach(el => {
      el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off)
    })
    return () => { cancelAnimationFrame(raf); removeEventListener('mousemove', move) }
  }, [])
  return <><div ref={curRef} className="cursor" /><div ref={folRef} className="cursor-follower" /></>
}

// ── Scroll Progress ─────────────────────────────────────────────────────────
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
  return <div ref={ref} className="scroll-progress" style={{ background: `linear-gradient(90deg, ${RED}, #E8203E)` }} />
}

// ── Preloader ───────────────────────────────────────────────────────────────
function Preloader({ onDone }) {
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let loaded = 0
    frames.forEach(src => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        setPct(Math.round((loaded / frames.length) * 100))
        if (loaded === frames.length) setTimeout(() => { setDone(true); setTimeout(onDone, 800) }, 300)
      }
      img.src = src
    })
  }, [onDone])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div className="preloader" exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE_OUT }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_OUT }}
            style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.93)', borderRadius: '12px', padding: '6px 18px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              <img src="/assets/logo_scroll.png" alt="Sakari" style={{ height: '40px', objectFit: 'contain', display: 'block' }} />
            </div>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
              Des Moines, Iowa
            </p>
            <div style={{ width: '160px', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 auto 0.5rem', position: 'relative', overflow: 'hidden' }}>
              <motion.div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: RED }}
                animate={{ width: `${pct}%` }} transition={{ duration: 0.12, ease: 'linear' }} />
            </div>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', color: `${RED}99`, letterSpacing: '0.1em' }}>{pct}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeItem, setActiveItem] = useState('Menu')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(scrollY > 60)
    addEventListener('scroll', fn, { passive: true })
    return () => removeEventListener('scroll', fn)
  }, [])

  const handleNavClick = label => {
    setActiveItem(label)
    const item = NAV_ITEMS.find(i => i.label === label)
    if (item?.href?.startsWith('#')) document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
    else if (item?.href?.startsWith('tel:')) window.location.href = item.href
    setMobileOpen(false)
  }

  const Logo = ({ small }) => (
    <a href="#hero" style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div style={{ background: 'rgba(255,255,255,0.92)', borderRadius: '9px', padding: small ? '3px 10px' : '4px 13px', display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', transition: 'padding 0.4s ease' }}>
        <img src="/assets/logo_scroll.png" alt="Sakari Sushi Lounge" style={{ height: small ? '28px' : '34px', objectFit: 'contain', display: 'block', transition: 'height 0.4s ease' }} />
      </div>
    </a>
  )

  return (
    <motion.div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800, padding: scrolled ? '0' : '1.5rem 2.5rem', transition: 'padding 0.5s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.3 }}
    >
      {scrolled ? (
        <motion.div layout
          style={{ margin: '12px auto 0', width: 'calc(100% - 2rem)', maxWidth: '900px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1.25rem 0.5rem 1.25rem', borderRadius: '100px', background: 'rgba(6,6,6,0.92)', backdropFilter: 'blur(32px)', border: `1px solid rgba(196,18,48,0.2)`, position: 'absolute', left: '50%', transform: 'translateX(-50%)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}
        >
          <Logo small />
          <div className="nav-links">
            <MenuBar items={NAV_ITEMS} activeItem={activeItem} onItemClick={handleNavClick}
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', backdropFilter: 'none', padding: 0 }} />
          </div>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </motion.div>
      ) : (
        <>
          <Logo />
          <div className="nav-links">
            <MenuBar items={NAV_ITEMS} activeItem={activeItem} onItemClick={handleNavClick} />
          </div>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </>
      )}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }}
            style={{ position: 'absolute', top: '100%', left: '1rem', right: '1rem', marginTop: '0.5rem', background: 'rgba(6,6,6,0.96)', backdropFilter: 'blur(24px)', border: `1px solid rgba(196,18,48,0.2)`, borderRadius: '20px', padding: '1.5rem', zIndex: 900 }}
          >
            {NAV_ITEMS.map(item => (
              <button key={item.label} onClick={() => handleNavClick(item.label)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', background: 'none', border: 'none', color: activeItem === item.label ? RED : 'rgba(255,255,255,0.6)', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.75rem 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <item.icon size={16} />{item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── SECTION 1: Hero ─────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const videoScale  = useTransform(scrollYProgress, [0, 1], [1, 1.06])
  const textY       = useTransform(scrollYProgress, [0, 1], [0, -80])
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={ref} id="hero" style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Video — slow zoom out on scroll */}
      <motion.video src="/assets/hero.mp4" autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', scale: videoScale, transformOrigin: 'center center' }} />

      {/* Dark layered overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,6,0.2) 0%, rgba(6,6,6,0.45) 40%, rgba(6,6,6,0.85) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 35%, rgba(6,6,6,0.6) 100%)', pointerEvents: 'none' }} />

      {/* Moving crimson glow at bottom */}
      <div style={{ position: 'absolute', bottom: '-8%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '50vh', background: `radial-gradient(ellipse, rgba(196,18,48,0.13) 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(50px)', animation: 'glow-drift 8s ease-in-out infinite' }} />

      {/* Steam wisps */}
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', bottom: '25%', left: `${38 + i * 12}%`, width: '2px', height: '40px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', filter: 'blur(4px)', animation: `steam ${3.5 + i * 1.2}s ease-out infinite`, animationDelay: `${i * 1.1}s`, pointerEvents: 'none' }} />
      ))}

      {/* Content — minimal above the fold */}
      <motion.div style={{ y: textY, opacity: textOpacity, position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 2rem', maxWidth: '800px' }}>

        <motion.p custom={0} variants={reveal} initial="hidden" animate="visible"
          style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: `${RED}cc`, marginBottom: '2rem' }}>
          Des Moines, Iowa · Est. 2005
        </motion.p>

        {/* Giant headline — breathing room */}
        <motion.h1 custom={1} variants={reveal} initial="hidden" animate="visible"
          style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(4rem,11vw,10rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.03em', color: '#fff', textShadow: '0 4px 60px rgba(0,0,0,0.4)', marginBottom: '1.25rem' }}>
          SAKARI
        </motion.h1>

        <motion.p custom={2} variants={reveal} initial="hidden" animate="visible"
          style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: 'clamp(1.1rem,2.5vw,1.6rem)', fontWeight: 300, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', marginBottom: '3rem' }}>
          Sushi Lounge
        </motion.p>

        <motion.a custom={3} variants={reveal} initial="hidden" animate="visible"
          href="tel:5152883381" className="btn-red"
          style={{ fontSize: '0.75rem', letterSpacing: '0.2em' }}>
          Reserve a Table
        </motion.a>
      </motion.div>

      {/* Scroll hint */}
      <motion.div style={{ opacity: textOpacity, position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 3 }}>
        <motion.div animate={{ scaleY: [1, 0.35, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '1px', height: '44px', background: `linear-gradient(to bottom, ${RED}, transparent)`, margin: '0 auto' }} />
      </motion.div>
    </section>
  )
}

// ── SECTION 2: Experience Statement ─────────────────────────────────────────
function ExperienceStatement() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section ref={ref} style={{ padding: '10rem 2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* Drifting red glow */}
      <div style={{ position: 'absolute', top: '20%', right: '-15%', width: '600px', height: '600px', background: `radial-gradient(circle, rgba(196,18,48,0.07) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'glow-drift 10s ease-in-out infinite' }} />

      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>

        {/* Left — big editorial statement */}
        <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.p variants={reveal} custom={0}
            style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: RED, marginBottom: '2rem' }}>
            Not Just Sushi
          </motion.p>

          {/* The big statement */}
          <motion.h2 variants={reveal} custom={1}
            style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: 'clamp(3rem,5.5vw,5rem)', fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
            "An experience<br />you didn't know<br />
            <span style={{ color: GOLD }}>you were missing."</span>
          </motion.h2>

          <motion.p variants={reveal} custom={2}
            style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, maxWidth: '420px', marginBottom: '2.5rem', fontWeight: 300 }}>
            Sakari — サカリ — means to be at one's peak, one's best. Since 2005, we've held that standard on Ingersoll Avenue, plate by plate.
          </motion.p>

          <motion.div variants={reveal} custom={3}>
            <div style={{ width: '48px', height: '1px', background: `linear-gradient(90deg, ${RED}, transparent)` }} />
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginTop: '1rem' }}>
              2605 Ingersoll Ave · Des Moines IA
            </p>
          </motion.div>
        </motion.div>

        {/* Right — parallax image */}
        <motion.div variants={revealX(1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          style={{ position: 'relative', height: '560px' }}>
          <motion.div style={{ y: imgY, height: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <img src="/assets/food_ai_01.png" alt="Sakari cuisine" style={{ width: '100%', height: '120%', objectFit: 'cover', objectPosition: 'center' }} />
          </motion.div>
          {/* Floating stat */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.4 }}
            style={{ position: 'absolute', bottom: '-1.5rem', left: '-1.5rem', background: 'rgba(6,6,6,0.95)', backdropFilter: 'blur(16px)', border: `1px solid rgba(196,18,48,0.25)`, borderRadius: '16px', padding: '1.25rem 1.5rem', zIndex: 2 }}>
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '2.25rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>22</p>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', color: RED, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.3rem' }}>Signature Rolls</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── SECTION 3: Chef Favorites ────────────────────────────────────────────────
function ChefFavorites() {
  return (
    <section id="chef" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

        {/* Heading — left aligned, spacious */}
        <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          style={{ marginBottom: '5rem' }}>
          <motion.p variants={reveal} custom={0} style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: RED, marginBottom: '1.25rem' }}>
            Chef Favorites
          </motion.p>
          <motion.h2 variants={reveal} custom={1}
            style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0' }}>
            The Rolls That<br />
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: GOLD, fontSize: '1.05em' }}>Started the Conversation</span>
          </motion.h2>
        </motion.div>

        {/* 3 cards — large, spacious, horizontal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {CHEF_PICKS.map((item, i) => (
            <motion.div key={item.name}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, ease: EASE_OUT, delay: i * 0.12 }}
            >
              <div className="card-v2" style={{
                borderRadius: '20px', overflow: 'hidden', position: 'relative',
                background: 'rgba(10,10,10,0.97)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                cursor: 'none',
              }}>
                {/* Image area */}
                <div style={{ height: '280px', overflow: 'hidden', position: 'relative' }}>
                  <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.25,0.8,0.25,1)' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                  {/* Gradient over image */}
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 50%, rgba(10,10,10,0.95) 100%)` }} />
                  {/* Tag */}
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(6,6,6,0.8)', backdropFilter: 'blur(12px)', borderRadius: '100px', padding: '0.3rem 0.85rem', border: `1px solid rgba(${item.accentRGB},0.35)` }}>
                    <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: `rgba(${item.accentRGB},1)` }}>{item.tag}</p>
                  </div>
                </div>

                {/* Text content */}
                <div style={{ padding: '1.75rem 2rem 2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{item.name}</h3>
                    <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.15rem', fontWeight: 700, color: `rgba(${item.accentRGB},1)`, flexShrink: 0, marginLeft: '1rem' }}>{item.price}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontWeight: 300 }}>{item.desc}</p>
                </div>

                {/* Bottom glow accent */}
                <div style={{ height: '2px', background: `linear-gradient(90deg, transparent, rgba(${item.accentRGB},0.6), transparent)` }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Single CTA — not multiple */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
          style={{ marginTop: '3.5rem', textAlign: 'center' }}>
          <a href="https://sakarisushilounge.com/des-moines-sakari-sushi-lounge-food-menu" target="_blank" rel="noopener noreferrer"
            className="btn-outline" style={{ fontSize: '0.72rem', letterSpacing: '0.18em' }}>
            View Full Menu ↗
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ── SECTION 4: Scroll Animation Strip ───────────────────────────────────────
function ScrollAnimation() {
  const sectionRef = useRef(null), canvasRef = useRef(null), frameObjs = useRef([])
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
      trigger: sectionRef.current, start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate(self) {
        const idx = Math.min(Math.floor(self.progress * (frames.length - 1)), frames.length - 1)
        if (idx !== last) { drawFrame(frameObjs.current[idx]); last = idx }
        const a = ANNOTATIONS.find(a => self.progress >= a.progress - 0.08 && self.progress <= a.progress + 0.16)
        setActiveCard(a ? a.progress : null)
      },
    })
    return () => { st.kill(); removeEventListener('resize', resize) }
  }, [])

  return (
    <section ref={sectionRef} className="scroll-section" style={{ height: '450vh' }}>
      <div className="scroll-sticky">
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
        {/* Minimal overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,6,6,0.4) 0%, transparent 20%, transparent 80%, rgba(6,6,6,0.6) 100%)', pointerEvents: 'none' }} />

        {/* Annotation cards — just 2, very minimal */}
        {ANNOTATIONS.map(a => (
          <div key={a.progress}
            style={{
              position: 'absolute',
              [a.side === 'left' ? 'left' : 'right']: 'clamp(2rem,6vw,6rem)',
              top: '50%', transform: 'translateY(-50%)',
              maxWidth: '240px', padding: '1.25rem 1.5rem',
              background: 'rgba(6,6,6,0.75)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: a.side === 'left' ? `2px solid ${RED}` : undefined,
              borderRight: a.side === 'right' ? `2px solid ${RED}` : undefined,
              borderRadius: '12px', zIndex: 10,
              opacity: activeCard === a.progress ? 1 : 0,
              transform: `translateY(${activeCard === a.progress ? '-50%' : 'calc(-50% + 10px)' })`,
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.975rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: '0.35rem' }}>{a.text}</p>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>{a.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── SECTION 5: Happy Hour ────────────────────────────────────────────────────
function HappyHour() {
  return (
    <section id="happyhour" style={{ padding: '10rem 2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* Large drifting gold glow */}
      <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '700px', height: '700px', background: `radial-gradient(circle, rgba(200,134,10,0.07) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', animation: 'glow-drift 12s ease-in-out infinite' }} />

      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>

          {/* Left — big time display */}
          <motion.div variants={revealX(-1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, marginBottom: '1.5rem' }}>Every Friday</p>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(4rem,9vw,7.5rem)', fontWeight: 900, color: '#fff', lineHeight: 0.9, letterSpacing: '-0.04em' }}>2–5</p>
              <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 300, color: GOLD, marginTop: '0.5rem' }}>Happy Hour</p>
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.85, maxWidth: '380px', marginBottom: '2.5rem', fontWeight: 300 }}>
              The best seats in Des Moines. Discounted rolls, cheap drafts, and sake bombs before the dinner rush hits.
            </p>
            <a href="tel:5152883381" className="btn-red" style={{ fontSize: '0.72rem', letterSpacing: '0.18em' }}>Reserve Your Spot</a>
          </motion.div>

          {/* Right — specials list, clean and simple */}
          <motion.div variants={revealX(1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { item: 'House Rolls',           price: '$3.50' },
                { item: 'Kirin Ichiban Draft',   price: '$3.50' },
                { item: 'Sake Bomb',             price: '$7.00' },
                { item: 'Amsterdam Martinis',    price: '$6.00' },
                { item: 'Dynamite Shrimp / Crab',price: '$7.00' },
              ].map((s, i) => (
                <motion.div key={s.item}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT, delay: i * 0.1 }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.0625rem', fontWeight: 600, color: '#fff' }}>{s.item}</span>
                  <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.25rem', fontWeight: 800, color: GOLD }}>{s.price}</span>
                </motion.div>
              ))}
            </div>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.57rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1.5rem' }}>
              Tue–Thu 5–7PM · Fri 2–5PM
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── SECTION 6: Atmosphere Gallery (auto-scroll marquee) ──────────────────────
function Gallery() {
  const doubled = [...GALLERY_IMAGES, ...GALLERY_IMAGES]

  return (
    <section style={{ padding: '6rem 0', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', paddingLeft: '2.5rem', marginBottom: '2.5rem' }}>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: RED, marginBottom: '0.75rem' }}>
          The Atmosphere
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
          style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          Come For the Sushi.<br />
          <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: GOLD, fontSize: '1.05em' }}>Stay for the Night.</span>
        </motion.h2>
      </div>

      {/* Auto-scrolling marquee — slow and cinematic */}
      <div style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '16px', animation: 'marquee 55s linear infinite', width: 'max-content' }}>
          {doubled.map((src, i) => (
            <div key={i} style={{ width: '340px', height: '440px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── SECTION 7: Private Events / Lounge Nights ────────────────────────────────
function PrivateEvents() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section id="events" ref={ref} style={{ padding: '8rem 0', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>

        {/* Left — parallax image */}
        <motion.div variants={revealX(-1)} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}
          style={{ position: 'relative', height: '580px' }}>
          <motion.div style={{ y: imgY, height: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
            <img src="/assets/slide1.jpg" alt="Private events at Sakari" style={{ width: '100%', height: '120%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(6,6,6,0.5) 100%)' }} />
          </motion.div>
          {/* Capacity badge */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.35 }}
            style={{ position: 'absolute', bottom: '-1rem', right: '-1rem', background: 'rgba(6,6,6,0.95)', backdropFilter: 'blur(16px)', border: `1px solid rgba(196,18,48,0.3)`, borderRadius: '14px', padding: '1.1rem 1.4rem', zIndex: 2 }}>
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>30</p>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.55rem', color: RED, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '0.25rem' }}>Seat Private Room</p>
          </motion.div>
        </motion.div>

        {/* Right — copy */}
        <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }}>
          <motion.p variants={reveal} custom={0} style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: RED, marginBottom: '1.5rem' }}>
            Private Events · Catering
          </motion.p>

          <motion.h2 variants={reveal} custom={1}
            style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.25rem,4vw,3.75rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: '1.75rem' }}>
            Your Night.<br />
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: GOLD, fontSize: '1.05em' }}>Our Stage.</span>
          </motion.h2>

          <motion.p variants={reveal} custom={2} style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, marginBottom: '2.5rem', fontWeight: 300, maxWidth: '440px' }}>
            Private room for up to 30 guests. Birthdays, corporate events, wedding parties. Full bar, dedicated staff, custom menu options. Off-site catering available for any occasion.
          </motion.p>

          <motion.div variants={reveal} custom={3} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {['Birthdays & anniversaries', 'Corporate events', 'Wedding receptions', 'Off-site catering'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: RED, flexShrink: 0 }} />
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>{item}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={reveal} custom={4} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="tel:5152883381" className="btn-red" style={{ fontSize: '0.72rem', letterSpacing: '0.18em' }}>Book an Event</a>
            <a href="mailto:sakarisushilounge@gmail.com" className="btn-outline" style={{ fontSize: '0.72rem', letterSpacing: '0.18em' }}>Email Us</a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── SECTION 8: Reservation CTA ───────────────────────────────────────────────
function ReservationCTA() {
  return (
    <section style={{ padding: '8rem 2.5rem 10rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* Full-bleed drifting glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(196,18,48,0.09) 0%, transparent 65%)`, pointerEvents: 'none', animation: 'glow-drift 9s ease-in-out infinite' }} />

      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>

          <motion.p variants={reveal} custom={0} style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: RED, marginBottom: '2rem' }}>
            Reservations
          </motion.p>

          <motion.h2 variants={reveal} custom={1}
            style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(3rem,7vw,6.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 0.95, marginBottom: '1.5rem' }}>
            RESERVE YOUR<br />
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, fontSize: '0.75em', color: GOLD, letterSpacing: '0' }}>Table Tonight</span>
          </motion.h2>

          <motion.p variants={reveal} custom={2} style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.8, maxWidth: '380px', margin: '0 auto 3.5rem', fontWeight: 300 }}>
            Call ahead or walk in. Either way, we'll take you to the summit.
          </motion.p>

          {/* Phone number — big and prominent */}
          <motion.div variants={reveal} custom={3} style={{ marginBottom: '1.5rem' }}>
            <a href="tel:5152883381" className="btn-red"
              style={{ fontSize: '1rem', letterSpacing: '0.12em', padding: '1.1rem 3rem' }}>
              (515) 288-3381
            </a>
          </motion.div>

          <motion.div variants={reveal} custom={4}>
            <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer"
              className="btn-outline" style={{ fontSize: '0.72rem', letterSpacing: '0.18em' }}>
              Order Online ↗
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── SECTION 9: Footer ────────────────────────────────────────────────────────
function Footer() {
  return (
    <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
      style={{ padding: '4rem 2.5rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4rem', marginBottom: '3rem', alignItems: 'start', flexWrap: 'wrap' }}>

          {/* Brand */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '10px', padding: '5px 14px', display: 'inline-block', marginBottom: '1.25rem' }}>
              <img src="/assets/logo_scroll.png" alt="Sakari Sushi Lounge" style={{ height: '36px', objectFit: 'contain', display: 'block' }} />
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.75, maxWidth: '220px', fontWeight: 300 }}>
              Summit-level Japanese cuisine on Ingersoll Avenue, Des Moines, Iowa.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[
                { label: 'IG', href: 'https://www.instagram.com/sakarisushilounge' },
                { label: 'FB', href: 'https://www.facebook.com/131847286851728' },
                { label: 'YP', href: 'https://www.yelp.com/biz/sakari-sushi-lounge-des-moines' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'all 0.3s ease' }}
                  onMouseEnter={e => { e.target.style.borderColor = `rgba(196,18,48,0.4)`; e.target.style.color = RED }}
                  onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.35)' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: RED, marginBottom: '1.25rem' }}>Hours</p>
            {[
              { d: 'Mon',     h: '11AM–2PM · 5–10PM' },
              { d: 'Tue–Thu', h: '11AM–2PM · 5–9PM'  },
              { d: 'Fri–Sat', h: '11AM–11PM'          },
              { d: 'Sunday',  h: '5PM–9PM'            },
            ].map(h => (
              <div key={h.d} style={{ marginBottom: '0.5rem', display: 'flex', gap: '1.5rem' }}>
                <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', minWidth: '54px' }}>{h.d}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontWeight: 300 }}>{h.h}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: RED, marginBottom: '1.25rem' }}>Contact</p>
            {[
              { label: '(515) 288-3381', href: 'tel:5152883381' },
              { label: 'sakarisushilounge@gmail.com', href: 'mailto:sakarisushilounge@gmail.com' },
              { label: '2605 Ingersoll Ave, Des Moines', href: 'https://maps.google.com/?q=2605+Ingersoll+Ave+Des+Moines+IA' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', marginBottom: '0.5rem', fontWeight: 300, transition: 'color 0.3s ease' }}
                onMouseEnter={e => (e.target.style.color = RED)}
                onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.28)')}>
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em' }}>© 2026 Sakari Sushi Lounge</p>
          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.875rem', color: 'rgba(255,255,255,0.15)' }}>Sakari — To Be At One's Best</p>
        </div>
      </div>
    </motion.footer>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────
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
            <ExperienceStatement />
            <ChefFavorites />
            <ScrollAnimation />
            <HappyHour />
            <Gallery />
            <PrivateEvents />
            <ReservationCTA />
          </main>
          <Footer />
        </>
      )}
    </>
  )
}
