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
    <div style={S.wrap}>
      <div style={S.card}>
        <svg width="52" height="52" viewBox="0 0 40 40" style={{ marginBottom: 18 }} aria-hidden>
          <polygon points="5,15 20,5 35,15" fill="#EAF2FF" stroke="#6AC72A" strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="5" y="15" width="30" height="3" fill="#004CA6" />
          <rect x="8" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="15" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="22" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="29" y="19" width="4.5" height="13" rx="1" fill="#004CA6" />
          <rect x="4" y="32" width="32" height="3" fill="#004CA6" />
          <rect x="3" y="36" width="34" height="2" fill="#6AC72A" />
        </svg>
        <div style={S.eyebrow}>Universidad Hipócrates</div>
        <h1 className="serif" style={S.title}>Portal de Capacitación</h1>
        <p style={S.sub}>Ingresa con tu cuenta institucional para ver tus manuales y sistemas.</p>
        <form action={entrar}>
          <button type="submit" style={S.btn}>
            <GoogleIcon /> Iniciar sesión con Google
          </button>
        </form>
        <p style={S.foot}>Solo cuentas <b>@uhipocrates.edu.mx</b> autorizadas.</p>
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

const S = {
  wrap: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 20,
    background: "linear-gradient(160deg,#EAF0FA,#F4F6FA)" },
  card: { background: "#fff", borderRadius: 20, padding: "44px 40px", width: "min(420px,100%)",
    textAlign: "center", boxShadow: "0 20px 50px -20px rgba(0,76,166,.35)", border: "1px solid #E3E8F1" },
  eyebrow: { fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#5B6B85", fontWeight: 600 },
  title: { fontSize: 28, fontWeight: 600, margin: "6px 0 10px" },
  sub: { fontSize: 14.5, color: "#5B6B85", lineHeight: 1.55, margin: "0 0 26px" },
  btn: { display: "inline-flex", alignItems: "center", gap: 10, width: "100%", justifyContent: "center",
    padding: "13px 18px", borderRadius: 11, border: "1px solid #E3E8F1", background: "#fff",
    fontSize: 15, fontWeight: 600, cursor: "pointer", color: "#14213A" },
  foot: { fontSize: 12.5, color: "#5B6B85", marginTop: 20 },
};
