export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function getAnomalySeverity(deltaPercent: number): string {
  if (deltaPercent > 20) return "Critical";
  if (deltaPercent > 10) return "Warning";
  return "Normal";
}

export function getFuelSourceLabel(source: string): string {
  switch (source) {
    case "manual":
      return "Manual";
    case "sensor":
      return "Sensor";
    case "route-completion":
      return "Route";
    default:
      return source;
  }
}

export function calculateEfficiency(distanceKm: number | undefined, liters: number): string {
  if (!distanceKm || distanceKm === 0 || liters === 0) return "N/A";
  return (liters / distanceKm).toFixed(2) + " L/km";
}
