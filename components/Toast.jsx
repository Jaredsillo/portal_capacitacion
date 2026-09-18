"use client";
import React, { useEffect, useRef, useState } from "react";

// Notificación flotante con variante visual según el tipo de mensaje.
// Entra deslizando desde abajo y sale un poco más rápido de lo que entró
// (la salida siempre debe sentirse ágil); sigue mostrando el último mensaje
// mientras se desvanece, en vez de desaparecer de golpe.
export default function Toast({ mensaje, tipo = "info" }) {
  const [visible, setVisible] = useState(false);
  const [mostrado, setMostrado] = useState(null);
  const salidaRef = useRef(null);

  useEffect(() => {
    if (mensaje) {
      clearTimeout(salidaRef.current);
      setMostrado({ mensaje, tipo });
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    if (mostrado) {
      setVisible(false);
      salidaRef.current = setTimeout(() => setMostrado(null), 180);
    }
    return () => clearTimeout(salidaRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensaje, tipo]);

  if (!mostrado) return null;
  const clase = mostrado.tipo === "error" ? "toast err" : mostrado.tipo === "ok" ? "toast ok" : "toast";
  return (
    <div className={clase} data-visible={visible} role="status" aria-live="polite">
      {mostrado.tipo === "error" ? <IconoAlerta /> : mostrado.tipo === "ok" ? <IconoCheck /> : null}
      {mostrado.mensaje}
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
