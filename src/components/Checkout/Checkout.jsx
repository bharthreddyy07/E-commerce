import React, { useState } from 'react';
import './Checkout.css';

const CheckoutForm = ({ cart, calculateTotal, onBackToCart, onCheckoutSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ecommerce-backend07.vercel.app/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress: formData })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Checkout successful! Your order has been placed.', 'success');
        onCheckoutSuccess();
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      showToast('Error during checkout.', 'error');
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="checkout-container">
      <button className="back-btn" onClick={onBackToCart}>
        &larr; Back to cart
      </button>
      <div className="checkout-summary-card">
        <h3 className="summary-title">Order Summary</h3>
        <ul className="summary-list">
          {cart.map(item => (
            <li key={item.product._id}>
              {item.product.name} x {item.quantity} - ₹{item.product.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <div className="summary-total">
          <span className="total-label">Total:</span>
          <span className="total-value">₹{calculateTotal()}</span>
        </div>
      </div>

      <div className="checkout-form">
        <h2 className="form-title">Shipping Information</h2>
        <form onSubmit={handleSubmit} className="shipping-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
          <input type="text" name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} required />
          <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
          <button type="submit" className="place-order-btn">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutForm;
