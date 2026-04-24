import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── Data ────────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Courtney H.',
    role: 'Yelp Reviewer',
    quote: 'Hands down the best sushi I have ever had. There is no place we even consider comparable. The quality is exceptionally good.',
    avatar: 'CH',
  },
  {
    name: 'Kenneth S.',
    role: 'Yelp Reviewer',
    quote: 'Sushi is fantastic! Drinks were fantastic! Service was fantastic! This place does get very busy but it is absolutely worth the wait.',
    avatar: 'KS',
  },
  {
    name: 'Abby K.',
    role: 'Yelp Reviewer',
    quote: 'Sakari is my go-to for sushi in Des Moines. The food is amazing, the service is wonderful and they are so wonderfully kind.',
    avatar: 'AK',
  },
  {
    name: 'Nate R.',
    role: 'Yelp Reviewer',
    quote: 'Always great service and food — whether you order rolls or something off the menu. The steak had amazing flavor and was cooked perfect.',
    avatar: 'NR',
  },
  {
    name: 'Andrea B.',
    role: 'Yelp Reviewer',
    quote: 'Everything was delicious! All the different choices of sushi roll and nigiri. It was all fresh and so beautifully presented.',
    avatar: 'AB',
  },
]

const MENU = [
  {
    name: 'Godzilla Roll',
    desc: 'A house signature — monster-sized, bold flavors, built for those who refuse to compromise.',
    tag: 'House Roll',
    img: '/assets/sushi-explosion.png',
  },
  {
    name: 'Iowa Surf & Turf',
    desc: 'The Midwest done right. Premium beef meets the freshest catch, plated like a work of art.',
    tag: 'Chef Signature',
    img: '/assets/sushi-plated.png',
  },
  {
    name: 'Tuna Tataki',
    desc: 'Delicately seared bluefin tuna, yuzu ponzu, micro herbs — precision on a plate.',
    tag: 'Sashimi',
    img: '/assets/sushi-plated.png',
  },
  {
    name: 'Craft Cocktails',
    desc: 'Amsterdam Martinis, Sake Bombs, and seasonal creations poured with the same care as the food.',
    tag: 'Bar Program',
    img: '/assets/cocktail.png',
  },
]

const FEATURES = [
  { icon: '◈', title: 'Private Events', desc: 'Seat up to 30 guests in our private lounge. Birthday dinners, corporate events, and weddings done right.' },
  { icon: '◉', title: 'Happy Hour', desc: 'Friday 2–5 PM: house rolls at $3.50, Kirin draft, Sake Bombs, and Amsterdam martinis.' },
  { icon: '◈', title: 'Online Ordering', desc: 'Skip the wait. Order pickup or delivery direct, through Grubhub, or DoorDash.' },
  { icon: '◉', title: 'Catering', desc: 'Full catering packages for any occasion. Let us bring the Sakari experience to you.' },
  { icon: '◈', title: 'Gift Cards', desc: 'Give someone an experience worth having. Sakari gift cards available in any amount.' },
  { icon: '◉', title: 'Reservations', desc: 'Book your table in advance. Walk-ins welcome, but the best seats are reserved.' },
]

const STATS = [
  { value: 15, suffix: '+', label: 'Years on Ingersoll' },
  { value: 22, suffix: '', label: 'Signature Rolls' },
  { value: 5, suffix: '★', label: 'Yelp Rating' },
  { value: 30, suffix: '', label: 'Private Event Seats' },
]

const FRAME_COUNT = 90
const frames = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`
)

const ANNOTATIONS = [
  { progress: 0.18, text: 'Every roll, made to order', sub: 'Nothing frozen. Nothing rushed.', side: 'left' },
  { progress: 0.42, text: 'Cinematic presentation', sub: 'You eat with your eyes first.', side: 'right' },
  { progress: 0.68, text: 'Summit-level craft', sub: "Sakari — to be at one's peak.", side: 'left' },
  { progress: 0.88, text: 'Des Moines never tasted like this', sub: '2605 Ingersoll Ave', side: 'right' },
]

// ─── Starscape ────────────────────────────────────────────────────────────────

function Starscape() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      drift: (Math.random() - 0.5) * 0.00008,
      ts: Math.random() * 0.018 + 0.004,
      tp: Math.random() * Math.PI * 2,
      ba: Math.random() * 0.5 + 0.15,
    }))
    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)
    function draw(t) {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (const s of stars) {
        s.x += s.drift
        if (s.x > 1) s.x = 0
        if (s.x < 0) s.x = 1
        const alpha = s.ba + Math.sin(t * s.ts + s.tp) * 0.18
        ctx.beginPath()
        ctx.arc(s.x * window.innerWidth, s.y * window.innerHeight, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} id="starscape" />
}

// ─── Cursor ───────────────────────────────────────────────────────────────────

function Cursor() {
  const curRef = useRef(null)
  const folRef = useRef(null)
  useEffect(() => {
    const cur = curRef.current, fol = folRef.current
    let fx = 0, fy = 0, mx = 0, my = 0, raf
    const onMove = e => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', onMove)
    function tick() {
      cur.style.left = mx + 'px'; cur.style.top = my + 'px'
      fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12
      fol.style.left = fx + 'px'; fol.style.top = fy + 'px'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const over = () => { cur.classList.add('hover'); fol.classList.add('hover') }
    const out = () => { cur.classList.remove('hover'); fol.classList.remove('hover') }
    const targets = document.querySelectorAll('a,button,.feature-card,.testimonial-card')
    targets.forEach(el => { el.addEventListener('mouseenter', over); el.addEventListener('mouseleave', out) })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove) }
  }, [])
  return (
    <>
      <div ref={curRef} className="cursor" />
      <div ref={folRef} className="cursor-follower" />
    </>
  )
}

// ─── Scroll Progress ──────────────────────────────────────────────────────────

function ScrollProgressBar() {
  const ref = useRef(null)
  useEffect(() => {
    const update = () => {
      const d = document.documentElement
      const pct = window.scrollY / (d.scrollHeight - d.clientHeight)
      if (ref.current) ref.current.style.transform = `scaleX(${pct})`
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <div ref={ref} className="scroll-progress" />
}

// ─── Preloader ────────────────────────────────────────────────────────────────

function Preloader({ onDone }) {
  const [pct, setPct] = useState(0)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let loaded = 0
    const total = frames.length
    const imgs = frames.map(src => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        setPct(Math.round((loaded / total) * 100))
        if (loaded === total) {
          setTimeout(() => { setHidden(true); setTimeout(onDone, 800) }, 400)
        }
      }
      img.src = src
      return img
    })
    return () => imgs.forEach(i => { i.onload = null; i.onerror = null })
  }, [onDone])

  return (
    <div className={`preloader ${hidden ? 'hidden' : ''}`}>
      <div style={{ textAlign: 'center' }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Loading Experience</p>
        <h1 className="font-serif" style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 300, letterSpacing: '0.18em', color: '#fff', margin: '0 0 1.5rem' }}>
          SAKARI
        </h1>
        <div style={{ width: '200px', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 auto 0.75rem', position: 'relative', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'linear-gradient(90deg,#C8860A,#F2C96D)', transition: 'width 0.15s ease', width: `${pct}%` }} />
        </div>
        <p className="font-mono" style={{ fontSize: '0.65rem', color: 'rgba(200,134,10,0.7)', letterSpacing: '0.12em' }}>{pct}%</p>
      </div>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [pill, setPill] = useState(false)
  useEffect(() => {
    const fn = () => setPill(window.scrollY > 80)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <nav className={`navbar ${pill ? 'pill' : ''}`} role="navigation">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#hero" style={{ textDecoration: 'none' }}>
          <span className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 300, letterSpacing: '0.2em', color: '#fff' }}>SAKARI</span>
          <span style={{ display: 'block', fontSize: '0.52rem', letterSpacing: '0.28em', color: '#C8860A', fontFamily: 'JetBrains Mono,monospace', marginTop: '-2px' }}>SUSHI LOUNGE</span>
        </a>
        <div className="nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['menu', 'about', 'events', 'contact'].map(l => (
            <a key={l} href={`#${l}`}
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target.style.color = '#C8860A')}
              onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.6)')}
            >{l}</a>
          ))}
          <a href="tel:5152883381" className="btn-gold" style={{ padding: '0.5rem 1.25rem', fontSize: '0.72rem' }}>Reserve</a>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '8rem 2.5rem 5rem' }}>
      <div className="orb" style={{ width: '700px', height: '700px', background: 'radial-gradient(circle,rgba(200,134,10,0.1) 0%,transparent 70%)', top: '-15%', right: '-8%' }} />
      <div className="orb" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle,rgba(200,134,10,0.05) 0%,transparent 70%)', bottom: '5%', left: '-8%' }} />
      <div style={{ maxWidth: '1300px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Copy */}
        <div>
          <p className="section-label reveal">Des Moines, Iowa · Est. 2005</p>
          <h1 className="font-serif reveal reveal-delay-1"
            style={{ fontSize: 'clamp(3rem,6vw,6.5rem)', fontWeight: 300, lineHeight: 1.06, letterSpacing: '0.01em', color: '#fff', marginBottom: '1.5rem' }}>
            At The<br /><em style={{ fontStyle: 'italic', color: '#C8860A' }}>Peak</em> Of<br />Japanese<br />Craft.
          </h1>
          <div className="gold-divider reveal reveal-delay-2" />
          <p className="reveal reveal-delay-2" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: '420px', marginBottom: '2.5rem' }}>
            Sakari — to be at one's best. Fresh rolls, premium fish, craft cocktails, and a lounge that feels like it was built for the moment.
          </p>
          <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-gold">Order Online ↗</a>
            <a href="#menu" className="btn-outline">Explore Menu</a>
          </div>
          {/* Stats */}
          <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label}>
                <p className="font-serif" style={{ fontSize: '1.75rem', fontWeight: 500, color: '#C8860A', lineHeight: 1 }}>{s.value}{s.suffix}</p>
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: '0.25rem', textTransform: 'uppercase' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Image stack */}
        <div className="reveal reveal-delay-2" style={{ position: 'relative', height: '580px' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '85%', height: '72%', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(200,134,10,0.15)' }}>
            <img src="/assets/sushi-explosion.png" alt="Signature sushi roll" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '55%', height: '44%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(200,134,10,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.65)' }}>
            <img src="/assets/cocktail.png" alt="Craft cocktail" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="glass-gold" style={{ position: 'absolute', top: '46%', left: '-6%', padding: '0.8rem 1.25rem', zIndex: 10 }}>
            <p style={{ fontSize: '0.55rem', letterSpacing: '0.18em', color: '#C8860A', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Yelp Rating</p>
            <p className="font-serif" style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 400 }}>★★★★★</p>
          </div>
        </div>
      </div>
      {/* Scroll hint */}
      <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2 }}>
        <p style={{ fontSize: '0.58rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Scroll</p>
        <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom,#C8860A,transparent)', margin: '0 auto' }} />
      </div>
    </section>
  )
}

// ─── Scroll Video ─────────────────────────────────────────────────────────────

function ScrollVideo() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const frameObjs = useRef([])
  const [activeCard, setActiveCard] = useState(null)

  useEffect(() => {
    frameObjs.current = frames.map(src => { const img = new Image(); img.src = src; return img })
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)
    function drawFrame(img) {
      if (!img?.complete || !img.naturalWidth) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const iw = img.naturalWidth, ih = img.naturalHeight
      const cw = window.innerWidth, ch = window.innerHeight
      const scale = Math.max(cw / iw, ch / ih)
      ctx.drawImage(img, (cw - iw * scale) / 2, (ch - ih * scale) / 2, iw * scale, ih * scale)
    }
    // Draw first frame as soon as it loads
    frameObjs.current[0].onload = () => drawFrame(frameObjs.current[0])
    if (frameObjs.current[0].complete) drawFrame(frameObjs.current[0])

    let lastFrame = -1
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate(self) {
        const idx = Math.min(Math.floor(self.progress * (frames.length - 1)), frames.length - 1)
        if (idx !== lastFrame) { drawFrame(frameObjs.current[idx]); lastFrame = idx }
        let active = null
        for (const a of ANNOTATIONS) {
          if (self.progress >= a.progress - 0.07 && self.progress <= a.progress + 0.13) { active = a; break }
        }
        setActiveCard(active ? active.progress : null)
      },
    })
    return () => { st.kill(); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="about" ref={sectionRef} className="scroll-section" style={{ height: '500vh' }}>
      <div className="scroll-sticky">
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(8,8,8,0.35) 0%,transparent 25%,transparent 75%,rgba(8,8,8,0.5) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
          <p className="section-label">The Experience</p>
        </div>
        {ANNOTATIONS.map(a => (
          <div key={a.progress}
            className={`annotation-card glass-gold ${activeCard === a.progress ? 'visible' : ''}`}
            style={{ [a.side === 'left' ? 'left' : 'right']: 'clamp(1rem,5vw,5rem)', top: '50%', transform: 'translateY(-50%)', maxWidth: '260px', padding: '1.25rem 1.5rem', zIndex: 10 }}
          >
            <p className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 400, color: '#fff', lineHeight: 1.3, marginBottom: '0.35rem' }}>{a.text}</p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>{a.sub}</p>
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>Keep Scrolling</p>
        </div>
      </div>
    </section>
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function Menu() {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section id="menu" ref={ref} style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ marginBottom: '4rem', maxWidth: '540px' }}>
          <p className="section-label reveal">Signature Dishes</p>
          <h2 className="font-serif reveal reveal-delay-1" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 300, lineHeight: 1.1, color: '#fff' }}>
            The Menu That<br /><em style={{ color: '#C8860A', fontStyle: 'italic' }}>Started the Conversation</em>
          </h2>
          <div className="gold-divider reveal reveal-delay-2" />
          <p className="reveal reveal-delay-2" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontSize: '0.9375rem' }}>
            Every dish is built around one principle: if it's not exceptional, it's not on the plate.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: '1.5rem' }}>
          {MENU.map((item, i) => (
            <div key={item.name} className={`glass feature-card reveal reveal-delay-${i + 1}`} style={{ overflow: 'hidden' }}>
              <div style={{ height: '200px', overflow: 'hidden' }}>
                <img src={item.img} alt={item.name} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', display: 'block' }}
                  onMouseEnter={e => (e.target.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.target.style.transform = 'scale(1)')}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p className="section-label" style={{ marginBottom: '0.4rem' }}>{item.tag}</p>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 400, color: '#fff', marginBottom: '0.5rem' }}>{item.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }} className="reveal">
          <a href="https://www.sakarisushilounge.com" target="_blank" rel="noopener noreferrer" className="btn-gold">View Full Menu ↗</a>
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section id="events" ref={ref} style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p className="section-label reveal">Everything We Offer</p>
          <h2 className="font-serif reveal reveal-delay-1" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 300, color: '#fff', lineHeight: 1.1 }}>
            More Than a<br /><em style={{ color: '#C8860A', fontStyle: 'italic' }}>Restaurant</em>
          </h2>
          <div className="gold-divider reveal reveal-delay-2" style={{ margin: '1.25rem auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(255px,1fr))', gap: '1.25rem' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`glass feature-card reveal reveal-delay-${(i % 3) + 1}`} style={{ padding: '2rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(200,134,10,0.1)', border: '1px solid rgba(200,134,10,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#C8860A', marginBottom: '1.25rem' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff', letterSpacing: '0.02em', marginBottom: '0.6rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section ref={ref} style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p className="section-label reveal">What People Say</p>
          <h2 className="font-serif reveal reveal-delay-1" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 300, color: '#fff', lineHeight: 1.1 }}>
            The Verdict Is<br /><em style={{ color: '#C8860A', fontStyle: 'italic' }}>Unanimous</em>
          </h2>
          <div className="gold-divider reveal reveal-delay-2" style={{ margin: '1.25rem auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(275px,1fr))', gap: '1.25rem' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`glass testimonial-card reveal reveal-delay-${(i % 3) + 1}`} style={{ padding: '2rem' }}>
              <div style={{ color: '#C8860A', fontSize: '0.875rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>★★★★★</div>
              <p className="font-serif" style={{ fontSize: '1.0625rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, marginBottom: '1.5rem' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(200,134,10,0.12)', border: '1px solid rgba(200,134,10,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#C8860A', flexShrink: 0 }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff' }}>{t.name}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.05em' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Location ─────────────────────────────────────────────────────────────────

function Location() {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section id="contact" ref={ref} style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        <div>
          <p className="section-label reveal">Find Us</p>
          <h2 className="font-serif reveal reveal-delay-1" style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300, color: '#fff', lineHeight: 1.1, marginBottom: '2rem' }}>
            On Ingersoll,<br /><em style={{ color: '#C8860A' }}>Where It Belongs</em>
          </h2>
          <div className="glass reveal reveal-delay-2" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <p className="section-label" style={{ marginBottom: '0.6rem' }}>Address</p>
            <p style={{ fontSize: '1.0625rem', color: '#fff', lineHeight: 1.65 }}>2605 Ingersoll Avenue<br />Des Moines, IA 50312</p>
          </div>
          <div className="glass reveal reveal-delay-3" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
            <p className="section-label" style={{ marginBottom: '0.6rem' }}>Contact</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              <a href="tel:5152883381" style={{ color: '#C8860A', textDecoration: 'none', fontSize: '1rem' }}>(515) 288-3381</a><br />
              <a href="mailto:sakarisushilounge@gmail.com" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.875rem' }}>sakarisushilounge@gmail.com</a>
            </p>
          </div>
          <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="tel:5152883381" className="btn-gold">Call to Reserve</a>
            <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-outline">Order Online ↗</a>
          </div>
        </div>
        <div className="reveal reveal-delay-2">
          <p className="section-label" style={{ marginBottom: '1.5rem' }}>Hours</p>
          <div className="glass" style={{ padding: '2rem' }}>
            {[
              { day: 'Monday', hours: 'Lunch 11AM–2PM · Dinner 5–10PM' },
              { day: 'Tue–Thu', hours: 'Lunch 11AM–2PM · Dinner 5–9PM' },
              { day: 'Friday', hours: '11AM–11PM · Happy Hour 2–5PM' },
              { day: 'Saturday', hours: '11AM–11PM' },
              { day: 'Sunday', hours: '5PM–9PM' },
            ].map((h, i) => (
              <div key={h.day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.85rem 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none', gap: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff', letterSpacing: '0.05em', minWidth: '72px' }}>{h.day}</span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.48)', textAlign: 'right' }}>{h.hours}</span>
              </div>
            ))}
            <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(200,134,10,0.07)', borderRadius: '10px', border: '1px solid rgba(200,134,10,0.16)' }}>
              <p className="section-label" style={{ marginBottom: '0.3rem' }}>Friday Happy Hour</p>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)' }}>House rolls $3.50 · Kirin Draft $3.50 · Sake Bombs $7</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA Band ─────────────────────────────────────────────────────────────────

function CTABand() {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section ref={ref} style={{ padding: '5rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div className="glass-gold" style={{ padding: 'clamp(3rem,6vw,5rem) clamp(2rem,5vw,4rem)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
          <div className="orb" style={{ width: '350px', height: '350px', background: 'radial-gradient(circle,rgba(200,134,10,0.14) 0%,transparent 70%)', top: '-50%', left: '-10%', position: 'absolute' }} />
          <p className="section-label reveal" style={{ position: 'relative' }}>Ready When You Are</p>
          <h2 className="font-serif reveal reveal-delay-1" style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 300, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem', position: 'relative' }}>
            Reserve Your<br /><em style={{ color: '#C8860A' }}>Table Tonight</em>
          </h2>
          <p className="reveal reveal-delay-2" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 2.5rem', position: 'relative' }}>
            Call ahead or walk in. Either way, we're ready to take you to the summit.
          </p>
          <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <a href="tel:5152883381" className="btn-gold">(515) 288-3381</a>
            <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-outline">Order for Delivery</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ padding: '4rem 2.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '3rem', alignItems: 'start', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div>
            <p className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.2em', color: '#fff' }}>SAKARI</p>
            <p style={{ fontSize: '0.52rem', letterSpacing: '0.28em', color: '#C8860A', fontFamily: 'JetBrains Mono,monospace', marginTop: '-2px', marginBottom: '1rem' }}>SUSHI LOUNGE</p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, maxWidth: '210px' }}>
              Summit-level Japanese cuisine.<br />2605 Ingersoll Ave, Des Moines IA.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', paddingLeft: '2rem' }}>
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>Visit</p>
              {['Menu', 'Happy Hour', 'Private Events', 'Catering', 'Gift Cards'].map(l => (
                <a key={l} href="#menu" style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.target.style.color = '#C8860A')}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.45)')}>{l}</a>
              ))}
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '1rem' }}>Contact</p>
              {[
                { label: '(515) 288-3381', href: 'tel:5152883381' },
                { label: 'Email Us', href: 'mailto:sakarisushilounge@gmail.com' },
                { label: 'Get Directions', href: 'https://maps.google.com/?q=2605+Ingersoll+Ave+Des+Moines+IA' },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.target.style.color = '#C8860A')}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.45)')}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: '1rem' }}>Follow</p>
            {[
              { label: '@sakarisushilounge', href: 'https://www.instagram.com/sakarisushilounge' },
              { label: 'TikTok', href: 'https://www.tiktok.com/@sakarisushilounge' },
              { label: 'Facebook', href: 'https://www.facebook.com/131847286851728' },
              { label: 'Yelp Reviews', href: 'https://www.yelp.com/biz/sakari-sushi-lounge-des-moines' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.target.style.color = '#C8860A')}
                onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.45)')}>{s.label}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.05em' }}>© 2026 Sakari Sushi Lounge · Des Moines, Iowa</p>
          <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sakari — To Be At One's Best</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Reveal hook ─────────────────────────────────────────────────────────────

function useReveal(containerRef) {
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return
    const els = container.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [containerRef])
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!ready) return
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } }),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [ready])

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
