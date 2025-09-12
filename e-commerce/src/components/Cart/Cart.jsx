import React from 'react';
import './Cart.css';

const Cart = ({ cart, removeFromCart, calculateTotal, onCheckoutClick, onBackToHome, showToast }) => {
  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        removeFromCart(data.cart.items);
        showToast('Item removed from cart.', 'info');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Error removing item from cart.', 'error');
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-btn" onClick={onBackToHome}>
          &larr; Back to products
        </button>
        <h2 className="cart-title">Shopping Cart</h2>
      </div>

      <div className="cart-items-container">
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty.</p>
        ) : (
          cart.map(item => (
            <div key={item.product._id} className="cart-item">
              <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
              <div className="cart-item-info">
                <p className="cart-item-name">{item.product.name}</p>
                <p className="cart-item-price">${item.product.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <div className="cart-item-actions">
                <button className="remove-btn" onClick={() => handleRemoveItem(item.product._id)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-summary">
        <span className="cart-total-label">Total:</span>
        <span className="cart-total-value">${calculateTotal()}</span>
      </div>
      <button className="checkout-btn" onClick={onCheckoutClick}>Checkout</button>
    </div>
  );
};

export default Cart;
