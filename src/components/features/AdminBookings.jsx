import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../common/Button";
import { Loader2, Plus, Eye } from "lucide-react";
import toast from "react-hot-toast";

import AdminAddBookingModal from "./AdminAddBookingModal";
import AdminOrderDetailsModal from "./AdminOrderDetailsModal";

const AdminBookings = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // View Details State
  const [viewOrderId, setViewOrderId] = useState(null);

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
        <Button onClick={() => setShowAddModal(true)} size="sm">
          <Plus size={16} style={{ marginRight: "6px" }} /> Add Booking
        </Button>
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
            {orders.map((order) => (
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
                <td style={{ fontWeight: 600 }}>₹{order.total_amount}</td>
                <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {new Date(order.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td>
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
                    <Eye size={16} /> View Details
                  </Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
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
