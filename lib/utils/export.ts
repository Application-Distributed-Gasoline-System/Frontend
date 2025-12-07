/**
 * Export table data to CSV file
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file (without .csv extension)
 * @param columns - Column configuration with key and label
 */
export function exportToCSV<T extends object>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) {
  // Create CSV header
  const headers = columns.map((col) => col.label).join(",");

  // Create CSV rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Convert value to string
        const stringValue = String(value ?? "");
        // Escape quotes and wrap in quotes if contains comma or quotes
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );

  // Combine headers and rows
  const csv = [headers, ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
}
