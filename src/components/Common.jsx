import { AlertTriangle, Inbox, Search } from "lucide-react";

export function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="lk-stat-card">
      <div className="lk-stat-card__top">
        <div className="lk-stat-card__icon">
          <Icon size={17} />
        </div>
      </div>
      <div className="lk-stat-card__value">{value}</div>
      <div className="lk-stat-card__label">{label}</div>
    </div>
  );
}

export function Loader({ label = "Loading data\u2026" }) {
  return (
    <div className="lk-state">
      <div className="lk-spinner" />
      <strong>{label}</strong>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message }) {
  return (
    <div className="lk-state">
      <Inbox size={28} color="var(--lk-slate-light)" />
      <strong>{title}</strong>
      {message && <p>{message}</p>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="lk-error-banner">
      <AlertTriangle size={16} />
      <span>{message}</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  const active = Number(status) === 1;
  return (
    <span className={`lk-pill ${active ? "success" : "neutral"}`}>
      {active ? "Active" : "Pending review"}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search\u2026" }) {
  return (
    <div className="lk-search">
      <Search size={14} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function EntityCell({ photo, name, sub, fallbackLetter }) {
  return (
    <div className="lk-cell-entity">
      {photo ? (
        <img src={photo} alt="" className="lk-thumb" onError={(e) => (e.target.style.visibility = "hidden")} />
      ) : (
        <div className="lk-thumb-fallback">{(fallbackLetter || name || "?").charAt(0).toUpperCase()}</div>
      )}
      <div>
        <strong>{name || "\u2014"}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}
