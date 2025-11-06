import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { role, setRole, username } = useAuth();
  const location = useLocation();
  const testSendActive =
    location.pathname.startsWith("/test-send") ||
    /^\/templates\/[^/]+\/test(?:\/|$)/.test(location.pathname);

  return (
    <div className="app-root">
      <aside className="sidebar">
        <div className="sidebar-logo">MsgCenter</div>
        <nav className="sidebar-nav">
          <NavLink
            className={({ isActive }) =>
              "nav-item" + (isActive ? " active" : "")
            }
            to="/templates"
            end
          >
            Templates
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              "nav-item" + (isActive ? " active" : "")
            }
            to="/templates/new"
          >
            Create Template
          </NavLink>
          {role === "MARKETER" && (
            <NavLink
              className={({ isActive }) =>
                "nav-item" + (isActive || testSendActive ? " active" : "")
              }
              to="/test-send"
            >
              Test Send
            </NavLink>
          )}
          {role === "MANAGER" && (
            <NavLink
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
              to="/approve"
            >
              Approve Templates
            </NavLink>
          )}
          <NavLink
            className={({ isActive }) =>
              "nav-item" + (isActive ? " active" : "")
            }
            to="/records"
          >
            Message Records
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="role-info">
            <span className="label">User:</span> {username}
          </div>
          <div className="role-info">
            <span className="label">Role:</span> {role}
          </div>
          <div className="role-switch">
            <button
              className={
                "btn-ghost " + (role === "MARKETER" ? "btn-active" : "")
              }
              onClick={() => setRole("MARKETER")}
            >
              Marketer
            </button>
            <button
              className={"btn-ghost " + (role === "MANAGER" ? "btn-active" : "")}
              onClick={() => setRole("MANAGER")}
            >
              Manager
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1 className="glow-title">Message Template Management</h1>
        </header>
        <div className="page">{children}</div>
      </main>
    </div>
  );
};
