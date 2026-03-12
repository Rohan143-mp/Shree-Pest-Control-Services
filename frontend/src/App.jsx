import { Routes, Route } from "react-router-dom";
import Portfolio from "./pages/Portfolio";
import ServiceDetail from "./pages/ServiceDetail";
import Booking from "./pages/Booking";
import AdminPage from "./pages/AdminPage";
import BookingSuccess from "./pages/BookingSuccess"; 
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Portfolio />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/booking-success" element={<BookingSuccess />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
