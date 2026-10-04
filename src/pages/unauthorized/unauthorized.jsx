import { Link } from "react-router-dom";
import PageHeader from "../../components/pageheader/pageheader";
import { useAuth } from "../../context/AuthContext";
import "../../components/travhubbtn/travhubbtn.css";
import "../../components/statusmessage/statusmessage.css";

/*
  "/unauthorized" – adi istifadəçi Admin Panel ünvanını əl ilə yazanda bura gəlir.
*/
export default function Unauthorized() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Access Denied" current="Access Denied" />
      <section className="page-status">
        <div className="status-message status-message--error" role="alert">
          <h3 className="status-message__title">Admins only</h3>
          <p className="status-message__text">
            {user
              ? `Your account (${user.email}) has the "${user.role}" role. The Admin Panel is available only to administrators.`
              : "The Admin Panel is available only to administrators."}
          </p>
          <Link to="/" className="travhub-btn status-message__btn">
            <span>Back to Home</span>
          </Link>
        </div>
      </section>
    </>
  );
}
