const ADMIN_SUBDOMAIN_HOST = 'admin.sirivruddhi.com';

export function isAdminSubdomain(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return /^admin\./i.test(window.location.hostname);
}

export function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export function isAdminApp(url?: string): boolean {
  if (isAdminSubdomain()) {
    return true;
  }
  const path = url || (typeof window !== 'undefined' ? window.location.pathname : '');
  return path.startsWith('/admin');
}

export function adminLoginPath(): string[] {
  return isAdminSubdomain() ? ['/login'] : ['/admin/login'];
}

export function adminInquiriesPath(): string[] {
  return isAdminSubdomain() ? ['/inquiries'] : ['/admin/inquiries'];
}

export function adminInquiryPath(id: number): string[] {
  return isAdminSubdomain() ? ['/inquiries', String(id)] : ['/admin/inquiries', String(id)];
}

export function adminPortalUrl(path = '/inquiries'): string {
  if (isLocalDevHost()) {
    return `http://localhost:4200/admin${path}`;
  }
  return `https://${ADMIN_SUBDOMAIN_HOST}${path}`;
}

export function redirectToAdminPortal(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const suffix = window.location.pathname.replace(/^\/admin/, '') || '/inquiries';
  const target = isLocalDevHost()
    ? `http://localhost:4200/admin${suffix}${window.location.search}${window.location.hash}`
    : `https://${ADMIN_SUBDOMAIN_HOST}${suffix}${window.location.search}${window.location.hash}`;

  window.location.replace(target);
}
