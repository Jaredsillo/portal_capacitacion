import { auth } from "@/auth";
import { registrarManual, logActividad } from "@/lib/queries";
import fs from "node:fs";
import path from "node:path";
export const runtime = "nodejs";

export async function POST(req) {
  const session = await auth();
  if (session?.user?.rol !== "admin") return Response.json({ error: "solo admin" }, { status: 403 });
  const form = await req.formData();
  const file = form.get("archivo");
  const sistemaId = Number(form.get("sistema_id"));
  const titulo = form.get("titulo");
  const codigo = form.get("codigo") || "";
  const version = form.get("version") || "V00";
  if (!file || !sistemaId || !titulo) return Response.json({ error: "faltan datos" }, { status: 400 });
  const tipo = detectarTipoMaterial(file);
  if (!tipo) return Response.json({ error: "solo se permite PDF, PowerPoint (PPT/PPTX) o video (MP4/WEBM/OGG/MOV/M4V)" }, { status: 400 });

  const extension = extensionArchivo(file, tipo);
  const nombreArchivo = (codigo || titulo).replace(/[^A-Za-z0-9\-_]/g, "_") + "_" + Date.now() + extension;
  const dir = path.join(process.cwd(), "manuales");
  fs.mkdirSync(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, nombreArchivo), buffer);

  // Para PDF contamos páginas; para video/PPT dejamos 1 como valor de compatibilidad
  // (el navegador no puede renderizar PPT/PPTX página por página, se descarga y se abre aparte).
  let paginas = 1;
  if (tipo === "pdf") {
    try { const pdf = (await import("pdf-parse")).default; paginas = (await pdf(buffer)).numpages || 1; } catch {}
  }

  const id = await registrarManual({ sistema_id: sistemaId, titulo, codigo, archivo_path: nombreArchivo, total_paginas: paginas, version });
  const etiqueta = tipo === "video" ? "el video" : tipo === "ppt" ? "la presentación" : "el manual";
  await logActividad(session.user.id, "admin", id, `Subió ${etiqueta} "${titulo}"`);
  return Response.json({ ok: true, manualId: id, paginas, tipo });
}

function detectarTipoMaterial(file) {
  const mime = String(file?.type || "").toLowerCase();
  const ext = path.extname(String(file?.name || "")).toLowerCase();
  if (mime === "application/pdf" || ext === ".pdf") return "pdf";
  const pptExt = new Set([".ppt", ".pptx"]);
  const pptMime = new Set(["application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]);
  if (pptMime.has(mime) || pptExt.has(ext)) return "ppt";
  const videoExt = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v"]);
  if (mime.startsWith("video/") || videoExt.has(ext)) return "video";
  return null;
}

function extensionArchivo(file, tipo) {
  const ext = path.extname(String(file?.name || "")).toLowerCase();
  if (ext) return ext;
  if (tipo === "video") return ".mp4";
  if (tipo === "ppt") return ".pptx";
  return ".pdf";
}
