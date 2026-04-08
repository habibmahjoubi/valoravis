"use client";

import { useState } from "react";
import { importClients } from "@/actions/dashboard";

export function CsvImport() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string[][]>([]);
  const [rawData, setRawData] = useState("");
  const [skipHeader, setSkipHeader] = useState(true);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      setResult({ imported: 0, skipped: 0 });
      alert("Fichier trop volumineux (maximum 5 Mo)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawData(text);
      const lines = text
        .split("\n")
        .filter((l) => l.trim())
        .map((l) =>
          l.split(",").map((s) => s.trim().replace(/^"|"$/g, ""))
        );
      setPreview(lines.slice(0, 6));
      setResult(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setLoading(true);
    const lines = rawData.split("\n").filter((l) => l.trim());
    const data = skipHeader ? lines.slice(1).join("\n") : lines.join("\n");
    const res = await importClients(data);
    setResult(res);
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 ml-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted"
      >
        Importer CSV
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 px-4 pt-16 sm:pt-0">
      <div className="bg-card border border-border rounded-xl p-4 md:p-6 w-full max-w-2xl">
        <h3 className="font-semibold text-lg mb-4">Importer des contacts</h3>

        <p className="text-sm text-muted-foreground mb-3">
          Format attendu : <code>nom,email,telephone,notes</code>
        </p>

        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFile}
          className="mb-4 text-sm"
        />

        {preview.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="skipHeader"
                checked={skipHeader}
                onChange={(e) => setSkipHeader(e.target.checked)}
              />
              <label htmlFor="skipHeader" className="text-sm">
                La première ligne est un en-tête
              </label>
            </div>

            <div className="border border-border rounded-lg overflow-auto mb-4 max-h-48">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                      Nom
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                      Téléphone
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border last:border-0 ${
                        i === 0 && skipHeader
                          ? "opacity-40 line-through"
                          : ""
                      }`}
                    >
                      {[0, 1, 2, 3].map((j) => (
                        <td key={j} className="px-3 py-2">
                          {row[j] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {rawData.split("\n").filter((l) => l.trim()).length -
                (skipHeader ? 1 : 0)}{" "}
              lignes à importer
            </p>
          </>
        )}

        {result && (
          <div className="bg-success/10 text-success border border-success/20 rounded-lg p-3 mb-4 text-sm">
            {result.imported} importés, {result.skipped} ignorés
          </div>
        )}

        <div className="flex gap-2">
          {preview.length > 0 && !result && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Importation..." : "Importer"}
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              setPreview([]);
              setRawData("");
              setResult(null);
            }}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
