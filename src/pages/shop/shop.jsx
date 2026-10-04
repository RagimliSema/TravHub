import PageHeader from "../../components/pageheader/pageheader";
import CartSection from "../../components/cartsection/cartsection";
import CheckoutSection from "../../components/checkoutsection/checkoutsection";
import OrderSection from "../../components/ordersection/ordersection";
import WishlistSection from "../../components/wishlistsection/wishlistsection";

/*
  Mağaza səhifələri – yalnız daxil olmuş istifadəçilər üçün
  (App.jsx-də RequireAuth ilə qorunur, əsl yoxlama backend-dədir).
*/

// "/cart"
export function CartPage() {
  return (
    <>
      <PageHeader title="Cart" current="Cart" />
      <CartSection />
    </>
  );
}

// "/checkout"
export function CheckoutPage() {
  return (
    <>
      <PageHeader title="Checkout" parents={[{ label: "Cart", to: "/cart" }]} current="Checkout" />
      <CheckoutSection />
    </>
  );
}

// "/my-orders"
export function OrdersPage() {
  return (
    <>
      <PageHeader title="My Orders" current="My Orders" />
      <OrderSection />
    </>
  );
}

// "/wishlist"
export function WishlistPage() {
  return (
    <>
      <PageHeader title="Wishlist" current="Wishlist" />
      <WishlistSection />
    </>
  );
}
