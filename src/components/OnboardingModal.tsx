/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
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
  onComplete: (result: OnboardingResult) => Promise<void> | void;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS  = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ── Shared input style (forces dark bg even against browser defaults) ───────
const inputCls =
  "w-full rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none transition-all border border-[#2a3550] focus:border-[#1AE7A6]/70 placeholder-[#4a5a70]";
const inputStyle: React.CSSProperties = {
  background: "#0d1525",
  colorScheme: "dark",
};

// ══════════════════════════════════════════════════════════════════════════
export default function OnboardingModal({ userName, onComplete }: Props) {
  // ── Step state ─────────────────────────────────────────────────────────
  const [step, setStep]       = useState<1 | 2>(1);

  // ── Step 1 fields ──────────────────────────────────────────────────────
  const [branch, setBranch]   = useState<"CSE" | "Other">("CSE");
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState<number>(1);
  const [rollNo, setRollNo]   = useState("");

  // ── Step 2 fields ──────────────────────────────────────────────────────
  const [subjects, setSubjects]     = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [customBranch, setCustomBranch] = useState("");
  const newSubjectRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);

  // ── Slide animation ────────────────────────────────────────────────────
  const [animIn, setAnimIn] = useState(true);
  const transition = (fn: () => void) => {
    setAnimIn(false);
    setTimeout(() => { fn(); setAnimIn(true); }, 200);
  };

  // ── Derived ────────────────────────────────────────────────────────────
  const isAutoFill    = branch === "CSE" && semester >= 1 && semester <= 5;
  const isCSEManual   = branch === "CSE" && semester >= 6;
  const isOtherBranch = branch === "Other";

  // ── Navigation ─────────────────────────────────────────────────────────
  const canGoNext = rollNo.trim().length > 0;

  const handleNext = () => {
    if (!canGoNext) return;
    transition(() => {
      setSubjects(isAutoFill ? [...DTU_CSE_SUBJECTS[semester]] : []);
      setNewSubject("");
      setStep(2);
    });
  };

  const handleBack = () => transition(() => setStep(1));

  // ── Subject management ─────────────────────────────────────────────────
  const addSubject = () => {
    const t = newSubject.trim();
    if (t && !subjects.includes(t)) setSubjects(p => [...p, t]);
    setNewSubject("");
    newSubjectRef.current?.focus();
  };
  const removeSubject = (i: number) => setSubjects(p => p.filter((_, j) => j !== i));
  const onSubjectKey  = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } };

  // ── Save ───────────────────────────────────────────────────────────────
  const canSave = subjects.length > 0 && (!isOtherBranch || customBranch.trim().length > 0);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onComplete({
        branch:   isOtherBranch ? customBranch.trim() : branch,
        semester: `${semester}${sfx(semester)} Semester`,
        section:  String(section),
        rollNo:   rollNo.trim(),
        subjects,
      });
      // if we reach here without error, modal will unmount (dashboard renders)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Chip button helper ─────────────────────────────────────────────────
  const chipBtn = (active: boolean) =>
    `py-2.5 rounded-xl text-sm font-black border transition-all cursor-pointer select-none ${
      active
        ? "bg-gradient-to-br from-[#1AE7A6] to-[#00C896] border-transparent text-[#002114] shadow-md shadow-[#1AE7A6]/25"
        : "bg-[#0d1525] border-[#2a3550] text-[#8899aa] hover:border-[#1AE7A6]/50 hover:text-white"
    }`;

  const firstName = userName.split(" ")[0];

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#04080f]/95 backdrop-blur-lg">

      {/* Ambient glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#1AE7A6]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-[#3b6fff]/4 blur-[100px] pointer-events-none" />

      {/* Card */}
      <div
        className="relative w-full max-w-md max-h-[92vh] flex flex-col"
        style={{
          opacity:   animIn ? 1 : 0,
          transform: animIn ? "translateY(0) scale(1)" : "translateY(14px) scale(0.97)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        {/* Step progress dots */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                step === s ? "w-8 bg-[#1AE7A6]" : step > s ? "w-4 bg-[#1AE7A6]/50" : "w-4 bg-[#2a3550]"
              }`}
            />
          ))}
        </div>

        {/* Glass card — scrollable body */}
        <div className="rounded-3xl border border-[#1f2d45] shadow-2xl flex flex-col overflow-hidden" style={{ background: "#0b1220" }}>

          {/* Scrollable area */}
          <div className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-5">

            {/* ════ STEP 1 ════════════════════════════════════════════ */}
            {step === 1 && (
              <>
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1AE7A6] to-[#00C896] flex items-center justify-center shadow-lg shadow-[#1AE7A6]/20 flex-shrink-0">
                    <span className="material-symbols-outlined text-[#002114] text-lg">school</span>
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Welcome, {firstName}! 👋</h2>
                    <p className="text-[#6b7e94] text-xs mt-0.5">Set up your academic profile once</p>
                  </div>
                </div>

                <div className="h-px bg-[#1a2535]" />

                {/* Branch */}
                <div>
                  <p className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest mb-2">Branch</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["CSE", "Other"] as const).map(b => (
                      <button
                        key={b}
                        onClick={() => setBranch(b)}
                        className={`py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                          branch === b
                            ? "bg-[#1AE7A6]/12 border-[#1AE7A6] text-[#1AE7A6]"
                            : "bg-[#0d1525] border-[#2a3550] text-[#8899aa] hover:border-[#1AE7A6]/40 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">
                            {b === "CSE" ? "terminal" : "school"}
                          </span>
                          {b === "CSE" ? "CSE" : "Other Branch"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Semester */}
                <div>
                  <p className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest mb-2">
                    Semester
                    {isAutoFill && (
                      <span className="ml-2 normal-case text-[#1AE7A6]/60 font-normal">✨ subjects auto-loaded</span>
                    )}
                  </p>
                  <div className="grid grid-cols-8 gap-1.5">
                    {SEMESTERS.map(s => (
                      <button key={s} onClick={() => setSemester(s)} className={chipBtn(semester === s)}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Section */}
                <div>
                  <p className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest mb-2">Section</p>
                  <div className="grid grid-cols-9 gap-1.5">
                    {SECTIONS.map(s => (
                      <button key={s} onClick={() => setSection(s)} className={chipBtn(section === s)}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Roll Number */}
                <div>
                  <p className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest mb-2">
                    Roll Number <span className="text-red-400">*</span>
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. 2K24/CO/101"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && canGoNext) handleNext(); }}
                    className={inputCls}
                    style={inputStyle}
                  />
                  {!rollNo.trim() && (
                    <p className="text-[10px] text-[#4a5a70] mt-1.5 font-mono">Required to continue</p>
                  )}
                </div>
              </>
            )}

            {/* ════ STEP 2 ════════════════════════════════════════════ */}
            {step === 2 && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleBack}
                      className="w-8 h-8 rounded-xl border border-[#2a3550] flex items-center justify-center text-[#6b7e94] hover:text-white hover:border-[#1AE7A6]/40 transition-all cursor-pointer"
                      style={{ background: "#0d1525" }}
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                    </button>
                    <div>
                      <h2 className="text-sm font-black text-white">
                        {isAutoFill ? "Your Subjects" : "Add Subjects"}
                      </h2>
                      <p className="text-[#6b7e94] text-[10px]">
                        {isAutoFill
                          ? `CSE Sem ${semester} — pre-loaded`
                          : isCSEManual
                          ? `CSE Sem ${semester} — type manually`
                          : "Other branch — type manually"}
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg border border-[#1AE7A6]/20 flex items-center gap-1.5" style={{ background: "#0d1525" }}>
                    <span className="text-[#1AE7A6] font-black font-mono text-sm">{subjects.length}</span>
                    <span className="text-[#6b7e94] text-[9px] font-bold uppercase">subs</span>
                  </div>
                </div>

                <div className="h-px bg-[#1a2535]" />

                {/* Other branch name */}
                {isOtherBranch && (
                  <div>
                    <p className="text-[10px] font-bold text-[#1AE7A6] uppercase tracking-widest mb-2">
                      Branch Name <span className="text-red-400">*</span>
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. Electronics & Communication"
                      value={customBranch}
                      onChange={e => setCustomBranch(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                )}

                {/* Auto-filled chips */}
                {isAutoFill && subjects.length > 0 && (
                  <div>
                    <p className="text-[9px] text-[#1AE7A6] font-bold uppercase tracking-widest mb-2">
                      ✨ Pre-filled — tap × to remove
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                      {subjects.map((sub, i) => (
                        <div key={i} className="flex items-center gap-1.5 border border-[#1AE7A6]/20 text-[#c8f5e8] text-xs font-medium px-2.5 py-1.5 rounded-xl" style={{ background: "#0d1e17" }}>
                          <span className="material-symbols-outlined text-[#1AE7A6] text-xs">book</span>
                          {sub}
                          <button onClick={() => removeSubject(i)} className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[#6b7e94] hover:text-red-400 transition-colors cursor-pointer ml-0.5">
                            <span className="material-symbols-outlined text-[10px]">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual list */}
                {!isAutoFill && subjects.length > 0 && (
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                    {subjects.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2 border border-[#2a3550] rounded-xl px-3 py-2" style={{ background: "#0d1525" }}>
                        <span className="text-[#1AE7A6] font-black font-mono text-[10px] w-5 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-white text-xs flex-1 truncate">{sub}</span>
                        <button onClick={() => removeSubject(i)} className="text-[#6b7e94] hover:text-red-400 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!isAutoFill && subjects.length === 0 && (
                  <div className="py-5 text-center">
                    <span className="material-symbols-outlined text-[#2a3550] text-3xl block mb-1">library_books</span>
                    <p className="text-[#4a5a70] text-xs">No subjects yet — add below</p>
                  </div>
                )}

                {/* Add input */}
                <div className="flex gap-2">
                  <input
                    ref={newSubjectRef}
                    type="text"
                    placeholder={isAutoFill ? "Add another subject…" : "Subject name, press Enter…"}
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    onKeyDown={onSubjectKey}
                    className={`${inputCls} flex-1`}
                    style={inputStyle}
                  />
                  <button
                    onClick={addSubject}
                    disabled={!newSubject.trim()}
                    className="px-3 rounded-xl border border-[#1AE7A6]/30 text-[#1AE7A6] hover:bg-[#1AE7A6]/10 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center"
                    style={{ background: "#0d1525" }}
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                  </button>
                </div>

                {/* Validation */}
                {!canSave && (
                  <p className="text-[10px] text-red-400/60 font-mono text-center">
                    {subjects.length === 0 ? "⚠ Add at least one subject" : "⚠ Enter your branch name above"}
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Sticky footer ── */}
          <div className="p-4 border-t border-[#1a2535]" style={{ background: "#0b1220" }}>
            {/* Error banner */}
            {saveError && (
              <div className="mb-3 flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-red-400 text-base flex-shrink-0 mt-0.5">error</span>
                <p className="text-xs text-red-300 leading-relaxed">{saveError}</p>
              </div>
            )}
            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="w-full py-3 rounded-2xl font-black text-sm text-[#002114] bg-gradient-to-r from-[#1AE7A6] to-[#00C896] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#1AE7A6]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="w-full py-3 rounded-2xl font-black text-sm text-[#002114] bg-gradient-to-r from-[#1AE7A6] to-[#00C896] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#1AE7A6]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving to cloud…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">rocket_launch</span>
                    Save & Get Started
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function sfx(n: number) { return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"; }
