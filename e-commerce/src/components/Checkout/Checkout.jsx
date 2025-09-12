import React, { useState } from 'react';
import './Checkout.css';

const CheckoutForm = ({ cart, calculateTotal, onBackToCart }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.zip) {
      alert('Please fill out all fields.');
      return;
    }
    // Simple alert for now, we'll connect this to the backend later
    const orderDetails = {
      ...formData,
      items: cart,
      total: calculateTotal(),
    };
    alert('Order placed successfully! Check the console for order details.');
    console.log('Order Details:', orderDetails);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-btn" onClick={onBackToCart}>
          &larr; Back to cart
        </button>
        <h2 className="checkout-title">Checkout</h2>
      </div>

      <div className="checkout-summary">
        <h3>Order Summary</h3>
        {cart.map(item => (
          <div key={item._id} className="summary-item">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="summary-total">
          <span>Total:</span>
          <span>${calculateTotal()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <h3>Shipping Information</h3>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="zip">Zip Code</label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="place-order-btn">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;
