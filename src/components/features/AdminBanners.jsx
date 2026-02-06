import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Button from "../common/Button";
import Input from "../common/Input";
import { Loader2, Trash } from "lucide-react";

import { showConfirmationToast } from "../../utils/toastUtils";

// ... existing code ...

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: "", image: "" });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await api.get("/banner");
      setBanners(response.data.data);
    } catch (error) {
      console.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewBanner((prev) => ({ ...prev, image: response.data.data.url }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const res = await api.post("/banner", newBanner);
      setBanners([...banners, res.data.data]);
      setNewBanner({ title: "", image: "" });
      toast.success("Banner added");
    } catch (error) {
      toast.error("Failed to add banner");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    showConfirmationToast("Delete this banner?", async () => {
      try {
        await api.delete(`/banner/${id}`);
        setBanners((prev) => prev.filter((b) => b._id !== id));
        toast.success("Banner deleted");
      } catch (error) {
        toast.error("Failed to delete");
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
        <h2 className="admin-section-title">Manage Banners</h2>
      </div>

      {/* Add New Form */}
      <form onSubmit={handleAdd} className="admin-form">
        <div className="form-group-row" style={{ alignItems: "flex-start" }}>
          <Input
            label="Banner Title"
            value={newBanner.title}
            onChange={(e) =>
              setNewBanner({ ...newBanner, title: e.target.value })
            }
            required
            style={{ flexGrow: 1 }}
          />

          <div style={{ flexGrow: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              Banner Image
            </label>

            {newBanner.image ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0.5rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  height: "42px",
                  background: "white",
                }}
              >
                <img
                  src={newBanner.image}
                  alt="Preview"
                  style={{
                    width: "40px",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    flexGrow: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {newBanner.image.split("/").pop()}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewBanner({ ...newBanner, image: "" })}
                  style={{
                    padding: "0.25rem",
                    height: "auto",
                    minWidth: "auto",
                  }}
                >
                  <Trash size={14} color="var(--error)" />
                </Button>
              </div>
            ) : (
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
                  }}
                  disabled={uploading}
                />
                {uploading && (
                  <Loader2
                    className="animate-spin"
                    size={16}
                    style={{ position: "absolute", right: "10px", top: "12px" }}
                  />
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            style={{ marginTop: "1.7rem" }}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add Banner"}
          </Button>
        </div>
      </form>

      {/* Banner List */}
      <div className="items-grid">
        {banners.map((banner) => (
          <div key={banner._id} className="item-row">
            <img src={banner.image} alt={banner.title} className="item-image" />
            <div className="item-info">
              <h4 className="item-title">{banner.title}</h4>
              <p className="item-meta">
                Status:{" "}
                <span
                  style={{
                    color: banner.isActive
                      ? "var(--success)"
                      : "var(--text-muted)",
                  }}
                >
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
            <button
              className="action-btn delete"
              onClick={() => handleDelete(banner._id)}
              title="Delete Banner"
            >
              <Trash size={18} />
            </button>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-center text-muted">No banners found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
