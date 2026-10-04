import { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { adminApi } from "../../services/api";
import { getProductImage, productImageNames } from "../../utils/products";

const EMPTY = {
  title: "",
  description: "",
  price: "",
  category: "",
  location: "",
  stock: "",
  discount: "0",
  image: "",
};

// backend məhsulu → forma dəyərləri (hamısı mətn)
const toValues = (product) =>
  product
    ? Object.fromEntries(Object.keys(EMPTY).map((key) => [key, String(product[key] ?? EMPTY[key])]))
    : EMPTY;

// forma → backend-ə göndəriləcək obyekt (rəqəmlər rəqəm kimi).
// Boş qiymət null gedir ki, backend "Price is required" desin; boş stok = 0 yer.
const toPayload = (values) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  price: values.price === "" ? null : Number(values.price),
  category: values.category.trim(),
  location: values.location.trim(),
  stock: values.stock === "" ? 0 : Number(values.stock),
  discount: values.discount === "" ? 0 : Number(values.discount),
  image: values.image.trim(),
});

/*
  Məhsul əlavə etmə / redaktə forması (pəncərə).
  product = null → yeni məhsul (POST /api/products), əks halda redaktə (PUT /api/products/:id).
  Yoxlamanı backend edir – sahə xətaları uyğun sahənin altında göstərilir.
*/
export default function ProductForm({ product, categories, onClose, onSaved }) {
  const dialogRef = useRef(null);
  const isNew = !product;
  const [values, setValues] = useState(() => toValues(product));
  const [status, setStatus] = useState({ pending: false, error: "", fields: {} });

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  const field = (name) => ({
    id: `pf-${name}`,
    name,
    value: values[name],
    onChange: (e) => setValues((prev) => ({ ...prev, [name]: e.target.value })),
    "aria-invalid": !!status.fields[name],
  });

  const fieldError = (name) =>
    status.fields[name] && <span className="admin-form__error">{status.fields[name]}</span>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ pending: true, error: "", fields: {} });

    try {
      const payload = toPayload(values);
      const data = isNew
        ? await adminApi.createProduct(payload)
        : await adminApi.updateProduct(product._id, payload);
      onSaved(data.product, isNew);
    } catch (error) {
      const fields = Object.fromEntries((error.errors ?? []).map((err) => [err.field, err.message]));
      setStatus({ pending: false, error: error.message, fields });
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="admin-dialog"
      aria-labelledby="product-form-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!status.pending) onClose();
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="admin-dialog__head">
          <h2 id="product-form-title" className="admin-dialog__title">
            {isNew ? "Add Product" : "Edit Product"}
          </h2>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--icon"
            onClick={onClose}
            disabled={status.pending}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="admin-dialog__body">
          {status.error && (
            <p className="admin-alert admin-alert--error" role="alert" style={{ marginBottom: 16 }}>
              {status.error}
            </p>
          )}

          <div className="admin-form">
            <div className="admin-form__field admin-form__field--wide">
              <label htmlFor="pf-title">Title *</label>
              <input className="admin-input" type="text" maxLength={120} {...field("title")} />
              {fieldError("title")}
            </div>

            <div className="admin-form__field admin-form__field--wide">
              <label htmlFor="pf-description">Description *</label>
              <textarea className="admin-textarea" maxLength={2000} {...field("description")} />
              {fieldError("description")}
            </div>

            <div className="admin-form__field">
              <label htmlFor="pf-category">Category *</label>
              <input className="admin-input" type="text" list="pf-categories" {...field("category")} />
              <datalist id="pf-categories">
                {categories.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              {fieldError("category")}
            </div>

            <div className="admin-form__field">
              <label htmlFor="pf-location">Location</label>
              <input className="admin-input" type="text" placeholder="e.g. Paris" {...field("location")} />
              {fieldError("location")}
            </div>

            <div className="admin-form__field">
              <label htmlFor="pf-price">Price ($) *</label>
              <input className="admin-input" type="number" min="0" step="0.01" {...field("price")} />
              {fieldError("price")}
            </div>

            <div className="admin-form__field">
              <label htmlFor="pf-stock">Stock (seats) *</label>
              <input className="admin-input" type="number" min="0" step="1" {...field("stock")} />
              {fieldError("stock")}
            </div>

            <div className="admin-form__field">
              <label htmlFor="pf-discount">Discount (%)</label>
              <input className="admin-input" type="number" min="0" max="100" step="1" {...field("discount")} />
              {fieldError("discount")}
            </div>

            <div className="admin-form__field">
              <label htmlFor="pf-image">Image</label>
              <input className="admin-input" type="text" list="pf-images" placeholder="tours-1-1.jpg" {...field("image")} />
              <datalist id="pf-images">
                {productImageNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
              <span className="admin-form__hint">File name from src/assets/image or a full image URL</span>
              {fieldError("image")}
            </div>

            <div className="admin-form__field admin-form__field--wide admin-form__preview">
              <img src={getProductImage(values.image.trim())} alt="" />
              <span className="admin-form__hint">Image preview</span>
            </div>
          </div>
        </div>

        <div className="admin-dialog__foot">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose} disabled={status.pending}>
            Cancel
          </button>
          <button type="submit" className="admin-btn" disabled={status.pending}>
            {status.pending ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
