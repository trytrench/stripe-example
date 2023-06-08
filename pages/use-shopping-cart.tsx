import { NextPage } from "next";
import Layout from "../components/Layout";

import Cart from "../components/Cart";
import CartSummary from "../components/CartSummary";
import Products from "../components/Products";
import ElementsForm from "../components/ElementsForm";
import { Elements } from "@stripe/react-stripe-js";
import { useState } from "react";
import getStripe from "../utils/get-stripejs";
import { fetchPostJSON } from "../utils/api-helpers";
import { CartDetails } from "use-shopping-cart/core";

const DonatePage: NextPage = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (cartDetails: CartDetails) => {
    setLoading(true);
    setErrorMessage("");

    const response = await fetchPostJSON(
      "/api/cart/create-payment-intent",
      cartDetails
    );

    if (response.statusCode === 500) {
      console.error(response.message);
      setErrorMessage(response.error.message);
      setLoading(false);
      return;
    }

    setAmount(response.amount / 100);
    setClientSecret(response.clientSecret);
  };

  return (
    <Layout title="Shopping Cart | Next.js + TypeScript Example">
      <div className="page-container">
        <h1>Shopping Cart</h1>
        <p>
          Powered by the{" "}
          <a href="https://useshoppingcart.com">use-shopping-cart</a> React
          hooks library.
        </p>
        <Cart>
          <CartSummary onCheckout={handleCheckout} loading={loading} />
          {errorMessage ? (
            <p style={{ color: "red" }}>Error: {errorMessage}</p>
          ) : null}
          {clientSecret ? (
            <Elements
              stripe={getStripe()}
              options={{ clientSecret, paymentMethodCreation: "manual" }}
            >
              <ElementsForm
                amount={amount}
                confirmUrl="/api/cart/confirm-payment-intent"
                clientSecret={clientSecret}
              />
            </Elements>
          ) : (
            <Products />
          )}
        </Cart>
      </div>
    </Layout>
  );
};

export default DonatePage;
