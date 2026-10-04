import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import StatusMessage from "../statusmessage/statusmessage";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { orderApi } from "../../services/api";
import { formatPrice } from "../../utils/products";
import "../travhubbtn/travhubbtn.css";
import "../cartsection/cartsection.css";
import "./checkoutsection.css";

const FIELDS = [
  { name: "fullName", label: "Full Name", autoComplete: "name", required: true },
  { name: "phone", label: "Phone", autoComplete: "tel", type: "tel", required: true },
  { name: "address", label: "Address", autoComplete: "street-address", required: true, wide: true },
  { name: "city", label: "City", autoComplete: "address-level2", required: true },
  { name: "country", label: "Country", autoComplete: "country-name", required: true },
  { name: "postalCode", label: "Postal Code (optional)", autoComplete: "postal-code" },
];

// backend xətası: { field: "shippingAddress.city", message } → { city: message }
const toFieldErrors = (errors = []) =>
  Object.fromEntries(errors.map(({ field, message }) => [field.split(".").pop(), message]));

/*
  Checkout ("/checkout"): əlaqə / ünvan forması + sifariş xülasəsi.
  "Place Order" → POST /api/orders. Backend səbətdəki turlardan sifariş yaradır,
  qiyməti özü hesablayır, stoku azaldır və səbəti boşaldır.
*/
export default function CheckoutSection() {
  const { user } = useAuth();
  const { cart, loading, error, reset, refresh } = useCart();
  const navigate = useNavigate();

  const [values, setValues] = useState(() => ({
    fullName: user?.name ?? "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  }));
  const [status, setStatus] = useState({ pending: false, error: "", fieldErrors: {} });

  const handleChange = (e) => setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ pending: true, error: "", fieldErrors: {} });

    try {
      const { order } = await orderApi.create({ shippingAddress: values });
      navigate("/my-orders", { state: { placedOrderId: order._id } });
      reset(); // backend səbəti artıq boşaldıb
    } catch (err) {
      setStatus({ pending: false, error: err.message, fieldErrors: toFieldErrors(err.errors) });
    }
  };

  if (loading) {
    return (
      <section className="shop-section">
        <StatusMessage type="loading" text="Loading your cart..." />
      </section>
    );
  }

  if (error || !cart.items.length) {
    return (
      <section className="shop-section">
        {error ? (
          <StatusMessage type="error" text={error} onRetry={refresh} />
        ) : (
          <StatusMessage
            type="empty"
            title="Your cart is empty"
            text="Add a tour to your cart before checking out."
            action={{ to: "/tours", label: "Browse Tours" }}
          />
        )}
      </section>
    );
  }

  return (
    <section className="shop-section">
      <div className="shop-container">
        <form className="shop-layout" onSubmit={handleSubmit}>
          <div className="checkout-form">
            <h3 className="checkout-form__title">Contact &amp; Address</h3>

            <div className="checkout-form__grid">
              {FIELDS.map((field) => (
                <div
                  key={field.name}
                  className={`checkout-form__field${field.wide ? " checkout-form__field--wide" : ""}`}
                >
                  <label htmlFor={`co-${field.name}`}>{field.label}</label>
                  <input
                    id={`co-${field.name}`}
                    name={field.name}
                    type={field.type ?? "text"}
                    autoComplete={field.autoComplete}
                    required={field.required}
                    value={values[field.name]}
                    onChange={handleChange}
                    aria-invalid={!!status.fieldErrors[field.name]}
                  />
                  {status.fieldErrors[field.name] && (
                    <span className="checkout-form__error">{status.fieldErrors[field.name]}</span>
                  )}
                </div>
              ))}
            </div>

            <Link to="/cart" className="shop-link">
              <FaArrowLeft aria-hidden="true" /> Back to Cart
            </Link>
          </div>

          <aside className="shop-summary">
            <h3 className="shop-summary__title">Your Order</h3>
            <ul className="shop-summary__list">
              {cart.items.map((item) => (
                <li key={item.product._id} className="shop-summary__row">
                  {item.product.title} × {item.quantity}
                  <span>{formatPrice(item.subtotal)}</span>
                </li>
              ))}
              <li className="shop-summary__row shop-summary__row--total">
                Total
                <span>{formatPrice(cart.totalPrice)}</span>
              </li>
            </ul>

            <p className="shop-summary__note">Online payment is not available yet – the order is paid later.</p>

            {status.error && (
              <p className="shop-error" role="alert">
                {status.error}
              </p>
            )}

            <button type="submit" className="travhub-btn shop-summary__btn" disabled={status.pending}>
              <span>{status.pending ? "Placing order..." : "Place Order"}</span>
            </button>
          </aside>
        </form>
      </div>
    </section>
  );
}
