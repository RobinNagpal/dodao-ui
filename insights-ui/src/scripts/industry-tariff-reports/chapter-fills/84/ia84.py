"""Writer text for the Chapter 84 industry-areas (rates by country) page."""
import copy

S232_TXT = (
    "Section 232 (9903.82.09/.10, on the full value): 25% on refrigerators, washers, window A/C, compressors, pumps, bearings, gears and other derivative lines; a 15% total on "
    "industrial, farm and residential HVAC equipment; 25% on forklifts and construction machinery. Those lines skip the Section 301 duty."
)
AUTO_TXT = "Engines, pumps, compressors, filters, bearings and other car or truck parts pay 25% (9903.94.05 / 9903.74.08) instead when used as such."


def apply(c):
    d, SRC, S = c["d"], c["SRC"], c["S"]
    ia = d["industryAreas"]
    BY = c["ADCVD_BY_COUNTRY"]
    nsemi = len(S["semi"])
    ia["h1"] = "HTS Chapter 84: Machinery and Mechanical Appliances — Tariff Rates by Country"
    ia["seo"] = {
        "title": "Machinery Tariffs by Country: Mexico, China, Japan, Germany, Canada, Taiwan, Vietnam (HTS Ch. 84) | KoalaGains",
        "shortDescription": "The total U.S. tariff on Chapter 84 machinery by country and product group: computers Free almost everywhere, 10%–12.5% Section 301 on most machinery, "
        "Section 232 at 25% or 15% on derivative and equipment lines, China 25% more, Canada's Section 338 lines 50%, and deal rates for the EU, Japan, Korea, Taiwan and the UK.",
        "keywords": [
            "machinery tariffs by country",
            "tariffs on machinery from china",
            "tariff on machinery from china to usa",
            "tariffs on italian machinery",
            "canadian tariffs on machinery",
            "us tariffs machinery",
            "tariffs on equipment from china",
            "heavy machinery tariffs",
            "farm machinery tariffs",
            "hvac tariffs",
        ],
    }
    ia["intro"] = (
        "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. Three things set most of "
        "the totals. **Computers, computer parts and semiconductor equipment** (8471, 8473.30, 8486) are Free from almost every country, China included, because they are exempt from "
        "the 2026 Section 301 duties. **Most other machinery** pays the 2026 Section 301 duty: +10% or +12.5%, a 10% or 12.5% total for the EU, Japan, Korea and Taiwan, and nothing for "
        "USMCA goods from Canada and Mexico. **Section 232 lines** (refrigerators, washers, compressors, pumps, bearings, gears, HVAC, farm and construction machinery) pay 25%, or a "
        "15% total, from every country instead, with or without USMCA.\n\n"
        "China pays 25% or 7.5% more under Section 301 on almost every line; Canada pays 50% under Section 338 on 56 lines even with USMCA; Brazil pays 25% plus 12.5% except on Section 232 "
        "lines and computers. Where a line is a car or truck part, or a computer with a covered AI chip, the cell shows each answer. The table does **not** include antidumping or "
        "countervailing duties (see Tariff updates)."
    )

    def code_of(x):
        return x["rule"]["ch99Code"]

    R = {}
    R["China"] = (
        "Most lines: base + 12.5% (9903.05.31) + 25% Section 301 (List 1 9903.88.01, List 2 .02, List 3 .03) or 7.5% (List 4A 9903.88.15): about 37.5% to 40%. Section 232 lines pay "
        "25% or 15% + the list duty instead of the 12.5% (50% on refrigerators, washers, forklifts and excavators). Laptops (8471.30) and keyboards (8471.60.20) are Free; other "
        "computers 7.5% or 25% (lists only). Exclusions (9903.88.69/.70) run to November 9, 2026. " + BY["China"],
        ["fr-2026-15181", "fr-2018-13248", "fr-2018-17709", "fr-2018-20610", "fr-2019-17865", "fr-2020-00904", "fr-2025-21671", "procl-11021", "procl-11032", "hts-now"],
    )
    R["Mexico"] = (
        "USMCA-qualifying: Free on most lines (9903.05.94 lifts the 10% Section 301 duty), but Section 232 still applies: 25% on derivative lines, 15% on equipment lines, and 25% on the "
        "non-U.S. content of forklifts and construction machinery (9903.82.20). Car and truck parts that qualify are exempt. Without USMCA: 10% Section 301 (9903.05.55) on the other lines. " + BY["Mexico"],
        ["fr-2026-15181", "procl-11021", "procl-11032", "procl-10908", "procl-10984", "hts-now"],
    )
    R["Canada"] = (
        "USMCA-qualifying: Free on most lines (9903.05.93 lifts the 10% Section 301 duty), but Section 232 still applies (25% / 15%; 25% on the non-U.S. content of mobile machinery) and "
        "56 lines pay 50% under Section 338 (9903.03.14) even with USMCA: turbines, turbochargers, display cases, chillers, packaging machinery, pressure washers, mobile cranes, brewery "
        "machinery, printing plates, mixers. Without USMCA: 10% Section 301 (9903.05.29) on top. " + BY["Canada"],
        ["fr-2026-15181", "procl-11048", "procl-11065", "procl-11021", "procl-11032", "procl-10908", "hts-now"],
    )
    R["United Kingdom"] = (
        "10% Section 301 (9903.05.81) on most lines; UK medical sterilizers (8419.20.00.10) exempt (9903.05.96). Section 232: 25% shown on derivative lines, 15% with UK-melted steel or "
        "UK-smelted aluminum (9903.82.05); 15% on equipment lines; a 15% total on forklifts and construction machinery (9903.82.22). Car parts on the note 33(j) list 10% in place of the "
        "base rate (9903.94.32); other car parts 25%.",
        ["fr-2026-15181", "procl-11021", "procl-11032", "fr-2025-12060", "eo-14309", "hts-now"],
    )
    R["Brazil"] = (
        "Base + 25% (9903.05.01) + 12.5% (9903.05.27) on most lines: 37.5% more. Computers, computer parts and semiconductor equipment are exempt from both (notes 50(a)(ii), 52(b)). "
        "Section 232 lines pay only 25% or 15% (notes 50(a)(vi)(1), 52(f)). " + AUTO_TXT,
        ["fr-2026-14542", "fr-2026-15181", "procl-11021", "procl-11032", "procl-10908", "hts-now"],
    )
    DEAL = {"Germany": ("EU", "9903.94.53", "fr-2025-18660"), "Italy": ("EU", "9903.94.53", "fr-2025-18660"), "France": ("EU", "9903.94.53", "fr-2025-18660"),
            "Japan": ("Japan", "9903.94.43", "fr-2025-17908"), "South Korea": ("Korea", "9903.94.63", "fr-2025-21940"), "Taiwan": ("Taiwan", "9903.94.67", "fr-2026-10571")}
    for x in ia["countries"]:
        name = x["country"]
        if name == "Any other country":
            x["rule"]["label"] = (
                "Countries outside the 60 Section 301 economies pay the base rate on most lines; the listed economies pay 10% or 12.5% more. Every country pays Section 232 (25%, or a 15% "
                "total on equipment) and the auto-parts duty where they apply. Column 2 countries (Belarus, Cuba, North Korea, Russia) pay column 2 rates (Russia 35% in their place on 119 lines) and "
                "25% instead of 15% on equipment lines (9903.82.12; Russia 9903.82.17); Nicaragua's Section 301 duty starts January 1, 2027."
            )
            x["rule"]["sourceIds"] = ["fr-2026-15181", "fr-2026-15274", "procl-11021", "procl-11032", "procl-10908", "fr-2025-23892", "hts-now"]
            continue
        if name in R:
            x["rule"]["label"], x["rule"]["sourceIds"] = R[name][0].strip(), R[name][1]
            continue
        code = code_of(x)
        pct = x["rule"]["extraPct"]
        pct_s = f"{pct:g}%"
        if name in DEAL:
            who, acode, src = DEAL[name]
            lab = (
                f"{pct_s} total in place of a lower base rate (Section 301, {code}) on most lines; computers, computer parts and semiconductor equipment Free (note 52(b)). "
                f"Section 232: 25% on derivative lines, a 15% total on equipment lines, and a 15% total on forklifts and construction machinery (9903.82.22). "
                f"Car parts {who} rate: 15% in place of the base rate ({acode}); truck and bus parts 25%."
            )
            ids = ["fr-2026-15181", "procl-11021", "procl-11032", src, "procl-10984", "hts-now"]
        else:
            pref = " The Singapore FTA rate (SG) applies where the line offers it." if name == "Singapore" else ""
            lab = f"+{pct_s} Section 301 ({code}) on most lines; computers, computer parts and semiconductor equipment Free (note 52(b)). {S232_TXT} {AUTO_TXT}{pref}"
            ids = ["fr-2026-15181", "procl-11021", "procl-11032", "procl-10908", "procl-10984", "hts-now"]
        extra = BY.get(name, "")
        x["rule"]["label"] = (lab + (" " + extra if extra else "")).strip()
        x["rule"]["sourceIds"] = ids
    for x in ia["countries"]:
        assert "TODO" not in x["rule"]["label"], x["country"]
        x["rule"]["sourceIds"] = list(dict.fromkeys(x["rule"]["sourceIds"] + c["ADCVD_COUNTRY_SOURCES"].get(x["country"], [])))
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "Section 232 is shown at its default rates: 25% (9903.82.09), a 15% total for industrial, farm and residential HVAC equipment (9903.82.10), and 25% or the 15% deal-partner total for "
        "mobile machinery (9903.82.22). Not shown: goods whose steel, aluminum and copper weigh under 15% of the article (no duty, 9903.82.03), goods with no such metal (9903.82.01), "
        "UK goods with UK-melted metal (15%, 9903.82.05), goods with at least 85% U.S.-melted metal (10%), parts used to make agricultural or industrial equipment (15%, 9903.82.25) and "
        "motorcycle parts for U.S. manufacture (9903.82.13).",
        "Lines on the auto-parts lists (notes 33(g) and 38) show each answer: the regular rate, the car or light-truck parts rate and the truck or bus parts rate. The opt-in certified-parts "
        "elections (9903.94.07, 9903.74.09) are listed on Tariff updates but the cells price the default (no election).",
        f"The {nsemi} lines of 8471.50, 8471.80 and 8473.30 show both answers for the Section 232 semiconductor duty (9903.79.01): Free for ordinary units, 25% for units with a covered logic "
        "chip. The end-use exemptions (U.S. data centers, repairs, R&D, startups, consumer, civil industrial and public-sector use) need the importer's confirmation and are not applied.",
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied. "
        "The Section 201 washer safeguard (9903.45.xx) expired February 7, 2023.",
        "Antidumping and countervailing duties are not included. They apply company by company to vertical shaft engines, outdoor power equipment, aerial work platforms, crawler cranes, washers, "
        "kitchen appliance racks, tapered roller bearings, fluid end blocks, slag pots and aluminum extrusion parts.",
        "Entry rules: EPA engine emission certification (EPA Form 3520-21), DOE energy-conservation standards for appliances and HVAC, EPA refrigerant restrictions, FCC rules for computers; "
        "see Tariff engineering.",
    ]
    ia["exemptionCheck"] = (
        "Read U.S. notes 16, 17, 19, 20, 29, 30, 31, 33, 38, 39, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) exempts 40 Chapter 84 lines from the 2026 "
        "Section 301 duties: all of 8471, 8473.30 and 8486 (9903.05.86). Note 52(j)(1) exempts UK medical sterilizers of 8419.20.00.10 (9903.05.96); no other country exception list in note 52(j) "
        "names a Chapter 84 line, and the note 52(e) pharmaceutical list names none. Note 52(f) excludes Section 232 metals, auto-parts, truck-parts and semiconductor goods; note 52(d) civil "
        "aircraft articles (133 Chapter 84 provisions) need the importer's confirmation. Note 50(a)(ii) exempts 41 lines from the Brazil duty. Note 16(c) lists 405 Chapter 84 lines under "
        "(vi), (vii), (ix), (x) and (xi), with the 15% metal-weight test; note 51(b)(3) lists 56 lines for Canada; note 20 exclusions (vvv), (www) and note 31 cranes need confirmation and are not applied."
    )
    ia_ids = {"hts-now"}
    for x in ia["countries"]:
        ia_ids.update(x["rule"]["sourceIds"])
    for sid in ia_ids:
        assert sid in SRC, sid
    ia["sources"] = sorted([copy.deepcopy(SRC[i]) for i in ia_ids], key=lambda s: (s["published"], s["id"]), reverse=True)
