import React, { useState } from "react";
import {
  Package,
  Calendar,
  Image,
  LayoutDashboard,
  Layers,
} from "lucide-react";
import AdminSelections from "../components/features/AdminSelections";
import AdminBookings from "../components/features/AdminBookings";
import AdminBanners from "../components/features/AdminBanners";
import AdminCategories from "../components/features/AdminCategories";
import "./AdminDashboard.css";

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("bookings");

  const tabs = [
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "selections", label: "Selections", icon: Package },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "banners", label: "Banners", icon: Image },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-header">
        <LayoutDashboard style={{ marginRight: "1rem" }} /> Admin Portal
      </h1>

      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <div className="admin-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon size={20} className="tab-icon" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="admin-content">
          {activeTab === "bookings" && <AdminBookings />}
          {activeTab === "selections" && <AdminSelections />}
          {activeTab === "categories" && <AdminCategories />}
          {activeTab === "banners" && <AdminBanners />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
