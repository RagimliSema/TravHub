import { useState } from "react";
import { FiCopy, FiTrash2 } from "react-icons/fi";
import StatusMessage from "../../components/statusmessage/statusmessage";
import ConfirmDialog from "../../components/confirmdialog/confirmdialog";
import AdminAlert from "./adminalert";
import { useRequest } from "../../hooks/useRequest";
import { adminApi } from "../../services/api";
import { formatDate } from "../../utils/orders";

/*
  "/admin/subscribers" – footer-dəki Newsletter formuna yazılan email-lər (GET /api/newsletter).
  "Copy emails" – hamısını vergüllə kopyalayır (email proqramına yapışdırmaq üçün).
  Silmə: DELETE /api/newsletter/:id (məs. abunəçi özü istəyəndə).
*/
export default function AdminSubscribers() {
  const [deleting, setDeleting] = useState(null);
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState(null);

  const { data, error, retry, mutate } = useRequest((signal) => adminApi.subscribers(signal), "subscribers");
  const subscribers = data?.subscribers ?? [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(subscribers.map((s) => s.email).join(", "));
      setAlert({ type: "success", text: `${subscribers.length} email address(es) copied.` });
    } catch {
      setAlert({ type: "error", text: "Could not copy – your browser blocked the clipboard." });
    }
  };

  const handleDelete = async () => {
    setPending(true);
    try {
      await adminApi.deleteSubscriber(deleting._id);
      mutate((prev) => ({ ...prev, subscribers: prev.subscribers.filter((s) => s._id !== deleting._id) }));
      setAlert({ type: "success", text: `${deleting.email} was removed from the newsletter.` });
    } catch (err) {
      setAlert({ type: "error", text: `Could not remove the subscriber: ${err.message}` });
    } finally {
      setPending(false);
      setDeleting(null);
    }
  };

  let content;
  if (!data && error) {
    content = <StatusMessage type="error" text={error.message} onRetry={retry} />;
  } else if (!data) {
    content = <StatusMessage type="loading" text="Loading subscribers..." />;
  } else if (!subscribers.length) {
    content = (
      <StatusMessage type="empty" title="No subscribers yet" text="Emails from the Newsletter form in the footer appear here." />
    );
  } else {
    content = (
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--cards">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber._id}>
                <td data-label="Email">
                  <span className="admin-table__strong">{subscriber.email}</span>
                </td>
                <td data-label="Subscribed">{formatDate(subscriber.createdAt)}</td>
                <td data-label="">
                  <div className="admin-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--icon"
                      onClick={() => setDeleting(subscriber)}
                      aria-label={`Remove ${subscriber.email}`}
                      title="Remove subscriber"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <AdminAlert alert={alert} onClose={() => setAlert(null)} />

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__title">Newsletter Subscribers</h2>
            <p className="admin-panel__sub">
              {data ? `${subscribers.length} subscriber${subscribers.length === 1 ? "" : "s"}` : "Loading..."}
            </p>
          </div>
          {subscribers.length > 0 && (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={handleCopy}>
              <FiCopy aria-hidden="true" />
              Copy emails
            </button>
          )}
        </div>

        {data && error && <StatusMessage type="error" text={error.message} onRetry={retry} compact />}
        {content}
      </section>

      <ConfirmDialog
        open={!!deleting}
        title="Remove this subscriber?"
        message={deleting && `${deleting.email} will be removed from the newsletter list.`}
        confirmLabel="Remove"
        busy={pending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
