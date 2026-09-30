import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const categoriesFilePath = path.join(process.cwd(), 'src', 'data', 'categories.json');

function readCategories() {
  try {
    if (!fs.existsSync(categoriesFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(categoriesFilePath, 'utf8');
    return JSON.parse(fileData || '[]');
  } catch (err) {
    console.error('Error reading categories file:', err);
    return [];
  }
}

function writeCategories(categories) {
  try {
    const dir = path.dirname(categoriesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing categories file:', err);
  }
}

// GET /api/admin/categories - List all categories
export async function GET() {
  const categories = readCategories();
  return NextResponse.json({ success: true, categories });
}

// POST /api/admin/categories - Create new category
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const categories = readCategories();
    const formattedName = name.trim().toUpperCase();

    // Check duplicate name
    if (categories.some((c) => c.name === formattedName)) {
      return NextResponse.json(
        { success: false, error: `Category "${formattedName}" already exists.` },
        { status: 400 }
      );
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: formattedName,
      slug: formattedName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: (description || '').trim(),
      createdAt: new Date().toISOString(),
    };

    categories.push(newCategory);
    writeCategories(categories);

    return NextResponse.json({ success: true, category: newCategory });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/categories - Edit existing category
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    let categories = readCategories();
    const index = categories.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const formattedName = name ? name.trim().toUpperCase() : categories[index].name;

    categories[index] = {
      ...categories[index],
      name: formattedName,
      slug: formattedName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: description !== undefined ? description.trim() : categories[index].description,
      updatedAt: new Date().toISOString(),
    };

    writeCategories(categories);

    return NextResponse.json({ success: true, category: categories[index] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/categories?id=XYZ - Delete category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID parameter is required' },
        { status: 400 }
      );
    }

    let categories = readCategories();
    const initialCount = categories.length;
    categories = categories.filter((c) => c.id !== id);

    if (categories.length === initialCount) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    writeCategories(categories);

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
