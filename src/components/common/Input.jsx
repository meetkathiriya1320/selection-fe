import React from "react";

const Input = ({ label, error, className, style, ...props }) => {
  return (
    <div className={className} style={{ width: "100%", ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "0.4rem",
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "var(--text-muted)",
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          display: "block",
          width: "100%",
          padding: "0.6rem 0.8rem",
          fontSize: "0.95rem",
          backgroundColor: "transparent",
          border: error ? "1px solid var(--error)" : "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          outline: "none",
          transition: "border-color 0.2s",
          ...style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
        onBlur={(e) =>
          (e.target.style.borderColor = error
            ? "var(--error)"
            : "var(--border)")
        }
        {...props}
      />
      {error && (
        <p
          style={{
            marginTop: "0.25rem",
            fontSize: "0.85rem",
            color: "var(--error)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
