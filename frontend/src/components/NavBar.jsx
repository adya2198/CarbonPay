// src/components/NavBar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
              CP
            </div>
            <div>
              <div className="text-lg font-semibold">CarbonPay</div>
              <div className="text-xs text-gray-500">carbon credits wallet</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-3 ml-6">
            <Link to="/" className="text-sm text-gray-700 hover:text-gray-900">Home</Link>
            <Link to="/transactions" className="text-sm text-gray-700 hover:text-gray-900">Transactions</Link>
            <Link to="/my-trees" className="text-sm text-gray-700 hover:text-gray-900">My Trees</Link>
            <Link to="/add-tree" className="text-sm text-gray-700 hover:text-gray-900">Add Tree</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="text-right mr-2 hidden sm:block">
              <div className="text-sm font-medium">{user?.name || user?.email}</div>
              <div className="text-xs text-gray-500">View profile</div>
            </div>
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email)}`}
              alt="avatar"
              className="w-10 h-10 rounded-full shadow-sm border"
            />
          </Link>

          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
