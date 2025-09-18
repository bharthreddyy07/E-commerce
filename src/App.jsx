import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar/navbar';
import ProductList from './components/Products/ProductListt';
import ProductDetails from './components/Productcard/productdetails';
import Cart from './components/Cart/Cart';
import './components/styles.css';
import './components/Productcard/Productcard.css';
import './components/Cart/Cart.css';
import './components/Productcard/ProductDetails.css';
import './components/navbar/navbar.css';

import CheckoutForm from './components/Checkout/Checkout';
import './components/Checkout/Checkout.css';
import AuthPage from './components/AuthPage';
import './components/AuthPage.css';
import {jwtDecode} from 'jwt-decode';
import Toast from './components/Toast';
import './components/Toast.css';
import OrderHistory from './components/Orderhistory/OrderHistory';
import './components/Orderhistory/OrderHistory.css';
import AdminPanel from './components/Admin/AdminPanel';
import './components/Admin/AdminPanel.css';

function App() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState("home");
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/cart', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCart(data.items);
        } else {
          console.error('Failed to fetch cart:', await response.text());
        }
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Network error fetching cart:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken) {
          setUser(decodedToken.user);
          fetchCart();
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: '', type: '' });
  };

  const addToCart = (items) => {
    setCart(items);
  };

  const removeFromCart = (items) => {
    setCart(items);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2);
  };

  const totalItems = cart.reduce((count, item) => count + item.quantity, 0);

  const handleProductSelection = (product) => {
    setSelectedProduct(product);
  };

  const handleGoBack = () => {
    setSelectedProduct(null);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedProduct(null);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSelectedProduct(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setSelectedCategory('All');
  };

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUser(decodedToken.user);
      fetchCart();
      setCurrentPage('home');
    }
    showToast('Login successful!', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
    setCurrentPage('home');
    showToast('You have been logged out.', 'info');
  };

  const handleCheckoutSuccess = () => {
    setCart([]);
    handleNavigation('home');
    showToast('Checkout successful! Your order has been placed.', 'success');
  };

  return (
    <div className="main-container">
      <Navbar
        cartCount={totalItems}
        onCartClick={() => handleNavigation('cart')}
        onHomeClick={() => handleNavigation('home')}
        onSearch={handleSearch}
        onLoginClick={() => handleNavigation('auth')}
        onOrderHistoryClick={() => handleNavigation('orders')}
        onAdminClick={() => handleNavigation('admin')}
        user={user}
        onLogout={handleLogout}
      />
      <main className="page-content">
        {currentPage === "home" && (
          <>
            <div className="category-filter">
              <button
                onClick={() => handleCategoryChange("All")}
                className={`category-btn ${selectedCategory === "All" ? "active" : ""}`}
              >
                All
              </button>
              <button
                onClick={() => handleCategoryChange("Electronics")}
                className={`category-btn ${selectedCategory === "Electronics" ? "active" : ""}`}
              >
                Electronics
              </button>
              <button
                onClick={() => handleCategoryChange("Home Goods")}
                className={`category-btn ${selectedCategory === "Home Goods" ? "active" : ""}`}
              >
                Home Goods
              </button>
              <button
                onClick={() => handleCategoryChange("Apparel")}
                className={`category-btn ${selectedCategory === "Apparel" ? "active" : ""}`}
              >
                Apparel
              </button>
            </div>
            {selectedProduct ? (
              <ProductDetails
                product={selectedProduct}
                onGoBack={handleGoBack}
                addToCart={addToCart}
                user={user}
                showToast={showToast}
              />
            ) : (
              <ProductList
                addToCart={addToCart}
                onSelectProduct={handleProductSelection}
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
                user={user}
                showToast={showToast}
              />
            )}
          </>
        )}

        {currentPage === "cart" && (
          <Cart
            cart={cart}
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
            onCheckoutClick={() => handleNavigation('checkout')}
            onBackToHome={() => handleNavigation('home')}
            showToast={showToast}
          />
        )}

        {currentPage === "checkout" && (
          <CheckoutForm
            cart={cart}
            calculateTotal={calculateTotal}
            onBackToCart={() => handleNavigation('cart')}
            onCheckoutSuccess={handleCheckoutSuccess}
            showToast={showToast}
          />
        )}

        {currentPage === "auth" && (
          <AuthPage onBackToHome={() => handleNavigation('home')} onLoginSuccess={handleLoginSuccess} />
        )}

        {currentPage === "orders" && (
          <OrderHistory user={user} onBackToHome={() => handleNavigation('home')} showToast={showToast} />
        )}

        {currentPage === "admin" && (
          <AdminPanel user={user} onBackToHome={() => handleNavigation('home')} showToast={showToast} />
        )}
      </main>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}

export default App;