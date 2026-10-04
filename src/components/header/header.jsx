import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useScrollUpSticky } from "../../hooks/useScrollUpSticky";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./header.css";

import {
  FiMapPin,
  FiMail,
  FiClock,
  FiSearch,
  FiX,
  FiChevronRight,
  FiUser,
  FiShoppingBag,
  FiShield,
} from "react-icons/fi";
import {
  FaSuitcaseRolling,
  FaEnvelope,
  FaPhoneAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const MENU = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Pages",
    href: "#",
    children: [
      { label: "Our Team", href: "/team" },
      { label: "Pricing Table", href: "/pricing" },
      { label: "Gallery", href: "/gallery" },
      { label: "FAQs", href: "/faq" },
      { label: "Login", href: "/login" },
      { label: "404 Error", href: "/404" },
    ],
  },
  {
    label: "Tours",
    href: "#",
    children: [
      { label: "Tour Page", href: "/tours" },
      { label: "Tour Sidebar", href: "/tours-sidebar" },
      { label: "Tour Carousel", href: "/tours-carousel" },
      { label: "Tour Details", href: "/tour-details" },
    ],
  },
  {
    label: "Destination",
    href: "#",
    children: [
      { label: "Destination", href: "/destination" },
      { label: "Destination Carousel", href: "/destination-carousel" },
      { label: "Destination Details", href: "/destination-details" },
    ],
  },
  {
    label: "News",
    href: "#",
    // demo-dakı kimi Grid, List və Details-in öz alt menyusu var (yan tərəfə açılır).
    // flip: dar ekranda (≤1359px) ikinci menyu ekrandan çıxmasın deyə sola açılır
    flip: true,
    children: [
      {
        label: "News Grid",
        href: "#",
        children: [
          { label: "No Sidebar", href: "/news-grid" },
          { label: "Left Sidebar", href: "/news-grid-left" },
          { label: "Right Sidebar", href: "/news-grid-right" },
        ],
      },
      {
        label: "News List",
        href: "#",
        children: [
          { label: "No Sidebar", href: "/news-list" },
          { label: "Left Sidebar", href: "/news-list-left" },
          { label: "Right Sidebar", href: "/news-list-right" },
        ],
      },
      { label: "News Carousel", href: "/news-carousel" },
      {
        label: "News Details",
        href: "#",
        children: [
          { label: "No Sidebar", href: "/news-details" },
          { label: "Left Sidebar", href: "/news-details-left" },
          { label: "Right Sidebar", href: "/news-details-right" },
        ],
      },
    ],
  },
  { label: "Contact", href: "/contact" },
];

const CONTACT = {
  address: "6391 Elgin St. Celina, Delaware 10299",
  email: "exam126@gmail.com",
  phone: "666 888 0000",
  hours: "Opening Hour 9:00am - 10:00pm",
};

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "Twitter", href: "https://twitter.com", Icon: FaTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: FaLinkedinIn },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
];

function Logo({ className }) {
  return (
    <Link to="/" className={className} aria-label="TravHub - Home">
      <FaSuitcaseRolling aria-hidden="true" />
      <span>TravHub</span>
    </Link>
  );
}

// rezervasiya turdan başlayır – turlar səhifəsinə aparır
function BookingButton({ className = "" }) {
  return (
    <Link to="/tours" className={`btn-booking ${className}`}>
      <span className="btn-booking-text">Start Booking</span>
    </Link>
  );
}

/* Menyu linki: "/..." ünvanları router ilə açılır (səhifə yenilənmir),
   aktiv səhifənin linki "is-active" class-ı alır (yaşıl görünür).
   "#" – yalnız alt menyu açan başlıqdır, klikləyəndə səhifə yuxarı atılmır. */
function MenuLink({ href, className, children, onClick, ...rest }) {
  if (!href.startsWith("/")) {
    return (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          if (href === "#") e.preventDefault();
          onClick?.(e);
        }}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <NavLink
      to={href}
      // "/" yalnız ana səhifədə aktivdir; "/tour-details" isə "/tour-details/:id"-də də
      end={href === "/"}
      className={({ isActive }) => `${className}${isActive ? " is-active" : ""}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </NavLink>
  );
}

// Alt menyudakı (və ya onun da alt menyusundakı) səhifələrdən biri açıqdırsa,
// üst menyu da aktiv görünür (məs. /team → PAGES, /news-grid-left → NEWS)
const isCurrent = (href, pathname) => href === pathname || pathname.startsWith(`${href}/`);

const hasActiveChild = (item, pathname) =>
  !!item.children &&
  item.children.some((sub) => isCurrent(sub.href, pathname) || hasActiveChild(sub, pathname));

/* Kompüterdə açılan menyu. Alt menyusu olan bənd (məs. News Grid) üzərinə gələndə
   yanında ikinci menyu açılır. Üzərinə gəlinən və açıq səhifənin bəndi boz fon
   və sağda kiçik yaşıl nöqtə alır (demo-dakı kimi). */
function Dropdown({ items, nested = false }) {
  return (
    <ul className={`dropdown${nested ? " dropdown--sub" : ""}`}>
      {items.map((sub) => (
        <li key={sub.label} className={`dropdown-item${sub.children ? " has-sub" : ""}`}>
          <MenuLink
            href={sub.href}
            className="dropdown-link"
            aria-haspopup={sub.children ? "true" : undefined}
          >
            {sub.label}
          </MenuLink>
          {sub.children && <Dropdown items={sub.children} nested />}
        </li>
      ))}
    </ul>
  );
}

/* Loqo + menyu + axtarış + düymələr. Header-də iki dəfə göstərilir:
   səhifədəki adi yerində və yuxarıda sabitlənən (sticky) nüsxədə. */
function MainBar({ pathname, menuOpen, onSearchOpen, onMenuOpen }) {
  const { user } = useAuth();
  const { cart } = useCart();

  return (
    <div className="header-container header-main-inner">
      <Logo className="header-logo" />

      <div className="header-bar">
        <nav className="main-nav" aria-label="Main navigation">
          <ul className="main-nav-list">
            {MENU.map((item) => (
              <li
                key={item.label}
                className={`main-nav-item${
                  item.children ? " has-dropdown" : ""
                }${item.flip ? " main-nav-item--flip" : ""}`}
              >
                <MenuLink
                  href={item.href}
                  className={`main-nav-link${hasActiveChild(item, pathname) ? " is-active" : ""}`}
                  aria-haspopup={item.children ? "true" : undefined}
                >
                  {item.label}
                </MenuLink>

                {item.children && <Dropdown items={item.children} />}
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="header-search-btn"
            onClick={onSearchOpen}
            aria-label="Open search"
          >
            <FiSearch />
          </button>

          {/* hesab: giriş yoxdursa Login, varsa hesab paneli (yaşıl nöqtə = daxil olub) */}
          <Link
            to="/login"
            className={`header-icon-btn header-account${user ? " is-logged-in" : ""}`}
            aria-label={user ? `My account (${user.name})` : "Login"}
          >
            <FiUser />
          </Link>

          <Link to="/cart" className="header-icon-btn header-cart" aria-label={`Cart, ${cart.totalItems} items`}>
            <FiShoppingBag />
            {cart.totalItems > 0 && <span className="header-cart__count">{cart.totalItems}</span>}
          </Link>

          <BookingButton className="header-booking" />

          <button
            type="button"
            className="menu-toggle"
            onClick={onMenuOpen}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </div>
  );
}

/* Mobil menyunun bəndləri (alt menyular iç-içə açılır) */
function MobileItems({ items, pathname, openSubs, onToggle, onNavigate, path = "", nested = false }) {
  return items.map((item) => {
    const key = `${path}${item.label}`;
    const isOpen = !!openSubs[key];

    return (
      <li key={item.label} className={`mobile-nav-item${isOpen ? " is-open" : ""}`}>
        <div className="mobile-nav-row">
          <MenuLink
            href={item.href}
            className={`${nested ? "mobile-sub-link" : "mobile-nav-link"}${
              hasActiveChild(item, pathname) ? " is-active" : ""
            }`}
            onClick={(e) => {
              if (item.children) {
                e.preventDefault();
                onToggle(key);
              } else {
                onNavigate();
              }
            }}
          >
            {item.label}
          </MenuLink>

          {item.children && (
            <button
              type="button"
              className="mobile-sub-toggle"
              onClick={() => onToggle(key)}
              aria-expanded={isOpen}
              aria-label={`${item.label} submenu`}
            >
              <FiChevronRight />
            </button>
          )}
        </div>

        {item.children && (
          <div className="mobile-sub">
            <ul>
              <MobileItems
                items={item.children}
                pathname={pathname}
                openSubs={openSubs}
                onToggle={onToggle}
                onNavigate={onNavigate}
                path={`${key}/`}
                nested
              />
            </ul>
          </div>
        )}
      </li>
    );
  });
}

export default function Header() {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /* mobil menyuda bir neçə alt menyu eyni anda açıq qala bilər */
  const [openSubs, setOpenSubs] = useState({});
  const searchInputRef = useRef(null);
  const stickyVisible = useScrollUpSticky(500);
  const navigate = useNavigate();
  // rol backend-dən (/api/auth/me) gəlir; link yalnız göstərişdir, qoruma backend-dədir
  const { isAdmin } = useAuth();

  // axtarış pəncərəsi: nəticələr Tour Sidebar səhifəsində (ad və məkana görə)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchInputRef.current.value.trim().replace(/\s+/g, " ");
    setSearchOpen(false);
    e.currentTarget.reset();
    navigate(query ? `/tours-sidebar?search=${encodeURIComponent(query)}` : "/tours-sidebar");
  };

  const mainBarProps = {
    pathname,
    menuOpen,
    onSearchOpen: () => setSearchOpen(true),
    onMenuOpen: () => setMenuOpen(true),
  };

  const closeAll = () => {
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const toggleSub = (label) => {
    setOpenSubs((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    if (!searchOpen && !menuOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, menuOpen]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1200px)");
    const onChange = (e) => e.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="header">
      {/* ===== TOP BAR ===== */}
      <div className="header-top">
        <div className="header-container header-top-inner">
          <ul className="header-top-info">
            <li className="header-top-address">
              <FiMapPin aria-hidden="true" />
              <span>{CONTACT.address}</span>
            </li>
            <li>
              <FiMail aria-hidden="true" />
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
          </ul>

          <div className="header-top-right">
            <div className="header-top-hours">
              <FiClock aria-hidden="true" />
              <span>{CONTACT.hours}</span>
            </div>

            {isAdmin && (
              <Link to="/admin" className="header-top-admin">
                <FiShield aria-hidden="true" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN BAR ===== */}
      <div className="header-main">
        <MainBar {...mainBarProps} />
      </div>

      {/* ===== STICKY BAR =====
          Səhifə 500px-dən aşağıdadırsa və yuxarı scroll edilirsə, yuxarıdan sürüşüb gəlir,
          aşağı scroll edəndə gizlənir (demo-dakı kimi). Gizli ikən inert – klaviatura ilə
          ora keçmək olmur. */}
      <div className={`header-sticky${stickyVisible ? " is-visible" : ""}`} inert={!stickyVisible}>
        <MainBar {...mainBarProps} />
      </div>

      {/* ===== SEARCH POPUP ===== */}
      <div
        className={`search-popup${searchOpen ? " is-open" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
        aria-hidden={!searchOpen}
      >
        <button
          type="button"
          className="search-popup-close"
          onClick={() => setSearchOpen(false)}
          aria-label="Close search"
        >
          <FiX />
        </button>

        <form
          className="search-popup-form"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <input
            ref={searchInputRef}
            className="search-popup-input"
            type="search"
            name="search"
            placeholder="What are you looking for?"
            aria-label="Search"
          />
          <button type="submit" className="search-popup-submit" aria-label="Search">
            <FiSearch />
          </button>
        </form>
      </div>

      {/* ===== MOBILE MENU (≤1199px, soldan açılır) ===== */}
      <div
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />

        <aside
          className="mobile-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="mobile-menu-head">
            <Logo className="mobile-menu-logo" />
            <button
              type="button"
              className="mobile-menu-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <FiX />
            </button>
          </div>

          <ul className="mobile-nav">
            <MobileItems
              items={MENU}
              pathname={pathname}
              openSubs={openSubs}
              onToggle={toggleSub}
              onNavigate={() => setMenuOpen(false)}
            />
          </ul>

          <ul className="mobile-contact">
            <li>
              <span className="mobile-contact-icon">
                <FaEnvelope aria-hidden="true" />
              </span>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <span className="mobile-contact-icon">
                <FaPhoneAlt aria-hidden="true" />
              </span>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
                {CONTACT.phone}
              </a>
            </li>
          </ul>

          <ul className="mobile-social">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </header>
  );
}