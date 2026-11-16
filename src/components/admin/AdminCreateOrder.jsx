'use client';

import React, { useState } from 'react';
import {
  UserPlus,
  Upload,
  Sparkles,
  User,
  Mail,
  Music,
  CheckCircle2,
  Package,
  Layers,
  ExternalLink,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { useToast } from './AdminToast';

export default function AdminCreateOrder({ onOrderCreated, onBatchImported }) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('single');

  // Form State
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalizationNote, setPersonalizationNote] = useState('');
  const [customPhoto, setCustomPhoto] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState('digital_physical');
  const [sendNotification, setSendNotification] = useState(true);
  const [submittingSingle, setSubmittingSingle] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [submittingCsv, setSubmittingCsv] = useState(false);
  const [csvPreviewCount, setCsvPreviewCount] = useState(0);

  const inputClass =
    'w-full rounded-full border border-neutral-300 dark:border-neutral-700/80 bg-neutral-50 dark:bg-[#161820] px-4 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent transition-all shadow-xs';

  const handleCreateSingle = async (e) => {
    e.preventDefault();
    if (!purchaserName && !recipientName) {
      toast('Please enter purchaser or recipient name', 'error');
      return;
    }

    setSubmittingSingle(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaserName,
          purchaserEmail,
          recipientName,
          recipientEmail,
          personalizationNote,
          customPhoto,
          audioUrl,
          fulfillmentType,
          sendNotification,
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        toast(`Order created! Generated Code: ${data.order?.accessCode}`);
        setPurchaserName('');
        setPurchaserEmail('');
        setRecipientName('');
        setRecipientEmail('');
        setPersonalizationNote('');
        setCustomPhoto('');
        setAudioUrl('');
        onOrderCreated();
      } else {
        toast(data?.error || 'Failed to create order', 'error');
      }
    } catch (err) {
      toast('Network error creating order', 'error');
    } finally {
      setSubmittingSingle(false);
    }
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result || '';
      setCsvText(text);
      const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
      setCsvPreviewCount(Math.max(0, lines.length - 1));
      toast(`Loaded CSV with ${Math.max(0, lines.length - 1)} records`);
    };
    reader.readAsText(file);
  };

  const handleProcessCsv = async () => {
    if (!csvText.trim()) {
      toast('Please upload or paste CSV text first', 'error');
      return;
    }

    setSubmittingCsv(true);
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        toast('CSV must contain a header row and data rows', 'error');
        setSubmittingCsv(false);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
      const items = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = (values[idx] || '').trim().replace(/^"(.*)"$/, '$1');
        });

        items.push({
          purchaserName: row.purchaser_name || row.purchaser || row.customer || 'Customer',
          purchaserEmail: row.purchaser_email || row.email || '',
          recipientName: row.recipient_name || row.recipient || 'Recipient',
          recipientEmail: row.recipient_email || '',
          personalizationNote: row.note || row.dedication || '',
          customPhoto: row.photo_url || row.photo || '',
          audioUrl: row.audio_url || row.audio || '',
          fulfillmentType: row.fulfillment || 'digital_physical',
          sendNotification: row.send_notification === 'true' || row.send_notification === '1',
        });
      }

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: true, items }),
      });
      const data = await res.json();

      if (data && data.success) {
        toast(`Successfully generated ${data.createdCount} access codes & orders!`);
        setCsvText('');
        setCsvPreviewCount(0);
        onBatchImported();
      } else {
        toast(data?.error || 'Failed to process CSV', 'error');
      }
    } catch (err) {
      toast('Server error during CSV batch import', 'error');
    } finally {
      setSubmittingCsv(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.035em] text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            <span>New Keepsake Order Creation</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Issue unique 12-character cryptographic codes (`KPSK-XXXX-XXXX`) and configure 3D book personalization.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-full w-fit">
          <button
            onClick={() => setActiveSubTab('single')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeSubTab === 'single'
                ? 'bg-white dark:bg-[#1a1d26] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <UserPlus size={13} className="text-accent" />
            <span>Single Order</span>
          </button>
          <button
            onClick={() => setActiveSubTab('csv')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeSubTab === 'csv'
                ? 'bg-white dark:bg-[#1a1d26] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Upload size={13} className="text-accent" />
            <span>CSV Batch Import</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'single' ? (
        /* SPLIT 2-COLUMN LUXURY STUDIO LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Order Intake Form */}
          <div className="lg:col-span-7 card-border p-5 md:p-7 shadow-sm bg-white dark:bg-[#13151b]">
            <form onSubmit={handleCreateSingle} className="space-y-5">
              {/* 1. Purchaser Info */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#191c24] border border-neutral-200/60 dark:border-neutral-800">
                <span className="uppercase-label text-neutral-500 dark:text-neutral-400 block mb-3 font-semibold text-[10px]">
                  1. Purchaser Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Purchaser Full Name *
                    </label>
                    <input
                      type="text"
                      value={purchaserName}
                      onChange={(e) => setPurchaserName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Purchaser Email Address
                    </label>
                    <input
                      type="email"
                      value={purchaserEmail}
                      onChange={(e) => setPurchaserEmail(e.target.value)}
                      placeholder="eleanor@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Recipient Info */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#191c24] border border-neutral-200/60 dark:border-neutral-800">
                <span className="uppercase-label text-neutral-500 dark:text-neutral-400 block mb-3 font-semibold text-[10px]">
                  2. Gift Recipient Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. John Sterling"
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="john@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Dedication & Audio */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#191c24] border border-neutral-200/60 dark:border-neutral-800 space-y-3.5">
                <span className="uppercase-label text-neutral-500 dark:text-neutral-400 block font-semibold text-[10px]">
                  3. 3D WebGL Dedication &amp; Audio
                </span>

                <div>
                  <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Personalized Dedication Letter (Typeset inside 3D Book)
                  </label>
                  <textarea
                    rows={4}
                    value={personalizationNote}
                    onChange={(e) => setPersonalizationNote(e.target.value)}
                    placeholder="Dearest John, Wishing you a birthday as unforgettable as the times we've shared..."
                    className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700/80 p-3.5 text-xs bg-neutral-50 dark:bg-[#161820] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent transition-all shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Fulfillment Mode
                    </label>
                    <select
                      value={fulfillmentType}
                      onChange={(e) => setFulfillmentType(e.target.value)}
                      className={inputClass}
                    >
                      <option value="digital_physical">Physical Keepsake + 3D Portal</option>
                      <option value="digital_only">Purely Digital 3D Experience</option>
                      <option value="physical_only">Physical Keepsake Box Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                      Audio Stream / Voice Note URL
                    </label>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="https://.../audio/message.mp3"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Checkbox */}
              <div className="px-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent cursor-pointer"
                  />
                  <span>Dispatch automatic email notification with 1-click access code to recipient</span>
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingSingle}
                  className="primary-button text-xs py-2.5 px-6 btn-press shadow-md font-semibold"
                >
                  <Sparkles size={14} />
                  <span>{submittingSingle ? 'Generating Access Code...' : 'Create & Generate Code'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column (5 cols): Live Interactive 3D Keepsake Preview Card */}
          <div className="lg:col-span-5 sticky top-6 space-y-4">
            <div className="card-border p-5 md:p-6 bg-gradient-to-br from-neutral-900 to-[#12141a] text-white border-neutral-800 shadow-xl rounded-2xl relative overflow-hidden">
              {/* Subtle gold/emerald ambient glow */}
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-accent/15 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-accent" />
                  <span className="font-semibold text-xs tracking-wider uppercase text-neutral-200">
                    Live Keepsake Preview
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                  PORTAL SIMULATOR
                </span>
              </div>

              {/* Simulated 3D Book Cover Card */}
              <div className="mt-4 p-5 rounded-xl bg-[#1a1d26]/90 border border-white/10 shadow-inner space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                    ACCESS CODE
                  </span>
                  <span className="text-[11px] font-mono font-bold text-accent tracking-wider">
                    KPSK-••••-••••
                  </span>
                </div>

                {/* Inside Dedication Letter Preview */}
                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 min-h-[90px] flex flex-col justify-between">
                  <p className="text-xs italic text-neutral-300 leading-relaxed font-serif">
                    &ldquo;{personalizationNote || 'Your personalized dedication message will be rendered here on gold-leaf 3D book pages...'}&rdquo;
                  </p>
                  <div className="text-right text-[10px] text-accent mt-2 font-mono">
                    &mdash; {purchaserName || 'Purchaser'}
                  </div>
                </div>

                {/* Recipient Pill */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-neutral-400">Gift Prepared For:</span>
                  <span className="font-semibold text-white truncate max-w-[150px]">
                    {recipientName || 'Recipient Name'}
                  </span>
                </div>

                {/* Audio Attachment Badge */}
                {audioUrl && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]">
                    <Volume2 size={13} className="text-purple-400 flex-shrink-0" />
                    <span className="truncate">Audio track attached</span>
                  </div>
                )}
              </div>

              {/* Bottom Instructions */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Customer unlock destination:</span>
                <span className="font-mono text-accent">app.thekeepsakesmith.com</span>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="card-border p-4 bg-neutral-100/60 dark:bg-[#13151b] border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
              <span className="font-semibold text-neutral-900 dark:text-white block">
                ⚡ Instant Access Code Deployment
              </span>
              <p className="text-[11px] leading-relaxed">
                Once generated, the access code is immediately active in the 3D WebGL engine. The recipient can unlock it on any phone, tablet, or desktop.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* DAILY CSV BATCH IMPORT */
        <div className="card-border p-6 md:p-8 animate-slide-up shadow-sm bg-white dark:bg-[#13151b] space-y-6">
          <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <h2 className="text-lg font-bold tracking-[-0.035em] text-neutral-900 dark:text-white flex items-center gap-2">
              <Upload size={18} className="text-accent" />
              <span>Daily CSV Batch Import</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Upload orders from external fulfillment systems or paste raw CSV text to generate access codes in bulk.
            </p>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center bg-neutral-50/50 dark:bg-neutral-800/30 hover:border-accent transition-colors">
            <Upload size={32} className="mx-auto text-accent mb-3" />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
              Drag and drop your daily orders CSV here
            </span>
            <span className="text-[11px] text-neutral-400 block mt-1">or browse from your computer</span>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvFileUpload}
              className="mt-4 text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent-soft file:text-accent hover:file:opacity-80 cursor-pointer"
            />
          </div>

          {/* Paste CSV Textarea */}
          <div>
            <label className="uppercase-label text-neutral-500 dark:text-neutral-400 block mb-1.5 font-semibold text-[10px]">
              Or Paste Raw CSV Data {csvPreviewCount > 0 && `(${csvPreviewCount} records detected)`}
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                const lines = e.target.value.trim().split('\n').filter((l) => l.trim().length > 0);
                setCsvPreviewCount(Math.max(0, lines.length - 1));
              }}
              placeholder="purchaser_name,purchaser_email,recipient_name,recipient_email,note,fulfillment..."
              className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 p-3.5 font-mono text-xs bg-white dark:bg-[#161820] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent)] shadow-xs"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-neutral-400">
              Columns: <code>purchaser_name, purchaser_email, recipient_name, recipient_email, note, fulfillment</code>
            </span>

            <button
              onClick={handleProcessCsv}
              disabled={submittingCsv || !csvText.trim()}
              className="primary-button text-xs py-2.5 px-6 btn-press shadow-sm disabled:opacity-50 font-semibold"
            >
              <Upload size={14} />
              <span>{submittingCsv ? 'Processing Batch...' : 'Generate Codes & Import'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
