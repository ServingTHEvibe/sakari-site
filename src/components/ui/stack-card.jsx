import { motion } from 'framer-motion'

// Sakari sushi menu items with dark gold palette
const SUSHI_ITEMS = [
  { emoji: '🍣', name: 'Godzilla Roll',      sub: 'House Roll',     hueA: 35,  hueB: 20  },
  { emoji: '🦐', name: 'Bang Bang Shrimp',   sub: 'Appetizer',      hueA: 20,  hueB: 5   },
  { emoji: '🐟', name: 'Tuna Tataki',        sub: 'Sashimi',        hueA: 200, hueB: 220 },
  { emoji: '🥩', name: 'Iowa Surf & Turf',   sub: 'Chef Signature', hueA: 0,   hueB: 15  },
  { emoji: '🦀', name: 'Spider Roll',        sub: 'House Roll',     hueA: 12,  hueB: 28  },
  { emoji: '🍱', name: 'Sushi Combo',        sub: 'Combination',    hueA: 40,  hueB: 55  },
  { emoji: '🍵', name: 'Sake Bomb',          sub: 'Bar Program',    hueA: 95,  hueB: 120 },
  { emoji: '🍹', name: 'Craft Cocktails',    sub: 'Bar Program',    hueA: 30,  hueB: 45  },
]

const cardVariants = {
  offscreen: { y: 300 },
  onscreen: {
    y: 50,
    rotate: -10,
    transition: { type: 'spring', bounce: 0.4, duration: 0.8 },
  },
}

const hue = (h) => `hsl(${h}, 80%, 38%)`

function SushiCard({ emoji, name, sub, hueA, hueB }) {
  const background = `linear-gradient(306deg, ${hue(hueA)}, ${hue(hueB)})`

  return (
    <motion.div
      style={{
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        paddingTop: 20,
        marginBottom: -120,
      }}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.8 }}
    >
      {/* Splash shape */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background,
          clipPath: 'path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")',
        }}
      />

      {/* Card */}
      <motion.div
        variants={cardVariants}
        style={{
          width: 300,
          height: 430,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 20,
          background: 'rgba(14,14,14,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(200,134,10,0.2)',
          boxShadow: '0 0 2px rgba(0,0,0,0.3), 0 0 4px rgba(0,0,0,0.3), 0 0 12px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.6)',
          transformOrigin: '10% 60%',
          position: 'relative',
          overflow: 'hidden',
          gap: '1rem',
        }}
      >
        {/* Gold glow top-right corner (Marcelo: glow sampled from hero) */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: `radial-gradient(circle, ${hue(hueA)}33 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ fontSize: 100, lineHeight: 1, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>{emoji}</div>

        <div style={{ textAlign: 'center', padding: '0 1.5rem' }}>
          <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '0.35rem' }}>{name}</p>
          <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8860A' }}>{sub}</p>
        </div>

        {/* Bottom accent line */}
        <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '2px', background: `linear-gradient(90deg, transparent, ${hue(hueA)}, transparent)` }} />
      </motion.div>
    </motion.div>
  )
}

export function SushiStackScroll() {
  return (
    <div style={{ margin: '0 auto', maxWidth: 500, paddingBottom: 100, width: '100%' }}>
      {SUSHI_ITEMS.map((item) => (
        <SushiCard key={item.name} {...item} />
      ))}
    </div>
  )
}
