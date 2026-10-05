import { useState } from "react";
import { FiMail, FiTrash2 } from "react-icons/fi";
import StatusMessage from "../../components/statusmessage/statusmessage";
import ConfirmDialog from "../../components/confirmdialog/confirmdialog";
import AdminAlert from "./adminalert";
import { useRequest } from "../../hooks/useRequest";
import { adminApi } from "../../services/api";
import { formatDate } from "../../utils/orders";

/*
  "/admin/messages" – Contact səhifəsindən gələn mesajlar (GET /api/contact).
  Hər mesaj həm də adminlərin email-inə göndərilir; burada email çatmasa da görünür.
  "Reply" email proqramını açır, "Delete" – DELETE /api/contact/:id.
*/
export default function AdminMessages() {
  const [deleting, setDeleting] = useState(null);
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState(null);

  const { data, error, retry, mutate } = useRequest((signal) => adminApi.messages(signal), "messages");
  const messages = data?.messages ?? [];

  const handleDelete = async () => {
    setPending(true);
    try {
      await adminApi.deleteMessage(deleting._id);
      mutate((prev) => ({ ...prev, messages: prev.messages.filter((m) => m._id !== deleting._id) }));
      setAlert({ type: "success", text: `The message from ${deleting.name} was deleted.` });
    } catch (err) {
      setAlert({ type: "error", text: `Could not delete the message: ${err.message}` });
    } finally {
      setPending(false);
      setDeleting(null);
    }
  };

  let content;
  if (!data && error) {
    content = <StatusMessage type="error" text={error.message} onRetry={retry} />;
  } else if (!data) {
    content = <StatusMessage type="loading" text="Loading messages..." />;
  } else if (!messages.length) {
    content = <StatusMessage type="empty" title="No messages yet" text="Messages sent from the Contact page appear here." />;
  } else {
    content = (
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--cards">
          <thead>
            <tr>
              <th>From</th>
              <th>Message</th>
              <th>Received</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message._id}>
                <td data-label="From">
                  <span className="admin-table__strong">{message.name}</span>
                  <br />
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </td>
                <td data-label="Message">
                  <p className="admin-message-text">{message.message}</p>
                </td>
                <td data-label="Received">{formatDate(message.createdAt)}</td>
                <td data-label="">
                  <div className="admin-table__actions">
                    <a
                      className="admin-btn admin-btn--ghost admin-btn--icon"
                      href={`mailto:${message.email}?subject=${encodeURIComponent("Re: your message to TravHub")}`}
                      aria-label={`Reply to ${message.name}`}
                      title="Reply by email"
                    >
                      <FiMail />
                    </a>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--icon"
                      onClick={() => setDeleting(message)}
                      aria-label={`Delete the message from ${message.name}`}
                      title="Delete message"
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
            <h2 className="admin-panel__title">Contact Messages</h2>
            <p className="admin-panel__sub">
              {data ? `${messages.length} message${messages.length === 1 ? "" : "s"}` : "Loading..."}
            </p>
          </div>
        </div>

        {data && error && <StatusMessage type="error" text={error.message} onRetry={retry} compact />}
        {content}
      </section>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this message?"
        message={deleting && `The message from ${deleting.name} (${deleting.email}) will be deleted. This cannot be undone.`}
        busy={pending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
