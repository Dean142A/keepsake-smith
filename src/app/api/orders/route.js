import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendEmail, getOrderConfirmationHtml } from '@/lib/mailer';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

function readOrders() {
  try {
    if (!fs.existsSync(ordersFilePath)) return [];
    return JSON.parse(fs.readFileSync(ordersFilePath, 'utf8') || '[]');
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

function writeOrders(orders) {
  try {
    const dir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing orders file:', err);
  }
}

function generateAccessCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'KPSK-';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/orders - Create new order & generate 12-char access code
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      purchaserName,
      purchaserEmail,
      recipientType,
      recipientName,
      recipientEmail,
      fulfillmentType,
      items,
      totalAmount,
    } = body;

    if (!purchaserName || !purchaserEmail || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Purchaser details and order items are required' },
        { status: 400 }
      );
    }

    const orders = readOrders();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const accessCode = generateAccessCode();

    const newOrder = {
      id: orderId,
      purchaserName: purchaserName.trim(),
      purchaserEmail: purchaserEmail.trim(),
      recipientType: recipientType || 'self',
      recipientName: recipientName ? recipientName.trim() : null,
      recipientEmail: recipientEmail ? recipientEmail.trim() : null,
      fulfillmentType: fulfillmentType || 'digital_only',
      status: 'in_production',
      totalAmount: Number(totalAmount || 0),
      accessCode,
      items,
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    writeOrders(orders);

    // Trigger Brevo Order Confirmation Email
    const htmlContent = getOrderConfirmationHtml({
      orderId: newOrder.id,
      purchaserName: newOrder.purchaserName,
      totalAmount: newOrder.totalAmount,
      accessCode: newOrder.accessCode,
    });

    sendEmail({
      to: newOrder.purchaserEmail,
      subject: `Order Confirmation #${newOrder.id} — The Keepsake Smith`,
      html: htmlContent,
    }).catch((e) => console.error('Email send failed:', e));

    return NextResponse.json({
      success: true,
      order: newOrder,
      accessCode,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET /api/orders - Get orders (for user lookup or testing)
export async function GET() {
  const orders = readOrders();
  return NextResponse.json({ success: true, orders });
}
