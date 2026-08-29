import { auth } from "@/auth";
import { calificarIntento, marcarManualLeido, getManualPorId, logActividad, getManualDeSistema, usuarioTieneSistema } from "@/lib/queries";
import { avisarManualLeido } from "@/lib/mailer";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "no auth" }, { status: 401 });
  const { quizId, sistemaId, sistemaNombre, respuestas } = await req.json();
  if (!(await usuarioTieneSistema(session.user.id, sistemaId)))
    return Response.json({ error: "sin acceso" }, { status: 403 });

  const res = await calificarIntento(session.user.id, quizId, respuestas || {});
  await logActividad(session.user.id, "quiz", sistemaId,
    `Evaluación de ${sistemaNombre || "manual"}: ${res.puntaje}% (${res.aprobado ? "aprobó" : "no aprobó"})`);

  if (res.aprobado) {
    const manual = await getManualDeSistema(sistemaId);
    if (manual) {
      await marcarManualLeido(session.user.id, manual.id, manual.total_paginas, manual.version);
      await logActividad(session.user.id, "marcar_leido", manual.id,
        `Aprobó y completó ${manual.codigo || manual.titulo} (${res.puntaje}%)`);
      avisarManualLeido({
        nombreUsuario: session.user.nombre || session.user.email,
        correoUsuario: session.user.email, sistema: sistemaNombre || "", manual: manual.titulo,
      }).catch((e) => console.error("correo:", e.message));
    }
  }
  return Response.json(res);
}
