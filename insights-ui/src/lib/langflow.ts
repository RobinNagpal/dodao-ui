export function parseLangflowJSON(jsonString: string): any {
  const json = jsonString
    .replace(/'/g, '"') // Replace single quotes with double quotes
    .replace(/NA/g, 'null');
  return JSON.parse(json);
}
