import { FiX } from "react-icons/fi";

/* Admin səhifələrində uğur / xəta bildirişi – bağlamaq olur */
export default function AdminAlert({ alert, onClose }) {
  if (!alert) return null;

  return (
    <p className={`admin-alert admin-alert--${alert.type}`} role={alert.type === "error" ? "alert" : "status"}>
      <span>{alert.text}</span>
      <button type="button" className="admin-alert__close" onClick={onClose} aria-label="Close message">
        <FiX />
      </button>
    </p>
  );
}
