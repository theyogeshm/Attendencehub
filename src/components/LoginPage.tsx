/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1326] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow orbs */}
      <div className="absolute top-[-120px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#1AE7A6]/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#7bd0ff]/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#1AE7A6]/3 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo + Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1AE7A6] to-[#00C896] shadow-2xl shadow-[#1AE7A6]/30 mb-5 relative">
            <span className="material-symbols-outlined text-[#002114] text-4xl font-black">school</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7bd0ff] border-2 border-[#0b1326] animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">DTU <span className="text-[#1AE7A6]">Hub</span></h1>
          <p className="text-[#bacbbf] text-sm mt-2 font-medium">Your smart academic companion</p>
        </div>

        {/* Glass card */}
        <div className="bg-[#131b2e]/80 backdrop-blur-xl border border-[#1AE7A6]/15 rounded-3xl p-8 shadow-2xl">

          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white mb-1">Sign in to continue</h2>
            <p className="text-[#bacbbf] text-xs">Use your DTU Google account for secure access</p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-[#111827] font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5 text-[#111827]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Redirecting to Google..." : "Continue with Google"}
          </button>

          {error && (
            <p className="mt-3 text-center text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl py-2 px-3">
              {error}
            </p>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#3b4a42]/30" />
            <span className="text-[#bacbbf] text-[10px] font-mono uppercase tracking-wider">Features</span>
            <div className="flex-1 h-px bg-[#3b4a42]/30" />
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "event_available", label: "Attendance Tracker", color: "text-[#1AE7A6]" },
              { icon: "assignment",     label: "Assignments",        color: "text-[#7bd0ff]" },
              { icon: "leaderboard",    label: "Analytics",          color: "text-[#f5a623]" },
              { icon: "calendar_today", label: "Timetable",          color: "text-[#1AE7A6]" },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 bg-[#0b1326]/60 rounded-xl p-3 border border-[#3b4a42]/20">
                <span className={`material-symbols-outlined text-lg ${f.color}`}>{f.icon}</span>
                <span className="text-[11px] font-semibold text-[#bacbbf]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[#bacbbf]/50 text-[10px] mt-6 font-mono">
          Data stored securely · RLS enabled · Your data, only yours
        </p>
      </div>
    </div>
  );
}
