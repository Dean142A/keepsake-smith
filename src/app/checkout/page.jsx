'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Lock, ShieldCheck, ArrowRight, CheckCircle, Package, Sparkles, CreditCard, RefreshCw } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  // Purchaser Details
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [purchaserPhone, setPurchaserPhone] = useState('');

  // Recipient Details
  const [isGift, setIsGift] = useState(true);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  // Custom Message
  const [customMessage, setCustomMessage] = useState('');

  // Fulfillment Options
  const [fulfillmentType, setFulfillmentType] = useState('physical_card'); // 'physical_card' or 'digital_only'
  
  // Shipping Address
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('Lagos');

  // Payment & Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from custom cart payload if available
  useEffect(() => {
    const customItem = cart.find((i) => i.personalization);
    if (customItem && customItem.personalization) {
      if (customItem.personalization.recipientName) {
        setRecipientName(customItem.personalization.recipientName);
      }
      if (customItem.personalization.message) {
        setCustomMessage(customItem.personalization.message);
      }
    }
  }, [cart]);

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

  const shippingFee = fulfillmentType === 'physical_card' ? 2500 : 0;
  const grandTotal = cartTotal + shippingFee;

  const handlePaystackPayment = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!purchaserName.trim() || !purchaserEmail.trim()) {
      setError('Please provide your name and email address.');
      return;
    }

    if (fulfillmentType === 'physical_card' && (!streetAddress.trim() || !city.trim())) {
      setError('Please fill in your shipping delivery address.');
      return;
    }

    setLoading(true);
    setError('');

    const orderPayload = {
      purchaserName: purchaserName.trim(),
      purchaserEmail: purchaserEmail.trim(),
      purchaserPhone: purchaserPhone.trim(),
      recipientType: isGift ? 'gift' : 'self',
      recipientName: recipientName.trim() || purchaserName.trim(),
      recipientEmail: recipientEmail.trim() || purchaserEmail.trim(),
      fulfillmentType,
      shippingAddress: {
        street: streetAddress.trim(),
        city: city.trim(),
        state: stateRegion.trim(),
      },
      customMessage: customMessage.trim(),
      items: cart.map((i) => ({
        id: i.id,
        title: i.title,
        subtitle: i.subtitle,
        price: i.price,
        quantity: i.quantity,
      })),
      totalAmount: grandTotal,
    };

    // Initialize Paystack Inline Modal
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_894321908ab9741295c10';

    if (typeof window !== 'undefined' && window.PaystackPop) {
      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: purchaserEmail.trim(),
          amount: grandTotal * 100, // Paystack operates in Kobo
          currency: 'NGN',
          ref: `KPSK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          metadata: {
            custom_fields: [
              { display_name: "Purchaser Name", variable_name: "purchaser_name", value: purchaserName },
              { display_name: "Recipient Name", variable_name: "recipient_name", value: recipientName || purchaserName },
              { display_name: "Fulfillment", variable_name: "fulfillment_type", value: fulfillmentType },
            ],
          },
          onClose: () => {
            setLoading(false);
          },
          callback: (response) => {
            // Verify payment on backend & create order
            verifyPaymentAndFulfill(response.reference, orderPayload);
          },
        });
        handler.openIframe();
      } catch (err) {
        console.error('Paystack Inline Error:', err);
        // Fallback to direct backend order creation for development/test mode
        verifyPaymentAndFulfill(`SIMULATED-${Date.now()}`, orderPayload);
      }
    } else {
      // Fallback if Paystack script blocked
      verifyPaymentAndFulfill(`SIMULATED-${Date.now()}`, orderPayload);
    }
  };

  const verifyPaymentAndFulfill = async (reference, orderPayload) => {
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
        setError(data.error || 'Payment verification failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment Verification Network Exception:', err);
      setError('Network error verifying payment. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="container" style={styles.container}>
        {/* Header Breadcrumb */}
        <div style={styles.headerRow}>
          <Link href="/cart" style={styles.backLink}>
            ← Back to Bag
          </Link>
          <div style={styles.secureTag}>
            <ShieldCheck size={16} color="#C5A059" />
            <span>Encrypted 256-Bit SSL Paystack Checkout</span>
          </div>
        </div>

        <h1 style={styles.pageTitle}>Complete Your Keepsake Order</h1>

        <div style={styles.checkoutGrid}>
          {/* Left Column: Information & Payment Form */}
          <form onSubmit={handlePaystackPayment} style={styles.formCol}>
            {/* Step 1: Purchaser Contact Info */}
            <div style={styles.cardSection}>
              <h2 style={styles.sectionHeading}>
                <span style={styles.stepNum}>1</span> Purchaser Information
              </h2>
              <div style={styles.fieldGrid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Smith"
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    placeholder="alexander@example.com"
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.inputGroup} style={{ marginTop: '1rem' }}>
                <label style={styles.label}>PHONE NUMBER</label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={purchaserPhone}
                  onChange={(e) => setPurchaserPhone(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Step 2: Gift Recipient & 3D Experience Details */}
            <div style={styles.cardSection}>
              <h2 style={styles.sectionHeading}>
                <span style={styles.stepNum}>2</span> Gift Recipient & 3D Portal Badge
              </h2>
              <p style={styles.sectionSub}>
                The recipient name will be custom embossed on your physical keepsake card and embedded directly inside the 3D Animated WebGL portal experience.
              </p>

              <div style={styles.fieldGrid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>RECIPIENT NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Forster"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>RECIPIENT EMAIL (OPTIONAL)</label>
                  <input
                    type="email"
                    placeholder="forster@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={styles.label}>HANDWRITTEN MESSAGE EMBOSSED ON CARD & 3D BOOK</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Happy Anniversary my love! Forever & always."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={styles.textarea}
                />
              </div>
            </div>

            {/* Step 3: Fulfillment & Shipping Options */}
            <div style={styles.cardSection}>
              <h2 style={styles.sectionHeading}>
                <span style={styles.stepNum}>3</span> Fulfillment & Delivery
              </h2>

              <div style={styles.fulfillmentOptionsRow}>
                <div
                  style={{
                    ...styles.fulfillmentCard,
                    ...(fulfillmentType === 'physical_card' ? styles.fulfillmentCardActive : {}),
                  }}
                  onClick={() => setFulfillmentType('physical_card')}
                >
                  <Package size={22} color={fulfillmentType === 'physical_card' ? '#C5A059' : '#888888'} />
                  <div style={styles.fulfillmentTitle}>Physical Card Box + 3D Portal</div>
                  <div style={styles.fulfillmentDesc}>Crafted physical keepsake card delivered in luxury box + 3D WebGL portal key</div>
                  <div style={styles.fulfillmentPrice}>+ NGN 2,500 Shipping</div>
                </div>

                <div
                  style={{
                    ...styles.fulfillmentCard,
                    ...(fulfillmentType === 'digital_only' ? styles.fulfillmentCardActive : {}),
                  }}
                  onClick={() => setFulfillmentType('digital_only')}
                >
                  <Sparkles size={22} color={fulfillmentType === 'digital_only' ? '#C5A059' : '#888888'} />
                  <div style={styles.fulfillmentTitle}>Digital 3D Portal Only</div>
                  <div style={styles.fulfillmentDesc}>Instant digital access code generated & dispatched via email</div>
                  <div style={styles.fulfillmentPrice}>FREE Instant Delivery</div>
                </div>
              </div>

              {fulfillmentType === 'physical_card' && (
                <div style={styles.shippingAddressBox}>
                  <h3 style={styles.subHeading}>Shipping Address Details</h3>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>STREET ADDRESS *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGrid2} style={{ marginTop: '1rem' }}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>CITY *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Victoria Island"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>STATE / REGION *</label>
                      <select
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        style={styles.select}
                      >
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja (FCT)</option>
                        <option value="Rivers">Rivers (Port Harcourt)</option>
                        <option value="Oyo">Oyo (Ibadan)</option>
                        <option value="Ogun">Ogun</option>
                        <option value="Edo">Edo</option>
                        <option value="Other">Other States</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && <div style={styles.errorAlert}>{error}</div>}

            {/* Submit Payment CTA */}
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="btn-pill btn-pill-solid"
              style={styles.payBtn}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin" style={{ marginRight: '8px' }} /> Initializing Paystack...
                </>
              ) : (
                <>
                  <CreditCard size={18} style={{ marginRight: '8px' }} /> Pay NGN {grandTotal.toLocaleString()} with Paystack <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </>
              )}
            </button>
          </form>

          {/* Right Column: Order Summary */}
          <div style={styles.summaryCol}>
            <div style={styles.summaryCard}>
              <h2 style={styles.summaryHeading}>Order Summary</h2>

              <div style={styles.itemsList}>
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} style={styles.itemRow}>
                    <div style={styles.itemImgWrap}>
                      <img src={item.image} alt={item.title} style={styles.itemImg} />
                    </div>
                    <div style={styles.itemDetails}>
                      <div style={styles.itemTitle}>{item.title}</div>
                      <div style={styles.itemSubtitle}>{item.subtitle || 'Custom Keepsake Card'}</div>
                      <div style={styles.itemQty}>Qty: {item.quantity}</div>
                    </div>
                    <div style={styles.itemPrice}>
                      NGN {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.summaryDivider} />

              <div style={styles.costRow}>
                <span>Subtotal</span>
                <span>NGN {cartTotal.toLocaleString()}</span>
              </div>

              <div style={styles.costRow}>
                <span>Fulfillment & Delivery</span>
                <span>{shippingFee === 0 ? 'FREE' : `NGN ${shippingFee.toLocaleString()}`}</span>
              </div>

              <div style={styles.summaryDivider} />

              <div style={styles.totalRow}>
                <span>Total Due</span>
                <span style={styles.totalAmountText}>NGN {grandTotal.toLocaleString()}</span>
              </div>

              <div style={styles.badgeFooter}>
                <CheckCircle size={16} color="#C5A059" />
                <span>Instant 12-Char Access Code (`KPSK-XXXX-XXXX`) Generated Upon Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '2rem 0 6rem 0',
    minHeight: '90vh',
  },
  container: {
    maxWidth: '1160px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  backLink: {
    fontSize: '0.85rem',
    color: '#888888',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  secureTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#C5A059',
  },
  pageTitle: {
    fontSize: '2.2rem',
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: '2.5rem',
  },
  checkoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2.5rem',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  cardSection: {
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '2rem',
  },
  sectionHeading: {
    fontSize: '1.2rem',
    fontWeight: '400',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1rem',
  },
  stepNum: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: '#C5A059',
    color: '#000000',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    display: 'grid',
    placeItems: 'center',
  },
  sectionSub: {
    fontSize: '0.8rem',
    color: '#888888',
    marginBottom: '1.5rem',
    lineHeight: '1.4',
  },
  fieldGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.68rem',
    letterSpacing: '0.1em',
    color: '#AAAAAA',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.85rem 1rem',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '0.85rem 1rem',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  fulfillmentOptionsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  fulfillmentCard: {
    padding: '1.25rem',
    backgroundColor: '#0F0F0F',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  fulfillmentCardActive: {
    borderColor: '#C5A059',
    backgroundColor: 'rgba(197, 160, 89, 0.06)',
  },
  fulfillmentTitle: {
    fontSize: '0.95rem',
    fontWeight: '400',
    color: '#FFFFFF',
    margin: '8px 0 4px 0',
  },
  fulfillmentDesc: {
    fontSize: '0.75rem',
    color: '#888888',
    lineHeight: '1.3',
    marginBottom: '8px',
  },
  fulfillmentPrice: {
    fontSize: '0.8rem',
    color: '#C5A059',
    fontWeight: '500',
  },
  shippingAddressBox: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  subHeading: {
    fontSize: '1rem',
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: '1rem',
  },
  errorAlert: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#FF6B6B',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
  },
  payBtn: {
    width: '100%',
    padding: '1.2rem',
    fontSize: '1rem',
    fontWeight: '500',
  },
  summaryCol: {},
  summaryCard: {
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '2rem',
    position: 'sticky',
    top: '2rem',
  },
  summaryHeading: {
    fontSize: '1.2rem',
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: '1.5rem',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  itemRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  itemImgWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '10px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  itemImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '0.88rem',
    color: '#FFFFFF',
    fontWeight: '400',
  },
  itemSubtitle: {
    fontSize: '0.72rem',
    color: '#888888',
    marginTop: '2px',
  },
  itemQty: {
    fontSize: '0.72rem',
    color: '#888888',
    marginTop: '2px',
  },
  itemPrice: {
    fontSize: '0.88rem',
    color: '#E0E0E0',
    fontWeight: '300',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '1.25rem 0',
  },
  costRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#888888',
    marginBottom: '0.75rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#FFFFFF',
    fontWeight: '400',
  },
  totalAmountText: {
    fontSize: '1.4rem',
    color: '#C5A059',
    fontWeight: '400',
  },
  badgeFooter: {
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.72rem',
    color: '#AAAAAA',
    lineHeight: '1.3',
  },
};
