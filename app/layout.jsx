import "./globals.css";

export const metadata = {
  title: "Portal de Capacitación · Universidad Hipócrates",
  description: "Onboarding y capacitación del personal administrativo",
};

// Aplica el tema guardado (o el del sistema) antes de pintar, para evitar parpadeo.
const THEME_SCRIPT = `
(function(){
  try{
    var t = localStorage.getItem("uhi-theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  }catch(e){}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
