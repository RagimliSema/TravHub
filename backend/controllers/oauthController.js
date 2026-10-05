import crypto from "node:crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { clientUrl } from "../utils/helpers.js";
import { isEmailConfigured } from "../utils/sendEmail.js";

/*
  Google və Facebook ilə giriş (OAuth 2.0 "authorization code" axını).

  1) GET /api/auth/google          → istifadəçi Google-un giriş səhifəsinə yönləndirilir
  2) GET /api/auth/google/callback → Google "code" qaytarır, backend onu gizli açarla
                                     tokenə dəyişib istifadəçinin email/adını alır
  3) İstifadəçi tapılır və ya yaradılır, BİZİM JWT-miz yaradılır və frontend-ə
     /oauth/callback#token=... ünvanı ilə qaytarılır (# hissəsi serverə göndərilmir).

  Açarlar (client id / secret) yalnız .env-dədir. Təyin olunmayıbsa düymə
  "not configured" xətası qaytarır – saxta giriş edilmir.
*/

const STATE_COOKIE = "travhub_oauth";
const STATE_MAX_AGE = 10 * 60 * 1000; // 10 dəqiqə
const FB_VERSION = () => process.env.FACEBOOK_GRAPH_VERSION || "v23.0";

// açarı kopyalayanda təsadüfən qalan boşluqlar Google/Facebook-da "invalid client" xətası verir
const env = (name) => (process.env[name] ?? "").trim();

const PROVIDERS = {
  google: {
    label: "Google",
    clientId: () => env("GOOGLE_CLIENT_ID"),
    clientSecret: () => env("GOOGLE_CLIENT_SECRET"),
    authUrl: () => "https://accounts.google.com/o/oauth2/v2/auth",
    authParams: { scope: "openid email profile", prompt: "select_account" },

    async getProfile(code, redirectUri) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: this.clientId(),
          client_secret: this.clientSecret(),
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      const tokens = await tokenRes.json();
      if (!tokenRes.ok || !tokens.access_token) throw new Error("Google token exchange failed");

      const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const info = await infoRes.json();
      if (!infoRes.ok || !info.sub) throw new Error("Could not read the Google profile");

      return { id: info.sub, email: info.email, emailVerified: info.email_verified === true, name: info.name };
    },
  },

  facebook: {
    label: "Facebook",
    clientId: () => env("FACEBOOK_APP_ID"),
    clientSecret: () => env("FACEBOOK_APP_SECRET"),
    authUrl: () => `https://www.facebook.com/${FB_VERSION()}/dialog/oauth`,
    authParams: { scope: "email,public_profile" },

    async getProfile(code, redirectUri) {
      const tokenUrl = new URL(`https://graph.facebook.com/${FB_VERSION()}/oauth/access_token`);
      tokenUrl.search = new URLSearchParams({
        client_id: this.clientId(),
        client_secret: this.clientSecret(),
        redirect_uri: redirectUri,
        code,
      });
      const tokenRes = await fetch(tokenUrl);
      const tokens = await tokenRes.json();
      if (!tokenRes.ok || !tokens.access_token) throw new Error("Facebook token exchange failed");

      const meUrl = new URL(`https://graph.facebook.com/${FB_VERSION()}/me`);
      meUrl.search = new URLSearchParams({ fields: "id,name,email", access_token: tokens.access_token });
      const meRes = await fetch(meUrl);
      const me = await meRes.json();
      if (!meRes.ok || !me.id) throw new Error("Could not read the Facebook profile");

      // Facebook yalnız təsdiqlənmiş email qaytarır
      return { id: me.id, email: me.email, emailVerified: !!me.email, name: me.name };
    },
  },
};

// istifadəçiyə göstərilən xəta (texniki detal yox)
class OAuthError extends Error {}

const isConfigured = (provider) => !!(provider.clientId() && provider.clientSecret());

const serverUrl = () =>
  (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, "");

const redirectUri = (name) => `${serverUrl()}/api/auth/${name}/callback`;

// yalnız saytın öz səhifəsinə qayıtmaq olar ("//evil.com" kimi ünvanlar qəbul edilmir)
const safePath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";

// frontend-ə qayıdış: məlumat URL-in "#" hissəsində (serverə və loglara düşmür)
const backToClient = (res, params) =>
  res.redirect(`${clientUrl()}/oauth/callback#${new URLSearchParams(params)}`);

const readCookie = (req, name) => {
  const pair = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
};

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax", // Google/Facebook-dan geri yönləndirmədə cookie göndərilsin
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth",
});

// Google/Facebook profili → TravHub istifadəçisi
async function findOrCreateUser(name, profile) {
  const idField = `${name}Id`; // googleId / facebookId

  let user = await User.findOne({ [idField]: profile.id });
  if (user) return user;

  if (!profile.email) {
    throw new OAuthError(
      `Your ${PROVIDERS[name].label} account did not share an email address. Please sign up with email.`
    );
  }

  // eyni email ilə hesab varsa – provayder email-i təsdiqləyibsə hesablar birləşdirilir
  user = await User.findOne({ email: profile.email.toLowerCase() });
  if (user) {
    if (!profile.emailVerified) {
      throw new OAuthError(`Please verify your email address with ${PROVIDERS[name].label} first.`);
    }
    user[idField] = profile.id;
    await user.save();
    return user;
  }

  // yeni hesab – şifrəsiz (yalnız sosial girişlə daxil olur)
  return User.create({
    name: (profile.name || profile.email.split("@")[0]).slice(0, 50),
    email: profile.email,
    [idField]: profile.id,
  });
}

// @desc    Hansı sosial girişlər serverdə qurulub (frontend düymələri üçün)
// @route   GET /api/auth/providers
// @access  Public
export const getProviders = (req, res) => {
  res.json({
    success: true,
    providers: Object.fromEntries(Object.entries(PROVIDERS).map(([name, p]) => [name, isConfigured(p)])),
    // şifrə sıfırlama məktubları həqiqətən göndərilirmi (SMTP qurulubmu)
    emailConfigured: isEmailConfigured(),
  });
};

// @desc    Google / Facebook giriş səhifəsinə yönləndirmə
// @route   GET /api/auth/google, GET /api/auth/facebook   (?from=/cart – girişdən sonra qayıdılacaq səhifə)
// @access  Public
export const startOAuth = (name) => (req, res) => {
  const provider = PROVIDERS[name];
  if (!isConfigured(provider)) {
    return backToClient(res, { error: `${provider.label} login is not configured on the server yet.` });
  }

  // state: təsadüfi dəyər həm cookie-yə, həm provayderə gedir – qayıdanda eyni olmalıdır (CSRF qoruması)
  const state = crypto.randomBytes(24).toString("hex");
  const cookieValue = JSON.stringify({ provider: name, state, from: safePath(req.query.from) });
  res.cookie(STATE_COOKIE, cookieValue, { ...cookieOptions(), maxAge: STATE_MAX_AGE });

  const url = new URL(provider.authUrl());
  url.search = new URLSearchParams({
    client_id: provider.clientId(),
    redirect_uri: redirectUri(name),
    response_type: "code",
    state,
    ...provider.authParams,
  });

  res.redirect(url.toString());
};

// @desc    Google / Facebook geri qayıdışı: code → profil → istifadəçi → JWT
// @route   GET /api/auth/google/callback, GET /api/auth/facebook/callback
// @access  Public
export const oauthCallback = (name) => async (req, res) => {
  const provider = PROVIDERS[name];

  // cookie bir dəfəlikdir: oxunur və dərhal silinir
  let saved;
  try {
    saved = JSON.parse(readCookie(req, STATE_COOKIE));
  } catch {
    saved = null;
  }
  res.clearCookie(STATE_COOKIE, cookieOptions());

  try {
    if (!isConfigured(provider)) {
      throw new OAuthError(`${provider.label} login is not configured on the server yet.`);
    }

    const { code, state, error } = req.query;
    if (error) {
      throw new OAuthError(`${provider.label} login was cancelled.`);
    }
    if (!saved || saved.provider !== name || typeof state !== "string" || state !== saved.state) {
      throw new OAuthError("Login session expired or is invalid. Please try again.");
    }
    if (typeof code !== "string" || !code) {
      throw new OAuthError(`${provider.label} did not return an authorization code.`);
    }

    const profile = await provider.getProfile(code, redirectUri(name));
    const user = await findOrCreateUser(name, profile);

    backToClient(res, { token: generateToken(user._id), from: safePath(saved.from) });
  } catch (err) {
    if (!(err instanceof OAuthError)) {
      console.error(`${provider.label} OAuth error:`, err.message);
    }
    const message = err instanceof OAuthError ? err.message : `${provider.label} login failed. Please try again.`;
    backToClient(res, { error: message });
  }
};
