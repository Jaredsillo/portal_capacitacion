import { auth } from "@/auth";
import { getQuizAdmin } from "@/lib/queries";
export const runtime = "nodejs";

export async function GET(req, { params }) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const data = await getQuizAdmin(Number(params.manualId));
  return Response.json(data);
}
