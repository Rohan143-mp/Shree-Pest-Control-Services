// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import nodemailer from "nodemailer";
import cron from "node-cron";
import Booking from "./models/Booking.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// MongoDB Connection
// =======================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// =======================
// OTP Store (in-memory)
// =======================
const otpStore = {}; // { email: { otp, expires } }
export const verifiedEmails = new Set(); // track verified emails

// =======================
// Nodemailer Transport
// =======================
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. your Gmail
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// Verify transporter connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Email Transporter Error:", error.message);
    console.error("   Make sure EMAIL_USER and EMAIL_PASS are set correctly in .env");
    console.error("   For Gmail, use an App Password (not your regular password)");
  } else {
    console.log("✅ Email Transporter Ready");
  }
});

console.log("📧 Email Config:", {
  user: process.env.EMAIL_USER || "❌ MISSING",
  pass: process.env.EMAIL_PASS ? "✔️ Exists" : "❌ Missing",
});

// =======================
// OTP Routes
// =======================
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  // Validate email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured");
    return res.status(500).json({ 
      success: false, 
      message: "Email service not configured. Please contact administrator." 
    });
  }

  try {
    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code – Shree Pest Control",
      html: `
        <h2>Welcome to Shree Pest Control Services</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color:#00c2cb">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    console.log(`✅ OTP email sent to ${email}`);
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("❌ OTP send error:", err.message);
    console.error("   Full error:", err);
    
    // Provide more specific error messages
    let errorMessage = "Failed to send OTP. Please try again.";
    if (err.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please check email credentials.";
    } else if (err.code === "ECONNECTION") {
      errorMessage = "Could not connect to email server. Please check your internet connection.";
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ success: false, message: "No OTP found. Please request again." });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ success: false, message: "OTP expired. Please request again." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }

  delete otpStore[email];
  verifiedEmails.add(email);

  res.json({ success: true, message: "OTP verified successfully" });
});

// =======================
// Routes
// =======================
app.use("/api", bookingRoutes);
app.use("/api/admin/auth", adminAuthRoutes);

// =======================
// CRON Jobs
// =======================

// Helper: Send reminder email
async function sendReminderEmail(booking) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured - skipping reminder email");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: "⏰ Reminder: Your Pest Control Service is Tomorrow",
      html: `
        <div style="background:#0e7490;padding:16px;text-align:center;color:#fff;">
          <h1>Shree Pest Control Services</h1>
        </div>
        <div style="padding:20px;font-family:Arial,sans-serif;color:#333;">
          <h2>Hi ${booking.name},</h2>
          <p>This is a friendly reminder that your pest control service is scheduled for <b>${booking.date}</b> at <b>${booking.time}</b>.</p>
          <p>Our team will be there at your address: ${booking.address}, ${booking.pincode}.</p>
          <p>Thank you for choosing us!</p>
        </div>
      `,
    });
    console.log(`📧 Reminder email sent to ${booking.email}`);
  } catch (err) {
    console.error(`❌ Reminder email error for ${booking.email}:`, err.message);
    console.error("   Full error:", err);
  }
}

// Helper: Send daily digest to admin
async function sendDailyDigest() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured - skipping daily digest");
    return;
  }

  try {
    const pending = await Booking.countDocuments({ status: "pending" });
    const confirmed = await Booking.countDocuments({ status: "confirmed" });
    const completed = await Booking.countDocuments({ status: "completed" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });
    const total = await Booking.countDocuments();

    const html = `
      <div style="background:#0e7490;padding:16px;text-align:center;color:#fff;">
        <h1>Daily Digest – Shree Pest Control</h1>
      </div>
      <div style="padding:20px;font-family:Arial,sans-serif;color:#333;">
        <h2>Here's today's summary:</h2>
        <ul>
          <li>📌 Pending: ${pending}</li>
          <li>✅ Confirmed: ${confirmed}</li>
          <li>🎉 Completed: ${completed}</li>
          <li>❌ Cancelled: ${cancelled}</li>
          <li>📊 Total: ${total}</li>
        </ul>
      </div>
    `;

    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Admin's email
      subject: "📊 Daily Digest – Shree Pest Control",
      html,
    });

    console.log("📧 Daily digest sent to admin");
  } catch (err) {
    console.error("❌ Daily digest error:", err.message);
    console.error("   Full error:", err);
  }
}

// CRON: every hour → send reminders for next day
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Checking for 24h reminder emails...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  const bookings = await Booking.find({ date: dateStr, status: "confirmed" });
  for (const booking of bookings) {
    await sendReminderEmail(booking);
  }
});

// CRON: every day at 7 AM → send digest to admin
cron.schedule("0 7 * * *", async () => {
  console.log("📊 Sending daily digest...");
  await sendDailyDigest();
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
