'use client';

import React from 'react';
import {
  Package,
  Clock,
  Sparkles,
  Key,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Upload,
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function AdminDashboard({
  orders = [],
  onOpenOrder,
  onOpenAddOrder,
  onOpenCsvModal,
  setActiveTab,
}) {
  const totalOrders = orders.length;
  const pendingAssets = orders.filter((o) => !o.packageUrl || o.packageUrl === '').length;
  const redeemedOrders = orders.filter((o) => o.status === 'redeemed' || o.hasBeenOpened).length;
  const activeCodes = orders.filter((o) => o.accessCode).length;

  const urgentQueue = orders
    .filter((o) => !o.packageUrl || o.packageUrl === '')
    .slice(0, 5);

  const recentOrders = [...orders].slice(0, 6);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      {/* Top Greeting & Date Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200/40 dark:border-neutral-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-[-0.035em] text-neutral-900 dark:text-white">
            {getGreeting()}, Administrator
          </h2>
          <p className="text-xs text-neutral-500 mt-1">{getFormattedDate()}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddOrder}
            className="primary-button text-xs btn-press py-2 px-4 shadow-sm"
          >
            <Plus size={14} />
            <span>Create Gift Order</span>
          </button>
          <button
            onClick={onOpenCsvModal}
            className="px-3.5 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all btn-press inline-flex items-center gap-1.5"
          >
            <Upload size={13} />
            <span>Daily CSV Import</span>
          </button>
        </div>
      </div>

      {/* 4 TeleFlow KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Orders */}
        <div className="card-border p-5 card-hover">
          <div className="flex items-center justify-between">
            <span className="uppercase-label text-neutral-400">Total Gift Orders</span>
            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold tracking-[-0.035em] font-mono text-neutral-900 dark:text-white">
              {totalOrders}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp size={11} className="mr-0.5" /> All-time
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 block mt-1">Processed through system</span>
        </div>

        {/* Card 2: Pending WebGL Assets */}
        <div className="card-border p-5 card-hover">
          <div className="flex items-center justify-between">
            <span className="uppercase-label text-neutral-400">Pending 3D Assets</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold tracking-[-0.035em] font-mono text-neutral-900 dark:text-white">
              {pendingAssets}
            </span>
            {pendingAssets > 0 ? (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Action required
              </span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                All assigned
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-400 block mt-1">Awaiting 3D book config</span>
        </div>

        {/* Card 3: Redeemed in Portal */}
        <div className="card-border p-5 card-hover">
          <div className="flex items-center justify-between">
            <span className="uppercase-label text-neutral-400">Redeemed in Portal</span>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold tracking-[-0.035em] font-mono text-neutral-900 dark:text-white">
              {redeemedOrders}
            </span>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              {totalOrders > 0 ? Math.round((redeemedOrders / totalOrders) * 100) : 0}% rate
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 block mt-1">Unlocked 3D keepsake experience</span>
        </div>

        {/* Card 4: Active Access Codes */}
        <div className="card-border p-5 card-hover">
          <div className="flex items-center justify-between">
            <span className="uppercase-label text-neutral-400">Active Access Codes</span>
            <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Key size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold tracking-[-0.035em] font-mono text-neutral-900 dark:text-white">
              {activeCodes}
            </span>
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
              KPSK tokens
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 block mt-1">12-char cryptographic codes</span>
        </div>
      </div>

      {/* Urgent Production Queue */}
      {urgentQueue.length > 0 && (
        <div className="card-border overflow-hidden animate-slide-up">
          <div className="p-4 md:p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-amber-500" />
              <div>
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-white tracking-[-0.025em]">
                  Production Queue &bull; Missing 3D WebGL Assets
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  These orders require package textures or personalized audio before recipient redemption.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {urgentQueue.map((ord) => (
              <div
                key={ord.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                    {(ord.recipientName || ord.customer || 'U')[0]}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                      {ord.recipientName || ord.customer || 'Recipient'}
                      <span className="text-neutral-400 font-normal ml-1">
                        from {ord.purchaserName || ord.customer || 'Purchaser'}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Code: <span className="text-accent font-semibold">{ord.accessCode || 'Pending'}</span> &bull; Order #{ord.id}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenOrder(ord)}
                  className="px-3 py-1.5 rounded-full bg-accent-soft text-accent hover:bg-accent hover:text-white transition-all text-xs font-medium self-start sm:self-auto btn-press"
                >
                  Configure 3D Assets
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity & Orders List */}
      <div className="card-border overflow-hidden">
        <div className="p-4 md:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white tracking-[-0.025em]">
              Recent Gift Orders
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Latest gift packages received in the portal
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
          >
            <span>Full CRM Directory</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No gift orders found. Click &quot;Create Gift Order&quot; to add your first customer order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50/50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">Recipient & Purchaser</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">Access Code</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">Fulfillment</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400">3D Assets</th>
                  <th className="py-2.5 px-4 uppercase-label text-neutral-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {recentOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {ord.recipientName || ord.customer || 'Recipient'}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {ord.purchaserName || ord.customer || 'Purchaser'} ({ord.purchaserEmail || ord.email || 'N/A'})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-accent">
                      {ord.accessCode || 'Pending'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 capitalize">
                        {(ord.fulfillmentType || 'digital_physical').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ord.packageUrl ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 size={12} /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                          <Clock size={12} /> Needs Assets
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenOrder(ord)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium text-accent hover:bg-accent-soft transition-colors"
                      >
                        Inspect
                      </button>
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
