/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Subject } from "../types";
import { Calculator, BookOpen, FileText, Calendar, X, Filter, MoreVertical, Award, ArrowUpRight } from "lucide-react";
import CustomSelect from "./CustomSelect";

interface AttendancePageProps {
  subjects: Subject[];
  onUpdateSubjectHours: (id: string, attended: number, total: number) => void;
  isDarkMode: boolean;
}

interface UnifiedSubjectCardProps {
  key?: string;
  card: { baseName: string; theorySub?: Subject; labSub?: Subject; tutSub?: Subject; singleSub?: Subject };
  isDarkMode: boolean;
  mergeAttendance?: boolean;
  onUpdateSubjectHours: (id: string, attended: number, total: number) => void;
  onOpenDetails: (sub: Subject) => void;
}

export default function AttendancePage({ subjects, onUpdateSubjectHours, isDarkMode }: AttendancePageProps) {
  const navigate = useNavigate();

  // Calculator Form States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [classesToMiss, setClassesToMiss] = useState<number>(1);

  // Interactive UI Filter & Modal States
  const [statusFilter, setStatusFilter] = useState<"all" | "safe" | "danger">("all");
  const [detailSubject, setDetailSubject] = useState<Subject | null>(null);
  const [mergeAttendance, setMergeAttendance] = useState<boolean>(() => {
    return localStorage.getItem("dtu_merge_attendance") === "true";
  });

  const toggleMergeAttendance = (val: boolean) => {
    setMergeAttendance(val);
    localStorage.setItem("dtu_merge_attendance", String(val));
  };

  // Calculate stats based on actual live subjects array!
  const totalClassesAttended = subjects.reduce((sum, s) => sum + s.attendanceCount, 0);
  const totalClassesHeld = subjects.reduce((sum, s) => sum + s.totalClasses, 0);

  // Helper: check if a subject has a lab component
  const isLabSubject = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("software engineering")) {
      return false;
    }
    return (
      lower.includes("object oriented") ||
      lower.includes("operating system") ||
      lower.includes("algorithm") ||
      lower.includes("digital") ||
      lower.includes("machine learning") ||
      lower.includes("data science") ||
      lower.includes("computer organization")
    );
  };

  // Group subjects into Unified Base Cards (e.g., Operating System Design)
  interface UnifiedCardData {
    baseName: string;
    theorySub?: Subject;
    labSub?: Subject;
    tutSub?: Subject;
    singleSub?: Subject;
  }

  const getStandardizedBaseName = (raw: string): string => {
    const lower = raw.toLowerCase().trim();
    if (lower.includes("object oriented") || lower.includes("oop") || lower.includes("ood")) return "Object Oriented Design";
    if (lower.includes("algorithm") || lower.includes("daa")) return "Design & Analysis of Algorithm";
    if (lower.includes("digital logic") || lower.includes("digital electronics") || lower.includes("dld")) return "Digital Logic Design";
    if (lower.includes("operating system") || lower === "os") return "Operating System Design";
    if (lower.includes("software engineering") || lower === "se") return "Software Engineering";
    if (lower.includes("compiler design") || lower.includes("cd")) return "Compiler Design";
    if (lower.includes("machine learning") || lower.includes("ml")) return "Machine Learning";
    if (lower.includes("information and network security") || lower.includes("ins")) return "Information and Network Security";
    if (lower.includes("distributed system") || lower.includes("dis")) return "Distributed Systems";
    return raw;
  };

  const groupedCardsMap = new Map<string, UnifiedCardData>();
  subjects.forEach(sub => {
    const isLab = sub.name.toLowerCase().includes("lab") || sub.type === "LAB";
    const isTut = sub.name.toLowerCase().includes("tutorial") || sub.type === "TUT";
    const rawBase = sub.name
      .replace(/ - (Theory|Lab|Tutorial)$/i, "")
      .replace(/ (Theory|Lab|Tutorial)$/i, "")
      .trim();
    const baseName = getStandardizedBaseName(rawBase);

    if (!groupedCardsMap.has(baseName)) {
      groupedCardsMap.set(baseName, { baseName });
    }
    const entry = groupedCardsMap.get(baseName)!;
    if (isLab) {
      entry.labSub = sub;
    } else if (isTut) {
      entry.tutSub = sub;
    } else if (sub.name.toLowerCase().includes("theory") || sub.type === "LEC") {
      entry.theorySub = sub;
    } else {
      if (!entry.singleSub) entry.singleSub = sub;
    }
  });

  // Ensure theory and lab components exist for subjects that have labs
  groupedCardsMap.forEach((entry, baseName) => {
    if (isLabSubject(baseName)) {
      if (!entry.theorySub && entry.labSub) {
        entry.theorySub = {
          ...entry.labSub,
          id: `${entry.labSub.id}-theory`,
          name: `${baseName} - Theory`,
          type: "LEC",
        };
      }
      if (!entry.labSub && entry.theorySub) {
        entry.labSub = {
          ...entry.theorySub,
          id: `${entry.theorySub.id}-lab`,
          name: `${baseName} - Lab`,
          type: "LAB",
        };
      }
    } else {
      entry.labSub = undefined;
    }
  });

  const groupedCards = Array.from(groupedCardsMap.values());

  // Helper to determine if a grouped base card is Safe (>= 75%)
  const isCardSafe = (card: UnifiedCardData) => {
    const tRate = card.theorySub && card.theorySub.totalClasses > 0 ? (card.theorySub.attendanceCount / card.theorySub.totalClasses) * 100 : 0;
    const lRate = card.labSub && card.labSub.totalClasses > 0 ? (card.labSub.attendanceCount / card.labSub.totalClasses) * 100 : 0;
    const sRate = card.singleSub && card.singleSub.totalClasses > 0 ? (card.singleSub.attendanceCount / card.singleSub.totalClasses) * 100 : 0;

    const minRate = Math.min(
      card.theorySub ? tRate : 100,
      card.labSub ? lRate : 100,
      card.singleSub ? sRate : 100
    );

    return minRate >= 75;
  };

  // Synchronized counts matching the grouped cards!
  const safeCount = groupedCards.filter(isCardSafe).length;
  const dangerCount = groupedCards.filter(card => !isCardSafe(card)).length;
  const subjectsAtRiskCount = dangerCount;

  // Selected subject config logic inside calculator
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const filteredCards = groupedCards.filter(card => {
    if (statusFilter === "safe") return isCardSafe(card);
    if (statusFilter === "danger") return !isCardSafe(card);
    return true;
  });

  // Projected status logic based on selectedSubject
  let projectedPercentage = "0.0";
  let projectedStatusBadge = "Safe";
  let projectedStatusColor = "text-primary bg-primary/10 border-primary/20";
  let verdictText = "Select a valid subject to check status";

  if (selectedSubject) {
    const present = selectedSubject.attendanceCount;
    const currentTotal = selectedSubject.totalClasses;
    const projectedTotal = currentTotal + classesToMiss;
    
    if (projectedTotal > 0) {
      const rate = (present / projectedTotal) * 100;
      projectedPercentage = rate.toFixed(1);

      if (rate >= 75) {
        projectedStatusBadge = "Safe";
        projectedStatusColor = "text-primary bg-primary/10 border-primary/20";
        verdictText = `You can safely miss ${classesToMiss} class${classesToMiss > 1 ? 'es' : ''}! Attendance stays at ${projectedPercentage}%.`;
      } else {
        projectedStatusBadge = "Danger";
        projectedStatusColor = "text-error bg-error/10 border-error/20";
        verdictText = `Warning! Missing ${classesToMiss} class${classesToMiss > 1 ? 'es' : ''} drops your attendance to ${projectedPercentage}%.`;
      }
    }
  }

  return (
    <div className="space-y-6 relative">
      {/* ── TOP STATS BAR ── */}
      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 bg-surface-container-low rounded-2xl border border-outline-variant">
          <Award className="w-16 h-16 text-outline mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">No subjects found</h2>
          <p className="text-on-surface-variant text-sm max-w-sm">
            Please set up your profile with your branch and semester to see your subjects here.
          </p>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl transition-all hover:border-primary/40 hover:-translate-y-0.5 duration-200">
          <p className="text-[11px] font-bold text-on-surface-variant mb-2 uppercase">TOTAL CLASSES</p>
          <p className="text-3xl font-extrabold text-on-surface tracking-tight">{totalClassesAttended} / {totalClassesHeld}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl transition-all hover:border-primary/40 hover:-translate-y-0.5 duration-200">
          <p className="text-[11px] font-bold text-on-surface-variant mb-2 uppercase">CLASSES AT RISK</p>
          <p className={`text-3xl font-extrabold tracking-tight ${subjectsAtRiskCount > 0 ? 'text-error' : 'text-primary'}`}>
            {subjectsAtRiskCount} {subjectsAtRiskCount === 1 ? 'Subject' : 'Subjects'}
          </p>
        </div>
        <div className="glass-card p-5 rounded-2xl transition-all hover:border-primary/40 hover:-translate-y-0.5 duration-200">
          <p className="text-[11px] font-bold text-on-surface-variant mb-2 uppercase">STATUS</p>
          <p className="text-3xl font-extrabold text-[#7bd0ff] tracking-tight">Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Subject Breakdown Cards Grid (8 of 12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-on-surface">Subject Breakdown</h3>
              <span className="text-xs text-on-surface-variant font-mono">({filteredCards.length})</span>
            </div>

            {/* Filter Pills Bar */}
            <div className={`flex items-center gap-1 p-1 rounded-2xl border shadow-sm ${
              isDarkMode
                ? "bg-surface-container border-outline-variant/50"
                : "bg-slate-100 border-slate-200/80"
            }`}>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? isDarkMode
                      ? "bg-primary text-[#002114] shadow-sm scale-[1.02]"
                      : "bg-[#00C896] text-white shadow-sm scale-[1.02]"
                    : isDarkMode
                      ? "text-on-surface-variant hover:text-on-surface"
                      : "text-slate-700 hover:text-slate-900"
                }`}
              >
                All ({groupedCards.length})
              </button>

              <button
                onClick={() => setStatusFilter("safe")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "safe"
                    ? isDarkMode
                      ? "bg-primary/20 text-[#47ffbc] border border-primary/40 shadow-sm scale-[1.02]"
                      : "bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/30 shadow-sm scale-[1.02]"
                    : isDarkMode
                      ? "text-on-surface-variant hover:text-on-surface"
                      : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusFilter === "safe" ? "bg-[#00C896]" : "bg-emerald-500"}`} />
                <span>Safe ({safeCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter("danger")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "danger"
                    ? isDarkMode
                      ? "bg-error/20 text-error border border-error/40 shadow-sm scale-[1.02]"
                      : "bg-[#FEE2E2] text-[#991B1B] border border-[#991B1B]/30 shadow-sm scale-[1.02]"
                    : isDarkMode
                      ? "text-on-surface-variant hover:text-on-surface"
                      : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusFilter === "danger" ? "bg-red-500" : "bg-red-400"}`} />
                <span>At Risk ({dangerCount})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCards.map((card) => (
              <UnifiedSubjectCard
                key={card.baseName}
                card={card}
                isDarkMode={isDarkMode}
                mergeAttendance={mergeAttendance}
                onUpdateSubjectHours={onUpdateSubjectHours}
                onOpenDetails={(sub) => setDetailSubject(sub)}
              />
            ))}
          </div>
        </div>

        {/* Right Calculator Panel & Goal targets Column (4 of 12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Can I Miss This Class Widget */}
          <div className="glass-card p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#00e1a1]/10 blur-[50px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-1.5">
                <Calculator className="w-5 h-5" />
                <span>Can I Miss This Class?</span>
              </h3>
              
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                Check whether your attendance will stay above the threshold (75%) if you miss a few sessions.
              </p>

              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant block mb-2 tracking-widest uppercase">SELECT SUBJECT</label>
                  <CustomSelect
                    value={selectedSubjectId}
                    options={subjects.map((sub) => {
                      const pct = sub.totalClasses > 0 ? ((sub.attendanceCount / sub.totalClasses) * 100).toFixed(0) : "0";
                      return {
                        value: sub.id,
                        label: sub.name,
                        badge: `${pct}%`,
                      };
                    })}
                    onChange={(val) => setSelectedSubjectId(val)}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant block mb-2 tracking-widest uppercase">Classes to miss</label>
                  <div className="flex items-center gap-4 bg-[#060e20] p-3 rounded-xl border border-outline-variant">
                    <input 
                      className="flex-1 accent-primary cursor-pointer" 
                      max="10" 
                      min="0" 
                      type="range" 
                      value={classesToMiss}
                      onChange={(e) => setClassesToMiss(parseInt(e.target.value))}
                    />
                    <span className="font-extrabold text-lg text-primary w-6 text-center">{classesToMiss}</span>
                  </div>
                </div>

                {/* Status Result Badge component */}
                <div className="bg-[#060e20] p-4 rounded-xl border border-outline-variant">
                  <p className="text-[9px] font-bold text-on-surface-variant mb-2 tracking-wider">PROJECTED STATUS</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-3xl font-extrabold tracking-tight ${projectedStatusBadge === 'Safe' ? 'text-primary' : 'text-error'}`}>
                      {projectedPercentage}%
                    </span>
                    <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase border ${projectedStatusColor}`}>
                      {projectedStatusBadge}
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3 italic">
                    {verdictText}
                  </p>
                </div>

                <button 
                  type="button"
                  disabled
                  className="w-full bg-surface-container-high border border-outline-variant text-[#dae2fd] opacity-60 cursor-not-allowed py-3 rounded-xl font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>Sync with Calendar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>



        </div>
      </div>
      </>
      )}

      {/* ── SUBJECT DETAILS MODAL ── */}
      {detailSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setDetailSubject(null)} />
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-outline-variant shadow-2xl relative z-10 space-y-4">
            <button
              onClick={() => setDetailSubject(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface leading-tight">{detailSubject.name}</h3>
                {(detailSubject.prof || detailSubject.time) && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {[detailSubject.prof, detailSubject.time].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Attended</p>
                <p className="text-xl font-extrabold text-primary mt-1">{detailSubject.attendanceCount} classes</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/40">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Total Held</p>
                <p className="text-xl font-extrabold text-on-surface mt-1">{detailSubject.totalClasses} classes</p>
              </div>
            </div>

            {/* Attendance Margin Analysis */}
            {(() => {
              const rate = detailSubject.totalClasses > 0 ? (detailSubject.attendanceCount / detailSubject.totalClasses) * 100 : 0;
              const isSafe = rate >= 75;
              
              const maxMissable = Math.max(0, Math.floor((4 * detailSubject.attendanceCount - 3 * detailSubject.totalClasses) / 3));
              const neededToAttend = Math.max(0, Math.ceil(3 * detailSubject.totalClasses - 4 * detailSubject.attendanceCount));

              return (
                <div className={`p-4 rounded-xl border ${isSafe ? "bg-primary/10 border-primary/30 text-primary" : "bg-error/10 border-error/30 text-error"} space-y-1`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase">Current Attendance</span>
                    <span className="text-lg font-black">{rate.toFixed(1)}% ({isSafe ? "SAFE" : "AT RISK"})</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
                    {isSafe
                      ? `✨ Great job! You can safely miss up to ${maxMissable} class${maxMissable !== 1 ? 'es' : ''} while staying above 75%.`
                      : `⚠️ Attendance below target! You need to attend ${neededToAttend} consecutive class${neededToAttend !== 1 ? 'es' : ''} to reach 75%.`}
                  </p>
                </div>
              );
            })()}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const subName = detailSubject.name;
                  setDetailSubject(null);
                  navigate(`/resources/${encodeURIComponent(subName)}`);
                }}
                className="flex-1 py-2.5 px-4 bg-primary text-on-primary rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Subject Resources</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UnifiedSubjectCard(props: UnifiedSubjectCardProps) {
  const { card, isDarkMode, mergeAttendance = false, onUpdateSubjectHours, onOpenDetails } = props;
  const availableTabs: ("Theory" | "Tutorial" | "Lab")[] = [];
  if (card.theorySub) availableTabs.push("Theory");
  if (card.tutSub) availableTabs.push("Tutorial");
  if (card.labSub) availableTabs.push("Lab");

  const hasMultipleComponents = availableTabs.length > 1;
  const [activeTab, setActiveTab] = useState<"Theory" | "Tutorial" | "Lab">(availableTabs[0] || "Theory");

  // Combined totals if merged
  const allComponents = [card.theorySub, card.tutSub, card.labSub, card.singleSub].filter(Boolean) as Subject[];
  const mergedAttended = allComponents.reduce((acc, c) => acc + c.attendanceCount, 0);
  const mergedTotal = allComponents.reduce((acc, c) => acc + c.totalClasses, 0);
  const mergedRate = mergedTotal > 0 ? (mergedAttended / mergedTotal) * 100 : 0;

  const activeSub =
    activeTab === "Lab" && card.labSub
      ? card.labSub
      : activeTab === "Tutorial" && card.tutSub
      ? card.tutSub
      : (card.theorySub || card.singleSub || card.labSub || card.tutSub);

  if (!activeSub) return null;

  const currentAttended = mergeAttendance ? mergedAttended : activeSub.attendanceCount;
  const currentTotal = mergeAttendance ? mergedTotal : activeSub.totalClasses;
  const attendanceRate = mergeAttendance ? mergedRate : (activeSub.totalClasses > 0 ? (activeSub.attendanceCount / activeSub.totalClasses) * 100 : 0);
  const isSafe = attendanceRate >= 75;

  const getCompRate = (sub?: Subject) => (sub && sub.totalClasses > 0 ? (sub.attendanceCount / sub.totalClasses) * 100 : 0);

  return (
    <div className="glass-card p-5 rounded-2xl hover:border-primary transition-all group relative flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-base text-on-surface tracking-tight flex items-center gap-2">
              <span>{card.baseName}</span>
              {mergeAttendance && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  MERGED
                </span>
              )}
            </h4>
            {hasMultipleComponents && !mergeAttendance && (
              <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium flex items-center gap-1.5 flex-wrap">
                {card.theorySub && <span>Theory: <b className={getCompRate(card.theorySub) >= 75 ? "text-emerald-400" : "text-error"}>{getCompRate(card.theorySub).toFixed(0)}%</b></span>}
                {card.tutSub && <span>• Tutorial: <b className={getCompRate(card.tutSub) >= 75 ? "text-emerald-400" : "text-error"}>{getCompRate(card.tutSub).toFixed(0)}%</b></span>}
                {card.labSub && <span>• Lab: <b className={getCompRate(card.labSub) >= 75 ? "text-emerald-400" : "text-error"}>{getCompRate(card.labSub).toFixed(0)}%</b></span>}
              </p>
            )}
          </div>
          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isSafe ? (isDarkMode ? "bg-[#00e1a1]/20 text-[#47ffbc]" : "bg-[#D1FAE5] text-[#065F46]") : (isDarkMode ? "bg-error/20 text-error" : "bg-[#FEE2E2] text-[#991B1B]")}`}>
            {isSafe ? "Safe" : "Danger"}
          </span>
        </div>

        {hasMultipleComponents && !mergeAttendance && (
          <div className={`grid ${availableTabs.length === 3 ? "grid-cols-3" : availableTabs.length === 2 ? "grid-cols-2" : "grid-cols-1"} gap-1.5 p-1 rounded-xl border mb-3 shadow-inner ${
            isDarkMode
              ? "bg-surface-container/80 border-outline-variant/30"
              : "bg-slate-100 border-slate-200/80"
          }`}>
            {availableTabs.map((tab) => {
              const subComp = tab === "Theory" ? card.theorySub : tab === "Tutorial" ? card.tutSub : card.labSub;
              const rate = getCompRate(subComp);
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isActive
                      ? isDarkMode
                        ? "bg-primary text-[#002114] shadow-sm scale-[1.02]"
                        : "bg-[#00C896] text-white shadow-sm scale-[1.02]"
                      : isDarkMode
                        ? "text-on-surface-variant hover:text-on-surface"
                        : "text-slate-700 hover:text-slate-900 font-bold"
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? isDarkMode ? "bg-[#002114]/20 text-[#002114]" : "bg-black/20 text-white"
                      : isDarkMode ? "bg-surface-variant text-on-surface-variant" : "bg-slate-200 text-slate-700"
                  }`}>
                    {rate.toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant font-medium">
              {mergeAttendance ? "Combined Attendance Rate" : (hasMultipleComponents ? `${activeTab} Attendance Rate` : "Attendance Rate")}
            </span>
            <span className={`font-black text-sm ${isSafe ? 'text-primary' : 'text-error'}`}>
              {attendanceRate.toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full progress-glow transition-all duration-300 ${isSafe ? (isDarkMode ? "bg-gradient-to-r from-primary to-secondary" : "bg-[#00C896]") : (isDarkMode ? "bg-error" : "bg-[#E53E3E]")}`}
              style={{ width: `${Math.min(100, attendanceRate)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-2 my-2.5 p-2 rounded-xl bg-surface-container/60 border border-outline-variant/30 text-center">
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase">Attended</p>
              <p className="text-xs font-extrabold text-primary mt-0.5">{currentAttended}</p>
            </div>
            <div className="border-l border-r border-outline-variant/30">
              <p className="text-[9px] font-bold text-on-surface-variant uppercase">Missed</p>
              <p className="text-xs font-extrabold text-error mt-0.5">{Math.max(0, currentTotal - currentAttended)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase">Total Held</p>
              <p className="text-xs font-extrabold text-on-surface mt-0.5">{currentTotal}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button 
              onClick={() => {
                if (mergeAttendance) {
                  allComponents.forEach(c => onUpdateSubjectHours(c.id, c.attendanceCount + 1, c.totalClasses + 1));
                } else {
                  onUpdateSubjectHours(activeSub.id, activeSub.attendanceCount + 1, activeSub.totalClasses + 1);
                }
              }}
              className="py-2 px-3 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
              title="Mark Present (+1 Attended, +1 Total)"
            >
              <span>Present</span>
            </button>
            <button 
              onClick={() => {
                if (mergeAttendance) {
                  allComponents.forEach(c => onUpdateSubjectHours(c.id, c.attendanceCount, c.totalClasses + 1));
                } else {
                  onUpdateSubjectHours(activeSub.id, activeSub.attendanceCount, activeSub.totalClasses + 1);
                }
              }}
              className="py-2 px-3 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
              title="Mark Absent (+1 Missed, +1 Total)"
            >
              <span>Absent</span>
            </button>
            <button 
              onClick={() => {
                if (mergeAttendance) {
                  allComponents.forEach(c => {
                    if (c.totalClasses > 0) {
                      onUpdateSubjectHours(c.id, Math.max(0, c.attendanceCount - 1), Math.max(0, c.totalClasses - 1));
                    }
                  });
                } else if (activeSub.totalClasses > 0) {
                  onUpdateSubjectHours(activeSub.id, Math.max(0, activeSub.attendanceCount - 1), Math.max(0, activeSub.totalClasses - 1));
                }
              }}
              className={`py-2 px-3 rounded-full font-bold text-xs shadow-md transition-all duration-150 flex items-center justify-center gap-1 ${
                currentTotal > 0
                  ? "bg-[#64748b] hover:bg-[#475569] text-white hover:shadow-lg active:scale-95 cursor-pointer"
                  : "bg-[#475569] text-white/90 cursor-not-allowed opacity-90"
              }`}
              title="Undo last mark"
            >
              <span>Undo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-outline-variant/30">
        <span className="text-[11px] font-semibold text-on-surface-variant">
          {isSafe ? "Target (75%) Achieved" : "Attendance below 75%"}
        </span>
        <button
          onClick={() => onOpenDetails(activeSub)}
          className="text-primary text-[11px] font-bold uppercase tracking-wider hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Details</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
