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
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`w-full py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border transition-all cursor-pointer shadow-sm flex items-center justify-between gap-2 text-left outline-none ${
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
          className={`absolute left-0 right-0 z-[100] mt-1.5 min-w-[210px] max-h-60 overflow-y-auto rounded-2xl p-1.5 shadow-2xl border transition-all custom-scrollbar ${
            isDarkMode
              ? "bg-[#0b1326] border-slate-700 text-slate-100 shadow-black/90"
              : "bg-white border-slate-200 text-slate-800 shadow-slate-400/30"
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            const handleSelect = (e: React.SyntheticEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(opt.value);
              setIsOpen(false);
            };

            return (
              <button
                type="button"
                key={opt.value}
                onClick={handleSelect}
                onTouchEnd={handleSelect}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between gap-2 mb-0.5 outline-none ${
                  isSelected
                    ? isDarkMode
                      ? "bg-emerald-500/20 text-[#47ffbc] font-extrabold"
                      : "bg-emerald-500/15 text-emerald-700 font-extrabold"
                    : isDarkMode
                    ? "hover:bg-slate-800/80 text-slate-200 hover:text-white active:bg-slate-800"
                    : "hover:bg-slate-100 text-slate-700 hover:text-slate-900 active:bg-slate-200"
                }`}
              >
                <span className="truncate flex items-center gap-1.5">
                  {opt.label}
                  {opt.badge && <span className="text-[11px] opacity-75 font-mono">({opt.badge})</span>}
                </span>
                {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
