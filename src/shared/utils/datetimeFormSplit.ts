/**
 * Split API / ISO datetime strings into DatePicker (yyyy-MM-dd) + time (HH:mm) fields.
 * Merge back for LocalDateTime JSON (yyyy-MM-ddTHH:mm:00) expected by the backend.
 */

export function splitIsoToDateAndTime(iso?: string | null): { date: string; time: string } {
  if (!iso?.trim()) return { date: "", time: "" }
  const s = iso.trim()
  const datePart = s.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return { date: "", time: "" }
    const pad = (n: number) => String(n).padStart(2, "0")
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    }
  }
  if (!s.includes("T")) {
    return { date: datePart, time: "" }
  }
  const timePart = s.split("T")[1] ?? ""
  const hm = timePart.slice(0, 5)
  return { date: datePart, time: /^\d{2}:\d{2}$/.test(hm) ? hm : "" }
}

export function mergeDateAndTimeToLocalIso(date: string, time: string): string | undefined {
  const d = date?.trim()
  if (!d) return undefined
  const raw = (time?.trim() || "00:00").slice(0, 5)
  const t = /^\d{2}:\d{2}$/.test(raw) ? raw : "00:00"
  return `${d}T${t}:00`
}
