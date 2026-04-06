export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
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
export function toGoogleWriteReviewUrl(url: string): string {
  if (!url) return "";

  const trimmed = url.trim();

  // Deja un Place ID brut
  if (/^ChIJ[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return `https://search.google.com/local/writereview?placeid=${trimmed}`;
  }

  // Deja au format writereview
  if (trimmed.includes("search.google.com/local/writereview")) {
    return trimmed;
  }

  // Extraire placeid d'un parametre URL
  const placeIdParam = trimmed.match(/[?&]placeid=([^&]+)/i);
  if (placeIdParam) {
    return `https://search.google.com/local/writereview?placeid=${placeIdParam[1]}`;
  }

  // Extraire hex depuis une URL Google Maps (!1s0x....:0x....)
  const hexMatch = trimmed.match(/!1s0x([0-9a-f]+):0x([0-9a-f]+)/i);
  if (hexMatch) {
    const placeId = mapsHexToPlaceId(hexMatch[1], hexMatch[2]);
    return `https://search.google.com/local/writereview?placeid=${placeId}`;
  }

  // Format g.page/r/... → ajouter /review
  if (trimmed.includes("g.page/r/")) {
    const clean = trimmed.replace(/\/(review)?$/, "");
    return `${clean}/review`;
  }

  // URL non reconnue → retourner telle quelle
  return trimmed;
}
