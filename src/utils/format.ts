const HTML_TAG_RE = /<[^>]*>/g
const HORIZONTAL_SPACE_RE = /[^\S\n]+/g

export function stripHtml(html: string): string {
  return html
    .replace(/\r\n?/g, '\n')
    .replace(HTML_TAG_RE, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .split('\n')
    .map((line) => line.replace(HORIZONTAL_SPACE_RE, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function truncateText(text: string, maxLength = 120): { text: string; truncated: boolean } {
  if (text.length <= maxLength) {
    return { text, truncated: false }
  }
  return { text: `${text.slice(0, maxLength).trimEnd()}…`, truncated: true }
}

/** Format YYYY-MM-DD → DD.MM.YYYY */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (match) return `${match[3]}.${match[2]}.${match[1]}`
  return value
}

/** Format HH:MM:SS → HH:MM */
export function formatTime(value: string | null | undefined): string {
  if (!value) return '—'
  const match = /^(\d{2}):(\d{2})(?::\d{2})?/.exec(value.trim())
  if (match) return `${match[1]}:${match[2]}`
  return value
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('ru-RU').format(value)
}

export function formatErr(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(2)}%`
}
