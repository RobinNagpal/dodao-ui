"""Fill the writer TODOs of the generated Chapter 38 content file.

usage: python3 fill38.py <generated.json> <out.json>
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from fill38_static import EXTRA_SOURCES, CH38, CH99, ECFR, GROUPS, CHAPTER_NOTES  # noqa: E402
from fill38_adcvd import ADCVD_SOURCES, ADCVD_CHANGES, ADCVD_RULES, ADCVD_LINE_RULES, ADCVD_TEXT  # noqa: E402
from fill38_trade import apply_trade  # noqa: E402

ECFR_AS_OF = "2026-10-08"

d = json.load(open(sys.argv[1]))
d["chapter"]["title"] = "Miscellaneous Chemical Products"

# ---------------------------------------------------------------- overview (non-trade parts)
o = d["overview"]
o["h1"] = "HTS Chapter 38: Miscellaneous Chemical Products — Tariff Rates"
o["notes"] = {"chapterNotes": CHAPTER_NOTES, "additionalUsNotes": None}
for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G[0]
    g["blurb"] = G[2]
    g["searchExamples"] = G[3]

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 38: Miscellaneous Chemical Products — Tariff Updates"
tu["seo"] = {
    "title": "Chemical Tariff Updates 2026 — HTS Chapter 38: Section 301, Canada 338, China, Biodiesel | KoalaGains",
    "shortDescription": "What changed for HTS Chapter 38 chemical imports since January 2025: the ended IEEPA and Section 122 duties, the 2026 Section 301 tariffs on 60 economies and their exemptions, Canada's 50% Section 338 duty on fatty acids, China's 25%–50% Section 301 rates, and AD/CVD orders, with Federal Register citations.",
    "keywords": [
        "chemical tariffs 2026",
        "us tariffs on chemicals",
        "trump tariffs chemical industry",
        "tariffs on chemicals from china",
        "section 301 chemicals",
        "HTS Chapter 38 tariff updates",
        "biodiesel antidumping",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current "
    "**2026 Revision 21** (in force October 9, 2026). None of the 209 Chapter 38 lines present in both editions changed its base rate; eight statistical "
    "lines are new — silicon-containing active anode material and platinum-group catalysts (February 1, 2026) and four kinds of doped silicon wafers "
    "(July 1, 2026). Revision 21 itself only corrected subheading note 1 of the chapter (a pesticide-classification sentence was deleted as an erratum).\n\n"
    "The extra duties changed far more. The 2025 IEEPA duties (Canada, Mexico, China and the reciprocal tariff) **ended on February 24, 2026**, and the "
    "10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** the **2026 Section 301 tariffs** add 10% or 12.5% on "
    "goods of 60 economies, and almost all of Chapter 38 is covered: only doped wafers (3818) are on the general exemption list. Since **August 22, 2026** "
    "Canadian fatty acids, fatty alcohols, sorbitol, some lubricant additives and other preparations pay a **50% Section 338** duty even under USMCA. "
    "Chinese goods pay the 2018–2019 Section 301 duties (mostly 25%) plus 12.5%, and Chinese wafers 50%.\n\n"
    "Separately, **antidumping and countervailing duties** apply to several Chapter 38 products (see the change log). They are set company by company "
    "by the Commerce Department, are listed below for reference, and are **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 38 from any country (the 2026 Section 301 action on 60 economies and the Brazil action; China's Section 301 "
    "lists; Canada's Section 338 duty; the Russia rates and Russian-aluminum Section 232 duty; the ended IEEPA and Section 122 duties), plus the "
    "antidumping and countervailing duty orders on Chapter 38 products, which the tariff calculator does not model. For the rate each supplier pays, see Rates by country."
)

EXEMPT_52E = (
    "Goods for use in pharmaceutical applications in 32 listed subheadings (activated carbon, some pesticides and disinfectants, catalysts, 3824.8x "
    "mixtures and several 3824.99, 3826.00.30 and 3827 lines) are exempt if that use is shown (note 52(e), 9903.05.89)"
)
IE = {
    "China": dict(
        measure="Section 301: 2018–2019 lists, 2024 four-year review and the 2026 action",
        exemption=(
            "List 3 (+25%, 9903.88.03) covers 177 of the 217 Chapter 38 lines, List 4A (+7.5%, 9903.88.15) 18 lines — mainly fatty acids and fatty "
            "alcohols (3823), sorbitol (3824.60), antifreeze (3820) and municipal waste and sewage sludge — and List 2 (+25%, 9903.88.02) the lubricating-oil "
            "additives of 3811.21 and 3811.29. The 2026 duty (+12.5%, 9903.05.31) stacks on top of all of them. Doped wafers (3818) pay +50% under the 2024 "
            "four-year review (9903.91.05) instead, and are exempt from the 12.5% (note 52(b)); USTR said the 50% will rise on June 23, 2027 by an amount not "
            "yet announced. Culture media (3821), diagnostic reagents (3822) and two 3808.59 lines are on no older list and pay only 12.5%. Product "
            "exclusions (note 20(vvv)(iii), 9903.88.69) lift the List 3 duty for described supported catalysts of 3815.11 and 3815.19 and for disinfectant "
            "wipes of 3808.94.5010 until November 9, 2026. " + EXEMPT_52E + ". The IEEPA duties on China ended February 24, 2026. Antidumping and "
            "countervailing duties on several Chinese Chapter 38 products are not shown here."
        ),
        what="Most Chinese Chapter 38 goods pay the base rate plus 37.5%: a herbicide at 5% base pays 42.5%, activated carbon 42.3%. Fatty acids pay base + 20%, culture media and lab reagents base + 12.5%, and doped silicon wafers 50%.",
    ),
    "European Union": dict(
        measure="Section 301 tariff (2026): 10% floor for the EU",
        exemption=(
            "Goods of EU member states pay 10% or their base rate, whichever is higher (9903.05.39), so most Chapter 38 lines rise to 10% in total. "
            "Not charged: doped wafers (3818, note 52(b)); stearic acid, oleic acid, palm- and coconut-derived fatty acids and fatty alcohols of 3823.70.40 "
            "(note 52(j)(2), 9903.05.97). " + EXEMPT_52E + ". The 15% IEEPA reciprocal rate on EU goods ended February 24, 2026."
        ),
        what="A German concrete admixture with a 5% base rate pays 10% in total; one with a 6.5% base also pays 10%. EU stearic acid pays only its base rate (2.1¢/kg + 3.8%).",
    ),
    "Canada": dict(
        measure="Section 301 tariff (2026) and Section 338 duty on certain goods of Canada",
        exemption=(
            "The 10% Section 301 duty (9903.05.29) does not apply to goods entered duty-free under USMCA (note 52(g), 9903.05.93), to doped wafers (3818, "
            "note 52(b)), or to the pharmaceutical-use goods of note 52(e). The **50% Section 338 duty** (9903.03.14, Proclamation 11048, in force since "
            "August 22, 2026) applies to 12 Chapter 38 subheadings — lubricating-oil additives containing petroleum oils (3811.21), stearic, oleic, tall oil "
            "and other fatty acids and fatty alcohols (3823.11, 3823.12, 3823.13, 3823.19.20, 3823.19.40, 3823.70.40, 3823.70.60), sorbitol (3824.60) and "
            "3824.99.39, 3824.99.55 and 3824.99.93 — **even when USMCA is claimed** (note 51(a)). The 2025 IEEPA duty (35% on non-USMCA goods) ended February 24, 2026."
        ),
        what="USMCA-qualifying Canadian chemicals pay nothing extra unless they are on the Section 338 list: USMCA stearic acid pays 50%, non-USMCA stearic acid 2.1¢/kg + 63.8%. Non-USMCA goods off that list pay base + 10%.",
    ),
    "Mexico": dict(
        measure="Section 301 tariff (2026)",
        exemption=(
            "The 10% duty (9903.05.55) does not apply to goods entered duty-free under USMCA (note 52(h), 9903.05.94), to doped wafers (3818, note 52(b)) "
            "or to the pharmaceutical-use goods of note 52(e). The 2025 IEEPA duty (25% on non-USMCA goods) ended February 24, 2026."
        ),
        what="USMCA-qualifying Mexican chemicals pay no duty at all; non-USMCA goods pay the base rate plus 10%.",
    ),
    "Japan": dict(
        measure="Section 301 tariff (2026): 12.5% floor for Japan",
        exemption=(
            "Goods of Japan pay 12.5% or their base rate, whichever is higher (9903.05.49). Doped wafers (3818) are exempt (note 52(b)); " + EXEMPT_52E + ". "
            "The IEEPA reciprocal rate ended February 24, 2026."
        ),
        what="Every Japanese Chapter 38 line except wafers pays 12.5% in total, because no Chapter 38 base rate is above 12.5%.",
    ),
    "South Korea": dict(
        measure="Section 301 tariff (2026): 12.5% floor for Korea",
        exemption=(
            "Goods of Korea pay 12.5% or their base rate, whichever is higher (9903.05.71), whether or not KORUS is claimed. Doped wafers (3818) are exempt "
            "(note 52(b)); " + EXEMPT_52E + ". The IEEPA reciprocal rate ended February 24, 2026."
        ),
        what="Korean Chapter 38 goods pay 12.5% in total except wafers, which are Free.",
    ),
    "India": dict(
        measure="Section 301 tariff (2026)",
        exemption="The 10% duty (9903.05.44) is added to the base rate. Doped wafers (3818) are exempt (note 52(b)); " + EXEMPT_52E + ". The IEEPA reciprocal duty ended February 24, 2026.",
        what="An Indian herbicide formulation at 5% base pays 15%; a 6.5% line pays 16.5%.",
    ),
    "Indonesia": dict(
        measure="Section 301 tariff (2026)",
        exemption=(
            "The 10% duty (9903.05.45) is added to the base rate, but not on stearic acid, oleic acid, palm- and coconut-derived fatty acids (3823.19.20) "
            "or fatty alcohols of 3823.70.40 (note 52(j), 9903.06.16), nor on doped wafers (3818) or the pharmaceutical-use goods of note 52(e). The IEEPA "
            "reciprocal duty ended February 24, 2026."
        ),
        what="Indonesian palm fatty acids and fatty alcohols pay only their base rate (2%–3.8%); Indonesian biodiesel pays 4.6% + 10% = 14.6%, plus any AD/CVD.",
    ),
    "Malaysia": dict(
        measure="Section 301 tariff (2026)",
        exemption=(
            "The 10% duty (9903.05.54) is added to the base rate, but not on stearic acid, oleic acid, palm- and coconut-derived fatty acids (3823.19.20) "
            "or fatty alcohols of 3823.70.40 (note 52(j), 9903.05.99), nor on doped wafers (3818) or the pharmaceutical-use goods of note 52(e). The IEEPA "
            "reciprocal duty ended February 24, 2026."
        ),
        what="Malaysian fatty acids and fatty alcohols pay only their base rate; most other Malaysian Chapter 38 goods pay base + 10%.",
    ),
    "Argentina": dict(
        measure="Section 301 tariff (2026)",
        exemption="The 10% duty (9903.05.22) is added to the base rate; doped wafers (3818) and the pharmaceutical-use goods of note 52(e) are exempt. The IEEPA reciprocal duty ended February 24, 2026.",
        what="Argentine biodiesel (B100) pays 4.6% + 10% = 14.6%, plus any AD/CVD.",
    ),
    "Brazil": dict(
        measure="Section 301 tariffs: Brazil action (25%) and the 2026 action (12.5%)",
        exemption=(
            "Both duties stack: +25% (9903.05.01, from July 22, 2026) and +12.5% (9903.05.27, from July 24, 2026). Doped wafers (3818) are exempt from both "
            "(notes 50(a)(ii) and 52(b)); goods for pharmaceutical use in the listed subheadings are exempt from both (notes 50(a)(v) and 52(e))."
        ),
        what="A Brazilian Chapter 38 good at 5% base pays 42.5%.",
    ),
    "United Kingdom": dict(
        measure="Section 301 tariff (2026)",
        exemption="The 10% duty (9903.05.81) is added to the base rate; the UK exception list (note 52(j)(1)) names no Chapter 38 line. Doped wafers (3818) and the pharmaceutical-use goods of note 52(e) are exempt. The IEEPA reciprocal duty ended February 24, 2026.",
        what="A UK chemical preparation at 5% base pays 15%.",
    ),
    "Singapore": dict(
        measure="Section 301 tariff (2026)",
        exemption="The 12.5% duty (9903.05.68) is added to the base rate, also when the U.S.–Singapore FTA rate (SG) is claimed. Doped wafers (3818) and the pharmaceutical-use goods of note 52(e) are exempt. The IEEPA reciprocal duty ended February 24, 2026.",
        what="Singapore's diagnostic reagents (Free) pay 12.5%; an FTA claim on a 5% line still leaves 12.5%.",
    ),
    "Taiwan": dict(
        measure="Section 301 tariff (2026): 10% floor for Taiwan",
        exemption=(
            "Goods of Taiwan pay 10% or their base rate, whichever is higher (9903.05.76). Not charged: doped wafers (3818, note 52(b)); stearic acid, "
            "oleic acid, palm- and coconut-derived fatty acids and fatty alcohols of 3823.70.40 (note 52(j), 9903.06.14); and the pharmaceutical-use goods "
            "of note 52(e). The IEEPA reciprocal duty ended February 24, 2026."
        ),
        what="Taiwanese wafers are Free; most other Taiwanese Chapter 38 goods pay 10% in total.",
    ),
    "Russia": dict(
        measure="Column 2 rates, Russia 35% rates, Section 301 (2026) and Section 232 on Russian aluminum",
        exemption=(
            "Products of Russia are charged the Column 2 rate instead of the general rate, and 35% instead of Column 2 on 13 Chapter 38 lines "
            "(9903.90.08, U.S. note 30), such as artificial graphite of 3801.20, doped wafers (3818) and certain catalysts. The 12.5% Section 301 duty "
            "(9903.05.66) is added except on wafers. Derivative aluminum articles of 27 Chapter 38 lines (aerosol-type pesticides, disinfectants, solvents, "
            "additives and antifreeze, note 19(k)) also pay 200% under Section 232 (9903.85.68) when they are products of Russia or contain aluminum "
            "smelted or cast in Russia."
        ),
        what="Russian Chapter 38 goods pay the Column 2 rate (often 25%) plus 12.5%; a 35% line pays 47.5%.",
    ),
}
for x in tu["inEffect"]:
    c = x["country"]
    key = "Other" if c.startswith("Other Section 301") else c
    if key == "Other":
        x["exemption"] = (
            "The other economies of the 2026 Section 301 action pay +10% or +12.5% on top of the base rate (Switzerland a 12.5% floor instead). Doped wafers (3818) are exempt for all of them (note 52(b)), and " + EXEMPT_52E[0].lower() + EXEMPT_52E[1:] + ". Stearic acid, "
            "oleic acid, palm- or coconut-derived fatty acids and certain fatty alcohols are also exempt for Switzerland, Cambodia, Guatemala, "
            "El Salvador, Ecuador and Jordan (note 52(j)). The IEEPA reciprocal duties ended February 24, 2026."
        )
        x["whatItMeans"] = "A Chapter 38 good with a 5% base rate pays 15% or 17.5% from these economies (12.5% from Switzerland)."
        continue
    if key not in IE:
        raise SystemExit("no inEffect text for " + c)
    x["measure"] = IE[key]["measure"]
    if key == "China":
        x["now"] = "+37.5% (most lines), +20% (List 4A lines), +12.5% (no older list) or +50% (wafers)"
    x["exemption"] = IE[key]["exemption"]
    x["whatItMeans"] = IE[key]["what"]

have = {s["id"] for s in tu["sources"]}
for s in EXTRA_SOURCES + ADCVD_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])
for x in tu["inEffect"]:
    if x["country"] == "China":
        for sid in ["fr-2025-21671", "eo-14389"]:
            if sid not in x["sourceIds"]:
                x["sourceIds"].append(sid)
    if x["country"] in ("Canada", "Mexico") or x["country"] == "European Union":
        if "eo-14389" not in x["sourceIds"]:
            x["sourceIds"].append("eo-14389")


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


base = [c for c in tu["changes"] if c["type"] == "baseRate"]
gen = {c["id"]: c for c in tu["changes"] if c["type"] != "baseRate"}
for c in base:
    c["detail"] = (
        "209 of the 217 Chapter 38 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. "
        "The other 8 are new statistical lines split from existing ones at the same rates: 3801.90.00.10/.50 and 3815.12.00.10/.90 (February 1, 2026) "
        "and 3818.00.00.40/.45/.50/.91 (July 1, 2026)."
    )

changes = base + [
    ch("rev21-note", "reference", "2026-10-09", "Effective", "Revision 21 corrects Chapter 38 subheading note 1",
       "The only Chapter 38 change in the 2026 Revision 21 is an erratum to subheading note 1: the sentence saying that subheading 3808.59 also covers dustable "
       "powder formulations of benomyl, carbofuran and thiram was deleted, to match Proclamation 10326 (the 2022 HS changes). No tariff line or rate changed; "
       "the change record lists Chapters 38 and 99 as the only chapters affected.",
       None, None, "All", ["hts-now-cr", "procl-10326"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their July 6 and August 23, 2026 anniversaries and remain in "
       "effect pending the second four-year review it opened on May 6, 2026. The 25% and 7.5% List 2, 3 and 4A duties on Chinese Chapter 38 goods continue.",
       None, None, "China", ["fr-2026-20510", "fr-2026-08806"]),
    ch("ca338-scope", "reference", "2026-09-15", "Effective", "Canada Section 338 list revised; Chapter 38 lines unchanged",
       "Proclamation 11065 changed the products on the Section 338 list (9903.03.14) and made the 50% apply on top of any Section 232 duty. The 12 Chapter 38 "
       "subheadings on the list stayed on it.",
       None, None, "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99"]),
    ch("ca338", "extraDuty", "2026-08-22", "Effective", "Section 338: 50% on Canadian fatty acids, sorbitol and other preparations",
       "Under section 338 of the Tariff Act of 1930, Proclamation 11048 (signed July 20, 2026) imposed +50% (9903.03.14) on listed products of Canada to offset "
       "Canada's motor-vehicle surtax on U.S. cars. Its start was suspended for three days (Proclamation 11056) and took effect at 12:01 a.m. on August 22, 2026. "
       "In Chapter 38 it covers 3811.21, 3823.11, 3823.12, 3823.13, 3823.19.20, 3823.19.40, 3823.70.40, 3823.70.60, 3824.60, 3824.99.39, 3824.99.55 and "
       "3824.99.93, and applies even to goods entered under USMCA (U.S. note 51(a)).",
       "None", "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99"]),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies cover almost all of Chapter 38",
       "+10% or +12.5% on goods of 60 economies (9903.05.20–9903.05.84; the EU and Taiwan a 10% floor, Japan, Korea and Switzerland a 12.5% floor). In Chapter 38 "
       "only doped wafers (3818) are on the general exemption list (note 52(b)). Goods for use in pharmaceutical applications in 32 listed subheadings are exempt "
       "if that use is shown (note 52(e)); fatty acids and fatty alcohols are exempt for the EU, Switzerland, Malaysia, Indonesia, Taiwan and five other "
       "economies (note 52(j)); USMCA goods of Canada and Mexico are exempt.",
       "None", "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026. Seven Chapter 38 subheadings were on its exemption list (9903.03.03): "
       "3808.94.10 and 3808.94.50 (disinfectants, including hand sanitizer), doped wafers (3818) and 3824.91, 3824.99.29, 3824.99.49 and 3824.99.55.",
       "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Brazil Section 301 tariff: +25%",
       "+25% on goods of Brazil (9903.05.01), on top of Brazil's 12.5% under the 2026 action from July 24. In Chapter 38 only doped wafers (3818) are on its "
       "exemption list (note 50(a)(ii)); pharmaceutical-use goods of the listed subheadings are also exempt (note 50(a)(v)).",
       "None", "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or "
       "until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("wafer-split", "reference", "2026-07-01", "Effective", "New statistical lines for doped silicon wafers",
       "3818.00.0095 was split into round monocrystalline silicon wafers of the semiconductor type (3818.00.0040), pseudo-square or rectangular wafers of the "
       "solar-cell type (3818.00.0045), other monocrystalline wafers (3818.00.0050) and other (3818.00.0091), with new statistical notes 2 and 3. All stay Free.",
       None, None, "All", ["hts-cr-2026r11"]),
    ch("rfs-set2", "reference", "2026-04-01", "Published", "EPA sets 2026–2027 Renewable Fuel Standard volumes; import RIN cut deferred",
       "EPA's final rule (effective June 15, 2026) set the biomass-based diesel and other RFS volumes for 2026 and 2027. It did not finalize the proposed cut of "
       "RINs for imported renewable fuel and fuel made from foreign feedstocks by half, and said it intends to adopt one from the 2028 compliance year or shortly "
       "after. It made importers of renewable fuel jointly and severally liable for RFS violations (40 CFR 80.1461(g)). EPA data in the rule show U.S. imports "
       "of biodiesel and renewable diesel fell from about 830 million gallons in 2024 to about 140 million gallons in 2025.",
       None, None, "All", ["fr-2026-06275"]),
    ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026, except the products on its exemption list (9903.03.03), which "
       "included seven Chapter 38 subheadings.",
       None, "+10%", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended "
       "the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. For Chapter 38 this "
       "removed the duties on non-USMCA goods of Canada (35%) and Mexico (25%), on goods of China, and the reciprocal tariff on goods of other countries "
       "(15% floor for the EU).",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("aam-split", "reference", "2026-02-01", "Effective", "New statistical lines for anode material and precious-metal catalysts",
       "3801.90.0000 was split to report active anode material containing silicon (3801.90.0010) separately, and 3815.12.0000 to report supported catalysts with "
       "platinum-group metals (3815.12.0010) separately. Rates did not change.",
       None, None, "All", ["hts-cr-2026r2"]),
    ch("cn-excl", "reference", "2025-11-30", "Effective", "China Section 301 product exclusions extended to November 9, 2026",
       "USTR extended 178 product exclusions, including described supported catalysts of 3815.11 and 3815.19 and disinfectant wipes of 3808.94.5010, through "
       "November 9, 2026 (9903.88.69).",
       None, "Excluded until 2026-11-09", "China", ["fr-2025-21671", "hts-chapter-99"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada IEEPA duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff covers most Chapter 38 goods",
       "10% baseline (9903.01.25) and country rates (9903.02.xx) on products of all countries except Canada and Mexico, from April 5, 2025. Seven Chapter 38 "
       "subheadings were on the exemption list (9903.01.32): 3808.94.10, 3808.94.50, 3818, 3824.91, 3824.99.29, 3824.99.49 and 3824.99.55. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("usmca-exempt", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.",
       "+25%", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including Chapter 38 chemicals. Ended February 24, 2026.",
       "None", "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194"]),
]
# generator entries kept (with writer text)
GEN_TEXT = {
    "Section 301 (Nicaragua)": (
        "Section 301 tariff on Nicaragua phases in from 2027",
        "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), "
        "with no Chapter 38 exemption. The rate is 0% in 2026; Nicaragua's 12.5% under the 2026 action (9903.05.58) applies now.",
    ),
    "Section 232 (aluminum, Russia)": (
        "Russian aluminum: 200% Section 232 duty reaches aluminum-packed chemicals",
        "From August 18, 2025, derivative aluminum articles added by Commerce's inclusions process — including 27 Chapter 38 lines such as aerosol pesticides and "
        "disinfectants, solvents, lubricant additives and antifreeze (note 19(k)) — pay 200% (9903.85.68) when they are products of Russia or contain aluminum "
        "smelted or cast in Russia. For other countries those lines are no longer on a Section 232 list in the 2026 Revision 21.",
    ),
    "Section 301 (China, 2024 four-year review)": (
        "Chinese doped silicon wafers: Section 301 duty raised to 50%",
        "From January 1, 2025, wafers of 3818 from China pay +50% (9903.91.05) under the four-year review, instead of the earlier list duty. USTR's December 2025 "
        "semiconductor action said the rate will rise again on June 23, 2027, by an amount to be announced.",
    ),
}
for c in gen.values():
    for k, (title, detail) in GEN_TEXT.items():
        if k in c["title"]:
            c["title"], c["detail"] = title, detail
            if k == "Section 301 (China, 2024 four-year review)":
                c["sourceIds"] = [s for s in c["sourceIds"]] + [s for s in ["fr-2024-29462", "fr-2025-23912"] if s not in c["sourceIds"]]
            break
    else:
        # generic generator entries already duplicated above (301, Brazil, Section 338) are dropped
        continue
    changes.append(c)
changes += ADCVD_CHANGES
ids = set()
for c in changes:
    assert c["id"] not in ids, c["id"]
    ids.add(c["id"])
changes.sort(key=lambda c: (c["date"], c["type"] == "baseRate"), reverse=True)
tu["changes"] = changes
for c in tu["changes"]:
    for sid in c["sourceIds"]:
        assert sid in have, (c["id"], sid)
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]

# ---------------------------------------------------------------- industryAreas (non-trade parts)
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 38: Miscellaneous Chemical Products — Tariff Rates by Country"
for g in ia["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G[0]
    g["shortLabel"] = G[1]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 19, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Of Chapter 38, only 3818.00.00 (doped wafers) "
    "is on the Section 301 general exemption list (note 52(b), 9903.05.86) and the Brazil exemption list (note 50(a)(ii)). Note 52(e) / 50(a)(v) exempt "
    "pharmaceutical-use goods of 32 Chapter 38 subheadings only when that use is shown — the table does not assume it. The country lists of note 52(j) name "
    "3823.11, 3823.12, 3823.19.20 and 3823.70.40 (EU, Malaysia, Indonesia, Taiwan, Cambodia, Ecuador, Jordan; Switzerland, Guatemala and El Salvador for some "
    "of them). Note 51(b)(3) (Canada Section 338) lists 12 Chapter 38 subheadings. China: 177 lines on List 3, 18 on List 4A, 2 on List 2, wafers under note "
    "31(f); the note 20(vvv)(iii) exclusions for described catalysts are product-specific and not applied. Note 19(k) puts 27 Chapter 38 lines under the "
    "200% Section 232 duty for Russian aluminum; note 30 lists 13 Chapter 38 lines at 35% for Russia."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "HTS Chapter 38: Miscellaneous Chemical Products — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Chemicals (HTS Ch. 38): EPA Pesticide & TSCA Rules, HFC Allowances, Biodiesel, AD/CVD & Ways to Lower Duty | KoalaGains",
    "shortDescription": "The entry rules for each HTS Chapter 38 line — EPA pesticide registration and Notice of Arrival, TSCA certification, HFC and ozone-depleting substance allowances, EPA fuel and RFS rules for biodiesel, FDA rules for hand sanitizer, DOT hazmat — the AD/CVD orders, and the legal ways to pay less.",
    "keywords": [
        "pesticide import requirements",
        "EPA notice of arrival pesticides",
        "TSCA import certification",
        "HFC import allowances",
        "biodiesel import requirements",
        "hand sanitizer import FDA",
        "tariff engineering chemicals",
    ],
}
te["intro"] = (
    "Chapter 38 base rates are low (Free to 6.5%), so what decides the cost is **origin** and the extra duties: base + 37.5% for most Chinese goods (50% for wafers), 10%–12.5% "
    "from the 60 Section 301 economies, 37.5% from Brazil, and 50% on Canadian fatty acids and other listed goods. Several products also carry "
    "**antidumping or countervailing duties** that the tariff calculator does not include.\n\n"
    "The paperwork depends on the product: pesticides and disinfectants need EPA registration and a Notice of Arrival, most other chemicals a TSCA "
    "certification, refrigerant blends EPA allowances, biodiesel EPA fuel and Renewable Fuel Standard compliance, hand sanitizer FDA drug rules, and "
    "flammable or compressed products DOT hazmat handling. Each rule and lever below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
FR_URL = "https://www.federalregister.gov/documents/"
te["levers"] = [
    {
        "id": "origin",
        "title": "Know the country of origin — it moves the total more than the base rate",
        "saves": "Up to 37.5 points: the same 5% herbicide pays 42.5% from China or Brazil, 15%–17.5% from most Section 301 economies, 10% from the EU, and 5% from a country outside the 60 economies",
        "appliesTo": "All 217 lines",
        "document": "Commercial invoice and production records showing where the product was made. For mixtures and formulations, origin follows where the goods were last substantially transformed; ask CBP for a binding ruling when Chinese active ingredients are formulated elsewhere.",
        "caveat": "Simple dilution or repacking does not change origin. AD/CVD orders follow their own scope and country rules, separate from the tariff origin.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20 and 52", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": ECFR + "title-19/part-177"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican goods",
        "saves": "The 10% Section 301 duty on Canada or Mexico plus the base rate (up to 6.5%); not the 50% Section 338 duty on the 12 listed Canadian subheadings",
        "appliesTo": "All lines, for originating goods of Canada or Mexico",
        "document": "A USMCA certification of origin from the importer, exporter or producer; it need not follow a prescribed format and CBP can ask for it.",
        "caveat": "The Section 338 duty on Canadian fatty acids, fatty alcohols, sorbitol and the other listed goods applies even with a USMCA claim. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ECFR + "title-19/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 51 and 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "pharma-use",
        "title": "Enter pharmaceutical-use chemicals under the Section 301 exemption",
        "saves": "The 10% or 12.5% 2026 Section 301 duty (and Brazil's 25%) on goods for use in pharmaceutical applications",
        "appliesTo": "32 listed subheadings: 3802.10, 3808.59.40/.50, 3808.61.50, 3808.94.10/.50, 3812.31, 3815.11, 3815.12, 3815.90.50, 3824.81–3824.89, 3824.91, 3824.92, 3824.99.25/.29/.49/.50/.55/.93, 3826.00.30, 3827.13, 3827.14, 3827.40",
        "document": "Entry under 9903.05.89 (or 9903.05.06 for Brazil) with records showing the goods are for use in pharmaceutical applications.",
        "caveat": "The exemption depends on the end use, not the product; it does not lift China's 2018–2019 list duties. Keep evidence of use in case CBP asks.",
        "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 52(e) and 50(a)(v)", "url": CH99}],
    },
    {
        "id": "fatty-acid-source",
        "title": "Source fatty acids and fatty alcohols from an exempted economy",
        "saves": "The 10% or 12.5% Section 301 duty on stearic acid, oleic acid, palm/coconut fatty acids and 3823.70.40 fatty alcohols",
        "appliesTo": "3823.11, 3823.12, 3823.19.20, 3823.70.40 from the EU, Malaysia, Indonesia, Taiwan, Cambodia, Ecuador, Jordan (and some lines from Switzerland, Guatemala and El Salvador)",
        "document": "Proof of origin in one of the listed economies; enter under that economy's exception heading (e.g. 9903.05.97 EU, 9903.05.99 Malaysia, 9903.06.16 Indonesia).",
        "caveat": "Tall oil fatty acids (3823.13), 3823.19.40 and oleyl alcohol are not on these lists. From Canada the same lines pay 50% under Section 338.",
        "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)", "url": CH99}],
    },
    {
        "id": "china-exclusion",
        "title": "Use a China Section 301 product exclusion while it lasts",
        "saves": "The 25% List 3 duty on the excluded products, until November 9, 2026",
        "appliesTo": "Described supported catalysts of 3815.11 and 3815.19; disinfectant wipes of 3808.94.5010 (China)",
        "document": "Entry under 9903.88.69 for a product matching the exclusion's description in U.S. note 20(vvv)(iii).",
        "caveat": "The 12.5% 2026 Section 301 duty still applies. The exclusions expire at 11:59 p.m. on November 9, 2026 unless USTR extends them.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 20(vvv)", "url": CH99},
            {"label": "90 FR 55232 (exclusions extended)", "url": FR_URL + "2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA rate for the base duty",
        "saves": "The base rate (up to 6.5%) for originating goods of Korea, Australia, Singapore, Chile, Colombia, Peru, Panama, Israel, Jordan, Morocco, Oman or Bahrain",
        "appliesTo": "Dutiable lines whose Special column lists the partner",
        "document": "The origin documentation the agreement requires (19 CFR parts 10 and 102 and the agreement's rules of origin in the HTSUS general notes).",
        "caveat": "An FTA claim does not remove the 2026 Section 301 duty: Korea pays a 12.5% floor, Australia, Chile and others +12.5% on top. GSP (A, A*, A+) is not available — Congress has not renewed it.",
        "citations": [
            {"label": "HTSUS General Notes (FTA rules of origin)", "url": "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"},
            {"label": "19 CFR part 10", "url": ECFR + "title-19/part-10"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when imported chemicals are exported or used in exported goods",
        "saves": "Up to 99% of the duties paid on goods that are re-exported, unused or used to make exported products (19 CFR 191.3 lists the duties that qualify)",
        "appliesTo": "All dutiable lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)).",
        "citations": [
            {"label": "19 CFR part 191", "url": ECFR + "title-19/part-191"},
            {"label": "19 CFR 191.3", "url": ECFR + "title-19/section-191.3"},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check the AD/CVD scope before you buy",
        "saves": "The whole antidumping or countervailing duty, when the product is outside the order",
        "appliesTo": ADCVD_TEXT["leverAppliesTo"],
        "document": "The order's written scope (it, not the HTS number, decides). When unsure, request a scope ruling from Commerce.",
        "caveat": "A product inside the scope pays the cash deposit even if entered under a different HTS line; Commerce can also find circumvention through third countries.",
        "citations": [{"label": "19 CFR 351.225 (scope rulings)", "url": ECFR + "title-19/section-351.225"}] + ADCVD_TEXT["leverCitations"],
    },
]
te["rules"] = [
    {"id": "epa-pesticide", "agency": "EPA / CBP", "title": "Pesticides and disinfectants: file EPA's Notice of Arrival of Pesticides and Devices before the shipment arrives; EPA tells CBP to release or refuse it",
     "citations": [{"label": "19 CFR 12.112", "url": ECFR + "title-19/section-12.112"}, {"label": "19 CFR 12.114", "url": ECFR + "title-19/section-12.114"}]},
    {"id": "fifra-registration", "agency": "EPA", "title": "Pesticide products must be registered under FIFRA before they are sold or distributed, and imported pesticides must be registered to be admitted",
     "citations": [{"label": "40 CFR 152.15", "url": ECFR + "title-40/section-152.15"}, {"label": "19 CFR 12.111", "url": ECFR + "title-19/section-12.111"}]},
    {"id": "tsca", "agency": "EPA / CBP", "title": "Chemical substances and mixtures: TSCA import certification (positive or negative) filed before release",
     "citations": [{"label": "19 CFR 12.121", "url": ECFR + "title-19/section-12.121"}, {"label": "40 CFR 707.20", "url": ECFR + "title-40/section-707.20"}]},
    {"id": "hfc", "agency": "EPA", "title": "HFC refrigerant blends: bulk imports need EPA consumption or application-specific allowances, and shipment data filed 10 days (vessel) or 5 days (other) before importation",
     "citations": [{"label": "40 CFR 84.5", "url": ECFR + "title-40/section-84.5"}, {"label": "40 CFR 84.31", "url": ECFR + "title-40/section-84.31"}]},
    {"id": "ods", "agency": "EPA", "title": "Blends with CFCs, halons, carbon tetrachloride, methyl chloroform, methyl bromide or HCFCs: imports limited to EPA allowances and exemptions",
     "citations": [{"label": "40 CFR 82.4 (class I)", "url": ECFR + "title-40/section-82.4"}, {"label": "40 CFR 82.15 (class II, HCFCs)", "url": ECFR + "title-40/section-82.15"}]},
    {"id": "fuel-1090", "agency": "EPA", "title": "Biodiesel and biodiesel blends imported as diesel fuel: importer must meet the diesel fuel standards (15 ppm sulfur)",
     "citations": [{"label": "40 CFR 1090.1600", "url": ECFR + "title-40/section-1090.1600"}, {"label": "40 CFR 1090.305", "url": ECFR + "title-40/section-1090.305"}]},
    {"id": "rfs", "agency": "EPA", "title": "Renewable Fuel Standard: RINs for imported biodiesel are generated by the importer or a registered foreign producer; importers are jointly liable for RFS violations",
     "citations": [{"label": "40 CFR 80.1426", "url": ECFR + "title-40/section-80.1426"}, {"label": "40 CFR 80.1466", "url": ECFR + "title-40/section-80.1466"}, {"label": "40 CFR 80.1461", "url": ECFR + "title-40/section-80.1461"}]},
    {"id": "fuel-excise", "agency": "IRS", "title": "Biodiesel suitable for use as diesel fuel: federal fuel excise tax is due on entry unless entered by bulk transfer by a registrant (not in the tariff calculator)",
     "citations": [{"label": "26 CFR 48.4081-3(c)", "url": ECFR + "title-26/section-48.4081-3"}, {"label": "IRS Publication 510", "url": "https://www.irs.gov/publications/p510"}]},
    {"id": "fda-sanitizer", "agency": "FDA", "title": "Hand sanitizer (3808.94.50.80) is a drug: it must meet FDA requirements, and the foreign establishment that makes it must be registered with FDA",
     "citations": [{"label": "HTSUS Ch. 38, statistical note 1", "url": CH38}, {"label": "21 CFR 207.17", "url": ECFR + "title-21/section-207.17"}]},
    {"id": "dot-hazmat", "agency": "U.S. DOT (PHMSA)", "title": "Flammable solvents and thinners, many pesticides and alcohol sanitizers, and refrigerant gases in cylinders: hazardous materials for shipping papers, marking and packaging",
     "citations": [{"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": ECFR + "title-49/section-172.101"}]},
] + ADCVD_RULES

GROUP_RULES = {
    "3801": ["tsca"], "3802": ["tsca"], "3803": ["tsca"], "3804": ["tsca"], "3805": ["tsca", "dot-hazmat"], "3806": ["tsca"], "3807": ["tsca"],
    "3808": ["epa-pesticide", "fifra-registration", "fda-sanitizer", "dot-hazmat"],
    "3809": ["tsca"], "3810": ["tsca"], "3811": ["tsca"], "3812": ["tsca"], "3813": ["tsca"], "3814": ["tsca", "dot-hazmat"], "3815": ["tsca"],
    "3816": ["tsca"], "3817": ["tsca"], "3818": ["tsca"], "3819": ["tsca"], "3820": ["tsca"], "3821": ["tsca"], "3822": ["tsca"], "3823": ["tsca"],
    "3824": ["tsca"], "3825": ["tsca"], "3826": ["tsca", "fuel-1090", "rfs", "fuel-excise"], "3827": ["tsca", "hfc", "ods", "dot-hazmat"],
}
GROUP_NOTES = {
    "3801": "Graphite from China pays 37.5% on top of the base rate.",
    "3808": "Pesticides and disinfectants are regulated under FIFRA, so they file EPA's Notice of Arrival instead of a TSCA certification; hand sanitizer is an FDA-regulated drug.",
    "3818": "Wafers are on every 2026 exemption list; only China (50%) and Russia (35% + Column 2 rules) pay extra.",
    "3823": "From Canada most of these lines pay the 50% Section 338 duty, even under USMCA; from the EU, Malaysia and Indonesia several are exempt from Section 301.",
    "3826": "Imported biodiesel does not earn the U.S. clean fuel production credit (section 45Z), which covers only domestically produced fuel; the biodiesel mixture credit expired after 2024.",
    "3827": "Blends containing HFCs fall under the AIM Act allowance system (40 CFR part 84); blends with CFCs, halons or HCFCs under the ozone rules (40 CFR part 82).",
}
for k, v in ADCVD_TEXT["groupNotes"].items():
    GROUP_NOTES[k] = (GROUP_NOTES.get(k, "") + " " + v).strip()
for k, v in ADCVD_TEXT["groupRules"].items():
    GROUP_RULES[k] = GROUP_RULES[k] + [r for r in v if r not in GROUP_RULES[k]]
for g in te["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G[0]
    g["ruleIds"] = GROUP_RULES[g["heading"]]
    g["note"] = GROUP_NOTES.get(g["heading"])

HFC = {"3827.51", "3827.59", "3827.61", "3827.62", "3827.63", "3827.64", "3827.65", "3827.68", "3827.69"}
ODS = {"3827.11", "3827.12", "3827.13", "3827.14", "3827.20", "3827.31", "3827.32", "3827.39", "3827.40"}
PHARMA = ["3802.10", "3808.59.40", "3808.59.50", "3808.61.50", "3808.94.10", "3808.94.50", "3812.31", "3815.11", "3815.12", "3815.90.50", "3824.81",
          "3824.82", "3824.83", "3824.84", "3824.85", "3824.86", "3824.87", "3824.88", "3824.89", "3824.91", "3824.92", "3824.99.25", "3824.99.29",
          "3824.99.49", "3824.99.50", "3824.99.55", "3824.99.93", "3826.00.30", "3827.13", "3827.14", "3827.40"]
FATTY = ["3823.11", "3823.12", "3823.19.20", "3823.70.40"]
CN_EXCL = ["3815.11", "3815.19", "3808.94.50.10"]
GEN = {r["hts"]: r["effectiveGeneral"] for r in d["overview"]["rateTable"]["rows"] if r.get("htsCode10")}
for ln in te["lines"]:
    hts = ln["hts"]
    h = ln.get("heading") or hts[:4]
    sub = hts[:7]
    rules = []
    if h == "3808":
        rules = ["epa-pesticide", "fifra-registration"] + (["fda-sanitizer"] if hts.startswith("3808.94.50.80") else []) + ["dot-hazmat"]
    elif h == "3827":
        rules = ["tsca"] + (["hfc"] if sub in HFC else []) + (["ods"] if sub in ODS or sub == "3827.90" else []) + ["dot-hazmat"]
        if sub == "3827.90":
            rules = ["tsca", "dot-hazmat"]
    elif h == "3826":
        rules = ["tsca", "fuel-1090", "rfs", "fuel-excise"]
    elif h in ("3814", "3805"):
        rules = ["tsca", "dot-hazmat"]
    else:
        rules = ["tsca"]
    rules += [r for r in ADCVD_LINE_RULES(hts) if r not in rules]
    ln["ruleIds"] = rules
    levers = ["origin", "usmca"]
    if any(hts.startswith(p) for p in PHARMA):
        levers.append("pharma-use")
    if any(hts.startswith(p) for p in FATTY):
        levers.append("fatty-acid-source")
    if any(hts.startswith(p) for p in CN_EXCL):
        levers.append("china-exclusion")
    if ln.get("general", GEN.get(hts)) not in (None, "Free"):
        levers.append("fta")
    levers.append("drawback")
    if any(r.startswith("adcvd-") for r in rules):
        levers.append("adcvd-scope")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. AD/CVD rates are company-specific and change with each "
    "administrative review; check Commerce's latest notice and CBP's cash-deposit instructions before importing."
)

apply_trade(d)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("ok")
