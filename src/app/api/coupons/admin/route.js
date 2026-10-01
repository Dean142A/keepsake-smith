import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const couponsFilePath = path.join(process.cwd(), 'src', 'data', 'coupons.json');

function readCoupons() {
  try {
    if (!fs.existsSync(couponsFilePath)) return [];
    return JSON.parse(fs.readFileSync(couponsFilePath, 'utf8') || '[]');
  } catch (err) {
    console.error('Error reading coupons file:', err);
    return [];
  }
}

function writeCoupons(coupons) {
  try {
    const dir = path.dirname(couponsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(couponsFilePath, JSON.stringify(coupons, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing coupons file:', err);
  }
}

// GET /api/coupons/admin - List all coupons
export async function GET() {
  const coupons = readCoupons();
  return NextResponse.json({ success: true, coupons });
}

// POST /api/coupons/admin - Create a new coupon code
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, discountType, discountValue, active, maxUses, expiryDate } = body;

    if (!code || !code.trim() || !discountValue) {
      return NextResponse.json(
        { success: false, error: 'Coupon code and discount value are required' },
        { status: 400 }
      );
    }

    const coupons = readCoupons();
    const cleanCode = code.trim().toUpperCase();

    if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
      return NextResponse.json(
        { success: false, error: `Coupon code "${cleanCode}" already exists` },
        { status: 400 }
      );
    }

    const newCoupon = {
      id: `coup-${Date.now()}`,
      code: cleanCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      active: active !== false,
      expiryDate: expiryDate || null,
      usageCount: 0,
      maxUses: maxUses ? Number(maxUses) : null,
      createdAt: new Date().toISOString(),
    };

    coupons.unshift(newCoupon);
    writeCoupons(coupons);

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/coupons/admin - Update existing coupon (e.g. toggle active state)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, code, discountType, discountValue, active, maxUses, expiryDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID is required' }, { status: 400 });
    }

    const coupons = readCoupons();
    const idx = coupons.findIndex((c) => c.id === id);

    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    if (code) coupons[idx].code = code.trim().toUpperCase();
    if (discountType) coupons[idx].discountType = discountType;
    if (discountValue !== undefined) coupons[idx].discountValue = Number(discountValue);
    if (active !== undefined) coupons[idx].active = Boolean(active);
    if (maxUses !== undefined) coupons[idx].maxUses = maxUses ? Number(maxUses) : null;
    if (expiryDate !== undefined) coupons[idx].expiryDate = expiryDate || null;

    writeCoupons(coupons);

    return NextResponse.json({ success: true, coupon: coupons[idx] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/coupons/admin - Delete a coupon
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Coupon ID required' }, { status: 400 });
    }

    let coupons = readCoupons();
    coupons = coupons.filter((c) => c.id !== id);
    writeCoupons(coupons);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
