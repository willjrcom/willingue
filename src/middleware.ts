import { NextRequest, NextResponse } from "next/server";
import { canonicalizePath } from "@/lib/route-aliases";

/** Existing bookmarks and stored notification links resolve to the English URLs. */
export function middleware(request: NextRequest) {
  const current = request.nextUrl.pathname;
  const canonical = canonicalizePath(current);
  if (canonical === current) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = canonical;
  return NextResponse.redirect(url, 308);
}
export const config = {
  matcher: [
    "/administrador/:path*", "/admin/:path*",
    "/responsavel/:path*", "/guardian/:path*",
    "/aprender/:path*", "/atividades/:path*", "/contas/:path*",
    "/licoes/:path*", "/minha-turma/:path*", "/notificacoes/:path*",
    "/perfil/:path*", "/preferencias/:path*", "/recompensas/:path*",
    "/trilhas/:path*",
  ],
};
