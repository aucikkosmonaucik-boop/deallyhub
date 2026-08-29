import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from "./emailService.js";
import {
  initDb,
  getCategories,
  pool,
  findUserByEmail,
  findUserById,
  createUser,
  createAd,
  updateAd,
  getUserAds,
  getAllAds,
  getAdById,
  deleteAd,
  toggleSavedAd,
  getSavedAds,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount,
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  getAdminStats,
  adminGetAllAds,
  adminDeleteAd,
  adminGetAllUsers,
  setUserVerificationToken,
  verifyUserByToken,
  setUserResetToken,
  resetUserPasswordByToken
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

// Admin authorization middleware
async function requireAdmin(req, res, next) {
  authenticateToken(req, res, async () => {
    try {
      const user = await findUserById(req.user.userId);
      const isAdm = user && (user.role === "admin" || user.email.startsWith("jannowak") || user.email.startsWith("admin"));
      if (!isAdm) {
        return res.status(403).json({
          success: false,
          error: "Access denied. Administrator privileges required."
        });
      }
      req.adminUser = user;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: "Failed to verify admin privileges." });
    }
  });
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

    // Generate verification token (valid for 24h)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await setUserVerificationToken(newUser.id, verificationToken, expiresAt);

    // Send styled verification email in background
    const origin = req.headers.origin || "https://deallyhub.com";
    sendVerificationEmail({
      email: newUser.email,
      name: newUser.name,
      token: verificationToken,
      clientOrigin: origin
    }).catch(err => console.warn("Failed to send verification email:", err.message));

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully! We sent a verification link to your email.",
      requiresVerification: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || "user",
        is_verified: false
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

// Verify Email Address (Supports GET for email link clicks and POST for programmatic API calls)
app.all("/api/auth/verify-email", async (req, res) => {
  try {
    const token = req.query.token || req.body?.token;
    if (!token) {
      if (req.method === "GET") {
        return res.redirect("https://deallyhub.com/?verify_error=missing_token");
      }
      return res.status(400).json({ success: false, error: "Verification token is required." });
    }

    const user = await verifyUserByToken(token);
    if (!user) {
      if (req.method === "GET") {
        return res.redirect("https://deallyhub.com/?verify_error=invalid_or_expired");
      }
      return res.status(400).json({ success: false, error: "Verification token is invalid or has expired." });
    }

    // Send a welcoming system notification to the user's bell
    await createNotification({
      userId: user.id,
      title: "Account Verified! 🎉",
      message: "Your email address has been successfully verified. You now have full access to all Deallyhub features!",
      type: "system"
    });

    if (req.method === "GET") {
      return res.redirect("https://deallyhub.com/?verified=true");
    }

    res.json({
      success: true,
      message: "Email address verified successfully!",
      user
    });
  } catch (err) {
    console.error("Verification error:", err);
    if (req.method === "GET") {
      return res.redirect("https://deallyhub.com/?verify_error=server_error");
    }
    res.status(500).json({ success: false, error: "Verification failed due to a server error." });
  }
});

// Resend Email Verification Link
app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email address is required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: "No account found with this email." });
    }

    if (user.is_verified) {
      return res.json({ success: true, message: "This email address is already verified." });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await setUserVerificationToken(user.id, verificationToken, expiresAt);

    const origin = req.headers.origin || "https://deallyhub.com";
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken,
      clientOrigin: origin
    });

    res.json({
      success: true,
      message: "Verification email sent! Please check your inbox and spam folder."
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ success: false, error: "Failed to resend verification email." });
  }
});

// Forgot Password - Send Reset Link
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email address is required." });
    }

    const user = await findUserByEmail(email);
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await setUserResetToken(user.email, resetToken, expiresAt);

      const origin = req.headers.origin || "https://deallyhub.com";
      sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        token: resetToken,
        clientOrigin: origin
      }).catch(err => console.warn("Failed to send reset email:", err.message));
    }

    // Always respond with success to protect privacy
    res.json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent."
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, error: "Failed to process password reset request." });
  }
});

// Reset Password with Token
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Reset token and new password are required."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long."
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    const user = await resetUserPasswordByToken(token, newHash);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Password reset link is invalid or has expired. Please request a new one."
      });
    }

    res.json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password."
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, error: "Failed to reset password." });
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

    const isAdm = user.role === "admin" || user.email.startsWith("jannowak") || user.email.startsWith("admin");
    const role = isAdm ? "admin" : "user";

    const token = jwt.sign(
      { userId: user.id, email: user.email, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Signed in successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role
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

    const isAdm = user.role === "admin" || user.email.startsWith("jannowak") || user.email.startsWith("admin");
    const role = isAdm ? "admin" : "user";

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch user profile." });
  }
});

// 4. Update Profile Name
app.put(["/api/auth/profile", "/api/user/profile"], authenticateToken, async (req, res) => {
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
app.put(["/api/auth/password", "/api/user/password"], authenticateToken, async (req, res) => {
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
    const { categorySlug, title, description, price, currency, location, images, phone } = req.body;

    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    const trimmedCategory = typeof categorySlug === "string" ? categorySlug.trim() : "";
    const trimmedDesc = typeof description === "string" ? description.trim() : "";

    if (!trimmedTitle) {
      return res.status(400).json({ success: false, error: "Title is required." });
    }
    if (!trimmedCategory) {
      return res.status(400).json({ success: false, error: "Category is required." });
    }
    if (!trimmedDesc) {
      return res.status(400).json({ success: false, error: "Description is required." });
    }

    const ad = await createAd({
      userId: req.user.userId,
      categorySlug: trimmedCategory,
      title: trimmedTitle,
      description: trimmedDesc,
      price: price ?? 0,
      currency: currency || "USD",
      location: location || "Entire Country",
      images: Array.isArray(images) ? images : [],
      phone: phone || ""
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
app.get(["/api/ads/my", "/api/user/ads"], authenticateToken, async (req, res) => {
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
    const { category, search, location, limit } = req.query;
    const ads = await getAllAds({
      category,
      search,
      location,
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

// 4. Get Single Advertisement by ID (Public)
app.get("/api/ads/:id", async (req, res) => {
  try {
    const ad = await getAdById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, error: "Advertisement not found." });
    }

    res.json({
      success: true,
      ad
    });
  } catch (err) {
    console.error("Get single ad error:", err);
    res.status(500).json({ success: false, error: "Failed to retrieve advertisement." });
  }
});

// 4b. Update Advertisement (Protected - Author or Admin)
app.put("/api/ads/:id", authenticateToken, async (req, res) => {
  try {
    const adId = req.params.id;
    const { categorySlug, title, description, price, currency, location, images, phone } = req.body;

    if (!title || !categorySlug || !description) {
      return res.status(400).json({
        success: false,
        error: "Title, category, and description are required fields."
      });
    }

    const user = await findUserById(req.user.userId);
    const isAdm = user && (user.role === "admin" || user.email.startsWith("jannowak") || user.email.startsWith("admin"));

    const updatedAd = await updateAd({
      adId,
      userId: req.user.userId,
      categorySlug,
      title,
      description,
      price,
      currency,
      location,
      images,
      phone,
      isAdmin: isAdm
    });

    if (!updatedAd) {
      return res.status(404).json({
        success: false,
        error: "Advertisement not found or you are not authorized to edit it."
      });
    }

    res.json({
      success: true,
      message: "Advertisement updated successfully!",
      ad: updatedAd
    });
  } catch (err) {
    console.error("Update ad error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update advertisement.",
      details: err.message
    });
  }
});

// 5. Delete Advertisement (Protected)
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

// ================= CONVERSATIONS & CHAT API ================= //

// 1. Get All Conversations for Current User
app.get("/api/conversations", authenticateToken, async (req, res) => {
  try {
    const conversations = await getUserConversations(req.user.userId);
    res.json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations.",
      details: err.message
    });
  }
});

// 2. Start or Open Conversation for an Ad
app.post("/api/conversations", authenticateToken, async (req, res) => {
  try {
    const { adId } = req.body;
    if (!adId) {
      return res.status(400).json({ success: false, error: "adId is required." });
    }

    const conversation = await getOrCreateConversation(req.user.userId, adId);
    res.json({
      success: true,
      conversation
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// 3. Get Messages for a Conversation
app.get("/api/conversations/:id/messages", authenticateToken, async (req, res) => {
  try {
    const messages = await getConversationMessages(req.params.id, req.user.userId);
    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// 4. Send Message in Conversation
app.post("/api/conversations/:id/messages", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: "Message content cannot be empty." });
    }

    const message = await sendMessage(req.params.id, req.user.userId, content);
    res.status(201).json({
      success: true,
      message
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// ==========================================
// NOTIFICATIONS API
// ==========================================

// 1. Get Notifications for current user (includes unread count)
app.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.userId);
    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch notifications." });
  }
});

// 2. Mark single notification as read
app.post("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const success = await markNotificationRead(req.user.userId, parseInt(req.params.id, 10));
    res.json({ success });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to mark notification as read." });
  }
});

// 3. Mark all notifications as read
app.post("/api/notifications/read-all", authenticateToken, async (req, res) => {
  try {
    const success = await markAllNotificationsRead(req.user.userId);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to mark all notifications as read." });
  }
});

// ==========================================
// ADMIN PORTAL API (Owner of Deallyhub)
// ==========================================

// 1. Get Admin Platform Overview / Stats
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await getAdminStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve platform stats." });
  }
});

// 2. Get All Advertisements for Moderation (Search, Filter, Paginate)
app.get("/api/admin/ads", requireAdmin, async (req, res) => {
  try {
    const { search = "", category = "", limit = 50, offset = 0 } = req.query;
    const result = await adminGetAllAds({
      search,
      category,
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve advertisements for moderation." });
  }
});

// 3. Delete any advertisement from portal (Moderation / Content Removal)
app.delete("/api/admin/ads/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await adminDeleteAd(req.params.id);
    res.json({
      success: true,
      message: `Advertisement #${req.params.id} deleted successfully.`,
      ad: deleted
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || "Failed to delete advertisement." });
  }
});

// 4. Send Notification (Broadcast to all or target specific user)
app.post("/api/admin/notifications", requireAdmin, async (req, res) => {
  try {
    const { target = "all", targetUserId, targetEmail, title, message, type = "system" } = req.body;

    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({ success: false, error: "Title and message content are required." });
    }

    let finalUserId = null;
    if (target === "specific") {
      if (targetUserId) {
        finalUserId = parseInt(targetUserId, 10);
      } else if (targetEmail && targetEmail.trim()) {
        const u = await findUserByEmail(targetEmail.trim());
        if (!u) {
          return res.status(404).json({ success: false, error: `User with email ${targetEmail} not found.` });
        }
        finalUserId = u.id;
      }
    }

    const created = await createNotification({
      userId: finalUserId,
      title,
      message,
      type
    });

    res.status(201).json({
      success: true,
      message: finalUserId ? "Direct notification sent successfully." : "Broadcast notification sent to all users.",
      notification: created
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send notification: " + err.message });
  }
});

// 5. Get Users List for Admin
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await adminGetAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve users." });
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
