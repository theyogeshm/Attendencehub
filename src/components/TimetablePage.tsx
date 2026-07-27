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
import {
  TIMETABLE_SEM_5_DATA,
  SECTION_OPTIONS_SEM_5,
  convertSem5SlotToString,
} from "../data/timetableSem5";
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

  // Semester Selection - default based on enrolled subjects or saved setting
  const [selectedSemester, setSelectedSemester] = useState<number>(() => {
    const saved = localStorage.getItem("dtu_timetable_semester");
    if (saved) return parseInt(saved, 10);
    return subjects.some(s => s.name.includes("Compiler") || s.name.includes("Machine Learning")) ? 5 : 3;
  });

  useEffect(() => {
    localStorage.setItem("dtu_timetable_semester", String(selectedSemester));
  }, [selectedSemester]);

  const currentSectionOptions = selectedSemester === 5 ? SECTION_OPTIONS_SEM_5 : SECTION_OPTIONS;
  const currentTimetableData = selectedSemester === 5 ? TIMETABLE_SEM_5_DATA : TIMETABLE_SEM_3_DATA;

  // Section selection - defaults to user's section
  const [selectedSection, setSelectedSection] = useState<string>(() => {
    const saved = localStorage.getItem(`dtu_timetable_section_sem${selectedSemester}`);
    if (saved && (currentTimetableData.sections as any)[saved]) return saved;
    const normalizedUserSection = userSection.toUpperCase().trim();
    const formattedSec = normalizedUserSection.startsWith("A")
      ? normalizedUserSection
      : `A${normalizedUserSection}`;
    const match = currentSectionOptions.find((s) => s.id === formattedSec || s.id === normalizedUserSection);
    return match ? match.id : "A1";
  });

  const [activeDay, setActiveDay] = useState<string>(defaultDayId);
  const [viewMode, setViewMode] = useState<"day" | "week">("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "lecture" | "lab" | "tutorial">("all");
  const [showElectivePanel, setShowElectivePanel] = useState(false);

  // Elective Overrides for Sem 5 (E1 - E6)
  const [electiveOverrides, setElectiveOverrides] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("dtu_sem5_elective_overrides");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateElectiveOverride = (slotKey: string, decSubject: string) => {
    const next = { ...electiveOverrides, [slotKey]: decSubject };
    setElectiveOverrides(next);
    localStorage.setItem("dtu_sem5_elective_overrides", JSON.stringify(next));
  };

  // Sync section whenever profile userSection prop updates
  useEffect(() => {
    if (userSection) {
      const normalized = userSection.toUpperCase().trim();
      const formatted = normalized.startsWith("A") ? normalized : `A${normalized}`;
      const match = currentSectionOptions.find((s) => s.id === formatted || s.id === normalized);
      if (match) {
        setSelectedSection(match.id);
      }
    }
  }, [userSection, selectedSemester]);

  // Save section selection to localStorage
  useEffect(() => {
    localStorage.setItem(`dtu_timetable_section_sem${selectedSemester}`, selectedSection);
  }, [selectedSection, selectedSemester]);

  const sectionData = (currentTimetableData.sections as any)[selectedSection] || (currentTimetableData.sections as any)["A1"];
  const sectionMeta = currentSectionOptions.find((s) => s.id === selectedSection) || currentSectionOptions[0];

  // Helper to extract slot raw text format from string/object
  const getSlotRawText = (rawVal: any) => {
    if (!rawVal) return "";
    let str = typeof rawVal === "string" ? rawVal : convertSem5SlotToString(rawVal);
    if (selectedSemester === 5 && str.includes("Elective - unresolved")) {
      const elecMatch = str.match(/(E[1-6])/);
      if (elecMatch && electiveOverrides[elecMatch[1]]) {
        str = str.replace("(Elective - unresolved)", `[${electiveOverrides[elecMatch[1]]}]`);
      }
    }
    return str;
  };

  // Helper to match subject in user's enrolled subjects (Theory vs Lab split aware)
  const findMatchingSubject = (entryText: string): Subject | undefined => {
    if (!entryText || !subjects || subjects.length === 0) return undefined;
    const parsed = parseTimetableEntry(entryText, sectionData.room);
    const targetSplitName = parsed.splitSubjectName.toLowerCase().trim();
    const baseLower = parsed.baseSubjectName.toLowerCase().trim();

    // 1. Exact match on splitSubjectName
    let match = subjects.find(s => s.name.toLowerCase().trim() === targetSplitName);
    if (match) return match;

    // 2. Strict Lab vs Theory component match
    if (parsed.isLab) {
      match = subjects.find(
        s =>
          s.name.toLowerCase().trim().includes(baseLower) &&
          (s.type === "LAB" || s.name.toLowerCase().includes("lab"))
      );
    } else {
      match = subjects.find(
        s =>
          s.name.toLowerCase().trim().includes(baseLower) &&
          s.type !== "LAB" &&
          !s.name.toLowerCase().includes("lab")
      );
    }
    if (match) return match;

    // 3. Fallback to base subject match
    return subjects.find(s => s.name.toLowerCase().trim().includes(baseLower));
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
        <span
          style={isDarkMode ? undefined : { backgroundColor: "#00C896", color: "#ffffff" }}
          className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400 dark:border dark:border-emerald-500/30"
        >
          LAB SESSION
        </span>
      );
    }
    if (entry.isTutorial) {
      return (
        <span
          style={isDarkMode ? undefined : { backgroundColor: "#f59e0b", color: "#ffffff" }}
          className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30"
        >
          TUTORIAL (THEORY)
        </span>
      );
    }
    return (
      <span
        style={isDarkMode ? undefined : { backgroundColor: "#00C896", color: "#ffffff" }}
        className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm dark:bg-primary/15 dark:text-primary dark:border dark:border-primary/30"
      >
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
            <span
              style={isDarkMode ? undefined : { backgroundColor: "#00C896", color: "#ffffff" }}
              className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/30"
            >
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
                      <span
                        style={isDarkMode ? undefined : { backgroundColor: "#00C896", color: "#ffffff" }}
                        className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#00C896] dark:bg-emerald-400 dark:text-[#002114]"
                      >
                        YOUR LAB ({selectedLabGroup})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-1.5 gap-2 flex-wrap">
                    {parsed.faculty && (
                      <span className={`flex items-center gap-1 font-medium ${
                        parsed.faculty.includes("VERIFY")
                          ? "text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px]"
                          : isFacultyTbd
                            ? "text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded"
                            : "text-primary"
                      }`}>
                        <UserIcon className="w-3 h-3" />
                        {parsed.faculty.includes("VERIFY") ? `⚠️ ${parsed.faculty}` : parsed.faculty}
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
              <span
                style={isDarkMode ? undefined : { backgroundColor: "#00C896", color: "#ffffff" }}
                className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#00C896] dark:bg-emerald-400 dark:text-[#002114]"
              >
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
            <span className={`flex items-center gap-1 font-medium ${
              parsed.faculty.includes("VERIFY")
                ? "text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 text-[10px]"
                : isFacultyTbd
                  ? "text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded"
                  : "text-primary"
            }`}>
              <UserIcon className="w-3.5 h-3.5" />
              {parsed.faculty.includes("VERIFY") ? `⚠️ ${parsed.faculty}` : parsed.faculty}
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-5 sm:p-6 rounded-3xl border border-outline-variant/40 shadow-lg relative z-20">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-primary/15 text-primary border border-primary/30">
              {currentTimetableData.semester}
            </span>
            {/* Semester Switcher Tabs */}
            <div className="flex items-center gap-1 bg-surface-container/80 p-1 rounded-xl border border-outline-variant/40">
              <button
                onClick={() => setSelectedSemester(3)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedSemester === 3
                    ? "bg-[#00C896] text-white dark:bg-primary dark:text-[#002114] shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                3rd Sem (CSE)
              </button>
              <button
                onClick={() => setSelectedSemester(5)}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  selectedSemester === 5
                    ? "bg-[#00C896] text-white dark:bg-primary dark:text-[#002114] shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                5th Sem (CSE-V)
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-primary" />
            <span>Class Timetable — {sectionMeta.label}</span>
          </h1>

          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
            Official {selectedSemester === 5 ? "Semester 5 (CSE-V)" : "Semester 3"} schedule for {sectionMeta.label} ({sectionMeta.room}).
          </p>
        </div>

        {/* Section Quick Stats & Section Switcher */}
        <div className="relative z-10 flex items-center gap-3 self-start md:self-auto flex-wrap">
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
              options={currentSectionOptions.map((sec) => ({
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

      {/* ── SECTION WARNING NOTE BANNER ── */}
      {sectionData?.note && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs shadow-sm">
          <span className="material-symbols-outlined text-xl text-amber-400 shrink-0">warning</span>
          <div>
            <span className="font-extrabold text-amber-200 text-sm block">Section Notice ({selectedSection})</span>
            <p className="mt-0.5 opacity-90 leading-relaxed">{sectionData.note}</p>
          </div>
        </div>
      )}

      {/* ── ELECTIVE OVERRIDES PANEL (SEM 5 ONLY) ── */}
      {selectedSemester === 5 && (
        <div className="glass-card rounded-2xl p-4 border border-outline-variant/40 space-y-3">
          <div
            onClick={() => setShowElectivePanel(!showElectivePanel)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
                ⚡ Custom Elective Allotment Overrides (E1 - E6)
              </span>
            </div>
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              {showElectivePanel ? "Hide Overrides ▲" : "Configure Electives ▼"}
            </span>
          </div>

          {showElectivePanel && (
            <div className="pt-2 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { slot: "E1", label: "Elective E1", def: "CS313: Quantum Computing" },
                { slot: "E2", label: "Elective E2", def: "CS309: Distributed Systems" },
                { slot: "E3", label: "Elective E3", def: "CS311: Information Theory" },
                { slot: "E4", label: "Elective E4", def: "Unresolved" },
                { slot: "E5", label: "Elective E5", def: "CS315: Advance Data Structure" },
                { slot: "E6", label: "Elective E6", def: "Unresolved" },
              ].map((item) => (
                <div key={item.slot} className="p-3 rounded-xl bg-surface-container/70 border border-outline-variant/30 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-primary font-mono">{item.slot} Slot</span>
                    <span className="text-on-surface-variant text-[10px]">Default: {item.def}</span>
                  </div>
                  <select
                    value={electiveOverrides[item.slot] || ""}
                    onChange={(e) => updateElectiveOverride(item.slot, e.target.value)}
                    className="w-full p-2 rounded-lg bg-surface-variant text-on-surface text-xs font-medium border border-outline-variant/40 focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Use Default / Unresolved --</option>
                    <option value="CS309 Distributed Systems">CS309: Distributed Systems</option>
                    <option value="CS311 Information Theory and Coding">CS311: Information Theory & Coding</option>
                    <option value="CS313 Quantum Computing">CS313: Quantum Computing</option>
                    <option value="CS315 Advance Data Structure">CS315: Advance Data Structure</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTROLS: VIEW MODES & SEARCH ── */}
      <div className="space-y-4">
        {/* View Mode Toggle & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Day / Week View Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-container border border-outline-variant/40 self-start">
              <button
                onClick={() => setViewMode("week")}
                style={viewMode === "week" ? { color: isDarkMode ? "#002114" : "#ffffff" } : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "week"
                    ? "bg-[#00C896] dark:bg-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Full Week
              </button>
              <button
                onClick={() => setViewMode("day")}
                style={viewMode === "day" ? { color: isDarkMode ? "#002114" : "#ffffff" } : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  viewMode === "day"
                    ? "bg-[#00C896] dark:bg-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Day-by-Day
              </button>
            </div>

            {/* Lab Group Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-container border border-outline-variant/40 self-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase px-2">Group:</span>
              {(["All", "G1", "G2", "G3"] as const).map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedLabGroup(grp)}
                  style={selectedLabGroup === grp ? { color: isDarkMode ? "#002114" : "#ffffff" } : undefined}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedLabGroup === grp
                      ? "bg-[#00C896] dark:bg-emerald-400 shadow-sm scale-105"
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
              placeholder="Search subject, faculty, code (e.g. CS301, ML, Yadav)..."
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

            const filteredSlots = slots.filter(([_, rawVal]) => {
              const rawText = getSlotRawText(rawVal);
              if (!searchQuery) return true;
              return rawText.toLowerCase().includes(searchQuery.toLowerCase());
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
                {filteredSlots.map(([timeSlot, rawVal]) => {
                  const rawText = getSlotRawText(rawVal);

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

              const filtered = slotsArray.filter(([_, rawVal]) => {
                const rawText = getSlotRawText(rawVal);
                if (!searchQuery) return true;
                return rawText.toLowerCase().includes(searchQuery.toLowerCase());
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
                        <span
                          style={{ color: isDarkMode ? "#002114" : "#ffffff" }}
                          className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#00C896] dark:bg-primary"
                        >
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
                      filtered.map(([timeSlot, rawVal]) => {
                        const rawText = getSlotRawText(rawVal);
                        return (
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
                        );
                      })
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
