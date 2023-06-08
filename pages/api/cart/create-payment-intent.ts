import { NextApiRequest, NextApiResponse } from "next";
import { validateCartItems } from "use-shopping-cart/utilities";
import * as config from "../../../config";

/*
 * Product data can be loaded from anywhere. In this case, we’re loading it from
 * a local JSON file, but this could also come from an async call to your
 * inventory management service, a database query, or some other API call.
 *
 * The important thing is that the product info is loaded from somewhere trusted
 * so you know the pricing information is accurate.
 */
import inventory from "../../../data/products";

import Stripe from "stripe";
import { formatAmountForStripe } from "../../../utils/stripe-helpers";
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

  try {
    // Validate the cart details that were sent from the client.
    const lineItems = validateCartItems(inventory, req.body);

    const intent = await stripe.paymentIntents.create({
      // confirm: true,
      amount: formatAmountForStripe(
        lineItems.reduce((total, lineItem) => {
          return total + lineItem.price_data.unit_amount * lineItem.quantity;
        }, 0) / 100,
        config.CURRENCY
      ),
      currency: config.CURRENCY,
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: intent.client_secret,
      amount: intent.amount,
      status: intent.status,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      error: err,
    });
  }
}
