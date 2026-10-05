import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import StatusMessage from "../statusmessage/statusmessage";
import { useAuth } from "../../context/AuthContext";
import { useRequest } from "../../hooks/useRequest";
import { commentApi } from "../../services/api";
import "../travhubbtn/travhubbtn.css";
import "./newsdetails.css";

import mainImage from "../../assets/image/blog-list-2.jpg";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: FaFacebookF },
  { label: "Twitter", href: "https://twitter.com", Icon: FaTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: FaLinkedinIn },
  { label: "Instagram", href: "https://instagram.com", Icon: FaInstagram },
];

// bütün "/news-details" variantları eyni yazını göstərir – şərhlər bu ada bağlıdır
const POST_ID = "katie-stewart-net-zero";
const MAX_LENGTH = 1000;

// "Just now", "5 minutes ago", "2 days ago", bir həftədən köhnə – tarix
function timeAgo(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  const plural = (count, unit) => `${count} ${unit}${count === 1 ? "" : "s"} ago`;
  if (minutes < 1) return "Just now";
  if (minutes < 60) return plural(minutes, "minute");
  if (minutes < 24 * 60) return plural(Math.floor(minutes / 60), "hour");
  if (minutes < 7 * 24 * 60) return plural(Math.floor(minutes / (24 * 60)), "day");
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// şəkil yoxdur – adın baş hərfləri yaşıl dairədə
function Avatar({ name }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return (
    <span className="comments__image comments__avatar" aria-hidden="true">
      {initials || "?"}
    </span>
  );
}

/* ---------- Şərhə cavab forması (şərhin altında açılır) ---------- */
function ReplyForm({ comment, threadId, mention, onPosted, onCancel }) {
  const [text, setText] = useState(mention ? `@${mention} ` : "");
  const [status, setStatus] = useState({ pending: false, error: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ pending: true, error: "" });
    try {
      await commentApi.create(POST_ID, text, threadId);
      onPosted();
    } catch (error) {
      setStatus({ pending: false, error: error.message });
    }
  };

  return (
    <form className="comments__reply-form" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Reply to ${comment.name}`}
        aria-label={`Reply to ${comment.name}`}
        maxLength={MAX_LENGTH}
        required
        autoFocus
      />
      {status.error && (
        <p className="comment-form__error" role="alert">
          {status.error}
        </p>
      )}
      <div className="comments__reply-actions">
        <button type="submit" className="travhub-btn comment-form__submit" disabled={status.pending}>
          <span>{status.pending ? "Posting..." : "Post Reply"}</span>
        </button>
        <button type="button" className="comments__link-btn" onClick={onCancel} disabled={status.pending}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------- Bir şərh (cavabları ilə birlikdə) ---------- */
function CommentItem({ comment, threadId, replyingTo, onReply, onCancelReply, onChanged }) {
  const { user, isAdmin } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const canDelete = !!user && (isAdmin || comment.user === user._id);

  const handleDelete = async () => {
    const message = comment.replies?.length
      ? "Delete this comment and its replies?"
      : "Delete this comment?";
    if (!window.confirm(message)) return;

    setDeleting(true);
    setDeleteError("");
    try {
      await commentApi.remove(comment._id);
      onChanged();
    } catch (error) {
      setDeleteError(error.message);
      setDeleting(false);
    }
  };

  return (
    <li className="comments__card">
      <Avatar name={comment.name} />
      <div className="comments__content">
        <h3 className="comments__name">{comment.name}</h3>
        <time className="comments__time" dateTime={comment.createdAt}>
          {timeAgo(comment.createdAt)}
        </time>
        <p className="comments__text">{comment.text}</p>

        <button type="button" className="travhub-btn comments__reply" onClick={() => onReply(comment)}>
          <span>Reply</span>
        </button>
        {canDelete && (
          <button type="button" className="comments__link-btn comments__delete" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
        {deleteError && (
          <p className="comment-form__error" role="alert">
            {deleteError}
          </p>
        )}

        {replyingTo?.commentId === comment._id && (
          <ReplyForm
            comment={comment}
            threadId={threadId}
            mention={comment._id === threadId ? "" : comment.name}
            onPosted={onChanged}
            onCancel={onCancelReply}
          />
        )}

        {comment.replies?.length > 0 && (
          <ul className="comments__replies">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                threadId={threadId}
                replyingTo={replyingTo}
                onReply={onReply}
                onCancelReply={onCancelReply}
                onChanged={onChanged}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

/* ---------- Şərh yazma forması ---------- */
function CommentForm({ onPosted }) {
  const { user } = useAuth();
  const location = useLocation();
  const [text, setText] = useState("");
  const [status, setStatus] = useState({ pending: false, error: "", success: "" });

  if (!user) {
    return (
      <div className="comment-form">
        <h3 className="comment-form__title">Leave a Comment</h3>
        <p className="comment-form__login">Please log in to leave a comment or reply to one.</p>
        <Link to="/login" state={{ from: location.pathname }} className="travhub-btn comment-form__submit">
          <span>Log In</span>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ pending: true, error: "", success: "" });
    try {
      await commentApi.create(POST_ID, text);
      setText("");
      setStatus({ pending: false, error: "", success: "Your comment has been posted." });
      onPosted();
    } catch (error) {
      setStatus({ pending: false, error: error.message, success: "" });
    }
  };

  return (
    <div className="comment-form">
      <h3 className="comment-form__title">Leave a Comment</h3>

      <form className="comment-form__grid" onSubmit={handleSubmit}>
        <div className="comment-form__control">
          <label htmlFor="cf-name">Full Name</label>
          <input id="cf-name" type="text" value={user.name} readOnly />
        </div>
        <div className="comment-form__control">
          <label htmlFor="cf-email">Email</label>
          <input id="cf-email" type="email" value={user.email} readOnly />
        </div>
        <div className="comment-form__control comment-form__control--full">
          <label htmlFor="cf-message">Message</label>
          <textarea
            id="cf-message"
            placeholder="Write Message"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setStatus((prev) => ({ ...prev, success: "" }));
            }}
            maxLength={MAX_LENGTH}
            required
          />
        </div>
        {(status.error || status.success) && (
          <div className="comment-form__control comment-form__control--full">
            {status.error ? (
              <p className="comment-form__error" role="alert">
                {status.error}
              </p>
            ) : (
              <p className="comment-form__notice" role="status">
                {status.success}
              </p>
            )}
          </div>
        )}
        <div className="comment-form__control comment-form__control--full">
          <button type="submit" className="travhub-btn comment-form__submit" disabled={status.pending}>
            <span>{status.pending ? "Posting..." : "Post Comment"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Şərhlər bölməsi: siyahı + cavablar + forma ---------- */
function Comments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, error, loading, retry } = useRequest((signal) => commentApi.list(POST_ID, signal), POST_ID);
  const [replyingTo, setReplyingTo] = useState(null);

  const comments = data?.comments ?? [];
  const count = data?.count ?? 0;

  // cavab üçün giriş lazımdır; cavaba cavab eyni mövzunun altına yazılır (threadId)
  const handleReply = (comment) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setReplyingTo({ commentId: comment._id });
  };

  const handleChanged = () => {
    setReplyingTo(null);
    retry();
  };

  let list;
  if (!data && loading) {
    list = <StatusMessage type="loading" text="Loading comments..." compact />;
  } else if (!data && error) {
    list = <StatusMessage type="error" text={error.message} onRetry={retry} compact />;
  } else if (!comments.length) {
    list = <p className="comments__empty">No comments yet. Be the first to share your thoughts!</p>;
  } else {
    list = (
      <ul className="comments__list">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            threadId={comment._id}
            replyingTo={replyingTo}
            onReply={handleReply}
            onCancelReply={() => setReplyingTo(null)}
            onChanged={handleChanged}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="comments" id="comments">
        <h3 className="comments__title">Comments {String(count).padStart(2, "0")}</h3>
        {list}
      </div>

      <CommentForm onPosted={retry} />
    </>
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

          {/* şərhlər (backend: /api/comments) */}
          <Comments />
        </NewsLayout>
      </div>
    </section>
  );
}
