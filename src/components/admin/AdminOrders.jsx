'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Package,
  Mail,
} from 'lucide-react';
import { useToast } from './AdminToast';
import { isExperienceReady } from '@/lib/keepsake';

export default function AdminOrders({
  orders = [],
  onOpenOrder,
  onOpenAddOrder,
  globalSearch = '',
}) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING_ASSETS, DIGITAL_PHYSICAL, DIGITAL_ONLY, REDEEMED
  const [copiedCode, setCopiedCode] = useState(null);

  const activeSearch = searchTerm || globalSearch;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search match
      const query = activeSearch.toLowerCase().trim();
      const matchQuery =
        !query ||
        (o.id && String(o.id).toLowerCase().includes(query)) ||
        (o.accessCode && o.accessCode.toLowerCase().includes(query)) ||
        (o.recipientName && o.recipientName.toLowerCase().includes(query)) ||
        (o.purchaserName && o.purchaserName.toLowerCase().includes(query)) ||
        (o.purchaserEmail && o.purchaserEmail.toLowerCase().includes(query)) ||
        (o.recipientEmail && o.recipientEmail.toLowerCase().includes(query));

      if (!matchQuery) return false;

      // Filter match
      if (filter === 'PENDING_ASSETS') return !isExperienceReady(o);
      if (filter === 'DIGITAL_PHYSICAL') return o.fulfillmentType === 'digital_physical';
      if (filter === 'DIGITAL_ONLY') return o.fulfillmentType === 'digital_only';
      if (filter === 'REDEEMED') return o.status === 'redeemed' || o.hasBeenOpened;
      return true;
    });
  }, [orders, activeSearch, filter]);

  const handleCopyLink = (e, code) => {
    e.stopPropagation();
    if (!code) return;
    const url = `https://app.thekeepsakesmith.com/?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    toast(`Copied customer link for ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-fade-in">
      {/* TeleFlow Page Guide Banner */}
      <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-base">🎁</span>
          <span>
            <strong className="text-neutral-900 dark:text-white">Gift Orders Directory:</strong>{' '}
            Manage recipient access codes, upload personalized WebGL 3D book assets, and send unlock emails.
          </span>
        </div>
        <button
          onClick={onOpenAddOrder}
          className="primary-button text-xs py-1.5 px-3.5 self-start md:self-auto btn-press whitespace-nowrap"
        >
          <Plus size={13} />
          <span>New Order</span>
        </button>
      </div>

      {/* Directory Count & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-accent" />
          <span className="text-xs text-neutral-500">
            <span className="font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {filteredOrders.length}
            </span>{' '}
            gift order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING_ASSETS', label: 'Needs 3D Assets' },
            { id: 'DIGITAL_PHYSICAL', label: 'Digital + Physical' },
            { id: 'DIGITAL_ONLY', label: 'Digital Only' },
            { id: 'REDEEMED', label: 'Redeemed' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilter(pill.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                filter === pill.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Local Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
        <input
          type="text"
          placeholder="Filter by customer, recipient, code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full border border-neutral-200/60 dark:border-neutral-700 px-4 pl-9 py-2 text-xs focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent transition-all bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      {/* Directory Table (TeleFlow Style) */}
      <div className=" rounded-xl bg-white dark:bg-neutral-900 overflow-hidden flex-1 shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            {orders.length === 0
              ? 'No gift orders in the database yet. Click "+ New Order" to create one.'
              : 'No orders match your filter criteria.'}
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(100vh-320px)] divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredOrders.map((ord, i) => {
              const recipient = ord.recipientName || ord.customer || 'Recipient';
              const purchaser = ord.purchaserName || ord.customer || 'Purchaser';
              const initials = recipient.slice(0, 2).toUpperCase();
              const hasAssets = isExperienceReady(ord);

              return (
                <div
                  key={ord.id}
                  onClick={() => onOpenOrder(ord)}
                  className="w-full p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer text-left animate-fade-in group"
                  style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs md:text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <span className="truncate">{recipient}</span>
                        <span className="text-neutral-400 font-normal text-xs">&larr; from {purchaser}</span>
                      </div>

                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate flex items-center gap-2">
                        <span className="font-mono text-accent font-semibold">
                          {ord.accessCode || 'NO-CODE'}
                        </span>
                        <span>&bull;</span>
                        <span>Order #{ord.id}</span>
                        <span>&bull;</span>
                        <span className="capitalize">
                          {(ord.fulfillmentType || 'digital_physical').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges, Copy Link & Chevron */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* 3D WebGL Status Badge */}
                    <span
                      className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                        hasAssets
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {hasAssets ? (
                        <>
                          <CheckCircle2 size={11} /> 3D Ready
                        </>
                      ) : (
                        <>
                          <Clock size={11} /> Needs Assets
                        </>
                      )}
                    </span>

                    {/* Copy Link Button */}
                    {ord.accessCode && (
                      <button
                        onClick={(e) => handleCopyLink(e, ord.accessCode)}
                        className="p-1.5 rounded-full text-neutral-400 hover:text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Copy 1-Click Customer Link"
                      >
                        {copiedCode === ord.accessCode ? (
                          <Check size={14} className="text-accent" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}

                    <ChevronRight
                      size={16}
                      className="text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
