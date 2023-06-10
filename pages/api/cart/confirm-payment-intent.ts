import { StripeError } from "@stripe/stripe-js";
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

  const paymentIntentId = clientSecret.split("_secret")[0];

  // Assess payment
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TRENCH_API_URL}/payment/assess`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.TRENCH_API_KEY as string,
        },
        body: JSON.stringify({ paymentIntentId, paymentMethodId }),
      }
    );
    if (!response.ok) throw new Error("Something went wrong.");

    const data: { riskLevel: string; paymentAttemptId: string } =
      await response.json();

    // Attach the paymentAttemptId to the payment intent
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { paymentAttemptId: data.paymentAttemptId },
    });

    if (data.riskLevel === "VeryHigh") {
      res
        .status(400)
        .json({ statusCode: 400, message: "Your card was declined" });
      return;
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
    return;
  }

  try {
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
  } catch (error) {
    if (error.type === "StripeCardError") {
      res.status(400).json({ statusCode: 400, message: error.message });
    } else {
      res
        .status(500)
        .json({ statusCode: 500, message: "Something went wrong." });
    }
  }
}
