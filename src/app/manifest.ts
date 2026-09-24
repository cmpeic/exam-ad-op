import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Repaso para el examen · CI/CD y Calidad",
    short_name: "Repaso",
    description: "Quiz con corrección, tarjetas, diagramas interactivos y trucos de memoria para CI/CD y Aseguramiento de la Calidad.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07070d",
    theme_color: "#07070d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
