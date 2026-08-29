"use client";
import React, { useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import { IconDownload } from "@/components/icons";

// Panel de solo lectura para Talento Humano: cómo va cada colaborador con sus manuales.
export default function RHClient({ colaboradores, rolViendo, salir }) {
  const [buscar, setBuscar] = useState("");

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return colaboradores;
    return colaboradores.filter((c) =>
      (c.nombre || "").toLowerCase().includes(q) ||
      (c.correo || "").toLowerCase().includes(q) ||
      (c.area || "").toLowerCase().includes(q)
    );
  }, [colaboradores, buscar]);

  const conManuales = colaboradores.filter((c) => c.asignados > 0);
  const alDia = conManuales.filter((c) => c.leidos >= c.asignados).length;
  const conPendientes = conManuales.length - alDia;
  const avancePromedio = conManuales.length
    ? Math.round(conManuales.reduce((s, c) => s + c.leidos / c.asignados, 0) / conManuales.length * 100)
    : 100;

  return (
    <div>
      <style>{CSS}</style>
      <TopBar title="Panel de Talento Humano" salir={salir}>
        <a className="link" href="/dashboard">Ver como empleado</a>
        {rolViendo === "admin" && <a className="link" href="/admin">Admin</a>}
      </TopBar>

      <div className="wrap">
        <div className="toolrow">
          <input className="search" type="search" placeholder="Buscar por nombre, correo o área…" value={buscar}
            onChange={(e) => setBuscar(e.target.value)} aria-label="Buscar colaborador" />
          <a className="save" href="/api/admin/reporte" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <IconDownload /> Exportar reporte (CSV)
          </a>
        </div>

        <div className="stats">
          <Stat v={colaboradores.length} l="Colaboradores activos" />
          <Stat v={`${avancePromedio}%`} l="Avance promedio" />
          <Stat v={alDia} l="Al día con sus manuales" />
          <Stat v={conPendientes} l="Con manuales pendientes" />
        </div>

        <div className="table table-scroll">
          <table>
            <thead><tr><th>Colaborador</th><th>Puesto / Área</th><th>Avance</th><th>Manuales pendientes</th><th>Últ. acceso</th></tr></thead>
            <tbody>
              {filtrados.map((c) => {
                const sinManuales = c.asignados === 0;
                const pct = sinManuales ? null : Math.round((c.leidos / c.asignados) * 100);
                return (
                  <tr key={c.id}>
                    <td><b>{c.nombre}</b><div className="sub">{c.correo}</div></td>
                    <td>{c.puesto || "—"}<div className="sub">{c.area || ""}</div></td>
                    <td>
                      {sinManuales ? <span className="sub">Sin manuales asignados</span> : (
                        <div className="avance">
                          <div className="abar"><div className="afill" style={{ width: `${pct}%` }} /></div>
                          <span className="alabel">{c.leidos}/{c.asignados} · {pct}%</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {c.pendientes.length === 0
                        ? <span className="chip chip-ok">Al día</span>
                        : <div className="pend">{c.pendientes.map((p) => <span key={p} className="chip chip-pend">{p}</span>)}</div>}
                    </td>
                    <td className="sub">{c.ultimo}</td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>
                  {colaboradores.length === 0 ? "Aún no hay colaboradores activos." : "Sin resultados para tu búsqueda."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ v, l }) { return <div className="stat"><div className="v">{v}</div><div className="l">{l}</div></div>; }

const CSS = `
.wrap{max-width:1080px;margin:0 auto;padding:26px 28px 64px;}
.toolrow{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px;flex-wrap:wrap;}
.search{font:inherit;font-size:13.5px;padding:9px 13px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink);min-width:260px;}
.save{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;cursor:pointer;background:var(--azul);color:#fff;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;}
.stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;}
.stat .v{font-size:26px;font-weight:700;color:var(--azul);font-family:'Fraunces',serif;}
.stat .l{font-size:12.5px;color:var(--muted);margin-top:2px;}
.table{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;}
.table table{width:100%;border-collapse:collapse;font-size:13.5px;}
.table th{text-align:left;padding:12px 18px;background:var(--bg);color:var(--muted);font-weight:600;font-size:12px;letter-spacing:.03em;text-transform:uppercase;border-bottom:1px solid var(--line);white-space:nowrap;}
.table td{padding:12px 18px;border-bottom:1px solid var(--line);vertical-align:top;}
.table tr:last-child td{border-bottom:0;}
.sub{font-size:11.5px;color:var(--muted);margin-top:2px;}
.avance{display:flex;flex-direction:column;gap:5px;min-width:130px;}
.abar{height:7px;background:var(--line);border-radius:99px;overflow:hidden;}
.afill{height:100%;background:var(--verde-2);border-radius:99px;}
.alabel{font-size:11.5px;color:var(--muted);font-weight:600;white-space:nowrap;}
.pend{display:flex;flex-wrap:wrap;gap:5px;max-width:280px;}
.chip{font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;white-space:nowrap;}
.chip-pend{background:#FEF3E2;color:#B7791F;}
.chip-ok{background:var(--verde-soft);color:var(--verde-2);}
@media (max-width:860px){.stats{grid-template-columns:repeat(2,1fr);}}
@media (max-width:560px){.toolrow{flex-direction:column;align-items:stretch;}.search{min-width:0;}}
`;
