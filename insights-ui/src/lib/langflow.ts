import JSON5 from 'json5';

export function parseLangflowJSON(jsonString: string): any {
  return JSON5.parse(jsonString);
}
