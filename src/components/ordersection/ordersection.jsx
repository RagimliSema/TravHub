import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import StatusMessage from "../statusmessage/statusmessage";
import { orderApi } from "../../services/api";
import { formatPrice, getProductImage } from "../../utils/products";
import "../cartsection/cartsection.css";
import "./ordersection.css";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ---------- Bir sifariş kartı ---------- */
function OrderCard({ order, highlighted }) {
  const { shippingAddress: address } = order;

  return (
    <article className={`order-card${highlighted ? " is-new" : ""}`}>
      <header className="order-card__head">
        <div>
          <h3 className="order-card__number">Order #{order._id.slice(-6).toUpperCase()}</h3>
          <span className="order-card__date">{formatDate(order.createdAt)}</span>
        </div>
        <span className={`order-status order-status--${order.status.toLowerCase()}`}>{order.status}</span>
      </header>

      <ul className="order-card__items">
        {order.orderItems.map((item) => (
          <li key={item.product} className="order-card__item">
            <img src={getProductImage(item.image)} alt="" />
            <Link to={`/tour-details/${item.product}`} className="order-card__title">
              {item.title}
            </Link>
            <span className="order-card__qty">
              {item.quantity} × {formatPrice(item.price)}
            </span>
          </li>
        ))}
      </ul>

      <footer className="order-card__foot">
        <span className="order-card__address">
          {address.fullName} · {address.city}, {address.country}
        </span>
        <strong className="order-card__total">Total: {formatPrice(order.totalPrice)}</strong>
      </footer>
    </article>
  );
}

/*
  My Orders ("/my-orders"): istifadəçinin sifarişləri (GET /api/orders/my-orders).
  Checkout-dan gəldikdə yeni sifariş yuxarıda vurğulanır.
*/
export default function OrderSection() {
  const location = useLocation();
  const placedOrderId = location.state?.placedOrderId;

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ attempt: -1, orders: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    orderApi
      .mine(controller.signal)
      .then((data) => setState({ attempt, orders: data.orders, error: null }))
      .catch((error) => error.name !== "AbortError" && setState({ attempt, orders: [], error }));
    return () => controller.abort();
  }, [attempt]);

  const loading = state.attempt !== attempt;

  let content;
  if (loading) {
    content = <StatusMessage type="loading" text="Loading your orders..." />;
  } else if (state.error) {
    content = <StatusMessage type="error" text={state.error.message} onRetry={() => setAttempt((n) => n + 1)} />;
  } else if (!state.orders.length) {
    content = (
      <StatusMessage
        type="empty"
        title="You have no orders yet"
        text="When you book a tour, your orders will appear here."
        action={{ to: "/tours", label: "Browse Tours" }}
      />
    );
  } else {
    content = (
      <div className="order-list">
        {state.orders.map((order) => (
          <OrderCard key={order._id} order={order} highlighted={order._id === placedOrderId} />
        ))}
      </div>
    );
  }

  return (
    <section className="shop-section">
      <div className="shop-container">
        {placedOrderId && !loading && !state.error && (
          <p className="order-success" role="status">
            Thank you! Your order has been placed successfully.
          </p>
        )}
        {content}
      </div>
    </section>
  );
}
