import express from "express";
import cors from "cors";
import "dotenv/config";
import { initDb, getCategories, pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, HOST, async () => {
  console.log(`Deallyhub server running on http://${HOST}:${PORT}`);
  await initDb();
});
