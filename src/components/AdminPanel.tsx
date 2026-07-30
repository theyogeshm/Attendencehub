/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin Panel — restricted to authorized admin accounts
 * Route: /admin (registered outside the main app shell)
 */

import React, { useState, useEffect, useCallback } from "react";
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
interface TimetableRow {
  id?: string;
  semester: number;
  section: string;
  day: string;
  time_slot: string;
  subject_name: string;
  subject_code?: string;
  type: string;
  teacher_name?: string;
  room?: string;
  group_name?: string;
  created_at?: string;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const TYPES = ["Theory Lecture", "Lab Session", "Tutorial"] as const;
const PRESET_SECTIONS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"];
const PRESET_SLOTS = ["8-9", "9-10", "10-11", "10-12", "11-12", "12-1", "1-2", "2-3", "2-4", "3-4", "4-5"];
const PRESET_CODES = [
  "CS201", "CS203", "CS205", "CS207", "CS209",
  "CS301", "CS303", "CS305", "CS309", "CS311", "CS313", "CS315",
  "DA201", "DA203", "DA205", "DA207", "DA209", "HU301"
];

const KNOWN_SUBJECT_MAP: Record<string, string> = {
  "Digital Logic Design": "CS201",
  "Object Oriented Design": "CS203",
  "Design & Analysis of Algorithm": "CS205",
  "Operating System Design": "CS207",
  "Software Engineering": "CS209",
  "Compiler Design": "CS301",
  "Machine Learning": "CS303",
  "Information and Network Security": "CS305",
  "Distributed Systems": "CS309",
  "Information Theory and Coding": "CS311",
  "Quantum Computing": "CS313",
  "Advance Data Structure": "CS315",
  "Foundation to Data Science": "DA203",
  "Linear Algebra": "DA205",
  "Computer Organization & OS Design": "DA209",
  "Humanities Elective": "HU301",
};

function TimetableManager({ isDarkMode }: { isDarkMode: boolean }) {
  const { toast, show } = useToast();

  // Form Fields State
  const [semester,       setSemester]       = useState<number>(3);
  const [sectionSelect,  setSectionSelect]  = useState<string>("A3");
  const [customSection,  setCustomSection]  = useState<string>("");
  const [day,            setDay]            = useState<string>("Monday");
  const [slotSelect,     setSlotSelect]     = useState<string>("9-10");
  const [customSlot,     setCustomSlot]     = useState<string>("");

  const [subjectSelect,  setSubjectSelect]  = useState<string>("");
  const [customSubject,  setCustomSubject]  = useState<string>("");

  const [codeSelect,     setCodeSelect]     = useState<string>("");
  const [customCode,     setCustomCode]     = useState<string>("");

  const [type,           setType]           = useState<string>("Theory Lecture");
  const [teacherName,    setTeacherName]    = useState<string>("");
  const [room,           setRoom]           = useState<string>("");
  const [group,          setGroup]          = useState<string>("");

  const [saving, setSaving] = useState(false);

  // Database lists for populating options
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [dbCodes,    setDbCodes]    = useState<string[]>([]);
  const [dbSections, setDbSections] = useState<string[]>([]);

  // Table Filter State
  const [filterSem, setFilterSem] = useState<number | "All">(3);
  const [filterSec, setFilterSec] = useState<string>("A3");

  // Timetable Entries List
  const [entries,    setEntries]    = useState<TimetableRow[]>([]);
  const [loading,    setLoading]    = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit mode state — holds the row currently being edited
  const [editingEntry, setEditingEntry] = useState<TimetableRow | null>(null);
  const [schemaWarning, setSchemaWarning] = useState<string | null>(null);

  // Load fed subject list from database
  useEffect(() => {
    async function loadDbMasterData() {
      const { data: subData } = await supabase.from("subject_list").select("name, sem");
      if (subData) {
        const names = subData.map((r: any) => r.name).filter(Boolean);
        setDbSubjects(Array.from(new Set(names)));
      }
      const { data: ttData } = await supabase.from("timetable").select("section, subject_name, subject_code");
      if (ttData) {
        const secs = ttData.map((r: any) => r.section).filter(Boolean);
        const subs = ttData.map((r: any) => r.subject_name).filter(Boolean);
        const codes = ttData.map((r: any) => r.subject_code).filter(Boolean);
        setDbSections(Array.from(new Set(secs)));
        setDbSubjects(prev => Array.from(new Set([...prev, ...subs])));
        setDbCodes(Array.from(new Set(codes)));
      }
    }
    loadDbMasterData();
  }, []);

  // Compute available sections list
  const availableSections = Array.from(new Set([...PRESET_SECTIONS, ...dbSections])).sort();

  // Compute available subjects list for selected semester
  const availableSubjects = (() => {
    const fromJson = dtuData?.branches?.[0]?.semesters?.find((s: any) => s.sem === semester)?.subjects || [];
    const fromMap = Object.keys(KNOWN_SUBJECT_MAP);
    const combined = [...fromJson, ...dbSubjects, ...fromMap];
    // Clean up subject names (remove - Theory / - Lab for clean selection)
    const cleaned = combined.map(s => s.replace(/ - (Theory|Lab|Tutorial)$/i, "").trim());
    return Array.from(new Set(cleaned)).filter(Boolean).sort();
  })();

  // Compute available codes list
  const availableCodes = Array.from(new Set([...PRESET_CODES, ...dbCodes, ...Object.values(KNOWN_SUBJECT_MAP)])).filter(Boolean).sort();

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("timetable").select("*");

    if (filterSem !== "All") {
      query = query.eq("semester", filterSem);
    }
    if (filterSec.trim()) {
      query = query.eq("section", filterSec.trim().toUpperCase());
    }

    const { data, error } = await query.order("semester", { ascending: true }).order("day", { ascending: true });

    if (!error && data) {
      const mapped: TimetableRow[] = data.map((r: any) => ({
        id: r.id,
        semester: Number(r.semester ?? 3),
        section: r.section ?? "",
        day: r.day ?? "Monday",
        time_slot: r.time_slot ?? "",
        subject_name: r.subject_name ?? r.subject ?? "",
        subject_code: r.subject_code ?? r.code ?? "",
        type: r.type ?? "Theory Lecture",
        teacher_name: r.teacher_name ?? r.faculty ?? "",
        room: r.room ?? "",
        group_name: r.group_name ?? r.group ?? "",
        created_at: r.created_at,
      }));
      setEntries(mapped);
    } else {
      setEntries([]);
    }
    setLoading(false);
  }, [filterSem, filterSec]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  // Handle subject selection -> auto fill subject code
  const handleSelectSubject = (selectedName: string) => {
    setSubjectSelect(selectedName);
    if (selectedName === "__CUSTOM__") {
      return;
    }
    const cleanName = selectedName.replace(/ - (Theory|Lab|Tutorial)$/i, "").trim();
    if (KNOWN_SUBJECT_MAP[cleanName]) {
      setCodeSelect(KNOWN_SUBJECT_MAP[cleanName]);
      setCustomCode("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalSection = (sectionSelect === "__CUSTOM__" ? customSection : sectionSelect).trim().toUpperCase();
    const finalSlot = (slotSelect === "__CUSTOM__" ? customSlot : slotSelect).trim();
    const finalSubject = (subjectSelect === "__CUSTOM__" ? customSubject : subjectSelect).trim();
    const finalCode = (codeSelect === "__CUSTOM__" ? customCode : codeSelect).trim();

    if (!finalSubject) {
      show("Please select or enter a subject name.", false);
      return;
    }
    if (!finalSlot) {
      show("Please select or enter a time slot.", false);
      return;
    }
    if (!finalSection) {
      show("Please select or enter a section.", false);
      return;
    }

    setSaving(true);
    setSchemaWarning(null);
    const teacherClean = teacherName.trim() || null;
    const roomClean = room.trim() || null;
    const groupClean = group.trim() || null;

    const payload: Record<string, any> = {
      semester,
      section: finalSection,
      day,
      time_slot: finalSlot,
      subject_name: finalSubject,
      subject_code: finalCode || null,
      type,
      teacher_name: teacherClean,
      room: roomClean,
      group_name: groupClean,
    };

    const strippedCols: string[] = [];

    // Helper to save payload to Supabase
    const executeSave = async (dataPayload: Record<string, any>) => {
      // If editing an existing row by ID, update directly
      if (editingEntry?.id) {
        return await supabase
          .from("timetable")
          .update(dataPayload)
          .eq("id", editingEntry.id);
      }

      // Otherwise upsert / insert by composite key
      const { data: existing } = await supabase
        .from("timetable")
        .select("id")
        .eq("semester", semester)
        .eq("section", finalSection)
        .eq("day", day)
        .eq("time_slot", finalSlot);

      if (existing && existing.length > 0) {
        return await supabase
          .from("timetable")
          .update(dataPayload)
          .eq("id", existing[0].id);
      } else {
        const { error: upsertErr } = await supabase
          .from("timetable")
          .upsert(dataPayload, { onConflict: "semester,section,day,time_slot" });

        if (upsertErr) {
          return await supabase.from("timetable").insert(dataPayload);
        }
        return { error: null };
      }
    };

    let currentPayload = { ...payload };
    let err: any = null;
    let attempts = 0;

    // Retry loop: automatically strips any column missing from user's Supabase schema
    while (attempts < 6) {
      attempts++;
      const result = await executeSave(currentPayload);
      err = result.error;
      if (!err) break; // Success!

      const colMatch = err.message?.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i) ||
                       err.message?.match(/column ['"]?([a-zA-Z0-9_]+)['"]? of relation/i) ||
                       err.message?.match(/column ['"]?([a-zA-Z0-9_]+)['"]? does not exist/i);

      if (colMatch && colMatch[1]) {
        const missingCol = colMatch[1];
        if (currentPayload[missingCol] !== undefined) {
          strippedCols.push(missingCol);
          delete currentPayload[missingCol];
          continue; // Retry without the unsupported column
        }
      }
      break; // Non-column error
    }

    setSaving(false);

    if (err) {
      show("Save failed: " + err.message, false);
    } else {
      const wasEdit = !!editingEntry;
      // Warn if important columns were stripped (not in user's Supabase schema)
      if (strippedCols.length > 0) {
        setSchemaWarning(`⚠️ These columns were missing from your Supabase timetable table and could NOT be saved: ${strippedCols.join(", ")}. Run the SQL fix below to add them.`);
      }
      show(`${wasEdit ? "Updated" : "Saved"} entry: Sem ${semester} ${finalSection} - ${day} ${finalSlot} (${finalSubject}) ✓`);
      handleCancelEdit();
      fetchTimetable();
    }
  };

  const handleDelete = async (r: TimetableRow) => {
    const rowId = r.id || `${r.semester}-${r.section}-${r.day}-${r.time_slot}`;
    setDeletingId(rowId);

    let delErr = null;
    if (r.id) {
      const { error } = await supabase.from("timetable").delete().eq("id", r.id);
      delErr = error;
    } else {
      const { error } = await supabase
        .from("timetable")
        .delete()
        .eq("semester", r.semester)
        .eq("section", r.section)
        .eq("day", r.day)
        .eq("time_slot", r.time_slot);
      delErr = error;
    }

    setDeletingId(null);

    if (delErr) {
      show("Delete failed: " + delErr.message, false);
    } else {
      setEditingEntry(null);
      show(`Deleted timetable entry (${r.day} ${r.time_slot}) ✓`);
      fetchTimetable();
    }
  };

  // Populate the form with an existing row for editing
  const handleStartEdit = (r: TimetableRow) => {
    setEditingEntry(r);
    setSemester(r.semester);

    // Section
    if (PRESET_SECTIONS.includes(r.section)) {
      setSectionSelect(r.section);
      setCustomSection("");
    } else {
      setSectionSelect("__CUSTOM__");
      setCustomSection(r.section);
    }

    // Day
    setDay(r.day);

    // Time Slot
    if (PRESET_SLOTS.includes(r.time_slot)) {
      setSlotSelect(r.time_slot);
      setCustomSlot("");
    } else {
      setSlotSelect("__CUSTOM__");
      setCustomSlot(r.time_slot);
    }

    // Subject
    const subName = r.subject_name || "";
    const cleanSub = subName.replace(/ - (Theory|Lab|Tutorial)$/i, "").trim();
    setSubjectSelect(cleanSub);
    setCustomSubject(cleanSub);

    // Code
    if (r.subject_code && PRESET_CODES.includes(r.subject_code)) {
      setCodeSelect(r.subject_code);
      setCustomCode("");
    } else if (r.subject_code) {
      setCodeSelect("__CUSTOM__");
      setCustomCode(r.subject_code);
    } else {
      setCodeSelect("");
      setCustomCode("");
    }

    setType(r.type || "Theory Lecture");
    setTeacherName(r.teacher_name || "");
    setRoom(r.room || "");
    setGroup(r.group_name || "");

    // Scroll to top of form
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setSemester(3);
    setSectionSelect("A3");
    setCustomSection("");
    setDay("Monday");
    setSlotSelect("9-10");
    setCustomSlot("");
    setSubjectSelect("");
    setCustomSubject("");
    setCodeSelect("");
    setCustomCode("");
    setType("Theory Lecture");
    setTeacherName("");
    setRoom("");
    setGroup("");
  };

  const INP = getInpStyle(isDarkMode);
  const SEL = getSelStyle(isDarkMode);
  const BTN_PRIMARY = getBtnPrimary(isDarkMode);
  const BTN_SECONDARY = getBtnSecondary(isDarkMode);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold ${toast.ok ? "bg-green-900/40 border border-green-500/40 text-green-300" : "bg-red-900/40 border border-red-500/40 text-red-300"}`}>
          {toast.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Schema Warning Banner ── */}
      {schemaWarning && (
        <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-semibold space-y-2">
          <p>{schemaWarning}</p>
          <details>
            <summary className="cursor-pointer font-bold underline">▶ Show SQL fix to add missing columns</summary>
            <pre className="mt-2 p-3 rounded bg-black/40 text-[11px] text-green-300 overflow-x-auto whitespace-pre-wrap">{`ALTER TABLE public.timetable\n  ADD COLUMN IF NOT EXISTS teacher_name TEXT,\n  ADD COLUMN IF NOT EXISTS room TEXT,\n  ADD COLUMN IF NOT EXISTS subject_code TEXT,\n  ADD COLUMN IF NOT EXISTS group_name TEXT,\n  ADD COLUMN IF NOT EXISTS type TEXT;\nNOTIFY pgrst, 'reload schema';`}</pre>
          </details>
        </div>
      )}

      {/* ── Form Card ── */}
      <div className={getCardStyle(isDarkMode)}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkMode ? "text-[#82ffc8]" : "text-emerald-600"}`}>
            {editingEntry ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingEntry ? `Editing Entry: ${editingEntry.day} ${editingEntry.time_slot} — ${editingEntry.subject_name}` : "Add / Update Timetable Entry"}
          </h3>
          {editingEntry && (
            <button type="button" onClick={handleCancelEdit} className={getBtnSecondary(isDarkMode)}>
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Semester */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Semester *</label>
              <select value={semester} onChange={e => setSemester(Number(e.target.value))} className={SEL}>
                {SEMESTERS.map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {/* Section (Dropdown + Custom) */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Section *</label>
              <select value={sectionSelect} onChange={e => setSectionSelect(e.target.value)} className={SEL}>
                {availableSections.map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
                <option value="__CUSTOM__">+ Other (Type Custom Section...)</option>
              </select>
              {sectionSelect === "__CUSTOM__" && (
                <input
                  type="text"
                  value={customSection}
                  onChange={e => setCustomSection(e.target.value)}
                  placeholder="e.g. C1 or ECE-1"
                  className={`${INP} mt-2`}
                />
              )}
            </div>

            {/* Day */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Day *</label>
              <select value={day} onChange={e => setDay(e.target.value)} className={SEL}>
                {WEEKDAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Time Slot (Dropdown + Custom) */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Time Slot *</label>
              <select value={slotSelect} onChange={e => setSlotSelect(e.target.value)} className={SEL}>
                {PRESET_SLOTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__CUSTOM__">+ Other (Type Custom Slot...)</option>
              </select>
              {slotSelect === "__CUSTOM__" && (
                <input
                  type="text"
                  value={customSlot}
                  onChange={e => setCustomSlot(e.target.value)}
                  placeholder="e.g. 9:30-10:30"
                  className={`${INP} mt-2`}
                />
              )}
            </div>

            {/* Subject Name (Dropdown + Custom) */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Subject Name *</label>
              <select value={subjectSelect} onChange={e => handleSelectSubject(e.target.value)} className={SEL}>
                <option value="">— Select Subject —</option>
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
                <option value="__CUSTOM__">+ Other (Type Custom Subject...)</option>
              </select>
              {subjectSelect === "__CUSTOM__" && (
                <input
                  type="text"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Type custom subject name..."
                  className={`${INP} mt-2`}
                />
              )}
            </div>

            {/* Subject Code (Dropdown + Custom) */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Subject Code</label>
              <select value={codeSelect} onChange={e => setCodeSelect(e.target.value)} className={SEL}>
                <option value="">— Select Subject Code —</option>
                {availableCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
                <option value="__CUSTOM__">+ Other (Type Custom Code...)</option>
              </select>
              {codeSelect === "__CUSTOM__" && (
                <input
                  type="text"
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  placeholder="e.g. CS207"
                  className={`${INP} mt-2`}
                />
              )}
            </div>

            {/* Type */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Type *</label>
              <select value={type} onChange={e => setType(e.target.value)} className={SEL}>
                {TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Teacher Name */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Teacher Name</label>
              <input
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                placeholder="e.g. Dr. Gunjan Chugh"
                className={INP}
              />
            </div>

            {/* Room */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Room</label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. AB4-303"
                className={INP}
              />
            </div>

            {/* Group */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>Group (Optional)</label>
              <input
                type="text"
                value={group}
                onChange={e => setGroup(e.target.value)}
                placeholder="e.g. G1, G2"
                className={INP}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button type="submit" disabled={saving} className={BTN_PRIMARY}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingEntry ? "Save Changes" : "Save Timetable Entry"}
            </button>
            {editingEntry && (
              <button type="button" onClick={handleCancelEdit} className={getBtnSecondary(isDarkMode)}>
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table Container ── */}
      <div className={getCardStyle(isDarkMode)}>
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200/20 flex-wrap">
          <h3 className={`text-sm font-bold ${isDarkMode ? "text-[#dae2fd]" : "text-slate-900"}`}>
            Timetable Entries ({entries.length})
          </h3>
          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={filterSem}
              onChange={e => setFilterSem(e.target.value === "All" ? "All" : Number(e.target.value))}
              className={`${SEL} w-32`}
            >
              <option value="All">All Sems</option>
              {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <input
              type="text"
              value={filterSec}
              onChange={e => setFilterSec(e.target.value)}
              placeholder="Section e.g. A3"
              className={`${INP} w-32`}
            />
            <button onClick={fetchTimetable} className={BTN_SECONDARY}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`flex items-center justify-center py-12 ${isDarkMode ? "text-[#bacbbf]" : "text-slate-500"}`}>
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading timetable...
          </div>
        ) : entries.length === 0 ? (
          <div className={`text-center py-12 text-sm ${isDarkMode ? "text-[#4a5568]" : "text-slate-400"}`}>
            No timetable entries found for Semester {filterSem} Section "{filterSec}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className={isDarkMode ? "bg-[#0d1525]" : "bg-slate-100 border-b border-slate-200"}>
                <tr>
                  {["Sem", "Sec", "Day", "Time Slot", "Subject Name", "Code", "Type", "Teacher", "Room", "Group", ""].map(h => (
                    <th key={h} className={`text-left px-3 py-3 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? "text-[#bacbbf]" : "text-slate-700"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((r, i) => {
                  const rowKey = r.id || `${r.semester}-${r.section}-${r.day}-${r.time_slot}`;
                  return (
                    <tr key={rowKey} className={`border-t ${isDarkMode ? "border-[#1f2d3d] hover:bg-[#0d1525]/50" : "border-slate-200 hover:bg-slate-50 text-slate-800"} ${i % 2 === 0 ? "" : (isDarkMode ? "bg-[#0d1525]/20" : "bg-slate-50/40")}`}>
                      <td className={`px-3 py-3 font-semibold ${isDarkMode ? "text-[#dae2fd]" : "text-slate-900"}`}>{r.semester}</td>
                      <td className={`px-3 py-3 font-bold ${isDarkMode ? "text-[#82ffc8]" : "text-emerald-700"}`}>{r.section}</td>
                      <td className={`px-3 py-3 font-medium ${isDarkMode ? "text-[#bacbbf]" : "text-slate-700"}`}>{r.day}</td>
                      <td className={`px-3 py-3 font-mono font-semibold ${isDarkMode ? "text-[#dae2fd]" : "text-slate-800"}`}>{r.time_slot}</td>
                      <td className={`px-3 py-3 font-bold max-w-[160px] truncate ${isDarkMode ? "text-[#dae2fd]" : "text-slate-900"}`}>{r.subject_name}</td>
                      <td className={`px-3 py-3 font-mono text-[11px] ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>{r.subject_code ?? "—"}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          r.type.toLowerCase().includes("lab") ? (isDarkMode ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 text-purple-700")
                          : r.type.toLowerCase().includes("tut") ? (isDarkMode ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700")
                          : (isDarkMode ? "bg-[#82ffc8]/10 text-[#82ffc8]" : "bg-emerald-100 text-emerald-700")
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className={`px-3 py-3 max-w-[140px] truncate ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>{r.teacher_name ?? "—"}</td>
                      <td className={`px-3 py-3 font-mono text-[11px] ${isDarkMode ? "text-[#bacbbf]" : "text-slate-600"}`}>{r.room ?? "—"}</td>
                      <td className={`px-3 py-3 font-mono font-bold text-[11px] ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>{r.group_name ?? "—"}</td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(r)}
                            className={getBtnSecondary(isDarkMode)}
                            title="Edit this entry"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            disabled={deletingId === rowKey}
                            className={getBtnDanger()}
                            title="Delete timetable entry"
                          >
                            {deletingId === rowKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
