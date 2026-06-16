/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin Panel — restricted to yogeshkumarlearner@gmail.com
 * Route: /admin (registered outside the main app shell)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { DbResource } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  ShieldAlert,
  Loader2,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  ChevronDown,
  BookOpen,
  Clock,
  Users,
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "yogeshkumarlearner@gmail.com";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS  = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const TAB_TYPES = ["pyq", "notes", "tutorial", "assignment", "lab", "video"] as const;
const DAYS      = ["MON", "TUE", "WED", "THU", "FRI"] as const;
const TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface TimetableCell {
  subject: string;
  room: string;
  type: "LEC" | "LAB" | "";
}

type TimetableGrid = Record<string, Record<string, TimetableCell>>; // day → slot → cell

interface SubjectEntry {
  sem: number;
  subjects: string[];
}

// ── Toast helper ──────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const show = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

// ── Shared input style ─────────────────────────────────────────────────────────
const INP = "w-full bg-[#0d1525] border border-[#2d3449] rounded-lg px-3 py-2 text-sm text-[#dae2fd] placeholder-[#4a5568] focus:border-[#82ffc8] focus:outline-none transition-colors";
const SEL = `${INP} cursor-pointer`;
const BTN_PRIMARY   = "flex items-center gap-2 px-4 py-2 bg-[#82ffc8] text-[#002114] rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer";
const BTN_DANGER    = "flex items-center gap-2 px-3 py-1.5 border border-red-500/40 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-all cursor-pointer";
const BTN_SECONDARY = "flex items-center gap-2 px-4 py-2 border border-[#2d3449] text-[#bacbbf] rounded-lg font-bold text-sm hover:border-[#82ffc8]/50 hover:text-[#dae2fd] transition-all cursor-pointer";

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1: Resources Manager
// ══════════════════════════════════════════════════════════════════════════════
function ResourcesManager() {
  const { toast, show } = useToast();

  // Form state
  const [semester,  setSemester]  = useState<string>("");
  const [subject,   setSubject]   = useState("");
  const [tabType,   setTabType]   = useState<typeof TAB_TYPES[number]>("pyq");
  const [fileName,  setFileName]  = useState("");
  const [fileUrl,   setFileUrl]   = useState("");
  const [year,      setYear]      = useState("");
  const [fileSize,  setFileSize]  = useState("");
  const [adding,    setAdding]    = useState(false);

  // Table state
  const [resources, setResources] = useState<DbResource[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter
  const [filterSem, setFilterSem] = useState<string>("");
  const [filterTab, setFilterTab] = useState<string>("");
  const [filterQ,   setFilterQ]   = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setResources(data as DbResource[]);
    else show("Failed to load resources", false);
    setLoading(false);
  }, [show]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async () => {
    if (!subject.trim() || !fileName.trim() || !fileUrl.trim()) {
      show("Subject, File Name and URL are required", false);
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("resources").insert({
      subject:   subject.trim(),
      semester:  semester || null,
      tab_type:  tabType,
      file_name: fileName.trim(),
      file_url:  fileUrl.trim(),
      year:      year.trim() || null,
      file_size: fileSize.trim() || null,
    });
    setAdding(false);
    if (error) { show("Insert failed: " + error.message, false); return; }
    show("Resource added ✓");
    setFileName(""); setFileUrl(""); setYear(""); setFileSize(""); setSubject("");
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("resources").delete().eq("id", id);
    setDeletingId(null);
    if (error) { show("Delete failed: " + error.message, false); return; }
    show("Deleted ✓");
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const filtered = resources.filter(r => {
    const matchSem = !filterSem || r.semester === filterSem;
    const matchTab = !filterTab || r.tab_type === filterTab;
    const matchQ   = !filterQ   || r.subject.toLowerCase().includes(filterQ.toLowerCase()) || r.file_name.toLowerCase().includes(filterQ.toLowerCase());
    return matchSem && matchTab && matchQ;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${toast.ok ? "bg-green-900/40 border border-green-500/40 text-green-300" : "bg-red-900/40 border border-red-500/40 text-red-300"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Add Form ── */}
      <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-5">
        <h3 className="text-sm font-bold text-[#82ffc8] mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Resource
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">Semester</label>
            <select value={semester} onChange={e => setSemester(e.target.value)} className={SEL}>
              <option value="">— Any —</option>
              {SEMESTERS.map(s => <option key={s} value={`${s}${s===1?"st":s===2?"nd":s===3?"rd":"th"} Semester`}>{s}th Sem</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">Subject *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Data Structures" className={INP} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">Tab Type *</label>
            <select value={tabType} onChange={e => setTabType(e.target.value as typeof TAB_TYPES[number])} className={SEL}>
              {TAB_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">File Name *</label>
            <input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="2023 End-Term Paper.pdf" className={INP} />
          </div>
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">File URL * (Drive / YouTube / Direct)</label>
            <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..." className={INP} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">Year (optional)</label>
            <input value={year} onChange={e => setYear(e.target.value)} placeholder="2023" className={INP} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">File Size (optional)</label>
            <input value={fileSize} onChange={e => setFileSize(e.target.value)} placeholder="1.4 MB" className={INP} />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleAdd} disabled={adding} className={BTN_PRIMARY}>
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Resource
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[#1f2d3d] flex-wrap">
          <h3 className="text-sm font-bold text-[#dae2fd]">All Resources ({filtered.length})</h3>
          <div className="flex gap-2 flex-wrap">
            <input value={filterQ} onChange={e => setFilterQ(e.target.value)} placeholder="Search..." className={`${INP} w-40`} />
            <select value={filterTab} onChange={e => setFilterTab(e.target.value)} className={`${SEL} w-32`}>
              <option value="">All Types</option>
              {TAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button onClick={fetchAll} className={BTN_SECONDARY}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#bacbbf]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#4a5568] text-sm">No resources found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#0d1525]">
                <tr>
                  {["Subject", "Semester", "Tab", "File Name", "Year", "Size", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={`border-t border-[#1f2d3d] hover:bg-[#0d1525]/50 ${i % 2 === 0 ? "" : "bg-[#0d1525]/20"}`}>
                    <td className="px-4 py-3 font-semibold text-[#dae2fd] max-w-[150px] truncate">{r.subject}</td>
                    <td className="px-4 py-3 text-[#bacbbf]">{r.semester ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[#82ffc8]/10 text-[#82ffc8] font-mono font-bold uppercase text-[10px]">
                        {r.tab_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#dae2fd] max-w-[180px] truncate">
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#82ffc8] hover:underline transition-colors">
                        {r.file_name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[#bacbbf]">{r.year ?? "—"}</td>
                    <td className="px-4 py-3 text-[#bacbbf]">{r.file_size ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className={BTN_DANGER}
                      >
                        {deletingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2: Timetable Manager
// ══════════════════════════════════════════════════════════════════════════════
function TimetableManager() {
  const { toast, show } = useToast();

  const [semester, setSemester] = useState<number>(1);
  const [section,  setSection]  = useState<string>("1");
  const [grid,     setGrid]     = useState<TimetableGrid>({});
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Initialise empty grid
  const emptyGrid = useCallback((): TimetableGrid => {
    const g: TimetableGrid = {};
    DAYS.forEach(d => {
      g[d] = {};
      TIME_SLOTS.forEach(t => { g[d][t] = { subject: "", room: "", type: "" }; });
    });
    return g;
  }, []);

  // Load existing timetable from Supabase
  const loadTimetable = useCallback(async () => {
    setLoading(true);
    const g = emptyGrid();
    const { data, error } = await supabase
      .from("timetable")
      .select("*")
      .eq("semester", semester)
      .eq("section", section);

    if (!error && data) {
      data.forEach((row: any) => {
        if (g[row.day] && g[row.day][row.time_slot] !== undefined) {
          g[row.day][row.time_slot] = {
            subject: row.subject_name ?? "",
            room:    row.room ?? "",
            type:    row.type ?? "",
          };
        }
      });
    }
    setGrid(g);
    setLoading(false);
  }, [semester, section, emptyGrid]);

  useEffect(() => { loadTimetable(); }, [loadTimetable]);

  const updateCell = (day: string, slot: string, field: keyof TimetableCell, value: string) => {
    setGrid(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: { ...prev[day][slot], [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete existing rows for this semester+section
    await supabase.from("timetable")
      .delete()
      .eq("semester", semester)
      .eq("section", section);

    // Build rows to insert (only non-empty cells)
    const rows: any[] = [];
    DAYS.forEach(day => {
      TIME_SLOTS.forEach(slot => {
        const cell = grid[day]?.[slot];
        if (cell?.subject?.trim()) {
          rows.push({
            semester,
            section,
            day,
            time_slot:    slot,
            subject_name: cell.subject.trim(),
            room:         cell.room.trim() || null,
            type:         cell.type || "LEC",
          });
        }
      });
    });

    if (rows.length > 0) {
      const { error } = await supabase.from("timetable").insert(rows);
      if (error) { show("Save failed: " + error.message, false); setSaving(false); return; }
    }

    show(`Timetable saved — Sem ${semester}, Section ${section} (${rows.length} slots) ✓`);
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${toast.ok ? "bg-green-900/40 border border-green-500/40 text-green-300" : "bg-red-900/40 border border-red-500/40 text-red-300"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Selector row */}
      <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">Semester</label>
            <select value={semester} onChange={e => setSemester(Number(e.target.value))} className={`${SEL} w-36`}>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider block mb-1">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className={`${SEL} w-28`}>
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={loadTimetable} disabled={loading} className={BTN_SECONDARY}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Load
            </button>
            <button onClick={handleSave} disabled={saving} className={BTN_PRIMARY}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Timetable
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[#4a5568] mt-3">
          Fill in subject names for each time slot. Leave blank for free periods. 
          Saving will replace all existing data for this Semester + Section.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#bacbbf]">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading timetable...
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0d1525]">
                  <th className="px-3 py-3 text-left text-[10px] font-bold text-[#bacbbf] uppercase tracking-wider w-36 border-r border-[#1f2d3d]">Time Slot</th>
                  {DAYS.map(d => (
                    <th key={d} className="px-3 py-3 text-center text-[10px] font-bold text-[#82ffc8] uppercase tracking-wider border-r border-[#1f2d3d] last:border-r-0">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, si) => (
                  <tr key={slot} className={`border-t border-[#1f2d3d] ${si % 2 === 0 ? "bg-[#0d1525]/30" : ""}`}>
                    <td className="px-3 py-2 font-mono text-[11px] text-[#bacbbf] border-r border-[#1f2d3d] whitespace-nowrap">{slot}</td>
                    {DAYS.map(day => {
                      const cell = grid[day]?.[slot] ?? { subject: "", room: "", type: "" };
                      return (
                        <td key={day} className="px-2 py-1.5 border-r border-[#1f2d3d] last:border-r-0 min-w-[160px]">
                          <div className="space-y-1">
                            <input
                              value={cell.subject}
                              onChange={e => updateCell(day, slot, "subject", e.target.value)}
                              placeholder="Subject"
                              className="w-full bg-[#0a1020] border border-[#2d3449]/50 rounded px-2 py-1 text-[11px] text-[#dae2fd] placeholder-[#3a4a5a] focus:border-[#82ffc8] focus:outline-none transition-colors"
                            />
                            <div className="flex gap-1">
                              <input
                                value={cell.room}
                                onChange={e => updateCell(day, slot, "room", e.target.value)}
                                placeholder="Room"
                                className="flex-1 bg-[#0a1020] border border-[#2d3449]/50 rounded px-2 py-1 text-[10px] text-[#bacbbf] placeholder-[#3a4a5a] focus:border-[#82ffc8] focus:outline-none transition-colors"
                              />
                              <select
                                value={cell.type}
                                onChange={e => updateCell(day, slot, "type", e.target.value)}
                                className="bg-[#0a1020] border border-[#2d3449]/50 rounded px-1 py-1 text-[10px] text-[#bacbbf] focus:border-[#82ffc8] focus:outline-none transition-colors cursor-pointer"
                              >
                                <option value="">—</option>
                                <option value="LEC">LEC</option>
                                <option value="LAB">LAB</option>
                              </select>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3: Subjects Manager
// ══════════════════════════════════════════════════════════════════════════════
function SubjectsManager() {
  const { toast, show } = useToast();

  const [semesterData, setSemesterData] = useState<SubjectEntry[]>(
    SEMESTERS.map(s => ({ sem: s, subjects: [] }))
  );
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<number | null>(null);
  const [newSubject, setNewSubject] = useState<Record<number, string>>({});
  const [expanded,   setExpanded]   = useState<number>(1);

  // Load from Supabase dtu_subjects table (one row per semester)
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dtu_subjects")
      .select("*")
      .order("semester");

    if (!error && data && data.length > 0) {
      const merged = SEMESTERS.map(s => {
        const found = data.find((d: any) => d.semester === s);
        return { sem: s, subjects: found?.subjects ?? [] };
      });
      setSemesterData(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleSaveSem = async (sem: number) => {
    setSaving(sem);
    const entry = semesterData.find(e => e.sem === sem);
    if (!entry) { setSaving(null); return; }

    const { error } = await supabase
      .from("dtu_subjects")
      .upsert({ semester: sem, branch: "CSE", subjects: entry.subjects }, { onConflict: "semester,branch" });

    setSaving(null);
    if (error) { show("Save failed: " + error.message, false); return; }
    show(`Semester ${sem} subjects saved ✓`);
  };

  const updateSubjects = (sem: number, subs: string[]) => {
    setSemesterData(prev => prev.map(e => e.sem === sem ? { ...e, subjects: subs } : e));
  };

  const addSubject = (sem: number) => {
    const val = (newSubject[sem] ?? "").trim();
    if (!val) return;
    const entry = semesterData.find(e => e.sem === sem)!;
    if (entry.subjects.includes(val)) { show("Subject already exists", false); return; }
    updateSubjects(sem, [...entry.subjects, val]);
    setNewSubject(prev => ({ ...prev, [sem]: "" }));
  };

  const removeSubject = (sem: number, idx: number) => {
    const entry = semesterData.find(e => e.sem === sem)!;
    updateSubjects(sem, entry.subjects.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${toast.ok ? "bg-green-900/40 border border-green-500/40 text-green-300" : "bg-red-900/40 border border-red-500/40 text-red-300"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="bg-[#0d1525]/50 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300/80">
          This updates the <strong>dtu_subjects</strong> table in Supabase. Make sure the table exists with columns: <code className="bg-black/30 px-1 rounded">semester (int), branch (text), subjects (text[])</code>.
          Use <code className="bg-black/30 px-1 rounded">semester,branch</code> as unique constraint for upsert.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-[#bacbbf]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading subjects...
        </div>
      ) : (
        <div className="space-y-2">
          {semesterData.map(entry => (
            <div key={entry.sem} className="bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden">
              {/* Accordion header */}
              <button
                onClick={() => setExpanded(expanded === entry.sem ? -1 : entry.sem)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#0d1525]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#82ffc8]/10 text-[#82ffc8] font-black text-sm flex items-center justify-center">
                    {entry.sem}
                  </span>
                  <div>
                    <p className="font-bold text-sm text-[#dae2fd]">Semester {entry.sem}</p>
                    <p className="text-[10px] text-[#bacbbf]">{entry.subjects.length} subjects</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#bacbbf] transition-transform ${expanded === entry.sem ? "rotate-180" : ""}`} />
              </button>

              {expanded === entry.sem && (
                <div className="px-5 pb-5 border-t border-[#1f2d3d]">
                  {/* Subject chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.subjects.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-[#0d1525] border border-[#2d3449] rounded-lg pl-3 pr-1 py-1">
                        <span className="text-xs text-[#dae2fd]">{sub}</span>
                        <button
                          onClick={() => removeSubject(entry.sem, idx)}
                          className="w-4 h-4 rounded flex items-center justify-center text-[#bacbbf] hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {entry.subjects.length === 0 && (
                      <p className="text-xs text-[#4a5568] italic">No subjects yet.</p>
                    )}
                  </div>

                  {/* Add subject */}
                  <div className="mt-4 flex gap-2">
                    <input
                      value={newSubject[entry.sem] ?? ""}
                      onChange={e => setNewSubject(prev => ({ ...prev, [entry.sem]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") addSubject(entry.sem); }}
                      placeholder="Add subject name..."
                      className={`${INP} flex-1`}
                    />
                    <button onClick={() => addSubject(entry.sem)} className={BTN_SECONDARY}>
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>

                  {/* Save */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleSaveSem(entry.sem)}
                      disabled={saving === entry.sem}
                      className={BTN_PRIMARY}
                    >
                      {saving === entry.sem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Semester {entry.sem}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN Admin Panel Component
// ══════════════════════════════════════════════════════════════════════════════
type AdminSection = "resources" | "timetable" | "subjects";

export default function AdminPanel() {
  const navigate = useNavigate();

  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<AdminSection>("resources");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060e20] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#82ffc8]" />
      </div>
    );
  }

  // ── Access denied ────────────────────────────────────────────────────────
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#060e20] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-2xl bg-red-900/30 border border-red-500/30 flex items-center justify-center">
          <ShieldAlert className="w-10 h-10 text-red-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-[#bacbbf] text-sm max-w-sm">
            {user
              ? `Your account (${user.email}) doesn't have admin privileges.`
              : "You must be signed in with an authorized account."}
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#2d3449] text-[#bacbbf] rounded-xl font-bold text-sm hover:border-[#82ffc8]/50 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Nav tabs ─────────────────────────────────────────────────────────────
  const navItems: { id: AdminSection; label: string; icon: typeof BookOpen }[] = [
    { id: "resources", label: "Resources",  icon: BookOpen },
    { id: "timetable", label: "Timetable",  icon: Clock },
    { id: "subjects",  label: "Subjects",   icon: Users },
  ];

  // ── Admin layout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060e20] text-[#dae2fd]">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0b1326] border-b border-[#1f2d3d] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg text-[#bacbbf] hover:text-white hover:bg-[#1f2d3d] transition-all cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#82ffc8]/10 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-[#82ffc8]" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white leading-none">Admin Panel</h1>
              <p className="text-[9px] text-[#4a5568] font-mono">DTU Hub Control Center</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#4a5568] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#82ffc8] animate-pulse" />
          {user.email}
        </div>
      </header>

      {/* Section Tabs */}
      <div className="bg-[#0b1326] border-b border-[#1f2d3d] px-4 sm:px-6">
        <nav className="flex gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-[#82ffc8] text-[#82ffc8]"
                    : "border-transparent text-[#bacbbf] hover:text-white hover:border-[#2d3449]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {section === "resources" && <ResourcesManager />}
        {section === "timetable" && <TimetableManager />}
        {section === "subjects"  && <SubjectsManager />}
      </main>
    </div>
  );
}
