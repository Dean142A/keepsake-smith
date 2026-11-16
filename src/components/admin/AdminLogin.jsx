'use client';

import React, { useState } from 'react';
import { Package, Shield, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@thekeepsakesmith.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your administrator passcode.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (data && data.success) {
        onLoginSuccess();
      } else {
        setError(data?.error || 'Invalid administrative credentials.');
      }
    } catch (err) {
      setError('Authentication server unreachable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] relative flex items-center justify-center p-4 overflow-hidden font-sans text-neutral-100 select-none">
      {/* 1. Ambient Lighting Blobs (Luxury Emerald & Gold Glow) */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-[#C5A059]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 2. Precision Radial Grid Mesh */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* 3. The Glassmorphism Vault Card */}
      <div className="w-full max-w-[430px] relative z-10 animate-slide-up">
        {/* Brand Emblem & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)] mb-4">
            <Package size={28} />
          </div>
          <h1 className="font-bold text-2xl tracking-[-0.035em] text-white">
            The Keepsake Smith
          </h1>
          <span className="inline-block mt-1 uppercase font-mono text-[10px] tracking-[0.15em] text-emerald-400/90 font-medium">
            ADMIN OPERATIONS VAULT
          </span>
        </div>

        {/* Card Surface */}
        <div className="backdrop-blur-2xl bg-[#101217]/90 border border-white/10 rounded-3xl p-7 md:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
          {/* Subtle top edge border shimmer */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          <div className="mb-6">
            <h2 className="font-bold text-lg text-white tracking-[-0.025em]">
              Sign in to console
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Enter your master administrative key to manage gift orders and 3D portal experiences.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="uppercase font-mono font-medium text-[10px] text-neutral-400 mb-1.5 block tracking-[0.08em]">
                Administrator Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-black/60 px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                required
              />
            </div>

            <div>
              <label className="uppercase font-mono font-medium text-[10px] text-neutral-400 mb-1.5 block tracking-[0.08em]">
                Master Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full rounded-full border border-white/10 bg-black/60 px-4 py-2.5 pr-10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2.5 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-300 leading-relaxed">
              <Shield size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>
                Encrypted server session. Authenticates via <code>httpOnly</code> secure tokens against the master key.
              </span>
            </div>

            {error && (
              <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-500/30 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs py-3 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.35)] btn-press tracking-wider uppercase mt-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate &amp; Enter</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[11px] text-neutral-500 font-mono">
          <span>The Keepsake Smith &bull; Dual-Subdomain Magic Container Node</span>
        </div>
      </div>
    </div>
  );
}
