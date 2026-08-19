import { Menu, RefreshCw } from "lucide-react";

export default function Topbar({ title, subtitle, onMenu, onRefresh, refreshing }) {
  return (
    <header className="lk-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="lk-icon-btn lk-menu-toggle"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu size={17} />
        </button>
        <div className="lk-topbar__title">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="lk-topbar__right">
        {onRefresh && (
          <button
            className={`lk-refresh-btn ${refreshing ? "spinning" : ""}`}
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        )}
        <div className="lk-avatar">LK</div>
      </div>
    </header>
  );
}
