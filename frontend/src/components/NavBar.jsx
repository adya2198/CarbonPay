// src/components/NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  return (
    <header className="nb-root">
      <div className="nb-inner">
        <div className="nb-left">
          <div className="nb-logo">CP</div>
          <div className="nb-title">
            <div className="nb-name">CarbonPay</div>
            <div className="nb-sub">carbon-credit wallet</div>
          </div>

          <nav className="nb-links">
            <Link to="/">Home</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/my-trees">My Trees</Link>
            <Link to="/add-tree">Add Tree</Link>
          </nav>
        </div>

        <div className="nb-right">
          <Link to="/profile" className="nb-profile-link">
            <div className="nb-meta">
              <div className="nb-username">{user?.name || user?.email}</div>
              <div className="nb-small">View profile</div>
            </div>
            <img
              alt="avatar"
              src={
                user?.photoURL ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || user?.email || "User"
                )}`
              }
              className="nb-avatar"
            />
          </Link>

          <button onClick={handleLogout} className="nb-logout">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
