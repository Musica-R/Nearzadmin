import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Vendors from "./pages/Vendors";
import Activities from "./pages/Activities";
import NearStalls from "./pages/NearStalls";
import Categories from "./pages/Categories";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const openMenu = () => setMenuOpen(true);

  return (
    <BrowserRouter>
      <div className="lk-app">
        <Sidebar open={menuOpen} onClose={closeMenu} />
        <div className="lk-main">
          <Routes>
            <Route path="/" element={<Dashboard onMenu={openMenu} />} />
            <Route path="/users" element={<Users onMenu={openMenu} />} />
            <Route path="/vendors" element={<Vendors onMenu={openMenu} />} />
            <Route path="/activities" element={<Activities onMenu={openMenu} />} />
            <Route path="/near-stalls" element={<NearStalls onMenu={openMenu} />} />
            <Route path="/categories" element={<Categories onMenu={openMenu} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
