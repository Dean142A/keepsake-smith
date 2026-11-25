import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sendEmail, getOrderConfirmationHtml } from '@/lib/mailer';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

function readOrders() {
  try {
    if (!fs.existsSync(ordersFilePath)) return [];
    return JSON.parse(fs.readFileSync(ordersFilePath, 'utf8') || '[]');
  } catch (err) {
    console.error('Webhook error reading orders:', err);
    return [];
  }
}

function writeOrders(orders) {
  try {
    const dir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Webhook error writing orders:', err);
  }
}

// POST /api/paystack/webhook — Secure Paystack Webhook Handler
export async function POST(request) {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const signature = request.headers.get('x-paystack-signature');

    const rawBody = await request.text();

    // An unsigned webhook is an open door to marking any order paid, so a
    // missing secret or a missing signature is a rejection rather than a
    // reason to skip the check.
    if (!paystackSecret) {
      console.error('[Paystack] PAYSTACK_SECRET_KEY is not set — refusing to accept webhooks.');
      return NextResponse.json(
        { success: false, error: 'Payment webhooks are not configured on this environment.' },
        { status: 503 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payload signature' },
        { status: 401 }
      );
    }

    const expected = crypto.createHmac('sha512', paystackSecret).update(rawBody).digest('hex');
    const provided = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');

    if (
      provided.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(provided, expectedBuf)
    ) {
      console.warn('Paystack webhook signature mismatch.');
      return NextResponse.json(
        { success: false, error: 'Invalid payload signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody || '{}');
    const { event, data } = payload;

    // Handle payment success event
    if (event === 'charge.success' && data) {
      const reference = data.reference;
      const amount = (data.amount || 0) / 100; // Paystack amount is in kobo/cents
      const metadata = data.metadata || {};
      const customerEmail = data.customer?.email;

      let orders = readOrders();
      const orderIndex = orders.findIndex(
        (o) => o.reference === reference || o.id === metadata.orderId
      );

      if (orderIndex !== -1) {
        orders[orderIndex].paymentStatus = 'paid';
        orders[orderIndex].status = 'in_production';
        orders[orderIndex].paystackTransactionId = data.id;
        orders[orderIndex].updatedAt = new Date().toISOString();
        writeOrders(orders);

        // Dispatch Confirmation Email
        try {
          const htmlContent = getOrderConfirmationHtml({
            orderId: orders[orderIndex].id,
            purchaserName: orders[orderIndex].purchaserName,
            totalAmount: amount || orders[orderIndex].totalAmount,
            accessCode: orders[orderIndex].accessCode,
          });

          sendEmail({
            to: customerEmail || orders[orderIndex].purchaserEmail,
            subject: `Payment Confirmed! Access Code #${orders[orderIndex].accessCode} — The Keepsake Smith`,
            html: htmlContent,
          }).catch((e) => console.error('Webhook Brevo email dispatch error:', e));
        } catch (emailErr) {
          console.error('Failed dispatching webhook order email:', emailErr);
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err) {
    console.error('Paystack Webhook Exception:', err);
    return NextResponse.json(
      { success: false, error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
