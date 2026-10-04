import { useEffect, useRef } from "react";
import "./confirmdialog.css";

/*
  Silmə kimi geri qaytarılmayan əməliyyatlardan əvvəl təsdiq pəncərəsi.
  Brauzerin <dialog> elementi: fokus pəncərədə qalır, Esc bağlayır.
    <ConfirmDialog open={!!target} title="Delete product?" message="..." onConfirm={...} onCancel={...} />
*/
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      onCancel={(e) => {
        e.preventDefault(); // Esc: bağlanmanı valideyn idarə edir
        if (!busy) onCancel();
      }}
    >
      <h3 id="confirm-dialog-title" className="confirm-dialog__title">
        {title}
      </h3>
      {message && <p className="confirm-dialog__text">{message}</p>}

      <div className="confirm-dialog__actions">
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" className="admin-btn admin-btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Please wait..." : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
