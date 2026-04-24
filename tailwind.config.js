/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Marcelo 80/10/10 palette
      colors: {
        gold: { DEFAULT: '#C8860A', light: '#F2C96D', dim: '#6B4705' },
        ink: { DEFAULT: '#080808', soft: '#101010', card: '#141414', border: '#1E1E1E' },
      },
      fontFamily: {
        // TDS / Marcelo bold geometric heading
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        // Editorial italic accents (Anton Skvortsov luxury feel)
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Body
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      // GT Media / TDS perspective containers
      perspective: { '1000': '1000px', '1500': '1500px' },
    },
  },
  plugins: [],
}
