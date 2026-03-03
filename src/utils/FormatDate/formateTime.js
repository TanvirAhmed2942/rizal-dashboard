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

/**
 * UTC ISO string → local date + time (e.g. "2026-03-02T08:00:00.000Z" → "02 Mar 2026, 2:00 PM").
 * Matches table display: Start Time (Local) / End Time (Local).
 */
export function utcISOToLocalDateTimeDisplay(utcISO) {
  if (!utcISO || typeof utcISO !== "string") return "";
  const d = new Date(utcISO.trim());
  if (Number.isNaN(d.getTime())) return "";
  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

export default formatTime;
