import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

export default Toast;
