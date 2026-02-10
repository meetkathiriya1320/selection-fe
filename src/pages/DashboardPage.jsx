import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import AdminOrderDetailsModal from "../components/features/AdminOrderDetailsModal"; // Reuse for now
import {
  Loader2,
  Calendar,
  Package,
  Clock,
  ChevronRight,
  History,
  Eye,
} from "lucide-react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrderId, setViewOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/order/my");
        setOrders(response.data.data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="container">
          <h1 className="dashboard-title">My Account</h1>
          <p className="dashboard-subtitle">
            Welcome, {user?.name}. Manage your curated selections and orders.
          </p>
        </div>
      </div>

      <div className="dashboard-container">
        <section>
          <div className="section-heading-row">
            <h2 className="section-title">Order History</h2>
            <Link to="/selections" className="browse-link">
              Browse New Selections <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                <Package size={32} />
              </div>
              <h3>No orders placed yet</h3>
              <p>
                Your collection awaits. Start your journey with our exclusive
                pieces.
              </p>
              <Link to="/selections">
                <Button size="lg" className="explore-btn">
                  View Collection
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {orders.map((order) => (
                <div key={order._id} className="booking-card">
                  <div className="booking-status-strip accent-${order.status}"></div>
                  <div className="booking-info">
                    <div className="booking-main-header">
                      <h3 className="booking-item-name">
                        {order.items_count} Item
                        {order.items_count !== 1 ? "s" : ""}
                      </h3>
                      <span className={`booking-status status-${order.status}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>

                    <div className="booking-details-grid">
                      <div className="detail-item">
                        <span className="label">Order ID</span>
                        <span className="value">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Date</span>
                        <span className="value">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Total Amount</span>
                        <span className="value highlight">
                          ₹
                          {(order.total_deposit
                            ? order.total_amount + order.total_deposit
                            : order.total_amount * 1.5
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-actions">
                    <Button
                      variant="outline"
                      className="view-btn"
                      onClick={() => setViewOrderId(order._id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reuse the Order Details Modal */}
        <AdminOrderDetailsModal
          isOpen={!!viewOrderId}
          onClose={() => setViewOrderId(null)}
          orderId={viewOrderId}
          isUserView={true}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
