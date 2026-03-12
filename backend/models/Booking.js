import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true }, // ✅ added pincode
  serviceType: { type: String, required: true },
  urgency: { type: String, default: "Normal (3-5 days)" },
  date: { type: String },
  time: { type: String },
  instructions: { type: String },
  status: { type: String, default: "Pending Verification" },
  verified: { type: Boolean, default: false },
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
