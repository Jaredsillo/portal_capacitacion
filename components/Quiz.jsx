"use client";
import React, { useEffect, useState } from "react";
import SopaDeLetras from "./SopaDeLetras";

// Juego posterior al material: solo sopa de letras.
export default function Quiz({ sistema, onCerrar, onAprobado }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/quiz/${sistema.id}`).then((r) => r.json())
      .then((d) => d.error ? setErr(d.error) : setData(d)).catch(() => setErr("No se pudo cargar la evaluación."));
  }, [sistema.id]);

  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <style>{CSS}</style>
      <div className="quiz">
        <div className="qhead">
          <div><div className="k">Evaluación · {sistema.nombre}</div>
            <h3 className="serif">Sopa de letras</h3></div>
          <button className="x" onClick={onCerrar}>×</button>
        </div>

        <div className="qbody">
          {err && <p className="msg-err">{err}</p>}
          {!data && !err && <p className="cargando">Cargando sopa de letras…</p>}
          {data && <SopaDeLetras palabras={data.palabras || []} />}
        </div>

        <div className="qfoot">
          <span className="hint">Resuelve la sopa y cuando termines, completa el material.</span>
          <button className="cta" onClick={() => { onAprobado?.(); onCerrar?.(); }}>Completar material</button>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.ov{position:fixed;inset:0;background:rgba(15,25,48,.55);display:grid;place-items:center;padding:20px;z-index:50;}
.quiz{background:#fff;width:min(620px,100%);max-height:92vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px rgba(10,20,45,.6);}
.qhead{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.qhead .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.qhead h3{margin:2px 0 0;font-size:19px;font-weight:600;}
.x{margin-left:auto;border:0;background:#F1F4F9;width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:18px;color:var(--muted);}
.qbody{padding:22px;overflow-y:auto;}
.cargando,.msg-err{color:var(--muted);text-align:center;padding:30px;}
.msg-err{color:#B23;}
.qfoot{padding:14px 22px;border-top:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.hint{font-size:12.5px;color:var(--muted);flex:1;}
.cta{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;cursor:pointer;background:var(--verde-2);color:#fff;margin-left:auto;}
.cta:disabled{opacity:.4;cursor:not-allowed;}
`;
