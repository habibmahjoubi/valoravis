"use client";

import { useState, useRef, useCallback } from "react";
import { importClients } from "@/actions/dashboard";
import { Upload, Download, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";

type ImportError = { row: number; name: string; reason: string };
type ImportResult = {
  imported: number;
  skipped: number;
  errors?: ImportError[];
};

const EXPECTED_HEADERS = ["nom", "email", "telephone", "notes"];
const HEADER_ALIASES: Record<string, string> = {
  nom: "nom",
  name: "nom",
  prénom: "nom",
  prenom: "nom",
  "nom complet": "nom",
  "full name": "nom",
  email: "email",
  "e-mail": "email",
  mail: "email",
  courriel: "email",
  telephone: "telephone",
  téléphone: "telephone",
  tel: "telephone",
  tél: "telephone",
  phone: "telephone",
  mobile: "telephone",
  portable: "telephone",
  notes: "notes",
  note: "notes",
  commentaire: "notes",
  commentaires: "notes",
  remarque: "notes",
  description: "notes",
};

function detectColumns(headerRow: string[]): number[] | null {
  const mapping: number[] = [-1, -1, -1, -1]; // nom, email, telephone, notes
  for (let i = 0; i < headerRow.length; i++) {
    const normalized = headerRow[i].toLowerCase().trim();
    const mapped = HEADER_ALIASES[normalized];
    if (mapped) {
      const idx = EXPECTED_HEADERS.indexOf(mapped);
      if (idx !== -1 && mapping[idx] === -1) {
        mapping[idx] = i;
      }
    }
  }
  // At least "nom" must be found
  if (mapping[0] === -1) return null;
  return mapping;
}

function reorderRow(row: string[], mapping: number[]): string[] {
  return mapping.map((idx) => (idx >= 0 && idx < row.length ? row[idx] : ""));
}

function parseCSV(text: string): string[][] {
  return text
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => l.split(",").map((s) => s.trim().replace(/^"|"$/g, "")));
}

function parseExcel(buffer: ArrayBuffer): string[][] {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data: string[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
  });
  return data.filter((row) => row.some((cell) => cell.toString().trim()));
}

function downloadTemplate() {
  const BOM = "\uFEFF";
  const csv = BOM + "nom,email,telephone,notes\nJean Dupont,jean@exemple.fr,+33612345678,Client fidèle\nMarie Martin,marie@exemple.fr,,Nouveau contact";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modele-import-contacts.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function CsvImport() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [rows, setRows] = useState<string[][]>([]);
  const [skipHeader, setSkipHeader] = useState(true);
  const [columnMapping, setColumnMapping] = useState<number[] | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setRows([]);
    setResult(null);
    setColumnMapping(null);
    setFileName("");
    setLoading(false);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  function processFile(file: File) {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("Fichier trop volumineux (maximum 5 Mo)");
      return;
    }

    const isExcel = /\.xlsx?$/i.test(file.name);
    setFileName(file.name);

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        const parsed = parseExcel(buffer);
        handleParsedData(parsed);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        handleParsedData(parsed);
      };
      reader.readAsText(file);
    }
  }

  function handleParsedData(data: string[][]) {
    if (data.length === 0) return;

    // Try to auto-detect columns from first row
    const mapping = detectColumns(data[0]);
    if (mapping) {
      setColumnMapping(mapping);
      setSkipHeader(true);
    } else {
      setColumnMapping(null);
      setSkipHeader(false);
    }

    setRows(data);
    setStep("preview");
    setResult(null);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function getDisplayRows(): string[][] {
    const display = rows.map((row) =>
      columnMapping ? reorderRow(row, columnMapping) : row
    );
    return display;
  }

  async function handleImport() {
    setLoading(true);
    const dataRows = skipHeader ? rows.slice(1) : rows;
    const reordered = dataRows.map((row) =>
      columnMapping ? reorderRow(row, columnMapping) : row
    );
    const csvString = reordered
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const res = await importClients(csvString);
    setResult(res);
    setStep("result");
    setLoading(false);
  }

  const dataRowCount = rows.length - (skipHeader ? 1 : 0);

  if (!open) {
    return (
      <button
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="mb-6 ml-2 border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted inline-flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Importer
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 px-4 pt-16 sm:pt-0">
      <div className="bg-card border border-border rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importer des contacts
          </h3>
          <button
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm text-muted-foreground">
                Formats : <strong>CSV</strong>, <strong>Excel (.xlsx)</strong>
              </p>
              <button
                onClick={downloadTemplate}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Modèle CSV
              </button>
            </div>

            {/* Drag & drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                Glissez votre fichier ici
              </p>
              <p className="text-xs text-muted-foreground">
                ou cliquez pour parcourir
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            <div className="mt-4 bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1 font-medium">
                Colonnes attendues :
              </p>
              <p className="text-xs text-muted-foreground">
                <code>nom</code> (obligatoire), <code>email</code>, <code>telephone</code>, <code>notes</code>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Les colonnes sont détectées automatiquement depuis l&apos;en-tête.
              </p>
            </div>
          </>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-muted-foreground">
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span className="font-medium truncate max-w-[200px]">{fileName}</span>
              <span>— {dataRowCount} ligne{dataRowCount > 1 ? "s" : ""}</span>
              <button
                onClick={reset}
                className="ml-auto text-xs text-primary hover:underline"
              >
                Changer
              </button>
            </div>

            {columnMapping && (
              <div className="bg-primary/5 border border-primary/20 text-primary rounded-lg p-2 mb-3 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Colonnes détectées automatiquement
              </div>
            )}

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
                    {["Nom", "Email", "Téléphone", "Notes"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-2 text-xs font-medium text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getDisplayRows()
                    .slice(skipHeader ? 1 : 0, (skipHeader ? 1 : 0) + 6)
                    .map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0"
                      >
                        {[0, 1, 2, 3].map((j) => (
                          <td key={j} className="px-3 py-2 truncate max-w-[150px]">
                            {row[j] || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleImport}
                disabled={loading || dataRowCount === 0}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Importation...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importer {dataRowCount} contact{dataRowCount > 1 ? "s" : ""}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
              >
                Annuler
              </button>
            </div>
          </>
        )}

        {/* Step 3: Result */}
        {step === "result" && result && (
          <>
            <div className="space-y-3 mb-4">
              {result.imported > 0 && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg p-3 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <strong>{result.imported}</strong> contact{result.imported > 1 ? "s" : ""} importé{result.imported > 1 ? "s" : ""}
                </div>
              )}

              {result.skipped > 0 && (
                <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-lg p-3 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <strong>{result.skipped}</strong> ligne{result.skipped > 1 ? "s" : ""} ignorée{result.skipped > 1 ? "s" : ""}
                </div>
              )}
            </div>

            {/* Error details */}
            {result.errors && result.errors.length > 0 && (
              <div className="border border-border rounded-lg overflow-auto max-h-40 mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Ligne
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Nom
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Raison
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.slice(0, 20).map((err, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-3 py-1.5 text-muted-foreground">
                          {err.row}
                        </td>
                        <td className="px-3 py-1.5">{err.name || "—"}</td>
                        <td className="px-3 py-1.5 text-amber-600">
                          {err.reason}
                        </td>
                      </tr>
                    ))}
                    {result.errors.length > 20 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-1.5 text-muted-foreground text-center"
                        >
                          ... et {result.errors.length - 20} autres erreurs
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={reset}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
              >
                Nouvel import
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
              >
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
