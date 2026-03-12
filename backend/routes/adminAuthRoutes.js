// backend/routes/adminAuthRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// POST /api/admin/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // Check against hardcoded credentials in .env
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
    // Generate JWT
    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // valid for 8 hours
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } else {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

export default router;
