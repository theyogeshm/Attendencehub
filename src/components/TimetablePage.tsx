/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { TimetableSlot } from "../types";
import { TIMETABLE_SLOTS } from "../data";
import { Download, Edit2, Lightbulb, Bell, Calendar, ChevronRight, Info } from "lucide-react";

interface TimetablePageProps {
  onMarkAttendance: (subjectId: string, isPresent: boolean) => void;
}

const DAY_INDEX_MAP: Record<number, string> = { 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI" };

export default function TimetablePage({ onMarkAttendance }: TimetablePageProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  // Live today detection
  const todayKey = DAY_INDEX_MAP[new Date().getDay()] ?? null;
  
  const days = ["MON", "TUE", "WED", "THU", "FRI"] as const;
  const timeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 01:00", // Lunch
    "01:00 - 02:00",
    "02:00 - 03:00",
    "03:00 - 04:00"
  ];

  // Helper to find slot based on day and index (with colSpan consideration)
  const getSlot = (day: string, time: string) => {
    return TIMETABLE_SLOTS.find(s => s.day === day && s.timeSlot === time);
  };

  const handleCellClick = (slot: TimetableSlot) => {
    if (slot.isLunch || slot.subjectName === "Free Slot" || slot.subjectName === "Library") return;
    setSelectedSlot(slot);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header with interactive actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-1">Weekly Schedule</h2>
          <p className="text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-sm font-bold text-primary">schedule</span>
            <span>Semester 2 • Section A • {todayKey ? `Today: ${todayKey} highlighted` : "Weekend — No Classes"}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => alert("Downloading formatted Weekly Timetable Schedule PDF...")}
            className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-semibold text-xs flex items-center gap-1.5 hover:bg-surface-variant transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
          <button 
            onClick={() => alert("Timetable Edit module activated. Modify slots directly.")}
            className="px-4 py-2 rounded-xl bg-secondary text-[#001e2c] font-bold text-xs flex items-center gap-1.5 hover:brightness-105 transition-all outline-none cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Mode</span>
          </button>
        </div>
      </div>

      {/* Grid container with responsive warnings */}
      <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant shadow-lg">
        {/* Mobile Landscape suggestion */}
        <div className="lg:hidden p-4 bg-secondary-container/10 text-secondary rounded-xl mb-4 mx-4 mt-4 flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs font-semibold">Swipe horizontal or rotate screen for the full 8-slot weekly grid.</p>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] bg-outline-variant/30 grid grid-cols-[100px_repeat(8,_1fr)] gap-[1px]">
            
            {/* First Row of headers (TimeSlots) */}
            <div className="bg-[#131b2e] flex items-center justify-center p-4 text-center font-bold text-[11px] text-on-surface-variant font-mono">
              DAYS
            </div>
            {timeSlots.map((time) => (
              <div 
                key={time} 
                className={`bg-[#131b2e] flex items-center justify-center p-4 text-center font-bold text-[11px] font-mono ${
                  time === "12:00 - 01:00" ? 'text-on-surface-variant' : 'text-primary'
                }`}
              >
                {time}
              </div>
            ))}

            {/* Days blocks row by row */}
            {days.map((day) => {
              const isToday = day === todayKey;
              return (
                <div key={day} className="contents">
                  {/* Days column */}
                  <div className={`flex items-center justify-center p-4 text-center font-bold text-xs font-mono bg-[#131b2e] border-b border-outline-variant/30 ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                    {day}
                  </div>
                  
                  {/* Timeslots blocks */}
                  {timeSlots.map((time, idx) => {
                    const slot = getSlot(day, time);
                    if (!slot) return null; // handled if colSpan overlaps

                    const isLunch = slot.isLunch;
                    const isColSpan2 = slot.colSpan === 2;
                    let styleStr = "p-3 relative flex flex-col justify-between border-b border-outline-variant/10 text-left min-h-[90px] transition-all cursor-pointer ";
                    
                    // Specific highlight styles
                    if (isLunch) {
                      styleStr += "bg-surface-container-highest/60 text-center items-center justify-center font-mono font-bold text-[10px] tracking-widest text-on-surface-variant";
                    } else if (isToday) {
                      styleStr += "bg-primary-container/5 hover:bg-primary-container/15 border-b-2 border-primary-fixed ";
                    } else {
                      styleStr += "bg-[#171f33] hover:bg-[#2d3449] ";
                    }

                    if (slot.specialColor === "secondary") {
                      styleStr += "border-l-2 border-secondary bg-secondary-container/5 ";
                    } else if (slot.specialColor === "primary-live" || slot.specialColor === "primary") {
                      styleStr += "border-l-2 border-primary bg-primary-container/10 ";
                    } else if (slot.specialColor === "error") {
                      styleStr += "border-l-2 border-error bg-error-container/5 ";
                    }

                    return (
                      <div 
                        key={`${day}-${idx}`}
                        className={`${styleStr} ${isColSpan2 ? 'col-span-2' : ''}`}
                        onClick={() => handleCellClick(slot)}
                      >
                        {isLunch ? (
                          <span>LUNCH</span>
                        ) : (
                          <>
                            <div>
                              <span className={`block font-semibold text-xs tracking-tight ${
                                slot.specialColor === "primary-live" ? 'text-primary' : 'text-on-surface'
                              }`}>
                                {slot.subjectName}
                              </span>
                              {slot.room && <span className="block text-[10px] text-on-surface-variant mt-0.5">{slot.room}</span>}
                            </div>
                            
                            {/* Live Badge if Wed Maths */}
                            {slot.specialColor === "primary-live" && (
                              <span className="self-start text-[8px] bg-primary text-[#002114] font-extrabold px-1.5 py-0.5 rounded font-mono mt-1">
                                LIVE NOW
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}

          </div>
        </div>
      </div>

      {/* Bottom Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Quick tip */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between transition-all hover:border-primary-container/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-fixed">
              <Lightbulb className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-bold text-sm text-on-surface">Quick Tip</h3>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            You have a Physics Lab submission due tomorrow. Make sure to complete your practical records before 10 PM tonight.
          </p>
        </div>

        {/* Card 2: Next Class */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-secondary flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-on-surface">Next Class</h3>
          </div>
          <div>
            <p className="text-on-surface font-bold text-xs">Maths IV @ 09:00 AM</p>
            <p className="text-[11px] text-on-surface-variant mt-1">Venue: LHC-202 (Starts in 12 mins)</p>
          </div>
        </div>

        {/* Card 3: Academic Calendar events */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-on-surface">Academic Calendar</h3>
          </div>
          <ul className="space-y-2 text-xs">
            <li className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant">Mid-Sem Exams</span>
              <span className="text-error font-mono font-bold">Mar 15</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-on-surface-variant">Cultural Fest</span>
              <span className="text-primary font-mono font-bold">Apr 02</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Interactive Detail Slot Sidebar drawer popup */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090d16]/80 backdrop-blur-sm" onClick={() => setSelectedSlot(null)}></div>
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-outline-variant shadow-2xl relative z-10 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            
            <div>
              <h4 className="font-bold text-lg text-on-surface">{selectedSlot.subjectName}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{selectedSlot.day} Slot • {selectedSlot.timeSlot}</p>
            </div>

            <div className="bg-[#0b1326] p-3 rounded-xl text-left border border-outline-variant/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Venue Room</span>
                <span className="font-bold text-on-surface">{selectedSlot.room || "Lab Floor / Online"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Status</span>
                <span className="text-primary-container font-mono font-bold">Scheduled</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedSlot(null)}
                className="flex-1 py-2 bg-surface-container border border-outline-variant rounded-xl text-xs font-bold hover:bg-[#2d3449] cursor-pointer"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert(`Directly logged attendance check-in for lecture: ${selectedSlot.subjectName}`);
                  setSelectedSlot(null);
                }}
                className="flex-1 py-2 bg-primary text-[#002114] rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                Check Inn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
