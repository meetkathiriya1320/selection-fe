import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import CartDrawer from "../cart/CartDrawer";

const Layout = () => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar />
      <CartDrawer />
      <main style={{ flexGrow: 1, paddingTop: "var(--header-height)" }}>
        <Outlet />
      </main>
      <footer
        style={{
          backgroundColor: "var(--primary)",
          color: "white",
          padding: "3rem 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <p style={{ opacity: 0.7 }}>© 2024 Selection. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
