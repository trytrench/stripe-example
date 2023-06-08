import { NextApiRequest, NextApiResponse } from "next";

import { CURRENCY, MIN_AMOUNT, MAX_AMOUNT } from "../../../config";
import { formatAmountForStripe } from "../../../utils/stripe-helpers";
import * as config from "../../../config";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }
  const {
    amount,
    paymentMethodId,
  }: { amount: number; paymentMethodId: string } = req.body;

  // Validate the amount that was passed from the client.
  if (!(amount >= MIN_AMOUNT && amount <= MAX_AMOUNT)) {
    res.status(500).json({ statusCode: 400, message: "Invalid amount." });
    return;
  }

  try {
    const intent = await stripe.paymentIntents.create({
      confirm: true,
      amount: formatAmountForStripe(amount, config.CURRENCY),
      currency: config.CURRENCY,
      automatic_payment_methods: { enabled: true },
      payment_method: paymentMethodId,
      return_url: "http://localhost:3000/donate-with-elements",
      use_stripe_sdk: true,
      mandate_data: {
        customer_acceptance: {
          type: "online",
          online: {
            ip_address: req.headers["x-forwarded-for"] as string,
            user_agent: req.headers["user-agent"] as string,
          },
        },
      },
    });
    res.status(200).json({
      clientSecret: intent.client_secret,
      status: intent.status,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      error: err,
    });
  }
}
