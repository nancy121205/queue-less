import { useEffect } from "react";

function Modal({ open, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-modal ${className}`}
      >
        {title && (
          <h2
            id="modal-title"
            className="mb-4 text-lg font-semibold text-slate-900"
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

export default Modal;
