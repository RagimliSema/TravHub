import { Link } from "react-router-dom";
import DestinationCard from "../destinationcard/destinationcard";
import { destinations } from "../../data/destinations";
import "../travhubbtn/travhubbtn.css";
import "./destinationlist.css";

// Destination səhifəsi ("/destination"): 12 kart (4 / 3 / 2 / 1 sütun) + "Load More Destination"
export default function DestinationList() {
  return (
    <section className="destination-list">
      <div className="destination-list__container">
        <div className="destination-list__grid">
          {destinations.map((item) => (
            <DestinationCard key={item.id} destination={item} />
          ))}
        </div>

        {/* demo-da da bu düymə eyni səhifəyə aparır */}
        <div className="destination-list__more">
          <Link to="/destination" className="travhub-btn">
            <span>Load More Destination</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
