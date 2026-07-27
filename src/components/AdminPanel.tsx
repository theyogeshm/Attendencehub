/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin Panel — restricted to authorized admin accounts
 * Route: /admin (registered outside the main app shell)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { isAdminEmail, sanitizeText, sanitizeUrl } from "../lib/security";
import type { DbResource } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import dtuData from "../../dtu_subjects.json";
import {
  ShieldAlert,
  Loader2,
  Trash2,
  Plus,
  Save,
  RefreshCw,
  BookOpen,
  Clock,
  Users,
  ArrowLeft,
  Check,
  X,
  Sun,
  Moon,
  Pencil,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────────
const RESOURCE_TABLE_NAMES = ["resources", "subject_resources", "study_resources"];

const SETUP_SQL = `-- Run this in Supabase SQL Editor to create the resources table:
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  semester TEXT,
  tab_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  year TEXT,
  file_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for access
DROP POLICY IF EXISTS "Allow public read access" ON public.resources;
CREATE POLICY "Allow public read access" ON public.resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert" ON public.resources;
CREATE POLICY "Allow public insert" ON public.resources FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON public.resources;
CREATE POLICY "Allow public update" ON public.resources FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete" ON public.resources;
CREATE POLICY "Allow public delete" ON public.resources FOR DELETE USING (true);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
`;

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS  = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
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

type AdminSection = "resources" | "timetable" | "subjects";

// ── Toast helper ──────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const show = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

// ── Shared input & button style helpers ─────────────────────────────────────────
function getInpStyle(isDark: boolean) {
  return isDark
    ? "w-full bg-[#0d1525] border border-[#2d3449] rounded-lg px-3 py-2 text-sm text-[#dae2fd] placeholder-[#4a5568] focus:border-[#82ffc8] focus:outline-none transition-colors"
    : "w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none transition-colors";
}
function getSelStyle(isDark: boolean) {
  return `${getInpStyle(isDark)} cursor-pointer`;
}
function getBtnPrimary(isDark: boolean) {
  return isDark
    ? "flex items-center gap-2 px-4 py-2 bg-[#82ffc8] text-[#002114] rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm"
    : "flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-sm";
}
function getBtnDanger() {
  return "flex items-center gap-2 px-3 py-1.5 border border-red-500/40 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-all cursor-pointer";
}
function getBtnSecondary(isDark: boolean) {
  return isDark
    ? "flex items-center gap-2 px-4 py-2 border border-[#2d3449] text-[#bacbbf] rounded-lg font-bold text-sm hover:border-[#82ffc8]/50 hover:text-[#dae2fd] transition-all cursor-pointer"
    : "flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-lg font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer shadow-sm";
}
function getCardStyle(isDark: boolean) {
  return isDark
    ? "bg-[#111827] border border-[#1f2d3d] rounded-xl overflow-hidden p-5"
    : "bg-white border border-slate-200 shadow-md shadow-slate-200/50 rounded-xl overflow-hidden p-5";
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1: Resources Manager
// ══════════════════════════════════════════════════════════════════════════════
function ResourcesManager({ isDarkMode }: { isDarkMode: boolean }) {
  const { toast, show } = useToast();

  // Form state
  const [semester,       setSemester]       = useState<string>("");
  const [subjectSelect,  setSubjectSelect]  = useState<string>("");
  const [customSubject,  setCustomSubject]  = useState<string>("");
  const [tabSelect,      setTabSelect]      = useState<string>("");
  const [customTab,      setCustomTab]      = useState<string>("");
  const [fileName,       setFileName]       = useState("");
  const [fileUrl,        setFileUrl]        = useState("");
  const [year,           setYear]           = useState("");
  const [fileSize,       setFileSize]       = useState("");
  const [adding,         setAdding]         = useState(false);
  const [editingResource, setEditingResource] = useState<DbResource | null>(null);

  // Filter subject options based on selected semester
  const availableSubjects = (() => {
    const semNum = parseInt(semester, 10);
    if (!isNaN(semNum) && dtuData?.branches?.[0]?.semesters) {
      const found = dtuData.branches[0].semesters.find((s: any) => s.sem === semNum);
      if (found?.subjects?.length) return found.subjects;
    }
    // Fallback: all subjects across all semesters in dtuData
    const all = dtuData?.branches?.[0]?.semesters?.flatMap((s: any) => s.subjects || []) || [];
    return Array.from(new Set(all));
  })();

  // Table state
  const [resources, setResources] = useState<DbResource[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dbError,   setDbError]   = useState<string | null>(null);

  // Existing tab types derived from database resources + default presets
  const availableTabs = (() => {
    const defaultPresets = ["PYQ", "Notes", "Lab", "Handwritten Notes", "Video Lectures", "Syllabus"];
    const dbTabs = resources.map(r => r.tab_type).filter(Boolean);
    const combined = [...defaultPresets, ...dbTabs];
    return Array.from(new Set(combined));
  })();

  // Filter — free-text search across subject + file name + tab_type
  const [filterQ, setFilterQ] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    let lastErr: any = null;

    for (const tableName of RESOURCE_TABLE_NAMES) {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setResources(data as DbResource[]);
        setLoading(false);
        return;
      }
      lastErr = error;
    }

    if (lastErr) {
      setDbError(lastErr.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async () => {
    const finalSubject = subjectSelect === "__CUSTOM__" ? customSubject.trim() : subjectSelect.trim();
    const finalTabType = tabSelect === "__CUSTOM__" ? customTab.trim() : tabSelect.trim();
    if (!finalSubject || !fileName.trim() || !fileUrl.trim() || !finalTabType) {
      show("Subject, Tab Type, File Name and URL are required", false);
      return;
    }
    // Validate URL scheme — block javascript:, data:, etc.
    const safeUrl = sanitizeUrl(fileUrl.trim());
    if (!safeUrl) {
      show("File URL must start with https:// or http://", false);
      return;
    }

    setAdding(true);
    setDbError(null);

    const payload = {
      subject:   sanitizeText(finalSubject, 200),
      semester:  semester || null,
      tab_type:  sanitizeText(finalTabType, 100),
      file_name: sanitizeText(fileName.trim(), 300),
      file_url:  safeUrl,
      year:      sanitizeText(year.trim(), 100) || null,
      file_size: sanitizeText(fileSize.trim(), 50) || null,
    };

    let inserted = false;
    let lastError: any = null;

    for (const tableName of RESOURCE_TABLE_NAMES) {
      const { error } = await supabase.from(tableName).insert(payload);
      if (!error) {
        inserted = true;
        break;
      }
      lastError = error;
    }

    setAdding(false);

    if (!inserted && lastError) {
      const isSchemaErr = lastError.message.includes("schema cache") || lastError.message.includes("does not exist");
      setDbError(lastError.message);
      if (isSchemaErr) {
        show("Database table missing in Supabase. Please click 'Copy Setup SQL Script' below and run it in Supabase SQL Editor.", false);
      } else {
        show("Insert failed: " + lastError.message, false);
      }
      return;
    }

    show("Resource added ✓");
    // Preserve Semester, Subject, Tab, and Sub-heading for rapid multi-file uploads
    setFileName("");
    setFileUrl("");
    fetchAll();
  };

  const handleStartEdit = (r: DbResource) => {
    setEditingResource(r);
    setSemester(r.semester || "");
    if (availableSubjects.includes(r.subject)) {
      setSubjectSelect(r.subject);
      setCustomSubject("");
    } else {
      setSubjectSelect("__CUSTOM__");
      setCustomSubject(r.subject);
    }
    if (availableTabs.includes(r.tab_type)) {
      setTabSelect(r.tab_type);
      setCustomTab("");
    } else {
      setTabSelect("__CUSTOM__");
      setCustomTab(r.tab_type);
    }
    setFileName(r.file_name);
    setFileUrl(r.file_url);
    setYear(r.year || "");
    setFileSize(r.file_size || "");
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
    handleResetForm();
  };

  const handleResetForm = () => {
    setSemester("");
    setSubjectSelect("");
    setCustomSubject("");
    setTabSelect("");
    setCustomTab("");
    setFileName("");
    setFileUrl("");
    setYear("");
    setFileSize("");
  };

  const handleUpdate = async () => {
    if (!editingResource) return;
    const finalSubject = subjectSelect === "__CUSTOM__" ? customSubject.trim() : subjectSelect.trim();
    const finalTabType = tabSelect === "__CUSTOM__" ? customTab.trim() : tabSelect.trim();
    if (!finalSubject || !fileName.trim() || !fileUrl.trim() || !finalTabType) {
      show("Subject, Tab Type, File Name and URL are required", false);
      return;
    }
    const safeUrl = sanitizeUrl(fileUrl.trim());
    if (!safeUrl) {
      show("File URL must start with https:// or http://", false);
      return;
    }

    setAdding(true);
    setDbError(null);

    const payload = {
      subject:   sanitizeText(finalSubject, 200),
      semester:  semester || null,
      tab_type:  sanitizeText(finalTabType, 100),
      file_name: sanitizeText(fileName.trim(), 300),
      file_url:  safeUrl,
      year:      sanitizeText(year.trim(), 100) || null,
      file_size: sanitizeText(fileSize.trim(), 50) || null,
    };

    let updated = false;
    let lastError: any = null;

    for (const tableName of RESOURCE_TABLE_NAMES) {
      // 1. Try direct UPDATE statement with .select() to verify rows updated
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq("id", editingResource.id)
        .select();

      if (!error && data && data.length > 0) {
        updated = true;
        break;
      }

      // 2. Fallback: if UPDATE affected 0 rows (e.g. Supabase RLS UPDATE policy missing), replace row via delete + insert
      if (!error && (!data || data.length === 0)) {
        const { error: delErr } = await supabase.from(tableName).delete().eq("id", editingResource.id);
        if (!delErr) {
          const { error: insErr } = await supabase.from(tableName).insert(payload);
          if (!insErr) {
            updated = true;
            break;
          }
          lastError = insErr;
        } else {
          lastError = delErr;
        }
      } else {
        lastError = error;
      }
    }

    setAdding(false);

    if (!updated) {
      show("Update failed: " + (lastError?.message || "Could not update resource"), false);
      return;
    }

    show("Resource updated ✓");
    handleCancelEdit();
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    let deleted = false;
    let lastErr: any = null;

    for (const tableName of RESOURCE_TABLE_NAMES) {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (!error) {
        deleted = true;
        break;
      }
      lastErr = error;
    }

    setDeletingId(null);
    if (!deleted && lastErr) {
      show("Delete failed: " + lastErr.message, false);
      return;
    }

    setResources(prev => prev.filter(r => r.id !== id));
    show("Resource deleted ✓");
  };

  const filtered = resources.filter(r => {
    if (!filterQ) return true;
    const q = filterQ.toLowerCase();
    return (
      r.subject.toLowerCase().includes(q) ||
      r.file_name.toLowerCase().includes(q) ||
      r.tab_type.toLowerCase().includes(q)
    );
  });

  const INP = getInpStyle(isDarkMode);
  const SEL = getSelStyle(isDarkMode);
  const BTN_PRIMARY = getBtnPrimary(isDarkMode);
  const BTN_SECONDARY = getBtnSecondary(isDarkMode);

  const [showSqlGuide, setShowSqlGuide] = useState(false);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${toast.ok ? "bg-green-900/40 border border-green-500/40 text-green-300" : "bg-red-900/40 border border-red-500/40 text-red-300"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Always-Visible or Triggered Supabase Setup Warning Banner ── */}
      {(dbError || resources.length === 0) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5 font-bold text-sm text-amber-400">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>Supabase Database Table Setup Guide</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="px-3 py-1.5 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-lg hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                {showSqlGuide ? "Hide SQL Code" : "View SQL Code"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SETUP_SQL);
                  show("SQL script copied! Paste into Supabase -> SQL Editor and click Run.");
                }}
                className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors cursor-pointer shadow-sm"
              >
                📋 Copy Setup SQL Script
              </button>
            </div>
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed">
            If uploads fail with <code className="bg-amber-950/80 px-1.5 py-0.5 rounded text-amber-300 font-mono">schema cache</code> errors, your Supabase project needs the <code className="bg-amber-950/80 px-1.5 py-0.5 rounded text-amber-300 font-mono">public.resources</code> table created. Click <strong>Copy Setup SQL Script</strong>, open <strong>Supabase Dashboard → SQL Editor</strong>, paste the script and click <strong>Run</strong>.
          </p>

          {showSqlGuide && (
            <div className="mt-3 p-3 bg-[#060e20] border border-amber-500/30 rounded-xl overflow-x-auto">
              <pre className="text-[11px] font-mono text-amber-200 leading-normal whitespace-pre">
                {SETUP_SQL}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Form Card ── */}
      <div className={getCardStyle(isDarkMode)}>
        <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-200/20">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? "text-[#82ffc8]" : "text-emerald-600"}`}>
            {editingResource ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingResource ? `Edit Resource: ${editingResource.file_name}` : "Add New Resource"}
          </h3>
          {editingResource && (
            <button onClick={handleCancelEdit} className="text-xs font-bold text-slate-400 hover:text-red-400 cursor-pointer">
              ✕ Cancel Editing
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Semester</label>
            <select
              value={semester}
              onChange={e => {
                setSemester(e.target.value);
                setSubjectSelect("");
                setCustomSubject("");
              }}
              className={SEL}
            >
              <option value="">— Any / All Semesters —</option>
              {SEMESTERS.map(s => (
                <option key={s} value={`${s}${s===1?"st":s===2?"nd":s===3?"rd":"th"} Semester`}>
                  {s}{s===1?"st":s===2?"nd":s===3?"rd":"th"} Sem
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Subject *</label>
            <select
              value={subjectSelect}
              onChange={e => setSubjectSelect(e.target.value)}
              className={SEL}
            >
              <option value="">— Select Subject —</option>
              {availableSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="__CUSTOM__">+ Other (Type Elective / Custom Subject)</option>
            </select>

            {subjectSelect === "__CUSTOM__" && (
              <input
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                placeholder="Type custom or elective subject name..."
                className={`${INP} mt-2`}
              />
            )}
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Tab / Section *</label>
            <select
              value={tabSelect}
              onChange={e => setTabSelect(e.target.value)}
              className={SEL}
            >
              <option value="">— Select Tab / Section —</option>
              {availableTabs.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value="__CUSTOM__">+ Other (Create new section...)</option>
            </select>

            {tabSelect === "__CUSTOM__" && (
              <input
                value={customTab}
                onChange={e => setCustomTab(e.target.value)}
                placeholder="Type new section name (e.g. Mid-Term Papers)..."
                className={`${INP} mt-2`}
              />
            )}
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>File Name *</label>
            <input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="2023 End-Term Paper.pdf" className={INP} />
          </div>
          <div className="lg:col-span-2">
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>File URL * (Drive / YouTube / Direct)</label>
            <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..." className={INP} />
            <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1 font-medium">
              <span>💡</span>
              <span><strong>Google Drive Tip:</strong> Set file sharing to <u>"Anyone with the link" (Viewer)</u> in Google Drive so students can open it without requesting access!</span>
            </p>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Sub-Heading / Group (e.g. Assignment 1, Unit 1, 2026)</label>
            <input value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. Assignment 1, Unit 1, 2026" className={INP} />
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>File Size (optional)</label>
            <input value={fileSize} onChange={e => setFileSize(e.target.value)} placeholder="1.4 MB" className={INP} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          {editingResource ? (
            <>
              <button onClick={handleUpdate} disabled={adding} className={BTN_PRIMARY}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button onClick={handleCancelEdit} className={BTN_SECONDARY}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={handleAdd} disabled={adding} className={BTN_PRIMARY}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Resource
              </button>
              <button onClick={handleResetForm} className={BTN_SECONDARY} title="Clear form to select a new subject or section">
                Reset Form
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className={getCardStyle(isDarkMode)}>
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/20 flex-wrap">
          <h3 className={`text-sm font-bold ${isDarkMode ? "text-[#dae2fd]" : "text-slate-900"}`}>
            All Resources ({filtered.length})
          </h3>
          <div className="flex gap-2 flex-wrap">
            <input value={filterQ} onChange={e => setFilterQ(e.target.value)} placeholder="Search subject / file..." className={`${INP} w-52`} />
            <button onClick={fetchAll} className={BTN_SECONDARY}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`flex items-center justify-center py-12 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-500"}`}>
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 text-sm ${isDarkMode ? "text-[#4a5568]" : "text-slate-400"}`}>No resources found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className={isDarkMode ? "bg-[#0d1525]" : "bg-slate-100 border-b border-slate-200"}>
                <tr>
                  {["Subject", "Semester", "Tab", "File Name", "Year", "Size", ""].map(h => (
                    <th key={h} className={`text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? "text-[#bacbbf]" : "text-slate-700"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={`border-t ${isDarkMode ? "border-[#1f2d3d] hover:bg-[#0d1525]/50" : "border-slate-200 hover:bg-slate-50 text-slate-800"} ${i % 2 === 0 ? "" : (isDarkMode ? "bg-[#0d1525]/20" : "bg-slate-50/40")}`}>
                    <td className={`px-4 py-3 font-semibold max-w-[150px] truncate ${isDarkMode ? "text-[#dae2fd]" : "text-slate-900"}`}>{r.subject}</td>
                    <td className={`px-4 py-3 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>{r.semester ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${isDarkMode ? "bg-[#82ffc8]/10 text-[#82ffc8]" : "bg-emerald-100 text-emerald-700"}`}>
                        {r.tab_type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 max-w-[200px] truncate ${isDarkMode ? "text-[#dae2fd]" : "text-slate-800"}`}>
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-emerald-600 dark:text-[#82ffc8]">
                        {r.file_name}
                      </a>
                    </td>
                    <td className={`px-4 py-3 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>{r.year ?? "—"}</td>
                    <td className={`px-4 py-3 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>{r.file_size ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStartEdit(r)}
                          className={BTN_SECONDARY}
                          title="Edit resource"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className={getBtnDanger()}
                          title="Delete resource"
                        >
                          {deletingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Delete
                        </button>
                      </div>
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
function TimetableManager({ isDarkMode }: { isDarkMode: boolean }) {
  const { toast, show } = useToast();

  const [semester, setSemester] = useState<number>(3);
  const [section,  setSection]  = useState<string>("1");
  const [grid,     setGrid]     = useState<TimetableGrid>({});
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const emptyGrid = useCallback((): TimetableGrid => {
    const g: TimetableGrid = {};
    DAYS.forEach(d => {
      g[d] = {};
      TIME_SLOTS.forEach(t => { g[d][t] = { subject: "", room: "", type: "" }; });
    });
    return g;
  }, []);

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
    await supabase.from("timetable")
      .delete()
      .eq("semester", semester)
      .eq("section", section);

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

  const INP = getInpStyle(isDarkMode);
  const SEL = getSelStyle(isDarkMode);
  const BTN_PRIMARY = getBtnPrimary(isDarkMode);
  const BTN_SECONDARY = getBtnSecondary(isDarkMode);

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${toast.ok ? "bg-green-900/40 border border-green-500/40 text-green-300" : "bg-red-900/40 border border-red-500/40 text-red-300"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className={getCardStyle(isDarkMode)}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Semester</label>
            <select value={semester} onChange={e => setSemester(Number(e.target.value))} className={`${SEL} w-36`}>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Section</label>
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
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-16 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-500"}`}>
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading timetable...
        </div>
      ) : (
        <div className={getCardStyle(isDarkMode)}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className={isDarkMode ? "bg-[#0d1525]" : "bg-slate-100"}>
                  <th className={`px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider w-36 border-r ${isDarkMode ? "text-[#bacbbf] border-[#1f2d3d]" : "text-slate-700 border-slate-200"}`}>Time Slot</th>
                  {DAYS.map(d => (
                    <th key={d} className={`px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider border-r last:border-r-0 ${isDarkMode ? "text-[#82ffc8] border-[#1f2d3d]" : "text-emerald-700 border-slate-200"}`}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, si) => (
                  <tr key={slot} className={`border-t ${isDarkMode ? "border-[#1f2d3d]" : "border-slate-200"} ${si % 2 === 0 ? (isDarkMode ? "bg-[#0d1525]/30" : "bg-slate-50/50") : ""}`}>
                    <td className={`px-3 py-2 text-[11px] border-r whitespace-nowrap ${isDarkMode ? "text-[#bacbbf] border-[#1f2d3d]" : "text-slate-700 border-slate-200 font-semibold"}`}>{slot}</td>
                    {DAYS.map(day => {
                      const cell = grid[day]?.[slot] ?? { subject: "", room: "", type: "" };
                      return (
                        <td key={day} className={`p-1.5 border-r last:border-r-0 min-w-[130px] ${isDarkMode ? "border-[#1f2d3d]" : "border-slate-200"}`}>
                          <div className="space-y-1">
                            <input
                              value={cell.subject}
                              onChange={e => updateCell(day, slot, "subject", e.target.value)}
                              placeholder="Subject"
                              className={`${INP} py-1 text-xs`}
                            />
                            <div className="flex gap-1">
                              <input
                                value={cell.room}
                                onChange={e => updateCell(day, slot, "room", e.target.value)}
                                placeholder="Room"
                                className={`${INP} py-0.5 text-[10px] w-1/2`}
                              />
                              <select
                                value={cell.type}
                                onChange={e => updateCell(day, slot, "type", e.target.value as any)}
                                className={`${SEL} py-0.5 text-[10px] w-1/2`}
                              >
                                <option value="">LEC</option>
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
function SubjectsManager({ isDarkMode }: { isDarkMode: boolean }) {
  const { toast, show } = useToast();

  const [subjects, setSubjects]       = useState<SubjectEntry[]>([]);
  const [loading,  setLoading]        = useState(true);
  const [newSem,   setNewSem]         = useState(1);
  const [newSub,   setNewSub]         = useState("");
  const [hasTheory, setHasTheory]     = useState(true);
  const [hasLab, setHasLab]           = useState(true);
  const [hasTutorial, setHasTutorial] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("subject_list").select("*").order("sem", { ascending: true });
    if (data && data.length > 0) {
      const grouped: Record<number, string[]> = {};
      data.forEach((r: any) => {
        if (!grouped[r.sem]) grouped[r.sem] = [];
        grouped[r.sem].push(r.name);
      });
      setSubjects(Object.entries(grouped).map(([s, list]) => ({ sem: Number(s), subjects: list })));
    } else {
      setSubjects(SEMESTERS.map(s => ({ sem: s, subjects: [] })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleAdd = async () => {
    if (!newSub.trim()) return;
    const baseName = sanitizeText(newSub.trim(), 100);
    const toInsert: { sem: number; name: string }[] = [];

    if (hasTheory)   toInsert.push({ sem: newSem, name: `${baseName} - Theory` });
    if (hasLab)      toInsert.push({ sem: newSem, name: `${baseName} - Lab` });
    if (hasTutorial) toInsert.push({ sem: newSem, name: `${baseName} - Tutorial` });

    if (toInsert.length === 0) {
      toInsert.push({ sem: newSem, name: baseName });
    }

    const { error } = await supabase.from("subject_list").insert(toInsert);
    if (error) { show("Add failed: " + error.message, false); return; }
    show(`Added "${baseName}" to Sem ${newSem} ✓`);
    setNewSub("");
    fetchSubjects();
  };

  const handleDelete = async (sem: number, name: string) => {
    const { error } = await supabase.from("subject_list").delete().eq("sem", sem).eq("name", name);
    if (error) { show("Delete failed: " + error.message, false); return; }
    show(`Removed "${name}" from Sem ${sem} ✓`);
    fetchSubjects();
  };

  const INP = getInpStyle(isDarkMode);
  const SEL = getSelStyle(isDarkMode);
  const BTN_PRIMARY = getBtnPrimary(isDarkMode);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${toast.ok ? "bg-green-900/40 border border-green-500/40 text-green-300" : "bg-red-900/40 border border-red-500/40 text-red-300"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className={getCardStyle(isDarkMode)}>
        <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDarkMode ? "text-[#82ffc8]" : "text-emerald-600"}`}>
          <Plus className="w-4 h-4" /> Add Subject to Master List
        </h3>
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Semester</label>
              <select value={newSem} onChange={e => setNewSem(Number(e.target.value))} className={`${SEL} w-36`}>
                {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Subject Name</label>
              <input
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                placeholder="e.g. Distributed Systems"
                className={INP}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              />
            </div>
            <button onClick={handleAdd} className={BTN_PRIMARY}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex items-center gap-5 pt-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>
              Component Types:
            </span>
            <label className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTheory}
                onChange={e => setHasTheory(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer w-3.5 h-3.5"
              />
              <span>Theory</span>
            </label>
            <label className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasLab}
                onChange={e => setHasLab(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer w-3.5 h-3.5"
              />
              <span>Lab</span>
            </label>
            <label className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTutorial}
                onChange={e => setHasTutorial(e.target.checked)}
                className="rounded accent-emerald-500 cursor-pointer w-3.5 h-3.5"
              />
              <span>Tutorial</span>
            </label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center py-16 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-500"}`}>
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading subjects...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map(entry => (
            <div key={entry.sem} className={getCardStyle(isDarkMode)}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b ${isDarkMode ? "text-[#82ffc8] border-[#1f2d3d]" : "text-emerald-700 border-slate-200"}`}>
                Semester {entry.sem} ({entry.subjects.length})
              </h4>
              {entry.subjects.length === 0 ? (
                <p className={`text-xs ${isDarkMode ? "text-[#4a5568]" : "text-slate-400"}`}>No subjects added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {entry.subjects.map(s => (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        isDarkMode ? "bg-[#0d1525] border-[#2d3449] text-[#dae2fd]" : "bg-slate-100 border-slate-300 text-slate-800"
                      }`}
                    >
                      {s}
                      <button
                        onClick={() => handleDelete(entry.sem, s)}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
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
// MAIN: AdminPanel Export
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const navigate = useNavigate();

  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<AdminSection>("resources");

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("ATTENDANCE_HUB_THEME");
    return saved !== "light";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("ATTENDANCE_HUB_THEME", next ? "dark" : "light");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-[#060e20]" : "bg-slate-50"}`}>
        <Loader2 className={`w-8 h-8 animate-spin ${isDarkMode ? "text-[#82ffc8]" : "text-emerald-600"}`} />
      </div>
    );
  }

  if (!user || !isAdminEmail(user.email)) {
    return <Navigate to="/404" replace />;
  }

  const navItems: { id: AdminSection; label: string; icon: typeof BookOpen }[] = [
    { id: "resources", label: "Resources",  icon: BookOpen },
    { id: "timetable", label: "Timetable",  icon: Clock },
    { id: "subjects",  label: "Subjects",   icon: Users },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? "bg-[#060e20] text-[#dae2fd]" : "bg-[#f8fafc] text-slate-900"
    }`}>

      {/* Header */}
      <header className={`sticky top-0 z-20 px-4 sm:px-6 h-14 flex items-center justify-between gap-4 border-b transition-colors ${
        isDarkMode ? "bg-[#0b1326] border-[#1f2d3d] text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isDarkMode ? "text-[#bacbbf] hover:text-white hover:bg-[#1f2d3d]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDarkMode ? "bg-[#82ffc8]/10 text-[#82ffc8]" : "bg-emerald-100 text-emerald-600"
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black leading-none">Admin Panel</h1>
              <p className={`text-[9px] ${isDarkMode ? "text-[#4a5568]" : "text-slate-500"}`}>DTU Hub Control Center</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sun / Moon Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? "text-[#bacbbf] hover:text-white hover:bg-[#1f2d3d]" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className={`flex items-center gap-2 text-xs font-semibold ${
            isDarkMode ? "text-[#bacbbf]" : "text-slate-600"
          }`}>
            <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
            Admin
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className={`border-b px-4 sm:px-6 transition-colors ${
        isDarkMode ? "bg-[#0b1326] border-[#1f2d3d]" : "bg-white border-slate-200"
      }`}>
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
                    ? isDarkMode ? "border-[#82ffc8] text-[#82ffc8]" : "border-emerald-600 text-emerald-600 font-bold"
                    : isDarkMode ? "border-transparent text-[#bacbbf] hover:text-white hover:border-[#2d3449]" : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
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
        {section === "resources" && <ResourcesManager isDarkMode={isDarkMode} />}
        {section === "timetable" && <TimetableManager isDarkMode={isDarkMode} />}
        {section === "subjects"  && <SubjectsManager isDarkMode={isDarkMode} />}
      </main>
    </div>
  );
}
