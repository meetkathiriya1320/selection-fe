import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#1e293b",
        color: "#f8fafc",
        paddingTop: "4rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "3rem",
            marginBottom: "3rem",
          }}
        >
          {/* Brand Section */}
          <div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginBottom: "1rem",
              }}
            >
              Selection
            </h3>
            <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
              Elevate your style with our premium collection of men's fashion.
              Quality detailed to perfection.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "1.2rem",
              }}
            >
              Quick Links
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.8rem" }}>
                <Link
                  to="/"
                  style={{
                    color: "#cbd5e1",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  className="hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li style={{ marginBottom: "0.8rem" }}>
                <Link
                  to="/selections"
                  style={{ color: "#cbd5e1", textDecoration: "none" }}
                >
                  Selections
                </Link>
              </li>
              <li style={{ marginBottom: "0.8rem" }}>
                <Link
                  to="/orders"
                  style={{ color: "#cbd5e1", textDecoration: "none" }}
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  style={{ color: "#cbd5e1", textDecoration: "none" }}
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                marginBottom: "1.2rem",
              }}
            >
              Contact Us
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  marginBottom: "1rem",
                  color: "#cbd5e1",
                }}
              >
                <MapPin size={18} />
                <span>123 Fashion Street, Style City</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  marginBottom: "1rem",
                  color: "#cbd5e1",
                }}
              >
                <Phone size={18} />
                <span>+91 98765 43210</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  color: "#cbd5e1",
                }}
              >
                <Mail size={18} />
                <span>support@selection.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #334155",
            paddingTop: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="#" style={{ color: "#94a3b8" }}>
              <Facebook size={20} />
            </a>
            <a href="#" style={{ color: "#94a3b8" }}>
              <Instagram size={20} />
            </a>
            <a href="#" style={{ color: "#94a3b8" }}>
              <Twitter size={20} />
            </a>
          </div>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            &copy; {new Date().getFullYear()} Selection. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
