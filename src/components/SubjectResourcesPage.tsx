/**
 * SubjectResourcesPage
 * Route: /resources/:subjectName
 *
 * Full inner page for a subject's resources.
 * Tabs are built purely from whatever tab_type values exist in Supabase —
 * no hardcoded list. PYQ tabs (name contains "pyq") are year-grouped.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, FolderOpen, Loader2, FileText } from "lucide-react";
import { Subject } from "../types";
import { supabase } from "../lib/supabase";
import type { DbResource } from "../lib/supabase";

// ── Dynamic color palette — assigned to tabs in appearance order ──────────────
const TAB_PALETTE = [
  { accent: "text-[#82ffc8]", bg: "bg-[#82ffc8]/10" },
  { accent: "text-[#7bd0ff]", bg: "bg-[#7bd0ff]/10" },
  { accent: "text-[#ffd580]", bg: "bg-[#ffd580]/10" },
  { accent: "text-[#c4aaff]", bg: "bg-[#c4aaff]/10" },
  { accent: "text-[#ff9580]", bg: "bg-[#ff9580]/10" },
  { accent: "text-[#ff80ab]", bg: "bg-[#ff80ab]/10" },
  { accent: "text-[#80ffea]", bg: "bg-[#80ffea]/10" },
];

// ── Icon mapping for well-known tab names ─────────────────────────────────────
const TAB_ICONS: Record<string, string> = {
  pyq:                 "history_edu",
  "previous year":     "history_edu",
  "previous years":    "history_edu",
  notes:               "note_alt",
  lab:                 "science",
  labs:                "science",
  tutorial:            "menu_book",
  tutorials:           "menu_book",
  assignment:          "assignment",
  assignments:         "assignment",
  video:               "play_circle",
  videos:              "play_circle",
  "video lectures":    "play_circle",
  syllabus:            "list_alt",
  formula:             "functions",
  "formula sheet":     "functions",
  handwritten:         "draw",
  "handwritten notes": "draw",
  marks:               "grade",
  books:               "auto_stories",
  reference:           "library_books",
  slides:              "slideshow",
  presentation:        "slideshow",
};

function getTabIcon(tabType: string): string {
  return TAB_ICONS[tabType.toLowerCase().trim()] ?? "folder_open";
}

// ── Subject icon map ──────────────────────────────────────────────────────────
const SUBJECT_ICONS: Record<string, string> = {
  math: "calculate",       maths: "calculate",
  physics: "biotech",      discrete: "scatter_plot",
  ds: "account_tree",      "data structure": "account_tree",
  evs: "eco",              environment: "eco",
  ml: "neurology",         machine: "neurology",
  chemistry: "science",    english: "translate",
  programming: "terminal", algorithm: "code_blocks",
  os: "memory",            operating: "memory",
  network: "hub",          database: "storage",
  web: "web",              ai: "smart_toy",
  software: "build",       signal: "signal_cellular_alt",
  theory: "functions",     compiler: "code",
  computer: "computer",    micro: "developer_board",
  digital: "power_input",
};

function getSubjectIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "book_2";
}

// ── YouTube embed helper ──────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    const vid = u.searchParams.get("v");
    if (vid) return `https://www.youtube.com/embed/${vid}`;
    if (u.pathname.startsWith("/embed/")) return url;
  } catch { /* not a URL */ }
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  subjects: Subject[];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SubjectResourcesPage({ subjects }: Props) {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();

  const decodedName = decodeURIComponent(subjectName ?? "");

  const subject =
    subjects.find((s) => s.name.toLowerCase() === decodedName.toLowerCase()) ?? null;

  const [resources, setResources] = useState<DbResource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!decodedName) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setResources([]);
      setActiveTab("");

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .ilike("subject", decodedName)
        .order("year", { ascending: false });

      if (!error && data && data.length > 0) {
        const rows = data as DbResource[];
        setResources(rows);
        setActiveTab(rows[0]?.tab_type ?? "");
      }
      setLoading(false);
    })();
  }, [decodedName]);

  // ── Derived ────────────────────────────────────────────────────────────────
  // Ordered unique tab list — first appearance wins
  const tabList: string[] = [];
  for (const r of resources) {
    if (!tabList.includes(r.tab_type)) tabList.push(r.tab_type);
  }

  // Assign palette colors (stable across renders)
  const tabColors: Record<string, typeof TAB_PALETTE[0]> = {};
  tabList.forEach((tab, i) => { tabColors[tab] = TAB_PALETTE[i % TAB_PALETTE.length]; });

  const activeColor  = tabColors[activeTab] ?? TAB_PALETTE[0];
  const tabResources = resources.filter((r) => r.tab_type === activeTab);
  const isPyqTab     =
    activeTab.toLowerCase().includes("pyq") ||
    activeTab.toLowerCase().includes("previous year");
  const isVideoTab   = activeTab.toLowerCase().includes("video");

  // PYQ year groups
  const pyqGroups: Record<string, DbResource[]> = {};
  if (isPyqTab) {
    for (const res of tabResources) {
      const key = res.year?.toString() ?? "Other";
      if (!pyqGroups[key]) pyqGroups[key] = [];
      pyqGroups[key].push(res);
    }
  }

  const icon = getSubjectIcon(decodedName);

  // ── File card ───────────────────────────────────────────────────────────────
  const FileCard = ({ res }: { res: DbResource }) => {
    const color       = tabColors[res.tab_type] ?? TAB_PALETTE[0];
    const resIsVideo  = res.tab_type.toLowerCase().includes("video");
    const embedUrl    = resIsVideo ? getYouTubeEmbedUrl(res.file_url) : null;

    // YouTube embed
    if (resIsVideo && embedUrl) {
      return (
        <div className="rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-high">
          <iframe
            src={embedUrl}
            title={res.file_name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface truncate">{res.file_name}</p>
              {res.year && <p className="text-[10px] text-on-surface-variant mt-0.5">{res.year}</p>}
            </div>
            <a
              href={res.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </a>
          </div>
        </div>
      );
    }

    // Standard file card
    return (
      <div className="group flex items-center gap-4 p-4 rounded-2xl border border-outline-variant bg-surface-container-high hover:border-primary/40 hover:bg-surface-container transition-all duration-200">
        {/* Icon */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${color.bg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${color.accent} text-[20px]`}>
            {getTabIcon(res.tab_type)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate leading-snug">
            {res.file_name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${color.bg} ${color.accent}`}>
              {res.tab_type}
            </span>
            {res.year && (
              <span className="text-[10px] font-mono font-bold text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded">
                {res.year}
              </span>
            )}
            {res.file_size && (
              <span className="text-[10px] text-on-surface-variant">{res.file_size}</span>
            )}
            {!res.year && !res.file_size && (
              <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                File
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <a
            href={res.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:border-primary/50 hover:text-primary transition-all duration-200"
            title="View"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View</span>
          </a>
          <a
            href={res.file_url}
            download={res.file_name}
            className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-primary text-on-primary rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="-m-4 sm:-m-6 min-h-screen flex flex-col">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="bg-surface-container border-b border-outline-variant px-4 sm:px-8 pt-5 pb-0 flex-shrink-0">

        {/* Back */}
        <button
          id="back-to-resources-btn"
          onClick={() => navigate("/resources")}
          className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors mb-4 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Resources
        </button>

        {/* ── Gradient divider ───────────────────────────────────────────── */}
        <div className="relative mb-5 h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent rounded-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-transparent blur-sm rounded-full" />
        </div>

        {/* Subject hero */}
        <div className="flex items-start gap-4 mb-5">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-md shadow-primary/5">
            <span className="material-symbols-outlined text-primary text-[28px]">{icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-on-surface leading-tight">
              {decodedName}
            </h1>
            {subject?.code && (
              <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">{subject.code}</p>
            )}
            {subject?.description && (
              <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{subject.description}</p>
            )}
            <p className="text-xs text-on-surface-variant/70 mt-1">
              {loading
                ? "Fetching resources..."
                : resources.length === 0
                  ? "No resources uploaded yet"
                  : `${resources.length} file${resources.length !== 1 ? "s" : ""} · ${tabList.length} section${tabList.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Tab bar — scrolls horizontally on mobile */}
        {!loading && tabList.length > 0 && (
          <div
            className="flex overflow-x-auto scrollbar-none -mx-4 sm:-mx-8 px-4 sm:px-8"
            role="tablist"
            aria-label="Resource sections"
          >
            {tabList.map((tab) => {
              const isActive = activeTab === tab;
              const color    = tabColors[tab] ?? TAB_PALETTE[0];
              const count    = resources.filter((r) => r.tab_type === tab).length;
              return (
                <button
                  key={tab}
                  id={`res-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all duration-200 cursor-pointer border-b-2 whitespace-nowrap ${
                    isActive
                      ? `${color.accent} border-current`
                      : "text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{getTabIcon(tab)}</span>
                  <span>{tab}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? `${color.bg} ${color.accent}` : "bg-surface-variant text-on-surface-variant"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-8">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading resources...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5 text-center text-on-surface-variant">
            <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center border border-outline-variant">
              <FolderOpen className="w-9 h-9 text-outline" />
            </div>
            <div>
              <p className="text-base font-bold text-on-surface mb-1">No resources yet</p>
              <p className="text-sm max-w-xs mx-auto leading-relaxed">
                Resources for{" "}
                <span className="text-primary font-semibold">{decodedName}</span>{" "}
                haven't been uploaded yet. Check back soon!
              </p>
            </div>
            <button
              onClick={() => navigate("/resources")}
              className="mt-1 px-5 py-2.5 bg-surface-container border border-outline-variant rounded-xl font-bold text-sm hover:border-primary/50 hover:text-primary transition-all cursor-pointer"
            >
              Browse other subjects
            </button>
          </div>
        )}

        {/* Tab content */}
        {!loading && resources.length > 0 && (
          <div>
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-5">
              <span className={`material-symbols-outlined text-[18px] ${activeColor.accent}`}>
                {getTabIcon(activeTab)}
              </span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-mono">
                {activeTab}
              </h2>
              <span className="text-[10px] font-mono text-on-surface-variant/50">
                ({tabResources.length} {tabResources.length === 1 ? "file" : "files"})
              </span>
            </div>

            {/* PYQ — year grouped */}
            {isPyqTab ? (
              <div className="space-y-8">
                {Object.entries(pyqGroups)
                  .sort(([a], [b]) => {
                    if (a === "Other") return 1;
                    if (b === "Other") return -1;
                    return Number(b) - Number(a);
                  })
                  .map(([year, files]) => (
                    <div key={year}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`text-sm font-black font-mono ${activeColor.accent}`}>
                          {year}
                        </span>
                        <div className="flex-1 h-px bg-outline-variant/50" />
                        <span className="text-[10px] font-mono text-on-surface-variant/50">
                          {files.length} file{files.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {files.map((res) => (
                          <div key={res.id}><FileCard res={res} /></div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              /* Flat list for all other tabs */
              <div className={isVideoTab ? "space-y-5" : "space-y-3"}>
                {tabResources.map((res) => (
                  <div key={res.id}><FileCard res={res} /></div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
