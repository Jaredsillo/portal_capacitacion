import { auth } from "@/auth";
import { getQuizParaUsuario, usuarioTieneSistema } from "@/lib/queries";
export const runtime = "nodejs";

export async function GET(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "no auth" }, { status: 401 });
  const sistemaId = Number(params.sistemaId);
  if (!(await usuarioTieneSistema(session.user.id, sistemaId)))
    return Response.json({ error: "sin acceso" }, { status: 403 });
  const quiz = await getQuizParaUsuario(sistemaId);
  if (!quiz) return Response.json({ error: "sin quiz" }, { status: 404 });
  return Response.json(quiz);
}
