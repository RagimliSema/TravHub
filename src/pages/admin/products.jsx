import { useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import StatusMessage from "../../components/statusmessage/statusmessage";
import ConfirmDialog from "../../components/confirmdialog/confirmdialog";
import AdminAlert from "./adminalert";
import ProductForm from "./productform";
import { useRequest } from "../../hooks/useRequest";
import { adminApi, productApi } from "../../services/api";
import { formatPrice, getProductImage } from "../../utils/products";

const PAGE_SIZE = 10;

/*
  "/admin/products" – məhsulların idarəsi (real backend: /api/products).
  Siyahı, axtarış, səhifələmə, əlavə et / redaktə et (pəncərə), sil (təsdiqlə).
*/
export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | məhsul
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);
  const [alert, setAlert] = useState(null);

  const query = { page, limit: PAGE_SIZE, sort: "newest", search };
  const { data, loading, error, retry } = useRequest(
    (signal) => productApi.list(query, signal),
    JSON.stringify(query)
  );
  const categories = useRequest(() => productApi.categories(), "categories");

  const products = data?.products ?? [];
  const pages = data?.pages ?? 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSaved = (product, isNew) => {
    setEditing(null);
    setAlert({ type: "success", text: `“${product.title}” was ${isNew ? "created" : "updated"} successfully.` });
    if (isNew) setPage(1);
    retry();
    categories.retry();
  };

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      await adminApi.deleteProduct(deleting._id);
      setAlert({ type: "success", text: `“${deleting.title}” was deleted.` });
      // səhifədəki son məhsul silinibsə əvvəlki səhifəyə keç
      if (products.length === 1 && page > 1) setPage(page - 1);
      retry();
      categories.retry();
    } catch (err) {
      setAlert({ type: "error", text: `Could not delete: ${err.message}` });
    } finally {
      setDeletePending(false);
      setDeleting(null);
    }
  };

  let content;
  if (!data && error) {
    content = <StatusMessage type="error" text={error.message} onRetry={retry} />;
  } else if (!data) {
    content = <StatusMessage type="loading" text="Loading products..." />;
  } else if (!products.length) {
    content = (
      <StatusMessage
        type="empty"
        title={search ? `No products found for "${search}".` : "No products yet"}
        text={search ? "Try another search." : "Add your first tour with the “Add Product” button."}
      />
    );
  } else {
    content = (
      <>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--cards">
            <thead>
              <tr>
                <th>Image</th>
                <th>Tour</th>
                <th>Location</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Likes</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td data-label="">
                    <img className="admin-thumb" src={getProductImage(product.image)} alt="" />
                  </td>
                  <td data-label="Tour">
                    <span>
                      <span className="admin-table__strong">{product.title}</span>
                      <span className="admin-table__muted">{product.category}</span>
                    </span>
                  </td>
                  <td data-label="Location">{product.location || "—"}</td>
                  <td data-label="Price">{formatPrice(product.price)}</td>
                  <td data-label="Discount">
                    {product.discount > 0 ? <span className="admin-tag admin-tag--soft">{product.discount}%</span> : "—"}
                  </td>
                  <td data-label="Stock">
                    <span className={`admin-tag${product.stock === 0 ? " admin-tag--danger" : ""}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td data-label="Likes">{product.likesCount}</td>
                  <td data-label="">
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--icon"
                        onClick={() => setEditing(product)}
                        aria-label={`Edit ${product.title}`}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--danger admin-btn--icon"
                        onClick={() => setDeleting(product)}
                        aria-label={`Delete ${product.title}`}
                        title="Delete"
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

        {pages > 1 && (
          <div className="admin-pager">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setPage(page + 1)}
              disabled={page >= pages || loading}
            >
              Next
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <AdminAlert alert={alert} onClose={() => setAlert(null)} />

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__title">All Products</h2>
            <p className="admin-panel__sub">{data ? `${data.total} tours in the database` : "Loading..."}</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <form className="admin-search" role="search" onSubmit={handleSearch}>
            <input
              className="admin-input"
              type="search"
              placeholder="Search by title or location"
              aria-label="Search products"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="admin-btn admin-btn--icon" aria-label="Search">
              <FiSearch />
            </button>
          </form>

          <button type="button" className="admin-btn" onClick={() => setEditing("new")}>
            <FiPlus aria-hidden="true" /> Add Product
          </button>
        </div>

        {data && error && <StatusMessage type="error" text={error.message} onRetry={retry} compact />}
        {content}
      </section>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories.data?.categories ?? []}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this product?"
        message={
          deleting &&
          `“${deleting.title}” will be removed from the store, all carts and wishlists. Existing orders keep their copy. This cannot be undone.`
        }
        busy={deletePending}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
