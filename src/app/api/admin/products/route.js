import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

function readProducts() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileData || '[]');
  } catch (err) {
    console.error('Error reading products file:', err);
    return [];
  }
}

function writeProducts(products) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing products file:', err);
  }
}

// GET /api/admin/products - List all products
export async function GET() {
  const products = readProducts();
  return NextResponse.json({ success: true, products });
}

// POST /api/admin/products - Add new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subtitle, price, image, category, allowsCustomization } = body;

    if (!title || !price) {
      return NextResponse.json(
        { success: false, error: 'Title and price are required' },
        { status: 400 }
      );
    }

    const products = readProducts();
    const newProduct = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
      category: (category || 'GENERAL').toUpperCase(),
      allowsCustomization: Boolean(allowsCustomization),
      inStock: true,
      createdAt: new Date().toISOString(),
    };

    products.unshift(newProduct);
    writeProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/products - Edit existing product
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, subtitle, price, image, category, allowsCustomization, inStock } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    let products = readProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    products[index] = {
      ...products[index],
      title: title !== undefined ? title.trim() : products[index].title,
      subtitle: subtitle !== undefined ? subtitle.trim() : products[index].subtitle,
      price: price !== undefined ? Number(price) : products[index].price,
      image: image !== undefined ? image : products[index].image,
      category: category !== undefined ? category.toUpperCase() : products[index].category,
      allowsCustomization: allowsCustomization !== undefined ? Boolean(allowsCustomization) : products[index].allowsCustomization,
      inStock: inStock !== undefined ? Boolean(inStock) : products[index].inStock,
      updatedAt: new Date().toISOString(),
    };

    writeProducts(products);

    return NextResponse.json({ success: true, product: products[index] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/products - Delete product by ID
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    let products = readProducts();
    const filtered = products.filter((p) => p.id !== id);

    if (filtered.length === products.length) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    writeProducts(filtered);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
