import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useShoppingCart } from "use-shopping-cart";
import ElementsForm from "../components/ElementsForm";
import { fetchPostJSON } from "../utils/api-helpers";
import getStripe from "../utils/get-stripejs";

const CartCheckout = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { cartDetails } = useShoppingCart();

  const createPaymentIntent = async () => {
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

    setLoading(false);
  };

  useEffect(() => {
    if (cartDetails && Object.keys(cartDetails).length) createPaymentIntent();
  }, [cartDetails]);

  if (loading || !clientSecret) {
    return <p>Loading...</p>;
  }

  if (errorMessage)
    return <p style={{ color: "red" }}>Error: {errorMessage}</p>;

  return (
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
  );
};

export default CartCheckout;
