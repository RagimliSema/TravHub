import { useState } from "react";
import { Link } from "react-router-dom";
import { FaLocationDot, FaGlobe, FaMoneyBillWave, FaRoad } from "react-icons/fa6";
import {
  SidebarBox,
  SidebarSearch,
  SidebarAuthor,
  SidebarCategories,
  SidebarTags,
} from "../sidebarwidgets/sidebarwidgets";
import { useInView } from "../../hooks/useInView";
import "../travhubbtn/travhubbtn.css";
import "./destinationdetails.css";

import gallery1 from "../../assets/image/destination-d-1.jpg";
import gallery2 from "../../assets/image/destination-d-2.jpg";
import gallery3 from "../../assets/image/destination-d-3.jpg";
import gallery4 from "../../assets/image/destination-d-4.jpg";
import gallery5 from "../../assets/image/destination-d-5.jpg";
import gallery6 from "../../assets/image/destination-d-6.jpg";
import videoBg from "../../assets/image/video-bg.jpg";
import videoBtn from "../../assets/image/video-btn.png";
import authorImage from "../../assets/image/about-author.jpg";

const TEXT =
  "You’ve switched your charity’s office to renewable energy. You’ve cut most flights. The office fridge is stacked high with oat milk, and lycra-clad staff are proudly showing off their subsidised bicycles. On your way to net-zero, right? But operational emissions are just one part of the net-zero picture: your money, too, has a carbon cost attached.";

const TEXT_LONG =
  "Cras varius. Donec vitae orci sed dolor rutrum auctor. Fusce egestas elit eget lorem. Suspendisse nisl elit, rhoncus eget elementum acondimentum eget, diam. Nam at tortor in tellus interdum sagitliquam lobortis. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio. Vivamus laoreet. mavailable market standard dummy text available market industry Lorem Ipsum simply dummy text of free available market. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration";

const TEXT_SHORT =
  "You’ve switched your charity’s office to renewable energy. You’ve cut most flights. The office fridge is stacked high with oat milk, and lycra-clad staff are proudly showing off their subsidised bicycles. On your way to net-zero.";

const info = [
  { title: "Address", text: "4140 Parker Rd. Allentown, New Mexico 31134", Icon: FaLocationDot },
  { title: "Languages", text: "English, Bangla", Icon: FaGlobe },
  { title: "Currency Used", text: "USD", Icon: FaMoneyBillWave },
  { title: "Distance", text: "1500 KM", Icon: FaRoad },
];

const plans = [
  {
    name: "Regular Pack",
    price: "$1451",
    text: "Simplify and consolidate business travel booking",
    listTitle: "Business travel basic",
    features: ["Book all your business travel", "Book from an extensive travel", "Consolidated invoicing", "Unlimited cost centers", "Simple travel reporting"],
  },
  {
    name: "Popular Pack",
    price: "$3654",
    text: "Spend less time booking travel, whilst controlling spend",
    listTitle: "Everything in Starter, and",
    features: ["10 policy approval workflows", "Track budgets for up 5 cost", "Save up to 25% with VAT", "Secure traveler sign in", "Custom fields"],
  },
  {
    name: "Summer Pack",
    price: "$4514",
    text: "Spend less time booking travel, whilst controlling spend",
    listTitle: "Everything in Starter, and",
    features: ["Book all your business travel", "Book from an extensive travel", "Consolidated invoicing", "Unlimited cost centers", "Simple travel reporting"],
  },
];

const questions = [
  "How To Boost Media Performance On A Budget?",
  "As designers the responsibility?",
  "Improving Your Team’s Communication?",
  "Mproving Your Team’s Communication?",
];

const ANSWER =
  "Orttitor auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet porta metus. Cras a mivelmaximnibhprofessor at Hampden-Sydney College in Virginia, loositesstill in their";

const categories = ["Dubai", "Destination", "Travel Guides", "Vacation", "Tourist Tours"].map((label) => ({
  label,
  to: "/destination",
}));

const tags = [
  "Travel", "Destination", "Tour Guide", "Travel Map", "Vacation", "Travel Guide",
  "Adventure", "Tours", "Travel Pack", "Visiting", "Moments", "Tourism",
];

const VIDEO_URL = "https://www.youtube.com/watch?v=G49_MdP0klg";
const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4562.753041141002!2d-118.80123790098536!3d34.152323469614075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80e82469c2162619%3A0xba03efb7998eef6d!2sCostco+Wholesale!5e0!3m2!1sbn!2sbd!4v1562518641290!5m2!1sbn!2sbd";

/* ---------- Sual-cavab: həmişə bir sual açıq ---------- */
function Questions() {
  const [open, setOpen] = useState(0);

  return (
    <div className="dd-accordion">
      {questions.map((question, i) => {
        const isOpen = open === i;

        return (
          <div key={question} className={`dd-accordion__item${isOpen ? " is-active" : ""}`}>
            <h4 className="dd-accordion__heading">
              <button
                type="button"
                id={`dd-q-${i}`}
                className="dd-accordion__title"
                aria-expanded={isOpen}
                aria-controls={`dd-a-${i}`}
                onClick={() => setOpen(i)}
              >
                {question}
                <span className="dd-accordion__icon" aria-hidden="true" />
              </button>
            </h4>
            <div
              id={`dd-a-${i}`}
              role="region"
              aria-labelledby={`dd-q-${i}`}
              className="dd-accordion__panel"
              inert={!isOpen}
            >
              <div className="dd-accordion__panel-inner">
                <p>{ANSWER}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Bölmə ---------- */
export default function DestinationDetails() {
  const [galleryRef, galleryInView] = useInView(0.1);
  const [mainRef, mainInView] = useInView(0.05);
  const [asideRef, asideInView] = useInView(0.05);

  return (
    <section className="destination-details">
      <div className="destination-details__container">
        {/* yuxarıda 6 şəkillik qalereya */}
        <div ref={galleryRef} className={`dd-gallery${galleryInView ? " is-inview" : ""}`}>
          <div className="dd-gallery__col">
            <img src={gallery1} alt="Destinasiyadan görüntü 1" width="258" height="223" />
            <img src={gallery2} alt="Destinasiyadan görüntü 2" width="258" height="221" />
          </div>
          <div className="dd-gallery__col">
            <img src={gallery3} alt="Destinasiyadan görüntü 3" width="240" height="461" />
          </div>
          <div className="dd-gallery__col">
            <img src={gallery4} alt="Destinasiyadan görüntü 4" width="515" height="461" />
          </div>
          <div className="dd-gallery__col">
            <img src={gallery5} alt="Destinasiyadan görüntü 5" width="258" height="223" />
            <img src={gallery6} alt="Destinasiyadan görüntü 6" width="258" height="223" />
          </div>
        </div>

        <div className="destination-details__row">
          <div ref={mainRef} className={`destination-details__main${mainInView ? " is-inview" : ""}`}>
            <h3 className="dd-title">Katie Stewart Your charity may be net zero</h3>
            <p className="dd-text">{TEXT}</p>
            <p className="dd-text">{TEXT_LONG}</p>

            <ul className="dd-info">
              {info.map(({ title, text, Icon }) => (
                <li key={title}>
                  <span className="dd-info__icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <h5 className="dd-info__title">{title}</h5>
                  <p className="dd-info__text">{text}</p>
                </li>
              ))}
            </ul>

            <div className="dd-video">
              <img src={videoBg} alt="Destinasiya haqqında video" />
              <a className="dd-video__btn" href={VIDEO_URL} target="_blank" rel="noreferrer" aria-label="Videoya bax">
                <img src={videoBtn} alt="" />
              </a>
            </div>

            <h3 className="dd-title">Pricing Plan</h3>
            <p className="dd-text">{TEXT_SHORT}</p>
            <div className="dd-pricing">
              {plans.map((plan) => (
                <div key={plan.name} className="dd-plan">
                  <div className="dd-plan__name">{plan.name}</div>
                  <h3 className="dd-plan__price">{plan.price}</h3>
                  <p className="dd-plan__text">{plan.text}</p>
                  <Link to="/contact" className="travhub-btn dd-plan__btn">
                    <span>Choose Plan</span>
                  </Link>
                  <div className="dd-plan__list-title">{plan.listTitle}</div>
                  <ul className="dd-plan__list">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h3 className="dd-title">Question About Destination</h3>
            <p className="dd-text">{TEXT_SHORT}</p>
            <Questions />

            <h3 className="dd-title">See Map</h3>
            <p className="dd-text">{TEXT_SHORT}</p>
            <div className="dd-map">
              <iframe title="Destinasiyanın xəritəsi" src={MAP_URL} loading="lazy" allowFullScreen />
            </div>
          </div>

          <aside ref={asideRef} className={`destination-details__aside${asideInView ? " is-inview" : ""}`}>
            <SidebarBox title="Find Your Destination">
              <SidebarSearch />
            </SidebarBox>

            <SidebarBox title="About Author">
              <SidebarAuthor
                image={authorImage}
                name="Leslie Alexander"
                role="Author"
                text="You’ve switched your charity’s office to renewable energy. You’ve cut most flights."
              />
            </SidebarBox>

            <SidebarBox title="Other Destination">
              <SidebarCategories items={categories} />
            </SidebarBox>

            <SidebarBox title="Tags">
              <SidebarTags tags={tags} to="/destination" />
            </SidebarBox>
          </aside>
        </div>
      </div>
    </section>
  );
}
