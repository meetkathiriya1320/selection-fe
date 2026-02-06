import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import { X, Plus, Trash2, Upload, CloudUpload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const AdminAddSelectionModal = ({
  isOpen,
  onClose,
  editSelection,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    SKU: "",
    photos: [""],
    topSizes: [],
    bottomSizes: [],
    colors: [],
    // Legacy fields if needed by backend default
    up_color: "Red",
    up_size: "M",
    dawn_color: "Red",
    dawn_size: "M",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editSelection) {
        // Populate form for editing
        setFormData({
          ...editSelection,
          photos:
            editSelection.photos && editSelection.photos.length > 0
              ? editSelection.photos
              : [editSelection.photo || ""],
          topSizes: editSelection.topSizes || [],
          bottomSizes: editSelection.bottomSizes || [],
          colors: editSelection.colors || [],
        });
      } else {
        // Reset for new
        setFormData({
          name: "",
          category: "",
          price: "",
          SKU: "",
          photos: [""],
          topSizes: [],
          bottomSizes: [],
          colors: [],
          up_color: "Red",
          up_size: "M",
          dawn_color: "Red",
          dawn_size: "M",
        });
      }
    }
  }, [isOpen, editSelection]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/category");
      setCategories(response.data.data);
      // Set default category if creating new and not set
      if (
        !editSelection &&
        response.data.data.length > 0 &&
        !formData.category
      ) {
        setFormData((prev) => ({
          ...prev,
          category: response.data.data[0].name,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const toastId = toast.loading("Uploading image...");
      const response = await api.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newPhotos = [...formData.photos];
      newPhotos[index] = response.data.data.url;
      setFormData({ ...formData, photos: newPhotos });

      toast.dismiss(toastId);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty photo strings and ensure arrays
      const payload = {
        ...formData,
        photos: formData.photos.filter((p) => p.trim() !== ""),
        // Backend expects simple arrays, which we already have in state
      };

      if (editSelection) {
        await api.put(`/selection/${editSelection._id}`, payload);
        toast.success("Selection updated successfully");
      } else {
        await api.post("/selection", payload);
        toast.success("Selection created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        editSelection ? "Failed to update item" : "Failed to create item",
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to manage array fields like Sizes/Colors
  const toggleArrayItem = (field, value) => {
    if (!value) return;
    const current = formData[field] || [];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter((i) => i !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  // Helper to add item via input (for users typing custom sizes/colors)
  const [tempInputs, setTempInputs] = useState({
    top: "",
    bottom: "",
    color: "",
  });

  const addCustomArrayItem = (field, tempKey) => {
    const val = tempInputs[tempKey];
    if (val && !formData[field].includes(val)) {
      setFormData({ ...formData, [field]: [...formData[field], val] });
      setTempInputs({ ...tempInputs, [tempKey]: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          width: "95%",
          maxWidth: "1000px",
          height: "90vh",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f9fafb",
          }}
        >
          <div>
            <h2
              style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}
            >
              {editSelection ? "Edit Collection Item" : "New Collection Item"}
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              {editSelection
                ? `Editing SKU: ${editSelection.SKU}`
                : "Add a new item to your collection"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseOut={(e) => (e.currentTarget.style.background = "white")}
          >
            <X size={20} color="#374151" />
          </button>
        </div>

        {/* Body */}
        <div
          className="custom-scrollbar"
          style={{ flex: 1, overflowY: "auto", padding: "0" }}
        >
          <form
            id="selection-form"
            onSubmit={handleSubmit}
            style={{ display: "flex", minHeight: "100%" }}
          >
            {/* Left Column: Core Info */}
            <div
              style={{
                flex: "1.2",
                padding: "2rem",
                borderRight: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Basic Info Group */}
                <div className="form-group-section">
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Basic Information
                  </h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <Input
                      label="Item Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="e.g. Royal Blue Sherwani"
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 500,
                            fontSize: "0.9rem",
                            color: "#374151",
                          }}
                        >
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "0.6rem 0.75rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                            background: "#fff",
                            height: "42px",
                          }}
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="SKU Code"
                        value={formData.SKU}
                        onChange={(e) =>
                          setFormData({ ...formData, SKU: e.target.value })
                        }
                        required
                        placeholder="e.g. WED-001"
                      />
                    </div>
                    <Input
                      label="Price (₹)"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <hr
                  style={{ border: "none", borderTop: "1px solid #f3f4f6" }}
                />

                {/* Variants Group */}
                <div className="form-group-section">
                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "1rem",
                    }}
                  >
                    Inventory & Variants
                  </h3>

                  {/* Top Sizes */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      Top Sizes
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleArrayItem("topSizes", size)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            border: formData.topSizes.includes(size)
                              ? "1px solid var(--primary)"
                              : "1px solid #e5e7eb",
                            background: formData.topSizes.includes(size)
                              ? "var(--primary-light)"
                              : "white",
                            color: formData.topSizes.includes(size)
                              ? "var(--primary)"
                              : "#4b5563",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Sizes */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      Bottom Sizes
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {[
                        "28",
                        "30",
                        "32",
                        "34",
                        "36",
                        "38",
                        "40",
                        "42",
                        "44",
                      ].map((size) => (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleArrayItem("bottomSizes", size)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            border: formData.bottomSizes.includes(size)
                              ? "1px solid var(--primary)"
                              : "1px solid #e5e7eb",
                            background: formData.bottomSizes.includes(size)
                              ? "var(--primary-light)"
                              : "white",
                            color: formData.bottomSizes.includes(size)
                              ? "var(--primary)"
                              : "#4b5563",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      Colors
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div style={{ position: "relative", flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Add a color (e.g. Navy Blue)"
                          value={tempInputs.color}
                          onChange={(e) =>
                            setTempInputs({
                              ...tempInputs,
                              color: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomArrayItem("colors", "color");
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "6px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.9rem",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addCustomArrayItem("colors", "color")}
                          style={{
                            position: "absolute",
                            right: "6px",
                            top: "6px",
                            padding: "4px 8px",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      {formData.colors.map((color, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "#f3f4f6",
                            padding: "4px 10px",
                            borderRadius: "16px",
                            fontSize: "0.85rem",
                            color: "#374151",
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: color.toLowerCase(),
                              border: "1px solid #ccc",
                            }}
                          ></span>
                          {color}
                          <X
                            size={14}
                            style={{ cursor: "pointer", color: "#9ca3af" }}
                            onClick={() => {
                              const newColors = formData.colors.filter(
                                (c) => c !== color,
                              );
                              setFormData({ ...formData, colors: newColors });
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Photos */}
            <div
              style={{ flex: "0.8", padding: "2rem", background: "#f9fafb" }}
            >
              <div style={{ position: "sticky", top: "2rem" }}>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "1rem",
                  }}
                >
                  Product Images
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="photo-field-group">
                      <div
                        style={{
                          border: "1px dashed #d1d5db",
                          borderRadius: "8px",
                          padding: "4px",
                          background: "white",
                          position: "relative",
                          transition: "all 0.2s",
                        }}
                      >
                        {!photo ? (
                          <div
                            style={{ padding: "1.5rem", textAlign: "center" }}
                          >
                            <div
                              style={{
                                marginBottom: "0.5rem",
                                color: "#9ca3af",
                              }}
                            >
                              <CloudUpload
                                size={32}
                                style={{ margin: "0 auto" }}
                              />
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "#4b5563",
                                marginBottom: "0.75rem",
                              }}
                            >
                              Drag & drop or Click to upload
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(index, e.target.files[0])
                              }
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0,
                                cursor: "pointer",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                justifyContent: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#9ca3af",
                                }}
                              >
                                OR
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder="Paste Image URL"
                              value={photo}
                              onChange={(e) => {
                                const newPhotos = [...formData.photos];
                                newPhotos[index] = e.target.value;
                                setFormData({ ...formData, photos: newPhotos });
                              }}
                              style={{
                                marginTop: "0.5rem",
                                width: "100%",
                                padding: "6px",
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                                fontSize: "0.8rem",
                                zIndex: 10,
                                position: "relative",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              position: "relative",
                              aspectRatio: "3/4",
                              borderRadius: "6px",
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src={photo}
                              alt={`Product ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "rgba(0,0,0,0.6)",
                                padding: "8px",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhotos = [...formData.photos];
                                  newPhotos[index] = "";
                                  setFormData({
                                    ...formData,
                                    photos: newPhotos,
                                  });
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "white",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Change
                              </button>
                              {formData.photos.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPhotos = formData.photos.filter(
                                      (_, i) => i !== index,
                                    );
                                    setFormData({
                                      ...formData,
                                      photos: newPhotos,
                                    });
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#fca5a5",
                                    cursor: "pointer",
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        photos: [...formData.photos, ""],
                      })
                    }
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      marginTop: "0.5rem",
                    }}
                  >
                    <Plus size={16} style={{ marginRight: "6px" }} /> Add
                    Another Photo
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1.25rem 2rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            background: "white",
          }}
        >
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            form="selection-form"
            isLoading={loading}
            variant="primary"
            style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
          >
            {editSelection ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAddSelectionModal;
