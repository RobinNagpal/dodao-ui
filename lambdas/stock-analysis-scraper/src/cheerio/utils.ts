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

// === Shared unit type ===
export type Unit = "ones" | "thousands" | "millions" | "billions";

export interface FinancialsMeta {
  currency?: string; // e.g., "PKR", "USD"
  unit?: Unit; // normalized to ones|thousands|millions|billions
  fiscalYearNote?: string; // free text if found
}

const UNIT_MAP: Record<string, Unit> = {
  thousand: "thousands",
  thousands: "thousands",
  million: "millions",
  millions: "millions",
  billion: "billions",
  billions: "billions",
};

const UNIT_MULTIPLIER: Record<Unit, number> = {
  ones: 1,
  thousands: 1e3,
  millions: 1e6,
  billions: 1e9,
};

export function unitMultiplier(unit?: Unit): number {
  if (!unit) return 1;
  return UNIT_MULTIPLIER[unit] ?? 1;
}

/** Heuristic: do NOT scale these (already percentages or inherently unitless/per-share) */
export function shouldSkipUnitScaling(
  label: string,
  isPercent: boolean
): boolean {
  if (isPercent) return true;
  const s = label.toLowerCase();
  // ratios, margins, growth rates, EPS, per-share metrics
  return (
    s.includes("margin") ||
    s.includes("growth") ||
    s.includes("yoy") ||
    s.includes("per share") ||
    /\beps\b/i.test(label) ||
    s.includes("ratio") ||
    s.includes("rate")
  );
}

/** Parse a cell, then apply unit scaling if appropriate (NOT for percentages/per-share/ratios). */
export function parseValueWithUnit(
  text: string,
  label: string,
  mult: number
): number | null {
  // % first
  let pct = parsePercent(text);
  if (pct != null && Number.isFinite(pct)) return pct;

  // numeric (currency/totals/shares/etc.)
  let num = parseNumberLike(text);
  if (num == null || !Number.isFinite(num)) return null;

  if (shouldSkipUnitScaling(label, false)) return num; // keep as-is
  // Otherwise scale to "ones"
  return num * (Number.isFinite(mult) ? mult : 1);
}

/** Robustly extract currency+unit+note from the faded blurb(s) above the table. */
export function extractFinancialsMeta($: cheerio.CheerioAPI): FinancialsMeta {
  const meta: FinancialsMeta = {};
  try {
    // Collect possibly multiple blurbs, concatenate (some pages repeat "Millions PKR...")
    const texts: string[] = [];
    $("main .text-faded, .text-faded").each((_, el) => {
      const t = normalizeText($(el).text());
      if (t) texts.push(t);
    });
    const blob = normalizeText(texts.join(" ")); // "Financials in millions PKR. ... Millions PKR. ..."

    // Currency: prefer 3-letter ALL-CAPS tokens (USD, PKR, EUR, etc.)
    const currencies = blob.match(/\b[A-Z]{3}\b/g);
    if (currencies && currencies.length > 0) {
      // choose the last occurrence (often the most specific line)
      meta.currency = currencies[currencies.length - 1];
    }

    // Unit: look for "in millions/thousands/billions" OR trailing "Millions" lines; pick the last one
    const unitMatches = blob.match(/\b(millions?|thousands?|billions?)\b/gi);
    if (unitMatches && unitMatches.length > 0) {
      const uRaw = unitMatches[unitMatches.length - 1].toLowerCase();
      const mapped = UNIT_MAP[uRaw];
      meta.unit = mapped ?? "ones";
    } else {
      meta.unit = "ones";
    }

    // Fiscal year note (best-effort)
    const fyNote = blob.match(/fiscal year is[^.]+(?:\.)?/i);
    if (fyNote) meta.fiscalYearNote = normalizeText(fyNote[0]);
  } catch {
    // ignore
  }
  return meta;
}
