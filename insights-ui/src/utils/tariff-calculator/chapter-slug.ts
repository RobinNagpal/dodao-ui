// URL helpers for the HTSUS chapter routes (/hts-codes/us/<chapter>/<slug>).
// Pads a chapter number to two digits so 1..9 render as "01".."09" — matches
// the official HTSUS chapter numbering and keeps the URL stable.

export function chapterNumberSlug(chapterNumber: number): string {
  return chapterNumber.toString().padStart(2, '0');
}

export function chapterTitleSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function chapterDetailHref(chapterNumber: number, title: string): string {
  return `/hts-codes/us/${chapterNumberSlug(chapterNumber)}/${chapterTitleSlug(title)}`;
}
