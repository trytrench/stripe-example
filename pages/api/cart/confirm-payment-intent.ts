import { NextApiRequest, NextApiResponse } from "next";

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
    paymentMethodId,
    clientSecret,
  }: { paymentMethodId: string; clientSecret: string } = req.body;

  if (!paymentMethodId || !clientSecret) {
    res.status(400).json({ statusCode: 400, message: "Invalid request." });
    return;
  }

  try {
    const paymentIntentId = clientSecret.split("_secret_")[0];

    const intent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: "http://localhost:3000/use-shopping-cart",
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
