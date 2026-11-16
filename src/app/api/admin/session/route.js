import { NextResponse } from 'next/server';
import { validateAdminRequest } from '@/lib/auth';

export async function GET(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

