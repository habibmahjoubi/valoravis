"use client";

import { useState, useEffect } from "react";

/**
 * Client-side version of toGoogleWriteReviewUrl (same logic as server)
 */
function toWriteReviewUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();

  if (/^ChIJ[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return `https://search.google.com/local/writereview?placeid=${trimmed}`;
  }
  if (trimmed.includes("search.google.com/local/writereview")) {
    return trimmed;
  }
  const placeIdParam = trimmed.match(/[?&]placeid=([^&]+)/i);
  if (placeIdParam) {
    return `https://search.google.com/local/writereview?placeid=${placeIdParam[1]}`;
  }

  // Conversion hex -> Place ID (protobuf encoding)
  const hexMatch = trimmed.match(/!1s0x([0-9a-f]+):0x([0-9a-f]+)/i);
  if (hexMatch) {
    const hex1 = hexMatch[1];
    const hex2 = hexMatch[2];

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
    const b64 = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return `https://search.google.com/local/writereview?placeid=${b64}`;
  }

  if (trimmed.includes("g.page/r/")) {
    return `${trimmed.replace(/\/(review)?$/, "")}/review`;
  }

  return trimmed;
}

export function GooglePlaceField({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const [inputUrl, setInputUrl] = useState(defaultValue);
  const [writeReviewUrl, setWriteReviewUrl] = useState("");

  useEffect(() => {
    if (inputUrl) {
      const converted = toWriteReviewUrl(inputUrl);
      setWriteReviewUrl(converted);
    } else {
      setWriteReviewUrl("");
    }
  }, [inputUrl]);

  const isWriteReview = writeReviewUrl.includes("writereview?placeid=");

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Lien Google pour les avis
      </label>
      <input
        name="googlePlaceUrl"
        value={writeReviewUrl || inputUrl}
        readOnly
        hidden
      />
      <input
        type="text"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Collez votre URL Google Maps ici..."
      />

      <div className="mt-2 text-xs space-y-1.5">
        {isWriteReview ? (
          <div className="bg-success/10 border border-success/20 rounded-lg p-2.5">
            <p className="text-success font-medium">
              {"\u2705"} Lien d'avis detecte et converti automatiquement
            </p>
            <p className="text-success/70 mt-1 break-all">
              {writeReviewUrl}
            </p>
            <a
              href={writeReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-success underline hover:no-underline"
            >
              Tester le lien
            </a>
          </div>
        ) : inputUrl ? (
          <p className="text-warning">
            {"\u26A0\uFE0F"} URL non reconnue. Collez une URL Google Maps de votre etablissement.
          </p>
        ) : null}

        <div className="text-muted-foreground">
          <p className="font-medium mb-1">Comment trouver votre lien :</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>
              Allez sur{" "}
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google Maps
              </a>
            </li>
            <li>Cherchez le nom de votre etablissement</li>
            <li>Cliquez sur votre fiche</li>
            <li>Copiez l'URL de la barre d'adresse et collez-la ici</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
