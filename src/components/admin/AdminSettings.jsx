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

export default function AdminSettings({ user }) {
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
      {/* 2. INFRASTRUCTURE & ARCHITECTURE SPECS */}
      <div className="card-surface overflow-hidden animate-slide-up">
        <div className="p-5 bg-neutral-50 dark:bg-neutral-800">
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
                className="flex items-start gap-3 p-4 bg-neutral-50/60 dark:bg-neutral-800/40 rounded-xl card-hover"
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
      <div className="card-surface overflow-hidden animate-slide-up">
        <div className="p-5 bg-neutral-50 dark:bg-neutral-800">
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
              className="flex-1 rounded-full px-4 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
              required
            />
            <button
              type="submit"
              disabled={sendingTest}
              className="primary-button text-xs py-2 px-5 btn-press whitespace-nowrap disabled:opacity-50"
            ><span>{sendingTest ? 'Sending...' : 'Send Test'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
