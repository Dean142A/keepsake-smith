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
  QrCode,
  Ban,
  Trash2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import QRCode from 'qrcode';
import ExperienceBuilder from './ExperienceBuilder';
import { normaliseExperience } from '@/lib/keepsake';
import { useToast } from './AdminToast';

/**
 * Fulfilment milestones an operator can move an order to. Each one emails the
 * recipient and the purchaser; the physical stages are hidden for orders that
 * are digital only, because there is nothing to post.
 */
const STAGES = [
  { id: 'ready', label: '3D Experience Ready', hint: 'Sends the access code', physicalOnly: false },
  { id: 'in_transit', label: 'Package On Its Way', hint: 'Dispatched from the workshop', physicalOnly: true },
  { id: 'pickup_ready', label: 'Ready for Pickup', hint: 'Arrived and waiting', physicalOnly: true },
];

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onSaveAssets,
  onSendEmail,
  onSetStage,
  onUpdateOrder,
  onDeleteOrder,
}) {
  const { toast } = useToast();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [stagePending, setStagePending] = useState('');
  // The parent keeps its own copy of the selected order, so it does not
  // re-render with the new status after a stage change. Track it here too.
  const [stage, setStage] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [details, setDetails] = useState(null);
  const [experience, setExperience] = useState(null);
  const [access, setAccess] = useState('active');
  const [busy, setBusy] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order) {
      setStage(order.status || '');
      setAccess(order.access === 'suspended' ? 'suspended' : 'active');
      setConfirmDelete(false);
      setDetails({
        recipientName: order.recipientName || '',
        recipientEmail: order.recipientEmail || '',
        purchaserName: order.purchaserName || '',
        purchaserEmail: order.purchaserEmail || '',
        fulfillmentType: order.fulfillmentType || 'digital_physical',
      });
      setExperience(normaliseExperience(order));
    }
  }, [order]);

  const accessCode = order?.accessCode || '';
  const portalUrl = `https://app.thekeepsakesmith.com/?code=${accessCode}`;

  // The physical keepsake carries this code printed on a card, so the QR has
  // to survive being small on paper: high error correction, generous quiet
  // zone, pure black on white.
  useEffect(() => {
    if (!accessCode) {
      setQrSvg('');
      return;
    }
    let alive = true;
    QRCode.toString(portalUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 260,
      color: { dark: '#111111', light: '#ffffff' },
    })
      .then((svg) => {
        if (alive) setQrSvg(svg);
      })
      .catch(() => {
        if (alive) setQrSvg('');
      });
    return () => {
      alive = false;
    };
  }, [accessCode, portalUrl]);

  if (!isOpen || !order) return null;

  const downloadQr = async (format) => {
    try {
      if (format === 'svg') {
        const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
        triggerDownload(URL.createObjectURL(blob), `keepsake-${accessCode}.svg`, true);
      } else {
        // 2048px so it stays crisp at print resolution.
        const dataUrl = await QRCode.toDataURL(portalUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 2048,
          color: { dark: '#111111', light: '#ffffff' },
        });
        triggerDownload(dataUrl, `keepsake-${accessCode}.png`, false);
      }
    } catch (err) {
      toast('Could not generate the QR code', 'error');
    }
  };

  const triggerDownload = (href, filename, revoke) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (revoke) URL.revokeObjectURL(href);
  };

  const patchOrder = async (patch, label) => {
    setBusy(label);
    try {
      await onUpdateOrder(order.id, patch);
      toast(`${label} saved`);
      return true;
    } catch (err) {
      toast(err.message || `Could not save ${label.toLowerCase()}`, 'error');
      return false;
    } finally {
      setBusy('');
    }
  };

  const toggleAccess = async () => {
    const next = access === 'suspended' ? 'active' : 'suspended';
    setBusy('access');
    try {
      await onUpdateOrder(order.id, { access: next });
      setAccess(next);
      toast(
        next === 'suspended'
          ? 'Code suspended — the portal will refuse it'
          : 'Code reinstated'
      );
    } catch (err) {
      toast(err.message || 'Could not change access', 'error');
    } finally {
      setBusy('');
    }
  };

  const removeOrder = async () => {
    setBusy('delete');
    try {
      const res = await onDeleteOrder(order.id, order.accessCode);
      toast(res?.message || `Order ${order.id} deleted`);
      onClose();
    } catch (err) {
      toast(err.message || 'Could not delete the order', 'error');
    } finally {
      setBusy('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    toast('Copied recipient 3D unlock URL to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };


  const handleSendNotification = async () => {
    setSendingEmail(true);
    try {
      const res = await onSendEmail(order.id, stage || order.status);
      const who = (res?.deliveries || []).filter((d) => d.sent).map((d) => d.to);
      toast(who.length ? `Email sent to ${who.join(' and ')}` : 'Notification sent');
    } catch (err) {
      toast(err.message || 'Failed to send notification email', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleStage = async (next) => {
    setStagePending(next);
    try {
      const res = await onSetStage(order.id, next);
      setStage(res?.order?.status || next);
      const who = (res?.deliveries || []).filter((d) => d.sent).map((d) => d.to);
      toast(
        who.length
          ? `${STAGES.find((x) => x.id === next)?.label} — emailed ${who.join(' and ')}`
          : `${STAGES.find((x) => x.id === next)?.label} — saved, but no email went out`,
        who.length ? 'success' : 'error'
      );
    } catch (err) {
      toast(err.message || 'Could not update the order', 'error');
    } finally {
      setStagePending('');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in"
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
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
              <span className="uppercase-label text-neutral-400 block text-[10px]">Recipient</span>
              <div className="font-semibold text-xs text-neutral-900 dark:text-white mt-1">
                {order.recipientName || 'N/A'}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {order.recipientEmail || 'No email provided'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40">
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
          <div className="p-4 rounded-xl bg-accent-soft">
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
                  className="p-1.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-accent transition-colors"
                  title="Test in 3D Portal"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-2 font-mono truncate">
              {portalUrl}
            </div>

            {/* Printable QR for the physical keepsake */}
            {qrSvg && (
              <div className="mt-4 pt-4 border-t border-accent/15 flex items-center gap-4">
                <div
                  className="shrink-0 rounded-lg bg-white p-1.5 [&>svg]:block [&>svg]:h-[104px] [&>svg]:w-[104px]"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5"><span className="text-xs font-medium text-neutral-900 dark:text-white">
                      Print on the keepsake
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-2">
                    Opens the 3D experience straight away, no code to type.
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => downloadQr('svg')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-800 transition-all btn-press inline-flex items-center gap-1"
                    >
                      <Download size={11} /> SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadQr('png')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-800 transition-all btn-press inline-flex items-center gap-1"
                    >
                      <Download size={11} /> PNG
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3D WebGL Production Assets Form */}
          {/* Fulfilment stage */}
          <div className="mb-6">
            <div className="flex items-center justify-between pb-1 mb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-accent" />
                <h4 className="font-semibold text-xs text-neutral-900 dark:text-white">
                  Fulfilment Stage
                </h4>
              </div>
              <span className="text-[10px] text-neutral-400">
                {(order.fulfillmentType || 'digital_physical') === 'digital_only'
                  ? 'Digital only'
                  : 'Digital + physical'}
              </span>
            </div>

            <div className="grid gap-2">
              {STAGES.filter(
                (item) =>
                  !item.physicalOnly ||
                  (order.fulfillmentType || 'digital_physical') !== 'digital_only'
              ).map((item) => {
                const current = stage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleStage(item.id)}
                    disabled={Boolean(stagePending)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all btn-press disabled:opacity-60 ${
                      current
                        ? 'border-[var(--accent)] bg-accent-soft'
                        : 'border-neutral-200/70 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>
                      <span className="block text-xs font-medium text-neutral-900 dark:text-white">
                        {item.label}
                      </span>
                      <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">
                        {item.hint}
                      </span>
                    </span>
                    <span className="text-[10px] font-medium text-accent whitespace-nowrap">
                      {stagePending === item.id
                        ? 'Sending...'
                        : current
                        ? 'Current — resend'
                        : 'Set & notify'}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-neutral-400 mt-2">
              Each stage emails {order.recipientName || 'the recipient'} and{' '}
              {order.purchaserName || 'the purchaser'} separately.
            </p>
          </div>


          {/* Order details */}
          {details && (
            <div className="mb-6">
              <div className="flex items-center justify-between pb-1 mb-3">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-accent" />
                  <h4 className="font-semibold text-xs text-neutral-900 dark:text-white">
                    Order Details
                  </h4>
                </div>
                <span className="text-[10px] text-neutral-400">The code stays the same</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Recipient name</label>
                <input
                  type="text"
                  value={details.recipientName}
                  onChange={(e) => setDetails({ ...details, recipientName: e.target.value })}
                  className="w-full rounded-full px-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Recipient email</label>
                <input
                  type="email"
                  value={details.recipientEmail}
                  onChange={(e) => setDetails({ ...details, recipientEmail: e.target.value })}
                  className="w-full rounded-full px-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Purchaser name</label>
                <input
                  type="text"
                  value={details.purchaserName}
                  onChange={(e) => setDetails({ ...details, purchaserName: e.target.value })}
                  className="w-full rounded-full px-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Purchaser email</label>
                <input
                  type="email"
                  value={details.purchaserEmail}
                  onChange={(e) => setDetails({ ...details, purchaserEmail: e.target.value })}
                  className="w-full rounded-full px-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
                <div className="sm:col-span-2">
                  <label className="uppercase-label text-neutral-400 block mb-1">Fulfilment</label>
                  <select
                    value={details.fulfillmentType}
                    onChange={(e) => setDetails({ ...details, fulfillmentType: e.target.value })}
                    className="w-full rounded-full px-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="digital_physical">Digital + physical</option>
                    <option value="digital_only">Digital only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={() => patchOrder(details, 'Order details')}
                  disabled={Boolean(busy)}
                  className="primary-button text-xs py-2 px-5 btn-press disabled:opacity-60"
                ><span>{busy === 'Order details' ? 'Saving...' : 'Save Details'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Keepsake content */}
          {experience && (
            <div className="mb-6">
              <ExperienceBuilder
                value={experience}
                onChange={setExperience}
                orderId={order.id}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={() => patchOrder({ experience }, 'Keepsake content')}
                  disabled={Boolean(busy)}
                  className="primary-button text-xs py-2 px-5 btn-press disabled:opacity-60"
                ><span>{busy === 'Keepsake content' ? 'Saving...' : 'Save Photos & Letter'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Access and removal */}
          <div className="mb-6">
            <div className="flex items-center gap-2 pb-1 mb-3">
              <Ban size={15} className="text-accent" />
              <h4 className="font-semibold text-xs text-neutral-900 dark:text-white">
                Access &amp; Removal
              </h4>
            </div>

            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl surface-secondary mb-2">
              <span className="min-w-0">
                <span className="block text-xs font-medium text-neutral-900 dark:text-white">
                  {access === 'suspended' ? 'Code suspended' : 'Code active'}
                </span>
                <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">
                  {access === 'suspended'
                    ? 'The portal refuses this code. Nothing has been deleted.'
                    : 'Suspending stops the code working without deleting anything.'}
                </span>
              </span>
              <button
                type="button"
                onClick={toggleAccess}
                disabled={Boolean(busy)}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-800 transition-all btn-press whitespace-nowrap disabled:opacity-60"
              >
                {busy === 'access' ? '...' : access === 'suspended' ? 'Reinstate' : 'Suspend'}
              </button>
            </div>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors inline-flex items-center gap-2"
              >
                <Trash2 size={13} /> Delete this order
              </button>
            ) : (
              <div className="px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-950/30">
                <div className="flex items-start gap-2 mb-2.5">
                  <AlertTriangle size={14} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-800 dark:text-red-300">
                    This deletes order <strong>{order.id}</strong>, its photographs and its
                    recording. The code <strong>{accessCode}</strong> will stop working. It
                    cannot be undone.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={removeOrder}
                    disabled={Boolean(busy)}
                    className="px-3 py-1.5 rounded-full bg-red-600 text-white text-[11px] font-medium hover:bg-red-700 transition-colors btn-press disabled:opacity-60"
                  >
                    {busy === 'delete' ? 'Deleting...' : 'Delete permanently'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium text-neutral-600 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-800 transition-colors btn-press"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSendNotification}
              disabled={sendingEmail || !order.recipientEmail}
              className="px-3.5 py-2 rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all btn-press inline-flex items-center gap-1.5 disabled:opacity-50"
            ><span>{sendingEmail ? 'Sending...' : 'Dispatch Email'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors btn-press"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
