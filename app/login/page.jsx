import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect(session.user.rol === "th" ? "/rh" : "/dashboard");

  async function entrar() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  return (
    <div className="wrap">
      <style suppressHydrationWarning>{CSS}</style>
      <div className="card">
        <svg width="52" height="52" viewBox="0 0 40 40" className="mark" aria-hidden>
          <polygon points="5,15 20,5 35,15" fill="#EAF2FF" stroke="#6AC72A" strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="5" y="15" width="30" height="3" fill="#004CA6" />
          <rect x="8" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="15" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="22" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="29" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="4" y="32" width="32" height="3" fill="#004CA6" />
          <rect x="3" y="36" width="34" height="2" fill="#6AC72A" />
        </svg>
        <div className="eyebrow">Universidad Hipócrates</div>
        <h1 className="serif title">Portal de Capacitación</h1>
        <p className="sub">Ingresa con tu cuenta institucional para ver tus manuales y sistemas.</p>
        <form action={entrar}>
          <button type="submit" className="btn">
            <GoogleIcon /> Iniciar sesión con Google
          </button>
        </form>
        <p className="foot">Solo cuentas <b>@uhipocrates.edu.mx</b> autorizadas.</p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 34.9 44 29.9 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

const CSS = `
.wrap{position:relative;min-height:100vh;display:grid;place-items:center;padding:20px;background:var(--bg);overflow:hidden;}
.wrap::before{content:"";position:absolute;top:-18%;left:-12%;width:56vmax;height:56vmax;border-radius:50%;
  background:radial-gradient(circle,rgba(0,76,166,.10) 0%,transparent 62%);pointer-events:none;}
.wrap::after{content:"";position:absolute;bottom:-22%;right:-14%;width:50vmax;height:50vmax;border-radius:50%;
  background:radial-gradient(circle,rgba(106,199,42,.12) 0%,transparent 62%);pointer-events:none;}
.card{position:relative;z-index:1;background:var(--card);border-radius:20px;padding:44px 40px;width:min(420px,100%);
  text-align:center;box-shadow:0 24px 60px -24px rgba(0,76,166,.28);border:1px solid var(--line);
  animation:card-rise .5s var(--ease-out) backwards;animation-delay:60ms;}
@keyframes card-rise{from{opacity:0;transform:translateY(14px) scale(.98);}to{opacity:1;transform:translateY(0) scale(1);}}
.mark{margin-bottom:18px;animation:mark-in .6s var(--ease-out) backwards;animation-delay:160ms;}
@keyframes mark-in{from{opacity:0;transform:scale(.85) rotate(-6deg);}to{opacity:1;transform:scale(1) rotate(0);}}
.eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:600;}
.title{font-size:28px;font-weight:600;margin:6px 0 10px;}
.sub{font-size:14.5px;color:var(--muted);line-height:1.55;margin:0 0 26px;}
.btn{display:inline-flex;align-items:center;gap:10px;width:100%;justify-content:center;padding:13px 18px;border-radius:11px;
  border:1px solid var(--line);background:var(--card);font-size:15px;font-weight:600;cursor:pointer;color:var(--ink);
  transition:border-color .15s var(--ease-out),box-shadow .15s var(--ease-out),transform var(--dur-fast) var(--ease-out);}
.btn:hover{border-color:var(--azul-2);box-shadow:0 6px 18px -10px var(--shadow);}
.foot{font-size:12.5px;color:var(--muted);margin-top:20px;}
`;
