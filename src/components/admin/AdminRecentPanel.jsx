'use client';

import React, { useMemo, useState } from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { normaliseExperience } from '@/lib/keepsake';

/**
 * The right-hand column. In the reference this is "Chat history": a titled
 * sheet with a circular action, a search pill, a divided list whose rows
 * carry a title, a truncated description, an optional thumbnail and a
 * timestamp, and a dark full-width button pinned at the foot.
 *
 * Here the list is recent orders. The thumbnail slot shows the order's first
 * photograph, which is real media rather than decoration.
 */
function relativeTime(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

export default function AdminRecentPanel({ orders = [], onOpenOrder, onNewOrder, onRefresh }) {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (!q) return true;
        return [o.recipientName, o.purchaserName, o.accessCode, o.id, o.recipientEmail]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      })
      .slice(0, 12)
      .map((o) => {
        const exp = normaliseExperience(o);
        return {
          order: o,
          thumb: exp.pages[0]?.imageUrl || '',
          photos: exp.pages.length,
          suspended: o.access === 'suspended',
        };
      });
  }, [orders, query]);

  return (
    <div className="panel-surface h-full flex flex-col overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-3">
        <h2 className="text-[21px] font-semibold tracking-[-0.02em]">Recent orders</h2>
        <button
          onClick={onRefresh}
          title="Refresh"
          className="w-10 h-10 rounded-full bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center flex-shrink-0 btn-press"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="px-6 pb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="input-field pl-11 text-[14px] py-3"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        {rows.length === 0 ? (
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 py-6">
            {query ? 'Nothing matches that.' : 'No orders yet.'}
          </p>
        ) : (
          rows.map(({ order, thumb, photos, suspended }, i) => (
            <button
              key={order.id}
              onClick={() => onOpenOrder && onOpenOrder(order)}
              className={`w-full text-left py-4 ${i === 0 ? '' : 'border-t hairline'}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    suspended ? 'bg-red-500' : photos > 0 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold leading-tight truncate">
                    {order.recipientName || 'Recipient'}
                  </div>
                  <div className="text-[13px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    From {order.purchaserName || 'a purchaser'}
                    {photos > 0 ? ` · ${photos} photo${photos === 1 ? '' : 's'}` : ' · no photos yet'}
                  </div>
                </div>
              </div>

              {thumb && (
                <div className="mt-3 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt=""
                    className="w-full h-[150px] object-cover block"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <span className="font-mono text-[11px] text-neutral-400 truncate">
                  {order.accessCode}
                </span>
                <span className="text-[13px] text-neutral-400 flex-shrink-0">
                  {relativeTime(order.createdAt)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-6 pt-4">
        <button onClick={onNewOrder} className="primary-button w-full py-3.5 text-[15px] btn-press">
          <Plus size={17} />
          <span>New gift order</span>
        </button>
      </div>
    </div>
  );
}
