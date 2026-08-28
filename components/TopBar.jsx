"use client";
import React, { useEffect, useState } from "react";

// Barra superior compartida entre el dashboard y el panel de administración.
// Incluye marca, slot de acciones a la derecha y el botón de modo oscuro.
export default function TopBar({ title, salir, children }) {
  return (
    <div className="bar">
      <div className="brand">
        <Marca />
        <div>
          <div className="eyebrow">Universidad Hipócrates</div>
          <div className="title serif">{title}</div>
        </div>
      </div>
      <div className="user">
        {children}
        <ThemeToggle />
        {salir && (
          <form action={salir}>
            <button className="link" type="submit">Salir</button>
          </form>
        )}
      </div>
    </div>
  );
}

export function ThemeToggle() {
  const [tema, setTema] = useState(null); // "light" | "dark" | null (sigue al sistema)

  useEffect(() => {
    try { setTema(localStorage.getItem("uhi-theme")); } catch { setTema(null); }
  }, []);

  function alternar() {
    const sistemaOscuro = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const actualOscuro = tema ? tema === "dark" : sistemaOscuro;
    const siguiente = actualOscuro ? "light" : "dark";
    setTema(siguiente);
    document.documentElement.setAttribute("data-theme", siguiente);
    try { localStorage.setItem("uhi-theme", siguiente); } catch {}
  }

  const oscuro = tema ? tema === "dark" : false;
  return (
    <button
      type="button"
      className="themebtn"
      onClick={alternar}
      aria-label={oscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
    >
      {oscuro ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.6" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
          </g>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.6 15.3A8.6 8.6 0 1 1 8.7 3.4a7 7 0 0 0 11.9 11.9Z" />
        </svg>
      )}
    </button>
  );
}

export function Marca() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="5,15 20,5 35,15" fill="#EAF2FF" stroke="#6AC72A" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="5" y="15" width="30" height="3" fill="#004CA6" />
      <rect x="8" y="19" width="4.5" height="13" rx="1" fill="#004CA6" /><rect x="15" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
      <rect x="22" y="19" width="4.5" height="13" rx="1" fill="#004CA6" /><rect x="29" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
      <rect x="4" y="32" width="32" height="3" fill="#004CA6" /><rect x="3" y="36" width="34" height="2" fill="#6AC72A" />
    </svg>
  );
}
