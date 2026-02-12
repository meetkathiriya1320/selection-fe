import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { getSecureImageUrl } from "../../utils/imageUtils";
import Button from "../common/Button";
import Input from "../common/Input";
import { Loader2, Plus, Trash, X, Star, Edit } from "lucide-react";

import toast from "react-hot-toast";
import { showConfirmationToast } from "../../utils/toastUtils";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    isFeatured: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      setCategories(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formPayload = new FormData();
    formPayload.append("file", file);

    try {
      setUploading(true);
      const response = await api.post("/upload", formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, image: response.data.data.url }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditing) {
        await api.put(`/category/${currentId}`, formData);
        toast.success("Category updated");
      } else {
        await api.post("/category", formData);
        toast.success("Category added");
      }
      await fetchCategories(); // Refetch to ensure state sync
      resetForm();
    } catch (error) {
      toast.error(isEditing ? "Failed to update" : "Failed to add");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (cat) => {
    setFormData({
      name: cat.name,
      image: cat.image || "",
      isFeatured: cat.isFeatured || false,
    });
    setCurrentId(cat._id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ name: "", image: "", isFeatured: false });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleToggleFeatured = async (cat) => {
    try {
      const updated = { ...cat, isFeatured: !cat.isFeatured };
      await api.put(`/category/${cat._id}`, updated);
      await fetchCategories(); // Refetch to ensure state sync
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = (id) => {
    showConfirmationToast("Delete this category?", async () => {
      try {
        await api.delete(`/category/${id}`);
        await fetchCategories(); // Refetch to ensure state sync
        toast.success("Category deleted");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    });
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
        <h2 className="admin-section-title">Manage Categories</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-form">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr auto auto",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          {/* Name Input */}
          <div style={{ paddingTop: "1px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              {isEditing ? "Edit Name" : "Category Name"}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g. Wedding"
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                fontSize: "0.95rem",
                height: "42px", // Fixed height for alignment
              }}
            />
          </div>

          {/* Image Input */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Cover Image
            </label>
            {formData.image ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  background: "white",
                  height: "42px",
                }}
              >
                <img
                  src={getSecureImageUrl(formData.image)}
                  alt="Preview"
                  style={{
                    width: "40px",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({ ...formData, image: "" })}
                  style={{
                    padding: "0.25rem",
                    height: "auto",
                    minWidth: "auto",
                    marginLeft: "auto",
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ position: "relative" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-md)",
                      background: "white",
                      fontSize: "0.9rem",
                    }}
                    disabled={uploading}
                  />
                  {uploading && (
                    <Loader2
                      className="animate-spin"
                      size={16}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "12px",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      height: "1px",
                      background: "var(--border)",
                      flex: 1,
                    }}
                  ></div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    OR
                  </span>
                  <div
                    style={{
                      height: "1px",
                      background: "var(--border)",
                      flex: 1,
                    }}
                  ></div>
                </div>

                <Input
                  placeholder="Paste Image URL..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  style={{ marginBottom: 0 }}
                />
              </div>
            )}
          </div>

          {/* Featured Checkbox */}
          <div
            style={{
              height: "42px",
              marginTop: "1.8rem", // Align with input field visually
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: "0.5rem",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "var(--primary)",
                }}
              />
              <span style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                Featured?
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: "1.8rem", display: "flex", gap: "0.5rem" }}>
            {isEditing && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting || uploading}>
              {submitting ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </form>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>
                  {cat.image ? (
                    <img
                      src={getSecureImageUrl(cat.image)}
                      alt=""
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        background: "#eee",
                        borderRadius: "4px",
                      }}
                    ></div>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td>
                  <button
                    onClick={() => handleToggleFeatured(cat)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: cat.isFeatured ? "#eab308" : "var(--text-muted)",
                    }}
                    title="Toggle Featured"
                  >
                    <Star fill={cat.isFeatured ? "currentColor" : "none"} />
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ padding: "0.4rem" }}
                      onClick={() => handleEditClick(cat)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: "var(--error)", padding: "0.4rem" }}
                      onClick={() => handleDelete(cat._id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center"
                  style={{ padding: "2rem", color: "var(--text-muted)" }}
                >
                  No categories found. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
