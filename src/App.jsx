import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion, AnimatePresence,
  useScroll, useTransform, useSpring, useMotionValue, useDragControls,
} from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SushiStackScroll } from './components/ui/stack-card'
import { MenuBar } from './components/ui/glow-menu'
import {
  UtensilsCrossed, CalendarDays, MapPin, PhoneCall,
  Star, PartyPopper, ChefHat, Wine, Clock,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: UtensilsCrossed, label: 'Menu',     href: '#menu',     gradient: 'radial-gradient(circle,rgba(196,18,48,0.2) 0%,rgba(196,18,48,0.06) 50%,transparent 100%)',  iconColor: '#C41230' },
  { icon: Star,            label: 'Specials', href: '#specials', gradient: 'radial-gradient(circle,rgba(200,134,10,0.18) 0%,rgba(200,134,10,0.06) 50%,transparent 100%)', iconColor: '#C8860A' },
  { icon: CalendarDays,    label: 'Events',   href: '#events',   gradient: 'radial-gradient(circle,rgba(196,18,48,0.18) 0%,rgba(196,18,48,0.06) 50%,transparent 100%)',  iconColor: '#C41230' },
  { icon: MapPin,          label: 'Find Us',  href: '#contact',  gradient: 'radial-gradient(circle,rgba(200,134,10,0.18) 0%,rgba(200,134,10,0.06) 50%,transparent 100%)', iconColor: '#C8860A' },
  { icon: PhoneCall,       label: 'Reserve',  href: 'tel:5152883381', gradient: 'radial-gradient(circle,rgba(196,18,48,0.22) 0%,rgba(196,18,48,0.08) 50%,transparent 100%)', iconColor: '#C41230' },
]

gsap.registerPlugin(ScrollTrigger)

const EASE_OUT_QUART = [0.25, 0.8, 0.25, 1]
const EASE_SPRING    = { type: 'spring', stiffness: 280, damping: 22 }
const EASE_SPRING_SOFT = { type: 'spring', stiffness: 180, damping: 24 }

const RED  = '#C41230'
const GOLD = '#C8860A'

const fadeUp = {
  hidden:  { opacity: 0, y: 36, filter: 'blur(8px)' },
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
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT_QUART, delay: i * 0.07 },
  }),
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Courtney H.', role: 'Yelp · 5 Stars', avatar: 'CH', quote: 'Hands down the best sushi I have ever had. There is no place we even consider comparable. The quality is exceptionally good — every single time.' },
  { name: 'Kenneth S.',  role: 'Yelp · 5 Stars', avatar: 'KS', quote: 'Sushi is fantastic! Drinks were fantastic! Service was fantastic! Don\'t miss the free sake bombs — this place gets busy for a reason.' },
  { name: 'Abby K.',     role: 'Yelp · 5 Stars', avatar: 'AK', quote: 'Sakari is my go-to for sushi in Des Moines. Their take out is always fast, delicious and wonderful. They are so wonderfully kind every time.' },
  { name: 'Nate R.',     role: 'Yelp · 5 Stars', avatar: 'NR', quote: 'Always great service and food — whether you order rolls or something off the grill menu. The steak had amazing flavor and was cooked perfect.' },
  { name: 'Andrea B.',   role: 'Yelp · 5 Stars', avatar: 'AB', quote: 'Everything was delicious!! All the different choices of sushi roll and nigiri. It was all fresh and so beautifully presented. Will be back.' },
]

const MENU_TABS = [
  { id: 'signature', label: 'Signature Rolls' },
  { id: 'house',     label: 'House Rolls'     },
  { id: 'apps',      label: 'Appetizers'      },
  { id: 'sashimi',   label: 'Sashimi & Nigiri'},
  { id: 'grill',     label: 'Grill & Sear'    },
  { id: 'bar',       label: 'Bar & Drinks'    },
  { id: 'desserts',  label: 'Desserts'        },
]

const MENU_DATA = {
  signature: [
    { name: 'Godzilla',         price: '$17.00',  tag: 'Most Popular', desc: 'Crunchy flakes, tempura shrimp, avocado, cream cheese, scallions — topped w/ spicy tuna mix, spicy mayo & unagi' },
    { name: 'Iowa Surf & Turf', price: '$18.50',  tag: 'Signature',    desc: 'Bacon, tempura shrimp, cream cheese, avocado — topped w/ seared top sirloin steak, spicy mayo, unagi & bacon crumbles' },
    { name: 'Phoenix Roll',     price: '$18.00',  tag: "Chef's Pick",  desc: 'Tempura shrimp, cucumber, mixed greens, spicy tuna mix — topped w/ seared salmon, garlic mayo, jalapeños & sriracha' },
    { name: 'Sakari Roll',      price: '$18.00',  tag: 'Signature',    desc: 'Tempura shrimp, cream cheese, asparagus, seared top sirloin beef — topped w/ avocado, tuna, unagi sauce & sesame seeds' },
    { name: 'Bruce Lee',        price: '$17.00',  tag: '',             desc: 'Spicy tuna mix, mango, cucumber, tempura fried — topped w/ tobiko, spicy mayo & unagi sauce' },
    { name: 'Lion King',        price: '$17.00',  tag: '',             desc: 'Salmon tempura, cream cheese, avocado, mixed greens — topped with eel, scallions, spicy mayo & unagi sauce' },
    { name: 'Fire Cracker',     price: '$17.00',  tag: '',             desc: 'Crab, cream cheese, mixed greens, tempura fried — topped w/ spicy tuna mix, tempura flakes, spicy mayo & unagi' },
    { name: 'Volcano',          price: '$16.00',  tag: '',             desc: 'Spicy tuna mix, cucumber — topped w/ seared red tuna & honey wasabi sauce' },
    { name: 'Dragon',           price: '$16.00',  tag: '',             desc: 'Tempura shrimp — topped w/ eel, avocado & unagi sauce' },
    { name: 'Rainbow',          price: '$16.00',  tag: '',             desc: 'Eel, crab, cucumber — topped w/ avocado & assorted fish' },
    { name: 'Incredible Hulk',  price: '$16.00',  tag: '',             desc: 'Cream cheese, cucumbers, tempura shrimp & crab — topped w/ avocado, tempura flakes, scallions & unagi sauce' },
    { name: 'Tuna Tataki Roll', price: '$18.00',  tag: '',             desc: 'Tempura shrimp, crab, cream cheese, cucumber — topped w/ marinated tuna, seaweed salad & honey wasabi' },
    { name: 'Beef Roll Up',     price: '$18.00',  tag: '',             desc: 'Tempura shrimp, cream cheese, avocado — topped w/ seared top sirloin beef, spicy mayo, unagi & scallions' },
    { name: 'Happy Ending',     price: '$18.00',  tag: '',             desc: 'Spicy tuna mix, avocado, mixed greens, tempura shrimp — topped w/ assorted seared marinated fish' },
    { name: 'White Tiger',      price: '$17.00',  tag: '',             desc: 'Crab, cucumber, scallions, tobiko — topped w/ avocado, escolar (white tuna), spicy mayo, unagi & sesame' },
    { name: 'Marty Da Party',   price: '$17.00',  tag: '',             desc: 'Crab, cream cheese, mango, cucumber — topped w/ avocado & salmon, spicy mayo & unagi sauce' },
    { name: 'Cyclone Roll',     price: '$17.00',  tag: '',             desc: 'Tempura snapper, mixed greens, cucumber, avocado — topped w/ red tuna, mango, tobiko & scallions' },
    { name: 'Alaskan',          price: '$16.00',  tag: '',             desc: 'Spicy crab mix, cucumber — topped w/ salmon & unagi sauce' },
    { name: 'Hawkeye',          price: '$17.00',  tag: '',             desc: 'Crab, tobiko, tempura snapper, cucumber, mixed greens — mango sauce & unagi sauce' },
    { name: 'Sea Roll',         price: '$15.00',  tag: '',             desc: 'Crunchy flakes, crab, tempura shrimp, avocado — seafood sauce & unagi sauce' },
    { name: 'Tropical Tai',     price: '$13.00',  tag: '',             desc: 'Cream cheese, avocado, mango — topped w/ red snapper & mango sauce' },
    { name: 'Wild Caterpillar', price: '$17.00',  tag: '',             desc: 'Tempura shrimp, cucumber, cream cheese — topped w/ avocado, crab, sesame seeds & spicy mayo' },
  ],
  house: [
    { name: 'Tuna',              price: '$8.50', tag: '', desc: 'Classic bluefin tuna' },
    { name: 'Salmon',            price: '$8.50', tag: '', desc: 'Fresh Atlantic salmon' },
    { name: 'Spicy Tuna',        price: '$9.00', tag: 'Popular', desc: 'Tuna, cucumber, scallions, spicy mayo' },
    { name: 'Spicy Salmon',      price: '$9.00', tag: '', desc: 'Salmon, cucumber, scallions, spicy mayo' },
    { name: 'California',        price: '$8.50', tag: '', desc: 'Cucumber, avocado, crab, sesame seeds' },
    { name: 'Philly',            price: '$9.00', tag: '', desc: 'Salmon, cream cheese, scallions' },
    { name: 'Unagi',             price: '$9.00', tag: '', desc: 'Eel, avocado, unagi sauce' },
    { name: 'Shrimp Tempura',    price: '$9.00', tag: '', desc: 'Tempura shrimp, unagi sauce' },
    { name: 'Salmon Tempura',    price: '$9.00', tag: '', desc: 'Tempura salmon, unagi sauce' },
    { name: 'White Tuna',        price: '$8.50', tag: '', desc: 'Escolar white tuna' },
    { name: 'Smoked Salmon',     price: '$8.50', tag: '', desc: 'Cold-smoked Pacific salmon' },
    { name: 'Yellow Tail',       price: '$8.50', tag: '', desc: 'Hamachi, scallions, sesame seeds' },
    { name: 'Spicy White Tuna',  price: '$9.00', tag: '', desc: 'White tuna, cucumber, spicy mayo, scallions' },
    { name: 'Dynamite Crab',     price: '$9.25', tag: '', desc: 'Tempura crab, cream cheese, spicy mayo & unagi sauce' },
    { name: 'Spicy Tako',        price: '$9.00', tag: '', desc: 'Octopus, cucumber, scallions, spicy mayo' },
  ],
  apps: [
    { name: 'Dynamite Shrimp or Crab', price: '$9.00',  tag: 'Happy Hour', desc: 'Four tempura fried shrimp or crab stuffed with cream cheese, topped with spicy mayo & unagi sauce' },
    { name: 'Bang Bang Shrimp',        price: '$10.00', tag: 'Popular',    desc: 'Five crispy sweet and spicy shrimp' },
    { name: 'Tuna Tataki',             price: '$16.00', tag: "Chef's Pick", desc: 'Marinated seared red tuna over seaweed salad, honey wasabi sprouts' },
    { name: 'Poke Bowl',               price: '$16.00', tag: '',           desc: 'Choice of tuna or salmon, cucumber, avocado, mango — sesame oil dressing with masago & scallions' },
    { name: 'Crab Rangoon Dip',        price: '$14.00', tag: '',           desc: 'Oven-baked dip filled with cream cheese & Parmesan. Served with pita chips' },
    { name: 'Shrimp Tempura',          price: '$10.00', tag: '',           desc: 'Five tempura fried shrimp. Tempura sauce' },
    { name: 'Chicken Kushi Katsu',     price: '$11.00', tag: '',           desc: 'Six panko crusted chicken breast tenders. Choice of sauce' },
    { name: 'Chicken Wings',           price: '$16.00', tag: 'Award Winning', desc: '8 award-winning wings — Regular, Hot or XXX Ghost Sauce' },
    { name: 'Pork Potsickers',         price: '$9.00',  tag: '',           desc: 'Six fried gyoza pieces. Thai sweet chili sauce' },
    { name: 'Garlic Chili Edamame',    price: '$11.00', tag: '',           desc: 'Fried garlic chili sauce, cabbage, green onions, edamame — stir fried in wok' },
    { name: 'Soup Udon',               price: '$13.00', tag: '',           desc: 'Udon noodles in beef broth, fish cake, fish meatballs, shrimp tempura, vegetable tempura' },
    { name: 'Spring Rolls',            price: '$7.00',  tag: '',           desc: 'Two fried pork or veggie spring rolls. Thai sweet chili sauce' },
    { name: 'Edamame',                 price: '$7.50',  tag: '',           desc: 'Steamed soy bean pods. Salty or spicy' },
  ],
  sashimi: [
    { name: 'Sashimi Platter',    price: '$48.00', tag: 'Serves 2',     desc: '12 pcs chef\'s choice assorted fish — market freshest selection' },
    { name: 'Sashimi Carpaccio',  price: '$12.00', tag: '',             desc: 'Six thinly sliced sashimi drizzled with ponzu sauce, mixed greens, sprouts & lime wedge' },
    { name: 'Maguro (Red Tuna)',   price: '$5.00',  tag: '2pc Nigiri',  desc: 'Bluefin red tuna' },
    { name: 'Sake (Salmon)',       price: '$5.00',  tag: '2pc Nigiri',  desc: 'Fresh Atlantic salmon' },
    { name: 'Hamachi (Yellowtail)',price: '$5.00',  tag: '2pc Nigiri',  desc: 'Japanese yellowtail tuna' },
    { name: 'Unagi (Eel)',         price: '$5.00',  tag: '2pc Nigiri',  desc: 'Freshwater eel with unagi glaze' },
    { name: 'Hotate (Scallop)',    price: '$8.50',  tag: '2pc Nigiri',  desc: 'Sea scallop' },
    { name: 'Ikura (Salmon Roe)', price: '$9.00',  tag: '2pc Nigiri',  desc: 'Pacific salmon roe' },
    { name: 'Tobiko (Flying Fish)',price: '$8.00',  tag: '2pc Nigiri',  desc: 'Flying fish roe' },
    { name: 'Ama Ebi (Sweet Prawn)',price: '$8.50', tag: '2pc Nigiri',  desc: 'Sweet spot prawns' },
    { name: 'Tako (Octopus)',      price: '$8.00',  tag: '2pc Nigiri',  desc: 'Tender octopus' },
    { name: 'Tamago (Sweet Egg)',  price: '$7.00',  tag: '2pc Nigiri',  desc: 'Cooked sweet Japanese egg' },
  ],
  grill: [
    { name: 'Waygu',          price: '$110.00', tag: 'Ultra Premium', desc: '8oz American Wagyu BMS 9+ — while supplies last. The pinnacle of beef.' },
    { name: 'Cowboy Steak',   price: '$100.00', tag: 'USDA Prime',    desc: 'Handcut USDA Prime Ribeye 42+oz grilled to perfection' },
    { name: 'Ribeye 16oz',    price: '$46.00',  tag: '',              desc: 'Hand-cut ribeye cooked on our hot grill with house-made teriyaki sauce' },
    { name: 'NY Strip 16oz',  price: '$46.00',  tag: 'Steak Tuesday', desc: 'Hand-cut New York Strip, hot grill, served with house teriyaki' },
    { name: 'Scallops',       price: '$36.00',  tag: '',              desc: 'Pan seared scallops, lemon beurre blanc, asparagus & lobster mashed potatoes' },
    { name: 'Pan Seared Salmon', price: '$28.00', tag: '',            desc: '6oz Canadian salmon seared to perfection with house honey wasabi sauce' },
    { name: 'Teriyaki Don',   price: 'from $16', tag: '',             desc: 'Chicken, Beef, Veggie or Shrimp — jasmine rice, onions, shiitake mushrooms, house teriyaki' },
    { name: 'Yakisoba',       price: 'from $16', tag: '',             desc: 'Chicken, Beef, Veggie or Shrimp — soba noodles, onions, cabbage, house yakisoba sauce' },
    { name: 'Bento Box Dinner', price: '$22.00', tag: '',             desc: 'Choice of specialty roll, two dynamite shrimp & house salad' },
  ],
  bar: [
    { name: 'Sake Bomb',          price: '$5.00',  tag: 'Happy Hour', desc: 'Traditional sake dropped into a cold Kirin draft — the house classic' },
    { name: 'Angry Plum Bomb',    price: '$3.50',  tag: 'Happy Hour', desc: 'Moonstone Plum sake bomb variation' },
    { name: 'Amsterdam Martini',  price: '$6.00',  tag: 'Happy Hour', desc: 'Watermelon Sugar, Espresso, Shark Bite, Lil Lolly — available as Jumbo (min 2)' },
    { name: 'MIO Sparkling Sake', price: '$11.00', tag: '',           desc: 'Light & effervescent Japanese sparkling sake' },
    { name: 'Flavored Sake',      price: '$14.00', tag: '',           desc: 'Moonstone Plum, Lychee, White Peach or Pineapple — large format' },
    { name: 'Sake Flight',        price: '$11.00', tag: '',           desc: 'Curated flight of three sake selections' },
    { name: 'Kirin Ichiban Draft', price: '$5.50', tag: 'Happy Hour', desc: 'Japan\'s premium lager on tap — crisp and clean' },
    { name: 'Local Craft Draft',  price: '$7.50',  tag: '',           desc: 'Big Grove, Confluence DSM IPA, Single Speed CTR ALT Amber — rotating taps' },
    { name: 'Wine by the Glass',  price: 'from $9', tag: '',          desc: 'White, Red or Sparkling — J Vineyard Pinot Gris, Hahn Pinot Noir, Wycliff Brut' },
  ],
  desserts: [
    { name: 'Panko Fried Ice Cream',   price: '$9.00',  tag: 'Signature', desc: 'Vanilla ice cream, tempura battered & panko fried, drizzled with chocolate & caramel' },
    { name: 'Raspberry Cheesecake Eggroll', price: '$9.00', tag: 'Signature', desc: 'Our signature eggroll filled with creamy raspberry cheesecake, powdered sugar & chocolate' },
    { name: 'Dessert Wontons',         price: '$9.00',  tag: '',          desc: 'Four homemade wontons filled with chocolate chip cookie dough, caramel, cinnamon & powdered sugar' },
    { name: 'Triple Layer Chocolate Cake', price: '$10.00', tag: '',      desc: 'Decadent chocolate, chocolate mousse, iced with chocolate ganache & topped with semi-sweet chips' },
  ],
}

const SPECIALS = [
  { day: 'Mon',  name: 'Pho King Monday',    time: '5–10PM',    highlight: 'Build-your-own pho bar from $13', color: '#C41230' },
  { day: 'Tue',  name: 'Steak Tuesday',      time: '5–9PM',     highlight: '12oz Ribeye or NY Strip just $25', color: '#C41230', hot: true },
  { day: 'Wed',  name: 'Wing Night',         time: '5–9PM',     highlight: '8 award-winning wings $12', color: '#C8860A' },
  { day: 'Thu',  name: 'Happy Hour',         time: '5–7PM',     highlight: '$6 Jameson · $3.50 domestics', color: '#C8860A' },
  { day: 'Fri',  name: 'Happy Hour',         time: '2–5PM',     highlight: 'House rolls $3.50 · Sake Bombs $7', color: '#C41230', hot: true },
  { day: 'Sat',  name: 'Open All Day',       time: '11AM–11PM', highlight: 'Full menu lunch & dinner', color: '#C8860A' },
  { day: 'Sun',  name: 'Bento Box Sunday',   time: '5–9PM',     highlight: 'Specialty bento + half-price martinis', color: '#C41230' },
]

const STATS = [
  { value: 15, suffix: '+', label: 'Years on Ingersoll' },
  { value: 22, suffix: '',  label: 'Signature Rolls'    },
  { value: 4.5,suffix: '★', label: 'Yelp Rating'        },
  { value: 30, suffix: '',  label: 'Private Event Seats' },
]

const GALLERY_IMAGES = [
  { src: '/assets/slide1.jpg',       caption: 'The Experience'   },
  { src: '/assets/food_ai_01.png',   caption: 'Signature Rolls'  },
  { src: '/assets/slide2.jpg',       caption: 'Craft Cocktails'  },
  { src: '/assets/sushi_hero_01.png',caption: 'Made Fresh Daily' },
  { src: '/assets/food_00.jpg',      caption: 'Chef Signatures'  },
  { src: '/assets/slide3.jpg',       caption: 'The Lounge'       },
  { src: '/assets/food_ai_02.png',   caption: 'Premium Fish'     },
  { src: '/assets/sushi_hero_02.png',caption: 'The Detail'       },
  { src: '/assets/food_01.jpg',      caption: 'Sashimi Bar'      },
]

const FRAME_COUNT = 90
const frames = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/frames/frame_${String(i + 1).padStart(4, '0')}.jpg`
)
const ANNOTATIONS = [
  { progress: 0.18, text: 'Every roll, made to order',         sub: 'Nothing frozen. Nothing rushed.',  side: 'left'  },
  { progress: 0.42, text: 'Cinematic presentation',            sub: 'You eat with your eyes first.',    side: 'right' },
  { progress: 0.68, text: 'Summit-level craft',                sub: "Sakari — to be at one's peak.",   side: 'left'  },
  { progress: 0.88, text: 'Des Moines never tasted like this', sub: '2605 Ingersoll Ave',               side: 'right' },
]

// ── Starscape ─────────────────────────────────────────────────────────────────
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

// ── Cursor ────────────────────────────────────────────────────────────────────
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

// ── Scroll Progress ───────────────────────────────────────────────────────────
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
  return (
    <div ref={ref} className="scroll-progress"
      style={{ background: `linear-gradient(90deg, ${RED}, #E8203E, ${GOLD})` }} />
  )
}

// ── Preloader ─────────────────────────────────────────────────────────────────
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
        <motion.div className="preloader" exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE_OUT_QUART }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center' }}>
            <img src="/assets/logo.png" alt="Sakari" style={{ height: '48px', marginBottom: '1.25rem', filter: 'invert(1)' }} />
            <h1 style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.5rem,6vw,5.5rem)', fontWeight: 700, letterSpacing: '0.22em', color: '#fff', lineHeight: 1 }}>
              SAKARI
            </h1>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.9rem', color: `${RED}cc`, letterSpacing: '0.15em', marginTop: '0.3rem', marginBottom: '1.75rem' }}>
              Sushi Lounge — Des Moines
            </p>
            <p className="section-label" style={{ marginBottom: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Loading Experience</p>
            <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.08)', margin: '0 auto 0.6rem', position: 'relative', overflow: 'hidden', borderRadius: '100px' }}>
              <motion.div
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: `linear-gradient(90deg, ${RED}, #E8203E)`, borderRadius: '100px' }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.15, ease: 'linear' }}
              />
            </div>
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.62rem', color: `${RED}aa`, letterSpacing: '0.1em' }}>{pct}%</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
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
    if (item?.href?.startsWith('#')) document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' })
    else if (item?.href?.startsWith('tel:')) window.location.href = item.href
    setMobileOpen(false)
  }

  const Logo = () => (
    <a href="#hero" style={{ textDecoration: 'none', flexShrink: 0 }}>
      <img src="/assets/logo_scroll.png" alt="Sakari Sushi Lounge" style={{ height: scrolled ? '36px' : '42px', objectFit: 'contain', transition: 'height 0.4s ease' }} />
    </a>
  )

  return (
    <motion.div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800, padding: scrolled ? '0' : '1.5rem 2.5rem', transition: 'padding 0.4s cubic-bezier(0.25,0.8,0.25,1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.2 }}
    >
      {scrolled ? (
        <motion.div layout
          style={{ margin: '14px auto 0', width: 'calc(100% - 2rem)', maxWidth: '920px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 1.25rem 0.55rem 1.5rem', borderRadius: '100px', background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(28px)', border: `1px solid rgba(196,18,48,0.22)`, position: 'absolute', left: '50%', transform: 'translateX(-50%)', boxShadow: `0 4px 32px rgba(196,18,48,0.08)` }}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={EASE_SPRING_SOFT}
        >
          <Logo />
          <div className="nav-links">
            <MenuBar items={NAV_ITEMS} activeItem={activeItem} onItemClick={handleNavClick}
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', backdropFilter: 'none', padding: '0' }} />
          </div>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </motion.div>
      ) : (
        <>
          <Logo />
          <div className="nav-links">
            <MenuBar items={NAV_ITEMS} activeItem={activeItem} onItemClick={handleNavClick} />
          </div>
          <button onClick={() => setMobileOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </>
      )}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: '100%', left: '1rem', right: '1rem', marginTop: '0.5rem', background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(24px)', border: `1px solid rgba(196,18,48,0.2)`, borderRadius: '20px', padding: '1.5rem', zIndex: 900 }}
          >
            {NAV_ITEMS.map(item => (
              <button key={item.label} onClick={() => handleNavClick(item.label)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', background: 'none', border: 'none', color: activeItem === item.label ? RED : 'rgba(255,255,255,0.65)', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.75rem 0', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
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

// ── TiltCard ──────────────────────────────────────────────────────────────────
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
    <motion.div ref={ref} className={`tilt-card perspective-container ${className}`}
      style={{ ...style, rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={{ scale: 1.02 }} transition={{ scale: { duration: 0.3, ease: EASE_OUT_QUART } }}
    >
      {children}
    </motion.div>
  )
}

// ── SectionHeading ────────────────────────────────────────────────────────────
function SectionHeading({ label, headline, accent, sub, center = false, accentColor = RED }) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} style={center ? { textAlign: 'center' } : {}}>
      <motion.p variants={fadeUp} className="section-label" style={{ marginBottom: '1rem', color: RED }}>{label}</motion.p>
      <motion.h2 variants={fadeUp}
        style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05, marginBottom: '0' }}
      >
        {headline}<br />
        <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: accentColor, fontSize: '1.05em' }}>{accent}</span>
      </motion.h2>
      <motion.div variants={fadeUp} style={{ width: '52px', height: '1px', background: `linear-gradient(90deg, ${RED}, transparent)`, margin: center ? '1.25rem auto' : '1.25rem 0' }} />
      {sub && <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, fontSize: '0.9375rem', maxWidth: '520px', margin: center ? '0 auto' : '0' }}>{sub}</motion.p>}
    </motion.div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const opacity    = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const yContent   = useTransform(scrollYProgress, [0, 1], [0, -100])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <section ref={ref} id="hero" style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.video src="/assets/hero.mp4" autoPlay loop muted playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', scale: videoScale, transformOrigin: 'center center' }} />

      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(8,8,8,0.25) 0%,rgba(8,8,8,0.5) 50%,rgba(8,8,8,0.88) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(8,8,8,0.65) 100%)', pointerEvents: 'none' }} />
      {/* Crimson glow at bottom */}
      <div style={{ position: 'absolute', bottom: '-5%', left: '50%', transform: 'translateX(-50%)', width: '70vw', height: '40vh', background: `radial-gradient(ellipse, rgba(196,18,48,0.14) 0%, transparent 70%)`, pointerEvents: 'none', filter: 'blur(40px)' }} />

      <motion.div style={{ y: yContent, opacity, position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 2rem', maxWidth: '900px' }}>
        <motion.p className="section-label" custom={0} variants={fadeUp} initial="hidden" animate="visible"
          style={{ marginBottom: '1.5rem', opacity: 0.8, color: RED }}>
          Des Moines, Iowa · Est. 2005
        </motion.p>

        <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(3.5rem,9vw,8.5rem)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.02em', color: '#fff', marginBottom: '1.5rem', textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
        >
          AT THE<br />
          <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, fontSize: '1.05em', color: GOLD }}>
            Peak
          </span>
          <br />OF CRAFT.
        </motion.h1>

        <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(0.95rem,1.5vw,1.1rem)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 2.5rem', fontWeight: 300 }}
        >
          Sakari — <em style={{ fontFamily: '"Cormorant Garamond",serif', color: 'rgba(255,255,255,0.5)' }}>to be at one's best</em>. Fresh rolls, premium fish, craft cocktails, and a lounge built for the moment.
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-red">
            Order Online ↗
          </a>
          <a href="#menu" className="btn-outline">Explore Menu</a>
        </motion.div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: '3rem', justifyContent: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}
        >
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '2rem', fontWeight: 700, color: GOLD, lineHeight: 1 }}>{s.value}{s.suffix}</p>
              <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', marginTop: '0.3rem', textTransform: 'uppercase' }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity, position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 3 }}>
        <p className="section-label" style={{ opacity: 0.4, marginBottom: '0.5rem', fontSize: '0.55rem', color: RED }}>Scroll</p>
        <motion.div animate={{ scaleY: [1, 0.4, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '1px', height: '36px', background: `linear-gradient(to bottom, ${RED}, transparent)`, margin: '0 auto' }} />
      </motion.div>
    </section>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about-brand" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* background glow */}
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '600px', height: '600px', background: `radial-gradient(circle, rgba(196,18,48,0.07) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem', alignItems: 'center' }}>
        {/* Left — copy */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={fadeUp} className="section-label" style={{ marginBottom: '1rem', color: RED }}>Our Story</motion.p>

          <motion.h2 variants={fadeUp}
            style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.5rem,4.5vw,3.75rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05, marginBottom: '1.5rem' }}
          >
            What Does<br />
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: RED, fontSize: '1.08em' }}>Sakari</span>
            {' '}Mean?
          </motion.h2>

          {/* Definition card */}
          <motion.div variants={fadeUp}
            style={{ borderLeft: `3px solid ${RED}`, paddingLeft: '1.25rem', marginBottom: '1.75rem', background: 'rgba(196,18,48,0.04)', borderRadius: '0 12px 12px 0', padding: '1.25rem 1.25rem 1.25rem 1.5rem' }}
          >
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: RED, textTransform: 'uppercase', marginBottom: '0.6rem' }}>サカリ / sakari</p>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
              (1) summit &nbsp;·&nbsp; (2) peak &nbsp;·&nbsp; (3) prime<br />
              (4) to be at one's best
            </p>
          </motion.div>

          <motion.p variants={fadeUp} style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, marginBottom: '1.25rem' }}>
            Perched on Ingersoll Avenue in the heart of Des Moines since 2005, Sakari Sushi Lounge was built on a single conviction: that Japanese cuisine — prepared with patience and precision — can transport you somewhere extraordinary.
          </motion.p>
          <motion.p variants={fadeUp} style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, marginBottom: '2rem' }}>
            From our 22 signature rolls to hand-cut Wagyu, house-crafted cocktails to sake flights — every dish, every drink is held to the same standard. The summit. The peak. That's what Sakari means, and that's what we deliver.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#menu" className="btn-red">See Our Menu</a>
            <a href="tel:5152883381" className="btn-outline">Call (515) 288-3381</a>
          </motion.div>
        </motion.div>

        {/* Right — stacked/overlapping images */}
        <div style={{ position: 'relative', height: '520px' }}>
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: -4 }} whileInView={{ opacity: 1, x: 0, rotate: -3 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_OUT_QUART, delay: 0.1 }}
            style={{ position: 'absolute', top: '0', right: '0', width: '75%', height: '400px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}
          >
            <img src="/assets/slide1.jpg" alt="Sakari Sushi Lounge" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: 6 }} whileInView={{ opacity: 1, x: 0, rotate: 3 }}
            viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE_OUT_QUART, delay: 0.25 }}
            style={{ position: 'absolute', bottom: '0', left: '0', width: '55%', height: '280px', borderRadius: '20px', overflow: 'hidden', border: `1px solid rgba(196,18,48,0.25)`, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 2 }}
          >
            <img src="/assets/food_ai_01.png" alt="Signature rolls" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
          {/* Crimson glow badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.45 }}
            style={{ position: 'absolute', bottom: '3rem', right: '1rem', background: `rgba(8,8,8,0.9)`, backdropFilter: 'blur(16px)', border: `1px solid rgba(196,18,48,0.3)`, borderRadius: '16px', padding: '1rem 1.25rem', zIndex: 3 }}
          >
            <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', color: RED, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Est. 2005</p>
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>2605 Ingersoll Ave</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Des Moines, Iowa</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ── Scroll Video ──────────────────────────────────────────────────────────────
function ScrollVideo() {
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
          <p className="section-label" style={{ opacity: 0.7, color: RED }}>The Experience</p>
        </div>
        {ANNOTATIONS.map(a => (
          <div key={a.progress}
            className={`annotation-card glass-gold ${activeCard === a.progress ? 'visible' : ''}`}
            style={{ [a.side === 'left' ? 'left' : 'right']: 'clamp(1rem,5vw,5rem)', top: '50%', transform: 'translateY(-50%)', maxWidth: '270px', padding: '1.25rem 1.5rem', zIndex: 10 }}
          >
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.1rem', fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: '0.35rem' }}>{a.text}</p>
            <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)' }}>{a.sub}</p>
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <p className="section-label" style={{ opacity: 0.3, color: GOLD }}>Keep Scrolling</p>
        </div>
      </div>
    </section>
  )
}

// ── Full Menu Section (Tabbed) ─────────────────────────────────────────────────
function MenuSection() {
  const [activeTab, setActiveTab] = useState('signature')

  return (
    <section id="menu" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '500px', height: '500px', background: `radial-gradient(circle, rgba(196,18,48,0.06) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionHeading center label="Full Menu" headline="Every Craving" accent="Covered" sub="22 signature rolls, premium sashimi, hand-cut steaks, craft cocktails — all under one roof." />
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
          {MENU_TABS.map(tab => (
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '100px', border: 'none', cursor: 'pointer',
                fontFamily: '"Space Grotesk",system-ui', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: activeTab === tab.id ? RED : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.5)',
                boxShadow: activeTab === tab.id ? `0 0 20px rgba(196,18,48,0.35)` : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
              {MENU_DATA[activeTab].map((item, i) => (
                <TiltCard key={item.name}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_QUART, delay: i * 0.03 }}
                    className="glass feature-card"
                    style={{ padding: '1.5rem', height: '100%', position: 'relative', overflow: 'hidden' }}
                  >
                    {/* Hover top border */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${RED}, transparent)`, opacity: 0.6 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                      <h3 style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.9375rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, flex: 1 }}>{item.name}</h3>
                      <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.75rem', color: RED, fontWeight: 600, flexShrink: 0 }}>{item.price}</span>
                    </div>
                    {item.tag && (
                      <span style={{ display: 'inline-block', fontFamily: '"JetBrains Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: GOLD, background: 'rgba(200,134,10,0.1)', border: '1px solid rgba(200,134,10,0.2)', borderRadius: '100px', padding: '0.2rem 0.6rem', marginBottom: '0.6rem' }}>
                        {item.tag}
                      </span>
                    )}
                    <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{item.desc}</p>
                  </motion.div>
                </TiltCard>
              ))}
            </div>

            {/* Happy hour note for bar tab */}
            {activeTab === 'bar' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', background: `rgba(196,18,48,0.07)`, border: `1px solid rgba(196,18,48,0.2)`, borderRadius: '16px', textAlign: 'center' }}
              >
                <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', color: '#fff' }}>
                  <span style={{ color: RED, fontWeight: 700 }}>Happy Hour</span> · Tue–Thu 5–7PM & Fri 2–5PM · Sake Bombs $2.50 · House Rolls $3.50 · Kirin Draft $3.50
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="https://sakarisushilounge.com/des-moines-sakari-sushi-lounge-food-menu" target="_blank" rel="noopener noreferrer" className="btn-red">
            Full Menu on Site ↗
          </a>
        </div>

        {/* Stack scroll cards strip */}
        <div style={{ marginTop: '6rem', textAlign: 'center' }}>
          <p className="section-label" style={{ marginBottom: '1rem', color: RED }}>Signature Highlights</p>
          <h3 style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 700, color: '#fff', marginBottom: '3rem' }}>The Rolls That Started The Conversation</h3>
          <SushiStackScroll />
        </div>
      </div>
    </section>
  )
}

// ── Gallery ────────────────────────────────────────────────────────────────────
function Gallery() {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const [isHovered, setIsHovered] = useState(null)
  const CARD_W = 360, GAP = 16, PADDING = 48
  const totalWidth = GALLERY_IMAGES.length * (CARD_W + GAP) - GAP + PADDING * 2

  return (
    <section style={{ padding: '6rem 0', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', paddingLeft: '2.5rem', marginBottom: '2.5rem' }}>
        <SectionHeading label="Gallery" headline="The Look of" accent="Sakari" accentColor={GOLD} />
      </div>
      <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginBottom: '1.5rem' }}>Drag to explore</p>
      <motion.div ref={ref}
        drag="x"
        dragConstraints={{ right: 0, left: -(totalWidth - innerWidth) }}
        dragElastic={0.08}
        style={{ x, display: 'flex', gap: `${GAP}px`, paddingLeft: `${PADDING}px`, paddingRight: `${PADDING}px`, cursor: 'grab', width: 'max-content' }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {GALLERY_IMAGES.map((img, i) => (
          <motion.div key={i}
            onHoverStart={() => setIsHovered(i)} onHoverEnd={() => setIsHovered(null)}
            style={{ width: `${CARD_W}px`, height: '460px', borderRadius: '20px', overflow: 'hidden', position: 'relative', flexShrink: 0, border: `1px solid ${isHovered === i ? `rgba(196,18,48,0.4)` : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.3s ease' }}
            whileHover={{ scale: 1.02 }} transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
          >
            <img src={img.src} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', scale: isHovered === i ? 1.05 : 1, transition: 'scale 0.5s ease' }} draggable={false} />
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: isHovered === i ? 1 : 0, y: isHovered === i ? 0 : 10 }}
              transition={{ duration: 0.25 }}
              style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(12px)', borderRadius: '100px', padding: '0.4rem 1rem', border: `1px solid rgba(196,18,48,0.3)` }}
            >
              <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>{img.caption}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

// ── Specials ───────────────────────────────────────────────────────────────────
function Specials() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)

  return (
    <section id="specials" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '0', right: '-10%', width: '500px', height: '500px', background: `radial-gradient(circle, rgba(200,134,10,0.06) 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <SectionHeading center label="Weekly Specials" headline="Something Special" accent="Every Night" sub="Fresh deals every day of the week — from Monday Pho to Friday Happy Hour." />
        </div>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}
        >
          {SPECIALS.map((s, i) => {
            const isToday = s.day === today
            return (
              <motion.div key={s.day} variants={cardReveal} custom={i}>
                <TiltCard>
                  <div
                    className="glass"
                    style={{
                      padding: '1.75rem 1.25rem', height: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden',
                      border: `1px solid ${isToday || s.hot ? `rgba(196,18,48,0.35)` : 'rgba(255,255,255,0.06)'}`,
                      background: isToday ? 'rgba(196,18,48,0.07)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    {(isToday || s.hot) && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${RED}, transparent)` }} />
                    )}
                    <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.75rem', fontWeight: 900, color: isToday ? RED : 'rgba(255,255,255,0.15)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>{s.day}</p>
                    <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem', lineHeight: 1.2 }}>{s.name}</p>
                    <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.58rem', color: s.color, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{s.time}</p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>{s.highlight}</p>
                    {isToday && (
                      <div style={{ marginTop: '1rem', background: RED, borderRadius: '100px', padding: '0.25rem 0.75rem', display: 'inline-block' }}>
                        <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.55rem', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tonight</p>
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Friday Happy Hour callout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.65, ease: EASE_OUT_QUART, delay: 0.3 }}
          className="glass-red"
          style={{ marginTop: '2rem', padding: '2rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}
        >
          <div>
            <p className="section-label" style={{ marginBottom: '0.4rem', color: RED }}>Friday Happy Hour</p>
            <p style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Every Friday 2–5PM</p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.48)', marginTop: '0.3rem' }}>
              House Rolls $3.50 · Kirin Draft $3.50 · Sake Bombs $7 · Amsterdam Martinis $6 · Dynamite Shrimp/Crab $7
            </p>
          </div>
          <a href="tel:5152883381" className="btn-red" style={{ flexShrink: 0 }}>Reserve Your Spot</a>
        </motion.div>
      </div>
    </section>
  )
}

// ── Private Events ─────────────────────────────────────────────────────────────
function Events() {
  return (
    <section id="events" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <SectionHeading center label="Private Events & Catering" headline="Bring Sakari To" accent="Your Moment" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem' }}>
          {/* Private Party Room */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_QUART }}>
            <TiltCard>
              <div className="glass-red" style={{ padding: '2.5rem', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: `radial-gradient(circle, rgba(196,18,48,0.15) 0%, transparent 70%)`, borderRadius: '50%' }} />
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={EASE_SPRING}
                  style={{ width: '52px', height: '52px', borderRadius: '16px', background: `rgba(196,18,48,0.15)`, border: `1px solid rgba(196,18,48,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <PartyPopper size={22} color={RED} />
                </motion.div>
                <h3 style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Private Party Room</h3>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  Celebrate your special occasion in our exclusive private room, comfortably seating up to 30 guests. Perfect for birthdays, corporate events, and wedding parties.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                  {['Seats up to 30 guests', 'Dedicated service staff', 'Custom menu options', 'Full bar service', 'Birthday & anniversary packages'].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                      <span style={{ color: RED, fontSize: '0.7rem' }}>◆</span>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="tel:5152883381" className="btn-red">Book Your Event</a>
              </div>
            </TiltCard>
          </motion.div>

          {/* Catering */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay: 0.15 }}>
            <TiltCard>
              <div className="glass-gold" style={{ padding: '2.5rem', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: `radial-gradient(circle, rgba(200,134,10,0.12) 0%, transparent 70%)`, borderRadius: '50%' }} />
                <motion.div whileHover={{ scale: 1.1, rotate: -5 }} transition={EASE_SPRING}
                  style={{ width: '52px', height: '52px', borderRadius: '16px', background: `rgba(200,134,10,0.1)`, border: `1px solid rgba(200,134,10,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <ChefHat size={22} color={GOLD} />
                </motion.div>
                <h3 style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Catering</h3>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
                  Bring the Sakari experience to your venue. Full-service catering packages for every occasion, delivered with the same care and quality you'd find in our lounge.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                  {['Corporate functions', 'Wedding events', 'Holiday gatherings', 'Birthday celebrations', 'Sushi platters from $63'].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                      <span style={{ color: GOLD, fontSize: '0.7rem' }}>◆</span>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="mailto:sakarisushilounge@gmail.com" className="btn-gold">Get a Catering Quote</a>
              </div>
            </TiltCard>
          </motion.div>
        </div>

        {/* Platter pricing */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Spring Garden Party', qty: '80 pcs · Serves 8–10', price: '$70', note: 'Vegetarian' },
            { name: 'The Wild Animal',      qty: '80 pcs · Serves 10–12', price: '$129', note: 'Mixed' },
            { name: 'Around The World',     qty: '80 pcs · Serves 10–12', price: '$130', note: 'Mixed' },
            { name: 'From The Sea',         qty: '96 pcs · Serves 10–12', price: '$144', note: 'Premium' },
            { name: 'The Top Shelf',        qty: '80 pcs · Serves 10–12', price: '$139', note: 'Cooked' },
          ].map(p => (
            <div key={p.name} className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{p.name}</span>
                <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.8rem', color: RED }}>{p.price}</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem' }}>{p.qty}</p>
              <span style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.55rem', letterSpacing: '0.1em', color: GOLD, background: 'rgba(200,134,10,0.08)', border: '1px solid rgba(200,134,10,0.15)', borderRadius: '100px', padding: '0.15rem 0.5rem' }}>{p.note}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Testimonials ───────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <SectionHeading center label="What People Say" headline="The Verdict Is" accent="Unanimous" />
        </div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(275px,1fr))', gap: '1.25rem' }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} variants={cardReveal} custom={i % 3}
              whileHover={{ y: -5, transition: { duration: 0.3, ease: EASE_OUT_QUART } }}>
              <div className="glass testimonial-card" style={{ padding: '2rem', height: '100%' }}>
                <div style={{ color: RED, fontSize: '0.875rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>★★★★★</div>
                <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `rgba(196,18,48,0.1)`, border: `1px solid rgba(196,18,48,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: RED, flexShrink: 0, fontFamily: '"Space Grotesk",system-ui' }}>
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

// ── Location ───────────────────────────────────────────────────────────────────
function Location() {
  return (
    <section id="contact" style={{ padding: '8rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <SectionHeading label="Find Us" headline="On Ingersoll," accent="Where It Belongs" />
          <motion.div variants={fadeUp} className="glass" style={{ padding: '1.75rem', marginBottom: '1.25rem', marginTop: '2rem' }}>
            <p className="section-label" style={{ marginBottom: '0.6rem', color: RED }}>Address</p>
            <p style={{ fontSize: '1.0625rem', color: '#fff', lineHeight: 1.65 }}>2605 Ingersoll Avenue<br />Des Moines, IA 50312</p>
          </motion.div>
          <motion.div variants={fadeUp} className="glass" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
            <p className="section-label" style={{ marginBottom: '0.6rem', color: RED }}>Contact</p>
            <p style={{ lineHeight: 1.8 }}>
              <a href="tel:5152883381" style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '1.1rem', fontWeight: 700, color: RED, textDecoration: 'none' }}>(515) 288-3381</a><br />
              <a href="mailto:sakarisushilounge@gmail.com" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>sakarisushilounge@gmail.com</a>
            </p>
          </motion.div>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="tel:5152883381" className="btn-red">Call to Reserve</a>
            <a href="https://maps.google.com/?q=2605+Ingersoll+Ave+Des+Moines+IA" target="_blank" rel="noopener noreferrer" className="btn-outline">Get Directions ↗</a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay: 0.15 }}>
          <p className="section-label" style={{ marginBottom: '1.5rem', color: RED }}>Hours</p>
          <div className="glass" style={{ padding: '2rem' }}>
            {[
              { day: 'Monday',   hours: 'Lunch 11AM–2PM · Dinner 5–10PM' },
              { day: 'Tue–Thu',  hours: 'Lunch 11AM–2PM · Dinner 5–9PM'  },
              { day: 'Friday',   hours: '11AM–11PM · Happy Hour 2–5PM',  highlight: true },
              { day: 'Saturday', hours: '11AM–11PM'                       },
              { day: 'Sunday',   hours: '5PM–9PM'                         },
            ].map((h, i) => (
              <div key={h.day}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.85rem 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: '1rem', background: h.highlight ? 'rgba(196,18,48,0.03)' : 'transparent', margin: h.highlight ? '0 -2rem' : '0', paddingLeft: h.highlight ? '2rem' : '0', paddingRight: h.highlight ? '2rem' : '0' }}>
                <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.8125rem', fontWeight: 600, color: h.highlight ? RED : '#fff', minWidth: '72px' }}>{h.day}</span>
                <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.46)', textAlign: 'right' }}>{h.hours}</span>
              </div>
            ))}
            <div style={{ marginTop: '1.25rem', padding: '0.9rem 1rem', background: `rgba(196,18,48,0.07)`, borderRadius: '12px', border: `1px solid rgba(196,18,48,0.18)` }}>
              <p className="section-label" style={{ marginBottom: '0.3rem', color: RED }}>Friday Happy Hour · 2–5PM</p>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.52)' }}>House rolls $3.50 · Kirin Draft $3.50 · Sake Bombs $7 · Martinis $6</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── CTA Band ───────────────────────────────────────────────────────────────────
function CTABand() {
  return (
    <section style={{ padding: '5rem 2.5rem', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: EASE_OUT_QUART }}
          className="glass-red noise"
          style={{ padding: 'clamp(3rem,6vw,5rem) clamp(2rem,5vw,4rem)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', width: '400px', height: '400px', background: `radial-gradient(circle, rgba(196,18,48,0.18) 0%, transparent 70%)`, top: '-50%', left: '-10%', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
            className="section-label" style={{ position: 'relative', marginBottom: '0.75rem', color: RED }}>Ready When You Are</motion.p>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1, marginBottom: '1.25rem', position: 'relative' }}
          >
            RESERVE YOUR<br />
            <span style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontWeight: 300, color: GOLD, fontSize: '1.1em' }}>Table Tonight</span>
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', lineHeight: 1.75, maxWidth: '400px', margin: '0 auto 2.5rem', position: 'relative' }}
          >
            Call ahead or walk in. Either way, we'll take you to the summit.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}
          >
            <a href="tel:5152883381" className="btn-red">(515) 288-3381</a>
            <a href="https://www.yelp.com/biz/sakari-sushi-lounge-des-moines" target="_blank" rel="noopener noreferrer" className="btn-outline">Order for Delivery</a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
      style={{ padding: '4rem 2.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '3rem', alignItems: 'start', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div>
            <img src="/assets/logo_scroll.png" alt="Sakari Sushi Lounge" style={{ height: '48px', objectFit: 'contain', marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, maxWidth: '210px' }}>Summit-level Japanese cuisine.<br />2605 Ingersoll Ave, Des Moines IA.</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'IG', href: 'https://www.instagram.com/sakarisushilounge' },
                { label: 'TK', href: 'https://www.tiktok.com/@sakarisushilounge' },
                { label: 'FB', href: 'https://www.facebook.com/131847286851728' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: `rgba(196,18,48,0.08)`, border: `1px solid rgba(196,18,48,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono",monospace', fontSize: '0.6rem', color: RED, textDecoration: 'none', transition: 'background 0.25s ease' }}
                  onMouseEnter={e => { e.target.style.background = `rgba(196,18,48,0.2)` }}
                  onMouseLeave={e => { e.target.style.background = `rgba(196,18,48,0.08)` }}
                >{s.label}</a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', paddingLeft: '2rem' }}>
            <div>
              <p className="section-label" style={{ marginBottom: '1rem', color: RED }}>Visit</p>
              {['Menu', 'Specials', 'Private Events', 'Catering', 'Gift Cards', 'Reservations'].map((l, i) => (
                <a key={l} href={`#${['menu','specials','events','events','contact','contact'][i]}`}
                  style={{ display: 'block', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.25s ease' }}
                  onMouseEnter={e => (e.target.style.color = RED)}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.42)')}>{l}</a>
              ))}
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '1rem', color: RED }}>Contact</p>
              {[
                { label: '(515) 288-3381',      href: 'tel:5152883381' },
                { label: 'Email Us',             href: 'mailto:sakarisushilounge@gmail.com' },
                { label: 'Get Directions',       href: 'https://maps.google.com/?q=2605+Ingersoll+Ave+Des+Moines+IA' },
                { label: 'Order on Yelp',        href: 'https://www.yelp.com/biz/sakari-sushi-lounge-des-moines' },
                { label: 'Order on GrubHub',     href: 'https://www.grubhub.com' },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', fontFamily: '"Space Grotesk",system-ui', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'color 0.25s ease' }}
                  onMouseEnter={e => (e.target.style.color = RED)}
                  onMouseLeave={e => (e.target.style.color = 'rgba(255,255,255,0.42)')}>{l.label}</a>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label" style={{ marginBottom: '1rem', color: RED }}>Hours</p>
            {[
              { d: 'Mon',     h: 'Lunch 11–2 · Dinner 5–10' },
              { d: 'Tue–Thu', h: 'Lunch 11–2 · Dinner 5–9'  },
              { d: 'Fri–Sat', h: '11AM – 11PM'               },
              { d: 'Sunday',  h: '5PM – 9PM'                 },
            ].map(h => (
              <div key={h.d} style={{ marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{h.d}</span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginLeft: '0.5rem' }}>{h.h}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>© 2026 Sakari Sushi Lounge · Des Moines, Iowa · (515) 288-3381</p>
          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontStyle: 'italic', fontSize: '0.875rem', color: 'rgba(255,255,255,0.2)' }}>Sakari — To Be At One's Best</p>
        </div>
      </div>
    </motion.footer>
  )
}

// ── App ────────────────────────────────────────────────────────────────────────
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
            <About />
            <ScrollVideo />
            <MenuSection />
            <Gallery />
            <Specials />
            <Events />
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
