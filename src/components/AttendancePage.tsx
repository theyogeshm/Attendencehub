/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Subject } from "../types";
import { Calculator, Calendar, ArrowUpRight, Award, Trash2, Edit } from "lucide-react";

interface AttendancePageProps {
  subjects: Subject[];
  onUpdateSubjectHours: (id: string, attended: number, total: number) => void;
  isDarkMode: boolean;
}

export default function AttendancePage({ subjects, onUpdateSubjectHours, isDarkMode }: AttendancePageProps) {
  // Calculator Form States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || "");
  const [classesToMiss, setClassesToMiss] = useState<number>(1);

  // Calculate stats based on actual live subjects array!
  const totalClassesAttended = subjects.reduce((sum, s) => sum + s.attendanceCount, 0);
  const totalClassesHeld = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const aggregateAttendance = totalClassesHeld > 0 
    ? ((totalClassesAttended / totalClassesHeld) * 100) 
    : 0;

  // Find classes at risk (< 75%)
  const subjectsAtRiskCount = subjects.filter((s) => {
    const rate = s.totalClasses > 0 ? (s.attendanceCount / s.totalClasses) * 100 : 0;
    return rate < 75;
  }).length;

  // Selected subject config logic inside calculator
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Projected status logic based on selectedSubject
  let projectedPercentage = "0.0";
  let projectedStatusBadge = "Safe";
  let projectedStatusColor = "text-primary bg-primary/10 border-primary/20";
  let verdictText = "Select a valid subject to check status";

  if (selectedSubject) {
    const present = selectedSubject.attendanceCount;
    const currentTotal = selectedSubject.totalClasses;
    // If the student misses classes, the total classes held increases, but present count remains the same.
    const projectedTotal = currentTotal + classesToMiss;
    
    if (projectedTotal > 0) {
      const rate = (present / projectedTotal) * 100;
      projectedPercentage = rate.toFixed(1);
      if (rate >= 75) {
        projectedStatusBadge = "Safe";
        projectedStatusColor = isDarkMode
          ? "text-[#1ae7a6] bg-[#1ae7a6]/10 border-[#1ae7a6]/20"
          : "text-[#065F46] bg-[#D1FAE5] border-[#065F46]/20";
        verdictText = `"You're in the clear. Go grab that coffee!"`;
      } else {
        projectedStatusBadge = "Danger";
        projectedStatusColor = "text-error bg-error/10 border-error/20";
        verdictText = `"Better attend the next few sessions. It's risky."`;
      }
    }
  }

  return (
    <div className="space-y-6">
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
      {/* Overall Stats Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant transition-all hover:border-primary/40">
          <p className="text-[11px] font-bold text-on-surface-variant mb-2 tracking-wider uppercase font-mono">AGGREGATE ATTENDANCE</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? "text-[#1ae7a6]" : "text-[#00C896]"}`}>{aggregateAttendance.toFixed(1)}%</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${aggregateAttendance >= 75 ? (isDarkMode ? "bg-[#1ae7a6]/10 text-[#1ae7a6]" : "bg-[#D1FAE5] text-[#065F46]") : "bg-error/10 text-error"}`}>
              {aggregateAttendance >= 75 ? 'SAFE' : 'RISKY'}
            </span>
          </div>
        </div>
        
        <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant transition-all hover:border-primary/40">
          <p className="text-[11px] font-bold text-on-surface-variant mb-2 tracking-wider uppercase font-mono">TOTAL CLASSES</p>
          <p className="text-3xl font-extrabold text-on-surface tracking-tight">{totalClassesAttended} / {totalClassesHeld}</p>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant transition-all hover:border-primary/40">
          <p className="text-[11px] font-bold text-on-surface-variant mb-2 tracking-wider uppercase font-mono font-mono">CLASSES AT RISK</p>
          <p className={`text-3xl font-extrabold tracking-tight ${subjectsAtRiskCount > 0 ? 'text-error' : 'text-primary'}`}>
            {subjectsAtRiskCount} {subjectsAtRiskCount === 1 ? 'Subject' : 'Subjects'}
          </p>
        </div>

        <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant transition-all hover:border-primary/40">
          <p className="text-[11px] font-bold text-on-surface-variant mb-2 tracking-wider uppercase font-mono">ACADEMIC WEEK</p>
          <p className="text-3xl font-extrabold text-[#7bd0ff] tracking-tight">Week 12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Subject Breakdown Cards Grid (9 of 12) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-surface">Subject Breakdown</h3>
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">filter_list</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">more_vert</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {subjects.map((sub) => {
              const attendanceRate = sub.totalClasses > 0 ? (sub.attendanceCount / sub.totalClasses) * 100 : 0;
              const isSafe = attendanceRate >= 75;
              return (
                <div 
                  key={sub.id} 
                  className="bg-surface-container-high p-5 rounded-2xl border border-outline-variant hover:border-primary transition-all group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-base text-on-surface tracking-tight">{sub.name}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">{sub.prof} • {sub.time}</p>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono ${isSafe ? (isDarkMode ? "bg-primary/10 text-[#47ffbc]" : "bg-[#D1FAE5] text-[#065F46]") : (isDarkMode ? "bg-error/10 text-error" : "bg-[#FEE2E2] text-[#991B1B]")}`}>
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
                        <span className="text-[10px] uppercase font-mono text-on-surface-variant">Adjust Hours</span>
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
                    <button className="text-primary text-[11px] font-bold uppercase tracking-wider group-hover:underline">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Calculator Panel & Goal targets Column (4 of 12) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Can I Miss This Class Widget */}
          <div className="bg-surface-container p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
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
                  <label className="text-[10px] font-bold text-on-surface-variant block mb-2 tracking-widest font-mono">SELECT SUBJECT</label>
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
                  <label className="text-[10px] font-bold text-on-surface-variant block mb-2 tracking-widest font-mono uppercase">Classes to miss</label>
                  <div className="flex items-center gap-4 bg-[#060e20] p-3 rounded-xl border border-outline-variant">
                    <input 
                      className="flex-1 accent-primary cursor-pointer" 
                      max="10" 
                      min="0" 
                      type="range" 
                      value={classesToMiss}
                      onChange={(e) => setClassesToMiss(parseInt(e.target.value))}
                    />
                    <span className="font-extrabold text-lg text-primary w-6 text-center font-mono">{classesToMiss}</span>
                  </div>
                </div>

                {/* Status Result Badge component */}
                <div className="bg-[#060e20] p-4 rounded-xl border border-outline-variant">
                  <p className="text-[9px] font-bold text-on-surface-variant mb-2 tracking-wider font-mono">PROJECTED STATUS</p>
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
                  onClick={() => alert("Attendance profile synced with calendar. Reminders enabled!")}
                  className="w-full bg-surface-container-high border border-outline-variant text-[#dae2fd] hover:text-white hover:border-primary py-3 rounded-xl font-bold text-xs hover:shadow-md hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Sync with Calendar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Upcoming targets Goals list */}
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant">
            <h4 className="text-[10px] font-bold text-on-surface-variant mb-4 uppercase tracking-widest font-mono">Upcoming Attendance Goals</h4>
            <div className="space-y-5">
              
              {/* Goal 1: Scholarship Tier */}
              <div>
                <div className="flex mb-1.5 items-center justify-between">
                  <span className="text-[9px] font-extrabold inline-block py-1 px-2.5 uppercase rounded-full text-secondary-container bg-secondary/10">
                    Scholarship Tier (85%)
                  </span>
                  <span className="text-xs font-bold text-secondary font-mono">
                    {aggregateAttendance >= 85 ? "Completed ✔" : `${(85 - aggregateAttendance).toFixed(1)}% to go`}
                  </span>
                </div>
                <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-[#171f33]">
                  <div 
                    className="shadow-none flex flex-col text-center justify-center bg-secondary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (aggregateAttendance / 85) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Goal 2: Dean's List */}
              <div>
                <div className="flex mb-1.5 items-center justify-between">
                  <span className="text-[9px] font-extrabold inline-block py-1 px-2.5 uppercase rounded-full text-primary-container bg-primary/10">
                    Dean's List (95%)
                  </span>
                  <span className="text-xs font-bold text-primary font-mono">
                    {aggregateAttendance >= 95 ? "Completed ✔" : `${(95 - aggregateAttendance).toFixed(1)}% to go`}
                  </span>
                </div>
                <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-[#171f33]">
                  <div 
                    className="shadow-none flex flex-col text-center justify-center bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (aggregateAttendance / 95) * 100)}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      </>
      )}
    </div>
  );
}
