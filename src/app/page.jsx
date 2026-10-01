'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const { addToCart } = useCart();
  
  const [qty1, setQty1] = useState(1);
  const [qty2, setQty2] = useState(1);

  return (
    <div style={styles.page}>
      <div className="container">
        {/* HERO SECTION 1 */}
        <section style={styles.heroSection}>
          <div style={styles.heroTopContent}>
            <div style={styles.heroHeaderRow}>
              <h1 className="heading-xl" style={styles.heroTitle}>
                we craft gifts that <br />
                are <span>memorable.</span>
              </h1>
              <div style={styles.emblemBadge}>
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" opacity="0.6">
                  <circle cx="50" cy="50" r="46" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M50 15 C30 15, 15 30, 15 50 C15 70, 30 85, 50 85" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M50 25 C36 25, 25 36, 25 50 C25 64, 36 75, 50 75" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>
                <p style={styles.emblemSubtext}>
                  this explains color systems and color usages so they are used the way to brand identity portrays
                </p>
              </div>
            </div>

            {/* Live Countdown Timer */}
            <CountdownTimer />
          </div>

          {/* Large Hero Banner Image */}
          <div style={styles.heroImgBanner}>
            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1600&auto=format&fit=crop"
              alt="Stacked Gold Chain Rings"
              style={styles.fullImg}
            />
          </div>
        </section>

        {/* HERO SECTION 2 */}
        <section style={styles.sectionPadding}>
          <div style={styles.twoColumnRow}>
            <h2 className="heading-lg" style={{ flex: 1 }}>
              we craft gifts that <br />
              are memorable.
            </h2>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
              <p className="text-muted">
                this explains color systems and color usages so they are used the way to brand identity portrays.
                this explains color systems and color usages so they are used the way to brand identity portrays...
              </p>
              <Link href="/customize" className="btn-pill btn-pill-dark">
                Order Now
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED PRODUCTS */}
        <section style={styles.sectionPadding}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionLabel}>FEATURED PRODUCTS</h3>
            <Link href="/shop" className="btn-pill">
              Visit Shop
            </Link>
          </div>

          <div style={styles.productGrid2}>
            {/* Featured Product 1 */}
            <div style={styles.featuredCard}>
              <div style={styles.featuredImgWrapper}>
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop"
                  alt="Maquette dé keepsake"
                  style={styles.featuredImg}
                />
              </div>
              <div style={styles.featuredFooter}>
                <div>
                  <div style={styles.priceTag}>NGN 30,000</div>
                  <div style={styles.productTitle}>Handwritten Cards</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="quantity-control">
                    <button className="quantity-btn" onClick={() => setQty1(qty1 + 1)}>+</button>
                    <span className="quantity-val">{qty1}</span>
                    <button className="quantity-btn" onClick={() => setQty1(Math.max(1, qty1 - 1))}>-</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Product 2 */}
            <div style={styles.featuredCard}>
              <div style={styles.featuredImgWrapper}>
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"
                  alt="Black Envelope Keepsake Card"
                  style={styles.featuredImg}
                />
              </div>
              <div style={styles.featuredFooter}>
                <div>
                  <div style={styles.priceTag}>NGN 30,000</div>
                  <div style={styles.productTitle}>Handwritten Cards</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="quantity-control">
                    <button className="quantity-btn" onClick={() => setQty2(qty2 + 1)}>+</button>
                    <span className="quantity-val">{qty2}</span>
                    <button className="quantity-btn" onClick={() => setQty2(Math.max(1, qty2 - 1))}>-</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUDGET BANNER SECTION */}
        <section style={styles.budgetBannerCard}>
          <div style={styles.budgetImgCol}>
            <img
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop"
              alt="Flower Bouquet & Gift Box"
              style={styles.budgetImg}
            />
          </div>
          <div style={styles.budgetContentCol}>
            <h3 className="heading-lg">
              unsure what to gift? <br />
              just give us a budget.
            </h3>
            <p className="text-muted" style={{ maxWidth: '420px' }}>
              this explains color systems and color usages so they are used the way to brand identity portrays
              this explains color systems and color usages so they are used the way to brand identity portrays.
            </p>
            <Link href="/customize" className="btn-pill btn-pill-solid" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
              Order Now
            </Link>
          </div>
        </section>

        {/* REGULAR ADD-ONS */}
        <section style={styles.sectionPadding}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionLabel}>REGULAR ADD'ONS</h3>
            <Link href="/shop" className="btn-pill">
              Visit Shop
            </Link>
          </div>

          <div style={styles.productGrid3}>
            {/* Add-on 1 */}
            <div style={styles.addonCardItem}>
              <div style={styles.addonImgWrap}>
                <img
                  src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop"
                  alt="Flower Bundle"
                  style={styles.addonImg}
                />
              </div>
              <div style={styles.addonFooter}>
                <div>
                  <h4 style={styles.addonTitle}>FLW - 23</h4>
                  <div style={styles.addonPriceSub}>NGN 15,000</div>
                </div>
                <button
                  onClick={() => addToCart({
                    id: 'addon-flw-23',
                    title: 'FLW - 23',
                    subtitle: 'fresh floral arrangement',
                    price: 15000,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop',
                  })}
                  className="btn-pill"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Add-on 2 */}
            <div style={styles.addonCardItem}>
              <div style={styles.addonImgWrap}>
                <img
                  src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop"
                  alt="Artisan Chocolates"
                  style={styles.addonImg}
                />
              </div>
              <div style={styles.addonFooter}>
                <div>
                  <h4 style={styles.addonTitle}>CHLTE - 33</h4>
                  <div style={styles.addonPriceSub}>NGN 5,900</div>
                </div>
                <button
                  onClick={() => addToCart({
                    id: 'addon-chlte-33',
                    title: 'CHLTE - 33',
                    subtitle: 'artisan dark cocoa block',
                    price: 5900,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop',
                  })}
                  className="btn-pill"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Add-on 3 */}
            <div style={styles.addonCardItem}>
              <div style={styles.addonImgWrap}>
                <img
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop"
                  alt="Gold Rings Set"
                  style={styles.addonImg}
                />
              </div>
              <div style={styles.addonFooter}>
                <div>
                  <h4 style={styles.addonTitle}>JWL - 17</h4>
                  <div style={styles.addonPriceSub}>NGN 26,000</div>
                </div>
                <button
                  onClick={() => addToCart({
                    id: 'addon-jwl-17',
                    title: 'JWL - 17',
                    subtitle: 'handcrafted 14k gold ring set',
                    price: 26000,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
                  })}
                  className="btn-pill"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CALLOUT BANNER */}
        <section style={styles.calloutBanner}>
          <div style={{ flex: 1.2 }}>
            <h2 className="heading-xl" style={{ lineHeight: '1.1' }}>
              we <span className="metallic-pill-badge" /> know <br />
              how to make <br />
              this special
            </h2>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
            <Link href="/customize" className="btn-pill btn-pill-dark" style={{ padding: '0.8rem 2.2rem' }}>
              Get Started
            </Link>
            <p className="text-muted" style={{ maxWidth: '380px' }}>
              this explains color systems and color usages so they are used the way to brand identity portrays
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: '2rem',
  },
  heroSection: {
    marginBottom: '5rem',
  },
  heroTopContent: {
    minHeight: '800px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: '2.5rem',
  },
  heroHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '2rem',
    marginBottom: '2rem',
  },
  heroTitle: {
    maxWidth: '780px',
  },
  emblemBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: '320px',
  },
  emblemSubtext: {
    fontSize: '0.7rem',
    color: '#888888',
    lineHeight: '1.4',
  },
  heroImgBanner: {
    width: '100%',
    height: '600px',
    borderRadius: '24px',
    overflow: 'hidden',
    marginTop: '2rem',
  },
  fullImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sectionPadding: {
    padding: '4rem 0',
  },
  twoColumnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4rem',
    flexWrap: 'wrap',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
  },
  sectionLabel: {
    fontSize: '0.8rem',
    letterSpacing: '0.12em',
    color: '#888888',
    textTransform: 'uppercase',
  },
  productGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '2rem',
  },
  featuredCard: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0px',
    overflow: 'hidden',
  },
  featuredImgWrapper: {
    width: '100%',
    height: '480px',
    overflow: 'hidden',
  },
  featuredImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '0px',
  },
  featuredFooter: {
    padding: '1.2rem 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    fontSize: '1.3rem',
    color: '#FFFFFF',
    fontWeight: '300',
  },
  productTitle: {
    fontSize: '0.85rem',
    color: '#888888',
    marginTop: '2px',
  },
  budgetBannerCard: {
    margin: '4rem 0',
    backgroundColor: '#161616',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  budgetImgCol: {
    flex: 1,
    minWidth: '320px',
    height: '420px',
  },
  budgetImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  budgetContentCol: {
    flex: 1.2,
    padding: '3.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  productGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
  },
  addonCardItem: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0px',
    overflow: 'hidden',
  },
  addonImgWrap: {
    width: '100%',
    height: '300px',
  },
  addonImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '0px',
  },
  addonFooter: {
    padding: '1.2rem 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addonTitle: {
    fontSize: '1rem',
    fontWeight: '400',
    color: '#FFFFFF',
  },
  addonPriceSub: {
    fontSize: '0.78rem',
    color: '#888888',
    marginTop: '2px',
  },
  calloutBanner: {
    padding: '6rem 0 3rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '3rem',
  },
};
