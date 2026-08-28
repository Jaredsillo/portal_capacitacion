"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import EditorQuiz from "@/components/EditorQuiz";

export default function AdminClient({ usuarios, sistemas, manuales, actividades, asignaciones: asigInicial, salir }) {
  const router = useRouter();
  const [tab, setTab] = useState("actividad");
  const [asignaciones, setAsignaciones] = useState(asigInicial);
  const [selUser, setSelUser] = useState(usuarios.find((u) => u.estado === "alta")?.id || usuarios[0]?.id);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ nombre_completo: "", correo: "", puesto: "", area: "", num_reloj_checador: "", rol: "usuario" });
  const [sisForm, setSisForm] = useState({ nombre: "", descripcion: "", url_destino: "" });
  const [subida, setSubida] = useState({ sistema_id: "", titulo: "", codigo: "", version: "V00", archivo: null });
  const [editando, setEditando] = useState(null); // manual cuyo quiz se edita

  function notar(m) { setToast(m); setTimeout(() => setToast(""), 3000); }

  async function crearSistema(e) {
    e.preventDefault();
    if (!sisForm.nombre) return notar("El nombre del sistema es obligatorio.");
    const r = await fetch("/api/admin/sistemas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sisForm) });
    if (r.ok) { notar("Sistema creado."); setSisForm({ nombre: "", descripcion: "", url_destino: "" }); router.refresh(); }
    else notar("No se pudo crear el sistema.");
  }
  async function subirManual(e) {
    e.preventDefault();
    if (!subida.archivo || !subida.sistema_id || !subida.titulo) return notar("Sistema, título y archivo son obligatorios.");
    const fd = new FormData();
    Object.entries(subida).forEach(([k, v]) => fd.append(k, v));
    notar("Subiendo material…");
    const r = await fetch("/api/admin/manual-upload", { method: "POST", body: fd });
    if (r.ok) {
      const d = await r.json();
      notar(d.tipo === "video" ? "Video subido correctamente." : `Manual subido (${d.paginas} páginas).`);
      setSubida({ sistema_id: "", titulo: "", codigo: "", version: "V00", archivo: null });
      router.refresh();
    }
    else { const d = await r.json().catch(() => ({})); notar(d.error || "No se pudo subir el material."); }
  }

  async function toggleAsig(usuarioId, sistemaId) {
    const activo = asignaciones[usuarioId]?.includes(sistemaId);
    setAsignaciones((a) => {
      const cur = a[usuarioId] || [];
      return { ...a, [usuarioId]: activo ? cur.filter((x) => x !== sistemaId) : [...cur, sistemaId] };
    });
    await fetch("/api/asignaciones", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId, sistemaId, activar: !activo }) });
  }

  async function darAlta(e) {
    e.preventDefault();
    if (!form.nombre_completo || !form.correo) return notar("Nombre y correo son obligatorios.");
    const r = await fetch("/api/usuarios", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }) });
    if (r.ok) { notar("Usuario dado de alta."); setForm({ nombre_completo: "", correo: "", puesto: "", area: "", num_reloj_checador: "", rol: "usuario" }); router.refresh(); }
    else { const d = await r.json().catch(() => ({})); notar(d.error || "No se pudo dar de alta."); }
  }
  async function darBaja(usuarioId) {
    await fetch("/api/usuarios", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "baja", usuarioId }) });
    notar("Usuario dado de baja."); router.refresh();
  }

  const sel = usuarios.find((u) => u.id === selUser);
  const etiqueta = { login: ["Inicio de sesión", "ev-login"], ver_manual: ["Abrió manual", "ev-ver"], marcar_leido: ["Manual leído", "ev-leido"], click_sistema: ["Acceso a sistema", "ev-click"], admin: ["Administración", "ev-admin"] };

  return (
    <div>
      <style>{CSS}</style>
      <div className="bar">
        <div className="brand"><Marca /><div><div className="eyebrow">Universidad Hipócrates</div><div className="title serif">Panel de Administración</div></div></div>
        <div className="user"><a className="link" href="/dashboard">Ver como empleado</a><form action={salir}><button className="link" type="submit">Salir</button></form></div>
      </div>

      <div className="wrap">
        <div className="subtabs">
          {[["actividad", "Actividad"], ["asignaciones", "Asignaciones"], ["usuarios", "Usuarios"], ["sistemas", "Sistemas"], ["manuales", "Manuales y evaluaciones"]].map(([k, l]) => (
            <button key={k} className={`subtab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "actividad" && (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <a className="save" href="/api/admin/reporte" style={{ textDecoration: "none", display: "inline-block" }}>⬇ Exportar reporte (CSV)</a>
            </div>
            <div className="stats">
              <Stat v={usuarios.filter((u) => u.estado === "alta").length} l="Empleados activos" />
              <Stat v={actividades.filter((a) => a.evento === "marcar_leido").length} l="Manuales leídos" />
              <Stat v={actividades.filter((a) => a.evento === "click_sistema").length} l="Accesos a sistemas" />
              <Stat v={actividades.length} l="Eventos registrados" />
            </div>
            <div className="table">
              <table><thead><tr><th>Usuario</th><th>Evento</th><th>Detalle</th><th>Fecha y hora</th></tr></thead>
                <tbody>{actividades.map((a) => { const [txt, cls] = etiqueta[a.evento] || ["Evento", "ev-login"];
                  return <tr key={a.id}><td>{a.usuario}</td><td><span className={`ev ${cls}`}>{txt}</span></td><td>{a.detalle}</td><td style={{ color: "#5B6B85" }}>{a.fecha}</td></tr>; })}
                  {actividades.length === 0 && <tr><td colSpan="4" style={{ textAlign: "center", padding: 30, color: "#5B6B85" }}>Sin actividad aún.</td></tr>}
                </tbody></table>
            </div>
          </>
        )}

        {tab === "asignaciones" && (
          <div className="assign">
            <div className="people">
              {usuarios.map((u) => (
                <div key={u.id} className={`person ${selUser === u.id ? "on" : ""}`} onClick={() => setSelUser(u.id)}>
                  <div className="pa">{(u.nombre || "U")[0]}</div>
                  <div><div className="pn">{u.nombre}{u.estado === "baja" && <span className="baja"> baja</span>}</div><div className="pd">{u.area || u.correo}</div></div>
                </div>
              ))}
            </div>
            <div className="assignbox">
              <h4>Sistemas de {sel?.nombre}</h4>
              <p className="subt">Marca los sistemas que verá en su portal. El cambio se guarda al instante.</p>
              {sistemas.map((s) => {
                const on = asignaciones[selUser]?.includes(s.id);
                return (
                  <div key={s.id} className="row">
                    <div className={`check ${on ? "on" : ""}`} onClick={() => toggleAsig(selUser, s.id)}>{on ? "✓" : ""}</div>
                    <span className="rn">{s.nombre}</span><span className="rp">{on ? "asignado" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "usuarios" && (
          <div className="assign">
            <form className="assignbox" onSubmit={darAlta}>
              <h4>Alta de colaborador</h4>
              <p className="subt">Réplica digital de la Solicitud de Cuentas de Usuario.</p>
              <Field label="Nombre del colaborador *" val={form.nombre_completo} on={(v) => setForm({ ...form, nombre_completo: v })} />
              <Field label="Correo institucional *" val={form.correo} on={(v) => setForm({ ...form, correo: v })} ph="nombre@uhipocrates.edu.mx" />
              <Field label="Puesto" val={form.puesto} on={(v) => setForm({ ...form, puesto: v })} />
              <Field label="Área" val={form.area} on={(v) => setForm({ ...form, area: v })} />
              <Field label="Núm. reloj checador" val={form.num_reloj_checador} on={(v) => setForm({ ...form, num_reloj_checador: v })} />
              <label className="fl">Rol
                <select className="fi" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="usuario">Empleado</option><option value="admin">Administrador</option>
                </select>
              </label>
              <button className="save" type="submit">Dar de alta</button>
            </form>
            <div className="assignbox">
              <h4>Colaboradores</h4>
              <div className="table" style={{ marginTop: 12 }}>
                <table><thead><tr><th>Nombre</th><th>Área</th><th>Estado</th><th>Últ. acceso</th><th></th></tr></thead>
                  <tbody>{usuarios.map((u) => (
                    <tr key={u.id}><td>{u.nombre}<div style={{ fontSize: 11, color: "#5B6B85" }}>{u.correo}</div></td>
                      <td>{u.area || "—"}</td>
                      <td>{u.estado === "alta" ? <span className="ev ev-leido">activo</span> : <span className="ev ev-admin">baja</span>}</td>
                      <td style={{ color: "#5B6B85" }}>{u.ultimo}</td>
                      <td>{u.estado === "alta" && u.rol !== "admin" && <button className="mini" onClick={() => darBaja(u.id)}>Baja</button>}</td>
                    </tr>
                  ))}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {tab === "sistemas" && (
          <div className="assign">
            <form className="assignbox" onSubmit={crearSistema}>
              <h4>Nuevo sistema</h4>
              <p className="subt">Da de alta un sistema (SAE, SIADUH, correo, etc.) con su enlace.</p>
              <Field label="Nombre *" val={sisForm.nombre} on={(v) => setSisForm({ ...sisForm, nombre: v })} />
              <Field label="Descripción" val={sisForm.descripcion} on={(v) => setSisForm({ ...sisForm, descripcion: v })} />
              <Field label="URL del sistema" val={sisForm.url_destino} on={(v) => setSisForm({ ...sisForm, url_destino: v })} ph="https://..." />
              <button className="save" type="submit">Crear sistema</button>
            </form>
            <div className="assignbox">
              <h4>Sistemas registrados</h4>
              <div className="table" style={{ marginTop: 12 }}>
                <table><thead><tr><th>Sistema</th><th>URL</th></tr></thead>
                  <tbody>{sistemas.map((s) => (
                    <tr key={s.id}><td><b>{s.nombre}</b><div style={{ fontSize: 11, color: "#5B6B85" }}>{s.descripcion}</div></td>
                      <td><a className="link" href={s.url_destino} target="_blank" rel="noopener">{s.url_destino}</a></td></tr>
                  ))}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {tab === "manuales" && (
          <div className="assign">
            <form className="assignbox" onSubmit={subirManual}>
              <h4>Subir material (PDF o video)</h4>
              <p className="subt">El archivo se guarda privado. Después puedes crear su evaluación.</p>
              <label className="fl">Sistema *
                <select className="fi" value={subida.sistema_id} onChange={(e) => setSubida({ ...subida, sistema_id: e.target.value })}>
                  <option value="">— elige —</option>
                  {sistemas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </label>
              <Field label="Título *" val={subida.titulo} on={(v) => setSubida({ ...subida, titulo: v })} />
              <Field label="Código" val={subida.codigo} on={(v) => setSubida({ ...subida, codigo: v })} ph="SGCUH-CSRDT-M-00X" />
              <Field label="Versión" val={subida.version} on={(v) => setSubida({ ...subida, version: v })} />
              <label className="fl">Archivo *
                <input className="fi" type="file" accept="application/pdf,video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v" onChange={(e) => setSubida({ ...subida, archivo: e.target.files[0] })} />
              </label>
              <button className="save" type="submit">Subir material</button>
            </form>
            <div className="assignbox">
              <h4>Manuales y evaluaciones</h4>
              <p className="subt">Crea la evaluación de cada manual: preguntas de opción múltiple / V-F y las palabras de la sopa de letras.</p>
              <div className="table" style={{ marginTop: 12 }}>
                <table><thead><tr><th>Material</th><th>Sistema</th><th>Evaluación</th><th></th></tr></thead>
                  <tbody>{(manuales || []).map((m) => (
                    <tr key={m.id}><td><b>{m.codigo || m.titulo}</b><div style={{ fontSize: 11, color: "#5B6B85" }}>{m.paginas} pág. · {m.version}</div></td>
                      <td>{m.sistema}</td>
                      <td>
                        <div>{m.tieneQuiz ? <span className="ev ev-leido">creada</span> : <span className="ev ev-admin">sin evaluación</span>}</div>
                        <div style={{ marginTop: 4 }}><span className="ev ev-ver">{m.tipo === "video" ? "video" : "pdf"}</span></div>
                      </td>
                      <td><button className="mini" style={{ color: "var(--azul)" }} onClick={() => setEditando(m)}>
                        {m.tieneQuiz ? "Editar" : "Crear evaluación"}</button></td>
                    </tr>
                  ))}
                  {(manuales || []).length === 0 && <tr><td colSpan="4" style={{ textAlign: "center", padding: 24, color: "#5B6B85" }}>Aún no hay materiales. Sube uno a la izquierda.</td></tr>}
                  </tbody></table>
              </div>
            </div>
          </div>
        )}
      </div>
      {editando && (
        <EditorQuiz manual={editando} onCerrar={() => setEditando(null)}
          onGuardado={() => { notar("Evaluación guardada."); router.refresh(); }} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Stat({ v, l }) { return <div className="stat"><div className="v">{v}</div><div className="l">{l}</div></div>; }
function Field({ label, val, on, ph }) {
  return <label className="fl">{label}<input className="fi" value={val} placeholder={ph || ""} onChange={(e) => on(e.target.value)} /></label>;
}
function Marca() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <polygon points="5,15 20,5 35,15" fill="#EAF2FF" stroke="#6AC72A" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="5" y="15" width="30" height="3" fill="#004CA6" />
      <rect x="8" y="19" width="4.5" height="13" rx="1" fill="#004CA6" /><rect x="15" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
      <rect x="22" y="19" width="4.5" height="13" rx="1" fill="#004CA6" /><rect x="29" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
      <rect x="4" y="32" width="32" height="3" fill="#004CA6" /><rect x="3" y="36" width="34" height="2" fill="#6AC72A" />
    </svg>
  );
}

const CSS = `
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 28px;background:var(--card);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20;}
.brand{display:flex;align-items:center;gap:12px;}
.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.title{font-size:17px;font-weight:600;line-height:1.1;}
.user{display:flex;align-items:center;gap:14px;}
.link{background:none;border:0;font:inherit;font-size:13px;font-weight:600;color:var(--azul);cursor:pointer;text-decoration:none;}
.wrap{max-width:1080px;margin:0 auto;padding:26px 28px 64px;}
.subtabs{display:flex;gap:6px;margin-bottom:22px;flex-wrap:wrap;}
.subtab{border:1px solid var(--line);background:#fff;font:inherit;font-size:13px;font-weight:600;color:var(--muted);padding:8px 16px;border-radius:9px;cursor:pointer;}
.subtab.on{background:var(--azul);border-color:var(--azul);color:#fff;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
.stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px;}
.stat .v{font-size:26px;font-weight:700;color:var(--azul);font-family:'Fraunces',serif;}.stat .l{font-size:12.5px;color:var(--muted);margin-top:2px;}
.table{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;}
.table table{width:100%;border-collapse:collapse;font-size:13.5px;}
.table th{text-align:left;padding:12px 18px;background:#F7F9FC;color:var(--muted);font-weight:600;font-size:12px;letter-spacing:.03em;text-transform:uppercase;border-bottom:1px solid var(--line);}
.table td{padding:12px 18px;border-bottom:1px solid #EEF2F7;}.table tr:last-child td{border-bottom:0;}
.ev{font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;}
.ev-login{background:#E7EEFA;color:var(--azul);}.ev-ver{background:#FEF3E2;color:#B7791F;}
.ev-leido{background:var(--verde-soft);color:var(--verde-2);}.ev-click{background:#EDE9FB;color:#6D4AC7;}.ev-admin{background:#F0F1F4;color:#5B6B85;}
.assign{display:grid;grid-template-columns:260px 1fr;gap:18px;}
.people{background:#fff;border:1px solid var(--line);border-radius:14px;padding:8px;height:fit-content;}
.person{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;cursor:pointer;}
.person:hover{background:#F5F8FC;}.person.on{background:#EAF0FA;}
.person .pa{width:34px;height:34px;border-radius:50%;background:var(--azul);color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;flex:none;}
.person .pn{font-size:13.5px;font-weight:600;}.person .pd{font-size:11.5px;color:var(--muted);}
.baja{color:#B23;font-size:10px;font-weight:700;text-transform:uppercase;}
.assignbox{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px 22px;}
.assignbox h4{margin:0 0 3px;font-size:15px;font-weight:700;}.assignbox .subt{margin:0 0 18px;font-size:13px;color:var(--muted);}
.row{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid #EEF2F7;}.row:last-child{border-bottom:0;}
.check{width:22px;height:22px;border-radius:6px;border:2px solid #CBD5E5;display:grid;place-items:center;cursor:pointer;flex:none;transition:all .15s;background:#fff;color:#fff;font-size:13px;}
.check.on{background:var(--verde-2);border-color:var(--verde-2);}
.row .rn{font-size:14px;font-weight:600;flex:1;}.row .rp{font-size:12px;color:var(--muted);}
.fl{display:block;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:14px;}
.fi{display:block;width:100%;margin-top:6px;font:inherit;font-size:14px;color:var(--ink);padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:#fff;}
.save{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;cursor:pointer;background:var(--azul);color:#fff;margin-top:6px;}
.mini{font:inherit;font-size:12px;font-weight:600;padding:5px 10px;border-radius:7px;border:1px solid var(--line);background:#fff;color:#B23;cursor:pointer;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:12px 20px;border-radius:11px;font-size:13.5px;font-weight:500;z-index:60;box-shadow:0 12px 30px -8px rgba(0,0,0,.4);}
@media (max-width:860px){.assign{grid-template-columns:1fr;}.stats{grid-template-columns:repeat(2,1fr);}}
`;
