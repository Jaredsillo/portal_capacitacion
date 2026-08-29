import { auth } from "@/auth";
import { guardarQuiz, getManualPorId, logActividad } from "@/lib/queries";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const { manualId, minAprobar, preguntas, palabras } = await req.json();
  const manual = await getManualPorId(manualId);
  if (!manual) return Response.json({ error: "manual no existe" }, { status: 404 });

  // Saneamiento y validación
  const limpias = (preguntas || []).slice(0, 20).map((p) => {
    const tipo = p.tipo === "vf" ? "vf" : "opcion";
    const opciones = tipo === "vf" ? ["Verdadero", "Falso"]
      : (p.opciones || []).map((o) => String(o || "").trim()).filter(Boolean).slice(0, 6);
    return {
      texto: String(p.texto || "").trim().slice(0, 500),
      tipo, opciones,
      respuesta_correcta: Math.max(0, Math.min(Number(p.respuesta_correcta) || 0, opciones.length - 1)),
      explicacion: String(p.explicacion || "").trim().slice(0, 500),
    };
  }).filter((p) => p.texto && p.opciones.length >= 2);

  if (limpias.length === 0) return Response.json({ error: "Agrega al menos una pregunta válida." }, { status: 400 });

  const palabrasLimpias = (palabras || [])
    .map((w) => String(w).toUpperCase().normalize("NFD").replace(/[^A-Z]/g, ""))
    .filter((w) => w.length >= 3 && w.length <= 12).slice(0, 10);

  await guardarQuiz(manualId, {
    preguntas: limpias, palabras_clave: palabrasLimpias, modelo: "manual",
    min_aprobar: Math.max(1, Math.min(Number(minAprobar) || 60, 100)),
  });
  await logActividad(session.user.id, "admin", manualId,
    `Editó la evaluación de "${manual.titulo}" (${limpias.length} preguntas)`);
  return Response.json({ ok: true, preguntas: limpias.length, palabras: palabrasLimpias.length });
}
