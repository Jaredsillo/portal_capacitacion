// Envío de correos por SMTP (aviso al administrador).
import nodemailer from "nodemailer";

let _t;
function transporter() {
  if (!_t) {
    _t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE) === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }
  return _t;
}

// Avisa al admin que un empleado terminó de leer un manual.
export async function avisarManualLeido({ nombreUsuario, correoUsuario, sistema, manual }) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return;
  const fecha = new Date().toLocaleString("es-MX");
  await transporter().sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `✔ ${nombreUsuario} leyó el manual de ${sistema}`,
    text:
      `El colaborador ${nombreUsuario} (${correoUsuario}) marcó como leído el manual ` +
      `"${manual}" del sistema ${sistema}.\n\nFecha: ${fecha}\n\n— Portal de Capacitación UHI`,
    html:
      `<p>El colaborador <b>${nombreUsuario}</b> (${correoUsuario}) marcó como leído el manual ` +
      `<b>${manual}</b> del sistema <b>${sistema}</b>.</p><p>Fecha: ${fecha}</p>` +
      `<hr><small>Portal de Capacitación · Universidad Hipócrates</small>`,
  });
}
