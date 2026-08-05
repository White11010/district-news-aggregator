const HTML_TAG_RE = /<[^>]*>/g
const MULTI_SPACE_RE = /\s+/g

export function stripHtml(html: string): string {
  return html
    .replace(HTML_TAG_RE, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(MULTI_SPACE_RE, ' ')
    .trim()
}

export function truncateText(text: string, maxLength = 500): { text: string; truncated: boolean } {
  if (text.length <= maxLength) {
    return { text, truncated: false }
  }
  return { text: `${text.slice(0, maxLength).trimEnd()}…`, truncated: true }
}

/** Format ISO datetime to dd-mm */
export function formatNewsDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}-${mm}`
}

export function todayStartDate(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|bmp|avif)(\?|$)/i

/** Prefer real images; skip obvious non-image media URLs when possible */
export function pickCoverImage(mediaFiles: string[] | null | undefined): string | null {
  if (!mediaFiles?.length) return null

  const image = mediaFiles.find(
    (url) => IMAGE_EXT_RE.test(url) || url.includes('userapi.com') || url.includes('getVideoPreview'),
  )
  return image ?? mediaFiles[0] ?? null
}
