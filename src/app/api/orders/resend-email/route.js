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

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, email } = body;

    if (!orderId && !email) {
      return NextResponse.json(
        { success: false, error: 'Order ID or Email address required' },
        { status: 400 }
      );
    }

    const orders = readOrders();
    const order = orders.find((o) => {
      if (orderId && o.id.toUpperCase() === orderId.trim().toUpperCase()) return true;
      if (email && o.purchaserEmail.toUpperCase() === email.trim().toUpperCase()) return true;
      return false;
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found for email dispatch' },
        { status: 404 }
      );
    }

    const htmlContent = getOrderConfirmationHtml({
      orderId: order.id,
      purchaserName: order.purchaserName,
      totalAmount: order.totalAmount,
      accessCode: order.accessCode,
    });

    const result = await sendEmail({
      to: order.purchaserEmail,
      subject: `Resent: Order Access Code #${order.id} — The Keepsake Smith`,
      html: htmlContent,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Order confirmation & 12-char access code resent to ${order.purchaserEmail}!`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to dispatch email' },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
