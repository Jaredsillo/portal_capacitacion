import { auth } from "@/auth";
import { altaUsuario, actualizarUsuario, bajaUsuario, logActividad } from "@/lib/queries";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const body = await req.json();

  if (body.accion === "baja") {
    await bajaUsuario(body.usuarioId);
    await logActividad(session.user.id, "admin", null, `Dio de baja al usuario #${body.usuarioId}`);
    return Response.json({ ok: true });
  }

  if (body.accion === "editar") {
    if (!body.usuarioId || !body.nombre_completo || !body.correo)
      return Response.json({ error: "faltan datos" }, { status: 400 });
    try {
      await actualizarUsuario(body.usuarioId, body);
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") return Response.json({ error: "Ese correo ya está en uso por otro colaborador." }, { status: 409 });
      throw e;
    }
    await logActividad(session.user.id, "admin", body.usuarioId, `Editó los datos de ${body.nombre_completo}`);
    return Response.json({ ok: true });
  }

  // alta
  if (!body.nombre_completo || !body.correo)
    return Response.json({ error: "faltan datos" }, { status: 400 });
  const id = await altaUsuario(body);
  await logActividad(session.user.id, "admin", null, `Dio de alta a ${body.nombre_completo}`);
  return Response.json({ ok: true, id });
}
