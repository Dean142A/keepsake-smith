'use client';

import React, { useState } from 'react';
import {
  Palette,
  Server,
  Shield,
  Key,
  Globe,
  Database,
  Activity,
  Check,
  Send,
  Lock,
} from 'lucide-react';
import { useToast } from './AdminToast';

const ACCENT_PRESETS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Gold / Amber', value: '#C5A059' },
  { name: 'Royal Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Cyan', value: '#06b6d4' },
];

export default function AdminSettings({ currentAccent, onChangeAccent, user }) {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) return;
    setSendingTest(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: true,
          recipientEmail: testEmail,
        }),
      });
      toast(`Test email dispatch initiated to ${testEmail}`);
      setTestEmail('');
    } catch (err) {
      toast('Failed to dispatch test email', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  const securitySpecs = [
    { icon: Server, label: 'Hosting Platform', value: 'Bunny.net Magic Containers', desc: 'Containerized micro-VM on Amsterdam edge' },
    { icon: Globe, label: 'Configured Endpoints', value: 'app. & admin.thekeepsakesmith.com', desc: 'Dual-subdomain routing via Next.js Middleware' },
    { icon: Key, label: 'Access Token Engine', value: 'KPSK-XXXX-XXXX', desc: '12-char cryptographic gift redemption codes' },
    { icon: Lock, label: 'Session Security', value: 'HttpOnly SameSite=Lax Cookie', desc: 'Encrypted admin_session server gate' },
    { icon: Database, label: 'Container Image', value: 'ghcr.io/dean142a/keepsake-smith:latest', desc: 'Automated CI/CD via GitHub Actions' },
    { icon: Activity, label: 'WebGL 3D Viewer', value: 'Three.js / React Three Fiber', desc: 'Hardware-accelerated dynamic book rendering' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
      {/* 1. BRANDING & ACCENT COLOR (TeleFlow Theme Picker) */}
      <div className="card-border overflow-hidden animate-slide-up">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Palette size={16} className="text-accent" />
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white tracking-[-0.025em]">
                Branding &amp; Accent Theme
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Customize the visual accent palette across the administrative dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = currentAccent === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => onChangeAccent(preset.value)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border text-xs font-medium transition-all btn-press ${
                    isSelected
                      ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: preset.value }}
                  />
                  <span>{preset.name}</span>
                  {isSelected && <Check size={12} className="text-neutral-900 dark:text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. INFRASTRUCTURE & ARCHITECTURE SPECS */}
      <div className="card-border overflow-hidden animate-slide-up">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white tracking-[-0.025em]">
            Infrastructure &amp; Security Architecture
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Real-time status of serverless container deployment and security controls.
          </p>
        </div>

        <div className="p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securitySpecs.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 bg-neutral-50/60 dark:bg-neutral-800/40 rounded-xl card-hover border border-neutral-100 dark:border-neutral-800"
              >
                <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} />
                </div>
                <div>
                  <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-neutral-700 dark:text-neutral-300 font-mono mt-0.5">
                    {item.value}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SMTP EMAIL DISPATCH TEST */}
      <div className="card-border overflow-hidden animate-slide-up">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white tracking-[-0.025em]">
            SMTP Notification Dispatcher
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Test the email service delivering recipient access links.
          </p>
        </div>

        <div className="p-5 md:p-6">
          <form onSubmit={handleTestEmail} className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter your email for test dispatch..."
              className="flex-1 rounded-full border border-neutral-200/60 dark:border-neutral-700 px-4 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
              required
            />
            <button
              type="submit"
              disabled={sendingTest}
              className="primary-button text-xs py-2 px-5 btn-press whitespace-nowrap disabled:opacity-50"
            >
              <Send size={13} />
              <span>{sendingTest ? 'Sending...' : 'Send Test'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
