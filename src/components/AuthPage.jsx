import React, { useState } from 'react';
import Login from './Login/Login';
import Register from './Register/Register';                                     
import './AuthPage.css';

const AuthPage = ({ onBackToHome, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToRegister = () => setIsLogin(false);
  const handleSwitchToLogin = () => setIsLogin(true);

  return (
    <div className="auth-container">
      <div className="auth-header">
        <button className="back-btn" onClick={onBackToHome}>
          &larr; Back
        </button>
      </div>
      {isLogin ? (
        <Login onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={onLoginSuccess} />
      ) : (
        <Register onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
};

export default AuthPage;
