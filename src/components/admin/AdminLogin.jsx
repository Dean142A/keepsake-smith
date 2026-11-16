'use client';

import React, { useState } from 'react';
import { Package, Shield, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4 text-neutral-900 dark:text-neutral-100 font-sans transition-colors">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent">
            <Package size={26} />
          </div>
          <div>
            <span className="font-bold text-2xl tracking-[-0.035em] block leading-none text-neutral-900 dark:text-white">
              The Keepsake Smith
            </span>
            <span className="uppercase font-medium text-[10px] tracking-[0.1em] text-accent block mt-1">
              Admin Operations Portal
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="border border-neutral-200/60 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 p-8 shadow-sm animate-slide-up">
          <div className="text-center mb-6">
            <h1 className="font-bold text-xl mb-1 tracking-[-0.035em] text-neutral-900 dark:text-white">
              Sign in to your account
            </h1>
            <p className="text-sm text-neutral-500">
              Enter your credentials to access the gift management vault
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="uppercase font-medium text-[11px] text-neutral-500 mb-1.5 block tracking-[0.07em]">
                Admin Identifier
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-neutral-200/60 dark:border-neutral-700 px-4 py-2.5 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent transition-all"
                required
              />
            </div>

            <div className="mb-5">
              <label className="uppercase font-medium text-[11px] text-neutral-500 mb-1.5 block tracking-[0.07em]">
                Password / Master Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full rounded-full border border-neutral-200/60 dark:border-neutral-700 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-accent transition-all bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 rounded-xl mb-6">
              <Shield size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Secure access for authorized administrators only. Session cookies are encrypted and verified server-side.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/50 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-accent hover:bg-accent-hover text-white rounded-full py-2.5 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 btn-press ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          The Keepsake Smith &bull; Protected Administrative Endpoint
        </p>
      </div>
    </div>
  );
}

