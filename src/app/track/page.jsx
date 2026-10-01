'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, RefreshCw, Copy, Check, Mail, ExternalLink, Package, ShieldCheck, Truck, Sparkles } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('orderId') || searchParams.get('query') || searchParams.get('code') || searchParams.get('email') || '';

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState('');

  const handleTrackSearch = async (searchQuery) => {
    const q = searchQuery || queryInput;
    if (!q || !q.trim()) {
      setErrorMsg('Please enter an Order ID or Email address.');
      setOrder(null);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setEmailStatusMsg('');

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(q.trim())}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setErrorMsg(data.error || 'No matching order found. Please check your Order ID or Email.');
      }
    } catch (err) {
      setErrorMsg('Network error fetching order tracking information.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleTrackSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleCopyCode = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleResendEmail = async () => {
    if (!order) return;
    setResendingEmail(true);
    setEmailStatusMsg('');

    try {
      const res = await fetch('/api/orders/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          email: order.purchaserEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEmailStatusMsg(data.message || `Confirmation email sent to ${order.purchaserEmail}!`);
      } else {
        setEmailStatusMsg('Error: ' + (data.error || 'Failed to resend email.'));
      }
    } catch (err) {
      setEmailStatusMsg('Network error resending email.');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="track-page">
      <div className="track-container">
        {/* Header */}
        <header className="track-header">
          <span className="track-kicker">LIFECYCLE & FULFILLMENT</span>
          <h1 className="track-title">track your order</h1>
          <p className="track-subtitle">
            Enter your Order ID (e.g. <code>ORD-123456</code>) or email address to view live handcrafting status and 12-character digital access keys.
          </p>

          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrackSearch();
            }}
            className="search-form"
          >
            <div className="search-input-wrap">
              <Search size={18} color="#888" className="search-icon" />
              <input
                type="text"
                placeholder="Enter Order ID (ORD-XXXXXX) or Email..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" disabled={loading} className="search-btn">
              {loading ? (
                <>
                  <RefreshCw size={14} className="spin" /> Searching...
                </>
              ) : (
                'Lookup Order'
              )}
            </button>
          </form>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}
        </header>

        {/* Order Results View */}
        {order && (
          <main className="order-details-card">
            {/* Top Order Overview Banner */}
            <div className="overview-header">
              <div>
                <div className="order-id-label">ORDER NUMBER</div>
                <div className="order-id-value">#{order.id}</div>
                <div className="order-date-text">
                  Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recent'}
                </div>
              </div>

              <div className="overview-right">
                <div className="status-badge-wrap">
                  <span
                    className="status-pill"
                    style={{
                      borderColor:
                        order.status === 'ready' || order.status === 'delivered'
                          ? '#66BB6A'
                          : order.status === 'in_production'
                          ? '#C5A059'
                          : '#888888',
                      color:
                        order.status === 'ready' || order.status === 'delivered'
                          ? '#66BB6A'
                          : order.status === 'in_production'
                          ? '#C5A059'
                          : '#888888',
                    }}
                  >
                    STATUS: {order.status.toUpperCase().replace('_', ' ')}
                  </span>
                </div>
                <div className="total-paid-text">
                  Total Paid: <strong>₦{Number(order.totalAmount).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* 12-Character Access Key Spotlight Card */}
            <section className="access-code-card">
              <div className="code-card-header">
                <div>
                  <span className="code-tag">DIGITAL ACCESS KEY</span>
                  <h3 className="code-heading">12-Character Gift Experience Code</h3>
                </div>
                <span className="code-note">No account or password needed</span>
              </div>

              <div className="code-display-box">
                <div className="code-text">{order.accessCode}</div>
                <div className="code-actions">
                  <button
                    onClick={() => handleCopyCode(order.accessCode)}
                    className="copy-btn"
                  >
                    {copiedCode ? <Check size={14} color="#66BB6A" /> : <Copy size={14} />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Key'}</span>
                  </button>
                  <Link
                    href={`/portal?code=${encodeURIComponent(order.accessCode)}`}
                    className="launch-portal-btn"
                    target="_blank"
                  >
                    <ExternalLink size={14} /> Launch 3D Portal
                  </Link>
                </div>
              </div>

              {/* Resend Email CTA */}
              <div className="resend-email-row">
                <div className="resend-text">
                  Purchaser Email: <strong>{order.purchaserEmail}</strong>
                </div>
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="resend-btn"
                >
                  {resendingEmail ? (
                    <>
                      <RefreshCw size={13} className="spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Mail size={13} /> Resend Access Email
                    </>
                  )}
                </button>
              </div>

              {emailStatusMsg && <div className="email-status-toast">{emailStatusMsg}</div>}
            </section>

            {/* Live Fulfillment Timeline */}
            <section className="timeline-section">
              <h3 className="section-title">Live Fulfillment Progress</h3>

              <div className="timeline-grid">
                {order.timeline && order.timeline.map((step, idx) => (
                  <div
                    key={idx}
                    className={`timeline-step ${step.completed ? 'completed' : step.active ? 'active' : 'pending'}`}
                  >
                    <div className="step-indicator">
                      <div className="step-icon">
                        {step.completed ? (
                          <Check size={14} color="#000" />
                        ) : step.active ? (
                          <Sparkles size={14} color="#C5A059" />
                        ) : (
                          <span className="step-num">{idx + 1}</span>
                        )}
                      </div>
                      {idx < order.timeline.length - 1 && <div className="step-connector" />}
                    </div>

                    <div className="step-details">
                      <div className="step-title">{step.title}</div>
                      <div className="step-desc">{step.desc}</div>
                      <div className="step-date">{step.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Items & Shipping Info Grid */}
            <section className="order-info-grid">
              {/* Items List */}
              <div className="info-block">
                <h4 className="block-title">Items in Order</h4>
                <div className="items-list">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, i) => (
                      <div key={i} className="item-row">
                        <div>
                          <div className="item-title">{item.title || 'Custom Keepsake Card'}</div>
                          <div className="item-qty">Quantity: {item.quantity || 1}</div>
                        </div>
                        <div className="item-price">₦{(item.price * (item.quantity || 1)).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="item-row">
                      <div>
                        <div className="item-title">Handcrafted Keepsake Card & 3D Experience</div>
                        <div className="item-qty">Quantity: 1</div>
                      </div>
                      <div className="item-price">₦{Number(order.totalAmount).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="info-block">
                <h4 className="block-title">Fulfillment & Shipping Details</h4>
                <div className="details-stack">
                  <div className="detail-row">
                    <span className="detail-label">Fulfillment Mode:</span>
                    <span className="detail-val">
                      {order.fulfillmentType === 'physical_card' ? 'Handcrafted Physical Card + 3D Portal' : 'Digital 3D Portal Only'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Purchaser:</span>
                    <span className="detail-val">{order.purchaserName} ({order.purchaserEmail})</span>
                  </div>
                  {order.recipientName && (
                    <div className="detail-row">
                      <span className="detail-label">Recipient:</span>
                      <span className="detail-val">{order.recipientName}</span>
                    </div>
                  )}
                  {order.shippingAddress && order.shippingAddress.addressLine1 && (
                    <div className="detail-row">
                      <span className="detail-label">Shipping Address:</span>
                      <span className="detail-val">
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.organizationName ? ` (${order.shippingAddress.organizationName})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </main>
        )}
      </div>

      <style jsx>{`
        .track-page {
          background-color: #111111;
          color: #E5E5E5;
          min-height: 100vh;
          padding: 3rem 0 6rem 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .track-container {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .track-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .track-kicker {
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          color: #C5A059;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.5rem;
        }

        .track-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 0 0 1rem 0;
        }

        .track-subtitle {
          font-size: 0.9rem;
          color: #999999;
          max-width: 600px;
          margin: 0 auto 2.5rem auto;
          line-height: 1.6;
        }

        .track-subtitle code {
          background-color: #1A1A1A;
          color: #C5A059;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .search-form {
          display: flex;
          gap: 0.75rem;
          max-width: 580px;
          margin: 0 auto;
        }

        .search-input-wrap {
          position: relative;
          flex: 1;
        }

        .search-input-wrap :global(.search-icon) {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3.2rem;
          background-color: #181818;
          border: 1px solid #333333;
          color: #FFFFFF;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          border-color: #C5A059;
        }

        .search-btn {
          padding: 1rem 2rem;
          background-color: #C5A059;
          color: #000000;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: opacity 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .search-btn:hover {
          opacity: 0.9;
        }

        .error-alert {
          margin-top: 1.5rem;
          padding: 1rem 1.5rem;
          background-color: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #FF6B6B;
          font-size: 0.85rem;
          max-width: 580px;
          margin-left: auto;
          margin-right: auto;
        }

        .order-details-card {
          background-color: #161616;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .order-id-label {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          color: #888888;
        }

        .order-id-value {
          font-size: 2rem;
          font-family: monospace;
          color: #FFFFFF;
          font-weight: 300;
          margin: 4px 0;
        }

        .order-date-text {
          font-size: 0.8rem;
          color: #777777;
        }

        .overview-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .status-pill {
          display: inline-block;
          padding: 0.4rem 1rem;
          border: 1px solid;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .total-paid-text {
          font-size: 0.85rem;
          color: #AAAAAA;
        }

        .access-code-card {
          background-color: #0F0F0F;
          border: 1px solid #C5A059;
          padding: 2rem;
        }

        .code-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .code-tag {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: #C5A059;
          display: block;
        }

        .code-heading {
          font-size: 1.25rem;
          font-weight: 300;
          color: #FFFFFF;
          margin: 4px 0 0 0;
        }

        .code-note {
          font-size: 0.75rem;
          color: #888888;
        }

        .code-display-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #1A1A1A;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.25rem 1.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .code-text {
          font-family: monospace;
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 0.2em;
          color: #FFFFFF;
        }

        .code-actions {
          display: flex;
          gap: 0.75rem;
        }

        .copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.65rem 1.2rem;
          background-color: transparent;
          border: 1px solid #444444;
          color: #FFFFFF;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .copy-btn:hover {
          border-color: #FFFFFF;
        }

        .launch-portal-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.65rem 1.4rem;
          background-color: #FFFFFF;
          color: #000000;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }

        .launch-portal-btn:hover {
          opacity: 0.9;
        }

        .resend-email-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .resend-text {
          font-size: 0.8rem;
          color: #AAAAAA;
        }

        .resend-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          background-color: transparent;
          border: 1px solid #333333;
          color: #C5A059;
          font-size: 0.78rem;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .resend-btn:hover {
          border-color: #C5A059;
        }

        .email-status-toast {
          margin-top: 1rem;
          font-size: 0.8rem;
          color: #66BB6A;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 300;
          letter-spacing: 0.05em;
          color: #FFFFFF;
          margin: 0 0 1.5rem 0;
        }

        .timeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .step-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #222222;
          border: 1px solid #444444;
          font-size: 0.75rem;
        }

        .timeline-step.completed .step-icon {
          background-color: #C5A059;
          border-color: #C5A059;
        }

        .timeline-step.active .step-icon {
          border-color: #C5A059;
          box-shadow: 0 0 12px rgba(197, 160, 89, 0.4);
        }

        .step-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: #FFFFFF;
        }

        .timeline-step.pending .step-title {
          color: #777777;
        }

        .step-desc {
          font-size: 0.75rem;
          color: #888888;
          line-height: 1.4;
        }

        .step-date {
          font-size: 0.7rem;
          color: #C5A059;
          font-weight: 500;
        }

        .order-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .block-title {
          font-size: 0.95rem;
          font-weight: 400;
          letter-spacing: 0.05em;
          color: #FFFFFF;
          margin: 0 0 1rem 0;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #111111;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .item-title {
          font-size: 0.85rem;
          color: #E5E5E5;
        }

        .item-qty {
          font-size: 0.75rem;
          color: #777777;
        }

        .item-price {
          font-size: 0.85rem;
          color: #FFFFFF;
        }

        .details-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.8rem;
        }

        .detail-label {
          color: #777777;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
        }

        .detail-val {
          color: #DDDDDD;
        }

        @media (max-width: 768px) {
          .search-form {
            flex-direction: column;
          }
          .overview-header {
            flex-direction: column;
          }
          .overview-right {
            align-items: flex-start;
          }
          .order-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center', color: '#888' }}>Loading order tracking...</div>}>
      <TrackContent />
    </Suspense>
  );
}
