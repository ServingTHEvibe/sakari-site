import { motion } from 'framer-motion'

const RED  = '#C41230'
const GOLD = '#C8860A'

const POPULAR_ITEMS = [
  {
    name: 'Godzilla Roll',
    price: '$17',
    category: 'Signature Roll',
    badge: 'Most Popular',
    desc: 'Crunchy flakes, tempura shrimp, avocado, cream cheese — topped w/ spicy tuna mix, spicy mayo & unagi',
    bgA: '#C41230',
    bgB: '#7A0A1C',
    accentColor: '#C41230',
  },
  {
    name: 'Iowa Surf & Turf',
    price: '$18.50',
    category: "Chef's Signature",
    badge: 'Signature',
    desc: 'Bacon, tempura shrimp, cream cheese — topped w/ seared top sirloin, spicy mayo, unagi & bacon crumbles',
    bgA: '#C8860A',
    bgB: '#7A4F00',
    accentColor: '#C8860A',
  },
  {
    name: 'Phoenix Roll',
    price: '$18',
    category: 'Specialty Roll',
    badge: "Chef's Pick",
    desc: 'Tempura shrimp, cucumber, spicy tuna mix — topped w/ seared salmon, garlic mayo, jalapeños & sriracha',
    bgA: '#B22000',
    bgB: '#6B1400',
    accentColor: '#E03010',
  },
  {
    name: 'Tuna Tataki',
    price: '$16',
    category: 'Sashimi',
    badge: 'Premium',
    desc: 'Marinated seared red tuna over seaweed salad, honey wasabi sprouts — precision on a plate',
    bgA: '#1A4A8A',
    bgB: '#0D2B55',
    accentColor: '#4080C8',
  },
  {
    name: 'Bang Bang Shrimp',
    price: '$10',
    category: 'Appetizer',
    badge: 'Fan Favorite',
    desc: 'Five crispy shrimp tossed in our signature sweet and spicy sauce — impossible to eat just one',
    bgA: '#C85A00',
    bgB: '#7A3400',
    accentColor: '#E07020',
  },
  {
    name: 'Dynamite Shrimp',
    price: '$9',
    category: 'Happy Hour',
    badge: 'Happy Hour Special',
    desc: 'Four tempura-fried shrimp stuffed with cream cheese — topped with spicy mayo & unagi sauce',
    bgA: '#8B1A1A',
    bgB: '#4A0808',
    accentColor: '#C83030',
  },
  {
    name: 'Sake Bomb',
    price: '$5',
    category: 'Bar Program',
    badge: 'House Classic',
    desc: 'Traditional sake dropped into an ice-cold Kirin draft — the signature Sakari experience',
    bgA: '#2A4A2A',
    bgB: '#142814',
    accentColor: '#50A050',
  },
  {
    name: 'Panko Fried Ice Cream',
    price: '$9',
    category: 'Dessert',
    badge: 'Signature Dessert',
    desc: 'Vanilla ice cream, tempura battered & panko fried — drizzled with chocolate & caramel',
    bgA: '#5A3A8A',
    bgB: '#2E1A55',
    accentColor: '#9060C8',
  },
]

const cardVariants = {
  offscreen: { y: 280, opacity: 0 },
  onscreen: {
    y: 40,
    rotate: -8,
    opacity: 1,
    transition: { type: 'spring', bounce: 0.35, duration: 0.9 },
  },
}

function PopularCard({ name, price, category, badge, desc, bgA, bgB, accentColor }) {
  const splashBg = `linear-gradient(135deg, ${bgA}cc, ${bgB}ee)`

  return (
    <motion.div
      style={{
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        paddingTop: 20,
        marginBottom: -130,
      }}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.75 }}
    >
      {/* Splash wave shape */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: splashBg,
          clipPath: 'path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")',
          opacity: 0.7,
        }}
      />

      {/* Glass card */}
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.02, rotate: -6, transition: { duration: 0.3 } }}
        style={{
          width: 320,
          height: 420,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 24,
          background: 'rgba(10,10,10,0.97)',
          backdropFilter: 'blur(24px)',
          border: `1px solid ${accentColor}33`,
          boxShadow: `0 2px 4px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.5), 0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset`,
          transformOrigin: '10% 60%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top color band */}
        <div style={{
          height: '4px',
          background: `linear-gradient(90deg, ${bgA}, ${bgB}, ${bgA})`,
          flexShrink: 0,
        }} />

        {/* Glow orb top-right */}
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '140px', height: '140px',
          background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* Badge */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-block',
              fontFamily: '"JetBrains Mono",monospace',
              fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: accentColor,
              background: `${accentColor}14`,
              border: `1px solid ${accentColor}33`,
              borderRadius: '100px', padding: '0.25rem 0.75rem',
            }}>
              {badge}
            </span>
          </div>

          {/* Name + price row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.6rem' }}>
            <h3 style={{
              fontFamily: '"Space Grotesk",system-ui',
              fontSize: '1.35rem', fontWeight: 800,
              color: '#fff', lineHeight: 1.15,
              letterSpacing: '-0.02em', flex: 1,
            }}>{name}</h3>
            <span style={{
              fontFamily: '"Space Grotesk",system-ui',
              fontSize: '1.35rem', fontWeight: 800,
              color: accentColor, flexShrink: 0,
              letterSpacing: '-0.01em',
            }}>{price}</span>
          </div>

          {/* Category */}
          <p style={{
            fontFamily: '"JetBrains Mono",monospace',
            fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem',
          }}>{category}</p>

          {/* Divider */}
          <div style={{ height: '1px', background: `linear-gradient(90deg, ${accentColor}50, transparent)`, marginBottom: '1.25rem' }} />

          {/* Description */}
          <p style={{
            fontFamily: '"Inter",system-ui', fontSize: '0.825rem', fontWeight: 300,
            color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, flex: 1,
          }}>{desc}</p>

          {/* Bottom CTA row */}
          <div style={{
            marginTop: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem',
              letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
            }}>Sakari Sushi Lounge</span>
            <span style={{ color: accentColor, fontSize: '0.9rem', opacity: 0.6 }}>◆</span>
          </div>
        </div>

        {/* Bottom color accent */}
        <div style={{
          position: 'absolute', bottom: 0, left: '15%', right: '15%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }} />
      </motion.div>
    </motion.div>
  )
}

export function SushiStackScroll() {
  return (
    <div style={{ margin: '0 auto', maxWidth: 520, paddingBottom: 140, width: '100%' }}>
      {POPULAR_ITEMS.map(item => (
        <PopularCard key={item.name} {...item} />
      ))}
    </div>
  )
}
