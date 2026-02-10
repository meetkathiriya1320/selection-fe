import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import "./AdminOrderDetailsModal.css";

const AdminOrderDetailsModal = ({
  isOpen,
  onClose,
  orderId,
  isUserView = false,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDetails();
    }
  }, [isOpen, orderId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/order/${orderId}`);
      setData(res.data.data); // { order, items }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId, type, newStatus) => {
    try {
      const payload = { [type]: newStatus };
      await api.put(`/selection-order/${itemId}/status`, payload);
      toast.success(`${type.replace("_", " ")} updated`);
      fetchDetails(); // Refresh
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-GB");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content order-details-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            Order Details{" "}
            <span style={{ color: "#64748b" }}>
              #{orderId.slice(-6).toUpperCase()}
            </span>
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : data ? (
            <div>
              {/* Summary Cards */}
              <div
                className={`order-summary-grid ${isUserView ? "user-view" : ""}`}
              >
                {!isUserView && (
                  <div className="summary-card">
                    <div className="summary-label">User Info</div>
                    <div className="summary-value">
                      {data.order.user_id?.name}
                    </div>
                    <div className="summary-sub">
                      {data.order.user_id?.email}
                    </div>
                  </div>
                )}
                <div className="summary-card">
                  <div className="summary-label">Subtotal</div>
                  <div className="summary-value">
                    ₹{data.order.total_amount.toLocaleString()}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Deposit (50%)</div>
                  <div className="summary-value">
                    ₹
                    {(data.order.total_deposit
                      ? data.order.total_deposit
                      : data.order.total_amount * 0.5
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Amount</div>
                  <div className="summary-value highlight">
                    ₹
                    {(data.order.total_deposit
                      ? data.order.total_amount + data.order.total_deposit
                      : data.order.total_amount * 1.5
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Items</div>
                  <div className="summary-value">{data.order.items_count}</div>
                  <div className="summary-sub">Items in this order</div>
                </div>
              </div>

              {/* Items Table */}
              <h3 className="items-section-title">Ordered Items</h3>
              <div className="order-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>Item</th>
                      <th style={{ width: "15%" }}>Specs</th>
                      <th style={{ width: "15%" }}>Dates</th>
                      <th style={{ width: "15%" }}>Order Status</th>
                      <th style={{ width: "15%" }}>Payment</th>
                      <th style={{ width: "15%" }}>Deposit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item._id}>
                        {/* 1. Item Info */}
                        <td>
                          <div className="item-name">
                            {item.selection_id?.name}
                          </div>
                          <div className="item-sku">
                            SKU: {item.selection_id?.SKU}
                          </div>
                        </td>

                        {/* 2. Specs */}
                        <td>
                          <div className="spec-badges">
                            {item.selectedTopSize && (
                              <span className="spec-tag">
                                T: {item.selectedTopSize}
                              </span>
                            )}
                            {item.selectedBottomSize && (
                              <span className="spec-tag">
                                B: {item.selectedBottomSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="spec-tag">
                                {item.selectedColor}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. Dates */}
                        <td>
                          <div className="date-info">
                            <div>
                              <span className="date-label">From:</span>
                              {formatDate(item.deliver_date)}
                            </div>
                            <div>
                              <span className="date-label">To:</span>
                              {formatDate(item.receive_date)}
                            </div>
                          </div>
                        </td>

                        {/* 4. Order Status */}
                        <td>
                          {isUserView ? (
                            <span
                              className={`status-lock status-${item.status}`}
                            >
                              {item.status}
                            </span>
                          ) : (
                            <select
                              className={`status-select status-${item.status}`}
                              value={item.status}
                              onChange={(e) =>
                                handleStatusUpdate(
                                  item._id,
                                  "status",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="delivered">Delivered</option>
                              <option value="received">Received</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>

                        {/* 5. Payment Status */}
                        <td>
                          {isUserView ? (
                            <span
                              className={`status-lock status-${item.payment_status || "pending"}`}
                            >
                              {item.payment_status || "Pending"}
                            </span>
                          ) : (
                            <select
                              className={`status-select status-${item.payment_status || "pending"}`}
                              value={item.payment_status || "pending"}
                              onChange={(e) =>
                                handleStatusUpdate(
                                  item._id,
                                  "payment_status",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                            </select>
                          )}
                        </td>

                        {/* 6. Deposit Status */}
                        <td>
                          {isUserView ? (
                            <span
                              className={`status-lock status-${item.deposit_status || "pending"}`}
                            >
                              {item.deposit_status || "Pending"}
                            </span>
                          ) : (
                            <select
                              className={`status-select status-${item.deposit_status || "pending"}`}
                              value={item.deposit_status || "pending"}
                              onChange={(e) =>
                                handleStatusUpdate(
                                  item._id,
                                  "deposit_status",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="received">Received</option>
                              <option value="returned">Returned</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="loading-state">Order not found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailsModal;
