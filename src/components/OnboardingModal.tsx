/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { DTU_CSE_SUBJECTS } from "../data";

// ── Types ──────────────────────────────────────────────────────────────────
interface OnboardingResult {
  branch: string;
  semester: string;
  section: string;
  rollNo: string;
  subjects: string[];
}

interface Props {
  userName: string;
  onComplete: (result: OnboardingResult) => void;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ══════════════════════════════════════════════════════════════════════════
export default function OnboardingModal({ userName, onComplete }: Props) {
  // ── Step 1 state ───────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [branch, setBranch] = useState<"CSE" | "Other">("CSE");
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState<number>(1);
  const [rollNo, setRollNo] = useState("");

  // ── Step 2 state ───────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [customBranch, setCustomBranch] = useState(""); // for "Other" branch name
  const newSubjectRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  // ── Slide animation ────────────────────────────────────────────────────
  const [animIn, setAnimIn] = useState(true);
  const transition = (fn: () => void) => {
    setAnimIn(false);
    setTimeout(() => { fn(); setAnimIn(true); }, 200);
  };

  // ── Derived: what mode are we in? ──────────────────────────────────────
  const isAutoFill = branch === "CSE" && semester >= 1 && semester <= 5;
  const isCSEManual = branch === "CSE" && semester >= 6;
  const isOtherBranch = branch === "Other";

  const modeLabel = isAutoFill
    ? "✨ Subjects will be auto-loaded!"
    : isCSEManual
    ? "Enter subjects manually for Sem 6–8"
    : "Enter your branch name & subjects below";

  // ── Step 1 → Step 2 ────────────────────────────────────────────────────
  const handleNext = () => {
    transition(() => {
      setSubjects(isAutoFill ? [...DTU_CSE_SUBJECTS[semester]] : []);
      setNewSubject("");
      setStep(2);
    });
  };

  // ── Step 2 → Step 1 ────────────────────────────────────────────────────
  const handleBack = () => {
    transition(() => setStep(1));
  };

  // ── Subject management ─────────────────────────────────────────────────
  const addSubject = () => {
    const t = newSubject.trim();
    if (t && !subjects.includes(t)) setSubjects(prev => [...prev, t]);
    setNewSubject("");
    newSubjectRef.current?.focus();
  };

  const removeSubject = (idx: number) =>
    setSubjects(prev => prev.filter((_, i) => i !== idx));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addSubject(); }
  };

  // ── Save ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (subjects.length === 0) return;
    if (isOtherBranch && !customBranch.trim()) return;
    if (!rollNo.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 280));
    onComplete({
      branch:   isOtherBranch ? customBranch.trim() : branch,
      semester: `${semester}${semSuffix(semester)} Semester`,
      section:  String(section),
      rollNo:   rollNo.trim(),
      subjects,
    });
  };

  const firstName = userName.split(" ")[0];
  const canSave =
    subjects.length > 0 &&
    rollNo.trim().length > 0 &&
    (!isOtherBranch || customBranch.trim().length > 0);

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#060b17]/92 backdrop-blur-md">
      {/* Glow orbs */}
      <div className="absolute top-[-80px] left-[-80px] w-[460px] h-[460px] rounded-full bg-[#1AE7A6]/6 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full bg-[#7bd0ff]/5 blur-[100px] pointer-events-none" />

      {/* Modal card */}
      <div
        className="relative w-full max-w-md"
        style={{
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        {/* Progress bar */}
        <div className="mb-4 flex gap-2">
          {[1, 2].map(s => (
            <div key={s} className="h-1 flex-1 rounded-full overflow-hidden bg-[#1e2a42]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1AE7A6] to-[#00C896] transition-all duration-500"
                style={{ width: step >= s ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Glass card */}
        <div className="bg-[#111827]/92 backdrop-blur-xl border border-[#1AE7A6]/12 rounded-3xl p-7 shadow-2xl">

          {/* ════ STEP 1: Branch & Semester ════════════════════════════ */}
          {step === 1 && (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1AE7A6] to-[#00C896] flex items-center justify-center shadow-lg shadow-[#1AE7A6]/25 flex-shrink-0">
                  <span className="material-symbols-outlined text-[#002114] text-xl">school</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">
                    Welcome, {firstName}! 👋
                  </h2>
                  <p className="text-[#bacbbf] text-xs mt-0.5">
                    Let's set up your academic profile
                  </p>
                </div>
              </div>

              {/* Branch — only CSE & Other */}
              <div className="mb-5">
                <label className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest block mb-2.5">
                  Your Branch
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["CSE", "Other"] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setBranch(b)}
                      className={`py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer border ${
                        branch === b
                          ? "bg-[#1AE7A6]/15 border-[#1AE7A6] text-[#1AE7A6] shadow-sm shadow-[#1AE7A6]/20"
                          : "bg-[#0b1326]/60 border-[#3b4a42]/30 text-[#bacbbf] hover:border-[#1AE7A6]/40 hover:text-white"
                      }`}
                    >
                      {b === "CSE" ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">terminal</span>
                          CSE
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">school</span>
                          Other Branch
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest block mb-2.5">
                  Current Semester
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {SEMESTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSemester(s)}
                      className={`py-3 rounded-xl text-sm font-black transition-all cursor-pointer border ${
                        semester === s
                          ? "bg-gradient-to-br from-[#1AE7A6] to-[#00C896] border-transparent text-[#002114] shadow-md shadow-[#1AE7A6]/30"
                          : "bg-[#0b1326]/60 border-[#3b4a42]/30 text-[#bacbbf] hover:border-[#1AE7A6]/40 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Smart hint */}
                <p className={`text-[10px] mt-2.5 font-mono ${isAutoFill ? "text-[#1AE7A6]/80" : "text-[#bacbbf]/50"}`}>
                  {modeLabel}
                </p>
              </div>

              {/* Section (1–9) */}
              <div className="mb-4">
                <label className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest block mb-2.5">
                  Section
                </label>
                <div className="grid grid-cols-9 gap-1.5">
                  {[1,2,3,4,5,6,7,8,9].map(s => (
                    <button
                      key={s}
                      onClick={() => setSection(s)}
                      className={`py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer border ${
                        section === s
                          ? "bg-gradient-to-br from-[#1AE7A6] to-[#00C896] border-transparent text-[#002114] shadow-md shadow-[#1AE7A6]/30"
                          : "bg-[#0b1326]/60 border-[#3b4a42]/30 text-[#bacbbf] hover:border-[#1AE7A6]/40 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roll Number */}
              <div className="mb-6">
                <label className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest block mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2K24/CO/101"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  className="w-full bg-[#0b1326] border border-[#3b4a42]/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#bacbbf]/40 focus:border-[#1AE7A6]/60 focus:outline-none transition-all font-mono"
                />
              </div>

              {/* Next */}
              <button
                onClick={handleNext}
                className="w-full py-3.5 bg-gradient-to-r from-[#1AE7A6] to-[#00C896] text-[#002114] rounded-2xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#1AE7A6]/25 flex items-center justify-center gap-2"
              >
                <span>Next — Set Up Subjects</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          )}

          {/* ════ STEP 2: Subject Setup ══════════════════════════════════ */}
          {step === 2 && (
            <div>
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBack}
                    className="w-8 h-8 rounded-xl bg-[#0b1326]/60 border border-[#3b4a42]/30 flex items-center justify-center text-[#bacbbf] hover:text-white hover:border-[#1AE7A6]/40 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                  </button>
                  <div>
                    <h2 className="text-base font-black text-white leading-tight">
                      {isAutoFill ? "Your Subjects" : "Add Your Subjects"}
                    </h2>
                    <p className="text-[#bacbbf] text-[10px] mt-0.5">
                      {isAutoFill
                        ? `CSE Sem ${semester} — pre-loaded from JSON`
                        : isCSEManual
                        ? `CSE Sem ${semester} — manual entry`
                        : "Other branch — enter your details below"}
                    </p>
                  </div>
                </div>

                {/* Subject count badge */}
                <div className="flex items-center gap-1.5 bg-[#1AE7A6]/10 border border-[#1AE7A6]/20 px-2.5 py-1 rounded-xl">
                  <span className="text-[#1AE7A6] font-black font-mono text-sm">{subjects.length}</span>
                  <span className="text-[#bacbbf] text-[9px] font-bold uppercase">subs</span>
                </div>
              </div>

              <div className="h-px bg-[#1e2a42] mb-4" />

              {/* ── Other branch: custom branch name input ─────────────── */}
              {isOtherBranch && (
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest block mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics & Communication"
                    value={customBranch}
                    onChange={e => setCustomBranch(e.target.value)}
                    className="w-full bg-[#0b1326] border border-[#3b4a42]/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#bacbbf]/40 focus:border-[#1AE7A6]/60 focus:outline-none transition-all mb-1"
                  />
                  {!customBranch.trim() && (
                    <p className="text-[10px] text-[#bacbbf]/40 font-mono">Required before saving</p>
                  )}
                </div>
              )}

              {/* ── Auto-filled chips (CSE Sem 1–5) ───────────────────── */}
              {isAutoFill && (
                <div className="mb-4">
                  <p className="text-[9px] text-[#1AE7A6] font-bold uppercase tracking-widest mb-2.5">
                    ✨ Pre-filled — tap × to remove
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {subjects.map((sub, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[#1AE7A6]/8 border border-[#1AE7A6]/22 text-[#d4fdf1] text-xs font-semibold px-3 py-1.5 rounded-xl"
                      >
                        <span className="material-symbols-outlined text-[#1AE7A6] text-sm">book</span>
                        {sub}
                        <button
                          onClick={() => removeSubject(idx)}
                          className="w-4 h-4 rounded-full bg-[#3b4a42]/40 flex items-center justify-center text-[#bacbbf] hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer ml-0.5 flex-shrink-0"
                        >
                          <span className="material-symbols-outlined text-[11px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Manual list (CSE Sem 6-8 or Other) ────────────────── */}
              {!isAutoFill && subjects.length > 0 && (
                <div className="mb-4 space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                  {subjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#0b1326]/60 border border-[#3b4a42]/30 rounded-xl px-3 py-2"
                    >
                      <span className="text-[#1AE7A6] font-black font-mono text-xs w-5 flex-shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-white text-xs font-medium flex-1 truncate">{sub}</span>
                      <button
                        onClick={() => removeSubject(idx)}
                        className="w-5 h-5 rounded-lg flex items-center justify-center text-[#bacbbf] hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Empty state for manual modes ──────────────────────── */}
              {!isAutoFill && subjects.length === 0 && (
                <div className="mb-4 py-5 text-center">
                  <span className="material-symbols-outlined text-[#3b4a42] text-3xl mb-1 block">library_books</span>
                  <p className="text-[#bacbbf]/40 text-xs">No subjects yet — add them below</p>
                </div>
              )}

              {/* ── Add subject input ──────────────────────────────────── */}
              <div className="flex gap-2 mb-5">
                <input
                  ref={newSubjectRef}
                  type="text"
                  placeholder={isAutoFill ? "Add another subject…" : "Type subject name, press Enter…"}
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-[#0b1326] border border-[#3b4a42]/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#bacbbf]/40 focus:border-[#1AE7A6]/60 focus:outline-none transition-all"
                />
                <button
                  onClick={addSubject}
                  disabled={!newSubject.trim()}
                  className="px-3 py-2.5 bg-[#1AE7A6]/15 border border-[#1AE7A6]/30 text-[#1AE7A6] rounded-xl hover:bg-[#1AE7A6]/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                </button>
              </div>

              {/* Validation hint */}
              {!canSave && (
                <p className="text-[10px] text-red-400/60 mb-3 font-mono text-center">
                  {subjects.length === 0
                    ? "⚠ Add at least one subject"
                    : rollNo.trim().length === 0
                    ? "⚠ Go back and enter your Roll Number"
                    : "⚠ Enter your branch name above"}
                </p>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="w-full py-3.5 bg-gradient-to-r from-[#1AE7A6] to-[#00C896] text-[#002114] rounded-2xl font-black text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#1AE7A6]/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                    Save & Get Started
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-[#bacbbf]/30 mt-3 font-mono">
                You can edit subjects anytime from your profile
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function semSuffix(n: number): string {
  return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
}
