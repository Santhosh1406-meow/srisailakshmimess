const fs = require('fs');
const path = require('path');
const MenuItem = require('../models/MenuItem');
const { query, isDbConnected } = require('../config/db');

const DATA_DIR = path.join(__dirname, '../data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');

function rowToMenuItem(row) {
  if (!row) return null;
  return new MenuItem({
    id: row.id,
    name: row.name,
    tamilName: row.tamil_name,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    image: row.image,
    isVegetarian: row.is_vegetarian,
    isAvailable: row.is_available,
    isPopular: row.is_popular,
    rating: Number(row.rating),
    portion: row.portion
  });
}



/**
 * Authentic South Indian Menu Data Store for Sri Sai Lakshmi Mess
 * Curated with realistic descriptions, categories, pricing (₹), and images.
 */
const initialMenuItems = [
  // BREAKFAST
  new MenuItem({
    id: 'dish-01',
    name: 'South Indian Special Meals',
    tamilName: 'தென்னிந்திய சாப்பாடு',
    description: 'Traditional full meals served with steamed ponni rice, aromatic sambar, rasam, vatha kuzhambu, kootu, poriyal, appalam, curd, sweet payasam and pickle.',
    category: 'Meals',
    price: 100,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-Fp1bqwXmz1vcZud4i9gF6qloN9ECrLnT3xdg5VID7zGubM0Polualj0&s=10',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    portion: 'Unlimited Thali'
  }),
  new MenuItem({
    id: 'dish-02',
    name: 'Mini Meals',
    tamilName: 'மினி சாப்பாடு',
    description: 'A satisfying quick meal featuring Sambar Rice, Curd Rice, Poriyal, Appalam, and Sweet Payasam.',
    category: 'Meals',
    price: 90,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUWjgeYRn-XtjXnVSi-tUsdeJkso1LbVAuBRXIvJdghQ&s',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.7,
    portion: 'Single Combo'
  }),
  new MenuItem({
    id: 'dish-03',
    name: 'Ghee Podi Idli (2 Pcs)',
    tamilName: 'நெய் பொடி இட்லி',
    description: 'Steaming soft button idlis tossed generously in pure aromatic ghee and homemade spicy gunpowder (karam podi).',
    category: 'Breakfast',
    price: 30,
    image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/12/podi-idli.jpg',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    portion: '2 Pcs with 3 Chutneys & Sambar'
  }),
  new MenuItem({
    id: 'dish-04',
    name: 'Crispy Medu Vada (2 Pcs)',
    tamilName: 'மெது வடை',
    description: 'Golden fried crispy lentil vadas with crushed black peppercorns, curry leaves, and ginger. Served piping hot.',
    category: 'Breakfast',
    price: 15,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTMnVTp3tMewd-MyqwaiD-fitqeIlr8l5T8tIjHh-MjA&s',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.8,
    portion: '2 Pcs'
  }),
  new MenuItem({
    id: 'dish-05',
    name: 'Special Masala Dosa',
    tamilName: 'ஸ்பெஷல் மசாலா தோசை',
    description: 'Crispy golden crepe made from fermented batter, smeared with red spicy chutney and stuffed with spiced potato masala.',
    category: 'Breakfast',
    price: 50,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    portion: '1 Large Dosa'
  }),
  new MenuItem({
    id: 'dish-06',
    name: 'Ghee Roast Dosa',
    tamilName: 'நெய் ரோஸ்ட் தோசை',
    description: 'Thin, extra-crisp paper roast cone cooked in pure farm ghee, served with coconut chutney, tomato chutney, and hot sambar.',
    category: 'Breakfast',
    price: 65,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc_OTAuYImi6T7SRtK6Z_RXsXCNHA6dRzfYVopw44-fXAn-0aaZNarrTM&s=10',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    portion: '1 Large Cone Dosa'
  }),
  new MenuItem({
    id: 'dish-07',
    name: 'Hot Ven Pongal & Vada',
    tamilName: 'வெண் பொங்கல் வடை',
    description: 'Homestyle melting rice and yellow moong dal cooked with crushed peppercorns, cumin, cashews, and rich ghee with 1 crispy medu vada.',
    category: 'Breakfast',
    price: 60,
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 4.8,
    portion: '1 Bowl Pongal + 1 Vada'
  }),
  new MenuItem({
    id: 'dish-08',
    name: 'Poori Masala (3 Pcs)',
    tamilName: 'பூரி மசாலா',
    description: 'Fluffy, puffed golden wheat pooris served with tempered South Indian potato and onion masala (poori kizhangu).',
    category: 'Breakfast',
    price: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdRGHzSASpGo24yV4mCiiwYE-jnpaq9Tu_YzPO0rLVKw&s=10',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.7,
    portion: '3 Pcs with Kizhangu'
  }),
  new MenuItem({
    id: 'dish-09',
    name: 'Authentic Sambar Rice (Bisibelebath style)',
    tamilName: 'சாம்பார் சாதம்',
    description: 'Rice slow-cooked with drumstick, shallots, carrots, tamarind, freshly roasted spices and drizzled with ghee. Served with potato chips and pickle.',
    category: 'Meals',
    price: 50,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFMr9CEpO3GbTRPntPpGQdzWgoxyYIO_WM37Q28X1R0g&s=10',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.8,
    portion: 'Full Bowl'
  }),
  new MenuItem({
    id: 'dish-10',
    name: 'Tempered Curd Rice (Thayir Sadam)',
    tamilName: 'தயிர் சாதம்',
    description: 'Creamy curd rice tempered with mustard seeds, curry leaves, ginger, green chilies, pomegranate kernels and served with spicy mango pickle.',
    category: 'Meals',
    price: 30,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSblK8RO6NGU6_oJ1sSR1m1l2ty6l-bFnNcxwogKMJjVA&s=10',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.9,
    portion: 'Full Bowl'
  }),
  new MenuItem({
    id: 'dish-11',
    name: 'Tangy Lemon Rice / Variety Rice',
    tamilName: 'எலுமிச்சை சாதம்',
    description: 'Basmati/Ponni rice infused with fresh lemon juice, roasted peanuts, turmeric, mustard seeds, and curry leaves.',
    category: 'Meals',
    price: 40,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqdOlvEGSzmRQTxKe5cBvPYX-MFLIuxHa6OMEW5Vg6sw&s=10',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.6,
    portion: 'Full Bowl'
  }),
  new MenuItem({
    id: 'dish-12',
    name: 'Traditional Kumbakonam Degree Coffee',
    tamilName: 'கும்பகோணம் டிகிரி காபி',
    description: 'Freshly brewed decoction using chicory-blend beans mixed with thick unadulterated cow milk and frothed in traditional brass davarah-tumbler.',
    category: 'Beverages',
    price: 20,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: true,
    rating: 5.0,
    portion: 'Davarah Tumbler'
  }),
  new MenuItem({
    id: 'dish-13',
    name: 'Masala Ginger Cardamom Tea',
    tamilName: 'இஞ்சி ஏலக்காய் டீ',
    description: 'Refreshing hot strong tea brewed with freshly pounded ginger, aromatic cardamom pods and rich whole milk.',
    category: 'Beverages',
    price: 25,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.8,
    portion: 'Hot Cup'
  }),
  new MenuItem({
    id: 'dish-14',
    name: 'Fresh Mosambi / Lemon Mint Juice',
    tamilName: 'புத்துணர்ச்சி பழச்சாறு',
    description: 'Freshly squeezed sweet lime juice with a touch of rock salt, fresh mint leaves, and cooling ice cubes.',
    category: 'Beverages',
    price: 40,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.7,
    portion: '300ml Glass'
  }),
  new MenuItem({
    id: 'dish-15',
    name: 'Spiced Buttermilk (Neer Mor)',
    tamilName: 'நீர் மோர்',
    description: 'Traditional cooling churned buttermilk blended with roasted cumin powder, crushed ginger, green chili, and fresh coriander.',
    category: 'Beverages',
    price: 20,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isAvailable: true,
    isPopular: false,
    rating: 4.9,
    portion: 'Clay Cup / Glass'
  })
];

class MenuService {
  constructor() {
    this.menu = [];
    this._initStorage();
  }

  _initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(MENU_FILE)) {
        const raw = fs.readFileSync(MENU_FILE, 'utf-8');
        const parsed = JSON.parse(raw || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.menu = parsed.map((item) => new MenuItem(item));
          return;
        }
      }
      // First run: seed with hardcoded items and persist
      this.menu = [...initialMenuItems];
      this._persist();
    } catch (err) {
      console.warn('[MenuService] Could not load persisted menu, using defaults:', err.message);
      this.menu = [...initialMenuItems];
    }
  }

  _persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(MENU_FILE, JSON.stringify(this.menu, null, 2), 'utf-8');
    } catch (err) {
      console.error('[MenuService] Failed to persist menu:', err.message);
    }
  }

  async getAllMenuItems(filter = {}) {
    let items = [...this.menu];

    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM menu_items ORDER BY id ASC');
        if (res && res.rows && res.rows.length > 0) {
          items = res.rows.map(rowToMenuItem);
        }
      } catch (err) {
        console.error('[MenuService] Error querying menu_items in Neon DB:', err.message);
      }
    }

    if (filter.category && filter.category.toLowerCase() !== 'all') {
      items = items.filter(
        (item) => item.category.toLowerCase() === filter.category.toLowerCase()
      );
    }

    if (filter.isPopular === true || filter.isPopular === 'true') {
      items = items.filter((item) => item.isPopular);
    }

    if (filter.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.tamilName && item.tamilName.toLowerCase().includes(q))
      );
    }

    return items;
  }

  async getMenuItemById(id) {
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM menu_items WHERE id = $1 LIMIT 1', [id]);
        if (res && res.rows.length > 0) {
          return rowToMenuItem(res.rows[0]);
        }
      } catch (err) {
        console.error('[MenuService] Error querying menu_item by id:', err.message);
      }
    }
    const item = this.menu.find((m) => m.id === id);
    return item || null;
  }

  async getCategories() {
    const all = await this.getAllMenuItems();
    const categories = ['All', ...new Set(all.map((m) => m.category))];
    return categories;
  }

  /** Admin: Add a new menu item */
  async addMenuItem(data) {
    const newItem = new MenuItem({
      ...data,
      id: data.id || `dish-${Date.now()}`
    });

    if (isDbConnected()) {
      try {
        await query(`
          INSERT INTO menu_items (id, name, tamil_name, description, category, price, image, is_vegetarian, is_available, is_popular, rating, portion)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            tamil_name = EXCLUDED.tamil_name,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            image = EXCLUDED.image,
            is_vegetarian = EXCLUDED.is_vegetarian,
            is_available = EXCLUDED.is_available,
            is_popular = EXCLUDED.is_popular,
            rating = EXCLUDED.rating,
            portion = EXCLUDED.portion,
            updated_at = CURRENT_TIMESTAMP
        `, [
          newItem.id,
          newItem.name,
          newItem.tamilName,
          newItem.description,
          newItem.category,
          newItem.price,
          newItem.image,
          newItem.isVegetarian,
          newItem.isAvailable,
          newItem.isPopular,
          newItem.rating,
          newItem.portion
        ]);
      } catch (err) {
        console.error('[MenuService] Error inserting menu item into Neon DB:', err.message);
      }
    }

    this.menu.push(newItem);
    this._persist();
    return newItem;
  }

  /** Admin: Update an existing menu item */
  async updateMenuItem(id, updates) {
    if (isDbConnected()) {
      try {
        const fields = [];
        const vals = [];
        let idx = 1;
        if (updates.name !== undefined) { fields.push(`name = $${idx++}`); vals.push(updates.name); }
        if (updates.tamilName !== undefined) { fields.push(`tamil_name = $${idx++}`); vals.push(updates.tamilName); }
        if (updates.description !== undefined) { fields.push(`description = $${idx++}`); vals.push(updates.description); }
        if (updates.category !== undefined) { fields.push(`category = $${idx++}`); vals.push(updates.category); }
        if (updates.price !== undefined) { fields.push(`price = $${idx++}`); vals.push(Number(updates.price)); }
        if (updates.image !== undefined) { fields.push(`image = $${idx++}`); vals.push(updates.image); }
        if (updates.isVegetarian !== undefined) { fields.push(`is_vegetarian = $${idx++}`); vals.push(Boolean(updates.isVegetarian)); }
        if (updates.isAvailable !== undefined) { fields.push(`is_available = $${idx++}`); vals.push(Boolean(updates.isAvailable)); }
        if (updates.isPopular !== undefined) { fields.push(`is_popular = $${idx++}`); vals.push(Boolean(updates.isPopular)); }
        if (updates.rating !== undefined) { fields.push(`rating = $${idx++}`); vals.push(Number(updates.rating)); }
        if (updates.portion !== undefined) { fields.push(`portion = $${idx++}`); vals.push(updates.portion); }
        if (fields.length > 0) {
          fields.push(`updated_at = CURRENT_TIMESTAMP`);
          vals.push(id);
          await query(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${idx}`, vals);
        }
      } catch (err) {
        console.error('[MenuService] Error updating menu item in Neon DB:', err.message);
      }
    }

    const idx = this.menu.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const existing = this.menu[idx];
      this.menu[idx] = new MenuItem({ ...existing, ...updates, id: existing.id });
      this._persist();
      return this.menu[idx];
    }
    return null;
  }

  /** Admin: Delete a menu item */
  async deleteMenuItem(id) {
    if (isDbConnected()) {
      try {
        await query('DELETE FROM menu_items WHERE id = $1', [id]);
      } catch (err) {
        console.error('[MenuService] Error deleting menu item from Neon DB:', err.message);
      }
    }

    const idx = this.menu.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.menu.splice(idx, 1);
    this._persist();
    return true;
  }
}

module.exports = new MenuService();
