import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

export const INITIAL_CATEGORIES = [
  { name: "Antiques & Collectibles", slug: "antiques-collectibles", icon: "Landmark", color: "amber" },
  { name: "Construction & Renovation", slug: "construction-renovation", icon: "Hammer", color: "orange" },
  { name: "Business & Industry", slug: "business-industry", icon: "Factory", color: "cyan" },
  { name: "Automotive & Vehicles", slug: "automotive-vehicles", icon: "Car", color: "red" },
  { name: "Real Estate", slug: "real-estate", icon: "Home", color: "yellow" },
  { name: "Jobs & Careers", slug: "jobs-careers", icon: "Briefcase", color: "stone" },
  { name: "Home & Garden", slug: "home-garden", icon: "Armchair", color: "blue" },
  { name: "Electronics", slug: "electronics", icon: "Smartphone", color: "pink" },
  { name: "Fashion & Apparel", slug: "fashion-apparel", icon: "Shirt", color: "indigo" },
  { name: "Agriculture & Farming", slug: "agriculture-farming", icon: "Tractor", color: "sky" },
  { name: "Pets & Animals", slug: "pets-animals", icon: "Dog", color: "emerald" },
  { name: "Baby & Kids", slug: "baby-kids", icon: "Baby", color: "rose" },
  { name: "Sports & Hobbies", slug: "sports-hobbies", icon: "Trophy", color: "slate" },
  { name: "Music & Education", slug: "music-education", icon: "Music", color: "blue" },
  { name: "Health & Beauty", slug: "health-beauty", icon: "Sparkles", color: "teal" },
  { name: "Services", slug: "services", icon: "Wrench", color: "orange" },
  { name: "Accommodations & Stays", slug: "accommodations-stays", icon: "Bed", color: "emerald" },
  { name: "Rentals & Hire", slug: "rentals-hire", icon: "CalendarCheck", color: "violet" },
  { name: "Free Stuff (Giveaway)", slug: "free-stuff", icon: "Gift", color: "teal" },
  { name: "Delivery Deals", slug: "delivery-deals", icon: "PackageCheck", color: "amber" },
  { name: "Books & Textbooks", slug: "books-textbooks", icon: "BookOpen", color: "yellow" },
  { name: "Auto Parts", slug: "auto-parts", icon: "Cog", color: "blue" },
  { name: "Machinery Parts", slug: "machinery-parts", icon: "Settings", color: "cyan" },
  { name: "Featured Employers", slug: "featured-employers", icon: "Users", color: "orange" },
  { name: "Auto Expo & Events", slug: "auto-expo-events", icon: "Compass", color: "blue" }
];

// In-memory fallbacks
const defaultAdminHash = bcrypt.hashSync("Admin2026!", 10);
const inMemoryUsers = [
  {
    id: 1,
    name: "Admin Deallyhub",
    email: "admin@deallyhub.com",
    password_hash: defaultAdminHash,
    role: "admin",
    created_at: new Date().toISOString()
  }
];
let nextUserId = 2;
const inMemoryAds = [];
let nextAdId = 1;
const inMemorySaved = [];
let nextSavedId = 1;
const inMemoryConversations = [];
let nextConvId = 1;
const inMemoryMessages = [];
let nextMsgId = 1;
const inMemoryNotifications = [];
let nextNotifId = 1;
const inMemoryNotificationReads = [];

let pool = null;

const dbConnectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (dbConnectionString) {
  const isProduction = process.env.NODE_ENV === "production" || dbConnectionString.includes("railway") || dbConnectionString.includes("postgres");
  pool = new Pool({
    connectionString: dbConnectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });
} else if (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE) {
  pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: { rejectUnauthorized: false }
  });
}

export async function initDb() {
  if (!pool) {
    console.log("No DATABASE_URL configured. Running with in-memory storage.");
    return;
  }

  try {
    const client = await pool.connect();
    try {
      // 1. Categories Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          icon VARCHAR(100) NOT NULL,
          color VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 3. Advertisements Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS advertisements (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          category_slug VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC(12, 2) NOT NULL DEFAULT 0,
          currency VARCHAR(10) NOT NULL DEFAULT 'USD',
          location VARCHAR(255) NOT NULL DEFAULT 'Entire Country',
          images TEXT[] NOT NULL DEFAULT '{}',
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Phone column migration
      await client.query(`
        ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      `);

      // 4. Saved Ads Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS saved_ads (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          ad_id INTEGER REFERENCES advertisements(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, ad_id)
        );
      `);

      // 5. Conversations Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          ad_id INTEGER REFERENCES advertisements(id) ON DELETE CASCADE,
          buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(ad_id, buyer_id)
        );
      `);

      // 6. Messages Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
          sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 7. Users role migration & admin accounts
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
      `);
      await client.query(`
        UPDATE users SET role = 'admin' WHERE email = 'jannowak@example.com' OR email = 'jannowaktester1@gmail.com' OR email LIKE 'jannowak%' OR email LIKE 'admin%' OR id = 1;
      `);

      // Seed dedicated super admin account: admin@deallyhub.com / Admin2026!
      const defaultAdminPass = await bcrypt.hash("Admin2026!", 10);
      await client.query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Admin Deallyhub', 'admin@deallyhub.com', $1, 'admin')
        ON CONFLICT (email) DO UPDATE SET role = 'admin', password_hash = $1;
      `, [defaultAdminPass]);

      // 8. Notifications Table (user_id NULL means broadcast to all users)
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'system',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 9. Notification Reads Table (tracks read status per user)
      await client.query(`
        CREATE TABLE IF NOT EXISTS notification_reads (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
          read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, notification_id)
        );
      `);

      // Seed categories if empty
      const { rows } = await client.query("SELECT COUNT(*) FROM categories");
      if (parseInt(rows[0].count, 10) === 0) {
        console.log("Seeding initial English categories into database...");
        for (const cat of INITIAL_CATEGORIES) {
          await client.query(
            "INSERT INTO categories (name, slug, icon, color) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING",
            [cat.name, cat.slug, cat.icon, cat.color]
          );
        }
        console.log("Database seeded successfully with 25 categories.");
      }
      console.log("Database connected and all tables verified (including conversations & messages).");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Database connection/init error:", err.message);
  }
}

export async function getCategories() {
  if (!pool) {
    return INITIAL_CATEGORIES.map((cat, idx) => ({ id: idx + 1, ...cat }));
  }

  try {
    const { rows } = await pool.query("SELECT id, name, slug, icon, color FROM categories ORDER BY id ASC");
    if (rows.length === 0) {
      return INITIAL_CATEGORIES.map((cat, idx) => ({ id: idx + 1, ...cat }));
    }
    return rows;
  } catch (err) {
    console.warn("Falling back to default categories:", err.message);
    return INITIAL_CATEGORIES.map((cat, idx) => ({ id: idx + 1, ...cat }));
  }
}

// User operations
export async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!pool) {
    const u = inMemoryUsers.find(user => user.email === normalizedEmail);
    if (!u) return null;
    const isAdm = u.role === "admin" || u.email.startsWith("jannowak") || u.email.startsWith("admin");
    return { ...u, role: isAdm ? "admin" : (u.role || "user") };
  }

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    if (!rows[0]) return null;
    const u = rows[0];
    const isAdm = u.role === "admin" || u.email.startsWith("jannowak") || u.email.startsWith("admin");
    return { ...u, role: isAdm ? "admin" : (u.role || "user") };
  } catch (err) {
    const u = inMemoryUsers.find(user => user.email === normalizedEmail);
    if (!u) return null;
    const isAdm = u.role === "admin" || u.email.startsWith("jannowak") || u.email.startsWith("admin");
    return { ...u, role: isAdm ? "admin" : (u.role || "user") };
  }
}

export async function findUserById(id) {
  if (!pool) {
    const u = inMemoryUsers.find(user => user.id === id);
    if (!u) return null;
    const isAdm = u.role === "admin" || u.email.startsWith("jannowak") || u.email.startsWith("admin");
    return { id: u.id, name: u.name, email: u.email, role: isAdm ? "admin" : (u.role || "user"), created_at: u.created_at };
  }

  try {
    const { rows } = await pool.query("SELECT id, name, email, COALESCE(role, 'user') as role, created_at FROM users WHERE id = $1", [id]);
    if (!rows[0]) return null;
    const u = rows[0];
    const isAdm = u.role === "admin" || u.email.startsWith("jannowak") || u.email.startsWith("admin");
    return { ...u, role: isAdm ? "admin" : u.role };
  } catch (err) {
    const u = inMemoryUsers.find(user => user.id === id);
    if (!u) return null;
    const isAdm = u.role === "admin" || u.email.startsWith("jannowak") || u.email.startsWith("admin");
    return { id: u.id, name: u.name, email: u.email, role: isAdm ? "admin" : (u.role || "user"), created_at: u.created_at };
  }
}

export async function createUser({ name, email, passwordHash }) {
  const normalizedEmail = email.trim().toLowerCase();
  const initialRole = normalizedEmail === "jannowak@example.com" ? "admin" : "user";

  if (!pool) {
    const newUser = {
      id: nextUserId++,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      role: initialRole,
      created_at: new Date().toISOString()
    };
    inMemoryUsers.push(newUser);
    return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, created_at: newUser.created_at };
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at",
      [name.trim(), normalizedEmail, passwordHash, initialRole]
    );
    return rows[0];
  } catch (err) {
    console.error("Error creating user in DB:", err.message);
    throw err;
  }
}

export async function updateUserProfile(userId, name) {
  if (!pool) {
    const user = inMemoryUsers.find(u => u.id === userId);
    if (user) {
      user.name = name.trim();
      return { id: user.id, name: user.name, email: user.email };
    }
    return null;
  }

  try {
    const { rows } = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at",
      [name.trim(), userId]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("Error updating user profile:", err.message);
    throw err;
  }
}

export async function updateUserPassword(userId, currentPassword, newPassword) {
  if (!pool) {
    const user = inMemoryUsers.find(u => u.id === userId);
    if (!user) throw new Error("User not found.");
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw new Error("Current password is incorrect.");
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    return true;
  }

  try {
    const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (!rows[0]) throw new Error("User not found.");

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) throw new Error("Current password is incorrect.");

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);
    return true;
  } catch (err) {
    console.error("Error updating user password:", err.message);
    throw err;
  }
}

export async function deleteUserAccount(userId) {
  if (!pool) {
    const uIdx = inMemoryUsers.findIndex(u => u.id === userId);
    if (uIdx !== -1) inMemoryUsers.splice(uIdx, 1);
    return true;
  }

  try {
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return rowCount > 0;
  } catch (err) {
    console.error("Error deleting user account:", err.message);
    throw err;
  }
}

// ================= ADVERTISEMENTS OPERATIONS ================= //

export async function createAd({ userId, categorySlug, title, description, price, currency = "USD", location = "Entire Country", images = [], phone = "" }) {
  if (!pool) {
    const newAd = {
      id: nextAdId++,
      user_id: userId,
      category_slug: categorySlug,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      currency: currency || "USD",
      location: location.trim() || "Entire Country",
      images: Array.isArray(images) ? images : [],
      phone: phone ? phone.trim() : "",
      status: "active",
      created_at: new Date().toISOString()
    };
    inMemoryAds.unshift(newAd);
    return newAd;
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO advertisements (user_id, category_slug, title, description, price, currency, location, images, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [userId, categorySlug, title.trim(), description.trim(), parseFloat(price) || 0, currency, location.trim(), images, phone ? phone.trim() : ""]);
    return rows[0];
  } catch (err) {
    console.error("Error creating advertisement in DB:", err.message);
    throw err;
  }
}

export async function getUserAds(userId) {
  if (!pool) {
    return inMemoryAds.filter(a => a.user_id === userId);
  }

  try {
    const { rows } = await pool.query(`
      SELECT a.*, u.name as author_name, u.email as author_email
      FROM advertisements a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
    `, [userId]);
    return rows;
  } catch (err) {
    console.warn("Error fetching user ads:", err.message);
    return inMemoryAds.filter(a => a.user_id === userId);
  }
}

export async function getAllAds({ category, search, location, limit = 50 }) {
  if (!pool) {
    let list = [...inMemoryAds];
    if (category) list = list.filter(a => a.category_slug === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    if (location && location.trim() && !/entire country/i.test(location)) {
      const loc = location.toLowerCase();
      list = list.filter(a => a.location.toLowerCase().includes(loc));
    }
    return list.slice(0, limit);
  }

  try {
    let query = `
      SELECT a.*, u.name as author_name, u.email as author_email, u.created_at as author_joined
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.status = 'active'
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND a.category_slug = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      query += ` AND (a.title ILIKE $${params.length} OR a.description ILIKE $${params.length})`;
    }

    if (location && location.trim() && !/entire country/i.test(location)) {
      params.push(`%${location.trim()}%`);
      query += ` AND a.location ILIKE $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY a.created_at DESC LIMIT $${params.length}`;

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.warn("Error fetching all ads:", err.message);
    return inMemoryAds.slice(0, limit);
  }
}

export async function getAdById(adId) {
  const parsedId = parseInt(adId, 10);
  if (!pool) {
    const ad = inMemoryAds.find(a => a.id === parsedId);
    if (!ad) return null;
    const author = inMemoryUsers.find(u => u.id === ad.user_id);
    return {
      ...ad,
      author_name: author ? author.name : "Verified Seller",
      author_email: author ? author.email : ""
    };
  }

  try {
    const { rows } = await pool.query(`
      SELECT a.*, u.name as author_name, u.email as author_email, u.created_at as author_joined
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
    `, [parsedId]);
    return rows[0] || null;
  } catch (err) {
    console.error("Error fetching ad by id:", err.message);
    throw err;
  }
}

export async function deleteAd(adId, userId) {
  if (!pool) {
    const idx = inMemoryAds.findIndex(a => a.id === parseInt(adId, 10) && a.user_id === userId);
    if (idx !== -1) {
      inMemoryAds.splice(idx, 1);
      return true;
    }
    return false;
  }

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM advertisements WHERE id = $1 AND user_id = $2",
      [adId, userId]
    );
    return rowCount > 0;
  } catch (err) {
    console.error("Error deleting advertisement:", err.message);
    throw err;
  }
}

// ================= WISHLIST OPERATIONS ================= //

export async function toggleSavedAd(userId, adId) {
  const parsedAdId = parseInt(adId, 10);

  if (!pool) {
    const existingIdx = inMemorySaved.findIndex(s => s.user_id === userId && s.ad_id === parsedAdId);
    if (existingIdx !== -1) {
      inMemorySaved.splice(existingIdx, 1);
      return { isSaved: false };
    } else {
      inMemorySaved.push({ id: nextSavedId++, user_id: userId, ad_id: parsedAdId, created_at: new Date().toISOString() });
      return { isSaved: true };
    }
  }

  try {
    const check = await pool.query("SELECT id FROM saved_ads WHERE user_id = $1 AND ad_id = $2", [userId, parsedAdId]);
    if (check.rows.length > 0) {
      await pool.query("DELETE FROM saved_ads WHERE user_id = $1 AND ad_id = $2", [userId, parsedAdId]);
      return { isSaved: false };
    } else {
      await pool.query("INSERT INTO saved_ads (user_id, ad_id) VALUES ($1, $2)", [userId, parsedAdId]);
      return { isSaved: true };
    }
  } catch (err) {
    console.error("Error toggling saved ad:", err.message);
    throw err;
  }
}

export async function getSavedAds(userId) {
  if (!pool) {
    const savedIds = inMemorySaved.filter(s => s.user_id === userId).map(s => s.ad_id);
    return inMemoryAds.filter(a => savedIds.includes(a.id));
  }

  try {
    const { rows } = await pool.query(`
      SELECT a.*, u.name as author_name, u.email as author_email, s.created_at as saved_at
      FROM saved_ads s
      JOIN advertisements a ON s.ad_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);
    return rows;
  } catch (err) {
    console.warn("Error fetching saved ads:", err.message);
    return [];
  }
}

// ================= CONVERSATIONS & MESSAGING OPERATIONS ================= //

export async function getOrCreateConversation(buyerId, adId) {
  const parsedAdId = parseInt(adId, 10);
  const ad = await getAdById(parsedAdId);
  if (!ad) throw new Error("Advertisement not found.");

  if (ad.user_id === buyerId) {
    throw new Error("You cannot send messages to yourself on your own advertisement.");
  }

  const sellerId = ad.user_id;

  if (!pool) {
    let conv = inMemoryConversations.find(c => c.ad_id === parsedAdId && c.buyer_id === buyerId);
    if (!conv) {
      conv = {
        id: nextConvId++,
        ad_id: parsedAdId,
        buyer_id: buyerId,
        seller_id: sellerId,
        updated_at: new Date().toISOString()
      };
      inMemoryConversations.unshift(conv);
    }
    return conv;
  }

  try {
    // Check if exists
    const check = await pool.query(
      "SELECT * FROM conversations WHERE ad_id = $1 AND buyer_id = $2",
      [parsedAdId, buyerId]
    );
    if (check.rows.length > 0) {
      return check.rows[0];
    }

    // Create new
    const { rows } = await pool.query(
      "INSERT INTO conversations (ad_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING *",
      [parsedAdId, buyerId, sellerId]
    );
    return rows[0];
  } catch (err) {
    console.error("Error getOrCreateConversation:", err.message);
    throw err;
  }
}

export async function getUserConversations(userId) {
  if (!pool) {
    const userConvs = inMemoryConversations.filter(c => c.buyer_id === userId || c.seller_id === userId);
    return userConvs.map(c => {
      const ad = inMemoryAds.find(a => a.id === c.ad_id) || {};
      const otherUserId = c.buyer_id === userId ? c.seller_id : c.buyer_id;
      const otherUser = inMemoryUsers.find(u => u.id === otherUserId) || {};
      const msgs = inMemoryMessages.filter(m => m.conversation_id === c.id);
      const lastMsg = msgs[msgs.length - 1] || null;

      return {
        id: c.id,
        ad_id: c.ad_id,
        ad_title: ad.title || "Advertisement",
        ad_price: ad.price || 0,
        ad_currency: ad.currency || "USD",
        ad_image: ad.images && ad.images[0] ? ad.images[0] : null,
        other_user_id: otherUserId,
        other_user_name: otherUser.name || "User",
        last_message: lastMsg ? lastMsg.content : "Conversation started",
        last_message_at: lastMsg ? lastMsg.created_at : c.updated_at,
        is_buyer: c.buyer_id === userId
      };
    });
  }

  try {
    const query = `
      SELECT 
        c.id,
        c.ad_id,
        c.updated_at,
        c.buyer_id,
        c.seller_id,
        a.title as ad_title,
        a.price as ad_price,
        a.currency as ad_currency,
        a.images as ad_images,
        CASE WHEN c.buyer_id = $1 THEN u_seller.name ELSE u_buyer.name END as other_user_name,
        CASE WHEN c.buyer_id = $1 THEN u_seller.id ELSE u_buyer.id END as other_user_id,
        (
          SELECT content FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT created_at FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC LIMIT 1
        ) as last_message_at
      FROM conversations c
      JOIN advertisements a ON c.ad_id = a.id
      JOIN users u_buyer ON c.buyer_id = u_buyer.id
      JOIN users u_seller ON c.seller_id = u_seller.id
      WHERE c.buyer_id = $1 OR c.seller_id = $1
      ORDER BY COALESCE(
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
        c.updated_at
      ) DESC
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows.map(r => ({
      id: r.id,
      ad_id: r.ad_id,
      ad_title: r.ad_title,
      ad_price: r.ad_price,
      ad_currency: r.ad_currency,
      ad_image: r.ad_images && r.ad_images.length > 0 ? r.ad_images[0] : null,
      other_user_id: r.other_user_id,
      other_user_name: r.other_user_name,
      last_message: r.last_message || "No messages yet",
      last_message_at: r.last_message_at || r.updated_at,
      is_buyer: r.buyer_id === userId
    }));
  } catch (err) {
    console.error("Error fetching user conversations:", err.message);
    return [];
  }
}

export async function getConversationMessages(conversationId, userId) {
  const parsedConvId = parseInt(conversationId, 10);

  if (!pool) {
    const conv = inMemoryConversations.find(c => c.id === parsedConvId);
    if (!conv) throw new Error("Conversation not found.");
    if (conv.buyer_id !== userId && conv.seller_id !== userId) {
      throw new Error("Access denied.");
    }
    const msgs = inMemoryMessages.filter(m => m.conversation_id === parsedConvId);
    return msgs.map(m => {
      const sender = inMemoryUsers.find(u => u.id === m.sender_id);
      return {
        id: m.id,
        conversation_id: m.conversation_id,
        sender_id: m.sender_id,
        sender_name: sender ? sender.name : "User",
        content: m.content,
        created_at: m.created_at,
        is_mine: m.sender_id === userId
      };
    });
  }

  try {
    // Check membership
    const check = await pool.query(
      "SELECT * FROM conversations WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)",
      [parsedConvId, userId]
    );
    if (check.rows.length === 0) {
      throw new Error("Conversation not found or access denied.");
    }

    const { rows } = await pool.query(`
      SELECT m.id, m.conversation_id, m.sender_id, m.content, m.created_at, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [parsedConvId]);

    return rows.map(r => ({
      ...r,
      is_mine: r.sender_id === userId
    }));
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    throw err;
  }
}

export async function sendMessage(conversationId, senderId, content) {
  const parsedConvId = parseInt(conversationId, 10);
  const cleanContent = content ? content.trim() : "";
  if (!cleanContent) throw new Error("Message content cannot be empty.");

  if (!pool) {
    const conv = inMemoryConversations.find(c => c.id === parsedConvId);
    if (!conv) throw new Error("Conversation not found.");
    if (conv.buyer_id !== senderId && conv.seller_id !== senderId) {
      throw new Error("Access denied.");
    }

    const newMsg = {
      id: nextMsgId++,
      conversation_id: parsedConvId,
      sender_id: senderId,
      content: cleanContent,
      created_at: new Date().toISOString()
    };
    inMemoryMessages.push(newMsg);
    conv.updated_at = newMsg.created_at;
    const sender = inMemoryUsers.find(u => u.id === senderId);
    return {
      ...newMsg,
      sender_name: sender ? sender.name : "User",
      is_mine: true
    };
  }

  try {
    // Verify membership
    const check = await pool.query(
      "SELECT * FROM conversations WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)",
      [parsedConvId, senderId]
    );
    if (check.rows.length === 0) {
      throw new Error("Conversation not found or access denied.");
    }

    const { rows } = await pool.query(
      "INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *",
      [parsedConvId, senderId, cleanContent]
    );

    // Update conversation timestamp
    await pool.query("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1", [parsedConvId]);

    const sender = await findUserById(senderId);
    return {
      ...rows[0],
      sender_name: sender ? sender.name : "User",
      is_mine: true
    };
  } catch (err) {
    console.error("Error sending message:", err.message);
    throw err;
  }
}

// ==========================================
// NOTIFICATIONS API
// ==========================================

export async function getUserNotifications(userId) {
  if (!pool) {
    const list = inMemoryNotifications.filter(n => n.user_id === null || n.user_id === userId);
    return list.map(n => {
      const isRead = inMemoryNotificationReads.some(r => r.user_id === userId && r.notification_id === n.id);
      return { ...n, is_read: isRead };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  try {
    const query = `
      SELECT 
        n.id,
        n.user_id,
        n.title,
        n.message,
        n.type,
        n.created_at,
        CASE WHEN nr.id IS NOT NULL THEN true ELSE false END AS is_read
      FROM notifications n
      LEFT JOIN notification_reads nr 
        ON nr.notification_id = n.id AND nr.user_id = $1
      WHERE n.user_id IS NULL OR n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 50;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  } catch (err) {
    console.error("Error getting user notifications:", err.message);
    return [];
  }
}

export async function markNotificationRead(userId, notificationId) {
  if (!pool) {
    if (!inMemoryNotificationReads.some(r => r.user_id === userId && r.notification_id === notificationId)) {
      inMemoryNotificationReads.push({ user_id: userId, notification_id: notificationId, read_at: new Date().toISOString() });
    }
    return true;
  }

  try {
    await pool.query(
      "INSERT INTO notification_reads (user_id, notification_id) VALUES ($1, $2) ON CONFLICT (user_id, notification_id) DO NOTHING",
      [userId, notificationId]
    );
    return true;
  } catch (err) {
    console.error("Error marking notification read:", err.message);
    return false;
  }
}

export async function markAllNotificationsRead(userId) {
  if (!pool) {
    const notifs = inMemoryNotifications.filter(n => n.user_id === null || n.user_id === userId);
    for (const n of notifs) {
      if (!inMemoryNotificationReads.some(r => r.user_id === userId && r.notification_id === n.id)) {
        inMemoryNotificationReads.push({ user_id: userId, notification_id: n.id, read_at: new Date().toISOString() });
      }
    }
    return true;
  }

  try {
    await pool.query(`
      INSERT INTO notification_reads (user_id, notification_id)
      SELECT $1, n.id
      FROM notifications n
      WHERE n.user_id IS NULL OR n.user_id = $1
      ON CONFLICT (user_id, notification_id) DO NOTHING;
    `, [userId]);
    return true;
  } catch (err) {
    console.error("Error marking all notifications read:", err.message);
    return false;
  }
}

export async function createNotification({ userId = null, title, message, type = "system" }) {
  if (!pool) {
    const newNotif = {
      id: nextNotifId++,
      user_id: userId,
      title: title.trim(),
      message: message.trim(),
      type: type || "system",
      created_at: new Date().toISOString()
    };
    inMemoryNotifications.unshift(newNotif);
    return newNotif;
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, title.trim(), message.trim(), type || "system"]
    );
    return rows[0];
  } catch (err) {
    console.error("Error creating notification:", err.message);
    throw err;
  }
}

// ==========================================
// ADMIN PORTAL API
// ==========================================

export async function getAdminStats() {
  if (!pool) {
    return {
      totalUsers: inMemoryUsers.length,
      totalAds: inMemoryAds.length,
      totalConversations: inMemoryConversations.length,
      totalMessages: inMemoryMessages.length,
      totalNotifications: inMemoryNotifications.length
    };
  }

  try {
    const [usersRes, adsRes, convsRes, msgsRes, notifsRes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM advertisements"),
      pool.query("SELECT COUNT(*) FROM conversations"),
      pool.query("SELECT COUNT(*) FROM messages"),
      pool.query("SELECT COUNT(*) FROM notifications")
    ]);

    return {
      totalUsers: parseInt(usersRes.rows[0].count, 10),
      totalAds: parseInt(adsRes.rows[0].count, 10),
      totalConversations: parseInt(convsRes.rows[0].count, 10),
      totalMessages: parseInt(msgsRes.rows[0].count, 10),
      totalNotifications: parseInt(notifsRes.rows[0].count, 10)
    };
  } catch (err) {
    console.error("Error getting admin stats:", err.message);
    return {
      totalUsers: 0,
      totalAds: 0,
      totalConversations: 0,
      totalMessages: 0,
      totalNotifications: 0
    };
  }
}

export async function adminGetAllAds({ search = "", category = "", limit = 50, offset = 0 } = {}) {
  if (!pool) {
    let list = [...inMemoryAds];
    if (category) list = list.filter(a => a.category_slug === category);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    return {
      ads: list.slice(offset, offset + limit),
      total: list.length
    };
  }

  try {
    const conditions = [];
    const values = [];

    if (category) {
      values.push(category);
      conditions.push(`a.category_slug = $${values.length}`);
    }

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(a.title) LIKE $${values.length} OR LOWER(a.description) LIKE $${values.length} OR LOWER(u.name) LIKE $${values.length} OR LOWER(u.email) LIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM advertisements a LEFT JOIN users u ON a.user_id = u.id ${whereClause}`,
      values
    );
    const total = parseInt(countRes.rows[0].count, 10);

    values.push(limit);
    values.push(offset);
    const limitOffsetClause = `LIMIT $${values.length - 1} OFFSET $${values.length}`;

    const query = `
      SELECT 
        a.id,
        a.user_id,
        a.category_slug,
        a.title,
        a.description,
        a.price,
        a.currency,
        a.location,
        a.phone,
        a.images,
        a.status,
        a.created_at,
        u.name AS seller_name,
        u.email AS seller_email,
        c.name AS category_name
      FROM advertisements a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN categories c ON a.category_slug = c.slug
      ${whereClause}
      ORDER BY a.created_at DESC
      ${limitOffsetClause}
    `;

    const { rows } = await pool.query(query, values);
    return { ads: rows, total };
  } catch (err) {
    console.error("Error in adminGetAllAds:", err.message);
    throw err;
  }
}

export async function adminDeleteAd(adId) {
  const parsedId = parseInt(adId, 10);
  if (!pool) {
    const idx = inMemoryAds.findIndex(a => a.id === parsedId);
    if (idx === -1) throw new Error("Advertisement not found.");
    const deleted = inMemoryAds.splice(idx, 1)[0];
    return deleted;
  }

  try {
    const { rows } = await pool.query(
      "DELETE FROM advertisements WHERE id = $1 RETURNING id, title",
      [parsedId]
    );
    if (rows.length === 0) {
      throw new Error("Advertisement not found.");
    }
    return rows[0];
  } catch (err) {
    console.error("Error in adminDeleteAd:", err.message);
    throw err;
  }
}

export async function adminGetAllUsers() {
  if (!pool) {
    return inMemoryUsers.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'user', created_at: u.created_at }));
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, COALESCE(role, 'user') as role, created_at FROM users ORDER BY created_at DESC LIMIT 100"
    );
    return rows;
  } catch (err) {
    console.error("Error in adminGetAllUsers:", err.message);
    return [];
  }
}

export { pool };
