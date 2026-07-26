/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Subject } from "../types";
import { supabase } from "../lib/supabase";
import type { DbResource } from "../lib/supabase";
import {
  Search,
  BookOpen,
  X,
  Download,
  ExternalLink,
  ChevronRight,
  FileText,
  Loader2,
  FolderOpen,
} from "lucide-react";

// ── Tab config ────────────────────────────────────────────────────────────────
type TabType = string;

interface TabConfig {
  id: TabType;
  label: string;
  icon: string; // material symbol name
  accent: string; // Tailwind text color class
  bg: string;    // Tailwind bg class for icon badge
}

const TAB_CONFIG: TabConfig[] = [
  { id: "pyq",        label: "PYQ",            icon: "history_edu",  accent: "text-[#82ffc8]",  bg: "bg-[#82ffc8]/10" },
  { id: "notes",      label: "Notes",          icon: "note_alt",     accent: "text-[#7bd0ff]",  bg: "bg-[#7bd0ff]/10" },
  { id: "tutorial",   label: "Tutorials",      icon: "menu_book",    accent: "text-[#ffd580]",  bg: "bg-[#ffd580]/10" },
  { id: "assignment", label: "Assignments",    icon: "assignment",   accent: "text-[#ff9580]",  bg: "bg-[#ff9580]/10" },
  { id: "lab",        label: "Lab",            icon: "science",      accent: "text-[#c4aaff]",  bg: "bg-[#c4aaff]/10" },
  { id: "video",      label: "Video Lectures", icon: "play_circle",  accent: "text-[#ff80ab]",  bg: "bg-[#ff80ab]/10" },
];

// Fallback config for any custom/unknown tab types
function getTabConfig(tabId: string): TabConfig {
  return (
    TAB_CONFIG.find(t => t.id === tabId) ?? {
      id: tabId,
      label: tabId.charAt(0).toUpperCase() + tabId.slice(1),
      icon: "folder_open",
      accent: "text-[#bacbbf]",
      bg: "bg-[#bacbbf]/10",
    }
  );
}

// ── Subject icon map ──────────────────────────────────────────────────────────
const SUBJECT_ICONS: Record<string, string> = {
  math: "calculate",
  maths: "calculate",
  physics: "biotech",
  discrete: "scatter_plot",
  ds: "account_tree",
  "data structure": "account_tree",
  evs: "eco",
  environment: "eco",
  ml: "neurology",
  machine: "neurology",
  chemistry: "science",
  english: "translate",
  programming: "terminal",
  algorithm: "code_blocks",
  os: "memory",
  operating: "memory",
  network: "hub",
  database: "storage",
  web: "web",
  ai: "smart_toy",
  software: "build",
  signal: "signal_cellular_alt",
  theory: "functions",
  compiler: "code",
  computer: "computer",
  micro: "developer_board",
  digital: "power_input",
};

function getSubjectIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "book_2";
}

// ── Extract YouTube video ID for embed ───────────────────────────────────────
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // youtube.com/watch?v=<id>
    const vid = u.searchParams.get("v");
    if (vid) return `https://www.youtube.com/embed/${vid}`;
    // youtube.com/embed/<id> — already embed
    if (u.pathname.startsWith("/embed/")) return url;
  } catch {
    // not a URL — return as-is (may already be embed URL)
  }
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ResourcesPageProps {
  subjects: Subject[];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ResourcesPage({ subjects }: ResourcesPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") ?? "");

  // Panel state
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Resources from Supabase
  const [resources, setResources] = useState<DbResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Counts per subject (for card badges)
  const [countMap, setCountMap] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Active tab inside panel
  const [activeTab, setActiveTab] = useState<TabType>("pyq");

  // Ref for focus trap and close on Escape
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Consume ?q param once ──────────────────────────────────────────────────
  useEffect(() => {
    if (searchParams.has("q")) {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch resource counts for ALL subjects at mount ────────────────────────
  useEffect(() => {
    if (subjects.length === 0) { setLoadingCounts(false); return; }

    (async () => {
      setLoadingCounts(true);
      const { data, error } = await supabase
        .from("resources")
        .select("subject");

      if (!error && data) {
        const map: Record<string, number> = {};
        data.forEach((row: { subject: string }) => {
          const key = row.subject.toLowerCase().trim();
          map[key] = (map[key] ?? 0) + 1;
        });
        setCountMap(map);
      }
      setLoadingCounts(false);
    })();
  }, [subjects]);

  // ── Fetch resources when a subject is selected ────────────────────────────
  useEffect(() => {
    if (!selectedSubject) return;

    (async () => {
      setLoadingResources(true);
      setResources([]);

      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .ilike("subject", selectedSubject.name)
        .order("tab_type")
        .order("year", { ascending: false });

      if (!error && data) {
        setResources(data as DbResource[]);

        // Auto-select first available tab
        const availableTabs = TAB_CONFIG.filter(tc =>
          (data as DbResource[]).some(r => r.tab_type === tc.id)
        );
        if (availableTabs.length > 0) {
          setActiveTab(availableTabs[0].id);
        }
      }
      setLoadingResources(false);
    })();
  }, [selectedSubject]);

  // ── Close panel on Escape ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelOpen) closePanel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panelOpen]);

  // ── Lock body scroll when panel open ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = panelOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [panelOpen]);

  const openPanel = (sub: Subject) => {
    setSelectedSubject(sub);
    setActiveTab("pyq");
    setResources([]);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => setSelectedSubject(null), 300); // clear after animation
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tabs that actually have data — includes any custom tab types not in TAB_CONFIG
  const availableTabs: TabConfig[] = [
    ...TAB_CONFIG.filter(tc => resources.some(r => r.tab_type === tc.id)),
    // append custom types not already covered
    ...Array.from(new Set(
      resources
        .map(r => r.tab_type)
        .filter(t => !TAB_CONFIG.some(tc => tc.id === t))
    )).map(t => getTabConfig(t as string)),
  ];

  // Resources for the currently active tab
  const tabResources = resources.filter(r => r.tab_type === activeTab);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Top Section ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Academic Resources</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Browse previous year papers, notes, tutorials, assignments and more — all in one place.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            id="resources-search"
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-full pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder-on-surface-variant/60 focus:border-primary focus:outline-none"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Subject Cards Grid ────────────────────────────────────────────── */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const count = countMap[sub.name.toLowerCase().trim()] ?? 0;
            const icon = getSubjectIcon(sub.name);

            return (
              <button
                key={sub.id}
                id={`subject-card-${sub.id}`}
                onClick={() => openPanel(sub)}
                className="group text-left relative bg-surface-container-low border border-outline-variant rounded-2xl p-6 cursor-pointer hover:border-primary/60 hover:bg-surface-container transition-all duration-300 flex flex-col justify-between focus:outline-none focus:border-primary"
              >
                {/* Top row */}
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors">
                      <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
                    </div>
                    <span className="text-[10px] font-bold font-mono bg-surface-variant px-3 py-1 rounded-full text-on-surface-variant">
                      {sub.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-on-surface mb-1 leading-snug">{sub.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-5 line-clamp-2 leading-relaxed">
                    {sub.description || "Tap to browse study materials and resources."}
                  </p>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    {loadingCounts ? (
                      <div className="w-4 h-4 rounded-full border border-outline-variant/50 animate-pulse bg-surface-variant" />
                    ) : count > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold font-mono">
                          {count}
                        </span>
                        <span>files available</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-on-surface-variant/60 italic">No files yet</span>
                    )}
                  </div>

                  <span className="text-primary font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Browse</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-primary/0 group-hover:ring-primary/20 transition-all duration-300 pointer-events-none" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-outline" />
          <p className="text-sm font-semibold">No subjects found matching your search.</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 px-4 py-2 bg-surface-container rounded-lg font-bold text-xs hover:border-primary transition-all text-on-surface cursor-pointer border border-outline-variant"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SIDE PANEL / DRAWER
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          panelOpen
            ? "bg-black/60 backdrop-blur-sm pointer-events-auto"
            : "bg-black/0 backdrop-blur-none pointer-events-none"
        }`}
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full z-50 w-full max-w-lg bg-surface-container border-l border-outline-variant shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={selectedSubject ? `Resources for ${selectedSubject.name}` : "Resources panel"}
      >
        {selectedSubject && (
          <>
            {/* ── Panel Header ──────────────────────────────────────────── */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-outline-variant/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {getSubjectIcon(selectedSubject.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-on-surface leading-tight truncate">
                      {selectedSubject.name}
                    </h2>
                    <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                      {selectedSubject.code
                        ? `${selectedSubject.code} • `
                        : ""}
                      Resource Repository
                    </p>
                  </div>
                </div>

                <button
                  id="panel-close-btn"
                  onClick={closePanel}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ── Tab Bar ──────────────────────────────────────────────── */}
              {!loadingResources && availableTabs.length > 0 && (
                <div className="flex gap-1 mt-5 overflow-x-auto pb-1 scrollbar-none">
                  {availableTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        id={`tab-${tab.id}`}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? `${tab.bg} ${tab.accent} ring-1 ring-current/30`
                            : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                        <span>{tab.label}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-current/10" : "bg-surface-variant"
                        }`}>
                          {resources.filter(r => r.tab_type === tab.id).length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Panel Body ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Loading state */}
              {loadingResources && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Loading resources...</p>
                </div>
              )}

              {/* Empty state — no resources in Supabase for this subject */}
              {!loadingResources && resources.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant py-20 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-variant flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-outline" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-on-surface mb-1">No resources yet</p>
                    <p className="text-xs leading-relaxed">
                      Resources for <span className="text-primary font-semibold">{selectedSubject.name}</span> haven't been uploaded yet.
                      Check back soon!
                    </p>
                  </div>
                </div>
              )}

              {/* Content — tab resources */}
              {!loadingResources && resources.length > 0 && (
                <div className="p-6">
                  {/* Tab heading */}
                  {(() => {
                    const tabCfg = getTabConfig(activeTab);
                    return tabCfg ? (
                      <div className={`flex items-center gap-2 mb-5`}>
                        <span className={`material-symbols-outlined text-[18px] ${tabCfg.accent}`}>
                          {tabCfg.icon}
                        </span>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-mono">
                          {tabCfg.label}
                        </h3>
                        <span className="text-[10px] font-mono text-on-surface-variant/50">
                          ({tabResources.length} {tabResources.length === 1 ? "file" : "files"})
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* Video tab — YouTube embeds */}
                  {activeTab === "video" ? (
                    <div className="space-y-5">
                      {tabResources.map((res) => {
                        const embedUrl = getYouTubeEmbedUrl(res.file_url);
                        return (
                          <div key={res.id} className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-high">
                            {embedUrl ? (
                              <iframe
                                src={embedUrl}
                                title={res.file_name}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full aspect-video"
                              />
                            ) : (
                              <a
                                href={res.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 hover:bg-surface-variant transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-lg bg-[#ff80ab]/10 flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[#ff80ab] text-[20px]">play_circle</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-on-surface truncate">{res.file_name}</p>
                                  {res.year && <p className="text-[10px] text-on-surface-variant">{res.year}</p>}
                                </div>
                                <ExternalLink className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                              </a>
                            )}
                            {embedUrl && (
                              <div className="px-4 py-3 flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-on-surface">{res.file_name}</p>
                                  {res.year && <p className="text-[10px] text-on-surface-variant mt-0.5">{res.year}</p>}
                                </div>
                                <a
                                  href={res.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Open
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* PDF / file cards */
                    <div className="space-y-3">
                        {tabResources.map((res) => {
                        const tabCfg = getTabConfig(res.tab_type);
                        return (
                          <div
                            key={res.id}
                            className="group flex items-center gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-high hover:border-primary/40 hover:bg-surface-container transition-all duration-200"
                          >
                            {/* File icon */}
                            <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${tabCfg.bg} flex items-center justify-center`}>
                              <span className={`material-symbols-outlined ${tabCfg.accent} text-[20px]`}>
                                {tabCfg.icon}
                              </span>
                            </div>

                            {/* File info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-on-surface truncate leading-snug">
                                {res.file_name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {res.year && (
                                  <span className="text-[10px] font-mono font-bold text-on-surface-variant bg-surface-variant px-1.5 py-0.5 rounded">
                                    {res.year}
                                  </span>
                                )}
                                {res.file_size && (
                                  <span className="text-[10px] text-on-surface-variant">
                                    {res.file_size}
                                  </span>
                                )}
                                {!res.year && !res.file_size && (
                                  <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    PDF
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              {/* View */}
                              <a
                                href={res.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-on-surface-variant border border-outline-variant rounded-lg hover:border-primary/50 hover:text-primary transition-all duration-200"
                                title="View"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">View</span>
                              </a>
                              {/* Download */}
                              <a
                                href={res.file_url}
                                download={res.file_name}
                                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Download</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Panel Footer ───────────────────────────────────────────── */}
            {!loadingResources && resources.length > 0 && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-outline-variant/50">
                <p className="text-[10px] text-on-surface-variant/60 text-center font-mono">
                  {resources.length} total file{resources.length !== 1 ? "s" : ""} •{" "}
                  {availableTabs.length} categor{availableTabs.length !== 1 ? "ies" : "y"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
