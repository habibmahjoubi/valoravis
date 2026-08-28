/** Escape HTML special characters to prevent XSS in email templates */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escape a value for safe inclusion in a CSV file:
 * - neutralises spreadsheet formula injection (leading = + - @ TAB CR)
 * - doubles quotes and always wraps the field in quotes
 */
export function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

/** True if a string looks like a spreadsheet formula (CSV injection vector) */
export function isFormulaInjection(value: string | null | undefined): boolean {
  return !!value && /^[=+\-@\t\r]/.test(value);
}

/**
 * Read a string field from FormData, tolerating a missing/non-string value.
 * Never throws — returns "" when absent so callers can `.trim()` safely.
 */
export function formString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/** Retire les accents d'une chaîne (é → e, à → a, ç → c…). */
export function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Dérive un Sender ID SMS alphanumérique à partir d'un nom (nom du commerce).
 * Règles opérateurs : 1 à 11 caractères, [A-Za-z0-9], au moins une lettre.
 * Retourne null si aucun ID valide ne peut être produit (→ repli sur le numéro).
 */
export function toSmsSenderId(name: string | null | undefined): string | null {
  if (!name) return null;
  const cleaned = stripAccents(name).replace(/[^A-Za-z0-9]/g, "").slice(0, 11);
  if (cleaned.length === 0 || !/[A-Za-z]/.test(cleaned)) return null;
  return cleaned;
}

const NICHE_LABELS: Record<string, string> = {
  DENTIST: "Dentiste",
  OSTEOPATH: "Ostéopathe",
  GARAGE: "Garage",
  OTHER: "Autre",
};

export function getNicheLabel(niche: string, customNiche?: string | null): string {
  if (niche === "OTHER" && customNiche) return customNiche;
  return NICHE_LABELS[niche] || niche;
}

export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}${path}`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Add N business days (Mon-Fri) to a date */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

/**
 * Formate un prix en euros : 29 → "29\u20AC", 9.99 → "9,99\u20AC", 0 → "Gratuit"
 */
export function formatPrice(price: number): string {
  if (price === 0) return "Gratuit";
  return price.toLocaleString("fr-FR", {
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }) + "\u20AC";
}

/**
 * Convertit un hex Google Maps (0x....:0x....) en Place ID (ChIJ...).
 * L'encodage est du protobuf : [0x0a, 0x12, 0x09, ...hex1_LE, 0x11, ...hex2_LE]
 */
function mapsHexToPlaceId(hex1: string, hex2: string): string {
  function hexToLEBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = hex.length - 2; i >= 0; i -= 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  const bytes = [
    0x0a, 0x12,
    0x09, ...hexToLEBytes(hex1),
    0x11, ...hexToLEBytes(hex2),
  ];

  const b64 = typeof Buffer !== "undefined"
    ? Buffer.from(bytes).toString("base64")
    : btoa(String.fromCharCode(...bytes));

  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Convertit n'importe quelle URL Google en URL writereview directe.
 *
 * Entrees supportees :
 * - Place ID : "ChIJxxxxxx"
 * - writereview : "https://search.google.com/local/writereview?placeid=ChIJ..."
 * - Google Maps URL : "https://www.google.com/maps/place/...!1s0x...:0x...!..."
 * - g.page : "https://g.page/r/.../review"
 * - maps.app.goo.gl court
 *
 * Sortie : "https://search.google.com/local/writereview?placeid=ChIJ..."
 */
const ALLOWED_GOOGLE_HOSTS = [
  "google.com", "google.fr", "google.co.uk", "google.de", "google.es",
  "google.it", "google.nl", "google.be", "google.ch", "google.ca",
  "maps.google.com", "search.google.com", "g.page", "maps.app.goo.gl",
];

function isGoogleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return ALLOWED_GOOGLE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** Only ever emit a safe absolute https URL (or empty). Blocks javascript:/data: etc. */
function safeHttpsUrl(url: string): string {
  const v = url.trim();
  if (/^https:\/\//i.test(v)) return v;
  if (/^http:\/\//i.test(v)) return "https://" + v.slice(7);
  return "";
}

function encodePlaceId(id: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`;
}

export function toGoogleWriteReviewUrl(url: string): string {
  if (!url) return "";

  const trimmed = url.trim();

  // Deja un Place ID brut
  if (/^ChIJ[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return encodePlaceId(trimmed);
  }

  // Vérifier que c'est un domaine Google avant d'extraire
  if (trimmed.startsWith("http") && !isGoogleUrl(trimmed)) return "";

  // Deja au format writereview
  if (trimmed.includes("search.google.com/local/writereview")) {
    return safeHttpsUrl(trimmed);
  }

  // Extraire placeid d'un parametre URL
  const placeIdParam = trimmed.match(/[?&]placeid=([^&]+)/i);
  if (placeIdParam) {
    return encodePlaceId(decodeURIComponent(placeIdParam[1]));
  }

  // Extraire place_id: depuis q= param (format Google Maps search)
  const placeIdInQuery = trimmed.match(/place_id:(ChIJ[a-zA-Z0-9_-]+)/);
  if (placeIdInQuery) {
    return encodePlaceId(placeIdInQuery[1]);
  }

  // Extraire hex depuis une URL Google Maps (!1s0x....:0x....)
  // ou Google Search (#lrd=0x....:0x....)
  const hexMatch =
    trimmed.match(/!1s0x([0-9a-f]+):0x([0-9a-f]+)/i) ||
    trimmed.match(/lrd=0x([0-9a-f]+):0x([0-9a-f]+)/i);
  if (hexMatch) {
    const placeId = mapsHexToPlaceId(hexMatch[1], hexMatch[2]);
    return encodePlaceId(placeId);
  }

  // Format g.page/r/... → ajouter /review
  if (trimmed.includes("g.page/r/")) {
    const clean = trimmed.replace(/\/(review)?$/, "");
    return safeHttpsUrl(`${clean}/review`);
  }

  // Google Search URLs don't contain Place IDs — cannot convert
  if (trimmed.includes("google.com/search")) return "";

  // URL non reconnue — rejeter si ce n'est pas un domaine Google
  if (!isGoogleUrl(trimmed)) return "";

  // Défense finale : uniquement une URL https absolue
  return safeHttpsUrl(trimmed);
}
