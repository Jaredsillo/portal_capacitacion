"use client";
import React, { useEffect, useState } from "react";
import Modal from "./Modal";

const preguntaVacia = (tipo = "opcion") => ({
  texto: "", tipo,
  opciones: tipo === "vf" ? ["Verdadero", "Falso"] : ["", "", "", ""],
  respuesta_correcta: 0, explicacion: "",
});

export default function EditorQuiz({ manual, onCerrar, onGuardado }) {
  const [preguntas, setPreguntas] = useState([]);
  const [palabras, setPalabras] = useState([]);
  const [minAprobar, setMinAprobar] = useState(60);
  const [nuevaPalabra, setNuevaPalabra] = useState("");
  const [cargando, setCargando] = useState(true);
  const [msg, setMsg] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorIdx, setErrorIdx] = useState(null); // índice de la pregunta con el problema, para resaltarla

  useEffect(() => {
    fetch(`/api/admin/quiz/${manual.id}`).then((r) => r.json()).then((d) => {
      setPreguntas(d.preguntas?.length ? d.preguntas : [preguntaVacia()]);
      setPalabras(d.palabras || []);
      setMinAprobar(d.minAprobar || 60);
      setCargando(false);
    }).catch(() => { setPreguntas([preguntaVacia()]); setCargando(false); });
  }, [manual.id]);

  function setPreg(i, campo, valor) { setPreguntas((ps) => ps.map((p, idx) => idx === i ? { ...p, [campo]: valor } : p)); }
  function setOpcion(i, j, valor) { setPreguntas((ps) => ps.map((p, idx) => idx === i ? { ...p, opciones: p.opciones.map((o, k) => k === j ? valor : o) } : p)); }
  function cambiarTipo(i, tipo) {
    setPreguntas((ps) => ps.map((p, idx) => idx === i ? { ...p, tipo, opciones: tipo === "vf" ? ["Verdadero", "Falso"] : ["", "", "", ""], respuesta_correcta: 0 } : p));
  }
  function agregarPregunta() { setPreguntas((ps) => [...ps, preguntaVacia()]); }
  function quitarPregunta(i) { setPreguntas((ps) => ps.filter((_, idx) => idx !== i)); }

  function agregarPalabra() {
    const w = nuevaPalabra.toUpperCase().normalize("NFD").replace(/[^A-Z]/g, "");
    if (w.length >= 3 && w.length <= 12 && !palabras.includes(w) && palabras.length < 10) setPalabras((p) => [...p, w]);
    setNuevaPalabra("");
  }

  async function guardar() {
    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i];
      if (!p.texto.trim()) { setErrorIdx(i); return setMsg(`La pregunta ${i + 1} necesita un texto.`); }
      const ops = p.tipo === "vf" ? p.opciones : p.opciones.filter((o) => o.trim());
      if (ops.length < 2) { setErrorIdx(i); return setMsg(`La pregunta ${i + 1} necesita al menos 2 opciones.`); }
    }
    setErrorIdx(null);
    setGuardando(true); setMsg("");
    const r = await fetch("/api/admin/quiz-guardar", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manualId: manual.id, minAprobar, preguntas, palabras }),
    });
    setGuardando(false);
    if (r.ok) { onGuardado?.(); onCerrar(); }
    else { const d = await r.json().catch(() => ({})); setMsg(d.error || "No se pudo guardar."); }
  }

  return (
    <Modal onClose={onCerrar} className="ed" ariaLabel={`Evaluación del manual ${manual.titulo}`} zIndex={70}>
      <style>{CSS}</style>
      <div className="ehead">
        <div><div className="k">Evaluación del manual</div><h3 className="serif">{manual.titulo}</h3></div>
        <button className="x" onClick={onCerrar} aria-label="Cerrar editor de evaluación">×</button>
      </div>

      <div className="ebody">
        {cargando ? <div className="skel" style={{ height: 160 }} aria-label="Cargando…" /> : (
            <>
              {preguntas.map((p, i) => (
                <div key={i} className={`qcard ${errorIdx === i ? "qcard-error" : ""}`}>
                  <div className="qtop">
                    <span className="qn">Pregunta {i + 1}</span>
                    <select className="tsel" value={p.tipo} onChange={(e) => cambiarTipo(i, e.target.value)}>
                      <option value="opcion">Opción múltiple</option>
                      <option value="vf">Verdadero / Falso</option>
                    </select>
                    {preguntas.length > 1 && <button className="del" onClick={() => quitarPregunta(i)} aria-label={`Quitar pregunta ${i + 1}`}>Quitar</button>}
                  </div>
                  <input className={`qtexto ${errorIdx === i && !p.texto.trim() ? "campo-error" : ""}`} placeholder="Escribe la pregunta…" value={p.texto}
                    onChange={(e) => { setPreg(i, "texto", e.target.value); if (errorIdx === i) setErrorIdx(null); }} />
                  <div className="opts">
                    {p.opciones.map((o, j) => (
                      <div key={j} className="optrow">
                        <label className="radio" title="Marcar como correcta">
                          <input type="radio" name={`correcta-${i}`} checked={p.respuesta_correcta === j} onChange={() => setPreg(i, "respuesta_correcta", j)} />
                          <span />
                        </label>
                        {p.tipo === "vf"
                          ? <span className="vf">{o}</span>
                          : <input className="oinput" placeholder={`Opción ${j + 1}`} value={o} onChange={(e) => setOpcion(i, j, e.target.value)} />}
                      </div>
                    ))}
                  </div>
                  <input className="qexpl" placeholder="Explicación (opcional, se muestra al calificar)" value={p.explicacion} onChange={(e) => setPreg(i, "explicacion", e.target.value)} />
                  <p className="hintc">● La opción marcada con el círculo azul es la correcta.</p>
                </div>
              ))}
              <button className="add" onClick={agregarPregunta}>+ Agregar pregunta</button>

              <div className="sep" />
              <h4 className="subh">Sopa de letras — palabras clave</h4>
              <p className="subt2">Palabras del manual (3 a 12 letras, sin espacios ni acentos). Máximo 10.</p>
              <div className="palabras">
                {palabras.map((w) => (
                  <span key={w} className="tag">{w}<button onClick={() => setPalabras((p) => p.filter((x) => x !== w))}>×</button></span>
                ))}
              </div>
              <div className="addpal">
                <input value={nuevaPalabra} placeholder="NUEVA PALABRA" onChange={(e) => setNuevaPalabra(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && agregarPalabra()} />
                <button onClick={agregarPalabra}>Agregar</button>
              </div>

              <div className="sep" />
              <label className="minap">Puntaje mínimo para aprobar:
                <input type="number" min="1" max="100" value={minAprobar} onChange={(e) => setMinAprobar(e.target.value)} /> %
              </label>
            </>
          )}
        </div>

      <div className="efoot">
        {msg && <span className="msg" role="alert">{msg}</span>}
        <button className="ghost" onClick={onCerrar}>Cancelar</button>
        <button className="cta" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar evaluación"}</button>
      </div>
    </Modal>
  );
}

const CSS = `
.ed{background:var(--card);width:min(680px,100%);max-height:92vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px var(--shadow);}
.ehead{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.ehead .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.ehead h3{margin:2px 0 0;font-size:18px;font-weight:600;}
.x{margin-left:auto;border:0;background:var(--bg);width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:18px;color:var(--muted);}
.ebody{padding:20px 22px;overflow-y:auto;}
.cargando{color:var(--muted);text-align:center;padding:30px;}
.qcard{border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px;background:var(--bg);}
.qcard-error{border-color:var(--error);}
.qtop{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.qn{font-size:13px;font-weight:700;color:var(--azul);}
.tsel{font:inherit;font-size:12.5px;padding:5px 8px;border:1px solid var(--line);border-radius:7px;background:var(--card);margin-left:auto;color:var(--ink);}
.del{font:inherit;font-size:12px;font-weight:600;color:var(--error);background:none;border:1px solid var(--line);border-radius:7px;padding:5px 10px;cursor:pointer;}
.qtexto{width:100%;font:inherit;font-size:14px;font-weight:600;padding:10px 12px;border:1px solid var(--line);border-radius:9px;margin-bottom:10px;background:var(--card);color:var(--ink);}
.opts{display:flex;flex-direction:column;gap:7px;margin-bottom:10px;}
.optrow{display:flex;align-items:center;gap:10px;}
.radio{position:relative;display:inline-flex;cursor:pointer;}
.radio input{position:absolute;opacity:0;}
.radio span{width:20px;height:20px;border-radius:50%;border:2px solid var(--line);display:inline-block;}
.radio input:checked + span{border-color:var(--azul);background:var(--azul);box-shadow:inset 0 0 0 3px var(--card);}
.radio input:focus-visible + span{outline:2.5px solid var(--focus);outline-offset:2px;}
.oinput{flex:1;font:inherit;font-size:13.5px;padding:8px 11px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);}
.vf{font-size:14px;font-weight:600;color:var(--ink);}
.qexpl{width:100%;font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid var(--line);border-radius:8px;color:var(--muted);background:var(--card);}
.hintc{margin:8px 0 0;font-size:11px;color:var(--muted);}
.add{width:100%;font:inherit;font-size:13.5px;font-weight:600;color:var(--azul);background:var(--verde-soft);border:1px dashed var(--azul-2);border-radius:10px;padding:11px;cursor:pointer;}
.sep{height:1px;background:var(--line);margin:20px 0;}
.subh{margin:0 0 3px;font-size:15px;font-weight:700;}
.subt2{margin:0 0 12px;font-size:12.5px;color:var(--muted);}
.palabras{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;}
.tag{display:inline-flex;align-items:center;gap:6px;background:var(--verde-soft);color:var(--verde-2);font-size:12px;font-weight:700;padding:5px 10px;border-radius:99px;}
.tag button{border:0;background:none;color:var(--verde-2);cursor:pointer;font-size:14px;line-height:1;}
.addpal{display:flex;gap:8px;}
.addpal input{flex:1;font:inherit;font-size:13px;padding:9px 12px;border:1px solid var(--line);border-radius:9px;text-transform:uppercase;background:var(--card);color:var(--ink);}
.addpal button{font:inherit;font-size:13px;font-weight:600;padding:9px 16px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--azul);cursor:pointer;}
.minap{font-size:13.5px;font-weight:600;color:var(--ink);display:flex;align-items:center;gap:8px;}
.minap input{width:70px;font:inherit;font-size:14px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);}
.efoot{padding:14px 22px;border-top:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.msg{font-size:12.5px;color:var(--error);flex:1;}
.ghost{font:inherit;font-size:14px;font-weight:600;padding:11px 18px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--muted);cursor:pointer;margin-left:auto;}
.cta{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;background:var(--verde-2);color:#fff;cursor:pointer;}
.cta:disabled{opacity:.5;cursor:not-allowed;}
`;
