import { requireAdmin } from "@/lib/guard";
import { listUsuarios, listSistemas, listActividades, listManuales } from "@/lib/queries";
import { signOut } from "@/auth";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  await requireAdmin();
  const [usuarios, sistemas, actividades, manuales] = await Promise.all([
    listUsuarios(), listSistemas(), listActividades(200), listManuales(),
  ]);

  // Asignaciones actuales por usuario (para pintar las casillas).
  const { pool } = await import("@/lib/db");
  const [asigRows] = await pool.query("SELECT usuario_id, sistema_id FROM asignaciones");
  const asignaciones = {};
  for (const r of asigRows) (asignaciones[r.usuario_id] ||= []).push(r.sistema_id);

  async function salir() { "use server"; await signOut({ redirectTo: "/login" }); }

  return (
    <AdminClient
      usuarios={usuarios.map(sanitize)}
      sistemas={sistemas}
      manuales={manuales.map((m)=>({id:m.id,titulo:m.titulo,codigo:m.codigo,version:m.version,paginas:m.total_paginas,sistema:m.sistema_nombre,sistemaId:m.sistema_id,tieneQuiz:!!m.tiene_quiz,tipo:m.material_tipo||"pdf"}))}
      actividades={actividades.map((a) => ({
        id: String(a.id), usuario: a.nombre_completo, evento: a.tipo_evento,
        detalle: a.detalle, fecha: new Date(a.fecha_hora).toLocaleString("es-MX"),
      }))}
      asignaciones={asignaciones}
      salir={salir}
    />
  );
}

function sanitize(u) {
  return {
    id: u.id, nombre: u.nombre_completo, correo: u.correo, puesto: u.puesto,
    area: u.area, reloj: u.num_reloj_checador, rol: u.rol, estado: u.estado,
    ultimo: u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString("es-MX") : "—",
  };
}
