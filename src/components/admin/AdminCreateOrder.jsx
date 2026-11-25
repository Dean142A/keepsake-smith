'use client';

import React, { useState } from 'react';
import ExperienceBuilder from './ExperienceBuilder';
import { emptyExperience } from '@/lib/keepsake';
import {
  UserPlus,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Package,
  Sparkles,
} from 'lucide-react';
import { useToast } from './AdminToast';

export default function AdminCreateOrder({ onOrderCreated, onBatchImported }) {
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('single'); // 'single' or 'csv'

  // Single Order Form State
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [experience, setExperience] = useState(emptyExperience());
  const [fulfillmentType, setFulfillmentType] = useState('digital_physical');
  const [sendNotification, setSendNotification] = useState(true);
  const [submittingSingle, setSubmittingSingle] = useState(false);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [submittingCsv, setSubmittingCsv] = useState(false);
  const [csvPreviewCount, setCsvPreviewCount] = useState(0);

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
          experience,
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
        setExperience(emptyExperience());
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full w-fit">
        <button
          onClick={() => setActiveSubTab('single')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeSubTab === 'single'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        ><span>Single Gift Order</span>
        </button>
        <button
          onClick={() => setActiveSubTab('csv')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeSubTab === 'csv'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Upload size={14} />
          <span>Daily CSV Batch Import</span>
        </button>
      </div>

      {activeSubTab === 'single' ? (
        /* SINGLE GIFT ORDER FORM */
        <div className="card-surface p-6 md:p-8 animate-slide-up shadow-xs">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-[-0.035em] text-neutral-900 dark:text-white">
              Create Gift Order & Access Code
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Generates a unique 12-character access code (`KPSK-XXXX-XXXX`) and activates the 3D book experience.
            </p>
          </div>

          <form onSubmit={handleCreateSingle} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Purchaser Name</label>
                <input
                  type="text"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                  placeholder="e.g. John Sterling"
                  className="w-full rounded-full px-4 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Purchaser Email</label>
                <input
                  type="email"
                  value={purchaserEmail}
                  onChange={(e) => setPurchaserEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-full px-4 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient full name"
                  className="w-full rounded-full px-4 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                  required
                />
              </div>

              <div>
                <label className="uppercase-label text-neutral-400 block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@email.com"
                  className="w-full rounded-full px-4 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>


            <div>
              <label className="uppercase-label text-neutral-400 block mb-1">Fulfillment Mode</label>
              <select
                value={fulfillmentType}
                onChange={(e) => setFulfillmentType(e.target.value)}
                className="w-full rounded-full px-4 py-2 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="digital_physical">Physical Box + 3D Portal Experience</option>
                <option value="digital_only">Purely Digital 3D Experience</option>
                <option value="physical_only">Physical Keepsake Box Only</option>
              </select>
            </div>

            {/* Per-order media: photos become the book's pages, so no new
                template is needed for each customer. */}
            <ExperienceBuilder value={experience} onChange={setExperience} />

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                <span>Dispatch notification email to recipient immediately upon creation</span>
              </label>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
              <button
                type="submit"
                disabled={submittingSingle}
                className="primary-button text-xs py-2 px-6 btn-press"
              ><span>{submittingSingle ? 'Generating...' : 'Generate Order & Access Code'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* DAILY CSV BATCH IMPORT */
        <div className="card-surface p-6 md:p-8 animate-slide-up shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-[-0.035em] text-neutral-900 dark:text-white">
              Daily CSV Batch Import
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Upload orders from external fulfillment systems or paste raw CSV text to generate access codes in bulk.
            </p>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-accent transition-colors"><span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
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
            <label className="uppercase-label text-neutral-400 block mb-1">
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
              className="w-full rounded-xl p-3 font-mono text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-neutral-400">
              Expected columns: <code>purchaser_name, purchaser_email, recipient_name, recipient_email, note, fulfillment</code>
            </span>

            <button
              onClick={handleProcessCsv}
              disabled={submittingCsv || !csvText.trim()}
              className="primary-button text-xs py-2 px-6 btn-press disabled:opacity-50"
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
