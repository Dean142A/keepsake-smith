'use client';

import React, { useState } from 'react';
import { Search, ArrowUp, X } from 'lucide-react';

/**
 * The bar pinned to the foot of the centre column. The reference puts a
 * composer here: a rounded field over a row of pill controls, with a dark
 * circular submit at the right. There is nothing to compose in an orders
 * console, so the same shape searches orders instead and the pills filter
 * the result.
 */
const STATUS = [
  { id: 'all', label: 'Any status' },
  { id: 'ready', label: '3D ready' },
  { id: 'in_transit', label: 'On its way' },
  { id: 'pickup_ready', label: 'For pickup' },
];

const FULFILMENT = [
  { id: 'all', label: 'Any fulfilment' },
  { id: 'digital_physical', label: 'Digital + physical' },
  { id: 'digital_only', label: 'Digital only' },
];

export default function AdminCommandBar({ value, onChange, filters, onFilters, resultCount }) {
  const [open, setOpen] = useState('');

  const cyclePill = (key, options) => {
    const idx = options.findIndex((o) => o.id === (filters[key] || 'all'));
    const next = options[(idx + 1) % options.length];
    onFilters({ ...filters, [key]: next.id });
  };

  const label = (key, options) =>
    options.find((o) => o.id === (filters[key] || 'all'))?.label || options[0].label;

  const active = (key) => (filters[key] || 'all') !== 'all';

  const pill = (key, options) => (
    <button
      type="button"
      onClick={() => cyclePill(key, options)}
      className={`pill inline-flex items-center gap-2 px-4 py-2.5 text-[14px] ${
        active(key)
          ? 'text-neutral-950 dark:text-white font-medium'
          : 'text-neutral-600 dark:text-neutral-300'
      }`}
    >
      <span>{label(key, options)}</span>
    </button>
  );

  return (
    <div className="card-surface px-5 pt-5 pb-4">
      <div className="flex items-center gap-3 px-1 pb-4">
        <Search size={18} className="text-neutral-400 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Find an order by recipient, access code or email..."
          className="flex-1 bg-transparent text-[16px] text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none min-w-0"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex-shrink-0"
            title="Clear"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {pill('status', STATUS)}
        {pill('fulfillmentType', FULFILMENT)}
        <button
          type="button"
          onClick={() => onFilters({ ...filters, recent: !filters.recent })}
          className={`pill inline-flex items-center gap-2 px-4 py-2.5 text-[14px] ${
            filters.recent
              ? 'text-neutral-950 dark:text-white font-medium'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
        ><span>{filters.recent ? 'Last 7 days' : 'Any date'}</span>
        </button>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-[13px] text-neutral-400 hidden sm:block">
            {resultCount} {resultCount === 1 ? 'order' : 'orders'}
          </span>
          <div className="w-11 h-11 rounded-full bg-accent text-white dark:text-neutral-950 flex items-center justify-center flex-shrink-0">
            <ArrowUp size={18} strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </div>
  );
}
