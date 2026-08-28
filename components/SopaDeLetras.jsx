"use client";
import React, { useMemo, useState } from "react";

// Genera una cuadrícula y coloca las palabras (horizontal, vertical, diagonal).
function construirGrid(palabras, size = 12) {
  const g = Array.from({ length: size }, () => Array(size).fill(""));
  const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  const colocadas = [];
  const rand = (n) => Math.floor(Math.random() * n);
  for (const raw of palabras) {
    const w = raw.toUpperCase().slice(0, size);
    let ok = false;
    for (let t = 0; t < 120 && !ok; t++) {
      const [dr, dc] = dirs[rand(dirs.length)];
      const r0 = rand(size), c0 = rand(size);
      const rEnd = r0 + dr * (w.length - 1), cEnd = c0 + dc * (w.length - 1);
      if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
      let fits = true;
      for (let i = 0; i < w.length; i++) {
        const ch = g[r0 + dr * i][c0 + dc * i];
        if (ch && ch !== w[i]) { fits = false; break; }
      }
      if (!fits) continue;
      for (let i = 0; i < w.length; i++) g[r0 + dr * i][c0 + dc * i] = w[i];
      colocadas.push(w); ok = true;
    }
  }
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!g[r][c]) g[r][c] = abc[rand(26)];
  return { g, colocadas };
}

export default function SopaDeLetras({ palabras }) {
  const size = 12;
  const { g, colocadas } = useMemo(() => construirGrid(palabras.slice(0, 8), size), [palabras]);
  const [ini, setIni] = useState(null);
  const [encontradas, setEncontradas] = useState([]);
  const [pintadas, setPintadas] = useState([]); // celdas de palabras encontradas "r-c"

  function celdasEntre(a, b) {
    const dr = Math.sign(b.r - a.r), dc = Math.sign(b.c - a.c);
    const lenR = Math.abs(b.r - a.r), lenC = Math.abs(b.c - a.c);
    if (!(lenR === lenC || lenR === 0 || lenC === 0)) return null; // solo líneas rectas
    const pasos = Math.max(lenR, lenC);
    const cs = [];
    for (let i = 0; i <= pasos; i++) cs.push({ r: a.r + dr * i, c: a.c + dc * i });
    return cs;
  }
  function clickCelda(r, c) {
    if (!ini) { setIni({ r, c }); return; }
    const cs = celdasEntre(ini, { r, c });
    setIni(null);
    if (!cs) return;
    const palabra = cs.map((p) => g[p.r][p.c]).join("");
    const rev = palabra.split("").reverse().join("");
    const match = colocadas.find((w) => w === palabra || w === rev);
    if (match && !encontradas.includes(match)) {
      setEncontradas((e) => [...e, match]);
      setPintadas((p) => [...p, ...cs.map((x) => `${x.r}-${x.c}`)]);
    }
  }

  const todo = encontradas.length === colocadas.length;
  return (
    <div>
      <style>{CSS}</style>
      <div className="sopa-top">
        <div className="sopa-help">Une las letras de cada palabra: toca la primera y luego la última.</div>
        <div className="sopa-cont">{encontradas.length}/{colocadas.length}</div>
      </div>
      <div className="sopa-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {g.map((fila, r) => fila.map((ch, c) => {
          const key = `${r}-${c}`;
          const on = pintadas.includes(key);
          const sel = ini && ini.r === r && ini.c === c;
          return <button key={key} className={`sopa-cell ${on ? "hit" : ""} ${sel ? "sel" : ""}`} onClick={() => clickCelda(r, c)}>{ch}</button>;
        }))}
      </div>
      <div className="sopa-words">
        {colocadas.map((w) => <span key={w} className={`sopa-word ${encontradas.includes(w) ? "done" : ""}`}>{w}</span>)}
      </div>
      {todo && <div className="sopa-win">¡Encontraste todas las palabras! 🎉</div>}
    </div>
  );
}

const CSS = `
.sopa-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:12px;}
.sopa-help{font-size:12.5px;color:var(--muted);}
.sopa-cont{font-size:13px;font-weight:700;color:var(--azul);white-space:nowrap;}
.sopa-grid{display:grid;gap:3px;max-width:420px;margin:0 auto;}
.sopa-cell{aspect-ratio:1;border:0;background:#F1F4F9;border-radius:5px;font:inherit;font-weight:700;font-size:13px;color:var(--ink);cursor:pointer;transition:all .12s;}
.sopa-cell:hover{background:#E2E9F4;}
.sopa-cell.sel{background:var(--azul);color:#fff;}
.sopa-cell.hit{background:var(--verde);color:#fff;}
.sopa-words{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:16px;}
.sopa-word{font-size:12px;font-weight:600;color:var(--muted);padding:4px 10px;border-radius:99px;background:#F1F4F9;}
.sopa-word.done{background:var(--verde-soft);color:var(--verde-2);text-decoration:line-through;}
.sopa-win{margin-top:16px;text-align:center;font-weight:700;color:var(--verde-2);}
`;
