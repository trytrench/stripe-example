import products from "../data/products";
import { formatCurrencyString } from "use-shopping-cart";
import { useShoppingCart } from "use-shopping-cart";

const Products = () => {
  const { addItem, removeItem, cartDetails } = useShoppingCart();

  return (
    <section className="products">
      {products.map((product) => (
        <div key={product.id} className="product">
          <img src={product.image} alt={product.name} />
          <h2>
            {product.name} x {cartDetails?.[product.id]?.quantity || 0}
          </h2>
          <p className="price">
            {formatCurrencyString({
              value: product.price,
              currency: product.currency,
            })}
          </p>
          <button
            className="cart-style-background"
            onClick={() => {
              console.log(product);
              addItem(product);
            }}
          >
            Add to cart
          </button>
          <button
            className="cart-style-background"
            onClick={() => removeItem(product.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </section>
  );
};

export default Products;
