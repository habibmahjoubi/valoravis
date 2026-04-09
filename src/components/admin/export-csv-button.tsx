"use client";

export function ExportCsvButton({ data }: { data: string }) {
  function handleExport() {
    const blob = new Blob(["\uFEFF" + data], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `valoravis-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted"
    >
      Exporter CSV
    </button>
  );
}
