import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Wrench,
  Dumbbell,
  Store,
  Tags,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/users", label: "Users", icon: Users },
  { to: "/vendors", label: "Home Services", icon: Wrench },
  { to: "/activities", label: "Activities", icon: Dumbbell },
  { to: "/near-stalls", label: "Near Stalls", icon: Store },
  { to: "/categories", label: "Categories", icon: Tags },
];

export default function Sidebar({ open, onClose, counts }) {
  return (
    <aside className={`lk-sidebar ${open ? "open" : ""}`}>
      <div className="lk-sidebar__brand">
        <svg
          className="lk-sidebar__mark"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="lkPinGrad" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#7920b4" />
              <stop offset="0.5" stopColor="#9b20d0" />
              <stop offset="1" stopColor="#c02de5" />
            </linearGradient>
          </defs>
          <path
            d="M18 2C10.8 2 5 7.8 5 15c0 9.5 11.4 18 12.3 18.6a1.2 1.2 0 0 0 1.4 0C19.6 33 31 24.5 31 15c0-7.2-5.8-13-13-13Z"
            fill="url(#lkPinGrad)"
          />
          <circle cx="18" cy="15" r="5.4" fill="#fff" />
        </svg>
        <div className="lk-sidebar__brand-text">
          <strong>Lokal</strong>
          <span>Admin Panel</span>
        </div>
        <button
          className="lk-icon-btn link"
          style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#fff", display: open ? "inline-flex" : "none" }}
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="lk-sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => `lk-navitem ${isActive ? "active" : ""}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {counts && counts[to] != null && (
              <span className="lk-navitem__count">{counts[to]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="lk-sidebar__foot">Lokal &middot; Tamil Nadu local services</div>
    </aside>
  );
}
