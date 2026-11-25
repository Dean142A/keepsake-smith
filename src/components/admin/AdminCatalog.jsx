'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { useToast } from './AdminToast';

export default function AdminCatalog({ products = [], onRefresh }) {
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.035em] text-neutral-900 dark:text-white">
            Catalog &amp; 3D Keepsake Templates
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage physical book dimensions, leatherette binding styles, and 3D WebGL page flip models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((prod) => (
          <div key={prod.id} className="card-surface overflow-hidden card-hover flex flex-col justify-between">
            <div>
              <div className="h-44 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden flex items-center justify-center">
                {prod.image ? (
                  <img
                    src={prod.image}
                    alt={prod.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                    <ImageIcon size={28} />
                    <span className="text-[10px] uppercase tracking-wider">Keepsake Preview</span>
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-white shadow-xs">
                  {prod.price || 'Free Experience'}
                </span>
              </div>

              <div className="p-4">
                <span className="uppercase-label text-accent text-[9px] block">
                  {prod.category || 'HEIRLOOM EDITION'}
                </span>
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-white mt-1">
                  {prod.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {prod.subtitle || prod.description || 'Custom crafted keepsake with interactive 3D WebGL flip viewer.'}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 mt-3">
              <span className="font-mono text-[11px]">SKU: KS-{prod.id}</span>
              <span className="inline-flex items-center gap-1 text-accent font-medium text-[11px]">
                <Sparkles size={11} /> 3D Flip Enabled
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
