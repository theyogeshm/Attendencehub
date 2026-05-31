/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmDanger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(4,8,15,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-[#1f2d45] shadow-2xl p-6 flex flex-col gap-4"
        style={{ background: "#0b1220" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              confirmDanger ? "bg-error/10" : "bg-primary/10"
            }`}
          >
            <span
              className={`material-symbols-outlined text-xl ${
                confirmDanger ? "text-error" : "text-primary"
              }`}
            >
              {confirmDanger ? "warning" : "help"}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-white">{title}</h3>
            <p className="text-xs text-[#6b7e94] mt-0.5 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1a2535]" />

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-[#2a3550] text-[#8899aa] hover:border-[#3a4560] hover:text-white transition-all cursor-pointer"
            style={{ background: "#0d1525" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer active:scale-[0.97] ${
              confirmDanger
                ? "bg-error text-white hover:brightness-110 shadow-lg shadow-error/20"
                : "bg-gradient-to-r from-[#1AE7A6] to-[#00C896] text-[#002114] hover:brightness-110"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
