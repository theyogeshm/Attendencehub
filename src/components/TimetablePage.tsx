/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface TimetablePageProps {
  onMarkAttendance: (subjectId: string, isPresent: boolean) => void;
}

export default function TimetablePage({ onMarkAttendance }: TimetablePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Animated icon container */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
          <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 0" }}>calendar_month</span>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 animate-ping" style={{ animationDuration: '2.5s' }} />
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-black text-on-surface mb-3 tracking-tight">
        Timetable{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Coming Soon
        </span>
      </h2>

      {/* Subtext */}
      <p className="text-on-surface-variant text-sm font-medium max-w-xs leading-relaxed">
        Section-wise timetables will be available soon!
      </p>

      {/* Decorative pill */}
      <div className="mt-8 flex items-center gap-2 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-full">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-primary text-xs font-bold font-mono tracking-wide">IN DEVELOPMENT</span>
      </div>
    </div>
  );
}
