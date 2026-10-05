import { useState } from "react";
import { FaLocationDot, FaPhone, FaPaperPlane, FaHeadset } from "react-icons/fa6";
import SectionTitle from "../sectiontitle/sectiontitle";
import { useAuth } from "../../context/AuthContext";
import { useInView } from "../../hooks/useInView";
import { contactApi } from "../../services/api";
import "../travhubbtn/travhubbtn.css";
import "./contactsection.css";

import contactBg from "../../assets/image/login-bg.jpg";
import contactMan from "../../assets/image/login-man-two.png";
import cloudBig from "../../assets/image/cloud-3-1.png";
import cloudSmall from "../../assets/image/login-cloud.png";
import shapeOne from "../../assets/image/contact-page-shape-1.png";

const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4562.753041141002!2d-118.80123790098536!3d34.152323469614075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80e82469c2162619%3A0xba03efb7998eef6d!2sCostco+Wholesale!5e0!3m2!1sbn!2sbd!4v1562518641290!5m2!1sbn!2sbd";

/* ---------- 1. Əlaqə məlumatları (4 qutu) ---------- */
function ContactInfo() {
  return (
    <section className="contact-info">
      <div className="contact-info__container">
        <ul className="contact-info__list">
          <li className="contact-info__item">
            <span className="contact-info__icon" aria-hidden="true"><FaLocationDot /></span>
            <h5 className="contact-info__title">Office Address</h5>
            <p className="contact-info__text">
              3517 W. Gray St. Utica,
              <br />
              Pennsylvania 57867
            </p>
          </li>
          <li className="contact-info__item">
            <span className="contact-info__icon" aria-hidden="true"><FaPhone /></span>
            <h5 className="contact-info__title">Phone Number</h5>
            <p className="contact-info__text">
              <a href="tel:35699998888">356 9999 8888</a>
              <br />
              <a href="tel:45866663333">458 6666 3333</a>
            </p>
          </li>
          <li className="contact-info__item">
            <span className="contact-info__icon" aria-hidden="true"><FaPaperPlane /></span>
            <h5 className="contact-info__title">Email Address</h5>
            <p className="contact-info__text">
              <a href="mailto:example@gmail.com">example@gmail.com</a>
              <br />
              <a href="mailto:yourmail@gmail.com">yourmail@gmail.com</a>
            </p>
          </li>
          <li className="contact-info__item">
            <span className="contact-info__icon" aria-hidden="true"><FaHeadset /></span>
            <h5 className="contact-info__title">Supports</h5>
            <p className="contact-info__text">
              24/7 any time support team
              <br />
              ready for supports.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}

// null – istifadəçi xanaya hələ toxunmayıb: daxil olubsa hesabdakı ad / email göstərilir
const EMPTY_FORM = { name: null, email: null, message: "" };

/* ---------- 2. Şəkil + "Get In Touch" forması (backend: POST /api/contact) ---------- */
function ContactForm() {
  const [mediaRef, mediaInView] = useInView(0.2);
  const [formRef, formInView] = useInView(0.2);
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState({ pending: false, error: "", success: "" });

  const values = {
    name: form.name ?? user?.name ?? "",
    email: form.email ?? user?.email ?? "",
    message: form.message,
  };

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setStatus((prev) => ({ ...prev, error: "", success: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ pending: true, error: "", success: "" });
    try {
      const data = await contactApi.send(values);
      setForm(EMPTY_FORM);
      setStatus({ pending: false, error: "", success: data.message });
    } catch (error) {
      setStatus({ pending: false, error: error.message, success: "" });
    }
  };

  return (
    <section className="contact-page">
      <div
        className="contact-page__shape"
        style={{ backgroundImage: `url(${shapeOne})` }}
        aria-hidden="true"
      />

      <div className="contact-page__container">
        <div className="contact-page__row">
          <div ref={mediaRef} className={`contact-page__media-col${mediaInView ? " is-inview" : ""}`}>
            <div className="contact-media">
              <div className="contact-media__main">
                <img src={contactBg} alt="Təbiətdə səyahət mənzərəsi" />
              </div>
              <img className="contact-media__man" src={contactMan} alt="" aria-hidden="true" />
              <img className="contact-media__cloud" src={cloudBig} alt="" aria-hidden="true" />
              <img className="contact-media__cloud-two" src={cloudSmall} alt="" aria-hidden="true" />
            </div>
          </div>

          <div ref={formRef} className={`contact-page__form-col${formInView ? " is-inview" : ""}`}>
            <SectionTitle align="left" subtitle="Contact Us" title="Get In Touch" />

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__control">
                <label htmlFor="contact-name">Full Name</label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Enter name"
                  autoComplete="name"
                  value={values.name}
                  onChange={update("name")}
                  maxLength={50}
                  required
                />
              </div>
              <div className="contact-form__control">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="Enter email"
                  autoComplete="email"
                  value={values.email}
                  onChange={update("email")}
                  maxLength={100}
                  required
                />
              </div>
              <div className="contact-form__control contact-form__control--full">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  placeholder="Write Message"
                  value={values.message}
                  onChange={update("message")}
                  minLength={10}
                  maxLength={2000}
                  required
                />
              </div>
              {(status.error || status.success) && (
                <div className="contact-form__control contact-form__control--full">
                  {status.error ? (
                    <p className="contact-form__error" role="alert">
                      {status.error}
                    </p>
                  ) : (
                    <p className="contact-form__notice" role="status">
                      {status.success}
                    </p>
                  )}
                </div>
              )}
              <div className="contact-form__control contact-form__control--full">
                <button type="submit" className="travhub-btn contact-form__submit" disabled={status.pending}>
                  <span>{status.pending ? "Sending..." : "Send Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Xəritə ---------- */
function ContactMap() {
  return (
    <section className="contact-map">
      <iframe title="Ofisin xəritədə yeri" src={MAP_URL} loading="lazy" allowFullScreen />
    </section>
  );
}

// Contact səhifəsinin 3 bölməsi (demo-dakı contact.html)
export default function ContactSection() {
  return (
    <>
      <ContactInfo />
      <ContactForm />
      <ContactMap />
    </>
  );
}
