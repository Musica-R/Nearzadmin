import { AlertTriangle } from "lucide-react";

export default function ConfirmDeleteModal({ open, title, description, busy, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="lk-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="lk-modal" role="dialog" aria-modal="true">
        <div className="lk-modal__icon">
          <AlertTriangle size={22} />
        </div>
        <h3>{title || "Delete this entry?"}</h3>
        <p>{description || "This action can't be undone. The listing will be permanently removed from Thozhaa."}</p>
        <div className="lk-modal__actions">
          <button className="lk-btn ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="lk-btn danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting\u2026" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
