const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      //   hour24: true,
      hour12: false,
    });
  } catch {
    return "N/A";
  }
};

/**
 * UTC ISO string → local time display (e.g. "2026-02-18T10:00:00.000Z" → "2:00 PM").
 * Reusable for any component that needs to show API UTC times in the user's local timezone.
 */
export function utcISOToLocalTimeDisplay(utcISO) {
  if (!utcISO || typeof utcISO !== "string") return utcISO ?? "";
  const d = new Date(utcISO.trim());
  if (Number.isNaN(d.getTime())) return utcISO;
  const hour24 = d.getHours();
  const min = d.getMinutes();
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const h = String(hour12).padStart(2, "0");
  const m = String(min).padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

export default formatTime;
