  /**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
  Check,
  X,
} from "lucide-react";
import { Subject } from "../types";
import { parseSemesterNumber } from "../data";
import {
  TIMETABLE_SEM_1_DATA,
  SECTION_OPTIONS_SEM_1,
} from "../data/timetableSem1";
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
import {
  TIMETABLE_SEM_7_DATA,
  SECTION_OPTIONS_SEM_7,
} from "../data/timetableSem7";
import CustomSelect from "./CustomSelect";

interface TimetablePageProps {
  subjects?: Subject[];
  userSection?: string;
  userSemester?: string;
  isDarkMode?: boolean;
  selectedLabGroup?: "All" | "G1" | "G2" | "G3";
  onSelectLabGroup?: (grp: "All" | "G1" | "G2" | "G3") => void;
  onMarkAttendance?: (subjectId: string, isPresent: boolean) => void;
  onUpdateSubjectHours?: (subjectId: string, attendanceCount: number, totalClasses: number) => void;
  dbTimetableEntries?: any[];
}

const DAYS_OF_WEEK = [
  { id: "MON", label: "Monday", short: "Mon" },
  { id: "TUE", label: "Tuesday", short: "Tue" },
  { id: "WED", label: "Wednesday", short: "Wed" },
  { id: "THUR", label: "Thursday", short: "Thu" },
  { id: "FRI", label: "Friday", short: "Fri" },
];

// ── Elective Override Form ─────────────────────────────────────────────────
const ELECTIVE_PRESETS = [
  { value: "",                                    label: "Keep as E slot (unresolved)", code: "" },
  { value: "CS309 Distributed Systems",           label: "Distributed Systems",          code: "CS309" },
  { value: "CS311 Information Theory and Coding", label: "Information Theory & Coding",  code: "CS311" },
  { value: "CS313 Quantum Computing",             label: "Quantum Computing",             code: "CS313" },
  { value: "CS315 Advance Data Structure",        label: "Advance Data Structure",        code: "CS315" },
];

function ElectiveSlotCard({
  slot, value, onChange, isDarkMode = true,
}: {
  key?: any; slot: string; value: string; onChange: (v: string) => void; isDarkMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const preset = ELECTIVE_PRESETS.find(p => p.value === value);
  const isCustom = value && !preset;
  const displayLabel = isCustom ? value : (preset?.value ? preset.label : null);

  const dk = isDarkMode;

  return (
    <div className={`rounded-2xl border p-3.5 space-y-2.5 hover:border-emerald-500/40 transition-all duration-200 ${
      dk ? "bg-[#0d1729] border-slate-700/50" : "bg-white border-slate-200 shadow-sm"
    }`}>
      {/* Slot badge */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black font-mono border border-emerald-500/25">
          {slot}
        </span>
        {displayLabel && (
          <span className={`text-[10px] truncate font-medium ${dk ? "text-slate-400" : "text-slate-500"}`}>
            {displayLabel}
          </span>
        )}
      </div>

      {/* Custom dropdown */}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs border transition-all cursor-pointer shadow-sm flex items-center justify-between gap-2 text-left outline-none ${
            dk
              ? "bg-[#131b2e] border-slate-700/60 text-slate-100 hover:border-emerald-500/50 hover:bg-[#1a243b]"
              : "bg-white border-slate-200 text-slate-800 hover:border-emerald-500/50 hover:bg-slate-50"
          }`}
        >
          <span className="truncate font-bold">
            {displayLabel ?? (
              <span className={`font-medium italic ${dk ? "text-slate-500" : "text-slate-400"}`}>
                -- Keep as E slot (unresolved) --
              </span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className={`absolute left-0 right-0 z-[200] mt-1.5 rounded-2xl p-1.5 shadow-2xl border ${
            dk
              ? "bg-[#0b1326] border-slate-700 text-slate-100 shadow-black/90"
              : "bg-white border-slate-200 text-slate-800 shadow-slate-400/30"
          }`}>
            {ELECTIVE_PRESETS.map(p => {
              const isSel = (value === p.value) || (!value && p.value === "");
              return (
                <div
                  key={p.value || "__none__"}
                  onClick={() => { onChange(p.value); setOpen(false); }}
                  className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer transition-all flex items-center justify-between gap-2 mb-0.5 ${
                    isSel
                      ? dk ? "bg-emerald-500/20 text-[#47ffbc] font-extrabold" : "bg-emerald-500/15 text-emerald-700 font-extrabold"
                      : dk ? "hover:bg-slate-800/80 text-slate-200 hover:text-white" : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {p.code && (
                      <span className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded ${
                        isSel
                          ? "bg-emerald-500/30 text-emerald-600"
                          : dk ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                      }`}>
                        {p.code}
                      </span>
                    )}
                    {p.label}
                  </span>
                  {isSel && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom text input */}
      <input
        type="text"
        placeholder="Or type custom subject…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full py-2.5 px-4 rounded-2xl text-xs font-medium border focus:outline-none focus:border-emerald-500/60 transition-all ${
          dk
            ? "bg-[#131b2e] border-slate-700/60 text-slate-100 placeholder-slate-600 focus:bg-[#1a243b]"
            : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white"
        }`}
      />
    </div>
  );
}

function ElectiveOverrideForm({
  electiveOverrides, onSave, isDarkMode = true,
}: {
  electiveOverrides: Record<string, string>;
  onSave: (overrides: Record<string, string>) => void;
  isDarkMode?: boolean;
}) {
  const [draft, setDraft] = useState<Record<string, string>>({ ...electiveOverrides });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const configuredCount = Object.values(draft).filter(Boolean).length;
  const dk = isDarkMode;

  return (
    <div className={`pt-3 border-t space-y-4 ${dk ? "border-slate-700/40" : "border-slate-200"}`}>
      <p className={`text-[10px] leading-relaxed ${dk ? "text-slate-500" : "text-slate-500"}`}>
        Pick a preset or type a custom name for each elective slot. Hit{" "}
        <strong className="text-emerald-500">Save</strong> — E1/E2… labels in your timetable will be replaced instantly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(["E1", "E2", "E3", "E4", "E5", "E6"] as const).map(slot => (
          <ElectiveSlotCard
            key={slot}
            slot={slot}
            value={draft[slot] || ""}
            onChange={v => setDraft(d => ({ ...d, [slot]: v }))}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className={`text-[10px] ${dk ? "text-slate-500" : "text-slate-400"}`}>
          {configuredCount > 0 ? (
            <span className="text-emerald-500 font-bold">{configuredCount} of 6 electives configured</span>
          ) : "No electives configured yet"}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setDraft({}); onSave({}); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              dk
                ? "text-slate-400 border-slate-700/50 hover:border-slate-500 hover:text-slate-200"
                : "text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"
            }`}
          >
            Reset All
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
              saved
                ? "bg-emerald-500 text-white shadow-emerald-500/30"
                : "bg-emerald-500 text-white hover:brightness-110 hover:shadow-emerald-500/40 active:scale-95"
            }`}
          >
            {saved ? (
              <><CheckCircle2 className="w-4 h-4" />Saved!</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" />Save Electives</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimetablePage({
  subjects = [],
  userSection = "A1",
  userSemester = "3rd Semester",
  isDarkMode = true,
  selectedLabGroup: propSelectedLabGroup,
  onSelectLabGroup,
  onMarkAttendance,
  onUpdateSubjectHours,
  dbTimetableEntries = [],
}: TimetablePageProps) {
  const [internalLabGroup, setInternalLabGroup] = useState<"All" | "G1" | "G2" | "G3">("All");
  const selectedLabGroup = propSelectedLabGroup ?? internalLabGroup;

  const handleSetSelectedLabGroup = (grp: "All" | "G1" | "G2" | "G3") => {
    setInternalLabGroup(grp);
    if (onSelectLabGroup) {
      onSelectLabGroup(grp);
    }
  };
  // Determine current day of week to highlight automatically
  const currentDayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ...
  const defaultDayId =
    currentDayIndex >= 1 && currentDayIndex <= 5
      ? DAYS_OF_WEEK[currentDayIndex - 1].id
      : "MON";

  // Semester Selection - strictly derived from student's enrolled semester
  const selectedSemester = useMemo(() => {
    if (userSemester) {
      return parseSemesterNumber(userSemester);
    }
    // Fallback: detect from subjects
    if (subjects.some(s => s.name.includes("Mathematics-I") || s.name.includes("Basic Electronics") || s.name.includes("Web Designing"))) return 1;
    if (subjects.some(s => s.name.includes("Cyber") || s.name.includes("Cloud") || s.name.includes("Big Data"))) return 7;
    if (subjects.some(s => s.name.includes("Compiler") || s.name.includes("Machine Learning"))) return 5;
    return 3;
  }, [userSemester, subjects]);

  const isSemesterSupported = selectedSemester === 1 || selectedSemester === 3 || selectedSemester === 5 || selectedSemester === 7;
  const currentSectionOptions = selectedSemester === 1
    ? SECTION_OPTIONS_SEM_1
    : selectedSemester === 7
    ? SECTION_OPTIONS_SEM_7
    : selectedSemester === 5
    ? SECTION_OPTIONS_SEM_5
    : SECTION_OPTIONS;
  const currentTimetableData = selectedSemester === 1
    ? (TIMETABLE_SEM_1_DATA as any)
    : selectedSemester === 7
    ? (TIMETABLE_SEM_7_DATA as any)
    : selectedSemester === 5
    ? TIMETABLE_SEM_5_DATA
    : TIMETABLE_SEM_3_DATA;

  // Section selection - strictly defaults to user's section from profile
  const computeDefaultSection = useMemo(() => {
    const raw = (userSection || "").toUpperCase().trim();
    if (!raw) return currentSectionOptions[0]?.id || "A1";

    const numOnly = raw.replace(/\D+/g, "");
    let formattedSec = raw;
    if (selectedSemester === 1) {
      if (numOnly) {
        const num = parseInt(numOnly, 10);
        formattedSec = num < 10 ? `A0${num}` : `A${num}`;
      } else if (!raw.startsWith("A0")) {
        formattedSec = `A0${raw.replace(/^A/, "")}`;
      }
    } else if (selectedSemester === 7) {
      if (numOnly && !raw.startsWith("E")) {
        formattedSec = `E${numOnly}`;
      }
    } else {
      if (numOnly && !raw.startsWith("A")) {
        formattedSec = `A${numOnly}`;
      }
    }

    const match = currentSectionOptions.find(
      (s) =>
        s.id.toUpperCase() === formattedSec.toUpperCase() ||
        s.id.toUpperCase() === raw.toUpperCase() ||
        (numOnly && s.id.replace(/\D+/g, "") === numOnly)
    );
    return match ? match.id : (currentSectionOptions[0]?.id || "A1");
  }, [userSection, selectedSemester, currentSectionOptions]);

  // Check if user has explicitly manually selected a section for this semester
  const getManualSection = useCallback(() => {
    try {
      const saved = localStorage.getItem(`dtu_manual_section_sem${selectedSemester}`);
      if (saved && currentSectionOptions.some(s => s.id === saved)) {
        return saved;
      }
    } catch { /* ignore */ }
    return null;
  }, [selectedSemester, currentSectionOptions]);

  const [selectedSection, setSelectedSection] = useState<string>(() => {
    return getManualSection() || computeDefaultSection;
  });

  const [hasManuallySwitched, setHasManuallySwitched] = useState<boolean>(() => {
    return !!getManualSection();
  });

  // Sync selectedSection whenever userSection, selectedSemester, or computeDefaultSection changes
  useEffect(() => {
    const manual = getManualSection();
    if (manual) {
      setSelectedSection(manual);
      setHasManuallySwitched(true);
    } else {
      setSelectedSection(computeDefaultSection);
      setHasManuallySwitched(false);
    }
  }, [userSection, selectedSemester, computeDefaultSection, getManualSection]);

  const handleSectionChange = (val: string) => {
    setSelectedSection(val);
    setHasManuallySwitched(true);
    try {
      localStorage.setItem(`dtu_manual_section_sem${selectedSemester}`, val);
    } catch { /* ignore */ }
  };

  const sectionData = (currentTimetableData?.sections as any)?.[selectedSection] ||
                      (currentTimetableData?.sections as any)?.[Object.keys(currentTimetableData?.sections || {})[0]] ||
                      { timetable: {}, room: "AB4-204" };
  const sectionMeta = currentSectionOptions?.find((s) => s.id === selectedSection) || currentSectionOptions?.[0] || { id: "A1", label: "Section A1" };

  const isDayMatch = (dbDay: string, tDay: string) => {
    if (!dbDay || !tDay) return false;
    const d = dbDay.trim().toUpperCase();
    const t = tDay.trim().toUpperCase();
    if (d === t) return true;
    if (d.startsWith("MON") && t.startsWith("MON")) return true;
    if (d.startsWith("TUE") && t.startsWith("TUE")) return true;
    if (d.startsWith("WED") && t.startsWith("WED")) return true;
    if ((d.startsWith("THU") || d.startsWith("THUR")) && (t.startsWith("THU") || t.startsWith("THUR"))) return true;
    if (d.startsWith("FRI") && t.startsWith("FRI")) return true;
    if (d.startsWith("SAT") && t.startsWith("SAT")) return true;
    return false;
  };

  const isSecMatch = (dbSec: string, uSec: string) => {
    if (!dbSec || !uSec) return false;
    const s1 = String(dbSec).trim().toUpperCase().replace(/^SECTION\s*/i, "").replace(/^SEC\s*/i, "");
    const s2 = String(uSec).trim().toUpperCase().replace(/^SECTION\s*/i, "").replace(/^SEC\s*/i, "");
    if (s1 === s2) return true;
    if (`A${s1}` === s2 || s1 === `A${s2}`) return true;
    if (`B${s1}` === s2 || s1 === `B${s2}`) return true;
    return false;
  };

  const isSlotMatch = (dbSlot: string, tSlot: string) => {
    if (!dbSlot || !tSlot) return false;
    const s1 = String(dbSlot).trim().replace(/\s+/g, "").replace(":00", "");
    const s2 = String(tSlot).trim().replace(/\s+/g, "").replace(":00", "");
    return s1 === s2;
  };

  // Helper to build a properly-formatted raw text string from a single DB row.
  // Uses bracket notation for metadata so the single entry does NOT contain " / "
  // (which would falsely trigger "Combined Lab Session" detection in renderSlotContent).
  const buildDbEntryText = (row: any, fallbackRoom?: string): string => {
    const subName = row.subject_name || row.subject || "";
    const code    = row.subject_code  || row.code    || "";
    const prof    = row.teacher_name  || row.faculty  || "";
    const rm      = row.room || fallbackRoom || "";
    const grp     = row.group_name    || row.group    || "";
    // Use brackets for each metadata piece — parseTimetableEntry already extracts them
    return [
      subName,
      code   ? `[${code}]`   : "",
      prof   ? `[${prof}]`   : "",
      rm     ? `[${rm}]`     : "",
      grp    ? `[${grp}]`    : "",
    ].filter(Boolean).join(" ");
  };

  // Helper to extract slot raw text format from string/object or Supabase dbTimetableEntries
  const getSlotRawText = (rawVal: any, dayId?: string, timeSlotKey?: string) => {
    if (dbTimetableEntries && dbTimetableEntries.length > 0 && dayId && timeSlotKey) {
      const cleanSlot = timeSlotKey.replace("_lab", "").replace("_alt", "");
      // Use .filter() — a slot can have multiple DB rows (e.g. two lab groups)
      const dbMatches = dbTimetableEntries.filter(r =>
        Number(r.semester) === selectedSemester &&
        isSecMatch(r.section, selectedSection) &&
        isDayMatch(r.day, dayId) &&
        isSlotMatch(r.time_slot, cleanSlot)
      );

      if (dbMatches.length === 1) {
        // Single entry: build without " / " so it never triggers isCombinedLab
        return buildDbEntryText(dbMatches[0], sectionData?.room);
      }
      if (dbMatches.length > 1) {
        // Multiple entries at same slot (real combined lab) — join with " / "
        return dbMatches.map(r => buildDbEntryText(r, sectionData?.room)).join(" / ");
      }
    }

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

  const isSlotMatchingGroup = (rawText: string) => {
    if (!rawText) return false;
    if (selectedLabGroup === "All") return true;

    if (rawText.includes(" / ")) {
      const parts = rawText.split(" / ");
      return parts.some((part) => {
        const parsed = parseTimetableEntry(part, sectionData.room);
        return parsed.group === selectedLabGroup || parsed.raw.includes(selectedLabGroup);
      });
    }

    const parsed = parseTimetableEntry(rawText, sectionData.room);
    if (!parsed.group) {
      return true;
    }
    return parsed.group === selectedLabGroup || parsed.raw.includes(selectedLabGroup);
  };

  // Render combined lab session formatting
  const renderSlotContent = (rawText: string) => {
    if (!rawText) return null;
    const isCombinedLab = rawText.includes(" / ");

    if (isCombinedLab) {
      const parts = rawText.split(" / ");
      const displayParts = selectedLabGroup === "All"
        ? parts
        : parts.filter((part) => {
            const parsed = parseTimetableEntry(part, sectionData.room);
            return parsed.group === selectedLabGroup || parsed.raw.includes(selectedLabGroup);
          });

      if (displayParts.length === 0) return null;

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span
              style={isDarkMode ? undefined : { backgroundColor: "#00C896", color: "#ffffff" }}
              className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-sm dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/30"
            >
              {selectedLabGroup === "All" ? `Combined Lab Session (${parts.length} Groups)` : `Lab Session (${selectedLabGroup})`}
            </span>
            {selectedLabGroup !== "All" && (
              <span className="text-[9px] font-bold text-emerald-400 font-mono">
                Showing {selectedLabGroup}
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {displayParts.map((part, idx) => {
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
    if (selectedLabGroup !== "All" && parsed.group && parsed.group !== selectedLabGroup) {
      return null;
    }
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

  // Show Coming Soon for semesters without timetable data
  if (!isSemesterSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-8">
        {/* Pulsing ring animation */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute w-24 h-24 rounded-full bg-primary/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
          <div className="relative w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-lg">
            <BookOpen className="w-9 h-9 text-primary" />
          </div>
        </div>

        <div className="space-y-3 max-w-sm">
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-2xl font-black text-on-surface tracking-tight animate-pulse"
              style={{ animationDuration: "1.5s" }}
            >
              Coming Soon
            </span>
            <span className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </span>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            Timetable for{" "}
            <span className="font-bold text-primary">Semester {selectedSemester}</span>{" "}
            is being prepared and will be available soon!
          </p>

          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-on-surface-variant/70 font-medium">
              Currently live: Sem 3, Sem 5 &amp; Sem 7
            </span>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-3 sm:space-y-6 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* ── HEADER & TITLE ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 glass-card p-3.5 sm:p-4 rounded-2xl border border-outline-variant/40 shadow-sm relative z-20">
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 space-y-0.5 sm:space-y-1 min-w-0 max-w-full">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold font-mono bg-primary/15 text-primary border border-primary/30 whitespace-nowrap shrink-0">
              {currentTimetableData.semester}
            </span>
          </div>

          <h1 className="text-xs min-[360px]:text-sm sm:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-1.5 sm:gap-2 max-w-full min-w-0">
            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-primary shrink-0" />
            <span className="whitespace-nowrap truncate">Class Timetable — {sectionMeta.label}</span>
          </h1>

          <p className="text-[11px] sm:text-sm text-on-surface-variant max-w-xl leading-relaxed truncate sm:whitespace-normal">
            Official {selectedSemester === 7 ? "Semester 7 (CSE-VII)" : (selectedSemester === 5 ? "Semester 5 (CSE-V)" : "Semester 3")} schedule for {sectionMeta.label} ({sectionData.room}).
          </p>
        </div>

        {/* Section Quick Stats & Section Switcher */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3 self-start md:self-auto flex-wrap sm:flex-nowrap w-full sm:w-auto mt-0.5 sm:mt-0">
          <div className="p-1.5 sm:p-2 px-2.5 rounded-xl bg-surface-container/90 border border-outline-variant/40 text-center flex sm:block items-center justify-between sm:justify-center gap-2 shrink-0">
            <p className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Default Room</p>
            <p className="text-xs sm:text-sm font-bold text-primary flex items-center justify-center gap-0.5 sm:gap-1">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              {sectionData.room}
            </p>
          </div>

          <div className="flex flex-col min-w-0 flex-1 sm:flex-initial w-full sm:w-auto max-w-full sm:max-w-[200px]">
            <label className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">
              Switch Section
            </label>
            <CustomSelect
              value={selectedSection}
              options={currentSectionOptions.map((sec) => ({
                value: sec.id,
                label: sec.label,
                badge: (sec as any).room || sectionData.room,
              }))}
              onChange={handleSectionChange}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* ── ELECTIVE OVERRIDES PANEL (SEM 5 ONLY) ── */}
      {selectedSemester === 5 && (
        <div className="glass-card rounded-2xl p-3 sm:p-4 border border-outline-variant/40 space-y-2.5">
          <div
            onClick={() => setShowElectivePanel(!showElectivePanel)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                ⚡ Configure Your Electives (E1 – E6)
              </span>
              {Object.keys(electiveOverrides).filter(k => electiveOverrides[k]).length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {Object.keys(electiveOverrides).filter(k => electiveOverrides[k]).length} saved
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              {showElectivePanel ? "Hide ▲" : "Configure ▼"}
            </span>
          </div>

          {showElectivePanel && (
            <ElectiveOverrideForm
              electiveOverrides={electiveOverrides}
              isDarkMode={isDarkMode}
              onSave={(overrides) => {
                setElectiveOverrides(overrides);
                localStorage.setItem("dtu_sem5_elective_overrides", JSON.stringify(overrides));
              }}
            />
          )}
        </div>
      )}

      {/* ── CONTROLS: VIEW MODES & SEARCH ── */}
      <div className="space-y-2 sm:space-y-3">
        {/* View Mode Toggle & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-0.5 sm:pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Day / Week View Tabs — 50% / 50% equal split on mobile */}
            <div className="flex items-center w-full sm:w-auto gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl bg-surface-container border border-outline-variant/40">
              <button
                onClick={() => setViewMode("week")}
                style={viewMode === "week" ? { color: isDarkMode ? "#002114" : "#ffffff" } : undefined}
                className={`flex-1 sm:flex-initial w-1/2 sm:w-auto text-center justify-center px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
                className={`flex-1 sm:flex-initial w-1/2 sm:w-auto text-center justify-center px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === "day"
                    ? "bg-[#00C896] dark:bg-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Day-by-Day
              </button>
            </div>

            {/* Lab Group Filter Tabs — Equal distribution on mobile */}
            <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-xl bg-surface-container border border-outline-variant/40">
              <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase px-1 sm:px-2 shrink-0">Group:</span>
              {(["All", "G1", "G2", "G3"] as const).map((grp) => (
                <button
                  key={grp}
                  onClick={() => handleSetSelectedLabGroup(grp)}
                  style={selectedLabGroup === grp ? { color: isDarkMode ? "#002114" : "#ffffff" } : undefined}
                  className={`flex-1 sm:flex-initial text-center justify-center px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedLabGroup === grp
                      ? "bg-[#00C896] dark:bg-emerald-400 shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {grp === "All" ? "All" : grp}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar — matches ResourcesPage search bar layout */}
          <div className="relative flex-1 max-w-full sm:max-w-md w-full">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject, faculty, code..."
              className="w-full bg-surface-container-high border border-outline-variant rounded-full pl-10 pr-4 py-2 sm:py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Day Selector (Shown when viewMode === 'day') */}
        {viewMode === "day" && (
          <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-full min-w-0 pb-0.5">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = activeDay === day.id;
              const isToday = defaultDayId === day.id;

              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`w-full text-center justify-center px-1 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 border ${
                    isSelected
                      ? "bg-primary/20 text-primary border-primary"
                      : "bg-surface-container/50 text-on-surface-variant border-outline-variant/30 hover:bg-surface-variant"
                  }`}
                >
                  <span className="sm:hidden">{day.short}</span>
                  <span className="hidden sm:inline">{day.label}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse shrink-0" />
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
        <div className="space-y-3 sm:space-y-4 w-full min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-1.5 truncate">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">
                {DAYS_OF_WEEK.find((d) => d.id === activeDay)?.label}'s Schedule
              </span>
            </h3>
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-mono shrink-0">
              Room: {sectionData.room}
            </span>
          </div>

          {(() => {
            const dayTimetable = sectionData.timetable[activeDay] || {};
            const slots = Object.entries(dayTimetable);

            const filteredSlots = slots.filter(([timeSlotKey, rawVal]) => {
              const rawText = getSlotRawText(rawVal, activeDay, timeSlotKey);
              if (!isSlotMatchingGroup(rawText)) return false;
              if (!searchQuery) return true;
              return rawText.toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (filteredSlots.length === 0) {
              return (
                <div className="glass-card p-5 sm:p-6 rounded-2xl text-center space-y-2 border border-outline-variant/30 w-full min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-on-surface-variant">
                    {searchQuery
                      ? `No classes matching "${searchQuery}" on ${activeDay}`
                      : "No classes scheduled for this day!"}
                  </p>
                  <p className="text-[11px] sm:text-xs text-on-surface-variant/70">
                    Enjoy your free day or prepare for upcoming lab submissions.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
                {filteredSlots.map(([timeSlot, rawVal]) => {
                  const rawText = getSlotRawText(rawVal, activeDay, timeSlot);

                  return (
                    <div
                      key={timeSlot}
                      className="glass-card p-3 sm:p-4 rounded-2xl border border-outline-variant/40 hover:border-primary/50 transition-all flex flex-col justify-between space-y-2.5 sm:space-y-3 group relative w-full min-w-0 overflow-hidden shadow-sm"
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-2 min-w-0">
                        <span className="text-xs font-mono font-bold text-primary flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{timeSlot}</span>
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-mono truncate text-right">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const daySlots = sectionData.timetable[day.id] || {};
              const slotsArray = Object.entries(daySlots);
              const isToday = defaultDayId === day.id;

              const filtered = slotsArray.filter(([timeSlotKey, rawVal]) => {
                const rawText = getSlotRawText(rawVal, day.id, timeSlotKey);
                if (!isSlotMatchingGroup(rawText)) return false;
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
                        const rawText = getSlotRawText(rawVal, day.id, timeSlot);
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
