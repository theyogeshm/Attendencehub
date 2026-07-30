/**
 * security.ts — Application-level security utilities
 * Covers: rate limiting, input sanitisation, URL validation,
 *         safe JSON parse, idle session timeout, admin check
 */

// ── Rate Limiter (client-side, per action key) ──────────────────────────────
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const rateLimitStore: Record<string, RateLimitEntry> = {};

/**
 * Returns true if the action is allowed, false if rate-limited.
 * @param key          Unique key for the action (e.g. "feedback-submit")
 * @param maxAttempts  Maximum allowed attempts in the window
 * @param windowMs     Window duration in milliseconds
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

// ── Admin email check ────────────────────────────────────────────────────────
/**
 * Admin email is read from VITE_ADMIN_EMAIL env var (set in GitHub Secrets
 * for production builds). Falls back to the hardcoded value so the admin
 * panel always works even if the Secret wasn't configured.
 *
 * NOTE: The real data security is enforced server-side by Supabase RLS
 * policies — the client-side check here is just a UX gate (redirect to 404).
 * Knowing the email doesn't bypass anything; the DB rejects unauthorized writes.
 */
const ADMIN_EMAILS: string[] = (() => {
  const envVal = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.toLowerCase() ?? "";
  const parsed = envVal
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  const defaults = ["yogeshkumarlearner@gmail.com", "knowledgespace457@gmail.com"];
  defaults.forEach(d => {
    if (!parsed.includes(d)) parsed.push(d);
  });
  return parsed;
})();

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const target = email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(target);
}

// ── Idle Session Timeout ─────────────────────────────────────────────────────
const IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const IDLE_STORAGE_KEY = 'DTU_HUB_LAST_ACTIVITY';

let _idleTimer: ReturnType<typeof setTimeout> | null = null;
let _onIdleCallback: (() => void) | null = null;

/** Called on every user interaction to reset the inactivity clock. */
function _resetIdleClock() {
  localStorage.setItem(IDLE_STORAGE_KEY, Date.now().toString());
  if (_idleTimer) clearTimeout(_idleTimer);
  if (_onIdleCallback) {
    _idleTimer = setTimeout(_onIdleCallback, IDLE_TIMEOUT_MS);
  }
}

/**
 * Starts monitoring user activity. When the user is inactive for 24 hours,
 * `onIdle` is called (typically `supabase.auth.signOut()`).
 *
 * Also checks on startup whether the previous session already exceeded 24h —
 * if so, calls `onIdle` immediately.
 *
 * Returns a cleanup function to remove event listeners.
 */
export function startIdleTimer(onIdle: () => void): () => void {
  _onIdleCallback = onIdle;

  // Check if last activity was more than 24h ago
  const lastActivity = Number(localStorage.getItem(IDLE_STORAGE_KEY) ?? '0');
  if (lastActivity > 0 && Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
    // Session expired while the tab was closed — sign out on next tick
    setTimeout(onIdle, 0);
    return () => {};
  }

  // Start the timer from now
  _resetIdleClock();

  const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;
  EVENTS.forEach(ev => window.addEventListener(ev, _resetIdleClock, { passive: true }));

  return () => {
    EVENTS.forEach(ev => window.removeEventListener(ev, _resetIdleClock));
    if (_idleTimer) clearTimeout(_idleTimer);
    _onIdleCallback = null;
  };
}

/**
 * Call this on sign-out to clear the idle timestamp from localStorage.
 */
export function clearIdleTimer() {
  if (_idleTimer) clearTimeout(_idleTimer);
  _onIdleCallback = null;
  try { localStorage.removeItem(IDLE_STORAGE_KEY); } catch { /* ignore */ }
}
