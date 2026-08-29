import { auth } from "@/auth";
import { guardarQuiz, getManualPorId, logActividad } from "@/lib/queries";
export const runtime = "nodejs";

const JUEGOS_VALIDOS = new Set(["sopa", "ahorcado"]);

export async function POST(req) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const { manualId, tipoJuego, palabras } = await req.json();
  const manual = await getManualPorId(manualId);
  if (!manual) return Response.json({ error: "manual no existe" }, { status: 404 });

  const palabrasLimpias = (palabras || [])
    .map((w) => String(w).toUpperCase().normalize("NFD").replace(/[^A-Z]/g, ""))
    .filter((w) => w.length >= 3 && w.length <= 12).slice(0, 10);

  if (palabrasLimpias.length === 0) return Response.json({ error: "Agrega al menos una palabra clave." }, { status: 400 });

  const juego = JUEGOS_VALIDOS.has(tipoJuego) ? tipoJuego : "sopa";

  await guardarQuiz(manualId, { palabras_clave: palabrasLimpias, tipo_juego: juego });
  await logActividad(session.user.id, "admin", manualId,
    `Editó el juego de "${manual.titulo}" (${juego === "ahorcado" ? "ahorcado" : "sopa de letras"}, ${palabrasLimpias.length} palabras)`);
  return Response.json({ ok: true, palabras: palabrasLimpias.length });
}
