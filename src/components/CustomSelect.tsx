/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (val: string) => void;
  isDarkMode?: boolean;
  className?: string;
  placeholder?: string;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  isDarkMode = true,
  className = "",
  placeholder = "Select option...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer shadow-sm flex items-center justify-between gap-2 text-left outline-none ${
          isDarkMode
            ? "bg-[#131b2e] border-slate-700/60 text-slate-100 hover:border-emerald-500/50 hover:bg-[#1a243b]"
            : "bg-white border-slate-200 text-slate-800 hover:border-emerald-500/50 hover:bg-slate-50"
        }`}
      >
        <span className="truncate flex items-center gap-1.5 font-bold">
          {selectedOpt ? selectedOpt.label : placeholder}
          {selectedOpt?.badge && (
            <span className="text-[11px] opacity-75 font-mono">({selectedOpt.badge})</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-emerald-500 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-2xl p-1.5 shadow-2xl border backdrop-blur-xl transition-all custom-scrollbar ${
            isDarkMode
              ? "bg-[#0f172a]/95 border-slate-700/80 text-slate-100 shadow-black/80"
              : "bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/50"
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between gap-2 mb-0.5 ${
                  isSelected
                    ? isDarkMode
                      ? "bg-emerald-500/20 text-[#47ffbc] font-extrabold"
                      : "bg-emerald-500/15 text-emerald-700 font-extrabold"
                    : isDarkMode
                    ? "hover:bg-slate-800/80 text-slate-200 hover:text-white"
                    : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  {opt.label}
                  {opt.badge && <span className="text-[11px] opacity-75 font-mono">({opt.badge})</span>}
                </span>
                {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
