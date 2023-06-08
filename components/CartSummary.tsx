import React, { useState, useEffect } from "react";

import StripeTestCards from "../components/StripeTestCards";

import { useShoppingCart } from "use-shopping-cart";
import { fetchPostJSON } from "../utils/api-helpers";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "../utils/get-stripejs";
import ElementsForm from "./ElementsForm";
import { CartDetails } from "use-shopping-cart/core";

interface Props {
  onCheckout: (cartDetails: CartDetails) => void;
  loading: boolean;
}

const CartSummary = ({ onCheckout, loading }: Props) => {
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
        disabled={cartEmpty || loading}
      >
        Checkout
      </button>
      <button
        className="cart-style-background"
        type="button"
        onClick={clearCart}
        disabled={loading}
      >
        Clear Cart
      </button>
    </form>
  );
};

export default CartSummary;
