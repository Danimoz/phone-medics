import type { NextRequest } from "next/server";
import { updateSession } from "./actions/auth";

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('currentUser')?.value;

  if (!currentUser && !request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/login', request.url))
  }

  updateSession(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
