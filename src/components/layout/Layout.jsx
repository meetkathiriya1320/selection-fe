import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
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
      <Footer />
    </div>
  );
};

export default Layout;
