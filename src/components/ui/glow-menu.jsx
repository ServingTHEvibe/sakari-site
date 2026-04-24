/**
 * Glow Menu — adapted from 21st.dev for Sakari (JS, dark-always, gold palette)
 * Framer Motion 3D flip labels + radial glow on hover/active
 */
import * as React from 'react'
import { motion } from 'framer-motion'

const cn = (...classes) => classes.filter(Boolean).join(' ')

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover:   { rotateX: -90, opacity: 0 },
}
const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover:   { rotateX: 0, opacity: 1 },
}
const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1, scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
}
const navGlowVariants = {
  initial: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
}
const sharedTransition = { type: 'spring', stiffness: 100, damping: 20, duration: 0.5 }

export const MenuBar = React.forwardRef(
  ({ className, items, activeItem, onItemClick, ...props }, ref) => {
    return (
      <motion.nav
        ref={ref}
        className={cn('p-2 rounded-2xl backdrop-blur-lg relative overflow-hidden', className)}
        style={{
          background: 'rgba(8,8,8,0.88)',
          border: '1px solid rgba(200,134,10,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
        initial="initial"
        whileHover="hover"
        {...props}
      >
        {/* Nav-level glow aurora */}
        <motion.div
          style={{
            position: 'absolute', inset: '-8px',
            background: 'radial-gradient(ellipse at center, rgba(200,134,10,0.12) 0%, rgba(200,134,10,0.06) 40%, transparent 70%)',
            borderRadius: '24px', zIndex: 0, pointerEvents: 'none',
          }}
          variants={navGlowVariants}
        />

        <ul style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', position: 'relative', zIndex: 10, listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.label === activeItem
            return (
              <motion.li key={item.label} style={{ position: 'relative' }}>
                <button
                  onClick={() => onItemClick?.(item.label)}
                  style={{ background: 'none', border: 'none', cursor: 'none', display: 'block', width: '100%', padding: 0 }}
                >
                  <motion.div
                    style={{ display: 'block', borderRadius: '12px', overflow: 'visible', position: 'relative', perspective: '600px' }}
                    whileHover="hover"
                    initial="initial"
                  >
                    {/* Item-level radial glow */}
                    <motion.div
                      style={{
                        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                        background: item.gradient,
                        opacity: isActive ? 1 : 0,
                        borderRadius: '12px',
                      }}
                      variants={glowVariants}
                      animate={isActive ? 'hover' : 'initial'}
                    />

                    {/* Front face */}
                    <motion.div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        position: 'relative', zIndex: 10,
                        transformStyle: 'preserve-3d', transformOrigin: 'center bottom',
                        fontFamily: '"Space Grotesk",system-ui',
                        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                        transition: 'color 0.25s ease',
                        whiteSpace: 'nowrap',
                      }}
                      variants={itemVariants}
                      transition={sharedTransition}
                    >
                      {Icon && <Icon size={15} style={{ color: isActive ? item.iconColor : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />}
                      <span>{item.label}</span>
                    </motion.div>

                    {/* Back face (3D flip) */}
                    <motion.div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        position: 'absolute', inset: 0, zIndex: 10,
                        transformStyle: 'preserve-3d', transformOrigin: 'center top',
                        rotateX: 90,
                        fontFamily: '"Space Grotesk",system-ui',
                        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: '#C8860A',
                        whiteSpace: 'nowrap',
                      }}
                      variants={backVariants}
                      transition={sharedTransition}
                    >
                      {Icon && <Icon size={15} style={{ color: item.iconColor, flexShrink: 0 }} />}
                      <span>{item.label}</span>
                    </motion.div>
                  </motion.div>
                </button>
              </motion.li>
            )
          })}
        </ul>
      </motion.nav>
    )
  }
)
MenuBar.displayName = 'MenuBar'
