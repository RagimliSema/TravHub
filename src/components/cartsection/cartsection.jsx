import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaMinus, FaPlus, FaXmark } from "react-icons/fa6";
import StatusMessage from "../statusmessage/statusmessage";
import { useCart } from "../../context/CartContext";
import { formatPrice, getProductImage } from "../../utils/products";
import "../travhubbtn/travhubbtn.css";
import "./cartsection.css";

/* ---------- Səbətdəki bir tur: şəkil, ad, qiymət, yer sayı, cəm, sil ---------- */
function CartItem({ item, busy, onQuantity, onRemove }) {
  const { product, quantity, subtotal } = item;

  return (
    <li className="cart-item">
      <img className="cart-item__image" src={getProductImage(product.image)} alt="" />

      <div className="cart-item__info">
        <Link to={`/tour-details/${product._id}`} className="cart-item__title">
          {product.title}
        </Link>
        <span className="cart-item__meta">
          {product.category} · {product.stock} seats left
        </span>
      </div>

      <span className="cart-item__price" data-label="Price">
        {formatPrice(product.price)}
      </span>

      <div className="cart-qty" data-label="Seats">
        <button
          type="button"
          onClick={() => onQuantity(quantity - 1)}
          disabled={busy || quantity <= 1}
          aria-label={`${product.title}: azalt`}
        >
          <FaMinus />
        </button>
        <span aria-live="polite">{quantity}</span>
        <button
          type="button"
          onClick={() => onQuantity(quantity + 1)}
          disabled={busy || quantity >= product.stock}
          aria-label={`${product.title}: artır`}
        >
          <FaPlus />
        </button>
      </div>

      <span className="cart-item__subtotal" data-label="Subtotal">
        {formatPrice(subtotal)}
      </span>

      <button
        type="button"
        className="cart-item__remove"
        onClick={onRemove}
        disabled={busy}
        aria-label={`${product.title}: səbətdən sil`}
      >
        <FaXmark />
      </button>
    </li>
  );
}

/*
  Səbət ("/cart"). Məlumat backend-dəki səbətdən gəlir (CartContext),
  hər dəyişiklik dərhal backend-ə yazılır və stok orada da yoxlanılır.
*/
export default function CartSection() {
  const { cart, loading, error, updateItem, removeItem, clear, refresh } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");

  const run = async (id, action) => {
    setBusyId(id);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  let content;
  if (loading) {
    content = <StatusMessage type="loading" text="Loading your cart..." />;
  } else if (error) {
    content = <StatusMessage type="error" text={error} onRetry={refresh} />;
  } else if (!cart.items.length) {
    content = (
      <StatusMessage
        type="empty"
        title="Your cart is empty"
        text="Choose a tour and book your seats – they will appear here."
        action={{ to: "/tours", label: "Browse Tours" }}
      />
    );
  } else {
    content = (
      <div className="shop-layout">
        <div>
          <div className="cart-head" aria-hidden="true">
            <span>Tour</span>
            <span>Price</span>
            <span>Seats</span>
            <span>Subtotal</span>
          </div>

          <ul className="cart-list">
            {cart.items.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                busy={!!busyId}
                onQuantity={(quantity) => run(item.product._id, () => updateItem(item.product._id, quantity))}
                onRemove={() => run(item.product._id, () => removeItem(item.product._id))}
              />
            ))}
          </ul>

          {actionError && (
            <p className="shop-error" role="alert">
              {actionError}
            </p>
          )}

          <div className="cart-actions">
            <Link to="/tours" className="shop-link">
              <FaArrowLeft aria-hidden="true" /> Continue Shopping
            </Link>
            <button type="button" className="shop-link" onClick={() => run("all", clear)} disabled={!!busyId}>
              Clear Cart
            </button>
          </div>
        </div>

        <aside className="shop-summary">
          <h3 className="shop-summary__title">Cart Totals</h3>
          <ul className="shop-summary__list">
            <li className="shop-summary__row">
              Seats
              <span>{cart.totalItems}</span>
            </li>
            <li className="shop-summary__row shop-summary__row--total">
              Total
              <span>{formatPrice(cart.totalPrice)}</span>
            </li>
          </ul>

          <Link to="/checkout" className="travhub-btn shop-summary__btn">
            <span>Proceed to Checkout</span>
          </Link>
        </aside>
      </div>
    );
  }

  return (
    <section className="shop-section">
      <div className="shop-container">{content}</div>
    </section>
  );
}
