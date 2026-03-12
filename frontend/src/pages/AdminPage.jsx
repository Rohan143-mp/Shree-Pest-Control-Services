// frontend/src/pages/AdminPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import logo from "../assets/logo.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Hardcoded pincodes
const serviceablePincodes = ["411001", "411002", "411003", "411004"];

// ✅ Regex validators
const validators = {
  name: (val) => /^[A-Za-z\s]{2,50}$/.test(val),
  phone: (val) => /^[0-9]{10}$/.test(val),
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  pincode: (val) => /^[0-9]{6}$/.test(val),
};

function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    pincode: "",
    serviceType: "",
    urgency: "Normal (2–4 days)",
    date: "",
    time: "",
    instructions: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings || []);
    } catch {
      toast.error("Failed to fetch bookings");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.stats || { pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
    } catch {
      toast.error("Failed to fetch stats");
    }
  };

  const updateStatus = async (id, status, date = null, time = null, reason = null) => {
    try {
      if (status === "rescheduled") {
        await axios.put(
          `${API_URL}/api/admin/bookings/${id}/reschedule`,
          { date, time, reason: reason || "Admin rescheduled" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.patch(
          `${API_URL}/api/admin/bookings/${id}/status`,
          { status, reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await Promise.all([fetchBookings(), fetchStats()]);
      toast.success(`Booking ${status} successfully!`);
    } catch (err) {
      toast.error(`Failed to update booking: ${err.message}`);
    }
  };

  const addBooking = async () => {
    // ❌ If errors exist, stop
    for (let key in formErrors) {
      if (formErrors[key]) {
        toast.error("Please fix errors before submitting");
        return;
      }
    }

    // ❌ Validate serviceable pincode
    if (!serviceablePincodes.includes(formData.pincode)) {
      toast.error("This pincode is not serviceable");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/bookings`,
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Booking added successfully");
      setShowAddBookingModal(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        pincode: "",
        serviceType: "",
        urgency: "Normal (2–4 days)",
        date: "",
        time: "",
        instructions: "",
      });
      setFormErrors({});
      await Promise.all([fetchBookings(), fetchStats()]);
    } catch {
      toast.error("Failed to add booking");
    }
  };

  const exportCSV = () => {
    if (!bookings.length) return toast.error("No data to export");
    const header = [
      "Name,Phone,Email,Address,Pincode,Service,Urgency,Date,Time,Instructions,Status",
    ];
    const rows = bookings.map(
      (b) =>
        `"${b.name}","${b.phone}","${b.email}","${b.address}","${b.pincode}","${b.serviceType}","${b.urgency}","${b.date}","${b.time}","${b.instructions}","${b.status}"`
    );
    const csv = [...header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bookings.csv";
    link.click();
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchBookings(), fetchStats()]);
      setLoading(false);
    };
    if (token) load();
  }, [token]);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || b?.status === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + rowsPerPage);

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-cyan-50 flex flex-col">
      <Toaster position="top-right" />

      {/* Navbar - logo + logout */}
      <div className="w-full bg-cyan-700 text-white flex items-center justify-between px-8 py-4 shadow-md sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-full bg-white p-1" />
          <h1 className="text-xl font-extrabold tracking-wide">Shree Pest Control Services</h1>
        </div>
        <span
          className="cursor-pointer hover:underline text-red-300 hover:text-red-400 text-base font-semibold"
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
          }}
        >
          Logout
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-10 text-base font-semibold text-cyan-700 py-4">
        <span className="cursor-pointer hover:underline" onClick={() => setShowAddBookingModal(true)}>
          + Add Booking
        </span>
        <span className="cursor-pointer hover:underline" onClick={fetchBookings}>
          Refresh
        </span>
        <span className="cursor-pointer hover:underline" onClick={exportCSV}>
          Export CSV
        </span>
      </div>

      {/* Stats */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-4 gap-6 mb-8">
          {["Pending", "Confirmed", "Completed", "Cancelled"].map((key) => (
            <motion.div key={key} className="bg-white p-6 rounded-2xl shadow text-center">
              <h2 className="text-lg font-semibold">{key}</h2>
              <p className="text-2xl">{stats[key.toLowerCase()]}</p>
            </motion.div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col items-center mb-6">
          <input
            type="text"
            placeholder="🔍 Search by name..."
            className="border border-cyan-300 rounded-lg p-2 w-full md:w-1/3 mb-4"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="flex flex-wrap justify-center gap-4">
            {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((status) => (
              <span
                key={status}
                className={`px-4 py-1 rounded-lg cursor-pointer ${
                  filter === status ? "bg-cyan-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
              >
                {status}
              </span>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto flex-1 min-h-[400px] flex flex-col">
          {loading ? (
            <p className="text-center text-gray-500 my-auto">Loading...</p>
          ) : currentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center my-auto">
              <p className="text-gray-500 text-lg">No bookings found 🐜</p>
              <button
                onClick={fetchBookings}
                className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse border">
                <thead className="bg-cyan-100">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Address</th>
                    <th className="p-2 border">Service</th>
                    <th className="p-2 border">Urgency</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Time</th>
                    <th className="p-2 border">Instructions</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentBookings.map((b) => (
                      <motion.tr
                        key={b._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center border hover:bg-cyan-50 transition"
                      >
                        <td className="p-2 border">{b?.name || "-"}</td>
                        <td className="p-2 border">{b?.phone || "-"}</td>
                        <td className="p-2 border">{b?.email || "-"}</td>
                        <td className="p-2 border">{b?.address || "-"}</td>
                        <td className="p-2 border">{b?.serviceType || "-"}</td>
                        <td className="p-2 border">{b?.urgency || "-"}</td>
                        <td className="p-2 border">{b?.date || "-"}</td>
                        <td className="p-2 border">{b?.time || "-"}</td>
                        <td className="p-2 border">{b?.instructions || "-"}</td>
                        <td className="p-2 border">
                          <StatusBadge status={b?.status} />
                        </td>
                        <td className="p-2 border">
                          {["completed", "cancelled"].includes(b?.status) ? (
                            <span className="text-gray-400 text-xs">No actions</span>
                          ) : (
                            <div className="flex flex-col space-y-1 text-sm">
                              {b?.status === "pending" && (
                                <span
                                  className="text-blue-600 cursor-pointer hover:underline"
                                  onClick={() => updateStatus(b._id, "confirmed")}
                                >
                                  Confirm
                                </span>
                              )}
                              <span
                                className="text-cyan-600 cursor-pointer hover:underline"
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setShowRescheduleModal(true);
                                }}
                              >
                                Reschedule
                              </span>
                              <span
                                className="text-green-600 cursor-pointer hover:underline"
                                onClick={() => updateStatus(b._id, "completed")}
                              >
                                Mark Done
                              </span>
                              <span
                                className="text-red-600 cursor-pointer hover:underline"
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setShowCancelModal(true);
                                }}
                              >
                                Cancel
                              </span>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4 text-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Booking Modal with Inline Validation */}
      <AnimatePresence>
        {showAddBookingModal && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <motion.div className="bg-white p-6 rounded-2xl shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4 text-cyan-700">Add Booking</h2>

              {/* Name */}
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, name: val });
                  setFormErrors({
                    ...formErrors,
                    name: !validators.name(val) ? "Enter valid name (only letters)" : "",
                  });
                }}
                className={`w-full p-2 rounded-xl mb-1 border ${
                  formErrors.name ? "border-red-500" : formData.name ? "border-green-500" : "border-gray-300"
                }`}
              />
              {formErrors.name && <p className="text-red-500 text-xs mb-2">{formErrors.name}</p>}

              {/* Phone */}
              <input
                type="text"
                placeholder="Phone (10 digits)"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, phone: val });
                  setFormErrors({
                    ...formErrors,
                    phone: !validators.phone(val) ? "Phone must be 10 digits" : "",
                  });
                }}
                className={`w-full p-2 rounded-xl mb-1 border ${
                  formErrors.phone ? "border-red-500" : formData.phone ? "border-green-500" : "border-gray-300"
                }`}
              />
              {formErrors.phone && <p className="text-red-500 text-xs mb-2">{formErrors.phone}</p>}

              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, email: val });
                  setFormErrors({
                    ...formErrors,
                    email: !validators.email(val) ? "Enter valid email" : "",
                  });
                }}
                className={`w-full p-2 rounded-xl mb-1 border ${
                  formErrors.email ? "border-red-500" : formData.email ? "border-green-500" : "border-gray-300"
                }`}
              />
              {formErrors.email && <p className="text-red-500 text-xs mb-2">{formErrors.email}</p>}

              {/* Address */}
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border rounded-xl mb-3"
              />

              {/* Pincode */}
              <input
                type="text"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, pincode: val });
                  setFormErrors({
                    ...formErrors,
                    pincode: !validators.pincode(val)
                      ? "Pincode must be 6 digits"
                      : !serviceablePincodes.includes(val)
                      ? "This pincode is not serviceable"
                      : "",
                  });
                }}
                className={`w-full p-2 rounded-xl mb-1 border ${
                  formErrors.pincode ? "border-red-500" : formData.pincode ? "border-green-500" : "border-gray-300"
                }`}
              />
              {formErrors.pincode && <p className="text-red-500 text-xs mb-2">{formErrors.pincode}</p>}

              {/* Dropdowns */}
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full p-2 border rounded-xl mb-3"
              >
                <option value="">Select Service Type</option>
                <option value="Termite Control">Termite Control</option>
                <option value="Rodent Control">Rodent Control</option>
                <option value="Cockroach Control">Cockroach Control</option>
                <option value="General Pest Control">General Pest Control</option>
              </select>

              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full p-2 border rounded-xl mb-3"
              >
                <option value="Normal (2–4 days)">Normal (2–4 days)</option>
                <option value="Urgent (Next Day)">Urgent (Next Day)</option>
                <option value="Emergency (Same Day)">Emergency (Same Day)</option>
              </select>

              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 border rounded-xl mb-3"
              />

              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-2 border rounded-xl mb-3"
              />

              <textarea
                placeholder="Instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full p-2 border rounded-xl mb-3"
              />

              <div className="flex justify-between">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-xl"
                  onClick={() => setShowAddBookingModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
                  onClick={addBooking}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPage;
