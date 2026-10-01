/**
 * The Keepsake Smith — Database Abstraction Layer
 * Supports PostgreSQL / Supabase pool connections when DATABASE_URL is set,
 * with seamless fallback to local JSON persistence files during development.
 */

import fs from 'fs';
import path from 'path';

// Helper paths for fallback JSON data files
const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'src', 'data', 'products.json');
const CATEGORIES_FILE = path.join(process.cwd(), 'src', 'data', 'categories.json');

// Check if a live PostgreSQL / MySQL connection string is provided
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pgPool = null;

if (DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  } catch (err) {
    console.warn('PostgreSQL client initialized without pg package; running with file fallback.');
  }
}

/**
 * Execute SQL Query or fallback to JSON data reader
 */
export async function query(text, params = []) {
  if (pgPool) {
    try {
      const res = await pgPool.query(text, params);
      return res;
    } catch (err) {
      console.error('SQL Query error:', err);
      throw err;
    }
  }
  return null;
}

/**
 * Helper: Read Orders from DB or JSON
 */
export async function getOrders() {
  if (pgPool) {
    const res = await query('SELECT * FROM orders ORDER BY created_at DESC');
    return res.rows.map((r) => ({
      id: r.id,
      purchaserName: r.purchaser_name,
      purchaserEmail: r.purchaser_email,
      recipientType: r.recipient_type,
      recipientName: r.recipient_name,
      recipientEmail: r.recipient_email,
      fulfillmentType: r.fulfillment_type,
      status: r.status,
      totalAmount: Number(r.total_amount),
      accessCode: r.access_code,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      createdAt: r.created_at,
    }));
  }

  // JSON Fallback
  try {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}

/**
 * Helper: Read Categories from DB or JSON
 */
export async function getCategories() {
  if (pgPool) {
    const res = await query('SELECT * FROM categories ORDER BY name ASC');
    return res.rows;
  }

  try {
    if (!fs.existsSync(CATEGORIES_FILE)) return [];
    return JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}

/**
 * Helper: Read Products from DB or JSON
 */
export async function getProducts() {
  if (pgPool) {
    const res = await query('SELECT * FROM products ORDER BY title ASC');
    return res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      price: Number(r.price),
      category: r.category,
      image: r.image,
      allowsCustomization: r.allows_customization,
    }));
  }

  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8') || '[]');
  } catch (err) {
    return [];
  }
}
