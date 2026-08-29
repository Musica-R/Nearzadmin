import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Vendors from "./pages/Vendors";
import Activities from "./pages/Activities";
import NearStalls from "./pages/NearStalls";
import Categories from "./pages/Categories";
import AddVendor from "./pages/AddVendor";

function AdminLayout({ children, onMenu }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const openMenu = () => setMenuOpen(true);

  return (
    <div className="lk-app">
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className="lk-main">{typeof children === "function" ? children(openMenu) : children}</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  {(openMenu) => (
                    <Routes>
                      <Route path="/" element={<Dashboard onMenu={openMenu} />} />
                      <Route path="/users" element={<Users onMenu={openMenu} />} />
                      <Route path="/vendors" element={<Vendors onMenu={openMenu} />} />
                      <Route path="/vendors/add" element={<AddVendor onMenu={openMenu} />} />
                      <Route path="/activities" element={<Activities onMenu={openMenu} />} />
                      <Route path="/near-stalls" element={<NearStalls onMenu={openMenu} />} />
                      <Route path="/categories" element={<Categories onMenu={openMenu} />} />
                    </Routes>
                  )}
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}