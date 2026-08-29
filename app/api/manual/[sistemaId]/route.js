import { auth } from "@/auth";
import { getManualDeSistema, usuarioTieneSistema, logActividad } from "@/lib/queries";
import fs from "node:fs";
import path from "node:path";
export const runtime = "nodejs";

// Sirve el PDF solo si el usuario tiene el sistema asignado.
export async function GET(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) return new Response("no auth", { status: 401 });
  const sistemaId = Number(params.sistemaId);
  if (!(await usuarioTieneSistema(session.user.id, sistemaId)))
    return new Response("sin acceso", { status: 403 });
  const manual = await getManualDeSistema(sistemaId);
  if (!manual) return new Response("sin manual", { status: 404 });

  const file = path.join(process.cwd(), "manuales", manual.archivo_path);
  if (!fs.existsSync(file)) return new Response("archivo no encontrado", { status: 404 });
  const data = fs.readFileSync(file);
  const mime = mimeDesdeExtension(path.extname(manual.archivo_path || "").toLowerCase());
  return new Response(data, {
    headers: { "Content-Type": mime, "Content-Disposition": "inline" },
  });
}

function mimeDesdeExtension(ext) {
  const map = {
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
    ".m4v": "video/x-m4v",
  };
  return map[ext] || "application/octet-stream";
}
