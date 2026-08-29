import { requireTH } from "@/lib/guard";
import { resumenTH } from "@/lib/queries";
import { signOut } from "@/auth";
import RHClient from "./RHClient";

export default async function RHPage() {
  const user = await requireTH();
  const filas = await resumenTH();

  const colaboradores = filas.map((f) => ({
    id: f.id,
    nombre: f.nombre_completo,
    correo: f.correo,
    puesto: f.puesto,
    area: f.area,
    ultimo: f.ultimo_acceso ? new Date(f.ultimo_acceso).toLocaleString("es-MX") : "—",
    asignados: f.manuales_asignados,
    leidos: f.manuales_leidos,
    pendientes: f.pendientes ? f.pendientes.split(" · ") : [],
  }));

  async function salir() { "use server"; await signOut({ redirectTo: "/login" }); }

  return <RHClient colaboradores={colaboradores} rolViendo={user.rol} salir={salir} />;
}
