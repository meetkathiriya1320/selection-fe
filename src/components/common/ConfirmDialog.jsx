import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  useEffect(() => {
    const handleShow = (event) => {
      const { message, onConfirm, onCancel } = event.detail;
      setData({ message, onConfirm, onCancel });
      setIsOpen(true);
    };

    window.addEventListener("show-confirmation-modal", handleShow);
    return () =>
      window.removeEventListener("show-confirmation-modal", handleShow);
  }, []);

  const handleConfirm = () => {
    if (data.onConfirm) data.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (data.onCancel) data.onCancel();
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "relative",
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              width: "90%",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#111827",
                margin: 0,
              }}
            >
              {data.message}
            </h3>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#f9fafb")}
                onMouseOut={(e) => (e.target.style.background = "white")}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
                onMouseOut={(e) => (e.target.style.background = "#2563eb")}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
