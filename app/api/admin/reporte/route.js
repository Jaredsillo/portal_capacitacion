import { auth } from "@/auth";
import { reporteAvance } from "@/lib/queries";
export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (session?.user?.rol !== "admin") return new Response("solo admin", { status: 403 });
  const filas = await reporteAvance();
  const head = ["Nombre", "Correo", "Área", "Sistema", "Manual", "Fecha lectura"];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [head.join(",")].concat(
    filas.map((f) => [f.nombre_completo, f.correo, f.area, f.sistema, f.estado_manual,
      f.fecha_leido ? new Date(f.fecha_leido).toLocaleString("es-MX") : ""].map(esc).join(","))
  ).join("\n");
  return new Response("\uFEFF" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="reporte-capacitacion.csv"` },
  });
}
