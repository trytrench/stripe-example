import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useShoppingCart } from "use-shopping-cart";
import ElementsForm from "../components/ElementsForm";
import getStripe from "../utils/get-stripejs";
import axios from "axios";

const CartCheckout = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { cartDetails } = useShoppingCart();

  const createPaymentIntent = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data } = await axios.post<{
        amount: number;
        clientSecret: string;
      }>("/api/cart/create-payment-intent", cartDetails);

      setAmount(data.amount / 100);
      setClientSecret(data.clientSecret);

      setLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Something went wrong.");
      setLoading(false);
      return;
    }
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
      <ElementsForm amount={amount} clientSecret={clientSecret} />
    </Elements>
  );
};

export default CartCheckout;
