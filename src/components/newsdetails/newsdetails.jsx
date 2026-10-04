import { Link } from "react-router-dom";
import {
  FaQuoteLeft,
  FaCircleCheck,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa6";
import { DateBadge, PostMeta } from "../newslist/newslist";
import { SidebarTags } from "../sidebarwidgets/sidebarwidgets";
import NewsLayout from "../newssidebar/newssidebar";
import "../travhubbtn/travhubbtn.css";
import "./newsdetails.css";

import mainImage from "../../assets/image/blog-list-2.jpg";
import comment1 from "../../assets/image/blog-comment-1-1.jpg";
import comment2 from "../../assets/image/blog-comment-1-2.jpg";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "Twitter", href: "https://twitter.com", Icon: FaTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: FaLinkedinIn },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
];

const COMMENT_TEXT =
  "Lorem ipsum dolor sit amet consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus etmagnis disparturient montesnascetur ridiculus mus. Donec quam felis ultricies nec pellentesque";

const comments = [
  { name: "Leslie Alexander", time: "10 Hours ago", image: comment1 },
  { name: "Savannah Nguyen", time: "01 Day ago", image: comment2 },
];

/* ---------- Şərh yazma forması (yalnız frontend) ---------- */
function CommentForm() {
  return (
    <div className="comment-form">
      <h3 className="comment-form__title">Leave a Comment</h3>

      <form className="comment-form__grid" onSubmit={(e) => e.preventDefault()}>
        <div className="comment-form__control">
          <label htmlFor="cf-name">Full Name</label>
          <input id="cf-name" type="text" placeholder="Enter name" autoComplete="name" />
        </div>
        <div className="comment-form__control">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" type="email" placeholder="Enter email" autoComplete="email" />
        </div>
        <div className="comment-form__control comment-form__control--full">
          <label htmlFor="cf-message">Message</label>
          <textarea id="cf-message" placeholder="Write Message" />
        </div>
        <div className="comment-form__control comment-form__control--full">
          <label className="comment-form__check">
            <input type="checkbox" name="save" />
            <span className="comment-form__box" aria-hidden="true" />
            Save my name, email, and website in this browser for the next time I comment.
          </label>
        </div>
        <div className="comment-form__control comment-form__control--full">
          <button type="submit" className="travhub-btn comment-form__submit">
            <span>Post Comment</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Bölmə ---------- */
/*
  News Details. sidebar yoxdursa ("/news-details") ortada 770px-lik sütun,
  sidebar="left" | "right" ("/news-details-left", "/news-details-right") – yanında sidebar.
*/
export default function NewsDetails({ sidebar }) {
  return (
    <section className="news-details">
      <div className={`news-details__container${sidebar ? " news-details__container--wide" : ""}`}>
        <NewsLayout sidebar={sidebar}>
          <div className="news-details__thumb">
            <img src={mainImage} alt="Katie Stewart Your charity may be net zero" />
            <DateBadge />
          </div>

          <PostMeta />
          <h3 className="news-details__title">Katie Stewart Your charity may be net zero</h3>

          <div className="news-details__content">
            <p>
              You’ve switched your charity’s office to renewable energy. You’ve cut most flights. The office
              fridge is stacked high with oat milk, and lycra-clad staff are proudly showing off their
              subsidised bicycles. On your way to net-zero, right? But operational emissions are just one part
              of the net-zero picture: your money, too, has a carbon cost attached.
            </p>
            <p>
              Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse
              nisl elit, rhoncus eget elementum acondimentum eget, diam. Nam at tortor in tellus interdum
              sagitliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur
              blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. mavailable market
              standard dummy text available market industry Lorem Ipsum simply dummy text of free available
              market. There are many variations of passages of Lorem Ipsum available, but the majority have
              suffered alteration
            </p>

            <blockquote className="news-details__quote">
              <FaQuoteLeft className="news-details__quote-icon" aria-hidden="true" />
              Feeling adventurous? Explore the beauty of Shapla Beels.
            </blockquote>

            <p>
              Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis
              parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu,
              pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec,
              vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam
              dictum felis eu pede mollis pretium. Integer tincidunt.
            </p>

            <h4 className="news-details__subtitle">
              There&apos;s something undeniably captivating about coral islands
            </h4>
            <p>
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean
              massa. Cum sociis natoque penatibus etmagnis disparturient montesnascetur ridiculus mus. Donec quam
              felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
              pede justo, fringilla vel aliquet nec, vulputate eget, arcu. In enim justo rhoncus utimperdiet a
              venenatis vitae justo.
            </p>

            <ul className="news-details__list">
              {["Koh Larn, Thailand", "World Neutral Park", "5000,00 Kilometer", "Wild Animals"].map((item) => (
                <li key={item}>
                  <FaCircleCheck aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <p>
              Pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla
              vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae,
              justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt pretium quis, sem. Nulla
              consequat massa quis enim. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque
              penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec,
            </p>
          </div>

          {/* etiketlər + sosial şəbəkələr */}
          <div className="news-details__post-meta">
            <div className="news-details__tags">
              <h4 className="news-details__tags-title">Tags</h4>
              <SidebarTags tags={["Travel", "Destination", "Tour Guide"]} to="/news-list" />
            </div>
            <div className="news-details__social">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* şərhlər */}
          <div className="comments">
            <h3 className="comments__title">Comments 02</h3>
            <ul className="comments__list">
              {comments.map((comment) => (
                <li key={comment.name} className="comments__card">
                  <img className="comments__image" src={comment.image} alt={comment.name} />
                  <div className="comments__content">
                    <h3 className="comments__name">{comment.name}</h3>
                    <span className="comments__time">{comment.time}</span>
                    <p className="comments__text">{COMMENT_TEXT}</p>
                    <Link to="/news-details" className="travhub-btn comments__reply">
                      <span>Reply</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <CommentForm />
        </NewsLayout>
      </div>
    </section>
  );
}
