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

// POST /api/coupons/validate - Validate coupon code & calculate discount
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { valid: false, message: 'Please enter a promo code.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const totalAmount = Number(amount) || 0;

    const coupons = readCoupons();
    const coupon = coupons.find((c) => c.code && c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: 'Invalid promo code.' },
        { status: 404 }
      );
    }

    if (coupon.active === false) {
      return NextResponse.json(
        { valid: false, message: 'This promo code is no longer active.' },
        { status: 400 }
      );
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json(
        { valid: false, message: 'This promo code has expired.' },
        { status: 400 }
      );
    }

    if (coupon.maxUses && coupon.usageCount && coupon.usageCount >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, message: 'This promo code limit has been reached.' },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((totalAmount * Number(coupon.discountValue)) / 100);
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(totalAmount, Number(coupon.discountValue));
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      message: `Promo code ${coupon.code} applied successfully!`,
    });
  } catch (err) {
    console.error('Coupon validation error:', err);
    return NextResponse.json(
      { valid: false, message: 'Server error validating promo code.' },
      { status: 500 }
    );
  }
}
