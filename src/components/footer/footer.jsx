import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { useInView } from "../../hooks/useInView";
import { newsletterApi } from "../../services/api";
import "./footer.css";

import logo from "../../assets/image/logo1.png";
import titleShape from "../../assets/image/sec-title-shape.png";
import gallery1 from "../../assets/image/footer-gallery-1.jpg";
import gallery2 from "../../assets/image/footer-gallery-2.jpg";
import gallery3 from "../../assets/image/footer-gallery-3.jpg";
import gallery4 from "../../assets/image/footer-gallery-4.jpg";
import gallery5 from "../../assets/image/footer-gallery-5.jpg";
import gallery6 from "../../assets/image/footer-gallery-6.jpg";

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "Twitter", href: "https://twitter.com", Icon: FaTwitter },
  { label: "Linkedin", href: "https://linkedin.com", Icon: FaLinkedinIn },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
];

const usefulLinks = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Destination", href: "/destination" },
  { label: "Blog", href: "/news-grid" },
  { label: "Contact Us", href: "/contact" },
];

const legalLinks = [
  { label: "Terms of use", href: "#" },
  { label: "Terms & conditions", href: "#" },
  { label: "Privacy policy", href: "#" },
  { label: "Cookie policy", href: "#" },
];

const gallery = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

/* Link: hover-də yaşıllaşır, altından xətt soldan sağa uzanır */
function LinkList({ title, links, className }) {
  return (
    <div className={`footer-widget ${className}`}>
      <h2 className="footer-widget__title">{title}</h2>
      <ul className="footer-widget__links">
        {links.map((link) => (
          <li key={link.label}>
            {/* "/..." ünvanları router ilə açılır, qalanları adi link */}
            {link.href.startsWith("/") ? (
              <Link to={link.href}>{link.label}</Link>
            ) : (
              <a href={link.href}>{link.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [footerRef, inView] = useInView(0.1);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ pending: false, error: "", success: "" });

  // email backend-də saxlanılır (POST /api/newsletter), Admin Panel → Subscribers-də görünür
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus({ pending: true, error: "", success: "" });
    try {
      const data = await newsletterApi.subscribe(email);
      setStatus({ pending: false, error: "", success: data.message });
      setEmail("");
    } catch (error) {
      setStatus({ pending: false, error: error.message, success: "" });
    }
  };

  return (
    <footer ref={footerRef} className={`footer${inView ? " is-inview" : ""}`}>
      <div className="footer-container">
        {/* ---------- Newsletter ---------- */}
        <div className="footer-top footer-reveal" style={{ animationDelay: "100ms" }}>
          <span className="footer-top__dot" aria-hidden="true" />

          <h3 className="footer-top__title">
            Get Updated The Latest
            <br />
            Newsletter
            <img src={titleShape} alt="" aria-hidden="true" />
          </h3>

          <form className="footer-newsletter" onSubmit={handleSubmit}>
            <label htmlFor="footer-email" className="footer-sr">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus((prev) => ({ ...prev, error: "", success: "" }));
              }}
              maxLength={100}
              required
            />
            <button type="submit" className="footer-btn" disabled={status.pending}>
              <span>{status.pending ? "Sending..." : "Send Message"}</span>
            </button>

            {status.success && (
              <p className="footer-newsletter__response" role="status">
                {status.success}
              </p>
            )}
            {status.error && (
              <p className="footer-newsletter__response footer-newsletter__response--error" role="alert">
                {status.error}
              </p>
            )}
          </form>
        </div>

        {/* ---------- Sütunlar ---------- */}
        <div className="footer-row">
          <div className="footer-widget footer-widget--about footer-reveal" style={{ animationDelay: "0ms" }}>
            <Link to="/" className="footer-widget__logo">
              <img src={logo} alt="TravHub" />
            </Link>
            <p className="footer-widget__text">
              Content of a page when looking at layout the
              <br />
              point of using lorem the is Ipsum less when
              <br />
              looking normal
            </p>
            <div className="footer-social">
              {socials.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-reveal" style={{ animationDelay: "100ms" }}>
            <LinkList title="Useful Links" links={usefulLinks} className="footer-widget--links" />
          </div>

          <div className="footer-reveal" style={{ animationDelay: "200ms" }}>
            <LinkList title="Legal" links={legalLinks} className="footer-widget--legal" />
          </div>

          <div className="footer-widget footer-widget--gallery footer-reveal" style={{ animationDelay: "300ms" }}>
            <h2 className="footer-widget__title">Our Gallery</h2>
            <div className="footer-gallery">
              {gallery.map((src, i) => (
                <a key={src} href={src} target="_blank" rel="noreferrer" aria-label={`Qalereya şəkli ${i + 1}`}>
                  <img src={src} alt="" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Copyright ---------- */}
      <div className="footer-bottom footer-reveal">
        <div className="footer-container">
          <p className="footer-bottom__copyright">
            © Copyright {new Date().getFullYear()} by Travhub HTML Template.
          </p>
        </div>
      </div>
    </footer>
  );
}
