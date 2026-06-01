/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Subject, Assignment, AttendanceStatus } from "../types";
import {
  CheckCircle,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Coffee,
  Plane,
  Clock,
  BookOpen,
  GraduationCap,
} from "lucide-react";


interface DashboardPageProps {
  subjects: Subject[];
  assignments: Assignment[];
  onMarkAttendance: (subjectId: string, status: AttendanceStatus) => void;
  onOpenAttendanceLog: (date?: number) => void;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  todayAttendance: Record<string, AttendanceStatus>;
}

// Day index → timetable day key
const DAY_MAP: Record<number, "MON" | "TUE" | "WED" | "THU" | "FRI"> = {
  1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI",
};

const getSubjectIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("math"))                               return "calculate";
  if (n.includes("physics"))                            return "biotech";
  if (n.includes("data struct") || n.includes("dsa"))   return "account_tree";
  if (n.includes("machine learn") || n.includes("ai"))  return "neurology";
  if (n.includes("environment") || n.includes("evs"))   return "eco";
  if (n.includes("discrete"))                           return "scatter_plot";
  if (n.includes("software") || n.includes("engineer")) return "engineering";
  if (n.includes("object") || n.includes("oop") || n.includes("java") || n.includes("python")) return "code";
  if (n.includes("database") || n.includes("dbms"))     return "storage";
  if (n.includes("network") || n.includes("operating")) return "dns";
  if (n.includes("web"))                                return "web";
  if (n.includes("lab"))                                return "science";
  return "school";
};

export default function DashboardPage({
  subjects,
  assignments,
  onMarkAttendance,
  onOpenAttendanceLog,
  setActiveTab,
  isDarkMode,
  todayAttendance,
}: DashboardPageProps) {
  const today = new Date();
  const todayDayIndex = today.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const todayKey = DAY_MAP[todayDayIndex] ?? null;

  // Calendar navigation
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  // Overall stats
  const totalAttended = subjects.reduce((s, x) => s + x.attendanceCount, 0);
  const totalHeld = subjects.reduce((s, x) => s + x.totalClasses, 0);
  const aggregateAtt = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;

  const pendingAssignments = assignments.filter((a) => !a.done).length;

  // Academic week (week of the year, approximate)
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const academicWeek = Math.ceil(((today.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  // (subjects array is used directly for today's schedule)

  // Calendar helpers
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  // shift to Mon-first grid
  const startOffset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const isPastDate = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };
  const isToday = (day: number) =>
    day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();



  return (
    <div className="space-y-6">
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Overall Attendance</span>
            <span className="material-symbols-outlined text-[#82ffc8] text-xl">analytics</span>
          </div>
          <div className="mt-3">
            <h3 className={`text-3xl font-bold font-sans tracking-tight ${isDarkMode ? "text-[#82ffc8]" : "text-[#111827]"}`}>
              {totalHeld > 0 ? `${aggregateAtt.toFixed(1)}%` : "N/A"}
            </h3>
            <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDarkMode ? "bg-[#2d3449]" : "bg-[#E5E7EB]"}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${isDarkMode ? "bg-gradient-to-r from-primary-container to-secondary" : "bg-[#00C896]"}`}
                style={{ width: `${Math.min(100, aggregateAtt)}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1.5">Across {subjects.length} subjects</p>
          </div>
        </div>

        {/* Card 2: Pending Assignments */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Pending Tasks</span>
            <span className="material-symbols-outlined text-[#7bd0ff] text-xl">assignment</span>
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-bold text-on-surface font-sans tracking-tight">
              {String(pendingAssignments).padStart(2, "0")}
            </h3>
            <p className="text-[10px] text-on-surface-variant mt-1.5">Assignments pending</p>
            <button
              onClick={() => setActiveTab("assignments")}
              className="mt-2 text-[10px] text-secondary font-bold hover:underline cursor-pointer"
            >
              View all →
            </button>
          </div>
        </div>

        {/* Card 3: Next Class */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between border-l-4 border-primary hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Next Class</span>
            <span className="material-symbols-outlined text-tertiary text-xl">schedule</span>
          </div>
          <div className="mt-3">
          {subjects.length > 0 ? (
            <>
              <h4 className="text-base font-bold text-on-surface line-clamp-1">{subjects[0].name}</h4>
              <p className="text-[11px] text-primary font-medium mt-1">{subjects[0].time || "Today's class"}</p>
              <span className={`mt-1 inline-block text-[9px] font-extrabold px-2 py-0.5 rounded font-mono ${subjects[0].type === "LAB" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                {subjects[0].type ?? "LEC"}
              </span>
            </>
          ) : (
            <>
              <h4 className="text-base font-bold text-on-surface">No subjects yet</h4>
              <p className="text-[11px] text-on-surface-variant mt-1">Add subjects in your profile</p>
            </>
          )}
          </div>
        </div>

        {/* Card 4: Academic Week */}
        <div className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Academic Week</span>
            <span className="material-symbols-outlined text-[#7bd0ff] text-xl">calendar_month</span>
          </div>
          <div className="mt-3">
            <h3 className={`text-3xl font-bold font-sans tracking-tight ${isDarkMode ? "text-[#7bd0ff]" : "text-[#111827]"}`}>Week {academicWeek}</h3>
            <p className="text-[10px] text-on-surface-variant mt-1.5">
              {today.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Today's Schedule */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-surface tracking-tight">
              Today's Schedule
              <span className="ml-2 text-xs font-normal text-on-surface-variant">
                {todayKey ? `(${todayKey})` : "(Weekend)"}
              </span>
            </h3>
            <button
              onClick={() => setActiveTab("timetable")}
              className="text-primary text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Timetable</span>
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-on-surface-variant mb-3" />
              <p className="text-sm font-semibold text-on-surface">No subjects added yet!</p>
              <p className="text-xs text-on-surface-variant mt-1">Edit your profile to add your subjects.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((sub) => {
                const isLab = sub.type === "LAB";
                const attPct = sub.totalClasses > 0
                  ? ((sub.attendanceCount / sub.totalClasses) * 100).toFixed(0)
                  : null;
                const currentStatus = todayAttendance[sub.id] as AttendanceStatus | undefined;
                const icon = getSubjectIcon(sub.name);

                const statusBadge: Record<string, { label: string; cls: string }> = {
                  present: { label: "✅ Present",  cls: "bg-primary/10 text-primary" },
                  absent:  { label: "❌ Absent",   cls: "bg-error/10 text-error" },
                  miss:    { label: "☕ Missed",   cls: isDarkMode ? "bg-[#2d3449] text-[#bacbbf]" : "bg-gray-100 text-gray-600" },
                  leave:   { label: "✈️ Leave",    cls: "bg-secondary/10 text-secondary" },
                };

                return (
                  <div
                    key={sub.id}
                    className={`glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all duration-300 ${
                      currentStatus
                        ? "border-l-4 " + (
                            currentStatus === "present" ? "border-primary" :
                            currentStatus === "absent"  ? "border-error"   :
                            currentStatus === "leave"   ? "border-secondary" :
                            "border-outline-variant"
                          )
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-outline-variant transition-colors ${
                        isLab
                          ? (isDarkMode ? "bg-[#222a3d]" : "bg-[#F3F4F6]") + " text-secondary group-hover:bg-secondary group-hover:text-[#001e2c]"
                          : (isDarkMode ? "bg-[#222a3d]" : "bg-[#F3F4F6]") + " text-primary group-hover:bg-[#1ae7a6] group-hover:text-[#002114]"
                      }`}>
                        <span className="material-symbols-outlined text-[22px]">{icon}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm text-on-surface">{sub.name}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold font-mono ${
                            isLab
                              ? "bg-secondary/10 text-secondary"
                              : isDarkMode
                                ? "bg-[rgba(26,231,166,0.1)] text-[#1AE7A6]"
                                : "bg-[#D1FAE5] text-[#065F46]"
                          }`}>
                            {sub.type ?? "LEC"}
                          </span>
                          {attPct && (
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                              Number(attPct) >= 75
                                ? isDarkMode ? "bg-primary/10 text-primary" : "bg-[#D1FAE5] text-[#065F46]"
                                : isDarkMode ? "bg-error/10 text-error" : "bg-[#FEE2E2] text-[#991B1B]"
                            }`}>
                              {attPct}%
                            </span>
                          )}
                          {currentStatus && statusBadge[currentStatus] && (
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${statusBadge[currentStatus].cls}`}>
                              {statusBadge[currentStatus].label}
                            </span>
                          )}
                        </div>
                        <p className="text-on-surface-variant text-[11px] mt-0.5">
                          {sub.prof || "—"}{sub.time ? ` • ${sub.time}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Attendance buttons — uses sub.id directly, no fuzzy matching */}
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      <button
                        onClick={() => onMarkAttendance(sub.id, "present")}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                          currentStatus === "present"
                            ? "bg-primary text-[#002114] ring-2 ring-primary/40 scale-105"
                            : "bg-primary-container text-[#002114] hover:brightness-110"
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Present
                      </button>
                      <button
                        onClick={() => onMarkAttendance(sub.id, "absent")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                          currentStatus === "absent"
                            ? "bg-error-container text-on-error-container ring-2 ring-error/40 scale-105"
                            : "border border-outline-variant text-[#bacbbf] hover:bg-error-container hover:text-on-error-container hover:border-transparent"
                        }`}
                      >
                        <XCircle className="w-3 h-3" />
                        Absent
                      </button>
                      <button
                        onClick={() => onMarkAttendance(sub.id, "miss")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                          currentStatus === "miss"
                            ? "bg-[#2d3449] text-white ring-2 ring-outline/40 scale-105"
                            : "border border-outline-variant text-[#bacbbf] hover:bg-[#2d3449]"
                        }`}
                      >
                        <Coffee className="w-3 h-3" />
                        Miss
                      </button>
                      <button
                        onClick={() => onMarkAttendance(sub.id, "leave")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                          currentStatus === "leave"
                            ? "bg-secondary/20 text-secondary ring-2 ring-secondary/40 scale-105"
                            : "border border-outline-variant text-[#bacbbf] hover:bg-[#2d3449]"
                        }`}
                      >
                        <Plane className="w-3 h-3" />
                        Leave
                      </button>
                      {currentStatus && (
                        <button
                          onClick={() => onMarkAttendance(sub.id, "clear")}
                          className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant hover:text-white transition-all text-[10px] active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Access Strip */}
          <div className="pt-4 border-t border-outline-variant">
            <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Quick Access</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <a
                href="http://www.dtu.ac.in/Web/notices/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card px-3 py-3 rounded-xl flex items-center gap-2 hover:border-primary transition-all group"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform text-lg">campaign</span>
                <span className="text-xs font-medium text-on-surface">DTU Notices</span>
              </a>
              <a
                href="https://www.resulthubdtu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card px-3 py-3 rounded-xl flex items-center gap-2 hover:border-secondary transition-all group"
              >
                <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform text-lg">grade</span>
                <span className="text-xs font-medium text-on-surface">Result Hub</span>
              </a>
              <a
                href="https://unstop.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card px-3 py-3 rounded-xl flex items-center gap-2 hover:border-tertiary transition-all group"
              >
                <span className="material-symbols-outlined text-tertiary group-hover:scale-110 transition-transform text-lg">rocket_launch</span>
                <span className="text-xs font-medium text-on-surface">Unstop</span>
              </a>
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card px-3 py-3 rounded-xl flex items-center gap-2 hover:border-primary transition-all group"
              >
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform text-lg">terminal</span>
                <span className="text-xs font-medium text-on-surface">Leetcode</span>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT: Calendar + Timetable Preview */}
        <div className="lg:col-span-4 space-y-5">

          {/* Mini Calendar */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-sm text-on-surface">
                {monthNames[calMonth]} {calYear}
              </h4>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-[#2d3449]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextMonth} className="p-1 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-[#2d3449]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] font-mono mb-1 text-on-surface-variant font-semibold">
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
              {/* offset blanks */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const past = isPastDate(day);
                const tod = isToday(day);
                return (
                  <button
                    key={day}
                    onClick={() => past ? onOpenAttendanceLog(day) : undefined}
                    className={`relative py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      tod
                        ? isDarkMode
                          ? "bg-primary text-[#002114] font-extrabold shadow-sm ring-2 ring-primary-container ring-offset-1 ring-offset-[#0b1326]"
                          : "bg-[#1AE7A6] text-white font-extrabold shadow-sm ring-2 ring-[#1AE7A6]/30 ring-offset-1 ring-offset-white"
                        : past
                        ? "hover:bg-[#222a3d] text-on-surface-variant cursor-pointer hover:text-primary"
                        : "text-on-surface-variant/60 cursor-default"
                    }`}
                    title={past ? `View attendance log for ${day} ${monthNames[calMonth]}` : undefined}
                  >
                    {day}
                    {past && !tod && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary/40 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timetable Preview (today's subjects) */}
          <div className="glass-card rounded-2xl p-5 border-t-4 border-secondary">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-sm text-on-surface flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-secondary" />
                <span>Today's Timeline</span>
              </h4>
              <span className="text-[10px] text-on-surface-variant font-mono font-bold">
                {todayKey ?? "Weekend"}
              </span>
            </div>

            {subjects.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-4">No subjects added yet</p>
            ) : (
              <div className="space-y-2">
                {subjects.map((sub) => {
                  const cs = todayAttendance[sub.id] as AttendanceStatus | undefined;
                  const dotColor = cs === "present" ? "bg-primary" : cs === "absent" ? "bg-error" :
                    cs === "leave" ? "bg-secondary" : cs === "miss" ? "bg-outline" :
                    sub.type === "LAB" ? "bg-secondary" : "bg-primary";
                  return (
                    <div key={sub.id} className="flex items-center gap-3 py-1.5 border-b border-outline-variant/20 last:border-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-on-surface truncate">{sub.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{sub.time || "Today"}</p>
                      </div>
                      <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        sub.type === "LAB" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                      }`}>
                        {sub.type ?? "LEC"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setActiveTab("timetable")}
              className="mt-4 w-full py-2 rounded-xl border border-outline-variant text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary transition-all cursor-pointer"
            >
              View Full Week →
            </button>
          </div>

          {/* Hackathon strip */}
          <div className="relative rounded-2xl overflow-hidden h-36 group shadow-md border border-outline-variant">
            <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? "from-[#0b1326] via-[#1a2a3e] to-[#0b1326]" : "from-[#F0FDF9] via-[#ECFDF5] to-[#F0FDF9]"}`} />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest block mb-1">Upcoming Hackathon</span>
              <h5 className="text-on-surface font-bold text-sm mb-1.5 leading-tight">Code-A-Thon 2026</h5>
              <a
                href="https://unstop.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-bold text-xs hover:underline inline-flex items-center gap-1"
              >
                <span>Register Now</span>
                <Rocket className="w-3 h-3" />
              </a>
            </div>
            <div className="absolute top-3 right-3">
              <BookOpen className="w-16 h-16 text-primary/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
