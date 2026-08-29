"use client";
import React, { useEffect, useMemo, useState } from "react";

const MAX_ERRORES = 6;
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Ahorcado clásico: adivina cada palabra clave letra por letra.
export default function Ahorcado({ palabras }) {
  const lista = useMemo(() => palabras.slice(0, 8).filter(Boolean), [palabras]);
  const [indice, setIndice] = useState(0);
  const [usadas, setUsadas] = useState([]);
  const [adivinadas, setAdivinadas] = useState(0);

  const palabra = lista[indice] || "";
  const errores = usadas.filter((l) => !palabra.includes(l)).length;
  const resuelta = palabra.length > 0 && palabra.split("").every((l) => usadas.includes(l));
  const perdida = errores >= MAX_ERRORES;
  const terminoPalabra = resuelta || perdida;
  const esUltima = indice >= lista.length - 1;
  const todoListo = terminoPalabra && esUltima;

  function intentar(letra) {
    if (terminoPalabra || usadas.includes(letra)) return;
    setUsadas((u) => [...u, letra]);
  }
  function siguiente() {
    if (resuelta) setAdivinadas((n) => n + 1);
    setIndice((i) => Math.min(i + 1, lista.length - 1));
    setUsadas([]);
  }

  useEffect(() => {
    function onKey(e) {
      const letra = e.key.toUpperCase();
      if (ABC.includes(letra)) intentar(letra);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (lista.length === 0) return <p style={{ textAlign: "center", color: "var(--muted)" }}>No hay palabras configuradas.</p>;

  return (
    <div>
      <style suppressHydrationWarning>{CSS}</style>
      <div className="ah-top">
        <div className="ah-help">Adivina la palabra letra por letra antes de agotar los {MAX_ERRORES} intentos.</div>
        <div className="ah-cont">Palabra {Math.min(indice + 1, lista.length)}/{lista.length}</div>
      </div>

      <Muneco errores={errores} />

      <div className="ah-palabra" aria-live="polite">
        {palabra.split("").map((l, i) => (
          <span key={i} className={`ah-letra ${usadas.includes(l) || perdida ? "on" : ""}`}>
            {usadas.includes(l) || perdida ? l : ""}
          </span>
        ))}
      </div>

      {perdida && <p className="ah-revela">Era: <b>{palabra}</b></p>}

      <div className="ah-teclado" role="group" aria-label="Teclado">
        {ABC.map((l) => {
          const usada = usadas.includes(l);
          const correcta = usada && palabra.includes(l);
          return (
            <button
              key={l}
              className={`ah-tecla ${usada ? (correcta ? "ok" : "mal") : ""}`}
              disabled={usada || terminoPalabra}
              onClick={() => intentar(l)}
              aria-label={`Letra ${l}${usada ? (correcta ? ", correcta" : ", incorrecta") : ""}`}
            >{l}</button>
          );
        })}
      </div>

      <div className="ah-foot">
        <span className="ah-marcador">{adivinadas}/{lista.length} adivinadas</span>
        {terminoPalabra && !esUltima && <button className="ah-sig" onClick={siguiente}>Siguiente palabra ›</button>}
      </div>

      {todoListo && <div className="ah-win">¡Terminaste todas las palabras! 🎉</div>}
    </div>
  );
}

function Muneco({ errores }) {
  const partes = [
    <circle key="cabeza" cx="60" cy="38" r="10" />,
    <line key="cuerpo" x1="60" y1="48" x2="60" y2="78" />,
    <line key="brazoI" x1="60" y1="58" x2="44" y2="70" />,
    <line key="brazoD" x1="60" y1="58" x2="76" y2="70" />,
    <line key="piernaI" x1="60" y1="78" x2="46" y2="98" />,
    <line key="piernaD" x1="60" y1="78" x2="74" y2="98" />,
  ];
  return (
    <svg className="ah-svg" viewBox="0 0 120 110" aria-hidden="true">
      <line x1="10" y1="105" x2="90" y2="105" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
      <line x1="25" y1="105" x2="25" y2="10" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
      <line x1="25" y1="10" x2="60" y2="10" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
      <line x1="60" y1="10" x2="60" y2="26" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
      <g fill="none" stroke="var(--error)" strokeWidth="3.2" strokeLinecap="round">
        {partes.slice(0, errores)}
      </g>
    </svg>
  );
}

const CSS = `
.ah-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:12px;}
.ah-help{font-size:12.5px;color:var(--muted);}
.ah-cont{font-size:13px;font-weight:700;color:var(--azul);white-space:nowrap;}
.ah-svg{display:block;margin:0 auto;width:140px;height:auto;}
.ah-palabra{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:14px 0;}
.ah-letra{min-width:24px;height:32px;border-bottom:3px solid var(--line);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:var(--ink);}
.ah-letra.on{border-color:var(--azul);}
.ah-revela{text-align:center;color:var(--error);font-size:13px;margin:0 0 10px;}
.ah-teclado{display:grid;grid-template-columns:repeat(9,1fr);gap:5px;max-width:420px;margin:0 auto;}
.ah-tecla{aspect-ratio:1;border:1px solid var(--line);background:var(--card);border-radius:6px;font:inherit;font-weight:700;font-size:13px;color:var(--ink);cursor:pointer;}
.ah-tecla:hover:not(:disabled){border-color:var(--azul);color:var(--azul);}
.ah-tecla:disabled{cursor:not-allowed;}
.ah-tecla.ok{background:var(--verde);color:#fff;border-color:var(--verde);}
.ah-tecla.mal{background:var(--error);color:#fff;border-color:var(--error);opacity:.6;}
.ah-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;}
.ah-marcador{font-size:12.5px;color:var(--muted);font-weight:600;}
.ah-sig{font:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:9px;border:0;background:var(--azul);color:#fff;cursor:pointer;}
.ah-win{margin-top:16px;text-align:center;font-weight:700;color:var(--verde-2);}
`;
