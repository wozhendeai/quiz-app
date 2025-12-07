import { Router } from "express";
import {
  createUser,
  authenticateUser,
  getUserById,
  AuthError,
} from "../services/auth.js";

const router = Router();

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const user = await createUser(username, password);

    // Set session
    req.session.userId = user.id;

    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
      return;
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const user = await authenticateUser(username, password);

    // Set session
    req.session.userId = user.id;

    res.json({ user });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

/**
 * POST /api/auth/logout
 * Destroy session
 */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

/**
 * GET /api/auth/me
 * Get current logged-in user
 */
router.get("/me", async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.json({ user: null });
      return;
    }

    const user = await getUserById(userId);
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
