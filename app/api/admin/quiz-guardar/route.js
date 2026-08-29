import { auth } from "@/auth";
import { guardarQuiz, getManualPorId, logActividad } from "@/lib/queries";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const { manualId, palabras } = await req.json();
  const manual = await getManualPorId(manualId);
  if (!manual) return Response.json({ error: "manual no existe" }, { status: 404 });

  const palabrasLimpias = (palabras || [])
    .map((w) => String(w).toUpperCase().normalize("NFD").replace(/[^A-Z]/g, ""))
    .filter((w) => w.length >= 3 && w.length <= 12).slice(0, 10);

  if (palabrasLimpias.length === 0) return Response.json({ error: "Agrega al menos una palabra clave." }, { status: 400 });

  await guardarQuiz(manualId, { palabras_clave: palabrasLimpias });
  await logActividad(session.user.id, "admin", manualId,
    `Editó las palabras clave de "${manual.titulo}" (${palabrasLimpias.length} palabras)`);
  return Response.json({ ok: true, palabras: palabrasLimpias.length });
}
