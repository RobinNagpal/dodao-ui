import fs from 'fs';

export const reportsOutDir = 'reports-out';

export function addDirectoryIfNotPresent(dirPath: string) {
  // Create the directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
