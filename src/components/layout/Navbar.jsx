import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User, ShoppingCart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Button from "../common/Button";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { toggleCart, cartItems } = useCart();
  /* Language Switcher Removed */
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Always use 'navbar' class, adding 'scrolled' for the shrink effect
  // We removed 'transparent' logic to enforce the white premium header
  const navClass = `navbar ${scrolled ? "scrolled" : ""}`;

  return (
    <nav className={navClass}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Selection<span>.</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/selections" className="nav-link">
            Selections
          </Link>
          {user && user.role !== "admin" && (
            <Link to="/dashboard" className="nav-link">
              Orders
            </Link>
          )}
          {user?.role === "admin" && (
            <Link to="/admin" className="nav-link">
              Admin Panel
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {/* Language Switcher Removed */}
          {/* Cart Button */}
          <button
            className="cart-toggle-btn"
            onClick={toggleCart}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              color: "var(--text-main)",
              marginRight: user ? "0.5rem" : "1rem",
            }}
          >
            <ShoppingCart size={22} />
            {cartItems.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-8px",
                  background: "var(--primary)",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartItems.length}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex-center" style={{ gap: "1rem" }}>
              <span
                className="user-greeting"
                style={{ display: window.innerWidth > 768 ? "block" : "none" }}
              >
                Hi, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
                title="Logout"
              >
                <LogOut size={18} />{" "}
                <span style={{ display: "inline-block" }}>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="sm" className="nav-btn">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        <button className="mobile-toggle">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
