import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateAdminRequest } from '@/lib/auth';

const settingsFilePath = path.join(process.cwd(), 'src', 'data', 'settings.json');

const defaultSettings = {
  timerHours: 22,
  timerMinutes: 7,
  timerSeconds: 46,
  targetEndTimestamp: new Date(Date.now() + 22 * 3600 * 1000 + 7 * 60 * 1000 + 46 * 1000).toISOString(),
  timerEnabled: true,
  updatedAt: new Date().toISOString(),
};

function readSettings() {
  try {
    if (!fs.existsSync(settingsFilePath)) return defaultSettings;
    const content = fs.readFileSync(settingsFilePath, 'utf8');
    return JSON.parse(content || JSON.stringify(defaultSettings));
  } catch (err) {
    console.error('Error reading settings file:', err);
    return defaultSettings;
  }
}

function writeSettings(settings) {
  try {
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing settings file:', err);
  }
}

// GET /api/admin/settings - Read current live timer settings (Public for CountdownTimer)
export async function GET() {
  const settings = readSettings();
  return NextResponse.json({ success: true, settings });
}

// POST /api/admin/settings - Update live timer settings (Protected)
export async function POST(request) {
  const authCheck = validateAdminRequest(request);
  if (!authCheck.authenticated) return authCheck.response;

  try {

    const body = await request.json();
    const current = readSettings();

    const timerHours = Math.max(0, parseInt(body.timerHours ?? current.timerHours, 10));
    const timerMinutes = Math.max(0, Math.min(59, parseInt(body.timerMinutes ?? current.timerMinutes, 10)));
    const timerSeconds = Math.max(0, Math.min(59, parseInt(body.timerSeconds ?? current.timerSeconds, 10)));

    // Compute target timestamp from now + duration
    const totalMs = (timerHours * 3600 + timerMinutes * 60 + timerSeconds) * 1000;
    const targetEndTimestamp = new Date(Date.now() + totalMs).toISOString();

    const updatedSettings = {
      ...current,
      timerHours,
      timerMinutes,
      timerSeconds,
      targetEndTimestamp,
      timerEnabled: body.timerEnabled !== undefined ? Boolean(body.timerEnabled) : current.timerEnabled,
      updatedAt: new Date().toISOString(),
    };

    writeSettings(updatedSettings);

    return NextResponse.json({
      success: true,
      message: 'Timer settings updated successfully',
      settings: updatedSettings,
    });
  } catch (err) {
    console.error('Error updating settings:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update timer settings' },
      { status: 500 }
    );
  }
}
