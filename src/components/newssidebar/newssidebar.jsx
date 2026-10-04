import {
  SidebarBox,
  SidebarSearch,
  SidebarCategories,
  SidebarPosts,
  SidebarTags,
} from "../sidebarwidgets/sidebarwidgets";
import "./newssidebar.css";

import lp1 from "../../assets/image/lp-1-1.jpg";
import lp2 from "../../assets/image/lp-1-2.jpg";
import lp3 from "../../assets/image/lp-1-3.jpg";
import lp4 from "../../assets/image/lp-1-4.jpg";

const categories = ["Adventure", "Destination", "Travel Guides", "Vacation", "Tourist Tours"].map((label) => ({
  label,
  to: "/news-details-right",
}));

const latestPosts = [lp1, lp2, lp3, lp4].map((image, i) => ({
  id: i + 1,
  image,
  title: "Desktop publishing sotware like aldus page",
  date: "12 Dec, 2022",
  author: "Robert Fox",
  to: "/news-details-right",
}));

const tags = [
  "Travel", "Destination", "Tour Guide", "Travel Map", "Vacation", "Travel Guide",
  "Adventure", "Tours", "Travel Pack", "Visiting", "Moments", "Tourism",
];

// News səhifələrinin sidebar-ı (demo-dakı blog-*-left / blog-*-right)
function NewsSidebar() {
  return (
    <aside className="news-sidebar">
      <SidebarBox title="Find Your Blog">
        <SidebarSearch />
      </SidebarBox>
      <SidebarBox title="News Categories">
        <SidebarCategories items={categories} />
      </SidebarBox>
      <SidebarBox title="Latest posts">
        <SidebarPosts posts={latestPosts} />
      </SidebarBox>
      <SidebarBox title="Tags">
        <SidebarTags tags={tags} to="/news-grid-right" />
      </SidebarBox>
    </aside>
  );
}

/*
  News səhifələrinin düzülüşü:
  sidebar yoxdursa – yalnız məzmun,
  "left" / "right" – məzmun 770px + sidebar 370px (solda və ya sağda).
*/
export default function NewsLayout({ sidebar, children }) {
  if (!sidebar) return children;

  return (
    <div className={`news-layout news-layout--${sidebar}`}>
      <div className="news-layout__main">{children}</div>
      <NewsSidebar />
    </div>
  );
}
