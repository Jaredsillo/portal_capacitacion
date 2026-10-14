"use client";
import React, { useMemo, useState } from "react";
import { IconGame } from "./icons";

const PAUSA_ERROR = 700; // ms que se quedan volteadas dos cartas que no hacen pareja

function mezclar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Memorama: cada palabra clave aparece dos veces; hay que encontrar las parejas.
export default function Memorama({ palabras }) {
  const lista = useMemo(() => palabras.slice(0, 6).filter(Boolean), [palabras]);
  const cartas = useMemo(() => mezclar(lista.flatMap((p, i) => [
    { id: `${i}-a`, palabra: p },
    { id: `${i}-b`, palabra: p },
  ])), [lista]);

  const [volteadas, setVolteadas] = useState([]); // ids de las 0-2 cartas boca arriba en turno
  const [encontradas, setEncontradas] = useState([]); // palabras ya emparejadas
  const [bloqueado, setBloqueado] = useState(false); // pausa mientras se muestra un error

  const todo = lista.length > 0 && encontradas.length === lista.length;

  function voltear(carta) {
    if (bloqueado || volteadas.includes(carta.id) || encontradas.includes(carta.palabra)) return;
    const siguientes = [...volteadas, carta.id];
    setVolteadas(siguientes);
    if (siguientes.length < 2) return;

    const [idA, idB] = siguientes;
    const a = cartas.find((c) => c.id === idA);
    const b = cartas.find((c) => c.id === idB);
    if (a.palabra === b.palabra) {
      setEncontradas((e) => [...e, a.palabra]);
      setVolteadas([]);
    } else {
      setBloqueado(true);
      setTimeout(() => { setVolteadas([]); setBloqueado(false); }, PAUSA_ERROR);
    }
  }

  if (lista.length === 0) return <p style={{ textAlign: "center", color: "var(--muted)" }}>No hay palabras configuradas.</p>;

  return (
    <div>
      <style suppressHydrationWarning>{CSS}</style>
      <div className="mm-top">
        <div className="mm-help">Voltea dos cartas a la vez y encuentra cada pareja.</div>
        <div className="mm-cont">{encontradas.length}/{lista.length} parejas</div>
      </div>

      <div className="mm-grid" role="group" aria-label="Cartas del memorama">
        {cartas.map((c) => {
          const emparejada = encontradas.includes(c.palabra);
          const volteada = emparejada || volteadas.includes(c.id);
          return (
            <button
              key={c.id}
              className={`mm-carta ${volteada ? "volteada" : ""} ${emparejada ? "ok" : ""}`}
              onClick={() => voltear(c)}
              disabled={emparejada}
              aria-label={emparejada ? `${c.palabra}, pareja encontrada` : volteada ? c.palabra : "Carta boca abajo"}
            >
              <span className="mm-cara mm-frente"><IconGame /></span>
              <span className="mm-cara mm-reverso">{c.palabra}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="sr-only">
        {todo ? "¡Encontraste todas las parejas!" : `${encontradas.length} de ${lista.length} parejas encontradas`}
      </div>
      {todo && <div className="mm-win">¡Encontraste todas las parejas! 🎉</div>}
    </div>
  );
}

const CSS = `
.mm-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:12px;}
.mm-help{font-size:12.5px;color:var(--muted);}
.mm-cont{font-size:13px;font-weight:700;color:var(--azul);white-space:nowrap;}
.mm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:420px;margin:0 auto;perspective:600px;}
.mm-carta{position:relative;aspect-ratio:3/4;border:0;border-radius:9px;padding:0;cursor:pointer;background:none;
  transform-style:preserve-3d;transition:transform .24s var(--ease-in-out);}
.mm-carta:hover:not(:disabled):not(.volteada){transform:translateY(-2px);}
.mm-carta.volteada{transform:rotateY(180deg);}
.mm-carta:disabled{cursor:default;}
.mm-cara{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:9px;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;padding:4px;text-align:center;}
.mm-frente{background:var(--azul);color:#fff;}
.mm-reverso{background:var(--card);border:1.5px solid var(--azul);color:var(--ink);transform:rotateY(180deg);
  font-weight:700;font-size:11px;line-height:1.15;word-break:break-word;}
.mm-carta.ok .mm-reverso{border-color:var(--verde);background:var(--verde-soft);color:var(--verde-2);}
.mm-win{margin-top:16px;text-align:center;font-weight:700;color:var(--verde-2);}
`;
