import { environment } from '../environments/environment';

const PRODUCTION_API_URL = 'https://siri-vruddhi-api.onrender.com/api';
const LOCAL_API_URL = 'http://localhost:3000/api';

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/** Resolve API base URL from the current host — avoids loopback calls on the live site. */
export function resolveApiUrl(): string {
  if (typeof window === 'undefined') {
    return environment.apiUrl;
  }

  const hostname = window.location.hostname;
  if (isLocalHost(hostname)) {
    return LOCAL_API_URL;
  }

  // Public hosts must never call localhost (guards against a mis-built deploy).
  return PRODUCTION_API_URL;
}

export function isLiveSite(): boolean {
  if (typeof window === 'undefined') {
    return environment.production;
  }
  return !isLocalHost(window.location.hostname);
}
