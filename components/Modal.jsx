"use client";
import React, { useEffect, useRef } from "react";

// Overlay accesible reutilizado por el visor, el quiz y el editor de evaluaciones:
// cierra con Escape, cierra al hacer click fuera, y manda el foco adentro al abrir.
export default function Modal({ onClose, ariaLabel, className, zIndex, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    window.addEventListener("keydown", onKey);
    const foco = panelRef.current?.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    foco?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ov" style={zIndex ? { zIndex } : undefined} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={panelRef} className={className} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        {children}
      </div>
    </div>
  );
}
