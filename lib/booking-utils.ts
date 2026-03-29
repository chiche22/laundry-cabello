export const DURATIONS = [
  { label: "1h", minutes: 60 },
  { label: "1:30h", minutes: 90 },
  { label: "2h", minutes: 120 },
  { label: "2:30h", minutes: 150 },
  { label: "3h", minutes: 180 },
]

export function buildGoogleCalendarUrl(startsAt: Date, endsAt: Date) {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Laundry — Edificio`,
    dates: `${fmt(startsAt)}/${fmt(endsAt)}`,
    details: "Turno reservado desde la app del laundry.",
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
