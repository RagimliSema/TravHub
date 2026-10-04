import { useParams } from "react-router-dom";
import PageHeader from "../../components/pageheader/pageheader";
import LoginSection from "../../components/loginsection/loginsection";
import ClientCarousel from "../../components/clientcarousel/clientcarousel";

const PAGES = {
  login: { title: "Login Account", current: "Login" },
  register: { title: "Create Account", current: "Register" },
  forgot: { title: "Forgot Password", current: "Forgot Password" },
  reset: { title: "Reset Password", current: "Reset Password" },
};

/*
  Login ("/login", header-də Pages → Login), qeydiyyat ("/register"),
  şifrə sıfırlama ("/forgot-password", "/reset-password/:token") – eyni dizayn.
*/
export default function Login({ mode = "login" }) {
  const { token } = useParams();
  const page = PAGES[mode] ?? PAGES.login;

  return (
    <>
      <PageHeader key={mode} title={page.title} current={page.current} />
      <LoginSection mode={mode} resetToken={token} />
      <ClientCarousel />
    </>
  );
}
