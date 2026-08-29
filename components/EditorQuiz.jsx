"use client";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";

export default function EditorQuiz({ manual, onCerrar, onGuardado }) {
  const [palabras, setPalabras] = useState([]);
  const [nuevaPalabra, setNuevaPalabra] = useState("");
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorPalabras, setErrorPalabras] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/quiz/${manual.id}`).then((r) => r.json()).then((d) => {
      setPalabras(d.palabras || []);
      setCargando(false);
    }).catch(() => setCargando(false));
  }, [manual.id]);

  function agregarPalabra() {
    const w = nuevaPalabra.toUpperCase().normalize("NFD").replace(/[^A-Z]/g, "");
    if (w.length >= 3 && w.length <= 12 && !palabras.includes(w) && palabras.length < 10) {
      setPalabras((p) => [...p, w]);
      setErrorPalabras(false);
    }
    setNuevaPalabra("");
  }
  function quitarPalabra(w) { setPalabras((p) => p.filter((x) => x !== w)); }

  async function guardar() {
    if (palabras.length === 0) { setErrorPalabras(true); return setMsg("Agrega al menos una palabra clave."); }
    setErrorPalabras(false);
    setGuardando(true); setMsg("");
    const r = await fetch("/api/admin/quiz-guardar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manualId: manual.id, palabras }),
    });
    setGuardando(false);
    if (r.ok) { onGuardado?.(); onCerrar(); }
    else { const d = await r.json().catch(() => ({})); setMsg(d.error || "No se pudo guardar."); }
  }

  return (
    <Modal onClose={onCerrar} className="ed" ariaLabel={`Juego del manual ${manual.titulo}`} zIndex={70}>
      <style suppressHydrationWarning>{CSS}</style>
      <div className="ehead">
        <div><div className="k">Juego posterior al manual</div><h3 className="serif">{manual.titulo}</h3></div>
        <button className="x" onClick={onCerrar} aria-label="Cerrar editor de juego">×</button>
      </div>

      <div className="ebody">
        {cargando ? <div className="skel" style={{ height: 120 }} aria-label="Cargando…" /> : (
          <>
            <h4 className="subh">Palabras clave</h4>
            <p className="subt2">
              El colaborador las practica justo después de leer el manual, jugando la sopa de letras
              o el ahorcado — él elige cuál. Captura de 3 a 12 letras, sin espacios ni acentos. Máximo 10.
            </p>
            <div className={`palabras ${errorPalabras ? "campo-error-box" : ""}`}>
              {palabras.map((w) => (
                <span key={w} className="tag">{w}<button onClick={() => quitarPalabra(w)} aria-label={`Quitar palabra ${w}`}>×</button></span>
              ))}
              {palabras.length === 0 && <span className="sinpalabras">Aún no hay palabras.</span>}
            </div>
            <div className="addpal">
              <input value={nuevaPalabra} placeholder="NUEVA PALABRA" onChange={(e) => setNuevaPalabra(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarPalabra())} aria-label="Nueva palabra clave" />
              <button onClick={agregarPalabra}>Agregar</button>
            </div>
            {errorPalabras && <span className="campo-error-msg">Agrega al menos una palabra clave.</span>}
          </>
        )}
      </div>

      <div className="efoot">
        {msg && <span className="msg" role="alert">{msg}</span>}
        <button className="ghost" onClick={onCerrar}>Cancelar</button>
        <button className="cta" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar juego"}</button>
      </div>
    </Modal>
  );
}

const CSS = `
.ed{background:var(--card);width:min(560px,100%);max-height:92vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px var(--shadow);}
.ehead{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.ehead .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.ehead h3{margin:2px 0 0;font-size:18px;font-weight:600;}
.x{margin-left:auto;border:0;background:var(--bg);width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:18px;color:var(--muted);}
.ebody{padding:20px 22px;overflow-y:auto;}
.subh{margin:0 0 3px;font-size:15px;font-weight:700;}
.subt2{margin:0 0 12px;font-size:12.5px;color:var(--muted);line-height:1.5;}
.palabras{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;min-height:32px;}
.palabras.campo-error-box{outline:2px solid var(--error);outline-offset:4px;border-radius:8px;}
.sinpalabras{font-size:12.5px;color:var(--muted);}
.tag{display:inline-flex;align-items:center;gap:6px;background:var(--verde-soft);color:var(--verde-2);font-size:12px;font-weight:700;padding:5px 10px;border-radius:99px;}
.tag button{border:0;background:none;color:var(--verde-2);cursor:pointer;font-size:14px;line-height:1;}
.addpal{display:flex;gap:8px;}
.addpal input{flex:1;font:inherit;font-size:13px;padding:9px 12px;border:1px solid var(--line);border-radius:9px;text-transform:uppercase;background:var(--card);color:var(--ink);}
.addpal button{font:inherit;font-size:13px;font-weight:600;padding:9px 16px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--azul);cursor:pointer;}
.efoot{padding:14px 22px;border-top:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.msg{font-size:12.5px;color:var(--error);flex:1;}
.ghost{font:inherit;font-size:14px;font-weight:600;padding:11px 18px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--muted);cursor:pointer;margin-left:auto;}
.cta{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;background:var(--verde-2);color:#fff;cursor:pointer;}
.cta:disabled{opacity:.5;cursor:not-allowed;}
`;
