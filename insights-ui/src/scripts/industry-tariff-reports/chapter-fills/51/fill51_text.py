# Prose for Chapter 51 — exec'd by fill51.py (shares its globals: d, src, add_sources, trade helpers).

ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
NO_LIST = "names no Chapter 51 code"

LABELS = {
    "5101": ("Wool, not carded or combed (greasy, scoured, carbonized)", "Raw wool"),
    "5102": ("Fine or coarse animal hair, not carded or combed (cashmere, camel, alpaca, mohair)", "Animal hair"),
    "5103": ("Waste of wool or of fine or coarse animal hair, including yarn waste and noils", "Wool waste"),
    "5104": ("Garnetted stock of wool or of fine or coarse animal hair", "Garnetted stock"),
    "5105": ("Wool and fine or coarse animal hair, carded or combed (wool tops, combed wool in fragments)", "Tops & carded"),
    "5106": ("Yarn of carded wool, not put up for retail sale", "Carded yarn"),
    "5107": ("Yarn of combed wool, not put up for retail sale", "Worsted yarn"),
    "5108": ("Yarn of fine animal hair (carded or combed), not put up for retail sale", "Hair yarn"),
    "5109": ("Yarn of wool or of fine animal hair, put up for retail sale", "Retail yarn"),
    "5110": ("Yarn of coarse animal hair or of horsehair (including gimped horsehair yarn)", "Horsehair yarn"),
    "5111": ("Woven fabrics of carded wool or of carded fine animal hair (woollens)", "Woollen fabric"),
    "5112": ("Woven fabrics of combed wool or of combed fine animal hair (worsteds)", "Worsted fabric"),
    "5113": ("Woven fabrics of coarse animal hair or of horsehair", "Horsehair fabric"),
}

H = {h: HEAD.get(h, 0) for h in LABELS}
FAB = H["5111"] + H["5112"]
YARN = H["5106"] + H["5107"] + H["5108"] + H["5109"]
FIBRE = H["5101"] + H["5102"] + H["5103"] + H["5104"] + H["5105"]
T1, T2 = TOP[0], TOP[1]
CHG = pct(TOTAL, PRIOR)


def chg(country):
    c = BYC[country]
    return pct(c["importsUsd"], c["priorImportsUsd"] or 0)


def top_list(n, start=0):
    return ", ".join(f"**{c}** {m(imp(c))}" for c in TOP[start:start + n])


# ---------------------------------------------------------------- chapter / overview
d["chapter"]["title"] = "Wool, Fine or Coarse Animal Hair; Horsehair Yarn and Woven Fabric"
ov = d["overview"]
ov["h1"] = "HTS Chapter 51: Wool, Cashmere, Alpaca & Mohair — Raw Wool, Tops, Yarn and Wool Fabric Tariff Rates (2026)"
ov["seo"]["title"] = (
    "HTS Chapter 51 Tariff 2026: Wool, Cashmere, Alpaca, Wool Yarn & Wool Fabric Import Duty Rates | KoalaGains"
)
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 124 HTS Chapter 51 lines — greasy and scoured wool (¢ per clean kg), cashmere, alpaca and "
    "mohair hair, wool tops, wool and cashmere yarn, and woollen and worsted fabric (25%). General, FTA and Column 2 rates plus "
    "the 2026 extra duty for Italy, Peru, China, Australia and more."
)
ov["seo"]["keywords"] = [
    "hts chapter 51",
    "wool import duty rates",
    "wool fabric hs code",
    "wool yarn hs code",
    "cashmere hs code",
    "alpaca yarn hs code",
    "hts 5102.19 alpaca hair customs duty",
    "carded wool import duty rates",
    "italy wool fabric tariff rates",
    "us import duty rates on cashmere",
    "wool for special uses",
    "clean kg wool duty",
]
ov["intro"] = (
    "Chapter 51 covers wool and animal hair from the fleece to woven cloth: **greasy, scoured and carbonized wool** (5101), "
    "**cashmere, camel, alpaca, mohair and other animal hair** (5102), wool waste and garnetted stock (5103–5104), **wool tops** "
    "and carded wool (5105), **wool and fine-hair yarn** (5106–5110) and **woollen and worsted fabric** (5111–5113). "
    "Of its **124 tariff lines, 29 are Free** — mostly coarse wool not finer than 46s — while finer wool pays a specific "
    "duty per **clean kilogram** (18.7¢–24.4¢), yarn 4%–6% and most wool fabric **25%**.\n\n"
    "Since **July 24, 2026** goods from 60 economies also pay a **Section 301 tariff**: Peru, Chile, New Zealand, Australia, "
    "Uruguay and South Africa 12.5% on top of the base rate, the UK and India 10%, and **EU goods 10% in total** (EU fabric at 25% "
    "pays only its base rate). An FTA claim (Peru, Chile, Australia) removes the base rate but not this duty. **China pays 37.5%** "
    "extra on every line, Brazil 37.5%, and Canadian greasy fine wool and wool waste 50% under Section 338. "
    f"U.S. imports were **{m(TOTAL)} in {YEAR}**, led by {T1} ({share(imp(T1))}) and {T2} ({share(imp(T2))}); "
    f"yarn of 5106–5109 was {share(YARN)} of the total — Peru's hand-knitting yarn of wool and fine hair (5109) alone "
    f"{m(head_country('5109', 'Peru'))} — and woven fabric of 5111–5112 {share(FAB)}."
)
TRUNC = {g["label"]: LABELS[g["heading"]][0] for g in ov["productGroups"] if g["label"].endswith("…")}
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]


def hs_note(h):
    v = H[h]
    if not v:
        return ""
    return f" {m(v)} in {YEAR}" + (f", mostly from {top_suppliers(h, 2)}." if HC.get(h) else ".")


BLURBS = {
    "5101": (
        "Greasy (shorn or skin wool), degreased and carbonized wool. Wool not finer than 46s — carpet and coarse wool — is Free; "
        "finer wool pays 18.7¢ (greasy), 20.6¢ (degreased) or 24.4¢ (carbonized) per clean kg, and 6.5¢/kg + 5.3% if "
        "processed further. \"Wool for special uses\" (felt, carpets, press cloth) is Free and, for Column 2 countries, "
        "Free only under bond." + hs_note("5101"),
        ["raw wool", "greasy wool", "merino wool", "scoured wool", "carbonized wool", "carpet wool", "shorn wool", "skin wool"],
    ),
    "5102": (
        "Cashmere, camel, alpaca, llama, vicuña, mohair, yak and rabbit hair, and coarse animal hair, not carded or combed. "
        "Degreased cashmere 5.1¢/clean kg, camel hair 5¢/clean kg, alpaca and mohair (5102.19.60) 0.4%, coarse hair Free."
        + hs_note("5102"),
        ["cashmere fiber", "raw cashmere", "alpaca fiber", "mohair fiber", "camel hair", "yak hair", "angora rabbit hair"],
    ),
    "5103": (
        "Noils, yarn waste and other waste of wool and fine animal hair (2.6¢/kg) and waste of coarse hair (7%). Garnetted "
        "(pulled) stock is 5104." + hs_note("5103"),
        ["wool noils", "wool waste", "wool yarn waste", "cashmere noils", "wool clips"],
    ),
    "5104": (
        "Garnetted stock — wool or hair waste pulled back into fibre. Free; Column 2 57.3¢/kg." + hs_note("5104"),
        ["garnetted wool", "recycled wool fiber", "shoddy", "pulled wool stock"],
    ),
    "5105": (
        "Carded wool, combed wool tops and combed wool in fragments, and carded or combed cashmere and other fine hair. "
        "Mixed rates of 3.7¢–6.8¢/kg plus 3%–5.5%; coarse hair Free." + hs_note("5105"),
        ["wool tops", "combed wool", "merino tops", "carded wool", "wool roving", "alpaca tops", "cashmere tops"],
    ),
    "5106": (
        "Woollen-spun (carded) wool yarn for weaving and knitting mills, 6%. The 85%-wool line is split at 34.40 microns for "
        "statistics." + hs_note("5106"),
        ["carded wool yarn", "woollen yarn", "wool knitting yarn", "lambswool yarn"],
    ),
    "5107": (
        "Worsted (combed) wool yarn, 6%, split at 18.5 microns (superfine merino) and at 85% wool." + hs_note("5107"),
        ["worsted yarn", "merino wool yarn", "combed wool yarn", "superfine merino yarn", "wool blend yarn"],
    ),
    "5108": (
        "Yarn of cashmere, camel, alpaca, mohair, Angora rabbit and other fine hair, not for retail sale: 4%." + hs_note("5108"),
        ["cashmere yarn", "alpaca yarn", "mohair yarn", "angora yarn", "camel hair yarn", "baby alpaca yarn"],
    ),
    "5109": (
        "Hand-knitting and retail wool and fine-hair yarn in balls, hanks or skeins: 6% wool, 4% Angora rabbit, Free for dyed "
        "yarn cut to 8 cm or less (rug yarn)." + hs_note("5109"),
        ["hand knitting yarn", "wool yarn skeins", "100 wool yarn", "merino knitting yarn", "rug yarn"],
    ),
    "5110": (
        "Yarn of coarse animal hair and of horsehair, including gimped horsehair yarn. Free." + hs_note("5110"),
        ["horsehair yarn", "gimped horsehair", "coarse hair yarn"],
    ),
    "5111": (
        "Woollen (carded) fabric — tweeds, flannels, coatings, melton. 25% for most lines; 7% tapestry and upholstery fabric; "
        "10% hand-woven on narrow looms; 6.9% with 30% or more silk valued over $33/kg." + hs_note("5111"),
        ["wool tweed", "wool flannel fabric", "wool coating fabric", "melton wool", "boiled wool", "cashmere fabric"],
    ),
    "5112": (
        "Worsted (combed) fabric — suitings, gabardine, crepe — 25% for most lines; 7% tapestry and upholstery; 6.9% with 30% "
        "or more silk over $33/kg. Fabric of 18.5-micron yarn and weights over 270 g/m² have their own statistical lines."
        + hs_note("5112"),
        ["worsted wool fabric", "wool suiting fabric", "super 120s wool", "wool gabardine", "italian wool fabric", "merino wool fabric"],
    ),
    "5113": (
        "Woven fabric of coarse animal hair or horsehair (hair cloth, interlining). 2.7%." + hs_note("5113"),
        ["horsehair fabric", "hair cloth", "horsehair interlining", "crinoline fabric"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Greasy merino wool from Australia",
        "line": "5101.11.60.60",
        "body": "Greasy shorn wool finer than 58s is 18.7¢ per clean kg. 20,000 kg greasy at a 65% clean yield is 13,000 clean kg: "
        "**$2,431** base duty. An Australia FTA claim (AU) removes it, but the 12.5% Section 301 duty (9903.05.23) still "
        "applies: **$12,500** on a $100,000 shipment, or $14,931 without the FTA claim.",
    },
    {
        "title": "Italian worsted suiting fabric",
        "line": "5112.11.30.60",
        "body": "Worsted fabric of 18.5-micron wool up to 200 g/m² is 25%. EU goods pay 10% in total only where the base rate is "
        "lower (note 52(k)); here the 25% base rate applies alone: **$12,500** on $50,000. The same fabric from China pays "
        "25% + 25% (List 3) + 12.5% = 62.5%: **$31,250**.",
    },
    {
        "title": "Worsted fabric from Chile",
        "line": "5112.19.95.50",
        "body": "Worsted wool fabric of 270–340 g/m² is 25%. A Chile FTA claim (CL) makes it Free, and the 12.5% Section 301 "
        "duty (9903.05.30) still applies: **$2,500** on $20,000, against $7,500 without the claim.",
    },
    {
        "title": "Alpaca yarn from Peru",
        "line": "5108.20.80.00",
        "body": "Combed fine-hair yarn is 4%. A Peru TPA claim (PE) makes it Free, and the 12.5% Section 301 duty (9903.05.63) "
        "still applies: **$1,250** on $10,000 ($1,650 without the PE claim).",
    },
    {
        "title": "Cashmere yarn: China vs. Mongolia",
        "line": "5108.10.80.00",
        "body": "Carded cashmere yarn is 4%. From China it adds 25% (List 3, 9903.88.03) and 12.5% (9903.05.31): **$4,150** on "
        "$10,000. Mongolia is not one of the 60 Section 301 economies, so Mongolian yarn pays the 4% only: **$400**.",
    },
    {
        "title": "Greasy fine wool from Canada",
        "line": "5101.11.60.30",
        "body": "Greasy wool not finer than 58s is 18.7¢/clean kg, Free with a USMCA claim, which also removes Canada's 10% "
        "Section 301 duty. But 5101.11.60 is on the Section 338 list (U.S. note 51(b)(3), 9903.03.14): **50%** applies with "
        "or without USMCA — $5,000 on $10,000.",
    },
    {
        "title": "Coarse carpet wool entered as \"wool for special uses\"",
        "line": "5101.11.10.00",
        "body": "Wool not finer than 46s certified for felt, carpets, press cloth or papermakers' felts is Free at the general "
        "rate. For a Column 2 country the rate is \"Free, under bond\": duty-free at entry, but if the wool is used for "
        "anything else the regular duty (55.1¢–77.2¢/clean kg for greasy shorn wool) becomes payable (additional U.S. note 2(d)).",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": nm(c["country"]), "importsUsd": c["importsUsd"]} for c in ui["byCountry"][:5]]
LINE_LABELS = {ln["hs6"]: ln["description"] for ln in ui["byLine"]}
ts["biggestLines"] = [
    {"hts": ln["hs6"], "label": ln["description"][:1].upper() + ln["description"][1:]}
    for ln in sorted(ui["byLine"], key=lambda x: -x["importsUsd"])[:4]
]
ts["source"] = f"UN Comtrade, United States imports, HS chapter 51 ({YEAR})"
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so the page cannot split alpaca from mohair (5102.19) or say which 10-digit line each country ships."
)
ov["notes"]["chapterNotes"] = (
    "**Note 1.** Throughout the tariff schedule: (a) **\"wool\"** is the natural fibre grown by sheep or lambs; (b) **\"fine "
    "animal hair\"** is the hair of alpaca, llama, vicuña, camel (including dromedary), yak, Angora, Tibetan, Kashmir or "
    "similar goats (but not common goats), rabbit (including Angora rabbit), hare, beaver, nutria or muskrat; and (c) "
    "**\"coarse animal hair\"** is the hair of other animals, excluding brush-making hair and bristles (heading 0502) and "
    "horsehair (heading 0511). Horsehair itself is chapter 5; only its yarn (5110) and woven fabric (5113) are here.\n\n"
    "The Section XI (textiles) notes also apply: a blend is classified as if it consisted wholly of the fibre that "
    "predominates by weight (wool and fine animal hair counted together), and fabric cut to shape or hemmed leaves Chapter 51 "
    "for chapters 61–63."
)
ov["notes"]["additionalUsNotes"] = (
    "**Note 1.** In a package of wool or fine hair at different rates (headings 5101–5104), the whole package takes the "
    "highest rate applying to any part that is at least 10% of the contents by weight.\n\n"
    "**Note 2(a)–(c).** **\"Clean kg\"** means kilogram of clean yield: the absolute clean content (wool or hair free of "
    "vegetable and foreign matter, at 12% moisture, 1.5% alcohol-extractable matter and not over 0.5% ash), less an allowance "
    "for normal processing loss. For carbonized fibre, clean yield is the condition as entered. CBP samples and tests "
    "clean yield under 19 CFR 151.61–151.76.\n\n"
    "**Note 2(d) — wool for special uses.** Unimproved wool and other wool not finer than 46s, entered by a dealer, "
    "manufacturer or processor and certified for use only in felt or knit boots, floor coverings, heavy fulled lumbermen's "
    "socks, press cloth, papermakers' felts or pressed felt for polishing plate and mirror glass. It is not released "
    "without a **bond** securing that use; it can be transferred to another bonded user. If it is used or transferred for "
    "any other use, the regular duty on the wool in its condition as entered must be paid (not on waste or by-products of "
    "the permitted manufacture, or on goods destroyed or exported); misuse must be reported within 30 days or a penalty "
    "equal to the wool's value applies; and clean yield is deemed 100% unless tested and used within 3 years of entry. "
    "In the current schedule this matters for **Column 2** countries (\"Free, under bond\" on 5101.11.10, 5101.19.10, "
    "5101.21.10 and 5101.29.10); at the general rate all wool not finer than 46s is Free anyway.\n\n"
    "**Note 2(e)–(f).** \"Unimproved wool\" is Aleppo, Chinese, Donskoi, Karakul, Mongolian, Scotch Blackface, Tibetan, "
    "Welsh Mountain and similar wool not improved by merino or English blood. Wool grades follow the U.S. standards set "
    "by the Secretary of Agriculture in force on the date of import.\n\n"
    "**No wool-fabric quota.** The worsted wool fabric tariff-rate quotas that once lowered the duty on some 5112 suitings "
    "are no longer in the schedule: Commerce removed their regulations in 2019 because the authority had expired, and "
    "Chapter 99 of Revision 21 has no heading that lowers the duty on 5111 or 5112 fabric. The temporary duty suspensions "
    "for cashmere, camel hair and vicuña (9902.12.69–9902.12.82) expired December 31, 2020."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 51 Tariff Updates: Wool, Cashmere, Alpaca & Wool Fabric Import Duties (2025–2026)"
tu["seo"]["title"] = "Wool Tariff Updates 2026: HTS Chapter 51 — Section 301, China List 3, Canada 338, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 51 wool, hair, yarn and fabric imports since January 2025: unchanged base rates, the end of "
    "the IEEPA tariffs and the Section 122 surcharge, the 2026 Section 301 tariffs on Australia, Peru, the EU and others, "
    "China's List 3 and Canada's Section 338 duty on wool."
)
tu["seo"]["keywords"] = [
    "hts chapter 51 tariff updates",
    "section 301 wool tariffs",
    "australia wool tariff updates",
    "peru alpaca yarn tariffs",
    "italy cashmere and wool import duty",
    "tariff on wool",
    "tariffs on wool from uk",
    "cashmere tariff",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 124 Chapter 51 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties **ended on February 24, 2026**, and the 10% Section 122 "
    "surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies — Peru, Chile, "
    "the UK, the EU, India, Türkiye and New Zealand among them — pay a **Section 301 tariff of 10% or 12.5%**. "
    "China keeps its 25% List 3 duty on every Chapter 51 line, Brazil pays another 25%, and since August 22, 2026 Canadian "
    "greasy fine wool (5101.11.60) and wool waste (5103.20) pay **50%** under Section 338."
)
tu["scope"] = (
    "Measures that reach Chapter 51 from any country: the 2026 Section 301 tariffs on 60 economies and their exception lists, "
    "the Brazil Section 301 tariff, China Section 301 List 3, the Canada Section 338 duty, the Nicaragua Section 301 phase-in, "
    "and the 2025–2026 IEEPA and Section 122 duties that have ended. No Section 232 action and no antidumping or "
    "countervailing duty order covers a Chapter 51 line; the only past order, a countervailing duty on wool from Argentina, "
    "was revoked in 1997. For the rate each supplier pays, see Rates by country."
)
IE = {x["id"]: x for x in tu["inEffect"]}


def tr(country):
    v = imp(country)
    return f" ({m(v)} in {YEAR})" if v else ""


EXEMPT_ALL = {
    "au-section-301": (
        "Australia has no exception list, and the general exemption list (U.S. note 52(b)) " + NO_LIST + ". An Australia FTA "
        "claim (AU) removes the base rate on the dutiable lines (fine wool, tops, yarn, fabric) but not this duty (note "
        "52(a)). " + ENDED,
        "Australian greasy and scoured wool, tops and yarn" + tr("Australia") + " pay 12.5% on top of the base rate — 12.5% "
        "in all with an FTA claim.",
        ["eo-14389"],
    ),
    "nz-section-301": (
        "New Zealand has no FTA with the United States and no exception list. " + ENDED,
        "New Zealand wool" + tr("New Zealand") + " — much of it coarse wool not finer than 46s, Free at the base rate — pays "
        "12.5% extra.",
        ["eo-14389"],
    ),
    "eu-section-301": (
        "EU goods pay 10% in total in place of a lower base rate (U.S. note 52(k)); where the base rate is 10% or more — the "
        "25% woollen and worsted fabric lines — only the base rate applies. The EU exception list (U.S. note 52(j)(2), "
        "9903.05.97) " + NO_LIST + ". " + ENDED,
        "Italian, German and other EU worsted and woollen fabric pays its 25% base rate and nothing more; EU yarn (4%–6%) and "
        "wool pay 10% in total.",
        ["eo-14389"],
    ),
    "cn-section-301": (
        "List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers all 101 Chapter 51 subheadings, and the 2026 action adds "
        "+12.5% (9903.05.31); China is on no exception list. The exclusions once granted for Merino wool yarn (5106.10.0090) "
        "and cashmere yarn (5108.10.8000) have lapsed, and none of the exclusions still in force (9903.88.69–9903.88.70, "
        "through November 9, 2026) names a Chapter 51 product. USTR confirmed on October 7, 2026 that the 2018–2019 actions "
        "continue. The IEEPA duties on China ended February 24, 2026.",
        "Chinese cashmere, wool tops, yarn and fabric" + tr("China") + " pay 37.5% on top of the base rate: 41.5% on 4% "
        "cashmere yarn, 62.5% on 25% wool fabric.",
        ["eo-14389"],
    ),
    "cl-section-301": (
        "Chile has no exception list. A Chile FTA claim (CL) removes the base rate on every dutiable line but not this duty "
        "(note 52(a)). " + ENDED,
        "Chilean worsted fabric" + tr("Chile") + " — almost all of 5112 — is Free with a CL claim but pays 12.5%: $1,250 on "
        "$10,000 instead of $2,500 at the 25% base rate.",
        ["eo-14389"],
    ),
    "uy-section-301": (
        "Uruguay has no FTA with the United States and no exception list. " + ENDED,
        "Uruguayan wool tops and scoured wool" + tr("Uruguay") + " pay the base rate plus 12.5%.",
        ["eo-14389"],
    ),
    "za-section-301": (
        "South Africa has no exception list. AGOA (SPI D, through December 31, 2026 for beneficiary countries) is printed only "
        "on 5102.19.60 (mohair, alpaca), 5103.10, 5103.20 and 5113.00, and does not remove this duty. " + ENDED,
        "South African mohair and wool" + tr("South Africa") + " pay the base rate plus 12.5% — 12.9% on mohair of "
        "5102.19.60 without an AGOA claim.",
        ["ustr-agoa-2026", "eo-14389"],
    ),
    "gb-section-301": (
        "The UK exception list (U.S. note 52(j)(1), 9903.05.96) " + NO_LIST + ". " + ENDED,
        "British worsted and tweed fabric and yarn" + tr("United Kingdom") + " pay the base rate plus 10%: 35% on 25% fabric.",
        ["eo-14389"],
    ),
    "pe-section-301": (
        "Peru has no exception list. A Peru TPA claim (PE) removes the base rate on every dutiable line but not this duty "
        "(note 52(a)). " + ENDED,
        "Peruvian yarn of wool and fine hair" + tr("Peru") + " — mostly hand-knitting yarn of 5109 — pays 12.5% with a PE claim, "
        "and the 4%–6% base rate on top without one.",
        ["eo-14389"],
    ),
    "in-section-301": (
        "India has no exception list. GSP (SPI A), printed on four Chapter 51 lines, has been expired since December 31, 2020. "
        "The 2025 IEEPA duties (25% reciprocal plus 25% over Russian oil purchases) ended in February 2026.",
        "Indian wool yarn and fabric" + tr("India") + " pay 10% on top of the base rate.",
        ["cbp-gsp", "eo-14384", "eo-14389"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
        "9903.03.14) on greasy shorn wool finer than 46s (5101.11.60) and other waste of wool or fine hair (5103.20) applies "
        "with or without a USMCA claim; both stayed on the list after the September 15, 2026 revision. No Chapter 51 line is "
        "on the September 29, 2026 import-ban annexes. The IEEPA duty on Canada ended February 24, 2026.",
        "Canadian worsted yarn and other goods" + tr("Canada") + " pay nothing extra with USMCA, except 50% on greasy fine wool of "
        "5101.11.60 and wool waste of 5103.20 (60% without a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94); goods must meet the General Note 11 rules of origin for "
        "Chapter 51. The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "Mexican worsted yarn and fabric" + tr("Mexico") + " pay $0 extra with a valid USMCA claim and 10% without one.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 51 line; its exemption list (U.S. note 50(a)(ii), "
        "9903.05.03) " + NO_LIST + ". The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties ended February 24, 2026.",
        "Brazilian wool and hair" + tr("Brazil") + " pay 37.5% on top of the base rate.",
        ["eo-14323", "eo-14389"],
    ),
    "jp-section-301": (
        "Japanese goods pay 12.5% in total in place of a lower base rate (note 52(k)); the 25% fabric lines pay their base rate "
        "only. Japan has no exception list naming Chapter 51. " + ENDED,
        "Japanese wool fabric pays its 25% base rate; yarn and fibre pay 12.5% in total.",
        ["eo-14389"],
    ),
    "tr-section-301": (
        "Türkiye has no exception list for Chapter 51. " + ENDED,
        "Turkish wool yarn and fabric" + tr("Türkiye") + " pay the base rate plus 12.5%.",
        ["eo-14389"],
    ),
    "ar-section-301": (
        "Argentina's exception lists (U.S. note 52(j)(8), 9903.06.10–9903.06.11) " + NO_LIST + ". " + ENDED,
        "Argentine wool tops and scoured wool" + tr("Argentina") + " pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "kr-section-301": (
        "South Korean goods pay 12.5% in total in place of a lower base rate (note 52(k)); a KORUS claim removes the base rate "
        "but not the duty. " + ENDED,
        "Korean wool fabric pays its 25% base rate (12.5% with a KR claim); yarn pays 12.5% in total.",
        ["eo-14389"],
    ),
    "ch-section-301": (
        "Swiss goods pay 12.5% in total in place of a lower base rate (note 52(k)); Switzerland's exception list (note "
        "52(j)(3), 9903.05.98) names one Chapter 51 code, processed cashmere 5102.11.90. " + ENDED,
        "Swiss wool fabric pays its 25% base rate; processed cashmere fibre is exempt.",
        ["eo-14389"],
    ),
    "other-section-301": (
        "Exception lists in U.S. note 52(j) reach Chapter 51 for: Jordan (5102.11.90, 5102.19.20 and every subheading of "
        "5104–5113, 9903.06.20); Guatemala and El Salvador (5104–5113 when entered under CAFTA-DR, 9903.06.06 and 9903.06.09); "
        "Cambodia (5102.11.90 and 5102.19.20, 9903.06.02); Taiwan and Switzerland (5102.11.90, 9903.06.14 and 9903.05.98). "
        "CAFTA-DR textile goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered duty-free with a CAFTA-DR claim (SPI P/P+) are exempt on 5105–5113 except 5105.40 (note 52(i), 9903.05.95); raw wool, hair and waste of 5101–5104 are not covered, and lines already Free at the general rate carry no P rate to claim. " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Taiwan pays 10% in total, and countries outside the 60 "
        "economies — Mongolia, for example — pay only the base rate.",
        ["eo-14389"],
    ),
}
for k, x in IE.items():
    ex, wim, extra = EXEMPT_ALL[k]
    x["exemption"] = ex
    x["whatItMeans"] = wim
    for sid in extra:
        if sid not in x["sourceIds"]:
            x["sourceIds"].insert(len(x["sourceIds"]) - 1, sid)
    if k == "other-section-301" and "…" in x["country"]:
        x["country"] = "Other Section 301 economies (including Argentina, Switzerland, South Korea, Taiwan, Jordan, Guatemala and El Salvador)"
add_sources(tu, [s for k in IE for s in EXEMPT_ALL[k][2]])

gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 51 base-rate changes"
base["sourceIds"] = base["sourceIds"] + ["hts-ch51"]
base["detail"] = (
    "All 124 Chapter 51 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition; no line was added, split or renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 List 3 continues",
       "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
       "four-year review. For Chapter 51 this keeps +25% (List 3, 9903.88.03) on all 101 subheadings.",
       None, None, "China", ["fr-2026-20510", "fr-2018-20610", "fr-2019-09681", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 51",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motor vehicles from "
       "September 29, 2026. No Chapter 51 line is on their annexes.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; wool lines stay on it",
       "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026. Neither Chapter 51 "
       "provision (5101.11.60, 5103.20.00) was removed; Revision 21 still lists both in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on greasy fine wool and wool waste",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3), which "
       "include greasy shorn wool finer than 46s (5101.11.60) and other waste of wool or fine animal hair (5103.20.00). It is "
       "charged even when USMCA is claimed and on top of the 10% Section 301 duty on non-USMCA goods. Planned for August 19, "
       "it took effect August 22 after a 3-day suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 51 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84); no Chapter 51 subheading is on the general "
       "exemption list (note 52(b)). Peru, Chile, New Zealand, Australia, Uruguay, South Africa and Türkiye pay 12.5%; the "
       "UK, India and Argentina 10%; EU goods 10% in total and Japanese, Korean and Swiss goods 12.5% in total. Jordan's list, "
       "the Guatemala and El Salvador CAFTA-DR lists (5104–5113) and single-line lists for Cambodia, Taiwan and "
       "Switzerland (processed cashmere) exempt some Chapter 51 goods. USMCA-qualifying goods are exempt (9903.05.93, "
       "9903.05.94), and so are CAFTA-DR textile goods of 5105–5113 (not 5105.40) entered duty-free with a P/P+ claim (note "
       "52(i), 9903.05.95); AU, PE, CL and other FTA claims remove the base rate but not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 51 subheading is on Brazil's exemption list (U.S. note 50(a)(ii), "
       "9903.05.03). From July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 51 subheading was on the product "
       "exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
       None, "+10% (until July 23, 2026)", "All", ["procl-11012", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
       "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
       "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
       "printed in Revision 21 but are no longer in effect.",
       "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("india-oil-end", "extraDuty", "2026-02-07", "Effective", "India's extra 25% IEEPA duty removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. India's "
       "25% reciprocal rate ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA "
       "(SPI D) is printed on four Chapter 51 lines — mohair, alpaca and other hair of 5102.19.60, noils (5103.10), other "
       "wool waste (5103.20) and horsehair fabric (5113.00). GSP (SPI A), printed on the same lines, remains expired since "
       "December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 51 line.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 51 "
       "line on top of the List 3 duty until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all. Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example New Zealand +15%, South Africa +30%, "
       "India +25%, Türkiye +15%, while Peru, Chile, Australia, Uruguay and the UK stayed at +10%, and EU and Japanese goods paid 15% "
       "in total. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended "
       "February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 51 subheading was on "
       "the general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) "
       "to +20%, on top of the 25% List 3 duty on cashmere, tops, yarn and fabric.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended "
       "February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
]
changes += [
    ch("wool-trq-removed", "reference", "2019-07-16", "Published", "Worsted wool fabric tariff-rate quotas end",
       "Commerce removed its regulations for the worsted wool fabric tariff-rate quotas of the Trade and Development Act of "
       "2000 because the quota authority had expired. Revision 21 has no Chapter 99 heading lowering the duty on 5111 or "
       "5112 fabric, so worsted suitings pay the full 25% base rate.",
       None, None, "All", ["fr-2019-14551", "hts-chapter-99"]),
    ch("ar-wool-cvd-revoked", "reference", "1997-08-01", "Published", "Countervailing duty order on wool from Argentina revoked",
       "Commerce revoked the countervailing duty order on wool from Argentina after a changed-circumstances review. No "
       "antidumping or countervailing duty order has covered Chapter 51 goods since.",
       None, None, "Argentina", ["fr-1997-20379"]),
]
tu["changes"] = changes
add_sources(tu, [s for c in changes for s in c["sourceIds"]])

# ---------------------------------------------------------------- understandIndustry
ui["h1"] = "HTS Chapter 51: Wool, Cashmere & Alpaca — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = (
    f"Wool & Cashmere Imports to the U.S. by Country: {T1}, {T2}, {TOP[2]} — HTS Chapter 51 Statistics | KoalaGains"
)
ui["seo"]["shortDescription"] = (
    f"U.S. imports of wool, cashmere, alpaca, mohair, wool tops, yarn and wool fabric 2020–{YEAR} by country, product and "
    f"year: {m(TOTAL)} in {YEAR}. {T1} supplied {share(imp(T1))}; yarn was {share(YARN)} and woven wool fabric {share(FAB)}."
)
ui["seo"]["keywords"] = [
    "wool importers in usa",
    "us wool imports by country",
    "australia wool tariff updates",
    "woven fabrics of combed wool trade impact",
    "cashmere imports",
    "alpaca imports from peru",
    "imported wool fabric",
]
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["byYearPartners"] = [d["understandIndustry"]["byCountry"][0]["country"], d["understandIndustry"]["byCountry"][1]["country"]]
ui["byYearCaption"] = (
    f"U.S. imports of Chapter 51 goods each year, split into the two largest {YEAR} suppliers ({T1} and {T2}) and everyone else."
)
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
peak = max(ui["byYear"], key=lambda r: r["totalUsd"])
rank = sorted(H.items(), key=lambda x: -x[1])


def hpart(h):
    return f"**{LABELS[h][1].lower()}** ({h}) {m(H[h])} ({share(H[h])})"


ui["why"] = (
    f"U.S. imports of Chapter 51 goods were **{m(TOTAL)} in {YEAR}**, {'up' if CHG >= 0 else 'down'} {abs(CHG):.1f}% from "
    f"{m(PRIOR)} in {YEAR - 1}"
    + (f", against a peak of {m(peak['totalUsd'])} in {peak['year']}" if peak["year"] != YEAR else ", the highest of the period")
    + f". **{T1} shipped {m(imp(T1))} ({share(imp(T1))})**, then "
    + ", ".join(f"**{c}** {m(imp(c))} ({chg(c):+.0f}%)" for c in TOP[1:6])
    + ".\n\n"
    + "By product, the largest were " + ", ".join(hpart(h) for h, _ in rank[:4]) + ". "
    + f"Yarn of 5106–5109 was {m(YARN)} ({share(YARN)}) in all: retail yarn mostly from {top_suppliers('5109', 2)}, "
    f"worsted yarn from {top_suppliers('5107', 3)}. Worsted fabric came from {top_suppliers('5112', 3)}, woollen fabric "
    f"from {top_suppliers('5111', 2)}. Fibre, waste and tops (5101–5105) were only {m(FIBRE)}; raw wool came mostly from "
    f"{top_suppliers('5101', 2)}.\n\n"
    "Through 2025 most suppliers paid the IEEPA tariffs on top of the base rate, and China its 25% List 3 duty as well. The "
    "IEEPA duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of 10% or 12.5% applies to most of "
    f"these suppliers instead. {YEAR} is the latest full year of U.S. trade data."
)
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. Subheading 5102.19 combines alpaca, llama, mohair, camel and other fine hair, so they cannot be shown separately. "
    "Country names follow Comtrade (\"Other Asia, nes\" is mainly Taiwan)."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 51 Tariff Rates by Country: Wool & Wool Fabric from Italy, Peru, China, Australia & More"
ia["seo"]["title"] = (
    "Wool Import Duty by Country 2026: Italy, Peru, China, Australia, UK — HTS Chapter 51 Rates | KoalaGains"
)
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on raw wool, cashmere and alpaca hair, tops, wool yarn and wool fabric by country: base rate plus "
    "the 2026 Section 301 duty, China's List 3, Brazil's 25% and Canada's Section 338 duty, with the EU's 10% total, USMCA, "
    "Australia and Peru FTA claims applied."
)
ia["seo"]["keywords"] = [
    "italy import duty on worsted wool",
    "australia preferential trade tariff wool",
    "carded wool import duty rates",
    "peru alpaca yarn tariffs",
    "italy luxury fabric customs duty",
    "china cashmere tariff",
    "tariffs on wool from uk",
    "wool tariff by country",
]
ia["intro"] = (
    "The total rate on Chapter 51 goods depends on **what they are and where they come from**. Each cell below is the base "
    "rate for that product group plus the extra duty for that country, minus any preference — computed from the current "
    "tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026). **Peruvian** yarn and **Chilean** worsted fabric are Free with an FTA claim but pay "
    "12.5%; **British** fabric pays 25% plus 10%; "
    "**Italian and other EU fabric** pays only its 25% base rate (EU goods pay 10% in total where the base rate is lower); "
    "**China and Brazil pay 37.5% more** on every line, and Canadian greasy fine wool and wool waste pay 50% under Section "
    "338 even with USMCA. Wool rates per clean kilogram are shown as written."
)
EU = (
    "EU: 10% in total in place of a lower base rate (9903.05.39, U.S. note 52(k)); the 25% woollen and worsted fabric lines "
    "pay their base rate only. The EU exception list names no Chapter 51 code."
)
RULES = {
    "Australia": "Base rate plus 12.5% Section 301 (9903.05.23) on every line. Australia FTA (AU, applied here) removes the "
    "base rate on the dutiable lines, not the 12.5%. No exception list.",
    "New Zealand": "Base rate plus 12.5% Section 301 (9903.05.57) on every line; no FTA and no exception list.",
    "Italy": EU, "Germany": EU, "France": EU, "Czech Republic": EU, "Portugal": EU, "Spain": EU, "Austria": EU,
    "Belgium": EU, "Netherlands": EU, "Poland": EU, "Lithuania": EU, "Romania": EU, "Ireland": EU,
    "China": "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31) on every line: 37.5% extra, 62.5% on 25% "
    "fabric. No exclusion in force.",
    "Chile": "Chile FTA (CL, applied here) removes the base rate, including the 25% on worsted fabric; 12.5% Section 301 "
    "(9903.05.30) applies on every line. No exception list.",
    "Uruguay": "Base rate plus 12.5% Section 301 (9903.05.82) on every line; no FTA and no exception list.",
    "South Africa": "Base rate plus 12.5% Section 301 (9903.05.69) on every line; AGOA (four lines) is not applied here.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no Chapter 51 code.",
    "Peru": "Peru TPA (PE, applied here) removes the base rate; 12.5% Section 301 (9903.05.63) applies on every line.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. GSP has expired; the IEEPA duties "
    "(up to 50%) ended in February 2026.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on 5101.11.60 and "
    "5103.20.00 even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on those lines.",
    "Mexico": "USMCA-qualifying: no extra duty (9903.05.94), and the base rate is Free under USMCA. Otherwise the base rate "
    "plus 10% (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line: 37.5% extra.",
    "Japan": "12.5% in total in place of a lower base rate (9903.05.49, U.S. note 52(k)); the 25% fabric lines pay their base "
    "rate only. No exception list for Chapter 51.",
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on every line; no exception list.",
    "Argentina": "Base rate plus 10% Section 301 (9903.05.22) on every line; Argentina's exception lists name no Chapter 51 code.",
    "South Korea": "12.5% in total in place of a lower base rate (9903.05.71); KORUS (KR, applied here) removes the base rate. "
    "No exception list for Chapter 51.",
    "Switzerland": "12.5% in total in place of a lower base rate (9903.05.74); processed cashmere (5102.11.90) is exempt "
    "(9903.05.98).",
    "Mongolia": "Base rate only: Mongolia is not one of the 60 Section 301 economies, and the IEEPA duties ended in February 2026.",
    "Bolivia": "Base rate only: Bolivia is not one of the 60 Section 301 economies.",
    "Hong Kong": "Base rate plus 12.5% Section 301 (9903.05.43) on every line.",
    "Taiwan": "10% in total in place of a lower base rate (9903.05.76); processed cashmere (5102.11.90) is exempt (9903.06.14).",
    "Pakistan": "Base rate plus 10% Section 301 (9903.05.62) on every line; no exception list.",
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies, such as Mongolia) to base "
    "rate plus 12.5% (9903.05.20–9903.05.84). Jordan (9903.06.20) and CAFTA-DR claims from Guatemala and El Salvador "
    "(9903.06.06, 9903.06.09) are exempt on 5104–5113, and CAFTA-DR claims from any of the six members on 5105–5113 except "
    "5105.40 (note 52(i), 9903.05.95); Column 2 countries (Russia, Belarus) pay Column 2 rates.",
}
EXTRA_SIDS = {"India": ["cbp-gsp", "eo-14384", "eo-14389"], "Canada": ["procl-11048", "eo-14389"],
              "Mongolia": [], "Bolivia": [], "Any other country": []}
missing = [c["country"] for c in ia["countries"] if c["country"] not in RULES]
assert not missing, missing
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    for sid in EXTRA_SIDS.get(c["country"], ["eo-14389"]):
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "EU, Japanese, Korean and Swiss rates of \"10% / 12.5% in total\" replace the base rate when it is lower (U.S. note 52(k)); "
    "on the 25% fabric lines the base rate applies alone.",
    "Rates per clean kilogram (raw wool) depend on the clean yield of each lot, which CBP tests after entry (19 CFR 151.61–151.76).",
    "Wool for special uses: the general rate is Free; the Column 2 \"Free, under bond\" condition is not shown.",
    "CAFTA-DR: the note 52(j) code lists of Guatemala and El Salvador and the note 52(i) exemption for CAFTA-DR textile "
    "goods (9903.05.95: 5105–5113 except 5105.40, for all six CAFTA-DR countries) apply only when SPI P or P+ is claimed; "
    "lines Free at the general rate print no P rate, so the exemption is not applied there. No CAFTA-DR country is a large "
    "enough Chapter 51 supplier to get its own row (Guatemala $0.7M in 2025); they fall under Any other country.",
    "Not in the grid: APHIS entry conditions for raw wool and hair (9 CFR 95.18–95.19), FWS rules for vicuña, CBP textile "
    "origin and clean-yield testing, and FTC wool labeling — see Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III, the Section 232 notes and subchapter II in "
    "the 2026 Revision 21. Note 52(b) (9903.05.86) names no Chapter 51 code. Note 52(j) names Chapter 51 codes for Jordan "
    "(5102.11.90, 5102.19.20 and the 61 subheadings of 5104–5113, 9903.06.20), for CAFTA-DR claims from Guatemala and El "
    "Salvador (5104–5113, 9903.06.06, 9903.06.09), for Cambodia (5102.11.90, 5102.19.20, 9903.06.02) and for Taiwan and "
    "Switzerland (5102.11.90, 9903.06.14, 9903.05.98); the UK, EU, Argentine and other lists name none. Note 52(i) "
    "(9903.05.95) exempts CAFTA-DR textile goods entered duty-free with an SPI P/P+ claim, on 5105–5113 except 5105.40 "
    "(the textile lines of general note 29(d)(v)); 5101–5104 are outside it. Note 50(a)(ii) names no Chapter 51 code for Brazil. "
    "Note 51(b)(3) puts 5101.11.60 and 5103.20.00 on the Canada Section 338 list. Note 20 puts all 101 Chapter 51 "
    "subheadings on List 3; the past exclusions for Merino yarn (5106.10.0090) and cashmere yarn (5108.10.8000) have lapsed "
    "and no exclusion in force (9903.88.69, 9903.88.70) names a Chapter 51 code; note 31 names none. Note 30 (Russia) names "
    "none. The duty suspensions 9902.12.69–9902.12.82 (cashmere, camel hair, vicuña) expired December 31, 2020, and no "
    "wool-fabric quota remains. No Section 232 heading and no antidumping or countervailing duty order covers a Chapter 51 line."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Wool, Cashmere & Alpaca (HTS Ch. 51): Clean Yield, APHIS, Labeling & Ways to Lower Duty"
te["seo"]["title"] = (
    "Importing Wool & Cashmere: Clean-Yield Testing, APHIS Wool Rules, Wool Labeling Act & Ways to Lower Duty (HTS Ch. 51) | KoalaGains"
)
te["seo"]["shortDescription"] = (
    "The CBP, USDA APHIS, FWS and FTC rules for each HTS Chapter 51 line — clean-yield sampling and wool grading (19 CFR 151), "
    "APHIS foot-and-mouth disease rules for raw wool and hair (9 CFR 95), vicuña permits, textile origin and the Wool "
    "Products Labeling Act (16 CFR 300) — and the legal ways to pay less."
)
te["seo"]["keywords"] = [
    "wool products labeling act",
    "wool products labeling act of 1939",
    "clean wool yield",
    "importing raw wool",
    "wool for special uses",
    "cashmere labeling 19 microns",
    "wool fabric sample hs code",
    "wool tariff engineering",
]
te["intro"] = (
    "Raw wool is the one textile CBP charges by **clean weight**: invoices must give the condition, grade and estimated clean "
    "yield of each lot, and CBP samples and lab-tests it before liquidating the duty (19 CFR 151.61–151.76). **APHIS** lets "
    "wool and hair in without restriction only if it comes from a region free of foot-and-mouth disease, was clipped from live "
    "animals, was scoured or dyed, or carries a slaughter certificate; otherwise it goes under seal to an approved "
    "establishment (9 CFR 95.18–95.19). Vicuña needs CITES labels, and wool yarns and fabrics sold on must be labeled under the "
    "**Wool Products Labeling Act** — \"cashmere\" only if 19 microns or finer.\n\n"
    "The ways to pay less are in the schedule: claim the **Australia or Peru FTA** or **USMCA**, use the **Jordan or CAFTA-DR "
    "exception lists**, enter coarse wool as **wool for special uses**, get the **classification** right where fineness, "
    "processing or weave moves the rate, enter **samples** under Chapter 98, and claim **drawback** on re-exports."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "fta",
        "title": "Claim the Australia, Peru or another FTA rate on the dutiable lines",
        "saves": "The base rate: 18.7¢–24.4¢ per clean kg on fine wool, 4%–6% on yarn, 25% on most wool fabric",
        "appliesTo": "The 95 dutiable lines, for goods of Australia, Peru, Korea, Chile, Colombia, Panama, Israel, Jordan, "
        "Morocco, Bahrain, Oman, Singapore and CAFTA-DR countries; CBERA (E) on the fibre lines; AGOA (D, through December 31, "
        "2026) on 5102.19.60, 5103.10, 5103.20 and 5113.00",
        "document": "Proof of origin under the agreement and the SPI on the entry line (AU, PE, KR, CL, CO, PA, IL, JO, MA, BH, "
        "OM, SG, P, E, D).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)), except CAFTA-DR textile goods of "
        "5105–5113 (not 5105.40) entered duty-free with a P/P+ claim (note 52(i), 9903.05.95). GSP (A) has been expired since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a), (i)", "url": CH99},
            {"label": "CBP: GSP status", "url": src("cbp-gsp")["url"]},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on wool, yarn or fabric made in Mexico or Canada",
        "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 25%)",
        "appliesTo": "All 124 lines, for goods that qualify as originating under General Note 11 (Chapter 51 product-specific "
        "rules of origin)",
        "document": "A certification of origin from the importer, exporter or producer, in any format, with the SPI \"S\" on "
        "the entry line.",
        "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on greasy fine wool (5101.11.60) and wool waste "
        "(5103.20). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94 / 9903.03.14", "url": CH99},
        ],
    },
    {
        "id": "exception-lists",
        "title": "Use an exception list or CAFTA-DR: Jordan, the six CAFTA-DR countries, or processed cashmere from Switzerland, Taiwan or Cambodia",
        "saves": "The whole 10%–12.5% Section 301 duty",
        "appliesTo": "Jordan: 5102.11.90, 5102.19.20 and all of 5104–5113 (9903.06.20); Guatemala and El Salvador under "
        "CAFTA-DR: 5104–5113 (9903.06.06, 9903.06.09); any CAFTA-DR country entering 5105–5113 (not 5105.40) duty-free with a "
        "P/P+ claim (note 52(i), 9903.05.95); Cambodia: 5102.11.90 and 5102.19.20 (9903.06.02); Taiwan and "
        "Switzerland: 5102.11.90 (9903.06.14, 9903.05.98)",
        "document": "Proof of origin for the country claimed (invoice, manufacturer ID, production records), the exemption "
        "heading on the entry line, and for CAFTA-DR the SPI \"P\" claim.",
        "caveat": "Raw and scoured wool of 5101 is on no exception list. Origin follows 19 CFR 102.21: yarn is from where it "
        "was spun and fabric from where it was woven.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
            {"label": "19 CFR 102.21 (textile origin)", "url": ecfr(19, "102.21")},
        ],
    },
    {
        "id": "special-uses",
        "title": "Enter coarse carpet and felting wool as \"wool for special uses\"",
        "saves": "For Column 2 origins, 55.1¢–81.6¢ per clean kg on wool not finer than 46s; at the general rate this wool is Free anyway",
        "appliesTo": "5101.11.10, 5101.19.10, 5101.21.10 and 5101.29.10: wool not finer than 46s, certified for felt or knit "
        "boots, floor coverings, lumbermen's socks, press cloth, papermakers' felts or polishing felt",
        "document": "A dealer, manufacturer or processor certification of the special use and a bond; transfers only to "
        "another bonded user; misuse reported within 30 days.",
        "caveat": "If the wool is used otherwise, the regular duty on it in its condition as entered becomes payable, and the "
        "Section 301 duty still applies to the country's goods (Russia 12.5%).",
        "citations": [
            {"label": "HTSUS Chapter 51, additional U.S. note 2(d)", "url": CH51},
            {"label": "19 CFR part 113 (customs bonds)", "url": ecfr_part(19, 113)},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling where fineness, processing or weave decides the rate",
        "saves": "Up to 25 points: 46s and coarser wool (Free) vs. finer wool (18.7¢+/clean kg); degreased vs. further "
        "processed (6.5¢/kg + 5.3%); fine animal hair (yarn 4%) vs. wool (6%); upholstery fabric (7%) vs. apparel fabric (25%); "
        "30% silk over $33/kg (6.9%); hand-woven narrow-loom fabric (10%)",
        "appliesTo": "Any line where wool grade, fibre blend, fabric use or weight is in doubt — especially wool–cashmere and "
        "wool–synthetic blends, which follow the fibre that predominates by weight (Section XI note 2)",
        "document": "A ruling request to CBP describing fibre content by weight, micron and grade, construction, weight in "
        "g/m² and end use (19 CFR part 177); invoices must state the same details (19 CFR 141.89, 151.62).",
        "caveat": "Grades follow USDA standards in force on the date of import (additional U.S. note 2(f)), and CBP examines "
        "wool for grade (19 CFR 151.76).",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "19 CFR 151.76 (grading of wool)", "url": ecfr(19, "151.76")},
            {"label": "HTSUS Chapter 51 notes", "url": CH51},
        ],
    },
    {
        "id": "samples",
        "title": "Enter fabric swatches and yarn cards as samples",
        "saves": "All duty — base rate and the Section 301 and China duties",
        "appliesTo": "Wool fabric swatches and yarn samples valued at $1 or less each, or marked, torn or perforated so they "
        "cannot be sold, used only to solicit orders",
        "document": "Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.",
        "caveat": "Usable sample lengths do not qualify. U.S. notes 20 and 52 exempt goods properly entered under Chapter 98 "
        "from those extra duties; the Canada Section 338 duty also excludes most Chapter 98 entries.",
        "provisions": [
            {"code": "9811.00.60", "rate": "Free", "text": "Samples valued not over $1 each, or marked, torn, perforated or otherwise treated so they are unsuitable for sale, used only for soliciting orders for products of foreign countries"}
        ],
        "citations": [
            {"label": "HTSUS 9811.00.60", "url": CH98},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20(a), 51(a), 52(a)", "url": CH99},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the wool, yarn or fabric, or what it is made into, is exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported goods re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general manufacturing ruling.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
]
te["rules"] = [
    {
        "id": "clean-yield",
        "agency": "CBP",
        "title": "Wool and hair dutiable per clean kilogram: invoices must show condition, vegetable-matter level, length, "
        "origin, grade and the shipper's clean-yield estimate; the entry summary shows estimated clean kilograms; CBP weighs, "
        "samples and lab-tests each sampling unit, and the importer may ask for a retest and a commercial test",
        "citations": [
            {"label": "19 CFR 151.62 (invoices)", "url": ecfr(19, "151.62")},
            {"label": "19 CFR 151.68 (sampling)", "url": ecfr(19, "151.68")},
            {"label": "19 CFR 151.71 (laboratory testing)", "url": ecfr(19, "151.71")},
            {"label": "19 CFR 151.75 (final clean yield)", "url": ecfr(19, "151.75")},
        ],
    },
    {
        "id": "wool-grade",
        "agency": "CBP / USDA",
        "title": "Wool dutiable per clean kilogram is examined for grade against the USDA wool standards in force on the date "
        "of import; a higher grade than entered means a higher rate",
        "citations": [
            {"label": "19 CFR 151.76", "url": ecfr(19, "151.76")},
            {"label": "HTSUS Chapter 51, additional U.S. note 2(f)", "url": CH51},
        ],
    },
    {
        "id": "special-uses-bond",
        "agency": "CBP",
        "title": "Wool for special uses (not finer than 46s) is released only under a bond securing its use in felt, carpets, "
        "press cloth or papermakers' felts; other use makes the regular duty payable",
        "citations": [
            {"label": "HTSUS Chapter 51, additional U.S. note 2(d)", "url": CH51},
            {"label": "19 CFR part 113", "url": ecfr_part(19, 113)},
        ],
    },
    {
        "id": "aphis-wool",
        "agency": "USDA APHIS",
        "title": "Wool and hair of ruminants: unrestricted entry if from a region free of foot-and-mouth disease, clipped from "
        "live animals and reasonably free of dung, scoured, washed or dyed, or certified as from inspected slaughter; otherwise "
        "moved under seal to an approved establishment and handled under inspection. Bloodstained wool or hair is prohibited",
        "citations": [
            {"label": "9 CFR 95.18", "url": ecfr(9, "95.18")},
            {"label": "9 CFR 95.19", "url": ecfr(9, "95.19")},
        ],
    },
    {
        "id": "vicuna",
        "agency": "FWS",
        "title": "Vicuña: only wool sheared from live animals of CITES Appendix II populations, and cloth and products from it, "
        "may be imported, with the vicuña logotype and \"VICUÑA—COUNTRY OF ORIGIN\" on the selvages; wildlife imports are "
        "declared to FWS",
        "citations": [
            {"label": "50 CFR 23.75", "url": ecfr(50, "23.75")},
            {"label": "50 CFR part 14 (wildlife import declaration)", "url": ecfr_part(50, 14)},
        ],
    },
    {
        "id": "textile-origin",
        "agency": "CBP",
        "title": "Textile country of origin: raw wool and hair from where shorn or obtained; scouring, carding or combing do not "
        "shift origin (5101–5103 and 5105 need a change from another chapter); yarn from where it was spun; fabric from where "
        "it was woven",
        "citations": [{"label": "19 CFR 102.21(c), (e)", "url": ecfr(19, "102.21")}],
    },
    {
        "id": "textile-mid",
        "agency": "CBP",
        "title": "Manufacturer identification code (MID) of the company that performed the origin-conferring operation on every "
        "entry; entry is denied for textiles from companies named by CITA for transshipment",
        "citations": [
            {"label": "19 CFR 102.23", "url": ecfr(19, "102.23")},
            {"label": "19 CFR 102.24", "url": ecfr(19, "102.24")},
        ],
    },
    {
        "id": "invoice",
        "agency": "CBP",
        "title": "Invoice details for yarn and fabric: fibre content by weight with each fibre's generic name and percentage, "
        "and for fabric the construction, weight per m² and finish that pick the 10-digit line",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (textile fiber products)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "ftc-wool",
        "agency": "FTC",
        "title": "Wool Products Labeling Act: wool yarns, fabrics and products sold onward must show fibre content and the "
        "country where processed or made; \"cashmere\" only for fibre averaging 19 microns or less, and \"Super 100s\"-type "
        "terms only at the listed fibre diameters",
        "citations": [
            {"label": "15 U.S.C. 68", "url": src("usc-15-68")["url"]},
            {"label": "16 CFR 300.3 (label information)", "url": ecfr(16, "300.3")},
            {"label": "16 CFR 300.19 (cashmere, mohair)", "url": ecfr(16, "300.19")},
            {"label": "16 CFR 300.20a (very fine wool)", "url": ecfr(16, "300.20a")},
            {"label": "16 CFR 300.25 (country of origin)", "url": ecfr(16, "300.25")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List are presumed made with "
        "forced labor and excluded unless the importer rebuts it",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the article or, for bales of wool and piece goods, on the container",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
        ],
    },
]
RAW = ["clean-yield", "wool-grade", "aphis-wool", "textile-origin", "textile-mid", "uflpa", "cbp-marking"]
HAIR = ["aphis-wool", "vicuna", "textile-origin", "textile-mid", "ftc-wool", "uflpa", "cbp-marking"]
TEXTILE = ["textile-origin", "textile-mid", "invoice", "ftc-wool", "uflpa", "cbp-marking"]
GROUP_RULES = {
    "5101": ["clean-yield", "wool-grade", "special-uses-bond", "aphis-wool", "textile-origin", "textile-mid", "uflpa", "cbp-marking"],
    "5102": ["clean-yield"] + HAIR,
    "5103": ["aphis-wool", "textile-origin", "textile-mid", "uflpa", "cbp-marking"],
    "5104": ["textile-origin", "textile-mid", "ftc-wool", "uflpa", "cbp-marking"],
    "5105": ["aphis-wool", "vicuna", "textile-origin", "textile-mid", "uflpa", "cbp-marking"],
    "5106": TEXTILE, "5107": TEXTILE, "5108": ["vicuna"] + TEXTILE, "5109": TEXTILE, "5110": TEXTILE,
    "5111": ["vicuna"] + TEXTILE, "5112": ["vicuna"] + TEXTILE, "5113": TEXTILE,
}
GROUP_NOTES = {
    "5101": "Duty per clean kg on wool finer than 46s, set after CBP tests clean yield and grade. APHIS: unrestricted only "
    "from FMD-free regions, if clipped from live animals, or if scoured.",
    "5102": "Cashmere and camel hair pay per clean kg; alpaca and mohair 0.4%. Vicuña fibre needs CITES labeling; "
    "processed cashmere (5102.11.90) is on the Jordan, Swiss, Taiwanese and Cambodian exception lists.",
    "5103": "Noils and other wool waste: Canada's 5103.20 pays the 50% Section 338 duty even with USMCA.",
    "5104": "Garnetted stock is Free; recycled-wool content must be disclosed on wool labels.",
    "5105": "Combing tops from imported greasy wool does not change origin under the tariff-shift rule; get a ruling before "
    "relying on the combing country.",
    "5106": "Woollen yarn takes the origin of the spinning country. 6%; on the Jordan and CAFTA-DR exception lists.",
    "5107": "Worsted yarn takes the origin of the spinning country. 6%; the 18.5-micron split is statistical only.",
    "5108": "Cashmere, alpaca and mohair yarn, 4%. Labels may say \"cashmere\" only for fibre of 19 microns or less.",
    "5109": "Retail hand-knitting yarn, 6% wool, 4% Angora; dyed rug yarn cut to 8 cm or less is Free.",
    "5110": "Horsehair yarn is Free; raw horsehair is heading 0511, not Chapter 51.",
    "5111": "Woollen fabric takes the origin of the weaving country. 25% apparel fabric vs. 7% upholstery: classification "
    "follows the fabric as entered.",
    "5112": "Worsted fabric takes the origin of the weaving country. \"Super 120s\" and similar labels must meet 16 CFR 300.20a.",
    "5113": "Horsehair and coarse-hair fabric, 2.7%; AGOA (D) Free for beneficiary countries.",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES[g["heading"]]
    g["note"] = GROUP_NOTES[g["heading"]]
FREE_LINES = {r["hts"] for r in ov["rateTable"]["rows"] if not r.get("isHeaderRow") and not r.get("dutiable")}
SPECIAL = ("5101.11.10", "5101.19.10", "5101.21.10", "5101.29.10")
EXC = ("5102.11.90", "5102.19.20", "5104", "5105", "5106", "5107", "5108", "5109", "5110", "5111", "5112", "5113")
for ln in te["lines"]:
    h = ln["hts"]
    ln["ruleIds"] = GROUP_RULES[h[:4]]
    lev = []
    if h not in FREE_LINES:
        lev.append("fta")
    lev.append("usmca")
    if h.startswith(EXC):
        lev.append("exception-lists")
    if h.startswith(SPECIAL):
        lev.append("special-uses")
    lev += ["ruling", "samples", "drawback"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, the China list "
    "and the Canada Section 338 list change by proclamation or USTR notice, and APHIS disease status changes by region; "
    "check them before each shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 51 FAQ: Wool, Cashmere, Alpaca & Mohair HS Codes and Import Tariffs"
fc["seo"]["title"] = "Wool, Cashmere & Alpaca HS Code and Tariff FAQ 2026: Wool Yarn, Wool Fabric, Mohair (HTS Chapter 51) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing Chapter 51 goods: the HS code for wool, wool yarn, wool fabric, cashmere, "
    "alpaca, mohair and horsehair, and the 2026 tariffs on wool from Australia, Peru, Italy, the UK and China."
)
fc["seo"]["keywords"] = [
    "wool hs code",
    "wool fabric hs code",
    "wool yarn hs code",
    "merino wool yarn hs code",
    "cashmere hs code",
    "cashmere yarn hs code",
    "alpaca yarn hs code",
    "mohair hs code",
    "horsehair hs code",
    "wool tariff code",
    "tariff on wool",
    "wool products labeling act",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing wool, cashmere, alpaca, mohair and wool yarn and fabric into "
    "the U.S. — HS codes, tariffs by country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 51 base rates are unchanged since January 2025: wool not finer than 46s is Free, finer wool 18.7¢–24.4¢ per "
    "clean kg, yarn 4%–6%, and most woollen and worsted fabric 25%.",
    "Since July 24, 2026 most suppliers pay a 10% or 12.5% Section 301 tariff — Peru, Chile, New Zealand and Australia "
    "12.5% even with an FTA claim, the UK 10%; EU fabric pays only its 25% base rate.",
    "China and Brazil pay 37.5% extra on every line; Canadian greasy fine wool and wool waste pay 50% under Section 338 "
    "even with USMCA.",
    "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026. There is no wool-fabric "
    "quota and no antidumping or countervailing duty on Chapter 51 goods.",
    "Raw wool is dutied on CBP-tested clean yield and needs APHIS clearance; wool yarn and fabric follow textile origin rules "
    "and the Wool Products Labeling Act.",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "wool-hs-code",
        "question": "What is the HS code for raw wool?",
        "searchedAs": ["wool hs code", "wool tariff code", "raw wool hs code", "merino wool hs code", "greasy wool hs code"],
        "answer": "Raw wool, not carded or combed, is heading 5101: greasy shorn wool 5101.11, other greasy (skin) wool 5101.19, "
        "degreased (scoured) wool 5101.21 and 5101.29, carbonized wool 5101.30. Each splits by fineness: wool not finer than "
        "46s is Free, finer merino-type wool pays 18.7¢ (greasy), 20.6¢ (scoured) or 24.4¢ (carbonized) per clean kg. Wool "
        "tops are 5105.29.",
        "link": "",
    },
    {
        "id": "wool-fabric-hs-code",
        "question": "What is the HS code for wool fabric?",
        "searchedAs": ["wool fabric hs code", "wool fabric hts code", "woven wool fabric hs code", "100 wool fabric hs code", "wool cloth hs code", "wool fabric tariff code", "merino wool fabric hs code"],
        "answer": "Woven wool fabric is 5111 if made of carded (woollen) yarn and 5112 if of combed (worsted) yarn, split by "
        "weight and blend. Most apparel lines are 25%; tapestry and upholstery fabric 7%; hand-woven fabric on looms under 76 "
        "cm 10%; fabric with 30% or more silk valued over $33/kg 6.9%. Knitted wool fabric is chapter 60, and poly-wool "
        "fabric is Chapter 51 only if wool predominates by weight.",
        "link": "",
    },
    {
        "id": "wool-yarn-hs-code",
        "question": "What is the HS code for wool yarn and merino wool yarn?",
        "searchedAs": ["wool yarn hs code", "woolen yarn hs code", "merino wool yarn hs code", "100 merino wool yarn hs code", "wool knitting yarn hs code", "wool thread hs code", "wool yarn tariff code"],
        "answer": "Wool yarn for mills is 5106 (carded, woollen-spun) or 5107 (combed, worsted), both 6%; 5107.10.30 and "
        "5107.20.30 are for yarn of 18.5 microns or finer. Hand-knitting yarn put up for retail sale is 5109 (6%).",
        "link": "",
    },
    {
        "id": "cashmere-hs-code",
        "question": "What is the HS code for cashmere, and are cashmere sweaters and scarves in Chapter 51?",
        "searchedAs": ["cashmere hs code", "cashmere yarn hs code", "cashmere tariff", "cashmere sweater hs code", "cashmere scarf hs code", "cashmere sweater tariff code"],
        "answer": "Raw cashmere is 5102.11 (5.1¢/clean kg degreased, 4.9¢/kg + 4% if processed further), carded or combed "
        "cashmere 5105.31, cashmere yarn 5108 (4%) and woven cashmere fabric 5111–5112. Sweaters are heading 6110 and scarves "
        "6117 or 6214 — not Chapter 51. Chinese cashmere yarn pays 41.5% in all; Mongolian pays 4%.",
        "link": "industry-areas",
    },
    {
        "id": "alpaca-hs-code",
        "question": "What is the HS code for alpaca fibre and alpaca yarn?",
        "searchedAs": ["alpaca hs code", "alpaca yarn hs code", "alpaca wool hs code", "peru alpaca yarn tariffs"],
        "answer": "Alpaca fibre not processed beyond the degreased condition is 5102.19.60 (0.4%; 5102.19.90 if processed further), alpaca tops 5105.39, and alpaca yarn 5108 (4%) or 5109 if put up for "
        "retail sale. From Peru, a Peru TPA claim removes the base rate but the 12.5% Section 301 duty (9903.05.63) applies. "
        "Alpaca sweaters are heading 6110.",
        "link": "industry-areas",
    },
    {
        "id": "mohair-hs-code",
        "question": "What is the HS code for mohair?",
        "searchedAs": ["mohair hs code", "mohair yarn hs code", "mohair fabric hs code"],
        "answer": "Mohair (hair of the Angora goat) is 5102.19.60.30 (0.4%; Free under AGOA for beneficiary countries), mohair "
        "yarn 5108.10.40 or 5108.20.40 (4%), and woven mohair fabric 5111 or 5112. Angora rabbit hair is a different line "
        "(yarn 5108.x0.30).",
        "link": "",
    },
    {
        "id": "horsehair-hs-code",
        "question": "What is the HS code for horsehair?",
        "searchedAs": ["horsehair hs code", "horse hair sample hs code"],
        "answer": "Raw horsehair is heading 0511 (chapter 5), not Chapter 51. Horsehair yarn, including gimped horsehair yarn, "
        "is 5110.00.00 (Free), and woven horsehair fabric 5113.00.00 (2.7%).",
        "link": "",
    },
    {
        "id": "wool-tariff-2026",
        "question": "What is the tariff on wool in 2026?",
        "searchedAs": ["tariff on wool", "wool tariffs", "hts chapter 51", "section 301 wool tariffs"],
        "answer": "The base rate (Free to 25%) plus the extra duty by country. Since July 24, 2026 the Section 301 tariff on 60 "
        "economies adds 10% or 12.5% (EU goods 10% in total where the base rate is lower), China pays 37.5% and Brazil 37.5%, "
        "and Canadian greasy fine wool and wool waste 50%. The IEEPA tariffs ended February 24 and the Section 122 surcharge "
        "July 23, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "wool-australia",
        "question": "Is raw wool from Australia and New Zealand duty-free?",
        "searchedAs": ["australia wool tariff updates", "australia preferential trade tariff wool", "wool importers in usa"],
        "answer": "Not since July 24, 2026. Coarse wool not finer than 46s is Free at the base rate, and the Australia FTA makes "
        "finer Australian wool Free too, but both countries now pay the 12.5% Section 301 duty (9903.05.23, 9903.05.57). New "
        "Zealand has no FTA, so its fine wool also pays 18.7¢–24.4¢ per clean kg.",
        "link": "industry-areas",
    },
    {
        "id": "wool-uk",
        "question": "What is the tariff on wool from the UK?",
        "searchedAs": ["tariffs on wool from uk", "british wool fabric tariff"],
        "answer": "British goods pay the base rate plus 10% (9903.05.81); the UK exception list names no Chapter 51 code. "
        "Worsted or tweed fabric at 25% pays 35% in all, wool yarn 16%.",
        "link": "industry-areas",
    },
    {
        "id": "wool-italy",
        "question": "What is the import duty on Italian wool fabric?",
        "searchedAs": ["italy wool fabric tariff rates", "imported wool fabric", "italy import duty on worsted wool", "italian wool fabric"],
        "answer": "Italian worsted and woollen fabric pays its 25% base rate and nothing more: EU goods pay 10% in total only "
        "where the base rate is lower (9903.05.39, note 52(k)). Italian wool yarn (6%) and tops pay 10% in total. The EU "
        "exception list names no Chapter 51 code.",
        "link": "industry-areas",
    },
    {
        "id": "clean-yield",
        "question": "What does \"per clean kg\" mean for wool duty?",
        "searchedAs": ["clean wool yield", "clean kg wool duty", "wool for special uses"],
        "answer": "Kilograms of clean yield: the wool content free of grease, dirt and vegetable matter at 12% moisture, less "
        "an allowance for processing loss (Chapter 51 additional U.S. note 2). The entry states an estimate; CBP samples, "
        "lab-tests and grades the wool and liquidates on the final clean yield (19 CFR 151.61–151.76).",
        "link": "tariff-engineering",
    },
    {
        "id": "wool-labeling",
        "question": "What does the Wool Products Labeling Act require for imported wool?",
        "searchedAs": ["wool products labeling act", "wool products labeling act of 1939"],
        "answer": "Wool yarns, fabrics and products sold in the U.S. must be labeled with fibre content by percentage and the "
        "country where processed or made (16 CFR 300.3, 300.25). \"Cashmere\" may be used only for fibre averaging 19 microns "
        "or less with no more than 3% over 30 microns, and \"Super 100s\"-type terms only at set fibre diameters.",
        "link": "tariff-engineering",
    },
    {
        "id": "wool-samples",
        "question": "Do wool fabric samples and swatches pay duty?",
        "searchedAs": ["wool fabric sample hs code", "wool fabric swatch hs code"],
        "answer": "Swatches worth $1 or less each, or marked, torn or perforated so they cannot be sold, used only to solicit "
        "orders, can enter Free under 9811.00.60, which also takes them outside the Section 301 and China duties. Usable "
        "sample lengths are classified in 5111 or 5112 like any other fabric.",
        "link": "tariff-engineering",
    },
]


# Generator quirk: labels cut with "…" are copied into understandIndustry (mainHeadingLabel, searchText).
def untruncate(o):
    if isinstance(o, dict):
        return {k: untruncate(v) for k, v in o.items()}
    if isinstance(o, list):
        return [untruncate(v) for v in o]
    if isinstance(o, str):
        for t, full in TRUNC.items():
            o = o.replace(t, full).replace(t.lower(), full.lower())
    return o


d = untruncate(d)
