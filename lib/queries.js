// Todas las consultas a la base de datos viven aquí.
import { q } from "@/lib/db";

// ── Usuarios / auth ──
export async function getUsuarioByCorreo(correo) {
  const rows = await q("SELECT * FROM usuarios WHERE correo = ? LIMIT 1", [correo]);
  return rows[0] || null;
}
export async function touchUltimoAcceso(usuarioId) {
  await q("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?", [usuarioId]);
}

// ── Actividad (log) ──
export async function logActividad(usuarioId, tipoEvento, objetoId, detalle, metadata = null) {
  await q(
    "INSERT INTO actividades (usuario_id, tipo_evento, objeto_id, detalle, metadata) VALUES (?,?,?,?,?)",
    [usuarioId, tipoEvento, objetoId, detalle, metadata ? JSON.stringify(metadata) : null]
  );
}
export async function listActividades(limite = 200) {
  return q(
    `SELECT a.*, u.nombre_completo, u.correo
     FROM actividades a JOIN usuarios u ON u.id = a.usuario_id
     ORDER BY a.fecha_hora DESC LIMIT ?`,
    [limite]
  );
}

// ── Sistemas asignados a un empleado (con estado de lectura/visita) ──
export async function getSistemasDeUsuario(usuarioId) {
  return q(
    `SELECT s.id, s.nombre, s.descripcion, s.url_destino,
            m.id AS manual_id, m.titulo AS manual_titulo, m.codigo AS manual_codigo,
            m.total_paginas, m.archivo_path,
            CASE
              WHEN LOWER(m.archivo_path) REGEXP '\\.(mp4|webm|ogg|mov|m4v)$' THEN 'video'
              WHEN m.archivo_path IS NULL THEN NULL
              ELSE 'pdf'
            END AS material_tipo,
            m.requiere_confirmacion,
            (p.leido = 1) AS leido,
            EXISTS(SELECT 1 FROM quizzes qz WHERE qz.manual_id = m.id AND qz.activo=1) AS tiene_quiz,
            EXISTS(SELECT 1 FROM actividades a
                   WHERE a.usuario_id = ? AND a.tipo_evento='click_sistema' AND a.objeto_id = s.id) AS visitado
     FROM asignaciones asig
     JOIN sistemas s ON s.id = asig.sistema_id AND s.activo = 1
     LEFT JOIN manuales m ON m.sistema_id = s.id
     LEFT JOIN progreso_usuario p ON p.manual_id = m.id AND p.usuario_id = ?
     WHERE asig.usuario_id = ?
     ORDER BY s.orden, s.id`,
    [usuarioId, usuarioId, usuarioId]
  );
}

export async function getManualDeSistema(sistemaId) {
  const rows = await q("SELECT * FROM manuales WHERE sistema_id = ? LIMIT 1", [sistemaId]);
  return rows[0] || null;
}
export async function usuarioTieneSistema(usuarioId, sistemaId) {
  const rows = await q(
    "SELECT 1 FROM asignaciones WHERE usuario_id = ? AND sistema_id = ? LIMIT 1",
    [usuarioId, sistemaId]
  );
  return rows.length > 0;
}

// ── Marcar manual como leído ──
export async function marcarManualLeido(usuarioId, manualId, paginasVistas, version) {
  await q(
    `INSERT INTO progreso_usuario (usuario_id, manual_id, leido, paginas_vistas, version_leida, fecha_leido)
     VALUES (?,?,1,?,?,NOW())
     ON DUPLICATE KEY UPDATE leido=1, paginas_vistas=VALUES(paginas_vistas),
       version_leida=VALUES(version_leida), fecha_leido=NOW()`,
    [usuarioId, manualId, paginasVistas, version]
  );
}

// ── Admin: alta / baja / listado ──
export async function altaUsuario(d) {
  const r = await q(
    `INSERT INTO usuarios (nombre_completo, correo, puesto, area, num_reloj_checador, rol, estado, fecha_alta)
     VALUES (?,?,?,?,?,?, 'alta', CURDATE())`,
    [d.nombre_completo, d.correo.toLowerCase(), d.puesto, d.area, d.num_reloj_checador, d.rol || "usuario"]
  );
  return r.insertId;
}
export async function bajaUsuario(usuarioId) {
  await q("UPDATE usuarios SET estado='baja', fecha_baja=CURDATE() WHERE id=?", [usuarioId]);
}
export async function actualizarUsuario(usuarioId, d) {
  await q(
    `UPDATE usuarios SET nombre_completo=?, correo=?, puesto=?, area=?, num_reloj_checador=?, rol=?
     WHERE id=?`,
    [d.nombre_completo, d.correo.toLowerCase(), d.puesto || null, d.area || null, d.num_reloj_checador || null, d.rol || "usuario", usuarioId]
  );
}
export async function listUsuarios() {
  return q("SELECT * FROM usuarios ORDER BY estado, nombre_completo");
}
export async function listSistemas() {
  return q("SELECT * FROM sistemas ORDER BY orden, id");
}
export async function actualizarSistema(sistemaId, d) {
  await q(
    "UPDATE sistemas SET nombre=?, descripcion=?, url_destino=? WHERE id=?",
    [d.nombre, d.descripcion || null, d.url_destino || null, sistemaId]
  );
}

// ── Admin: asignaciones ──
export async function getAsignacionesDe(usuarioId) {
  const rows = await q("SELECT sistema_id FROM asignaciones WHERE usuario_id=?", [usuarioId]);
  return rows.map((r) => r.sistema_id);
}
export async function setAsignacion(usuarioId, sistemaId, activar, adminId) {
  if (activar) {
    await q(
      "INSERT IGNORE INTO asignaciones (usuario_id, sistema_id, asignado_por) VALUES (?,?,?)",
      [usuarioId, sistemaId, adminId]
    );
  } else {
    await q("DELETE FROM asignaciones WHERE usuario_id=? AND sistema_id=?", [usuarioId, sistemaId]);
  }
}

// ── v2: Juego posterior al manual (el empleado elige sopa de letras o ahorcado) ──
export async function guardarQuiz(manualId, juego) {
  await q("UPDATE quizzes SET activo=0 WHERE manual_id=?", [manualId]);
  const r = await q("INSERT INTO quizzes (manual_id, activo) VALUES (?,1)", [manualId]);
  const quizId = r.insertId;
  await q("DELETE FROM palabras_clave WHERE manual_id=?", [manualId]);
  for (const w of juego.palabras_clave) {
    await q("INSERT INTO palabras_clave (manual_id, palabra) VALUES (?,?)", [manualId, w]);
  }
  return quizId;
}

// Juego para el empleado (elige entre sopa de letras o ahorcado, ambos usan las mismas palabras).
export async function getQuizParaUsuario(sistemaId) {
  const manuales = await q("SELECT id FROM manuales WHERE sistema_id=? LIMIT 1", [sistemaId]);
  if (!manuales[0]) return null;
  const quizzes = await q("SELECT id FROM quizzes WHERE manual_id=? AND activo=1 LIMIT 1", [manuales[0].id]);
  if (!quizzes[0]) return null;
  const palabras = await q("SELECT palabra FROM palabras_clave WHERE manual_id=?", [manuales[0].id]);
  return {
    quizId: quizzes[0].id,
    palabras: palabras.map((w) => w.palabra),
  };
}

// ── v2: Admin — crear sistema / registrar manual ──
export async function crearSistema(d) {
  const r = await q(
    "INSERT INTO sistemas (nombre, descripcion, url_destino, orden) VALUES (?,?,?,?)",
    [d.nombre, d.descripcion || null, d.url_destino || null, d.orden || 0]
  );
  return r.insertId;
}
export async function registrarManual(d) {
  const r = await q(
    "INSERT INTO manuales (sistema_id, titulo, codigo, archivo_path, total_paginas, version) VALUES (?,?,?,?,?,?)",
    [d.sistema_id, d.titulo, d.codigo || null, d.archivo_path, d.total_paginas || 1, d.version || "V00"]
  );
  return r.insertId;
}
export async function getManualPorId(manualId) {
  const r = await q("SELECT * FROM manuales WHERE id=? LIMIT 1", [manualId]);
  return r[0] || null;
}

// ── v2: Reporte de avance (para exportar) ──
export async function reporteAvance() {
  return q(
    `SELECT u.nombre_completo, u.correo, u.area, s.nombre AS sistema,
            CASE WHEN p.leido=1 THEN 'Leído' ELSE 'Pendiente' END AS estado_manual,
            p.fecha_leido
     FROM asignaciones asig
     JOIN usuarios u ON u.id=asig.usuario_id
     JOIN sistemas s ON s.id=asig.sistema_id
     LEFT JOIN manuales m ON m.sistema_id=s.id
     LEFT JOIN progreso_usuario p ON p.manual_id=m.id AND p.usuario_id=u.id
     ORDER BY u.nombre_completo, s.nombre`
  );
}

export async function listManuales() {
  return q(
    `SELECT m.id, m.titulo, m.codigo, m.version, m.total_paginas, m.sistema_id, m.archivo_path,
            CASE
              WHEN LOWER(m.archivo_path) REGEXP '\\.(mp4|webm|ogg|mov|m4v)$' THEN 'video'
              ELSE 'pdf'
            END AS material_tipo,
            s.nombre AS sistema_nombre,
            EXISTS(SELECT 1 FROM quizzes qz WHERE qz.manual_id=m.id AND qz.activo=1) AS tiene_quiz
     FROM manuales m JOIN sistemas s ON s.id=m.sistema_id
     ORDER BY s.nombre`
  );
}

// ── v4: Editor del juego posterior al manual (admin) ──
export async function getQuizAdmin(manualId) {
  const quizzes = await q("SELECT id FROM quizzes WHERE manual_id=? AND activo=1 LIMIT 1", [manualId]);
  const palabras = await q("SELECT palabra FROM palabras_clave WHERE manual_id=?", [manualId]);
  return {
    quizId: quizzes[0]?.id || null,
    palabras: palabras.map((w) => w.palabra),
  };
}
