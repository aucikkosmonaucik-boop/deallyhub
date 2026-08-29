import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { initDb, getCategories, pool, findUserByEmail, findUserById, createUser } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "deallyhub_jwt_super_secret_key_2026";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
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

// ================= AUTHENTICATION API ================= //

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

    // Check duplicate
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "An account with this email address already exists."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save to database
    const newUser = await createUser({ name, email, passwordHash });

    // Generate JWT token
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

    // Generate JWT
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

// 3. Current User Profile (/api/auth/me)
app.get("/api/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Missing or invalid authorization token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);
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
    res.status(401).json({ success: false, error: "Invalid or expired token." });
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
