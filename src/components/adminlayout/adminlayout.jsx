import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiGrid, FiPackage, FiShoppingBag, FiUsers, FiMail, FiSend, FiArrowLeft, FiLogOut } from "react-icons/fi";
import { FaSuitcaseRolling } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./adminlayout.css";

const NAV = [
  { to: "/admin", label: "Dashboard", Icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", Icon: FiPackage },
  { to: "/admin/orders", label: "Orders", Icon: FiShoppingBag },
  { to: "/admin/users", label: "Users", Icon: FiUsers },
  { to: "/admin/messages", label: "Messages", Icon: FiMail },
  { to: "/admin/subscribers", label: "Subscribers", Icon: FiSend },
];

/*
  Admin Panel-in çərçivəsi: solda menyu (kiçik ekranda yuxarıda), sağda səhifə.
  Rənglər, loqo və şriftlər TravHub-ın özüdür. Səhifələr <Outlet /> yerində açılır.
*/
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const current = NAV.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to))) ?? NAV[0];

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Link to="/admin" className="admin-logo" aria-label="TravHub Admin – Dashboard">
            <FaSuitcaseRolling aria-hidden="true" />
            <span>TravHub</span>
          </Link>
          <span className="admin-sidebar__label">Admin Panel</span>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav__link${isActive ? " is-active" : ""}`}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link to="/" className="admin-nav__link">
            <FiArrowLeft aria-hidden="true" />
            <span>Back to TravHub</span>
          </Link>
          <button type="button" className="admin-nav__link" onClick={handleLogout}>
            <FiLogOut aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar__title">{current.label}</h1>

          <div className="admin-topbar__user">
            <span className="admin-avatar" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="admin-topbar__who">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <span className="admin-role-badge">Admin</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
