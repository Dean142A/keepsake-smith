'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Mail,
  Save,
  CheckCircle2,
  Package,
  Music,
  FileText,
  User,
} from 'lucide-react';
import { useToast } from './AdminToast';

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onSaveAssets,
  onSendEmail,
}) {
  const { toast } = useToast();
  const [pkgNote, setPkgNote] = useState('');
  const [pkgAudio, setPkgAudio] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order) {
      setPkgNote(order.personalizationNote || '');
      setPkgAudio(order.audioUrl || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const accessCode = order.accessCode || '';
  const portalUrl = `https://app.thekeepsakesmith.com/?code=${accessCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    toast('Copied recipient 3D unlock URL to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveAssets(order.id, {
        personalizationNote: pkgNote,
        audioUrl: pkgAudio,
      });
      toast(`Keepsake details saved for Order #${order.id}`);
    } catch (err) {
      toast('Failed to save assets', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotification = async () => {
    setSendingEmail(true);
    try {
      await onSendEmail(order.id);
      toast(`Notification email dispatched to ${order.recipientEmail || 'recipient'}`);
    } catch (err) {
      toast('Failed to send notification email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-neutral-200/60 dark:border-neutral-800 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs z-10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white tracking-[-0.025em]">
                Gift Order #{order.id}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-soft text-accent uppercase tracking-[0.05em]">
                {(order.fulfillmentType || 'digital_physical').replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Managed under The Keepsake Smith production pipeline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          {/* Customer & Recipient Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800">
              <span className="uppercase-label text-neutral-400 block text-[10px]">Recipient</span>
              <div className="font-semibold text-xs text-neutral-900 dark:text-white mt-1">
                {order.recipientName || 'N/A'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {order.recipientEmail || 'No email provided'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/50 dark:border-neutral-800">
              <span className="uppercase-label text-neutral-400 block text-[10px]">Purchaser</span>
              <div className="font-semibold text-xs text-neutral-900 dark:text-white mt-1">
                {order.purchaserName || order.customer || 'N/A'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {order.purchaserEmail || order.email || 'No email provided'}
              </div>
            </div>
          </div>

          {/* Access Code & 1-Click Link Card */}
          <div className="p-4 rounded-xl bg-accent-soft border border-accent/20">
            <div className="flex items-center justify-between">
              <span className="uppercase-label text-accent font-bold text-[10px]">
                Cryptographic 12-Char Access Code
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">Status: Active</span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xl md:text-2xl font-bold font-mono text-neutral-900 dark:text-white tracking-wider">
                {accessCode || 'CODE-PENDING'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-full bg-accent text-neutral-950 hover:bg-accent-hover text-xs font-medium inline-flex items-center gap-1.5 transition-all btn-press"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>

                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-accent border border-neutral-200 dark:border-neutral-700 transition-colors"
                  title="Test in 3D Portal"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 font-mono truncate">
              {portalUrl}
            </div>
          </div>

          {/* 3D WebGL Production Assets Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-accent" />
                <h4 className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Quick Edits
                </h4>
              </div>
              <span className="text-[10px] text-neutral-400">Photos &amp; voice note live in the builder</span>
            </div>

            {/* Background Audio URL */}
            <div>
              <label className="uppercase-label text-neutral-400 block mb-1">
                Background Music URL (optional)
              </label>
              <input
                type="text"
                value={pkgAudio}
                onChange={(e) => setPkgAudio(e.target.value)}
                placeholder="https://.../audio/message.mp3"
                className="w-full rounded-full border border-neutral-200/60 dark:border-neutral-700 px-4 py-2 text-xs bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Inside Cover Dedication Note */}
            <div>
              <label className="uppercase-label text-neutral-400 block mb-1">
                Letter (shown as the dedication overlay)
              </label>
              <textarea
                rows={3}
                value={pkgNote}
                onChange={(e) => setPkgNote(e.target.value)}
                placeholder="A cherished message rendered inside the 3D book pages..."
                className="w-full rounded-xl border border-neutral-200/60 dark:border-neutral-700 p-3 text-xs bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSendNotification}
                disabled={sendingEmail || !order.recipientEmail}
                className="px-3.5 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all btn-press inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Mail size={13} />
                <span>{sendingEmail ? 'Sending...' : 'Dispatch Email'}</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="primary-button text-xs py-2 px-5 btn-press shadow-sm"
              >
                <Save size={13} />
                <span>{saving ? 'Saving...' : 'Save 3D Assets'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
