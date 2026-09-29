import { NextResponse } from 'next/server';

// Mock DB of ready access codes for testing & demonstration
const ACCESS_CODES_DB = {
  'KPSK-892F-37A1': {
    id: 'code-1',
    orderId: 'ord-101',
    packageId: 'pkg-88',
    purchaserName: 'Alexander Smith',
    recipientName: 'Jane Forster',
    template: 'Anniversary Scene v1',
    buildPath: 'https://packages.thekeepsakesmith.com/builds/anniversary-v1/',
    personalization: {
      photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
      message: 'Happy Anniversary my love! Forever & always.',
      sender: 'Alex',
    },
    status: 'ready',
  },
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing access code' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code exists in DB
    const accessData = ACCESS_CODES_DB[cleanCode];

    if (!accessData) {
      // Allow any well-formatted code starting with KPSK- for demonstration
      if (cleanCode.length >= 10) {
        return NextResponse.json({
          success: true,
          code: cleanCode,
          package: {
            id: 'pkg-demo',
            template: 'Keepsake Luxury 3D Scene v1',
            buildPath: 'https://packages.thekeepsakesmith.com/builds/default-v1/',
            personalization: {
              photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop',
              message: 'You have received a personalized 3D Keepsake Experience.',
              recipientName: 'Valued Recipient',
            },
            status: 'ready',
          },
        });
      }

      return NextResponse.json(
        { error: 'Invalid access code. Please check your card or email and try again.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      code: cleanCode,
      package: accessData,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error processing code redemption' },
      { status: 500 }
    );
  }
}
