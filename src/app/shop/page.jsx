'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ChevronDown, Check } from 'lucide-react';

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
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [activePage, setActivePage] = useState(1);

  const sortRef = useRef(null);
  const categoryRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            {/* Sort By Custom Pill Dropdown */}
            <div style={{ position: 'relative' }} ref={sortRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(!isSortOpen);
                  setIsCategoryOpen(false);
                }}
                style={{
                  ...styles.pillBtn,
                  borderColor: isSortOpen ? '#C5A059' : 'rgba(255, 255, 255, 0.25)',
                }}
                aria-expanded={isSortOpen}
              >
                <span>
                  {sortBy === 'featured'
                    ? 'Sort By:'
                    : `Sort By: ${
                        sortBy === 'name-asc'
                          ? 'A - Z'
                          : sortBy === 'name-desc'
                          ? 'Z - A'
                          : sortBy === 'price-asc'
                          ? 'Lowest Price'
                          : 'Highest Price'
                      }`}
                </span>
                <ChevronDown
                  size={15}
                  color={isSortOpen ? '#C5A059' : '#C9C9C9'}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {isSortOpen && (
                <div style={styles.dropdownPopover}>
                  <div style={styles.dropdownHeader}>Sort Products</div>
                  {[
                    { value: 'featured', label: 'Featured' },
                    { value: 'name-asc', label: 'Alphabetical (A - Z)' },
                    { value: 'name-desc', label: 'Alphabetical (Z - A)' },
                    { value: 'price-asc', label: 'Price: Lowest First' },
                    { value: 'price-desc', label: 'Price: Highest First' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsSortOpen(false);
                        setActivePage(1);
                      }}
                      style={{
                        ...styles.dropdownItem,
                        backgroundColor: sortBy === opt.value ? 'rgba(197, 160, 89, 0.12)' : 'transparent',
                        color: sortBy === opt.value ? '#C5A059' : '#E5E5E5',
                        fontWeight: sortBy === opt.value ? 400 : 300,
                      }}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <Check size={14} color="#C5A059" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Custom Pill Dropdown */}
            <div style={{ position: 'relative' }} ref={categoryRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsSortOpen(false);
                }}
                style={{
                  ...styles.pillBtn,
                  borderColor: isCategoryOpen ? '#C5A059' : 'rgba(255, 255, 255, 0.25)',
                }}
                aria-expanded={isCategoryOpen}
              >
                <span>
                  {selectedCategory === 'ALL'
                    ? 'Category'
                    : `Category: ${selectedCategory}`}
                </span>
                <ChevronDown
                  size={15}
                  color={isCategoryOpen ? '#C5A059' : '#C9C9C9'}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: isCategoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {isCategoryOpen && (
                <div style={styles.dropdownPopover}>
                  <div style={styles.dropdownHeader}>Filter by Category</div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setIsCategoryOpen(false);
                      setActivePage(1);
                    }}
                    style={{
                      ...styles.dropdownItem,
                      backgroundColor: selectedCategory === 'ALL' ? 'rgba(197, 160, 89, 0.12)' : 'transparent',
                      color: selectedCategory === 'ALL' ? '#C5A059' : '#E5E5E5',
                      fontWeight: selectedCategory === 'ALL' ? 400 : 300,
                    }}
                  >
                    <span>All Categories</span>
                    {selectedCategory === 'ALL' && <Check size={14} color="#C5A059" />}
                  </button>
                  {categories.map((cat) => {
                    const catName = cat.name || cat;
                    const isSelected = selectedCategory.toUpperCase() === catName.toUpperCase();
                    return (
                      <button
                        key={cat.id || catName}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(catName);
                          setIsCategoryOpen(false);
                          setActivePage(1);
                        }}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor: isSelected ? 'rgba(197, 160, 89, 0.12)' : 'transparent',
                          color: isSelected ? '#C5A059' : '#E5E5E5',
                          fontWeight: isSelected ? 400 : 300,
                        }}
                      >
                        <span>{catName}</span>
                        {isSelected && <Check size={14} color="#C5A059" />}
                      </button>
                    );
                  })}
                </div>
              )}
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
  pillBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.55rem 1.4rem',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '9999px',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: '0.84rem',
    fontWeight: '300',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  },
  dropdownPopover: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '220px',
    backgroundColor: '#161616',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '0.45rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.75)',
    zIndex: 100,
    backdropFilter: 'blur(16px)',
  },
  dropdownHeader: {
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#777777',
    padding: '0.5rem 0.75rem 0.35rem 0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '0.25rem',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0.6rem 0.85rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.82rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease, color 0.15s ease',
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

