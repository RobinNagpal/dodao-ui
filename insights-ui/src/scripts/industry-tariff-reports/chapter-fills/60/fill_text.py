# Page text for Chapter 60. Executed by fill.py with d, src, add_sources, usd, imp, share, TOTAL, YEAR, YTOT, ui in scope.

TOP = [c["country"] for c in ui["byCountry"]]
HEAD_IMP = {}
for ln in ui["byLine"]:
    HEAD_IMP[ln["heading"]] = HEAD_IMP.get(ln["heading"], 0) + ln["importsUsd"]
LINE_IMP = {ln["hs6"]: ln["importsUsd"] for ln in ui["byLine"]}


def hshare(h):
    return 100 * HEAD_IMP.get(h, 0) / TOTAL


def lshare(hs6):
    return 100 * LINE_IMP.get(hs6, 0) / TOTAL


def pct(x):
    return f"{x:.0f}%"


PRIOR = YTOT.get(YEAR - 1)
CHG = (TOTAL / PRIOR - 1) * 100 if PRIOR else None

LABELS = {
    "6001": ("Pile fabrics: long pile (faux fur), looped pile (terry), velour and plush", "Pile fabrics"),
    "6002": ("Narrow knit fabrics (≤ 30 cm) with 5%+ elastomeric yarn or rubber thread", "Narrow elastic knits"),
    "6003": ("Other narrow knit fabrics (≤ 30 cm wide)", "Narrow knits, other"),
    "6004": ("Wide knit fabrics (> 30 cm) with 5%+ elastomeric yarn or rubber thread", "Wide stretch knits"),
    "6005": ("Warp knit fabrics, including galloon (raschel, tricot, mesh)", "Warp knits"),
    "6006": ("Other knitted fabrics: weft/circular knits (jersey, interlock, rib, fleece)", "Other (circular) knits"),
}

# ------------------------------------------------------------------ overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 60: Knitted or Crocheted Fabrics — Tariff Rates for Jersey, Spandex, Fleece, Pile & Warp Knit Fabric (2026)"
ov["seo"]["title"] = "HTS Chapter 60 Knitted Fabric Tariff 2026: HS Codes 6001–6006 & Import Duty Rates | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 106 HTS Chapter 60 lines — pile, spandex (6004.10), warp knit (6005) and jersey/interlock "
    "knits (6006). General, FTA and Column 2 rates plus the 2026 extra duty for China, Vietnam, Taiwan, Korea, Mexico and Canada."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 60",
    "knitted or crocheted fabrics tariff",
    "knitted fabric hs code",
    "knit fabric tariff code",
    "knitted or crocheted fabrics import duty rates",
    "hs code 6006.32",
    "hs code 6004.10",
    "spandex fabric hs code",
    "polyester knit fabric hs code",
    "china tariff on knitted or crocheted fabrics",
    "usmca yarn-forward rules",
]
ov["intro"] = (
    "Chapter 60 covers knitted and crocheted fabric sold by the meter or roll: **pile fabrics** such as faux fur, terry and velour "
    "(6001), **narrow knits** up to 30 cm wide (6002–6003), **wide stretch fabrics** with 5% or more spandex (6004), **warp knits** "
    "such as tricot, raschel and mesh (6005) and **other knits** — the circular-knit jersey, interlock and rib of 6006. Garments and "
    "made-up articles cut from these fabrics are in chapters 61 and 63; coated or laminated knits (other than pile) are in chapter 59. "
    f"Its **106 tariff lines** carry base rates of 4% to 18.5%; most are 10%.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of 10% or "
    "12.5%** — 10% or 12.5% in total for Taiwan, the EU, Japan and Korea, where it replaces a lower base rate — and FTA partners "
    "such as **Korea and Israel**, duty-free before 2025, now pay 12.5%. **China pays up to 37.5% "
    "more** (25% under List 3 plus 12.5%) on 97 lines. USMCA-qualifying fabric from **Mexico** and **Canada** enters free — except "
    "Canadian synthetic interlock and double-knit fabric (6006.31–6006.33), which pays **50%** under Section 338. "
    f"The U.S. imported **{usd(TOTAL)}** of Chapter 60 fabric in {YEAR}; {TOP[0]} supplied {pct(share(TOP[0]))}, then "
    f"{TOP[1]} and {TOP[2]}."
)
ov["stats"] = [s for s in ov["stats"] if s["label"] in ("Tariff lines", "Lines with a base-rate duty", "Lines with an extra duty for some origins")]
ov["stats"].append({"label": f"{YEAR} imports", "value": usd(TOTAL)})
ov["stats"].append({"label": f"{TOP[0]} share", "value": pct(share(TOP[0]))})
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
BLURBS = {
    "6001": (
        "Knitted pile fabric: long pile made by knitting in card sliver (faux fur, sherpa — 6001.10), looped pile and knit terry "
        "(6001.21–29) and cut pile such as velour and plush (6001.91–99). The highest-duty heading: 17.2% for man-made fibers, "
        f"18.5% for cotton velour. {pct(hshare('6001'))} of {YEAR} imports.",
        ["faux fur fabric", "sherpa fabric", "velour fabric", "plush fabric", "minky fabric", "knit terry", "polar fleece", "long pile fabric"],
    ),
    "6002": (
        "Knit or crochet fabric no wider than 30 cm with 5% or more elastomeric yarn or rubber thread — elastic tapes and trims sold "
        "in the piece. 8.8% for cotton, 8% for other fibers.",
        ["elastic knit tape", "narrow elastic fabric", "spandex trim", "elastic binding"],
    ),
    "6003": (
        "Other knit fabric up to 30 cm wide: knitted bindings, rib trims and narrow tubular knits. Warp-knit open-work (14.1%) is "
        "split from other narrow fabric (6.6%–8%) for each fiber.",
        ["rib knit trim", "knitted binding tape", "narrow knit fabric", "tubular rib"],
    ),
    "6004": (
        "Fabric over 30 cm wide with 5% or more spandex (elastane) and no rubber thread — the stretch jersey, power mesh and "
        f"swimwear fabric of 6004.10 (12.3%). {pct(hshare('6004'))} of {YEAR} imports. With rubber thread it is 6004.90.20 (12.3%).",
        ["spandex fabric", "lycra fabric", "elastane fabric", "nylon spandex fabric", "polyester spandex fabric", "power mesh", "swimwear fabric"],
    ),
    "6005": (
        "Warp knits made on tricot, raschel or galloon machines: tricot, mesh, net, stitch-bonded fabric and insecticide-treated "
        "mosquito netting (6005.35). All lines are 10%; China List 3 skips some artificial-fiber lines. "
        f"{pct(hshare('6005'))} of {YEAR} imports, the largest heading.",
        ["warp knit fabric", "tricot fabric", "raschel fabric", "mesh fabric", "net fabric", "stitch-bonded fabric", "mosquito net fabric"],
    ),
    "6006": (
        "Other knitted fabric — mostly weft or circular knits: single jersey, interlock, double knit, rib and brushed fleece, split "
        f"by fiber and by finish (bleached, dyed, yarn-dyed, printed). 10% on cotton and man-made fibers. {pct(hshare('6006'))} of "
        f"{YEAR} imports.",
        ["jersey fabric", "single jersey", "interlock fabric", "rib knit fabric", "cotton knit fabric", "polyester knit fabric", "double knit", "knit fleece"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Dyed polyester jersey from China",
        "line": "6006.32.00.80",
        "body": "Dyed synthetic knit fabric (not double knit or interlock) is 10% at the general rate. China adds 25% under List 3 "
        "(9903.88.03) and 12.5% under the 2026 action (9903.05.31): **47.5%** in all, or **$4,750** on a $10,000 shipment.",
    },
    {
        "title": "Spandex jersey from Taiwan",
        "line": "6004.10.00.85",
        "body": "Weft-knit fabric over 30 cm wide with 5% or more elastomeric yarn is 12.3%. Taiwan's Section 301 rate is 10% in total "
        "only where the base rate is lower (U.S. note 52(k), 9903.05.76), so this line pays its own **12.3%**: **$1,230** on a "
        "$10,000 shipment. The same fabric from Vietnam pays 12.3% + 12.5% = **24.8%**.",
    },
    {
        "title": "Dyed nylon interlock from Canada, with a USMCA claim",
        "line": "6006.32.00.20",
        "body": "A USMCA claim removes the 10% base rate and Canada's 10% Section 301 duty (9903.05.93), but 6006.32 is on the Section "
        "338 list (U.S. note 51(b)(3), 9903.03.14), whose 50% applies even to USMCA goods: **$5,000** on a $10,000 shipment entered "
        "since August 22, 2026. Without a USMCA claim it is 10% + 10% + 50% = **70%**.",
    },
    {
        "title": "Cotton jersey from Mexico, yarn-forward",
        "line": "6006.22.90.20",
        "body": "Dyed single-knit cotton fabric is 10% at the general rate. Knit in Mexico from yarn spun in North America from North "
        "American cotton, it meets the USMCA rule for Chapter 60 (General Note 11) and enters **free** — no base rate and no Section 301 duty (9903.05.94). Knit "
        "from Asian cotton yarn it fails the rule and pays 10% + 10% = **$2,000** on $10,000.",
    },
    {
        "title": "Faux fur from China with the product exclusion",
        "line": "6001.10.20.00",
        "body": "Long pile knit fabric of man-made fibers is 17.2%. Acrylic pile on a polyester ground valued at no more than $16 per m² "
        "is on the China product exclusion list (U.S. note 20(vvv)(iii)(32), 9903.88.69) through November 9, 2026, which removes "
        "the 25% List 3 duty but not the 12.5% (9903.05.31): **29.7%** instead of 54.7% — $2,970 rather than $5,470 on $10,000.",
    },
]

ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": c["country"], "importsUsd": c["importsUsd"]} for c in ui["byCountry"][:5]]
top_lines = sorted(ui["byLine"], key=lambda x: -x["importsUsd"])[:3]
BIG_LABEL = {
    "6005.90": "Warp knit fabric of wool or other fibers",
    "6001.22": "Looped pile fabric of man-made fibers",
    "6006.32": "Dyed synthetic knit fabric",
    "6004.10": "Wide knit fabric with 5%+ spandex",
    "6001.92": "Pile fabric (velour, plush) of man-made fibers",
    "6005.37": "Dyed synthetic warp knit fabric",
    "6006.22": "Dyed cotton knit fabric",
    "6006.42": "Dyed artificial-fiber (rayon) knit fabric",
    "6006.34": "Printed synthetic knit fabric",
    "6001.10": "Long pile fabric (faux fur)",
    "6006.31": "Unbleached or bleached synthetic knit fabric",
    "6006.33": "Yarn-dyed synthetic knit fabric",
    "6005.36": "Unbleached or bleached synthetic warp knit",
    "6006.90": "Other knit fabric",
    "6006.21": "Unbleached or bleached cotton knit fabric",
    "6006.24": "Printed cotton knit fabric",
    "6005.39": "Printed synthetic warp knit fabric",
}
ts["biggestLines"] = [{"hts": ln["hs6"], "label": BIG_LABEL.get(ln["hs6"], ln["description"][:60])} for ln in top_lines]
ts["source"] = f"UN Comtrade, United States imports, HS chapter 60 ({YEAR})"
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line (for example, nylon or polyester interlock) each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** Chapter 60 does not cover crochet lace of heading 5804, knitted labels and badges of heading 5807, or knitted "
    "fabric impregnated, coated, covered or laminated (chapter 59) — but coated or laminated knitted **pile** fabric stays in "
    "heading 6001.\n\n"
    "**Note 2.** Fabric of metal thread of a kind used in apparel or furnishings is included.\n\n"
    "**Note 3.** \"Knitted\" goods include stitch-bonded goods whose chain stitches are of textile yarn (statistical lines "
    "6005.36–6005.44, suffix 20).\n\n"
    "**Subheading note 1.** 6005.35 is warp-knit mosquito-net fabric of polyethylene monofilament or polyester multifilament, "
    "30–55 g/m², 20–100 holes/cm², impregnated or coated with alpha-cypermethrin, chlorfenapyr, deltamethrin, lambda-cyhalothrin, "
    "permethrin or pirimiphos-methyl.\n\n"
    "Section XI notes also apply: a blend is classified by the fiber that predominates by weight (note 2), and fabric cut to "
    "shape or otherwise made up leaves Chapter 60 for chapters 61–63 (notes 7–8)."
)
ov["notes"]["additionalUsNotes"] = (
    "**Additional U.S. note 1.** \"Long pile\" fabrics (6001.10) are made by inserting fibers from card sliver into the loops of "
    "the ground fabric during knitting — the construction of most faux fur and sherpa.\n\n"
    "**Additional U.S. note 2.** \"Open-work fabrics\" have stable open meshes, with or without inwrought designs (the 14.1% "
    "lines of 6003 and the suffix-10 lines of 6005).\n\n"
    "**Statistical note 1.** \"Velour\" (6001.92.00.10 and .30) means fabric with 12 or more stitches per centimeter in the "
    "vertical direction. The three-digit numbers in brackets (222, 223, 224, 229, 414, 899) are textile category numbers used to "
    "monitor shipments."
)

# ------------------------------------------------------------------ tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 60 Tariff Updates: Knitted & Crocheted Fabric Duties (2025–2026)"
tu["seo"]["title"] = "Knitted Fabric Tariff Updates 2026: HTS Chapter 60 — Section 301, China Lists, Canada 338, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 60 knit fabric imports since January 2025: unchanged base rates, the end of the IEEPA tariffs and "
    "the Section 122 surcharge, the 2026 Section 301 tariffs, China List 3 and its faux-fur exclusion, and Canada's 50% Section 338 "
    "duty on synthetic interlock."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 60 tariff updates",
    "knitted or crocheted fabrics tariff",
    "knit fabric tariff 2026",
    "china tariff on knitted or crocheted fabrics",
    "section 301 tariff on textiles",
    "section 122 tariff on textiles",
    "usmca fabric duty exemptions",
    "mexico chapter 60 trade updates",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 106 Chapter 60 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — up to 50% on Indian and Brazilian fabric — **ended on "
    "February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on **July 23, 2026**. Since **July 24, 2026**, "
    "goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**; no Chapter 60 line is on the general exemption list, "
    "and only Jordan, and Guatemala and El Salvador for CAFTA-DR goods, have exception lists covering knit fabric. China keeps its "
    "25% List 3 duty, Brazil pays another 25%, and since **August 22, 2026 Canada pays 50%** under Section 338 on synthetic "
    "double-knit and interlock fabric (6006.31–6006.33)."
)
tu["scope"] = (
    "Measures that reach Chapter 60 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, the "
    "Brazil Section 301 tariff, China Section 301 Lists 3 and 4A and the faux-fur exclusion, the Canada Section 338 duty, the "
    "Nicaragua Section 301 phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended. No antidumping or "
    "countervailing duty order and no Section 232 action covers a Chapter 60 line. For the rate each supplier pays, see Rates by "
    "country."
)

CN_EX = (
    "List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers 97 of the 106 lines; 6005.35 (insecticide-treated mosquito-net "
    "fabric) is on List 4A (+7.5%, 9903.88.15); and four subheadings — 6001.22, 6005.41, 6006.24.90 and 6006.41 — were only on "
    "List 4B, which is suspended (9903.88.16), so they pay the 12.5% alone. The 2026 action adds +12.5% (9903.05.31) to every "
    "line, and China is on no exception list. A product exclusion (U.S. note 20(vvv)(iii)(32), 9903.88.69) removes the 25% from "
    "long pile fabric of acrylic pile on a polyester ground valued at no more than $16/m² (6001.10.20) through November 9, 2026. "
    "USTR confirmed on October 7, 2026 that the 2018 actions continue. The IEEPA duties on China ended February 24, 2026."
)
EXEMPT = {
    "cn-section-301": (
        CN_EX,
        "Most Chinese knit fabric pays 37.5% on top of the base rate — 47.5% on the 10% jersey, interlock and warp-knit lines, up to "
        f"56% on cotton pile. China shipped {usd(imp('China'))} in {YEAR}.",
        ["fr-2025-21671", "eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 60, and Vietnam has no FTA with the United States. " + ENDED,
        f"Vietnamese knit fabric ({usd(imp('Vietnam'))} in {YEAR}) pays the base rate plus 12.5%: 22.5% on the 10% lines, 24.8% on "
        "spandex fabric (6004.10).",
        ["eo-14389"],
    ),
    "tw-section-301": (
        "Taiwan's rate is 10% in total in place of the base rate when the base rate is lower (U.S. note 52(k), 9903.05.76). Every "
        "Chapter 60 base rate is at least 4%, and most are 10% or more, so Taiwanese fabric mostly pays only its base rate: 10% on "
        "jersey and warp knits, 12.3% on spandex fabric, 17.2% on synthetic pile. Taiwan's exception list (note 52(j), "
        "9903.06.14) names no Chapter 60 code. " + ENDED,
        f"Taiwan ({usd(imp('Taiwan'))} in {YEAR}) pays no more than before the 2025 tariffs on its main lines: the base rate, or "
        "10% where the base is lower (some pile lines, the narrow fabrics of 6002–6003, 6004.90.90 and 6006.90).",
        ["eo-14389"],
    ),
    "kr-section-301": (
        "South Korea's rate is 12.5% in total in place of the base rate when that is lower (U.S. note 52(k), 9903.05.71). With "
        "a KORUS claim (SPI KR) the base rate is Free, so Korean fabric pays 12.5% in total; without one, lines above 12.5% (pile, "
        "warp-knit open-work) pay their own base rate. Korea has no exception list. " + ENDED,
        f"Korean knit fabric ({usd(imp('South Korea'))} in {YEAR}) pays 12.5% in total with a KORUS claim — the FTA no longer "
        "makes it duty-free.",
        ["eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (U.S. note 52(h), 9903.05.94). Under USMCA (General Note 11, Chapter 60 "
        "rule) knit fabric qualifies when knit in North America without non-originating materials of headings 5106–5113, chapter 52, "
        "5310–5311 or chapters 54–55 — North American yarn, and for cotton and man-made fibers North American fiber (yarn-forward). Up to 10% by weight of "
        "non-originating fiber or yarn is allowed, but non-originating elastomeric yarn only up to 7%. The 2025 IEEPA duty on "
        "Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "Mexican knit fabric pays $0 with a valid USMCA claim and the base rate plus 10% without one.",
        ["eo-14389"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (U.S. note 52(g), 9903.05.93), but the 50% Section 338 duty (U.S. note "
        "51(b)(3), 9903.03.14) on synthetic knit fabric of 6006.31, 6006.32 and 6006.33 (unbleached, dyed and yarn-dyed, all "
        "constructions) applies with or without a USMCA claim; printed 6006.34 is not on the list. No Chapter 60 line is on the "
        "September 29, 2026 import-ban annexes. The IEEPA duty on Canada ended February 24, 2026.",
        "Canadian knit fabric pays nothing extra with USMCA, except synthetic 6006.31–6006.33 fabric, which pays 50% (70% "
        "without a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "eu-section-301": (
        "The EU rate is 10% in total in place of the base rate when that is lower (U.S. note 52(k), 9903.05.39). The EU exception "
        "list (note 52(j)(2), 9903.05.97) names no Chapter 60 code. Most Chapter 60 base rates are 10% or more, so EU knit fabric "
        "mostly pays its base rate only; lines below 10% — some pile fabrics (6001.10.60, 6001.21, 6001.29, 6001.99), the narrow fabrics of 6002–6003 other than open-work, 6004.90.90 and 6006.90 — rise to 10%. " + ENDED,
        "Italian, German and other EU knit fabric pays its base rate (10%–18.5%), or 10% where the base is lower.",
        ["eo-14389"],
    ),
    "jp-section-301": (
        "Japan's rate is 12.5% in total in place of the base rate when that is lower (U.S. note 52(k), 9903.05.49); Japan has no "
        "exception list. " + ENDED,
        "Japanese knit fabric pays 12.5% on the 10% and 12.3% lines and its own base rate on pile and open-work lines above 12.5%.",
        ["eo-14389"],
    ),
    "in-section-301": (
        "India has no exception list. Chapter 60 lines do not offer GSP. The 2025 IEEPA duties (25% reciprocal plus 25% over "
        "Russian oil purchases) ended in February 2026.",
        "Indian knit fabric pays the base rate plus 10%: 20% on the 10% lines.",
        ["eo-14384", "eo-14389"],
    ),
    "pk-section-301": (
        "Pakistan has no exception list, and no Chapter 60 line offers GSP. " + ENDED,
        "Pakistani knit fabric (mostly cotton) pays the base rate plus 10%: 20% on cotton jersey.",
        ["eo-14389"],
    ),
    "gb-section-301": (
        "The UK exception list (U.S. note 52(j)(1), 9903.05.96) names no Chapter 60 subheading. " + ENDED,
        "British knit fabric pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "tr-section-301": (
        "Turkey has no exception list for Chapter 60. " + ENDED,
        "Turkish knit fabric pays the base rate plus 12.5%: 22.5% on the 10% lines.",
        ["eo-14389"],
    ),
    "id-section-301": (
        "Indonesia's exception list (U.S. note 52(j), 9903.06.16) names no Chapter 60 subheading. " + ENDED,
        "Indonesian knit fabric pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "th-section-301": (
        "Thailand has no exception list for Chapter 60. " + ENDED,
        "Thai knit fabric pays the base rate plus 12.5%.",
        ["eo-14389"],
    ),
    "gt-section-301": (
        "Guatemala's CAFTA-DR list (U.S. note 52(j)(6)(iii), 9903.06.06) covers all 60 Chapter 60 subheadings when CAFTA-DR is "
        "claimed (SPI P), and note 52(i) (9903.05.95) exempts CAFTA-DR textile goods entered duty-free. CAFTA-DR's Chapter 60 rule "
        "is yarn-forward (General Note 29). 6006.90.90 has no CAFTA-DR rate (its general rate is Free), so it pays the 10%. " + ENDED,
        "Guatemalan knit fabric that qualifies under CAFTA-DR enters free; non-qualifying fabric pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "sv-section-301": (
        "El Salvador's CAFTA-DR list (U.S. note 52(j)(7)(iii), 9903.06.09) covers all 60 Chapter 60 subheadings when CAFTA-DR is "
        "claimed (SPI P), and note 52(i) (9903.05.95) exempts CAFTA-DR textile goods entered duty-free. 6006.90.90 has no CAFTA-DR "
        "rate, so it pays the 10%. " + ENDED,
        "Salvadoran knit fabric that qualifies under CAFTA-DR enters free; non-qualifying fabric pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "hn-section-301": (
        "Note 52(i) (9903.05.95) exempts CAFTA-DR textile and apparel goods of Honduras entered duty-free under CAFTA-DR; Honduras "
        "has no code list of its own, so 52(i) is its only relief. 6006.90.90 has no CAFTA-DR rate (its general rate is Free), so it "
        "pays the 10%. " + ENDED,
        "Honduran knit fabric that qualifies under CAFTA-DR enters free; non-qualifying fabric pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 60 line; its exemption list (U.S. note 50(a)(ii), "
        "9903.05.03) names no Chapter 60 subheading. The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% "
        "reciprocal and 40%) ended February 24, 2026.",
        "Brazilian knit fabric pays 37.5% on top of the base rate: 47.5% on the 10% lines.",
        ["eo-14323", "eo-14389"],
    ),
    "il-section-301": (
        "Israel has no exception list. The U.S.–Israel FTA (SPI IL) makes the base rate Free, but the 12.5% (9903.05.47) applies "
        "with or without the claim (U.S. note 52(a)). " + ENDED,
        f"Israeli knit fabric ({usd(imp('Israel'))} in {YEAR}, the third-largest supplier) pays 12.5% in total with an FTA claim, where it was duty-free before 2025.",
        ["eo-14389"],
    ),
    "other-section-301": (
        "Exception lists in U.S. note 52(j) cover Chapter 60 for Jordan (all 60 subheadings, 9903.06.20) and, for CAFTA-DR claims, "
        "Guatemala and El Salvador (9903.06.06, 9903.06.09). Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods of Costa Rica, "
        "the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered duty-free under CAFTA-DR. No other "
        "country list, and not the general list (note 52(b)), names a Chapter 60 code. " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Jordanian fabric and CAFTA-DR-qualifying Central American "
        "fabric enter without the Section 301 duty.",
        ["eo-14389"],
    ),
}
IE = {x["id"]: x for x in tu["inEffect"]}
for k, x in IE.items():
    if k not in EXEMPT:
        raise SystemExit(f"no exemption text for {k}")
    ex, wim, extra = EXEMPT[k]
    x["exemption"] = ex
    x["whatItMeans"] = wim
    for sid in extra:
        if sid not in x["sourceIds"]:
            x["sourceIds"].insert(len(x["sourceIds"]) - 1, sid)
    add_sources(tu, extra)

gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 60 base-rate changes"
base["detail"] = (
    "All 106 Chapter 60 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition; "
    "no line was added, split or renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {"id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
            "before": before, "now": now, "countries": countries, "sourceIds": sids}


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 List 3 continues",
       "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
       "review. For Chapter 60 this keeps +25% (9903.88.03) on 97 lines and +7.5% (9903.88.15) on 6005.35.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 60",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles from September "
       "29, 2026. No Chapter 60 line is on their annexes.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; synthetic knit fabric stays on it",
       "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026, and made the duty apply on "
       "top of Section 232 duties. 6006.31, 6006.32 and 6006.33 were not removed; Revision 21 still lists them in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on synthetic knit fabric",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which include "
       "unbleached, dyed and yarn-dyed synthetic knit fabric (6006.31, 6006.32, 6006.33) — 12 Chapter 60 statistical lines. It is "
       "charged even when USMCA is claimed and on top of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, it "
       "took effect August 22 after a 3-day suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 60 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84); no Chapter 60 subheading is on the general exemption "
       "list (note 52(b)). EU and Taiwanese goods pay 10% and Japanese and Korean goods 12.5% in total, replacing a lower base rate "
       "(note 52(k)). Jordan's list covers all of Chapter 60; Guatemala's and El Salvador's cover it for CAFTA-DR claims, and note "
       "52(i) exempts CAFTA-DR textile goods entered duty-free. USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). Other "
       "FTA claims remove the base rate but not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 60 subheading is on Brazil's exemption list (U.S. note 50(a)(ii), "
       "9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending "
       "resolution of the issues or until termination, so USMCA claims (SPI S) on knit fabric still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("dm-ifr", "reference", "2026-06-24", "Effective", "De minimis suspended indefinitely",
       "CBP's interim final rules suspend the $800 de minimis exemption for every mode (19 CFR 10.151(b), 145.31(b)), so a "
       "low-value parcel of fabric needs an entry and pays duty. The suspension has applied to all countries since August 29, 2025 "
       "(Executive Order 14324) and was kept after the IEEPA ruling (Executive Order 14388).",
       "Free under $800", "Entry required", "All", ["fr-2026-12670", "eo-14324", "eo-14388"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance covers cotton knit fabric",
       "CBP's operational guidance for importers lists supply-chain tracing documents for the UFLPA high-priority sectors, "
       "including cotton and cotton products and apparel. Cotton knit fabric (6001.21, 6001.91, 6002.40.40, 6003.20, 6005.21–24, "
       "6006.21–24) falls in the cotton sector; the UFLPA presumption applies to any good made wholly or in part in Xinjiang or "
       "by a listed entity.",
       None, None, "China", ["cbp-fl-guidance", "pl-117-78"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 60 subheading was on the product exemption "
       "list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
       None, "+10% (until July 23, 2026)", "All", ["procl-11012", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
       "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
       "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
       "printed in Revision 21 but are no longer in effect.",
       "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("india-oil-end", "extraDuty", "2026-02-07", "Effective", "India's extra 25% IEEPA duty removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. India's 25% "
       "reciprocal rate ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in 2026, "
       "10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 60 line; CAFTA-DR-originating fabric is not "
       "charged.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-exclusions-extended", "reference", "2025-12-01", "Published", "China faux-fur exclusion extended to November 9, 2026",
       "USTR extended 178 China Section 301 product exclusions, including long pile knit fabric of acrylic pile on a polyester "
       "ground valued at no more than $16/m² (6001.10.20.00). It removes the 25% List 3 duty (9903.88.69) when the goods match "
       "the description.",
       None, "Excluded through November 9, 2026", "China", ["fr-2025-21671", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 60 line "
       "on top of the List 3 duty until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("dm-suspended", "reference", "2025-08-29", "Effective", "De minimis suspended for all countries",
       "Executive Order 14324 ended duty-free de minimis treatment for shipments of $800 or less from every country, so small "
       "fabric orders shipped directly to buyers pay duty.",
       "Free under $800", "Dutiable", "All", ["eo-14324"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian knit fabric. Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example India +25%, Vietnam +20%, Thailand +19%, "
       "and 15% in total for EU, Japanese and Korean goods. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended "
       "February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 60 subheading was on the "
       "general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to "
       "+20%, on top of the List 3 duty on knit fabric.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, "
       "2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
]
tu["changes"] = changes
add_sources(tu, [s for c in changes for s in c["sourceIds"]])
tu["stats"] = [s for s in tu["stats"]]

# ------------------------------------------------------------------ understandIndustry
exec(open(os.path.join(HERE, "fill_trade.py")).read())

# ------------------------------------------------------------------ industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 60 Knitted Fabric Tariff Rates by Country: China, Vietnam, Taiwan, Korea, Mexico & More"
ia["seo"]["title"] = "Knitted Fabric Import Duty by Country 2026: China, Vietnam, Taiwan, Korea, Mexico, Canada — HTS Chapter 60 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on knitted and crocheted fabric by country: base rate plus the 2026 Section 301 duty, China's List 3, "
    "Brazil's 25% and Canada's 50% Section 338 duty on synthetic interlock, with USMCA and CAFTA-DR applied."
)
ia["seo"]["keywords"] = [
    "knitted fabric tariff rates by country",
    "china tariff on knitted fabric",
    "vietnam knitted fabric tariff updates",
    "usmca tariff on knitted or crocheted fabrics",
    "elastomeric fabrics import duty",
    "warp knit fabrics customs duty",
    "hts chapter 60 trade impact",
    "taiwan knit fabric tariff",
]
ia["intro"] = (
    "The total rate on knit fabric depends as much on **where it comes from** as on what it is. Each cell below is the base rate "
    "for that product group plus the extra duty for that country, minus any preference — computed from the current tariff "
    "schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** (from "
    "July 24, 2026). **Taiwan and the EU pay 10% in total** and **Japan and Korea 12.5% in total** where that is above the base "
    "rate, so their 10% knits pay little or nothing extra; **Israel**, duty-free under its FTA, now pays 12.5%. **Vietnam pays 12.5%** on top of the base rate, **China and Brazil "
    "37.5%**, and USMCA-qualifying fabric from **Mexico and Canada** is free — except Canadian synthetic interlock and double "
    "knit (6006.31–6006.33), which pays 50% even with USMCA."
)
RULES = {
    "China": "Base rate plus 12.5% (9903.05.31) and 25% List 3 (9903.88.03) on 97 lines: 47.5% on 10% lines, up to 56%. 6005.35 "
    "pays 7.5% List 4A (9903.88.15) instead; 6001.22, 6005.41, 6006.24.90 and 6006.41 pay the 12.5% only. The faux-fur exclusion "
    "(9903.88.69, 6001.10.20, through November 9, 2026) needs the importer's claim and is not applied here.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list.",
    "Taiwan": "10% in total in place of the base rate when that is lower (9903.05.76): 10% on most lines, the base rate where it "
    "is higher (12.3%–18.5%); no Chapter 60 code on Taiwan's exception list.",
    "South Korea": "12.5% in total in place of the base rate on every line (9903.05.71); a KORUS claim makes the base Free but not "
    "the 12.5%.",
    "Mexico": "USMCA-qualifying (yarn-forward): no duty (9903.05.94), the base rate being Free under USMCA. Otherwise the base rate "
    "plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on 6006.31–6006.33 even with "
    "USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on those lines.",
    "Italy": "EU: 10% in total in place of the base rate when that is lower (9903.05.39); the EU exception list names no Chapter "
    "60 code. Lines at 10% or more pay only their base rate.",
    "Germany": "EU: 10% in total in place of the base rate when that is lower (9903.05.39); the EU exception list names no Chapter "
    "60 code. Lines at 10% or more pay only their base rate.",
    "France": "EU: 10% in total in place of the base rate when that is lower (9903.05.39); the EU exception list names no Chapter "
    "60 code. Lines at 10% or more pay only their base rate.",
    "Portugal": "EU: 10% in total in place of the base rate when that is lower (9903.05.39); the EU exception list names no Chapter "
    "60 code. Lines at 10% or more pay only their base rate.",
    "Spain": "EU: 10% in total in place of the base rate when that is lower (9903.05.39); the EU exception list names no Chapter "
    "60 code. Lines at 10% or more pay only their base rate.",
    "Japan": "12.5% in total in place of the base rate when that is lower (9903.05.49); lines above 12.5% pay their base rate; no "
    "exception list.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list and no GSP on Chapter 60.",
    "Pakistan": "Base rate plus 10% Section 301 (9903.05.62) on every line; no exception list.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no Chapter 60 code.",
    "Turkey": "Base rate plus 12.5% Section 301 (9903.05.79) on every line; no exception list.",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45) on every line; Indonesia's exception list names no Chapter 60 code.",
    "Thailand": "Base rate plus 12.5% Section 301 (9903.05.77) on every line; no exception list.",
    "Israel": "FTA claim (IL) makes the base Free, plus 12.5% Section 301 (9903.05.47) on every line.",
    "Guatemala": "CAFTA-DR claim (P, yarn-forward): Free on every line on Guatemala's list (9903.06.06), which covers all of "
    "Chapter 60; 6006.90.90 has no CAFTA-DR rate and pays 10% (9903.05.40). Without the claim, base rate plus 10%.",
    "Honduras": "CAFTA-DR claim (P, yarn-forward): Free on every line, the Section 301 duty lifted by note 52(i) (9903.05.95) for "
    "textile goods entered duty-free under CAFTA-DR; 6006.90.90 has no CAFTA-DR rate and pays 10% (9903.05.42). Without the claim, "
    "base rate plus 10%.",
    "El Salvador": "CAFTA-DR claim (P, yarn-forward): Free on every line on El Salvador's list (9903.06.09), which covers all of "
    "Chapter 60; 6006.90.90 has no CAFTA-DR rate and pays 10% (9903.05.37). Without the claim, base rate plus 10%.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line: 47.5% on 10% lines.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to the base rate plus 12.5% "
    "(9903.05.20–9903.05.84). Jordan's list covers all of Chapter 60, and CAFTA-DR textile goods of Costa Rica, the Dominican "
    "Republic, Honduras and Nicaragua entered duty-free with a CAFTA-DR claim are exempt (note 52(i), 9903.05.95). Column 2 countries (Cuba, North Korea, Russia, Belarus) pay "
    "Column 2 rates of 35%–113.5%.",
}
RULES["Türkiye (Turkey)"] = RULES["Turkey"]
for c in ia["countries"]:
    if c["country"] not in RULES:
        raise SystemExit(f"no rule label for {c['country']}")
    c["rule"]["label"] = RULES[c["country"]]
    if c["country"] == "China" and "fr-2025-21671" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].append("fr-2025-21671")
    if c["country"] == "India" and "eo-14384" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].append("eo-14384")
    if "eo-14389" not in c["rule"]["sourceIds"] and c["country"] != "Any other country":
        c["rule"]["sourceIds"].append("eo-14389")
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU and Taiwanese rates of \"10% in total\" and Japanese and Korean rates of \"12.5% in total\" replace the base rate only when "
    "it is lower (U.S. note 52(k)); lines with a higher base rate pay that base rate alone.",
    "USMCA and CAFTA-DR treatment assume the fabric meets the yarn-forward rule (General Notes 11 and 29) and the claim is made.",
    "China's faux-fur exclusion (6001.10.20, acrylic pile on polyester ground, ≤ $16/m²) depends on the goods matching the "
    "description and expires November 9, 2026, so the China cells show the full duty.",
    "Canada: the 50% Section 338 duty (U.S. note 51) on 6006.31–6006.33 applies whether or not USMCA is claimed; no Chapter 60 "
    "line is on the September 29, 2026 import-ban annexes.",
    "CAFTA-DR claims (SPI P) are applied for Guatemala and Honduras: note 52(i) (9903.05.95) and Guatemala's list (9903.06.06) "
    "remove the Section 301 duty on fabric entered duty-free under CAFTA-DR; 6006.90.90, which has no CAFTA-DR rate, still pays 10%.",
    "Not in the grid: the UFLPA presumption and the Xinjiang cotton withhold release order, textile entry rules (origin under 19 "
    "CFR 102.21, manufacturer ID) and CPSC flammability rules for apparel fabric — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) names no "
    "Chapter 60 code. Note 52(j) country lists name Chapter 60 codes only for Jordan (all 60 subheadings, 9903.06.20) and, for "
    "CAFTA-DR claims, Guatemala (9903.06.06) and El Salvador (9903.06.09), each covering all 60; the EU, UK, Swiss, Taiwan, "
    "Indonesia, Malaysia and other lists name none. Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods entered duty-free. "
    "Note 50(a)(ii) names no Chapter 60 code for Brazil. Note 51(b)(3) puts 6006.31.00, 6006.32.00 and 6006.33.00 on the Canada "
    "Section 338 list. Note 20 puts 55 of the 60 Chapter 60 subheadings on China List 3 and 6005.35 on List 4A; 6001.22, 6005.41, 6006.24.90 and "
    "6006.41 are only on suspended List 4B; note 20(vvv)(iii)(32) excludes one faux-fur fabric through November 9, 2026. Notes 31 "
    "(2024 China increases) and 30 (Russia) and the Section 232 notes name no Chapter 60 code. A Federal Register search of "
    "Commerce antidumping and countervailing notices found no order on knitted or crocheted fabric."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Knitted Fabric (HTS Ch. 60): Origin Rules, Yarn-Forward, UFLPA & Ways to Lower Duty"
te["seo"]["title"] = "Importing Knit Fabric: Textile Origin Rules, USMCA Yarn-Forward, UFLPA & Ways to Lower Duty (HTS Chapter 60) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, FTC, CPSC and EPA rules for each HTS Chapter 60 line — textile country of origin (19 CFR 102.21), manufacturer ID, "
    "fiber-content labeling, flammability, UFLPA — and the legal ways to pay less on knit fabric: USMCA and CAFTA-DR yarn-forward, "
    "classification, samples and drawback."
)
te["seo"]["keywords"] = [
    "usmca yarn-forward rules",
    "yarn forward rule of origin",
    "cafta dr yarn forward rule",
    "knit fabric country of origin",
    "19 CFR 102.21 fabric",
    "uyghur forced labor prevention act textile compliance",
    "fabric swatch hs code",
    "chapter 59 classification shift",
]
te["intro"] = (
    "Knit fabric is a textile, so **CBP's textile rules decide where it comes from**: fabric originates where it was **knit** — "
    "dyeing, printing and finishing in another country do not change that unless greige fabric is both dyed and printed with two "
    "more finishing steps (19 CFR 102.21). Every entry names the knitting mill through a manufacturer identification code. Cotton "
    "knits carry UFLPA risk: goods made wholly or in part with Xinjiang cotton are presumed barred.\n\n"
    "The ways to pay less are in the schedule: knit in **Mexico, Canada or a CAFTA-DR country from regional yarn** "
    "(yarn-forward) to remove both the base rate and the Section 301 duty, check whether **spandex content or width** moves the "
    "fabric to a lower line, enter **swatches as samples**, and claim **drawback** on fabric that is exported, alone or sewn into "
    "garments. Each depends on a document, listed below with its regulation."
)
te["regulationsAsOf"] = ECFR_DATE
FR_DM = src("fr-2026-12670")["url"]
te["levers"] = [
    {
        "id": "usmca",
        "title": "Knit in Mexico or Canada from North American yarn (USMCA yarn-forward)",
        "saves": "The base rate (up to 18.5%) and the 10% Section 301 duty for Mexico or Canada",
        "appliesTo": "All 106 lines, for fabric knit in North America with no non-originating material of headings 5106–5113, "
        "chapter 52, 5310–5311 or chapters 54–55 — regional yarn, and regional fiber for cotton and man-made fibers (General Note 11, "
        "Chapter 60 rule)",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with SPI \"S\" on the entry "
        "line.",
        "caveat": "Up to 10% by weight of non-originating fibers or yarns is allowed (de minimis), but non-originating elastomeric "
        "(spandex) yarn only up to 7%. For Canada, USMCA does not remove the 50% Section 338 duty on 6006.31–6006.33. The USMCA was "
        "not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "HTSUS General Note 11 (Chapter 60 rule; textile de minimis)", "url": GN},
            {"label": "19 CFR 182.12 (certification of origin)", "url": ecfr(19, "182.12")},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51, 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "cafta",
        "title": "Knit in a CAFTA-DR country from regional yarn",
        "saves": "The base rate and the 10%–12.5% Section 301 duty",
        "appliesTo": "Lines with a CAFTA-DR rate (SPI P — every line except 6006.90.90), for fabric of Costa Rica, the Dominican "
        "Republic, El Salvador, Guatemala, Honduras or Nicaragua knit from regional cotton and man-made-fiber yarn (General Note 29: "
        "6001 and 6003–6006 may not use non-originating materials of 5111–5113, chapter 52, 5310–5311 or chapters 54–55; 6002 needs only "
        "a change of chapter)",
        "document": "A CAFTA-DR claim (\"P\" before the subheading) based on a certification or the importer's knowledge.",
        "caveat": "Note 52(i) lifts the Section 301 duty only for textile goods entered duty-free under CAFTA-DR; Guatemala and El "
        "Salvador also have code lists (9903.06.06, 9903.06.09). Elastomeric yarn must be formed in the region. From 2027 "
        "Nicaraguan fabric that is not CAFTA-DR-originating also pays 10% (9903.89.01).",
        "citations": [
            {"label": "HTSUS General Note 29 (Chapter 60 rule; textiles)", "url": GN},
            {"label": "19 CFR 10.583 (claim)", "url": ecfr(19, "10.583")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim another FTA where the base rate is the cost",
        "saves": "The base rate (4%–18.5%); for Jordan, also the Section 301 duty",
        "appliesTo": "The 105 dutiable lines, for fabric of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, Jordan, "
        "Morocco, Bahrain, Oman or Singapore meeting that agreement's textile rule; CBERA (E, E*) on some wool, other-fiber and stretch lines",
        "document": "Proof of origin under the agreement and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, JO, MA, BH, OM, "
        "SG, E).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)) — Korea pays 12.5% in total with KORUS — "
        "except for Jordan, whose exception list covers all of Chapter 60. No Chapter 60 line offers GSP or AGOA.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a), (j)(13)", "url": CH99},
        ],
    },
    {
        "id": "classification",
        "title": "Check width, spandex content and construction before you buy",
        "saves": "Up to 8.5 points of base rate — for example 12.3% (6004.10, 5%+ spandex) vs. 10% (6006) for the same knit "
        "with under 5% spandex, or 17.2% (6001.92 pile) vs. 10% (6006.32) for a brushed knit without a pile",
        "appliesTo": "Stretch fabrics near the 5% elastomeric threshold, fleece and velour (pile or not), fabric near 30 cm wide, and "
        "coated knits (chapter 59 vs. 60)",
        "document": "A binding ruling request to CBP with fiber content by weight, construction, width and finish (19 CFR part "
        "177); invoices must show the same fiber content (19 CFR 141.89).",
        "caveat": "Change the product only for real commercial reasons — CBP classifies what is imported, and Section 301, 338 "
        "and USMCA outcomes also follow the line.",
        "citations": [
            {"label": "HTSUS Chapter 60 and Section XI notes", "url": CH60},
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
        ],
    },
    {
        "id": "china-exclusion",
        "title": "Claim the China exclusion for acrylic faux fur",
        "saves": "The 25% List 3 duty (the 12.5% 2026 duty still applies)",
        "appliesTo": "Chinese long pile knit fabric of acrylic pile on a polyester ground, valued at no more than $16/m² "
        "(6001.10.20.00), entered by November 9, 2026",
        "document": "Heading 9903.88.69 reported with 6001.10.20.00, and records showing fiber content, construction and value per m².",
        "caveat": "Only fabric matching the description qualifies; it ends after November 9, 2026 unless USTR extends it again.",
        "citations": [
            {"label": "HTSUS U.S. note 20(vvv)(iii)(32), heading 9903.88.69", "url": CH99},
            {"label": "90 FR 55232 (exclusions extended to November 9, 2026)", "url": src("fr-2025-21671")["url"]},
        ],
    },
    {
        "id": "samples",
        "title": "Enter swatches and headers as samples",
        "saves": "All duty — base rate and the Section 301, China and Canada duties",
        "appliesTo": "Fabric swatches and sample cards valued at $1 or less each, or marked, torn or perforated so they cannot be "
        "sold, used only to solicit orders",
        "document": "Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.",
        "caveat": "Usable sample yardage does not qualify. U.S. notes 20, 51 and 52 exempt goods properly entered under Chapter 98 "
        "from those extra duties. De minimis is suspended, so even a low-value parcel needs an entry.",
        "provisions": [
            {"code": "9811.00.60", "rate": "Free", "text": "Samples valued not over $1 each, or marked, torn, perforated or otherwise treated so they are unsuitable for sale, used only for soliciting orders for products of foreign countries"}
        ],
        "citations": [
            {"label": "HTSUS 9811.00.60", "url": CH98},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20(a), 51, 52(a)", "url": CH99},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the fabric, or garments made from it, are exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on fabric re-exported or cut and sewn into exported goods",
        "appliesTo": "All lines, when the imported fabric or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a specific or general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
]
te["rules"] = [
    {
        "id": "textile-origin",
        "agency": "CBP",
        "title": "Textile country of origin: knit fabric originates where it was knit (fabric-making process); dyeing, printing or "
        "finishing elsewhere changes origin only when greige fabric is both dyed and printed plus two finishing operations, and "
        "never for wool fabric",
        "citations": [{"label": "19 CFR 102.21(c), (e) (headings 6001–6006)", "url": ecfr(19, "102.21")}],
    },
    {
        "id": "textile-mid",
        "agency": "CBP",
        "title": "Manufacturer identification code (MID) of the knitting mill that performed the origin-conferring operation, on "
        "every entry — this replaced the textile declaration, eliminated in 2011",
        "citations": [
            {"label": "19 CFR 102.23", "url": ecfr(19, "102.23")},
            {"label": "76 FR 14575 (textile declarations eliminated)", "url": "https://www.federalregister.gov/documents/2011/03/17/2011-6253/country-of-origin-of-textile-and-apparel-products"},
        ],
    },
    {
        "id": "cita-transship",
        "agency": "CBP / CITA",
        "title": "Entry is denied for textiles from a company named by CITA in the Federal Register for illegal transshipment or for "
        "being unable to verify production",
        "citations": [{"label": "19 CFR 102.24", "url": ecfr(19, "102.24")}],
    },
    {
        "id": "invoice",
        "agency": "CBP",
        "title": "Invoice details for textile fiber products: each fiber by generic name and percentage by weight (5% or more), the "
        "manufacturer and the country where processed or made",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Fiber Products Identification Act: fabric sold onward must disclose fiber content (e.g. \"95% cotton, 5% "
        "spandex\") and country of origin",
        "citations": [
            {"label": "16 CFR 303.45(a)(17) (fabrics covered)", "url": ecfr(16, "303.45")},
            {"label": "16 CFR 303.33 (country of origin)", "url": ecfr(16, "303.33")},
        ],
    },
    {
        "id": "cpsc-flammability",
        "agency": "CPSC",
        "title": "Flammable Fabrics Act: fabric used or intended for apparel must meet the clothing-textile flammability standard "
        "(plain-surface fabric of 2.6 oz/yd² or more and all-acrylic, modacrylic, nylon, olefin, polyester or wool fabric are "
        "exempt from testing); raised-surface fabric such as fleece and velour is the main risk",
        "citations": [
            {"label": "16 CFR part 1610", "url": ecfr_part(16, 1610)},
            {"label": "16 CFR 1610.1 (scope and exemptions)", "url": ecfr(16, "1610.1")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP / DHS",
        "title": "UFLPA and the Xinjiang cotton withhold release order: goods made wholly or in part in Xinjiang or by an entity on "
        "the UFLPA Entity List are presumed made with forced labor and denied entry unless the importer rebuts it; cotton knits need "
        "supply-chain tracing back to the cotton",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
            {"label": "DHS UFLPA Entity List", "url": NEW_SOURCES["dhs-uflpa-list"]["url"]},
            {"label": "CBP Xinjiang cotton WRO (January 13, 2021)", "url": NEW_SOURCES["cbp-wro-xinjiang"]["url"]},
        ],
    },
    {
        "id": "epa-pesticide",
        "agency": "EPA / CBP",
        "title": "Insecticide-treated mosquito-net fabric (6005.35) is a pesticide product: an EPA Notice of Arrival before the "
        "shipment arrives, and registration unless exempt (the treated-article exemption covers only a pesticide that protects the "
        "fabric itself)",
        "citations": [
            {"label": "19 CFR 12.112 (Notice of Arrival)", "url": ecfr(19, "12.112")},
            {"label": "40 CFR 152.25(a) (treated articles)", "url": ecfr(40, "152.25")},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or, for piece goods on rolls or bolts, on its container",
        "citations": [{"label": "19 CFR 134.11", "url": ecfr(19, "134.11")}],
    },
    {
        "id": "de-minimis",
        "agency": "CBP",
        "title": "No de minimis: a low-value parcel of fabric needs a formal or informal entry and pays duty",
        "citations": [
            {"label": "19 CFR 10.151(b)", "url": ecfr(19, "10.151")},
            {"label": "91 FR 37789 (CBP interim final rule, June 24, 2026)", "url": FR_DM},
        ],
    },
]
BASE_RULES = ["textile-origin", "textile-mid", "cita-transship", "invoice", "ftc-labeling", "cbp-marking", "de-minimis"]
COTTON_PREFIX = ("6001.21", "6001.91", "6002.40.40", "6002.90.40", "6003.20", "6005.21", "6005.22", "6005.23", "6005.24",
                 "6006.21", "6006.22", "6006.23", "6006.24")
GROUP_NOTES = {
    "6001": "Pile fabric originates where it was knit. Faux fur, velour and plush are raised-surface fabrics for CPSC flammability "
    "if used in apparel. China's exclusion covers only acrylic-on-polyester long pile at ≤ $16/m².",
    "6002": "Narrow (≤ 30 cm) elastic knits. Elastomeric yarn must be formed in North America or the CAFTA-DR region for "
    "USMCA or CAFTA-DR, beyond the 7% (USMCA) allowance.",
    "6003": "Narrow knits other than elastic. Open-work warp knits (14.1%) are split from other fabric (6.6%–8%) — the "
    "construction decides the rate.",
    "6004": "Wide fabric with 5% or more spandex (12.3%). Under 5% elastomeric yarn the same knit is 6005 or 6006 at 10%. "
    "Non-originating spandex limits USMCA qualification.",
    "6005": "Warp knits, all 10%. Insecticide-treated mosquito-net fabric (6005.35) needs an EPA Notice of Arrival; made-up bed "
    "nets are 6304.20, not this chapter.",
    "6006": "Circular knits, mostly 10%. Cotton jersey and rib carry UFLPA tracing; synthetic 6006.31–6006.33 from Canada pays "
    "50% under Section 338 even with USMCA.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    rules = list(BASE_RULES)
    rules.insert(5, "uflpa")
    if h in ("6001", "6004", "6005", "6006"):
        rules.insert(5, "cpsc-flammability")
    if h == "6005":
        rules.append("epa-pesticide")
    g["ruleIds"] = rules
    g["note"] = GROUP_NOTES[h]
for ln in te["lines"]:
    h = ln["hts"]
    rules = list(BASE_RULES)
    rules.insert(5, "uflpa")
    if h[:4] in ("6001", "6004", "6005", "6006"):
        rules.insert(5, "cpsc-flammability")
    if h.startswith("6005.35"):
        rules.append("epa-pesticide")
    ln["ruleIds"] = rules
    lev = ["usmca"]
    if not h.startswith("6006.90.90"):
        lev += ["cafta", "fta"]
    lev.append("classification")
    if h.startswith("6001.10.20"):
        lev.append("china-exclusion")
    lev += ["samples", "drawback"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, the China exclusion and "
    "the Canada Section 338 list change by proclamation and USTR notice; check them before each shipment."
)

# ------------------------------------------------------------------ finalConclusion
exec(open(os.path.join(HERE, "fill_faq.py")).read())
