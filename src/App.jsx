import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import ScrollToTop from "./components/scrolltotop/scrolltotop";

import Home from "./pages/home/home";
import About from "./pages/about/about";
import Team from "./pages/team/team";
import Pricing from "./pages/pricing/pricing";
import Gallery from "./pages/gallery/gallery";
import Faq from "./pages/faq/faq";
import Login from "./pages/login/login";
import NotFound from "./pages/notfound/notfound";
import { Tours, ToursSidebar, ToursCarousel, TourDetailsPage } from "./pages/tours/tours";
import { Destination, DestinationCarouselPage, DestinationDetailsPage } from "./pages/destination/destination";
import { NewsGridPage, NewsListPage, NewsCarouselPage, NewsDetailsPage } from "./pages/news/news";
import Contact from "./pages/contact/contact";
import { CartPage, CheckoutPage, OrdersPage, WishlistPage } from "./pages/shop/shop";
import Unauthorized from "./pages/unauthorized/unauthorized";
import OAuthCallback from "./pages/oauthcallback/oauthcallback";
import {
  AdminDashboard,
  AdminProducts,
  AdminOrders,
  AdminUsers,
  AdminMessages,
  AdminSubscribers,
} from "./pages/admin/admin";
import RequireAuth from "./components/requireauth/requireauth";
import RequireAdmin from "./components/requireadmin/requireadmin";
import AdminLayout from "./components/adminlayout/adminlayout";

// Səhifə dəyişəndə ən yuxarıdan başla
function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}



function App() {
  // Admin Panel-in öz menyusu var – orada saytın header / footer-i göstərilmir
  const { pathname } = useLocation();
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <>
      <ScrollToTopOnNavigate />
      {!isAdminArea && <Header />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login mode="register" />} />
          <Route path="/forgot-password" element={<Login mode="forgot" />} />
          <Route path="/reset-password/:token" element={<Login mode="reset" />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours-sidebar" element={<ToursSidebar />} />
          <Route path="/tours-carousel" element={<ToursCarousel />} />
          <Route path="/tour-details" element={<TourDetailsPage />} />
          <Route path="/tour-details/:id" element={<TourDetailsPage />} />
          <Route path="/destination" element={<Destination />} />
          <Route path="/destination-carousel" element={<DestinationCarouselPage />} />
          <Route path="/destination-details" element={<DestinationDetailsPage />} />
          <Route path="/news-grid" element={<NewsGridPage />} />
          <Route path="/news-grid-left" element={<NewsGridPage sidebar="left" />} />
          <Route path="/news-grid-right" element={<NewsGridPage sidebar="right" />} />
          <Route path="/news-list" element={<NewsListPage />} />
          <Route path="/news-list-left" element={<NewsListPage sidebar="left" />} />
          <Route path="/news-list-right" element={<NewsListPage sidebar="right" />} />
          <Route path="/news-carousel" element={<NewsCarouselPage />} />
          <Route path="/news-details" element={<NewsDetailsPage />} />
          <Route path="/news-details-left" element={<NewsDetailsPage sidebar="left" />} />
          <Route path="/news-details-right" element={<NewsDetailsPage sidebar="right" />} />
          <Route path="/contact" element={<Contact />} />
          {/* yalnız daxil olmuş istifadəçilər üçün (giriş yoxdursa Login-ə yönləndirir) */}
          <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/my-orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
          {/* Google / Facebook girişindən sonra backend bura qaytarır */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          {/* Admin Panel: yalnız backend-də role = "admin" olan istifadəçilər */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />
          {/* mövcud olmayan ünvanlar da 404 səhifəsini göstərir */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAdminArea && <Footer />}
      {!isAdminArea && <ScrollToTop />}
    </>
  );
}

export default App;
