/**
 * Brevo Mailer Integration for The Keepsake Smith
 * Supports Brevo Transactional Email API (https://api.brevo.com/v3/smtp/email)
 */

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'orders@thekeepsakesmith.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'The Keepsake Smith';

  if (!apiKey) {
    // In production a missing key must not look like a sent email: reporting
    // success here would hide every undelivered gift notification, the same
    // way continue-on-error hid the broken deploy.
    if (process.env.NODE_ENV === 'production') {
      console.error('[Mailer] BREVO_API_KEY is not set — refusing to report a simulated send as delivered.');
      return {
        success: false,
        error: 'Email is not configured on this environment (BREVO_API_KEY missing).',
      };
    }

    console.log('----------------------------------------------------');
    console.log(`[Brevo Mailer Simulation] (Set BREVO_API_KEY in env to send live)`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('----------------------------------------------------');
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text || subject,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Brevo API Error:', data);
      return { success: false, error: data.message || 'Brevo API request failed' };
    }

    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error('Mailer Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * HTML Template: Order Confirmation
 */
export function getOrderConfirmationHtml({ orderId, purchaserName, totalAmount, accessCode }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #111111; color: #FFFFFF; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #171717; border: 1px solid rgba(255,255,255,0.15); padding: 40px; }
    .logo { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #C5A059; margin-bottom: 30px; }
    h1 { font-size: 28px; font-weight: 300; margin-bottom: 15px; color: #FFFFFF; }
    p { font-size: 14px; color: #AAAAAA; line-height: 1.6; }
    .code-box { background-color: #0F0F0F; border: 1px solid #C5A059; padding: 20px; text-align: center; margin: 30px 0; }
    .code { font-family: monospace; font-size: 24px; letter-spacing: 4px; color: #FFFFFF; font-weight: bold; }
    .btn { display: inline-block; padding: 14px 32px; border: 1px solid #FFFFFF; border-radius: 9999px; color: #FFFFFF; text-decoration: none; font-size: 13px; letter-spacing: 1px; margin-top: 20px; }
    .footer { margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 11px; color: #666666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">The Keepsake Smith</div>
    <h1>Order Confirmed</h1>
    <p>Dear ${purchaserName},</p>
    <p>Thank you for your order (<strong>#${orderId}</strong>). Our artisans are now crafting your custom keepsake experience.</p>
    
    <div class="code-box">
      <div style="font-size: 11px; letter-spacing: 2px; color: #888888; margin-bottom: 8px;">YOUR 12-CHAR ACCESS CODE</div>
      <div class="code">${accessCode}</div>
    </div>

    <p>Total Paid: <strong>₦${Number(totalAmount).toLocaleString()}</strong></p>
    <p>You will receive a follow-up notification as soon as your 3D digital gift experience is ready for viewing.</p>

    <a href="https://app.thekeepsakesmith.com/?code=${accessCode}" class="btn">Launch 3D Portal</a>

    <div class="footer">
      Keep your access code safe &mdash; it is all that is needed to open the gift.<br>
      © ${new Date().getFullYear()} The Keepsake Smith. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * HTML Template: Gift Experience Ready Notification
 */
export function getGiftReadyHtml({ recipientName, purchaserName, accessCode }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #111111; color: #FFFFFF; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #171717; border: 1px solid rgba(197, 160, 89, 0.4); padding: 40px; }
    .logo { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #C5A059; margin-bottom: 30px; }
    h1 { font-size: 30px; font-weight: 300; margin-bottom: 15px; color: #FFFFFF; }
    p { font-size: 14px; color: #CCCCCC; line-height: 1.6; }
    .code-box { background-color: #0F0F0F; border: 1px solid #C5A059; padding: 25px; text-align: center; margin: 30px 0; }
    .code { font-family: monospace; font-size: 28px; letter-spacing: 4px; color: #C5A059; font-weight: bold; }
    .btn { display: inline-block; padding: 16px 36px; background-color: #FFFFFF; border-radius: 9999px; color: #111111; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-top: 20px; }
    .footer { margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 11px; color: #666666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">The Keepsake Smith</div>
    <h1>Your Keepsake is Ready</h1>
    <p>Dear ${recipientName || 'Valued Recipient'},</p>
    <p>A personalized 3D keepsake experience crafted by <strong>${purchaserName}</strong> is now ready to unlock!</p>
    
    <div class="code-box">
      <div style="font-size: 11px; letter-spacing: 2px; color: #AAAAAA; margin-bottom: 8px;">ACCESS CODE</div>
      <div class="code">${accessCode}</div>
    </div>

    <p>Simply click the button below or visit <strong>app.thekeepsakesmith.com</strong> and enter your code to view your custom experience.</p>

    <a href="https://app.thekeepsakesmith.com/?code=${accessCode}" class="btn">Unlock 3D Experience</a>

    <div class="footer">
      No account or password is required. Keep this code safe.<br>
      © ${new Date().getFullYear()} The Keepsake Smith. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}

/** Shared chrome so every notification looks like the same house. */
function emailShell({ heading, lede, body, cta, footer }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:40px 20px;background-color:#111111;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#171717;border:1px solid rgba(197,160,89,0.25);padding:40px;">
    <div style="font-size:14px;letter-spacing:3px;text-transform:uppercase;color:#C5A059;margin-bottom:30px;">The Keepsake Smith</div>
    <h1 style="font-size:28px;font-weight:300;margin:0 0 15px;color:#FFFFFF;">${heading}</h1>
    <p style="font-size:15px;color:#CCCCCC;line-height:1.65;margin:0 0 18px;">${lede}</p>
    ${body || ''}
    ${cta || ''}
    <div style="margin-top:40px;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;font-size:11px;color:#666666;">
      ${footer || 'The Keepsake Smith'}<br>
      &copy; ${new Date().getFullYear()} The Keepsake Smith. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

function button(href, label) {
  return `<a href="${href}" style="display:inline-block;padding:16px 36px;background-color:#C5A059;border-radius:9999px;color:#111111;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:1px;margin-top:20px;">${label}</a>`;
}

function codeBox(accessCode) {
  return `<div style="background-color:#0F0F0F;border:1px solid #C5A059;padding:22px;text-align:center;margin:28px 0;">
      <div style="font-size:11px;letter-spacing:2px;color:#AAAAAA;margin-bottom:8px;">ACCESS CODE</div>
      <div style="font-family:monospace;font-size:26px;letter-spacing:4px;color:#C5A059;font-weight:bold;">${accessCode}</div>
    </div>`;
}

/** Nobody should ever be greeted as "undefined". */
function warmName(name) {
  const clean = String(name || '').trim();
  return clean ? clean.split(/\s+/)[0] : 'there';
}

/** "there, your gift is ready" is not a sentence; drop the greeting instead. */
function greetSubject(name, tail) {
  const first = warmName(name);
  return first === 'there'
    ? tail.charAt(0).toUpperCase() + tail.slice(1)
    : `${first}, ${tail}`;
}

function fromWhom(purchaserName) {
  const clean = String(purchaserName || '').trim();
  return clean ? clean.split(/\s+/)[0] : 'someone who loves you';
}

/**
 * Fulfilment milestones. Each one writes twice: a warm note to the person
 * receiving the gift, and a plainer progress note to the person who paid for
 * it, so both know where things stand without either getting the other's
 * message.
 */
export const FULFILMENT_STAGES = {
  ready: {
    label: '3D Experience Ready',
    physicalOnly: false,
    recipient: ({ recipientName, purchaserName, accessCode }) => ({
      subject: greetSubject(recipientName, 'your keepsake is ready to open'),
      html: emailShell({
        heading: 'Your Keepsake is Ready',
        lede: `Hey ${warmName(recipientName)} &mdash; ${fromWhom(purchaserName)} made something for you, and it is finished. Photographs, a letter, and a voice you will recognise, bound into a book you can turn.`,
        body: codeBox(accessCode),
        cta: button(`https://app.thekeepsakesmith.com/?code=${accessCode}`, 'Open Your Keepsake'),
        footer: 'No account or password needed. Keep this code safe.',
      }),
    }),
    purchaser: ({ recipientName, accessCode, orderId }) => ({
      subject: `Your keepsake for ${warmName(recipientName)} is ready (#${orderId})`,
      html: emailShell({
        heading: 'Their Keepsake is Ready',
        lede: `The 3D experience you ordered for ${warmName(recipientName)} is finished and live. They can open it with the code below whenever you are ready for them to see it.`,
        body: codeBox(accessCode),
        footer: `Order #${orderId}`,
      }),
    }),
  },

  in_transit: {
    label: 'Package On Its Way',
    physicalOnly: true,
    recipient: ({ recipientName, purchaserName }) => ({
      subject: greetSubject(recipientName, 'something is on its way to you'),
      html: emailShell({
        heading: 'On Its Way',
        lede: `Hey ${warmName(recipientName)} &mdash; the keepsake ${fromWhom(purchaserName)} had made for you has left our workshop. Hold the thought for a day or two; it is coming.`,
        footer: 'We will write again the moment it is ready for you.',
      }),
    }),
    purchaser: ({ recipientName, orderId }) => ({
      subject: `Dispatched: your keepsake for ${warmName(recipientName)} (#${orderId})`,
      html: emailShell({
        heading: 'Your Package Has Been Dispatched',
        lede: `The physical keepsake for ${warmName(recipientName)} has left our workshop and is in transit. We will let you both know as soon as it is ready to collect.`,
        footer: `Order #${orderId}`,
      }),
    }),
  },

  pickup_ready: {
    label: 'Ready for Pickup',
    physicalOnly: true,
    recipient: ({ recipientName, purchaserName }) => ({
      subject: greetSubject(recipientName, 'your gift is ready to collect'),
      html: emailShell({
        heading: 'It Has Arrived',
        lede: `Hey ${warmName(recipientName)} &mdash; the gift from ${fromWhom(purchaserName)} is here and waiting for you. Come and collect it whenever suits; it is not going anywhere.`,
        footer: 'Bring nothing but yourself.',
      }),
    }),
    purchaser: ({ recipientName, orderId }) => ({
      subject: `Ready for collection: your keepsake for ${warmName(recipientName)} (#${orderId})`,
      html: emailShell({
        heading: 'Ready for Collection',
        lede: `The keepsake for ${warmName(recipientName)} has arrived and is ready to be collected. We have let them know too.`,
        footer: `Order #${orderId}`,
      }),
    }),
  },
};

export function stageFor(status) {
  return FULFILMENT_STAGES[status] || null;
}
