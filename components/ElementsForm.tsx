import React, { useEffect, useState } from "react";
import PrintObject from "../components/PrintObject";
import StripeTestCards from "../components/StripeTestCards";
import * as config from "../config";
import { formatAmountForDisplay } from "../utils/stripe-helpers";
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { initialize } from "@trytrench/sdk";
import axios from "axios";
import PaymentStatus from "./PaymentStatus";

interface Props {
  amount: number;
  clientSecret: string;
}

const ElementsForm = ({ amount, clientSecret }: Props) => {
  const [payment, setPayment] = useState({ status: "initial" });
  const [errorMessage, setErrorMessage] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    initialize(
      process.env.NEXT_PUBLIC_TRENCH_API_URL as string,
      clientSecret.split("_secret")[0]
    ).catch((error) => {
      console.error(error);
    });
  }, [clientSecret]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    e.preventDefault();

    if (!elements || !stripe) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setPayment({ status: "processing" });

    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPayment({ status: "error" });
        setErrorMessage(submitError.message ?? "An unknown error occurred");
        return;
      }

      // Create the PaymentMethod using the details collected by the Payment Element
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      });

      if (!paymentMethod || error) {
        // This point is only reached if there's an immediate error when
        // creating the PaymentMethod. Show the error to your customer (for example, payment details incomplete)
        setPayment({ status: "error" });
        setErrorMessage(error.message ?? "An unknown error occurred");
        return;
      }

      // Create a PaymentIntent with the specified amount.
      try {
        const { data } = await axios.post<{ status: string }>(
          "/api/cart/confirm-payment-intent",
          {
            paymentMethodId: paymentMethod.id,
            clientSecret,
          }
        );

        if (data.status === "requires_action") {
          // Use Stripe.js to handle the required next action
          const { error } = await stripe.handleNextAction({ clientSecret });

          if (error) {
            setPayment({ status: "error" });
            setErrorMessage(error.message ?? "An unknown error occurred");
          } else {
            // Actions handled, show success message
            setPayment({ status: "succeeded" });
          }
        } else {
          setPayment({ status: "succeeded" });
        }
      } catch (error) {
        setPayment({ status: "error" });
        setErrorMessage(
          error.response?.data?.message ?? "An unknown error occurred"
        );
      }
    } catch (error) {
      setPayment({ status: "error" });
      setErrorMessage(error.message ?? "An unknown error occurred");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <StripeTestCards />
        {/* <AddressElement
          options={{
            mode: "billing",
          }}
        /> */}
        <PaymentElement />
        <button
          className="elements-style-background"
          type="submit"
          disabled={
            !["initial", "succeeded", "error"].includes(payment.status) ||
            !stripe
          }
        >
          Pay {formatAmountForDisplay(amount, config.CURRENCY)}
        </button>
      </form>
      <PaymentStatus status={payment.status} errorMessage={errorMessage} />
      <PrintObject content={payment} />
    </>
  );
};

export default ElementsForm;
