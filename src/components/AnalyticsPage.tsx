/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Subject } from "../types";
import {
  AlertTriangle,
  ArrowRight,
  Workflow,
} from "lucide-react";

interface AnalyticsPageProps {
  subjects: Subject[];
  isDarkMode: boolean;
}

export default function AnalyticsPage({ subjects, isDarkMode }: AnalyticsPageProps) {
  const [simulateCount, setSimulateCount] = useState<number>(2);

  // Weekly attendance data — week-by-week trend (static demonstration, 8 weeks)
  const weeklyTrends = [
    { week: "W1", pct: 75 },
    { week: "W2", pct: 82 },
    { week: "W3", pct: 68 },
    { week: "W4", pct: 91 },
    { week: "W5", pct: 78 },
    { week: "W6", pct: 72 },
    { week: "W7", pct: 80 },
    { week: "W8", pct: 88 },
  ];

  // Real danger subjects (< 75%) computed from props — exclude subjects with no data
  const dangerSubjects = subjects.filter((s) => {
    if (s.totalClasses === 0) return false; // no data yet, not in danger
    const rate = (s.attendanceCount / s.totalClasses) * 100;
    return rate < 75;
  });

  // Whether any real attendance data exists at all
  const hasAttendanceData = subjects.some(s => s.totalClasses > 0);

  // Classes needed to get back to 75%
  const classesNeeded = (sub: Subject) => {
    // (attended + x) / (total + x) >= 0.75 → solve for x
    const target = 0.75;
    const { attendanceCount: a, totalClasses: t } = sub;
    if (t === 0) return 0;
    const needed = Math.ceil((target * t - a) / (1 - target));
    return Math.max(0, needed);
  };

  // What-if simulation per real subject
  const simulatedSubjects = subjects.map((s) => {
    const currentRate = s.totalClasses > 0 ? (s.attendanceCount / s.totalClasses) * 100 : 0;
    const projectedTotal = s.totalClasses + simulateCount;
    const projectedRate = projectedTotal > 0 ? (s.attendanceCount / projectedTotal) * 100 : 0;
    return {
      ...s,
      currentRate,
      projectedRate,
      isSafe: projectedRate >= 75,
    };
  });

  const ICON_MAP: Record<string, string> = {
    maths: "calculate",
    physics: "biotech",
    discrete: "scatter_plot",
    ds: "account_tree",
    evs: "eco",
    ml: "neurology",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface mb-1">Academic Analytics</h2>
        <p className="text-xs text-on-surface-variant font-mono">Deep dive into your semester performance & attendance projections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Weekly Attendance Trend Bar Chart */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-primary text-xl">monitoring</span>
              <span>Weekly Attendance Trend</span>
            </h3>
            <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-3 py-1 rounded-xl">Last 8 Weeks</span>
          </div>

          {hasAttendanceData ? (
            <>
              {/* Y-axis labels + bars */}
              <div className="relative flex items-end h-56 gap-2 pt-4">
                {/* 75% line */}
                <div className="absolute left-0 right-0 border-t border-dashed border-error/40" style={{ bottom: `${(75 / 100) * 100}%` }}>
                  <span className="absolute -top-4 left-0 text-[9px] text-error font-mono font-bold">75% threshold</span>
                </div>

                {weeklyTrends.map((bar, i) => {
                  const isBelowThreshold = bar.pct < 75;
                  return (
                    <div key={i} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                      {/* Tooltip */}
                      <div className="absolute -top-8 bg-surface-container-high border border-outline px-2 py-1 rounded-xl text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                        {bar.pct}% attendance
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 progress-glow ${isBelowThreshold ? (isDarkMode ? "bg-error" : "bg-[#FF6B6B]") : (isDarkMode ? "bg-primary" : "bg-[#00C896]")}`}
                        style={{ height: `${bar.pct}%` }}
                      />
                      <span className="mt-2 text-[10px] text-on-surface-variant font-bold font-mono">{bar.week}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 pt-2 border-t border-outline-variant/30">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${isDarkMode ? "bg-primary" : "bg-[#00C896]"}`} />
                  <span className="text-[10px] text-on-surface-variant">Above 75% (Safe)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${isDarkMode ? "bg-error" : "bg-[#FF6B6B]"}`} />
                  <span className="text-[10px] text-on-surface-variant">Below 75% (Danger)</span>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl">monitoring</span>
              <p className="text-sm font-semibold text-on-surface-variant text-center max-w-xs">
                No attendance data yet.
              </p>
              <p className="text-xs text-on-surface-variant/60 text-center max-w-xs">
                Start marking attendance to see your weekly trends!
              </p>
            </div>
          )}
        </div>

        {/* Danger Zone Alerts */}
        <div className={`lg:col-span-4 rounded-2xl p-6 flex flex-col ${isDarkMode ? "glass-card" : "bg-[#FFF5F5] border-[1.5px] border-[#FF6B6B]"}`}>
          <div>
            <h3 className={`font-bold text-base flex items-center gap-1.5 mb-1 ${isDarkMode ? "text-error" : "text-[#CC0000]"}`}>
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              Subjects below 75% threshold — attend immediately!
            </p>

            <div className="space-y-3 flex-1">
              {!hasAttendanceData ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <span className="material-symbols-outlined text-primary text-2xl block mb-1">verified</span>
                  <p className="text-xs font-bold text-primary">All subjects safe for now!</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Mark attendance to track danger zone</p>
                </div>
              ) : dangerSubjects.length === 0 ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <span className="material-symbols-outlined text-primary text-2xl block mb-1">verified</span>
                  <p className="text-xs font-bold text-primary">All subjects are safe!</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Keep it up 🎉</p>
                </div>
              ) : (
                dangerSubjects.map((sub) => {
                  const rate = (sub.attendanceCount / sub.totalClasses) * 100;
                  const needed = classesNeeded(sub);
                  return (
                    <div
                      key={sub.id}
                      className={`p-3.5 rounded-xl flex justify-between items-center transition-all cursor-pointer ${isDarkMode ? "bg-error-container/10 border border-error/20 hover:border-error/40 hover:bg-error-container/15" : "bg-[#FFF5F5] border border-[#FF6B6B]/50 hover:border-[#FF6B6B] hover:bg-[#FFF0F0]"}`}
                    >
                      <div>
                        <p className={`text-xs font-bold ${isDarkMode ? "text-error" : "text-[#CC0000]"}`}>{sub.name}</p>
                        <p className="text-2xl font-black mt-0.5 text-on-surface leading-none font-mono">{rate.toFixed(0)}%</p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded block ${isDarkMode ? "text-error bg-error/10 border border-error/20" : "text-[#CC0000] bg-[#FFF5F5] border border-[#FF6B6B]/40"}`}>
                          NEED +{needed} CLASSES
                        </span>
                        <span className="text-[9px] text-on-surface-variant font-mono block">{sub.attendanceCount}/{sub.totalClasses} attended</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant mt-auto">
            <button
              onClick={() => alert("Opening attendance recovery plan...")}
              className="w-full inline-flex items-center justify-center gap-1.5 text-primary text-xs font-bold hover:underline cursor-pointer"
            >
              <span>View Recovery Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* What-If Simulation */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/30">
          <div>
            <h3 className="text-lg font-bold text-[#7bd0ff] flex items-center gap-1.5">
              <Workflow className="w-5 h-5 text-secondary" />
              <span>Miss-Attendance Projection</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Simulate missing N more classes — see how each subject is affected.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#060e20] p-2 rounded-xl border border-outline-variant/60">
            <button
              onClick={() => setSimulateCount(Math.max(0, simulateCount - 1))}
              className="w-7 h-7 rounded-lg bg-surface-variant text-on-surface flex items-center justify-center font-bold text-sm hover:bg-primary hover:text-[#002114] transition-all cursor-pointer"
            >
              −
            </button>
            <div className="text-center min-w-[48px]">
              <span className="font-black text-xl text-primary font-mono">{simulateCount}</span>
              <span className="text-[9px] text-on-surface-variant block font-mono">sessions</span>
            </div>
            <button
              onClick={() => setSimulateCount(Math.min(20, simulateCount + 1))}
              className="w-7 h-7 rounded-lg bg-surface-variant text-on-surface flex items-center justify-center font-bold text-sm hover:bg-primary hover:text-[#002114] transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {simulatedSubjects.map((sub) => (
            <div
              key={sub.id}
              className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                sub.isSafe
                  ? "bg-[#171f33] border-outline-variant/60 hover:border-primary/30"
                  : "bg-error/5 border-error/30 hover:border-error/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-xl text-on-surface-variant">
                  {ICON_MAP[sub.id] ?? "school"}
                </span>
                <span className="text-[9px] font-mono font-bold text-on-surface-variant">{sub.currentRate.toFixed(0)}% now</span>
              </div>

              <div>
                <p className="font-bold text-xs text-on-surface leading-tight">{sub.name}</p>
                <div className="h-1 bg-outline-variant rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${sub.isSafe ? "bg-primary" : "bg-error"}`}
                    style={{ width: `${Math.min(100, sub.projectedRate)}%` }}
                  />
                </div>
              </div>

              <div>
                <span className={`font-black text-xl font-mono ${sub.isSafe ? "text-secondary" : "text-error"}`}>
                  {sub.projectedRate.toFixed(0)}%
                </span>
                <span className={`text-[9px] font-mono font-extrabold block mt-0.5 ${sub.isSafe ? "text-primary" : "text-error"}`}>
                  {sub.isSafe ? "✓ Safe" : "⚠ Danger"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 font-mono">
          External Resources
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "DTU Website",    href: "http://www.dtu.ac.in",        icon: "school",            color: "text-primary" },
            { label: "Result Hub",     href: "https://www.resulthubdtu.com",  icon: "workspace_premium", color: "text-secondary" },
            { label: "Unstop",         href: "https://unstop.com",          icon: "military_tech",     color: "text-error" },
            { label: "LeetCode",       href: "https://leetcode.com",        icon: "terminal",          color: "text-secondary-fixed-dim" },
            { label: "Codeforces",     href: "https://codeforces.com",      icon: "code",              color: "text-primary-fixed-dim" },
            { label: "GeeksforGeeks",  href: "https://geeksforgeeks.org",   icon: "menu_book",         color: "text-[#2f8d46]" },
            { label: "Coding Ninjas",  href: "https://codingninjas.com",    icon: "psychology",        color: "text-tertiary-fixed-dim" },
          ].map(({ label, href, icon, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-4 bg-surface-container rounded-xl border border-outline-variant hover:bg-[#2d3449]/30 transition-all hover:-translate-y-0.5 group text-center"
            >
              <span className={`material-symbols-outlined mb-1 group-hover:scale-105 transition-transform ${color}`}>{icon}</span>
              <span className={`text-[10px] font-bold text-on-surface tracking-tight group-hover:${color}`}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
