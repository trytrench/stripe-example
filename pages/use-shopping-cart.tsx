import { NextPage } from "next";
import Layout from "../components/Layout";

import { useState } from "react";
import Cart from "../components/Cart";
import CartCheckout from "../components/CartCheckout";
import CartSummary from "../components/CartSummary";
import Products from "../components/Products";

const CartPage: NextPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);

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
          <CartSummary onCheckout={() => setShowCheckout(true)} />
          {showCheckout ? <CartCheckout /> : <Products />}
        </Cart>
      </div>
    </Layout>
  );
};

export default CartPage;
