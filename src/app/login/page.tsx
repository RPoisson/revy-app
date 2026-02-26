//revy-quiz/src/app/login/page.tsx

'use client';

import "../globals.css";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudioLogo } from "@/components/StudioLogo";

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        router.push('/');
      } else {
        setError('Incorrect password');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F5EE] text-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Branding & Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <StudioLogo className="text-black/50" />
          </div>
          
          <p className="text-sm text-black/70 leading-relaxed">
            Please enter your project password to access the design portal.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold uppercase tracking-wider text-black/60 ml-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-5 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs text-center animate-in fade-in zoom-in duration-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-full bg-black text-[#F8F5EE] text-sm font-medium tracking-wide hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Access Site'}
            </button>
          </form>
        </div>

        {/* Footer Reassurance */}
        <div className="text-center">
          <p className="text-xs text-black/40">
            Secure access for Studio clients.
          </p>
        </div>
      </div>
    </main>
  );
}