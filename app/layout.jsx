import "./globals.css";

export const metadata = {
  title: "Portal de Capacitación · Universidad Hipócrates",
  description: "Onboarding y capacitación del personal administrativo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
