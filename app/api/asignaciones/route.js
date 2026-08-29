import { auth } from "@/auth";
import { setAsignacion, logActividad, listSistemas } from "@/lib/queries";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const { usuarioId, sistemaId, activar } = await req.json();
  await setAsignacion(usuarioId, sistemaId, !!activar, session.user.id);
  const sis = (await listSistemas()).find((s) => s.id === sistemaId);
  await logActividad(usuarioId, "admin", sistemaId,
    (activar ? "Se le asignó el sistema " : "Se le retiró el sistema ") + (sis?.nombre || sistemaId));
  return Response.json({ ok: true });
}
