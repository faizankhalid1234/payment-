import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  AuthRequest,
  clearAuthCookie,
  requireAuth,
  setAuthCookie,
  signToken,
} from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "This email is already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashed,
    });

    const token = signToken({
      userId: String(user._id),
      name: user.name,
      email: user.email,
    });
    setAuthCookie(res, token);

    return res.json({
      user: { id: String(user._id), name: user.name, email: user.email },
    });
  } catch (e) {
    console.error("register error", e);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter email and password." });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken({
      userId: String(user._id),
      name: user.name,
      email: user.email,
    });
    setAuthCookie(res, token);

    return res.json({
      user: { id: String(user._id), name: user.name, email: user.email },
    });
  } catch (e) {
    console.error("login error", e);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

router.get("/me", requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  return res.json({
    user: { id: user.userId, name: user.name, email: user.email },
  });
});

export default router;
