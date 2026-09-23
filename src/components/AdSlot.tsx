import React, { useEffect } from "react";
import { ADS_ENABLED, ADSENSE_CLIENT_ID } from "../config/ads";

interface AdSlotProps {
  slotId?: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

/**
 * AdSlot component
 * 
 * CRITICAL: When ADS_ENABLED is false, returns NULL immediately.
 * Zero DOM nodes, zero margins, zero padding, zero layout shift.
 * 
 * When ADS_ENABLED is true, renders fluid/responsive Google AdSense unit.
 */
export default function AdSlot({
  slotId = "default-slot",
  format = "auto",
  className = "",
}: AdSlotProps) {
  // Completely inactive and invisible when flag is disabled
  if (!ADS_ENABLED) {
    return null;
  }

  // Push to adsbygoogle array when active
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch {
      // Ignore adsbygoogle errors when ad blocker is active
    }
  }, []);

  return (
    <div
      className={`w-full max-w-full my-4 overflow-hidden flex flex-col items-center justify-center min-h-[90px] rounded-xl border border-outline-variant/30 bg-surface-variant/10 text-on-surface-variant transition-all ${className}`}
      data-ad-slot-id={slotId}
    >
      <div className="w-full flex justify-between items-center px-3 py-1 text-[9px] uppercase tracking-wider text-on-surface-variant/40 select-none">
        <span>Advertisement</span>
      </div>
      <div className="w-full flex justify-center items-center overflow-hidden py-1 px-2">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
