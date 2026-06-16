/**
 * security.ts — Application-level security utilities
 * Covers: rate limiting, input sanitisation, URL validation, safe JSON parse
 */

// ── Rate Limiter (client-side, per action key) ──────────────────────────────
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const rateLimitStore: Record<string, RateLimitEntry> = {};

/**
 * Returns true if the action is allowed, false if rate-limited.
 * @param key      Unique key for the action (e.g. "feedback-submit")
 * @param maxAttempts  Maximum allowed attempts in the window
 * @param windowMs  Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore[key];

  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitStore[key] = { count: 1, firstAttempt: now };
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false; // rate limited
  }

  entry.count += 1;
  return true;
}

// ── Input Sanitisation ──────────────────────────────────────────────────────
/**
 * Strips HTML tags and trims a string to prevent XSS in text content.
 * React already escapes JSX text, but this guards inputs stored in DB/localStorage.
 */
export function sanitizeText(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[<>"'`]/g, '') // strip remaining special chars
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitise a URL: only allow http:// and https:// schemes.
 * Returns null for dangerous URLs (javascript:, data:, etc.)
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validate that a redirect URL is same-origin to prevent open redirects.
 */
export function isSameOriginUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

// ── Safe localStorage ────────────────────────────────────────────────────────
/**
 * Safely parse JSON from localStorage, returning the fallback on any error.
 * Prevents crashes from corrupted / tampered localStorage data.
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted or tampered data — clear it and use default
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return fallback;
  }
}

// ── Assignment / feedback field length caps ──────────────────────────────────
export const FIELD_LIMITS = {
  assignmentTitle:       200,
  assignmentDescription: 1000,
  assignmentSubject:     100,
  feedbackText:          2000,
  feedbackEmail:         254,   // RFC 5321 max
  profileName:           100,
  profileRollNo:         30,
  profileBranch:         100,
} as const;

// ── Admin email whitelist ────────────────────────────────────────────────────
export const ADMIN_EMAILS: ReadonlySet<string> = new Set([
  'yogeshkumarlearner@gmail.com',
]);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.toLowerCase().trim());
}
