"use client";
import React, { useState } from "react";
import Modal from "./Modal";

export default function EditarSistema({ sistema, onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    nombre: sistema.nombre || "",
    descripcion: sistema.descripcion || "",
    url_destino: sistema.url_destino || "",
  });
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");
  const [guardando, setGuardando] = useState(false);

  function set(campo, v) {
    setForm((f) => ({ ...f, [campo]: v }));
    if (campo === "nombre") setError(false);
  }

  async function guardar() {
    if (!form.nombre.trim()) { setError(true); return setMsg("El nombre del sistema es obligatorio."); }
    setError(false);
    setGuardando(true); setMsg("");
    const r = await fetch("/api/admin/sistemas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sistemaId: sistema.id, ...form }),
    });
    setGuardando(false);
    if (r.ok) { onGuardado?.(); onCerrar(); }
    else { const d = await r.json().catch(() => ({})); setMsg(d.error || "No se pudo guardar."); }
  }

  return (
    <Modal onClose={onCerrar} className="es" ariaLabel={`Editar sistema ${sistema.nombre}`} zIndex={70}>
      <style>{CSS}</style>
      <div className="eshead">
        <div><div className="k">Editar sistema</div><h3 className="serif">{sistema.nombre}</h3></div>
        <button className="x" onClick={onCerrar} aria-label="Cerrar edición">×</button>
      </div>

      <div className="esbody">
        <label className="fl">Nombre *
          <input className={`fi ${error ? "campo-error" : ""}`} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} aria-invalid={error || undefined} />
          {error && <span className="campo-error-msg">Este campo es obligatorio.</span>}
        </label>
        <label className="fl">Descripción
          <input className="fi" value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
        </label>
        <label className="fl">URL del sistema
          <input className="fi" value={form.url_destino} placeholder="https://..." onChange={(e) => set("url_destino", e.target.value)} />
        </label>
      </div>

      <div className="esfoot">
        {msg && <span className="msg" role="alert">{msg}</span>}
        <button className="ghost" onClick={onCerrar}>Cancelar</button>
        <button className="cta" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </Modal>
  );
}

const CSS = `
.es{background:var(--card);width:min(440px,100%);max-height:92vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px var(--shadow);}
.eshead{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.eshead .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.eshead h3{margin:2px 0 0;font-size:18px;font-weight:600;}
.x{margin-left:auto;border:0;background:var(--bg);width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:18px;color:var(--muted);}
.esbody{padding:20px 22px;overflow-y:auto;}
.fl{display:block;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:14px;}
.fi{display:block;width:100%;margin-top:6px;font:inherit;font-size:14px;color:var(--ink);padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--card);}
.esfoot{padding:14px 22px;border-top:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.msg{font-size:12.5px;color:var(--error);flex:1;}
.ghost{font:inherit;font-size:14px;font-weight:600;padding:11px 18px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--muted);cursor:pointer;margin-left:auto;}
.cta{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;background:var(--verde-2);color:#fff;cursor:pointer;}
.cta:disabled{opacity:.5;cursor:not-allowed;}
`;
