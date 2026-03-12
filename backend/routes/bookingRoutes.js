// backend/routes/bookingRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import Booking from "../models/Booking.js";
import { verifiedEmails, transporter } from "../server.js";
import cron from "node-cron";

const router = express.Router();

// ======================
// Middleware: JWT verify
// ======================
function adminAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ success: false, message: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT verify error:", err);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

// ======================
// Helpers
// ======================
function sanitizeString(s) {
  return typeof s === "string" ? s.trim() : s;
}
function isPastDateTime(dateStr, timeStr) {
  if (!dateStr) return false;
  const now = new Date();
  const parts = dateStr.split("-");
  if (parts.length !== 3) return false;
  const [y, m, d] = parts.map((p) => parseInt(p, 10));
  let dt;
  if (timeStr) {
    const [hh, mm] = timeStr.split(":").map((p) => parseInt(p, 10));
    dt = new Date(y, m - 1, d, hh || 0, mm || 0, 0);
  } else {
    dt = new Date(y, m - 1, d);
  }
  return dt < now;
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
}

// ======================
// Email Templates
// ======================
async function sendStatusEmail(booking, status, reason = null) {
  const { email, name, serviceType, date, time, address, pincode } = booking;

  let subject = "";
  let html = "";

  const header = `
    <div style="background:#0e7490;padding:16px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:22px;">Shree Pest Control Services</h1>
    </div>
    <div style="padding:20px;font-family:Arial, sans-serif;font-size:15px;line-height:1.6;color:#333;">
  `;

  const footer = `
    <p style="margin-top:30px;font-size:13px;color:#555;">
      Warm regards,<br/>
      <b>Shree Pest Control Team</b><br/>
      📞 Contact us anytime if you need assistance.
    </p>
    </div>
    <div style="background:#f1f5f9;padding:12px;text-align:center;font-size:12px;color:#666;">
      © ${new Date().getFullYear()} Shree Pest Control Services. All rights reserved.
    </div>
  `;

  switch (status) {
    case "new":
      subject = "📩 Booking Received – Pending Confirmation";
      html = `
        ${header}
        <h2>Hello ${name},</h2>
        <p>We have received your booking request for <b>${serviceType}</b>.</p>
        <ul>
          <li><b>Date:</b> ${date || "Not specified"}</li>
          <li><b>Time:</b> ${time || "Not specified"}</li>
          <li><b>Address:</b> ${address}, ${pincode}</li>
        </ul>
        <p>Our team will review and confirm shortly. Thank you for choosing us!</p>
        ${footer}
      `;
      break;

    case "confirmed":
      subject = "✅ Your Pest Control Service is Confirmed";
      html = `
        ${header}
        <h2 style="color:#16a34a;">Dear ${name},</h2>
        <p>Your booking has been <b style="color:#16a34a;">confirmed</b>.</p>
        <ul>
          <li><b>Service:</b> ${serviceType}</li>
          <li><b>Date:</b> ${date || "Not specified"}</li>
          <li><b>Time:</b> ${time || "Not specified"}</li>
          <li><b>Address:</b> ${address}, ${pincode}</li>
        </ul>
        <p>Our team will arrive as scheduled. Thank you for trusting us!</p>
        ${footer}
      `;
      break;

    case "rescheduled":
      subject = "📅 Your Service Has Been Rescheduled";
      html = `
        ${header}
        <h2 style="color:#d97706;">Dear ${name},</h2>
        <p>Your booking has been <b style="color:#d97706;">rescheduled</b>.</p>
        <ul>
          <li><b>New Date:</b> ${date || "Not specified"}</li>
          <li><b>New Time:</b> ${time || "Not specified"}</li>
          <li><b>Service:</b> ${serviceType}</li>
          <li><b>Address:</b> ${address}, ${pincode}</li>
        </ul>
        <p><b>Reason:</b> ${reason || "Not specified"}</p>
        ${footer}
      `;
      break;

    case "cancelled":
      subject = "❌ Your Pest Control Service Has Been Cancelled";
      html = `
        ${header}
        <h2 style="color:#dc2626;">Dear ${name},</h2>
        <p>We regret to inform you that your booking has been <b style="color:#dc2626;">cancelled</b>.</p>
        <p><b>Reason:</b> ${reason || "Not specified"}</p>
        <p>You may book again anytime. We’ll be happy to serve you.</p>
        ${footer}
      `;
      break;

    case "completed":
      subject = "🎉 Your Pest Control Service is Completed";
      html = `
        ${header}
        <h2 style="color:#0e7490;">Dear ${name},</h2>
        <p>Your pest control service has been <b>successfully completed</b>.</p>
        <p>Thank you for choosing us. We hope you’re satisfied!</p>
        ${footer}
      `;
      break;

    default:
      return;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured - skipping status email");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
    console.log(`✅ Status email (${status}) sent to ${email}`);
  } catch (err) {
    console.error(`❌ Error sending status email (${status}) to ${email}:`, err.message);
    console.error("   Full error:", err);
    if (err.code === "EAUTH") {
      console.error("   ⚠️  Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env");
    }
  }
}

async function sendAdminNewBookingEmail(booking) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured - skipping admin notification");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: getAdminEmail(),
      subject: "📩 New Booking Received",
      html: `
        <h2>New Booking Received</h2>
        <ul>
          <li><b>Name:</b> ${booking.name}</li>
          <li><b>Phone:</b> ${booking.phone}</li>
          <li><b>Email:</b> ${booking.email}</li>
          <li><b>Service:</b> ${booking.serviceType}</li>
          <li><b>Date:</b> ${booking.date || "Not specified"}</li>
          <li><b>Time:</b> ${booking.time || "Not specified"}</li>
          <li><b>Address:</b> ${booking.address}, ${booking.pincode}</li>
        </ul>
      `,
    });
    console.log(`✅ Admin notification sent for booking ${booking._id}`);
  } catch (err) {
    console.error("❌ Error sending admin new booking email:", err.message);
    console.error("   Full error:", err);
    if (err.code === "EAUTH") {
      console.error("   ⚠️  Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env");
    }
  }
}

// ======================
// Public Routes
// ======================
router.post("/bookings", async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      serviceAddress,
      pincode,
      serviceType,
      urgency,
      date,
      time,
      description,
    } = req.body;

    if (!fullName || !phoneNumber || !email || !serviceAddress || !pincode || !serviceType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (!verifiedEmails.has(email)) {
      return res.status(403).json({ success: false, message: "OTP not verified for this email" });
    }

    if (isPastDateTime(date, time)) {
      return res.status(400).json({ success: false, message: "Date/time is in the past" });
    }

    const newBooking = new Booking({
      name: sanitizeString(fullName),
      phone: sanitizeString(phoneNumber),
      email: sanitizeString(email),
      address: sanitizeString(serviceAddress),
      pincode: sanitizeString(pincode),
      serviceType: sanitizeString(serviceType),
      urgency: sanitizeString(urgency) || "Normal (3-5 days)",
      date: sanitizeString(date) || "",
      time: sanitizeString(time) || "",
      instructions: sanitizeString(description) || "",
      status: "pending",
      verified: true,
    });

    const savedBooking = await newBooking.save();
    verifiedEmails.delete(email);

    await sendStatusEmail(savedBooking, "new");
    await sendAdminNewBookingEmail(savedBooking);

    res.status(201).json({ success: true, booking: savedBooking });
  } catch (err) {
    console.error("❌ Error saving booking:", err);
    res.status(500).json({ success: false, message: "Booking failed" });
  }
});

// ======================
// Admin Routes (JWT protected)
// ======================
router.get("/admin/bookings", adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin add booking
router.post("/admin/bookings", adminAuth, async (req, res) => {
  try {
    const { name, phone, email, address, pincode, serviceType, urgency, date, time, instructions } = req.body;

    if (!name || !phone || !email || !address || !pincode || !serviceType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newBooking = new Booking({
      name: sanitizeString(name),
      phone: sanitizeString(phone),
      email: sanitizeString(email),
      address: sanitizeString(address),
      pincode: sanitizeString(pincode),
      serviceType: sanitizeString(serviceType),
      urgency: sanitizeString(urgency) || "Normal (3-5 days)",
      date: sanitizeString(date) || "",
      time: sanitizeString(time) || "",
      instructions: sanitizeString(instructions) || "",
      status: "pending",
      verified: true,
    });

    const savedBooking = await newBooking.save();

    await sendStatusEmail(savedBooking, "new");
    await sendAdminNewBookingEmail(savedBooking);

    res.status(201).json({ success: true, booking: savedBooking });
  } catch (err) {
    console.error("❌ Error admin creating booking:", err);
    res.status(500).json({ success: false, message: "Booking create failed" });
  }
});

// ======================
// Status update + reschedule
// ======================
router.patch("/admin/bookings/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.status = status;
    await booking.save();

    if (status !== "pending") {
      await sendStatusEmail(booking, status, reason);
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/admin/bookings/:id/reschedule", adminAuth, async (req, res) => {
  try {
    const { date, time, reason } = req.body;
    if (!date || !time) {
      return res.status(400).json({ success: false, message: "Date and time are required" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    booking.date = date;
    booking.time = time;
    booking.status = "confirmed";

    await booking.save();
    await sendStatusEmail(booking, "rescheduled", reason);

    res.json({ success: true, booking });
  } catch (err) {
    console.error("❌ Error rescheduling booking:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/admin/stats", adminAuth, async (req, res) => {
  try {
    const pending = await Booking.countDocuments({ status: "pending" });
    const confirmed = await Booking.countDocuments({ status: "confirmed" });
    const completed = await Booking.countDocuments({ status: "completed" });
    const cancelled = await Booking.countDocuments({ status: "cancelled" });
    const total = await Booking.countDocuments();

    res.json({ success: true, stats: { pending, confirmed, completed, cancelled, total } });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// CRON: Daily 9AM reminders + digest
// ======================
async function sendReminderEmail(booking) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured - skipping reminder email");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: "⏰ Reminder: Pest Control Service Tomorrow",
      html: `
        <h2>Dear ${booking.name},</h2>
        <p>This is a reminder that your <b>${booking.serviceType}</b> service is scheduled for tomorrow.</p>
        <ul>
          <li><b>Date:</b> ${booking.date}</li>
          <li><b>Time:</b> ${booking.time || "Not specified"}</li>
          <li><b>Address:</b> ${booking.address}, ${booking.pincode}</li>
        </ul>
        <p>– Shree Pest Control Services 🐜</p>
      `,
    });
    console.log(`✅ Reminder sent to ${booking.email}`);
  } catch (err) {
    console.error(`❌ Reminder email error for ${booking.email}:`, err.message);
    console.error("   Full error:", err);
  }
}

async function sendAdminReminder(booking) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured - skipping admin reminder");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: getAdminEmail(),
      subject: "⏰ Reminder: Booking Scheduled Tomorrow",
      html: `
        <h2>Reminder: Upcoming Service</h2>
        <ul>
          <li><b>Customer:</b> ${booking.name}</li>
          <li><b>Phone:</b> ${booking.phone}</li>
          <li><b>Service:</b> ${booking.serviceType}</li>
          <li><b>Date:</b> ${booking.date}</li>
          <li><b>Time:</b> ${booking.time || "Not specified"}</li>
          <li><b>Address:</b> ${booking.address}, ${booking.pincode}</li>
        </ul>
      `,
    });
    console.log(`✅ Admin reminder sent for ${booking._id}`);
  } catch (err) {
    console.error(`❌ Admin reminder error for booking ${booking._id}:`, err.message);
    console.error("   Full error:", err);
  }
}

async function sendAdminDigest(bookings) {
  if (!bookings.length) return;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured - skipping admin digest");
    return;
  }

  try {
    const rows = bookings
      .map(
        (b) =>
          `<tr><td>${b.name}</td><td>${b.phone}</td><td>${b.serviceType}</td><td>${b.date}</td><td>${b.time}</td></tr>`
      )
      .join("");

    await transporter.sendMail({
      from: `"Shree Pest Control" <${process.env.EMAIL_USER}>`,
      to: getAdminEmail(),
      subject: "📅 Daily Booking Digest",
      html: `
        <h2>Tomorrow's Confirmed Bookings</h2>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
          <tr><th>Name</th><th>Phone</th><th>Service</th><th>Date</th><th>Time</th></tr>
          ${rows}
        </table>
      `,
    });
    console.log("✅ Admin digest sent");
  } catch (err) {
    console.error("❌ Digest email error:", err.message);
    console.error("   Full error:", err);
  }
}

cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Running daily reminder + digest job");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tDate = tomorrow.toISOString().split("T")[0];

  try {
    const bookings = await Booking.find({ status: "confirmed", date: tDate });
    for (const b of bookings) {
      await sendReminderEmail(b);
      await sendAdminReminder(b);
    }
    await sendAdminDigest(bookings);
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});

export default router;
