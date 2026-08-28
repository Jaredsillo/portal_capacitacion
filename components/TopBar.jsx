"use client";
import React from "react";

// Barra superior compartida entre el dashboard y el panel de administración.
// Incluye marca y un slot de acciones a la derecha.
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
        {salir && (
          <form action={salir}>
            <button className="link" type="submit">Salir</button>
          </form>
        )}
      </div>
    </div>
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
