'use client';

import React, { useState, useMemo } from 'react';
import {
  Key,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Download,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useToast } from './AdminToast';
import { isExperienceReady } from '@/lib/keepsake';

export default function AdminCodeVault({ orders = [], onOpenOrder }) {
  const { toast } = useToast();
  const [searchCode, setSearchCode] = useState('');
  const [vaultFilter, setVaultFilter] = useState('ALL'); // ALL, ACTIVE, REDEEMED
  const [testCodeInput, setTestCodeInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const codesList = useMemo(() => {
    return orders
      .filter((o) => o.accessCode)
      .map((o) => ({
        id: o.id,
        code: o.accessCode,
        recipient: o.recipientName || 'Recipient',
        purchaser: o.purchaserName || o.customer || 'Customer',
        date: o.createdAt || 'Recent',
        redeemed: Boolean(o.status === 'redeemed' || o.hasBeenOpened),
        ready: isExperienceReady(o),
        order: o,
      }));
  }, [orders]);

  const filteredCodes = useMemo(() => {
    return codesList.filter((item) => {
      const matchSearch =
        !searchCode ||
        item.code.toLowerCase().includes(searchCode.toLowerCase()) ||
        item.recipient.toLowerCase().includes(searchCode.toLowerCase()) ||
        item.purchaser.toLowerCase().includes(searchCode.toLowerCase());

      if (!matchSearch) return false;
      if (vaultFilter === 'ACTIVE') return !item.redeemed;
      if (vaultFilter === 'REDEEMED') return item.redeemed;
      return true;
    });
  }, [codesList, searchCode, vaultFilter]);

  const handleCopyLink = (code) => {
    const url = `https://app.thekeepsakesmith.com/?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast(`Copied redemption URL for ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleValidateCode = (e) => {
    e.preventDefault();
    const clean = testCodeInput.trim().toUpperCase();
    if (!clean) return;

    const found = codesList.find((c) => c.code.toUpperCase() === clean);
    if (found) {
      setTestResult({
        valid: true,
        item: found,
        message: `Valid active code for ${found.recipient}`,
      });
      toast(`Code verified: Assigned to ${found.recipient}`);
    } else {
      setTestResult({
        valid: false,
        message: `Code "${clean}" not found in database`,
      });
      toast('Invalid or unregistered code', 'error');
    }
  };

  const handleExportCSV = () => {
    if (codesList.length === 0) {
      toast('No codes to export', 'info');
      return;
    }
    const header = 'Order ID,Access Code,Recipient,Purchaser,Status,Portal URL\n';
    const rows = codesList
      .map(
        (c) =>
          `"${c.id}","${c.code}","${c.recipient}","${c.purchaser}","${
            c.redeemed ? 'Redeemed' : 'Active'
          }","https://app.thekeepsakesmith.com/?code=${c.code}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keepsake-access-codes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported access codes to CSV');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.035em] text-neutral-900 dark:text-white">
            Access Code Vault &amp; Cryptographic Keys
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            12-character format (`KPSK-XXXX-XXXX`) protecting 3D WebGL book portals.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all btn-press inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download size={13} />
          <span>Export All (CSV)</span>
        </button>
      </div>

      {/* Instant Code Validator Tool */}
      <div className="card-surface p-5 bg-neutral-50/50 dark:bg-neutral-800/40">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-accent" />
          <h3 className="font-semibold text-xs text-neutral-900 dark:text-white">
            Instant Code Verifier &amp; Order Lookup
          </h3>
        </div>
        <form onSubmit={handleValidateCode} className="flex flex-col sm:flex-row gap-2 max-w-lg">
          <input
            type="text"
            value={testCodeInput}
            onChange={(e) => setTestCodeInput(e.target.value)}
            placeholder="Enter code e.g. KPSK-ABCD-1234"
            className="flex-1 rounded-full border border-neutral-200/60 dark:border-neutral-700 px-4 py-2 text-xs font-mono bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
          />
          <button type="submit" className="primary-button text-xs py-2 px-4 btn-press whitespace-nowrap">
            Verify Code
          </button>
        </form>

        {testResult && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs flex items-center justify-between gap-3 ${
              testResult.valid
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200/50 dark:border-red-800/50'
            }`}
          >
            <span>{testResult.message}</span>
            {testResult.valid && (
              <button
                onClick={() => onOpenOrder(testResult.item.order)}
                className="underline font-semibold hover:opacity-80"
              >
                Open Order #{testResult.item.id}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Directory Table */}
      <div className="card-surface overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
            <input
              type="text"
              placeholder="Search codes or recipients..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full rounded-full border border-neutral-200/60 dark:border-neutral-700 px-3 pl-8 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Codes' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'REDEEMED', label: 'Redeemed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setVaultFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  vaultFilter === tab.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold'
                    : 'border border-neutral-200/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredCodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No access codes match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">Access Code</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">Recipient</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">Status</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">3D Assets</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredCodes.map((item) => (
                  <tr
                    key={item.code}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-accent text-xs">
                      {item.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {item.recipient}
                      </div>
                      <div className="text-[11px] text-neutral-400">Order #{item.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          item.redeemed
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        {item.redeemed ? 'Redeemed' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.ready ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                          &bull; Assigned
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium text-[11px]">&bull; Needs 3D Setup</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(item.code)}
                          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-accent transition-colors"
                          title="Copy Link"
                        >
                          {copiedCode === item.code ? (
                            <Check size={13} className="text-accent" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                        <a
                          href={`https://app.thekeepsakesmith.com/?code=${item.code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-accent transition-colors"
                          title="Open 3D Portal"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
