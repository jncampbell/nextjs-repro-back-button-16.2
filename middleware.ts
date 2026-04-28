import { NextResponse, type NextRequest } from 'next/server';

// The trigger: any `Set-Cookie` header from middleware is enough.
// Static value used here so it is clear the bug does not depend on the
// cookie value changing.
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.cookies.set('app_session', 'static-value', { path: '/' });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
