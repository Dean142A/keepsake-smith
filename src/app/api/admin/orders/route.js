import { NextResponse } from 'next/server';
import { sendEmail, getGiftReadyHtml, getOrderConfirmationHtml, stageFor } from '@/lib/mailer';
import { validateAdminRequest } from '@/lib/auth';
import { MAX_PAGES } from '@/lib/keepsake';
import {
  listOrders,
  saveOrder,
  getOrderById,
  assertDurable,
  backendName,
} from '@/lib/orders-store';

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

  const orders = await listOrders();
  return NextResponse.json({ success: true, orders, storage: backendName() });
}

// POST /api/admin/orders - Create single order manually OR bulk import from daily CSV
export async function POST(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const body = await request.json();
    assertDurable();
    let orders = await listOrders();

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

      // Saved individually so two instances importing at once cannot clobber
      // each other's rows.
      for (const o of createdOrders) await saveOrder(o);
      orders = [...createdOrders, ...orders];

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

    await saveOrder(newOrder);
    orders.unshift(newOrder);

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

    assertDurable();
    const existing = await getOrderById(id);
    const orders = existing ? [existing] : [];
    const index = existing ? 0 : -1;

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
    await saveOrder(orders[index]);

    let emailSent = false;

    // A fulfilment milestone writes to both people: a warm note to whoever
    // receives the gift, a progress note to whoever paid for it. Only a real
    // change of stage sends, unless the operator asked to re-send.
    const stage = stageFor(status);
    const stageChanged = Boolean(status) && status !== prevStatus;
    const deliveries = [];

    if (stage && (stageChanged || sendNotification)) {
      const order = orders[index];
      const payload = {
        recipientName: order.recipientName || order.purchaserName,
        purchaserName: order.purchaserName,
        accessCode: order.accessCode,
        orderId: order.id,
      };

      const audiences = [
        ['recipient', order.recipientEmail || order.purchaserEmail, stage.recipient],
        ['purchaser', order.purchaserEmail, stage.purchaser],
      ];

      const seen = new Set();
      for (const [who, address, template] of audiences) {
        // One person often plays both parts; do not mail them twice.
        if (!address || seen.has(address.toLowerCase())) continue;
        seen.add(address.toLowerCase());

        const { subject, html } = template(payload);
        const res = await sendEmail({ to: address, subject, html });
        deliveries.push({ who, to: address, sent: res.success, error: res.error });
      }

      emailSent = deliveries.some((d) => d.sent);
      orders[index].notifications = [
        ...(orders[index].notifications || []),
        { stage: status, at: new Date().toISOString(), deliveries },
      ];
      await saveOrder(orders[index]);
    }

    return NextResponse.json({
      success: true,
      order: orders[index],
      emailSent,
      deliveries,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
