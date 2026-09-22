import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Wrench,
  Dumbbell,
  Store,
  Tags,
  X,
  LogOut,
  FileText,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../Style/Sidebar.css";


const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/vendors", label: "Home Services", icon: Wrench },
  { to: "/activities", label: "Activities", icon: Dumbbell },
  { to: "/near-stalls", label: "Near Stalls", icon: Store },
  { to: "/jobs", label: "Job List", icon: Briefcase },
  { to: "/vendors/add", label: "Register Vendor", icon: FileText },
  { to: "/categories", label: "Categories", icon: Tags },
];

export default function Sidebar({ open, onClose, counts }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`sbx-sidebar ${open ? "open" : ""}`}>
      <div className="sbx-brand">
        <svg className="sbx-brand__mark" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sbxPinGrad" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#f0d9ff" />
              <stop offset="0.5" stopColor="#c02de5" />
              <stop offset="1" stopColor="#7920b4" />
            </linearGradient>
          </defs>
          <path
            d="M18 2C10.8 2 5 7.8 5 15c0 9.5 11.4 18 12.3 18.6a1.2 1.2 0 0 0 1.4 0C19.6 33 31 24.5 31 15c0-7.2-5.8-13-13-13Z"
            fill="url(#sbxPinGrad)"
          />
          <circle cx="18" cy="15" r="5.4" fill="#fff" />
        </svg>
        <div className="sbx-brand__text">
          <strong>Thozhaa</strong>
          <span>Admin Panel</span>
        </div>
        <button className="sbx-close" onClick={onClose} aria-label="Close menu">
          <X size={17} />
        </button>
      </div>

      <nav className="sbx-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `sbx-navitem ${isActive ? "active" : ""}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {counts && counts[to] != null && (
              <span className="sbx-navitem__count">{counts[to]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sbx-user">
        {admin && (
          <div className="sbx-user__info">
            <div className="sbx-user__avatar">
              {(admin.name || admin.email || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{admin.name || "Admin"}</strong>
              <span>{admin.email}</span>
            </div>
          </div>
        )}
        <button className="sbx-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      <div className="sbx-foot">Thozhaa &middot; Tamil Nadu local services</div>
    </aside>
  );
}