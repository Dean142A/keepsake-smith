/**
 * Brevo Mailer Integration for The Keepsake Smith
 * Supports Brevo Transactional Email API (https://api.brevo.com/v3/smtp/email)
 */

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'orders@thekeepsakesmith.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'The Keepsake Smith';

  if (!apiKey) {
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

    <a href="https://app.thekeepsakesmith.com" class="btn">Launch 3D Portal</a>

    <div class="footer">
      this explains color systems and color usages so they are used the way brand identity portrays.<br>
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

    <a href="https://app.thekeepsakesmith.com?code=${accessCode}" class="btn">Unlock 3D Experience</a>

    <div class="footer">
      No account or password is required. Keep this code safe.<br>
      © ${new Date().getFullYear()} The Keepsake Smith. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}
