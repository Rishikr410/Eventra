import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

const sidebarStorageKey = "eventra-sidebar-collapsed";

const Sidebar = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      // Sidebar collapse state localStorage me save ki thi, wahi se restore kar raha hu.
      return localStorage.getItem(sidebarStorageKey) === "true";
    } catch {
      return false;
    }
  });

  const userLinks = [
    { id: "dashboard", label: "Dashboard", path: "/dashboard", short: "D" },
    { id: "events", label: "Events", path: "/events", short: "E" },
    { id: "tasks", label: "Tasks", path: "/tasks", short: "T" },
    { id: "calendar", label: "Calendar", path: "/calendar", short: "C" },
    { id: "qna", label: "Q&A", path: "/qna", short: "Q" },
    { id: "notes", label: "My Notes", path: "/notes", short: "N" },
    { id: "profile", label: "Profile", path: "/profile", short: "P" },
  ];

  const adminLinks = [
    { id: "admin", label: "Admin Dashboard", path: "/admin", short: "A" },
    { id: "events", label: "Manage Events", path: "/events", short: "E" },
    { id: "calendar", label: "Calendar", path: "/calendar", short: "C" },
  ];

  const links = user?.role === "admin" ? adminLinks : userLinks;

  useEffect(() => {
    try {
      // User ka last sidebar preference next refresh me bhi same rahe.
      localStorage.setItem(sidebarStorageKey, String(collapsed));
    } catch {
      // ignore storage issues
    }
  }, [collapsed]);

  const handleNavigation = (path) => {
    // Navigation ko separate function me rakha for cleaner button handlers.
    navigate(path);
  };

  return (
    <div
      className={`sidebar-shell d-flex flex-column p-3 text-white ${
        collapsed ? "collapsed" : ""
      }`}
    >
      <button
        type="button"
        className="sidebar-collapse-toggle"
        onClick={() => setCollapsed((current) => !current)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? ">" : "<"}
      </button>

      <div className="sidebar-brand text-center mb-3">
        <div className="sidebar-brand-badge">
          <img
            src="/eventra-logo.jpeg"
            alt="Eventra"
            className="sidebar-brand-image"
          />
        </div>
        <div className="sidebar-brand-meta">
          <strong className="sidebar-brand-title">Eventra</strong>
          <span className="sidebar-brand-subtitle">
            {user?.role === "admin" ? "Admin workspace" : "Student workspace"}
          </span>
        </div>
      </div>

      <hr
        className="sidebar-divider"
        style={{ borderColor: "rgba(255,255,255,0.3)" }}
      />

      <span className="sidebar-section-label">Workspace</span>

      <div className="sidebar-menu d-flex flex-column gap-2 flex-grow-1">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => handleNavigation(link.path)}
            title={collapsed ? link.label : undefined}
            className={`sidebar-btn ${
              location.pathname === link.path ? "active" : ""
            }`}
          >
            <span className="sidebar-btn-icon">{link.short}</span>
            <span className="sidebar-btn-label">{link.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer mt-auto pt-3">
        <div className="sidebar-user-chip" title={user?.name || user?.username}>
          <span className="sidebar-user-chip-icon">
            {(user?.name || user?.username || "U").slice(0, 1).toUpperCase()}
          </span>
          <div className="sidebar-user-chip-text">
            <strong>{user?.name || user?.username || "User"}</strong>
            <span>{user?.role === "admin" ? "Admin" : "Student"}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-btn logout-btn"
          title={collapsed ? "Logout" : undefined}
        >
          <span className="sidebar-btn-icon">L</span>
          <span className="sidebar-btn-label">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
