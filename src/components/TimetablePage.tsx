/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  ChevronRight,
  Filter,
  Share2,
  Info,
  Layers,
  ChevronDown,
} from "lucide-react";
import { Subject } from "../types";
import {
  TIMETABLE_SEM_3_DATA,
  SECTION_OPTIONS,
  parseTimetableEntry,
  TimetableEntry,
} from "../data/timetableSem3";
import CustomSelect from "./CustomSelect";

interface TimetablePageProps {
  subjects?: Subject[];
  userSection?: string;
  isDarkMode?: boolean;
  onMarkAttendance?: (subjectId: string, isPresent: boolean) => void;
  onUpdateSubjectHours?: (subjectId: string, attendanceCount: number, totalClasses: number) => void;
}

const DAYS_OF_WEEK = [
  { id: "MON", label: "Monday", short: "Mon" },
  { id: "TUE", label: "Tuesday", short: "Tue" },
  { id: "WED", label: "Wednesday", short: "Wed" },
  { id: "THUR", label: "Thursday", short: "Thu" },
  { id: "FRI", label: "Friday", short: "Fri" },
];

export default function TimetablePage({
  subjects = [],
  userSection = "A1",
  isDarkMode = true,
  onMarkAttendance,
  onUpdateSubjectHours,
}: TimetablePageProps) {
  // Determine current day of week to highlight automatically
  const currentDayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  const defaultDayId =
    currentDayIndex >= 1 && currentDayIndex <= 5
      ? DAYS_OF_WEEK[currentDayIndex - 1].id
      : "MON";

  // Section selection - defaults to user's section (e.g. A3)
  const [selectedSection, setSelectedSection] = useState<string>(() => {
    const saved = localStorage.getItem("dtu_timetable_section");
    if (saved && TIMETABLE_SEM_3_DATA.sections[saved]) return saved;
    const normalizedUserSection = userSection.toUpperCase().trim();
    const formattedSec = normalizedUserSection.startsWith("A")
      ? normalizedUserSection
      : `A${normalizedUserSection}`;
    const match = SECTION_OPTIONS.find((s) => s.id === formattedSec || s.id === normalizedUserSection);
    return match ? match.id : "A3";
  });

  const [activeDay, setActiveDay] = useState<string>(defaultDayId);
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lecture" | "lab" | "tutorial">("all");
  const [selectedSlotModal, setSelectedSlotModal] = useState<{
    timeSlot: string;
    rawText: string;
    dayLabel: string;
  } | null>(null);

  // Sync section whenever profile userSection prop updates
  useEffect(() => {
    if (userSection) {
      const normalized = userSection.toUpperCase().trim();
      const formatted = normalized.startsWith("A") ? normalized : `A${normalized}`;
      const match = SECTION_OPTIONS.find((s) => s.id === formatted || s.id === normalized);
      if (match) {
        setSelectedSection(match.id);
      }
    }
  }, [userSection]);

  // Save section selection to localStorage
  useEffect(() => {
    localStorage.setItem("dtu_timetable_section", selectedSection);
  }, [selectedSection]);

  const sectionData = TIMETABLE_SEM_3_DATA.sections[selectedSection] || TIMETABLE_SEM_3_DATA.sections["A1"];
  const sectionMeta = SECTION_OPTIONS.find((s) => s.id === selectedSection) || SECTION_OPTIONS[0];

  // Helper to match subject in user's enrolled subjects (Theory vs Lab split aware)
  const findMatchingSubject = (entryText: string): Subject | undefined => {
    if (!entryText || !subjects || subjects.length === 0) return undefined;
    const parsed = parseTimetableEntry(entryText, sectionData.room);
    const targetSplitName = parsed.splitSubjectName.toLowerCase().trim();

    // 1. Exact match on splitSubjectName (e.g. "operating system design (os) - theory")
    let match = subjects.find(s => s.name.toLowerCase().trim() === targetSplitName);
    if (match) return match;

    // 2. Base subject + component match
    match = subjects.find(s => {
      const sName = s.name.toLowerCase().trim();
      const baseLower = parsed.baseSubjectName.toLowerCase().trim();
      const compLower = parsed.componentType.toLowerCase();
      return sName.includes(baseLower) && sName.includes(compLower);
    });
    if (match) return match;

    // 3. Fallback to base subject match
    return subjects.find(s => {
      const sName = s.name.toLowerCase().trim();
      const baseLower = parsed.baseSubjectName.toLowerCase().trim();
      return sName.includes(baseLower);
    });
  };

  // Quick mark attendance handler
  const handleQuickMark = (rawEntry: string, isPresent: boolean) => {
    const matchedSub = findMatchingSubject(rawEntry);
    if (!matchedSub) return;
    if (onUpdateSubjectHours) {
      onUpdateSubjectHours(
        matchedSub.id,
        isPresent ? matchedSub.attendanceCount + 1 : matchedSub.attendanceCount,
        matchedSub.totalClasses + 1
      );
    } else if (onMarkAttendance) {
      onMarkAttendance(matchedSub.id, isPresent);
    }
  };

  // Helper for rendering badges by type (Theory vs Lab)
  const getTypeBadge = (entry: TimetableEntry) => {
    if (entry.isLab) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          LAB SESSION
        </span>
      );
    }
    if (entry.isTutorial) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          TUTORIAL (THEORY)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/15 text-primary border border-primary/30">
        THEORY LECTURE
      </span>
    );
  };

  const [selectedLabGroup, setSelectedLabGroup] = useState<"All" | "G1" | "G2" | "G3">(
    () => (localStorage.getItem("dtu_lab_group") as any) || "All"
  );

  useEffect(() => {
    localStorage.setItem("dtu_lab_group", selectedLabGroup);
  }, [selectedLabGroup]);

  // Render combined lab session formatting
  const renderSlotContent = (rawText: string) => {
    if (!rawText) return null;
    const isCombinedLab = rawText.includes(" / ");

    if (isCombinedLab) {
      const parts = rawText.split(" / ");
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Combined Lab Session ({parts.length} Groups)
            </span>
            {selectedLabGroup !== "All" && (
              <span className="text-[9px] font-bold text-emerald-400 font-mono">
                Showing {selectedLabGroup}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {parts.map((part, idx) => {
              const parsed = parseTimetableEntry(part, sectionData.room);
              const isUserGrpMatch =
                selectedLabGroup !== "All" &&
                (parsed.group === selectedLabGroup || parsed.raw.includes(selectedLabGroup));
              const isFacultyTbd = parsed.faculty === "Faculty TBD";

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl transition-all text-xs border ${
                    isUserGrpMatch
                      ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40 shadow-sm"
                      : "bg-surface-container/80 border-outline-variant/30 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-on-surface leading-snug break-words">
                      {parsed.subjectName}
                    </p>
                    {isUserGrpMatch && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400 text-[#002114]">
                        YOUR LAB ({selectedLabGroup})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-1.5 gap-2 flex-wrap">
                    {parsed.faculty && (
                      <span className={`flex items-center gap-1 font-medium ${isFacultyTbd ? "text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded" : "text-primary"}`}>
                        <UserIcon className="w-3 h-3" />
                        {parsed.faculty}
                      </span>
                    )}
                    {parsed.room && (
                      <span className="flex items-center gap-1 text-on-surface-variant font-mono">
                        <MapPin className="w-3 h-3" />
                        {parsed.room}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const parsed = parseTimetableEntry(rawText, sectionData.room);
    const isUserGrpMatch =
      selectedLabGroup !== "All" &&
      (parsed.group === selectedLabGroup || parsed.raw.includes(selectedLabGroup));
    const isFacultyTbd = parsed.faculty === "Faculty TBD";

    return (
      <div className={`space-y-2 p-2 rounded-xl border ${
        isUserGrpMatch ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40" : "border-transparent"
      }`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {getTypeBadge(parsed)}
          <div className="flex items-center gap-1">
            {isUserGrpMatch && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-400 text-[#002114]">
                YOUR LAB ({selectedLabGroup})
              </span>
            )}
            {parsed.subjectCode && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant border border-outline-variant/30">
                {parsed.subjectCode}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm font-bold text-on-surface leading-snug break-words">
          {parsed.subjectName}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant pt-0.5">
          {parsed.faculty && (
            <span className={`flex items-center gap-1 font-medium ${isFacultyTbd ? "text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded" : "text-primary"}`}>
              <UserIcon className="w-3.5 h-3.5" />
              {parsed.faculty}
            </span>
          )}
          {parsed.room && (
            <span className="flex items-center gap-1 text-on-surface-variant font-mono">
              <MapPin className="w-3.5 h-3.5" />
              {parsed.room}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Copy weekly schedule function
  const handleCopySchedule = () => {
    let text = `📅 DTU CSE Sem 3 Timetable (${sectionMeta.label} - Room ${sectionData.room})\n`;
    text += `Effective: ${TIMETABLE_SEM_3_DATA.effective_from}\n\n`;

    DAYS_OF_WEEK.forEach((d) => {
      const daySlots = sectionData.timetable[d.id];
      if (daySlots) {
        text += `=== ${d.label.toUpperCase()} ===\n`;
        Object.entries(daySlots).forEach(([time, slot]) => {
          text += `🕒 ${time}: ${slot}\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    alert("Timetable copied to clipboard! 📋");
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER & TITLE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-5 sm:p-6 rounded-3xl border border-outline-variant/40 shadow-lg relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-primary/15 text-primary border border-primary/30">
              {TIMETABLE_SEM_3_DATA.semester}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-primary" />
            <span>Class Timetable — {sectionMeta.label}</span>
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Official Semester 3 schedule for {sectionMeta.label} ({sectionMeta.room}).
          </p>
        </div>

        {/* Section Quick Stats & Section Switcher */}
        <div className="relative z-10 flex items-center gap-3 self-start md:self-auto">
          <div className="p-3.5 rounded-2xl bg-surface-container/90 border border-outline-variant/40 text-center min-w-[120px]">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Default Room</p>
            <p className="text-lg font-black text-primary mt-0.5 flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              {sectionData.room}
            </p>
          </div>

          <div className="flex flex-col min-w-[170px]">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
              Switch Section
            </label>
            <CustomSelect
              value={selectedSection}
              options={SECTION_OPTIONS.map((sec) => ({
                value: sec.id,
                label: sec.label,
                badge: sec.room,
              }))}
              onChange={(val) => setSelectedSection(val)}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* ── CONTROLS: VIEW MODES & SEARCH ── */}
      <div className="space-y-4">

        {/* View Mode Toggle & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Day / Week View Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-container border border-outline-variant/40 self-start">
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "week"
                    ? "bg-primary text-[#002114] shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Full Week
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "day"
                    ? "bg-primary text-[#002114] shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Day-by-Day
              </button>
            </div>

            {/* Lab Group Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-container border border-outline-variant/40 self-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase px-2">Lab Group:</span>
              {(["All", "G1", "G2", "G3"] as const).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedLabGroup(grp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedLabGroup === grp
                      ? "bg-emerald-400 text-[#002114] shadow-sm scale-105"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {grp === "All" ? "All" : grp}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject, faculty, code (e.g. CS205, DAA, Katarya)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Day Selector (Shown when viewMode === 'day') */}
        {viewMode === "day" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = activeDay === day.id;
              const isToday = defaultDayId === day.id;

              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? "bg-primary/20 text-primary border-primary"
                      : "bg-surface-container/50 text-on-surface-variant border-outline-variant/30 hover:bg-surface-variant"
                  }`}
                >
                  <span>{day.label}</span>
                  {isToday && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TIMETABLE SCHEDULE CONTENT ── */}

      {/* 1. DAY VIEW MODE */}
      {viewMode === "day" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {DAYS_OF_WEEK.find((d) => d.id === activeDay)?.label}'s Schedule
              </span>
            </h3>
            <span className="text-xs text-on-surface-variant font-mono">
              Room: {sectionData.room}
            </span>
          </div>

          {(() => {
            const dayTimetable = sectionData.timetable[activeDay] || {};
            const slots = Object.entries(dayTimetable);

            const filteredSlots = slots.filter(([_, raw]) => {
              if (!searchQuery) return true;
              return raw.toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (filteredSlots.length === 0) {
              return (
                <div className="glass-card p-8 rounded-2xl text-center space-y-3 border border-outline-variant/30">
                  <p className="text-sm font-bold text-on-surface-variant">
                    {searchQuery
                      ? `No classes matching "${searchQuery}" on ${activeDay}`
                      : "No classes scheduled for this day!"}
                  </p>
                  <p className="text-xs text-on-surface-variant/70">
                    Enjoy your free day or prepare for upcoming lab submissions.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSlots.map(([timeSlot, rawText]) => {
                  const matchedSubject = findMatchingSubject(rawText);

                  return (
                    <div
                      key={timeSlot}
                      className="glass-card p-4 sm:p-5 rounded-2xl border border-outline-variant/40 hover:border-primary/50 transition-all flex flex-col justify-between space-y-4 group relative"
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2.5">
                        <span className="text-xs font-mono font-bold text-primary flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {timeSlot}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-mono">
                          {sectionMeta.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">{renderSlotContent(rawText)}</div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. WEEK VIEW MODE */}
      {viewMode === "week" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = sectionData.timetable[day.id] || {};
              const slotsArray = Object.entries(daySlots);
              const isToday = defaultDayId === day.id;

              const filtered = slotsArray.filter(([_, raw]) => {
                if (!searchQuery) return true;
                return raw.toLowerCase().includes(searchQuery.toLowerCase());
              });

              return (
                <div
                  key={day.id}
                  className={`glass-card rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isToday
                      ? "border-primary/50 ring-1 ring-primary/30"
                      : "border-outline-variant/40"
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`p-3.5 border-b flex items-center justify-between ${
                      isToday
                        ? "bg-primary/10 border-primary/30"
                        : "bg-surface-container/60 border-outline-variant/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-on-surface">
                        {day.label}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-primary text-[#002114]">
                          TODAY
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant font-mono font-bold">
                      {filtered.length} Classes
                    </span>
                  </div>

                  {/* Day Classes */}
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[650px] custom-scrollbar">
                    {filtered.length === 0 ? (
                      <div className="p-4 text-center text-xs text-on-surface-variant/60 font-medium">
                        No classes scheduled
                      </div>
                    ) : (
                      filtered.map(([timeSlot, rawText]) => (
                        <div
                          key={timeSlot}
                          className="p-3 rounded-xl bg-surface-container/80 border border-outline-variant/30 hover:border-primary/40 transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-primary border-b border-outline-variant/20 pb-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeSlot}
                            </span>
                          </div>

                          <div>{renderSlotContent(rawText)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
