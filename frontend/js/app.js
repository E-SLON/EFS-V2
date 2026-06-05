/* ═══════════════════════════════════════════════════════════════
   EXCLUSIVE FRAGRANCE SCENTS v2 — Frontend Application
   Full API integration, cart, orders, admin panel
   ═══════════════════════════════════════════════════════════════ */

// ── CONFIG ────────────────────────────────────────────────────────
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : '/api';

// ── STATE ─────────────────────────────────────────────────────────
let allProducts  = [];
let cart         = JSON.parse(localStorage.getItem('efs_cart') || '[]');
let adminToken   = sessionStorage.getItem('efs_token') || null;
let adminUser    = JSON.parse(sessionStorage.getItem('efs_admin') || 'null');
let activeFilter = 'all';
let activeGender = 'all';
let toastTimer   = null;
let currentAdminTab = 'orders';

// ── FALLBACK PRODUCTS (shown if API is offline) ───────────────────
const FALLBACK = [
  { productId:1,  name:"Dior J'adore",           brand:"Christian Dior",    price:1599.99, originalPrice:5300, size:"100ml", tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image3.jpg",  occasion:"Evening events & special occasions",   icon:"💛", featured:true,  description:"A timeless, radiant, and ultra-feminine fragrance that embodies luxury and sensual elegance. It celebrates the beauty of flowers in a luminous bouquet, designed for the woman who is confident, graceful, and effortlessly glamorous.", topNotes:"Pear, Melon, Peach, Bergamot, Mandarin Orange", heartNotes:"Jasmine, Rose, Lily of the Valley, Freesia, Orchid, Plum, Violet", baseNotes:"Musk, Vanilla, Cedar, Blackberry" },
  { productId:2,  name:"Olympea EDP",             brand:"Paco Rabanne",      price:1299.99, originalPrice:4700, size:"80ml",  tag:"oriental", tagLabel:"Oriental", gender:"women",  imageFile:"image4.jpeg", occasion:"Day-to-night wear, evening events",     icon:"⚡", featured:true,  description:"Empowering, elegant, and radiant. Opens with a fresh, luminous blend of green mandarin, water jasmine, and ginger flower. The heart reveals warm, creamy vanilla and salted caramel. Cashmere wood and ambergris provide a long-lasting, alluring trail.", topNotes:"Green Mandarin, Jasmine, Ginger Flower", heartNotes:"Vanilla, Salted Caramel", baseNotes:"Cashmere Wood, Ambergris" },
  { productId:3,  name:"Good Girl EDP",           brand:"Carolina Herrera",  price:1399.99, originalPrice:4000, size:"80ml",  tag:"gourmand", tagLabel:"Gourmand", gender:"women",  imageFile:"image5.jpeg", occasion:"Evening wear & bold statements",         icon:"👠", featured:true,  description:"A daring and sophisticated fragrance celebrating the duality of modern femininity. Opens with coffee and almond, melts into jasmine and tuberose, settles into tonka bean, cocoa, and vanilla.", topNotes:"Almond, Coffee, Bergamot, Lemon", heartNotes:"Jasmine Sambac, Tuberose, Bulgarian Rose, Orange Blossom", baseNotes:"Tonka Bean, Cacao, Vanilla, Sandalwood, Praline" },
  { productId:4,  name:"Club de Nuit Women",      brand:"Armaf",             price:1299.99, originalPrice:4200, size:"105ml", tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image6.jpeg", occasion:"Evening glamour & special occasions",   icon:"💎", featured:false, description:"Sophisticated, luminous, and sensual. Opens with a juicy burst of citrus and peach. Heart reveals rose and jasmine enriched with litchi. Base lingers warmly with patchouli, vanilla, and musk.", topNotes:"Orange, Grapefruit, Bergamot, Peach", heartNotes:"Rose, Jasmine, Geranium, Litchi", baseNotes:"Patchouli, Vanilla, Musk, Vetiver" },
  { productId:5,  name:"Chance EDP",              brand:"Chanel",            price:1499.99, originalPrice:4500, size:"100ml", tag:"fresh",    tagLabel:"Fresh",    gender:"women",  imageFile:"image7.jpeg", occasion:"Everyday luxury & romantic occasions",  icon:"🌸", featured:true,  description:"A radiant, youthful, and elegant fragrance embodying spontaneity and optimism. Sparkling and fresh with pink pepper opening. Soft, romantic florals at the heart. Sensual, warm base with patchouli and vanilla.", topNotes:"Pink Pepper, Lemon, Pineapple", heartNotes:"Jasmine, Hyacinth, Iris", baseNotes:"Patchouli, Musk, Vanilla, Vetiver" },
  { productId:6,  name:"Light Blue EDT",          brand:"Dolce & Gabbana",   price:1299.99, originalPrice:4300, size:"100ml", tag:"fresh",    tagLabel:"Fresh",    gender:"women",  imageFile:"image8.jpeg", occasion:"Daytime wear, summer, casual elegance", icon:"🌊", featured:false, description:"Fresh, vibrant, and effortlessly chic. Captures the essence of a sunny Mediterranean summer. Sparkling Sicilian lemon, crisp apple, and cedar open the scent. Bamboo, jasmine, white rose at the heart. Warm amber and musk finish.", topNotes:"Sicilian Lemon, Apple, Cedar", heartNotes:"Bamboo, Jasmine, White Rose", baseNotes:"Amber, Cedarwood, Musk" },
  { productId:7,  name:"Lady Million EDP",        brand:"Paco Rabanne",      price:1499.99, originalPrice:4800, size:"80ml",  tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image9.jpeg", occasion:"Nights out & luxury moments",           icon:"💰", featured:false, description:"Glamorous, bold, and ultra-feminine. Inspired by gold and extravagance. Sparkling fruity-citrus freshness, lavish white florals, sweet honey and amber wrapped in patchouli.", topNotes:"Neroli, Bitter Orange, Raspberry", heartNotes:"Jasmine Sambac, Orange Blossom, Gardenia", baseNotes:"Honey, Amber, Patchouli" },
  { productId:8,  name:"Be Delicious EDP",        brand:"DKNY",              price:1199.99, originalPrice:3600, size:"100ml", tag:"fresh",    tagLabel:"Fresh",    gender:"women",  imageFile:"image10.jpeg",occasion:"Everyday freshness & city life",        icon:"🍏", featured:false, description:"Fresh, vibrant, and playful. Crisp apple, cucumber, and grapefruit open the scent. Feminine floral bouquet at the heart. Smooth woody-ambery base. The iconic apple-shaped bottle reflects its character.", topNotes:"Green Apple, Cucumber, Grapefruit, Magnolia", heartNotes:"Tuberose, Lily of the Valley, Rose, Violet", baseNotes:"Sandalwood, White Amber, Woods" },
  { productId:9,  name:"Oud Ispahan EDP",         brand:"Christian Dior",    price:1599.99, originalPrice:5000, size:"75ml",  tag:"oud",      tagLabel:"Oud",      gender:"unisex", imageFile:"image11.jpeg",occasion:"Evening wear & bold occasions",          icon:"🌹", featured:true,  description:"An opulent, sophisticated oriental celebrating the meeting of East and West. Rich resinous opening with dark, mysterious oud. Lush velvety Damascus rose at the heart. Smoky, woody, long-lasting base.", topNotes:"Labdanum", heartNotes:"Damascus Rose", baseNotes:"Agarwood (Oud), Sandalwood, Patchouli, Cedar" },
  { productId:10, name:"Baccarat Rouge 540",      brand:"Maison Francis Kurkdjian", price:1699.99, originalPrice:4500, size:"70ml", tag:"oriental", tagLabel:"Oriental", gender:"unisex", imageFile:"image22.jpeg", occasion:"Formal events, day-to-night luxury", icon:"✨", featured:true, description:"Luxurious, radiant, and unforgettable. Luminous saffron and jasmine opening. Amberwood and ambergris add warmth and addictive sensuality. Cedarwood and fir resin finish. Designed for both men and women — captivating and iconic.", topNotes:"Saffron, Jasmine", heartNotes:"Amberwood, Ambergris", baseNotes:"Cedarwood, Fir Resin" },
  { productId:11, name:"Boss Bottled EDT",        brand:"Hugo Boss",         price:1299.99, originalPrice:4200, size:"100ml", tag:"woody",    tagLabel:"Woody",    gender:"men",    imageFile:"image13.jpeg",occasion:"Office, everyday wear & evening",       icon:"💼", featured:false, description:"Timeless and sophisticated — a modern classic embodying confidence and success. Fresh apple and citrus opening. Warm spicy geranium, cinnamon, and cloves at the heart. Smooth sandalwood, cedarwood, vetiver, and vanilla base.", topNotes:"Apple, Citrus", heartNotes:"Geranium, Cinnamon, Cloves", baseNotes:"Sandalwood, Cedarwood, Vetiver, Vanilla" },
  { productId:12, name:"Boss Bottled Unlimited",  brand:"Hugo Boss",         price:1399.99, originalPrice:4500, size:"100ml", tag:"fresh",    tagLabel:"Fresh",    gender:"men",    imageFile:"image14.jpeg",occasion:"Daytime wear, office, casual confidence",icon:"🌬️",featured:false, description:"Fresh, dynamic, and full of energy. Invigorating mint, violet leaf, and grapefruit opening. Pineapple, rose, and cinnamon heart. Refined sandalwood, musk, and labdanum base.", topNotes:"Mint, Violet Leaf, Grapefruit", heartNotes:"Pineapple, Rose, Cinnamon", baseNotes:"Sandalwood, Musk, Labdanum" },
  { productId:13, name:"Only The Brave Tattoo",   brand:"Diesel",            price:1199.99, originalPrice:3900, size:"75ml",  tag:"woody",    tagLabel:"Woody",    gender:"men",    imageFile:"image15.jpeg",occasion:"Nightlife, casual evenings, confidence", icon:"🔱", featured:false, description:"Edgy, bold, and irresistibly daring. Apple and mandarin opening. Spicy sage, pepper, and bourbon pepper heart. Sensual amberwood, tobacco, and patchouli base — a symbol of identity and unforgettable presence.", topNotes:"Apple, Mandarin", heartNotes:"Sage, Pepper, Bourbon Pepper", baseNotes:"Amberwood, Tobacco, Patchouli" },
  { productId:14, name:"Gucci Guilty Homme EDT",  brand:"Gucci",             price:1499.99, originalPrice:4600, size:"90ml",  tag:"woody",    tagLabel:"Woody",    gender:"men",    imageFile:"image16.jpeg",occasion:"Evening wear, dates, special occasions", icon:"🖤", featured:false, description:"Seductive, daring, and unmistakably modern. Fresh lemon and lavender opening. Warm spicy orange blossom and neroli heart. Sensual cedarwood, patchouli, and incense base — the perfect balance of freshness and masculinity.", topNotes:"Lemon, Lavender", heartNotes:"Orange Blossom, Neroli", baseNotes:"Cedarwood, Patchouli, Incense" },
  { productId:15, name:"Club De Nuit Intense Man",brand:"Armaf",             price:1299.99, originalPrice:4500, size:"105ml", tag:"woody",    tagLabel:"Woody",    gender:"men",    imageFile:"image17.jpeg",occasion:"Everyday wear & special occasions",     icon:"🌃", featured:true,  description:"Confident, bold, and sophisticated. Vibrant lemon, blackcurrant, apple, bergamot, and pineapple opening. Smoky, floral-spicy rose, jasmine, and birch heart. Long-lasting musk, ambergris, vanilla, and patchouli base.", topNotes:"Lemon, Blackcurrant, Apple, Bergamot, Pineapple", heartNotes:"Rose, Jasmine, Birch", baseNotes:"Musk, Ambergris, Vanilla, Patchouli" },
  { productId:16, name:"Intense Noir",            brand:"Exclusive",         price:699.99,  originalPrice:1400, size:"50ml",  tag:"oriental", tagLabel:"Oriental", gender:"unisex", imageFile:"image30.png", occasion:"Evening wear & special occasions",       icon:"🖤", featured:false, description:"Sophisticated and seductive. Bergamot and aromatic herbs open the scent. Warm cardamom, soft lavender, and orange blossom heart. Smooth vanilla, amber wood, vetiver, and musk base — rich, mysterious, and long-lasting.", topNotes:"Bergamot, Clary Sage, Rosemary", heartNotes:"Cardamom, Lavender, Orange Blossom", baseNotes:"Vanilla, Amber Wood, Vetiver, Musk" },
  { productId:17, name:"Hayaati EDP",             brand:"Lattafa",           price:599.99,  originalPrice:1800, size:"50ml",  tag:"fresh",    tagLabel:"Fresh",    gender:"unisex", imageFile:"image31.png", occasion:"Day and night — versatile",              icon:"✨", featured:false, description:"Modern and uplifting. Fresh apple and citrus blended with spicy ginger and bergamot. Smooth sage, lavender, and warm spices heart. Amber, musk, cedar, and patchouli base. Versatile for day and night.", topNotes:"Apple, Citrus, Ginger, Bergamot", heartNotes:"Sage, Lavender, Warm Spices", baseNotes:"Amber, Musk, Cedar, Patchouli" },
  { productId:18, name:"DES Tentations EDP",      brand:"Exclusive",         price:599.99,  originalPrice:1700, size:"50ml",  tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image32.png", occasion:"Daytime wear & special moments",         icon:"🌸", featured:false, description:"Playful yet sophisticated floral-fruity fragrance. Juicy berries and fresh citrus opening. Rose, jasmine, and delicate white flowers heart. Sensual, creamy vanilla, musk, and soft woods base.", topNotes:"Berries, Citrus", heartNotes:"Rose, Jasmine, White Flowers", baseNotes:"Vanilla, Musk, Soft Woods" },
  { productId:19, name:"White Oud",               brand:"Exclusive",         price:649,     originalPrice:1800, size:"50ml",  tag:"oud",      tagLabel:"Oud",      gender:"unisex", imageFile:"image33.png", occasion:"Modern oud lovers — gentle & wearable",  icon:"🤍", featured:false, description:"A refined take on traditional oud. Fresh citrus and subtle florals opening. Powdery jasmine and velvety rose heart. Creamy elegant oud blended with amber, vanilla, and musk base — gentle and modern.", topNotes:"Citrus, Subtle Florals", heartNotes:"Powdery Jasmine, Velvety Rose", baseNotes:"Oud, Amber, Vanilla, Musk" },
  { productId:20, name:"Sutoor EDP",              brand:"Exclusive",         price:699,     originalPrice:1900, size:"50ml",  tag:"fresh",    tagLabel:"Fresh",    gender:"unisex", imageFile:"image34.png", occasion:"Daily wear — clean & stylish",           icon:"💨", featured:false, description:"Vibrant, fresh, and invigorating. Bright citrus, juicy apple, and herbal nuances opening. Aromatic lavender, spicy cardamom, and nutmeg heart. Amberwood, musk, and cedar base — clean and effortlessly stylish.", topNotes:"Citrus, Juicy Apple, Herbs", heartNotes:"Lavender, Cardamom, Nutmeg", baseNotes:"Amberwood, Musk, Cedar" },
  { productId:21, name:"Badee Al Oud Honor & Glory",brand:"Lattafa",         price:699.99,  originalPrice:1800, size:"100ml", tag:"oud",      tagLabel:"Oud",      gender:"unisex", imageFile:"image35.png", occasion:"Nights out — powerful projection",        icon:"👑", featured:true,  description:"Bold, intense, and made for true oud enthusiasts. Smoky oud, earthy spices, and saffron opening. Rose, amber, and incense heart. Agarwood, musk, and patchouli base — strong, dark, and unforgettable.", topNotes:"Smoky Oud, Saffron, Spices", heartNotes:"Rose, Amber, Incense", baseNotes:"Agarwood, Musk, Patchouli" },
  { productId:22, name:"Badee Al Oud Sublime",    brand:"Lattafa",           price:599.99,  originalPrice:1700, size:"100ml", tag:"oud",      tagLabel:"Oud",      gender:"unisex", imageFile:"image36.png", occasion:"Approachable oud — elegant & versatile", icon:"🌙", featured:false, description:"A smoother, sweeter interpretation of Badee Al Oud. Juicy fruits and fresh citrus opening. Rose and jasmine heart. Oud softened with vanilla, tonka bean, and amber base — elegant and modern.", topNotes:"Juicy Fruits, Citrus", heartNotes:"Rose, Jasmine", baseNotes:"Oud, Vanilla, Tonka Bean, Amber" },
  { productId:23, name:"Rave Now EDP",            brand:"Lattafa",           price:499.99,  originalPrice:1500, size:"100ml", tag:"fresh",    tagLabel:"Fresh",    gender:"unisex", imageFile:"image37.png", occasion:"Everyday casual wear",                  icon:"⚡", featured:false, description:"Youthful, energetic, and playful. Zesty citrus and sweet fruits opening. Light florals and spice heart. Amber, vanilla, and soft musk base — ideal for everyday casual occasions.", topNotes:"Citrus, Sweet Fruits", heartNotes:"Light Florals, Spice", baseNotes:"Amber, Vanilla, Musk" },
  { productId:24, name:"Badee Al Oud for Glory",  brand:"Lattafa",           price:649.99,  originalPrice:1700, size:"100ml", tag:"oud",      tagLabel:"Oud",      gender:"unisex", imageFile:"image38.png", occasion:"Statement evenings — strong projection", icon:"🔥", featured:false, description:"Rich, smoky, and powerful. Saffron, nutmeg, and lavender opening — spicy yet smooth. Natural oud and patchouli heart creates intensity. Amber, musk, and woods base ensures long-lasting depth. A statement-maker.", topNotes:"Saffron, Nutmeg, Lavender", heartNotes:"Oud, Patchouli", baseNotes:"Amber, Musk, Woods" },
  { productId:25, name:"Yara EDP",                brand:"Lattafa",           price:599.99,  originalPrice:1600, size:"100ml", tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image39.png", occasion:"Daily wear — all seasons",              icon:"🌸", featured:false, description:"Soft, powdery, and elegant. Bright citrus and delicate florals opening. Creamy orchid and heliotrope heart. Warm vanilla, musk, and sandalwood base — silky and comforting. Versatile for all seasons.", topNotes:"Citrus, Delicate Florals", heartNotes:"Orchid, Heliotrope", baseNotes:"Vanilla, Musk, Sandalwood" },
  { productId:26, name:"Brown Orchid Purple",     brand:"Brown Orchid",      price:599.99,  originalPrice:1700, size:"80ml",  tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image40.png", occasion:"Glamorous evenings",                    icon:"💜", featured:false, description:"Rich, sweet, and sensual. Berries and plum opening. Jasmine, rose, vanilla, and tonka heart. Patchouli, amber, and musk base — warm and seductive. A glamorous evening scent.", topNotes:"Berries, Plum", heartNotes:"Jasmine, Rose, Vanilla, Tonka", baseNotes:"Patchouli, Amber, Musk" },
  { productId:27, name:"Brown Orchid Ruby",       brand:"Brown Orchid",      price:649.99,  originalPrice:1800, size:"80ml",  tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image41.png", occasion:"Parties, nights out & special occasions",icon:"❤️", featured:false, description:"Radiant and luxurious with a sparkling fruity-floral opening. Pomegranate, citrus, and exotic flowers opening. Rose, jasmine, and gourmand heart. Smooth amber, musk, and vanilla base — alluring and long-lasting.", topNotes:"Pomegranate, Citrus, Exotic Flowers", heartNotes:"Rose, Jasmine, Gourmand", baseNotes:"Amber, Musk, Vanilla" },
  { productId:28, name:"Yara White EDP",          brand:"Lattafa",           price:649.99,  originalPrice:1900, size:"100ml", tag:"gourmand", tagLabel:"Gourmand", gender:"women",  imageFile:"image42.png", occasion:"Everyday sweet luxury",                 icon:"🤍", featured:false, description:"Soft, creamy, and powdery gourmand. Juicy tangerine, coconut, and heliotrope opening. Sweet vanilla orchid and jasmine heart. Smooth vanilla, musk, and sandalwood base — velvety and comforting.", topNotes:"Tangerine, Coconut, Heliotrope", heartNotes:"Vanilla Orchid, Jasmine", baseNotes:"Vanilla, Musk, Sandalwood" },
  { productId:29, name:"Brown Orchid Rose Edition",brand:"Brown Orchid",     price:699.99,  originalPrice:1900, size:"80ml",  tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image43.png", occasion:"Evenings & romantic occasions",          icon:"🌷", featured:false, description:"A luxurious floral-oriental celebrating roses in full bloom. Sparkling citrus and fruity opening. Turkish rose, jasmine, and soft peony heart — opulent and romantic. Warm amber, vanilla, and smooth musk base.", topNotes:"Citrus, Fruity Notes", heartNotes:"Turkish Rose, Jasmine, Peony", baseNotes:"Amber, Vanilla, Musk" },
  { productId:30, name:"Paradox Rossa EDP",       brand:"Exclusive",         price:599.99,  originalPrice:1700, size:"50ml",  tag:"floral",   tagLabel:"Floral",   gender:"women",  imageFile:"image44.png", occasion:"Rich floral-woody elegance",             icon:"🌹", featured:false, description:"A glowing ode to rose and amber. Golden saffron, pink pepper, and aldehydes opening. Plush damask rose and geranium heart. Warm vetiver, cedar, leather, labdanum, and white amber base — beautifully balanced.", topNotes:"Saffron, Pink Pepper, Aldehydes", heartNotes:"Damask Rose, Geranium", baseNotes:"Vetiver, Cedar, Leather, Labdanum, White Amber" },
  { productId:31, name:"Badee Al Oud Amethyst",   brand:"Lattafa",           price:649.99,  originalPrice:1900, size:"100ml", tag:"oud",      tagLabel:"Oud",      gender:"women",  imageFile:"image45.png", occasion:"Special occasions & evening settings",  icon:"💜", featured:true,  description:"A rose-oud masterpiece. Bright pink pepper and bergamot opening. Turkish Rose, Bulgarian Rose, and jasmine heart — lush and romantic. Creamy vanilla, golden amber, and smoky agarwood base — sweet and deeply sensual.", topNotes:"Pink Pepper, Bergamot", heartNotes:"Turkish Rose, Bulgarian Rose, Jasmine", baseNotes:"Vanilla, Golden Amber, Agarwood" },
  { productId:32, name:"Amber Eve EDP",           brand:"Barakkat",          price:649.99,  originalPrice:1800, size:"50ml",  tag:"oriental", tagLabel:"Oriental", gender:"unisex", imageFile:"image46.png", occasion:"Evening wear & colder seasons",          icon:"🌅", featured:false, description:"A warm, golden embrace. Rich resins and glowing amber brightened by bitter orange. Creamy vanilla and benzoin heart — sweet and resinous. Tonka bean, cedar, and amber base — deep and comforting.", topNotes:"Bitter Orange, Resins", heartNotes:"Vanilla, Benzoin", baseNotes:"Tonka Bean, Cedar, Amber" },
  { productId:33, name:"Satin Oud EDP",           brand:"Barakkat",          price:699.99,  originalPrice:1900, size:"50ml",  tag:"oud",      tagLabel:"Oud",      gender:"unisex", imageFile:"image47.png", occasion:"Formal occasions & statement moments",  icon:"🌹", featured:false, description:"An opulent oud-rose masterpiece. Soft violet and lush roses opening. Laotian oud and agarwood heart — velvety and intense. Amber, vanilla, and benzoin base softens the oud into a luxurious trail.", topNotes:"Violet, Rose", heartNotes:"Laotian Oud, Agarwood", baseNotes:"Amber, Vanilla, Benzoin" },
  { productId:34, name:"Ammerat Al Arab EDP",     brand:"Ammerat",           price:749.99,  originalPrice:2000, size:"60ml",  tag:"oriental", tagLabel:"Oriental", gender:"unisex", imageFile:"image48.png", occasion:"Evening occasions & oud lovers",         icon:"🕌", featured:false, description:"Steeped in Middle Eastern charm. Exotic spices and fresh citrus opening. Rose, jasmine, saffron, and oud heart. Resinous amber, musk, and patchouli base — intense and unforgettable.", topNotes:"Exotic Spices, Citrus", heartNotes:"Rose, Jasmine, Saffron, Oud", baseNotes:"Amber, Musk, Patchouli" },
  { productId:35, name:"Mocha Wood EDP",          brand:"Exclusive",         price:649.99,  originalPrice:1700, size:"50ml",  tag:"gourmand", tagLabel:"Gourmand", gender:"unisex", imageFile:"image49.png", occasion:"Cozy occasions & evening wear",          icon:"☕", featured:false, description:"A rich gourmand blending roasted coffee with creamy chocolate and soft woods. Coffee beans and sweet cocoa with hints of spice opening. Vanilla and tonka bean heart wrapped in sandalwood for depth.", topNotes:"Coffee Beans, Sweet Cocoa, Spices", heartNotes:"Vanilla, Tonka Bean", baseNotes:"Sandalwood, Musk" },
  { productId:36, name:"White Rouge 540 EDP",     brand:"Barakkat",          price:599.99,  originalPrice:1600, size:"50ml",  tag:"fresh",    tagLabel:"Fresh",    gender:"unisex", imageFile:"image50.png", occasion:"Daytime wear & business settings",       icon:"🤍", featured:false, description:"Crisp, elegant, and luminous. Fresh citrus and delicate florals opening. Soft, powdery jasmine and lily heart. Creamy musk, subtle woods, and a whisper of vanilla base — clean sophistication.", topNotes:"Citrus, Delicate Florals", heartNotes:"Jasmine, Lily", baseNotes:"Creamy Musk, Woods, Vanilla" }
];

// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initAOS();
  initNavbar();
  updateCartBadge();
  loadProducts();

  // Hide page loader after 1.8s
  setTimeout(() => {
    document.getElementById('pageLoader').classList.add('hidden');
  }, 1900);
});

// ─── PARTICLES ────────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 12 + 8}s;
      animation-delay:${Math.random() * 8}s;
      opacity:${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(p);
  }
}

// ─── AOS (scroll reveal) ──────────────────────────────────────────
function initAOS() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('aos-animate');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
}

// ─── NAVBAR ───────────────────────────────────────────────────────
function initNavbar() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ═══════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════
async function loadProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Loading collection...</p></div>`;

  try {
    const params = new URLSearchParams();
    if (activeFilter !== 'all') params.set('tag', activeFilter);
    if (activeGender !== 'all') params.set('gender', activeGender);

    const res  = await fetch(`${API}/products?${params}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message);
    allProducts = data.products;
    renderGrid(data.products);
  } catch (err) {
    // Fallback to embedded data
    let filtered = FALLBACK;
    if (activeFilter !== 'all') filtered = filtered.filter(p => p.tag === activeFilter);
    if (activeGender !== 'all') filtered = filtered.filter(p => p.gender === activeGender);
    allProducts = filtered;
    renderGrid(filtered);
  }
}

function renderGrid(products) {
  const grid = document.getElementById('productGrid');

  if (!products.length) {
    grid.innerHTML = `<div class="loading-state"><p style="color:var(--gray)">No fragrances found in this category.</p></div>`;
    return;
  }

  grid.innerHTML = products.map((p, i) => {
    const saving = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    return `
    <div class="product-card" style="animation-delay:${i * 0.04}s" onclick="openDetail(${p.productId})">
      ${p.featured ? `<div class="featured-badge">⭐ Featured</div>` : ''}
      <div class="tag-badge tag-${p.tag}">${p.tagLabel}</div>
      ${saving > 0 ? `<div class="sale-badge">-${saving}%</div>` : ''}
      <div class="card-img-wrap">
        ${p.imageFile
          ? `<img class="card-img" src="images/${p.imageFile}" alt="${p.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\"card-img-placeholder\\"><div class=\\"card-img-icon\\">${p.icon || '🧴'}</div></div>'">`
          : `<div class="card-img-placeholder"><div class="card-img-icon">${p.icon || '🧴'}</div></div>`
        }
        <div class="card-overlay">
          <div class="overlay-name">${p.name}</div>
          <div class="overlay-occasion">${p.occasion || ''}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-brand">${p.brand}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-notes">${p.description || ''}</div>
        <div class="card-footer">
          <div class="card-prices">
            <div class="card-price">R ${Number(p.price).toFixed(2)}</div>
            ${p.originalPrice ? `<div class="card-original">R ${p.originalPrice.toLocaleString()}</div>` : ''}
            ${saving > 0 ? `<div class="card-saving">Save ${saving}%</div>` : ''}
          </div>
          <button class="add-btn" onclick="event.stopPropagation();addToCart(${p.productId})">
            + Cart
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterProducts(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadProducts();
}

function filterGender(gender, btn) {
  activeGender = gender;
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  loadProducts();
}

function quickFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  loadProducts();
}

let searchTimeout;
function searchProducts(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (!query.trim()) { loadProducts(); return; }
    try {
      const res  = await fetch(`${API}/products?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) { allProducts = data.products; renderGrid(data.products); }
    } catch {
      const filtered = FALLBACK.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase())
      );
      renderGrid(filtered);
    }
  }, 300);
}

// ═══════════════════════════════════════════════════
//  PRODUCT DETAIL
// ═══════════════════════════════════════════════════
function openDetail(productId) {
  const p = allProducts.find(x => (x.productId || x.id) === productId)
         || FALLBACK.find(x => x.productId === productId);
  if (!p) return;

  const saving = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  // Image side
  document.getElementById('detailImgSide').innerHTML = p.imageFile
    ? `<img src="images/${p.imageFile}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<div class=\\"detail-img-placeholder\\"><span style=\\"font-size:80px;opacity:0.2\\">${p.icon || '🧴'}</span></div>'">`
    : `<div class="detail-img-placeholder"><span style="font-size:80px;opacity:0.2">${p.icon || '🧴'}</span></div>`;

  // Content side
  document.getElementById('detailContent').innerHTML = `
    <div class="detail-brand">${p.brand}</div>
    <div class="detail-name">${p.name}</div>
    <div class="detail-desc">${p.description || ''}</div>

    ${(p.topNotes || p.heartNotes || p.baseNotes) ? `
    <div class="detail-notes-section">
      <div class="detail-notes-title">Fragrance Notes</div>
      ${p.topNotes   ? `<div class="detail-note-row"><strong>Top:</strong> ${p.topNotes}</div>` : ''}
      ${p.heartNotes ? `<div class="detail-note-row"><strong>Heart:</strong> ${p.heartNotes}</div>` : ''}
      ${p.baseNotes  ? `<div class="detail-note-row"><strong>Base:</strong> ${p.baseNotes}</div>` : ''}
    </div>` : ''}

    ${p.occasion ? `<div class="detail-occasion">Best for: ${p.occasion}</div>` : ''}

    <div class="detail-price-row">
      <div>
        <div class="detail-price">R ${Number(p.price).toFixed(2)}</div>
        <div style="font-size:11px;color:var(--gray)">${p.size || '50ml'}</div>
      </div>
      ${p.originalPrice ? `
      <div>
        <div class="detail-original">R ${p.originalPrice.toLocaleString()}</div>
        ${saving > 0 ? `<div class="detail-saving">You save ${saving}%</div>` : ''}
      </div>` : ''}
    </div>

    <button class="detail-add-btn" onclick="addToCart(${p.productId}); closeDetail()">
      Add to Cart — R ${Number(p.price).toFixed(2)}
    </button>`;

  document.getElementById('detailOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  document.getElementById('detailOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════
function saveCart() { localStorage.setItem('efs_cart', JSON.stringify(cart)); }

function addToCart(productId) {
  const p = allProducts.find(x => (x.productId || x.id) === productId)
         || FALLBACK.find(x => x.productId === productId);
  if (!p) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) { existing.qty++; }
  else {
    cart.push({
      id: p.productId, name: p.name, brand: p.brand,
      price: p.price, qty: 1,
      icon: p.icon || '🧴',
      size: p.size || '50ml',
      imageFile: p.imageFile || ''
    });
  }
  saveCart(); updateCartBadge();
  showToast(`<strong>${p.name}</strong> added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateCartBadge(); renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartCount');
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'flex' : 'none'; }
}

function renderCart() {
  const el     = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!el) return;
  if (!cart.length) {
    el.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛍️</div><div>Your cart is empty</div></div>`;
    footer.style.display = 'none'; return;
  }
  footer.style.display = 'block';
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.imageFile
          ? `<img src="images/${item.imageFile}" alt="${item.name}" onerror="this.parentElement.textContent='${item.icon}'">`
          : item.icon}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">R ${Number(item.price).toFixed(2)} · ${item.size}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
          <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('cartTotalAmount').textContent = `R ${cartTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

function openCart() {
  renderCart();
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartSidebar').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════
//  CHECKOUT
// ═══════════════════════════════════════════════════
function openCheckout() {
  closeCart();
  document.getElementById('orderSummaryMini').innerHTML = `
    <h3>Order Summary</h3>
    ${cart.map(i => `<div class="order-line"><span>${i.name} × ${i.qty}</span><span>R ${(i.price * i.qty).toFixed(2)}</span></div>`).join('')}
    <div class="order-total-line"><span>Total</span><strong>R ${cartTotal().toFixed(2)}</strong></div>`;
  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

async function submitOrder() {
  const name    = document.getElementById('orderName').value.trim();
  const phone   = document.getElementById('orderPhone').value.trim();
  const address = document.getElementById('orderAddress').value.trim();
  if (!name || !phone || !address) { showToast('Please fill in Name, Phone, and Address'); return; }

  const btn = document.getElementById('submitOrderBtn');
  btn.disabled = true; btn.textContent = 'Placing Order...';

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name, phone,
          email:   document.getElementById('orderEmail').value.trim(),
          address
        },
        items: cart,
        total: cartTotal(),
        notes: document.getElementById('orderNotes').value.trim()
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    // Clear
    cart = []; saveCart(); updateCartBadge();
    ['orderName','orderPhone','orderEmail','orderAddress','orderNotes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    closeCheckout();
    document.getElementById('orderRefDisplay').textContent = 'Order Ref: ' + data.orderId;
    document.getElementById('successOverlay').classList.add('open');
  } catch (err) {
    showToast('Failed to place order. Please try again.');
  } finally {
    btn.disabled = false; btn.textContent = 'Confirm Order →';
  }
}

function closeSuccess() {
  document.getElementById('successOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════
//  ADMIN PANEL
// ═══════════════════════════════════════════════════
function openAdminPanel() {
  document.getElementById('adminOverlay').classList.add('open');
  renderAdminPanel();
}

function closeAdmin() {
  document.getElementById('adminOverlay').classList.remove('open');
}

function renderAdminPanel() {
  if (!adminToken) { renderAdminLogin(); return; }
  renderAdminDashboard();
}

// ── ADMIN LOGIN ───────────────────────────────────────────────────
function renderAdminLogin() {
  document.getElementById('adminBody').innerHTML = `
    <div class="admin-login">
      <div class="login-card">
        <h2>Admin Access</h2>
        <p>Sign in to your account</p>
        <div class="form-group" style="text-align:left">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="adminEmail" placeholder="admin@efs.com" onkeypress="if(event.key==='Enter')doAdminLogin()">
        </div>
        <div class="form-group" style="text-align:left">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="adminPass" placeholder="Your password" onkeypress="if(event.key==='Enter')doAdminLogin()">
        </div>
        <div class="login-error" id="loginError"></div>
        <button class="login-btn" onclick="doAdminLogin()">Sign In</button>
        <p style="font-size:11px;color:var(--gray);margin-top:16px;text-align:center">
          First time? <span style="color:var(--gold);cursor:pointer" onclick="renderSetupForm()">Create superadmin account</span>
        </p>
      </div>
    </div>`;
}

async function doAdminLogin() {
  const email    = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPass').value;
  const errEl    = document.getElementById('loginError');
  if (!email || !password) { errEl.textContent = 'Please enter email and password'; return; }
  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) { errEl.textContent = data.message || 'Invalid credentials'; return; }
    adminToken = data.token;
    adminUser  = data.admin;
    sessionStorage.setItem('efs_token', adminToken);
    sessionStorage.setItem('efs_admin', JSON.stringify(adminUser));
    renderAdminDashboard();
  } catch (err) {
    errEl.textContent = 'Login failed. Check your connection.';
  }
}

// ── FIRST-TIME SETUP FORM ─────────────────────────────────────────
function renderSetupForm() {
  document.getElementById('adminBody').innerHTML = `
    <div class="admin-login">
      <div class="login-card" style="max-width:480px">
        <h2>First Time Setup</h2>
        <p>Create your superadmin account</p>
        <div class="form-group" style="text-align:left">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input" id="setupName" placeholder="Your name">
        </div>
        <div class="form-group" style="text-align:left">
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="setupEmail" placeholder="admin@efs.com">
        </div>
        <div class="form-group" style="text-align:left">
          <label class="form-label">Password</label>
          <input type="password" class="form-input" id="setupPass" placeholder="Min 6 characters">
        </div>
        <div class="login-error" id="setupError"></div>
        <button class="login-btn" onclick="doSetup()">Create Account</button>
        <p style="font-size:11px;color:var(--gray);margin-top:12px;text-align:center;cursor:pointer" onclick="renderAdminLogin()">← Back to login</p>
      </div>
    </div>`;
}

async function doSetup() {
  const name     = document.getElementById('setupName').value.trim();
  const email    = document.getElementById('setupEmail').value.trim();
  const password = document.getElementById('setupPass').value;
  const errEl    = document.getElementById('setupError');
  if (!name || !email || !password) { errEl.textContent = 'All fields required'; return; }
  try {
    const res  = await fetch(`${API}/admins/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!data.success) { errEl.textContent = data.message; return; }
    showToast('Superadmin created! Please log in.');
    renderAdminLogin();
  } catch { errEl.textContent = 'Setup failed. Check your connection.'; }
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────
async function renderAdminDashboard() {
  const body = document.getElementById('adminBody');

  // Show action buttons
  document.getElementById('exportBtn').style.display = 'inline-block';
  if (adminUser?.role === 'superadmin') {
    document.getElementById('seedBtn').style.display = 'inline-block';
  }

  body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
      <div>
        <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gray)">Signed in as</div>
        <div style="font-size:16px;color:var(--white)">${adminUser?.name || 'Admin'} <span class="role-badge role-${adminUser?.role}">${adminUser?.role}</span></div>
      </div>
      <button onclick="adminLogout()" style="background:none;border:1px solid rgba(192,57,43,0.3);color:var(--red);padding:7px 16px;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:'Montserrat',sans-serif;border-radius:2px;transition:all 0.2s" onmouseover="this.style.background='rgba(192,57,43,0.1)'" onmouseout="this.style.background='none'">Sign Out</button>
    </div>

    <div class="admin-tabs">
      <button class="admin-tab active" onclick="switchTab('orders',this)">Orders</button>
      ${adminUser?.role === 'superadmin' ? `<button class="admin-tab" onclick="switchTab('admins',this)">Manage Admins</button>` : ''}
      <button class="admin-tab" onclick="switchTab('profile',this)">My Profile</button>
    </div>

    <div id="adminTabContent"><div class="loading-state"><div class="loading-spinner"></div></div></div>`;

  loadOrdersTab();
}

function switchTab(tab, btn) {
  currentAdminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (tab === 'orders')  loadOrdersTab();
  if (tab === 'admins')  loadAdminsTab();
  if (tab === 'profile') loadProfileTab();
}

// ── ORDERS TAB ────────────────────────────────────────────────────
async function loadOrdersTab() {
  const content = document.getElementById('adminTabContent');
  content.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div></div>`;
  try {
    const [statsRes, ordersRes] = await Promise.all([
      fetch(`${API}/orders/stats`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      fetch(`${API}/orders`,       { headers: { Authorization: `Bearer ${adminToken}` } })
    ]);
    if (statsRes.status === 401) { adminLogout(); return; }
    const { stats }  = await statsRes.json();
    const { orders } = await ordersRes.json();
    window._adminOrders = orders;

    content.innerHTML = `
      <div class="admin-stats">
        <div class="stat-card">
          <div class="stat-label">Total Orders</div>
          <div class="stat-value">${stats.totalOrders || 0}</div>
          <div class="stat-sub">All time</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Revenue</div>
          <div class="stat-value">R ${(stats.revenue || 0).toLocaleString('en-ZA',{maximumFractionDigits:0})}</div>
          <div class="stat-sub">Total earned</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Items Sold</div>
          <div class="stat-value">${stats.itemsSold || 0}</div>
          <div class="stat-sub">Units</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">New Orders</div>
          <div class="stat-value" style="color:${(stats.newOrders||0)>0?'var(--green)':'var(--gold)'}">${stats.newOrders || 0}</div>
          <div class="stat-sub">Awaiting action</div>
        </div>
      </div>

      <div class="admin-section-title">Customer Orders</div>

      ${!orders.length
        ? `<div class="empty-state"><span class="empty-icon">📭</span>No orders yet. They will appear here when customers place orders.</div>`
        : `<div style="overflow-x:auto">
            <table class="orders-table">
              <thead><tr>
                <th>Order ID</th><th>Customer</th><th>Contact</th>
                <th>Address</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th>
              </tr></thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td style="color:var(--gold);font-weight:500;white-space:nowrap">${o.orderId}</td>
                    <td style="color:var(--white);white-space:nowrap">${o.customer.name}</td>
                    <td>
                      <div>📞 ${o.customer.phone}</div>
                      ${o.customer.email ? `<div style="color:var(--gray);font-size:11px">✉️ ${o.customer.email}</div>` : ''}
                    </td>
                    <td style="font-size:11px;max-width:160px">${o.customer.address}</td>
                    <td style="font-size:11px;max-width:180px">
                      ${o.items.map(i => `<div>${i.name} ×${i.qty}</div>`).join('')}
                      ${o.notes ? `<div style="color:var(--gray);font-size:10px;margin-top:3px;font-style:italic">${o.notes}</div>` : ''}
                    </td>
                    <td style="color:var(--gold);white-space:nowrap;font-weight:500">R ${o.total.toLocaleString()}</td>
                    <td style="font-size:10px;color:var(--gray);white-space:nowrap">${new Date(o.createdAt).toLocaleDateString('en-ZA')}</td>
                    <td>
                      <select class="status-select" onchange="updateStatus('${o._id}',this.value)">
                        ${['new','confirmed','processing','shipped','delivered','cancelled']
                          .map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`)
                          .join('')}
                      </select>
                    </td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>`
      }
      <div style="margin-top:24px">
        <button onclick="loadOrdersTab()" style="background:none;border:1px solid rgba(201,168,76,0.3);color:var(--gold);padding:7px 18px;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;font-family:'Montserrat',sans-serif;border-radius:2px;transition:all 0.2s" onmouseover="this.style.background='rgba(201,168,76,0.08)'" onmouseout="this.style.background='none'">↻ Refresh</button>
      </div>`;
  } catch (err) {
    content.innerHTML = `<div class="empty-state">Failed to load orders. Check your connection.</div>`;
  }
}

async function updateStatus(orderId, status) {
  try {
    await fetch(`${API}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status })
    });
    showToast(`Status updated to <strong>${status}</strong>`);
  } catch { showToast('Failed to update status'); }
}

// ── ADMINS TAB ────────────────────────────────────────────────────
async function loadAdminsTab() {
  const content = document.getElementById('adminTabContent');
  content.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div></div>`;
  try {
    const res  = await fetch(`${API}/admins`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const admins = data.admins;

    content.innerHTML = `
      <div class="admin-form">
        <h3>Create New Admin</h3>
        <div class="admin-grid">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="newAdminName" placeholder="Staff member name">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="newAdminEmail" placeholder="staff@efs.com">
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-input" id="newAdminPass" placeholder="Min 6 characters">
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <select class="form-input status-select" id="newAdminRole" style="background:var(--dark3)">
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
        </div>
        <button class="admin-btn-primary" onclick="createAdmin()">Create Admin Account</button>
        <div id="adminCreateMsg" style="font-size:12px;margin-top:10px;color:var(--green)"></div>
      </div>

      <div class="admin-section-title">All Admins (${admins.length})</div>
      <div style="overflow-x:auto">
        <table class="orders-table">
          <thead><tr>
            <th>Name</th><th>Email</th><th>Role</th>
            <th>Login Count</th><th>Last Login</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            ${admins.map(a => `
              <tr>
                <td style="color:var(--white)">${a.name}</td>
                <td>${a.email}</td>
                <td><span class="role-badge role-${a.role}">${a.role}</span></td>
                <td style="text-align:center">${a.loginCount || 0}</td>
                <td style="font-size:11px;color:var(--gray)">${a.lastLogin ? new Date(a.lastLogin).toLocaleDateString('en-ZA') : 'Never'}</td>
                <td><span class="o-status ${a.isActive ? 's-confirmed' : 's-cancelled'}">${a.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  ${a._id !== adminUser?._id ? `
                    <button class="admin-btn-danger" onclick="toggleAdmin('${a._id}','${a.name}',${!a.isActive})">${a.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button class="admin-btn-danger" onclick="deleteAdmin('${a._id}','${a.name}')" style="margin-left:6px;border-color:rgba(192,57,43,0.5)">Delete</button>
                  ` : `<span style="font-size:11px;color:var(--gray)">(You)</span>`}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    content.innerHTML = `<div class="empty-state">Failed to load admins: ${err.message}</div>`;
  }
}

async function createAdmin() {
  const name     = document.getElementById('newAdminName').value.trim();
  const email    = document.getElementById('newAdminEmail').value.trim();
  const password = document.getElementById('newAdminPass').value;
  const role     = document.getElementById('newAdminRole').value;
  const msg      = document.getElementById('adminCreateMsg');
  if (!name || !email || !password) { msg.style.color = 'var(--red)'; msg.textContent = 'All fields are required'; return; }
  try {
    const res  = await fetch(`${API}/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!data.success) { msg.style.color = 'var(--red)'; msg.textContent = data.message; return; }
    msg.style.color = 'var(--green)';
    msg.textContent = `✓ Admin "${name}" created successfully`;
    showToast(`Admin <strong>${name}</strong> created`);
    setTimeout(() => loadAdminsTab(), 1000);
  } catch { msg.style.color = 'var(--red)'; msg.textContent = 'Failed to create admin'; }
}

async function toggleAdmin(id, name, activate) {
  if (!confirm(`${activate ? 'Activate' : 'Deactivate'} admin "${name}"?`)) return;
  try {
    await fetch(`${API}/admins/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ isActive: activate })
    });
    showToast(`Admin ${activate ? 'activated' : 'deactivated'}`);
    loadAdminsTab();
  } catch { showToast('Failed to update admin'); }
}

async function deleteAdmin(id, name) {
  if (!confirm(`Delete admin "${name}"? This cannot be undone.`)) return;
  try {
    await fetch(`${API}/admins/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    showToast(`Admin deleted`);
    loadAdminsTab();
  } catch { showToast('Failed to delete admin'); }
}

// ── PROFILE TAB ───────────────────────────────────────────────────
function loadProfileTab() {
  const content = document.getElementById('adminTabContent');
  content.innerHTML = `
    <div class="admin-form" style="max-width:500px">
      <h3>Change Password</h3>
      <div class="form-group">
        <label class="form-label">Current Password</label>
        <input type="password" class="form-input" id="currPass" placeholder="Your current password">
      </div>
      <div class="form-group">
        <label class="form-label">New Password</label>
        <input type="password" class="form-input" id="newPass" placeholder="Min 6 characters">
      </div>
      <div class="form-group">
        <label class="form-label">Confirm New Password</label>
        <input type="password" class="form-input" id="confirmPass" placeholder="Repeat new password">
      </div>
      <div id="passMsg" style="font-size:12px;margin-bottom:8px;min-height:18px"></div>
      <button class="admin-btn-primary" onclick="changePassword()">Update Password</button>
    </div>

    <div class="admin-form" style="max-width:500px;margin-top:20px">
      <h3>Account Info</h3>
      <div style="font-size:13px;color:var(--gray-light);line-height:2">
        <div><strong style="color:var(--white)">Name:</strong> ${adminUser?.name}</div>
        <div><strong style="color:var(--white)">Email:</strong> ${adminUser?.email}</div>
        <div><strong style="color:var(--white)">Role:</strong> <span class="role-badge role-${adminUser?.role}">${adminUser?.role}</span></div>
      </div>
    </div>`;
}

async function changePassword() {
  const curr    = document.getElementById('currPass').value;
  const newP    = document.getElementById('newPass').value;
  const confirm = document.getElementById('confirmPass').value;
  const msg     = document.getElementById('passMsg');
  if (!curr || !newP) { msg.style.color = 'var(--red)'; msg.textContent = 'All fields required'; return; }
  if (newP !== confirm) { msg.style.color = 'var(--red)'; msg.textContent = 'Passwords do not match'; return; }
  if (newP.length < 6) { msg.style.color = 'var(--red)'; msg.textContent = 'Password must be at least 6 characters'; return; }
  try {
    const res  = await fetch(`${API}/auth/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ currentPassword: curr, newPassword: newP })
    });
    const data = await res.json();
    if (!data.success) { msg.style.color = 'var(--red)'; msg.textContent = data.message; return; }
    adminToken = data.token;
    sessionStorage.setItem('efs_token', adminToken);
    msg.style.color = 'var(--green)'; msg.textContent = '✓ Password changed successfully';
    showToast('Password updated');
    setTimeout(() => { document.getElementById('currPass').value = ''; document.getElementById('newPass').value = ''; document.getElementById('confirmPass').value = ''; }, 1500);
  } catch { msg.style.color = 'var(--red)'; msg.textContent = 'Failed to change password'; }
}

// ── MISC ADMIN ACTIONS ────────────────────────────────────────────
function adminLogout() {
  adminToken = null; adminUser = null;
  sessionStorage.removeItem('efs_token');
  sessionStorage.removeItem('efs_admin');
  document.getElementById('exportBtn').style.display = 'none';
  document.getElementById('seedBtn').style.display   = 'none';
  renderAdminLogin();
}

function exportCSV() {
  const orders = window._adminOrders || [];
  if (!orders.length) { showToast('No orders to export'); return; }
  const headers = ['Order ID','Name','Phone','Email','Address','Items','Total','Date','Status'];
  const rows = orders.map(o => [
    o.orderId,
    `"${o.customer.name}"`,
    o.customer.phone,
    o.customer.email || '',
    `"${o.customer.address}"`,
    `"${o.items.map(i => `${i.name} x${i.qty}`).join(', ')}"`,
    o.total,
    new Date(o.createdAt).toLocaleDateString('en-ZA'),
    o.status
  ]);
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `EFS_Orders_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  showToast('CSV exported');
}

async function seedProducts() {
  if (!confirm('This will reload all 36 products in the database. Continue?')) return;
  try {
    const res  = await fetch(`${API}/products/seed/all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) { showToast(`${data.count} products seeded successfully`); loadProducts(); }
    else showToast('Seed failed: ' + data.message);
  } catch { showToast('Seed failed. Check connection.'); }
}

// ═══════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── CLOSE MODALS ON ESCAPE ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDetail(); closeCheckout(); closeSuccess(); closeCart();
  }
});
