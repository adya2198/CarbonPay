// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AddTreePage from "./pages/AddTreePage";
import MyTreesPage from "./pages/MyTreesPage";
import TransactionsPage from "./pages/TransactionsPage"; // if you already added it

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-tree"
            element={
              <ProtectedRoute>
                <AddTreePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-trees"
            element={
              <ProtectedRoute>
                <MyTreesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
