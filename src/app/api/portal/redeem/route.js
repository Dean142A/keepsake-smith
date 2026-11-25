import { NextResponse } from 'next/server';
import { normaliseExperience, normaliseCode } from '@/lib/keepsake';
import { getOrderByCode } from '@/lib/orders-store';

// Note: this limiter is per container instance. With several instances behind
// the load balancer the effective allowance is MAX_FAILED_ATTEMPTS per
// instance; move it to the database or a shared cache if that matters.
const FAILED_ATTEMPTS = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export async function POST(req) {
  try {
    // Only the first hop of X-Forwarded-For is the proxy's own observation;
    // anything after it was supplied by the caller.
    const forwarded = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    const clientIp = forwarded || req.headers.get('x-real-ip') || '127.0.0.1';
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing access code' }, { status: 400 });
    }

    const cleanCode = normaliseCode(code);
    // Keyed on the caller alone. Keying on caller *and* code handed every
    // new guess a fresh allowance, which is no limit on guessing at all.
    const rateLimitKey = clientIp;
    const now = Date.now();

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

    // Direct lookup: orders are keyed by access code, so this is one read
    // rather than a scan of every order.
    const matchingOrder = await getOrderByCode(cleanCode);

    if (!matchingOrder) {
      const attempts = (attemptRecord?.attempts || 0) + 1;
      const lockUntil = attempts >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION_MS : 0;
      FAILED_ATTEMPTS.set(rateLimitKey, { attempts, lockUntil });

      const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
      const remainingMsg =
        attemptsLeft > 0
          ? ` (${attemptsLeft} attempt(s) remaining before temporary lockout)`
          : ' Access locked for 15 minutes.';

      return NextResponse.json(
        {
          error: `Invalid 12-character access code. Please check your card or email and try again.${remainingMsg}`,
        },
        { status: 404 }
      );
    }

    FAILED_ATTEMPTS.delete(rateLimitKey);

    const experience = normaliseExperience(matchingOrder);

    if (experience.pages.length === 0) {
      return NextResponse.json(
        {
          error:
            'This keepsake is still being prepared. Please check back shortly, or contact us if it stays this way.',
          pending: true,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      code: matchingOrder.accessCode,
      package: {
        id: matchingOrder.id,
        fulfillmentType: matchingOrder.fulfillmentType,
        status: matchingOrder.status,
        purchaserName: matchingOrder.purchaserName,
        recipientName: matchingOrder.recipientName || matchingOrder.purchaserName,
        experience,
        // Retained for the overlay card, which reads these directly.
        personalization: {
          recipientName: matchingOrder.recipientName || matchingOrder.purchaserName,
          sender: experience.letter.signature,
          message: experience.letter.body,
          photo: experience.pages[0]?.imageUrl || '',
          audioUrl: experience.backgroundMusicUrl,
        },
      },
    });
  } catch (err) {
    console.error('Redeem error:', err);
    return NextResponse.json({ error: 'Server error processing code redemption' }, { status: 500 });
  }
}
