import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  initDb,
  getCategories,
  pool,
  findUserByEmail,
  findUserById,
  createUser,
  createAd,
  getUserAds,
  getAllAds,
  deleteAd,
  toggleSavedAd,
  getSavedAds,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount
} from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "deallyhub_jwt_super_secret_key_2026";

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Authentication token is required." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired session token." });
  }
}

// Root & Health
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Deallyhub API is up and running!",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", async (req, res) => {
  let dbStatus = "disconnected";
  if (pool) {
    try {
      await pool.query("SELECT 1");
      dbStatus = "connected";
    } catch (e) {
      dbStatus = `error: ${e.message}`;
    }
  }

  res.json({
    status: "healthy",
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Categories API
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve categories",
      details: err.message
    });
  }
});

// ================= AUTHENTICATION & PROFILE API ================= //

// 1. Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields (name, email, password) are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long."
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "An account with this email address already exists."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await createUser({ name, email, passwordHash });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      error: "Registration failed due to a server error.",
      details: err.message
    });
  }
});

// 2. Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required."
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Signed in successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Sign in failed due to a server error.",
      details: err.message
    });
  }
});

// 3. Current User Profile
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch user profile." });
  }
});

// 4. Update Profile Name
app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Name cannot be empty." });
    }

    const updated = await updateUserProfile(req.user.userId, name);
    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update profile.", details: err.message });
  }
});

// 5. Change Password
app.put("/api/auth/password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters long." });
    }

    await updateUserPassword(req.user.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully."
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Delete Account
app.delete("/api/auth/account", authenticateToken, async (req, res) => {
  try {
    await deleteUserAccount(req.user.userId);
    res.json({
      success: true,
      message: "Your account and all associated listings have been permanently deleted."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete account.", details: err.message });
  }
});

// ================= ADVERTISEMENTS API ================= //

// 1. Create Advertisement (Protected)
app.post("/api/ads", authenticateToken, async (req, res) => {
  try {
    const { categorySlug, title, description, price, currency, location, images } = req.body;

    if (!title || !categorySlug || !description) {
      return res.status(400).json({
        success: false,
        error: "Title, category, and description are required."
      });
    }

    const ad = await createAd({
      userId: req.user.userId,
      categorySlug,
      title,
      description,
      price: price ?? 0,
      currency: currency || "USD",
      location: location || "Entire Country",
      images: Array.isArray(images) ? images : []
    });

    res.status(201).json({
      success: true,
      message: "Advertisement published successfully!",
      ad
    });
  } catch (err) {
    console.error("Create ad error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create advertisement.",
      details: err.message
    });
  }
});

// 2. Get My Advertisements (Protected)
app.get("/api/ads/my", authenticateToken, async (req, res) => {
  try {
    const ads = await getUserAds(req.user.userId);
    res.json({
      success: true,
      count: ads.length,
      ads
    });
  } catch (err) {
    console.error("Get user ads error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch your advertisements.",
      details: err.message
    });
  }
});

// 3. Get Public Advertisements
app.get("/api/ads", async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const ads = await getAllAds({
      category,
      search,
      limit: limit ? parseInt(limit, 10) : 50
    });

    res.json({
      success: true,
      count: ads.length,
      ads
    });
  } catch (err) {
    console.error("Get all ads error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch advertisements.",
      details: err.message
    });
  }
});

// 4. Delete Advertisement (Protected)
app.delete("/api/ads/:id", authenticateToken, async (req, res) => {
  try {
    const adId = req.params.id;
    const success = await deleteAd(adId, req.user.userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Advertisement not found or you are not authorized to delete it."
      });
    }

    res.json({
      success: true,
      message: "Advertisement deleted successfully."
    });
  } catch (err) {
    console.error("Delete ad error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete advertisement.",
      details: err.message
    });
  }
});

// ================= WISHLIST / SAVED ITEMS API ================= //

// 1. Get Saved Advertisements (Protected)
app.get("/api/saved", authenticateToken, async (req, res) => {
  try {
    const saved = await getSavedAds(req.user.userId);
    res.json({
      success: true,
      count: saved.length,
      saved
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch saved advertisements.",
      details: err.message
    });
  }
});

// 2. Toggle Saved Advertisement (Protected)
app.post("/api/saved/:adId", authenticateToken, async (req, res) => {
  try {
    const { adId } = req.params;
    const result = await toggleSavedAd(req.user.userId, adId);
    res.json({
      success: true,
      isSaved: result.isSaved,
      message: result.isSaved ? "Item added to your saved wishlist." : "Item removed from your saved wishlist."
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to toggle saved status.",
      details: err.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, HOST, async () => {
  console.log(`Deallyhub server running on http://${HOST}:${PORT}`);
  await initDb();
});
