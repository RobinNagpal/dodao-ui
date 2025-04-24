export function safeParseJsonString(raw: string | null | undefined) {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    return {};
  }
}
