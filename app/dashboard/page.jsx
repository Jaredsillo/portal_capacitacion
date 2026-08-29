import { requireUser } from "@/lib/guard";
import { getSistemasDeUsuario } from "@/lib/queries";
import { signOut } from "@/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await requireUser();
  const rows = await getSistemasDeUsuario(user.id);

  // Normaliza los datos para el cliente.
  const sistemas = rows.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    desc: s.descripcion,
    url: s.url_destino,
    tieneManual: !!s.manual_id,
    tieneQuiz: !!s.tiene_quiz,
    codigo: s.manual_codigo,
    paginas: s.total_paginas || 0,
    materialTipo: s.material_tipo || "pdf",
    leido: !!s.leido,
    visitado: !!s.visitado,
  }));

  async function salir() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <DashboardClient
      usuario={{ nombre: user.nombre || user.name, correo: user.email, rol: user.rol }}
      sistemas={sistemas}
      salir={salir}
    />
  );
}
