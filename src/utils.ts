export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []

  if (hours) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`)
  }

  if (minutes) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  }

  if (seconds || parts.length === 0) {
    parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)
  }

  return parts.join(', ')
}
