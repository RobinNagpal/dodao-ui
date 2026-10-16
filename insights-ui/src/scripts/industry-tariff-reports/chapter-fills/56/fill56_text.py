"""Chapter 56 prose. TEXT(d) returns every writer field, built from the generated file `d` (trade figures are read
from it, so the prose follows the data on a re-run)."""
from fill56_static import CA338, CA338_PLAIN, CN_EXCL, ENDED, CHECKED
from fill56_eng import CHANGES, engineering, line_levers
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
POOL = json.load(open(os.path.join(HERE, "pool.json")))

NAMES = {"Rep. of Korea": "South Korea", "Viet Nam": "Vietnam", "Türkiye": "Türkiye (Turkey)", "Other Asia, nes": "Taiwan"}


def M(x):
    """$ in millions/billions, one decimal."""
    if x >= 1e9:
        return f"${x / 1e9:.2f}B"
    return f"${x / 1e6:.1f}M"


def TEXT(d):
    ui = d["understandIndustry"]
    lat, pri = ui["latestYear"], ui["priorYear"]
    by_year = {r["year"]: r["totalUsd"] for r in ui["byYear"]}
    total, prior = by_year[lat], by_year[pri]
    chg = 100 * (total - prior) / prior
    bc = {c["country"]: c for c in ui["byCountry"]}
    cn, de, inn, ca, jp, mx = (bc[k]["importsUsd"] for k in ("China", "Germany", "India", "Canada", "Japan", "Mexico"))
    lines = {l["hs6"]: l for l in ui["byLine"]}
    head = {}
    for l in ui["byLine"]:
        head[l["heading"]] = head.get(l["heading"], 0) + l["importsUsd"]
    nonwov = head["5603"]
    cn_2020 = next(r for r in ui["byYear"] if r["year"] == 2020)["partnerAUsd"]
    t2020 = by_year[2020]
    ia = d["industryAreas"]
    lanes = {(c["country"], h): cell["importsUsd"] for c in ia["countries"] for h, cell in c["cells"].items()}

    out = {}

    # ------------------------------------------------------------ overview
    out["overview"] = {
        "h1": "HTS Chapter 56: Nonwovens, Wadding, Felt, Twine, Rope & Netting — Tariff Rates (2026)",
        "seo": {
            "title": "HTS Chapter 56 Tariff 2026: Nonwoven Fabric, Felt, Rope, Twine & Fishing Net Import Duty Rates | KoalaGains",
            "shortDescription": (
                "Searchable duty table for all 81 HTS Chapter 56 lines — wadding, felt, nonwovens (5603), elastic and metallic "
                "yarn, twine, rope (5607) and nets (5608). General, FTA and Column 2 rates plus the 2026 extra duty for China, "
                "Canada, India and the EU."
            ),
            "keywords": [
                "hts chapter 56",
                "hts chapter 56 tariff rates 2026",
                "hts chapter 56 import duty",
                "nonwoven fabric hs code",
                "hts 5603 nonwovens section 301 duties",
                "china import duty on hts 5607 twine",
                "rope hs code",
                "twine hs code",
                "felt hs code",
                "fishing net hs code",
                "wadding hs code",
            ],
        },
        "intro": (
            "Chapter 56 covers textile products made without weaving: **wadding** and flock (5601), **felt** (5602) and "
            "**nonwovens** (5603), special yarns — **rubber thread, metalized, gimped and chenille yarn** (5604–5606) — "
            "**twine, cordage and rope** (5607), knotted **netting and fishing nets** (5608) and articles of rope or cord "
            "(5609). Its **81 tariff lines** carry base rates from Free (all 27 nonwoven lines) to 14.1% on cotton hammocks, "
            "with compound rates on wool felt and some rope.\n\n"
            "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 "
            "tariff of 10% or 12.5%** (EU and Taiwanese goods 10%, Japanese and Korean 12.5% in total), and no country "
            "exception list except Jordan's — and Guatemala's and El Salvador's for CAFTA-DR goods — covers Chapter 56. "
            f"**China pays 37.5%** extra on almost every line, Brazil up to 37.5%, and **Canada 50%** under Section 338 on most "
            f"nonwovens and braided synthetic cordage, USMCA claim or not. U.S. imports were **{M(total)}** in {lat}; nonwovens "
            f"were {100 * nonwov / total:.0f}% of it and China the largest supplier ({100 * cn / total:.0f}%), ahead of "
            "Germany, India, Canada and Japan."
        ),
        "workedExamples": [
            {
                "title": "Spunbond polypropylene nonwoven from China",
                "line": "5603.12.00.95",
                "body": "Filament nonwovens of 25–70 g/m² are Free at the general rate, but China pays 25% under List 3 "
                "(9903.88.03) and 12.5% under the 2026 action (9903.05.31). A $20,000 shipment pays **$7,500**. The same "
                "fabric from Mexico with a USMCA claim pays **$0**.",
            },
            {
                "title": "Spunbond nonwoven from Canada, with a USMCA claim",
                "line": "5603.12.00.95",
                "body": "USMCA removes Canada's 10% Section 301 duty (9903.05.93), but 5603.12.00 is on the Canada Section 338 "
                "list (U.S. note 51(b)(3), 9903.03.14), and that 50% applies even when USMCA is claimed: **$10,000** on a "
                "$20,000 shipment entered since August 22, 2026. Filament nonwovens of 25 g/m² or less (5603.11) are not on "
                "the list and pay $0 with USMCA.",
            },
            {
                "title": "Staple-fibre nonwoven from China under the product exclusion",
                "line": "5603.92.00.95",
                "body": "This statistical line is on the China exclusion list (U.S. note 20(vvv)(iii)(9), 9903.88.69) through "
                "November 9, 2026, so the 25% List 3 duty does not apply; the 12.5% (9903.05.31) does. A $10,000 shipment pays "
                "**$1,250** instead of $3,750.",
            },
            {
                "title": "Laminated needleloom felt from Germany",
                "line": "5602.10.10.00",
                "body": "The base rate is 12%. EU goods pay the Section 301 rate as \"10% in total in place of the base rate\" "
                "(U.S. note 52(k), 9903.05.39), which only lifts rates below 10%, so this felt pays its 12% and nothing more: "
                "**$1,200** on a $10,000 shipment. German felt of other fibres at 6.3% (5602.29.00) pays 10% in total.",
            },
            {
                "title": "Sisal baler twine from Brazil",
                "line": "5607.21.00.00",
                "body": "Binder or baler twine of sisal is Free, and it is the one Chapter 56 subheading on Brazil's exemption "
                "list (U.S. note 50(a)(ii), 9903.05.03), so it pays no 25% Brazil duty. It still pays the 12.5% 2026 "
                "action (9903.05.27): **$1,250** on a $10,000 shipment. Brazilian polypropylene twine (5607.41.30, 4%) pays "
                "4% + 25% + 12.5% = 41.5%.",
            },
            {
                "title": "Thin polypropylene rope from Vietnam",
                "line": "5607.49.15.00",
                "body": "Unbraided polyethylene or polypropylene rope under 4.8 mm is 7% at the general rate; Vietnam adds 12.5% "
                "(9903.05.84): **$1,950** on a $10,000 shipment. From India (+10%, 9903.05.44) it is $1,700.",
            },
        ],
    }
    top5 = [{"name": NAMES.get(c["country"], c["country"]).replace(" (Turkey)", ""), "importsUsd": c["importsUsd"]} for c in ui["byCountry"][:5]]
    out["tradeSnapshot"] = {
        "topCountries": top5,
        "biggestLines": [
            {"hts": "5603.12", "label": "Nonwovens of man-made filaments, 25–70 g/m² (spunbond, meltblown)"},
            {"hts": "5603.14", "label": "Nonwovens of man-made filaments, over 150 g/m²"},
            {"hts": "5603.92", "label": "Nonwovens of staple fibres, 25–70 g/m²"},
        ],
        "source": f"UN Comtrade, United States imports, HS chapter 56 ({lat})",
        "coverageNote": (
            "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the "
            "6-digit level, so this page does not say which 10-digit line (for example, coated or not) each country ships."
        ),
    }

    # ------------------------------------------------------------ tariffUpdates
    out["tariffUpdates"] = {
        "h1": "HTS Chapter 56 Tariff Updates 2026: Nonwovens, Felt, Twine & Rope",
        "seo": {
            "title": "HTS Chapter 56 Tariff Updates 2026: Section 301 on Nonwovens, Canada 338, China Lists, IEEPA End | KoalaGains",
            "shortDescription": (
                "What changed for HTS Chapter 56 imports since January 2025: unchanged base rates, the end of the IEEPA tariffs "
                "and the Section 122 surcharge, the 2026 Section 301 tariffs, China List 3 and its nonwoven exclusions, Canada's "
                "50% Section 338 duty on nonwovens and AD/CVD on twist ties."
            ),
            "keywords": [
                "hts chapter 56 tariff updates 2026",
                "china section 301 tariffs on nonwovens",
                "nonwoven textiles tariff updates",
                "section 301 list 3 tariffs",
                "mexico usmca cordage import duty",
                "canada section 338 nonwovens",
                "us cordage import duties",
            ],
        },
        "intro": (
            "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, "
            "and the current **2026 Revision 21** (in force October 9, 2026). All 81 Chapter 56 lines carry the same base "
            "rates in both.\n\n"
            "What changed came on top of the base rate. The 2025 IEEPA duties — up to 50% on Indian goods — **ended on "
            "February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July "
            "24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**, with no exception list for "
            "Chapter 56 except Jordan's and the CAFTA-DR lists. China keeps its 25% List 3 duty, Brazil pays another 25% "
            "(sisal baler twine excepted), and since **August 22, 2026 Canada pays 50%** under Section 338 on most "
            "nonwovens and braided synthetic cordage. China's exclusions for three staple-fibre nonwoven lines expire after "
            "November 9, 2026."
        ),
        "scope": (
            "Measures that reach Chapter 56 from any country: the 2026 Section 301 tariffs on 60 economies and their exception "
            "lists, the Brazil Section 301 tariff, China Section 301 List 3 and its nonwoven exclusions, the Canada Section 338 "
            "duty, the Nicaragua Section 301 phase-in, the 2025–2026 IEEPA and Section 122 duties that have ended, and the "
            "antidumping and countervailing duty orders on twist ties and plastic decorative ribbon from China that name "
            "heading 5609 numbers. No Section 232 heading lists a Chapter 56 provision. For the rate each supplier pays, see "
            "Rates by country."
        ),
    }
    ex = {
        "cn-section-301": (
            "List 3 (+25%, 9903.88.03, 25% since May 10, 2019) covers every Chapter 56 subheading, and the 2026 action adds "
            "+12.5% (9903.05.31); China is on no 2026 exception list. Product exclusions (U.S. note 20(vvv)(iii)(9)–(10), "
            f"9903.88.69) remove the 25% from three staple-fibre nonwoven lines ({CN_EXCL}) through November 9, 2026; they do "
            "not lift the 12.5%. USTR confirmed on October 7, 2026 that the 2018 actions continue. AD/CVD orders on twist ties "
            "and plastic decorative ribbon from China can apply to goods entered under 5609. The IEEPA duties on China ended "
            "February 24, 2026.",
            "Chinese nonwovens, wadding, rope, twine and nets pay 37.5% on top of the base rate — up to 51.6% on cotton "
            "hammocks; the three excluded nonwoven lines pay 12.5% until November 9, 2026.",
            ["fr-2025-21671", "fr-2021-07630", "fr-2019-05520", "eo-14389"],
        ),
        "eu-section-301": (
            "EU goods pay 10% in total in place of the base rate (U.S. note 52(k), 9903.05.39). The EU exception list (U.S. "
            "note 52(j)(2), 9903.05.97) names no Chapter 56 subheading. Lines whose base rate is above 10% — needleloom felt "
            "(10.6%, 12%), metalized yarn (13.2%), cotton hammocks and netting (14.1%) and usually the compound felt rates — "
            "pay only the base rate. " + ENDED,
            f"German, Dutch, Luxembourg and French nonwovens — Germany alone shipped {M(lanes[('Germany', '5603')])} in "
            f"{lat} — pay 10% in total; needleloom felt pays its own 10.6% or 12%.",
            ["eo-14389"],
        ),
        "in-section-301": (
            "India has no exception list. GSP (SPI A), printed on six rope and netting subheadings, has been expired since "
            "December 31, 2020. The 2025 IEEPA duties (25% reciprocal plus 25% over Russian oil purchases) ended in February "
            "2026.",
            "Indian nonwovens, rope and chenille yarn pay the base rate plus 10%: 10% on nonwovens, 17% on thin "
            "polypropylene rope.",
            ["cbp-gsp", "eo-14384", "eo-14389"],
        ),
        "ca-section-301": (
            "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
            f"9903.03.14) on {CA338_PLAIN} applies with or without a USMCA claim. Proclamation 11065 (September 15, 2026) "
            "neither added nor removed a Chapter 56 provision, and no Chapter 56 line is on the September 29, 2026 import-ban "
            "annexes. The IEEPA duty on Canada ended February 24, 2026.",
            "Canadian nonwovens on the Section 338 list pay 50% even with USMCA (60% without); Canadian felt, wadding, most "
            "rope and light filament nonwovens pay nothing extra with USMCA and the base rate plus 10% without.",
            ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
        ),
        "jp-section-301": (
            "Japan's rate is 12.5% in total in place of the base rate (U.S. note 52(k), 9903.05.49); Japan has no exception "
            "list. Only the compound wool-felt rates can exceed it, depending on weight. " + ENDED,
            f"Japanese nonwovens — {M(lanes[('Japan', '5603')])} in {lat}, nearly all of Japan's Chapter 56 trade — pay 12.5% "
            "in total.",
            ["eo-14389"],
        ),
        "mx-section-301": (
            "USMCA-qualifying goods pay no Section 301 duty (9903.05.94). Under the Chapter 56 rules of General Note 11, the "
            "goods may not be made from non-originating man-made filaments or fibres (chapters 54–55) or non-originating "
            "wool, cotton or vegetable-fibre yarn and fabric. The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended "
            "February 24, 2026.",
            "Mexican nonwovens, wadding, rope and felt pay $0 with a valid USMCA claim and the base rate plus 10% without one.",
            ["eo-14389"],
        ),
        "tr-section-301": (
            "Türkiye has no exception list for Chapter 56; its rate is the base rate plus 12.5% (9903.05.79). " + ENDED,
            f"Turkish nonwovens ({M(lanes[('Türkiye (Turkey)', '5603')])} in {lat}) pay 12.5%, and wadding 12.5%–18.8%.",
            ["eo-14389"],
        ),
        "kr-section-301": (
            "South Korea's rate is 12.5% in total in place of the base rate (U.S. note 52(k), 9903.05.71), KORUS claim or "
            "not; every Chapter 56 KORUS rate is Free. Korea has no exception list. " + ENDED,
            "Korean nonwovens and every other Chapter 56 good pay 12.5% in total.",
            ["eo-14389"],
        ),
        "vn-section-301": (
            "Vietnam has no exception list for Chapter 56; its rate is the base rate plus 12.5% (9903.05.84). " + ENDED,
            "Vietnamese rope and twine — Vietnam's largest Chapter 56 product — pay 12.5% to 19.5%, and 19.9¢/kg + 23.3% "
            "on unbraided synthetic rope.",
            ["eo-14389"],
        ),
        "th-section-301": (
            "Thailand has no exception list for Chapter 56; its rate is the base rate plus 12.5% (9903.05.77). GSP has been "
            "expired since December 31, 2020. " + ENDED,
            "Thai nonwovens pay 12.5%, wadding 12.5%–18.8% and needleloom felt up to 24.5%.",
            ["cbp-gsp", "eo-14389"],
        ),
        "gb-section-301": (
            "The UK exception list (U.S. note 52(j)(1), 9903.05.96) names no Chapter 56 subheading, so British goods pay the "
            "base rate plus 10% (9903.05.81). " + ENDED,
            "British rope and nonwovens pay the base rate plus 10%.",
            ["eo-14389"],
        ),
        "tw-section-301": (
            "Taiwan's rate is 10% in total in place of the base rate (U.S. note 52(k), 9903.05.76); its exception list names no "
            "Chapter 56 subheading. " + ENDED,
            "Taiwanese nonwovens pay 10% in total; lines with a base rate above 10% pay only the base rate.",
            ["eo-14389"],
        ),
        "il-section-301": (
            "Israel pays the base rate plus 12.5% (9903.05.47). The U.S.–Israel FTA (SPI IL) removes the base rate but not the "
            "Section 301 duty (U.S. note 52(a)). " + ENDED,
            f"Israeli nonwovens ({M(lanes[('Israel', '5603')])} in {lat}, almost all of Israel's Chapter 56 trade) pay 12.5%.",
            ["eo-14389"],
        ),
        "br-section-301": (
            "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 56 line except sisal or agave binder and "
            "baler twine (5607.21.00), which is on Brazil's exemption list (U.S. note 50(a)(ii), 9903.05.03). The 2026 action "
            "adds 12.5% (9903.05.27) on every line. The 2025 IEEPA duties (10% reciprocal and 40%) ended February 24, 2026.",
            f"Brazilian sisal baler twine pays 12.5%; other Brazilian rope and goods pay 37.5% on top of the base rate. Twine and "
            f"rope were {M(lanes[('Brazil', '5607')])} of Brazil's {M(next(c['importsUsd'] for c in ia['countries'] if c['country'] == 'Brazil'))} in {lat}.",
            ["eo-14323", "eo-14389"],
        ),
        "other-section-301": (
            "Exception lists in U.S. note 52(j) cover every Chapter 56 subheading for Jordan (9903.06.20) and, for goods entered "
            "under CAFTA-DR, Guatemala and El Salvador (9903.06.06, 9903.06.09). CAFTA-DR textile goods of Costa Rica, the "
            "Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered duty-free under CAFTA-DR are exempt "
            "(note 52(i), 9903.05.95). No other country list names a Chapter 56 code. " + ENDED,
            "Most other suppliers pay the base rate plus 10% or 12.5%; Jordanian goods and CAFTA-DR textiles enter at the base "
            "rate (usually Free under the agreement).",
            ["eo-14389"],
        ),
    }
    out["exempt"] = ex
    out["changes"] = CHANGES

    # ------------------------------------------------------------ understandIndustry
    kr = bc["Rep. of Korea"]
    out["understandIndustry"] = {
        "h1": "HTS Chapter 56: Nonwovens, Wadding, Felt, Rope & Netting — U.S. Import Statistics",
        "seo": {
            "title": "Nonwoven, Rope & Felt Imports to the U.S. by Country: China, Germany, India — HTS Chapter 56 Statistics | KoalaGains",
            "shortDescription": (
                f"U.S. imports of HTS Chapter 56 goods 2020–{lat} by country, product and year: {M(total)} in {lat}. China "
                f"supplied {100 * cn / total:.0f}%, Germany {100 * de / total:.0f}%, India {100 * inn / total:.1f}%; nonwovens "
                f"(5603) were {100 * nonwov / total:.0f}% and twine and rope {100 * head['5607'] / total:.0f}%."
            ),
            "keywords": [
                "nonwoven fabric imports by country",
                "hts 5603 nonwovens import rates",
                "mexico nonwovens supply chain tariffs",
                "us rope imports",
                "nonwoven fabric china",
                "hts chapter 56 imports",
            ],
        },
        "why": (
            f"U.S. imports of Chapter 56 goods were **{M(total)} in {lat}**, {chg:+.1f}% against {M(prior)} in {pri} and below "
            f"the 2021 peak of {M(by_year[2021])}. **China** stayed the largest supplier at **{M(cn)}** "
            f"({bc['China']['changePct']:+.1f}%), but its share has fallen from {100 * cn_2020 / t2020:.0f}% in 2020 to "
            f"{100 * cn / total:.0f}%. **Germany {M(de)}** ({bc['Germany']['changePct']:+.0f}%), **India {M(inn)}**, "
            f"**Canada {M(ca)}**, **Japan {M(jp)}** and **Mexico {M(mx)}** follow; **South Korea** grew fastest of the top ten "
            f"({kr['changePct']:+.0f}%).\n\n"
            f"**Nonwovens are the trade**: heading 5603 was {M(nonwov)}, {100 * nonwov / total:.0f}% of the total, led by "
            f"spunbond and meltblown filament nonwovens of 25–70 g/m² (5603.12, {M(lines['5603.12']['importsUsd'])}). "
            f"Twine and rope (5607) were {M(head['5607'])}, wadding (5601) {M(head['5601'])}, rope articles (5609) "
            f"{M(head['5609'])} — nearly half from China — and felt (5602) {M(head['5602'])}, where Canada is the largest "
            "supplier. Vietnam ships mainly rope and nonwovens, Brazil almost only twine and rope.\n\n"
            "Through 2025 most suppliers paid the IEEPA tariffs — 50% on Indian goods from August 27 — on top of the base "
            "rate, and China its 25% List 3 duty as well. The IEEPA duties ended on February 24, 2026; since July 24, 2026 a "
            "Section 301 tariff of 10% or 12.5% applies instead, and since August 22 Canadian nonwovens on the Section 338 list "
            f"pay 50%. {lat} is the latest full year of U.S. trade data."
        ),
        "coverageNote": (
            "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the "
            "6-digit level. Country names follow Comtrade (\"Rep. of Korea\" is South Korea, \"Viet Nam\" is Vietnam, "
            "\"Other Asia, nes\" is Taiwan)."
        ),
    }

    # ------------------------------------------------------------ industryAreas
    out["industryAreas"] = {
        "h1": "HTS Chapter 56 Tariff Rates by Country: China, Germany, India, Canada, Mexico & More",
        "seo": {
            "title": "Nonwoven, Rope & Felt Import Duty by Country 2026: China, Germany, India, Canada — HTS Chapter 56 | KoalaGains",
            "shortDescription": (
                "The total U.S. tariff on nonwovens, wadding, felt, twine, rope and nets by country: base rate plus the 2026 "
                "Section 301 duty, China's List 3, Brazil's 25% and Canada's 50% Section 338 duty, with USMCA applied."
            ),
            "keywords": [
                "hts chapter 56 tariff rates by country",
                "china tariff on nonwovens",
                "usmca tariff exemption for chapter 56",
                "canada nonwovens section 338",
                "india rope import duty",
                "germany nonwoven tariff",
                "vietnam rope tariff",
            ],
        },
        "intro": (
            "The total rate on a Chapter 56 good depends far more on **where it comes from** than on what it is. Each cell below "
            "is the base rate for that product group plus the extra duty for that country, minus any preference — computed "
            "from the current tariff schedule with the same engine as the tariff calculator.\n\n"
            "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 "
            "economies** (from July 24, 2026). **EU and Taiwanese goods pay 10% in total** and **Japan and South Korea 12.5% "
            "in total**, in place of a lower base rate; **India and the UK add 10%**, **Türkiye, Vietnam, Thailand and Israel "
            "12.5%**. **China and Brazil pay 37.5% more** on almost every line, and **Canada pays 50%** on most nonwovens and "
            "braided synthetic cordage even with USMCA. Mexican goods that qualify for USMCA pay nothing."
        ),
        "assumptions": [
            "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
            "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
            "EU, Taiwanese, Japanese and Korean rates of \"10% / 12.5% in total\" replace the base rate only when it is lower "
            "(U.S. note 52(k)); needleloom felt, metalized yarn and cotton hammocks keep their higher base rate.",
            f"China's nonwoven exclusions ({CN_EXCL}) cover whole statistical lines, so the China cells apply them (12.5% instead "
            "of 37.5%); they expire after November 9, 2026.",
            "Canada: the 50% Section 338 duty (U.S. note 51) applies whether or not USMCA is claimed; no Chapter 56 line is on "
            "the September 29, 2026 import-ban annexes.",
            "CAFTA-DR textile goods (note 52(i), 9903.05.95: every Chapter 56 line is a textile good under general note "
            "29(d)(v)) of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered with the "
            "CAFTA-DR claim (SPI P or P+), and Jordanian goods (9903.06.20), are exempt from the Section 301 duty; the calculator "
            "applies both. Those countries are not shown as rows: together they shipped under $8M of Chapter 56 goods in 2025 "
            "(the Dominican Republic $3.8M, the largest) and fall in \"Any other country\". Myanmar's imports have no ISO code "
            "in the trade data and are counted there too.",
            "Not in the grid: antidumping and countervailing duties on Chinese twist ties and plastic decorative ribbon entered "
            "under 5609, the UFLPA presumption against goods made in Xinjiang, and textile entry rules — see Import documents.",
        ],
        "exemptionCheck": (
            "Read U.S. notes 2, 16, 19, 20, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. "
            "Note 52(b) (9903.05.86) names no Chapter 56 code. Note 52(j) country lists name every Chapter 56 subheading for "
            "Jordan (9903.06.20) and, for CAFTA-DR claims, Guatemala and El Salvador (9903.06.06, 9903.06.09); the UK, EU, "
            "Swiss, Taiwanese and other lists name none. Note 52(i) (9903.05.95) exempts CAFTA-DR textile goods, which include every Chapter 56 line, entered under the CAFTA-DR claim. Note 50(a)(ii) exempts 5607.21.00 from the Brazil duty. Note 51(b)(3) "
            f"puts {CA338} on the Canada Section 338 list. Note 20 puts every Chapter 56 subheading on China List 3; note "
            f"20(vvv)(iii)(9)–(10) excludes {CN_EXCL} through November 9, 2026. Notes 30 (Russia) and 31 (2024 China "
            "increases) name no Chapter 56 code. No Section 232 note (16, 19 metals; 33(g) and 38 auto and truck parts) lists a "
            "Chapter 56 provision; only the opt-in certified-parts election can reach one, and it is not applied. Federal "
            "Register searches of Commerce notices for every Chapter 56 statistical number found AD/CVD orders only on twist "
            "ties and plastic decorative ribbon from China (heading 5609)."
        ),
    }
    R = {}
    R["China"] = (
        "Base rate plus 25% List 3 (9903.88.03) and 12.5% (9903.05.31) on every line: 37.5% on the Free nonwovens, up to "
        f"51.6% on cotton hammocks. The excluded nonwoven lines ({CN_EXCL}) pay 12.5% through November 9, 2026 (9903.88.69).",
        ["fr-2025-21671", "eo-14389"],
    )
    eu = ("EU: 10% in total in place of the base rate (9903.05.39); the EU exception list names no Chapter 56 code. "
          "Needleloom felt (10.6%, 12%), metalized yarn (13.2%) and cotton hammocks (14.1%) pay their base rate. The 15% IEEPA "
          "rate ended February 24, 2026.")
    R["Germany"] = (eu, ["eo-14389"])
    R["Netherlands"] = (eu, ["eo-14389"])
    R["India"] = ("Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. GSP has expired; the IEEPA "
                  "duties (up to 50%) ended in February 2026.", ["cbp-gsp", "eo-14384", "eo-14389"])
    R["Canada"] = ("USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on " + CA338 +
                   " even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on those six.",
                   ["eo-14389"])
    R["Japan"] = ("12.5% in total in place of the base rate on every line (9903.05.49); no exception list. Only wool felt "
                  "(52.9¢/kg + 8%) can stay higher.", ["eo-14389"])
    R["Mexico"] = ("USMCA-qualifying: base rate only (9903.05.94), and the base rate is Free under USMCA. Otherwise the base "
                   "rate plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.", ["eo-14389"])
    R["Türkiye (Turkey)"] = ("Base rate plus 12.5% Section 301 (9903.05.79) on every line; no exception list.", ["eo-14389"])
    R["South Korea"] = ("12.5% in total in place of the base rate on every line (9903.05.71), KORUS claim or not; no "
                        "exception list.", ["eo-14389"])
    R["Vietnam"] = ("Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list.", ["eo-14389"])
    R["Thailand"] = ("Base rate plus 12.5% Section 301 (9903.05.77) on every line; no exception list. GSP has expired.",
                     ["cbp-gsp", "eo-14389"])
    R["United Kingdom"] = ("Base rate plus 10% Section 301 (9903.05.81) on every line; the UK exception list names no "
                           "Chapter 56 code.", ["eo-14389"])
    R["Taiwan"] = ("10% in total in place of the base rate (9903.05.76); lines with a higher base rate pay only that. Taiwan's "
                   "exception list names no Chapter 56 code.", ["eo-14389"])
    R["Israel"] = ("Base rate plus 12.5% Section 301 (9903.05.47); the U.S.–Israel FTA (IL) removes the base rate, not the "
                   "12.5%.", ["eo-14389"])
    R["Brazil"] = ("Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) on every line except sisal baler twine "
                   "(5607.21.00), which is exempt from the 25% (note 50(a)(ii)) and pays 12.5%.", ["eo-14389"])
    R["Any other country"] = (
        "From the base rate alone (countries outside the 60 Section 301 economies, such as Nepal "
        "and Myanmar) to base rate plus 12.5% (9903.05.20–9903.05.84). Jordan and CAFTA-DR textile goods are exempt from the "
        "Section 301 duty.", [])
    out["rules"] = R

    # ------------------------------------------------------------ tariffEngineering
    page, line_rules, group_rules, notes = engineering(POOL)
    rows = {r["hts"]: r for r in d["overview"]["rateTable"]["rows"] if r["htsCode10"]}
    dutiable = {h for h, r in rows.items() if r["dutiable"]}
    out["tariffEngineering"] = {
        "page": page,
        "groupRules": group_rules,
        "groupNotes": notes,
        "lineRules": line_rules,
        "lineLevers": lambda h: line_levers(h, dutiable, None),
    }

    # ------------------------------------------------------------ finalConclusion
    out["finalConclusion"] = faq(d, M(total), lat, 100 * cn / total, 100 * nonwov / total)
    return out


def faq(d, total_s, lat, cn_share, nonwov_share):
    return {
        "h1": "HTS Chapter 56 FAQ: Nonwoven, Rope, Twine & Felt HS Codes and Import Tariffs",
        "seo": {
            "title": "Nonwoven, Rope & Twine HS Code FAQ 2026: Felt, Wadding, Fishing Net Tariffs (HTS Chapter 56) | KoalaGains",
            "shortDescription": (
                "Answers to what people search about HTS Chapter 56: the HS code for nonwoven fabric, rope, twine, felt, "
                "wadding, fishing nets, elastic cord and chenille yarn, and the 2026 tariffs on nonwovens from China and Canada."
            ),
            "keywords": [
                "hts chapter 56",
                "nonwoven fabric hs code",
                "spunbond nonwoven hs code",
                "rope hs code",
                "polypropylene rope hs code",
                "twine hs code",
                "felt hs code",
                "fishing net hs code",
                "hs code 5603",
                "hs code 5607",
                "usmca textile rules of origin",
            ],
        },
        "intro": (
            "Straight answers to the most common questions about importing Chapter 56 goods into the U.S. — HS codes, tariffs "
            "by country and entry rules. Each answer links to the page with the full detail."
        ),
        "keyTakeaways": [
            "Chapter 56 base rates are unchanged since January 2025: Free on 34 of 81 lines, including all 27 nonwoven lines, "
            "and up to 14.1% (cotton hammocks), with compound rates on wool felt and some rope.",
            "Since July 24, 2026 nearly every supplier pays a 10% or 12.5% Section 301 tariff; no EU, UK, Japanese or Korean "
            "exception list covers Chapter 56. EU and Taiwanese goods pay 10% and Japanese and Korean 12.5% in total.",
            "China pays 37.5% extra on almost every line (12.5% on three staple-fibre nonwoven lines excluded through November "
            "9, 2026); Brazil 37.5% except sisal baler twine (12.5%); Canada 50% under Section 338 on most nonwovens and braided "
            "synthetic cordage, even with USMCA.",
            "The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
            "These are textiles: origin follows 19 CFR 102.21 (a nonwoven is from where its web was formed, rope from where "
            "its fibres were spun or extruded), every entry needs a manufacturer ID, and the UFLPA presumption bars goods made "
            "in Xinjiang.",
        ],
        "questionSource": "Google search suggestions, collected October 13, 2026",
        "faqs": [
            {
                "id": "nonwoven-hs-code",
                "question": "What is the HS code for nonwoven fabric?",
                "searchedAs": ["nonwoven hs code", "nonwoven fabric hs code", "pp nonwoven fabric hs code", "spunbond nonwoven hs code",
                               "polyester nonwoven fabric hs code", "spunlace nonwoven fabric hs code", "hs code 5603"],
                "answer": "Heading 5603. Nonwovens of man-made filaments — spunbond and meltblown polypropylene or polyester — "
                "are 5603.11 to 5603.14, split by weight: 25 g/m² or less, 25–70, 70–150 and over 150 g/m². Nonwovens of "
                "staple fibres, including most spunlace and needlepunched fabric, are 5603.91 to 5603.94 on the same weight "
                "bands. All 27 lines are Free at the general rate; the extra duty depends on the country.",
                "link": "",
            },
            {
                "id": "hs-5603-subheadings",
                "question": "What do HS codes 5603.12, 5603.92 and 5603.94 cover?",
                "searchedAs": ["hs code 5603.12", "hs code 5603.92", "hs code 5603.94", "hs code 5603.14", "hs code 5603.13", "hs code 5603 details"],
                "answer": "5603.12 is nonwovens of man-made filaments weighing 25–70 g/m², the largest Chapter 56 import "
                "line. 5603.92 is nonwovens of other (staple) fibres of 25–70 g/m², and 5603.94 staple-fibre nonwovens over "
                "150 g/m², including floor-covering underlays. All are Free; China pays 37.5%, and 5603.12, 5603.92 and "
                "5603.94.90 from Canada pay the 50% Section 338 duty.",
                "link": "industry-areas",
            },
            {
                "id": "rope-hs-code",
                "question": "What is the HS code for rope (nylon, polypropylene, polyester)?",
                "searchedAs": ["rope hs code", "rope hts code", "hs code for rope", "nylon rope hs code", "pp rope hs code",
                               "polypropylene rope hs code", "polyester rope hs code", "tariff code for rope", "polypropylene rope tariff code"],
                "answer": "Textile rope is heading 5607, by fibre. Polyethylene or polypropylene rope is 5607.49: 2.7% if of "
                "wide strip, 7% unbraided under 4.8 mm, 9.8¢/kg + 5.3% thicker unbraided, 3.6% braided. Nylon and polyester "
                "rope is 5607.50: 3.6% braided, 19.9¢/kg + 10.8% unbraided. Wire rope is not here — it is heading 7312.",
                "link": "",
            },
            {
                "id": "twine-hs-code",
                "question": "What is the HS code for twine and baler twine?",
                "searchedAs": ["twine hs code", "hs code for baler twine", "sisal twine hs code", "jute twine hs code", "pp twine hs code",
                               "nylon twine hs code", "cotton twine hs code"],
                "answer": "Twine is heading 5607. Sisal or agave baler twine is 5607.21.00 (Free); polyethylene or "
                "polypropylene baler twine is 5607.41 (2.7% or 4%); jute twine is 5607.90.15 (Free). Yarn counts as twine "
                "only above a set thickness (Section XI note 3) — for man-made fibres more than 10,000 decitex — so thin "
                "cotton or nylon \"twine\" may be yarn of chapters 52–55.",
                "link": "",
            },
            {
                "id": "felt-hs-code",
                "question": "What is the HS code for felt?",
                "searchedAs": ["felt hs code", "felt hts code", "wool felt hs code", "felt fabric hs code", "polyester felt hs code",
                               "felt tariff code", "textile felt hs code"],
                "answer": "Heading 5602. Needleloom felt is 5602.10 (12% if laminated, 10.6% otherwise); wool felt that is not "
                "coated is 5602.21 (49.5¢/kg + 7.5%); polyester and other felt is 5602.29 (6.3%); coated or impregnated felt "
                "is 5602.90. Felt cut into pads, seals or other articles may be classified elsewhere.",
                "link": "",
            },
            {
                "id": "wadding-hs-code",
                "question": "What is the HS code for wadding or batting?",
                "searchedAs": ["wadding hs code", "batting hs code", "cotton wadding hs code", "cotton batting hs code", "cellulose wadding hs code"],
                "answer": "Textile wadding and batting are heading 5601: cotton 3.6%, man-made fibres 6.3%, other 4%. Cellulose "
                "(paper) wadding is chapter 48, and sanitary pads, tampons and diapers made of wadding are heading 9619.",
                "link": "",
            },
            {
                "id": "fishing-net-hs-code",
                "question": "What is the HS code for fishing nets and netting?",
                "searchedAs": ["fishing net hs code", "nylon fishing net hs code", "hdpe fishing net hs code", "netting hs code",
                               "nylon netting hs code", "cargo net hs code"],
                "answer": "Knotted netting of twine, cordage or rope and made-up nets are heading 5608. Made-up fishing nets of "
                "man-made fibres are 5608.11 (8%), fish netting 5608.19.10 (8.5%), other man-made netting and nets such as "
                "cargo nets 5608.19.20 (5%). Knitted netting is chapter 60, and landing nets for anglers are 9507.",
                "link": "",
            },
            {
                "id": "elastic-cord-hs-code",
                "question": "What is the HS code for elastic cord and elastic thread?",
                "searchedAs": ["elastic thread hs code", "elastic cord hs code", "elastic string hs code", "bungee cord hs code",
                               "shock cord hs code", "stretch cord hs code"],
                "answer": "Rubber thread and cord covered with textile is 5604.10.00, at 6.3%. Elastomeric (spandex) filament "
                "yarn without rubber is chapter 54, and woven elastic tape is heading 5806.",
                "link": "",
            },
            {
                "id": "metallic-chenille-yarn",
                "question": "What are the HS codes for metallic yarn and chenille yarn?",
                "searchedAs": ["metallic yarn hs code", "chenille yarn hs code", "100 polyester chenille yarn hs code"],
                "answer": "Metallic yarn is heading 5605: 7.5% for metal-coated or laminated man-made filament or strip, "
                "untwisted, and 13.2% for other metalized yarn. Chenille yarn, including polyester chenille, is 5606.00.00 "
                "with gimped yarn and loop wale-yarn, at 8%.",
                "link": "",
            },
            {
                "id": "nonwoven-china-tariff",
                "question": "What is the tariff on nonwoven fabric from China?",
                "searchedAs": ["nonwoven fabric china", "non woven fabric manufacturer in china"],
                "answer": "Nonwovens are Free at the general rate, but China pays 25% under Section 301 List 3 (9903.88.03) "
                "and 12.5% under the 2026 action (9903.05.31): 37.5% in total. Three staple-fibre lines (5603.92.00.70, "
                "5603.92.00.95, 5603.93.00.90) are excluded from the 25% through November 9, 2026 and pay 12.5%. The IEEPA "
                "duties ended February 24, 2026.",
                "link": "tariff-updates",
            },
            {
                "id": "usmca-textile-origin",
                "question": "Do nonwovens and rope from Canada and Mexico pay tariffs under USMCA?",
                "searchedAs": ["usmca textile rules of origin", "usmca textiles"],
                "answer": "Goods that qualify under USMCA pay no base rate and no Section 301 duty. To qualify, Chapter 56 goods "
                "may not use non-originating man-made fibres or yarn. But Canada's 50% Section 338 duty "
                "on 5603.12, 5603.13, 5603.14.90, 5603.92, 5603.94.90 and 5607.50.40 applies even with a USMCA claim.",
                "link": "tariff-engineering",
            },
            {
                "id": "hts-chapter-56-2026",
                "question": "What are the HTS Chapter 56 tariffs in 2026?",
                "searchedAs": ["hts chapter 56", "hs code 56"],
                "answer": "Base rates run from Free (all nonwovens, sisal baler twine, jute and coir rope) to 14.1% on cotton "
                "hammocks and are unchanged since 2025. On top, most countries pay a 10% or 12.5% Section 301 tariff since July "
                "24, 2026; China and Brazil pay 37.5%; Canada 50% on listed nonwovens and cordage; USMCA goods from Mexico "
                "pay nothing.",
                "link": "tariff-updates",
            },
            {
                "id": "twist-ties",
                "question": "Are twist ties from China subject to antidumping duties?",
                "searchedAs": ["twist tie hs code", "twist tie wire hs code", "paper twist tie hs code"],
                "answer": "Yes. Twist ties from China are under antidumping and countervailing duty orders (A-570-131, "
                "C-570-132) that name 5609.00.30.00 and 8309.90.00.00 as their main entry numbers. In 2026 Commerce found "
                "that revoking them would likely lead to dumping margins up to 72.96% and subsidies of 111.96%; the ITC is "
                "conducting full reviews.",
                "link": "tariff-engineering",
            },
            {
                "id": "hammock-hs-code",
                "question": "What is the HS code for a hammock?",
                "searchedAs": ["hammock hs code", "cotton hammock hs code", "camping hammock hs code"],
                "answer": "Hammocks of knotted cotton netting are 5608.90.23, at 14.1% — the highest ad valorem base rate in "
                "Chapter 56; China pays 51.6% in total. Hammocks sewn from woven fabric, like most camping hammocks, are not "
                "knotted netting and are classified with other made-up textile articles outside Chapter 56.",
                "link": "",
            },
            {
                "id": "nonwoven-origin",
                "question": "How is the country of origin of a nonwoven or rope determined?",
                "searchedAs": ["textile country of origin", "fabric country of origin"],
                "answer": "By CBP's textile rules (19 CFR 102.21). A nonwoven or felt is from the country where its web was "
                "formed; twine and rope from where the filaments were extruded or the fibres spun; nets from where the netting "
                "was made or the net assembled. Cutting, coating or packing elsewhere does not change it, and the origin "
                "decides the Section 301 rate.",
                "link": "tariff-engineering",
            },
        ],
    }
