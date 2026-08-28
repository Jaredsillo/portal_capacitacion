import { handlers } from "@/auth";
export const runtime = "nodejs";           // mysql2 requiere Node (no Edge)
export const { GET, POST } = handlers;
