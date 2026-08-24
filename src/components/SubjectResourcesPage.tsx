import { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink, FolderOpen, FileText } from "lucide-react";
import { Subject } from "../types";
import { getStandardizedBaseName } from "../data";
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

// ── Top-level Memoized FileCard Component ─────────────────────────────────────
const FileCard = memo(({ res }: { res: DbResource }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const resIsVideo  = res.tab_type.toLowerCase().includes("video");
  const embedUrl    = resIsVideo ? getYouTubeEmbedUrl(res.file_url) : null;
  const isLongName  = res.file_name.length > 35;

  // YouTube embed
  if (resIsVideo && embedUrl) {
    return (
      <div className="rounded-2xl overflow-hidden glass-card border border-outline-variant shadow-sm w-full min-w-0">
        <iframe
          src={embedUrl}
          title={res.file_name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video"
          loading="lazy"
        />
        <div className="px-3.5 py-3 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-on-surface break-words leading-snug">{res.file_name}</p>
            {res.year && <p className="text-[10px] text-on-surface-variant mt-0.5">{res.year}</p>}
          </div>
          <a
            href={res.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline active:scale-95 transition-transform"
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
    <div className="group flex items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-2xl glass-card border border-outline-variant shadow-sm hover:border-primary/40 active:bg-surface-container-high transition-all duration-150 w-full min-w-0 box-border">
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-[18px] sm:text-[20px]">
          {getTabIcon(res.tab_type)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-1">
        {isLongName ? (
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-left w-full cursor-pointer select-none sm:cursor-auto bg-transparent border-none p-0 focus:outline-none"
          >
            <p className={`text-xs sm:text-sm font-semibold text-on-surface leading-snug break-words ${
              !isExpanded ? "line-clamp-2 sm:line-clamp-none" : ""
            }`}>
              {res.file_name}
            </p>
            <span className="sm:hidden text-[10px] text-primary font-bold hover:underline inline-block mt-0.5">
              {isExpanded ? "Show less ▲" : "Show more ▼"}
            </span>
          </button>
        ) : (
          <div>
            <p className="text-xs sm:text-sm font-semibold text-on-surface leading-snug break-words">
              {res.file_name}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
          {res.file_size ? (
            <span className="text-[10px] text-on-surface-variant font-medium">{res.file_size}</span>
          ) : (
            <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-1 font-medium">
              <FileText className="w-3 h-3" />
              Document
            </span>
          )}
        </div>
      </div>

      {/* Actions — compact mobile spacing to guarantee no overflow */}
      <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
        <a
          href={res.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-[11px] font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:border-primary/50 hover:text-primary active:scale-95 transition-all duration-150 whitespace-nowrap shrink-0"
          title="View document"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">View</span>
        </a>
        <a
          href={res.file_url}
          download={res.file_name}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-1.5 sm:px-3 sm:py-2 text-[11px] font-bold bg-primary text-on-primary rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all duration-150 whitespace-nowrap shrink-0"
          title="Download document"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] ml-1">Download</span>
        </a>
      </div>
    </div>
  );
});

FileCard.displayName = "FileCard";

// ── Component ─────────────────────────────────────────────────────────────────
export default function SubjectResourcesPage({ subjects }: Props) {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();

  const rawDecoded = decodeURIComponent(subjectName ?? "");
  const rawBase = rawDecoded
    .replace(/ - (Theory|Lab|Tutorial|Tut)$/i, "")
    .replace(/ (Theory|Lab|Tutorial|Tut)$/i, "")
    .trim();
  const decodedName = getStandardizedBaseName(rawBase);

  const subject =
    subjects.find((s) =>
      s.name
        .replace(/ - (Theory|Lab|Tutorial|Tut)$/i, "")
        .replace(/ (Theory|Lab|Tutorial|Tut)$/i, "")
        .trim()
        .toLowerCase() === decodedName.toLowerCase()
    ) ?? {
      id: "res-" + decodedName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      name: decodedName,
      code: "CS200",
      prof: "Faculty",
      room: "AB4",
      category: "Core",
      description: decodedName,
      attendanceCount: 0,
      totalClasses: 0,
    };

  const [resources, setResources] = useState<DbResource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(15);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!decodedName) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      setResources([]);
      setActiveTab("");
      setVisibleCount(15);

      const RESOURCE_TABLE_NAMES = ["resources", "subject_resources", "study_resources"];
      for (const tableName of RESOURCE_TABLE_NAMES) {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .order("year", { ascending: false });

        if (!error && data && data.length > 0) {
          const allRows = data as DbResource[];
          const decStd = getStandardizedBaseName(decodedName);

          const matchingRows = allRows.filter((r) => {
            const rRawBase = (r.subject || "")
              .replace(/ - (Theory|Lab|Tutorial|Tut)$/i, "")
              .replace(/ (Theory|Lab|Tutorial|Tut)$/i, "")
              .trim();
            const rStd = getStandardizedBaseName(rRawBase);

            return rRawBase.length > 0 &&
              rStd.toLowerCase() === decStd.toLowerCase();
          });

          if (matchingRows.length > 0) {
            setResources(matchingRows);
            const nonSyllabus = matchingRows.filter(r => !r.tab_type.toLowerCase().includes("syllabus"));
            const defaultTab = (nonSyllabus.length > 0 ? nonSyllabus[0] : matchingRows[0])?.tab_type ?? "";
            setActiveTab(defaultTab);
            break;
          }
        }
      }
      setLoading(false);
    })();
  }, [decodedName]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const syllabusResource = resources.find((r) =>
    r.tab_type.toLowerCase().trim().includes("syllabus")
  );

  // Ordered unique tab list — exclude Syllabus (elevated to top-right hero header button)
  const tabList: string[] = [];
  for (const r of resources) {
    if (r.tab_type.toLowerCase().trim().includes("syllabus")) continue;
    if (!tabList.includes(r.tab_type)) tabList.push(r.tab_type);
  }

  const tabResources = resources.filter((r) => r.tab_type === activeTab);
  const isPyqTab     =
    activeTab.toLowerCase().includes("pyq") ||
    activeTab.toLowerCase().includes("previous year");
  const isVideoTab   = activeTab.toLowerCase().includes("video");

  // Group resources by sub-heading / year if sub-headings exist for this tab
  const hasSubHeadings = tabResources.some((r) => Boolean(r.year?.trim()));
  const subHeadingGroups: Record<string, DbResource[]> = {};
  if (hasSubHeadings) {
    for (const res of tabResources) {
      const key = res.year?.trim() || "General";
      if (!subHeadingGroups[key]) subHeadingGroups[key] = [];
      subHeadingGroups[key].push(res);
    }
  }

  const icon = getSubjectIcon(decodedName);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col w-full min-w-0">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="bg-surface-container border-b border-outline-variant px-4 sm:px-6 pt-3.5 pb-0 flex-shrink-0 overflow-x-hidden">

        {/* Back */}
        <button
          id="back-to-resources-btn"
          onClick={() => navigate("/resources")}
          className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors mb-2.5 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Resources
        </button>

        {/* ── Gradient divider ───────────────────────────────────────────── */}
        <div className="relative mb-3 h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent rounded-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-transparent blur-sm rounded-full" />
        </div>

        {/* Subject hero */}
        <div className="flex items-center justify-between gap-3.5 mb-3.5 flex-wrap">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-on-surface leading-tight">
                  {decodedName}
                </h1>
                {subject?.code && (
                  <span className="text-[10px] font-bold bg-surface-variant px-2 py-0.5 rounded text-on-surface-variant">{subject.code}</span>
                )}
              </div>
              {subject?.description && (
                <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{subject.description}</p>
              )}
              <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                {loading
                  ? "Fetching resources..."
                  : resources.length === 0
                    ? "No resources uploaded yet"
                    : `${resources.length} file${resources.length !== 1 ? "s" : ""} · ${tabList.length} section${tabList.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Top-Right Syllabus Button (rendered ONLY when syllabus is posted) */}
          {syllabusResource && (
            <a
              href={syllabusResource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold text-xs hover:bg-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
              title={`View Syllabus — ${syllabusResource.file_name}`}
            >
              <span className="material-symbols-outlined text-[16px]">list_alt</span>
              <span>Syllabus</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}
        </div>

        {/* Tab bar — scrolls horizontally on mobile */}
        {!loading && tabList.length > 0 && (
          <div
            className="flex overflow-x-auto scrollbar-none px-0 -mb-px"
            role="tablist"
            aria-label="Resource sections"
          >
            {tabList.map((tab) => {
              const isActive = activeTab === tab;
              const count    = resources.filter((r) => r.tab_type === tab).length;
              return (
                <button
                  key={tab}
                  id={`res-tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => { setActiveTab(tab); setVisibleCount(15); }}
                  className={`flex-shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-3 text-xs font-bold transition-all duration-150 cursor-pointer border-b-2 whitespace-nowrap ${
                    isActive
                      ? "text-primary border-primary font-bold"
                      : "text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{getTabIcon(tab)}</span>
                  <span>{tab}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-primary/10 text-primary" : "bg-surface-variant text-on-surface-variant"
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
      <div className="flex-1 px-0 py-3 sm:p-6 max-w-5xl xl:max-w-6xl mx-auto w-full min-w-0 box-border">

        {/* Skeleton Loading */}
        {loading && (
          <div className="space-y-3 sm:space-y-4 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-24 h-5 bg-surface-variant/60 rounded-lg" />
              <div className="flex-1 h-px bg-outline-variant/30" />
              <div className="w-12 h-4 bg-surface-variant/40 rounded-lg" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-surface-container border border-outline-variant/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-variant/80 flex-shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="w-48 sm:w-64 h-4 bg-surface-variant/90 rounded-md" />
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-3 bg-surface-variant/60 rounded" />
                      <div className="w-12 h-3 bg-surface-variant/40 rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-end sm:self-center">
                  <div className="w-20 h-9 rounded-xl bg-surface-variant/60" />
                  <div className="w-24 h-9 rounded-xl bg-primary/20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center text-on-surface-variant">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-surface-container flex items-center justify-center border border-outline-variant">
              <FolderOpen className="w-8 h-8 sm:w-9 sm:h-9 text-outline" />
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
            {/* Sub-heading / year grouped list */}
            {hasSubHeadings ? (
              <div className="space-y-6 sm:space-y-8">
                {Object.entries(subHeadingGroups)
                  .sort(([a], [b]) => {
                    if (a === "General" || a === "Other") return 1;
                    if (b === "General" || b === "Other") return -1;
                    const numA = Number(a);
                    const numB = Number(b);
                    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
                    return a.localeCompare(b);
                  })
                  .map(([groupName, files]) => (
                    <div key={groupName}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs sm:text-sm font-bold text-primary">
                          {groupName}
                        </span>
                        <div className="flex-1 h-px bg-outline-variant/50" />
                        <span className="text-[10px] text-on-surface-variant/50">
                          {files.length} file{files.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {files.slice(0, visibleCount).map((res) => (
                          <div key={res.id}><FileCard res={res} /></div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              /* Flat list for tabs without sub-headings */
              <div className={isVideoTab ? "space-y-4" : "space-y-2.5"}>
                {tabResources.slice(0, visibleCount).map((res) => (
                  <div key={res.id}><FileCard res={res} /></div>
                ))}
              </div>
            )}

            {/* Load More trigger if list exceeds visibleCount */}
            {tabResources.length > visibleCount && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="px-6 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-primary font-bold text-xs hover:border-primary/50 hover:bg-primary/10 active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  Show More ({tabResources.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
