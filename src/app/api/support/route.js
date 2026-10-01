import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, orderId, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Full Name, Email Address, and Message are required.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject ? subject.trim() : 'General Inquiry';
    const cleanOrderId = orderId ? orderId.trim() : 'N/A';
    const cleanMessage = message.trim();

    // 1. Send Support Notification Email to Admin
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background-color: #111; color: #fff; padding: 30px; }
    .card { background-color: #1A1A1A; border: 1px solid #333; padding: 25px; max-width: 600px; margin: 0 auto; }
    .label { color: #888; font-size: 12px; margin-top: 15px; }
    .val { font-size: 15px; color: #FFF; margin-top: 4px; }
    .msg-box { background-color: #0F0F0F; border: 1px solid #C5A059; padding: 15px; margin-top: 15px; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="color:#C5A059; margin-top:0;">New Customer Support Ticket</h2>
    <div class="label">CUSTOMER NAME</div>
    <div class="val">${cleanName}</div>

    <div class="label">CUSTOMER EMAIL</div>
    <div class="val">${cleanEmail}</div>

    <div class="label">CATEGORY / SUBJECT</div>
    <div class="val">${cleanSubject}</div>

    <div class="label">ORDER ID (IF SPECIFIED)</div>
    <div class="val">#${cleanOrderId}</div>

    <div class="label">MESSAGE CONTENT</div>
    <div class="msg-box">${cleanMessage.replace(/\n/g, '<br>')}</div>
  </div>
</body>
</html>
    `;

    sendEmail({
      to: process.env.BREVO_SENDER_EMAIL || 'orders@thekeepsakesmith.com',
      subject: `[Support Ticket] ${cleanSubject} — ${cleanName}`,
      html: adminEmailHtml,
    }).catch((e) => console.error('Error sending support admin email:', e));

    // 2. Send Auto-reply Confirmation Email to Customer
    const customerAutoReplyHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #111111; color: #FFFFFF; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #171717; border: 1px solid rgba(255,255,255,0.15); padding: 40px; }
    .logo { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #C5A059; margin-bottom: 30px; }
    h1 { font-size: 26px; font-weight: 300; margin-bottom: 15px; color: #FFFFFF; }
    p { font-size: 14px; color: #AAAAAA; line-height: 1.6; }
    .footer { margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 11px; color: #666666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">The Keepsake Smith</div>
    <h1>We Received Your Inquiry</h1>
    <p>Dear ${cleanName},</p>
    <p>Thank you for reaching out to The Keepsake Smith artisan support team regarding <strong>${cleanSubject}</strong>.</p>
    <p>We have logged your ticket and an artisan specialist will review your request and reply to this email address within 24 hours.</p>
    
    <div class="footer">
      © ${new Date().getFullYear()} The Keepsake Smith. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    sendEmail({
      to: cleanEmail,
      subject: `We received your inquiry — The Keepsake Smith Support`,
      html: customerAutoReplyHtml,
    }).catch((e) => console.error('Error sending customer auto-reply:', e));

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! Your message has been received and our support team will respond within 24 hours.',
    });
  } catch (err) {
    console.error('Support API error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error processing support inquiry.' },
      { status: 500 }
    );
  }
}
