'use client';

import React from 'react';
import { Clock, CheckCircle2, ArrowRight, UploadCloud, Key, Gift } from 'lucide-react';
import { isExperienceReady } from '@/lib/keepsake';

/**
 * The centre column. Follows the reference: a hero mark, a large greeting
 * with a single question beneath it, then a row of three cards, each an
 * icon above a title and two lines of description.
 *
 * Recent orders are not repeated here — they are the right-hand panel.
 */
function HeroMark() {
  return (
    <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true" className="mx-auto">
      <defs>
        <radialGradient id="keepsakeStar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb38a" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#b9a8d6" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#c7cbd4" stopOpacity="0.25" />
        </radialGradient>
      </defs>
      {/* The reference hero is a soft four-pointed star. */}
      <path
        d="M75 4 C80 46 104 70 146 75 C104 80 80 104 75 146 C70 104 46 80 4 75 C46 70 70 46 75 4 Z"
        fill="url(#keepsakeStar)"
      />
    </svg>
  );
}

const Tile = ({ label, value, hint, tone = 'neutral', Icon }) => (
  <div className="card-surface p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">{label}</span>
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          tone === 'warn'
            ? 'bg-amber-500/10 text-amber-500'
            : tone === 'good'
            ? 'bg-emerald-500/10 text-emerald-500'
            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
        }`}
      >
        <Icon size={15} />
      </span>
    </div>
    <div className="text-[30px] font-semibold tracking-[-0.03em] leading-none">{value}</div>
    <div className="text-[12px] text-neutral-400 mt-1.5">{hint}</div>
  </div>
);

export default function AdminDashboard({
  orders = [],
  onOpenOrder,
  onOpenAddOrder,
  onOpenCsvModal,
  setActiveTab,
  userName,
}) {
  const total = orders.length;
  const pending = orders.filter((o) => !isExperienceReady(o)).length;
  const redeemed = orders.filter((o) => o.status === 'redeemed' || o.hasBeenOpened).length;
  const queue = orders.filter((o) => !isExperienceReady(o)).slice(0, 4);

  const actions = [
    {
      title: 'New gift order',
      body: 'Create an order and issue its access code',
      glyph: '🎁',
      onClick: onOpenAddOrder,
    },
    {
      title: 'Daily CSV import',
      body: 'Bring a batch of orders in at once',
      glyph: '📥',
      onClick: onOpenCsvModal,
    },
    {
      title: 'Access codes',
      body: 'Every code issued, and who holds it',
      glyph: '🔑',
      onClick: () => setActiveTab && setActiveTab('vault'),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="pt-6 pb-10 text-center">
        <HeroMark />
        <h1 className="text-[46px] leading-[1.05] font-bold tracking-[-0.04em] mt-6">
          Welcome, {userName || 'Administrator'}!
        </h1>
        <p className="text-[18px] text-neutral-500 dark:text-neutral-400 mt-4">
          What would you like to do today?
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {actions.map(({ title, body, glyph, onClick }) => (
          <button
            key={title}
            onClick={onClick}
            className="card-surface card-hover p-6 text-left min-h-[190px] flex flex-col"
          >
            <span className="text-[34px] leading-none mb-auto select-none" aria-hidden="true">
              {glyph}
            </span>
            <span className="block text-[16px] font-semibold mt-6">{title}</span>
            <span className="block text-[14px] text-neutral-500 dark:text-neutral-400 leading-snug mt-1.5">
              {body}
            </span>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <Tile label="Total orders" value={total} hint="All time" Icon={Gift} />
        <Tile
          label="Awaiting photos"
          value={pending}
          hint={pending ? 'Needs your attention' : 'All assigned'}
          tone={pending ? 'warn' : 'good'}
          Icon={pending ? Clock : CheckCircle2}
        />
        <Tile
          label="Opened in portal"
          value={redeemed}
          hint={total ? `${Math.round((redeemed / total) * 100)}% of orders` : '—'}
          tone="good"
          Icon={CheckCircle2}
        />
      </div>

      {queue.length > 0 && (
        <div className="card-surface p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold">Waiting on content</h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                These orders have no photographs yet, so their books cannot render.
              </p>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('orders')}
              className="text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1 flex-shrink-0"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-1">
            {queue.map((o) => (
              <button
                key={o.id}
                onClick={() => onOpenOrder && onOpenOrder(o)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium truncate">
                    {o.recipientName || 'Recipient'}
                  </span>
                  <span className="block text-[12px] text-neutral-400 truncate">
                    From {o.purchaserName || 'a purchaser'} · {o.accessCode}
                  </span>
                </span>
                <span className="text-[12px] text-amber-500 font-medium flex-shrink-0">
                  Needs photos
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
