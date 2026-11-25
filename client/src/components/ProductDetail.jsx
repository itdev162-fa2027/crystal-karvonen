import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import "./ProductDetail.css";

function ProductDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError("Failed to load product. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.currentStock > 0) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000); // Hide message after 2 seconds
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  const displayPrice = product.isOnSale ? product.salePrice : product.price;
  const hasDiscount = product.isOnSale && product.salePrice < product.price;
  const isOutOfStock = product.currentStock === 0;

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate("/")} className="back-button">
        {"\u2190"} Back to Products
      </button>

      <div className="product-detail">
        <div className="product-detail-image">
          <img
            src={
              product.imageUrl ||
              "https://placehold.co/600x400/e0e0e0/666?text=No+Image"
            }
            alt={product.name}
          />
          {hasDiscount && <span className="sale-badge-large">SALE</span>}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>

          <div className="product-detail-pricing">
            {hasDiscount && (
              <span className="original-price-large">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="current-price-large">
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          <div className="product-detail-stock">
            {product.currentStock > 0 ? (
              <span className="in-stock-large">
                {"\u2713"} In Stock ({product.currentStock} available)
              </span>
            ) : (
              <span className="out-of-stock-large">{"\u2717"} Out of Stock</span>
            )}
          </div>

          <div className="product-detail-description">
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>

          {/* Add to Cart Section */}
          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isOutOfStock}
              />
            </div>

            <button
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>

            {addedToCart && (
              <div className="added-to-cart-message">{"\u2713"} Added to cart!</div>
            )}
          </div>

          <div className="product-detail-meta">
            <p>
              <strong>Product ID:</strong> {product.id}
            </p>
            <p>
              <strong>Added:</strong>{" "}
              {new Date(product.createdDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {new Date(product.lastUpdatedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
