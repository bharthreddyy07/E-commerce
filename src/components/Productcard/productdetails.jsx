import React from 'react';
import './productdetails.css';

const ProductDetails = ({ product, onGoBack, addToCart }) => {
  if (!product) {
    return null; 
  }

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={onGoBack}>
        &larr; Back to products
      </button>
      <div className="details-card">
        <img src={product.image} alt={product.name} className="details-image" />
        <div className="details-info">
          <h1 className="details-name">{product.name}</h1>
          <p className="details-description">{product.description}</p>
          <div className="details-meta">
            <span className="details-price">₹{product.price.toFixed(2)}</span>
            <span className="details-category">Category: {product.category}</span>
          </div>
          <button className="details-add-to-cart-btn" onClick={() => addToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
