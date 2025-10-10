// npm i axios cheerio
import axios, { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export type Html = string;

export interface ScrapeError {
  where: string;
  message: string;
}

export function makeError(where: string, err: unknown): ScrapeError {
  return { where, message: err instanceof Error ? err.message : String(err) };
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
  const core = s.replace(/[()]/g, "").replace(/[^\d.-]/g, "");
  const n = Number(core);
  return Number.isFinite(n) ? (neg ? -n : n) : undefined;
}

/** handles "12%", "-13.4%", "(8.1%)", and unicode minus */
export function parsePercent(raw: string): number | undefined {
  const s = normalizeText(raw).replace(/\u2212/g, "-");
  // Parentheses imply negative
  const neg = /^\(.*\)$/.test(s);
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*%/);
  if (!m) return undefined;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return undefined;
  return neg ? -n : n;
}

/** "1.47B" -> 1.47e9; also accepts K/M/T/G; returns undefined if not matched */
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

/** First meaningful text in a cell (anchors/spans) */
export function cellText(
  $cell: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): string {
  const raw = normalizeText(
    $cell.clone().find("a, span, div").addBack().first().text()
  );
  return raw;
}

/**
 * Convert any label to lowerCamelCase:
 *  - removes bracketed content: "(...)" "[...]" "{...}"
 *  - replaces "&" with "and"
 *  - removes diacritics safely (no \\p{Diacritic})
 *  - strips everything except letters/digits/spaces
 *  - collapses spaces, then camel-cases
 *  - if first char is a digit, prefix with "_"
 */
export function toLowerCamelKey(raw: string): string {
  if (!raw) return "";
  let s = raw
    // drop bracketed bits
    .replace(/\s*[\(\[\{][^\)\]\}]*[\)\]\}]\s*/g, " ")
    // normalize unicode + remove combining marks
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    // unify dashes and ampersands
    .replace(/[–—]/g, " ")
    .replace(/&/g, " and ")
    // kill all non-alphanum except spaces
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    // squeeze spaces
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  if (!s) return "";

  const parts = s.split(" ");
  const camel =
    parts[0] +
    parts
      .slice(1)
      .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ""))
      .join("");

  return /^\d/.test(camel) ? `_${camel}` : camel;
}
