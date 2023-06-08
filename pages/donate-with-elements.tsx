import { Elements } from "@stripe/react-stripe-js";
import { NextPage } from "next";
import { useState } from "react";
import CustomDonationInput from "../components/CustomDonationInput";
import ElementsForm from "../components/ElementsForm";
import Layout from "../components/Layout";
import * as config from "../config";
import getStripe from "../utils/get-stripejs";

const DonatePage: NextPage = () => {
  const [customDonation, setCustomDonation] = useState(
    Math.round(config.MAX_AMOUNT / config.AMOUNT_STEP)
  );

  return (
    <Layout title="Donate with Elements | Next.js + TypeScript Example">
      <div className="page-container">
        <h1>Donate with Elements</h1>
        <p>Donate to our project 💖</p>
        <CustomDonationInput
          className="elements-style"
          name="customDonation"
          value={customDonation}
          min={config.MIN_AMOUNT}
          max={config.MAX_AMOUNT}
          step={config.AMOUNT_STEP}
          currency={config.CURRENCY}
          onChange={(e) => setCustomDonation(Number(e.target.value))}
        />
        <Elements
          stripe={getStripe()}
          options={{
            mode: "payment",
            amount: customDonation,
            currency: config.CURRENCY,
            paymentMethodCreation: "manual",
          }}
        >
          <ElementsForm
            amount={customDonation}
            confirmUrl="/api/donate/confirm-payment-intent"
          />
        </Elements>
      </div>
    </Layout>
  );
};

export default DonatePage;
