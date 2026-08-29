import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getUsuarioByCorreo, touchUltimoAcceso, logActividad } from "@/lib/queries";

const DOMINIO = process.env.DOMINIO_PERMITIDO || "uhipocrates.edu.mx";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Pre-filtra la pantalla de Google para mostrar solo cuentas del dominio.
      authorization: { params: { hd: DOMINIO, prompt: "select_account" } },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    // Aquí se decide QUIÉN puede entrar (validación real en el servidor).
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email || !email.endsWith("@" + DOMINIO)) return false;   // 1) dominio
      if (profile.email_verified === false) return false;            // 2) correo verificado
      const u = await getUsuarioByCorreo(email);                     // 3) allowlist
      if (!u || u.estado === "baja") return false;
      await touchUltimoAcceso(u.id);
      await logActividad(u.id, "login", null, "Inició sesión con Google");
      return true;
    },
    async jwt({ token, profile }) {
      const email = (profile?.email || token.email || "").toLowerCase();
      if (email) {
        const u = await getUsuarioByCorreo(email);
        if (u) { token.uid = u.id; token.rol = u.rol; token.nombre = u.nombre_completo; }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.rol = token.rol;
        session.user.nombre = token.nombre;
      }
      return session;
    },
  },
});
