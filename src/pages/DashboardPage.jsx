import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { getSecureImageUrl } from "../utils/imageUtils";
import Button from "../components/common/Button";
import AdminOrderDetailsModal from "../components/features/AdminOrderDetailsModal";
import { Loader2, Package, ChevronRight, Heart, Trash2 } from "lucide-react";
import "./Dashboard.css";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrderId, setViewOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "wishlist"

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

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="container">
          <h1 className="dashboard-title">My Account</h1>
          <p className="dashboard-subtitle">
            Manage your orders and account details, {user?.name || "User"}
          </p>
        </div>
      </div>

      <div className="dashboard-container">
        {/* Tab Switcher */}
        <div className="dashboard-tabs">
          <button
            className={`dash-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Package size={16} /> Order History
          </button>
          <button
            className={`dash-tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            <Heart
              size={16}
              fill={activeTab === "wishlist" ? "currentColor" : "none"}
            />
            Wishlist
            {wishlist.length > 0 && (
              <span className="tab-badge">{wishlist.length}</span>
            )}
          </button>
        </div>

        {/* ── Orders Tab ── */}
        {activeTab === "orders" && (
          <section>
            <div className="section-heading-row">
              <h2 className="section-title">Order History</h2>
              <Link to="/selections" className="browse-link">
                Browse Selections <ChevronRight size={16} />
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
                <h3>No orders yet</h3>
                <p>Your wardrobe collection awaits.</p>
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
                    <div
                      className={`booking-status-strip accent-${order.status}`}
                    ></div>
                    <div className="booking-info">
                      <div className="booking-main-header">
                        <h3 className="booking-item-name">
                          {order.items_count} Item
                          {order.items_count !== 1 ? "s" : ""}
                        </h3>
                        <span
                          className={`booking-status status-${order.status}`}
                        >
                          {getStatusLabel(order.status)}
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
        )}

        {/* ── Wishlist Tab ── */}
        {activeTab === "wishlist" && (
          <section>
            <div className="section-heading-row">
              <h2 className="section-title">My Wishlist</h2>
              <Link to="/selections" className="browse-link">
                Browse More <ChevronRight size={16} />
              </Link>
            </div>

            {wishlist.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <Heart size={32} />
                </div>
                <h3>No saved items</h3>
                <p>Heart items you love to save them here.</p>
                <Link to="/selections">
                  <Button size="lg" className="explore-btn">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map((item) => (
                  <div key={item._id} className="wishlist-card">
                    <Link
                      to={`/selections/${item._id}`}
                      className="wishlist-card-img-link"
                    >
                      <img
                        src={
                          getSecureImageUrl(item.photos?.[0] || item.photo) ||
                          "https://via.placeholder.com/300x400"
                        }
                        alt={item.name}
                      />
                    </Link>
                    <div className="wishlist-card-info">
                      <span className="wishlist-category">{item.category}</span>
                      <h4 className="wishlist-name">{item.name}</h4>
                      <div className="wishlist-bottom">
                        <span className="wishlist-price">
                          ₹{Number(item.price).toLocaleString()}
                        </span>
                        <div className="wishlist-actions">
                          <Link to={`/selections/${item._id}`}>
                            <button className="wl-view-btn">View</button>
                          </Link>
                          <button
                            className="wl-remove-btn"
                            onClick={() => removeFromWishlist(item._id)}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

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
