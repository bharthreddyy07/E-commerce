import React from 'react';
import './Productcard.css';

const ProductCard = ({ product, addToCart, onSelectProduct, user, showToast }) => {
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (user) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product._id, quantity: 1 })
        });
        const data = await response.json();
        if (response.ok) {
          addToCart(data.cart.items);
          showToast('Item added to cart!', 'success');
        } else {
          showToast(data.message, 'error');
        }
      } catch (error) {
        showToast('Error adding item to cart.', 'error');
      }
    } else {
      showToast('Please log in to add items to the cart.', 'error');
    }
  };

  return (
    <div className="product-card" onClick={() => onSelectProduct(product)}>
      <img
        src={product.image}
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
