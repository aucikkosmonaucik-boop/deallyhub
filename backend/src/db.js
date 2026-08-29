import pg from "pg";

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

// In-memory fallback stores if database is offline
const inMemoryUsers = [];
let nextUserId = 1;

let pool = null;

if (process.env.DATABASE_URL) {
  const isProduction = process.env.NODE_ENV === "production" || process.env.DATABASE_URL.includes("railway");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });
}

export async function initDb() {
  if (!pool) {
    console.log("No DATABASE_URL configured. Running with in-memory categories & users.");
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
      } else {
        console.log(`Database connected. Found ${rows[0].count} categories in database.`);
      }
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
    console.warn("Falling back to default categories due to query error:", err.message);
    return INITIAL_CATEGORIES.map((cat, idx) => ({ id: idx + 1, ...cat }));
  }
}

// User operations
export async function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!pool) {
    return inMemoryUsers.find(u => u.email === normalizedEmail) || null;
  }

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    return rows[0] || null;
  } catch (err) {
    console.warn("Error querying user by email, checking memory fallback:", err.message);
    return inMemoryUsers.find(u => u.email === normalizedEmail) || null;
  }
}

export async function findUserById(id) {
  if (!pool) {
    return inMemoryUsers.find(u => u.id === id) || null;
  }

  try {
    const { rows } = await pool.query("SELECT id, name, email, created_at FROM users WHERE id = $1", [id]);
    return rows[0] || null;
  } catch (err) {
    console.warn("Error querying user by id:", err.message);
    return inMemoryUsers.find(u => u.id === id) || null;
  }
}

export async function createUser({ name, email, passwordHash }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!pool) {
    const newUser = {
      id: nextUserId++,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    };
    inMemoryUsers.push(newUser);
    return { id: newUser.id, name: newUser.name, email: newUser.email, created_at: newUser.created_at };
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name.trim(), normalizedEmail, passwordHash]
    );
    return rows[0];
  } catch (err) {
    console.error("Error creating user in DB:", err.message);
    throw err;
  }
}

export { pool };
