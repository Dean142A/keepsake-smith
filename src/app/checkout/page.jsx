'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { RefreshCw } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  // Form Fields matching exact Figma designs (Cart-4.png & Cart-2.png)
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Payment State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Promo Code State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponErrorMsg, setCouponErrorMsg] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Computed discount and final total
  const baseTotal = cart.length > 0 ? cartTotal : 8500;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayTotal = Math.max(0, baseTotal - discountAmount);

  // Handle promo code application
  const handleApplyCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setCouponSuccessMsg('');
    setCouponErrorMsg('');

    if (!couponCodeInput.trim()) {
      setCouponErrorMsg('Please enter a promo code.');
      return;
    }

    setValidatingCoupon(true);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          amount: baseTotal,
        }),
      });

      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
        });
        setCouponSuccessMsg(data.message || `Promo code ${data.code} applied!`);
        setCouponCodeInput('');
      } else {
        setCouponErrorMsg(data.message || 'Invalid or expired promo code.');
      }
    } catch (err) {
      setCouponErrorMsg('Network error validating promo code.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccessMsg('');
    setCouponErrorMsg('');
  };

  // Load Paystack Inline script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePaystackCheckout = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (cart.length === 0) {
      setErrorMessage('Your bag is currently empty.');
      return;
    }

    if (!email.trim() || !phoneNumber.trim()) {
      setErrorMessage('Please provide your email address and phone number.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const orderPayload = {
      purchaserName: email.split('@')[0] || 'Customer',
      purchaserEmail: email.trim(),
      purchaserPhone: phoneNumber.trim(),
      recipientType: 'gift',
      recipientName: email.split('@')[0] || 'Customer',
      recipientEmail: email.trim(),
      fulfillmentType: 'physical_card',
      shippingAddress: {
        addressLine1: addressLine1.trim(),
        organizationName: organizationName.trim(),
      },
      additionalInfo: additionalInfo.trim(),
      appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
      discountAmount: discountAmount,
      items: cart.map((i) => ({
        id: i.id,
        title: i.title || 'CUSTOM CARD',
        subtitle: i.subtitle || 'XL 1',
        price: i.price,
        quantity: i.quantity,
      })),
      totalAmount: finalPayTotal,
    };

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_894321908ab9741295c10';

    if (typeof window !== 'undefined' && window.PaystackPop) {
      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: email.trim(),
          amount: finalPayTotal * 100, // Amount in kobo
          currency: 'NGN',
          ref: `KPSK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          metadata: {
            custom_fields: [
              { display_name: "Customer Email", variable_name: "customer_email", value: email },
              { display_name: "Phone Number", variable_name: "phone_number", value: phoneNumber },
              { display_name: "Organization", variable_name: "organization", value: organizationName },
              { display_name: "Applied Coupon", variable_name: "coupon_code", value: appliedCoupon ? appliedCoupon.code : "None" },
            ],
          },
          onClose: () => {
            setSubmitting(false);
          },
          callback: (response) => {
            verifyAndRedirect(response.reference, orderPayload);
          },
        });
        handler.openIframe();
      } catch (err) {
        console.error('Paystack error:', err);
        verifyAndRedirect(`SIMULATED-${Date.now()}`, orderPayload);
      }
    } else {
      verifyAndRedirect(`SIMULATED-${Date.now()}`, orderPayload);
    }
  };

  const verifyAndRedirect = async (reference, orderPayload) => {
    try {
      const res = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          ...orderPayload,
        }),
      });
      const data = await res.json();
      if (data.success && data.accessCode) {
        if (clearCart) clearCart();
        router.push(`/thank-you?code=${encodeURIComponent(data.accessCode)}&orderId=${encodeURIComponent(data.order.id)}`);
      } else {
        setErrorMessage(data.error || 'Payment processing failed. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      setErrorMessage('Network error completing payment verification.');
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Header Navigation */}
        <header className="checkout-header">
          <h1 className="checkout-title">checkout</h1>
          <p className="checkout-subtext-top">
            this explains color systems and color usages so they are used the way to brand identity portrays
          </p>
        </header>

        <form onSubmit={handlePaystackCheckout} className="checkout-grid">
          {/* Left Column: Form Fields */}
          <div className="checkout-fields">
            <div className="form-group">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                required
                placeholder="Jane Forster"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+234 000 0000 000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label">Address Line 1</label>
              <input
                type="text"
                placeholder="No 1 webber street"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="field-input"
              />
            </div>

            <div className="form-group">
              <label className="field-label">Name of Organization</label>
              <input
                type="text"
                placeholder="e.g Google"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="field-input"
              />
            </div>

            <p className="field-subtext">
              this explains color systems and color usages so they are used the way to brand identity portrays
            </p>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="field-label">Additional Information</label>
              <textarea
                rows={4}
                placeholder="Let us know additional information you want to add"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="field-textarea"
              />
            </div>
          </div>

          {/* Right Column: Order Summary & Paystack Payment CTA */}
          <div className="checkout-summary">
            <div className="summary-items-list">
              {cart.length > 0 ? (
                cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="summary-item-row">
                    <div>
                      <div className="item-name">{(item.title || 'CUSTOM CARD').toUpperCase()}</div>
                      <div className="item-sub">XL {item.quantity}</div>
                    </div>
                    <div className="item-price">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="summary-item-row">
                  <div>
                    <div className="item-name">CUSTOM CARD</div>
                    <div className="item-sub">XL 1</div>
                  </div>
                  <div className="item-price">₦8,500</div>
                </div>
              )}

              {/* Promo Code Input & Discount Row */}
              <div className="promo-code-box">
                <div className="promo-input-row">
                  <input
                    type="text"
                    placeholder="PROMO CODE (e.g. KEEPSAKE10)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="promo-input"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="promo-apply-btn"
                  >
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>

                {couponSuccessMsg && <div className="promo-success">{couponSuccessMsg}</div>}
                {couponErrorMsg && <div className="promo-error">{couponErrorMsg}</div>}

                {appliedCoupon && (
                  <div className="applied-coupon-row">
                    <div>
                      <span className="coupon-tag-badge">CODE: {appliedCoupon.code}</span>
                      <button type="button" onClick={handleRemoveCoupon} className="coupon-remove-btn">
                        Remove
                      </button>
                    </div>
                    <div className="discount-value">- ₦{appliedCoupon.discountAmount.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Grand Total Row */}
              <div className="summary-total-row">
                <div className="total-label">TOTAL AMOUNT DUE</div>
                <div className="total-amount">₦{finalPayTotal.toLocaleString()}</div>
              </div>
            </div>

            {errorMessage && <div className="checkout-error">{errorMessage}</div>}

            <div className="pay-button-wrap">
              <button
                type="submit"
                disabled={submitting}
                className="pay-now-pill"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="spin" style={{ marginRight: '6px' }} /> Processing...
                  </>
                ) : (
                  `Pay ₦${finalPayTotal.toLocaleString()} Now`
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Callout Section matching Cart-2.png mobile & desktop footer */}
        <section className="checkout-callout">
          <div className="callout-title">
            <h2>
              we <span className="metal-pill"></span> know <br />
              how to make this <br />
              special
            </h2>
          </div>
          <div className="callout-copy">
            <p>
              this explains color systems and color usages so they are used the way to brand identity portrays
            </p>
            <a className="order-now-outline" href="/shop">
              Order Now
            </a>
          </div>
        </section>
      </div>

      <style jsx>{`
        .checkout-page {
          background-color: #141414;
          color: #E5E5E5;
          min-height: 100vh;
          padding: 2rem 0 4rem 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .checkout-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 0 clamp(1.5rem, 3.5vw, 3.5rem);
        }

        @media (max-width: 768px) {
          .checkout-container {
            padding: 0 1.25rem;
          }
        }

        .checkout-header {
          margin-bottom: 3.5rem;
          position: relative;
        }

        .checkout-title {
          font-size: clamp(3rem, 6vw, 5rem);
          font-weight: 300;
          letter-spacing: -0.04em;
          color: #D8D8D8;
          margin: 0 0 1rem 0;
          line-height: 1;
        }

        .checkout-subtext-top {
          font-size: 0.75rem;
          color: #888888;
          max-width: 320px;
          line-height: 1.45;
          margin: 0;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          margin-bottom: 6rem;
        }

        .checkout-fields {
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-label {
          font-size: 0.8rem;
          color: #888888;
          font-weight: 300;
        }

        .field-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background-color: #1A1A1A;
          border: 1px solid #2F2F2F;
          border-radius: 0px;
          color: #FFFFFF;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .field-input:focus {
          border-color: #666666;
        }

        .field-input::placeholder {
          color: #4A4A4A;
        }

        .field-textarea {
          width: 100%;
          padding: 1rem 1.25rem;
          background-color: #1A1A1A;
          border: 1px solid #2F2F2F;
          border-radius: 0px;
          color: #FFFFFF;
          font-size: 0.95rem;
          outline: none;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s ease;
        }

        .field-textarea:focus {
          border-color: #666666;
        }

        .field-textarea::placeholder {
          color: #4A4A4A;
        }

        .field-subtext {
          font-size: 0.72rem;
          color: #777777;
          line-height: 1.45;
          max-width: 320px;
          margin: 0.5rem 0 0 0;
        }

        .checkout-summary {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-top: 2rem;
        }

        .summary-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #262626;
        }

        .item-name {
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          color: #D8D8D8;
          font-weight: 300;
        }

        .item-sub {
          font-size: 0.72rem;
          color: #777777;
          margin-top: 4px;
        }

        .item-price {
          font-size: 1.1rem;
          font-weight: 300;
          color: #D8D8D8;
        }

        .promo-code-box {
          margin-top: 1.5rem;
          padding: 1.25rem;
          background-color: #181818;
          border: 1px solid #2A2A2A;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .promo-input-row {
          display: flex;
          gap: 0.5rem;
        }

        .promo-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background-color: #111111;
          border: 1px solid #333333;
          color: #FFFFFF;
          font-size: 0.82rem;
          letter-spacing: 0.05em;
          outline: none;
          text-transform: uppercase;
        }

        .promo-input:focus {
          border-color: #C5A059;
        }

        .promo-apply-btn {
          padding: 0.75rem 1.4rem;
          background-color: #C5A059;
          color: #000000;
          border: none;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .promo-apply-btn:hover {
          opacity: 0.9;
        }

        .promo-success {
          font-size: 0.78rem;
          color: #66BB6A;
        }

        .promo-error {
          font-size: 0.78rem;
          color: #FF6B6B;
        }

        .applied-coupon-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.5rem;
          border-top: 1px dashed #333333;
        }

        .coupon-tag-badge {
          font-size: 0.75rem;
          font-family: monospace;
          color: #C5A059;
          letter-spacing: 0.05em;
        }

        .coupon-remove-btn {
          margin-left: 0.75rem;
          background: transparent;
          border: none;
          color: #888888;
          font-size: 0.72rem;
          text-decoration: underline;
          cursor: pointer;
        }

        .discount-value {
          font-size: 0.95rem;
          color: #66BB6A;
          font-weight: 500;
        }

        .summary-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 2px solid #C5A059;
        }

        .total-label {
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          color: #AAAAAA;
        }

        .total-amount {
          font-size: 1.5rem;
          font-weight: 300;
          color: #FFFFFF;
        }

        .checkout-error {
          font-size: 0.8rem;
          color: #FF6B6B;
          background-color: rgba(255, 107, 107, 0.1);
          padding: 0.75rem 1rem;
          margin-top: 1.5rem;
        }

        .pay-button-wrap {
          margin-top: 3rem;
          display: flex;
          justify-content: flex-start;
        }

        .pay-now-pill {
          background-color: #8E8A80;
          color: #FFFFFF;
          border: none;
          padding: 0.9rem 2.8rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 400;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.1s ease;
        }

        .pay-now-pill:hover {
          opacity: 0.9;
        }

        .checkout-callout {
          border-top: 1px solid #262626;
          padding-top: 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .callout-title h2 {
          font-size: clamp(2.5rem, 5vw, 4.2rem);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #D8D8D8;
          margin: 0;
        }

        .metal-pill {
          display: inline-block;
          width: 110px;
          height: 28px;
          border-radius: 9999px;
          vertical-align: middle;
          background: radial-gradient(circle at 25% 35%, #d76f76, transparent 28%),
            linear-gradient(110deg, #7e242c, #b2474e 42%, #4b161b 78%);
          box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.16);
        }

        .callout-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.2rem;
          max-width: 320px;
        }

        .callout-copy p {
          font-size: 0.75rem;
          color: #888888;
          line-height: 1.45;
          margin: 0;
        }

        .order-now-outline {
          border: 1px solid #666666;
          border-radius: 9999px;
          padding: 0.6rem 1.8rem;
          font-size: 0.8rem;
          color: #D8D8D8;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .order-now-outline:hover {
          border-color: #FFFFFF;
          color: #FFFFFF;
        }

        @media (max-width: 860px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .checkout-summary {
            padding-top: 0;
          }
          .checkout-callout {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
