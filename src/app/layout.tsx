import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Willingue", description: "Aprender inglês é uma jornada." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f7f8fc" }}>{children}</body></html>;
}
