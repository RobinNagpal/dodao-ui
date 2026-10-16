"""Fill the writer parts of the generated Chapter 43 content file.

Re-run after `pnpm tariff:generate-chapter --chapter 43 ...` (see run.sh in this folder):
    python3 fill.py
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU, OUT  # noqa: E402,F401

import glob
import json

WT = IU
PATH = OUT  # run.sh copies the generated file here; filled in place
CHECKED = "2026-10-12"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH43 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2043"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
ECFR = "https://www.ecfr.gov/current/title-{t}/{k}-{s}"


def ecfr(t, s, kind="section"):
    return ECFR.format(t=t, k=kind, s=s)


d = json.load(open(PATH))

# Reuse source objects already published in other chapters (same ids, same documents).
ref = {}
for f in sorted(glob.glob(f"{WT}/src/tariff-data/chapters/*.json")):
    if f == PATH:
        continue
    try:
        other = json.load(open(f))
    except Exception:
        continue
    for page in ("tariffUpdates", "industryAreas"):
        for s in (other.get(page) or {}).get("sources", []):
            ref.setdefault(s["id"], s)

NEW_SOURCES = {
    "procl-11064": {
        "id": "procl-11064", "publisher": "Federal Register", "citation": "91 FR 58331", "document": "Proclamation 11064",
        "title": "Modifying the Scope of Products of Canada Subject to the Additional Duties Imposed To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Alcoholic Beverages",
        "signed": "2026-09-08", "published": "2026-09-14",
        "url": "https://www.federalregister.gov/documents/2026/09/14/2026-18838/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset-canadian",
    },
    "eo-14324": {
        "id": "eo-14324", "publisher": "Federal Register", "citation": "90 FR 37775", "document": "Executive Order 14324",
        "title": "Suspending Duty-Free De Minimis Treatment for All Countries",
        "signed": "2025-07-30", "published": "2025-08-05",
        "url": "https://www.federalregister.gov/documents/2025/08/05/2025-14897/suspending-duty-free-de-minimis-treatment-for-all-countries",
    },
    "eo-14388": {
        "id": "eo-14388", "publisher": "Federal Register", "citation": "91 FR 9433", "document": "Executive Order 14388",
        "title": "Continuing the Suspension of Duty-Free De Minimis Treatment for All Countries",
        "signed": "2026-02-20", "published": "2026-02-25",
        "url": "https://www.federalregister.gov/documents/2026/02/25/2026-03829/continuing-the-suspension-of-duty-free-de-minimis-treatment-for-all-countries",
    },
    "fr-2026-12670": {
        "id": "fr-2026-12670", "publisher": "Federal Register", "citation": "91 FR 37789", "document": "Interim final rule (CBP Dec. 26-12)",
        "title": "Indefinite Suspension of the De Minimis Exemption for Merchandise Arriving Through All Modes Other Than the International Postal Network",
        "signed": None, "published": "2026-06-24",
        "url": "https://www.federalregister.gov/documents/2026/06/24/2026-12670/indefinite-suspension-of-the-de-minimis-exemption-for-merchandise-arriving-through-all-modes-other",
    },
    "pl-106-476": {
        "id": "pl-106-476", "publisher": "U.S. Congress (GovInfo)", "citation": "Pub. L. 106-476, title I, sec. 1443 (19 U.S.C. 1308)",
        "document": "Public Law 106-476",
        "title": "Tariff Suspension and Trade Act of 2000 — Dog and Cat Protection Act of 2000 (prohibition on importation of dog and cat fur products)",
        "signed": "2000-11-09", "published": "2000-11-09",
        "url": "https://www.govinfo.gov/content/pkg/PLAW-106publ476/pdf/PLAW-106publ476.pdf",
    },
}


def src(sid):
    if sid in NEW_SOURCES:
        return NEW_SOURCES[sid]
    return ref[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


LABELS = {
    "4301": ("Raw furskins: mink, fox, lamb, rabbit, beaver, sable and other pelts", "Raw furskins"),
    "4302": ("Tanned or dressed furskins, incl. sheepskins with the wool on, pieces and plates", "Tanned furskins"),
    "4303": ("Fur garments, accessories and other articles of furskin", "Fur apparel & articles"),
    "4304": ("Artificial fur and articles thereof", "Artificial fur"),
}

ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
NO_LIST = "No Chapter 43 line is on the Section 301 general exemption list (U.S. note 52(b)) or on any country exception list in note 52(j)."

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 43: Furskins & Artificial Fur (Mink, Fox, Fur Coats, Faux Fur) — 2026 Tariff Rates"
ov["seo"]["title"] = "HTS Chapter 43 Tariff Rates 2026: Raw & Tanned Furskins, Fur Coats and Artificial Fur Import Duties | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 39 HTS Chapter 43 lines: raw mink and fox pelts, tanned furskins and shearling, fur coats "
    "(4303.10) and artificial fur (4304). General, FTA and Column 2 rates, the 2026 extra duty by country, and the dog/cat, "
    "seal and CITES import bans."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 43",
    "hts chapter 43 customs duty",
    "furskins and artificial fur tariff",
    "raw furskins import duty",
    "fur coat hs code",
    "HS code 4303.10",
    "artificial fur hs code",
    "china tariff on raw mink and fox furskins",
    "canada usmca furskins duty",
    "dog and cat fur import ban",
]
ov["intro"] = (
    "Chapter 43 covers **raw furskins** — mink, fox, lamb, rabbit, beaver, sable and other pelts (heading 4301) — **tanned or "
    "dressed furskins**, including sheepskins with the wool on (4302), **fur garments, accessories and other articles of "
    "furskin** (4303) and **artificial fur** (4304). Its **39 tariff lines** carry low base rates: Free on 18 lines, 4% on fur "
    "apparel and 6.5% at most, on artificial fur.\n\n"
    "Two things decide the cost of an import. First, **whether it may enter at all**: dog and cat fur is banned (19 U.S.C. 1308), "
    "seal and other marine-mammal furs are prohibited without an MMPA permit or exception, CITES- and ESA-listed species need "
    "permits, wildlife furs need a Fish and Wildlife Service declaration, and fur garments must carry a Fur Products Labeling "
    "Act label. Second, **the extra duty by country**: since **July 24, 2026** EU goods pay **10% in total**, and most other "
    "suppliers pay a **10% or 12.5% Section 301 tariff** on every line. China adds its 2018–2019 Section 301 duties (**41.5%** "
    "in total on a fur coat), Brazil 25% more, and **Canada a 50% Section 338 duty** on 11 lines — raw fox, tanned furskins and "
    "fur apparel among them — even with a USMCA claim. Italy supplied 27% of the $166M imported in 2025."
)
BLURBS = {
    "4301": (
        "Raw (untanned) pelts: mink, Astrakhan/Persian and similar lamb, fox, and other furskins with statistical lines for hare, "
        "rabbit, beaver, muskrat, nutria, lynx, marten, sable, fisher, raccoon and seal, plus heads, tails, paws and pieces. All "
        "Free except silver, black or platinum fox (5.1%). Raw sheep and goat skins with the wool or hair on are chapter 41.",
        ["raw mink pelts", "fox pelts", "sable pelts", "beaver pelts", "raccoon pelts", "rabbit skins", "persian lamb", "fur pieces"],
    ),
    "4302": (
        "Furskins that have been tanned or dressed, whole or in pieces, loose or sewn into plates and crosses (not yet made into "
        "articles): mink 2.1%, named lamb 2.2%, silver fox 5.6%, other fox, beaver, raccoon, sable and similar 1.5% (not dyed) or "
        "2.2% (dyed), rabbit or hare 2.7%, other furskins such as sheepskins 3.5% (not dyed) or 1.7% (dyed), assembled plates 5.3%.",
        ["tanned mink", "dressed fox skins", "shearling sheepskin", "rabbit fur skins", "fur plates", "dyed fur", "mink tails"],
    ),
    "4303": (
        "Fur coats, jackets, vests, stoles, collars and other apparel and clothing accessories of furskin (4303.10, 4%; mink "
        "reported separately), including shearling coats, and other articles of furskin such as blankets, throws and rugs "
        "(4303.90, Free). Fur hats are chapter 65 and fur-and-leather gloves heading 4203. 74% of the chapter's imports.",
        ["fur coat", "mink coat", "shearling coat", "fur jacket", "fur vest", "fur collar", "fur blanket", "fur rug"],
    ),
    "4304": (
        "Artificial fur — fibres gummed or sewn onto leather, woven fabric or other material — and articles of it, 6.5%. Faux fur "
        "made by knitting or weaving (pile fabric) is not artificial fur under chapter note 5: the fabric is heading 6001 or 5801 "
        "and garments of it are classified in chapters 61 and 62.",
        ["artificial fur", "faux fur", "fake fur", "imitation fur", "faux fur articles"],
    ),
}
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["stats"] = [
    {"label": "Tariff lines", "value": "39"},
    {"label": "Lines with a base-rate duty", "value": "21 of 39"},
    {
        "label": "Lines with an extra duty for some origins",
        "value": "39 of 39",
        "note": "Section 301 (2026): 39; Brazil: 38; China 2018–2019 lists: 37; Canada Section 338: 11 (even with USMCA); Russia note 30: 3",
    },
    {"label": "2025 imports", "value": "$166.1M"},
    {"label": "Italy + Türkiye share", "value": "40%"},
]

ov["workedExamples"] = [
    {
        "title": "A $10,000 mink coat: Italy vs China",
        "line": "4303.10.00.30",
        "body": "Fur apparel is 4303.10 at 4%. From Italy the EU rule makes the total **10%** (9903.05.39), so the coat pays "
        "**$1,000**. The same coat made in China pays 4% + 25% (List 3, 9903.88.03) + 12.5% (9903.05.31) = **41.5%, $4,150**. "
        "Either way it needs a Fur Products Labeling Act label naming the animal (\"Mink\") and the country of origin of the "
        "fur, and an FWS wildlife declaration (mink is not a domesticated animal under 50 CFR 14.4).",
    },
    {
        "title": "Raw mink and fox pelts from Canada, with a USMCA claim",
        "line": "4301.60.60.00",
        "body": "Ranch-raised Canadian mink (4301.10.00.20) is Free and, with a USMCA claim, exempt from Canada's 10% Section 301 "
        "duty (9903.05.93): **$0** on a $50,000 lot. Raw fox other than silver, black or platinum fox (4301.60.60) is on the "
        "Section 338 list in U.S. note 51(b)(1) since September 15, 2026, and that 50% (9903.03.12) applies even with USMCA: "
        "**$10,000** on $20,000 of pelts. Both need FWS Form 3-177 and a designated or Canadian border port (50 CFR 14.16).",
    },
    {
        "title": "Tanned sheepskins from Brazil: undyed vs dyed",
        "line": "4302.19.60.00",
        "body": "Other tanned furskins, not dyed (4302.19.60, 3.5%), are on Brazil's exemption list in U.S. note 50(a)(ii) "
        "(9903.05.03), so only the 12.5% 2026 Section 301 duty is added: **16%, $1,600** on $10,000. The same skins dyed "
        "(4302.19.75, 1.7%) are not on the list and pay 1.7% + 25% (9903.05.01) + 12.5% (9903.05.27) = **39.2%, $3,920**.",
    },
    {
        "title": "A faux fur throw from China: Chapter 43 or not?",
        "line": "4304.00.00.00",
        "body": "Only \"artificial fur\" — fibres gummed or sewn onto a backing — is heading 4304 (6.5%); from China it pays 6.5% + "
        "25% (List 3) + 12.5% = **44%**, $4,400 on $10,000. Imitation fur made by knitting or weaving is excluded by chapter note "
        "5: the fabric is 6001 or 5801, and CBP classed coats of acrylic pile fake fur in chapter 62 (ruling 897570), so the rate "
        "follows that chapter instead. Get a ruling before ordering.",
    },
]

ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in d["understandIndustry"]["byCountry"][:5]]
ts["biggestLines"] = [
    {"hts": "4303.10", "label": "Fur apparel and clothing accessories"},
    {"hts": "4303.90", "label": "Other articles of furskin"},
    {"hts": "4302.19", "label": "Tanned furskins other than mink"},
    {"hts": "4301.10", "label": "Raw mink"},
]
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level; the statistical lines (e.g. mink vs other fur coats, seal vs sable pelts) are not split further."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** Throughout the tariff schedule references to \"furskins\", other than to raw furskins of heading 4301, apply to "
    "hides or skins of all animals which have been tanned or dressed with the hair or wool on.\n\n"
    "**Note 2.** This chapter does not cover: (a) birdskins or parts of birdskins, with their feathers or down (heading 0505 or "
    "6701); (b) raw hides or skins, with the hair or wool on, of chapter 41 (see note 1(c) to that chapter); (c) gloves, mittens "
    "and mitts consisting of leather and furskin or of leather and artificial fur (heading 4203); (d) articles of chapter 64; "
    "(e) headgear or parts thereof of chapter 65; or (f) articles of chapter 95 (for example, toys, games, sports equipment).\n\n"
    "**Note 3.** Heading 4303 includes furskins and parts thereof, assembled with the addition of other materials, and furskins "
    "and parts thereof, sewn together in the form of garments or parts or accessories of garments or in the form of other "
    "articles.\n\n"
    "**Note 4.** Articles of apparel and clothing accessories (except those excluded by note 2) lined with furskin or artificial "
    "fur or to which furskin or artificial fur is attached on the outside except as mere trimming are to be classified in "
    "heading 4303 or 4304 as the case may be.\n\n"
    "**Note 5.** Throughout the tariff schedule the expression \"artificial fur\" means any imitation of furskin consisting of "
    "wool, hair or other fibers gummed or sewn on to leather, woven fabric or other materials, but does not include imitation "
    "furskins obtained by weaving or knitting (generally, heading 5801 or 6001)."
)
ov["notes"]["additionalUsNotes"] = None

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 43 Tariff Updates: Furskins, Fur Apparel & Artificial Fur (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 43 Tariff Updates 2026: Fur & Artificial Fur — Section 301, Canada 338, IEEPA & Section 122 End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 43 (raw and tanned furskins, fur coats, artificial fur) since January 2025: unchanged base "
    "rates, the end of the IEEPA tariffs and the Section 122 surcharge, the 2026 Section 301 tariffs, Canada's 50% Section 338 "
    "duty on fur, Brazil's 25% and the end of de minimis."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 43 tariff updates",
    "furskins and artificial fur tariff 2026",
    "section 122 global surcharge on furskins",
    "china artificial fur import duty",
    "usmca canadian furskin tariff exemptions",
    "italy tariff on furskins and artificial fur",
    "2026 artificial fur customs duty updates",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 39 Chapter 43 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 "
    "surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section 301 "
    "tariff of 10% or 12.5%** — or 10% in total for EU goods — and no Chapter 43 line is on an exemption list. China keeps its "
    "2018–2019 Section 301 duties, Brazil pays another 25% on 38 of 39 lines, and **Canada pays 50%** under Section 338 on 11 "
    "lines (fur apparel and fur pieces since August 22, raw fox and tanned furskins since September 15), USMCA claim or not. The "
    "$800 de minimis exemption stays suspended, so small fur and faux-fur parcels pay full duty. The import bans on dog and cat "
    "fur and marine-mammal furs are unchanged."
)
tu["scope"] = (
    "Measures that reach Chapter 43 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff "
    "and its exemption list, China Section 301 Lists 3 and 4A, the Canada Section 338 duty, the Russia column 2 and note 30 rates, "
    "the Nicaragua Section 301 phase-in, the 2025–2026 IEEPA and Section 122 duties that have ended, and the suspension of de "
    "minimis. Standing import bans (dog and cat fur, marine mammals, CITES/ESA species) did not change in this period and are "
    "covered under Import documents. No antidumping or countervailing duty order and no Section 232 action covers a Chapter 43 "
    "line. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "39 of 39 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (2026, Brazil, China), Canada Section 338, Russia note 30"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "eu": (
        "For EU goods whose base rate is under 10%, the total is 10% (9903.05.39) — every Chapter 43 base rate is under 10%, so "
        "Italian, French, Greek, Finnish and Danish fur pays 10% of value on every line, including the Free raw furskins. "
        + NO_LIST + " This replaced the 15% IEEPA reciprocal rate (9903.02.20), which ended February 24, 2026; the 10% Section "
        "122 surcharge expired July 23, 2026.",
        "An Italian fur coat (4%) or French artificial-fur article (6.5%) pays 10% in total; raw mink or fox pelts from Finland or "
        "Denmark pay 10% instead of Free.",
    ),
    "tr": (
        NO_LIST + " " + ENDED,
        "Turkish fur and shearling coats pay 4% + 12.5% = 16.5%; tanned furskins pay their base rate plus 12.5%.",
    ),
    "ca": (
        "Two duties. Section 301 (+10%, 9903.05.29) is lifted for USMCA-qualifying goods (9903.05.93). The Section 338 duty of "
        "50% applies even when USMCA is claimed (U.S. note 51(a)) on 11 lines: since August 22, 2026 fur apparel and clothing "
        "accessories (4303.10) and raw heads, tails, paws and pieces (4301.90) under note 51(b)(3) (9903.03.14, Proclamation "
        "11048); since September 15, 2026 raw fox other than silver, black or platinum fox (4301.60.60), tanned beaver, fox, "
        "raccoon, sable and similar furskins (4302.19.30, 4302.19.45) and other tanned furskins not dyed (4302.19.60) under note "
        "51(b)(1) (9903.03.12, added by Proclamation 11064). Raw mink, raw lamb and other raw whole furskins are not on the "
        "list. No Chapter 43 line is on the September 29, 2026 import-ban annexes. The 35% IEEPA duty ended February 24, 2026.",
        "USMCA-qualifying Canadian raw mink, beaver, sable and other raw pelts pay $0; Canadian fur coats, raw fox and most "
        "tanned furskins pay 50% even with USMCA, and 60% or more without it.",
    ),
    "cn": (
        "Three Section 301 duties reach Chapter 43. List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers all of headings "
        "4302, 4303 and 4304; List 4A (+7.5%, 9903.88.15, since February 14, 2020) covers raw mink (4301.10), raw fox (4301.60) "
        "and other raw whole furskins (4301.80.02). Raw lamb (4301.30) and raw pieces (4301.90) are on List 4B, which is "
        "suspended. The 2026 action adds +12.5% (9903.05.31) on every line, and no China exclusion names a Chapter 43 product. "
        "USTR confirmed on October 7, 2026 that the 2018 actions continue. The IEEPA duties on China ended February 24, 2026.",
        "A Chinese fur coat pays 41.5% (4% + 25% + 12.5%), artificial fur 44%, tanned furskins 39%–43.1%, raw mink or fox 20% "
        "(silver fox 25.1%) and raw lamb or pieces 12.5%.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). Brazil's exemption list in U.S. note 50(a)(ii) (9903.05.03) includes one Chapter 43 line: other tanned "
        "furskins, not dyed (4302.19.60), which pays only the 12.5%. " + NO_LIST + " The 40% IEEPA duty on Brazil ended "
        "February 24, 2026.",
        "Undyed tanned furskins such as sheepskins (4302.19.60) pay 3.5% + 12.5% = 16%; dyed ones and every other Brazilian "
        "Chapter 43 line pay the base rate plus 37.5%.",
    ),
    "vn": (
        NO_LIST + " " + ENDED,
        "Vietnamese fur apparel pays 4% + 12.5% = 16.5%; artificial fur 19%.",
    ),
    "in": (
        NO_LIST + " GSP (SPI A, A*, A+), printed on the dutiable lines, has been expired since December 31, 2020. " + ENDED,
        "Indian fur and shearling apparel pays 4% + 10% = 14%; other articles of furskin (4303.90) pay 10%.",
    ),
    "co": (
        "The U.S.–Colombia TPA (SPI CO) makes every Chapter 43 base rate Free, but the 12.5% Section 301 duty still applies to FTA "
        "goods (U.S. note 52(a)). " + NO_LIST + " " + ENDED,
        "Colombian tanned furskins and fur apparel pay 12.5% of value with a TPA claim; without one, the base rate is added.",
    ),
    "hk": (
        "Hong Kong is a separate Section 301 economy (9903.05.43); the China lists (9903.88.xx) apply to goods of Chinese origin, "
        "which keep that origin when shipped through Hong Kong. " + NO_LIST + " " + ENDED,
        "Fur apparel made in Hong Kong pays 4% + 12.5% = 16.5%.",
    ),
    "ru": (
        "Russia has had column 2 rates since April 2022 (Pub. L. 117-110): Free to 74% on Chapter 43. Heading 9903.90.08 (U.S. "
        "note 30) replaces the 25% column 2 rate on 4302.19.30 (tanned beaver, fox, raccoon, sable and similar furskins, not "
        "dyed) with 35%. Since July 24, 2026 the 12.5% Section 301 duty (9903.05.66) is added on every line. UN Comtrade shows no "
        "U.S. imports of Chapter 43 goods from Russia in 2020–2025.",
        "Undyed Russian sable or fox skins pay 35% + 12.5% = 47.5%; a Russian fur coat pays 50% + 12.5% = 62.5%.",
    ),
    "other": (
        NO_LIST + " Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10% in total when the base rate is lower; "
        "Mexico's USMCA-qualifying goods are exempt (9903.05.94). FTA claims (Peru, Chile, Korea, Australia, Israel and others) "
        "remove the base rate but not this duty (note 52(a)). " + ENDED,
        "Peruvian, Philippine or New Zealand fur goods pay their base rate plus 10% or 12.5%. Countries outside the 60 economies, "
        "such as Mongolia or Ukraine, pay only the base rate.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = IE[key]
    if key == "eu":
        e["country"] = "European Union (Italy, France, Greece, Finland, Denmark and other members)"
    if key == "ca":
        e["now"] = "+50% on 11 lines even with USMCA; +10% (non-USMCA) on the rest"
        e["effectiveSourceId"] = "procl-11064"
    if key == "cn":
        e["now"] = "+37.5% (headings 4302–4304), +20% (most raw furskins) or +12.5%"
    if key == "br":
        e["now"] = "+37.5% (+12.5% on 4302.19.60)"
    if key == "ru":
        e["now"] = "Column 2 rate +12.5%; 35% in place of column 2 on 4302.19.30, +12.5%"
        if "pl-117-110" not in e["sourceIds"]:
            e["sourceIds"].insert(-1, "pl-117-110")
    if key == "other":
        e["country"] = "Other Section 301 economies (49, incl. Peru, Philippines, New Zealand, South Korea, Japan, Mexico, Pakistan)"
        e["now"] = "+10% or +12.5% (10% or 12.5% in total for Japan, South Korea, Switzerland, Taiwan)"
    if key in ("in",) and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")
    if key != "ru" and "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")
    if key == "ca":
        for sid in ("procl-11061", "procl-11062", "procl-11063"):
            if sid not in e["sourceIds"]:
                e["sourceIds"].insert(-1, sid)

add_sources(tu, [
    "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "eo-14193", "eo-14195", "eo-14257",
    "eo-14323", "eo-14325", "ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "procl-11061", "procl-11062", "procl-11063",
    "pl-117-110", "eo-14324", "eo-14388", "fr-2026-12670",
])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 43 base-rate changes",
        "detail": "All 39 Chapter 43 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
        "Edition; no line was added, split or renumbered.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 Lists 3 and 4A continue",
        "detail": "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
        "review. For Chapter 43 this keeps +25% (9903.88.03) on all tanned furskins, fur apparel and articles and artificial fur "
        "(headings 4302–4304), and +7.5% (9903.88.15) on raw mink, fox and other raw whole furskins.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-ban", "type": "reference", "date": "2026-09-29", "dateLabel": "Effective",
        "title": "Canadian import bans do not reach Chapter 43",
        "detail": "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
        "from September 29, 2026. No Chapter 43 line is on their annexes, so the 11 lines on the Section 338 list keep paying the "
        "50% duty.",
        "before": None, "now": None, "countries": "Canada", "sourceIds": ["procl-11061", "procl-11062", "procl-11063", "hts-now"],
    },
    {
        "id": "ca-338-b1", "type": "extraDuty", "date": "2026-09-15", "dateLabel": "Effective",
        "title": "Canada Section 338 duty extended to raw fox and tanned furskins",
        "detail": "Proclamation 11064 added products to the 9903.03.12 list (U.S. note 51(b)(1)) from September 15, 2026, among them "
        "raw fox other than silver, black or platinum fox (4301.60.60), tanned beaver, fox, raccoon, sable and similar furskins, "
        "not dyed and dyed (4302.19.30, 4302.19.45), and other tanned furskins, not dyed (4302.19.60). The 50% duty applies even "
        "when USMCA is claimed and is added to the 10% Section 301 duty on non-USMCA goods.",
        "before": "None", "now": "+50%", "countries": "Canada",
        "sourceIds": ["procl-11064", "procl-11046", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ca-338-b3", "type": "extraDuty", "date": "2026-08-22", "dateLabel": "Effective",
        "title": "Canada Section 338 duty of 50% on fur apparel and raw fur pieces",
        "detail": "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which "
        "include articles of fur apparel and clothing accessories (4303.10) and raw heads, tails, paws and other pieces (4301.90). "
        "It is charged even when USMCA is claimed. Planned for August 19, it took effect August 22 after a 3-day suspension "
        "(Proclamation 11056); Proclamation 11065 kept both lines on the list from September 15.",
        "before": "None", "now": "+50%", "countries": "Canada",
        "sourceIds": ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies cover all 39 Chapter 43 lines",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 43 line is on the general "
        "exemption list (U.S. note 52(b)) or on any country exception list (note 52(j)). EU goods pay 10% in total, and Japan, "
        "South Korea, Switzerland and Taiwan pay 12.5% or 10% in total. USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). "
        "FTA claims remove the base rate but not this duty.",
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
        "detail": "25% on all goods of Brazil (9903.05.01). One Chapter 43 line is on the exemption list in U.S. note 50(a)(ii) "
        "(9903.05.03): other tanned furskins, not dyed (4302.19.60). From July 24 the 12.5% 2026 action (9903.05.27) is added on "
        "top on every line.",
        "before": "None", "now": "+25%", "countries": "Brazil", "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
        "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "de-minimis", "type": "reference", "date": "2026-06-24", "dateLabel": "Effective",
        "title": "De minimis suspension made indefinite",
        "detail": "The $800 duty-free de minimis exemption (19 U.S.C. 1321) has been suspended for all countries since August 29, "
        "2025 (Executive Order 14324). Executive Order 14388 kept the suspension after the IEEPA ruling, and CBP's interim final "
        "rule of June 24, 2026 suspended it indefinitely for all modes other than the postal network (19 CFR 10.151(b)). A "
        "low-value parcel of fur accessories or faux-fur goods therefore needs an entry and pays the full duty.",
        "before": "Free under $800", "now": "Full duty, any value", "countries": "All",
        "sourceIds": ["eo-14324", "eo-14388", "fr-2026-12670"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 43 line was on the product exemption "
        "list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
        "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
        "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
        "printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "agoa-renewed", "type": "reference", "date": "2026-02-03", "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA "
        "(SPI D) makes every dutiable Chapter 43 line Free for eligible sub-Saharan countries; it does not lift a Section 301 "
        "duty. GSP (SPI A, A*, A+), printed on the dutiable lines, remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)", "now": "In force to December 31, 2026", "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-12", "dateLabel": "Published",
        "title": "Nicaragua Section 301 tariff phases in from 2027",
        "detail": "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% "
        "in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 43 line.",
        "before": "None", "now": "0% in 2026 → 10% (2027) → 15% (2028)", "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "de-minimis-suspended", "type": "reference", "date": "2025-08-29", "dateLabel": "Effective",
        "title": "De minimis exemption suspended for all countries",
        "detail": "Executive Order 14324 ended duty-free entry for shipments valued at $800 or less from every country, effective for "
        "goods entered from August 29, 2025. Direct-to-consumer shipments of fur and faux-fur goods have paid duty since then.",
        "before": "Free under $800", "now": "Dutiable", "countries": "All", "sourceIds": ["eo-14324"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "br-ieepa", "type": "extraDuty", "date": "2025-07-30", "dateLabel": "Signed",
        "title": "Additional 40% duty on products of Brazil",
        "detail": "Added +40% on most Brazilian goods on top of the reciprocal 10%; no Chapter 43 line was excepted. Ended February 24, "
        "2026.",
        "before": "None", "now": "+40% (ended)", "countries": "Brazil", "sourceIds": ["eo-14323"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) and country rates (9903.02.xx), such as 15% in total for EU goods from August 2025; "
        "Canada and Mexico excluded. Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "cn-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of China",
        "detail": "+10% on all Chinese goods (9903.01.20), later raised to 20% and cut back to 10%, on top of the Section 301 duties. "
        "Ended February 24, 2026.",
        "before": "None", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14195"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods, such as Canadian ranch mink, "
        "were exempt (9903.01.14). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---------------------------------------------------------------- understand industry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 43: Fur & Artificial Fur — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "HTS Chapter 43 Import Statistics: Fur Coats, Raw Mink & Artificial Fur Imports by Country | KoalaGains"
ui["seo"]["shortDescription"] = (
    "U.S. imports of furskins, fur apparel and artificial fur 2020–2025, by country, product and year: $166M in 2025, up 13.4%; "
    "Italy supplied 27%, Türkiye 14% and Canada 11%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 43 import statistics",
    "fur imports",
    "us fur trade",
    "fur coat imports by country",
    "raw mink imports from Canada",
    "artificial fur imports from China",
]
for c in ui["byCountry"]:
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][0]
for s in ui["stats"]:
    if s["label"].startswith("Top 2 share"):
        s["value"] = "40%"
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    "U.S. imports of Chapter 43 goods rose from **$146M in 2024 to $166M in 2025** (+13.4%), but stay below the 2022 peak of "
    "$214M. Finished goods dominate: **articles of furskin (heading 4303) were $123M, 74%** — fur apparel and accessories "
    "$78.5M (+14%) and other articles such as blankets and rugs $44.4M (+29%). Tanned furskins were $21.3M, raw furskins $17.2M "
    "(raw mink $14.4M) and artificial fur $4.7M (+32%).\n\n"
    "**Italy supplied $44.1M (27%, +38%)**, almost all of it fur apparel and articles, followed by Türkiye ($23.1M, +28%) and "
    "France ($10.9M, +24%). **Canada ($19.0M, −11%)** is the raw-fur supplier — $15.4M of its shipments, 89% of all U.S. raw "
    "furskin imports, are pelts — and has fallen from $35.0M in 2020. China shrank 29% to $11.7M but still ships almost half of the "
    "artificial fur; Brazil ($11.4M) mostly sends tanned furskins; Vietnam tripled to $4.8M.\n\n"
    "Through 2025 USMCA-qualifying Canadian pelts paid no extra duty, while most other suppliers paid the IEEPA reciprocal tariff "
    "from April 2025. Those duties ended on February 24, 2026; since July 24, 2026 EU goods pay 10% in total and most others a "
    "Section 301 tariff of 10% or 12.5%, and since August–September 2026 Canada's fur apparel, raw fox and tanned furskins pay a "
    "50% Section 338 duty. 2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

# ---------------------------------------------------------------- industry areas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 43 Tariff Rates by Country: Furskins, Fur Apparel & Artificial Fur"
ia["seo"]["title"] = "HTS Chapter 43 Import Duty Rates by Country: Italy, Türkiye, Canada, China, Brazil — Fur & Faux Fur | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on raw mink and fox pelts, tanned furskins, fur coats and artificial fur by country: base rate plus "
    "the 2026 Section 301 duty, China's List 3 and 4A, Brazil's 25% and Canada's 50% Section 338 duty, with USMCA, EU and FTA "
    "rules applied."
)
ia["seo"]["keywords"] = [
    "import duty on raw mink pelts",
    "tanned furskins tariff rates",
    "artificial fur import duty",
    "fox furskins customs duty",
    "italian artificial fur import rates",
    "china tariff on raw mink and fox furskins",
    "canada section 338 tariff fur",
]
ia["intro"] = (
    "The total rate on Chapter 43 goods depends far more on **where they come from** than on what they are: base rates run "
    "only from Free to 6.5%. Each cell below is the base rate for that product group plus the extra duty for that country, minus "
    "any preference — computed from the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026), and **no Chapter 43 line is exempt** from it. **EU fur pays 10% in total**, Türkiye and Vietnam add "
    "12.5%, **China pays up to 44%** and **Brazil up to 43.1%**. **Canada is the exception**: USMCA raw pelts enter free, but a "
    "50% Section 338 duty on fur apparel, raw fox and tanned furskins applies even to USMCA goods."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

EU_LABEL = "EU: 10% in total in place of the base rate (9903.05.39) on all 39 lines, since every Chapter 43 base rate is under 10% — raw furskins pay 10% instead of Free. The 15% IEEPA rate ended February 24, 2026."
RULE_LABELS = {
    "Italy": EU_LABEL,
    "France": EU_LABEL,
    "Greece": EU_LABEL,
    "Finland": EU_LABEL,
    "Denmark": EU_LABEL,
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on all 39 lines; no exemption list covers Chapter 43. The IEEPA duties ended February 24, 2026.",
    "Canada": "USMCA-qualifying: Free and no Section 301 duty (9903.05.93), but 50% Section 338 even with USMCA on 11 lines — fur apparel and raw pieces (9903.03.14) and raw fox and tanned furskins (9903.03.12). Otherwise the base rate plus 10% (9903.05.29), and 50% more on those 11 lines.",
    "China": "Base rate plus 12.5% (9903.05.31) on every line, plus 25% List 3 (9903.88.03) on headings 4302–4304 or 7.5% List 4A (9903.88.15) on raw mink, fox and other whole furskins: 41.5% on fur apparel, 44% on artificial fur, 20% on raw mink.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on 38 lines; other tanned furskins, not dyed (4302.19.60), are exempt from the 25% (note 50(a)(ii), 9903.05.03) and pay 16%.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on all 39 lines; no exemption list covers Chapter 43.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on all 39 lines. GSP has expired; the IEEPA duties ended February 24, 2026.",
    "Colombia": "The TPA (CO) makes the base rate Free, but 12.5% Section 301 (9903.05.32) still applies on all 39 lines (note 52(a)).",
    "Hong Kong": "Base rate plus 12.5% Section 301 (9903.05.43) on all 39 lines; the China Section 301 lists apply only to goods of Chinese origin.",
    "Russia": "Column 2 rates (Free to 74%) plus 12.5% Section 301 (9903.05.66); 35% in place of the column 2 rate on 4302.19.30 (9903.90.08, U.S. note 30). No U.S. imports from Russia in 2020–2025.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies, such as Mongolia or Ukraine) to the base rate plus 12.5% (9903.05.20–9903.05.83); no Chapter 43 line is on a Section 301 exemption or country exception list. Column 2 countries are not included.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    if c["country"] != "Russia" and "eo-14389" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].insert(-1, "eo-14389")
    if c["country"] == "India":
        c["rule"]["sourceIds"].insert(-1, "cbp-gsp")
    if c["country"] == "Russia" and "pl-117-110" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].insert(-1, "pl-117-110")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Canada: the 50% Section 338 duty (U.S. note 51) applies whether or not USMCA is claimed, from August 22, 2026 on 4301.90 and "
    "4303.10 and from September 15, 2026 on 4301.60.60, 4302.19.30, 4302.19.45 and 4302.19.60; no Chapter 43 line is on the "
    "September 29, 2026 import-ban annexes.",
    "Brazil: the exemption of 4302.19.60 from the 25% duty (U.S. note 50(a)(ii)) is applied.",
    "Russia is shown at column 2 rates (Pub. L. 117-110) with heading 9903.90.08 on 4302.19.30; UN Comtrade reports no U.S. "
    "imports of Chapter 43 goods from Russia in 2020–2025.",
    "Not in the grid: whether the goods may enter at all — the ban on dog and cat fur (19 U.S.C. 1308), the Marine Mammal "
    "Protection Act ban on seal and other marine-mammal furs, CITES and ESA permits — and the FWS declaration and inspection "
    "fees and Fur Products Labeling Act labels (see Import documents).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) and the "
    "note 52(j) country lists (including the CAFTA-DR lists for Guatemala and El Salvador) name no Chapter 43 code. Note 50(a)(ii) "
    "(9903.05.03) lists 4302.19.60 — the only Chapter 43 code exempt from the Brazil duty. Note 51(b)(1) lists 4301.60.60, "
    "4302.19.30, 4302.19.45 and 4302.19.60 and note 51(b)(3) lists 4301.90.00 and 4303.10.00 for the Canada Section 338 duty. Note "
    "20 puts headings 4302–4304 on China List 3 and 4301.10, 4301.60.30, 4301.60.60 and 4301.80.02 on List 4A; 4301.30 and "
    "4301.90 are on the suspended List 4B, and no China exclusion names a Chapter 43 product. Note 30(b) lists 4302.19.30 for "
    "Russia (9903.90.08). The Section 122 exemption list (9903.03.03) named no Chapter 43 code. The temporary duty suspension "
    "for furskin belts (9902.12.65) expired December 31, 2020. No Section 232 heading and no antidumping or countervailing duty "
    "order covers a Chapter 43 line."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "cbp-gsp", "pl-117-110", "procl-11061", "procl-11062", "procl-11063"])

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Fur into the U.S. (HTS Ch. 43): Bans, FWS & CITES Rules, Fur Labeling and Ways to Lower Duty"
te["seo"]["title"] = "Importing Fur & Faux Fur: Dog/Cat Fur Ban, Seal (MMPA), CITES, FWS Form 3-177, Fur Labeling Act | KoalaGains"
te["seo"]["shortDescription"] = (
    "The federal rules for each HTS Chapter 43 line — the dog and cat fur ban, the Marine Mammal Protection Act ban on seal fur, "
    "CITES and ESA permits, the FWS wildlife declaration and designated ports, Fur Products Labeling Act labels — and the legal "
    "ways to pay less: USMCA, FTAs, Chapter 98 assembly, rulings and drawback."
)
te["seo"]["keywords"] = [
    "dog and cat protection act",
    "is seal fur legal in the us",
    "fur products labeling act",
    "form 3-177 fur",
    "cites fur",
    "usmca origin rules fur",
    "9802.00.80 fur trim assembled abroad",
]
te["intro"] = (
    "For fur, **whether a shipment may enter matters more than the duty**. Dog and cat fur is banned outright (19 U.S.C. 1308). "
    "Seal, sea otter, walrus, polar bear and other marine-mammal furs may not be imported without a Marine Mammal Protection Act "
    "permit or exception. Furs of CITES-listed or endangered species — spotted cats, lynx, otters, wolves and others — need "
    "CITES documents and, for endangered species, an ESA permit. Every wild-species fur, including ranch mink and fox, needs a "
    "Fish and Wildlife Service declaration (Form 3-177) at a designated port; sheep, lamb, European rabbit and other domesticated "
    "animals are exempt. Fur garments must carry a Fur Products Labeling Act label naming the animal and the fur's country of "
    "origin, and furs must be invoiced the same way.\n\n"
    "The ways to pay less are in the schedule: claim **USMCA** on Canadian or Mexican furs (it does not lift Canada's 50% "
    "Section 338 duty on fur apparel, raw fox and tanned furskins), claim an **FTA or AGOA** rate where the base rate is the "
    "cost, use **9802.00.80** for U.S. furskins assembled abroad, get a **binding ruling** where the heading decides the rate "
    "(fur vs faux fur vs fur-trimmed textile), and claim **drawback** on re-exports."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on Canadian or Mexican furs",
        "saves": "The 10% Section 301 duty for Canada or Mexico plus the base rate (up to 6.5%)",
        "appliesTo": "All 39 lines, for goods that qualify as originating under USMCA — e.g. pelts of mink raised in Canada, furskins "
        "tanned there, or fur garments made there",
        "document": "A certification of origin from the importer, exporter or producer, in any format. Chapter 43 rules: raw "
        "furskins must change from another chapter (animals raised or trapped in the territory), tanning (4302) confers origin "
        "from any other heading, and making garments or articles (4303–4304) from furskins of any origin qualifies (General "
        "Note 11).",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on 4301.60.60, 4301.90, 4302.19.30, 4302.19.45, "
        "4302.19.60 and 4303.10 (U.S. note 51(a)). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 43 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA or AGOA rate where the base rate is the cost",
        "saves": "The base rate: 6.5% (artificial fur), 5.6% or 5.1% (silver fox), 5.3% (assembled plates), 4% (fur apparel), 1.5%–3.5% (tanned furskins)",
        "appliesTo": "The 21 dutiable lines, for goods of Colombia, Peru, Chile, Korea, Australia, Israel, Jordan, Morocco, Bahrain, "
        "Oman, Singapore, Panama, CAFTA-DR, CBERA countries and AGOA countries (through December 31, 2026)",
        "document": "Proof of origin under the agreement and the SPI on the entry line (CO, PE, CL, KR, AU, …, E for CBERA, D for AGOA).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)) — a Colombian fur coat still pays 12.5%. GSP "
        "(A, A*, A+) has been expired since December 31, 2020, so a GSP claim pays the general rate.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
            {"label": "CBP: GSP status", "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"},
        ],
    },
    {
        "id": "assembly",
        "title": "Assemble U.S. furskins abroad under 9802.00.80",
        "saves": "Duty on the value of the U.S.-made fur components (e.g. a fur ruff or lining cut and sewn in the U.S.)",
        "appliesTo": "Fur pieces, trims and linings fabricated in the U.S. and exported ready for assembly into garments, mainly 4302 "
        "and 4303 goods",
        "document": "A 9802.00.80 claim with the foreign assembler's declaration and the importer's endorsement (19 CFR 10.24), "
        "identifying the U.S. components and their value. CBP ruling N077981 allowed it for U.S.-origin fur ruffs buttoned onto "
        "coats abroad.",
        "caveat": "The components must be exported ready for assembly without further fabrication and must not be advanced in value "
        "abroad except by assembly. Duty is still owed on the rest of the article's value; for Canadian goods the Section 338 duty "
        "applies to the value assembled abroad (note 51(a)).",
        "citations": [
            {"label": "HTSUS 9802.00.80 (Chapter 98)", "url": CH98},
            {"label": "19 CFR 10.11–10.24", "url": ecfr(19, "10.11")},
            {"label": "CBP ruling N077981 (U.S. fur trim, 9802.00.80)", "url": "https://rulings.cbp.gov/ruling/N077981"},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the heading decides the rate: fur apparel (4303.10, 4%) vs a textile garment with fur trim "
        "(chapters 61–62), artificial fur (4304, 6.5%) vs knitted or woven faux fur (6001, 5801, chapters 61–63), fur hats "
        "(chapter 65) and fur-and-leather gloves (4203)",
        "appliesTo": "Garments and accessories that combine fur with textiles or leather, faux fur goods, and shearling",
        "document": "A ruling request to CBP describing the product, its materials and construction (19 CFR part 177). Published "
        "rulings such as N277695 (shearling coat, 4303.10), 897570 (acrylic-pile fake fur coats, chapter 62) and N146216 (fox and "
        "raccoon fur hats, 6506.99.30) show how CBP decides.",
        "caveat": "Rulings apply to the transaction described; chapter note 4 sends fur-lined garments, or garments with fur on the "
        "outside other than mere trimming, to 4303.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr(19, "177", "part")},
            {"label": "CBP ruling N277695 (shearling coat, 4303.10)", "url": "https://rulings.cbp.gov/ruling/N277695"},
            {"label": "CBP ruling 897570 (fake fur coats, 6202)", "url": "https://rulings.cbp.gov/ruling/897570"},
            {"label": "HTSUS Chapter 43 notes", "url": CH43},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the goods, or what they are made into, are exported",
        "saves": "Up to 99% of the duties paid, including Section 301 and Section 338 duties, on imported furs re-exported or made into exported goods",
        "appliesTo": "All lines, e.g. tanned furskins made into garments that are exported, or pelts re-exported unused",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr(19, "190", "part")}],
    },
]
te["rules"] = [
    {
        "id": "dog-cat",
        "agency": "CBP",
        "title": "Ban: no import or export of any product containing dog fur (Canis familiaris) or cat fur (Felis catus) — civil penalties up to $10,000 per violation, forfeiture and debarment",
        "citations": [
            {"label": "19 U.S.C. 1308", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title19/html/USCODE-2024-title19-chap4-subtitleII-partI-sec1308.htm"},
            {"label": "Pub. L. 106-476, sec. 1443", "url": "https://www.govinfo.gov/content/pkg/PLAW-106publ476/pdf/PLAW-106publ476.pdf"},
        ],
    },
    {
        "id": "mmpa",
        "agency": "NOAA Fisheries / FWS",
        "title": "Ban: no import of marine mammals or marine-mammal products — seal, sea lion, sea otter, walrus, polar bear furs — except under an MMPA permit or exception; fur-seal and sea-otter skins taken contrary to the Fur Seal Act are prohibited",
        "citations": [
            {"label": "16 U.S.C. 1372", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap31-subchapII-sec1372.htm"},
            {"label": "50 CFR 216.12 (NOAA species)", "url": ecfr(50, "216.12")},
            {"label": "50 CFR 18.12 (FWS species)", "url": ecfr(50, "18.12")},
            {"label": "19 CFR 12.60–12.63 (fur seal, sea otter)", "url": ecfr(19, "12.60")},
            {"label": "NOAA Fisheries: Marine Mammal Protection Act", "url": "https://www.fisheries.noaa.gov/national/marine-mammal-protection/marine-mammal-protection-act"},
        ],
    },
    {
        "id": "cites-esa",
        "agency": "FWS",
        "title": "CITES and ESA: furs of CITES-listed species (e.g. spotted cats, lynx, otters, wolves) need CITES export or re-export documents; Appendix I and ESA-endangered species need U.S. permits and cannot be imported for primarily commercial purposes",
        "citations": [
            {"label": "50 CFR 23.13, 23.20", "url": ecfr(50, "23.20")},
            {"label": "50 CFR 23.35 (Appendix I import permits)", "url": ecfr(50, "23.35")},
            {"label": "50 CFR 17.21 (endangered wildlife)", "url": ecfr(50, "17.21")},
            {"label": "16 U.S.C. 1538", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap35-sec1538.htm"},
        ],
    },
    {
        "id": "fws-declaration",
        "agency": "FWS",
        "title": "Wildlife declaration (Form 3-177) and FWS clearance at a designated port (or a border port for Canadian-origin wildlife); commercial importers need an FWS license and pay inspection fees. Furs of domesticated animals (sheep, European rabbit, goat, cattle, alpaca) are exempt; ranch mink and fox are not",
        "citations": [
            {"label": "50 CFR 14.61 (Form 3-177)", "url": ecfr(50, "14.61")},
            {"label": "50 CFR 14.11–14.12 (designated ports)", "url": ecfr(50, "14.12")},
            {"label": "50 CFR 14.16 (border ports)", "url": ecfr(50, "14.16")},
            {"label": "50 CFR 14.4 (domesticated animals)", "url": ecfr(50, "14.4")},
            {"label": "50 CFR 14.91–14.94 (license, fees)", "url": ecfr(50, "14.94")},
        ],
    },
    {
        "id": "fpla",
        "agency": "FTC / CBP",
        "title": "Fur Products Labeling Act: fur apparel must carry a label with the animal name from the Fur Products Name Guide, the fur's country of origin, and whether it is dyed, used, or made of paws, tails, bellies or waste fur; furs and fur products must be invoiced the same way. Mislabeled imports must be relabeled under CBP supervision or redelivered",
        "citations": [
            {"label": "15 U.S.C. 69b", "url": "https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2-subchapIV-sec69b.htm"},
            {"label": "16 CFR part 301 (FTC rules, Name Guide)", "url": ecfr(16, "301", "part")},
            {"label": "19 CFR 11.12a (CBP labeling at entry)", "url": ecfr(19, "11.12a")},
            {"label": "19 CFR 141.89 (invoice data for furs)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "de-minimis",
        "agency": "CBP",
        "title": "No de minimis: every shipment, including low-value e-commerce parcels of fur or faux-fur goods, needs a formal or informal entry and pays duty",
        "citations": [
            {"label": "19 CFR 10.151(b)", "url": ecfr(19, "10.151")},
            {"label": "91 FR 37789 (CBP interim final rule, June 24, 2026)", "url": "https://www.federalregister.gov/documents/2026/06/24/2026-12670/indefinite-suspension-of-the-de-minimis-exemption-for-merchandise-arriving-through-all-modes-other"},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or its container",
        "citations": [{"label": "19 CFR part 134", "url": ecfr(19, "134", "part")}],
    },
]
GROUP_NOTES = {
    "4301": "Raw pelts of mink, fox, beaver, sable, lynx, raccoon and other wild species need FWS Form 3-177; lynx and other CITES species also need CITES documents, and seal pelts are banned without an MMPA permit or exception. Lamb and rabbit pelts are exempt from the FWS declaration.",
    "4302": "Tanned or dressed furs of wild species need FWS Form 3-177 and, for CITES species such as leopard, ocelot, lynx, otter or wolf, CITES documents. Furs must be invoiced under the Fur Products Labeling Act.",
    "4303": "Fur garments need a Fur Products Labeling Act label (animal name, fur origin, dyed) and, if made of wild-species fur, an FWS declaration. Dog and cat fur is banned; no de minimis entry.",
    "4304": "Artificial fur is not fur under the Fur Products Labeling Act, but goods sold as faux fur must not contain dog or cat fur. Country-of-origin marking applies; no de minimis entry.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    g["ruleIds"] = {
        "4301": ["fws-declaration", "cites-esa", "mmpa", "dog-cat", "cbp-marking"],
        "4302": ["fws-declaration", "cites-esa", "mmpa", "dog-cat", "fpla", "cbp-marking"],
        "4303": ["fpla", "fws-declaration", "cites-esa", "mmpa", "dog-cat", "de-minimis", "cbp-marking"],
        "4304": ["dog-cat", "de-minimis", "cbp-marking"],
    }[h]

DOMESTIC = ("4301.30", "4301.80.02.02", "4302.19.13")  # lamb, rabbit: domesticated (50 CFR 14.4)
CITES_LINES = ("4301.80.02.20", "4301.80.02.90", "4302.19.30", "4302.19.45", "4302.20.30")  # lynx/other; leopard, ocelot, otter, wolf named
for ln in te["lines"]:
    hts = ln["hts"]
    ids = []
    h = hts[:4]
    if h in ("4301", "4302", "4303") and not hts.startswith(DOMESTIC):
        ids.append("fws-declaration")
    if hts.startswith(CITES_LINES) or h == "4303":
        ids.append("cites-esa")
    if hts == "4301.80.02.80" or hts.startswith(("4301.80.02.90", "4302.19.60", "4302.19.75", "4302.20.60", "4302.20.90", "4303")):
        ids.append("mmpa")
    if h in ("4302", "4303"):
        ids.append("fpla")
    ids.append("dog-cat")
    if h in ("4303", "4304"):
        ids.append("de-minimis")
    ids.append("cbp-marking")
    ln["ruleIds"] = ids
    levers = ["usmca"]
    rt = next(r for r in ov["rateTable"]["rows"] if r["hts"] == hts)
    if rt["effectiveGeneral"] not in (None, "Free"):
        levers.append("fta")
    if h in ("4302", "4303"):
        levers.append("assembly")
    levers += ["ruling", "drawback"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Species listings under CITES and the "
    "ESA, FWS port and fee rules and state fur-sale laws change; check them before each shipment."
)

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 43 FAQ: Fur Coat & Faux Fur HS Codes, Import Bans and 2026 Duties"
fc["seo"]["title"] = "HTS Chapter 43 FAQ 2026: Fur Coat, Faux Fur & Shearling HS Codes, Seal and Dog/Cat Fur Bans, Fur Labeling | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about fur imports: HS codes 4303.10, 4304 and shearling, faux fur classification, whether "
    "mink, fox, seal and dog or cat fur can be imported, the Fur Products Labeling Act, FWS Form 3-177, and the 2026 tariffs on "
    "fur from China, Italy and Canada."
)
fc["seo"]["keywords"] = [
    "hs code 4303",
    "fur coat hs code",
    "faux fur hs code",
    "shearling hs code",
    "is fur legal in the us",
    "is seal fur legal in the us",
    "dog and cat protection act of 2000",
    "fur products labeling act",
    "form 3-177",
    "fur coats from china",
    "usmca compliant artificial fur imports",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing furskins, fur coats, shearling and faux fur into the U.S. — "
    "HS codes, which furs are banned, the labels and declarations required, and the 2026 tariffs by country. Each answer links "
    "to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 43 base rates are low — Free on 18 of 39 lines, 4% on fur apparel, 6.5% at most — and unchanged since January 2025. The extra duty by country and the entry rules decide the cost.",
    "Dog and cat fur is banned (19 U.S.C. 1308), seal and other marine-mammal furs need an MMPA permit or exception, and CITES- or ESA-listed species need permits. Wild-species furs, including ranch mink and fox, need FWS Form 3-177; fur garments need a Fur Products Labeling Act label.",
    "Since July 24, 2026 EU fur pays 10% in total and most other suppliers 10% or 12.5% more under Section 301; no Chapter 43 line is exempt.",
    "China pays up to 44% in total (List 3 + 12.5%), Brazil up to 43.1% (undyed tanned furskins exempt from its 25%), and Canada 50% under Section 338 on fur apparel, raw fox and tanned furskins even with USMCA. USMCA raw mink still enters free.",
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge July 23, 2026; the $800 de minimis exemption stays suspended.",
]
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "what-is-ch43",
        "question": "What does HTS Chapter 43 cover?",
        "searchedAs": ["hs code 4301", "hs code 4302", "hs code 4302.19", "hs code 4303", "hs code 4304"],
        "answer": "Furskins and artificial fur. Heading 4301 is raw furskins (mink, lamb, fox, rabbit, beaver, sable, seal and other pelts, plus pieces), 4302 tanned or dressed furskins — including sheepskins with the wool on — not yet made into articles, 4303 fur apparel, accessories and other articles of furskin, and 4304 artificial fur. The 39 lines are Free to 6.5%. Raw sheep skins with the wool on are chapter 41, fur hats chapter 65 and fur-and-leather gloves heading 4203.",
        "link": "",
    },
    {
        "id": "fur-coat",
        "question": "What is the HS code and duty for a fur coat?",
        "searchedAs": ["hs code 4303.10", "fur coat hs code", "fur jacket hs code", "mink coat hs code", "mink fur coat hs code", "fur coat tariff code"],
        "answer": "Fur coats, jackets, vests, stoles and other apparel and clothing accessories of furskin are 4303.10.00 — .30 for mink, .60 for other fur — at a 4% general rate. The total depends on origin: 10% from the EU, 16.5% from Türkiye or Vietnam, 41.5% from China, 41.5% from Brazil, and 50% from Canada even with a USMCA claim. A textile coat with only fur trim stays in chapters 61–62.",
        "link": "industry-areas",
    },
    {
        "id": "faux-fur",
        "question": "What is the HS code for faux fur?",
        "searchedAs": ["faux fur hs code", "artificial fur hs code", "synthetic fur hs code", "faux fur fabric hs code", "faux fur coat hs code", "faux fur tariff code"],
        "answer": "Only \"artificial fur\" — wool, hair or other fibres gummed or sewn onto leather, fabric or another backing — and articles of it are 4304.00.00 (6.5%). Faux fur made by knitting or weaving is excluded by chapter note 5: the fabric is 6001 (knitted pile) or 5801 (woven pile), and garments of it are classified in chapters 61 and 62 (CBP ruling 897570 put acrylic-pile fake fur coats in 6202). From China, 4304 goods pay 44% in total.",
        "link": "",
    },
    {
        "id": "shearling",
        "question": "What is the HS code for shearling and sheepskin coats and rugs?",
        "searchedAs": ["shearling hs code", "shearling coat hs code", "sheepskin coat hs code", "hs code for shearling jacket", "sheepskin rug hs code"],
        "answer": "Sheepskin tanned with the wool on is a furskin (chapter note 1). A shearling coat is 4303.10.00.60 at 4% (CBP ruling N277695); tanned sheepskins not yet made up are 4302.19 (3.5% undyed, 1.7% dyed; Persian, Caracul and similar lamb 2.2%), and rugs and other articles of furskin are 4303.90.00, Free. Raw sheepskins with the wool on are chapter 41. Sheep are a domesticated species, so no FWS declaration is needed.",
        "link": "",
    },
    {
        "id": "fur-blanket",
        "question": "What is the HS code for a fur blanket or throw?",
        "searchedAs": ["fur blanket hs code", "fur rug hs code", "faux fur throw hs code", "faux fur blanket hs code"],
        "answer": "Blankets, throws, rugs and other articles made of real furskin are 4303.90.00, Free at the general rate (from China 37.5%, from the EU 10%). Faux fur throws made of knitted or woven pile fabric are not chapter 43; they are textile blankets or throws — CBP classified a faux fur blanket in 6301.40 (8.5%, ruling N343153). Only articles of artificial fur — fibres gummed or sewn onto a backing — are 4304.",
        "link": "",
    },
    {
        "id": "fur-legal",
        "question": "Is it legal to import fur into the U.S.?",
        "searchedAs": ["is fur legal in the us", "is mink fur legal in the us", "is fox fur legal in us", "are fur coats illegal in the us", "is fur illegal"],
        "answer": "Yes for most furs, such as mink, fox, rabbit, sable or sheepskin, under federal law — but dog and cat fur is banned (19 U.S.C. 1308), seal and other marine-mammal furs need an MMPA permit or exception, and CITES- or ESA-listed species need permits. Wild-species furs, including ranch mink and fox, need FWS Form 3-177 at a designated port, and fur garments need a Fur Products Labeling Act label. Some states restrict retail fur sales; this page covers federal rules.",
        "link": "tariff-engineering",
    },
    {
        "id": "seal-fur",
        "question": "Is seal fur legal in the U.S.?",
        "searchedAs": ["is seal fur legal in the us", "is seal skin legal in the us", "are seal fur coats legal", "is seal fur illegal in us", "marine mammal protection act seals"],
        "answer": "Importing seal fur or sealskin is prohibited. The Marine Mammal Protection Act makes it unlawful to import any marine mammal or marine-mammal product — the FWS definition expressly includes raw, dressed or dyed fur or skin — except under an MMPA permit or exception (50 CFR 216.12, 18.12). The schedule still has a statistical line for raw seal furskins (4301.80.02.80), but that does not make imports lawful.",
        "link": "tariff-engineering",
    },
    {
        "id": "dog-cat",
        "question": "Is dog and cat fur banned in the U.S.?",
        "searchedAs": ["is dog fur illegal", "dog and cat protection act of 2000", "dog and cat fur protection act", "dog fur products"],
        "answer": "Yes. The Dog and Cat Protection Act of 2000 (19 U.S.C. 1308) bans importing, exporting, making or selling any product made wholly or partly of dog fur (Canis familiaris) or cat fur (Felis catus). Penalties run up to $10,000 per knowing violation, the goods are forfeited and repeat violators can be barred from the fur trade. The only exception is a deceased personal pet. The ban also covers goods sold as faux fur.",
        "link": "tariff-engineering",
    },
    {
        "id": "fpla",
        "question": "What does the Fur Products Labeling Act require?",
        "searchedAs": ["fur products labeling act", "fur products labeling act fpla", "fur labeling act"],
        "answer": "Every fur garment must carry a label giving the animal name from the FTC's Fur Products Name Guide, the country of origin of the fur, and whether the fur is dyed or otherwise colored, used, or made of paws, tails, bellies or waste fur, plus the maker's or seller's name or RN (15 U.S.C. 69b; 16 CFR part 301). Since the Truth in Fur Labeling Act the old small-value exemption is gone. CBP requires the same data on invoices and can order relabeling at entry (19 CFR 11.12a, 141.89).",
        "link": "tariff-engineering",
    },
    {
        "id": "form-3-177",
        "question": "Do fur imports need an FWS Form 3-177 or CITES permit?",
        "searchedAs": ["form 3-177", "fws form 3 177", "usfws form 3 177 instructions", "cites fur", "mink fur cites"],
        "answer": "Most do. FWS treats any wild species as wildlife even when ranch-raised, so mink, fox, sable, raccoon and other furs need a Form 3-177 declaration and clearance at a designated port (or a border port for Canadian-origin wildlife); commercial importers also need an FWS license and pay inspection fees. Lamb, sheep and European rabbit are domesticated and exempt. CITES documents are needed only for listed species such as lynx, otters, wolves and spotted cats.",
        "link": "tariff-engineering",
    },
    {
        "id": "travel",
        "question": "Can you travel to the U.S. with a fur coat?",
        "searchedAs": ["can you travel with fur coats", "traveling with fur coat", "flying fur coat"],
        "answer": "Yes. Wildlife products worn as clothing or carried in personal baggage and not intended for sale need no FWS declaration (50 CFR 14.62(b)(2)) — unless the species needs a CITES or ESA permit, and raw or dressed furs, as opposed to finished garments, still require Form 3-177. The bans still apply: a coat of seal, dog or cat fur, or of an ESA-endangered species, cannot be brought in.",
        "link": "tariff-engineering",
    },
    {
        "id": "china",
        "question": "What tariff applies to fur coats from China?",
        "searchedAs": ["fur coats from china", "mink coats from china", "real fur coats from china", "fur jacket from china", "faux fur coat china"],
        "answer": "41.5% on a fur coat: the 4% base rate, 25% under Section 301 List 3 (9903.88.03) and 12.5% under the 2026 Section 301 action (9903.05.31). Artificial fur goods pay 44%, tanned furskins 39%–43.1%, and most raw mink or fox pelts 20%. No exclusion covers Chapter 43, and USTR confirmed on October 7, 2026 that the List 3 and 4A duties continue. The IEEPA duties on China ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "italy",
        "question": "What duty do Italian fur and shearling coats pay?",
        "searchedAs": ["italian fur coat", "italy fur coat", "italian mink coat", "italian sheepskin coat"],
        "answer": "10% of value in total. Since July 24, 2026 EU goods whose base rate is under 10% pay 10% in place of the base rate (9903.05.39), and every Chapter 43 rate is under 10% — so a 4% Italian mink or shearling coat pays 10%, and even Free raw pelts pay 10%. Before that, EU goods paid 15% under IEEPA until February 24, 2026, then the 10% Section 122 surcharge to July 23. Italy supplied $44.1M, 27% of 2025 imports.",
        "link": "industry-areas",
    },
    {
        "id": "canada",
        "question": "Are there tariffs on fur from Canada?",
        "searchedAs": ["canadian fur", "canadian fur trade", "fur pelts canada", "mink canada"],
        "answer": "USMCA-qualifying raw mink, beaver, sable and other raw pelts enter free. But a 50% Section 338 duty applies even with USMCA to Canadian fur apparel and raw fur pieces (since August 22, 2026) and to raw fox other than silver, black or platinum fox and tanned furskins (since September 15, 2026). Without a USMCA claim, 10% Section 301 is added. Canada supplied $15.4M of the $17.2M of raw furskins imported in 2025.",
        "link": "tariff-updates",
    },
    {
        "id": "us-imports",
        "question": "How much fur does the U.S. import?",
        "searchedAs": ["fur imports", "fur industry", "is the fur industry declining", "us fur trade"],
        "answer": "$166M in 2025, up 13.4% from $146M in 2024 but below the 2022 peak of $214M. Articles of furskin were 74% ($123M: apparel $78.5M, other articles $44.4M), tanned furskins $21.3M, raw furskins $17.2M and artificial fur $4.7M. Italy supplied 27%, Türkiye 14%, Canada 11% and China 7%.",
        "link": "understand-industry",
    },
]

# measures.json carries a longer slug for Proclamation 11046; use the Federal Register's canonical URL.
CANON = {
    "procl-11046": "https://www.federalregister.gov/documents/2026/07/23/2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united",
}
for page in (tu, ia):
    for s_ in page["sources"]:
        if s_["id"] in CANON:
            s_["url"] = CANON[s_["id"]]

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
