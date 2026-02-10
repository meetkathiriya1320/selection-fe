import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { X, Loader2, Save, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../common/Button";
import "./AdminOrderDetailsModal.css";
import "./AdminEditOrderModal.css"; // Import new styles

const AdminEditOrderModal = ({ isOpen, onClose, orderId, onUpdate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState(null);

  // Edit State
  const [editForm, setEditForm] = useState({
    topSize: "",
    bottomSize: "",
    color: "",
    deliverDate: "",
    receiveDate: "",
  });

  useEffect(() => {
    if (isOpen && orderId) {
      fetchDetails();
    }
  }, [isOpen, orderId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/order/${orderId}`);
      setData(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingItemId(item._id);
    setEditForm({
      topSize: item.selectedTopSize || "",
      bottomSize: item.selectedBottomSize || "",
      color: item.selectedColor || "",
      deliverDate: item.deliver_date ? item.deliver_date.split("T")[0] : "",
      receiveDate: item.receive_date ? item.receive_date.split("T")[0] : "",
    });
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditForm({
      topSize: "",
      bottomSize: "",
      color: "",
      deliverDate: "",
      receiveDate: "",
    });
  };

  const handleSaveEdit = async (itemId) => {
    try {
      const payload = {
        selectedTopSize: editForm.topSize,
        selectedBottomSize: editForm.bottomSize,
        selectedColor: editForm.color,
        deliver_date: editForm.deliverDate,
        receive_date: editForm.receiveDate,
      };

      // Assuming PUT /selection-order/:id updates the item details
      await api.put(`/selection-order/${itemId}`, payload);

      toast.success("Item updated successfully");
      setEditingItemId(null);
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    try {
      await api.delete(`/selection-order/${itemId}`);
      toast.success("Item removed");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content order-details-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            Edit Order #{orderId.slice(-6).toUpperCase()}
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : data ? (
            <div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "25%" }}>Item</th>
                      <th style={{ width: "35%" }} className="editable-header">
                        Specs
                      </th>
                      <th style={{ width: "30%" }} className="editable-header">
                        Dates
                      </th>
                      <th style={{ width: "10%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="item-name">
                            {item.selection_id?.name}
                          </div>
                          <div className="item-sku">
                            SKU: {item.selection_id?.SKU}
                          </div>
                        </td>

                        {editingItemId === item._id ? (
                          // Edit Mode
                          <>
                            <td>
                              <div className="edit-grid">
                                {item.selection_id?.topSizes?.length > 0 && (
                                  <div className="input-group">
                                    <select
                                      value={editForm.topSize}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          topSize: e.target.value,
                                        })
                                      }
                                      className="edit-input"
                                    >
                                      <option value="">Top Size</option>
                                      {item.selection_id.topSizes.map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                                {item.selection_id?.bottomSizes?.length > 0 && (
                                  <div className="input-group">
                                    <select
                                      value={editForm.bottomSize}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          bottomSize: e.target.value,
                                        })
                                      }
                                      className="edit-input"
                                    >
                                      <option value="">Bottom Size</option>
                                      {item.selection_id.bottomSizes.map(
                                        (s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ),
                                      )}
                                    </select>
                                  </div>
                                )}
                                {item.selection_id?.colors?.length > 0 && (
                                  <div className="input-group">
                                    <select
                                      value={editForm.color}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          color: e.target.value,
                                        })
                                      }
                                      className="edit-input"
                                    >
                                      <option value="">Color</option>
                                      {item.selection_id.colors.map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="edit-grid">
                                <input
                                  type="date"
                                  value={editForm.deliverDate}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      deliverDate: e.target.value,
                                    })
                                  }
                                  className="edit-input"
                                />
                                <input
                                  type="date"
                                  value={editForm.receiveDate}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      receiveDate: e.target.value,
                                    })
                                  }
                                  className="edit-input"
                                />
                              </div>
                            </td>
                            <td>
                              <div className="action-row">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(item._id)}
                                >
                                  <Save size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View Mode
                          <>
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
                            <td>
                              <div className="date-info">
                                <div>
                                  From:{" "}
                                  {item.deliver_date
                                    ? new Date(
                                        item.deliver_date,
                                      ).toLocaleDateString("en-GB")
                                    : "N/A"}
                                </div>
                                <div>
                                  To:{" "}
                                  {item.receive_date
                                    ? new Date(
                                        item.receive_date,
                                      ).toLocaleDateString("en-GB")
                                    : "N/A"}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="action-row">
                                <button
                                  className="icon-btn edit"
                                  onClick={() => handleEditClick(item)}
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  className="icon-btn delete"
                                  onClick={() => handleDeleteItem(item._id)}
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>Order not found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEditOrderModal;
