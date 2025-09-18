import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = ({ onBackToHome, user, showToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', image: '', category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Authentication required.', 'error');
      return;
    }

    try {
      const url = isEditing ? `http://localhost:5000/api/admin/products/${currentProductId}` : 'http://localhost:5000/api/admin/products';
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
        fetchProducts(); // Refresh the product list
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
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showToast('Product deleted successfully!', 'success');
          fetchProducts(); // Refresh the list
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

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <button className="back-btn" onClick={onBackToHome}>
          &larr; Back
        </button>
        <h2 className="admin-title">Product Management</h2>
      </div>

      <div className="admin-content">
        <div className="product-form-card">
          <h3 className="form-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
            <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
            <input type="text" name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} required />
            <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
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
    </div>
  );
};

export default AdminPanel;
