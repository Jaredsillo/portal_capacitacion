import { auth } from "@/auth";
import { crearSistema, logActividad } from "@/lib/queries";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const b = await req.json();
  if (!b.nombre) return Response.json({ error: "falta nombre" }, { status: 400 });
  const id = await crearSistema(b);
  await logActividad(session.user.id, "admin", id, `Creó el sistema ${b.nombre}`);
  return Response.json({ ok: true, id });
}
