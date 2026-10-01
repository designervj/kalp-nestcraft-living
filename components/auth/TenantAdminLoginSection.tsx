'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Package,
  ShoppingCart,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateCodeChallenge, generateCodeVerifier } from '@/lib/pkce';

export default function TenantAdminLoginSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tenantSlug = (process.env.NEXT_PUBLIC_TENANT_SLUG || 'nestcraft').trim();
  const tenantId = (process.env.NEXT_PUBLIC_TENANT_ID || 'kp_nestcraft').trim();
  const rawAdminUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL || 'https://zerolive.kalptree.xyz';
  const adminBaseUrl = rawAdminUrl
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\/+$/, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    setLoading(true);

    try {
      // Step 1: Authenticate with Kalp Business API directly
      const rawApiBase = (
        process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bizlive.kalptree.xyz'
      ).replace(/\/+$/, '');
      const authApiUrl = rawApiBase.endsWith('/api')
        ? `${rawApiBase}/auth`
        : `${rawApiBase}/api/auth`;
      const loginRes = await fetch(`${authApiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'x-tenant-db': tenantId,
          'x-tenant-slug': tenantSlug,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          tenant_slug: tenantSlug,
          keepSignedIn: false,
          keep_signed_in: false,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.access_token) {
        throw new Error(
          loginData.detail ||
            loginData.message ||
            'Invalid credentials or unauthorized access.',
        );
      }

      const token = loginData.access_token;

      // Set local cookies and tokens so session is available
      const maxAge = 60 * 60 * 24 * 30;
      document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `${tenantId}_auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `auth_token_${tenantId}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `admin_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      try {
        localStorage.setItem('auth_token', token);
      } catch {}

      // Step 2: Generate PKCE Verifier and Challenge for admin console handoff
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Step 3: Call SSO Create endpoint
      const targetDashboard = `/${tenantSlug}/dashboard`;
      const redirectUri = `${adminBaseUrl}/auth/callback`;

      const ssoRes = await fetch('/api/auth/sso/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-tenant-db': tenantId,
          'x-tenant-slug': tenantSlug,
        },
        body: JSON.stringify({
          redirectUri,
          codeChallenge,
          codeVerifier,
          returnTo: targetDashboard,
          redirect: targetDashboard,
        }),
      });

      const ssoData = await ssoRes.json();

      if (!ssoRes.ok || !ssoData.success || !ssoData.code) {
        throw new Error(
          ssoData.detail ||
            ssoData.message ||
            'Failed to establish admin session. Please try again.',
        );
      }

      toast.success('Signed in successfully! Redirecting...');
      const callbackUrl = `${redirectUri}?code=${encodeURIComponent(ssoData.code)}&returnTo=${encodeURIComponent(targetDashboard)}&redirect=${encodeURIComponent(targetDashboard)}&next=${encodeURIComponent(targetDashboard)}`;
      window.location.href = callbackUrl;
    } catch (err: any) {
      console.error('[AdminLogin] Error:', err);
      const msg = err.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0c120f] text-slate-100 font-sans selection:bg-[#0d6533]/40 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0d6533]/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/3" />

      {/* Main Form Container */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative z-10">
        <div className="max-w-md w-full mx-auto">
          {/* Header & Badges */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Link
                href="/"
                className="flex items-center gap-2 group transition-transform active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0d6533] to-emerald-700 flex items-center justify-center shadow-lg shadow-[#0d6533]/30 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-100" />
                </div>
                <div>
                  <span className="text-xl font-black uppercase tracking-tight text-white block">
                    Nestcraft
                  </span>
                  <span className="text-[10px] tracking-widest font-semibold uppercase text-emerald-400 block -mt-1">
                    Living Portal
                  </span>
                </div>
              </Link>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Admin Portal
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              Admin Login
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enter your credentials to access the store administration dashboard.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 mb-6 flex items-start gap-3 text-xs font-semibold text-rose-300 bg-rose-950/50 rounded-2xl border border-rose-500/30 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="leading-snug">
                <p className="font-bold text-rose-200 mb-0.5">Authentication Failed</p>
                <p className="text-rose-300/90">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full flex h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-white/20 disabled:opacity-50"
                  placeholder="admin@nestcraft.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5 block">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full flex h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-sm font-medium text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 hover:border-white/20 disabled:opacity-50 font-mono"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex h-12 mt-6 items-center justify-center rounded-xl bg-gradient-to-r from-[#0d6533] to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#0d6533]/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Links back to storefront */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <Link
              href="/"
              className="hover:text-emerald-400 transition-colors"
            >
              ← Back to Storefront
            </Link>
            <Link
              href="/login"
              className="hover:text-emerald-400 transition-colors"
            >
              Customer Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Hero / Feature Overview Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#090d0b] border-l border-white/10 flex-col justify-between p-12 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-6">
            <ShieldCheck size={14} />
            <span>STORE ADMINISTRATION</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight mb-4">
            Manage Your Store with Complete Control
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Access your centralized operations dashboard to manage products, monitor orders, and track store performance.
          </p>

          <div className="space-y-3">
            {[
              {
                icon: Package,
                title: 'Catalog & Inventory Management',
                desc: 'Organize products, manage stock counts, update pricing, and configure variants effortlessly.',
              },
              {
                icon: ShoppingCart,
                title: 'Order Tracking & Processing',
                desc: 'Review customer purchases, fulfill shipments, and handle returns with real-time updates.',
              },
              {
                icon: ShieldAlert,
                title: 'Secure Access & Control',
                desc: 'Protected administrator console with encrypted sessions and safety controls.',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">
                      {feature.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Portal: <strong className="text-white">Nestcraft Living</strong></span>
          <span>Access: <strong className="text-emerald-400">Authorized Personnel</strong></span>
        </div>
      </div>
    </div>
  );
}
