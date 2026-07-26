/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generic 404 Not Found page.
 * Used for unknown routes AND as a silent redirect for unauthorized
 * admin access attempts (avoids revealing that /admin exists).
 */

import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center gap-6 px-4 select-none">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-container/5 blur-[120px] pointer-events-none" />

      {/* 404 badge */}
      <div className="relative z-10 text-center space-y-6">
        <p className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#1AE7A6] to-[#00C896] drop-shadow-2xl select-none">
          404
        </p>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Page Not Found</h1>
          <p className="text-[#bacbbf] text-sm max-w-xs mx-auto leading-relaxed">
            The page you're looking for doesn't exist or you don't have permission to view it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1AE7A6] text-[#002114] rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-2.5 border border-[#2d3449] text-[#bacbbf] rounded-xl font-bold text-sm hover:border-[#1AE7A6]/40 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Go Back
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-[10px] text-[#4a5568] font-mono z-10">
        DTU Hub · Attendance &amp; Academic Tracker
      </p>
    </div>
  );
}
