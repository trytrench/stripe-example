import React, { useEffect, useState } from "react";
import PrintObject from "../components/PrintObject";
import StripeTestCards from "../components/StripeTestCards";
import * as config from "../config";
import { fetchPostJSON } from "../utils/api-helpers";
import { formatAmountForDisplay } from "../utils/stripe-helpers";
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { initialize } from "@trytrench/sdk";

interface Props {
  amount: number;
  confirmUrl: string;
  clientSecret?: string;
}

const ElementsForm = ({ amount, confirmUrl, clientSecret }: Props) => {
  const [payment, setPayment] = useState({ status: "initial" });
  const [errorMessage, setErrorMessage] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (clientSecret)
      initialize(
        process.env.NEXT_PUBLIC_TRENCH_API_URL as string,
        clientSecret.split("_secret")[0]
      ).catch((error) => {
        console.error(error);
      });
  }, [clientSecret]);

  const PaymentStatus = ({ status }: { status: string }) => {
    switch (status) {
      case "processing":
      case "requires_payment_method":
      case "requires_confirmation":
        return <h2>Processing...</h2>;

      case "requires_action":
        return <h2>Authenticating...</h2>;

      case "succeeded":
        return <h2>Payment Succeeded 🥳</h2>;

      case "error":
        return (
          <>
            <h2>Error 😭</h2>
            <p className="error-message">{errorMessage}</p>
          </>
        );

      default:
        return null;
    }
  };

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
      const response = await fetchPostJSON(confirmUrl, {
        paymentMethodId: paymentMethod.id,
        amount,
        clientSecret,
      });
      console.log(response);
      if (response.error) {
        setPayment({ status: "error" });
        setErrorMessage(response.error.message ?? "An unknown error occurred");
      } else if (response.status === "requires_action") {
        // Use Stripe.js to handle the required next action
        const { error } = await stripe.handleNextAction({
          clientSecret: response.clientSecret,
        });

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
      <PaymentStatus status={payment.status} />
      <PrintObject content={payment} />
    </>
  );
};

export default ElementsForm;
