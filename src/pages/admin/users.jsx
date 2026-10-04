import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import StatusMessage from "../../components/statusmessage/statusmessage";
import ConfirmDialog from "../../components/confirmdialog/confirmdialog";
import AdminAlert from "./adminalert";
import { useAuth } from "../../context/AuthContext";
import { useRequest } from "../../hooks/useRequest";
import { adminApi } from "../../services/api";
import { formatDate } from "../../utils/orders";

/*
  "/admin/users" – qeydiyyatdan keçən istifadəçilər (GET /api/users).
  Şifrə və digər həssas məlumat backend cavabında yoxdur.
  Silmə: DELETE /api/users/:id – admin hesablarını backend özü silmir.
*/
export default function AdminUsers() {
  const { user: me } = useAuth();
  const [deleting, setDeleting] = useState(null);
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState(null);

  const { data, error, retry, mutate } = useRequest((signal) => adminApi.users(signal), "users");
  const users = data?.users ?? [];
  const adminCount = users.filter((u) => u.role === "admin").length;

  const handleDelete = async () => {
    setPending(true);
    try {
      await adminApi.deleteUser(deleting._id);
      mutate((prev) => ({ ...prev, users: prev.users.filter((u) => u._id !== deleting._id) }));
      setAlert({ type: "success", text: `${deleting.name} (${deleting.email}) was deleted.` });
    } catch (err) {
      setAlert({ type: "error", text: `Could not delete user: ${err.message}` });
    } finally {
      setPending(false);
      setDeleting(null);
    }
  };

  let content;
  if (!data && error) {
    content = <StatusMessage type="error" text={error.message} onRetry={retry} />;
  } else if (!data) {
    content = <StatusMessage type="loading" text="Loading users..." />;
  } else if (!users.length) {
    content = <StatusMessage type="empty" title="No users yet" />;
  } else {
    content = (
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--cards">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isAdmin = user.role === "admin";
              const isMe = user._id === me._id;

              return (
                <tr key={user._id}>
                  <td data-label="Name">
                    <span className="admin-table__strong">{user.name}</span>
                    {isMe && <span className="admin-tag" style={{ marginLeft: 8 }}>You</span>}
                  </td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">
                    <span className={`admin-tag${isAdmin ? " admin-tag--accent" : ""}`}>{user.role}</span>
                  </td>
                  <td data-label="Registered">{formatDate(user.createdAt)}</td>
                  <td data-label="">
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--icon"
                        onClick={() => setDeleting(user)}
                        disabled={isAdmin}
                        aria-label={`Delete ${user.name}`}
                        title={isAdmin ? "Admin accounts cannot be deleted" : "Delete user"}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
            <h2 className="admin-panel__title">All Users</h2>
            <p className="admin-panel__sub">
              {data ? `${users.length} users · ${adminCount} admin${adminCount === 1 ? "" : "s"}` : "Loading..."}
            </p>
          </div>
        </div>

        {data && error && <StatusMessage type="error" text={error.message} onRetry={retry} compact />}
        {content}
      </section>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this user?"
        message={
          deleting &&
          `${deleting.name} (${deleting.email}) and their cart will be deleted. Their past orders stay in the order history. This cannot be undone.`
        }
        busy={pending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
