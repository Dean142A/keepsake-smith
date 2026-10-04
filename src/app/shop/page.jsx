'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

const DEFAULT_PRODUCTS = [
  {
    id: 'shop-1',
    title: 'Handwritten Cards',
    subtitle: 'maquette dé keepsake',
    price: 30000,
    category: 'CARDS',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'shop-2',
    title: 'Handwritten Cards',
    subtitle: 'black envelope luxury edition',
    price: 30000,
    category: 'CARDS',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'shop-3',
    title: 'Flower Bundle',
    subtitle: 'fresh floral arrangement FLW - 23',
    price: 15000,
    category: 'FLOWERS',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'shop-4',
    title: 'Artisan Chocolates',
    subtitle: 'artisan dark cocoa block CHLTE - 33',
    price: 5900,
    category: 'CHOCOLATES',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=800&auto=format&fit=crop',
  },
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-cards', name: 'CARDS' },
  { id: 'cat-flowers', name: 'FLOWERS' },
  { id: 'cat-chocolates', name: 'CHOCOLATES' },
  { id: 'cat-jewelry', name: 'JEWELRY' },
];

export default function ShopPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [quantities, setQuantities] = useState({});
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    // Load dynamic products
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error('Error loading dynamic products:', err));

    // Load dynamic categories
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error('Error loading dynamic categories:', err));
  }, []);

  const handleQtyChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  // Filter products by selected category
  const filteredProducts = products.filter((prod) => {
    if (!selectedCategory || selectedCategory === 'ALL') return true;
    return (prod.category || '').toUpperCase() === selectedCategory.toUpperCase();
  });

  // Sort products according to selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'name-desc') {
      return b.title.localeCompare(a.title);
    }
    if (sortBy === 'price-asc') {
      return Number(a.price) - Number(b.price);
    }
    if (sortBy === 'price-desc') {
      return Number(b.price) - Number(a.price);
    }
    return 0; // default / featured
  });

  const shopItemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: sortedProducts.map((prod, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: prod.title,
        description: prod.subtitle || 'Luxury Keepsake Card & 3D Experience',
        image: prod.image,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'NGN',
          price: prod.price,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };

  return (
    <div style={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopItemListJsonLd) }}
      />
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

        {/* Dynamic Toolbar with Category & Sort By Dropdowns */}
        <div style={styles.toolbar}>
          <span style={styles.countText}>{sortedProducts.length} PRODUCTS FOUND</span>

          <div style={styles.filterControls}>
            {/* Category Filter Dropdown */}
            <div style={styles.selectWrapper}>
              <label htmlFor="category-select" style={styles.selectLabel}>Category:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setActivePage(1);
                }}
                style={styles.select}
              >
                <option value="ALL" style={styles.option}>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name} style={styles.option}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div style={styles.selectWrapper}>
              <label htmlFor="sort-select" style={styles.selectLabel}>Sort By:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setActivePage(1);
                }}
                style={styles.select}
              >
                <option value="featured" style={styles.option}>Featured</option>
                <option value="name-asc" style={styles.option}>Alphabetical (A - Z)</option>
                <option value="name-desc" style={styles.option}>Alphabetical (Z - A)</option>
                <option value="price-asc" style={styles.option}>Price: Lowest First</option>
                <option value="price-desc" style={styles.option}>Price: Highest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products List (Strict 2x2 Desktop Grid) */}
        {sortedProducts.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ color: '#888', fontSize: '1rem' }}>No products found in category "{selectedCategory}".</p>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="btn-pill"
              style={{ marginTop: '1rem' }}
            >
              Reset Category Filter
            </button>
          </div>
        ) : (
          <div className="shop-grid-2x2">
            {sortedProducts.map((prod) => (
              <div key={prod.id} style={styles.card}>
                <div style={styles.imgWrapper}>
                  <img src={prod.image} alt={prod.title} style={styles.img} />
                </div>

                <div style={styles.cardFooter}>
                  <div>
                    <div style={styles.price}>NGN {prod.price.toLocaleString()}</div>
                    <div style={styles.subtitle}>{prod.title} {prod.subtitle ? `(${prod.subtitle})` : ''}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="quantity-control">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQtyChange(prod.id, 1)}
                      >
                        +
                      </button>
                      <span className="quantity-val">{quantities[prod.id] || 1}</span>
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
                          subtitle: prod.subtitle || 'custom edition',
                          price: prod.price,
                          quantity: quantities[prod.id] || 1,
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
        )}

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
                background: 'transparent',
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
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '2.5rem',
    paddingBottom: '1.25rem',
  },
  countText: {
    fontSize: '0.78rem',
    letterSpacing: '0.1em',
    color: '#888888',
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '9999px',
    padding: '0.45rem 1.25rem',
  },
  selectLabel: {
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    color: '#888888',
    textTransform: 'uppercase',
  },
  select: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
    paddingRight: '0.5rem',
  },
  option: {
    backgroundColor: '#111111',
    color: '#FFFFFF',
  },
  emptyState: {
    textAlign: 'center',
    padding: '5rem 0',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '3.5rem 2rem',
    marginBottom: '4rem',
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: '0px',
    border: 'none',
    overflow: 'hidden',
  },
  imgWrapper: {
    width: '100%',
    height: '460px',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '0px',
  },
  cardFooter: {
    padding: '1.5rem 0',
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
  },
};

