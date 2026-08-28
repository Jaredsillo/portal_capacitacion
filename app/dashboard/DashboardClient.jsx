"use client";
import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Quiz from "@/components/Quiz";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DashboardClient({ usuario, sistemas: inicial, salir }) {
  const [sistemas, setSistemas] = useState(inicial);
  const [visor, setVisor] = useState(null);      // sistema abierto
  const [numPages, setNumPages] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [maxVista, setMaxVista] = useState(1);
  const [videoPct, setVideoPct] = useState(0);
  const [quizSistema, setQuizSistema] = useState(null);
  const [toast, setToast] = useState("");

  const completados = sistemas.filter((s) => s.leido).length;
  const conManual = sistemas.filter((s) => s.tieneManual).length;
  const pct = conManual ? Math.round((completados / conManual) * 100) : 100;

  function notar(m) { setToast(m); setTimeout(() => setToast(""), 2600); }

  async function abrir(s) {
    setVisor(s); setPagina(1); setMaxVista(1); setNumPages(s.paginas || 0); setVideoPct(0);
    fetch("/api/actividad", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evento: "ver_manual", sistemaId: s.id, detalle: `Abrió el manual de ${s.nombre}` }) });
  }
  function irPagina(n) {
    const tope = numPages || visor.paginas || 1;
    const p = Math.min(Math.max(1, n), tope);
    setPagina(p); setMaxVista((m) => Math.max(m, p));
  }
  const esVideo = visor?.materialTipo === "video";
  const alFinal = visor && (esVideo ? videoPct >= 95 : numPages > 0 && maxVista >= numPages);

  // Al llegar al final: si hay evaluación, se toma; si no, se marca leído directo.
  function terminarManual() {
    const s = visor;
    if (s.tieneQuiz) { setVisor(null); setQuizSistema(s); }
    else marcarLeido();
  }
  function aprobo(sistemaId) {
    setSistemas((arr) => arr.map((x) => (x.id === sistemaId ? { ...x, leido: true } : x)));
    notar("Material completado correctamente.");
  }

  async function marcarLeido() {
    const s = visor;
    const r = await fetch("/api/progreso", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sistemaId: s.id, sistemaNombre: s.nombre, paginasVistas: maxVista }) });
    if (r.ok) {
      setSistemas((arr) => arr.map((x) => (x.id === s.id ? { ...x, leido: true } : x)));
      notar(`Manual de "${s.nombre}" marcado como leído`);
      setVisor(null);
    } else notar("No se pudo guardar. Intenta de nuevo.");
  }

  async function irSistema(s) {
    const bloqueado = s.tieneManual && !s.leido;   // sin manual => acceso abierto
    if (bloqueado) return;
    const r = await fetch("/api/actividad", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evento: "click_sistema", sistemaId: s.id, detalle: `Accedió a ${s.nombre}` }) });
    const data = await r.json().catch(() => ({}));
    setSistemas((arr) => arr.map((x) => (x.id === s.id ? { ...x, visitado: true } : x)));
    notar(`Acceso a "${s.nombre}" registrado`);
    const url = data.url || s.url;
    if (url) window.open(url, "_blank", "noopener");
  }

  useEffect(() => {
    function key(e) { if (!visor) return; if (e.key === "ArrowRight") irPagina(pagina + 1); if (e.key === "ArrowLeft") irPagina(pagina - 1); }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  return (
    <div>
      <style>{CSS}</style>
      <div className="bar">
        <div className="brand"><Marca /><div><div className="eyebrow">Universidad Hipócrates</div><div className="title serif">Portal de Capacitación</div></div></div>
        <div className="user">
          <div className="col-hide" style={{ textAlign: "right" }}><div className="n">{usuario.nombre}</div><div className="e">{usuario.correo}</div></div>
          <div className="ava">{(usuario.nombre || "U")[0]}</div>
          {usuario.rol === "admin" && <a className="link" href="/admin">Admin</a>}
          <form action={salir}><button className="link" type="submit">Salir</button></form>
        </div>
      </div>

      <div className="wrap">
        <div className="hero">
          <div className="heroleft">
            <div className="hi">Bienvenido de nuevo</div>
            <h1 className="serif">Hola, {(usuario.nombre || "").split(" ")[0]}.</h1>
            <p>Cada sistema que te asignaron es una columna de tu templo. Lee su manual para levantarla y desbloquear el acceso.</p>
            <div className="prog"><span className="big serif">{completados}</span><span className="lbl">de {conManual} manuales completados</span></div>
            <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
            <img className="mascota" src="/mascota.png" alt="Mascota Universidad Hipócrates" />
          </div>
          <div className="heroright">
            <Templo sistemas={sistemas} />
          </div>
        </div>

        <div className="sec"><h2 className="serif">Tus sistemas</h2><span className="cnt">{completados}/{conManual} listos</span></div>
        <div className="grid">
          {sistemas.map((s, i) => {
            const bloqueado = s.tieneManual && !s.leido;
            return (
              <div key={s.id} className={`card ${s.leido ? "done" : ""}`}>
                <div className="ctop">
                  <div className="num">{i + 1}</div>
                  {s.visitado ? <span className="chip chip-done">Acceso registrado</span>
                    : s.leido ? <span className="chip chip-read">Manual leído</span>
                    : !s.tieneManual ? <span className="chip chip-soft">Sin manual aún</span>
                    : <span className="chip chip-pend">Pendiente</span>}
                </div>
                <h3>{s.nombre}</h3>
                <p className="d">{s.desc}</p>
                <p className="meta">
                  {s.tieneManual
                    ? (s.materialTipo === "video" ? "🎬 Video de capacitación" : `📄 Manual · ${s.paginas} páginas`)
                    : "Material por publicar"}
                </p>
                <div className="acts">
                  {s.tieneManual
                    ? <button className="btn" onClick={() => abrir(s)}>{s.leido ? "Revisar" : "Ver material"}</button>
                    : <button className="btn" disabled style={{ opacity: .5, cursor: "default" }}>Sin material</button>}
                  <button className={`btn ${bloqueado ? "lock" : "prim"}`} onClick={() => irSistema(s)} disabled={bloqueado}>
                    {bloqueado ? "🔒 Bloqueado" : "Ir al sistema"}
                  </button>
                </div>
                {s.leido && s.tieneQuiz && (
                  <button className="repasar" onClick={() => setQuizSistema(s)}>🎮 Repasar y jugar</button>
                )}
              </div>
            );
          })}
        </div>
        {sistemas.length === 0 && <p style={{ color: "var(--muted)", marginTop: 24 }}>Aún no tienes sistemas asignados. El administrador te asignará tus sistemas pronto.</p>}
      </div>

      {visor && (
        <div className="ov" onClick={(e) => e.target === e.currentTarget && setVisor(null)}>
          <div className="viewer">
            <div className="vhead">
              <div><div className="k">{esVideo ? "Video" : "Manual"} · {visor.codigo || ""}</div><h3>{visor.nombre}</h3></div>
              <button className="x" onClick={() => setVisor(null)}>×</button>
            </div>
            <div className="stage">
              {esVideo ? (
                <video
                  src={`/api/manual/${visor.id}`}
                  controls
                  className="video"
                  onTimeUpdate={(e) => {
                    const t = e.currentTarget.currentTime || 0;
                    const d = e.currentTarget.duration || 0;
                    if (d > 0) setVideoPct((m) => Math.max(m, Math.round((t / d) * 100)));
                  }}
                  onEnded={() => setVideoPct(100)}
                />
              ) : (
                <Document file={`/api/manual/${visor.id}`} onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<div style={{ padding: 40, color: "#5B6B85" }}>Cargando manual…</div>}
                  error={<div style={{ padding: 40, color: "#B23" }}>No se pudo cargar el PDF.</div>}>
                  <Page pageNumber={pagina} width={440} renderTextLayer={false} renderAnnotationLayer={false} />
                </Document>
              )}
            </div>
            <div className="vfoot">
              <div className="readbar">
                <div className="rt"><div className="rf" style={{ width: `${esVideo ? videoPct : (numPages ? Math.round((maxVista / numPages) * 100) : 0)}%` }} /></div>
                <span className="rl">
                  {esVideo ? `${videoPct}% del video visto` : `${maxVista} de ${numPages || visor.paginas} páginas vistas`}
                </span>
              </div>
              <div className="nav">
                {!esVideo && <button className="navbtn" onClick={() => irPagina(pagina - 1)} disabled={pagina <= 1}>‹ Anterior</button>}
                {!esVideo && <div className="slider"><input type="range" min="1" max={numPages || visor.paginas || 1} value={pagina} onChange={(e) => irPagina(+e.target.value)} /></div>}
                {!esVideo && <span className="ind">Pág. {pagina} / {numPages || visor.paginas}</span>}
                {!esVideo && <button className="navbtn" onClick={() => irPagina(pagina + 1)} disabled={pagina >= (numPages || visor.paginas)}>Siguiente ›</button>}
                <button className="cta" disabled={!alFinal} onClick={terminarManual}>{visor.tieneQuiz ? "Ir a sopa de letras" : "Marcar como leído"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {quizSistema && (
        <Quiz sistema={quizSistema} onCerrar={() => setQuizSistema(null)} onAprobado={() => aprobo(quizSistema.id)} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Templo({ sistemas }) {
  const n = Math.max(sistemas.length, 1);
  const colW = 26, gap = 12, padX = 30;
  const width = padX * 2 + n * colW + (n - 1) * gap;
  const baseY = 168, top = 70, colH = baseY - top;
  return (
    <svg style={{ display: "block", margin: "0 auto", maxWidth: 380, width: "100%" }} viewBox={`0 0 ${width} 210`}>
      <polygon points={`${padX - 10},${top} ${width / 2},28 ${width - padX + 10},${top}`} fill="#EAF2FF" stroke="#6AC72A" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x={padX - 14} y={top} width={width - (padX - 14) * 2} height="12" rx="2" fill="#004CA6" />
      {sistemas.map((s, i) => {
        const x = padX + i * (colW + gap); const on = s.leido;
        return (
          <g key={s.id}>
            <rect x={x - 3} y={top + 12} width={colW + 6} height="8" rx="2" fill={on ? "#6AC72A" : "#D4DCEA"} />
            <rect x={x} y={top + 20} width={colW} height={colH - 28} rx="3" fill={on ? "#004CA6" : "#EAEEF6"} stroke={on ? "#0A3C7D" : "#D4DCEA"} strokeWidth="1.5" />
            <rect x={x - 4} y={baseY - 8} width={colW + 8} height="8" rx="2" fill={on ? "#004CA6" : "#D4DCEA"} />
          </g>
        );
      })}
      <rect x={padX - 18} y={baseY} width={width - (padX - 18) * 2} height="9" rx="2" fill="#004CA6" />
      <rect x={padX - 24} y={baseY + 11} width={width - (padX - 24) * 2} height="4" rx="2" fill="#6AC72A" />
    </svg>
  );
}

function Marca() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
      <polygon points="5,15 20,5 35,15" fill="#EAF2FF" stroke="#6AC72A" strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="5" y="15" width="30" height="3" fill="#004CA6" />
      <rect x="8" y="19" width="4.5" height="13" rx="1" fill="#004CA6" /><rect x="15" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
      <rect x="22" y="19" width="4.5" height="13" rx="1" fill="#004CA6" /><rect x="29" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
      <rect x="4" y="32" width="32" height="3" fill="#004CA6" /><rect x="3" y="36" width="34" height="2" fill="#6AC72A" />
    </svg>
  );
}

const CSS = `
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 28px;background:var(--card);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20;}
.brand{display:flex;align-items:center;gap:12px;}
.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.title{font-size:17px;font-weight:600;line-height:1.1;}
.user{display:flex;align-items:center;gap:12px;}
.ava{width:34px;height:34px;border-radius:50%;background:var(--azul);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px;}
.user .n{font-size:13px;font-weight:600;line-height:1.1;}.user .e{font-size:11px;color:var(--muted);}
.link{background:none;border:0;font:inherit;font-size:13px;font-weight:600;color:var(--azul);cursor:pointer;text-decoration:none;}
.wrap{max-width:1080px;margin:0 auto;padding:26px 28px 64px;}
.hero{background:linear-gradient(180deg,#fff,#FBFCFE);border:1px solid var(--line);border-radius:20px;padding:30px 32px;display:grid;grid-template-columns:1.05fr 1fr;gap:28px;align-items:center;overflow:hidden;}
.heroright{display:flex;flex-direction:column;align-items:center;}
.heroleft{position:relative;padding-right:70px;}
.mascota{position:absolute;right:0;bottom:0;height:132px;filter:drop-shadow(0 10px 12px rgba(20,33,58,.22));pointer-events:none;}
.repasar{margin-top:10px;width:100%;font:inherit;font-size:12.5px;font-weight:600;padding:8px;border-radius:9px;border:1px dashed #CDD8EA;background:#F7F9FC;color:var(--azul);cursor:pointer;}
.repasar:hover{background:#EEF3FB;border-color:var(--azul);}
.hi{font-size:13px;font-weight:600;color:var(--verde-2);}
.hero h1{font-size:32px;line-height:1.08;margin:8px 0 12px;font-weight:600;}
.hero p{font-size:14.5px;color:var(--muted);line-height:1.55;margin:0 0 22px;max-width:42ch;}
.prog{display:flex;align-items:baseline;gap:10px;margin-bottom:10px;}
.prog .big{font-size:38px;font-weight:700;color:var(--azul);}.prog .lbl{font-size:14px;color:var(--muted);}
.track{height:10px;background:#E6ECF5;border-radius:99px;overflow:hidden;}
.fill{height:100%;background:linear-gradient(90deg,var(--azul),var(--verde));border-radius:99px;transition:width .6s cubic-bezier(.2,.8,.2,1);}
.sec{display:flex;align-items:baseline;justify-content:space-between;margin:34px 4px 16px;}
.sec h2{font-size:22px;font-weight:600;margin:0;}.sec .cnt{font-size:13px;color:var(--muted);}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;display:flex;flex-direction:column;transition:transform .18s,box-shadow .18s,border-color .18s;}
.card:hover{transform:translateY(-3px);box-shadow:0 12px 28px -12px rgba(0,76,166,.28);border-color:#CDD8EA;}
.card.done{border-color:#CDE9B8;}
.ctop{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.num{width:40px;height:40px;border-radius:11px;flex:none;display:grid;place-items:center;font-family:'Fraunces',serif;font-weight:700;font-size:18px;color:#fff;background:var(--azul);}
.card.done .num{background:var(--verde-2);}
.chip{margin-left:auto;font-size:11px;font-weight:600;padding:4px 9px;border-radius:99px;white-space:nowrap;}
.chip-pend{background:#FEF3E2;color:#B7791F;}.chip-read{background:#E7EEFA;color:var(--azul);}
.chip-done{background:var(--verde-soft);color:var(--verde-2);}.chip-soft{background:#F0F1F4;color:#5B6B85;}
.card h3{font-size:15px;font-weight:600;margin:0 0 5px;}
.card .d{font-size:12.5px;color:var(--muted);line-height:1.5;margin:0 0 12px;flex:1;}
.meta{font-size:11px;color:var(--muted);margin:0 0 16px;}
.acts{display:flex;gap:8px;}
.btn{flex:1;font:inherit;font-size:13px;font-weight:600;padding:9px 10px;border-radius:9px;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink);transition:all .15s;display:flex;align-items:center;justify-content:center;gap:6px;}
.btn:hover{border-color:var(--azul);color:var(--azul);}
.btn.prim{background:var(--azul);border-color:var(--azul);color:#fff;}.btn.prim:hover{background:var(--azul-3);}
.btn.lock{opacity:.55;cursor:not-allowed;background:#F3F5F9;color:var(--muted);border-color:var(--line);}
.ov{position:fixed;inset:0;background:rgba(15,25,48,.55);display:grid;place-items:center;padding:20px;z-index:40;}
.viewer{background:#fff;width:min(720px,100%);max-height:92vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 70px -20px rgba(10,20,45,.6);}
.vhead{padding:16px 22px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;}
.vhead .k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.vhead h3{margin:2px 0 0;font-family:'Fraunces',serif;font-size:18px;font-weight:600;}
.x{margin-left:auto;border:0;background:#F1F4F9;width:34px;height:34px;border-radius:9px;cursor:pointer;font-size:18px;color:var(--muted);}
.stage{background:#EEF1F6;padding:22px;overflow-y:auto;display:flex;justify-content:center;}
.stage canvas{box-shadow:0 6px 20px -6px rgba(20,33,58,.3);border-radius:4px;max-width:100%;height:auto!important;}
.video{width:min(100%,680px);max-height:62vh;border-radius:10px;background:#000;}
.vfoot{padding:14px 22px;border-top:1px solid var(--line);}
.readbar{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
.readbar .rt{flex:1;height:7px;background:#E6ECF5;border-radius:99px;overflow:hidden;}
.readbar .rf{height:100%;background:var(--verde-2);border-radius:99px;transition:width .3s;}
.readbar .rl{font-size:12px;color:var(--muted);white-space:nowrap;font-weight:500;}
.nav{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.navbtn{border:1px solid var(--line);background:#fff;font:inherit;font-size:13px;font-weight:600;color:var(--ink);padding:9px 14px;border-radius:9px;cursor:pointer;}
.navbtn:disabled{opacity:.4;cursor:not-allowed;}
.slider{flex:1;min-width:120px;}.slider input{width:100%;accent-color:var(--azul);}
.ind{font-size:12.5px;color:var(--muted);font-weight:600;min-width:96px;text-align:center;}
.cta{font:inherit;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;border:0;cursor:pointer;background:var(--verde-2);color:#fff;white-space:nowrap;}
.cta:disabled{opacity:.4;cursor:not-allowed;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;padding:12px 20px;border-radius:11px;font-size:13.5px;font-weight:500;z-index:60;box-shadow:0 12px 30px -8px rgba(0,0,0,.4);}
@media (max-width:860px){.hero{grid-template-columns:1fr;}.grid{grid-template-columns:repeat(2,1fr);}}
@media (max-width:560px){.grid{grid-template-columns:1fr;}.bar{padding:12px 16px;}.wrap{padding:18px 16px 48px;}.user .col-hide{display:none;}}
`;
