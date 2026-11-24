import { NextResponse } from 'next/server';
import { sendEmail, getOrderConfirmationHtml } from '@/lib/mailer';
import { listOrders, getOrderById } from '@/lib/orders-store';

/**
 * Re-sends the order confirmation. This used to read src/data/orders.json
 * straight off the container filesystem, which is empty in production now
 * that orders live in the durable store, so every lookup 404'd.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, email } = body;

    if (!orderId && !email) {
      return NextResponse.json(
        { success: false, error: 'Order ID or Email address required' },
        { status: 400 }
      );
    }

    let order = null;
    if (orderId) {
      order = await getOrderById(orderId.trim());
    }
    if (!order && email) {
      const wanted = email.trim().toLowerCase();
      const all = await listOrders();
      order = all.find((o) => (o.purchaserEmail || '').toLowerCase() === wanted) || null;
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found for email dispatch' },
        { status: 404 }
      );
    }

    if (!order.purchaserEmail) {
      return NextResponse.json(
        { success: false, error: 'This order has no purchaser email address on file' },
        { status: 422 }
      );
    }

    const result = await sendEmail({
      to: order.purchaserEmail,
      subject: `Resent: Order Access Code #${order.id} — The Keepsake Smith`,
      html: getOrderConfirmationHtml({
        orderId: order.id,
        purchaserName: order.purchaserName,
        totalAmount: order.totalAmount,
        accessCode: order.accessCode,
      }),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'The mail provider rejected the message' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order confirmation and access code resent to ${order.purchaserEmail}`,
    });
  } catch (err) {
    console.error('Resend email error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
