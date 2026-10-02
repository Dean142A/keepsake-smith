import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ordersFilePath = path.join(process.cwd(), 'src', 'data', 'orders.json');

// In-memory rate limiting map: ipOrCode -> { attempts: number, lockUntil: number }
const FAILED_ATTEMPTS = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function readOrders() {
  try {
    if (!fs.existsSync(ordersFilePath)) return [];
    return JSON.parse(fs.readFileSync(ordersFilePath, 'utf8') || '[]');
  } catch (err) {
    console.error('Error reading orders file:', err);
    return [];
  }
}

export async function POST(req) {
  try {
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing access code' },
        { status: 400 }
      );
    }

    const normalizeCode = (str) => (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanCode = normalizeCode(code);
    const rateLimitKey = `${clientIp}:${cleanCode}`;
    const now = Date.now();

    // Check rate limit status
    const attemptRecord = FAILED_ATTEMPTS.get(rateLimitKey);
    if (attemptRecord && attemptRecord.lockUntil > now) {
      const minutesRemaining = Math.ceil((attemptRecord.lockUntil - now) / 60000);
      return NextResponse.json(
        {
          error: `Too many failed attempts. Code access locked for security. Please try again in ${minutesRemaining} minute(s).`,
          locked: true,
        },
        { status: 429 }
      );
    }

    // Read live orders DB
    const orders = readOrders();
    const matchingOrder = orders.find(
      (o) => o.accessCode && normalizeCode(o.accessCode) === cleanCode
    );

    if (!matchingOrder) {
      // Record failed attempt
      const attempts = (attemptRecord?.attempts || 0) + 1;
      let lockUntil = 0;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        lockUntil = now + LOCKOUT_DURATION_MS;
      }
      FAILED_ATTEMPTS.set(rateLimitKey, { attempts, lockUntil });

      const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
      const remainingMsg = attemptsLeft > 0
        ? ` (${attemptsLeft} attempt(s) remaining before temporary lockout)`
        : ' Access locked for 15 minutes.';

      return NextResponse.json(
        { error: `Invalid 12-character access code. Please check your card or email and try again.${remainingMsg}` },
        { status: 404 }
      );
    }

    // Reset rate limiter on successful code entry
    FAILED_ATTEMPTS.delete(rateLimitKey);

    // Extract item details & dynamic 3D WebGL package configuration
    const primaryItem = matchingOrder.items?.[0] || { title: 'Keepsake 3D Experience' };
    
    return NextResponse.json({
      success: true,
      code: cleanCode,
      package: {
        id: matchingOrder.id,
        template: primaryItem.title || 'Keepsake Luxury 3D Scene v1',
        buildPath: matchingOrder.packageUrl || 'https://packages.thekeepsakesmith.com/builds/default-v1/',
        fulfillmentType: matchingOrder.fulfillmentType,
        status: matchingOrder.status,
        purchaserName: matchingOrder.purchaserName,
        recipientName: matchingOrder.recipientName || matchingOrder.purchaserName,
        personalization: {
          recipientName: matchingOrder.recipientName || matchingOrder.purchaserName,
          sender: matchingOrder.purchaserName,
          message: matchingOrder.personalizationNote || matchingOrder.customMessage || 'We craft gifts that are memorable.',
          photo: matchingOrder.customPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
          audioUrl: matchingOrder.audioUrl || 'https://packages.thekeepsakesmith.com/audio/sample-ambient.mp3',
        },
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error processing code redemption' },
      { status: 500 }
    );
  }
}
