import { useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import StatusMessage from "../../components/statusmessage/statusmessage";
import ConfirmDialog from "../../components/confirmdialog/confirmdialog";
import AdminAlert from "./adminalert";
import { useRequest } from "../../hooks/useRequest";
import { adminApi } from "../../services/api";
import { formatDate } from "../../utils/orders";

// yazının qısa adı → saytdakı başlıq və səhifə
const POSTS = {
  "katie-stewart-net-zero": { title: "Katie Stewart Your charity may be net zero", to: "/news-details" },
};

/*
  "/admin/comments" – bloq yazılarına bütün şərhlər və cavablar (GET /api/comments/all).
  Silmə: DELETE /api/comments/:id – əsas şərh silinəndə onun cavabları da silinir.
*/
export default function AdminComments() {
  const [deleting, setDeleting] = useState(null);
  const [pending, setPending] = useState(false);
  const [alert, setAlert] = useState(null);

  const { data, error, retry, mutate } = useRequest((signal) => adminApi.comments(signal), "comments");
  const comments = data?.comments ?? [];

  const handleDelete = async () => {
    setPending(true);
    try {
      const result = await adminApi.deleteComment(deleting._id);
      mutate((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== deleting._id && c.parent !== deleting._id),
      }));
      setAlert({
        type: "success",
        text: `${result.deleted} comment${result.deleted === 1 ? "" : "s"} by ${deleting.name} deleted.`,
      });
    } catch (err) {
      setAlert({ type: "error", text: `Could not delete the comment: ${err.message}` });
    } finally {
      setPending(false);
      setDeleting(null);
    }
  };

  let content;
  if (!data && error) {
    content = <StatusMessage type="error" text={error.message} onRetry={retry} />;
  } else if (!data) {
    content = <StatusMessage type="loading" text="Loading comments..." />;
  } else if (!comments.length) {
    content = <StatusMessage type="empty" title="No comments yet" text="Comments on blog articles appear here." />;
  } else {
    content = (
      <div className="admin-table-wrap">
        <table className="admin-table admin-table--cards">
          <thead>
            <tr>
              <th>Author</th>
              <th>Comment</th>
              <th>Article</th>
              <th>Date</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => {
              const post = POSTS[comment.post] ?? { title: comment.post, to: "/news-details" };
              return (
                <tr key={comment._id}>
                  <td data-label="Author">
                    <span className="admin-table__strong">{comment.name}</span>
                    <br />
                    {comment.email ?? <em>Deleted account</em>}
                  </td>
                  <td data-label="Comment">
                    {comment.parent && <span className="admin-tag">Reply</span>}
                    <p className="admin-message-text">{comment.text}</p>
                  </td>
                  <td data-label="Article">
                    <Link to={`${post.to}#comments`}>{post.title}</Link>
                  </td>
                  <td data-label="Date">{formatDate(comment.createdAt)}</td>
                  <td data-label="">
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--icon"
                        onClick={() => setDeleting(comment)}
                        aria-label={`Delete the comment by ${comment.name}`}
                        title="Delete comment"
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

  const replyNote =
    deleting?.replies > 0
      ? ` Its ${deleting.replies} repl${deleting.replies === 1 ? "y" : "ies"} will be deleted too.`
      : "";

  return (
    <>
      <AdminAlert alert={alert} onClose={() => setAlert(null)} />

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__title">Blog Comments</h2>
            <p className="admin-panel__sub">
              {data ? `${comments.length} comment${comments.length === 1 ? "" : "s"} (replies included)` : "Loading..."}
            </p>
          </div>
        </div>

        {data && error && <StatusMessage type="error" text={error.message} onRetry={retry} compact />}
        {content}
      </section>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this comment?"
        message={deleting && `The comment by ${deleting.name} will be removed from the website.${replyNote} This cannot be undone.`}
        busy={pending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
