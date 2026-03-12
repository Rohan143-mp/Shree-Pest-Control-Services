import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { CONTACT_NUMBER, WHATSAPP_NUMBER } from "../config";

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // Try from state, fallback to localStorage
  const stored = localStorage.getItem("lastBooking");
  const booking = location.state?.booking || (stored ? JSON.parse(stored) : null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      localStorage.removeItem("lastBooking"); // cleanup after success page load
    };
  }, []);

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No booking found. Please make a booking first.</p>
        <button
          onClick={() => navigate("/booking")}
          className="ml-2 text-[var(--aqua)] underline"
        >
          Go to Booking
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Confetti */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={200}
        recycle={false}
      />

      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md relative z-10">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          🎉 Thank You, {booking.name}!
        </h1>
        <p className="text-gray-600 mb-4">
          Your booking with <b>Shree Pest Control Services</b> has been confirmed.
          We’ll contact you shortly.
        </p>

        {/* Booking Details */}
        <div className="bg-gray-100 rounded-lg p-4 text-left mb-4 space-y-1">
          <p><b>Name:</b> {booking.name}</p>
          <p><b>Phone:</b> {booking.phone}</p>
          <p><b>Email:</b> {booking.email}</p>
          <p><b>Service:</b> {booking.serviceType}</p>
          <p><b>Urgency:</b> {booking.urgency}</p>
          <p><b>Date:</b> {booking.date}</p>
          <p><b>Time:</b> {booking.time}</p>
          <p><b>Address:</b> {booking.address}</p>
          {booking.instructions && (
            <p><b>Instructions:</b> {booking.instructions}</p>
          )}
          <p><b>Status:</b> {booking.status}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <a
            href={`tel:${CONTACT_NUMBER}`}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            📞 Call Us
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace("+", "")}?text=Hello%20Shree%20Pest%20Control,%20I%20just%20booked%20a%20service.`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            💬 WhatsApp Us
          </a>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 text-[var(--aqua)] hover:underline"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
