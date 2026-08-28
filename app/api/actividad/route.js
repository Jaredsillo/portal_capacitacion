import { auth } from "@/auth";
import { logActividad, usuarioTieneSistema, getSistemasDeUsuario } from "@/lib/queries";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "no auth" }, { status: 401 });
  const { evento, sistemaId, detalle } = await req.json();
  if (!["ver_manual", "click_sistema"].includes(evento))
    return Response.json({ error: "evento inválido" }, { status: 400 });
  if (sistemaId && !(await usuarioTieneSistema(session.user.id, sistemaId)))
    return Response.json({ error: "sin acceso" }, { status: 403 });
  await logActividad(session.user.id, evento, sistemaId || null, detalle || null);

  // Para "ir al sistema" devolvemos la URL real desde la BD (no confiar en el cliente).
  let url = null;
  if (evento === "click_sistema") {
    const sis = (await getSistemasDeUsuario(session.user.id)).find((s) => s.id === sistemaId);
    url = sis?.url_destino || null;
  }
  return Response.json({ ok: true, url });
}
