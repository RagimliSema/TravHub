import { Link } from "react-router-dom";
import "../travhubbtn/travhubbtn.css";
import "./statusmessage.css";

/*
  Siyahılar üçün: kartlar varsa heç nə göstərmir, yoxdursa yüklənir / boşdur.
  Xəta həmişə göstərilir (köhnə kartlar görünürsə kiçik formada).
*/
export function ListStatus({
  loading,
  error,
  onRetry,
  count,
  loadingText = "Loading tours...",
  emptyTitle = "No tours found",
  emptyText,
  emptyAction,
}) {
  if (error) {
    return <StatusMessage type="error" text={error.message} onRetry={onRetry} compact={count > 0} />;
  }
  if (count > 0) return null;
  if (loading) return <StatusMessage type="loading" text={loadingText} />;
  return <StatusMessage type="empty" title={emptyTitle} text={emptyText} action={emptyAction} />;
}

/*
  Yüklənmə / xəta / boş vəziyyət üçün ümumi blok.
    <StatusMessage type="loading" text="Loading tours..." />
    <StatusMessage type="error" text={error.message} onRetry={retry} />
    <StatusMessage type="empty" title="Your cart is empty" action={{ to: "/tours", label: "Browse Tours" }} />
*/
export default function StatusMessage({ type = "empty", title, text, onRetry, action, compact = false }) {
  const isLoading = type === "loading";

  return (
    <div
      className={`status-message status-message--${type}${compact ? " status-message--compact" : ""}`}
      role={type === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {isLoading && <span className="status-message__spinner" aria-hidden="true" />}
      {title && <h3 className="status-message__title">{title}</h3>}
      {text && <p className="status-message__text">{text}</p>}

      {onRetry && (
        <button type="button" className="travhub-btn status-message__btn" onClick={onRetry}>
          <span>Try Again</span>
        </button>
      )}

      {action && (
        <Link to={action.to} className="travhub-btn status-message__btn">
          <span>{action.label}</span>
        </Link>
      )}
    </div>
  );
}
