import React, { useState, useEffect } from 'react';
import ProductCard from '../Productcard/Productcard';
import './Productlistt.css'; 

const ProductList = ({ addToCart, onSelectProduct, selectedCategory, searchTerm, user, showToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `https://ecommerce-backend07.vercel.app/api/products`;
        if (selectedCategory !== "All") {
          url += `?category=${selectedCategory}`;
        }
        if (searchTerm) {
          url += `${selectedCategory !== "All" ? '&' : '?'}search=${searchTerm}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (e) {
        setError("Failed to fetch products. Please check the server connection.");
        console.error("Fetching products failed: ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  if (loading) {
    return <div className="loading-message">Loading products...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <h2 className="section-title">Featured Products</h2>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            addToCart={addToCart}
            onSelectProduct={onSelectProduct}
            user={user}
            showToast={showToast}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
