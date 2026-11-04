'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CountdownTimer from '@/components/CountdownTimer';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const { addToCart } = useCart();
  
  const [qty1, setQty1] = useState(1);
  const [qty2, setQty2] = useState(1);

  // Add-on product quantities
  const [qtyAddon1, setQtyAddon1] = useState(1);
  const [qtyAddon2, setQtyAddon2] = useState(1);
  const [qtyAddon3, setQtyAddon3] = useState(1);

  return (
    <div style={styles.page}>
      <div className="container">
        {/* =========================================================
            MOBILE HERO SECTION (Figma Home-1.png strictly matched)
            ========================================================= */}
        <section className="mobile-only mobile-hero-wrap">
          {/* 1. Hero Title */}
          <h1 className="mobile-hero-title">
            <span style={{ color: '#989898' }}>we craft gifts that <br />are </span>
            <span style={{ color: '#D9D2C7' }}>memorable.</span>
          </h1>

          {/* 2. Subtext + Wood Accent + Emblem Row */}
          <div className="mobile-hero-body-row">
            <div className="mobile-hero-body-left">
              <p className="mobile-hero-desc">
                this explains color systems and color usages so they are used the way to brand identity portrays
              </p>
              <div className="mobile-hero-emblem-wrap">
                <img
                  src="/keepsake.svg"
                  alt="Keepsake Emblem"
                  width="34"
                  height="34"
                  style={{ opacity: 0.85 }}
                />
              </div>
            </div>
            <div className="mobile-hero-body-right">
              <img
                src="/wood-accent.png"
                alt="Natural Wood Accent"
                className="mobile-wood-accent-img"
              />
            </div>
          </div>

          {/* 3. Live Countdown Timer with Dots & Order Now */}
          <CountdownTimer />

          {/* 4. Storefront Hero Banner Card */}
          <div className="mobile-hero-banner-card">
            <img
              src="/mobile-hero-banner.png"
              alt="Maquette dé keepsake storefront"
              className="mobile-hero-banner-img"
            />
          </div>
        </section>

        {/* =========================================================
            DESKTOP HERO SECTION (Figma Home.png)
            ========================================================= */}
        <section className="desktop-only" style={styles.heroSection}>
          <div style={styles.heroTopContent}>
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

        {/* =========================================================
            SECTION 2: "lets worry about the hard part." (Home-1.png)
            ========================================================= */}
        {/* Mobile Section 2 */}
        <section className="mobile-only mobile-section-2-wrap" id="services">
          <h2 className="mobile-section-2-title">
            <span style={{ color: '#989898' }}>lets worry about <br />the </span>
            <span style={{ color: '#D9D2C7' }}>hard part.</span>
          </h2>
          <p className="mobile-section-2-desc">
            this explains color systems and color usages so they are used the way to brand identity portrays
            this explains color systems and color usages so they are used the way to brand identity portrays
            this explains color systems and color usages so they are used the way to brand identity portrays
            this explains color systems and color usages so they are used the....
          </p>
          <Link href="/customize" className="btn-pill btn-pill-dark">
            Order Now
          </Link>
        </section>

        {/* Desktop Section 2 */}
        <section className="desktop-only" style={styles.sectionPadding}>
          <div style={styles.twoColumnRow}>
            <h2 className="heading-lg" style={{ flex: 1, fontSize: 'clamp(3.2rem, 7.2vw, 5.4rem)', fontWeight: '300', lineHeight: '1.05' }}>
              <span style={{ color: '#989898' }}>we craft gifts that <br />are </span>
              <span style={{ color: '#D9D2C7' }}>memorable.</span>
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

        {/* =========================================================
            FEATURED PRODUCTS
            ========================================================= */}
        <section style={styles.sectionPaddingResponsive}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionLabel}>FEATURED PRODUCTS</h3>
            <Link href="/shop" className="btn-pill desktop-only">
              Visit Shop
            </Link>
            <Link href="/shop" className="btn-pill mobile-only">
              Order Now
            </Link>
          </div>

          {/* Desktop Product Grid (2 columns) */}
          <div className="desktop-only" style={styles.productGrid2}>
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

          {/* Mobile Product Grid (1 column vertical stack matching Home-1.png) */}
          <div className="mobile-only mobile-products-grid">
            {/* Mobile Featured Product 1 */}
            <div className="mobile-product-card">
              <div className="mobile-product-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop"
                  alt="Maquette dé keepsake"
                  className="mobile-product-img"
                />
              </div>
              <div style={styles.featuredFooter}>
                <div>
                  <div style={styles.priceTag}>NGN 30,000</div>
                  <div style={styles.productTitle}>Handwritten Cards</div>
                </div>
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => {
                      const next = qty1 + 1;
                      setQty1(next);
                      addToCart({
                        id: 'feat-1',
                        title: 'Handwritten Cards',
                        subtitle: 'maquette dé keepsake',
                        price: 30000,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
                      });
                    }}
                  >
                    +
                  </button>
                  <span className="quantity-val">{qty1}</span>
                  <button className="quantity-btn" onClick={() => setQty1(Math.max(1, qty1 - 1))}>-</button>
                </div>
              </div>
            </div>

            {/* Mobile Featured Product 2 */}
            <div className="mobile-product-card">
              <div className="mobile-product-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"
                  alt="Black Envelope Keepsake Card"
                  className="mobile-product-img"
                />
              </div>
              <div style={styles.featuredFooter}>
                <div>
                  <div style={styles.priceTag}>NGN 30,000</div>
                  <div style={styles.productTitle}>Handwritten Cards</div>
                </div>
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => {
                      const next = qty2 + 1;
                      setQty2(next);
                      addToCart({
                        id: 'feat-2',
                        title: 'Handwritten Cards',
                        subtitle: 'black envelope keepsake',
                        price: 30000,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
                      });
                    }}
                  >
                    +
                  </button>
                  <span className="quantity-val">{qty2}</span>
                  <button className="quantity-btn" onClick={() => setQty2(Math.max(1, qty2 - 1))}>-</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            BUDGET BANNER SECTION ("unsure what to gift? just give us a budget.")
            ========================================================= */}
        {/* Mobile Budget Banner Card matching Home-1.png */}
        <section className="mobile-only mobile-budget-card">
          <h3 className="mobile-budget-title">
            <span style={{ color: '#989898' }}>unsure what to <br />gift? </span>
            <span style={{ color: '#D9D2C7' }}>just give us <br />a budget.</span>
          </h3>
          <p className="mobile-budget-desc">
            this explains color systems and color usages so they are used the way to brand identity portrays
            this explains color systems and color usages so they are used the way to brand identity portrays
            this explains color systems and color usages so they are used the way to brand identity portrays
            this explains color systems and color..
          </p>
          <Link href="/customize" className="btn-pill btn-pill-solid" style={{ alignSelf: 'flex-start', padding: '0.8rem 2.2rem' }}>
            Order Now
          </Link>
          <div className="mobile-budget-img-wrap">
            <img
              src="/front-view-bouquet-flowers-vase-with-gift-boxes 1.png"
              alt="Flower Bouquet & Gift Box"
              className="mobile-budget-img"
            />
          </div>
        </section>

        {/* Desktop Budget Banner Card */}
        <section className="desktop-only" style={styles.budgetBannerCard}>
          <div style={styles.budgetImgCol}>
            <img
              src="/front-view-bouquet-flowers-vase-with-gift-boxes 1.png"
              alt="Flower Bouquet & Gift Box"
              style={styles.budgetImg}
            />
          </div>
          <div style={styles.budgetContentCol}>
            <h3 className="heading-lg" style={{ fontSize: 'clamp(3.2rem, 7.2vw, 5.4rem)', fontWeight: '300', lineHeight: '1.05' }}>
              <span style={{ color: '#989898' }}>unsure what to gift? <br /></span>
              <span style={{ color: '#D9D2C7' }}>just give us a budget.</span>
            </h3>
            <p className="text-muted" style={{ maxWidth: '520px', fontSize: '1rem' }}>
              this explains color systems and color usages so they are used the way to brand identity portrays
              this explains color systems and color usages so they are used the way to brand identity portrays.
            </p>
            <Link href="/customize" className="btn-pill btn-pill-solid" style={{ alignSelf: 'flex-start', marginTop: '1.5rem', padding: '0.8rem 2.4rem' }}>
              Order Now
            </Link>
          </div>
        </section>

        {/* =========================================================
            REGULAR ADD'ONS
            ========================================================= */}
        <section style={styles.sectionPaddingResponsive}>
          <div style={styles.sectionHeaderRow}>
            <h3 style={styles.sectionLabel}>REGULAR ADD'ONS</h3>
            <Link href="/shop" className="btn-pill desktop-only">
              Visit Shop
            </Link>
            <Link href="/shop" className="btn-pill mobile-only">
              Order Now
            </Link>
          </div>

          {/* Desktop Add-ons Grid */}
          <div className="desktop-only" style={styles.productGrid3}>
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

          {/* Mobile Add-ons Grid (1 column stack matching Home-1.png) */}
          <div className="mobile-only mobile-addons-grid">
            {/* Mobile Add-on 1: FLW - 23 */}
            <div className="mobile-addon-card">
              <div className="mobile-addon-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop"
                  alt="Flower Bundle"
                  className="mobile-addon-img"
                />
              </div>
              <div style={styles.featuredFooter}>
                <div>
                  <div style={styles.priceTag}>FLW - 23</div>
                  <div style={styles.productTitle}>Handwritten Cards</div>
                </div>
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => {
                      const next = qtyAddon1 + 1;
                      setQtyAddon1(next);
                      addToCart({
                        id: 'addon-flw-23',
                        title: 'FLW - 23',
                        subtitle: 'fresh floral arrangement',
                        price: 15000,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=600&auto=format&fit=crop',
                      });
                    }}
                  >
                    +
                  </button>
                  <span className="quantity-val">{qtyAddon1}</span>
                  <button className="quantity-btn" onClick={() => setQtyAddon1(Math.max(1, qtyAddon1 - 1))}>-</button>
                </div>
              </div>
            </div>

            {/* Mobile Add-on 2: JWL - 17 */}
            <div className="mobile-addon-card">
              <div className="mobile-addon-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop"
                  alt="Gold Rings Set"
                  className="mobile-addon-img"
                />
              </div>
              <div style={styles.featuredFooter}>
                <div>
                  <div style={styles.priceTag}>JWL - 17</div>
                  <div style={styles.productTitle}>Handwritten Cards</div>
                </div>
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => {
                      const next = qtyAddon2 + 1;
                      setQtyAddon2(next);
                      addToCart({
                        id: 'addon-jwl-17',
                        title: 'JWL - 17',
                        subtitle: 'handcrafted 14k gold ring set',
                        price: 26000,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
                      });
                    }}
                  >
                    +
                  </button>
                  <span className="quantity-val">{qtyAddon2}</span>
                  <button className="quantity-btn" onClick={() => setQtyAddon2(Math.max(1, qtyAddon2 - 1))}>-</button>
                </div>
              </div>
            </div>

            {/* Mobile Add-on 3: CHLTE - 36 */}
            <div className="mobile-addon-card">
              <div className="mobile-addon-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop"
                  alt="Artisan Chocolates"
                  className="mobile-addon-img"
                />
              </div>
              <div style={styles.featuredFooter}>
                <div>
                  <div style={styles.priceTag}>CHLTE - 36</div>
                  <div style={styles.productTitle}>Handwritten Cards</div>
                </div>
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => {
                      const next = qtyAddon3 + 1;
                      setQtyAddon3(next);
                      addToCart({
                        id: 'addon-chlte-36',
                        title: 'CHLTE - 36',
                        subtitle: 'artisan dark cocoa block',
                        price: 5900,
                        quantity: 1,
                        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop',
                      });
                    }}
                  >
                    +
                  </button>
                  <span className="quantity-val">{qtyAddon3}</span>
                  <button className="quantity-btn" onClick={() => setQtyAddon3(Math.max(1, qtyAddon3 - 1))}>-</button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: '0px',
  },
  heroSection: {
    marginBottom: '5rem',
  },
  heroTopContent: {
    minHeight: 'calc(900px - 160px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: '1.5rem',
  },
  heroImgBanner: {
    width: '100%',
    height: '800px',
    borderRadius: '24px',
    overflow: 'hidden',
    marginTop: '0px',
  },
  fullImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sectionPadding: {
    padding: '5rem 0',
  },
  sectionPaddingResponsive: {
    padding: 'clamp(3rem, 6vw, 5rem) 0',
  },
  twoColumnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4rem',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  sectionLabel: {
    fontSize: '0.78rem',
    fontWeight: '300',
    letterSpacing: '0.12em',
    color: '#888888',
    textTransform: 'uppercase',
  },
  productGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2.5rem',
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
    fontSize: '1.25rem',
    color: '#FFFFFF',
    fontWeight: '300',
  },
  productTitle: {
    fontSize: '0.85rem',
    color: '#888888',
    marginTop: '2px',
  },
  budgetBannerCard: {
    margin: '5rem 0',
    backgroundColor: '#161616',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    minHeight: '640px',
  },
  budgetImgCol: {
    flex: 1,
    height: '640px',
  },
  budgetImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  budgetContentCol: {
    flex: 1.15,
    padding: '4rem 4.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.8rem',
  },
  productGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
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
