import { Link } from "react-router-dom";
import "./destinationcard.css";

function ArrowIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </svg>
  );
}

/*
  Destinasiya kartı (ana səhifə və Destination səhifələri).
  Hover: şəkil böyüyür, üstündən parıltı keçir, sağ yuxarıda yaşıl ox düyməsi gəlir.
  className / style – bölmənin öz giriş animasiyası üçün (məs. ana səhifədəki td-reveal).
*/
export default function DestinationCard({ destination, className = "", style }) {
  return (
    <Link to="/destination-details" className={`td-card ${className}`.trim()} style={style}>
      <div className="td-card__img">
        <img src={destination.image} alt={destination.name} />
      </div>

      <span className="td-card__btn">
        <span className="td-card__arrow">
          <ArrowIcon />
        </span>
      </span>

      <div className="td-card__content">
        <h3 className="td-card__title">{destination.name}</h3>
        <span className="td-card__badge">{destination.listing} Listing</span>
      </div>
    </Link>
  );
}
