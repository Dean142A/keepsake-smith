'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp, Mail, Send, HelpCircle, ShieldCheck, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

const FAQ_DATA = [
  {
    category: '12-CHAR DIGITAL ACCESS KEYS',
    items: [
      {
        question: 'How do I redeem my 12-character digital access code?',
        answer: 'You can redeem your 12-character code (e.g. KPSK-8F92-A1B3) by visiting app.thekeepsakesmith.com or our /portal page. Simply enter your code into the prompt box to immediately unlock your custom 3D WebGL keepsake experience.',
      },
      {
        question: 'Does the recipient need to download an app or register an account?',
        answer: 'No app download or account creation is required! The 3D WebGL experience launches directly in any modern mobile browser (iOS Safari, Android Chrome) or desktop browser with interactive 360° rendering.',
      },
      {
        question: 'What if I lost or misplaced my 12-character access code?',
        answer: 'You can easily recover your access code by visiting our /track page and entering the email address used during purchase. We will display your live order details and allow you to resend your code directly to your email inbox.',
      },
      {
        question: 'Does my 12-character access key expire?',
        answer: 'No, all Keepsake Smith digital access keys are perpetual. Your 3D WebGL experience, personalized messages, and custom media will remain stored securely on our cloud servers forever.',
      },
    ],
  },
  {
    category: 'HANDCRAFTED CARDS & MATERIALS',
    items: [
      {
        question: 'What materials are used for physical keepsake cards?',
        answer: 'Our physical cards are crafted from heavy-weight, FSC-certified metallic and textured timber paperboard (350+ GSM). Each card is hand-engraved with gold leaf foiling and precision foil stamping.',
      },
      {
        question: 'How long does physical card handcrafting take?',
        answer: 'Our master artisans handcraft every physical card within 24 to 48 hours of order confirmation before dispatching via express shipping.',
      },
      {
        question: 'Can I send a physical card directly to a gift recipient?',
        answer: 'Yes! During checkout, simply specify the recipient’s address and name. We will package the card in an unbranded luxury gift box with wax seals.',
      },
    ],
  },
  {
    category: 'PROMO CODES & PAYMENTS',
    items: [
      {
        question: 'How do I apply a promo code or coupon during checkout?',
        answer: 'On the Checkout page, enter your promo code (e.g. KEEPSAKE10 or WELCOME5000) into the Promo Code box in the order summary column and click "Apply". The discount will automatically recalculate your total amount due.',
      },
      {
        question: 'Which payment methods do you accept?',
        answer: 'We accept payments powered by Paystack, including Visa, MasterCard, Verve debit cards, USSD bank transfers, and Apple Pay.',
      },
      {
        question: 'Are payments on The Keepsake Smith secure?',
        answer: 'Yes, 100%. All payment processing is directly handled through Paystack’s PCI-DSS Level 1 certified gateway with 256-bit SSL encryption.',
      },
    ],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null); // 'catIdx-itemIdx'

  // Support Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('12-Char Code Redemption');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const toggleAccordion = (key) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          orderId: orderId.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormSuccess(data.message || 'Your inquiry has been received! Our support team will get back to you shortly.');
        setName('');
        setEmail('');
        setOrderId('');
        setMessage('');
      } else {
        setFormError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setFormError('Network error submitting support inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter FAQ items
  const filteredFaq = FAQ_DATA.map((cat) => {
    const matchingItems = cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, items: matchingItems };
  }).filter((cat) => cat.items.length > 0);

  return (
    <div className="faq-page">
      <div className="faq-container">
        {/* Header */}
        <header className="faq-header">
          <span className="faq-kicker">HELP & KNOWLEDGE BASE</span>
          <h1 className="faq-title">frequently asked questions</h1>
          <p className="faq-subtitle">
            Everything you need to know about our handcrafted cards, 12-character digital access codes, and 3D WebGL gift experiences.
          </p>

          {/* FAQ Search Bar */}
          <div className="search-wrap">
            <Search size={18} color="#888" className="search-icon" />
            <input
              type="text"
              placeholder="Search questions or keywords (e.g. access code, shipping, payment)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        {/* FAQ Accordion List */}
        <main className="faq-list">
          {filteredFaq.length === 0 ? (
            <div className="no-results">
              <HelpCircle size={40} color="#888" />
              <p>No questions matched your search term "{searchTerm}".</p>
              <button onClick={() => setSearchTerm('')} className="reset-search-btn">
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredFaq.map((category, catIdx) => (
              <section key={catIdx} className="category-section">
                <h3 className="category-title">{category.category}</h3>

                <div className="accordion-group">
                  {category.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const isOpen = openIndex === key || (searchTerm && filteredFaq.length === 1 && category.items.length === 1);

                    return (
                      <div key={itemIdx} className={`accordion-item ${isOpen ? 'is-open' : ''}`}>
                        <button
                          onClick={() => toggleAccordion(key)}
                          className="accordion-header"
                          aria-expanded={isOpen}
                        >
                          <span className="question-text">{item.question}</span>
                          <span className="toggle-icon">
                            {isOpen ? <ChevronUp size={18} color="#C5A059" /> : <ChevronDown size={18} color="#888" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="accordion-body">
                            <p className="answer-text">{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </main>

        {/* Support Contact Form Section */}
        <section className="support-section">
          <div className="support-header">
            <span className="support-kicker">DIRECT ASSISTANCE</span>
            <h2 className="support-title">Still need assistance? Contact our artisans</h2>
            <p className="support-sub">
              Have a custom request or need help with an order? Send a message and our support team will reply within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSupportSubmit} className="support-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="field-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field-input"
                />
              </div>

              <div className="form-group">
                <label className="field-label">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="eleanor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field-input"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="field-label">Inquiry Category</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="field-select"
                >
                  <option value="12-Char Code Redemption">12-Char Code Redemption & 3D Portal</option>
                  <option value="Order Status & Delivery">Order Status & Delivery Inquiry</option>
                  <option value="Promo Code Issue">Promo Code / Payment Support</option>
                  <option value="Custom Artisanal Order">Custom 3D Gift Order Request</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">Order ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ORD-123456"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="field-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Your Message *</label>
              <textarea
                rows={5}
                required
                placeholder="Describe how we can assist you..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="field-textarea"
              />
            </div>

            {formSuccess && (
              <div className="success-toast">
                <CheckCircle2 size={16} color="#66BB6A" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && <div className="error-toast">{formError}</div>}

            <div className="submit-btn-wrap">
              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="spin" /> Dispatching Message...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Message to Artisans
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>

      <style jsx>{`
        .faq-page {
          background-color: #111111;
          color: #E5E5E5;
          min-height: 100vh;
          padding: 3rem 0 6rem 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .faq-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .faq-kicker {
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          color: #C5A059;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.5rem;
        }

        .faq-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 300;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 0 0 1rem 0;
        }

        .faq-subtitle {
          font-size: 0.9rem;
          color: #999999;
          max-width: 620px;
          margin: 0 auto 2.5rem auto;
          line-height: 1.6;
        }

        .search-wrap {
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-wrap :global(.search-icon) {
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
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          border-color: #C5A059;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          margin-bottom: 6rem;
        }

        .no-results {
          text-align: center;
          padding: 4rem 2rem;
          background-color: #161616;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: #888888;
        }

        .reset-search-btn {
          padding: 0.6rem 1.4rem;
          background-color: #C5A059;
          color: #000;
          border: none;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .category-title {
          font-size: 0.78rem;
          letter-spacing: 0.2em;
          color: #C5A059;
          margin: 0 0 1.25rem 0;
        }

        .accordion-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .accordion-item {
          background-color: #161616;
          border: 1px solid #282828;
          transition: border-color 0.2s ease;
        }

        .accordion-item.is-open {
          border-color: rgba(197, 160, 89, 0.5);
        }

        .accordion-header {
          width: 100%;
          padding: 1.25rem 1.5rem;
          background: transparent;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          cursor: pointer;
          color: #FFFFFF;
          gap: 1rem;
        }

        .question-text {
          font-size: 0.98rem;
          font-weight: 400;
          line-height: 1.4;
        }

        .accordion-body {
          padding: 0 1.5rem 1.5rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .answer-text {
          font-size: 0.88rem;
          color: #AAAAAA;
          line-height: 1.65;
          margin: 1rem 0 0 0;
        }

        .support-section {
          background-color: #161616;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem 2.5rem;
        }

        .support-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .support-kicker {
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          color: #C5A059;
          display: block;
          margin-bottom: 0.4rem;
        }

        .support-title {
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 300;
          color: #FFFFFF;
          margin: 0 0 0.75rem 0;
        }

        .support-sub {
          font-size: 0.85rem;
          color: #888888;
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .support-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 680px;
          margin: 0 auto;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .field-label {
          font-size: 0.78rem;
          color: #888888;
        }

        .field-input,
        .field-select,
        .field-textarea {
          width: 100%;
          padding: 0.9rem 1.1rem;
          background-color: #111111;
          border: 1px solid #2F2F2F;
          color: #FFFFFF;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .field-input:focus,
        .field-select:focus,
        .field-textarea:focus {
          border-color: #C5A059;
        }

        .field-select option {
          background-color: #161616;
          color: #FFFFFF;
        }

        .success-toast {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 1rem 1.25rem;
          background-color: rgba(102, 187, 106, 0.1);
          border: 1px solid rgba(102, 187, 106, 0.3);
          color: #66BB6A;
          font-size: 0.85rem;
        }

        .error-toast {
          padding: 1rem 1.25rem;
          background-color: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #FF6B6B;
          font-size: 0.85rem;
        }

        .submit-btn-wrap {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .submit-btn {
          padding: 1rem 2.2rem;
          background-color: #C5A059;
          color: #000000;
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.2s ease;
        }

        .submit-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 680px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .support-section {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
