import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/pageheader/pageheader";
import StatusMessage from "../../components/statusmessage/statusmessage";
import { useAuth } from "../../context/AuthContext";

// yalnız saytın öz səhifəsinə qayıtmaq olar
const safePath = (value) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/");

/*
  "/oauth/callback" – Google / Facebook girişindən sonra backend bura qaytarır:
    /oauth/callback#token=...&from=/cart   → token saxlanılır, istifadəçi /me ilə yüklənir
    /oauth/callback#error=...              → Login səhifəsində xəta göstərilir
*/
export default function OAuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    // StrictMode effekti iki dəfə işlədir – token yalnız bir dəfə oxunmalıdır
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    const from = safePath(params.get("from"));

    // token URL-də (brauzer tarixçəsində) qalmasın
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      navigate("/login", { replace: true, state: { oauthError: params.get("error") || "Social login failed." } });
      return;
    }

    loginWithToken(token)
      .then(() => navigate(from, { replace: true }))
      .catch((error) => navigate("/login", { replace: true, state: { oauthError: error.message } }));
  }, [loginWithToken, navigate]);

  return (
    <>
      <PageHeader title="Signing In" current="Login" />
      <section className="page-status">
        <StatusMessage type="loading" text="Signing you in..." />
      </section>
    </>
  );
}
