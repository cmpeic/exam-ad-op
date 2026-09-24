import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Repaso para el examen · CI/CD y Calidad",
    template: "%s · Repaso",
  },
  description:
    "Quiz con corrección y reintentos, tarjetas, diagramas interactivos y trucos de memoria para estudiar CI/CD y Aseguramiento de la Calidad del Software.",
  applicationName: "Repaso de exámenes",
  appleWebApp: {
    capable: true,
    title: "Repaso",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${chakra.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div aria-hidden className="bg-glow" />
        <div className="mx-auto w-full max-w-xl px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </body>
    </html>
  );
}
