import { useEffect, useState } from "react";

import StripeTestCards from "../components/StripeTestCards";

import { useShoppingCart } from "use-shopping-cart";
import { CartDetails } from "use-shopping-cart/core";

interface Props {
  onCheckout: (cartDetails: CartDetails) => void;
}

const CartSummary = ({ onCheckout }: Props) => {
  const [cartEmpty, setCartEmpty] = useState(true);
  const {
    formattedTotalPrice,
    cartCount,
    clearCart,
    cartDetails,
    redirectToCheckout,
  } = useShoppingCart();

  useEffect(() => setCartEmpty(!cartCount), [cartCount]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (cartDetails) onCheckout(cartDetails);
      }}
    >
      <h2>Cart summary</h2>
      {/* This is where we'll render our cart */}
      <p suppressHydrationWarning>
        <strong>Number of Items:</strong> {cartCount}
      </p>
      <p suppressHydrationWarning>
        <strong>Total:</strong> {formattedTotalPrice}
      </p>

      {/* Redirects the user to Stripe */}
      <StripeTestCards />
      <button
        className="cart-style-background"
        type="submit"
        disabled={cartEmpty}
      >
        Checkout
      </button>
      <button
        className="cart-style-background"
        type="button"
        onClick={clearCart}
      >
        Clear Cart
      </button>
    </form>
  );
};

export default CartSummary;
