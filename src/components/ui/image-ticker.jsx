import { useRef, useEffect } from 'react'

const GAP    = 16   // px between images
const SPEED  = 48   // px per second
const TILT   = -15  // degrees (negative = top leans left)

// ─── Image columns ─────────────────────────────────────────────────────────────
const COL1 = [
  '/assets/slide1.jpg',       // plated sushi roll
  '/assets/food_00.jpg',      // fried appetizer w/ orchid
  '/assets/food_02.jpg',      // tuna tataki close-up
]
const COL2 = [
  '/assets/food_ai_01.png',   // sushi explosion shot
  '/assets/sushi_hero_01.png',// craft cocktail
  '/assets/slide2.jpg',       // private dining room
]
const COL3 = [
  '/assets/food_01.jpg',      // green roll
  '/assets/slide3.jpg',       // grill plate
  '/assets/sushi_hero_02.png',// plated dark sushi
]

function getSetHeight(el) {
  if (!el || !el.children.length) return 1
  const n = Math.round(el.children.length / 3)
  let h = 0
  for (let i = 0; i < n; i++) h += (el.children[i]?.offsetHeight ?? 0) + GAP
  return h || 1
}

function TickerColumn({ srcs, colRef }) {
  const tripled = [...srcs, ...srcs, ...srcs]
  return (
    <div
      ref={colRef}
      style={{
        display: 'flex', flexDirection: 'column', gap: GAP,
        flex: '1 1 0', minWidth: 0, willChange: 'transform',
      }}
    >
      {tripled.map((src, i) => (
        <div key={i} style={{ borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={src} alt="" draggable={false}
            loading={i < 3 ? 'eager' : 'lazy'}
            style={{ width: '100%', display: 'block', aspectRatio: '3/4', objectFit: 'cover' }}
          />
        </div>
      ))}
    </div>
  )
}

export function ImageTickerGallery() {
  const ref1 = useRef(null)
  const ref2 = useRef(null)
  const ref3 = useRef(null)

  useEffect(() => {
    const refs = [ref1, ref2, ref3]
    const dirs = [1, -1, 1]   // 1 = scroll up, -1 = scroll down
    const offsets = [0, 0, 0]
    let prev = null
    let raf

    function tick(t) {
      const dt = prev == null ? 16 : Math.min(t - prev, 100)
      prev = t
      const step = (dt / 1000) * SPEED

      refs.forEach((ref, i) => {
        const el = ref.current
        if (!el) return
        const h = getSetHeight(el)
        offsets[i] = ((offsets[i] + step) % h + h) % h
        // Up: translateY(-offset); Down: translateY(offset - h) → starts at -h, rises to 0
        el.style.transform = dirs[i] === 1
          ? `translateY(-${offsets[i]}px)`
          : `translateY(${offsets[i] - h}px)`
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section
      id="gallery"
      style={{ position: 'relative', height: '90vh', overflow: 'hidden', zIndex: 1 }}
    >
      {/* Oversized rotated container so corners don't show */}
      <div
        style={{
          position: 'absolute',
          top: '-35%', left: '-12%', right: '-12%', bottom: '-35%',
          transform: `rotate(${TILT}deg)`,
          display: 'flex', gap: GAP,
        }}
      >
        <TickerColumn srcs={COL1} colRef={ref1} />
        <TickerColumn srcs={COL2} colRef={ref2} />
        <TickerColumn srcs={COL3} colRef={ref3} />
      </div>

      {/* Vignette + top/bottom page-color fade */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: [
          'linear-gradient(to bottom, #080808 0%, transparent 18%, transparent 82%, #080808 100%)',
          'radial-gradient(ellipse at center, rgba(8,8,8,0.1) 0%, rgba(8,8,8,0.55) 100%)',
        ].join(', '),
      }} />

      {/* Centered heading */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 2rem',
      }}>
        <p style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: '0.63rem',
          letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C41230',
          marginBottom: '0.9rem',
        }}>Gallery</p>

        <h2 style={{
          fontFamily: '"Space Grotesk", system-ui',
          fontSize: 'clamp(2.6rem, 6vw, 5rem)',
          fontWeight: 700, letterSpacing: '-0.02em',
          color: '#fff', lineHeight: 1.0, margin: 0,
        }}>
          The Look of
        </h2>
        <span style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(2.8rem, 6.6vw, 5.5rem)',
          color: '#C8860A', lineHeight: 1.05, display: 'block',
        }}>
          Sakari
        </span>

        <div style={{
          width: 52, height: 1, marginTop: '1.5rem',
          background: 'linear-gradient(90deg, transparent, #C41230, transparent)',
        }} />
      </div>
    </section>
  )
}
