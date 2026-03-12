import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import servicesData from "../data/servicesData";
import "../styles.css";

const serviceablePincodes = ["560001", "560002", "560003", "400001", "400002"];

export default function Booking() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    serviceAddress: "",
    pincode: "",
    serviceType: "",
    urgency: "",
    date: "",
    time: "",
    description: "",
  });

  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [pincodeValid, setPincodeValid] = useState(null);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "pincode") {
      if (value.length === 6) {
        setPincodeValid(serviceablePincodes.includes(value));
      } else {
        setPincodeValid(null);
      }
    }
  };

  // Get selected service price
  const selectedService = servicesData.find((s) => s.title === formData.serviceType);
  const selectedPrice = selectedService ? selectedService.price : null;

  // Send OTP
  const sendOtp = async () => {
    if (!formData.email) {
      setMessage("Please enter your email first.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/send-otp", {
        email: formData.email,
      });
      setOtpModal(true);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setCooldown(30);

      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setMessage("Failed to send OTP. Try again.");
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    try {
      const code = otp.join("");
      const res = await axios.post("http://localhost:5000/api/verify-otp", {
        email: formData.email,
        otp: code,
      });
      if (res.data.success) {
        setOtpModal(false);
        setMessage("OTP verified ✅ Please confirm your booking.");
        handleBooking();
      } else {
        setOtpError("Invalid OTP ❌");
      }
    } catch (err) {
      setOtpError("Invalid OTP ❌");
    }
  };

  // Save booking
  const handleBooking = async () => {
    if (!pincodeValid) {
      setMessage("❌ Sorry, we don’t provide service in this pincode.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/bookings", formData);

      if (res.data.success) {
        localStorage.setItem("lastBooking", JSON.stringify(res.data.booking));
        navigate("/booking-success", { state: { booking: res.data.booking } });
      }
    } catch (err) {
      setMessage("Booking failed: " + (err.response?.data?.message || "Please try again"));
    }
  };

  // OTP input (with backspace navigation)
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ""); // only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="main">
      <div className="card fixed-width">
        <h2 className="title">🐜 Book Pest Control Service</h2>

        {message && <div className="p-2 text-center text-sm text-red-600">{message}</div>}

        <div className="form-grid">
          <div className="field wide">
            <label>Full Name *</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Phone *</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="field wide">
            <label>Service Address *</label>
            <input type="text" name="serviceAddress" value={formData.serviceAddress} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Pincode *</label>
            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength="6" required />
            <div className="pincode-status">
              {pincodeValid === true && <span className="text-green">✅ Service available</span>}
              {pincodeValid === false && <span className="text-red">❌ Not serviceable</span>}
            </div>
          </div>

          <div className="field">
            <label>Service *</label>
            <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
              <option value="">Select Service</option>
              {servicesData.map((s) => (
                <option key={s.id} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Urgency *</label>
            <select name="urgency" value={formData.urgency} onChange={handleChange} required>
              <option value="">Select Urgency</option>
              <option value="Normal (2–4 days)">Normal (2–4 days)</option>
              <option value="Urgent (within 24h)">Urgent (within 24h)</option>
            </select>
          </div>

          <div className="field">
            <label>Date *</label>
            <input type="date" name="date" value={formData.date} min={today} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Time *</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} required />
          </div>

          <div className="field wide">
            <label>Additional Instructions</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="no-resize"></textarea>
          </div>
        </div>

        {selectedPrice && <div className="price-box">💰 Price: ₹{selectedPrice}</div>}

        <button type="button" className="primary" onClick={sendOtp}>
          Get OTP
        </button>
      </div>

      {/* OTP Modal */}
      {otpModal && (
        <div className="modal-overlay">
          <div className="modal animate-fade-in">
            <h3 className="mb-2">🔐 Verify Your Email</h3>
            <p className="mb-4 text-sm text-gray-600">Dear Customer,<br />Please enter the 6-digit OTP we sent to your email.<br />– Shree Pest Control Services</p>
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className={`otp-input ${otpError ? "shake" : ""}`}
                />
              ))}
            </div>
            {otpError && <div className="text-red-600">{otpError}</div>}
            <button className="primary mt-3" onClick={verifyOtp}>Confirm Booking</button>
            <div className="modal-actions">
              <button className="resend-btn" onClick={sendOtp} disabled={cooldown > 0}>
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
              <button className="cancel-btn" onClick={() => setOtpModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
