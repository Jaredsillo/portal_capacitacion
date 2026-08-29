"use client";
import React, { useEffect, useState } from "react";
import SopaDeLetras from "./SopaDeLetras";
import Ahorcado from "./Ahorcado";
import Modal from "./Modal";

const TITULOS = { ahorcado: "Ahorcado", sopa: "Sopa de letras" };

// Juego posterior al material: sopa de letras o ahorcado, según lo configure el admin.
export default function Quiz({ sistema, onCerrar, onAprobado }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/quiz/${sistema.id}`).then((r) => r.json())
      .then((d) => d.error ? setErr(d.error) : setData(d)).catch(() => setErr("No se pudo cargar el juego."));
  }, [sistema.id]);

  const titulo = TITULOS[data?.tipoJuego] || "Juego";

  return (
    <Modal onClose={onCerrar} className="quiz" ariaLabel={`${titulo} de ${sistema.nombre}`} zIndex={60}>
      <style>{CSS}</style>
      <div className="qhead">
        <div><div className="k">Juego · {sistema.nombre}</div>
          <h3 className="serif">{titulo}</h3></div>
        <button className="x" onClick={onCerrar} aria-label="Cerrar juego">×</button>
      </div>

      <div className="qbody">
        {err && <p className="msg-err" role="alert">{err}</p>}
        {!data && !err && <div className="skel" style={{ height: 220 }} aria-label="Cargando juego…" />}
        {data && (data.tipoJuego === "ahorcado"
          ? <Ahorcado palabras={data.palabras || []} />
          : <SopaDeLetras palabras={data.palabras || []} />)}
      </div>

      <div className="qfoot">
        <span className="hint">Termina el juego y cuando quieras, completa el material.</span>
        <button className="cta" onClick={() => { onAprobado?.(); onCerrar?.(); }}>Completar material</button>
      </div>
    </Modal>
  );
}

const CSS = `
.quiz{background:var(--card);width:min(620px,100%);max-height:92vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px var(--shadow);}
.qhead{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.qhead .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.qhead h3{margin:2px 0 0;font-size:19px;font-weight:600;}
.x{margin-left:auto;border:0;background:var(--bg);width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:18px;color:var(--muted);}
.qbody{padding:22px;overflow-y:auto;}
.cargando,.msg-err{color:var(--muted);text-align:center;padding:30px;}
.msg-err{color:var(--error);}
.qfoot{padding:14px 22px;border-top:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.hint{font-size:12.5px;color:var(--muted);flex:1;}
.cta{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;cursor:pointer;background:var(--verde-2);color:#fff;margin-left:auto;}
.cta:disabled{opacity:.4;cursor:not-allowed;}
`;
