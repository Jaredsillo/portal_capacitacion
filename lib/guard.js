// Utilidades para proteger páginas y rutas según sesión/rol.
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.rol !== "admin") redirect("/dashboard");
  return user;
}
export async function requireTH() {
  const user = await requireUser();
  if (user.rol !== "th" && user.rol !== "admin") redirect("/dashboard");
  return user;
}
