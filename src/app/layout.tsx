import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Willingue · Aprenda inglês do seu jeito", template: "%s · Willingue" },
  description: "Willingue: inglês para todas as idades, com trilhas de aprendizagem, evolução escolar, atividades e recompensas digitais.",
  metadataBase: new URL("https://willingue.menudevendas.com.br"),
  openGraph: {
    type: "website", locale: "pt_BR",
    title: "Willingue | Aprender inglês é uma conquista",
    description: "Aprenda inglês com trilhas interativas, desafios e acompanhamento escolar para alunos e responsáveis.",
    siteName: "Willingue", url: "https://willingue.menudevendas.com.br/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Willingue - Seu inglês vai longe!" }],
  },
  twitter: {
    card: "summary_large_image", title: "Willingue | Aprenda inglês do seu jeito",
    description: "Trilhas interativas, desafios, evolução escolar e recompensas digitais.",
    images: ["/opengraph-image"],
  },
  alternates: { canonical: "/" },
  applicationName: "Willingue",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Willingue" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon", type: "image/png" }], apple: "/apple-icon" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#6754e8" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
