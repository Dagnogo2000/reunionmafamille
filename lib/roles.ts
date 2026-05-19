export type AppRole = 'admin' | 'membre';

export const ROUTES_ADMIN_ONLY = ['/membres', '/cotisations', '/inscription'];

export const ROUTES_MEMBRE = ['/mon-espace', '/reunions', '/galerie'];

export function isAdmin(role: AppRole) {
  return role === 'admin';
}

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  if (isAdmin(role)) return true;
  if (ROUTES_ADMIN_ONLY.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return false;
  }
  return ROUTES_MEMBRE.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}
