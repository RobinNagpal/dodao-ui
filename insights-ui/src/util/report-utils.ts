export function getReportName(key: string) {
  return key
    .toLowerCase() // Convert the entire key to lowercase
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
}

export function getReportKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, '_');
}
