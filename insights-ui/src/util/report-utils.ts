export function getReportName(key: string) {
  return key
    .toLowerCase() // Convert the entire key to lowercase
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
}

export function getReportKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, '_');
}

/** Turn a project id slug ("hah_parking") into a display name ("HAH Parking"). */
export function formatProjectName(projectId: string): string {
  return projectId
    .trim()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Trim a string to a target length on a word boundary, with no trailing whitespace or stray punctuation. */
export function truncateDescription(text: string | undefined, maxLength = 155): string | undefined {
  if (!text) return undefined;
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  const slice = cleaned.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > 80 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s,;:.\-–—]+$/, '') + '…';
}
