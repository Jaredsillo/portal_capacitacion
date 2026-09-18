"use client";
import React, { useEffect, useRef, useState } from "react";

// Overlay accesible reutilizado por el visor, el juego y el editor del juego:
// cierra con Escape, cierra al hacer click fuera, manda el foco adentro al abrir,
// y entra con una transición corta (nunca aparece de golpe).
export default function Modal({ onClose, ariaLabel, className, zIndex, children }) {
  const panelRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // rAF para que el navegador pinte el estado inicial (oculto) antes de animar.
    const id = requestAnimationFrame(() => setVisible(true));
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    window.addEventListener("keydown", onKey);
    const foco = panelRef.current?.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    foco?.focus();
    return () => { cancelAnimationFrame(id); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div className="ov" data-visible={visible} style={zIndex ? { zIndex } : undefined} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={panelRef} className={`modalpanel ${className || ""}`} data-visible={visible} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        {children}
      </div>
    </div>
  );
}
