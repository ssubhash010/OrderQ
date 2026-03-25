import React from 'react';
import './OrderSuccess.css';

export default function OrderSuccess({ order, onNavigate }) {
  if (!order) return null;

  return (
    <div className="success-container">
      <div className="success-card">
        {/* Success Icon */}
        <div className="icon-wrapper">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <h1 className="success-title">Order Confirmed!</h1>
        <p className="success-subtitle">Show this token at the counter</p>

        {/* Token Section */}
        <div className="token-box">
          <span className="token-label">YOUR TOKEN</span>
          <div className="token-number">#{order.token_number}</div>
        </div>

        {/* Details Section */}
        <div className="details-list">
          <div className="detail-item">
            <span>Canteen</span>
            <strong>{order.canteen_id?.replace('_', ' ').toUpperCase()}</strong>
          </div>
          <div className="detail-item">
            <span>Slot</span>
            <strong>{order.pickup_slot}</strong>
          </div>
          <div className="detail-item">
            <span>Amount</span>
            <strong>₹{order.total_amount}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button className="btn-primary" onClick={() => onNavigate('my-orders')}>
            Track Order
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('home')}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}