"""Shared data helpers for the Chapter 29 fill script (line sets from measures.json, rates, trade figures)."""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
import os
import re

WT = IU
HERE = os.path.dirname(os.path.abspath(__file__))
MEASURES = json.load(open(os.path.join(WT, "src/tariff-data/calculator/measures.json")))
TRADE = json.load(open(os.path.join(WT, "src/tariff-data/trade/chapter-29.json")))
FRMETA = json.load(open(os.path.join(HERE, "frmeta.json")))


def measure(key):
    return next(m for m in MEASURES["measures"] if m["measureKey"] == key)


def codes29(key):
    m = measure(key)
    return [c for c in m["coverageInclude"] if c.startswith("29")], [c for c in m["coverageExclude"] if c.startswith("29")]


class Lines:
    """The chapter's 10-digit lines and the measure line sets."""

    def __init__(self, doc):
        self.rows = doc["overview"]["rateTable"]["rows"]
        self.lines = [r for r in self.rows if r["htsCode10"]]
        self.by_hts = {r["hts"]: r for r in self.rows if r["hts"]}
        self.by10 = {r["htsCode10"]: r for r in self.lines}

        def cov(key):
            inc, exc = codes29(key)
            return {l["htsCode10"] for l in self.lines if any(l["htsCode10"].startswith(c) for c in inc) and not any(l["htsCode10"].startswith(c) for c in exc)}

        self.b52 = cov("s301-2026-exempt-52b")
        self.e52 = cov("s301-2026-exempt-52e-pharma-use")
        self.br_a2 = cov("s301-brazil-exempt-50a-ii")
        self.br_a5 = cov("s301-brazil-exempt-50a-v-pharma-use")
        self.p40 = cov("s232-pharma-generic")
        self.l3 = cov("s301-china-list3")
        self.l3d = cov("s301-china-list3-described")
        self.l4a = cov("s301-china-list4a")
        self.ca338 = cov("ca338-b3")
        self.ru30 = cov("ru-col2-35")
        self.ru_al = cov("s232-aluminum-ru-derivatives-0818")
        self.ec = cov("s301-2026-except-ec")
        self.K = {l["htsCode10"] for l in self.lines if re.search(r"\bK\b", l["effectiveSpecial"] or "")}
        self.L = {l["htsCode10"] for l in self.lines if re.search(r"\bL\b", l["effectiveSpecial"] or "")}
        self.dutiable = {l["htsCode10"] for l in self.lines if l["dutiable"]}

    def rate(self, hts):
        r = self.by_hts[hts]
        return r["effectiveGeneral"]

    def under(self, *prefixes):
        """10-digit codes of lines under any of the dotted prefixes (e.g. '2903.4', '2939.11')."""
        ps = [p.replace(".", "") for p in prefixes]
        return {l["htsCode10"] for l in self.lines if any(l["htsCode10"].startswith(p) for p in ps)}

    def heading(self, h):
        return [l for l in self.lines if l["heading"] == h]


def usd(n):
    return f"${n / 1e9:.2f}B" if n >= 1e9 else f"${n / 1e6:.0f}M"


def n(x):
    return f"{x:,}"


# ------------------------------------------------------------------ sources


def fr_source(doc_no, sid, document=None):
    m = FRMETA[doc_no]
    if document is None:
        t = m["type"]
        if t == "Presidential Document":
            if m.get("executive_order_number"):
                document = f"Executive Order {m['executive_order_number']}"
            elif m.get("proclamation_number"):
                document = f"Proclamation {m['proclamation_number']}"
            else:
                document = "Presidential Memorandum"
        else:
            ag = [a.get("raw_name") or a.get("name") or "" for a in m.get("agencies", [])]
            names = " ".join(ag).upper()
            if "TRADE REPRESENTATIVE" in names:
                document = "Notice (USTR)"
            elif "INDUSTRY AND SECURITY" in names:
                document = "Notice (Commerce / BIS)"
            elif "INTERNATIONAL TRADE COMMISSION" in names:
                document = "Notice (USITC)"
            elif "INTERNATIONAL TRADE ADMINISTRATION" in names:
                document = "Notice (Commerce / ITA)"
            else:
                document = "Notice"
    signed = m.get("signing_date") if m["type"] == "Presidential Document" else None
    return {
        "id": sid,
        "publisher": "Federal Register",
        "citation": m["citation"],
        "document": document,
        "title": m["title"],
        "signed": signed,
        "published": m["publication_date"],
        "url": m["html_url"],
    }
