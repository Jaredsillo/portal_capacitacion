"use client";
import React, { useState } from "react";
import Modal from "./Modal";

export default function EditarUsuario({ usuario, onCerrar, onGuardado }) {
  const [form, setForm] = useState({
    nombre_completo: usuario.nombre || "",
    correo: usuario.correo || "",
    puesto: usuario.puesto || "",
    area: usuario.area || "",
    num_reloj_checador: usuario.reloj || "",
    rol: usuario.rol || "usuario",
  });
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState("");
  const [guardando, setGuardando] = useState(false);

  function set(campo, v) {
    setForm((f) => ({ ...f, [campo]: v }));
    setErrores((e) => ({ ...e, [campo]: false }));
  }

  async function guardar() {
    const faltan = { nombre_completo: !form.nombre_completo.trim(), correo: !form.correo.trim() };
    if (faltan.nombre_completo || faltan.correo) { setErrores(faltan); return setMsg("Nombre y correo son obligatorios."); }
    setErrores({});
    setGuardando(true); setMsg("");
    const r = await fetch("/api/usuarios", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "editar", usuarioId: usuario.id, ...form }),
    });
    setGuardando(false);
    if (r.ok) { onGuardado?.(); onCerrar(); }
    else { const d = await r.json().catch(() => ({})); setMsg(d.error || "No se pudo guardar."); }
  }

  return (
    <Modal onClose={onCerrar} className="eu" ariaLabel={`Editar a ${usuario.nombre}`} zIndex={70}>
      <style>{CSS}</style>
      <div className="euhead">
        <div><div className="k">Editar colaborador</div><h3 className="serif">{usuario.nombre}</h3></div>
        <button className="x" onClick={onCerrar} aria-label="Cerrar edición">×</button>
      </div>

      <div className="eubody">
        <Field label="Nombre del colaborador *" val={form.nombre_completo} on={(v) => set("nombre_completo", v)} error={errores.nombre_completo} />
        <Field label="Correo institucional *" val={form.correo} on={(v) => set("correo", v)} error={errores.correo} />
        <Field label="Puesto" val={form.puesto} on={(v) => set("puesto", v)} />
        <Field label="Área" val={form.area} on={(v) => set("area", v)} />
        <Field label="Núm. reloj checador" val={form.num_reloj_checador} on={(v) => set("num_reloj_checador", v)} />
        <label className="fl">Rol
          <select className="fi" value={form.rol} onChange={(e) => set("rol", e.target.value)}>
            <option value="usuario">Empleado</option>
            <option value="th">Talento Humano</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
      </div>

      <div className="eufoot">
        {msg && <span className="msg" role="alert">{msg}</span>}
        <button className="ghost" onClick={onCerrar}>Cancelar</button>
        <button className="cta" disabled={guardando} onClick={guardar}>{guardando ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </Modal>
  );
}

function Field({ label, val, on, error }) {
  return (
    <label className="fl">{label}
      <input className={`fi ${error ? "campo-error" : ""}`} value={val} onChange={(e) => on(e.target.value)} aria-invalid={error || undefined} />
      {error && <span className="campo-error-msg">Este campo es obligatorio.</span>}
    </label>
  );
}

const CSS = `
.eu{background:var(--card);width:min(440px,100%);max-height:92vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px var(--shadow);}
.euhead{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.euhead .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.euhead h3{margin:2px 0 0;font-size:18px;font-weight:600;}
.x{margin-left:auto;border:0;background:var(--bg);width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:18px;color:var(--muted);}
.eubody{padding:20px 22px;overflow-y:auto;}
.fl{display:block;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:14px;}
.fi{display:block;width:100%;margin-top:6px;font:inherit;font-size:14px;color:var(--ink);padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--card);}
.eufoot{padding:14px 22px;border-top:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.msg{font-size:12.5px;color:var(--error);flex:1;}
.ghost{font:inherit;font-size:14px;font-weight:600;padding:11px 18px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--muted);cursor:pointer;margin-left:auto;}
.cta{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;background:var(--verde-2);color:#fff;cursor:pointer;}
.cta:disabled{opacity:.5;cursor:not-allowed;}
`;
