// npm i axios cheerio
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export type Html = string;

export interface ScrapeError {
  where: string;
  message: string;
}

export function makeError(where: string, err: unknown): ScrapeError {
  return {
    where,
    message: err instanceof Error ? err.message : String(err),
  };
}

export async function fetchHtml(
  url: string,
  timeoutMs: number = 15000
): Promise<{ html?: Html; error?: ScrapeError }> {
  try {
    const resp: AxiosResponse<string> = await axios.get(url, {
      timeout: timeoutMs,
      responseType: "text",
    });
    return { html: resp.data };
  } catch (err) {
    return { error: makeError("fetchHtml", err) };
  }
}

export function load(html: Html) {
  return cheerio.load(html);
}

export function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** 1,234.56 -> 1234.56 ; (1,234) -> -1234 ; returns undefined if not numeric */
export function parseNumberLike(raw: string): number | undefined {
  const s = raw.replace(/,/g, "").trim();
  if (!s) return undefined;
  const neg = /^\(.*\)$/.test(s);
  const core = s.replace(/[()]/g, "");
  const n = Number(core);
  return Number.isFinite(n) ? (neg ? -n : n) : undefined;
}

/** "-13.48%" -> -13.48 ; "12%" -> 12 ; returns undefined if not a percentage */
export function parsePercent(raw: string): number | undefined {
  const m = raw.match(/(-?\d+(?:\.\d+)?)\s*%/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

/** "1.47B" -> 1.47e9; also accepts K/M/T; returns undefined if not matched */
export function parseAbbrevNumber(raw: string): number | undefined {
  const s = raw.replace(/,/g, "").trim();
  const m = /^(-?\d+(?:\.\d+)?)([KMGTB])?$/i.exec(s);
  if (!m) return undefined;
  const val = Number(m[1]);
  if (!Number.isFinite(val)) return undefined;
  const mult: Record<string, number> = {
    K: 1e3,
    M: 1e6,
    B: 1e9,
    G: 1e9,
    T: 1e12,
  };
  const unit = (m[2] || "").toUpperCase();
  return unit ? val * (mult[unit] ?? 1) : val;
}

/** Helper: first meaningful text in a cell (anchors/spans) */
export function cellText(
  $cell: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): string {
  const raw = normalizeText(
    $cell
      .clone() // avoid modifying DOM
      .find("a, span, div")
      .addBack()
      .first()
      .text()
  );
  return raw;
}
