import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { TariffEditionRef, TariffUpdateSource } from '@/types/tariff-chapter-prototype';
import type { TariffMeasureSource } from '@/types/tariff-calculator-measures';

// Turns the `sources` of measures.json records ({citation, url, published}) into the chapter's
// TariffUpdateSource objects (id, publisher, citation, document, title, signed, published, url).
// Federal Register documents are enriched from the official FR API (title, citation, signing date,
// document type) and cached; without network the citation text in measures.json is used.
//
// Id conventions (chapter-content-refresh.md §3): eo-<n>, procl-<n>, fr-<document number>, csms-<n>,
// hts-now / hts-before for the two editions.

interface FrApiDoc {
  title?: string;
  citation?: string | null;
  signing_date?: string | null;
  publication_date?: string;
  type?: string;
  subtype?: string | null;
  presidential_document_number?: string | null;
  executive_order_number?: string | number | null;
  agencies?: { slug?: string; name?: string; parent_id?: number | null }[];
}

const AGENCY_SHORT: Record<string, string> = {
  'trade-representative-office-of-united-states': 'USTR',
  'industry-and-security-bureau': 'BIS',
  'commerce-department': 'Commerce',
  'international-trade-administration': 'ITA',
  'u-s-customs-and-border-protection': 'CBP',
  'homeland-security-department': 'DHS',
  'treasury-department': 'Treasury',
  'agriculture-department': 'USDA',
  'animal-and-plant-health-inspection-service': 'APHIS',
  'food-safety-and-inspection-service': 'FSIS',
  'food-and-drug-administration': 'FDA',
  'international-trade-commission': 'USITC',
  'executive-office-of-the-president': 'President',
};

const FR_DOC_RE = /federalregister\.gov\/documents\/\d{4}\/\d{2}\/\d{2}\/([^/]+)/;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** The FR API record for a document number, cached under `cacheDir/fr/`. Null when offline or not found. */
async function frApiDoc(docNumber: string, cacheDir: string | null, offline: boolean): Promise<FrApiDoc | null> {
  const cachePath = cacheDir ? path.join(cacheDir, 'fr', `${docNumber}.json`) : null;
  if (cachePath && existsSync(cachePath)) return JSON.parse(readFileSync(cachePath, 'utf8')) as FrApiDoc;
  if (offline) return null;
  const fields = [
    'title',
    'citation',
    'signing_date',
    'publication_date',
    'type',
    'subtype',
    'presidential_document_number',
    'executive_order_number',
    'agencies',
  ];
  const url = `https://www.federalregister.gov/api/v1/documents/${encodeURIComponent(docNumber)}.json?${fields.map((f) => `fields[]=${f}`).join('&')}`;
  for (let i = 0; i < 3; i++) {
    if (i > 0) await sleep(1_500 * i);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (res.status === 404) return null;
      if (!res.ok) continue;
      const doc = (await res.json()) as FrApiDoc;
      if (cachePath) {
        mkdirSync(path.dirname(cachePath), { recursive: true });
        writeFileSync(cachePath, JSON.stringify(doc, null, 2));
      }
      return doc;
    } catch {
      // retry
    }
  }
  return null;
}

function agencyShort(doc: FrApiDoc): string | null {
  const agencies = doc.agencies ?? [];
  const specific = agencies.find((a) => a.parent_id) ?? agencies[0];
  if (!specific) return null;
  return AGENCY_SHORT[specific.slug ?? ''] ?? specific.name ?? null;
}

/** "91 FR 47318 (USTR notice of actions …)" → { head: "91 FR 47318", note: "USTR notice of actions …" }. */
function splitCitation(citation: string): { head: string; note: string | null } {
  const i = citation.indexOf(' (');
  if (i < 0 || !citation.endsWith(')')) return { head: citation.trim(), note: null };
  return { head: citation.slice(0, i).trim(), note: citation.slice(i + 2, -1).trim() };
}

function htsEditionFromRelease(release: string | null): string | null {
  const m = /^(\d{4})HTS(?:Rev(\d+)|Basic)$/i.exec(release ?? '');
  if (!m) return null;
  return m[2] ? `${m[1]} Revision ${Number(m[2])}` : `${m[1]} Basic Edition`;
}

/** usitc.gov HTS JSON URL → hts.usitc.gov Change Record URL for the same release. */
export function changeRecordUrl(edition: string): string | null {
  const m = /^(\d{4}) (?:Revision (\d+)|Basic Edition)$/i.exec(edition);
  if (!m) return null;
  const release = m[2] ? `${m[1]}HTSRev${m[2]}` : `${m[1]}HTSBasic`;
  return `https://hts.usitc.gov/reststop/file?release=${release}&filename=Change%20Record`;
}

export class SourceRegistry {
  private readonly byUrl = new Map<string, TariffUpdateSource>();
  private readonly ids = new Set<string>();
  private readonly fr = new Map<string, FrApiDoc | null>();

  constructor(private readonly cacheDir: string | null, private readonly offline: boolean) {}

  /** Fetch FR API records for every Federal Register URL among `sources` (sequentially, politely). */
  async prefetch(sources: TariffMeasureSource[]): Promise<void> {
    for (const s of sources) {
      const doc = FR_DOC_RE.exec(s.url)?.[1];
      if (!doc || this.fr.has(doc)) continue;
      this.fr.set(doc, await frApiDoc(doc, this.cacheDir, this.offline));
    }
  }

  private uniqueId(base: string): string {
    let id = base;
    for (let n = 2; this.ids.has(id); n++) id = `${base}-${n}`;
    this.ids.add(id);
    return id;
  }

  /** Register a fixed source (e.g. hts-now) under its own id. */
  addFixed(source: TariffUpdateSource): string {
    const existing = this.byUrl.get(source.url);
    if (existing) return existing.id;
    this.ids.add(source.id);
    this.byUrl.set(source.url, source);
    return source.id;
  }

  /** Id of the chapter source for a measure source (registering it on first use). */
  add(s: TariffMeasureSource): string {
    const existing = this.byUrl.get(s.url);
    if (existing) return existing.id;
    const src = this.convert(s);
    src.id = this.uniqueId(src.id);
    this.byUrl.set(s.url, src);
    return src.id;
  }

  get(id: string): TariffUpdateSource | undefined {
    return Array.from(this.byUrl.values()).find((s) => s.id === id);
  }

  /** The sources with these ids, in the given order (duplicates and unknown ids dropped). */
  list(ids: Iterable<string>): TariffUpdateSource[] {
    const out: TariffUpdateSource[] = [];
    for (const id of Array.from(new Set(ids))) {
      const s = this.get(id);
      if (s) out.push(s);
    }
    return out;
  }

  private convert(s: TariffMeasureSource): TariffUpdateSource {
    const { head, note } = splitCitation(s.citation);
    const url = s.url;
    const frDoc = FR_DOC_RE.exec(url)?.[1];
    if (frDoc) {
      const api = this.fr.get(frDoc) ?? null;
      if (api) {
        const agency = agencyShort(api);
        let id = `fr-${frDoc}`;
        let document = api.type ?? 'Federal Register document';
        if (api.type === 'Presidential Document') {
          const num = api.presidential_document_number ?? (api.executive_order_number ? String(api.executive_order_number) : null);
          if (api.subtype === 'Proclamation' && num) {
            id = `procl-${num}`;
            document = `Proclamation ${num}`;
          } else if (api.subtype === 'Executive Order' && num) {
            id = `eo-${num}`;
            document = `Executive Order ${num}`;
          } else {
            document = api.subtype === 'Memorandum' ? 'Presidential Memorandum' : api.subtype ?? 'Presidential document';
          }
        } else if (agency) {
          document = `${api.type === 'Proposed Rule' ? 'Proposed rule' : api.type ?? 'Document'} (${agency})`;
        }
        return {
          id,
          publisher: 'Federal Register',
          citation: api.citation ?? head,
          document,
          title: api.title ?? note ?? head,
          signed: api.signing_date ?? null,
          published: api.publication_date ?? s.published,
          url,
        };
      }
      const procl = /Proclamation (\d+)/.exec(s.citation)?.[1];
      const eo = /Executive Order (\d+)/.exec(s.citation)?.[1];
      return {
        id: procl ? `procl-${procl}` : eo ? `eo-${eo}` : `fr-${frDoc}`,
        publisher: 'Federal Register',
        citation: head,
        document: procl ? `Proclamation ${procl}` : eo ? `Executive Order ${eo}` : 'Federal Register document',
        title: note ?? head,
        signed: null,
        published: s.published,
        url,
      };
    }
    const host = (() => {
      try {
        return new URL(url).hostname;
      } catch {
        return '';
      }
    })();
    if (host === 'hts.usitc.gov') {
      const params = new URL(url).searchParams;
      const filename = params.get('filename') ?? 'HTS';
      const edition = htsEditionFromRelease(params.get('release')) ?? 'current edition';
      const part = filename.replace(/%20/g, ' ');
      return {
        id: `hts-${part.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        publisher: 'USITC',
        citation: `HTSUS ${edition}, ${part}`,
        document: 'Harmonized Tariff Schedule',
        title: `Harmonized Tariff Schedule of the United States (${edition}), ${part}`,
        signed: null,
        published: s.published,
        url,
      };
    }
    if (host.endsWith('govdelivery.com')) {
      const n = /CSMS\s*#\s*(\d+)/.exec(s.citation)?.[1];
      return {
        id: n ? `csms-${n}` : `csms-${url.split('/').pop()}`,
        publisher: 'CBP',
        citation: n ? `CSMS # ${n}` : head,
        document: 'CBP CSMS message',
        title: note ?? head,
        signed: null,
        published: s.published,
        url,
      };
    }
    if (host.endsWith('cbp.gov')) {
      return {
        id: `cbp-${(url.split('/').filter(Boolean).pop() ?? 'page').slice(0, 40)}`,
        publisher: 'CBP',
        citation: head,
        document: 'CBP web page',
        title: note ?? head,
        signed: null,
        published: s.published,
        url,
      };
    }
    if (host.endsWith('govinfo.gov')) {
      const pkg = (url.split('/').pop() ?? 'doc').replace(/\.pdf$/i, '').toLowerCase();
      return {
        id: `govinfo-${pkg}`,
        publisher: 'U.S. Government Publishing Office',
        citation: head,
        document: 'Statutes at Large',
        title: note ?? head,
        signed: null,
        published: s.published,
        url,
      };
    }
    return {
      id: `src-${host.replace(/^www\./, '').replace(/[^a-z0-9]+/gi, '-')}`,
      publisher: host,
      citation: head,
      document: 'Web page',
      title: note ?? head,
      signed: null,
      published: s.published,
      url,
    };
  }
}

/** Fixed sources for the two HTS editions (+ the current edition's change record). */
export function editionSources(before: TariffEditionRef | null, now: TariffEditionRef): TariffUpdateSource[] {
  const out: TariffUpdateSource[] = [
    {
      id: 'hts-now',
      publisher: 'USITC',
      citation: `HTSUS ${now.edition}`,
      document: 'Harmonized Tariff Schedule',
      title: `Harmonized Tariff Schedule of the United States, ${now.edition}`,
      signed: null,
      published: now.released,
      url: now.url,
    },
  ];
  const cr = changeRecordUrl(now.edition);
  if (cr) {
    out.push({
      id: 'hts-now-cr',
      publisher: 'USITC',
      citation: `HTSUS ${now.edition} Change Record`,
      document: 'Change Record',
      title: `Harmonized Tariff Schedule of the United States (${now.edition}), Change Record`,
      signed: null,
      published: now.released,
      url: cr,
    });
  }
  if (before) {
    out.push({
      id: 'hts-before',
      publisher: 'USITC',
      citation: `HTSUS ${before.edition}`,
      document: 'Harmonized Tariff Schedule',
      title: `Harmonized Tariff Schedule of the United States, ${before.edition}`,
      signed: null,
      published: before.released,
      url: before.url,
    });
  }
  return out;
}
