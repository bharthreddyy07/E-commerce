import React, { useState } from 'react';
import './Register.css';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`https://ecommerce-backend07.vercel.app/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setFormData({ email: '', password: '' });
        // After registration, automatically switch to login form
        onSwitchToLogin();
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Register</h2>
      
      {message && <p className={`auth-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="auth-btn">
          Register
        </button>
      </form>
      
      <p className="auth-switch">
        Already have an account?{' '}
        <span className="switch-link" onClick={onSwitchToLogin}>
          Log In
        </span>
      </p>
    </div>
  );
};

export default Register;
