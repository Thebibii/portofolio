import prisma from "@/lib/prisma";

// --- Per-IP: lockout keras (menahan brute force dari satu sumber) ---
const IP_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const IP_MAX_ATTEMPTS = 10;
const IP_LOCK_MS = 15 * 60 * 1000; // 15 menit

// --- Per-email: backoff bertambah (bukan lockout total) ---
const EMAIL_WINDOW_MS = 30 * 60 * 1000; // 30 menit
const EMAIL_BACKOFF_START = 5; // mulai backoff setelah 5 kegagalan
const EMAIL_BACKOFF_BASE_MS = 1000; // 1 detik
const EMAIL_BACKOFF_MAX_MS = 5 * 60 * 1000; // 5 menit

// --- Pembersihan oportunistik baris lama (tanpa cron) ---
const CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000; // 24 jam
const CLEANUP_PROBABILITY = 0.1; // ~10% percobaan login

const ipKey = (ip: string) => `ip:${ip}`;
const emailKey = (email: string) => `email:${email.toLowerCase()}`;

/** Ambil IP klien dari header (Vercel: x-forwarded-for). */
export function getClientIp(
  headers?: Record<string, string | string[] | undefined> | Headers
): string {
  const get = (name: string): string | undefined => {
    if (!headers) return undefined;
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name) ?? undefined;
    }
    const record = headers as Record<string, string | string[] | undefined>;
    const value = record[name.toLowerCase()] ?? record[name];
    return Array.isArray(value) ? value[0] : value;
  };

  const forwarded = get("x-forwarded-for");
  if (forwarded && forwarded.trim()) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  return "unknown";
}

/** Hapus baris throttle yang sudah lama secara oportunistik (tanpa cron). */
export async function cleanupOldThrottles(): Promise<void> {
  if (Math.random() > CLEANUP_PROBABILITY) return;
  try {
    await prisma.loginThrottle.deleteMany({
      where: { updatedAt: { lt: new Date(Date.now() - CLEANUP_AFTER_MS) } },
    });
  } catch {
    // abaikan error pembersihan; tidak boleh menggagalkan login
  }
}

/** Cek apakah sebuah key sedang diblokir. */
export async function isThrottled(
  key: string
): Promise<{ blocked: boolean; retryAfterSeconds: number }> {
  const row = await prisma.loginThrottle.findUnique({ where: { key } });
  if (row?.lockedUntil && row.lockedUntil.getTime() > Date.now()) {
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil(
        (row.lockedUntil.getTime() - Date.now()) / 1000
      ),
    };
  }
  return { blocked: false, retryAfterSeconds: 0 };
}

export async function isIpThrottled(ip: string) {
  return isThrottled(ipKey(ip));
}

export async function isEmailThrottled(email: string) {
  return isThrottled(emailKey(email));
}

/** Catat kegagalan login untuk satu IP (lockout keras). */
export async function recordIpFailure(ip: string): Promise<void> {
  const key = ipKey(ip);
  const now = Date.now();
  const row = await prisma.loginThrottle.findUnique({ where: { key } });
  const windowExpired = !row || now - row.updatedAt.getTime() > IP_WINDOW_MS;
  const attempts = windowExpired ? 1 : row.attempts + 1;
  const lockedUntil =
    attempts >= IP_MAX_ATTEMPTS
      ? new Date(now + IP_LOCK_MS)
      : windowExpired
        ? null
        : row!.lockedUntil;

  await prisma.loginThrottle.upsert({
    where: { key },
    create: { key, attempts, lockedUntil },
    update: { attempts, lockedUntil },
  });
}

/** Catat kegagalan login untuk satu email (backoff bertambah, bukan lockout total). */
export async function recordEmailFailure(email: string): Promise<void> {
  const key = emailKey(email);
  const now = Date.now();
  const row = await prisma.loginThrottle.findUnique({ where: { key } });
  const windowExpired = !row || now - row.updatedAt.getTime() > EMAIL_WINDOW_MS;
  const attempts = windowExpired ? 1 : row.attempts + 1;

  let lockedUntil = windowExpired ? null : row!.lockedUntil;
  if (attempts >= EMAIL_BACKOFF_START) {
    const delay = Math.min(
      EMAIL_BACKOFF_BASE_MS * 2 ** (attempts - EMAIL_BACKOFF_START),
      EMAIL_BACKOFF_MAX_MS
    );
    lockedUntil = new Date(now + delay);
  }

  await prisma.loginThrottle.upsert({
    where: { key },
    create: { key, attempts, lockedUntil },
    update: { attempts, lockedUntil },
  });
}

/** Bersihkan counter IP & email setelah login berhasil. */
export async function clearLoginFailures(
  ip: string,
  email: string
): Promise<void> {
  await prisma.loginThrottle.deleteMany({
    where: { key: { in: [ipKey(ip), emailKey(email)] } },
  });
}

// --- Rate limit generik berbasis window (mis. pembuatan blog) ---
/**
 * Konsumsi satu kuota untuk `key`. Bila jumlah percobaan melewati `max`
 * dalam `windowMs`, key dikunci sampai window berakhir. Memakai tabel
 * LoginThrottle yang sama (key diberi prefix oleh pemanggil).
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ limited: boolean; retryAfterSeconds: number }> {
  const now = Date.now();
  const row = await prisma.loginThrottle.findUnique({ where: { key } });

  if (row?.lockedUntil && row.lockedUntil.getTime() > now) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((row.lockedUntil.getTime() - now) / 1000),
    };
  }

  const windowExpired = !row || now - row.updatedAt.getTime() > windowMs;
  const attempts = windowExpired ? 1 : row.attempts + 1;
  const lockedUntil = attempts > max ? new Date(now + windowMs) : null;

  await prisma.loginThrottle.upsert({
    where: { key },
    create: { key, attempts, lockedUntil },
    update: { attempts, lockedUntil },
  });

  return lockedUntil
    ? { limited: true, retryAfterSeconds: Math.ceil(windowMs / 1000) }
    : { limited: false, retryAfterSeconds: 0 };
}
