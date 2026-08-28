import { auth } from "@/auth";
import { getManualDeSistema, usuarioTieneSistema, marcarManualLeido, logActividad, getUsuarioByCorreo } from "@/lib/queries";
import { avisarManualLeido } from "@/lib/mailer";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "no auth" }, { status: 401 });
  const { sistemaId, sistemaNombre, paginasVistas } = await req.json();

  if (!(await usuarioTieneSistema(session.user.id, sistemaId)))
    return Response.json({ error: "sin acceso" }, { status: 403 });
  const manual = await getManualDeSistema(sistemaId);
  if (!manual) return Response.json({ error: "sin manual" }, { status: 400 });

  await marcarManualLeido(session.user.id, manual.id, paginasVistas || manual.total_paginas, manual.version);
  await logActividad(session.user.id, "marcar_leido", manual.id,
    `Leyó el manual ${manual.codigo || manual.titulo}`);

  // Aviso por correo al administrador (no bloquea la respuesta si el SMTP falla).
  avisarManualLeido({
    nombreUsuario: session.user.nombre || session.user.email,
    correoUsuario: session.user.email,
    sistema: sistemaNombre || "",
    manual: manual.titulo,
  }).catch((e) => console.error("Error enviando correo:", e.message));

  return Response.json({ ok: true });
}
