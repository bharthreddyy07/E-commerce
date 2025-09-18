import React, { useState, useEffect } from 'react';
import './OrderHistory.css';

const OrderHistory = ({ user, onBackToHome, showToast }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        showToast('Please log in to view your order history.', 'error');
        return;
      }
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          showToast('Failed to fetch orders.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Network error fetching orders.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, showToast]);

  if (loading) {
    return <div className="loading-message">Loading order history...</div>;
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <button className="back-btn" onClick={onBackToHome}>
          &larr; Back
        </button>
        <h2 className="order-history-title">My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <p className="empty-message">You have no past orders.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-summary">
                <span className="order-id">Order ID: {order._id.substring(0, 8)}...</span>
                <span className="order-date">Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="order-total">Total: ₹{order.totalAmount.toFixed(2)}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <ul className="order-items">
                {order.items.map(item => (
                  <li key={item._id} className="order-item">
                    <img src={item.product.image} alt={item.product.name} className="order-item-image" />
                    <div className="order-item-details">
                      <span className="order-item-name">{item.product.name}</span>
                      <span className="order-item-price">₹{item.product.price.toFixed(2)} x {item.quantity}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
