import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SectionTitle from "../sectiontitle/sectiontitle";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useInView } from "../../hooks/useInView";
import { authApi, oauthUrl } from "../../services/api";
import "../travhubbtn/travhubbtn.css";
import "./loginsection.css";

import loginBg from "../../assets/image/login-bg.jpg";
import loginMan from "../../assets/image/login-man.png";
import cloudBig from "../../assets/image/cloud-3-1.png";
import cloudSmall from "../../assets/image/login-cloud.png";
import googleIcon from "../../assets/image/google.png";
import shapeOne from "../../assets/image/login-shape-1.png";
import shapeTwo from "../../assets/image/login-shape-2.png";

/* ---------- Giriş / qeydiyyat forması (backend: /api/auth/login, /api/auth/register) ---------- */
function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ name: "", email: "", password: "", remember: true });
  // Google / Facebook-dan xəta ilə qayıdıbsa (məs. "not configured") burada göstərilir
  const [status, setStatus] = useState({ pending: false, error: location.state?.oauthError ?? "" });
  const [providers, setProviders] = useState(null);

  // hansı sosial girişlərin serverdə qurulduğunu öyrən
  useEffect(() => {
    let cancelled = false;
    authApi
      .providers()
      .then((data) => !cancelled && setProviders(data.providers))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // sosial giriş: brauzer backend-ə keçir → Google/Facebook → backend → /oauth/callback
  const handleSocial = (provider, label) => {
    if (providers && !providers[provider]) {
      setStatus({
        pending: false,
        error: `${label} login is not configured on the server yet (missing ${label} credentials in backend/.env).`,
      });
      return;
    }
    window.location.assign(oauthUrl(provider, location.state?.from));
  };

  const setField = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ pending: true, error: "" });

    try {
      if (isRegister) {
        await register(values.name.trim(), values.email.trim(), values.password);
      } else {
        await login(values.email.trim(), values.password, values.remember);
      }
      // girişdən əvvəl açmaq istədiyi səhifəyə (məs. Cart) qayıt
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (error) {
      setStatus({ pending: false, error: error.message });
    }
  };

  return (
    <>
      <SectionTitle subtitle="Welcome" title={isRegister ? "Create Account" : "Login Account"} />

      <div className="login-form__socials">
        <button type="button" className="login-form__social" onClick={() => handleSocial("google", "Google")}>
          <img src={googleIcon} alt="" />
          Sign Up with Google
        </button>
      </div>

      <div className="login-form__divider">
        <span>Or Sign Up with email</span>
      </div>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div className="login-form__field">
            <label htmlFor="login-name">Full Name</label>
            <input
              id="login-name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              value={values.name}
              onChange={setField}
              required
            />
          </div>
        )}

        <div className="login-form__field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Enter email"
            autoComplete={isRegister ? "email" : "username"}
            value={values.email}
            onChange={setField}
            required
          />
        </div>

        <div className="login-form__field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder={isRegister ? "At least 8 characters" : "Enter password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            value={values.password}
            onChange={setField}
            required
          />
        </div>

        {!isRegister && (
          <div className="login-form__check">
            <label className="login-form__remember">
              <input type="checkbox" name="remember" checked={values.remember} onChange={setField} />
              <span className="login-form__box" aria-hidden="true" />
              Remember Me?
            </label>

            <Link to="/forgot-password" className="login-form__link">
              Forgot your Password?
            </Link>
          </div>
        )}

        {/* məs. şifrə sıfırlandıqdan sonra: "Your password has been updated..." */}
        {location.state?.notice && !status.error && (
          <p className="login-form__notice" role="status">
            {location.state.notice}
          </p>
        )}

        {status.error && (
          <p className="login-form__error" role="alert">
            {status.error}
          </p>
        )}

        <button
          type="submit"
          className={`travhub-btn login-form__submit${isRegister ? " login-form__submit--register" : ""}`}
          disabled={status.pending}
        >
          <span>{status.pending ? "Please wait..." : isRegister ? "Create Account" : "Login In Account"}</span>
        </button>

        <p className="login-form__register">
          {isRegister ? "Already have an account? " : "Don’t have an account? "}
          <Link
            to={isRegister ? "/login" : "/register"}
            state={location.state}
            className="login-form__link login-form__link--accent"
          >
            {isRegister ? "Login now" : "Sign up now"}
          </Link>
        </p>
      </form>
    </>
  );
}

/* ---------- "Forgot Password": email-ə sıfırlama linki ---------- */
function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ pending: false, error: "", sent: "" });
  const [emailConfigured, setEmailConfigured] = useState(null);

  // SMTP qurulmayıbsa məktub getmir – istifadəçiyə dürüst deyirik
  useEffect(() => {
    let cancelled = false;
    authApi
      .providers()
      .then((data) => !cancelled && setEmailConfigured(data.emailConfigured))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ pending: true, error: "", sent: "" });
    try {
      const data = await authApi.forgotPassword(email.trim());
      setStatus({ pending: false, error: "", sent: data.message });
    } catch (error) {
      setStatus({ pending: false, error: error.message, sent: "" });
    }
  };

  return (
    <>
      <SectionTitle subtitle="Account Help" title="Forgot Password" />
      <p className="login-form__intro">
        Enter the email you registered with and we will send you a link to choose a new password.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="login-form__field">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="Enter email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {emailConfigured === false && (
          <p className="login-form__hint">
            Email sending is not configured on this server yet. In development the reset link is printed in
            the backend terminal.
          </p>
        )}

        {status.sent && (
          <p className="login-form__notice" role="status">
            {status.sent}
          </p>
        )}
        {status.error && (
          <p className="login-form__error" role="alert">
            {status.error}
          </p>
        )}

        <button type="submit" className="travhub-btn login-form__submit login-form__submit--register" disabled={status.pending}>
          <span>{status.pending ? "Please wait..." : "Send Reset Link"}</span>
        </button>

        <p className="login-form__register">
          Remembered it?{" "}
          <Link to="/login" className="login-form__link login-form__link--accent">
            Back to Login
          </Link>
        </p>
      </form>
    </>
  );
}

/* ---------- Email-dəki link: yeni şifrə ---------- */
function ResetPasswordForm({ token }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [status, setStatus] = useState({ pending: false, error: "" });

  const setField = (e) => setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.password !== values.confirm) {
      setStatus({ pending: false, error: "Passwords do not match." });
      return;
    }

    setStatus({ pending: true, error: "" });
    try {
      const data = await authApi.resetPassword(token, values.password);
      // köhnə sessiyalar backend-də etibarsız oldu – bu brauzerdəki də bağlanır
      logout();
      navigate("/login", { replace: true, state: { notice: data.message } });
    } catch (error) {
      setStatus({ pending: false, error: error.message });
    }
  };

  const linkExpired = /invalid or has expired/.test(status.error);

  return (
    <>
      <SectionTitle subtitle="Account Help" title="Reset Password" />
      <p className="login-form__intro">Choose a new password for your TravHub account.</p>

      <form onSubmit={handleSubmit}>
        <div className="login-form__field">
          <label htmlFor="reset-password">New Password</label>
          <input
            id="reset-password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            value={values.password}
            onChange={setField}
            required
          />
        </div>

        <div className="login-form__field">
          <label htmlFor="reset-confirm">Confirm Password</label>
          <input
            id="reset-confirm"
            name="confirm"
            type="password"
            placeholder="Repeat the new password"
            autoComplete="new-password"
            minLength={8}
            value={values.confirm}
            onChange={setField}
            required
          />
        </div>

        {status.error && (
          <p className="login-form__error" role="alert">
            {status.error}{" "}
            {linkExpired && (
              <Link to="/forgot-password" className="login-form__link login-form__link--accent">
                Request a new link
              </Link>
            )}
          </p>
        )}

        <button type="submit" className="travhub-btn login-form__submit login-form__submit--register" disabled={status.pending}>
          <span>{status.pending ? "Please wait..." : "Update Password"}</span>
        </button>

        <p className="login-form__register">
          <Link to="/login" className="login-form__link login-form__link--accent">
            Back to Login
          </Link>
        </p>
      </form>
    </>
  );
}

/* ---------- Daxil olmuş istifadəçi üçün: hesab paneli ---------- */
function AccountPanel() {
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();

  return (
    <div className="login-account">
      <SectionTitle subtitle="My Account" title={`Hello, ${user.name}`} />

      <p className="login-account__email">
        {user.email}
        {isAdmin && <span className="login-account__badge">Admin</span>}
      </p>

      {/* hesab növü backend-in qaytardığı role-dan gəlir */}
      <p className="login-account__role">
        Account type: <strong>{isAdmin ? "Administrator" : "User"}</strong>
      </p>

      <ul className="login-account__links">
        {isAdmin && (
          <li>
            <Link to="/admin" className="login-account__admin">
              Admin Panel
            </Link>
          </li>
        )}
        <li>
          <Link to="/my-orders">My Orders</Link>
        </li>
        <li>
          <Link to="/wishlist">Wishlist ({user.savedProducts?.length ?? 0})</Link>
        </li>
        <li>
          <Link to="/cart">Cart ({cart.totalItems})</Link>
        </li>
      </ul>

      <button type="button" className="travhub-btn login-form__submit" onClick={logout}>
        <span>Logout</span>
      </button>
    </div>
  );
}

/*
  Login bölməsi (demo-dakı login.html):
  solda fırça kənarlı şəkil + turist + buludlar (aşağıdan qalxır),
  sağda giriş / qeydiyyat formu (sağdan gəlir). Daxil olmuş istifadəçi hesab panelini görür.
  mode: "login" | "register" | "forgot" | "reset" (reset → resetToken email-dəki linkdən)
*/
export default function LoginSection({ mode = "login", resetToken }) {
  const { user, loading } = useAuth();
  const [mediaRef, mediaInView] = useInView(0.2);
  const [formRef, formInView] = useInView(0.2);

  let content;
  if (mode === "forgot") content = <ForgotPasswordForm />;
  else if (mode === "reset") content = <ResetPasswordForm key={resetToken} token={resetToken} />;
  else content = user ? <AccountPanel /> : <AuthForm key={mode} mode={mode} />;

  const showSessionCheck = loading && !user && (mode === "login" || mode === "register");

  return (
    <section className="login-section">
      {/* böyük ekranda künclərdə yuxarı-aşağı yırğalanan fiqurlar */}
      <div
        className="login-section__shape login-section__shape--one"
        style={{ backgroundImage: `url(${shapeOne})` }}
        aria-hidden="true"
      />
      <div
        className="login-section__shape login-section__shape--two"
        style={{ backgroundImage: `url(${shapeTwo})` }}
        aria-hidden="true"
      />

      <div className="login-section__container">
        <div className="login-section__row">
          <div ref={mediaRef} className={`login-section__media-col${mediaInView ? " is-inview" : ""}`}>
            <div className="login-media">
              <div className="login-media__main">
                <img src={loginBg} alt="Təbiətdə səyahət mənzərəsi" />
              </div>
              <img className="login-media__man" src={loginMan} alt="" aria-hidden="true" />
              <img className="login-media__cloud" src={cloudBig} alt="" aria-hidden="true" />
              <img className="login-media__cloud-two" src={cloudSmall} alt="" aria-hidden="true" />
            </div>
          </div>

          <div ref={formRef} className={`login-section__form-col${formInView ? " is-inview" : ""}`}>
            <div className="login-form">
              {content}
              {showSessionCheck && <p className="login-form__register">Checking your session...</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
