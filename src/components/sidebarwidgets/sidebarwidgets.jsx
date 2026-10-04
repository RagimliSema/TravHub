import { Link } from "react-router-dom";
import {
  FaMagnifyingGlass,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaArrowRight,
  FaClock,
  FaUser,
} from "react-icons/fa6";
import "./sidebarwidgets.css";

/*
  Sidebar qutuları (Tour Sidebar, Destination Details ...):
  boz fonlu çərçivəli qutu, başlığın solunda yaşıl zolaq.
*/
export function SidebarBox({ title, children }) {
  return (
    <div className="sidebar-box">
      {title && <h2 className="sidebar-box__title">{title}</h2>}
      {children}
    </div>
  );
}

// axtarış sahəsi + sağda yaşıl düymə (yalnız frontend)
export function SidebarSearch({ placeholder = "Search key word" }) {
  return (
    <form className="sidebar-search" role="search" onSubmit={(e) => e.preventDefault()}>
      <input type="text" placeholder={placeholder} aria-label={placeholder} />
      <button type="submit" aria-label="Axtar">
        <FaMagnifyingGlass />
      </button>
    </form>
  );
}

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "Twitter", href: "https://twitter.com", Icon: FaTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: FaLinkedinIn },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
];

// müəllif: şəkil, ad, vəzifə, qısa mətn və sosial şəbəkələr
export function SidebarAuthor({ image, name, role, text }) {
  return (
    <div className="sidebar-author">
      <div className="sidebar-author__top">
        <img src={image} alt={name} />
        <div>
          <h3 className="sidebar-author__name">{name}</h3>
          <span className="sidebar-author__role">{role}</span>
        </div>
      </div>
      <p className="sidebar-author__text">{text}</p>
      <div className="sidebar-author__social">
        {SOCIALS.map(({ label, href, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
            <Icon />
          </a>
        ))}
      </div>
    </div>
  );
}

// kateqoriyalar: hover-də yaşıl fon soldan sağa dolur
export function SidebarCategories({ items }) {
  return (
    <ul className="sidebar-categories">
      {items.map((item) => (
        <li key={item.label}>
          <Link to={item.to}>
            <FaArrowRight className="sidebar-categories__icon" aria-hidden="true" />
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

// son yazılar: kiçik şəkil, başlıq, tarix və müəllif
export function SidebarPosts({ posts }) {
  return (
    <ul className="sidebar-posts">
      {posts.map((post) => (
        <li key={post.id} className="sidebar-posts__item">
          <img className="sidebar-posts__image" src={post.image} alt="" />
          <div>
            <h3 className="sidebar-posts__title">
              <Link to={post.to}>{post.title}</Link>
            </h3>
            <ul className="sidebar-posts__meta">
              <li>
                <FaClock aria-hidden="true" />
                {post.date}
              </li>
              <li>
                <FaUser aria-hidden="true" />
                {post.author}
              </li>
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}

// etiketlər: hover-də yaşıllaşır
export function SidebarTags({ tags, to }) {
  return (
    <div className="sidebar-tags">
      {tags.map((tag) => (
        <Link key={tag} to={to}>
          {tag}
        </Link>
      ))}
    </div>
  );
}
