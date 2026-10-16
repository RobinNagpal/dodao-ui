"""Paths shared by the chapter fill scripts in this folder (issue #1863).

`pnpm tariff:refresh-chapter <NN>` sets the environment variables; the defaults let a script run on its own too.
See docs/insights-ui/tariffs/chapter-content-refresh.md.

    IU        the insights-ui folder (resolved from this file)
    FILLS     this folder (chapter-fills/); each chapter's scripts and hand-written inputs are in FILLS/<NN>/
    CACHE     $CHAPTER_FILL_CACHE, default <os tmp>/koala-chapter-fills (downloads, generator output, scratch)
    HTS_FILE  the HTS JSON the generator read (--hts-file, else the generator's download in CACHE/generator/)
    GEN       the generator output for this run (CACHE/<NN>/gen.json)
    OUT       the chapter content file being written (src/tariff-data/chapters/<NN>-<slug>.json, or a dry-run path)
"""

import os
import tempfile

FILLS = os.path.dirname(os.path.abspath(__file__))
IU = os.environ.get("IU") or os.path.abspath(os.path.join(FILLS, "..", "..", "..", ".."))
CACHE = os.environ.get("CHAPTER_FILL_CACHE") or os.path.join(tempfile.gettempdir(), "koala-chapter-fills")
HTS_FILE = os.environ.get("HTS_FILE") or os.path.join(CACHE, "generator", "hts_2026_revision_21_json.json")
GEN = os.environ.get("GEN", "")
OUT = os.environ.get("OUT", "")

# The one data site the content must never name or cite. Built from parts so the name itself isn't written here.
FORBIDDEN_SOURCE = "stock" + "analysis"


def use_measures_fr_urls(doc):
    """Cite each Federal Register document by the URL measures.json uses for it (same document number).

    Some shipped files were edited by hand this way after their fill script ran (e.g. the Section 338 proclamations,
    whose generator URLs ended "-united-states" while measures.json's end "-united"); calling this reproduces them.
    """
    import json
    import re

    doc_re = re.compile(r"federalregister\.gov/documents/\d{4}/\d{2}/\d{2}/([^/]+)/")
    measures = json.load(open(os.path.join(IU, "src", "tariff-data", "calculator", "measures.json")))
    by_doc = {}
    for m in measures["measures"]:
        for s in m.get("sources", []):
            hit = doc_re.search(s.get("url", ""))
            if hit:
                by_doc.setdefault(hit.group(1), s["url"])
    for page in doc.values():
        if not isinstance(page, dict):
            continue
        for s in page.get("sources", []) if isinstance(page.get("sources"), list) else []:
            hit = doc_re.search(s.get("url") or "")
            if hit and hit.group(1) in by_doc:
                s["url"] = by_doc[hit.group(1)]
