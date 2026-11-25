import { NextResponse } from 'next/server';
import { sendEmail, getGiftReadyHtml, getOrderConfirmationHtml, stageFor } from '@/lib/mailer';
import { validateAdminRequest } from '@/lib/auth';
import { deleteObject, objectKeyFromUrl } from '@/lib/storage';
import { MAX_PAGES, generateAccessCode, normaliseCode } from '@/lib/keepsake';
import { assertDurable, backendName, deleteOrder, getOrderById, listOrders, saveOrder } from '@/lib/orders-store';

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
      access,
      sendNotification,
      packageUrl,
      personalizationNote,
      audioUrl,
      customPhoto,
      experience,
      recipientName,
      recipientEmail,
      purchaserName,
      purchaserEmail,
      fulfillmentType,
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

    // Suspension is deliberately separate from the fulfilment stage: a parcel
    // can be out for delivery while the code is revoked, and a code can be
    // revoked long after the gift was opened.
    if (access === 'active' || access === 'suspended') {
      orders[index].access = access;
      orders[index].accessChangedAt = new Date().toISOString();
    }

    // Details are editable after the fact — a mistyped address should not
    // mean recreating the order and reissuing the code.
    const editable = {
      recipientName,
      recipientEmail,
      purchaserName,
      purchaserEmail,
      fulfillmentType,
    };
    for (const [field, value] of Object.entries(editable)) {
      if (value !== undefined) orders[index][field] = value;
    }

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

/**
 * DELETE /api/admin/orders — remove an order and the media that belongs to it.
 *
 * The access code must be supplied alongside the id and must match. Deleting a
 * keepsake is irreversible and takes a customer's photographs with it, so a
 * stray request carrying only an id does not get to do it.
 */
export async function DELETE(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  try {
    const body = await request.json().catch(() => ({}));
    const { id, accessCode } = body;

    if (!id || !accessCode) {
      return NextResponse.json(
        { success: false, error: 'Both the order id and its access code are required.' },
        { status: 400 }
      );
    }

    assertDurable();
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (normaliseCode(order.accessCode) !== normaliseCode(accessCode)) {
      return NextResponse.json(
        { success: false, error: 'The access code does not match this order.' },
        { status: 409 }
      );
    }

    // Take the media with it. Keys are derived from the stored URLs, so this
    // reaches files uploaded before the order had an id as well.
    const experience = order.experience || {};
    const mediaUrls = [
      ...(experience.pages || []).map((p) => p && p.imageUrl),
      experience.voiceNoteUrl,
      experience.backgroundMusicUrl,
      order.customPhoto,
      order.audioUrl,
    ];

    const media = { removed: 0, failed: 0 };
    for (const key of [...new Set(mediaUrls.map(objectKeyFromUrl).filter(Boolean))]) {
      try {
        await deleteObject(key);
        media.removed += 1;
      } catch {
        // A file that will not delete must not strand the record; the object
        // is unreachable without the record anyway.
        media.failed += 1;
      }
    }

    const removed = await deleteOrder(order);

    return NextResponse.json({
      success: true,
      removed,
      media,
      message: `Order ${order.id} and ${media.removed} media file(s) deleted.`,
    });
  } catch (err) {
    console.error('Order delete error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
