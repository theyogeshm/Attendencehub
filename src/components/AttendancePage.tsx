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

  // Interactive UI Filter & Options States
  const [statusFilter, setStatusFilter] = useState<"all" | "safe" | "danger">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [detailSubject, setDetailSubject] = useState<Subject | null>(null);

  // Calculate stats based on actual live subjects array!
  const totalClassesAttended = subjects.reduce((sum, s) => sum + s.attendanceCount, 0);
  const totalClassesHeld = subjects.reduce((sum, s) => sum + s.totalClasses, 0);

  // Find classes at risk (< 75%)
  const subjectsAtRiskCount = subjects.filter((s) => {
    const rate = s.totalClasses > 0 ? (s.attendanceCount / s.totalClasses) * 100 : 0;
    return rate < 75;
  }).length;

  // Selected subject config logic inside calculator
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Filtered subjects list
  const filteredSubjects = subjects.filter((s) => {
    const rate = s.totalClasses > 0 ? (s.attendanceCount / s.totalClasses) * 100 : 0;
    if (statusFilter === "safe") return rate >= 75;
    if (statusFilter === "danger") return rate < 75;
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
          <div className="flex justify-between items-center relative">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-on-surface">Subject Breakdown</h3>
              {statusFilter !== "all" && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {statusFilter}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => { setShowFilterMenu(!showFilterMenu); setShowOptionsMenu(false); }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    showFilterMenu || statusFilter !== "all"
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/30"
                  }`}
                  title="Filter subjects by attendance status"
                >
                  <Filter className="w-4 h-4" />
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 top-10 z-40 w-44 p-2 rounded-2xl glass-card border border-outline-variant shadow-xl space-y-1">
                    <p className="text-[9px] font-bold uppercase text-on-surface-variant px-2 py-1">Filter By</p>
                    <button
                      onClick={() => { setStatusFilter("all"); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        statusFilter === "all" ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-variant"
                      }`}
                    >
                      <span>All Subjects</span>
                      {statusFilter === "all" && <span>✓</span>}
                    </button>
                    <button
                      onClick={() => { setStatusFilter("safe"); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        statusFilter === "safe" ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-variant"
                      }`}
                    >
                      <span>Safe (75%+)</span>
                      {statusFilter === "safe" && <span>✓</span>}
                    </button>
                    <button
                      onClick={() => { setStatusFilter("danger"); setShowFilterMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                        statusFilter === "danger" ? "bg-error/10 text-error" : "text-on-surface-variant hover:bg-surface-variant"
                      }`}
                    >
                      <span>At Risk (&lt;75%)</span>
                      {statusFilter === "danger" && <span>✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Options Menu Button */}
              <div className="relative">
                <button
                  onClick={() => { setShowOptionsMenu(!showOptionsMenu); setShowFilterMenu(false); }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    showOptionsMenu
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/30"
                  }`}
                  title="Quick actions menu"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showOptionsMenu && (
                  <div className="absolute right-0 top-10 z-40 w-48 p-2 rounded-2xl glass-card border border-outline-variant shadow-xl space-y-1">
                    <p className="text-[9px] font-bold uppercase text-on-surface-variant px-2 py-1">Quick Links</p>
                    <button
                      onClick={() => { navigate("/resources"); setShowOptionsMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span>Academic Resources</span>
                    </button>
                    <button
                      onClick={() => { navigate("/assignments"); setShowOptionsMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#7bd0ff]" />
                      <span>Assignments</span>
                    </button>
                    <button
                      onClick={() => { navigate("/timetable"); setShowOptionsMenu(false); }}
                      className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-secondary" />
                      <span>Timetable</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSubjects.map((sub) => {
              const attendanceRate = sub.totalClasses > 0 ? (sub.attendanceCount / sub.totalClasses) * 100 : 0;
              const isSafe = attendanceRate >= 75;
              const hasSubInfo = Boolean(sub.prof?.trim() || sub.time?.trim());

              return (
                <div 
                  key={sub.id} 
                  className="glass-card p-5 rounded-2xl hover:border-primary transition-all group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-base text-on-surface tracking-tight">{sub.name}</h4>
                        {hasSubInfo && (
                          <p className="text-xs text-on-surface-variant mt-1">
                            {[sub.prof?.trim(), sub.time?.trim()].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </div>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${isSafe ? (isDarkMode ? "bg-primary/10 text-[#47ffbc]" : "bg-[#D1FAE5] text-[#065F46]") : (isDarkMode ? "bg-error/10 text-error" : "bg-[#FEE2E2] text-[#991B1B]")}`}>
                        {isSafe ? "Safe" : "Danger"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant">Attendance Count</span>
                        <span className="text-on-surface font-bold">{sub.attendanceCount} / {sub.totalClasses}</span>
                      </div>
                      
                      {/* Interactive adjustment controls directly in card */}
                      <div className="flex py-1.5 items-center justify-between gap-1 border-t border-b border-outline-variant/30 my-2">
                        <span className="text-[10px] uppercase text-on-surface-variant">Adjust Hours</span>
                        <div className="flex items-center gap-2">
                          <button 
                            disabled={sub.attendanceCount <= 0}
                            onClick={() => onUpdateSubjectHours(sub.id, sub.attendanceCount - 1, sub.totalClasses - 1)}
                            className="w-6 h-6 rounded bg-[#0b1326] hover:bg-surface-variant text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center border border-outline-variant"
                            title="Decrement hour"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono font-bold text-primary">{sub.attendanceCount}</span>
                          <button 
                            onClick={() => onUpdateSubjectHours(sub.id, sub.attendanceCount + 1, sub.totalClasses + 1)}
                            className="w-6 h-6 rounded bg-[#0b1326] hover:bg-surface-variant text-xs font-bold transition-colors cursor-pointer flex items-center justify-center border border-outline-variant"
                            title="Increment hour"
                          >
                            +
                          </button>
                          
                          <span className="text-xs font-mono text-on-surface-variant">/</span>

                          <span className="text-xs font-mono font-bold text-on-surface">{sub.totalClasses}</span>
                          <button 
                            onClick={() => onUpdateSubjectHours(sub.id, sub.attendanceCount, sub.totalClasses + 1)}
                            className="w-6 h-6 rounded bg-[#0b1326] hover:bg-surface-variant text-xs font-bold transition-colors cursor-pointer flex items-center justify-center border border-outline-variant"
                            title="Add total class only"
                          >
                            +T
                          </button>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                        <div 
                          className={`h-full progress-glow transition-all duration-300 ${isSafe ? (isDarkMode ? "bg-gradient-to-r from-primary to-secondary" : "bg-[#00C896]") : (isDarkMode ? "bg-error" : "bg-[#E53E3E]")}`}
                          style={{ width: `${Math.min(100, attendanceRate)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-1">
                    <span className={`text-2xl font-extrabold tracking-tight ${isSafe ? 'text-primary' : 'text-error'}`}>
                      {attendanceRate.toFixed(0)}%
                    </span>
                    <button
                      onClick={() => setDetailSubject(sub)}
                      className="text-primary text-[11px] font-bold uppercase tracking-wider hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Details</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
