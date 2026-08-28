"use client";
import React from "react";

// Notificación flotante con variante visual según el tipo de mensaje.
export default function Toast({ mensaje, tipo = "info" }) {
  if (!mensaje) return null;
  const clase = tipo === "error" ? "toast err" : tipo === "ok" ? "toast ok" : "toast";
  return (
    <div className={clase} role="status" aria-live="polite">
      {tipo === "error" ? <IconoAlerta /> : tipo === "ok" ? <IconoCheck /> : null}
      {mensaje}
    </div>
  );
}

function IconoCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12.5 9.5 18 20 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconoAlerta() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="1.15" fill="currentColor" />
    </svg>
  );
}
