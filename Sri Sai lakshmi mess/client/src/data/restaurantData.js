/**
 * Configurable Restaurant Data & Fallback Content
 * Sri Sai Lakshmi Mess
 */

export const RESTAURANT_CONFIG = {
  name: 'Sri Sai Lakshmi Mess',
  tagline: 'Authentic Taste • Homely Food • Happy Moments',
  tamilTagline: 'உண்மையான சுவை • வீட்டு உணவு • மகிழ்ச்சியான தருணங்கள்',
  phone: import.meta.env.VITE_RESTAURANT_PHONE || '+91 63830 34188',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '916383034188',
  email: import.meta.env.VITE_RESTAURANT_EMAIL || 'santhoshs14277@gmail.com',
  address: import.meta.env.VITE_RESTAURANT_ADDRESS || ' 993,Balaji Complex,Rathanavillas busstop, Sivakasi-626123',
  openingHours: import.meta.env.VITE_OPENING_HOURS || 'Monday – Sunday: 7:00 AM – 10:00 PM',
  swiggyUrl: import.meta.env.VITE_SWIGGY_URL || 'https://www.swiggy.com/restaurants/sri-sai-lakshmi-mess-sivakasi',
  zomatoUrl: import.meta.env.VITE_ZOMATO_URL || 'https://www.zomato.com/sivakasi/sri-sai-lakshmi-mess',
  mapEmbedUrl: import.meta.env.VITE_GOOGLE_MAP_EMBED_URL || 'https://www.google.com/maps/place/RATHNAVILAS+BUS+STOP/@9.4528819,77.8058464,125m/data=!3m1!1e3!4m6!3m5!1s0x3b06cf16c905dc97:0xdc6d5057c2d7e9a3!8m2!3d9.4530087!4d77.8062228!16s%2Fg%2F11q9j1zy7w?authuser=0&entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D'
};

export const HIGHLIGHTS_DATA = [
  {
    id: 'h-1',
    icon: '🍛',
    title: 'Authentic Taste',
    tamilTitle: 'பாரம்பரிய சுவை',
    description: 'Traditional grandma recipes passed down generations, using authentic stone-ground spices and pure ghee.'
  },
  {
    id: 'h-2',
    icon: '🥗',
    title: 'Fresh Ingredients',
    tamilTitle: 'புதிய பொருட்கள்',
    description: 'Freshly prepared daily using farm-fresh vegetables, organic cold-pressed sesame oil, and no artificial colors.'
  },
  {
    id: 'h-3',
    icon: '❤️',
    title: 'Homely Food',
    tamilTitle: 'வீட்டு உணவு',
    description: 'Comforting, healthy meals cooked with the same love, hygiene, and cleanliness as your mother’s kitchen.'
  },
  {
    id: 'h-4',
    icon: '⭐',
    title: 'Quality Service',
    tamilTitle: 'சிறந்த சேவை',
    description: 'Warm South Indian hospitality with prompt service, hygienic banana leaf dining, and affordable pricing.'
  }
];

export const ABOUT_STATS = [
  { label: 'Freshly Prepared', detail: 'Cooked in small batches all day' },
  { label: 'Affordable Prices', detail: 'Pure quality made accessible' },
  { label: 'Authentic Recipes', detail: 'Rooted in traditional South Indian heritage' },
  { label: 'Customer Satisfaction', detail: 'Serving happiness in every bite' }
];

export const GALLERY_ITEMS = [
  {
    id: 'gal-1',
    title: 'Grand South Indian Thali Meals',
    category: 'Meals',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1000&q=80',
    description: 'Steaming ponni rice served with fresh kootu, poriyal, sambar, rasam, and crisp appalam.'
  },
  {
    id: 'gal-2',
    title: 'Crisp Ghee Roast Dosa',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80',
    description: 'Golden paper-thin cone roast drizzled with farm ghee, served with tri-color chutneys.'
  },
  {
    id: 'gal-3',
    title: 'Soft Ghee Podi Idli & Chutneys',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=80',
    description: 'Melt-in-mouth steamed idlis coated with spicy aromatic karam podi and hot sambar.'
  },
  {
    id: 'gal-4',
    title: 'Hot Medu Vada on Banana Leaf',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
    description: 'Crunchy golden exterior, soft fluffy inside with peppercorns and curry leaves.'
  },
  {
    id: 'gal-5',
    title: 'Traditional Kumbakonam Degree Coffee',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80',
    description: 'Decoction brewed fresh and frothed in traditional brass davarah tumbler.'
  },
  {
    id: 'gal-6',
    title: 'Tempered Variety Rice Combo',
    category: 'Meals',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80',
    description: 'Fragrant sambar rice, tangy lemon rice, and soothing curd rice platter.'
  },
  {
    id: 'gal-7',
    title: 'Fluffy Hot Poori with Potato Masala',
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80',
    description: 'Deep-fried golden whole wheat pooris paired with mildly spiced potato kizhangu.'
  },
  {
    id: 'gal-8',
    title: 'Authentic South Indian Filter Coffee Brewing',
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=80',
    description: 'Fresh milk boiling and decoction blending with thick rich froth.'
  },
  {
    id: 'gal-9',
    title: 'Warm & Clean Dining Space',
    category: 'Ambience',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
    description: 'Hygienic, welcoming and comfortable dining hall for families and food lovers.'
  }
];
