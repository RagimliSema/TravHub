import { useState } from "react";
import { Link } from "react-router-dom";
import StatusMessage from "../../components/statusmessage/statusmessage";
import ConfirmDialog from "../../components/confirmdialog/confirmdialog";
import AdminAlert from "./adminalert";
import { useRequest } from "../../hooks/useRequest";
import { adminApi } from "../../services/api";
import { formatPrice } from "../../utils/products";
import { FINAL_STATUSES, ORDER_STATUSES, formatDate, orderNumber } from "../../utils/orders";
import "../../components/ordersection/ordersection.css";

/* ---------- Bir sifariş: müştəri, turlar, ünvan, cəm, status ---------- */
function AdminOrder({ order, busy, onStatusChange }) {
  const { shippingAddress: address } = order;
  const locked = FINAL_STATUSES.includes(order.status);

  return (
    <article className="admin-order">
      <header className="admin-order__head">
        <div>
          <h3 className="admin-order__id">Order {orderNumber(order._id)}</h3>
          <span className="admin-order__meta">
            {formatDate(order.createdAt)} · {order.user ? `${order.user.name} (${order.user.email})` : "Deleted user"}
          </span>
        </div>

        <div className="admin-order__status">
          <span className={`order-status order-status--${order.status.toLowerCase()}`}>{order.status}</span>
          <select
            className="admin-select"
            value={order.status}
            onChange={(e) => onStatusChange(order, e.target.value)}
            disabled={busy || locked}
            aria-label={`Status of order ${orderNumber(order._id)}`}
            title={locked ? "Delivered and cancelled orders cannot be changed" : "Change status"}
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="admin-order__body">
        <div>
          <p className="admin-order__label">Tours</p>
          <ul className="admin-order__items">
            {order.orderItems.map((item) => (
              <li key={item.product} className="admin-order__item">
                <span>
                  <strong>{item.title}</strong> × {item.quantity}
                </span>
                <span>
                  {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="admin-order__total">Total: {formatPrice(order.totalPrice)}</p>
        </div>

        <div>
          <p className="admin-order__label">Shipping / Contact</p>
          <address className="admin-order__address">
            {address.fullName}
            <br />
            {address.phone}
            <br />
            {address.address}
            <br />
            {address.city}
            {address.postalCode ? ` ${address.postalCode}` : ""}, {address.country}
          </address>
        </div>
      </div>
    </article>
  );
}

/*
  "/admin/orders" – bütün sifarişlər (GET /api/orders) və status dəyişmə
  (PUT /api/orders/:id/status). "Cancelled" seçiləndə təsdiq soruşulur, çünki
  backend yerləri stoka qaytarır və sifariş bir daha dəyişmir.
*/
export default function AdminOrders() {
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [alert, setAlert] = useState(null);

  const { data, loading, error, retry, mutate } = useRequest(
    (signal) => adminApi.orders({ status: filter }, signal),
    `orders-${filter}`
  );
  const orders = data?.orders ?? [];

  const updateStatus = async (order, status) => {
    setBusyId(order._id);
    setAlert(null);
    try {
      const { order: updated } = await adminApi.updateOrderStatus(order._id, status);
      // yalnız dəyişən sifarişi yenilə – səhifəni yenidən yükləmədən
      mutate((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o._id === order._id ? { ...o, status: updated.status } : o)),
      }));
      setAlert({ type: "success", text: `Order ${orderNumber(order._id)} is now “${updated.status}”.` });
    } catch (err) {
      setAlert({ type: "error", text: `Could not update order ${orderNumber(order._id)}: ${err.message}` });
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = (order, status) => {
    if (status === order.status) return;
    if (status === "Cancelled") {
      setCancelTarget(order);
      return;
    }
    updateStatus(order, status);
  };

  let content;
  if (!data && error) {
    content = <StatusMessage type="error" text={error.message} onRetry={retry} />;
  } else if (!data || (loading && !orders.length)) {
    content = <StatusMessage type="loading" text="Loading orders..." />;
  } else if (!orders.length) {
    content = (
      <StatusMessage
        type="empty"
        title={filter ? `No ${filter.toLowerCase()} orders` : "No orders yet"}
        text={filter ? "Try another status." : "Orders placed on the website will appear here."}
      />
    );
  } else {
    content = (
      <div className="admin-orders">
        {orders.map((order) => (
          <AdminOrder key={order._id} order={order} busy={busyId === order._id} onStatusChange={handleStatusChange} />
        ))}
      </div>
    );
  }

  return (
    <>
      <AdminAlert alert={alert} onClose={() => setAlert(null)} />

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__title">All Orders</h2>
            <p className="admin-panel__sub">{data ? `${orders.length} orders` : "Loading..."}</p>
          </div>

          <select
            className="admin-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {data && error && <StatusMessage type="error" text={error.message} onRetry={retry} compact />}
        {content}

        {data && (
          <p className="admin-panel__sub" style={{ marginTop: 16 }}>
            Customers see their own orders on <Link to="/my-orders">My Orders</Link>.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this order?"
        message={
          cancelTarget &&
          `Order ${orderNumber(cancelTarget._id)} will be cancelled and its seats returned to stock. A cancelled order cannot be changed again.`
        }
        confirmLabel="Cancel Order"
        busy={!!busyId}
        onConfirm={async () => {
          await updateStatus(cancelTarget, "Cancelled");
          setCancelTarget(null);
        }}
        onCancel={() => setCancelTarget(null)}
      />
    </>
  );
}
