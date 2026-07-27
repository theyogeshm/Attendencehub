/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Subject } from "../types";
import { Calculator, BookOpen, FileText, Calendar, X, Filter, MoreVertical, Award, ArrowUpRight } from "lucide-react";

interface AttendancePageProps {
  subjects: Subject[];
  onUpdateSubjectHours: (id: string, attended: number, total: number) => void;
  isDarkMode: boolean;
}

export default function AttendancePage({ subjects, onUpdateSubjectHours, isDarkMode }: AttendancePageProps) {
  const navigate = useNavigate();

  // Calculator Form States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [classesToMiss, setClassesToMiss] = useState<number>(1);

  // Interactive UI Filter & Modal States
  const [statusFilter, setStatusFilter] = useState<"all" | "safe" | "danger">("all");
  const [detailSubject, setDetailSubject] = useState<Subject | null>(null);

  // Calculate stats based on actual live subjects array!
  const totalClassesAttended = subjects.reduce((sum, s) => sum + s.attendanceCount, 0);
  const totalClassesHeld = subjects.reduce((sum, s) => sum + s.totalClasses, 0);

  // Helper: check if a subject has a lab component
  const isLabSubject = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("object oriented") || lower.includes("software engineering")) {
      return false;
    }
    return (
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
    singleSub?: Subject;
  }

  const groupedCardsMap = new Map<string, UnifiedCardData>();
  subjects.forEach(sub => {
    const isLab = sub.name.toLowerCase().includes("lab") || sub.type === "LAB";
    const baseName = sub.name
      .replace(/ - (Theory|Lab)$/i, "")
      .replace(/ (Theory|Lab)$/i, "")
      .trim();

    if (!groupedCardsMap.has(baseName)) {
      groupedCardsMap.set(baseName, { baseName });
    }
    const entry = groupedCardsMap.get(baseName)!;
    if (isLab && isLabSubject(baseName)) {
      entry.labSub = sub;
    } else {
      entry.theorySub = sub;
    }
  });

  // Ensure lab component exists for subjects that have labs
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
    const tRate = card.theorySub && card.theorySub.totalClasses > 0 ? (card.theorySub.attendanceCount / card.theorySub.totalClasses) * 100 : 100;
    const lRate = card.labSub && card.labSub.totalClasses > 0 ? (card.labSub.attendanceCount / card.labSub.totalClasses) * 100 : 100;
    const sRate = card.singleSub && card.singleSub.totalClasses > 0 ? (card.singleSub.attendanceCount / card.singleSub.totalClasses) * 100 : 100;

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
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant/50 self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-primary text-[#002114] shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All ({groupedCards.length})
              </button>
              <button
                onClick={() => setStatusFilter("safe")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "safe"
                    ? isDarkMode ? "bg-primary/20 text-[#47ffbc] border border-primary/40" : "bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/30"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#47ffbc]" />
                <span>Safe ({safeCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter("danger")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "danger"
                    ? isDarkMode ? "bg-error/20 text-error border border-error/40" : "bg-[#FEE2E2] text-[#991B1B] border border-[#991B1B]/30"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-error" />
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
                  <label className="text-[10px] font-bold text-on-surface-variant block mb-2 tracking-widest">SELECT SUBJECT</label>
                  <select 
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-[#060e20] border border-outline-variant rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-0 appearance-none text-on-surface cursor-pointer focus:outline-none"
                  >
                    {subjects.map((sub) => {
                      const pct = sub.totalClasses > 0 ? ((sub.attendanceCount / sub.totalClasses) * 100).toFixed(0) : "0";
                      return (
                        <option key={sub.id} value={sub.id} className="bg-[#0b1326] text-on-surface">
                          {sub.name} ({pct}%)
                        </option>
                      );
                    })}
                  </select>
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

function UnifiedSubjectCard({
  card,
  isDarkMode,
  onUpdateSubjectHours,
  onOpenDetails,
}: {
  key?: string;
  card: { baseName: string; theorySub?: Subject; labSub?: Subject; singleSub?: Subject };
  isDarkMode: boolean;
  onUpdateSubjectHours: (id: string, attended: number, total: number) => void;
  onOpenDetails: (sub: Subject) => void;
}) {
  const hasLab = Boolean(card.labSub);
  const [activeTab, setActiveTab] = useState<"Theory" | "Lab">("Theory");

  const activeSub =
    activeTab === "Lab" && card.labSub
      ? card.labSub
      : (card.theorySub || card.singleSub || card.labSub);

  if (!activeSub) return null;

  const attendanceRate = activeSub.totalClasses > 0 ? (activeSub.attendanceCount / activeSub.totalClasses) * 100 : 0;
  const isSafe = attendanceRate >= 75;

  const theoryRate = card.theorySub && card.theorySub.totalClasses > 0 ? (card.theorySub.attendanceCount / card.theorySub.totalClasses) * 100 : 0;
  const labRate = card.labSub && card.labSub.totalClasses > 0 ? (card.labSub.attendanceCount / card.labSub.totalClasses) * 100 : 0;

  return (
    <div className="glass-card p-5 rounded-2xl hover:border-primary transition-all group relative flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-base text-on-surface tracking-tight">{card.baseName}</h4>
            {hasLab && (
              <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                Theory: <span className={theoryRate >= 75 ? "text-emerald-400 font-bold" : "text-error font-bold"}>{theoryRate.toFixed(0)}%</span> • Lab: <span className={labRate >= 75 ? "text-emerald-400 font-bold" : "text-error font-bold"}>{labRate.toFixed(0)}%</span>
              </p>
            )}
          </div>
          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isSafe ? (isDarkMode ? "bg-[#00e1a1]/20 text-[#47ffbc]" : "bg-[#D1FAE5] text-[#065F46]") : (isDarkMode ? "bg-error/20 text-error" : "bg-[#FEE2E2] text-[#991B1B]")}`}>
            {isSafe ? "Safe" : "Danger"}
          </span>
        </div>

        {hasLab && (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/90 dark:bg-surface-container/80 border border-slate-700/50 dark:border-outline-variant/30 mb-3">
            <button
              onClick={() => setActiveTab("Theory")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "Theory"
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md scale-[1.02]"
                  : "text-slate-300 dark:text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="text-white font-bold tracking-wide">Theory</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold text-white ${activeTab === "Theory" ? "bg-black/30" : "bg-white/15"}`}>
                {theoryRate.toFixed(0)}%
              </span>
            </button>

            <button
              onClick={() => setActiveTab("Lab")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "Lab"
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md scale-[1.02]"
                  : "text-slate-300 dark:text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="text-white font-bold tracking-wide">Lab</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold text-white ${activeTab === "Lab" ? "bg-black/30" : "bg-white/15"}`}>
                {labRate.toFixed(0)}%
              </span>
            </button>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-on-surface-variant font-medium">
              {hasLab ? `${activeTab} Attendance Rate` : "Attendance Rate"}
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
              <p className="text-xs font-extrabold text-primary mt-0.5">{activeSub.attendanceCount}</p>
            </div>
            <div className="border-l border-r border-outline-variant/30">
              <p className="text-[9px] font-bold text-on-surface-variant uppercase">Missed</p>
              <p className="text-xs font-extrabold text-error mt-0.5">{Math.max(0, activeSub.totalClasses - activeSub.attendanceCount)}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase">Total Held</p>
              <p className="text-xs font-extrabold text-on-surface mt-0.5">{activeSub.totalClasses}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button 
              onClick={() => onUpdateSubjectHours(activeSub.id, activeSub.attendanceCount + 1, activeSub.totalClasses + 1)}
              className="py-2 px-3 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
              title="Mark Present (+1 Attended, +1 Total)"
            >
              <span>Present</span>
            </button>
            <button 
              onClick={() => onUpdateSubjectHours(activeSub.id, activeSub.attendanceCount, activeSub.totalClasses + 1)}
              className="py-2 px-3 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer"
              title="Mark Absent (+1 Missed, +1 Total)"
            >
              <span>Absent</span>
            </button>
            <button 
              onClick={() => {
                if (activeSub.totalClasses > 0) {
                  onUpdateSubjectHours(activeSub.id, Math.max(0, activeSub.attendanceCount - 1), Math.max(0, activeSub.totalClasses - 1));
                }
              }}
              className={`py-2 px-3 rounded-full font-bold text-xs shadow-md transition-all duration-150 flex items-center justify-center gap-1 ${
                activeSub.totalClasses > 0
                  ? "bg-[#64748b] hover:bg-[#475569] text-white hover:shadow-lg active:scale-95 cursor-pointer"
                  : "bg-[#475569] text-white/90 cursor-not-allowed opacity-90"
              }`}
              title="Undo last class entry"
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
