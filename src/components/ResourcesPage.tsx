/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Subject } from "../types";
import { 
  Search, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Download, 
  HelpCircle, 
  Lightbulb, 
  Sparkles, 
  Brain, 
  X,
  XCircle,
  FileCode
} from "lucide-react";

interface ResourcesPageProps {
  subjects: Subject[];
}

interface ResourcePackage {
  year: string;
  type: string;
  hasSolution: boolean;
  size: string;
}

export default function ResourcesPage({ subjects }: ResourcesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter subjects based on search phrase
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockPackages: ResourcePackage[] = [
    { year: "2023", type: "End-Term exam papers", hasSolution: true, size: "1.4 MB" },
    { year: "2022", type: "End-Term exam papers", hasSolution: true, size: "1.8 MB" },
    { year: "2021", type: "Mid-Term exam papers", hasSolution: false, size: "940 KB" },
  ];

  const handleOpenDetail = (sub: Subject) => {
    setSelectedSubject(sub);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Academic Resources</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Access previous year questions, handwritten notes, top-ranked scholar tips, and AI-generated summaries.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search subjects, years, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant rounded-full pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-0"
          />
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        </div>
      </div>

      {/* Subject Resources Grid */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub, idx) => {
            // Pick a matching category shortcode or styling
            const countFiles = 8 + (idx * 3);
            return (
              <div 
                key={sub.id}
                onClick={() => handleOpenDetail(sub)}
                className="group relative bg-surface-container-low border border-outline-variant rounded-2xl p-6 cursor-pointer hover:border-primary transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="p-3 bg-primary-container/10 rounded-xl">
                      {sub.id === "maths" && <span className="material-symbols-outlined text-primary">calculate</span>}
                      {sub.id === "physics" && <span className="material-symbols-outlined text-primary">biotech</span>}
                      {sub.id === "discrete" && <span className="material-symbols-outlined text-primary">scatter_plot</span>}
                      {sub.id === "ds" && <span className="material-symbols-outlined text-primary">account_tree</span>}
                      {sub.id === "evs" && <span className="material-symbols-outlined text-primary">eco</span>}
                      {sub.id === "ml" && <span className="material-symbols-outlined text-primary">neurology</span>}
                    </div>
                    <span className="text-[10px] font-bold font-mono bg-surface-variant px-3 py-1 rounded-full text-on-surface-variant">
                      {sub.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-on-surface mb-1">{sub.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-6 line-clamp-2">
                    {sub.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-outline-variant/30">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-[10px] border-2 border-[#0b1326] font-bold">
                      {countFiles}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-[10px] border-2 border-[#0b1326] text-on-primary-container font-mono font-bold">
                      N
                    </div>
                  </div>
                  <span className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Resources</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-on-surface-variant">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-outline" />
          <p className="text-sm font-semibold">No resource packages found matching your search query.</p>
          <button 
            onClick={() => setSearchTerm("")}
            className="mt-4 px-4 py-2 bg-surface-container rounded-lg font-bold text-xs hover:border-primary transition-all text-on-surface cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Detail Modal Drawer (Screen 3 Side panel overlay) */}
      {isModalOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex justify-end" id="detail-modal">
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-[#090d16]/75 backdrop-blur-sm" onClick={handleCloseDetail}></div>
          
          {/* Panel Container */}
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-surface-container border-l border-outline-variant shadow-2xl overflow-y-auto custom-scrollbar z-10 transition-transform duration-300">
            <div className="p-8 min-h-screen flex flex-col justify-between">
              
              {/* Header block */}
              <div>
                <div className="flex items-start justify-between mb-8 pb-4 border-b border-outline-variant/50">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">{selectedSubject.name}</h2>
                    <p className="text-xs text-on-surface-variant mt-1 font-mono">Resource Repository • {selectedSubject.code}</p>
                  </div>
                  <button 
                    onClick={handleCloseDetail}
                    className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* PYQs Row list */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-widest mb-4">Previous Year Papers</h3>
                    <div className="space-y-3">
                      {mockPackages.map((pack) => (
                        <div 
                          key={pack.year}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#222a3d] rounded-xl border border-outline-variant hover:border-primary/50 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-surface-variant flex items-center justify-center font-bold text-primary text-sm font-mono tracking-tight">
                              {pack.year}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-on-surface block">{pack.type}</span>
                              <span className="text-[10px] text-on-surface-variant">{pack.size} • End-term series</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 text-xs">
                            <button 
                              onClick={() => alert(`Downloading ${selectedSubject.name} ${pack.year} Question paper PDF...`)}
                              className="flex items-center gap-1 bg-primary text-[#002114] px-4 py-2 rounded-xl font-bold hover:brightness-110 cursor-pointer transition-all active:scale-95 text-[11px]"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Paper PDF</span>
                            </button>
                            {pack.hasSolution ? (
                              <button 
                                onClick={() => alert(`Opening solutions for ${selectedSubject.name} ${pack.year} paper...`)}
                                className="flex items-center gap-1 border border-outline text-on-surface hover:bg-[#2d3449] px-3 py-2 rounded-xl font-bold cursor-pointer transition-all text-[11px]"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                                <span>Solved</span>
                              </button>
                            ) : (
                              <span className="px-3 py-2 text-[10px] bg-[#131b2e] border border-dashed border-outline-variant rounded-xl text-on-surface-variant inline-flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>No Solution</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Study Notes panel */}
                  <section>
                    <h3 className="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-widest mb-4">Study Material & Notes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Scholar Notes */}
                      <button 
                        onClick={() => alert("Loading handwritten scholar notes package... (9.4 MB PDF)")}
                        className="flex flex-col items-center justify-center p-6 bg-[#2d3449]/20 rounded-2xl border-2 border-dashed border-[#3b4a42] hover:border-primary transition-all group text-center cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-primary">
                          <span className="material-symbols-outlined text-2xl">edit_note</span>
                        </div>
                        <span className="font-bold text-sm text-on-surface block">Handwritten Notes</span>
                        <span className="text-[10px] text-on-surface-variant tracking-wide mt-1">Compiled by Top 3 Scholars</span>
                      </button>

                      {/* AI Generated Summarized notes */}
                      <button 
                        onClick={() => alert("Initializing AI summarizing model... Loaded 4 detailed revision flashcards.")}
                        className="flex flex-col items-center justify-center p-6 bg-secondary-container/5 rounded-2xl border-2 border-dashed border-secondary/30 hover:border-secondary transition-all group text-center cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-secondary">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-on-surface block">AI Notes Summaries</span>
                        <span className="text-[10px] text-on-surface-variant tracking-wide mt-1">Gems Summarized in Flashcards</span>
                      </button>

                    </div>
                  </section>
                </div>
              </div>

              {/* Footer action downloads */}
              <div className="pt-6 border-t border-outline-variant mt-8">
                <button 
                  onClick={() => alert(`Starting full package download for ${selectedSubject.name} (Zip file, 18.5 MB)`)}
                  className="w-full py-3.5 bg-primary-fixed text-[#002114] font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all cursor-pointer active:scale-95 text-xs shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Packaged Bundle</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
