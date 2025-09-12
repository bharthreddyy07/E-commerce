import React, { useState } from 'react';
import './navbar.css';

const Navbar = ({ cartCount, onCartClick, onHomeClick, onSearch, onLoginClick, user, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button className="brand-button" onClick={onHomeClick}>
          <span className="brand-name">My Store</span>
        </button>
      </div>
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search for products..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="navbar-actions">
        <button className="navbar-button" onClick={onCartClick}>
          <span role="img" aria-label="cart">🛒</span>
          <span className="cart-count">{cartCount}</span>
        </button>
        {user ? (
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button className="navbar-button logout-btn" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <button className="navbar-button login-btn" onClick={onLoginClick}>Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
