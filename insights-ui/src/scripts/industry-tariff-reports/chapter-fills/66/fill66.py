"""Fill the writer parts of the generated Chapter 66 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 66 ...` (see run.sh in this folder):
    python3 fill66.py
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU, OUT  # noqa: E402,F401

import json
import os

WT = IU
PATH = OUT  # run.sh copies the generated file here; filled in place
HERE = os.path.dirname(os.path.abspath(__file__))
POOL = os.path.join(HERE, "pool46.json")
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH66 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2066"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"

d = json.load(open(PATH))
pool = json.load(open(POOL))

NEW_SOURCES = {
    "fr-2024-30826": {
        "id": "fr-2024-30826",
        "publisher": "Federal Register",
        "citation": "90 FR 1800",
        "document": "Final rule (CPSC)",
        "title": "Certificates of Compliance",
        "signed": None,
        "published": "2025-01-08",
        "url": "https://www.federalregister.gov/documents/2025/01/08/2024-30826/certificates-of-compliance",
    },
    "fr-e9-21216": {
        "id": "fr-e9-21216",
        "publisher": "Federal Register",
        "citation": "74 FR 45415",
        "document": "Notice (APHIS)",
        "title": "Implementation of Revised Lacey Act Provisions (Phase IV: heading 6602 from April 1, 2010)",
        "signed": None,
        "published": "2009-09-02",
        "url": "https://www.federalregister.gov/documents/2009/09/02/E9-21216/implementation-of-revised-lacey-act-provisions",
    },
    "hts-ch98": {
        "id": "hts-ch98",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 98, subchapter XVII",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98 (9817.00.96, articles for the handicapped)",
        "signed": None,
        "published": "2026-10-07",
        "url": CH98,
    },
    "cbp-n356862": {
        "id": "cbp-n356862",
        "publisher": "CBP",
        "citation": "NY N356862",
        "document": "CBP ruling",
        "title": "The tariff classification of a walking cane from Taiwan (6602.00.0000; eligible for 9817.00.96)",
        "signed": None,
        "published": "2025-12-30",
        "url": "https://rulings.cbp.gov/ruling/N356862",
    },
}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


def ruling(n):
    return f"https://rulings.cbp.gov/ruling/{n}"


def money(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    if v >= 1e6:
        return f"${v / 1e6:.0f}M" if v >= 1e8 else f"${v / 1e6:.1f}M"
    return f"${v / 1e3:.0f}K"


LABELS = {
    "6601": ("Umbrellas and sun umbrellas: rain, golf, folding, patio, beach and garden umbrellas", "Umbrellas"),
    "6602": ("Walking sticks, canes, seat sticks, trekking poles, whips and riding crops", "Walking sticks & whips"),
    "6603": ("Umbrella frames, handles, knobs, tips, caps and other parts and accessories", "Umbrella parts"),
}
ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
NO_LIST = (
    "No Chapter 66 line is on the general exemption list (U.S. note 52(b)) or on any note 52(j) country exception list. "
)
L4A = "walking sticks, whips and riding crops (6602.00.00) and umbrella handles, knobs, tips and caps (6603.90.41)"

# ---------------------------------------------------------------- trade figures (from the generated understandIndustry)
ui = d["understandIndustry"]
TOTAL = ui["byCountry"] and sum(c["importsUsd"] for c in ui["byCountry"]) + (ui.get("othersImportsUsd") or 0)
BYC = {c["country"]: c for c in ui["byCountry"]}

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 66: Umbrellas, Walking Sticks, Whips & Umbrella Parts — 2026 Tariff Rates"
ov["seo"]["title"] = "HTS Chapter 66 Tariff Rates 2026: Umbrella, Walking Stick & Umbrella Frame Import Duty | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 8 HTS Chapter 66 lines: rain, golf, patio and beach umbrellas, walking sticks and canes, "
    "whips and riding crops, umbrella frames, handles and parts. General, FTA and Column 2 rates plus the 2026 extra duty "
    "by country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 66",
    "hts chapter 66 tariff updates",
    "umbrella hs code",
    "hs code 6601",
    "hs code for patio umbrella",
    "hs code for umbrella frame",
    "hs code for walking stick",
    "umbrella import duty from china",
    "section 301 umbrella tariffs",
    "hts 6601 telescopic umbrellas import duty",
    "hts 6603 umbrella frames customs duty",
]

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 66 Tariff Updates: Umbrellas, Walking Sticks & Umbrella Parts (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 66 Tariff Updates 2026: Umbrellas & Walking Sticks — Section 301, China List 4A, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 66 umbrellas, walking sticks, whips and umbrella parts since January 2025: unchanged base "
    "rates, the IEEPA tariffs and their end, the Section 122 surcharge, the 2026 Section 301 tariffs on 60 economies, China's "
    "List 4A duty and the Section 232 aluminum listing of umbrella bases and other parts."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 66 tariff updates",
    "hts chapter 66 import duty rates",
    "china tariff on umbrellas",
    "section 301 tariffs on umbrellas",
    "section 122 surcharge impact umbrellas",
    "section 232 aluminum umbrella duties",
    "cambodia umbrella import duty",
    "taiwan hts chapter 66 tariff",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 8 Chapter 66 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. In 2025 the IEEPA tariffs added 20%–30% on Chinese umbrellas (125% more for a "
    "month in April–May 2025), 19%–20% on umbrellas from Vietnam, Cambodia, Indonesia and Taiwan, and up to 50% on Indian goods. "
    "They **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since "
    "**July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%** on every Chapter 66 line; the only "
    "exemption is note 52(i) for CAFTA-DR umbrellas claimed duty-free under the agreement. China also keeps its **7.5% List 4A duty** on walking sticks and umbrella handles; "
    "Chinese umbrellas themselves were on List 4B, which never took effect."
)
tu["scope"] = (
    "Measures that reach Chapter 66 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 "
    "tariff, China Section 301 List 4A, the Section 232 aluminum duty on Russian aluminum derivatives (6603.90.81), the "
    "Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA, Section 122 and Section 232 aluminum-derivative duties that have "
    "ended. No Chapter 66 line is on the Canada Section 338 lists (U.S. note 51), and no antidumping or countervailing duty "
    "order covers an umbrella, walking stick or umbrella part. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "8 of 8 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (2026, Brazil, China List 4A) and Section 232 aluminum (Russia)"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "cn": (
        "Two Section 301 duties. The 2026 action adds +12.5% (9903.05.31) on all 8 lines. China List 4A (+7.5%, 9903.88.15; 15% "
        "from September 1, 2019, cut to 7.5% from February 14, 2020) covers " + L4A + ". Umbrellas (6601), umbrella frames "
        "(6603.20) and other parts (6603.90.81) were on List 4B, which USTR suspended in December 2019 before it took effect, so "
        "they are on no China list. No China exclusion covers a Chapter 66 product, and USTR confirmed on October 7, 2026 that the "
        "2018–2019 actions continue. The IEEPA duties on China (20% fentanyl, 10% from November 10, 2025, plus 10% reciprocal) "
        "ended February 24, 2026; the Section 122 surcharge expired July 23, 2026.",
        "Chinese umbrellas pay the base rate plus 12.5%: 12.5% on telescopic folding umbrellas, 19% on patio and beach umbrellas, "
        "20.7% on golf and stick umbrellas. Walking sticks pay 24% and umbrella handles 20%.",
    ),
    "vn": (
        NO_LIST + "The 20% IEEPA reciprocal duty on Vietnam ended February 24, 2026; the 10% Section 122 surcharge expired July "
        "23, 2026.",
        "Vietnamese umbrellas pay the base rate plus 12.5% — 12.5% on telescopic umbrellas, 19% on patio umbrellas, 20.7% on "
        "golf and stick umbrellas; walking sticks 16.5%.",
    ),
    "in": (
        NO_LIST + "GSP (SPI A, A*), printed on the dutiable lines, has been expired since December 31, 2020. The 25% reciprocal "
        "duty and the extra 25% on Indian goods (ended February 7, 2026) are gone. " + ENDED,
        "Indian umbrellas and walking sticks pay the base rate plus 10% — 18.2% on stick umbrellas, 14% on walking sticks.",
    ),
    "mx": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94) and no base rate. Under General Note 11 an "
        "umbrella qualifies when made from materials of another heading, except when it combines both an imported frame "
        "(6603.20) and imported canopy fabric; walking sticks qualify from any other heading and parts from any other chapter. "
        "The 25% IEEPA duty on Mexico ended February 24, 2026.",
        "Mexican umbrellas and walking sticks that qualify for USMCA pay $0; goods without a valid claim pay the base rate plus 10%.",
    ),
    "ca": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93) and no base rate; the same General Note 11 rules apply as for "
        "Mexico. No Chapter 66 line is on the Section 338 lists in U.S. note 51, so the 50% Canada duty does not reach this "
        "chapter. The 35% IEEPA duty on Canada ended February 24, 2026.",
        "Canadian umbrellas, walking sticks and parts pay $0 with a USMCA claim; without one, the base rate plus 10%.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). No Chapter 66 line is on the note 50(a)(ii) Brazil exemption list. The 40% IEEPA duty on Brazil ended "
        "February 24, 2026.",
        "Brazilian umbrellas, walking sticks and parts pay the base rate plus 37.5%.",
    ),
    "eu": (
        "For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); at 10% or more no Section 301 duty is due "
        "(9903.05.38) — that covers patio-umbrella frames (6603.20.90, 12%). The EU exception list (note 52(j)) names no "
        "Chapter 66 line. This replaced the 15% IEEPA rate, which ended February 24, 2026.",
        "Italian and German umbrellas, walking sticks and parts pay 10% of value in place of the base rate; patio-umbrella frames "
        "pay their 12% base rate only.",
    ),
    "gb": (
        NO_LIST + "The UK pays +10% (9903.05.81) on top of the base rate. The 10% IEEPA reciprocal duty ended February 24, 2026.",
        "British umbrellas pay the base rate plus 10% — 18.2% on stick umbrellas, 14% on walking sticks and riding crops.",
    ),
    "jp": (
        "Japanese goods pay 12.5% in total (9903.05.49) when the base rate is lower — every Chapter 66 line. Japan's exception "
        "list names no Chapter 66 line. This replaced the 15% IEEPA rate, which ended February 24, 2026.",
        "Japanese umbrellas, walking sticks and parts pay 12.5% of value in place of the base rate.",
    ),
    "tw": (
        "Taiwanese goods pay 10% in total (9903.05.76) when the base rate is lower; patio-umbrella frames (6603.20.90, 12%) pay "
        "their base rate only. Taiwan's exception list names no Chapter 66 line. The 20% IEEPA reciprocal duty ended February 24, "
        "2026.",
        "Taiwanese umbrellas and walking sticks pay 10% of value in place of the base rate; patio-umbrella frames pay 12%.",
    ),
    "kh": (
        NO_LIST + "GSP has been expired since December 31, 2020. The 19% IEEPA reciprocal duty ended February 24, 2026; the "
        "Section 122 surcharge expired July 23, 2026.",
        "Cambodian umbrellas pay the base rate plus 10% — 10% on telescopic umbrellas, 18.2% on stick umbrellas.",
    ),
    "id": (
        NO_LIST + "The 19% IEEPA reciprocal duty ended February 24, 2026; the Section 122 surcharge expired July 23, 2026.",
        "Indonesian umbrellas pay the base rate plus 10%.",
    ),
    "th": (
        NO_LIST + "GSP has been expired since December 31, 2020. The 19% IEEPA reciprocal duty ended February 24, 2026; the "
        "Section 122 surcharge expired July 23, 2026.",
        "Thai umbrellas pay the base rate plus 12.5%.",
    ),
    "ph": (
        NO_LIST + "The 19% IEEPA reciprocal duty ended February 24, 2026; the Section 122 surcharge expired July 23, 2026.",
        "Philippine umbrellas pay the base rate plus 12.5%.",
    ),
    "bd": (
        NO_LIST + "The 20% IEEPA reciprocal duty ended February 24, 2026; the Section 122 surcharge expired July 23, 2026.",
        "Bangladeshi umbrellas pay the base rate plus 10%.",
    ),
    "ru": (
        "Russia's goods take the column 2 rates (40% on umbrellas, 40% on walking sticks, 60% on umbrella frames, 45% on other "
        "parts) and the 2026 Section 301 duty (+12.5%, 9903.05.66). Other parts of 6603.90.81 — umbrella bases and the like — "
        "made with Russian aluminum also pay +200% under Section 232 (9903.85.68, note 19(k)), on the list since August 18, "
        "2025.",
        "Russian umbrella bases and other aluminum parts pay 45% + 12.5% + 200%; other Russian Chapter 66 goods pay the column 2 "
        "rate plus 12.5%.",
    ),
    "other": (
        "No Chapter 66 line is on the general exemption list (note 52(b)) or on any country exception list in note 52(j); "
        "CAFTA-DR umbrellas (6601) entered duty-free under the agreement are exempt (note 52(i), 9903.05.95). Japan, "
        "South Korea and Switzerland pay 12.5% in total and Taiwan and the EU 10% in total when the base rate is lower. " + ENDED,
        "Umbrellas from the other Section 301 economies pay the base rate plus 10% or 12.5%. Countries outside the 60 economies pay "
        "only the base rate.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = IE[key]
    if key == "cn":
        e["before"] = "+7.5% on 2 lines (List 4A)"
        e["now"] = "+12.5% (6 lines) or +20% (6602.00, 6603.90.41)"
    if key == "ru":
        e["now"] = "+12.5%, or +212.5% on 6603.90.81 with Russian aluminum"
    if key == "other":
        e["country"] = "Other Section 301 economies (Thailand, the Philippines, Bangladesh, South Korea, Switzerland and others)"
        e["now"] = "+10% or +12.5% (10% or 12.5% in total for the EU, Japan, South Korea, Switzerland, Taiwan)"
    if key in ("in", "kh", "th") and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")
    if key == "cn":
        for sid in ("fr-2019-27306",):
            if sid not in e["sourceIds"]:
                e["sourceIds"].insert(-1, sid)
    if key == "ru":
        for sid in ("fr-2025-15819",):
            if sid not in e["sourceIds"]:
                e["sourceIds"].insert(-1, sid)
    if key != "ru" and "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")

add_sources(tu, [
    "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "eo-14193", "eo-14194", "eo-14195",
    "eo-14228", "eo-14257", "eo-14266", "eo-14298", "eo-14357", "eo-14326", "eo-14329", "eo-14384", "eo-14325",
    "cbp-gsp", "fr-2019-27306", "fr-2025-15819", "procl-11021", "fr-2026-08297", "fr-2024-11901", "aphis-lacey",
    "fr-2024-30826", "ustr-301-cn-4a", "ustr-301-cn-4a-cut", "fr-2026-20510", "fr-2025-22690", "fr-2025-23892",
])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 66 base-rate changes",
        "detail": "All 8 Chapter 66 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 "
        "Basic Edition; no line was added, split or renumbered.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 4A continues",
        "detail": "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
        "four-year review. For Chapter 66 this keeps +7.5% (9903.88.15) on " + L4A + ", on top of the 12.5% 2026 action.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies cover every Chapter 66 line",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84): 12.5% for China, Vietnam, Thailand and "
        "the Philippines, 10% for Cambodia, India, Indonesia, the UK, Mexico and Canada. No Chapter 66 line is on the general "
        "exemption list (U.S. note 52(b)) or on any country exception list in note 52(j); "
        "note 52(i) exempts CAFTA-DR umbrellas (6601) claimed under the agreement (9903.05.95). EU and Taiwanese goods pay 10% in "
        "total and Japanese goods 12.5% in total; USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). FTA claims remove "
        "the base rate but not this duty; goods entered under a Chapter 98 provision such as 9817.00.96 (canes for the "
        "handicapped) do not pay it.",
        "before": "None", "now": "+10% / +12.5%", "countries": "60 economies", "sourceIds": S301,
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "br-301", "type": "extraDuty", "date": "2026-07-22", "dateLabel": "Effective",
        "title": "Section 301 tariff on products of Brazil",
        "detail": "25% on goods of Brazil (9903.05.01) on all 8 Chapter 66 lines; none is on the note 50(a)(ii) exemption list. "
        "From July 24 the 12.5% 2026 action (9903.05.27) is added.",
        "before": "None", "now": "+25%", "countries": "Brazil", "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in "
        "force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "cpsc-efiling", "type": "reference", "date": "2026-07-08", "dateLabel": "Effective",
        "title": "Children's Product Certificates must be filed electronically with each entry",
        "detail": "Importers of children's umbrellas and other CPSC-regulated products must file the certificate data "
        "electronically with CBP at entry (16 CFR part 1110). Goods entered from a foreign-trade zone follow from January 8, 2027.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["fr-2024-30826"],
    },
    {
        "id": "s232-al-end", "type": "extraDuty", "date": "2026-04-06", "dateLabel": "Effective",
        "title": "Section 232 aluminum duty on umbrella parts ends (except Russia)",
        "detail": "Proclamation 11021 replaced the Section 232 aluminum and steel derivative headings with new 9903.82 headings "
        "and new product lists (U.S. note 16(c)). 6603.90.81 is not on them, so other umbrella parts no longer pay the 50% "
        "aluminum duty. The 200% duty on parts made with Russian aluminum (9903.85.68) still applies.",
        "before": "+50% on the aluminum content", "now": "None (Russia: +200%)", "countries": "All",
        "sourceIds": ["procl-11021", "fr-2026-08297", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 66 line was on the product "
        "exemption list (9903.03.03), so every umbrella, walking stick and part paid it. USMCA-qualifying goods from Canada "
        "and Mexico were exempt.",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP "
        "stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings "
        "are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-oil-end", "type": "extraDuty", "date": "2026-02-07", "dateLabel": "Effective",
        "title": "Extra 25% on products of India ended",
        "detail": "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) that had applied since "
        "August 27, 2025. India's 25% reciprocal duty continued until February 24, 2026.",
        "before": "+25%", "now": "None", "countries": "India", "sourceIds": ["eo-14384", "eo-14329"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-12", "dateLabel": "Published",
        "title": "Nicaragua Section 301 tariff phases in from 2027",
        "detail": "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR "
        "(9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 66 line.",
        "before": "None", "now": "0% in 2026 → 10% (2027) → 15% (2028)", "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-fentanyl-cut", "type": "extraDuty", "date": "2025-11-10", "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "Executive Order 14357 lowered the IEEPA duty on products of China (9903.01.24) from 20% to 10%, so Chinese "
        "umbrellas paid 10% + 10% reciprocal on top of the base rate (walking sticks and umbrella handles also 7.5% List 4A). "
        "Ended February 24, 2026.",
        "before": "+20%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14357"],
    },
    {
        "id": "s232-al-6603", "type": "extraDuty", "date": "2025-08-18", "dateLabel": "Effective",
        "title": "Umbrella bases and other parts added to the Section 232 aluminum list",
        "detail": "Commerce added 407 product codes to the Section 232 steel and aluminum derivative lists, including 6603.90.81 "
        "(other umbrella parts and accessories, such as umbrella bases) on the aluminum list (9903.85.08, note 19(k)): 50% on "
        "the value of the aluminum content, and 200% for Russian aluminum (9903.85.68). The general duty ended April 6, 2026.",
        "before": "None", "now": "+50% of aluminum content (ended April 6, 2026)", "countries": "All",
        "sourceIds": ["fr-2025-15819", "hts-chapter-99"],
    },
    {
        "id": "in-oil", "type": "extraDuty", "date": "2025-08-27", "dateLabel": "Effective",
        "title": "Extra 25% on products of India",
        "detail": "Executive Order 14329 added 25% on Indian goods (9903.01.84) on top of the 25% reciprocal rate, for 50% in all "
        "on Indian umbrellas and walking sticks. Ended February 7, 2026.",
        "before": "+25%", "now": "+50% (ended)", "countries": "India", "sourceIds": ["eo-14329", "eo-14384"],
    },
    {
        "id": "reciprocal-country", "type": "extraDuty", "date": "2025-08-07", "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates replace the 10% baseline",
        "detail": "Executive Order 14326 set each country's reciprocal rate: Vietnam and Taiwan +20%; Cambodia, Indonesia, "
        "Thailand and the Philippines +19%; India +25%; EU and Japanese goods 15% in total. No Chapter 66 line was on the "
        "reciprocal-tariff exemption list. Ended February 24, 2026.",
        "before": "+10%", "now": "+15% to +25% (ended)", "countries": "Listed countries", "sourceIds": ["eo-14326", "hts-now"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "cn-reciprocal-10", "type": "extraDuty", "date": "2025-05-14", "dateLabel": "Effective",
        "title": "China reciprocal duty cut from 125% to 10%",
        "detail": "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025, so "
        "Chinese umbrellas paid 30% on top of the base rate (20% fentanyl + 10%). Ended February 24, 2026.",
        "before": "+125%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14298"],
    },
    {
        "id": "cn-125", "type": "extraDuty", "date": "2025-04-10", "dateLabel": "Effective",
        "title": "China reciprocal duty raised to 125%; other country rates paused",
        "detail": "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% and paused the higher country rates "
        "for other countries, leaving the 10% baseline. With the 20% fentanyl duty, Chinese umbrellas paid 145% on top of the "
        "base rate until May 13, 2025 (152.5% on walking sticks and umbrella handles with List 4A).",
        "before": "+34%", "now": "+125% (ended)", "countries": "China; all others", "sourceIds": ["eo-14266", "eo-14257"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) from April 5, 2025 and country rates (9903.02.xx); Canada and Mexico excluded. "
        "Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "cn-fentanyl-20", "type": "extraDuty", "date": "2025-03-04", "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "Executive Order 14228 raised the IEEPA duty on products of China from 10% to 20%. Ended February 24, 2026.",
        "before": "+10%", "now": "+20% (ended)", "countries": "China", "sourceIds": ["eo-14228"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt (9903.01.04). Ended "
        "February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10) from March 4, 2025, later raised to +35%; USMCA-qualifying goods exempt "
        "(9903.01.14). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
    {
        "id": "cn-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of China",
        "detail": "+10% on all goods of China (9903.01.20) from February 4, 2025 — the first extra duty on Chinese umbrellas, which "
        "are on no Section 301 list. Ended February 24, 2026.",
        "before": "None", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14195"],
    },
    {
        "id": "lacey-phase-7", "type": "reference", "date": "2024-12-01", "dateLabel": "Effective",
        "title": "Lacey Act plant declaration now required for umbrellas and umbrella parts",
        "detail": "APHIS Phase VII of the Lacey Act declaration schedule, which began December 1, 2024, covers umbrellas (6601), "
        "umbrella frames (6603.20) and umbrella handles, knobs, tips and caps (6603.90.41) that contain wood, bamboo or other "
        "plant material: importers file the genus, species, country of harvest, quantity and value (PPQ Form 505 or the ACE "
        "Lacey Act message set). Walking sticks, whips and riding crops (6602) have been covered since April 1, 2010.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["fr-2024-11901", "aphis-lacey"],
    },
    {
        "id": "cn-list4a-cut", "type": "extraDuty", "date": "2020-02-14", "dateLabel": "Effective",
        "title": "China List 4A cut from 15% to 7.5%",
        "detail": "Under the U.S.-China Phase One agreement USTR halved the List 4A duty (9903.88.15) on " + L4A + ".",
        "before": "+15%", "now": "+7.5%", "countries": "China", "sourceIds": ["ustr-301-cn-4a-cut", "hts-chapter-99"],
    },
    {
        "id": "cn-list4b-suspended", "type": "reference", "date": "2019-12-18", "dateLabel": "Published",
        "title": "China List 4B suspended — umbrellas never charged",
        "detail": "USTR suspended the 15% List 4B duty (9903.88.16) that was to start December 15, 2019. List 4B named umbrellas "
        "(6601.10, 6601.91, 6601.99), umbrella frames (6603.20) and other umbrella parts (6603.90.81), so these Chinese goods "
        "pay no 2018–2019 Section 301 duty. Revision 21 still prints the list as suspended.",
        "before": "+15% (scheduled)", "now": "Suspended", "countries": "China", "sourceIds": ["fr-2019-27306", "hts-chapter-99"],
    },
    {
        "id": "cn-list4a", "type": "extraDuty", "date": "2019-09-01", "dateLabel": "Effective",
        "title": "China List 4A: 15% on walking sticks and umbrella handles",
        "detail": "USTR's fourth China Section 301 list (9903.88.15) put 15% on " + L4A + " from September 1, 2019. Cut to 7.5% "
        "from February 14, 2020.",
        "before": "None", "now": "+15%", "countries": "China", "sourceIds": ["ustr-301-cn-4a", "hts-chapter-99"],
    },
]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---------------------------------------------------------------- industry areas (static parts)
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 66 Tariff Rates by Country: Umbrellas, Walking Sticks & Umbrella Parts"
ia["seo"]["title"] = "HTS Chapter 66 Import Duty by Country: China, Vietnam, Cambodia, Taiwan, India — Umbrellas | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on umbrellas, walking sticks, whips and umbrella parts by country: base rate plus the 2026 Section "
    "301 duty and China's List 4A duty, with USMCA, the EU, Japan and Taiwan caps applied."
)
ia["seo"]["keywords"] = [
    "united states tariff on umbrellas",
    "section 301 tariffs on umbrellas",
    "hts 6601 telescopic umbrellas import duty",
    "hts 6603 umbrella frames customs duty",
    "china tariff on umbrellas",
    "vietnam umbrella import duty",
    "cambodia tariff on umbrellas",
    "italy umbrella import duty rates",
]
ia["intro"] = (
    "The total rate on Chapter 66 goods depends on **where they come from** as much as on what they are. Each cell below is the "
    "base rate for that product group plus the extra duty for that country, minus any preference — computed from the current "
    "tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** (from "
    "July 24, 2026): **12.5% for China and Vietnam**, 10% for Cambodia, India and Indonesia, and none of the 8 lines is on an "
    "exemption list. **China adds 7.5%** (List 4A) on walking sticks and umbrella handles, **USMCA-qualifying goods from Mexico "
    "and Canada enter free**, and EU and Taiwanese goods pay 10% in total."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

RULE_LABELS = {
    "China": "Base rate plus 12.5% Section 301 (9903.05.31) on all 8 lines, plus 7.5% List 4A (9903.88.15) on walking sticks (6602.00) and umbrella handles, knobs, tips and caps (6603.90.41). Umbrellas and frames are on no China list (List 4B was suspended).",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on all 8 lines; no exception list covers a Chapter 66 line. The 20% IEEPA reciprocal duty ended February 24, 2026.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on all 8 lines. GSP has expired; the IEEPA duties (25% + 25%) ended in February 2026.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Canada": "USMCA-qualifying: Free, no extra duty (9903.05.93); no Chapter 66 line is on the Section 338 lists. Otherwise the base rate plus 10% (9903.05.29).",
    "Brazil": "Base rate plus 25% Brazil Section 301 (9903.05.01) and 12.5% (9903.05.27) on all 8 lines; none is on the note 50 exemption list.",
    "Germany": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is under 10%; patio-umbrella frames at 12% pay only the base rate (9903.05.38). The 15% IEEPA rate ended February 24, 2026.",
    "Belgium": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is under 10%; patio-umbrella frames at 12% pay only the base rate (9903.05.38). The 15% IEEPA rate ended February 24, 2026.",
    "Italy": "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is under 10%; patio-umbrella frames at 12% pay only the base rate (9903.05.38). The 15% IEEPA rate ended February 24, 2026.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on all 8 lines; the UK exception list names no Chapter 66 line.",
    "Japan": "12.5% in total in place of the base rate (9903.05.49) on all 8 lines. The 15% IEEPA rate ended February 24, 2026.",
    "Taiwan": "10% in total in place of the base rate (9903.05.76) where the base rate is under 10%; patio-umbrella frames pay their 12% base rate. The 20% IEEPA reciprocal duty ended February 24, 2026.",
    "Cambodia": "Base rate plus 10% Section 301 (9903.05.28) on all 8 lines; no exception list covers a Chapter 66 line. The 19% IEEPA reciprocal duty ended February 24, 2026.",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45) on all 8 lines; Indonesia's exception list names no Chapter 66 line.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on all 8 lines. GSP has expired.",
    "Philippines": "Base rate plus 12.5% Section 301 (9903.05.64) on all 8 lines.",
    "Bangladesh": "Base rate plus 10% Section 301 on all 8 lines; Bangladesh's exception list names no Chapter 66 line.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% (9903.05.20–9903.05.83), or 37.5% more for Brazil. No country exception list names a Chapter 66 line; CAFTA-DR umbrellas (6601) entered duty-free under the agreement (SPI P) are exempt (note 52(i), 9903.05.95).",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    sids = c["rule"]["sourceIds"]
    if "eo-14389" not in sids:
        sids.insert(-1, "eo-14389")
    if c["country"] in ("India", "Cambodia", "Thailand"):
        sids.insert(-1, "cbp-gsp")
    if c["country"] == "China" and "fr-2019-27306" not in sids:
        sids.insert(-1, "fr-2019-27306")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section "
    "122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Canes entered under 9817.00.96 (articles for the handicapped) are Free and pay no Section 301 duty when CBP agrees the "
    "entry is proper; the grid shows the 6602.00.00 rate without that claim.",
    "Russia is not in the grid: its goods take column 2 rates, and umbrella parts of 6603.90.81 made with Russian aluminum "
    "also pay 200% under Section 232 (9903.85.68).",
    "Not in the grid: admissibility rules — Lacey Act declarations, APHIS treatment of wooden articles from China, FDA "
    "registration for medical canes and CPSC rules for children's umbrellas (see Import documents).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 19, 20, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) "
    "(9903.05.86), the general exemption list, names no Chapter 66 code, and no note 52(j) country exception list names one. "
    "Note 52(i) (9903.05.95) exempts CAFTA-DR textile and apparel goods entered duty-free under the agreement, which "
    "includes umbrellas of heading 6601 (SPI P); CAFTA-DR suppliers shipped almost no umbrellas in 2025. "
    "Note 50(a)(ii) (Brazil) and note 51 (Canada Section 338) name none. In note 20, List 4A (20(s), 9903.88.15) names "
    "6602.00.00 and 6603.90.41; List 4B (20(u), suspended) names the other six lines; Lists 1–3 and the 2024 increases "
    "(note 31) name none, and no exclusion in 9903.88.69 covers a Chapter 66 product. Note 19(k) lists 6603.90.81 as an "
    "aluminum derivative, which now matters only for Russian aluminum (9903.85.68); the note 16(c) lists of the current "
    "Section 232 metals program name no Chapter 66 line. No antidumping or countervailing duty order covers a Chapter 66 "
    "product."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "cbp-gsp", "fr-2019-27306"])

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Umbrellas, Walking Sticks & Umbrella Parts (HTS Ch. 66): Rules, Documents & Ways to Lower Duty"
te["seo"]["title"] = "Importing Umbrellas & Walking Canes: Classification, Lacey Act, FDA & Ways to Lower Duty (HTS Ch. 66) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The rules for each HTS Chapter 66 line — Lacey Act declarations, APHIS treatment of wooden articles from China, FDA "
    "registration for medical canes, CPSC rules for children's umbrellas, origin marking — and the legal ways to pay less: "
    "telescopic and rain-umbrella classifications, 9817.00.96 for canes, USMCA, FTAs, rulings and drawback."
)
te["seo"]["keywords"] = [
    "hts chapter 66 tariff engineering",
    "lacey act walking sticks compliance",
    "usda aphis lacey act walking sticks",
    "umbrella manufacturing import regulations",
    "9817.00.96 walking cane duty free",
    "telescopic umbrella classification",
    "usmca umbrella rules of origin",
]
te["intro"] = (
    "Most umbrellas and walking sticks enter with only a customs entry, but four agency rules can apply: a **Lacey Act plant "
    "declaration** when the goods contain wood, bamboo or other plant material; **APHIS treatment and tagging** of wooden and "
    "bamboo articles from China; **FDA registration and listing** for canes sold for medical use; and **CPSC testing and an "
    "eFiled certificate** for umbrellas made for children.\n\n"
    "The ways to pay less are mostly in the classification: a **telescopic-shaft** umbrella is Free where a fixed-shaft one pays "
    "8.2%, **rain-umbrella frames** are Free where patio frames pay 12%, and **umbrella handles, knobs, tips and caps** are Free "
    "where other parts pay 5.2%. **Canes for people with chronic mobility impairments** can enter Free under 9817.00.96, which "
    "also removes the Section 301 duty. Beyond that: claim **USMCA**, use **FTA** rates where the base rate is the cost, get a "
    "**binding ruling**, and claim **drawback** on re-exports."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "classify",
        "title": "Classify by shaft, frame use and part type",
        "saves": "The whole base rate: Free instead of 8.2% (telescopic vs. fixed-shaft umbrellas), Free instead of 12% "
        "(frames for hand-held rain umbrellas vs. other frames), Free instead of 5.2% (handles, knobs, tips and caps vs. other "
        "parts)",
        "appliesTo": "6601.91 vs. 6601.99; 6603.20.30 vs. 6603.20.90; 6603.90.41 vs. 6603.90.81",
        "document": "Product specifications and photos showing the shaft construction, the umbrella the frame is for, and what "
        "each part is; a binding ruling if in doubt.",
        "caveat": "The line must match the goods: a golf umbrella with a fixed shaft is 6601.99 at 8.2% (NY N347448), and "
        "beach, patio and garden umbrellas stay in 6601.10 at 6.5% whatever their pole (HQ H248132). The Section 301 duty still "
        "applies to the full value; from China, 6603.90.41 handles pay the 7.5% List 4A duty that 6603.90.81 parts do not.",
        "citations": [
            {"label": "HTSUS Chapter 66", "url": CH66},
            {"label": "CBP ruling NY N347448 (golf umbrella, fixed shaft)", "url": ruling("N347448")},
            {"label": "CBP ruling HQ H248132 (beach and outdoor umbrellas)", "url": ruling("H248132")},
        ],
    },
    {
        "id": "ch98-canes",
        "title": "Enter canes for people with chronic impairments under 9817.00.96",
        "saves": "The 4% base rate, the 10%–12.5% Section 301 duty and, from China, the 7.5% List 4A duty",
        "appliesTo": "Walking canes, quad canes and mobility canes for the blind of 6602.00.00 that are specially designed or "
        "adapted for persons with permanent or chronic impairments",
        "document": "Product literature showing the medical design (weight-bearing handle, adjustable height, quad base); report "
        "9817.00.96 with 6602.00.0000. A ruling such as NY N356862 or N352521 settles eligibility.",
        "caveat": "Articles for acute or transient disability, fashion canes, hiking and trekking poles do not qualify (Chapter "
        "98, subchapter XVII, U.S. note 4). Chapter 98 entries escape the Section 301 duties under U.S. notes 20 and 52(a) only "
        "when CBP agrees the claim is proper.",
        "citations": [
            {"label": "HTSUS 9817.00.96 and U.S. note 4 (Chapter 98)", "url": CH98},
            {"label": "CBP ruling NY N356862 (orthopedic walking cane)", "url": ruling("N356862")},
            {"label": "CBP ruling NY N352521 (mobility canes)", "url": ruling("N352521")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on goods made in Mexico or Canada",
        "saves": "The 10% Section 301 duty plus the base rate (up to 12%)",
        "appliesTo": "All 8 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in any format. An umbrella qualifies when "
        "made from non-originating materials of another heading, unless it uses both an imported frame (6603.20) and imported "
        "canopy fabric; walking sticks qualify from any other heading and parts from any other chapter (General Note 11).",
        "caveat": "Assembling an imported frame and imported fabric into an umbrella does not qualify. The USMCA was not renewed "
        "at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": "https://www.ecfr.gov/current/title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (Chapter 66 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA or AGOA rate where the base rate is the cost",
        "saves": "The base rate: 12% on patio-umbrella frames, 8.2% on stick and golf umbrellas, 6.5% on patio umbrellas, 5.2% on "
        "parts, 4% on walking sticks",
        "appliesTo": "The 5 dutiable lines, for goods of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Jordan, Morocco, "
        "Bahrain, Oman, Singapore, CAFTA-DR, CBERA and AGOA countries",
        "document": "Proof of origin under the program and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, JO, MA, BH, OM, "
        "SG, P, E or D).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)). GSP (A, A*) has been expired since "
        "December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Notes", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "CBP: GSP status", "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the line decides the rate: garden vs. other umbrellas, telescopic vs. fixed shafts, frames for "
        "rain umbrellas vs. other frames, umbrella bases (6603.90.81, NY N337801), canes (6602) vs. crutches (9021) and selfie "
        "sticks (9620)",
        "appliesTo": "Any line where classification is in doubt — especially umbrellas with lights, fans or solar panels, and "
        "sets of umbrellas with covers or cases",
        "document": "A ruling request to CBP describing the product, its materials and construction (19 CFR part 177). Published "
        "rulings show how CBP decides: N337801 (umbrella base), H262581 (trekking poles in 6602), R02119 (riding crop), N298912 "
        "(selfie stick monopod).",
        "caveat": "Rulings apply to the transaction described. Covers and umbrella cases are not parts of heading 6603 (chapter "
        "note 2); they are classified on their own material.",
        "citations": [
            {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
            {"label": "CBP ruling NY N337801 (umbrella base)", "url": ruling("N337801")},
            {"label": "CBP ruling HQ H262581 (walking and trekking poles)", "url": ruling("H262581")},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the goods are exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported goods re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods "
        "(for example frames and handles assembled into umbrellas for export)",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": "https://www.ecfr.gov/current/title-19/part-190"}],
    },
]
te["rules"] = [
    {
        "id": "lacey", "agency": "USDA APHIS",
        "title": "Lacey Act plant declaration (genus, species, country of harvest, quantity, value) for goods containing wood, bamboo or other plant material: walking sticks, whips and riding crops (6602) since April 1, 2010; umbrellas (6601), umbrella frames (6603.20) and umbrella handles, knobs, tips and caps (6603.90.41) since December 1, 2024. Goods with no plant content need no declaration",
        "citations": [
            {"label": "16 U.S.C. 3372(f)", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm"},
            {"label": "74 FR 45415 (Phase IV: heading 6602)", "url": "https://www.federalregister.gov/documents/2009/09/02/E9-21216/implementation-of-revised-lacey-act-provisions"},
            {"label": "89 FR 47122 (Phase VII: 6601, 6603.20, 6603.90.41)", "url": "https://www.federalregister.gov/documents/2024/05/31/2024-11901/implementation-of-revised-lacey-act-provisions"},
            {"label": "APHIS Lacey Act page", "url": "https://www.aphis.usda.gov/plant-imports/lacey-act"},
        ],
    },
    {
        "id": "aphis-handicraft", "agency": "USDA APHIS",
        "title": "Walking sticks, canes and other articles of wood, twigs, vines or bamboo are wooden handicrafts inspected at the port of first arrival; from China, pieces over 1 cm in diameter must be treated and every package tagged with the manufacturer's identity",
        "citations": [
            {"label": "7 CFR 319.40-1 (wooden handicraft)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-1"},
            {"label": "7 CFR 319.40-5(o) (wooden handicrafts from China)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-5"},
            {"label": "7 CFR 319.40-9 (inspection)", "url": "https://www.ecfr.gov/current/title-7/section-319.40-9"},
        ],
    },
    {
        "id": "fda-cane", "agency": "FDA",
        "title": "Canes intended for medical purposes (standard, forearm, quad and tripod canes) are Class I medical devices, exempt from 510(k); the foreign maker must register its establishment, list the device and name a U.S. agent",
        "citations": [
            {"label": "21 CFR 890.3075 (cane)", "url": "https://www.ecfr.gov/current/title-21/section-890.3075"},
            {"label": "21 CFR 807.40 (foreign establishments)", "url": "https://www.ecfr.gov/current/title-21/section-807.40"},
        ],
    },
    {
        "id": "cpsc-children", "agency": "CPSC",
        "title": "Umbrellas designed or intended primarily for children 12 or younger are children's products: lead limits for paint and coatings, third-party testing and a Children's Product Certificate, filed electronically with the entry from July 8, 2026 (toy umbrellas are chapter 95 goods)",
        "citations": [
            {"label": "16 CFR part 1110 (certificates)", "url": "https://www.ecfr.gov/current/title-16/part-1110"},
            {"label": "16 CFR part 1303 (lead paint)", "url": "https://www.ecfr.gov/current/title-16/part-1303"},
            {"label": "Final rule, 90 FR 1800 (Jan. 8, 2025)", "url": "https://www.federalregister.gov/documents/2025/01/08/2024-30826/certificates-of-compliance"},
        ],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on each article (or its container when the article cannot be marked), in English, legible and permanent enough to reach the ultimate purchaser",
        "citations": [
            {"label": "19 CFR 134.11", "url": "https://www.ecfr.gov/current/title-19/section-134.11"},
            {"label": "19 CFR 134.41", "url": "https://www.ecfr.gov/current/title-19/section-134.41"},
        ],
    },
    {
        "id": "cbp-textile-origin", "agency": "CBP",
        "title": "Umbrellas of heading 6601 are textile products for origin purposes: a garden or telescopic umbrella (6601.10–6601.91) originates in the single country where it was wholly assembled, wherever the fabric or frame was made",
        "citations": [
            {"label": "19 CFR 102.21", "url": "https://www.ecfr.gov/current/title-19/section-102.21"},
            {"label": "CBP ruling HQ 959701 (origin of garden umbrellas)", "url": ruling("959701")},
        ],
    },
    {
        "id": "cbp-ch99", "agency": "CBP",
        "title": "Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or 9903.05.93/.94 for USMCA goods), China List 4A (9903.88.15) on 6602.00.00 and 6603.90.41, Brazil (9903.05.01), and Russian aluminum (9903.85.68) on 6603.90.81",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 19, 20, 50 and 52", "url": CH99},
        ],
    },
]
GROUP_NOTES = {
    "6601": "Umbrellas with wooden or bamboo shafts or handles need a Lacey Act declaration (since December 1, 2024); umbrellas made for children need CPSC testing and an eFiled certificate.",
    "6602": "Walking sticks, whips and riding crops of wood, bamboo or cane need a Lacey Act declaration (since 2010), and from China wooden ones must be treated and tagged. Medical canes are FDA Class I devices; they may enter Free under 9817.00.96.",
    "6603": "Wooden or bamboo frames, handles, knobs, tips and caps need a Lacey Act declaration (since December 1, 2024). Other parts (6603.90.81) made with Russian aluminum pay the 200% Section 232 duty.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    g["ruleIds"] = {
        "6601": ["lacey", "cpsc-children", "cbp-marking", "cbp-textile-origin", "cbp-ch99"],
        "6602": ["lacey", "aphis-handicraft", "fda-cane", "cbp-marking", "cbp-ch99"],
        "6603": ["lacey", "cbp-marking", "cbp-ch99"],
    }[h]

LINE_RULES = {
    "6601.10.00.00": ["lacey", "cpsc-children", "cbp-marking", "cbp-textile-origin", "cbp-ch99"],
    "6601.91.00.00": ["lacey", "cpsc-children", "cbp-marking", "cbp-textile-origin", "cbp-ch99"],
    "6601.99.00.00": ["lacey", "cpsc-children", "cbp-marking", "cbp-textile-origin", "cbp-ch99"],
    "6602.00.00.00": ["lacey", "aphis-handicraft", "fda-cane", "cbp-marking", "cbp-ch99"],
    "6603.20.30.00": ["lacey", "cbp-marking", "cbp-ch99"],
    "6603.20.90.00": ["lacey", "cbp-marking", "cbp-ch99"],
    "6603.90.41.00": ["lacey", "cbp-marking", "cbp-ch99"],
    "6603.90.81.00": ["cbp-marking", "cbp-ch99"],
}
LINE_LEVERS = {
    "6601.10.00.00": ["classify", "usmca", "fta", "ruling", "drawback"],
    "6601.91.00.00": ["classify", "usmca", "ruling", "drawback"],
    "6601.99.00.00": ["classify", "usmca", "fta", "ruling", "drawback"],
    "6602.00.00.00": ["ch98-canes", "usmca", "fta", "ruling", "drawback"],
    "6603.20.30.00": ["classify", "usmca", "ruling", "drawback"],
    "6603.20.90.00": ["classify", "usmca", "fta", "ruling", "drawback"],
    "6603.90.41.00": ["classify", "usmca", "ruling", "drawback"],
    "6603.90.81.00": ["classify", "usmca", "fta", "ruling", "drawback"],
}
for ln in te["lines"]:
    ln["ruleIds"] = LINE_RULES[ln["hts"]]
    ln["leverIds"] = LINE_LEVERS[ln["hts"]]
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Lacey Act scope, APHIS treatment "
    "rules and FDA and CPSC requirements change; check them before each shipment."
)

# ---------------------------------------------------------------- overview (static parts)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
GROUP_BLURB = {
    "6601": (
        "Rain, golf, folding and stick umbrellas, walking-stick umbrellas, parasols, and patio, beach, garden and market "
        "umbrellas. Garden and similar umbrellas are 6.5%, telescopic-shaft umbrellas Free and other umbrellas 8.2%.",
        ["umbrella", "folding umbrella", "golf umbrella", "patio umbrella", "beach umbrella", "parasol", "sun umbrella", "garden umbrella", "market umbrella"],
    ),
    "6602": (
        "Walking sticks and canes, seat sticks, hiking and trekking poles, whips and riding crops. One line at 4%; canes for people "
        "with chronic impairments can enter Free under 9817.00.96.",
        ["walking stick", "walking cane", "quad cane", "trekking pole", "hiking stick", "seat stick", "riding crop", "whip"],
    ),
    "6603": (
        "Umbrella frames (Free for hand-held rain umbrellas, 12% for patio and other umbrellas), handles, knobs, tips and caps "
        "(Free), and other parts and accessories such as umbrella bases and cane tips (5.2%).",
        ["umbrella frame", "umbrella handle", "umbrella base", "umbrella stand base", "cane tip", "umbrella rib", "umbrella shaft"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = GROUP_BLURB[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Folding umbrellas from China: telescopic vs. fixed shaft",
        "line": "6601.91.00.00",
        "body": "A folding umbrella with a telescopic shaft is Free at the base rate; the 2026 Section 301 action adds 12.5% "
        "(9903.05.31), so a $10,000 shipment pays **$1,250**. Umbrellas are on no older China list (List 4B was suspended). A "
        "golf umbrella with a fixed shaft is 6601.99 at 8.2% (NY N347448): **$2,070** on the same shipment.",
    },
    {
        "title": "Patio umbrellas: Vietnam vs. Cambodia vs. Italy vs. Mexico",
        "line": "6601.10.00.00",
        "body": "Patio, market and beach umbrellas are garden umbrellas at 6.5% (HQ H248132). From Vietnam: 6.5% + 12.5% = "
        "**$1,900** on $10,000. From Cambodia: 6.5% + 10% = **$1,650**. From Italy the EU rule replaces the base rate with 10% "
        "in total: **$1,000**. From Mexico with a USMCA claim: **$0**.",
    },
    {
        "title": "Walking canes from China, with and without 9817.00.96",
        "line": "6602.00.00.00",
        "body": "Canes are 4%. From China, List 4A (+7.5%, 9903.88.15) and the 2026 action (+12.5%) stack: **$2,400** on $10,000. "
        "Canes specially designed for people with chronic mobility impairments can be entered under 9817.00.96 (NY N356862, "
        "N352521): Free, and Chapter 98 entries pay no Section 301 duty, so **$0** when CBP accepts the claim.",
    },
    {
        "title": "Umbrella frames: rain umbrellas vs. patio umbrellas",
        "line": "6603.20.90.00",
        "body": "Frames for patio and other umbrellas pay 12%; frames for hand-held rain umbrellas (6603.20.30) are Free. From "
        "China a $10,000 shipment of patio frames pays 12% + 12.5% = **$2,450**, rain-umbrella frames **$1,250**. From Taiwan "
        "the patio frames pay only their 12% base rate (**$1,200**), because the Taiwan rule charges nothing extra at 10% or more.",
    },
]
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover: (a) measure walking-sticks or the like (heading 9017); (b) firearm-sticks, "
    "sword-sticks, loaded walking-sticks or the like (chapter 93); or (c) goods of chapter 95 (for example, toy umbrellas, toy "
    "sun umbrellas).\n\n"
    "**Note 2.** Heading 6603 does not cover parts, trimmings or accessories of textile material, or covers, tassels, thongs, "
    "umbrella cases or the like, of any material. Such goods entered with, but not fitted to, articles of heading 6601 or 6602 "
    "are to be classified separately and are not to be treated as forming part of those articles."
)
ov["notes"]["additionalUsNotes"] = None

# ---------------------------------------------------------------- trade-dependent text
exec(open(os.path.join(HERE, "fill66_trade.py")).read())

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 66 FAQ: Umbrella, Walking Stick & Umbrella Frame HS Codes and Import Duties"
fc["seo"]["title"] = "HTS Chapter 66 FAQ 2026: HS Codes for Umbrellas, Patio Umbrellas, Frames, Bases & Walking Sticks | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about Chapter 66 imports: HS codes 6601, 6602 and 6603, patio, beach, golf and folding "
    "umbrellas, umbrella frames, handles and bases, walking sticks and canes, riding crops, and the 2026 tariffs from China, "
    "Vietnam and other suppliers."
)
fc["seo"]["keywords"] = [
    "hs code for umbrella",
    "umbrella tariff code",
    "hs code 6601",
    "hs code for patio umbrella",
    "hs code for umbrella frame",
    "hs code for umbrella base",
    "hs code for walking stick",
    "hs code for walking cane",
    "umbrella import duty from china",
    "china section 301 umbrella duties",
    "hts 6601.91 import duty rates",
    "italy walking-stick customs duty",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing umbrellas, walking sticks, whips and umbrella parts into the "
    "U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 13, 2026, plus search terms the live chapter pages already rank for"

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
