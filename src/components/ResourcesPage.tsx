/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ResourcesPage - subject card grid only.
 * Clicking a card navigates to /resources/:subjectName (full inner page).
 * The side drawer has been removed entirely.
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Subject } from "../types";
import { supabase } from "../lib/supabase";
import { Search, BookOpen, X, ChevronRight } from "lucide-react";

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

interface ResourcesPageProps {
  subjects: Subject[];
}

export default function ResourcesPage({ subjects }: ResourcesPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") ?? "");
  const [countMap, setCountMap] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    if (searchParams.has("q")) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subjects.length === 0) { setLoadingCounts(false); return; }
    (async () => {
      setLoadingCounts(true);
      const RESOURCE_TABLE_NAMES = ["resources", "subject_resources", "study_resources"];
      for (const tableName of RESOURCE_TABLE_NAMES) {
        const { data, error } = await supabase.from(tableName).select("subject");
        if (!error && data) {
          const map: Record<string, number> = {};
          data.forEach((row: { subject: string }) => {
            const key = row.subject.toLowerCase().trim();
            map[key] = (map[key] ?? 0) + 1;
          });
          setCountMap(map);
          break;
        }
      }
      setLoadingCounts(false);
    })();
  }, [subjects]);

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Academic Resources</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Browse previous year papers, notes, tutorials, assignments and more - all in one place.
          </p>
        </div>
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

      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const count = countMap[sub.name.toLowerCase().trim()] ?? 0;
            const icon  = getSubjectIcon(sub.name);
            return (
              <button
                key={sub.id}
                id={`subject-card-${sub.id}`}
                onClick={() => navigate(`/resources/${encodeURIComponent(sub.name)}`)}
                className="group text-left relative glass-card rounded-2xl p-6 cursor-pointer hover:border-primary/60 transition-all duration-300 flex flex-col justify-between focus:outline-none focus:border-primary"
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors">
                      <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-surface-variant px-3 py-1 rounded-full text-on-surface-variant">
                      {sub.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-on-surface mb-1 leading-snug">{sub.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-5 line-clamp-2 leading-relaxed">
                    {sub.description || "Tap to browse study materials and resources."}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    {loadingCounts ? (
                      <div className="w-4 h-4 rounded-full border border-outline-variant/50 animate-pulse bg-surface-variant" />
                    ) : count > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold">{count}</span>
                        <span>files available</span>
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-variant/70">No files yet</span>
                    )}
                  </div>
                  <span className="text-primary font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Browse</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
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
    </div>
  );
}
