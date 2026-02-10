import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../common/Button";
import { Loader2, Plus, Eye, Edit2, Search } from "lucide-react";
import toast from "react-hot-toast";

import AdminAddBookingModal from "./AdminAddBookingModal";
import AdminOrderDetailsModal from "./AdminOrderDetailsModal";
import AdminEditOrderModal from "./AdminEditOrderModal";

const AdminBookings = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // View Details State
  const [viewOrderId, setViewOrderId] = useState(null);
  const [editOrderId, setEditOrderId] = useState(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const orderId = order._id.toLowerCase();
    const userName = order.user_id?.name?.toLowerCase() || "";
    const userEmail = order.user_id?.email?.toLowerCase() || "";

    return (
      orderId.includes(term) ||
      userName.includes(term) ||
      userEmail.includes(term)
    );
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/order");
      setOrders(response.data.data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAdded = () => {
    fetchOrders();
  };

  if (loading)
    return (
      <div className="flex-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div>
      <div
        className="admin-section-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="admin-section-title">All Bookings (Grouped)</h2>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              placeholder="Search ID, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px 8px 36px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "0.9rem",
                width: "250px",
                outline: "none",
              }}
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus size={16} style={{ marginRight: "6px" }} /> Add Booking
          </Button>
        </div>
      </div>

      <AdminAddBookingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBookingAdded={handleBookingAdded}
      />

      <AdminOrderDetailsModal
        isOpen={!!viewOrderId}
        onClose={() => setViewOrderId(null)}
        orderId={viewOrderId}
      />

      <AdminEditOrderModal
        isOpen={!!editOrderId}
        onClose={() => setEditOrderId(null)}
        orderId={editOrderId}
        onUpdate={fetchOrders}
      />

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td style={{ color: "var(--text-muted)" }}>
                  #{order._id.slice(-6)}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>
                    {order.user_id?.name || "Unknown"}
                  </div>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    {order.user_id?.email}
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 600,
                      background: "#f3f4f6",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                    }}
                  >
                    {order.items_count} Items
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>
                  ₹
                  {(order.total_deposit
                    ? order.total_amount + order.total_deposit
                    : order.total_amount * 1.5
                  ).toLocaleString()}
                </td>
                <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewOrderId(order._id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Eye size={16} /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditOrderId(order._id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center"
                  style={{ padding: "2rem" }}
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;
