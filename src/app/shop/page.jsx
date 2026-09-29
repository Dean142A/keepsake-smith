'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const PRODUCTS = [
  {
    id: 'shop-1',
    title: 'Handwritten Cards',
    subtitle: 'maquette dé keepsake',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'shop-2',
    title: 'Handwritten Cards',
    subtitle: 'black envelope luxury edition',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'shop-3',
    title: 'Handwritten Cards',
    subtitle: 'linen texture finish',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'shop-4',
    title: 'Handwritten Cards',
    subtitle: 'custom foil monogram',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
  },
];

export default function ShopPage() {
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({
    'shop-1': 1,
    'shop-2': 1,
    'shop-3': 1,
    'shop-4': 1,
  });
  const [activePage, setActivePage] = useState(1);

  const handleQtyChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Header Title */}
        <div style={styles.headerArea}>
          <div>
            <h1 className="heading-xl" style={styles.title}>shop now</h1>
          </div>
          <p style={styles.headerSubtext}>
            this explains color systems and color usages so they are used the way to brand identity portrays
          </p>
        </div>

        {/* Toolbar Bar */}
        <div style={styles.toolbar}>
          <span style={styles.countText}>23 PRODUCTS FOUND</span>
          <button className="btn-pill">Sort By:</button>
        </div>

        {/* Products Single / Dual Column List */}
        <div style={styles.productGrid}>
          {PRODUCTS.map((prod) => (
            <div key={prod.id} style={styles.card}>
              <div style={styles.imgWrapper}>
                <img src={prod.image} alt={prod.title} style={styles.img} />
              </div>

              <div style={styles.cardFooter}>
                <div>
                  <div style={styles.price}>NGN {prod.price.toLocaleString()}</div>
                  <div style={styles.subtitle}>{prod.title}</div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="quantity-control">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQtyChange(prod.id, 1)}
                    >
                      +
                    </button>
                    <span className="quantity-val">{quantities[prod.id]}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQtyChange(prod.id, -1)}
                    >
                      -
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      addToCart({
                        id: prod.id,
                        title: prod.title,
                        subtitle: prod.subtitle,
                        price: prod.price,
                        quantity: quantities[prod.id],
                        image: prod.image,
                      })
                    }
                    className="btn-pill"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div style={styles.pagination}>
          <button className="btn-pill" style={{ marginRight: '1rem' }}>
            Next
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: activePage === page ? '1px solid #FFF' : '1px solid rgba(255, 255, 255, 0.2)',
                background: activePage === page ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: '#FFF',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <section style={styles.bottomBanner}>
          <div style={{ flex: 1.2 }}>
            <h2 className="heading-xl">
              we <span className="metallic-pill-badge" /> know <br />
              how to make this <br />
              special
            </h2>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start' }}>
            <p className="text-muted">
              this explains color systems and color usages so they are used the way to brand identity portrays
            </p>
            <Link href="/customize" className="btn-pill btn-pill-dark">
              Order Now
            </Link>
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
  headerArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '2rem',
    marginBottom: '3rem',
  },
  title: {
    textTransform: 'lowercase',
  },
  headerSubtext: {
    maxWidth: '360px',
    fontSize: '0.8rem',
    color: '#888888',
    lineHeight: '1.5',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  countText: {
    fontSize: '0.78rem',
    letterSpacing: '0.1em',
    color: '#888888',
  },
  productGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3.5rem',
    marginBottom: '4rem',
  },
  card: {
    backgroundColor: '#161616',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  imgWrapper: {
    width: '100%',
    height: '540px',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardFooter: {
    padding: '1.8rem 2.2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  price: {
    fontSize: '1.4rem',
    fontWeight: '300',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#888888',
    marginTop: '2px',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '6rem',
  },
  bottomBanner: {
    padding: '5rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '3rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
};
