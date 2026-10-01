import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter an Order ID or Email address.' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim().replace(/^#/, '').toUpperCase();
    const orders = readOrders();

    const matchedOrder = orders.find((o) => {
      if (o.id && o.id.toUpperCase() === cleanQuery) return true;
      if (o.accessCode && o.accessCode.toUpperCase() === cleanQuery) return true;
      if (o.purchaserEmail && o.purchaserEmail.toUpperCase() === cleanQuery) return true;
      if (o.recipientEmail && o.recipientEmail.toUpperCase() === cleanQuery) return true;
      return false;
    });

    if (!matchedOrder) {
      return NextResponse.json(
        { success: false, error: 'No order matching your Order ID or Email was found.' },
        { status: 444 }
      );
    }

    // Build timeline steps
    const isReady = matchedOrder.status === 'ready' || matchedOrder.status === 'completed' || matchedOrder.status === 'delivered';
    const isDelivered = matchedOrder.status === 'delivered' || matchedOrder.status === 'completed';

    const timeline = [
      {
        title: 'Order Placed & Paid',
        desc: 'Payment confirmed via Paystack gateway',
        date: matchedOrder.createdAt ? new Date(matchedOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Confirmed',
        completed: true,
      },
      {
        title: '3D WebGL Package Prepared',
        desc: 'Interactive 3D digital scene generated and bound to 12-char key',
        date: matchedOrder.createdAt ? 'Prepared' : 'Pending',
        completed: true,
      },
      {
        title: 'Physical Card Handcrafted',
        desc: 'Engraved, textured paperboard artisan crafting in progress',
        date: isReady ? 'Completed' : 'In Production',
        completed: isReady,
        active: !isReady,
      },
      {
        title: 'Out for Delivery / Delivered',
        desc: 'Dispatched to delivery address or courier express',
        date: isDelivered ? 'Delivered' : 'Pending',
        completed: isDelivered,
        active: isDelivered,
      },
    ];

    return NextResponse.json({
      success: true,
      order: {
        id: matchedOrder.id,
        purchaserName: matchedOrder.purchaserName,
        purchaserEmail: matchedOrder.purchaserEmail,
        recipientName: matchedOrder.recipientName || matchedOrder.purchaserName,
        recipientEmail: matchedOrder.recipientEmail || matchedOrder.purchaserEmail,
        fulfillmentType: matchedOrder.fulfillmentType || 'physical_card',
        status: matchedOrder.status || 'in_production',
        accessCode: matchedOrder.accessCode,
        items: matchedOrder.items || [],
        totalAmount: matchedOrder.totalAmount,
        createdAt: matchedOrder.createdAt,
        shippingAddress: matchedOrder.shippingAddress || null,
        timeline,
      },
    });
  } catch (err) {
    console.error('Order tracking API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const query = body.query || body.orderId || body.email;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter an Order ID or Email address.' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim().replace(/^#/, '').toUpperCase();
    const orders = readOrders();

    const matchedOrder = orders.find((o) => {
      if (o.id && o.id.toUpperCase() === cleanQuery) return true;
      if (o.accessCode && o.accessCode.toUpperCase() === cleanQuery) return true;
      if (o.purchaserEmail && o.purchaserEmail.toUpperCase() === cleanQuery) return true;
      if (o.recipientEmail && o.recipientEmail.toUpperCase() === cleanQuery) return true;
      return false;
    });

    if (!matchedOrder) {
      return NextResponse.json(
        { success: false, error: 'No order matching your Order ID or Email was found.' },
        { status: 404 }
      );
    }

    const isReady = matchedOrder.status === 'ready' || matchedOrder.status === 'completed' || matchedOrder.status === 'delivered';
    const isDelivered = matchedOrder.status === 'delivered' || matchedOrder.status === 'completed';

    const timeline = [
      {
        title: 'Order Placed & Paid',
        desc: 'Payment confirmed via Paystack gateway',
        date: matchedOrder.createdAt ? new Date(matchedOrder.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Confirmed',
        completed: true,
      },
      {
        title: '3D WebGL Package Prepared',
        desc: 'Interactive 3D digital scene generated and bound to 12-char key',
        date: 'Prepared',
        completed: true,
      },
      {
        title: 'Physical Card Handcrafted',
        desc: 'Engraved, textured paperboard artisan crafting in progress',
        date: isReady ? 'Completed' : 'In Production',
        completed: isReady,
        active: !isReady,
      },
      {
        title: 'Out for Delivery / Delivered',
        desc: 'Dispatched to delivery address or courier express',
        date: isDelivered ? 'Delivered' : 'Pending',
        completed: isDelivered,
        active: isDelivered,
      },
    ];

    return NextResponse.json({
      success: true,
      order: {
        id: matchedOrder.id,
        purchaserName: matchedOrder.purchaserName,
        purchaserEmail: matchedOrder.purchaserEmail,
        recipientName: matchedOrder.recipientName || matchedOrder.purchaserName,
        recipientEmail: matchedOrder.recipientEmail || matchedOrder.purchaserEmail,
        fulfillmentType: matchedOrder.fulfillmentType || 'physical_card',
        status: matchedOrder.status || 'in_production',
        accessCode: matchedOrder.accessCode,
        items: matchedOrder.items || [],
        totalAmount: matchedOrder.totalAmount,
        createdAt: matchedOrder.createdAt,
        shippingAddress: matchedOrder.shippingAddress || null,
        timeline,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
