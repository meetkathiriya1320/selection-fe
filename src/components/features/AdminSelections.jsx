import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { getSecureImageUrl } from "../../utils/imageUtils";
import Button from "../common/Button";
import { Loader2, Plus, Trash, Edit } from "lucide-react";

import toast from "react-hot-toast";
import { showConfirmationToast } from "../../utils/toastUtils";
import AdminAddSelectionModal from "./AdminAddSelectionModal";

const AdminSelections = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSelection, setEditingSelection] = useState(null);

  useEffect(() => {
    fetchSelections();
  }, []);

  const fetchSelections = async () => {
    try {
      const response = await api.get("/selection");
      setSelections(response.data.data);
    } catch (error) {
      console.error("Failed to fetch selections");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmationToast("Delete this item?", async () => {
      try {
        await api.delete(`/selection/${id}`);
        await fetchSelections(); // Ensure state sync with backend
        toast.success("Selection deleted");
      } catch (error) {
        console.error("Delete failed", error);
        toast.error("Failed to delete. Please try again.");
      }
    });
  };

  const handleEdit = (selection) => {
    setEditingSelection(selection);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingSelection(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchSelections();
  };

  if (loading)
    return (
      <div className="flex-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Manage Selections</h2>
        <Button variant="primary" size="sm" onClick={handleAddNew}>
          <Plus size={16} style={{ marginRight: "0.5rem" }} /> Add New
        </Button>
      </div>

      <div className="items-grid">
        {selections.map((item) => (
          <div key={item._id} className="item-row">
            <div className="flex" style={{ gap: "0.25rem" }}>
              <img
                src={
                  getSecureImageUrl(item.photos?.[0] || item.photo) ||
                  "https://via.placeholder.com/100"
                }
                alt=""
                className="item-image"
              />
              {item.photos?.length > 1 && (
                <div
                  style={{
                    width: "20px",
                    background: "#eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    borderRadius: "4px",
                  }}
                >
                  +{item.photos.length - 1}
                </div>
              )}
            </div>

            <div className="item-info">
              <h4 className="item-title">{item.name}</h4>
              <p className="item-meta">
                ₹{item.price} | SKU: {item.SKU}
              </p>
            </div>
            <div className="item-actions">
              <button className="action-btn" onClick={() => handleEdit(item)}>
                <Edit size={18} />
              </button>
              <button
                className="action-btn delete"
                onClick={() => handleDelete(item._id)}
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selections.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p>No items found. Click "Add New" to create one.</p>
        </div>
      )}

      {/* Modal */}
      <AdminAddSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editSelection={editingSelection}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default AdminSelections;
