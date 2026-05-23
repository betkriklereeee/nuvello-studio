const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif)(\?|#|$)/i

/** Returns true if the URL looks like a direct image link. */
export function isImageUrl(url: string): boolean {
  if (!url) return false
  return IMAGE_EXTENSIONS.test(url)
}
