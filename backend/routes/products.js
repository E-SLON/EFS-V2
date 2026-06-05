const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { tag, gender, search } = req.query;
    const filter = { inStock: true };
    if (tag && tag !== 'all') filter.tag = tag;
    if (gender && gender !== 'all') filter.gender = gender;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const products = await Product.find(filter).sort({ productId: 1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ productId: Number(req.params.id) });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// PATCH /api/products/:id — admin
router.patch('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { productId: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/seed/all — admin superadmin
router.post('/seed/all', protect, restrictTo('superadmin', 'admin'), async (req, res) => {
  try {
    const products = [
      // ─── WOMEN'S COLLECTION ──────────────────────────────────────────
      {
        productId: 1, name: "Dior J'adore", brand: "Christian Dior",
        price: 1599.99, originalPrice: 5300, size: "100ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "A timeless, radiant, and ultra-feminine fragrance that embodies luxury and sensual elegance. It celebrates the beauty of flowers in a luminous bouquet, designed for the woman who is confident, graceful, and effortlessly glamorous.",
        topNotes: "Pear, Melon, Peach, Bergamot, Mandarin Orange",
        heartNotes: "Jasmine, Rose, Lily of the Valley, Freesia, Orchid, Plum, Violet",
        baseNotes: "Musk, Vanilla, Cedar, Blackberry",
        occasion: "Evening events & special occasions", icon: "💛",
        imageFile: "image3.jpg", featured: true
      },
      {
        productId: 2, name: "Olympea EDP", brand: "Paco Rabanne",
        price: 1299.99, originalPrice: 4700, size: "80ml",
        tag: "oriental", tagLabel: "Oriental", gender: "women",
        description: "Empowering, elegant, and radiant. Opens with a fresh, luminous blend of green mandarin, water jasmine, and ginger flower. The heart reveals warm, creamy vanilla and salted caramel. As it settles, cashmere wood and ambergris provide a long-lasting, alluring trail.",
        topNotes: "Green Mandarin, Jasmine, Ginger Flower",
        heartNotes: "Vanilla, Salted Caramel",
        baseNotes: "Cashmere Wood, Ambergris",
        occasion: "Day-to-night wear, evening events", icon: "⚡",
        imageFile: "image4.jpeg", featured: true
      },
      {
        productId: 3, name: "Good Girl EDP", brand: "Carolina Herrera",
        price: 1399.99, originalPrice: 4000, size: "80ml",
        tag: "gourmand", tagLabel: "Gourmand", gender: "women",
        description: "A daring and sophisticated fragrance celebrating the duality of modern femininity — the sweet and the seductive. A sensual blend of luminous white florals wrapped in rich, dark gourmand notes. Opens with an energizing kick of coffee and almond, melts into jasmine and tuberose, settles into tonka bean, cocoa, and vanilla.",
        topNotes: "Almond, Coffee, Bergamot, Lemon",
        heartNotes: "Jasmine Sambac, Tuberose, Bulgarian Rose, Orange Blossom",
        baseNotes: "Tonka Bean, Cacao, Vanilla, Sandalwood, Praline",
        occasion: "Evening wear & bold statements", icon: "👠",
        imageFile: "image5.jpeg", featured: true
      },
      {
        productId: 4, name: "Club de Nuit Women", brand: "Armaf",
        price: 1299.99, originalPrice: 4200, size: "105ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "Sophisticated, luminous, and sensual. A rich blend of fruit, florals, and warm base notes. Opens with a juicy burst of citrus and peach. The heart reveals a feminine bouquet of rose and jasmine, enriched with the sweetness of litchi. The base lingers warmly with patchouli, creamy vanilla, and soft musk.",
        topNotes: "Orange, Grapefruit, Bergamot, Peach",
        heartNotes: "Rose, Jasmine, Geranium, Litchi",
        baseNotes: "Patchouli, Vanilla, Musk, Vetiver",
        occasion: "Evening glamour & special occasions", icon: "💎",
        imageFile: "image6.jpeg"
      },
      {
        productId: 5, name: "Chance EDP", brand: "Chanel",
        price: 1499.99, originalPrice: 4500, size: "100ml",
        tag: "fresh", tagLabel: "Fresh", gender: "women",
        description: "A radiant, youthful, and elegant fragrance embodying spontaneity and optimism. Sparkling and fresh with a slightly spicy opening from pink pepper. Soft, romantic florals at the heart bring femininity and charm. The base is sensual, warm, and elegant with patchouli and vanilla.",
        topNotes: "Pink Pepper, Lemon, Pineapple",
        heartNotes: "Jasmine, Hyacinth, Iris",
        baseNotes: "Patchouli, Musk, Vanilla, Vetiver",
        occasion: "Everyday luxury & romantic occasions", icon: "🌸",
        imageFile: "image7.jpeg", featured: true
      },
      {
        productId: 6, name: "Light Blue EDT", brand: "Dolce & Gabbana",
        price: 1299.99, originalPrice: 4300, size: "100ml",
        tag: "fresh", tagLabel: "Fresh", gender: "women",
        description: "Fresh, vibrant, and effortlessly chic. Captures the essence of a sunny Mediterranean summer. Opens with a sparkling burst of Sicilian lemon, crisp apple, and cedar. The heart reveals delicate bamboo, jasmine, and white rose. Warm amber, cedarwood, and musk create a sensual, lingering finish.",
        topNotes: "Sicilian Lemon, Apple, Cedar",
        heartNotes: "Bamboo, Jasmine, White Rose",
        baseNotes: "Amber, Cedarwood, Musk",
        occasion: "Daytime wear, summer, casual elegance", icon: "🌊",
        imageFile: "image8.jpeg"
      },
      {
        productId: 7, name: "Lady Million EDP", brand: "Paco Rabanne",
        price: 1499.99, originalPrice: 4800, size: "80ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "Glamorous, bold, and ultra-feminine. Inspired by gold and extravagance. Opens with sparkling fruity-citrus freshness. Evolves into a lavish bouquet of white florals. Dries down to a sweet, warm, and sensual mix of honey and amber wrapped in patchouli. The diamond-shaped golden bottle reflects its spirit: radiant, luxurious, irresistible.",
        topNotes: "Neroli, Bitter Orange, Raspberry",
        heartNotes: "Jasmine Sambac, Orange Blossom, Gardenia",
        baseNotes: "Honey, Amber, Patchouli",
        occasion: "Nights out & luxury moments", icon: "💰",
        imageFile: "image9.jpeg"
      },
      {
        productId: 8, name: "Be Delicious EDP", brand: "DKNY",
        price: 1199.99, originalPrice: 3600, size: "100ml",
        tag: "fresh", tagLabel: "Fresh", gender: "women",
        description: "Fresh, vibrant, and playful. Captures the essence of New York City energy. Opens with a refreshing burst of crisp apple, cucumber, and grapefruit. The heart blossoms into a feminine floral bouquet. Settles into a smooth, warm, woody-ambery base. The iconic apple-shaped bottle reflects its character — fresh, delicious, and irresistibly tempting.",
        topNotes: "Green Apple, Cucumber, Grapefruit, Magnolia",
        heartNotes: "Tuberose, Lily of the Valley, Rose, Violet",
        baseNotes: "Sandalwood, White Amber, Woods",
        occasion: "Everyday freshness & city life", icon: "🍏",
        imageFile: "image10.jpeg"
      },
      // ─── UNISEX / OUD ────────────────────────────────────────────────
      {
        productId: 9, name: "Oud Ispahan EDP", brand: "Christian Dior",
        price: 1599.99, originalPrice: 5000, size: "75ml",
        tag: "oud", tagLabel: "Oud", gender: "unisex",
        description: "An opulent, sophisticated oriental fragrance celebrating the meeting of East and West. A rich, resinous opening quickly unveils the dark, mysterious character of oud. The heart is dominated by a lush, velvety Damascus rose. The base is smoky, woody, and long-lasting — perfect for evenings of depth, confidence, and mystery.",
        topNotes: "Labdanum",
        heartNotes: "Damascus Rose",
        baseNotes: "Agarwood (Oud), Sandalwood, Patchouli, Cedar",
        occasion: "Evening wear & bold occasions", icon: "🌹",
        imageFile: "image11.jpeg", featured: true
      },
      {
        productId: 10, name: "Baccarat Rouge 540", brand: "Maison Francis Kurkdjian",
        price: 1699.99, originalPrice: 4500, size: "70ml",
        tag: "oriental", tagLabel: "Oriental", gender: "unisex",
        description: "Luxurious, radiant, and unforgettable. Opens with a luminous blend of saffron and jasmine. The heart unveils amberwood and ambergris, adding warmth and addictive sensuality. Settles into cedarwood and fir resin. Designed for both men and women — versatile, captivating, and unmistakably iconic.",
        topNotes: "Saffron, Jasmine",
        heartNotes: "Amberwood, Ambergris",
        baseNotes: "Cedarwood, Fir Resin",
        occasion: "Formal events, day-to-night luxury", icon: "✨",
        imageFile: "image22.jpeg", featured: true
      },
      // ─── MEN'S COLLECTION ─────────────────────────────────────────────
      {
        productId: 11, name: "Boss Bottled EDT", brand: "Hugo Boss",
        price: 1299.99, originalPrice: 4200, size: "100ml",
        tag: "woody", tagLabel: "Woody", gender: "men",
        description: "Timeless and sophisticated — a modern classic embodying confidence and success. Opens with a fresh and fruity burst of apple and citrus. The heart reveals a warm, spicy blend of geranium, cinnamon, and cloves. Settles into a smooth trail of sandalwood, cedarwood, vetiver, and vanilla. Versatile for business and leisure, day or night.",
        topNotes: "Apple, Citrus",
        heartNotes: "Geranium, Cinnamon, Cloves",
        baseNotes: "Sandalwood, Cedarwood, Vetiver, Vanilla",
        occasion: "Office, everyday wear & evening", icon: "💼",
        imageFile: "image13.jpeg"
      },
      {
        productId: 12, name: "Boss Bottled Unlimited EDT", brand: "Hugo Boss",
        price: 1399.99, originalPrice: 4500, size: "100ml",
        tag: "fresh", tagLabel: "Fresh", gender: "men",
        description: "Fresh, dynamic, and full of energy. Opens with an invigorating blend of iced violet leaves, mint, and grapefruit. The heart introduces a vibrant mix of pineapple, rose, and cinnamon. A refined base of sandalwood, musk, and labdanum leaves a smooth, masculine trail that lasts.",
        topNotes: "Mint, Violet Leaf, Grapefruit",
        heartNotes: "Pineapple, Rose, Cinnamon",
        baseNotes: "Sandalwood, Musk, Labdanum",
        occasion: "Daytime wear, office, casual confidence", icon: "🌬️",
        imageFile: "image14.jpeg"
      },
      {
        productId: 13, name: "Only The Brave Tattoo EDT", brand: "Diesel",
        price: 1199.99, originalPrice: 3900, size: "75ml",
        tag: "woody", tagLabel: "Woody", gender: "men",
        description: "Edgy, bold, and irresistibly daring — for the man who isn't afraid to make his mark. Opens with a vibrant burst of apple and mandarin. The heart reveals a spicy fusion of sage, pepper, and bourbon pepper. Settles into a sensual base of amberwood, tobacco, and patchouli. Just like a tattoo — a symbol of identity and unforgettable presence.",
        topNotes: "Apple, Mandarin",
        heartNotes: "Sage, Pepper, Bourbon Pepper",
        baseNotes: "Amberwood, Tobacco, Patchouli",
        occasion: "Nightlife, casual evenings, everyday confidence", icon: "🔱",
        imageFile: "image15.jpeg"
      },
      {
        productId: 14, name: "Gucci Guilty Homme EDT", brand: "Gucci",
        price: 1499.99, originalPrice: 4600, size: "90ml",
        tag: "woody", tagLabel: "Woody", gender: "men",
        description: "Seductive, daring, and unmistakably modern. Opens with a fresh and zesty burst of lemon and lavender. The heart reveals a warm, spicy blend of orange blossom and neroli. Settles into a sensual base of cedarwood, patchouli, and incense. The perfect balance of freshness, warmth, and masculinity.",
        topNotes: "Lemon, Lavender",
        heartNotes: "Orange Blossom, Neroli",
        baseNotes: "Cedarwood, Patchouli, Incense",
        occasion: "Evening wear, dates, special occasions", icon: "🖤",
        imageFile: "image16.jpeg"
      },
      {
        productId: 15, name: "Club De Nuit Intense Man EDT", brand: "Armaf",
        price: 1299.99, originalPrice: 4500, size: "105ml",
        tag: "woody", tagLabel: "Woody", gender: "men",
        description: "Confident, bold, and sophisticated — a modern classic with striking presence. Opens with a sharp, vibrant burst of lemon, blackcurrant, apple, bergamot, and pineapple. The heart blends rose, jasmine, and birch — smoky, floral-spicy depth. A long-lasting base of musk, ambergris, vanilla, and patchouli leaves a captivating, masculine trail.",
        topNotes: "Lemon, Blackcurrant, Apple, Bergamot, Pineapple",
        heartNotes: "Rose, Jasmine, Birch",
        baseNotes: "Musk, Ambergris, Vanilla, Patchouli",
        occasion: "Everyday wear & special occasions", icon: "🌃",
        imageFile: "image17.jpeg", featured: true
      },
      // ─── ARABIC / DUBAI COLLECTION ────────────────────────────────────
      {
        productId: 16, name: "Intense Noir", brand: "Exclusive",
        price: 699.99, originalPrice: 1400, size: "50ml",
        tag: "oriental", tagLabel: "Oriental", gender: "unisex",
        description: "Sophisticated and seductive. Opens with fresh bergamot and aromatic herbs like clary sage and rosemary. The heart unfolds with warm cardamom, soft lavender, and orange blossom. A smooth base of vanilla, amber wood, vetiver, and musk lingers on the skin — rich, mysterious, and long-lasting.",
        topNotes: "Bergamot, Clary Sage, Rosemary",
        heartNotes: "Cardamom, Lavender, Orange Blossom",
        baseNotes: "Vanilla, Amber Wood, Vetiver, Musk",
        occasion: "Evening wear & special occasions", icon: "🖤",
        imageFile: "image30.png"
      },
      {
        productId: 17, name: "Hayaati EDP", brand: "Lattafa",
        price: 599.99, originalPrice: 1800, size: "50ml",
        tag: "fresh", tagLabel: "Fresh", gender: "unisex",
        description: "Modern and uplifting. Opens with fresh apple and citrus blended with spicy ginger and bergamot. The heart is smooth and elegant with sage, lavender, and warm spices. The base brings depth with amber, musk, cedar, and patchouli. Versatile for day and night.",
        topNotes: "Apple, Citrus, Ginger, Bergamot",
        heartNotes: "Sage, Lavender, Warm Spices",
        baseNotes: "Amber, Musk, Cedar, Patchouli",
        occasion: "Day and night — versatile", icon: "✨",
        imageFile: "image31.png"
      },
      {
        productId: 18, name: "DES Tentations EDP", brand: "Exclusive",
        price: 599.99, originalPrice: 1700, size: "50ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "Playful yet sophisticated floral-fruity fragrance. Bursts open with juicy berries and fresh citrus, before revealing a heart of rose, jasmine, and delicate white flowers. The base is sensual and creamy with vanilla, musk, and soft woods. Feminine, romantic, and radiant.",
        topNotes: "Berries, Citrus",
        heartNotes: "Rose, Jasmine, White Flowers",
        baseNotes: "Vanilla, Musk, Soft Woods",
        occasion: "Daytime wear & special moments", icon: "🌸",
        imageFile: "image32.png"
      },
      {
        productId: 19, name: "White Oud", brand: "Exclusive",
        price: 649, originalPrice: 1800, size: "50ml",
        tag: "oud", tagLabel: "Oud", gender: "unisex",
        description: "A refined take on traditional oud, balancing its deep resinous character with softness and light. Fresh citrus and subtle florals open the scent. A heart of powdery jasmine and velvety rose follows. The oud base is creamy and elegant, blended with amber, vanilla, and musk. Perfect for those who prefer oud gentle and modern.",
        topNotes: "Citrus, Subtle Florals",
        heartNotes: "Powdery Jasmine, Velvety Rose",
        baseNotes: "Oud, Amber, Vanilla, Musk",
        occasion: "Modern oud lovers — gentle & wearable", icon: "🤍",
        imageFile: "image33.png"
      },
      {
        productId: 20, name: "Sutoor EDP", brand: "Exclusive",
        price: 699, originalPrice: 1900, size: "50ml",
        tag: "fresh", tagLabel: "Fresh", gender: "unisex",
        description: "Vibrant, fresh, and invigorating. Opens with bright citrus, juicy apple, and herbal nuances. The heart develops into aromatic lavender, spicy cardamom, and a touch of nutmeg. Amberwood, musk, and cedar in the base bring warmth. A versatile daily fragrance — clean, fresh, and effortlessly stylish.",
        topNotes: "Citrus, Juicy Apple, Herbs",
        heartNotes: "Lavender, Cardamom, Nutmeg",
        baseNotes: "Amberwood, Musk, Cedar",
        occasion: "Daily wear — clean & stylish", icon: "💨",
        imageFile: "image34.png"
      },
      {
        productId: 21, name: "Badee Al Oud Honor & Glory", brand: "Lattafa",
        price: 699.99, originalPrice: 1800, size: "100ml",
        tag: "oud", tagLabel: "Oud", gender: "unisex",
        description: "Bold, intense, and made for true oud enthusiasts. Opens with smoky oud, earthy spices, and saffron — a commanding presence. The heart reveals rose, amber, and incense. The base lingers with agarwood, musk, and patchouli — strong, dark, and unforgettable. Ideal for nights when you want to leave a lasting impression.",
        topNotes: "Smoky Oud, Saffron, Spices",
        heartNotes: "Rose, Amber, Incense",
        baseNotes: "Agarwood, Musk, Patchouli",
        occasion: "Nights out — powerful projection", icon: "👑",
        imageFile: "image35.png", featured: true
      },
      {
        productId: 22, name: "Badee Al Oud Sublime", brand: "Lattafa",
        price: 599.99, originalPrice: 1700, size: "100ml",
        tag: "oud", tagLabel: "Oud", gender: "unisex",
        description: "A smoother, slightly sweeter interpretation of the Badee Al Oud line. Opens with juicy fruits and fresh citrus, balanced by floral heart notes of rose and jasmine. The oud base is softened with vanilla, tonka bean, and amber — warm and creamy. A more approachable oud fragrance — elegant, versatile, and modern.",
        topNotes: "Juicy Fruits, Citrus",
        heartNotes: "Rose, Jasmine",
        baseNotes: "Oud, Vanilla, Tonka Bean, Amber",
        occasion: "Approachable oud — elegant & versatile", icon: "🌙",
        imageFile: "image36.png"
      },
      {
        productId: 23, name: "Rave Now EDP", brand: "Lattafa",
        price: 499.99, originalPrice: 1500, size: "100ml",
        tag: "fresh", tagLabel: "Fresh", gender: "unisex",
        description: "Youthful, energetic, and playful. Opens with zesty citrus and sweet fruits bursting with vibrancy. The heart reveals light florals and a touch of spice. The base adds depth with amber, vanilla, and soft musk. A fun everyday fragrance — ideal for younger wearers or casual occasions.",
        topNotes: "Citrus, Sweet Fruits",
        heartNotes: "Light Florals, Spice",
        baseNotes: "Amber, Vanilla, Musk",
        occasion: "Everyday casual wear", icon: "⚡",
        imageFile: "image37.png"
      },
      {
        productId: 24, name: "Badee Al Oud for Glory", brand: "Lattafa",
        price: 649.99, originalPrice: 1700, size: "100ml",
        tag: "oud", tagLabel: "Oud", gender: "unisex",
        description: "Rich, smoky, and powerful — often compared to Initio Oud for Greatness. Opens with saffron, nutmeg, and lavender. The heart builds with natural oud and patchouli, creating intensity. The base of amber, musk, and woods ensures long-lasting depth. A statement-maker with strong projection.",
        topNotes: "Saffron, Nutmeg, Lavender",
        heartNotes: "Oud, Patchouli",
        baseNotes: "Amber, Musk, Woods",
        occasion: "Statement evenings — strong projection", icon: "🔥",
        imageFile: "image38.png"
      },
      {
        productId: 25, name: "Yara EDP", brand: "Lattafa",
        price: 599.99, originalPrice: 1600, size: "100ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "Soft, powdery, and elegant. Begins with bright citrus and delicate florals balanced with creamy orchid and heliotrope. Dries down into warm vanilla, musk, and sandalwood — silky and comforting. Versatile — youthful yet sophisticated, ideal for daily wear in all seasons.",
        topNotes: "Citrus, Delicate Florals",
        heartNotes: "Orchid, Heliotrope",
        baseNotes: "Vanilla, Musk, Sandalwood",
        occasion: "Daily wear — all seasons", icon: "🌸",
        imageFile: "image39.png"
      },
      {
        productId: 26, name: "Brown Orchid Purple", brand: "Brown Orchid",
        price: 599.99, originalPrice: 1700, size: "80ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "Rich, sweet, and sensual. Opens with fruity notes of berries and plum, wrapped in soft florals like jasmine and rose. The heart develops into smooth vanilla and tonka, with spices adding depth. The base of patchouli, amber, and musk ensures a warm, seductive finish. A glamorous evening scent.",
        topNotes: "Berries, Plum",
        heartNotes: "Jasmine, Rose, Vanilla, Tonka",
        baseNotes: "Patchouli, Amber, Musk",
        occasion: "Glamorous evenings", icon: "💜",
        imageFile: "image40.png"
      },
      {
        productId: 27, name: "Brown Orchid Ruby", brand: "Brown Orchid",
        price: 649.99, originalPrice: 1800, size: "80ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "Radiant and luxurious, with a sparkling fruity-floral opening. Pomegranate, citrus, and exotic flowers shine at the top, blending into a rich heart of rose, jasmine, and sweet gourmand tones. The dry-down brings smooth amber, musk, and vanilla — alluring and long-lasting. Feminine, elegant, and perfect for parties.",
        topNotes: "Pomegranate, Citrus, Exotic Flowers",
        heartNotes: "Rose, Jasmine, Gourmand",
        baseNotes: "Amber, Musk, Vanilla",
        occasion: "Parties, nights out & special occasions", icon: "❤️",
        imageFile: "image41.png"
      },
      {
        productId: 28, name: "Yara White EDP", brand: "Lattafa",
        price: 649.99, originalPrice: 1900, size: "100ml",
        tag: "gourmand", tagLabel: "Gourmand", gender: "women",
        description: "Soft, creamy, and powdery gourmand with a delicate elegant twist. Opens with juicy tangerine, coconut, and heliotrope. The heart blossoms with sweet vanilla orchid and jasmine. The base melts into smooth vanilla, musk, and sandalwood — a velvety, comforting trail. Feminine, youthful, and cozy.",
        topNotes: "Tangerine, Coconut, Heliotrope",
        heartNotes: "Vanilla Orchid, Jasmine",
        baseNotes: "Vanilla, Musk, Sandalwood",
        occasion: "Everyday sweet luxury", icon: "🤍",
        imageFile: "image42.png"
      },
      {
        productId: 29, name: "Brown Orchid Rose Edition", brand: "Brown Orchid",
        price: 699.99, originalPrice: 1900, size: "80ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "A luxurious floral-oriental fragrance celebrating roses in full bloom. Opens with sparkling citrus and fruity notes. At the heart lies an opulent bouquet of Turkish rose, jasmine, and soft peony — rich, velvety, and romantic. The base blends warm amber, vanilla, and smooth musk, leaving a sensual, long-lasting trail.",
        topNotes: "Citrus, Fruity Notes",
        heartNotes: "Turkish Rose, Jasmine, Peony",
        baseNotes: "Amber, Vanilla, Musk",
        occasion: "Evenings & romantic occasions", icon: "🌷",
        imageFile: "image43.png"
      },
      {
        productId: 30, name: "Paradox Rossa EDP", brand: "Exclusive",
        price: 599.99, originalPrice: 1700, size: "50ml",
        tag: "floral", tagLabel: "Floral", gender: "women",
        description: "A glowing ode to rose and amber, wrapped in sensual musk and refined woods. Opens with the golden richness of saffron accented by pink pepper and aldehydes. Plush damask rose and geranium bloom in the heart. The base reveals warm vetiver, cedar, leather, labdanum, and white amber — beautifully balanced and luxurious.",
        topNotes: "Saffron, Pink Pepper, Aldehydes",
        heartNotes: "Damask Rose, Geranium",
        baseNotes: "Vetiver, Cedar, Leather, Labdanum, White Amber",
        occasion: "Rich floral-woody elegance", icon: "🌹",
        imageFile: "image44.png"
      },
      {
        productId: 31, name: "Badee Al Oud Amethyst", brand: "Lattafa",
        price: 649.99, originalPrice: 1900, size: "100ml",
        tag: "oud", tagLabel: "Oud", gender: "women",
        description: "A rose-oud masterpiece with sweet, warm, and elegant facets. Opens with bright pink pepper and bergamot. The heart is rich and floral: Turkish Rose, Bulgarian Rose, and jasmine deliver a lush romantic bouquet. Creamy vanilla, golden amber, and smoky agarwood soften the florals — oud that supports the sweetness beautifully.",
        topNotes: "Pink Pepper, Bergamot",
        heartNotes: "Turkish Rose, Bulgarian Rose, Jasmine",
        baseNotes: "Vanilla, Golden Amber, Agarwood",
        occasion: "Special occasions & evening settings", icon: "💜",
        imageFile: "image45.png", featured: true
      },
      {
        productId: 32, name: "Amber Eve EDP", brand: "Barakkat",
        price: 649.99, originalPrice: 1800, size: "50ml",
        tag: "oriental", tagLabel: "Oriental", gender: "unisex",
        description: "A warm, golden embrace. Opens with rich resins and glowing amber, brightened by bitter orange. Creamy vanilla and benzoin melt into the heart, creating sweet resinous warmth. The base is deep and comforting with tonka bean, cedar, and amber.",
        topNotes: "Bitter Orange, Resins",
        heartNotes: "Vanilla, Benzoin",
        baseNotes: "Tonka Bean, Cedar, Amber",
        occasion: "Evening wear & colder seasons", icon: "🌅",
        imageFile: "image46.png"
      },
      {
        productId: 33, name: "Satin Oud EDP", brand: "Barakkat",
        price: 699.99, originalPrice: 1900, size: "50ml",
        tag: "oud", tagLabel: "Oud", gender: "unisex",
        description: "An opulent oud-rose masterpiece. Opens with soft violet and lush roses, enveloped in the richness of Laotian oud. The heart is velvety and intense, balancing deep floral notes with smoky agarwood. A base of amber, vanilla, and benzoin softens the oud into a luxurious trail.",
        topNotes: "Violet, Rose",
        heartNotes: "Laotian Oud, Agarwood",
        baseNotes: "Amber, Vanilla, Benzoin",
        occasion: "Formal occasions & statement moments", icon: "🌹",
        imageFile: "image47.png"
      },
      {
        productId: 34, name: "Ammerat Al Arab EDP", brand: "Ammerat",
        price: 749.99, originalPrice: 2000, size: "60ml",
        tag: "oriental", tagLabel: "Oriental", gender: "unisex",
        description: "Steeped in Middle Eastern charm. Opens with exotic spices and fresh citrus, evoking the vibrancy of Arabian souks. The heart reveals rose, jasmine, and saffron, woven with warm oud. The dry-down is resinous and powerful with amber, musk, and patchouli — intense and unforgettable.",
        topNotes: "Exotic Spices, Citrus",
        heartNotes: "Rose, Jasmine, Saffron, Oud",
        baseNotes: "Amber, Musk, Patchouli",
        occasion: "Evening occasions & oud lovers", icon: "🕌",
        imageFile: "image48.png"
      },
      {
        productId: 35, name: "Mocha Wood EDP", brand: "Exclusive",
        price: 649.99, originalPrice: 1700, size: "50ml",
        tag: "gourmand", tagLabel: "Gourmand", gender: "unisex",
        description: "A rich gourmand fragrance blending the warmth of roasted coffee with creamy chocolate and soft woods. The opening is a delicious mix of coffee beans and sweet cocoa layered with hints of spice. Smooth vanilla and tonka bean emerge in the heart, wrapped in sandalwood for depth.",
        topNotes: "Coffee Beans, Sweet Cocoa, Spices",
        heartNotes: "Vanilla, Tonka Bean",
        baseNotes: "Sandalwood, Musk",
        occasion: "Cozy occasions & evening wear", icon: "☕",
        imageFile: "image49.png"
      },
      {
        productId: 36, name: "White Rouge 540 EDP", brand: "Barakkat",
        price: 599.99, originalPrice: 1600, size: "50ml",
        tag: "fresh", tagLabel: "Fresh", gender: "unisex",
        description: "Crisp, elegant, and luminous. Opens with fresh citrus and delicate floral tones, leading into a soft, powdery heart of jasmine and lily. The dry-down introduces creamy musk, subtle woods, and a whisper of vanilla. Clean sophistication for everyday wear.",
        topNotes: "Citrus, Delicate Florals",
        heartNotes: "Jasmine, Lily",
        baseNotes: "Creamy Musk, Woods, Vanilla",
        occasion: "Daytime wear & business settings", icon: "🤍",
        imageFile: "image50.png"
      }
    ];
    await Product.deleteMany({});
    await Product.insertMany(products);
    res.json({ success: true, message: `${products.length} products seeded`, count: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
