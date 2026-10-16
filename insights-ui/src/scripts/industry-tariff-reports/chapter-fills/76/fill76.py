"""Fill the writer TODOs of the generated Chapter 76 (Aluminum and Articles Thereof) content file.

usage: python3 fill76.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 76 + Chapter 99 notes 2(aa), 16, 19, 20, 29, 30, 31, 35, 50, 51, 52),
the Section 232 aluminum proclamations (9704 ... 11021, 11032, 11045), the IEEPA / Section 122 documents, the Commerce
and ITC AD/CVD notices listed in sources76.py, eCFR title 19 (up to date as of 2026-10-08) and UN Comtrade.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources76 import CH76, CH99, EXTRA  # noqa: E402
from trade76 import apply_trade  # noqa: E402

ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
ECFR = "https://www.ecfr.gov/current/title-19"

d = json.load(open(sys.argv[1]))
d["chapter"]["title"] = "Aluminum and Articles Thereof"
d["asOf"] = ASOF

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}
assert len(LINE) == 124, len(LINE)

# ------------------------------------------------------------------ line sets (from the engine output)
ia = d["industryAreas"]
CTRY = {c["country"]: c for c in ia["countries"]}
ref = CTRY.get("India") or CTRY["Germany"]  # a plain additive country without an FTA claim
S50, S25 = set(), set()
for cell in ref["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if b["extra"] == "+50%":
            S50.update(b["lines"])
        elif b["extra"] == "+25%":
            S25.update(b["lines"])
NON232 = sorted(set(LINE) - S50 - S25)
SCRAP = {h for h in LINE if h.startswith("7602")}
S301 = set(NON232) - SCRAP
CA338 = {h for h in LINE if h.startswith("7604") or h.startswith("7608")}
ARTICLES = {h for h in S50 if h[:4] in ("7601", "7604", "7605", "7606", "7607", "7608", "7609") or h in ("7616.99.51.60", "7616.99.51.70")}
assert len(S50) == 92, len(S50)
assert len(S25) == 15, len(S25)
assert len(NON232) == 17, len(NON232)
assert len(S301) == 12, len(S301)
assert len(CA338) == 17, len(CA338)
assert len(ARTICLES) == 67, len(ARTICLES)
DERIV50 = S50 - ARTICLES

# ------------------------------------------------------------------ product groups
G = {
    "7601": ("Unwrought aluminum (ingot, billet, slab)", "Unwrought", "Primary and secondary aluminum in ingots, billets, sheet ingot (slab), foundry ingot, remelt scrap ingot and master alloys, non-alloyed or alloyed: 13 lines, Free to 2.6%. A Section 232 aluminum article: +50% from every country (UK 25% with UK-smelted or cast aluminum).", ["aluminum ingot", "P1020", "primary aluminum", "aluminum billet", "sheet ingot", "foundry alloy", "remelt scrap ingot", "aluminum vanadium master alloy"]),
    "7602": ("Aluminum waste and scrap", "Scrap", "Aluminum waste and scrap: used beverage cans, wheels, turnings and other industrial and recyclable scrap: 5 lines, all Free. Outside Section 232 and on the 2026 Section 301 exemption list, so only China (25%, List 3) and Brazil (25%) pay extra.", ["aluminum scrap", "UBC", "used beverage cans", "aluminum wheels scrap", "turnings", "taint tabor"]),
    "7603": ("Aluminum powders and flakes", "Powders", "Aluminum powders of non-lamellar structure and lamellar powders and flakes: 2 lines, 3.9% to 5%. Outside Section 232; they pay the 2026 Section 301 duty for most countries.", ["aluminum powder", "atomized aluminum", "aluminum flake", "aluminum paste pigment"]),
    "7604": ("Bars, rods and profiles (extrusions)", "Extrusions", "Aluminum bars, rods and extruded profiles, hollow or not, non-alloyed or alloyed: 13 lines, 1.5% to 5%. +50% Section 232; Canadian extrusions also pay the 50% Section 338 duty since September 15, 2026. Chinese extrusions are under AD/CVD orders.", ["aluminum extrusion", "aluminum profile", "6061 bar", "6063 profile", "aluminum rod", "hollow profile"]),
    "7605": ("Aluminum wire", "Wire", "Aluminum wire, including wire rod in coils and alloy wire: 4 lines, 2.6% to 4.2%. +50% Section 232.", ["aluminum wire", "aluminum wire rod", "EC grade rod", "alloy wire"]),
    "7606": ("Plates, sheets and strip (over 0.2 mm)", "Sheet & plate", "Aluminum plate, sheet and strip thicker than 0.2 mm, including can body and lid stock: 19 lines, 2.7% to 6.5%. +50% Section 232. Common alloy sheet from China and 16 other countries is under AD/CVD orders.", ["aluminum sheet", "aluminum plate", "aluminum coil", "can stock", "body stock", "5052 sheet", "6061 plate", "tread plate"]),
    "7607": ("Aluminum foil (0.2 mm or less)", "Foil", "Aluminum foil not over 0.2 mm, plain, rolled, backed or printed, including household foil and capacitor foil: 12 lines, Free to 5.8%. +50% Section 232. Foil from China, Armenia, Brazil, Oman, Russia and Türkiye is under AD/CVD orders.", ["aluminum foil", "household foil", "foil roll", "capacitor foil", "backed foil", "foil laminate"]),
    "7608": ("Tubes and pipes", "Tubes & pipes", "Aluminum tubes and pipes, seamless or not, of non-alloyed or alloyed aluminum: 4 lines, 5.7%. +50% Section 232; Canadian tubes also pay the 50% Section 338 duty since September 15, 2026.", ["aluminum tube", "aluminum pipe", "seamless aluminum tube", "aluminum tubing"]),
    "7609": ("Tube or pipe fittings", "Fittings", "Aluminum tube or pipe fittings (couplings, elbows, sleeves): 1 line, 5.7%. +50% Section 232.", ["aluminum pipe fittings", "aluminum elbow", "aluminum coupling"]),
    "7610": ("Structures, doors, windows and frames", "Structures", "Aluminum structures and parts: doors, windows and their frames, thresholds, roofing, siding, gutters, architectural work and mobile homes: 7 lines, 5.7%. A Section 232 derivative: +50%.", ["aluminum windows", "aluminum door frame", "curtain wall", "aluminum gutter", "aluminum siding", "aluminum railing"]),
    "7611": ("Reservoirs and tanks (over 300 l)", "Tanks", "Aluminum reservoirs, tanks and vats of more than 300 liters, not fitted with mechanical or thermal equipment: 2 lines, 2.6%. Outside Section 232; they pay the 2026 Section 301 duty for most countries.", ["aluminum tank", "aluminum storage tank", "aluminum vat"]),
    "7612": ("Casks, drums, cans and boxes (up to 300 l)", "Cans & containers", "Aluminum casks, drums, cans, boxes and collapsible tubes of 300 liters or less, including beverage and aerosol cans: 6 lines, Free to 5.7%. A Section 232 derivative: +50%.", ["aluminum cans", "beverage can", "aerosol can", "collapsible tube", "aluminum keg", "aluminum drum"]),
    "7613": ("Containers for compressed or liquefied gas", "Gas cylinders", "Aluminum containers for compressed or liquefied gas: 1 line, 5%. A Section 232 derivative: +50%.", ["aluminum gas cylinder", "scuba tank", "CO2 cylinder", "aluminum pressure vessel"]),
    "7614": ("Stranded wire and cables (not insulated)", "Stranded wire", "Aluminum stranded wire, cables and plaited bands, not electrically insulated, with or without a steel core (ACSR): 6 lines, 4.9% to 5.7%. A Section 232 derivative: +50%. Insulated cable is in Chapter 85.", ["ACSR", "aluminum conductor", "bare aluminum cable", "stranded aluminum wire"]),
    "7615": ("Household, kitchen and sanitary articles", "Household", "Aluminum cookware, bakeware, disposable foil containers, pot scourers and sanitary ware: 13 lines, 3.1% to 3.8%. Twelve are Section 232 derivatives at +25%; pot scourers (7615.10.11) are outside. Disposable aluminum containers from China are under AD/CVD orders.", ["aluminum cookware", "aluminum pans", "disposable aluminum containers", "foil pans", "aluminum bakeware", "aluminum sink"]),
    "7616": ("Other articles of aluminum", "Other articles", "Nails, rivets, screws and other fasteners, wire cloth, ladders, venetian blinds, luggage frames, castings, forgings and other articles: 16 lines, Free to 6%. Castings, forgings and most other articles pay +50% Section 232, ladders, blinds and luggage frames +25%, and fasteners and wire cloth (except 7616.10.90.90) are outside it.", ["aluminum castings", "aluminum forgings", "aluminum rivets", "aluminum screws", "aluminum ladder", "aluminum fence", "aluminum brackets"]),
}
ORIG_LABELS = {g["heading"]: g["label"] for g in ia["groups"]}
o = d["overview"]
for pg in o["productGroups"]:
    label, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
for g in ia["groups"]:
    label, short, _, _ = G[g["heading"]]
    g["label"], g["shortLabel"] = label, short

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 76: Aluminum and Articles Thereof — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 76 Aluminum Tariffs: 50% Section 232 Rates, HS Codes & Import Duties | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 124 HTS Chapter 76 aluminum lines: aluminum pays the 50% Section 232 tariff on its full value from every country (UK 25%), China 75%, Russia 200%, Canadian extrusions and tubes 100%. Scrap, powders and fasteners are outside Section 232.",
    "keywords": [
        "HTS Chapter 76",
        "aluminum tariffs",
        "aluminium tariffs",
        "50% aluminum tariff",
        "Section 232 aluminum tariffs",
        "US aluminium tariffs",
        "HS code for aluminum",
        "aluminum import duty",
        "aluminum derivatives tariff",
        "Aluminum and articles thereof",
    ],
}
o["stats"][2]["note"] = (
    f"Section 232 at 50%: {len(S50)}; Section 232 at 25% (household and some other derivatives): {len(S25)}; outside Section 232: {len(NON232)}; "
    f"2026 Section 301: {len(S301)}; Canada Section 338: {len(CA338)}; Russia 200%: {len(S50) + len(S25)}"
)
for ex_line in ["7601.10.60.40", "7604.29.10.90", "7601.20.90.45", "7607.11.90.90", "7606.12.30.91", "7615.10.71.25", "7602.00.00.35"]:
    assert ex_line in LINE, ex_line
assert "7604.29.10.90" in CA338 and "7607.11.90.90" in S50 and "7615.10.71.25" in S25 and "7602.00.00.35" in SCRAP
o["intro"] = (
    "Chapter 76 covers aluminum: unwrought ingot, billet and slab (7601), scrap (7602) and powders (7603); the mill products made from them, "
    "extrusions, wire, sheet and plate, foil, tubes and fittings (7604–7609); and articles of aluminum, from windows and cans to cookware, "
    "cable, fasteners and castings (7610–7616). Base rates are low: **Free to 6.5%**, with 18 of the 124 lines Free.\n\n"
    "What decides the cost is **Section 232**. Aluminum articles and most derivatives (92 lines) pay **an extra 50% of their full customs value** "
    "from every country (heading 9903.82.02), Canada, Mexico, the UAE, Bahrain and the EU included; household articles, ladders, blinds and "
    "luggage frames (15 lines) pay **25%** (9903.82.09). FTA and USMCA claims do not reduce it. The UK pays **25%** (15% on household articles) "
    "when the aluminum was smelted or most recently cast in the UK. Chinese aluminum pays another **25% under Section 301** (75% in total), "
    "Russian aluminum **200%**, and since September 15, 2026 **Canadian extrusions and tubes** (7604, 7608) pay a further **50% under Section 338**. "
    "Scrap, powders, large tanks, pot scourers, most fasteners and wire cloth (17 lines) are **outside Section 232**; most of them pay the 2026 Section 301 duties instead.\n\n"
    "On top of the tariff, Commerce **antidumping and countervailing duty** orders cover aluminum extrusions and foil from China, common alloy "
    "sheet from China and 16 other countries, foil from five other countries and disposable aluminum containers from China. They are company-specific "
    "and not part of this table or the tariff calculator; see Tariff updates and Import documents."
)
o["workedExamples"] = [
    {
        "title": "$1 million of primary aluminum ingot from Canada, with a USMCA certification",
        "line": "7601.10.60.40",
        "body": "Unwrought aluminum of 99.9% purity is **Free** under the general rate, but it is a Section 232 aluminum article, so it pays **+50% of its full value** (9903.82.02): **$500,000**. "
        "USMCA does not help, because note 16(b) collects the Section 232 duty on top of any FTA rate, and Canada's exemption ended on March 12, 2025. "
        "A 25% rate (9903.82.19) exists only for quantities Commerce authorizes for Canadian or Mexican smelters that supply U.S. vehicle makers and commit to new U.S. capacity.",
    },
    {
        "title": "Aluminum extrusions (profiles) from Canada",
        "line": "7604.29.10.90",
        "body": "The base rate is **5%** (Free with a USMCA claim). Section 232 adds **50%** (9903.82.02), and since September 15, 2026 Proclamation 11065 adds the **50% Section 338 duty** (9903.03.14) on top, "
        "even for USMCA goods: **100%** with USMCA, 105% without. $200,000 of USMCA-qualifying profiles owes **$200,000**.",
    },
    {
        "title": "Aluminum billet from the United Arab Emirates",
        "line": "7601.20.90.45",
        "body": "Alloy billet is **Free** at base and pays **+50%** Section 232 (9903.82.02): $50,000 on $100,000. The UAE has no FTA with the United States and no Section 232 exemption "
        "(a 2021 quota arrangement was revoked by Proclamation 10144 before it took effect). The 2026 Section 301 duty on the UAE (12.5%) does not apply to Section 232 aluminum (note 52(f)(1)).",
    },
    {
        "title": "Household aluminum foil from China",
        "line": "7607.11.90.90",
        "body": "**3%** base, plus **50%** Section 232 (9903.82.02) and **25%** Section 301 (note 31, 9903.91.01): **78%**, or $78,000 on $100,000. "
        "The 12.5% 2026 Section 301 duty on China does not apply to Section 232 aluminum. Aluminum foil from China is also under antidumping and countervailing duty orders (2018, continued 2023).",
    },
    {
        "title": "Can body stock from the United Kingdom, smelted in the UK",
        "line": "7606.12.30.45",
        "body": "**3%** base plus **25%** (9903.82.04) when at least 95% of the aluminum was smelted or most recently cast in the United Kingdom (note 16(d)): **28%**. "
        "Without that proof it pays the full **50%** (53% in total). UK common alloy sheet is not under an AD/CVD order.",
    },
    {
        "title": "Disposable aluminum pans from China",
        "line": "7615.10.71.25",
        "body": "Household and kitchen articles are Section 232 derivatives at **25%** (9903.82.09), so this line pays its **3.1%** base plus 25%: **28.1%**. "
        "They also carry the antidumping and countervailing duty orders on disposable aluminum containers, pans, trays and lids from China (May 2025), which are company-specific and usually much higher.",
    },
    {
        "title": "Used beverage cans (scrap) from Mexico",
        "line": "7602.00.00.35",
        "body": "Aluminum scrap is **Free**, is not a Section 232 article, and is on the 2026 Section 301 exemption list (9903.05.86), so Mexican scrap pays **no duty**, with or without a USMCA claim. "
        "Only Chinese scrap (25%, List 3) and Brazilian scrap (25%) pay extra. A remelt scrap ingot (7601.20.90.75), by contrast, is unwrought aluminum and pays the 50%.",
    },
]
assert "7606.12.30.45" in S50
o["notes"] = {
    "chapterNotes": (
        "**Subheading note 1.** (a) *Aluminum, not alloyed*: metal containing at least 99% aluminum by weight, with iron plus silicon not over 1% and each other element (for example chromium, copper, "
        "magnesium, manganese, nickel, zinc) not over 0.1% (copper up to 0.2% if neither chromium nor manganese exceeds 0.05%). "
        "(b) *Aluminum alloys*: metallic substances in which aluminum predominates by weight over each other element, provided that at least one other element (or iron plus silicon) exceeds those limits, "
        "or the other elements together exceed 1%.\n\n"
        "**Subheading note 2.** For subheading 7616.91, *wire* means products of any cross-sectional shape with no cross-sectional dimension over 6 mm (instead of section XV note 9(c))."
    ),
    "additionalUsNotes": (
        "**1.** For heading 7608, the \"Free (C)\" special rate (civil aircraft) applies only to tubes and pipes with attached fittings, suitable for conducting gases or liquids.\n\n"
        "Statistical notes define aluminum vanadium master alloy (20% or more vanadium), aluminum can stock (body stock, 3xxx alloys; lid stock, 5xxx alloys), sheet ingot and foundry ingot, "
        "recyclable aluminum (for the 7602 scrap lines), high-strength heat-treatable alloys (2xxx, 7xxx) and heat-treatable industrial alloys (6xxx)."
    ),
}

# ------------------------------------------------------------------ tariffUpdates
tu = d["tariffUpdates"]
src = {x["id"]: x for x in tu["sources"]}
for x in EXTRA:
    src[x["id"]] = x  # normalized FR metadata wins
src["hts-chapter-99"]["url"] = CH99


def need(*ids):
    for i in ids:
        assert i in src, i


tu["seo"] = {
    "title": "Aluminum Tariff Updates 2025–2026: 50% Section 232, Full-Value Rule, Canada, UK, Russia 200% (HTS Ch. 76) | KoalaGains",
    "shortDescription": "Every U.S. aluminum tariff change with Federal Register citations: Section 232 at 25% for all countries (March 2025), 50% (June 2025), full value from April 2026, the UK's 25% rate, Canada's Section 338 duty on extrusions, the end of the IEEPA duties, and the aluminum AD/CVD orders.",
    "keywords": [
        "aluminum tariffs 2026",
        "aluminum tariff update",
        "aluminum tariff changes",
        "aluminum tariff history",
        "Section 232 aluminum tariffs",
        "aluminum tariffs canada",
        "russian aluminum tariff",
        "aluminum extrusions antidumping",
        "aluminium tariffs us",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current **2026 Revision 21** "
    "(in force October 9, 2026), and lists every extra duty that reaches Chapter 76 today. Base rates did not move: the only changes are eight new statistical lines "
    "(unwrought aluminum purity grades, scrap categories and aerosol cans) at unchanged rates.\n\n"
    "The extra duties changed a lot. In January 2025, aluminum paid 10% under Section 232, with Canada, Mexico and Australia exempt, Argentina under a quota and the EU and UK under tariff-rate quotas. "
    "Proclamation 10895 ended those arrangements and raised the rate to **25% on March 12, 2025**; Proclamation 10947 raised it to **50% on June 4, 2025** (UK stayed at 25%); and Proclamation 11021 rebuilt "
    "the program on **April 6, 2026** as headings 9903.82.02 (50%) and 9903.82.09 (25% for household and some other derivatives), charged on the **full customs value**. "
    "Russian aluminum has paid **200%** since March 10, 2023. Canadian extrusions and tubes pay a further **50% under Section 338** since September 15, 2026. "
    "The IEEPA duties ended on **February 24, 2026** and never added to Section 232 aluminum after June 4, 2025; the Section 122 surcharge and the 2026 Section 301 duties leave it alone too. "
    "China's Section 301 duty (25%) does stack.\n\n"
    "Antidumping and countervailing duty orders cover extrusions, sheet, foil and disposable containers. They are company-specific, listed below for reference, and **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 76 from any country: Section 232 aluminum (note 16) and the 200% on Russian aluminum (note 19), China Section 301 (notes 20, 31), "
    "the 2026 Section 301 actions on 60 economies and Brazil (notes 50, 52), Canada Section 338 (note 51), Russia's rates in lieu of column 2 (note 30), the civil aircraft reliefs (notes 2, 35, 51(d), 52(d)), "
    "the scheduled Nicaragua Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. The aluminum antidumping and countervailing duty orders are listed for reference; the calculator does not model them. "
    "For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "116 of 124 lines", "note": "8 new statistical lines, same rates"},
    {"label": "Section 232 on aluminum", "value": "50%", "note": "Full value, all countries; UK 25%"},
    {"label": "China, aluminum articles", "value": "75%", "note": "50% Section 232 + 25% Section 301"},
    {"label": "Canada, extrusions and tubes", "value": "100%", "note": "50% Section 232 + 50% Section 338"},
]

S232_SRC = ["procl-11021", "procl-10947", "procl-10895", "fr-2026-08297", "procl-11032", "procl-10984", "fr-2026-07987", "csms-68253075", "hts-chapter-99", "hts-now"]
need(*S232_SRC)
tu["inEffect"] = [
    {
        "id": "all-section-232-50",
        "country": "All countries except Russia (Canada, Mexico, UAE, Bahrain, EU, Korea and Japan included)",
        "measure": "Section 232 aluminum, on the full customs value",
        "ch99Code": "9903.82.02",
        "before": "+10% (9903.85.01), with Canada, Mexico and Australia exempt, Argentina under a quota and the EU and UK under tariff-rate quotas; derivatives only on a short list",
        "now": "+50%",
        "exemption": "Covers 92 lines: aluminum articles of note 16(c)(i) (7601, 7604–7609, castings and forgings 7616.99.51.60/.70) and the derivatives of (c)(ii) (structures 7610, cans and containers 7612–7613, "
        "stranded wire 7614, 7616.10.90.90 and other 7616.99.51 articles). No country exemptions or quotas since March 12, 2025; note 16(b) collects the duty on top of any FTA or USMCA rate. "
        "Lower rates: UK aluminum at least 95% smelted or most recently cast in the UK (9903.82.04, 25%); derivatives with at least 85% U.S.-smelted and cast aluminum (9903.82.06, 10%); "
        "Commerce-authorized quantities of Canadian or Mexican aluminum articles (9903.82.19, 25%). Civil aircraft tubes and pipes (7608) of the UK, Japan, the EU and Korea are relieved (9903.96.01, 9903.96.02, 9903.02.76, 9903.02.81). "
        "Articles with no aluminum, steel or copper enter under 9903.82.01. Goods under 9903.82.02 do not pay the 2026 Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)).",
        "whatItMeans": "Aluminum ingot, extrusions, sheet, foil, tubes and cans pay half their value again: $400,000 of sheet from any country owes $200,000, whatever the FTA claim.",
        "effectiveFrom": "2025-06-04",
        "effectiveSourceId": "procl-10947",
        "sourceIds": S232_SRC + ["fr-2025-12060", "fr-2025-17908", "fr-2025-18660", "fr-2025-21940"],
    },
    {
        "id": "all-section-232-25",
        "country": "All countries except Russia",
        "measure": "Section 232 aluminum derivatives at 25% (note 16(c)(vi))",
        "ch99Code": "9903.82.09",
        "before": "+50% on the aluminum content (9903.85.07, from June 4, 2025)",
        "now": "+25%",
        "exemption": "Covers 15 lines: cookware, bakeware, disposable containers and sanitary ware (7615, except pot scourers 7615.10.11), luggage frames (7616.99.10), ladders and venetian blinds (7616.99.51.30/.40). "
        "UK products with UK-smelted or cast aluminum pay 15% (9903.82.05); at least 85% U.S.-smelted and cast aluminum, 10% (9903.82.06). Charged on the full value on top of FTA rates.",
        "whatItMeans": "A $50,000 shipment of aluminum cookware pays its 3.1% base rate plus $12,500 of Section 232 duty.",
        "effectiveFrom": "2026-04-06",
        "effectiveSourceId": "procl-11021",
        "sourceIds": ["procl-11021", "procl-11032", "fr-2026-08297", "csms-68253075", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ca-section-338",
        "country": "Canada",
        "measure": "Section 338 (Canada), list 51(b)(3)",
        "ch99Code": "9903.03.14",
        "before": "None",
        "now": "+50% on extrusions (7604) and tubes and pipes (7608), on top of Section 232",
        "exemption": "Charged even when USMCA is claimed (the heading's Special column is \"+ 50%\"). Proclamation 11065 added 7604 and 7608 to the note 51(b)(3) list and made the duty apply in addition to Section 232 from September 15, 2026. "
        "Civil aircraft articles of Canada are relieved (9903.03.16, note 51(d)), which reaches 7608 tubes. No other Chapter 76 line is on the list.",
        "whatItMeans": "Canadian aluminum extrusions and tubes pay 100% (USMCA) or 101.5% to 105.7% (without), against 50% for other Canadian aluminum.",
        "effectiveFrom": "2026-09-15",
        "effectiveSourceId": "procl-11065",
        "sourceIds": ["procl-11065", "procl-11048", "procl-11056", "csms-69606660", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-section-301",
        "country": "China",
        "measure": "Section 301: note 31 (2024 review), Lists 2, 3 and 4A, and the 2026 action",
        "ch99Code": "9903.91.01 / 9903.88.02 / 9903.88.03 / 9903.88.15 / 9903.05.31",
        "before": "+10% (List 3 since 2018, then 25%) or +7.5% (List 4A); aluminum articles moved to note 31",
        "now": "+25% on aluminum articles (on top of 50% Section 232 = 75%); 7.5% to 37.5% extra on other lines",
        "exemption": "Note 31 (9903.91.01) adds 25% to unwrought aluminum, extrusions, wire, sheet, most foil, tubes and fittings since September 27, 2024. List 3 (9903.88.03, 25%) covers scrap, powders, structures other than doors and windows, tanks, cans, "
        "gas containers, sanitary ware and most of 7616; List 2 (9903.88.02, 25%) covers some stranded wire; List 4A (9903.88.15, 7.5%) covers some foil, doors and windows (7610.10) and some cookware. These stack with Section 232. "
        "The 12.5% 2026 Section 301 duty (9903.05.31) applies only to the 12 non-Section 232 lines outside the note 52(b) exemption list. USTR confirmed on October 7, 2026 that the 2018 actions continue during the four-year review.",
        "whatItMeans": "Chinese aluminum ingot, sheet or foil pays 75% to 81.5% of its value; Chinese scrap 25%; Chinese rivets and fasteners about 42%.",
        "effectiveFrom": "2024-09-27",
        "effectiveSourceId": "fr-2024-21217",
        "sourceIds": ["fr-2024-21217", "fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-2026",
        "country": "60 Section 301 economies (Canada, Mexico, EU, UAE, Bahrain, India, Korea, Japan, Vietnam, Türkiye, UK, Russia and others)",
        "measure": "Section 301 (2026 actions on 60 economies)",
        "ch99Code": "9903.05.20–9903.05.84",
        "before": "None",
        "now": "+10% or +12.5% (EU, Japan, Korea, Taiwan: 10% or 12.5% in place of the base rate) on 12 lines",
        "exemption": "Does not apply to Section 232 aluminum (note 52(f)(1), 9903.05.90). Of the 17 other lines, scrap (7602) is on the general exemption list (note 52(b), 9903.05.86). It charges powders (7603), tanks (7611), "
        "pot scourers (7615.10.11), nails, rivets, cotters and fasteners (7616.10, except 7616.10.90.90) and wire cloth (7616.91). Civil aircraft articles are relieved (note 52(d)); USMCA-qualifying goods of Canada and Mexico are exempt (9903.05.93, 9903.05.94).",
        "whatItMeans": "Only a few non-232 products pay it: $100,000 of Indian aluminum rivets (7616.10.30) pays 4.7% + 10% = $14,700.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "br-section-301",
        "country": "Brazil",
        "measure": "Section 301 (Brazil)",
        "ch99Code": "9903.05.01",
        "before": "None",
        "now": "+25% on the 17 non-Section 232 lines (plus 12.5% on 12 of them)",
        "exemption": "Does not apply to Section 232 aluminum (note 50(a)(vi)(1), 9903.05.07), so Brazilian ingot, sheet and foil pay only the 50% Section 232 duty. It does charge scrap, powders, tanks, pot scourers, fasteners and wire cloth. "
        "Civil aircraft articles are relieved (9903.05.05). Brazilian common alloy sheet and foil are also under AD orders.",
        "whatItMeans": "Brazilian aluminum scrap pays 25%; Brazilian aluminum sheet pays 50% plus any AD duty.",
        "effectiveFrom": "2026-07-22",
        "effectiveSourceId": "fr-2026-14542",
        "sourceIds": ["fr-2026-14542", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ru-section-232",
        "country": "Russia (and aluminum smelted or cast in Russia)",
        "measure": "Section 232 aluminum at 200% (note 19) + 70% in lieu of column 2",
        "ch99Code": "9903.85.67 / 9903.85.68 / 9903.90.09",
        "before": "+200% (since March 10, 2023); column 2 or 70% in lieu of column 2",
        "now": "+200% on 107 lines, on top of the column 2 rate or of 70% on the 54 note 30(d) lines, plus 12.5% Section 301",
        "exemption": "Heading 9903.85.67 covers aluminum articles (7601, 7604–7609, 7616.99.51) and 9903.85.68 the listed derivatives; only one of them applies to an entry, so the duty is 200% once. "
        "Note 19(m) also charges 200% on aluminum of ANY origin when any primary aluminum in it was smelted in Russia or it was cast in Russia; the tariff calculator applies the 200% only to products of Russia, so for "
        "those other-origin goods it understates the duty. 9903.82.02 does not apply where these headings do (note 16(a)), and the 2026 Section 301 duty (9903.05.66) stacks because note 52(f)(1) covers only the 9903.82 headings.",
        "whatItMeans": "Russian aluminum sheet pays about 282.5% of its value (70% + 200% + 12.5%); a Malaysian extrusion cast from Russian-smelted metal pays the 200% too.",
        "effectiveFrom": "2023-03-10",
        "effectiveSourceId": "procl-10522",
        "sourceIds": ["procl-10522", "procl-11021", "procl-10523", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
]

need("fr-2025-22690", "fr-2025-23892", "hts-now-cr", "hts-before", "procl-11065", "csms-69851916", "procl-11056", "csms-69606660", "procl-11048", "fr-2026-14542", "fr-2026-15274", "procl-10523")


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    need(*ids)
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


base = next(c for c in tu["changes"] if c["id"] == "base-rates")
base["title"] = "No Chapter 76 base-rate changes"
base["detail"] = (
    "116 of 124 Chapter 76 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. The other eight are new statistical lines at unchanged rates: "
    "7601.10.60.30 was split into 7601.10.60.40 (99.9% aluminum or greater) and 7601.10.60.45; the scrap lines 7602.00.00.95–.98 became 7602.00.00.45 (wheels), .55 (industrial), .65 and .75; "
    "and 7612.90.10.30 was split into 7612.90.10.40 (aerosol cans) and 7612.90.10.45."
)

changes = [
    base,
    ch("foil-sunset-2026", "pending", "2026-10-01", "Published", "Five-year reviews of the 2021 aluminum foil orders begin",
       "The ITC and Commerce instituted five-year (sunset) reviews of the antidumping duty orders on aluminum foil from Armenia, Brazil, Oman, Russia and Türkiye and the countervailing duty orders on Oman and Türkiye. "
       "The orders stay in force during the reviews.",
       None, "Orders continue during review", "Armenia, Brazil, Oman, Russia, Türkiye", ["fr-2026-20139", "fr-2021-24859", "fr-2021-24858"]),
    ch("section-338-canada", "extraDuty", "2026-09-15", "Effective", "Section 338 duty on Canadian aluminum extrusions and tubes, on top of Section 232",
       "Proclamation 11065 added aluminum bars, rods and profiles (7604) and tubes and pipes (7608) to the products of Canada that pay the 50% Section 338 duty (9903.03.14, note 51(b)(3)), and made the duty apply in addition to Section 232. "
       "It is charged even on USMCA goods. Canadian extrusions and tubes now pay 100% or more; other Canadian aluminum stays at 50%. Civil aircraft articles are relieved (9903.03.16).",
       "+50% (Section 232)", "+100% (7604, 7608)", "Canada", ["procl-11065", "procl-11048", "procl-11056", "csms-69851916", "csms-69606660"]),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: Section 232 aluminum exempt",
       "The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. They do not apply to Section 232 aluminum (note 52(f)(1)), and scrap is on the general exemption list (note 52(b)). "
       "In Chapter 76 they charge 12 lines: powders, tanks, pot scourers, fasteners and wire cloth. USMCA goods are exempt.",
       None, "+10% to +12.5% (12 lines)", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It never applied to Section 232 aluminum (Proclamation 11012; note 2(aa)), "
       "so in Chapter 76 it reached only scrap, powders, tanks, pot scourers, fasteners and wire cloth.",
       None, None, "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: Section 232 aluminum exempt, scrap not",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. Section 232 aluminum is excluded (note 50(a)(vi)(1)), so it reaches only the 17 non-Section 232 lines, including aluminum scrap.",
       None, "+25% (17 lines)", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("procl-11045", "pending", "2026-07-20", "Signed", "Proclamation 11045: half-rate imports for companies building U.S. primary aluminum capacity",
       "Proclamation 11045 told Commerce to set up a program under which companies with an approved plan to build, expand or refurbish a U.S. primary aluminum smelter (construction to start by January 20, 2029) "
       "may import primary aluminum, up to the plant's expected annual output, at half the Section 232 rate. As of the 2026 Revision 21 no HTS heading for it exists, and Commerce has not yet published procedures in the Federal Register.",
       None, "Half the Section 232 rate (approved plans only)", "All", ["procl-11045"]),
    ch("caas-review-2026", "pending", "2026-06-12", "Published", "Full sunset reviews of the 2021 common alloy aluminum sheet orders",
       "The ITC decided to conduct full five-year reviews of the antidumping duty orders on common alloy aluminum sheet from Bahrain, Brazil, Croatia, Egypt, Germany, India, Indonesia, Italy, Oman, Romania, Serbia, "
       "Slovenia, South Africa, Spain, Taiwan and Türkiye and the countervailing duty orders on Bahrain, India and Türkiye. The orders stay in force during the reviews.",
       None, "Orders continue during review", "16 countries", ["fr-2026-11829", "fr-2021-08713", "fr-2021-08714"]),
    ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032 adjusts the metals program",
       "From June 8, 2026 a derivative counts as made from U.S. aluminum when at least 85% of its aluminum content was smelted and cast in the United States (10%, 9903.82.06), and new rates apply to industrial and "
       "mobile equipment derivatives outside Chapter 76. Chapter 76 rates stay at 50% and 25% (UK 25% and 15%).",
       None, None, "All", ["procl-11032"]),
    ch("tech-corrections", "reference", "2026-04-29", "Published", "Commerce corrects the Section 232 annex",
       "Commerce added heading 9903.82.01 (articles on the note 16 lists that contain no aluminum, steel or copper pay no Section 232 duty) from April 6, 2026, and made other technical corrections to the HTS annex.",
       None, None, "All", ["fr-2026-08297"]),
    ch("camx-procedures", "reference", "2026-04-23", "Published", "Commerce opens the 25% route for Canadian and Mexican aluminum producers",
       "Commerce set out how aluminum and steel producers with plants in Canada or Mexico that supply U.S. vehicle makers can apply for a tariff reduction of up to half (not below 25%), "
       "limited to quantities matched to newly committed U.S. production. Approved aluminum articles enter under 9903.82.19 (+25%) if they qualify for USMCA and were smelted and cast in Canada or Mexico.",
       None, "+25% for authorized quantities", "Canada, Mexico", ["fr-2026-07987", "procl-10984"]),
    ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 metals program rebuilt on full value (Proclamation 11021)",
       "Proclamation 11021 replaced the aluminum headings of note 19 (9903.85.02–9903.85.15) with 9903.82.02–9903.82.26, charged on the full customs value regardless of metal content (before, Chapter 76 derivatives paid on the aluminum content). "
       "Aluminum articles and the (c)(ii) derivatives stay at 50% (9903.82.02); household articles, ladders, blinds and luggage frames drop to 25% (9903.82.09); the UK needs at least 95% UK-smelted or cast aluminum for 25% (9903.82.04) or 15% (9903.82.05). "
       "Russian aluminum stays at 200%. Manufacturing drawback is allowed only for the 25% derivatives of trade-agreement partners; goods entering a foreign-trade zone must take privileged foreign status; the derivatives inclusions process ended.",
       "+50% (aluminum content for derivatives)", "+50% / +25% (full value)", "All", ["procl-11021", "csms-68253075", "hts-chapter-99"]),
    ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; Section 232 aluminum outside it",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Proclamation 11012 says it does not apply to goods subject to Section 232, so aluminum paid only the 50%; "
       "scrap, powders, tanks, pot scourers, fasteners and wire cloth paid the 10% unless USMCA was claimed.",
       None, "Section 232 aluminum exempt", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and "
       "reciprocal duties, and CBP stopped collecting them from 12:00 a.m. ET on February 24, 2026. Section 232 aluminum duties are not IEEPA duties and continued unchanged. "
       "For Chapter 76 the IEEPA duties had mattered mainly for scrap, powders, fasteners and the other non-Section 232 lines.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("procl-10984", "reference", "2025-10-17", "Signed", "Authority to halve Section 232 for some Canadian and Mexican aluminum",
       "Proclamation 10984 (medium- and heavy-duty vehicles) authorized Commerce to cut the Section 232 aluminum and steel duty by up to half, but not below 25%, for limited quantities from "
       "Canadian or Mexican producers that supply U.S. vehicle makers and commit to new U.S. capacity. The aluminum must qualify for USMCA and be smelted and cast in Canada or Mexico (heading 9903.82.19).",
       None, None, "Canada, Mexico", ["procl-10984"]),
    ch("uk-epd", "reference", "2025-06-16", "Signed", "UK Economic Prosperity Deal: UK aluminum stays at 25%",
       "Executive Order 14309, implementing the U.S.-UK Economic Prosperity Deal, directed Commerce to design a tariff-rate quota for UK aluminum articles and derivatives at a time it deems appropriate; the deal's general terms "
       "speak of a quota at most-favored-nation rates once the UK meets U.S. supply-chain and ownership requirements. No quota has been established. UK aluminum stays at 25% under Proclamation 10947; "
       "since April 6, 2026 that rate requires at least 95% UK-smelted or most recently cast aluminum.",
       "+25%", "+25% (UK)", "United Kingdom", ["eo-14309", "procl-10947"]),
    ch("s232-50", "extraDuty", "2025-06-04", "Effective", "Section 232 aluminum tariff doubled to 50%",
       "Proclamation 10947 raised the Section 232 aluminum and steel duties from 25% to 50% for goods entered from 12:01 a.m. EDT on June 4, 2025, except for the UK (25%). "
       "It also amended Executive Order 14289 so that aluminum subject to Section 232 no longer paid the Canada and Mexico IEEPA duties.",
       "+25%", "+50% (UK +25%)", "All except UK", ["procl-10947"]),
    ch("containers-2025", "reference", "2025-05-08", "Published", "AD/CVD orders on disposable aluminum containers from China",
       "Commerce issued antidumping and countervailing duty orders on disposable aluminum containers, pans, trays and lids from China (mainly 7615.10.71.25; also 7612.90, 7615.10 and 8309.90 for lids).",
       None, "AD/CVD cash deposits", "China", ["fr-2025-08089"]),
    ch("eo-14289", "reference", "2025-04-29", "Signed", "Non-stacking order between IEEPA and Section 232",
       "Executive Order 14289, retroactive to March 4, 2025, set an order of precedence so that Canadian and Mexican goods did not pay both the IEEPA duties and Section 232. "
       "Proclamation 10947 settled it from June 4, 2025: Section 232 aluminum no longer paid the IEEPA duties.",
       None, None, "Canada, Mexico", ["eo-14289"]),
    ch("reciprocal", "reference", "2025-04-02", "Signed", "Reciprocal tariff excludes Section 232 aluminum",
       "Executive Order 14257 set the reciprocal tariffs from April 5, 2025 but excluded aluminum articles and derivatives subject to Section 232. Non-Section 232 Chapter 76 lines paid "
       "it. Ended February 24, 2026.",
       None, "Section 232 aluminum exempt", "All except Canada, Mexico", ["eo-14257"]),
    ch("s232-reset", "extraDuty", "2025-03-12", "Effective", "Aluminum exemptions and quotas end; rate raised to 25%; more derivatives",
       "Proclamation 10895 ended the arrangements with Argentina, Australia, Canada, Mexico, the EU and the UK, raised the Section 232 aluminum duty from 10% to 25%, and extended it to more derivative aluminum articles "
       "(U.S. note 19(j): structures, cans and containers, household articles and other articles of Chapter 76). The 200% on Russian aluminum continued.",
       "+10%, many countries exempt or under quotas", "+25%", "Argentina, Australia, Canada, Mexico, EU, UK", ["procl-10895"]),
    ch("ca-mx-ieepa", "reference", "2025-02-01", "Signed", "IEEPA duties on Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods were exempted from March 7, 2025. Ended February 24, 2026.",
       None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
    ch("extrusions-2024", "reference", "2024-11-22", "Published", "No new AD/CVD orders on aluminum extrusions from 14 countries",
       "Commerce had found dumping or subsidies on aluminum extrusions from China, Colombia, Ecuador, India, Indonesia, Italy, Malaysia, Mexico, South Korea, Taiwan, Thailand, Türkiye, the UAE and Vietnam, "
       "but the ITC determined that the U.S. industry was not materially injured or threatened, so no orders were issued. The 2011 orders on extrusions from China remain.",
       None, "No orders", "14 countries", ["fr-2024-27376"]),
    ch("cn-301-2024", "extraDuty", "2024-09-27", "Effective", "China Section 301: aluminum products to 25%",
       "After its four-year review, USTR moved Chinese steel and aluminum products to U.S. note 31 (9903.91.01) at 25%, including unwrought aluminum, extrusions, wire, sheet, foil and tubes, from September 27, 2024.",
       "0% to +25%", "+25%", "China", ["fr-2024-21217"]),
    ch("caas-china-continued", "reference", "2024-09-06", "Published", "Common alloy aluminum sheet orders on China continued",
       "After five-year reviews, Commerce continued the 2019 antidumping and countervailing duty orders on common alloy aluminum sheet from China.",
       None, None, "China", ["fr-2024-19942", "fr-2019-01836", "fr-2019-01273"]),
    ch("mexico-smelt-cast", "reference", "2024-07-10", "Effective", "Mexico: duty on aluminum smelted or cast in China, Russia, Belarus or Iran",
       "Proclamation 10782 charged the then-10% Section 232 duty on Mexican aluminum whose primary or secondary country of smelt or country of most recent cast was China, Russia, Belarus or Iran, and required smelt and cast information. "
       "Superseded on March 12, 2025, when all Mexican aluminum became dutiable.",
       None, None, "Mexico", ["procl-10782"]),
    ch("foil-circumvention", "reference", "2023-11-27", "Published", "Chinese foil orders reach foil finished in Korea and Thailand",
       "Commerce found that aluminum foil completed in Korea and Thailand from Chinese-origin foil circumvents the orders on China, so such foil can owe the China AD/CVD cash deposits.",
       None, None, "China, Korea, Thailand", ["fr-2023-26030"]),
    ch("foil-china-continued", "reference", "2023-10-02", "Published", "Aluminum foil orders on China continued",
       "After five-year reviews, Commerce continued the 2018 antidumping and countervailing duty orders on aluminum foil from China.",
       None, None, "China", ["fr-2023-21653", "fr-2018-08115", "fr-2018-08116"]),
    ch("caas-4017", "reference", "2023-07-27", "Published", "Common alloy sheet orders reach 4017 aluminum sheet from China",
       "Commerce found that imports of 4017 aluminum sheet from China circumvent the common alloy aluminum sheet orders, which therefore cover it.",
       None, None, "China", ["fr-2023-15947"]),
    ch("russia-col2-70", "reference", "2023-04-01", "Effective", "Russia: 70% in lieu of column 2 on aluminum",
       "Proclamation 10523 raised the rate on Russian aluminum and other metals of note 30(d) to 70% in place of the column 2 rate (Russia has paid column 2 rates since April 9, 2022). It applies to 54 Chapter 76 lines, on top of which the 200% Section 232 duty is charged.",
       None, "70% in lieu of column 2", "Russia", ["procl-10523"]),
    ch("russia-200", "extraDuty", "2023-03-10", "Effective", "200% Section 232 duty on Russian aluminum",
       "Proclamation 10522 set a 200% duty on aluminum articles and derivatives that are products of Russia from March 10, 2023, and on those of any origin containing primary aluminum smelted in Russia or cast in Russia from April 10, 2023.",
       "+10%", "+200%", "Russia", ["procl-10522"]),
    ch("uk-trq", "reference", "2022-06-01", "Effective", "UK aluminum tariff-rate quota",
       "Proclamation 10405 let UK aluminum enter free of Section 232 duty within an annual quota, with 10% above it, from June 1, 2022. Ended March 12, 2025.",
       None, None, "United Kingdom", ["procl-10405"]),
    ch("eu-trq", "reference", "2022-01-01", "Effective", "EU aluminum tariff-rate quota",
       "Proclamation 10327 set a duty-free quota for EU aluminum from January 1, 2022; Proclamation 10690 extended it and required a certificate of analysis from January 1, 2024. Ended March 12, 2025.",
       None, None, "European Union", ["procl-10327", "procl-10690"]),
    ch("foil-2021", "reference", "2021-11-12", "Published", "AD/CVD orders on aluminum foil from five countries",
       "Commerce issued antidumping duty orders on aluminum foil from Armenia, Brazil, Oman, Russia and Türkiye and countervailing duty orders on Oman and Türkiye.",
       None, "AD/CVD cash deposits", "Armenia, Brazil, Oman, Russia, Türkiye", ["fr-2021-24859", "fr-2021-24858"]),
    ch("aim", "reference", "2021-06-28", "Effective", "Aluminum import licenses (AIM) required",
       "Commerce's Aluminum Import Monitoring and Analysis system (19 CFR part 361) requires an import license, with the countries of smelt and cast, for every formal entry of unwrought aluminum, extrusions, wire, sheet, foil, tubes, fittings, castings and forgings. "
       "Compliance began June 28, 2021; from June 29, 2022 filers can no longer answer \"unknown\" for the smelt fields.",
       None, "License required", "All", ["fr-2021-10747", "fr-2020-28166"]),
    ch("caas-2021", "reference", "2021-04-27", "Published", "AD/CVD orders on common alloy aluminum sheet from 16 countries",
       "Commerce issued antidumping duty orders on common alloy aluminum sheet from Bahrain, Brazil, Croatia, Egypt, Germany, India, Indonesia, Italy, Oman, Romania, Serbia, Slovenia, South Africa, Spain, Taiwan and Türkiye, "
       "and countervailing duty orders on Bahrain, India and Türkiye.",
       None, "AD/CVD cash deposits", "16 countries", ["fr-2021-08713", "fr-2021-08714"]),
    ch("uae-2021", "reference", "2021-02-01", "Signed", "UAE aluminum quota arrangement revoked before it took effect",
       "Proclamation 10139 (January 19, 2021) would have exempted UAE aluminum from Section 232 under a quota from February 3, 2021; Proclamation 10144 terminated it before it took effect, so UAE aluminum kept paying the duty.",
       None, "No change", "United Arab Emirates", ["procl-10144", "procl-10139"]),
    ch("canada-2020", "reference", "2020-08-16", "Effective", "10% briefly reimposed on Canadian non-alloyed unwrought aluminum",
       "Proclamation 10060 reimposed the 10% duty on non-alloyed unwrought aluminum (7601.10) from Canada from August 16, 2020; Proclamation 10106 removed it retroactively from September 1, 2020.",
       None, "+10% (Aug. 16–31, 2020)", "Canada", ["procl-10060", "procl-10106"]),
    ch("derivatives-2020", "reference", "2020-02-08", "Effective", "First Section 232 aluminum derivatives",
       "Proclamation 9980 extended the 10% aluminum duty to certain derivatives, including aluminum stranded wire and cable (7614) and some vehicle stampings, from February 8, 2020.",
       None, "+10% (derivatives)", "All except exempt countries", ["procl-9980"]),
    ch("camx-2019", "reference", "2019-05-20", "Effective", "Canada and Mexico exempted from Section 232 aluminum",
       "Proclamation 9893 removed the Section 232 aluminum duty on Canada and Mexico from May 20, 2019. The exemption lasted until March 12, 2025.",
       "+10%", "Exempt", "Canada, Mexico", ["procl-9893"]),
    ch("caas-china-2019", "reference", "2019-02-08", "Published", "AD/CVD orders on common alloy aluminum sheet from China",
       "Commerce issued antidumping and countervailing duty orders on common alloy aluminum sheet from China.",
       None, "AD/CVD cash deposits", "China", ["fr-2019-01836", "fr-2019-01273"]),
    ch("eu-ca-mx-2018", "reference", "2018-06-01", "Effective", "Section 232 aluminum extended to the EU, Canada and Mexico",
       "Proclamation 9758 ended the temporary exemptions of the EU, Canada and Mexico on June 1, 2018, set a quota for Argentina and kept Australia exempt.",
       None, "+10%", "EU, Canada, Mexico", ["procl-9758"]),
    ch("foil-china-2018", "reference", "2018-04-19", "Published", "AD/CVD orders on aluminum foil from China",
       "Commerce issued antidumping and countervailing duty orders on certain aluminum foil from China.",
       None, "AD/CVD cash deposits", "China", ["fr-2018-08115", "fr-2018-08116"]),
    ch("s232-start", "extraDuty", "2018-03-23", "Effective", "Section 232 aluminum tariff begins at 10%",
       "Proclamation 9704 imposed a 10% duty on aluminum articles (unwrought aluminum, extrusions, wire, sheet, foil, tubes, fittings, castings and forgings) from March 23, 2018, with temporary exemptions for some countries.",
       None, "+10%", "All except temporarily exempted countries", ["procl-9704"]),
    ch("extrusions-china-2011", "reference", "2011-05-26", "Published", "AD/CVD orders on aluminum extrusions from China",
       "Commerce issued antidumping and countervailing duty orders on aluminum extrusions from China (mainly 7604 and 7608, and extrusions forming parts of other articles); they were continued in 2017 and 2022.",
       None, "AD/CVD cash deposits", "China", ["fr-2011-13086", "fr-2011-13103", "fr-2022-23810"]),
]
nic = next(c for c in tu["changes"] if c["id"].startswith("section-301-nicaragua"))
nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
nic["detail"] = (
    "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). "
    "Note 29 has no Section 232 carve-out, so it will add to the 50% on Nicaraguan aluminum. The rate is 0% in 2026."
)
nic["date"] = src["fr-2025-23892"]["published"]
nic["dateLabel"] = "Published"
changes.insert(1, nic)
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes

used = set()
for e in tu["inEffect"]:
    used.update(e["sourceIds"])
for c in tu["changes"]:
    used.update(c["sourceIds"])
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch76"])
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["seo"] = {
    "title": "Aluminum Tariffs by Country: Canada, China, Mexico, UAE, Korea, India, Bahrain, UK, EU (HTS Ch. 76) | KoalaGains",
    "shortDescription": "The total U.S. tariff on aluminum by country and product: 50% from Canada, Mexico, the UAE, Korea, India, Bahrain, Colombia, Germany and every other country; Canadian extrusions 100%; UK 25% with UK-smelted aluminum; China 75%; Russia over 250%. Scrap and fasteners explained.",
    "keywords": [
        "aluminum tariffs by country",
        "us aluminum tariffs by country",
        "aluminum tariffs canada",
        "aluminum tariff china",
        "aluminum tariffs mexico",
        "aluminum tariffs uk",
        "aluminum tariffs eu",
        "aluminum tariff india",
        "aluminum tariff japan",
        "China Aluminium Tariffs",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. "
    "For aluminum articles and most derivatives the answer is almost the same everywhere: **50%**, because Section 232 has no country exemptions and is collected on top of FTA and USMCA rates; "
    "household articles pay **25%**. Canada pays **100%** on extrusions and tubes (Section 338 adds 50%), China **75%** (Section 301 adds 25%), Russia **over 250%** (200% plus 70% in place of column 2), "
    "and the UK **25%** when the aluminum was smelted or most recently cast in the UK (the cells show the 50% default).\n\n"
    "The non-Section 232 groups differ: scrap is Free except for China and Brazil, and powders, tanks, pot scourers, fasteners and wire cloth pay their base rate plus, for most countries, "
    "the 2026 Section 301 duty (10% or 12.5%). The table does **not** include antidumping or countervailing duties, which apply company by company to extrusions, sheet, foil and disposable containers "
    "from the countries named in Tariff updates."
)
R = {
    "Canada": ("50% on aluminum articles and most derivatives (25% on household articles), with or without a USMCA claim: Section 232 (9903.82.02) has had no Canada exemption since March 12, 2025 and is collected on top of the USMCA rate (note 16(b)). "
               "Extrusions (7604) and tubes (7608) also pay the 50% Section 338 duty (9903.03.14) since September 15, 2026, USMCA or not: 100%. Commerce can authorize limited quantities at 25% (9903.82.19). "
               "Scrap is Free; 12 non-232 lines pay 10% under Section 301 (9903.05.29) unless USMCA is claimed.",
               ["procl-11021", "procl-10895", "procl-11065", "procl-11048", "fr-2026-07987", "fr-2026-15181", "hts-now"]),
    "Mexico": ("50% on aluminum articles and most derivatives (25% on household articles), with or without a USMCA claim: Section 232 (9903.82.02) has applied to all Mexican aluminum since March 12, 2025. "
               "Commerce can authorize limited quantities at 25% (9903.82.19). 12 non-232 lines pay 10% under Section 301 (9903.05.55) unless USMCA is claimed; scrap is Free.",
               ["procl-11021", "procl-10895", "fr-2026-07987", "fr-2026-15181", "hts-now"]),
    "United Arab Emirates": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; the UAE has no FTA and never had a Section 232 exemption in force. "
                             "12.5% Section 301 (9903.05.80) on 12 non-232 lines; scrap Free.",
                             ["procl-11021", "procl-10144", "fr-2026-15181", "hts-now"]),
    "Bahrain": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles: the U.S.-Bahrain FTA removes the base rate (BH) but not Section 232 (note 16(b)). "
                "On the 12 non-232 lines the FTA removes the base rate and the 12.5% Section 301 duty (9903.05.25) applies. Bahraini common alloy sheet carries AD/CVD orders, not shown.",
                ["procl-11021", "fr-2026-15181", "fr-2021-08713", "fr-2021-08714", "hts-now"]),
    "China": ("75% to 81.5% on aluminum articles: 50% Section 232 (9903.82.02) + 25% Section 301 (note 31, 9903.91.01, or List 3); 57.5% to 63.2% on the foil and door and window lines on List 4A (7.5%); household articles 28% to 54%. "
              "Scrap pays 25% (List 3); powders, tanks, fasteners and wire cloth 25% plus 12.5% (9903.05.31). Chinese extrusions, sheet, foil and disposable containers also carry AD/CVD, not shown.",
              ["procl-11021", "fr-2024-21217", "fr-2018-20610", "fr-2020-00904", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
    "India": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; 10% Section 301 (9903.05.44) on 12 non-232 lines. Indian common alloy sheet carries AD/CVD orders, not shown.",
              ["procl-11021", "fr-2026-15181", "fr-2021-08713", "hts-now"]),
    "South Korea": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; KORUS does not reduce it. On 12 non-232 lines the 2026 Section 301 rate is 12.5% in place of the base rate when lower (9903.05.71). "
                    "Korean civil aircraft tubes are relieved (9903.02.81).",
                    ["procl-11021", "fr-2026-15181", "fr-2025-21940", "hts-now"]),
    "Germany": ("EU: 50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; the EU tariff-rate quota ended March 12, 2025. On 12 non-232 lines the 2026 Section 301 rate is 10% in place of the base rate when lower (9903.05.39). "
                "German common alloy sheet carries an AD order, not shown.",
                ["procl-11021", "procl-10895", "fr-2026-15181", "fr-2021-08713", "fr-2025-18660", "hts-now"]),
    "Italy": ("EU: 50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles. On 12 non-232 lines the 2026 Section 301 rate is 10% in place of the base rate when lower (9903.05.39). Italian common alloy sheet carries an AD order, not shown.",
              ["procl-11021", "procl-10895", "fr-2026-15181", "fr-2021-08713", "hts-now"]),
    "Brazil": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; the Brazil Section 301 duty does not apply to them (note 50(a)(vi)(1)). On the 17 non-232 lines the 25% Brazil duty (9903.05.01) applies, "
               "plus 12.5% (9903.05.27) on 12 of them: scrap pays 25%. Brazilian sheet and foil carry AD orders, not shown.",
               ["procl-11021", "fr-2026-14542", "fr-2026-15181", "fr-2021-08713", "fr-2021-24859", "hts-now"]),
    "United Kingdom": ("50% shown: UK aluminum pays 25% instead (9903.82.04), and household articles 15% (9903.82.05), when at least 95% of the aluminum was smelted or most recently cast in the UK (note 16(d)). "
                       "UK civil aircraft tubes are relieved (9903.96.01). 10% Section 301 (9903.05.81) on 12 non-232 lines.",
                       ["procl-11021", "eo-14309", "fr-2025-12060", "fr-2026-15181", "hts-now"]),
    "Japan": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles. On 12 non-232 lines the 2026 Section 301 rate is 12.5% in place of the base rate when lower (9903.05.49). Japanese civil aircraft tubes are relieved (9903.96.02).",
              ["procl-11021", "fr-2026-15181", "fr-2025-17908", "hts-now"]),
    "Vietnam": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; 12.5% Section 301 (9903.05.84) on 12 non-232 lines. The 2024 extrusions case ended without an order on Vietnam.",
                ["procl-11021", "fr-2026-15181", "fr-2024-27376", "hts-now"]),
    "Türkiye (Turkey)": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; 12.5% Section 301 (9903.05.79) on 12 non-232 lines. Turkish common alloy sheet and foil carry AD/CVD orders, not shown.",
                         ["procl-11021", "fr-2026-15181", "fr-2021-08713", "fr-2021-24859", "hts-now"]),
    "Thailand": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; 12.5% Section 301 (9903.05.77) on 12 non-232 lines. Foil completed in Thailand from Chinese foil can owe the China foil AD/CVD deposits.",
                 ["procl-11021", "fr-2026-15181", "fr-2023-26030", "hts-now"]),
    "Russia": ("Column 2 rate, or 70% in its place on the 54 note 30(d) lines (9903.90.09), plus 200% Section 232 (9903.85.67 / .68) on 107 lines, plus 12.5% Section 301 (9903.05.66): 247.5% to 282.5%."
               + (" The 457.5% shown on three 7616.99.51 lines (ladders, venetian blinds, other) counts the 200% twice; only one of 9903.85.67 / .68 applies, so the correct total is 257.5%."
                  if "457.5%" in json.dumps(CTRY.get("Russia", {})) else ""),
               ["procl-10522", "procl-11021", "procl-10523", "fr-2026-15181", "hts-now"]),
    "Indonesia": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; 2026 Section 301 duty on 12 non-232 lines. Indonesian common alloy sheet carries an AD order, not shown.",
                  ["procl-11021", "fr-2026-15181", "fr-2021-08713", "hts-now"]),
    "Taiwan": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles. On 12 non-232 lines the 2026 Section 301 rate is 10% in place of the base rate when lower (9903.05.76). Taiwanese common alloy sheet carries an AD order, not shown.",
               ["procl-11021", "fr-2026-15181", "fr-2021-08713", "hts-now"]),
    "Argentina": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02): Argentina's quota ended March 12, 2025. 25% on household articles; 2026 Section 301 duty on 12 non-232 lines.",
                  ["procl-11021", "procl-10895", "fr-2026-15181", "hts-now"]),
    "Australia": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02): Australia's exemption ended March 12, 2025, and the AUSFTA does not reduce it. 25% on household articles; 2026 Section 301 duty on 12 non-232 lines.",
                  ["procl-11021", "procl-10895", "fr-2026-15181", "hts-now"]),
    "Oman": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles: the U.S.-Oman FTA removes only the base rate. Omani common alloy sheet and foil carry AD/CVD orders, not shown.",
             ["procl-11021", "fr-2026-15181", "fr-2021-08713", "fr-2021-24858", "hts-now"]),
    "Malaysia": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; 2026 Section 301 duty on 12 non-232 lines.",
                 ["procl-11021", "fr-2026-15181", "hts-now"]),
    "Colombia": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles: the U.S.-Colombia TPA removes the base rate (CO) but not Section 232 (note 16(b)). "
                 "On the 12 non-232 lines the TPA removes the base rate and the 12.5% Section 301 duty (9903.05.32) applies. The 2024 extrusions case ended without an order on Colombia.",
                 ["procl-11021", "fr-2026-15181", "fr-2024-27376", "hts-now"]),
    "South Africa": ("50% on aluminum articles and most derivatives (Section 232, 9903.82.02), 25% on household articles; 12.5% Section 301 (9903.05.69) on 12 non-232 lines. South African common alloy sheet carries an AD order, not shown.",
                     ["procl-11021", "fr-2026-15181", "fr-2021-08713", "hts-now"]),
}
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R:
        label, ids = R[c["country"]]
        rule["label"], rule["sourceIds"] = label, ids
    elif c["country"] == "Any other country":
        rule["label"] = (
            "At least 50% on aluminum articles and most derivatives, and 25% on household articles, from every other country (Section 232 has no exemptions). The non-232 columns show the range: base rate only, up to 12.5% more "
            "under the 2026 Section 301 actions on 12 lines. Column 2 countries (Belarus, Cuba, North Korea) pay more; Nicaragua's Section 301 duty starts January 1, 2027."
        )
        rule["sourceIds"] = ["procl-11021", "fr-2026-15181", "fr-2025-23892", "hts-now"]
    else:
        raise SystemExit(f"no rule label for {c['country']}")
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Section 232 is shown at its default rates: 50% (9903.82.02) and 25% (9903.82.09). UK aluminum with at least 95% UK-smelted or cast content pays 25% or 15% (9903.82.04, 9903.82.05), derivatives with at least 85% U.S.-smelted and cast "
    "aluminum pay 10% (9903.82.06), Canadian or Mexican aluminum authorized by Commerce under 9903.82.19 pays 25%, and civil aircraft articles can be relieved; the cells do not show these variants.",
    "The 200% on aluminum smelted or cast in Russia is applied only to products of Russia; goods of other countries containing Russian-smelted or Russian-cast aluminum also owe it (note 19(m)), which the cells do not show.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Antidumping and countervailing duties are not included. They apply company by company to aluminum extrusions (China), common alloy sheet (China and 16 countries), foil (China, Armenia, Brazil, Oman, Russia, Türkiye) "
    "and disposable aluminum containers (China).",
    "Entry rules: a Commerce aluminum import license (AIM, 19 CFR part 361) for unwrought aluminum, extrusions, wire, sheet, foil, tubes, fittings, castings and forgings, and the countries of smelt and cast on every Section 232 aluminum entry.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2(aa), 16, 19, 20, 29, 30, 31, 35, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 16(c)(i) lists 7601, 7604–7609 and 7616.99.51.60/.70 as aluminum articles, "
    "(c)(ii) and (c)(vi) the Chapter 76 derivatives; it has no country exemption, and note 16(b) collects the duty on top of FTA rates. Section 232 aluminum is excluded from the 2026 Section 301 duties (note 52(f)(1)), "
    "the Brazil duty (note 50(a)(vi)(1)) and the expired Section 122 surcharge, but not from China Section 301 (notes 20, 31), the Canada Section 338 duty (note 51(c) no longer lifts 9903.03.14) or the 2027 Nicaragua duty (note 29). "
    "Of the 17 other lines, only scrap (7602.00.00) is on the 2026 Section 301 general exemption list (note 52(b)), and no Chapter 76 line is on the note 52(j) country exception lists. "
    "7604 and 7608 are on the Canada Section 338 list (note 51(b)(3)); 7608 is on the civil aircraft lists of notes 35, 2(v), 51(d) and 52(d). Note 19(m) charges 200% on Russian-smelted or cast aluminum of any origin."
)
ia_ids = set()
for c in ia["countries"]:
    ia_ids.update(c["rule"]["sourceIds"])
ia_ids.add("hts-now")
for i in ia_ids:
    need(i)
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Aluminum: AIM License, Smelt and Cast, Section 232 Entry Rules & Ways to Lower Duty (HTS Ch. 76) | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 76 aluminum line: Commerce AIM aluminum import license, country of smelt and cast, Section 232 entry (9903.82.02 / 9903.82.09), FTZ status, marking, AD/CVD scope, plus the legal ways to pay less: UK-smelted aluminum, U.S.-smelted derivatives, the Canada/Mexico 25% route, civil aircraft relief, classification and drawback.",
    "keywords": [
        "aluminum import license",
        "aluminum import monitoring (aim) system",
        "section 232 aluminum smelt and cast requirements",
        "smelt and cast country",
        "aluminum tariff exemption",
        "aluminum tariff relief",
        "aluminum extrusion antidumping scope",
        "section 232 aluminum hts codes",
    ],
}
te["intro"] = (
    "For aluminum, the paperwork is part of the duty. Every formal entry of unwrought aluminum, extrusions, wire, sheet, foil, tubes, fittings, castings and forgings needs a **Commerce aluminum import license (AIM)**, "
    "and every Section 232 aluminum entry must report the **countries where the primary aluminum was smelted and where it was most recently cast**. The Section 232 heading (9903.82.02 or 9903.82.09, or a lower-rate heading) "
    "is reported next to the Chapter 76 line, and the duty is charged on the full value with no FTA reduction.\n\n"
    "The legal ways to pay less are narrow: country exemptions, quotas and product exclusions are gone, and drawback of Section 232 duty is limited. What remains: UK-smelted aluminum (25%), derivatives made from "
    "U.S.-smelted aluminum (10%), Commerce-authorized Canadian or Mexican quantities (25%), civil aircraft relief for tubes, avoiding Chinese origin and Canadian extrusions, classifying correctly, and checking "
    "AD/CVD scope before you buy. Each rule and lever links to its regulation or proclamation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "uk-smelt",
        "title": "Buy UK aluminum smelted or cast in the UK",
        "saves": "Half the Section 232 duty: 25% (9903.82.04) instead of 50%, or 15% (9903.82.05) instead of 25% on household articles",
        "appliesTo": "Section 232 aluminum lines of the United Kingdom",
        "document": "A certificate of analysis or mill records showing the countries of smelt and cast, reported in ACE; at least 95% of the aluminum must have been smelted or most recently cast in the UK.",
        "caveat": "Origin must be the UK and the 95% test must be met; otherwise 50% (25%). The quota contemplated by Executive Order 14309 has not been set up.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(d), headings 9903.82.04–9903.82.05", "url": CH99},
            {"label": "Proclamation 11021 (91 FR 18201)", "url": src["procl-11021"]["url"]},
        ],
    },
    {
        "id": "us-smelted",
        "title": "Derivatives made from U.S.-smelted aluminum",
        "saves": "40 or 15 points: 10% (9903.82.06) instead of 50% or 25% on derivative articles",
        "appliesTo": "Chapter 76 derivatives (7610, 7612–7615, 7616.10.90.90, 7616.99) whose aluminum content is at least 85% smelted and cast in the United States",
        "document": "Smelt and cast records for the aluminum content (by weight), kept for CBP; report 9903.82.06.",
        "caveat": "Not for the aluminum articles of note 16(c)(i) (ingot, extrusions, sheet, foil, tubes, castings and forgings), and not for Russia. The 85% threshold applies from June 8, 2026 (Proclamation 11032).",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(e), heading 9903.82.06", "url": CH99},
            {"label": "Proclamation 11032 (91 FR 34085)", "url": src["procl-11032"]["url"]},
        ],
    },
    {
        "id": "camx-25",
        "title": "Canada or Mexico: the Commerce-authorized 25% rate",
        "saves": "Half the Section 232 duty (25% instead of 50%) on authorized quantities",
        "appliesTo": "Aluminum articles (note 16(c)(i)) of Canada or Mexico that qualify for USMCA and were smelted and cast in Canada or Mexico",
        "document": "Commerce authorization for the producer (submission under the April 23, 2026 procedures), USMCA certification of origin, and entry under heading 9903.82.19.",
        "caveat": "Only for producers that supply U.S. automobile or heavy-vehicle makers and commit to new U.S. aluminum capacity; limited to the quantity Commerce sets. Canadian extrusions and tubes still pay the 50% Section 338 duty.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(i), heading 9903.82.19", "url": CH99},
            {"label": "Proclamation 10984, clause 13 (90 FR 48451)", "url": src["procl-10984"]["url"]},
            {"label": "Commerce procedures (91 FR 21790)", "url": src["fr-2026-07987"]["url"]},
        ],
    },
    {
        "id": "civil-aircraft",
        "title": "Civil aircraft tubes and pipes",
        "saves": "The Section 232 duty (UK, Japan, EU, Korea), the Canada Section 338 duty and the 2026 Section 301 duty on qualifying civil aircraft articles",
        "appliesTo": "Aluminum tubes and pipes (7608) for civil aircraft that meet general note 6",
        "document": "Civil aircraft certification under general note 6 and 19 CFR 10.183; report the relief heading (9903.96.01 UK, 9903.96.02 Japan, 9903.02.76 EU, 9903.02.81 Korea, 9903.03.16 Canada, 9903.05.88).",
        "caveat": "Only goods of the countries named, only on the listed provisions, and only for civil (not military or unmanned) aircraft.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 2(v), 35, 51(d), 52(d)", "url": CH99},
            {"label": "19 CFR 10.183", "url": f"{ECFR}/section-10.183"},
        ],
    },
    {
        "id": "origin",
        "title": "Avoid Chinese origin and Russian metal",
        "saves": "25% of value on Chinese aluminum (Section 301 on top of Section 232), and the 200% that any aluminum smelted or cast in Russia owes",
        "appliesTo": "All 124 lines",
        "document": "Mill certificates and the certificate of analysis showing where the aluminum was smelted and cast and where the product was made. For the tariff, origin follows the last substantial transformation under 19 CFR 102.20; ask CBP for a binding ruling.",
        "caveat": "Third-country processing does not change the Section 232 rate (50% everywhere) and can fall under AD/CVD circumvention findings: Chinese foil finished in Korea or Thailand owes the China foil deposits. Canadian extrusions and tubes pay 50% more than other Canadian aluminum.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 19(m), 31", "url": CH99},
            {"label": "19 CFR 102.20 (Chapter 76 rules)", "url": f"{ECFR}/section-102.20"},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "classify",
        "title": "Classify scrap, fasteners and derivatives correctly",
        "saves": "The 50% or 25% Section 232 duty on lines that are not on the note 16(c) lists: scrap (7602), powders (7603), tanks (7611), pot scourers (7615.10.11), fasteners (7616.10, except 7616.10.90.90) and wire cloth (7616.91)",
        "appliesTo": "7602, 7603, 7611, 7615 and 7616",
        "document": "Technical specifications (scrap grade vs remelt scrap ingot; fastener type) and, if unsure, a CBP binding ruling.",
        "caveat": "Classification follows the product, not the duty: a remelt scrap ingot (7601.20.90.75) is unwrought aluminum at 50%. Most non-232 lines still pay the 2026 Section 301 duty.",
        "citations": [
            {"label": "HTSUS Chapter 76, notes", "url": CH76},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(c)", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA for the non-232 lines",
        "saves": "The 10% Section 301 duty on Canadian and Mexican powders, tanks, pot scourers, fasteners and wire cloth (9903.05.93, 9903.05.94), plus their base rate",
        "appliesTo": "The 12 Chapter 76 lines that pay the 2026 Section 301 duty, for originating goods of Canada or Mexico",
        "document": "A USMCA certification of origin from the importer, exporter or producer (no set format), available to CBP on request.",
        "caveat": "A USMCA claim does not reduce Section 232 (note 16(b)) or the Section 338 duty on Canadian extrusions and tubes.",
        "citations": [
            {"label": "19 CFR 182.12", "url": f"{ECFR}/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check AD/CVD scope before you buy",
        "saves": "The whole antidumping or countervailing duty, when the product or producer is outside the order",
        "appliesTo": "Extrusions (China), common alloy sheet (China and 16 countries), foil (China, Armenia, Brazil, Oman, Russia, Türkiye) and disposable containers (China)",
        "document": "The order's written scope (it, not the HTS number, decides) and the producer's company-specific cash-deposit rate; when unsure, request a scope ruling from Commerce.",
        "caveat": "A product in scope pays the cash deposit even if entered under another HTS line; the China extrusions orders also reach extrusions that are parts of other goods. AD/CVD rates change with each administrative review.",
        "citations": [
            {"label": "19 CFR 351.225 (scope rulings)", "url": f"{ECFR}/section-351.225"},
            {"label": "Aluminum extrusions AD order (76 FR 30650)", "url": src["fr-2011-13086"]["url"]},
        ],
    },
    {
        "id": "drawback",
        "title": "Drawback: limited for Section 232",
        "saves": "Up to 99% of the base rate, Section 301 and other ordinary duties on goods that are exported or used in exported products; Section 232 only as below",
        "appliesTo": "All lines; Section 232 duty only on the 25% derivatives (Annex I-B) of trade-agreement partners",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Proclamation 11021 allows manufacturing drawback of Section 232 duty only for Annex I-B and III derivatives of the UK, EU, Japan, Korea, Mexico, Canada and later agreement partners, made from partner-smelted aluminum, and not of a type under an AD/CVD order "
        "(disposable containers are). The 50% aluminum articles get none. AD/CVD are never refundable (19 CFR 191.3).",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{ECFR}/part-191"},
            {"label": "19 CFR 191.3", "url": f"{ECFR}/section-191.3"},
            {"label": "Proclamation 11021, clauses 13–14", "url": src["procl-11021"]["url"]},
        ],
    },
]
ADCVD = {
    "adcvd-extrusions": ("Commerce (ITA) / CBP", "Aluminum extrusions AD/CVD orders on China (2011, continued 2022), including extrusions that are parts of other goods; the 2024 case on 14 other countries ended without orders. Not in the tariff calculator",
                         [("76 FR 30650 (AD order)", "fr-2011-13086"), ("76 FR 30653 (CVD order)", "fr-2011-13103"), ("87 FR 66128 (continued 2022)", "fr-2022-23810"), ("89 FR 92720 (ITC negative, 14 countries)", "fr-2024-27376")]),
    "adcvd-sheet": ("Commerce (ITA) / CBP", "Common alloy aluminum sheet AD/CVD orders: China (2019, continued 2024; includes 4017 sheet) and Bahrain, Brazil, Croatia, Egypt, Germany, India, Indonesia, Italy, Oman, Romania, Serbia, Slovenia, South Africa, Spain, Taiwan, Türkiye (2021, CVD on Bahrain, India, Türkiye; in sunset review). Not in the tariff calculator",
                    [("84 FR 2813 (China AD)", "fr-2019-01836"), ("84 FR 2157 (China CVD)", "fr-2019-01273"), ("89 FR 72826 (China continued)", "fr-2024-19942"), ("88 FR 48438 (4017 sheet)", "fr-2023-15947"),
                     ("86 FR 22139 (16 countries AD)", "fr-2021-08713"), ("86 FR 22144 (CVD)", "fr-2021-08714"), ("91 FR 35706 (ITC full reviews)", "fr-2026-11829")]),
    "adcvd-foil": ("Commerce (ITA) / CBP", "Aluminum foil AD/CVD orders: China (2018, continued 2023; foil finished in Korea and Thailand from Chinese foil covered) and Armenia, Brazil, Oman, Russia, Türkiye (2021, CVD on Oman and Türkiye; sunset review begun October 2026). Not in the tariff calculator",
                   [("83 FR 17362 (China AD)", "fr-2018-08115"), ("83 FR 17360 (China CVD)", "fr-2018-08116"), ("88 FR 67728 (China continued)", "fr-2023-21653"), ("88 FR 82824 (circumvention)", "fr-2023-26030"),
                    ("86 FR 62790 (five countries AD)", "fr-2021-24859"), ("86 FR 62782 (CVD)", "fr-2021-24858"), ("91 FR 62552 (ITC review)", "fr-2026-20139")]),
    "adcvd-containers": ("Commerce (ITA) / CBP", "Disposable aluminum containers, pans, trays and lids AD/CVD orders on China (May 2025). Not in the tariff calculator",
                         [("90 FR 19467 (AD/CVD orders)", "fr-2025-08089")]),
}
te["rules"] = [
    {"id": "aim", "agency": "Commerce (ITA)", "title": "Aluminum import license (AIM) before filing the entry summary, with the countries of smelt and most recent cast; for 7601, 7604–7609 and 7616.99.51.60/.70, consumption and FTZ entries, not for informal entries",
     "citations": [{"label": "19 CFR 361.101", "url": f"{ECFR}/section-361.101"}, {"label": "19 CFR 361.103", "url": f"{ECFR}/section-361.103"}, {"label": "85 FR 83804 (AIM final rule)", "url": src["fr-2020-28166"]["url"]}]},
    {"id": "smelt-cast", "agency": "CBP", "title": "Report the primary and secondary country of smelt and the country of most recent cast on every Section 232 aluminum entry (ACE)",
     "citations": [{"label": "CBP CSMS # 64366327", "url": src["csms-64366327"]["url"]}, {"label": "Proclamation 10782 (smelt and cast definitions)", "url": src["procl-10782"]["url"]}]},
    {"id": "s232-entry", "agency": "CBP", "title": "Section 232: report 9903.82.02 (50%) or 9903.82.09 (25%), or 9903.82.04 / .05 (UK), .06 (U.S.-smelted), .19 (authorized Canada/Mexico), 9903.85.67 / .68 (Russia) with the Chapter 76 line; duty on the full value, on top of any FTA rate",
     "citations": [{"label": "CBP CSMS # 68253075", "url": src["csms-68253075"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99}]},
    {"id": "ftz", "agency": "CBP", "title": "Section 232 aluminum admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
     "citations": [{"label": "19 CFR 146.41", "url": f"{ECFR}/section-146.41"}, {"label": "Proclamation 11021, clause 12", "url": src["procl-11021"]["url"]}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container",
     "citations": [{"label": "19 CFR 134.11", "url": f"{ECFR}/section-134.11"}]},
    {"id": "russia", "agency": "CBP", "title": "Russian aluminum, or aluminum of any origin smelted or cast in Russia: 200% (9903.85.67 / .68); Russian goods also pay column 2 or 70% in lieu of column 2 on note 30(d) lines",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 19(m), 30", "url": CH99}, {"label": "Proclamation 10522 (88 FR 13267)", "url": src["procl-10522"]["url"]}]},
]
for rid, (agency, title, cites) in ADCVD.items():
    te["rules"].append({"id": rid, "agency": agency, "title": title, "citations": [{"label": lab, "url": src[sid]["url"]} for lab, sid in cites]})

S232_RULES = ["smelt-cast", "s232-entry", "ftz", "marking", "russia"]
AIM_H = {"7601", "7604", "7605", "7606", "7607", "7608", "7609"}
GROUP_ADCVD = {"7604": ["adcvd-extrusions"], "7608": ["adcvd-extrusions"], "7610": ["adcvd-extrusions"], "7606": ["adcvd-sheet"], "7607": ["adcvd-foil", "adcvd-sheet"],
               "7612": ["adcvd-containers"], "7615": ["adcvd-containers"], "7616": ["adcvd-extrusions"]}
GROUP_NOTES = {
    "7601": "Section 232 aluminum article: AIM license, smelt and cast reporting, 50%. Canadian and Mexican smelters can get Commerce-authorized 25% quantities.",
    "7602": "Outside Section 232 and AIM; on the 2026 Section 301 exemption list. Free except for China (25%), Brazil (25%) and Russia (column 2). Remelt scrap ingot is 7601, not scrap.",
    "7603": "Outside Section 232 and AIM; pays the 2026 Section 301 duty for most countries.",
    "7604": "Extrusions: AIM license, smelt and cast reporting, 50%; Canada also 50% Section 338. AD/CVD orders on extrusions from China.",
    "7605": "Section 232 aluminum article: AIM license, smelt and cast reporting, 50%.",
    "7606": "Sheet and plate: AIM license, 50%; common alloy sheet AD/CVD orders on China and 16 other countries.",
    "7607": "Foil: AIM license, 50%; foil AD/CVD orders on China (and Chinese foil finished in Korea or Thailand), Armenia, Brazil, Oman, Russia and Türkiye. Some foil-gauge can stock is in the sheet orders.",
    "7608": "Tubes and pipes: AIM license, 50%; Canada also 50% Section 338; civil aircraft relief for some countries. Extruded tubes from China can fall within the extrusions orders.",
    "7609": "Section 232 aluminum article: AIM license, smelt and cast reporting, 50%.",
    "7610": "Section 232 derivative at 50% (10% with U.S.-smelted aluminum). Window and door frames made of Chinese extrusions can fall within the extrusions orders.",
    "7611": "Outside Section 232; pays the 2026 Section 301 duty for most countries.",
    "7612": "Section 232 derivative at 50%. Disposable container lids of 7612.90 can fall within the China containers orders.",
    "7613": "Section 232 derivative at 50%.",
    "7614": "Section 232 derivative at 50%. Insulated aluminum wire and cable is in Chapter 85 (the China aluminum wire and cable orders cover 8544, not 7614).",
    "7615": "Household articles: Section 232 derivative at 25% (UK 15%, U.S.-smelted 10%); pot scourers outside. Disposable aluminum containers from China are under AD/CVD orders.",
    "7616": "Castings and forgings (7616.99.51.60/.70) need the AIM license and pay 50%; ladders, blinds and luggage frames pay 25%; most fasteners and wire cloth are outside Section 232.",
}
for g in te["groups"]:
    h = g["heading"]
    rules = []
    if h in AIM_H:
        rules.append("aim")
    if any(x[:4] == h and (x in S50 or x in S25) for x in LINE):
        rules += S232_RULES
    else:
        rules += ["marking", "russia"]
    rules += GROUP_ADCVD.get(h, [])
    g["label"] = G[h][0]
    g["ruleIds"] = list(dict.fromkeys(rules))
    g["note"] = GROUP_NOTES[h]
ADCVD_HEADINGS = set(GROUP_ADCVD)
DERIVS = (S50 - ARTICLES) | S25
for ln in te["lines"]:
    hts = ln["hts"]
    h = hts[:4]
    rules = []
    if hts in ARTICLES:
        rules.append("aim")
    if hts in S50 or hts in S25:
        rules += S232_RULES
    else:
        rules += ["marking", "russia"]
    rules += GROUP_ADCVD.get(h, [])
    ln["ruleIds"] = list(dict.fromkeys(rules))
    levers = []
    if hts in S50 or hts in S25:
        levers.append("uk-smelt")
    if hts in DERIVS:
        levers.append("us-smelted")
    if hts in ARTICLES and hts in {x for x in LINE if x[:4] in AIM_H or x in ("7616.99.51.60", "7616.99.51.70")}:
        levers.append("camx-25")
    if h == "7608":
        levers.append("civil-aircraft")
    levers.append("origin")
    if h in ("7602", "7603", "7611", "7615", "7616"):
        levers.append("classify")
    if hts in S301:
        levers.append("usmca")
    if h in ADCVD_HEADINGS:
        levers.append("adcvd-scope")
    levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 headings change often, and AD/CVD rates are company-specific "
    "and change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and Commerce's latest notices before importing."
)

# ------------------------------------------------------------------ trade-dependent text + finalConclusion


def fix_labels(x):
    if isinstance(x, dict):
        return {k: fix_labels(v) for k, v in x.items()}
    if isinstance(x, list):
        return [fix_labels(v) for v in x]
    if isinstance(x, str) and "…" in x:
        for h, lab in ORIG_LABELS.items():
            if lab.endswith("…"):
                x = x.replace(lab, G[h][0]).replace(lab.lower(), G[h][0].lower())
    return x


d["understandIndustry"] = fix_labels(d["understandIndustry"])
d["overview"]["tradeSnapshot"] = fix_labels(d["overview"]["tradeSnapshot"])
apply_trade(d, src)
_left = [m for m in __import__("re").findall(r"[^\"]{0,60}…", json.dumps(d, ensure_ascii=False))]
assert not _left, _left[:5]

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
