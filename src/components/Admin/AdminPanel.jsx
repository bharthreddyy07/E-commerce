import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = ({ onBackToHome, user, showToast }) => {
  // Function to determine the correct backend URL dynamically
  const getBackendUrl = () => {
    // Check if the app is running locally (Vite default is usually development mode)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // Otherwise, use the deployed Vercel URL
    return 'https://ecommerce-backend07.vercel.app';
  };
  
  const BACKEND_URL = getBackendUrl();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('products'); // 'products' or 'orders'
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // --- Utility Functions ---

  const getToken = () => localStorage.getItem('token');

  // --- Product Management Logic ---

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // API call updated
      const response = await fetch(`${BACKEND_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      showToast('Authentication required.', 'error');
      return;
    }

    try {
      // API URL construction updated
      const url = isEditing ? `${BACKEND_URL}/api/admin/products/${currentProductId}` : `${BACKEND_URL}/api/admin/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price) })
      });

      if (response.ok) {
        showToast(`Product ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
        setFormData({ name: '', description: '', price: '', image: '', category: '' });
        setIsEditing(false);
        setCurrentProductId(null);
        fetchProducts();
      } else {
        const errorData = await response.json();
        showToast(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} product.`, 'error');
      }
    } catch (err) {
      showToast(`Network error. Failed to ${isEditing ? 'update' : 'add'} product.`, 'error');
      console.error(err);
    }
  };

  const handleEdit = (product) => {
    setCurrentView('products');
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
    });
    setIsEditing(true);
    setCurrentProductId(product._id);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const token = getToken();
      try {
        // API URL updated
        const response = await fetch(`${BACKEND_URL}/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showToast('Product deleted successfully!', 'success');
          fetchProducts();
        } else {
          const errorData = await response.json();
          showToast(errorData.message || 'Failed to delete product.', 'error');
        }
      } catch (err) {
        showToast('Network error. Failed to delete product.', 'error');
        console.error(err);
      }
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', description: '', price: '', image: '', category: '' });
    setIsEditing(false);
    setCurrentProductId(null);
  };

  // --- Order Management Logic ---

  const fetchOrders = async () => {
    setLoading(true);
    const token = getToken();
    try {
      // API URL updated
      const response = await fetch(`${BACKEND_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        showToast('Failed to fetch orders. Check console for details.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const token = getToken();
    try {
      // API URL updated
      const response = await fetch(`${BACKEND_URL}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        showToast(`Order ${orderId.substring(0, 8)} status updated to ${newStatus}.`, 'success');
        fetchOrders(); // Refresh the order list
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      showToast('Network error updating order status.', 'error');
      console.error(err);
    }
  };

  // --- Effects ---

  useEffect(() => {
    // Only fetch data if the user is an admin
    if (user && user.email === 'admin@example.com') {
      if (currentView === 'products') {
        fetchProducts();
      } else if (currentView === 'orders') {
        fetchOrders();
      }
    }
  }, [currentView, user]);

  // --- Conditional Rendering for Access ---

  if (!user || user.email !== 'admin@example.com') {
    return (
      <div className="admin-access-denied">
        <button className="back-btn" onClick={onBackToHome}>
          &larr; Back to home
        </button>
        <p>Access Denied. Only the admin can view this page.</p>
        <p>Please log in with email: `admin@example.com` and password: `password123`.</p>
      </div>
    );
  }

  // --- Render Product Management View ---

  const renderProductManagement = () => (
    <div className="admin-content">
      <div className="product-form-card">
        <h3 className="form-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleProductSubmit} className="product-form">
          <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleProductChange} required />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleProductChange} required />
          <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleProductChange} required />
          <input type="text" name="image" placeholder="Image URL" value={formData.image} onChange={handleProductChange} required />
          <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleProductChange} required />
          <div className="form-actions">
            <button type="submit" className="submit-btn">{isEditing ? 'Update Product' : 'Add Product'}</button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="product-table-card">
        <h3 className="table-title">Current Products</h3>
        {loading ? (
          <div className="loading-message">Loading products...</div>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td><img src={product.image} alt={product.name} className="table-image" /></td>
                  <td>{product.name}</td>
                  <td>₹{product.price.toFixed(2)}</td>
                  <td className="table-actions">
                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // --- Render Order Management View ---

  const renderOrderManagement = () => (
    <div className="admin-content-full">
      <div className="orders-table-card">
        <h3 className="table-title">All Customer Orders ({orders.length})</h3>
        {loading ? (
          <div className="loading-message">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-message">No orders have been placed yet.</div>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Total</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id.substring(0, 8)}...</td>
                  <td>{order.shippingAddress.email}</td>
                  <td>₹{order.totalAmount.toFixed(2)}</td>
                  <td className="order-items-cell">
                    {order.items.map(item => (
                      <span key={item._id} className="item-tag">
                        {item.product?.name || 'Deleted Product'} ({item.quantity})
                      </span>
                    ))}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className={`status-select status-${order.status.toLowerCase()}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // --- Main Render ---

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <button className="back-btn" onClick={onBackToHome}>
          &larr; Back
        </button>
        <h2 className="admin-title">Admin Dashboard</h2>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${currentView === 'products' ? 'active' : ''}`}
          onClick={() => setCurrentView('products')}
        >
          Product Management
        </button>
        <button
          className={`tab-btn ${currentView === 'orders' ? 'active' : ''}`}
          onClick={() => setCurrentView('orders')}
        >
          Order Management
        </button>
      </div>

      {currentView === 'products' && renderProductManagement()}
      {currentView === 'orders' && renderOrderManagement()}
    </div>
  );
};

export default AdminPanel;
