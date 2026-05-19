import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-token';
import { canAccessRoute, ROUTES_ADMIN_ONLY } from '@/lib/roles';

const PUBLIC_PAGES = ['/login', '/inscription'];
const PUBLIC_API = ['/api/auth/login', '/api/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('mafamille_session')?.value;
  const session = token ? await verifyToken(token) : null;

  if (PUBLIC_API.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const adminApi = [
      '/api/membres',
      '/api/cotisations',
      '/api/depenses',
      '/api/auth/register',
      '/api/users',
    ];
    if (
      session.role !== 'admin' &&
      adminApi.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
    }
    if (pathname.startsWith('/api/reunions') && request.method !== 'GET' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
    }
    if (pathname.startsWith('/api/presences') && request.method !== 'GET' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
    }
    if (pathname.startsWith('/api/galerie') && request.method !== 'GET' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
    }
    return NextResponse.next();
  }

  if (PUBLIC_PAGES.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }



  if (!session) {
    const login = new URL('/login', request.url);
    login.searchParams.set('from', pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === '/' && session.role === 'membre') {
    return NextResponse.redirect(new URL('/mon-espace', request.url));
  }

  if (!canAccessRoute(session.role, pathname)) {
    if (session.role === 'membre') {
      return NextResponse.redirect(new URL('/mon-espace', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (
    session.role !== 'admin' &&
    ROUTES_ADMIN_ONLY.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    return NextResponse.redirect(new URL('/mon-espace', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
