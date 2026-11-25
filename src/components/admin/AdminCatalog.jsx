'use client';

import React from 'react';

/**
 * Placeholder for keepsake templates.
 *
 * Today every order renders through the same book: one cover, one page
 * geometry, one way of laying photographs out. The idea is that a purchaser
 * picks a template and the order carries that choice, so the same pipeline
 * can produce books that do not all look alike.
 *
 * Nothing here is wired up. The product catalogue that used to live on this
 * screen has been removed rather than left half-working, because a page that
 * edits records nothing reads is worse than a page that says it is not ready.
 */
export default function AdminCatalog() {
  return (
    <div className="animate-fade-in">
      <div className="pt-6 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[28px] font-bold tracking-[-0.03em]">Keepsake Templates</h1>
          <span className="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            Coming soon
          </span>
        </div>
        <p className="text-[15px] text-neutral-500 dark:text-neutral-400 max-w-[560px]">
          Every keepsake currently renders through the same book. This is where
          a choice of templates will live.
        </p>
      </div>

      <div className="card-surface p-8 max-w-[640px]">
        <h2 className="text-[16px] font-semibold mb-3">What this will be</h2>
        <p className="text-[14px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-5">
          A set of book designs a purchaser can choose between — different
          covers, different paper, different ways of arranging photographs on a
          page. The order records which one was picked, and the viewer builds
          from it. The machinery that turns an order into a book already works
          this way; it simply has one template to choose from.
        </p>

        <h2 className="text-[16px] font-semibold mb-3">What it is not yet</h2>
        <p className="text-[14px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Nothing on this screen is connected. The product catalogue that was
          here has been taken out rather than left to edit records that nothing
          reads.
        </p>
      </div>
    </div>
  );
}
