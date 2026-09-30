import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendEmail, getGiftReadyHtml } from '@/lib/mailer';

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

// GET /api/admin/orders - Get all orders queue
export async function GET() {
  const orders = readOrders();
  return NextResponse.json({ success: true, orders });
}

// PUT /api/admin/orders - Update status & trigger notification email
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, sendNotification } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status required' },
        { status: 400 }
      );
    }

    let orders = readOrders();
    const index = orders.findIndex((o) => o.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const prevStatus = orders[index].status;
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    writeOrders(orders);

    let emailSent = false;

    // Send "Gift Ready" notification email if marked as 'ready' or sendNotification requested
    if ((status === 'ready' || sendNotification) && prevStatus !== 'ready') {
      const recipientEmail = orders[index].recipientEmail || orders[index].purchaserEmail;
      const recipientName = orders[index].recipientName || orders[index].purchaserName;

      const html = getGiftReadyHtml({
        recipientName,
        purchaserName: orders[index].purchaserName,
        accessCode: orders[index].accessCode,
      });

      const res = await sendEmail({
        to: recipientEmail,
        subject: `Your 3D Keepsake Experience is Ready! — The Keepsake Smith`,
        html,
      });

      emailSent = res.success;
    }

    return NextResponse.json({
      success: true,
      order: orders[index],
      emailSent,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
