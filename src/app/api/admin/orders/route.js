import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendEmail, getGiftReadyHtml, getOrderConfirmationHtml } from '@/lib/mailer';
import { validateAdminRequest } from '@/lib/auth';
import { MAX_PAGES } from '@/lib/keepsake';

/**
 * Normalise whatever the admin submitted into the stored experience shape.
 * Accepts the rich payload from the create-order form, and falls back to the
 * legacy single-photo fields so CSV imports keep working.
 */
function buildExperiencePayload(experience, legacy = {}) {
  const pages = Array.isArray(experience?.pages)
    ? experience.pages
        .map((p) => ({
          imageUrl: (p?.imageUrl || '').trim(),
          caption: (p?.caption || '').trim(),
        }))
        .filter((p) => p.imageUrl)
        .slice(0, MAX_PAGES)
    : legacy.customPhoto
      ? [{ imageUrl: legacy.customPhoto, caption: '' }]
      : [];

  return {
    title: (experience?.title || '').trim(),
    letter: {
      body: (experience?.letter?.body ?? legacy.personalizationNote ?? '').trim(),
      signature: (experience?.letter?.signature || legacy.purchaserName || '').trim(),
    },
    pages,
    voiceNoteUrl: (experience?.voiceNoteUrl || '').trim(),
    backgroundMusicUrl: (experience?.backgroundMusicUrl || legacy.audioUrl || '').trim(),
  };
}


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

// GET /api/admin/orders - Get all orders queue
export async function GET(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  const orders = readOrders();
  return NextResponse.json({ success: true, orders });
}

// POST /api/admin/orders - Create single order manually OR bulk import from daily CSV
export async function POST(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const body = await request.json();
    let orders = readOrders();

    // 1. Bulk CSV Import Mode
    if (body.bulk && Array.isArray(body.items)) {
      const createdOrders = [];
      const now = new Date().toISOString();

      for (const row of body.items) {
        if (!row.purchaserName && !row.recipientName) continue;

        const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
        const accessCode = generateAccessCode();

        const newOrder = {
          id: orderId,
          purchaserName: (row.purchaserName || 'Anonymous Gifter').trim(),
          purchaserEmail: (row.purchaserEmail || '').trim(),
          recipientType: row.recipientType || 'gift',
          recipientName: (row.recipientName || row.purchaserName || 'Valued Recipient').trim(),
          recipientEmail: (row.recipientEmail || row.purchaserEmail || '').trim(),
          fulfillmentType: row.fulfillmentType || 'digital_physical',
          status: row.status || 'in_production',
          totalAmount: Number(row.totalAmount || 29000),
          accessCode,
          personalizationNote: row.personalizationNote || row.message || 'We craft gifts that are truly memorable.',
          customPhoto: row.customPhoto || row.photoUrl || '',
          audioUrl: row.audioUrl || '',
          experience: buildExperiencePayload(null, {
            personalizationNote: row.personalizationNote || row.message,
            customPhoto: row.customPhoto || row.photoUrl,
            audioUrl: row.audioUrl,
            purchaserName: row.purchaserName,
          }),
          items: [
            {
              id: '3d-keepsake-experience',
              title: row.experienceTitle || 'Custom 3D Keepsake Book Experience',
              quantity: 1,
            },
          ],
          createdAt: now,
          updatedAt: now,
        };

        createdOrders.push(newOrder);
      }

      orders = [...createdOrders, ...orders];
      writeOrders(orders);

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${createdOrders.length} orders`,
        count: createdOrders.length,
        createdOrders,
        orders,
      });
    }

    // 2. Single Manual Order Creation Mode
    const {
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      personalizationNote,
      customPhoto,
      audioUrl,
      fulfillmentType,
      status,
      sendNotification,
      experience,
    } = body;

    if (!purchaserName && !recipientName) {
      return NextResponse.json(
        { success: false, error: 'Purchaser Name or Recipient Name is required' },
        { status: 400 }
      );
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const accessCode = generateAccessCode();
    const now = new Date().toISOString();

    const newOrder = {
      id: orderId,
      purchaserName: (purchaserName || 'Anonymous Gifter').trim(),
      purchaserEmail: (purchaserEmail || '').trim(),
      recipientType: 'gift',
      recipientName: (recipientName || purchaserName).trim(),
      recipientEmail: (recipientEmail || purchaserEmail || '').trim(),
      fulfillmentType: fulfillmentType || 'digital_physical',
      status: status || 'ready',
      totalAmount: 29000,
      accessCode,
      personalizationNote: personalizationNote || '',
      customPhoto: customPhoto || '',
      audioUrl: audioUrl || '',
      // The experience is what the 3D book renders: an ordered page list plus
      // the letter and voice note. Page count follows the uploaded photos.
      experience: buildExperiencePayload(experience, {
        personalizationNote,
        customPhoto,
        audioUrl,
        purchaserName,
      }),
      items: [
        {
          id: '3d-keepsake-experience',
          title: 'Custom 3D Keepsake Book Experience',
          quantity: 1,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    orders.unshift(newOrder);
    writeOrders(orders);

    let emailSent = false;
    if (sendNotification && newOrder.recipientEmail) {
      try {
        const html = getGiftReadyHtml({
          recipientName: newOrder.recipientName,
          purchaserName: newOrder.purchaserName,
          accessCode: newOrder.accessCode,
        });

        const res = await sendEmail({
          to: newOrder.recipientEmail,
          subject: `Your 3D Keepsake Experience is Ready! (Access Code: ${newOrder.accessCode}) — The Keepsake Smith`,
          html,
        });
        emailSent = res.success;
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
      emailSent,
      orders,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/admin/orders - Update status & production package assets
export async function PUT(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const body = await request.json();
    const {
      id,
      status,
      sendNotification,
      packageUrl,
      personalizationNote,
      audioUrl,
      customPhoto,
      experience,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
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
    if (status) orders[index].status = status;
    if (packageUrl !== undefined) orders[index].packageUrl = packageUrl;
    if (personalizationNote !== undefined) orders[index].personalizationNote = personalizationNote;
    if (audioUrl !== undefined) orders[index].audioUrl = audioUrl;
    if (customPhoto !== undefined) orders[index].customPhoto = customPhoto;

    // Replacing the experience replaces the whole page list, so the book's
    // leaf count tracks the edit rather than keeping stale pages around.
    if (experience !== undefined) {
      orders[index].experience = buildExperiencePayload(experience, {
        personalizationNote: orders[index].personalizationNote,
        customPhoto: orders[index].customPhoto,
        audioUrl: orders[index].audioUrl,
        purchaserName: orders[index].purchaserName,
      });
    }

    orders[index].updatedAt = new Date().toISOString();
    writeOrders(orders);

    let emailSent = false;

    // Send "Gift Ready" notification email if status changed to 'ready' or sendNotification explicitly requested
    if ((status === 'ready' || sendNotification) && (prevStatus !== 'ready' || sendNotification)) {
      const recipientEmail = orders[index].recipientEmail || orders[index].purchaserEmail;
      const recipientName = orders[index].recipientName || orders[index].purchaserName;

      if (recipientEmail) {
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
