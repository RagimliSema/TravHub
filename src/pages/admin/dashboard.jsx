import { Link } from "react-router-dom";
import { FiPackage, FiShoppingBag, FiUsers, FiClock } from "react-icons/fi";
import StatusMessage from "../../components/statusmessage/statusmessage";
import { useRequest } from "../../hooks/useRequest";
import { adminApi, productApi } from "../../services/api";
import { formatPrice } from "../../utils/products";
import { ORDER_STATUSES, formatDate, orderNumber } from "../../utils/orders";
import "../../components/ordersection/ordersection.css";

/*
  "/admin" – Dashboard. Bütün rəqəmlər backend cavablarından hesablanır:
  məhsul sayı → /products total, sifarişlər və Pending → /orders, istifadəçilər → /users.
*/
export default function AdminDashboard() {
  const { data, error, retry } = useRequest(async (signal) => {
    const [products, orders, users] = await Promise.all([
      productApi.list({ limit: 1 }, signal),
      adminApi.orders({}, signal),
      adminApi.users(signal),
    ]);
    return { productsTotal: products.total, orders: orders.orders, users: users.users };
  }, "dashboard");

  if (!data) {
    return error ? (
      <StatusMessage type="error" text={error.message} onRetry={retry} />
    ) : (
      <StatusMessage type="loading" text="Loading dashboard..." />
    );
  }

  const { productsTotal, orders, users } = data;
  const countBy = (status) => orders.filter((order) => order.status === status).length;
  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.totalPrice, 0);

  const stats = [
    { label: "Total Products", value: productsTotal, Icon: FiPackage, to: "/admin/products" },
    { label: "Total Orders", value: orders.length, Icon: FiShoppingBag, to: "/admin/orders" },
    { label: "Total Users", value: users.length, Icon: FiUsers, to: "/admin/users" },
    { label: "Pending Orders", value: countBy("Pending"), Icon: FiClock, to: "/admin/orders", warning: true },
  ];

  return (
    <>
      {error && <StatusMessage type="error" text={error.message} onRetry={retry} compact />}

      <div className="admin-stats">
        {stats.map(({ label, value, Icon, to, warning }) => (
          <Link key={label} to={to} className={`admin-stat${warning ? " admin-stat--warning" : ""}`}>
            <span className="admin-stat__icon" aria-hidden="true">
              <Icon />
            </span>
            <span>
              <span className="admin-stat__value">{value}</span>
              <span className="admin-stat__label">{label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="admin-grid-2">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-panel__title">Recent Orders</h2>
            <Link to="/admin/orders" className="admin-btn admin-btn--ghost">
              View all
            </Link>
          </div>

          {orders.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table admin-table--cards">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td data-label="Order" className="admin-table__strong">
                        {orderNumber(order._id)}
                      </td>
                      <td data-label="Customer">{order.user?.name ?? "Deleted user"}</td>
                      <td data-label="Date">{formatDate(order.createdAt)}</td>
                      <td data-label="Total">{formatPrice(order.totalPrice)}</td>
                      <td data-label="Status">
                        <span className={`order-status order-status--${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <StatusMessage type="empty" title="No orders yet" compact />
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-panel__title">Orders by Status</h2>
          </div>

          <ul className="admin-bars">
            {ORDER_STATUSES.map((status) => {
              const count = countBy(status);
              const width = orders.length ? (count / orders.length) * 100 : 0;
              return (
                <li key={status} className="admin-bars__row">
                  <span>{status}</span>
                  <span className="admin-bars__track" aria-hidden="true">
                    <span className="admin-bars__fill" style={{ display: "block", width: `${width}%` }} />
                  </span>
                  <span className="admin-bars__count">{count}</span>
                </li>
              );
            })}
          </ul>

          <p className="admin-order__total">Revenue (excl. cancelled): {formatPrice(revenue)}</p>
        </section>
      </div>
    </>
  );
}
