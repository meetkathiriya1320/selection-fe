import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import Button from "../common/Button";
import { X, Plus, Trash2, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import "./AdminAddBookingModal.css";

const AdminAddBookingModal = ({ isOpen, onClose, onBookingAdded }) => {
  const [users, setUsers] = useState([]);
  const [selections, setSelections] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Form State
  const [selecteduserId, setSelectedUserId] = useState("");
  const [cart, setCart] = useState([]);

  // Current Item State
  const [currentItemId, setCurrentItemId] = useState("");
  const [currentTop, setCurrentTop] = useState("");
  const [currentBottom, setCurrentBottom] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [deliverDate, setDeliverDate] = useState("");
  const [receiveDate, setReceiveDate] = useState("");

  const [submissionLoading, setSubmissionLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      setCart([]);
      setSelectedUserId("");
      resetCurrentItem();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const [usersRes, selectionsRes] = await Promise.all([
        api.get("/user/users"),
        api.get("/selection"),
      ]);
      setUsers(usersRes.data.data || []);
      setSelections(selectionsRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load configuration");
    } finally {
      setLoadingConfig(false);
    }
  };

  const resetCurrentItem = () => {
    setCurrentItemId("");
    setCurrentTop("");
    setCurrentBottom("");
    setCurrentColor("");
    setDeliverDate("");
    setReceiveDate("");
  };

  const handleAddItem = () => {
    if (!currentItemId) return toast.error("Select an item");
    if (!deliverDate || !receiveDate) return toast.error("Select dates");

    const item = selections.find((s) => s._id === currentItemId);
    if (!item) return;

    if (item.topSizes?.length > 0 && !currentTop)
      return toast.error("Select Top Size");
    if (item.bottomSizes?.length > 0 && !currentBottom)
      return toast.error("Select Bottom Size");
    if (item.colors?.length > 0 && !currentColor)
      return toast.error("Select Color");

    const cartItem = {
      tempId: Date.now(),
      selection: item,
      topSize: currentTop,
      bottomSize: currentBottom,
      color: currentColor,
      deliverDate,
      receiveDate,
    };

    setCart([...cart, cartItem]);
    resetCurrentItem();
  };

  const handleRemoveItem = (tempId) => {
    setCart(cart.filter((i) => i.tempId !== tempId));
  };

  const handleSubmit = async () => {
    if (!selecteduserId) return toast.error("Select a User");
    if (cart.length === 0) return toast.error("Add at least one item");

    setSubmissionLoading(true);
    try {
      for (const item of cart) {
        const payload = {
          user_id: selecteduserId,
          selection_id: item.selection._id,
          deposit: item.selection.price * 0.5,
          pay: item.selection.price,
          selectedTopSize: item.topSize,
          selectedBottomSize: item.bottomSize,
          selectedColor: item.color,
          deliver_date: item.deliverDate,
          receive_date: item.receiveDate,
        };
        await api.post("/booking", payload);
      }
      toast.success("Bookings created successfully");
      onBookingAdded();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create bookings");
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentSelection = selections.find((s) => s._id === currentItemId);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">New Admin Booking</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loadingConfig ? (
            <div className="loading-state">Loading configuration...</div>
          ) : (
            <div className="modal-grid">
              {/* Left: Configuration */}
              <div className="config-column">
                {/* 1. User Selection */}
                <div className="form-group">
                  <label className="input-label">Select User</label>
                  <select
                    className="form-select"
                    value={selecteduserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">-- Choose User --</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="divider" />

                {/* 2. Add Item */}
                <div className="add-item-box">
                  <h3 className="box-title">Add Item to Order</h3>

                  <div className="form-group">
                    <select
                      className="form-select"
                      value={currentItemId}
                      onChange={(e) => {
                        setCurrentItemId(e.target.value);
                        setCurrentTop("");
                        setCurrentBottom("");
                        setCurrentColor("");
                      }}
                    >
                      <option value="">-- Select Selection --</option>
                      {selections.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} {s.SKU && `- ${s.SKU}`} (₹{s.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentSelection && (
                    <>
                      {/* Selected Item Image */}
                      {(currentSelection.photos?.[0] ||
                        currentSelection.photo) && (
                        <div
                          style={{
                            marginTop: "1rem",
                            marginBottom: "0.5rem",
                            textAlign: "center",
                          }}
                        >
                          <img
                            src={
                              currentSelection.photos?.[0] ||
                              currentSelection.photo
                            }
                            alt={currentSelection.name}
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              borderRadius: "4px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        </div>
                      )}

                      {/* Options */}
                      <div className="options-grid">
                        {currentSelection.topSizes?.length > 0 && (
                          <select
                            className="form-select"
                            value={currentTop}
                            onChange={(e) => setCurrentTop(e.target.value)}
                          >
                            <option value="">Top Size</option>
                            {currentSelection.topSizes.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                        {currentSelection.bottomSizes?.length > 0 && (
                          <select
                            className="form-select"
                            value={currentBottom}
                            onChange={(e) => setCurrentBottom(e.target.value)}
                          >
                            <option value="">Bottom Size</option>
                            {currentSelection.bottomSizes.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                        {currentSelection.colors?.length > 0 && (
                          <select
                            className="form-select full-width"
                            value={currentColor}
                            onChange={(e) => setCurrentColor(e.target.value)}
                          >
                            <option value="">Color</option>
                            {currentSelection.colors.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="options-grid">
                        <div>
                          <label
                            className="input-label"
                            style={{
                              marginBottom: "0.25rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            Delivery
                          </label>
                          <input
                            type="date"
                            className="form-input"
                            value={deliverDate}
                            onChange={(e) => setDeliverDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label
                            className="input-label"
                            style={{
                              marginBottom: "0.25rem",
                              fontSize: "0.75rem",
                            }}
                          >
                            Return
                          </label>
                          <input
                            type="date"
                            className="form-input"
                            value={receiveDate}
                            onChange={(e) => setReceiveDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={handleAddItem}
                        style={{ width: "100%", marginTop: "0.5rem" }}
                      >
                        <Plus size={16} style={{ marginRight: "4px" }} /> Add to
                        Cart
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Cart */}
              <div className="cart-column">
                <div className="cart-header">
                  <span>Booking Summary</span>
                  <span className="badge">{cart.length} Items</span>
                </div>

                <div className="cart-items-wrapper">
                  {cart.length === 0 ? (
                    <p className="empty-cart-msg">No items added yet.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.tempId} className="cart-item-card">
                        <div className="item-name">{item.selection.name}</div>
                        <div className="item-specs">
                          {item.topSize && (
                            <span className="spec-badge">
                              T: {item.topSize}
                            </span>
                          )}
                          {item.bottomSize && (
                            <span className="spec-badge">
                              B: {item.bottomSize}
                            </span>
                          )}
                          {item.color && (
                            <span className="spec-badge">{item.color}</span>
                          )}
                        </div>
                        <div className="item-dates">
                          {item.deliverDate} {"->"} {item.receiveDate}
                        </div>
                        <div className="item-price">
                          ₹{item.selection.price.toLocaleString()}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.tempId)}
                          className="remove-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="cart-footer">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>
                      ₹
                      {cart
                        .reduce((sum, item) => sum + item.selection.price, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="total-row">
                    <span>Deposit (50%)</span>
                    <span>
                      ₹
                      {(
                        cart.reduce(
                          (sum, item) => sum + item.selection.price,
                          0,
                        ) * 0.5
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="total-row highlight">
                    <span>Total Amount</span>
                    <span>
                      ₹
                      {(
                        cart.reduce(
                          (sum, item) => sum + item.selection.price,
                          0,
                        ) * 1.5
                      ).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    style={{ width: "100%" }}
                    onClick={handleSubmit}
                    isLoading={submissionLoading}
                    disabled={cart.length === 0 || !selecteduserId}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAddBookingModal;
