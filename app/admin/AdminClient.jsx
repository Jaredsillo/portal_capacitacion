"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EditorQuiz from "@/components/EditorQuiz";
import TopBar from "@/components/TopBar";
import Toast from "@/components/Toast";
import { IconDownload } from "@/components/icons";

export default function AdminClient({ usuarios, sistemas, manuales, actividades, asignaciones: asigInicial, salir }) {
  const router = useRouter();
  const [tab, setTab] = useState("actividad");
  const [asignaciones, setAsignaciones] = useState(asigInicial);
  const [selUser, setSelUser] = useState(usuarios.find((u) => u.estado === "alta")?.id || usuarios[0]?.id);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ nombre_completo: "", correo: "", puesto: "", area: "", num_reloj_checador: "", rol: "usuario" });
  const [sisForm, setSisForm] = useState({ nombre: "", descripcion: "", url_destino: "" });
  const [subida, setSubida] = useState({ sistema_id: "", titulo: "", codigo: "", version: "V00", archivo: null });
  const [editando, setEditando] = useState(null); // manual cuyo quiz se edita
  const [erroresForm, setErroresForm] = useState({});
  const [erroresSis, setErroresSis] = useState({});
  const [erroresSubida, setErroresSubida] = useState({});
  const [buscarActividad, setBuscarActividad] = useState("");
  const [buscarUsuario, setBuscarUsuario] = useState("");
  const [buscarPersona, setBuscarPersona] = useState("");

  function notar(m, tipo = "info") { setToast({ mensaje: m, tipo }); setTimeout(() => setToast(null), 3000); }

  async function crearSistema(e) {
    e.preventDefault();
    if (!sisForm.nombre.trim()) { setErroresSis({ nombre: true }); return notar("El nombre del sistema es obligatorio.", "error"); }
    setErroresSis({});
    const r = await fetch("/api/admin/sistemas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sisForm) });
    if (r.ok) { notar("Sistema creado.", "ok"); setSisForm({ nombre: "", descripcion: "", url_destino: "" }); router.refresh(); }
    else notar("No se pudo crear el sistema.", "error");
  }
  async function subirManual(e) {
    e.preventDefault();
    const faltan = {
      sistema_id: !subida.sistema_id, titulo: !subida.titulo.trim(), archivo: !subida.archivo,
    };
    if (Object.values(faltan).some(Boolean)) { setErroresSubida(faltan); return notar("Sistema, título y archivo son obligatorios.", "error"); }
    setErroresSubida({});
    const fd = new FormData();
    Object.entries(subida).forEach(([k, v]) => fd.append(k, v));
    notar("Subiendo material…");
    const r = await fetch("/api/admin/manual-upload", { method: "POST", body: fd });
    if (r.ok) {
      const d = await r.json();
      notar(d.tipo === "video" ? "Video subido correctamente." : `Manual subido (${d.paginas} páginas).`, "ok");
      setSubida({ sistema_id: "", titulo: "", codigo: "", version: "V00", archivo: null });
      router.refresh();
    }
    else { const d = await r.json().catch(() => ({})); notar(d.error || "No se pudo subir el material.", "error"); }
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

  // Asignación masiva: marca o quita de un jalón todos los sistemas de la persona seleccionada.
  async function asignarTodos(usuarioId, activar) {
    const pendientes = sistemas.filter((s) => Boolean(asignaciones[usuarioId]?.includes(s.id)) !== activar);
    if (pendientes.length === 0) return;
    for (const s of pendientes) await toggleAsig(usuarioId, s.id);
    notar(activar ? "Se asignaron todos los sistemas." : "Se quitaron todos los sistemas.", "ok");
  }

  async function darAlta(e) {
    e.preventDefault();
    const faltan = { nombre_completo: !form.nombre_completo.trim(), correo: !form.correo.trim() };
    if (faltan.nombre_completo || faltan.correo) { setErroresForm(faltan); return notar("Nombre y correo son obligatorios.", "error"); }
    setErroresForm({});
    const r = await fetch("/api/usuarios", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }) });
    if (r.ok) { notar("Usuario dado de alta.", "ok"); setForm({ nombre_completo: "", correo: "", puesto: "", area: "", num_reloj_checador: "", rol: "usuario" }); router.refresh(); }
    else { const d = await r.json().catch(() => ({})); notar(d.error || "No se pudo dar de alta.", "error"); }
  }
  async function darBaja(usuarioId) {
    await fetch("/api/usuarios", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "baja", usuarioId }) });
    notar("Usuario dado de baja.", "ok"); router.refresh();
  }

  const sel = usuarios.find((u) => u.id === selUser);
  const etiqueta = { login: ["Inicio de sesión", "ev-login"], ver_manual: ["Abrió manual", "ev-ver"], marcar_leido: ["Manual leído", "ev-leido"], click_sistema: ["Acceso a sistema", "ev-click"], admin: ["Administración", "ev-admin"] };

  const actividadFiltrada = useMemo(() => {
    const q = buscarActividad.trim().toLowerCase();
    if (!q) return actividades;
    return actividades.filter((a) => (a.usuario || "").toLowerCase().includes(q) || (a.detalle || "").toLowerCase().includes(q));
  }, [actividades, buscarActividad]);

  const usuariosFiltrados = useMemo(() => {
    const q = buscarUsuario.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => (u.nombre || "").toLowerCase().includes(q) || (u.correo || "").toLowerCase().includes(q));
  }, [usuarios, buscarUsuario]);

  const personasFiltradas = useMemo(() => {
    const q = buscarPersona.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) => (u.nombre || "").toLowerCase().includes(q) || (u.area || "").toLowerCase().includes(q));
  }, [usuarios, buscarPersona]);

  return (
    <div>
      <style>{CSS}</style>
      <TopBar title="Panel de Administración" salir={salir}>
        <a className="link" href="/dashboard">Ver como empleado</a>
      </TopBar>

      <div className="wrap">
        <div className="subtabs">
          {[["actividad", "Actividad"], ["asignaciones", "Asignaciones"], ["usuarios", "Usuarios"], ["sistemas", "Sistemas"], ["manuales", "Manuales y juegos"]].map(([k, l]) => (
            <button key={k} className={`subtab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "actividad" && (
          <>
            <div className="toolrow">
              <input className="search" type="search" placeholder="Buscar por persona o detalle…" value={buscarActividad}
                onChange={(e) => setBuscarActividad(e.target.value)} aria-label="Buscar en el registro de actividad" />
              <a className="save" href="/api/admin/reporte" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <IconDownload /> Exportar reporte (CSV)
              </a>
            </div>
            <div className="stats">
              <Stat v={usuarios.filter((u) => u.estado === "alta").length} l="Empleados activos" />
              <Stat v={actividades.filter((a) => a.evento === "marcar_leido").length} l="Manuales leídos" />
              <Stat v={actividades.filter((a) => a.evento === "click_sistema").length} l="Accesos a sistemas" />
              <Stat v={actividades.length} l="Eventos registrados" />
            </div>
            <div className="table table-scroll">
              <table><thead><tr><th>Usuario</th><th>Evento</th><th>Detalle</th><th>Fecha y hora</th></tr></thead>
                <tbody>{actividadFiltrada.map((a) => { const [txt, cls] = etiqueta[a.evento] || ["Evento", "ev-login"];
                  return <tr key={a.id}><td>{a.usuario}</td><td><span className={`ev ${cls}`}>{txt}</span></td><td>{a.detalle}</td><td style={{ color: "var(--muted)" }}>{a.fecha}</td></tr>; })}
                  {actividadFiltrada.length === 0 && <tr><td colSpan="4" style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>{actividades.length === 0 ? "Sin actividad aún." : "Sin resultados para tu búsqueda."}</td></tr>}
                </tbody></table>
            </div>
          </>
        )}

        {tab === "asignaciones" && (
          <div className="assign">
            <div className="people">
              <input className="search searchpeople" type="search" placeholder="Buscar persona…" value={buscarPersona}
                onChange={(e) => setBuscarPersona(e.target.value)} aria-label="Buscar persona" />
              {personasFiltradas.map((u) => (
                <div key={u.id} className={`person ${selUser === u.id ? "on" : ""}`} onClick={() => setSelUser(u.id)}
                  role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelUser(u.id)}>
                  <div className="pa" aria-hidden="true">{(u.nombre || "U")[0]}</div>
                  <div><div className="pn">{u.nombre}{u.estado === "baja" && <span className="baja"> baja</span>}</div><div className="pd">{u.area || u.correo}</div></div>
                </div>
              ))}
              {personasFiltradas.length === 0 && <p className="subt" style={{ padding: "8px 10px" }}>Sin resultados.</p>}
            </div>
            <div className="assignbox">
              <div className="assignhead">
                <div>
                  <h4>Sistemas de {sel?.nombre}</h4>
                  <p className="subt">Marca los sistemas que verá en su portal. El cambio se guarda al instante.</p>
                </div>
                <div className="bulkacts">
                  <button type="button" className="mini" onClick={() => asignarTodos(selUser, true)}>Asignar todos</button>
                  <button type="button" className="mini" style={{ color: "var(--muted)" }} onClick={() => asignarTodos(selUser, false)}>Quitar todos</button>
                </div>
              </div>
              {sistemas.map((s) => {
                const on = asignaciones[selUser]?.includes(s.id);
                return (
                  <div key={s.id} className="row">
                    <div className={`check ${on ? "on" : ""}`} onClick={() => toggleAsig(selUser, s.id)}
                      role="checkbox" aria-checked={on} aria-label={`Asignar ${s.nombre} a ${sel?.nombre}`} tabIndex={0}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleAsig(selUser, s.id))}>
                      {on ? "✓" : ""}
                    </div>
                    <span className="rn">{s.nombre}</span><span className="rp">{on ? "asignado" : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "usuarios" && (
          <div className="assign">
            <form className="assignbox" onSubmit={darAlta} noValidate>
              <h4>Alta de colaborador</h4>
              <p className="subt">Réplica digital de la Solicitud de Cuentas de Usuario.</p>
              <Field label="Nombre del colaborador *" val={form.nombre_completo} on={(v) => { setForm({ ...form, nombre_completo: v }); setErroresForm((e) => ({ ...e, nombre_completo: false })); }} error={erroresForm.nombre_completo} />
              <Field label="Correo institucional *" val={form.correo} on={(v) => { setForm({ ...form, correo: v }); setErroresForm((e) => ({ ...e, correo: false })); }} ph="nombre@uhipocrates.edu.mx" error={erroresForm.correo} />
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
              <input className="search" type="search" placeholder="Buscar por nombre o correo…" value={buscarUsuario}
                onChange={(e) => setBuscarUsuario(e.target.value)} aria-label="Buscar colaborador" style={{ marginTop: 10 }} />
              <div className="table table-scroll" style={{ marginTop: 12 }}>
                <table><thead><tr><th>Nombre</th><th>Área</th><th>Estado</th><th>Últ. acceso</th><th></th></tr></thead>
                  <tbody>{usuariosFiltrados.map((u) => (
                    <tr key={u.id}><td>{u.nombre}<div style={{ fontSize: 11, color: "var(--muted)" }}>{u.correo}</div></td>
                      <td>{u.area || "—"}</td>
                      <td>{u.estado === "alta" ? <span className="ev ev-leido">activo</span> : <span className="ev ev-admin">baja</span>}</td>
                      <td style={{ color: "var(--muted)" }}>{u.ultimo}</td>
                      <td>{u.estado === "alta" && u.rol !== "admin" && <button className="mini" onClick={() => darBaja(u.id)}>Baja</button>}</td>
                    </tr>
                  ))}
                  {usuariosFiltrados.length === 0 && <tr><td colSpan="5" style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>Sin resultados.</td></tr>}
                  </tbody></table>
              </div>
            </div>
          </div>
        )}

        {tab === "sistemas" && (
          <div className="assign">
            <form className="assignbox" onSubmit={crearSistema} noValidate>
              <h4>Nuevo sistema</h4>
              <p className="subt">Da de alta un sistema (SAE, SIADUH, correo, etc.) con su enlace.</p>
              <Field label="Nombre *" val={sisForm.nombre} on={(v) => { setSisForm({ ...sisForm, nombre: v }); setErroresSis({}); }} error={erroresSis.nombre} />
              <Field label="Descripción" val={sisForm.descripcion} on={(v) => setSisForm({ ...sisForm, descripcion: v })} />
              <Field label="URL del sistema" val={sisForm.url_destino} on={(v) => setSisForm({ ...sisForm, url_destino: v })} ph="https://..." />
              <button className="save" type="submit">Crear sistema</button>
            </form>
            <div className="assignbox">
              <h4>Sistemas registrados</h4>
              <div className="table table-scroll" style={{ marginTop: 12 }}>
                <table><thead><tr><th>Sistema</th><th>URL</th></tr></thead>
                  <tbody>{sistemas.map((s) => (
                    <tr key={s.id}><td><b>{s.nombre}</b><div style={{ fontSize: 11, color: "var(--muted)" }}>{s.descripcion}</div></td>
                      <td><a className="link" href={s.url_destino} target="_blank" rel="noopener">{s.url_destino}</a></td></tr>
                  ))}</tbody></table>
              </div>
            </div>
          </div>
        )}

        {tab === "manuales" && (
          <div className="assign">
            <form className="assignbox" onSubmit={subirManual} noValidate>
              <h4>Subir material (PDF o video)</h4>
              <p className="subt">El archivo se guarda privado. Después puedes configurar su juego.</p>
              <label className="fl">Sistema *
                <select className={`fi ${erroresSubida.sistema_id ? "campo-error" : ""}`} value={subida.sistema_id}
                  onChange={(e) => { setSubida({ ...subida, sistema_id: e.target.value }); setErroresSubida((er) => ({ ...er, sistema_id: false })); }}>
                  <option value="">— elige —</option>
                  {sistemas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </label>
              <Field label="Título *" val={subida.titulo} on={(v) => { setSubida({ ...subida, titulo: v }); setErroresSubida((er) => ({ ...er, titulo: false })); }} error={erroresSubida.titulo} />
              <Field label="Código" val={subida.codigo} on={(v) => setSubida({ ...subida, codigo: v })} ph="SGCUH-CSRDT-M-00X" />
              <Field label="Versión" val={subida.version} on={(v) => setSubida({ ...subida, version: v })} />
              <label className="fl">Archivo *
                <input className={`fi ${erroresSubida.archivo ? "campo-error" : ""}`} type="file"
                  accept="application/pdf,video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
                  onChange={(e) => { setSubida({ ...subida, archivo: e.target.files[0] }); setErroresSubida((er) => ({ ...er, archivo: false })); }} />
              </label>
              <button className="save" type="submit">Subir material</button>
            </form>
            <div className="assignbox">
              <h4>Manuales y juegos</h4>
              <p className="subt">Configura el juego de cada manual (sopa de letras o ahorcado) y sus palabras clave.</p>
              <div className="table table-scroll" style={{ marginTop: 12 }}>
                <table><thead><tr><th>Material</th><th>Sistema</th><th>Juego</th><th></th></tr></thead>
                  <tbody>{(manuales || []).map((m) => (
                    <tr key={m.id}><td><b>{m.codigo || m.titulo}</b><div style={{ fontSize: 11, color: "var(--muted)" }}>{m.paginas} pág. · {m.version}</div></td>
                      <td>{m.sistema}</td>
                      <td>
                        <div>{m.tieneQuiz ? <span className="ev ev-leido">configurado</span> : <span className="ev ev-admin">sin juego</span>}</div>
                        <div style={{ marginTop: 4 }}><span className="ev ev-ver">{m.tipo === "video" ? "video" : "pdf"}</span></div>
                      </td>
                      <td><button className="mini" style={{ color: "var(--azul)" }} onClick={() => setEditando(m)}>
                        {m.tieneQuiz ? "Editar" : "Configurar juego"}</button></td>
                    </tr>
                  ))}
                  {(manuales || []).length === 0 && <tr><td colSpan="4" style={{ textAlign: "center", padding: 24, color: "var(--muted)" }}>Aún no hay materiales. Sube uno a la izquierda.</td></tr>}
                  </tbody></table>
              </div>
            </div>
          </div>
        )}
      </div>
      {editando && (
        <EditorQuiz manual={editando} onCerrar={() => setEditando(null)}
          onGuardado={() => { notar("Juego guardado.", "ok"); router.refresh(); }} />
      )}
      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </div>
  );
}

function Stat({ v, l }) { return <div className="stat"><div className="v">{v}</div><div className="l">{l}</div></div>; }
function Field({ label, val, on, ph, error }) {
  return (
    <label className="fl">{label}
      <input className={`fi ${error ? "campo-error" : ""}`} value={val} placeholder={ph || ""} onChange={(e) => on(e.target.value)}
        aria-invalid={error || undefined} />
      {error && <span className="campo-error-msg">Este campo es obligatorio.</span>}
    </label>
  );
}

const CSS = `
.wrap{max-width:1080px;margin:0 auto;padding:26px 28px 64px;}
.subtabs{display:flex;gap:6px;margin-bottom:22px;flex-wrap:wrap;}
.subtab{border:1px solid var(--line);background:var(--card);font:inherit;font-size:13px;font-weight:600;color:var(--muted);padding:8px 16px;border-radius:9px;cursor:pointer;}
.subtab.on{background:var(--azul);border-color:var(--azul);color:#fff;}
.toolrow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;flex-wrap:wrap;}
.search{font:inherit;font-size:13.5px;padding:9px 13px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);min-width:240px;}
.searchpeople{width:100%;margin-bottom:8px;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
.stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;}
.stat .v{font-size:26px;font-weight:700;color:var(--azul);font-family:'Fraunces',serif;}.stat .l{font-size:12.5px;color:var(--muted);margin-top:2px;}
.table{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;}
.table table{width:100%;border-collapse:collapse;font-size:13.5px;}
.table th{text-align:left;padding:12px 18px;background:var(--bg);color:var(--muted);font-weight:600;font-size:12px;letter-spacing:.03em;text-transform:uppercase;border-bottom:1px solid var(--line);white-space:nowrap;}
.table td{padding:12px 18px;border-bottom:1px solid var(--line);}.table tr:last-child td{border-bottom:0;}
.ev{font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;}
.ev-login{background:#E7EEFA;color:#0A3C7D;}.ev-ver{background:#FEF3E2;color:#B7791F;}
.ev-leido{background:var(--verde-soft);color:var(--verde-2);}.ev-click{background:#EDE9FB;color:#6D4AC7;}.ev-admin{background:#F0F1F4;color:#5B6B85;}
.assign{display:grid;grid-template-columns:260px 1fr;gap:18px;}
.people{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px;height:fit-content;}
.person{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;cursor:pointer;}
.person:hover{background:var(--bg);}.person.on{background:var(--verde-soft);}
.person .pa{width:34px;height:34px;border-radius:50%;background:var(--azul);color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;flex:none;}
.person .pn{font-size:13.5px;font-weight:600;}.person .pd{font-size:11.5px;color:var(--muted);}
.baja{color:var(--error);font-size:10px;font-weight:700;text-transform:uppercase;}
.assignbox{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px 22px;}
.assignbox h4{margin:0 0 3px;font-size:15px;font-weight:700;}.assignbox .subt{margin:0 0 18px;font-size:13px;color:var(--muted);}
.assignhead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.bulkacts{display:flex;gap:8px;flex:none;}
.row{display:flex;align-items:center;gap:12px;padding:12px 4px;border-bottom:1px solid var(--line);}.row:last-child{border-bottom:0;}
.check{width:22px;height:22px;border-radius:6px;border:2px solid var(--line);display:grid;place-items:center;cursor:pointer;flex:none;transition:all .15s;background:var(--card);color:#fff;font-size:13px;}
.check.on{background:var(--verde-2);border-color:var(--verde-2);}
.row .rn{font-size:14px;font-weight:600;flex:1;}.row .rp{font-size:12px;color:var(--muted);}
.fl{display:block;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:14px;}
.fi{display:block;width:100%;margin-top:6px;font:inherit;font-size:14px;color:var(--ink);padding:10px 12px;border:1px solid var(--line);border-radius:9px;background:var(--card);}
.save{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;cursor:pointer;background:var(--azul);color:#fff;margin-top:6px;}
.mini{font:inherit;font-size:12px;font-weight:600;padding:5px 10px;border-radius:7px;border:1px solid var(--line);background:var(--card);color:var(--error);cursor:pointer;}
@media (max-width:860px){.assign{grid-template-columns:1fr;}.stats{grid-template-columns:repeat(2,1fr);}}
@media (max-width:560px){.toolrow{flex-direction:column;align-items:stretch;}.search{min-width:0;}}
`;
