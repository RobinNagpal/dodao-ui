"""Fill the writer TODOs of the generated Chapter 36 content file.

usage: python3 fill36.py <generated.json> <out.json>

Re-runnable: always start from the generator output (pnpm tariff:generate-chapter ... --countries CN,CA,MX,DE,PL,NO,SE,ES,CZ,AU,KR,CL).
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from fill36_src import CH36, CH98, CH99, ECFR, EXTRA_SOURCE_IDS, FR, sources_for  # noqa: E402

ECFR_AS_OF = "2026-10-08"
SUGGEST_DATE = "October 12, 2026"
TRADE = IU + "/src/tariff-data/trade/chapter-36.json"

d = json.load(open(sys.argv[1]))
trade = json.load(open(TRADE))


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M" if usd >= 1e7 else f"${usd / 1e6:.1f}M"


def pct(a, t):
    return f"{a / t * 100:.0f}%"


# ---------------------------------------------------------------- trade figures used in prose
u = d["understandIndustry"]
yr, pyr = u["latestYear"], u["priorYear"]
tot = {y["year"]: y["totalUsd"] for y in trade["totalsByYear"]}
T, P = tot[yr], tot[pyr]
peak_y, peak = max(tot.items(), key=lambda kv: kv[1])
byc = {c["country"]: c for c in trade["byCountry"]}
hc = {(r["country"], r["heading"]): r["importsUsd"] for r in trade["byHeadingCountry"]}
head = {h["heading"]: h["byYear"] for h in trade["byHeading"]}
hs6 = {h["hs6"]: h for h in trade["byHs6"]}
cn = byc["China"]
fw, fw_p = hs6["360410"]["importsUsd"], hs6["360410"]["priorImportsUsd"]
h3604 = head["3604"][str(yr)]
cn_3604 = hc[("China", "3604")]
S = dict(
    T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", peak_y=peak_y, peak=b(peak),
    cn=b(cn["importsUsd"]), cn_p=b(cn["priorImportsUsd"]), cn_chg=f"{(cn['importsUsd'] - cn['priorImportsUsd']) / cn['priorImportsUsd'] * 100:+.0f}%",
    cn_peak=b(cn["byYear"]["2022"]),
    ca=b(byc["Canada"]["importsUsd"]), mx=b(byc["Mexico"]["importsUsd"]), de=b(byc["Germany"]["importsUsd"]),
    pl=b(byc["Poland"]["importsUsd"]), no=b(byc["Norway"]["importsUsd"]), se=b(byc["Sweden"]["importsUsd"]),
    fw=b(fw), fw_p=b(fw_p), fw_share=pct(fw, T), h3604=b(h3604), cn_3604=b(cn_3604), cn_fw_share=pct(cn_3604, h3604),
    cn_share=pct(cn["importsUsd"], T),
    ca_3601=b(hc[("Canada", "3601")]), ca_3603=b(hc[("Canada", "3603")]), mx_3603=b(hc[("Mexico", "3603")]),
    mx_3602=b(hc[("Mexico", "3602")]), de_3603=b(hc[("Germany", "3603")]), pl_3602=b(hc[("Poland", "3602")]),
    no_3602=b(hc[("Norway", "3602")]), au_3601=b(hc[("Australia", "3601")]),
    es_3604=b(hc[("Spain", "3604")]), cl_3605=b(hc[("Chile", "3605")]), h3605=b(head["3605"][str(yr)]),
    h3606=b(head["3606"][str(yr)]), cn_3606=b(hc[("China", "3606")]),
    h3601=b(head["3601"][str(yr)]), h3602=b(head["3602"][str(yr)]), h3603=b(head["3603"][str(yr)]),
    det=b(hs6["360360"]["importsUsd"]), caps=b(hs6["360340"]["importsUsd"]), caps_p=b(hs6["360340"]["priorImportsUsd"]),
)
print(S)

# ---------------------------------------------------------------- chapter + root
d["chapter"]["title"] = "Explosives; pyrotechnic products; matches; pyrophoric alloys; certain combustible preparations"
d["sources"] = [
    {"label": "Harmonized Tariff Schedule of the United States", "url": "https://hts.usitc.gov/", "note": "rate table rows (2026 Revision 21)"},
    {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": f"{yr} import figures"},
]

GROUPS = {
    "3601": dict(
        label="Propellant powders",
        short="Propellants",
        blurb="Smokeless and other propellant powders: one line at 3.25%. Canada and Australia are the main suppliers. China-origin powder pays 23.25% (List 4A + the 2026 Section 301 duty).",
        examples=["propellant powder", "smokeless powder", "black powder", "gunpowder"],
    ),
    "3602": dict(
        label="Prepared explosives (dynamite, emulsions, blasting explosives)",
        short="Explosives",
        blurb="Dynamite and other high explosives for blasting, and other prepared explosives: 2 lines, both Free. Most come from Poland, Norway, Mexico and Sweden. Importers need an ATF explosives license.",
        examples=["dynamite", "blasting explosives", "emulsion explosive", "ANFO", "explosives HS code"],
    ),
    "3603": dict(
        label="Fuses, detonating cord, caps & detonators",
        short="Detonators & fuses",
        blurb="Safety fuses and detonating cord (3%), percussion caps (4.2%), detonating caps, igniters and electric detonators (0.2%): 6 lines. Mexico, Canada and Germany supply most of them.",
        examples=["detonators", "electric detonator", "blasting caps", "detonating cord", "safety fuse", "igniters", "percussion caps"],
    ),
    "3604": dict(
        label="Fireworks, flares & other pyrotechnics",
        short="Fireworks",
        blurb="Display fireworks (1.3G, 2.4%), consumer fireworks (1.4G, 5.3%) and flares, signals, party poppers and other pyrotechnics (6.5%): 4 lines. China supplies over 90%. Chinese fireworks pay 12.5% on top of the base rate.",
        examples=["fireworks", "consumer fireworks", "display fireworks", "sparklers", "firecrackers", "signal flares", "party poppers"],
    ),
    "3605": dict(
        label="Matches",
        short="Matches",
        blurb="Wooden-stem and other matches: 2 lines, both Free. White phosphorus matches cannot be imported. Chile is the largest supplier.",
        examples=["matches", "safety matches", "matchbox", "wooden matches", "book matches"],
    ),
    "3606": dict(
        label="Ferrocerium, lighter fuel & fire starters",
        short="Ferrocerium & fuels",
        blurb="Lighter-fuel refills up to 300 cm³ (Free), ferrocerium and other pyrophoric alloys (5.9%), metaldehyde fuel (Free) and fire starters, fuel tablets and other combustibles (5%): 4 lines. Ferrocerium is exempt from the 2026 Section 301 duties.",
        examples=["ferrocerium", "ferro rod", "lighter flints", "butane lighter refill", "fire starters", "fuel tablets", "metaldehyde"],
    ),
}

# ---------------------------------------------------------------- overview
o = d["overview"]
o["h1"] = "HTS Chapter 36: Explosives & Pyrotechnics — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 36 Tariff Rates: Fireworks, Explosives, Matches & Ferrocerium Import Duty | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 19 HTS Chapter 36 lines: fireworks, explosives, detonators, matches, ferrocerium and lighter fuel. The tariff on fireworks from China is 17.8% for consumer fireworks (5.3% + 12.5%), plus each country's 2026 Section 301 rate.",
    "keywords": [
        "hts chapter 36",
        "hts chapter 36 import duty rates",
        "tariff on fireworks from china",
        "fireworks import duty rates",
        "fireworks hs code",
        "hts 3604.10 import duty",
        "china tariff on pyrotechnics",
        "explosives hs code",
        "hs code for matches",
        "ferrocerium hs code",
    ],
}
o["intro"] = (
    "Chapter 36 covers propellant powders (3601), prepared explosives such as dynamite (3602), fuses, detonating cord and detonators (3603), "
    "**fireworks**, flares and other pyrotechnics (3604), matches (3605), and ferrocerium, lighter-fuel refills and fire starters (3606). "
    f"Base rates run from Free to 6.5%. The U.S. imported **{S['T']}** of these goods in {yr}; {S['h3604']} of it was heading 3604, "
    f"and **{S['cn_fw_share']} of that came from China**.\n\n"
    "**The tariff on fireworks from China is the base rate plus 12.5%:** 17.8% for consumer fireworks (Class 1.4G) and 14.9% for display "
    "fireworks (1.3G). The 12.5% is the 2026 Section 301 forced-labor duty on China (9903.05.31), in force since July 24, 2026. Fireworks "
    "are on China's Section 301 List 4B, and that duty has been suspended since December 2019. Other Chinese Chapter 36 goods also pay List 4A "
    "(+7.5%) or List 3 (+25%). Goods from the other 59 economies covered by the 2026 Section 301 actions pay 10% or 12.5%. USMCA-qualifying goods "
    "from Canada and Mexico pay no extra duty. Ferrocerium (3606.90.30) is exempt from all of these duties. The 2025 IEEPA duties, which took "
    "Chinese fireworks to as much as 150.3% in April–May 2025, ended on February 24, 2026."
)
for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["blurb"] = G["blurb"]
    g["searchExamples"] = G["examples"]
for st in o["stats"]:
    if st["label"].startswith("Lines with an extra duty"):
        st["note"] = "2026 Section 301 on 60 economies (all but ferrocerium); China also List 4A or List 3 on 15 lines; USMCA goods exempt"
o["workedExamples"] = [
    {
        "title": "A $100,000 container of consumer fireworks from China",
        "line": "3604.10.90.10",
        "body": "Consumer fireworks (Class 1.4G) have a **5.3%** base rate. China-origin goods add **12.5%** under the 2026 Section 301 action "
        "(9903.05.31), so the total is **17.8%**, or **$17,800**. Fireworks are on List 4B (9903.88.16), which has been suspended since "
        "December 15, 2019, so no List 3 or 4A duty applies. The same container paid 15.3% ($15,300) under the Section 122 surcharge from February 24 "
        "to July 23, 2026, 25.3% from November 10, 2025, 35.3% from May 14, 2025 and 150.3% from April 10 to May 13, 2025.",
    },
    {
        "title": "Display shells (Class 1.3G) from China for a July 4 show",
        "line": "3604.10.10.00",
        "body": "Display fireworks have a **2.4%** base rate. With the 12.5% Section 301 duty the total is **14.9%**: $14,900 on $100,000. "
        "Display fireworks are explosive materials, so the importer needs a federal explosives license (27 CFR 555.41) and must show it to "
        "CBP to get the goods released (27 CFR 555.108). Each item also needs a DOT classification approval (EX number) before it can be shipped.",
    },
    {
        "title": "Party poppers and signal flares from China",
        "line": "3604.90.00.00",
        "body": "Pyrotechnic articles other than fireworks have a **6.5%** base rate. Unlike fireworks, they are on List 4A (+7.5%, 9903.88.15), "
        "and they also pay the 12.5% 2026 duty. The total is **26.5%**, $2,650 on a $10,000 shipment. Getting the classification right between "
        "3604.10 and 3604.90 is worth 8.7 points on Chinese goods.",
    },
    {
        "title": "Electric detonators from Mexico",
        "line": "3603.60.00.00",
        "body": "The base rate is **0.2%**. With a USMCA claim (SPI S) the base rate is Free and the 10% Section 301 duty on Mexico does not apply "
        "(9903.05.94), so the duty is **$0**. Without a valid claim the importer pays 0.2% + 10% (9903.05.55) = **10.2%**.",
    },
]
o["tradeSnapshot"]["topCountries"] = [{"name": "China", "importsUsd": cn["importsUsd"]}, {"name": "Canada", "importsUsd": byc["Canada"]["importsUsd"]}]
o["tradeSnapshot"]["biggestLines"] = [{"hts": "3604.10", "label": "Fireworks"}, {"hts": "3602.00", "label": "Prepared explosives"}]
o["tradeSnapshot"]["source"] = f"UN Comtrade, United States imports, HS chapter 36 ({yr})"
o["tradeSnapshot"]["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
o["tradeSnapshot"]["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
o["notes"] = {
    "chapterNotes": (
        "**Note 1.** This chapter does not cover separate chemically defined compounds other than those described in note 2(a) or (b) below.\n\n"
        "**Note 2.** The expression \"articles of combustible materials\" in heading 3606 applies only to: (a) metaldehyde, hexamethylenetetramine "
        "and similar substances, put up in forms (for example, tablets, sticks or similar forms) for use as fuels; fuels with a basis of alcohol, "
        "and similar prepared fuels, in solid or semi-solid form; (b) liquid or liquefied-gas fuels in containers of a kind used for filling or "
        "refilling cigarette or similar lighters, and of a capacity not exceeding 300 cm³; and (c) resin torches, firelighters and the like."
    ),
    "additionalUsNotes": "**Note 1.** The importation of white phosphorus matches is prohibited.",
}

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 36: Explosives & Pyrotechnics — Tariff Updates"
tu["seo"] = {
    "title": "Fireworks Tariffs 2025–2026: China Rates, Section 301 & Section 122 Changes (HTS Ch. 36) | KoalaGains",
    "shortDescription": "Every tariff change for fireworks, explosives, detonators and matches since January 2025: China's IEEPA rates (up to 150.3% on fireworks), the February 24, 2026 end of IEEPA, the Section 122 surcharge, the 2026 Section 301 duties and the new ATF, DOT and CPSC rules, with Federal Register citations.",
    "keywords": [
        "tariffs on fireworks 2026",
        "tariffs on fireworks 2025",
        "fireworks tariff news",
        "current tariffs on fireworks from china",
        "section 301 fireworks list 4b",
        "consumer and display fireworks 2026 tariffs",
        "hts chapter 36 tariff updates",
    ],
}
tu["intro"] = (
    "This page compares the **2025 Basic Edition** of the tariff schedule (in force January 1, 2025) with the current **2026 Revision 21** "
    "(in force October 9, 2026). No Chapter 36 base rate changed. The extra duties changed many times.\n\n"
    "**Fireworks from China** carried no Section 301 duty at the start of 2025, because List 4B has been suspended since 2019. The IEEPA duties then "
    "added 10% (February 4, 2025), 20% (March 4), and the reciprocal tariff, which reached 125% on April 10 and fell to 10% on May 14. Consumer fireworks "
    "paid 35.3% for most of 2025 and 25.3% from November 10. The Supreme Court ended the IEEPA duties on **February 24, 2026**. From then until "
    "July 23 the **Section 122** surcharge took 10%. Since **July 24, 2026** the **2026 Section 301** forced-labor duty applies: 12.5% on China, 10% or 12.5% "
    "on 59 other economies. USMCA-qualifying goods are exempt, and so is ferrocerium (3606.90.30).\n\n"
    "Agency rules changed too. CPSC certificates for consumer fireworks and matchbooks must be filed electronically with each entry from **July 8, 2026**. "
    "DOT/PHMSA changed how fireworks are approved for transport (July 2 and September 8, 2026). ATF finalized two explosives rules on September 25, 2026."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 36 from any country: the China Section 301 lists, the 2026 Section 301 actions on 60 economies, the Brazil "
    "Section 301 action, Russia's rates in place of Column 2, and the ended IEEPA and Section 122 duties. Also covered: ATF, DOT/PHMSA and CPSC rule changes for "
    "explosives, fireworks and matches. For the rate each supplier pays, see Rates by country."
)

EX52 = "Ferrocerium (3606.90.30) is the only Chapter 36 line on the note 52(b) exemption list (9903.05.86)."
IEEPA_END = "The IEEPA duties ended February 24, 2026, and the Section 122 surcharge (10%) expired July 23, 2026."
IE = {
    "cn-section-301": dict(
        measure="Section 301: 2026 forced-labor action + 2018–2019 China lists",
        before="None (fireworks), +7.5% (List 4A) or +25% (List 3)",
        now="+12.5% (fireworks), +20% (List 4A lines) or +37.5% (lighter-fuel refills)",
        exemption=(
            "Fireworks (3604.10.10, 3604.10.90) are on List 4B (9903.88.16, U.S. note 20(t)–(u)), which has been suspended since December 15, 2019. "
            "They pay only the 12.5% 2026 duty (9903.05.31). Fourteen lines are on List 4A at 7.5% (9903.88.15, note 20(r)–(s)): propellant powders, explosives, "
            "fuses and detonators, other pyrotechnics (3604.90), matches, metaldehyde and other combustibles. Lighter-fuel refills (3606.10) are on List 3 at 25% "
            f"(9903.88.03, note 20(f)). {EX52} It is on none of the China lists, so it pays no extra duty. No Section 301 product exclusion covers a "
            "Chapter 36 line. USTR confirmed on October 7, 2026 that the China actions continue during their four-year review. " + IEEPA_END
        ),
        what="A $100,000 container of Chinese consumer fireworks pays $17,800 (5.3% + 12.5%). Chinese party poppers or flares (3604.90) pay 26.5%, detonators 20.2%, matches 20% and butane lighter refills 37.5%.",
        extra_ids=["fr-2019-18838", "fr-2019-27306", "eo-14389"],
    ),
    "ca-section-301": dict(
        exemption=f"USMCA-qualifying goods are exempt (9903.05.93). {EX52} No Chapter 36 line is on the Canada Section 338 lists (U.S. note 51). The 2025 IEEPA duty (25%, then 35% from August 1, 2025, on non-USMCA goods) ended February 24, 2026.",
        what="Canadian propellant powder, detonators and explosives with a USMCA certification pay nothing. Without one, propellant powder pays 13.25% (3.25% + 10%).",
        extra_ids=["eo-14389"],
    ),
    "mx-section-301": dict(
        exemption=f"USMCA-qualifying goods are exempt (9903.05.94). {EX52} The 2025 IEEPA duty (25% on non-USMCA goods) ended February 24, 2026.",
        what="Mexican detonators and explosives with a USMCA claim pay nothing. Without one, electric detonators pay 10.2% (0.2% + 10%).",
        extra_ids=["eo-14389"],
    ),
    "eu-section-301": dict(
        exemption=f"For EU goods the duty tops the base rate up to 10% in total; no Chapter 36 base rate reaches 10%. {EX52} The IEEPA rate (15% in total from August 7, 2025) ended February 24, 2026.",
        what="German detonators, Polish and Swedish explosives and Spanish fireworks all pay 10% in total. EU ferrocerium pays its 5.9% base rate.",
        extra_ids=["eo-14389"],
    ),
    "no-section-301": dict(
        exemption=f"{EX52} Norway has no free trade agreement with the United States, so the base rate also applies. " + IEEPA_END,
        what="Norwegian prepared explosives (3602, Free) pay 12.5%.",
        extra_ids=["eo-14389"],
    ),
    "au-section-301": dict(
        exemption=f"{EX52} An Australia FTA claim (SPI AU) removes the base rate but not the Section 301 duty. " + IEEPA_END,
        what="Australian propellant powder pays 12.5% with an FTA claim (base Free + 12.5%), 15.75% without.",
        extra_ids=["eo-14389"],
    ),
    "kr-section-301": dict(
        exemption=f"For Korean goods the duty tops the base rate up to 12.5% in total, so a KORUS claim (SPI KR) does not lower the total. {EX52} " + IEEPA_END,
        what="Korean detonators, explosives and lighter refills pay 12.5% in total. Ferrocerium is Free with a KORUS claim.",
        extra_ids=["eo-14389"],
    ),
    "cl-section-301": dict(
        exemption=f"{EX52} A Chile FTA claim (SPI CL) removes the base rate but not the Section 301 duty. " + IEEPA_END,
        what="Chilean matches (Free base) pay 12.5%.",
        extra_ids=["eo-14389"],
    ),
    "br-section-301": dict(
        exemption="Two Section 301 actions stack on goods of Brazil: 25% (9903.05.01, since July 22, 2026) and 12.5% (9903.05.27, since July 24, 2026). Ferrocerium is exempt from both (notes 50(a)(ii) and 52(b)). The 40% IEEPA duty on Brazil (August 6, 2025) and the other IEEPA duties ended February 24, 2026.",
        what="Brazilian detonating caps pay 37.7% (0.2% + 25% + 12.5%) and Brazilian fireworks 42.8%.",
        extra_ids=["eo-14323", "eo-14389"],
    ),
    "ru-section-301": dict(
        exemption="Russia pays Column 2 rates (for example 60% on propellant powders and 12.5% on fireworks). Percussion caps, detonating caps, igniters and electric detonators (3603.30–3603.60) pay 35% instead of Column 2 (9903.90.08, U.S. note 30). The 12.5% Section 301 duty (9903.05.66) applies on top of both, except on ferrocerium (note 52(b)).",
        what="Russian electric detonators pay 47.5% (35% + 12.5%). Russian ferrocerium pays its 56.7% Column 2 rate.",
        extra_ids=[],
    ),
    "other-section-301": dict(
        exemption=f"Each of the other 50 economies pays 10% or 12.5% on top of the base rate, or, for Japan and Switzerland, enough to reach 12.5% in total and, for Taiwan, 10% in total. {EX52} Countries outside the 60, such as Serbia, Bosnia and Herzegovina and Ukraine, pay only the base rate.",
        what="Fireworks from Cambodia pay 15.3% (5.3% + 10%); fireworks from Thailand, Vietnam or Hong Kong 17.8% (5.3% + 12.5%); British goods base + 10%.",
        extra_ids=["eo-14389"],
    ),
}
for x in tu["inEffect"]:
    e = IE[x["id"]]
    for k in ("measure", "before", "now"):
        if k in e:
            x[k] = e[k]
    x["exemption"] = e["exemption"]
    x["whatItMeans"] = e["what"]
    for sid in e["extra_ids"]:
        if sid not in x["sourceIds"]:
            x["sourceIds"].append(sid)

have = {s["id"] for s in tu["sources"]}
for s in sources_for(EXTRA_SOURCE_IDS):
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


base = [c for c in tu["changes"] if c["type"] == "baseRate"]
for c in base:
    c["detail"] = (
        "All 19 Chapter 36 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. No line was added, "
        "removed or renumbered. Only the footnotes that pointed to 9903.88.15 and 9903.88.03 were dropped from the lines. The List 4A and List 3 duties still "
        "apply under U.S. note 20 to Chapter 99."
    )
pend = [c for c in tu["changes"] if c["type"] == "pending"]
for c in pend:
    c["title"] = "Section 301 tariff on Nicaragua: 10% from 2027, 15% from 2028"
    c["detail"] = (
        "Products of Nicaragua that are not CAFTA-DR originating goods will pay 10% from January 1, 2027 and 15% from January 1, 2028 (9903.89.01, U.S. note 29). "
        "The rate is 0% in 2026. No Chapter 36 line is exempt."
    )
gen = {c["id"]: c for c in tu["changes"]}
s301 = gen["section-301-2026-60-economies-2026-07-24"]
s301["title"] = "2026 Section 301 tariffs on 60 economies: fireworks from China +12.5%"
s301["detail"] = (
    "USTR's forced-labor actions put 12.5% on China (9903.05.31) and 10% or 12.5% on 59 other economies (9903.05.20–9903.05.84). EU goods pay 10% in total and "
    "Japanese, Korean and Swiss goods 12.5% in total where the base rate is lower. Every Chapter 36 line is covered except ferrocerium (3606.90.30, note 52(b)). "
    "USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94), and so are goods entered under a Chapter 98 provision. "
    "Goods in a foreign-trade zone must be admitted in privileged foreign status."
)
s301["now"] = "+10% or +12.5%"
br = gen["section-301-brazil-2026-07-22"]
br["title"] = "Section 301 tariff on products of Brazil"
br["detail"] = (
    "25% on goods of Brazil (9903.05.01). Ferrocerium is the only Chapter 36 line on its exemption list (note 50(a)(ii)). From July 24 the 12.5% forced-labor "
    "duty (9903.05.27) stacks on top, so Brazilian detonators and fireworks pay 37.5% plus the base rate."
)

changes = base + pend + [s301, br] + [
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018–2019 China actions, so they did not end on their 2026 anniversaries. They stay in effect while the statutory review runs. "
       "For Chapter 36 this keeps List 4A (7.5%) and List 3 (25%) in place. List 4B, which covers fireworks, stays suspended.",
       None, None, "China", ["fr-2026-20510"]),
    ch("atf-magazine-proposals", "pending", "2026-09-25", "Proposed", "ATF proposes new explosives storage and magazine rules",
       "Two proposed rules would revise the exceptions to the locked-magazine storage requirement (including a new exception for materials about to be used or "
       "transported) and consolidate the magazine safety requirements into one section. Comments are due November 24, 2026. They are not in force.",
       None, None, "All", ["fr-2026-19692", "fr-2026-19691"]),
    ch("atf-safe-explosives", "reference", "2026-09-25", "Published", "ATF finalizes Safe Explosives Act rules and annual fire-authority notices",
       "From October 26, 2026, anyone storing explosive materials, including importers of display fireworks and commercial explosives, must send the local fire "
       "authority a written notice every 12 months and when storage stops, and keep copies for five years (27 CFR 555.201). A second final rule ends the interim status "
       "of the 2003 Safe Explosives Act rules and changes when licensees must report new responsible persons and employees.",
       None, None, "All", ["fr-2026-19694", "fr-2026-19693"]),
    ch("phmsa-fca", "reference", "2026-09-08", "Effective", "DOT: certification agencies can approve professional (1.3G) fireworks",
       "Fireworks Certification Agencies (49 CFR 173.65) could certify only consumer fireworks built to APA 87-1A. They can now apply to PHMSA to also certify "
       "display fireworks and fuses (APA 87-1B) and entertainment and technical pyrotechnics (APA 87-1C), so imported professional fireworks no longer need a "
       "PHMSA EX approval for each item.",
       None, None, "All", ["fr-2026-16111"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026. Chinese consumer fireworks went from 15.3% to 17.8% the next day under the "
       "2026 Section 301 action.",
       "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("cpsc-efiling", "reference", "2026-07-08", "Effective", "CPSC certificates must be filed electronically with each entry",
       "Importers of consumer fireworks, matchbooks and other CPSC-regulated products must file the certificate of compliance data electronically with CBP at entry "
       "(16 CFR part 1110). Goods entered from a foreign-trade zone follow from January 8, 2027.",
       None, None, "All", ["fr-2024-30826"]),
    ch("phmsa-energetic", "reference", "2026-07-02", "Effective", "DOT streamlines approval of low-hazard fireworks",
       "PHMSA simplified the classification and approval of certain low-hazard fireworks, made the PHMSA portal the only way to apply for any explosives approval, and "
       "let holders end an approval voluntarily (49 CFR 173.56, 173.64).",
       None, None, "All", ["fr-2026-10962"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until "
       "termination, so USMCA claims (SPI S) still apply to Canadian and Mexican explosives and detonators.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026, on top of the base rate. Ferrocerium (3606.90.30) was the only Chapter 36 line on the "
       "exemption list (9903.03.03), and USMCA-qualifying goods were exempt. Chinese consumer fireworks paid 15.3%, the rate during the import season for "
       "July 4, 2026.",
       None, "+10%", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "The Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs. Executive Order 14389 then ended the "
       "Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them on goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and "
       "9903.02.xx headings are still printed in Revision 21 but are not in effect.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("cn-fentanyl-10", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "Executive Order 14357 cut the IEEPA duty on products of China from 20% to 10%. Chinese consumer fireworks paid 25.3% (5.3% + 10% + 10% reciprocal). "
       "Ended February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("br-ieepa", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 added 40% on goods of Brazil, on top of the 10% reciprocal duty, including Brazilian detonators and fuses. Ended February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("eu-15", "extraDuty", "2025-08-07", "Effective", "Reciprocal rates reset; EU goods 15% in total",
       "Executive Order 14326 set new country rates. Goods of the EU paid 15% in total where the base rate was lower, so German detonators and Spanish fireworks paid "
       "15%. Ended February 24, 2026.",
       "+10%", "15% in total (EU) (ended)", "EU and others", ["eo-14326"]),
    ch("ca-35", "extraDuty", "2025-08-01", "Effective", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). USMCA-qualifying explosives and propellants stayed exempt. Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("cn-recip-10", "extraDuty", "2025-05-14", "Effective", "China reciprocal duty cut from 125% to 10%",
       "Executive Order 14298 cut the reciprocal duty on Chinese goods, including Hong Kong and Macau, to 10%. Chinese consumer fireworks paid 35.3% "
       "(5.3% + 20% + 10%) until November 9, 2025.",
       "+125%", "+10% (ended)", "China", ["eo-14298"]),
    ch("cn-recip-84", "extraDuty", "2025-04-09", "Effective", "China reciprocal duty raised to 84%",
       "Executive Order 14259 raised the China reciprocal rate set on April 2 from 34% to 84%, for goods entered from April 9, 2025, so the 34% rate never took effect. It was raised again the next day.",
       "+10%", "+84% (ended)", "China", ["eo-14259"]),
    ch("cn-recip-125", "extraDuty", "2025-04-10", "Effective", "China reciprocal duty raised to 125%",
       "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125%. With the 20% fentanyl duty, Chinese consumer fireworks paid 150.3% and display "
       "fireworks 147.4% until May 13, 2025.",
       "+84%", "+125% (ended)", "China", ["eo-14266"]),
    ch("reciprocal", "extraDuty", "2025-04-05", "Effective", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and higher country rates (9903.02.xx) on Chapter 36 goods of every country except Canada and Mexico. Ferrocerium (3606.90.30) was on "
       "the Annex II exemption list. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-fentanyl-20", "extraDuty", "2025-03-03", "Signed", "China fentanyl duty raised to 20%",
       "Executive Order 14228 raised the IEEPA duty on products of China from 10% to 20% from March 4, 2025. Ended February 24, 2026.",
       "+10%", "+20% (ended)", "China", ["eo-14228"]),
    ch("cn-fentanyl", "extraDuty", "2025-02-01", "Signed", "Additional 10% duty on products of China",
       "+10% on Chinese goods from February 4, 2025 under IEEPA. This was the first extra duty on Chinese fireworks, which List 4B had kept free of Section 301 duties. "
       "Ended February 24, 2026.",
       "None", "+10% (ended)", "China", ["eo-14195"]),
    ch("ca-mx", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada and Mexico",
       "+25% on non-USMCA goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025. USMCA-qualifying goods were exempt from March 7, 2025. Ended February 24, 2026.",
       "None", "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194"]),
    ch("cn-4a-75", "reference", "2020-02-14", "Effective", "China List 4A duty cut to 7.5%",
       "The List 4A duty (9903.88.15) fell from 15% to 7.5%. It still applies to 14 Chapter 36 lines: propellant powders, explosives, fuses and detonators, "
       "other pyrotechnics (3604.90), matches, metaldehyde and other combustibles.",
       "+15%", "+7.5%", "China", ["fr-2020-00904"]),
    ch("cn-4b-suspended", "reference", "2019-12-18", "Published", "List 4B suspended: no Section 301 duty on Chinese fireworks",
       "USTR suspended indefinitely the List 4B duty (9903.88.16) that was to start on December 15, 2019. Fireworks (3604.10.10 and 3604.10.90) are on List 4B, "
       "so they never paid a China Section 301 duty until the 2026 forced-labor action.",
       None, "Suspended", "China", ["fr-2019-27306", "fr-2019-17865", "fr-2019-18838"]),
]
seen = set()
uniq = []
for c in changes:
    if c["id"] not in seen:
        uniq.append(c)
        seen.add(c["id"])
uniq.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = uniq
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "19 of 19 lines", "note": "Free to 6.5%"},
    {"label": "Chinese consumer fireworks", "value": "17.8%", "note": "5.3% + 12.5% Section 301 (since July 24, 2026)"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]

# ---------------------------------------------------------------- understandIndustry
u["h1"] = "HTS Chapter 36: Explosives & Pyrotechnics — U.S. Import Statistics"
u["seo"] = {
    "title": "U.S. Fireworks & Explosives Imports by Country — How Much Comes From China (HTS Ch. 36) | KoalaGains",
    "shortDescription": f"Where U.S. imports of fireworks, explosives, detonators and matches come from, 2020–{yr}: {S['T']} in {yr}. China supplied {S['cn_fw_share']} of fireworks and other pyrotechnics; Canada, Mexico and Europe supply explosives and detonators. From UN Comtrade.",
    "keywords": [
        "fireworks imported from china",
        "what percentage of fireworks are made in china",
        "where do most fireworks come from",
        "fireworks importers usa",
        "commercial explosives import statistics",
        "hts chapter 36 import statistics",
    ],
}
u["valueBasis"] = trade["valueBasis"]
u["byYearPartners"] = ["China", "Canada"]
u["byYearCaption"] = f"U.S. imports of Chapter 36 goods each year, split into the two largest suppliers in {yr} (China and Canada) and everyone else."
for st in u["stats"]:
    if st["label"].startswith("Top 2 share"):
        st["label"] = "China + Canada share"
    if st["label"] == "Largest product":
        st["note"] = "Fireworks (3604.10)"
u["why"] = (
    f"U.S. imports of Chapter 36 goods were **{S['T']} in {yr}**, {S['chg']} from {S['P']} in {pyr} and below the {S['peak_y']} peak of {S['peak']}. "
    f"The chapter is two trades. **Fireworks** ({S['fw']} in {yr}, down from {S['fw_p']}) come almost entirely from **China**: {S['cn_3604']} of the {S['h3604']} "
    f"of fireworks and other pyrotechnics, or {S['cn_fw_share']}. Spain was a distant second at {S['es_3604']}. China's Chapter 36 shipments fell to {S['cn']} "
    f"({S['cn_chg']}) in {yr}, the year IEEPA duties of 10% to 145% applied to them, after peaking at {S['cn_peak']} in 2022.\n\n"
    f"**Explosives and blasting accessories** come from North America and Europe. Canada ({S['ca']}) ships mainly propellant powders ({S['ca_3601']}) and "
    f"detonators and fuses ({S['ca_3603']}). Mexico ({S['mx']}) ships detonators ({S['mx_3603']}) and explosives ({S['mx_3602']}). Germany ({S['de']}) is mostly "
    f"detonators ({S['de_3603']}). Prepared explosives come from Poland ({S['pl_3602']}), Norway ({S['no_3602']}), Mexico and Sweden. Electric detonators "
    f"({S['det']}) were the largest blasting line. Detonating caps fell to {S['caps']} from {S['caps_p']}. Australia shipped {S['au_3601']} of propellant powders.\n\n"
    f"Matches ({S['h3605']}) come mostly from Chile ({S['cl_3605']}), China and India. Ferrocerium, lighter-fuel refills and fire starters ({S['h3606']}) come "
    f"mostly from China ({S['cn_3606']}).\n\n"
    f"{yr} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
)
u["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Comtrade reports six-digit HS codes; the U.S. 10-digit split of fireworks into display and consumer fireworks is not shown here."
u["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 36: Explosives & Pyrotechnics — Tariff Rates by Country"
ia["seo"] = {
    "title": "Tariff on Fireworks & Explosives by Country — China, Canada, Mexico, EU (HTS Ch. 36) | KoalaGains",
    "shortDescription": "Total U.S. tariff on fireworks, explosives, detonators, matches and ferrocerium for each main supplier. China fireworks 17.8%, Canada and Mexico Free with USMCA, EU 10%, Norway, Australia, Korea and Chile 12.5%.",
    "keywords": [
        "chinese fireworks import duty rates",
        "tariff on fireworks from china",
        "section 301 tariffs on pyrotechnics",
        "usmca explosives tariff",
        "mexico explosives customs duty",
        "industrial detonators customs duty",
        "fireworks tariff by country",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
    "Since July 24, 2026 the **2026 Section 301 forced-labor action** reaches almost every Chapter 36 line from 60 economies. "
    "**China** pays 12.5% on fireworks and more on everything else: List 4A (+7.5%) and List 3 (+25%) still apply, but List 4B, which covers fireworks, is "
    "suspended. **Canada and Mexico** pay nothing with a USMCA claim. **EU** goods pay 10% in total, and Norway, Australia, Korea and Chile 12.5%. Ferrocerium "
    "(3606.90.30) is exempt everywhere.\n\n"
    "The table covers tariffs only. Explosives and display fireworks also need an ATF license, every Class 1 item needs DOT approval, and consumer "
    "fireworks must meet CPSC rules (see Import documents)."
)
for g in ia["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["shortLabel"] = G["short"]
EU_LBL = "EU: 10% in total (9903.05.39), because the base rate is below 10% on every line. Ferrocerium pays its 5.9% base rate (note 52(b)). The IEEPA rate (15% in total) ended February 24, 2026."
labels = {
    "China": ("Base rate + 12.5% (9903.05.31) on every line except ferrocerium. Plus List 4A (+7.5%, 9903.88.15) on 14 lines, or List 3 (+25%, 9903.88.03) on lighter-fuel refills. "
              "Fireworks (3604.10) are on List 4B, which is suspended, so they pay base + 12.5%: 17.8% consumer, 14.9% display. Ferrocerium pays 5.9%. IEEPA duties ended February 24, 2026.",
              ["fr-2026-15181", "fr-2019-17865", "fr-2019-27306", "fr-2020-00904", "fr-2019-09681", "fr-2026-20510", "eo-14389", "hts-now"]),
    "Canada": ("Free with a USMCA claim (9903.05.93). Otherwise base rate + 10% (9903.05.29); ferrocerium exempt (note 52(b)). No Chapter 36 line is on the Section 338 lists. The 2025 IEEPA duty (35%) ended February 24, 2026.",
               ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Mexico": ("Free with a USMCA claim (9903.05.94). Otherwise base rate + 10% (9903.05.55); ferrocerium exempt (note 52(b)). The 2025 IEEPA duty (25%) ended February 24, 2026.",
               ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Norway": ("Base rate + 12.5% (9903.05.60); ferrocerium exempt (note 52(b)). No FTA. The IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Australia": ("FTA claim (AU) removes the base rate; + 12.5% (9903.05.23) still applies. Ferrocerium is Free. The IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "South Korea": ("12.5% in total (9903.05.71) on every line except ferrocerium, which is Free with a KORUS claim (KR). The IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Chile": ("FTA claim (CL) removes the base rate; + 12.5% (9903.05.30) still applies. Ferrocerium is Free. The IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Any other country": ("Base rate only for countries outside the 60 Section 301 economies (for example Serbia, Bosnia and Herzegovina, Ukraine). The other economies pay 10% or 12.5%; Brazil pays 37.5% (25% + 12.5%); Russia pays Column 2 rates (35% on detonators) + 12.5%. Ferrocerium is exempt everywhere.",
                          ["fr-2026-15181", "fr-2026-14542", "procl-10420", "hts-now"]),
}
for c in ia["countries"]:
    if c["country"] in labels:
        c["rule"]["label"], c["rule"]["sourceIds"] = labels[c["country"]]
    else:
        c["rule"]["label"] = EU_LBL
        c["rule"]["sourceIds"] = ["fr-2026-15181", "eo-14389", "hts-now"]
have = {s["id"] for s in ia["sources"]}
pool = {s["id"]: s for s in tu["sources"]}
for s in d["tariffUpdates"]["sources"]:
    pool.setdefault(s["id"], s)
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in have:
            ia["sources"].append(pool[sid])
            have.add(sid)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "China's List 4B duty (9903.88.16), which covers fireworks, is suspended and not applied.",
    "Agency rules decide whether goods can enter at all and are not in the totals: ATF licensing for explosives and display fireworks (27 CFR part 555), DOT approval for Class 1 explosives (49 CFR 173.56), CPSC rules for consumer fireworks (16 CFR part 1507), and the ban on white phosphorus matches.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III, and the Section 122 exemption list (9903.03.03), in the 2026 Revision 21. "
    "Ferrocerium (3606.90.30) is the only Chapter 36 line on the 2026 Section 301 exemption list (note 52(b), 9903.05.86), the Brazil exemption list "
    "(note 50(a)(ii), 9903.05.03), the Section 122 list and the old reciprocal-tariff Annex II. No Chapter 36 line is on the Canada Section 338 lists (note 51). "
    "On the China lists, 3606.10 is on List 3 (note 20(f)), 14 lines are on List 4A (note 20(s)) and fireworks (3604.10.10, 3604.10.90) are on the suspended "
    "List 4B (note 20(u)). No Section 301 product exclusion names a Chapter 36 line. The Russia note 30 list covers 3603.30–3603.60."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "HTS Chapter 36: Explosives & Pyrotechnics — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "How to Import Fireworks & Explosives: ATF License, DOT EX Number, CPSC Rules & Lower Duty (HTS Ch. 36) | KoalaGains",
    "shortDescription": "What you need to import fireworks, explosives, detonators and matches into the U.S.: ATF explosives license (27 CFR 555), DOT EX approval or FCA certification, CPSC consumer-fireworks rules and eFiled certificates, and legal ways to pay less duty.",
    "keywords": [
        "can you import fireworks from china",
        "how to import fireworks",
        "fireworks import license",
        "fireworks import permit",
        "explosives import license",
        "dot ex number fireworks",
        "usmca explosives tariff",
    ],
}
te["intro"] = (
    "Chapter 36 goods are some of the most regulated imports, and **the paperwork depends on the hazard class**. **Consumer fireworks (1.4G)** are outside ATF's "
    "explosives rules (27 CFR 555.141(a)(7)), but they must meet CPSC's fireworks rules, carry a certificate filed with the entry, and have DOT transport approval. "
    "**Display fireworks (1.3G), explosives, detonators and black powder** are explosive materials: only a licensed importer or permittee can get them released "
    "from CBP (27 CFR 555.108), and they must be marked, recorded and stored in approved magazines.\n\n"
    "On duty, the biggest lever is **origin**: USMCA-qualifying goods from Canada and Mexico pay nothing. Next is **correct classification**: on Chinese goods, "
    "fireworks (3604.10) pay 17.8% but other pyrotechnics (3604.90) pay 26.5%. Each rule and lever below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF


def cit(label, url):
    return {"label": label, "url": url}


te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on Canadian and Mexican explosives, detonators and propellants",
        "saves": "The base rate (up to 6.5%) plus the 10% Section 301 duty on Canada (9903.05.29) or Mexico (9903.05.55): on $1 million of non-originating Canadian propellant powder, $132,500",
        "appliesTo": "All lines, for goods that originate under the USMCA",
        "document": "A USMCA certification of origin from the importer, exporter or producer, with the minimum data elements. It need not follow a set form, and CBP can ask for it.",
        "caveat": "The goods must meet the USMCA rules of origin. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            cit("19 CFR 182.12", ECFR + "title-19/section-182.12"),
            cit("HTSUS Ch. 99, 9903.05.93 and 9903.05.94", CH99),
            cit("USTR statement on the USMCA joint review (July 1, 2026)", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
        ],
    },
    {
        "id": "classify",
        "title": "Get the classification right, and ask CBP for a binding ruling when in doubt",
        "saves": "On Chinese goods, fireworks (3604.10) pay 17.8% but other pyrotechnic articles (3604.90) pay 26.5%: 8.7 points. Display fireworks (1.3G, 2.4%) and consumer fireworks (1.4G, 5.3%) also differ.",
        "appliesTo": "Fireworks, flares, party poppers and other pyrotechnics (3604); ferrocerium, fuels and fire starters (3606)",
        "document": "A binding ruling request to CBP (19 CFR part 177) with the product's description, composition and DOT hazard classification. The 3604.10 lines follow the DOT class (1.3G or 1.4G) in their text.",
        "caveat": "Classification must follow the product, not the duty. A ruling binds CBP only for the product described. Misclassification can bring penalties under 19 U.S.C. 1592.",
        "citations": [
            cit("19 CFR part 177", ECFR + "title-19/part-177"),
            cit("HTSUS Chapter 36", CH36),
        ],
    },
    {
        "id": "fta",
        "title": "Claim a free trade agreement where the line offers one",
        "saves": "The base rate (up to 6.5%) on goods from FTA partners. The Section 301 duty stays: Australian and Chilean goods still pay 12.5%, and Korean goods 12.5% in total.",
        "appliesTo": "The 13 dutiable lines with a Free special rate (AU, BH, CL, CO, D, E, IL, JO, KR, MA, OM, P, PA, PE, S, SG)",
        "document": "The origin documentation each agreement requires, with the SPI code on the entry.",
        "caveat": "GSP (A, A+, A*) has lapsed and gives no benefit. An FTA claim never removes the Section 301 duty.",
        "citations": [
            cit("HTSUS General Notes and Chapter 36 (special rates)", CH36),
            cit("19 CFR part 10 (FTA claims)", ECFR + "title-19/part-10"),
        ],
    },
    {
        "id": "us-goods-returned",
        "title": "Return U.S.-made goods duty-free under Chapter 98",
        "saves": "All duty, including the 2026 Section 301 duty: U.S. goods returned without being advanced in value or improved in condition abroad enter Free under 9801.00.10",
        "appliesTo": "All lines, for products of the United States sent back (for example unused U.S.-made explosives or display fireworks returned from an export customer)",
        "document": "Entry under 9801.00.10 with the documentation in 19 CFR 10.1 (declaration and proof of U.S. origin and export).",
        "caveat": "The 2026 Section 301 duties do not apply to goods properly entered under a Chapter 98 provision (U.S. note 52(a)). ATF and DOT rules still apply to the returned goods.",
        "provisions": [
            {"code": "9801.00.10", "rate": "Free", "text": "Products of the United States returned after export without having been advanced in value or improved in condition abroad"},
        ],
        "citations": [
            cit("HTSUS Chapter 98, subchapter I", CH98),
            cit("19 CFR 10.1", ECFR + "title-19/section-10.1"),
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on goods that are exported or destroyed",
        "saves": "Up to 99% of the ordinary customs duties paid, when imported fireworks or explosives are exported unused or used to make exported goods",
        "appliesTo": "All dutiable lines",
        "document": "A drawback claim filed with CBP, with the import entry and proof of export or destruction (19 CFR part 191).",
        "caveat": "Claims must be filed within the time limits of 19 CFR part 191. 19 CFR 191.3 lists which duties, taxes and fees can and cannot be refunded.",
        "citations": [
            cit("19 CFR part 191", ECFR + "title-19/part-191"),
            cit("19 CFR 191.3", ECFR + "title-19/section-191.3"),
        ],
    },
    {
        "id": "ftz",
        "title": "Defer duty in a foreign-trade zone (it no longer lowers the Section 301 rate)",
        "saves": "Cash-flow only for the Section 301 duty, which is due when goods leave the zone for the U.S. market. Goods re-exported from the zone pay no U.S. duty.",
        "appliesTo": "All lines",
        "document": "FTZ admission (CBP Form 214). Goods subject to the 2026 Section 301 duties must be admitted in privileged foreign status (19 CFR 146.41), which locks in the rate at admission.",
        "caveat": "Explosives and display fireworks in a zone still fall under ATF storage rules (27 CFR part 555, subpart K). CPSC eFiling for goods entered from an FTZ applies from January 8, 2027.",
        "citations": [
            cit("19 CFR 146.41", ECFR + "title-19/section-146.41"),
            cit("USTR notice of Section 301 actions (91 FR 47318)", FR + "2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies"),
        ],
    },
]
te["rules"] = [
    {"id": "atf-license", "agency": "ATF / CBP",
     "title": "Explosives, display fireworks, detonators and black powder: only a licensed importer or permittee can get them released from customs, by showing a certified copy of the license",
     "citations": [cit("27 CFR 555.41", ECFR + "title-27/section-555.41"), cit("27 CFR 555.108", ECFR + "title-27/section-555.108")]},
    {"id": "atf-marking", "agency": "ATF",
     "title": "Imported explosive materials: the licensed importer must mark them with its name, city and state and the place, date and shift of manufacture within 15 days of release, and keep import records",
     "citations": [cit("27 CFR 555.109", ECFR + "title-27/section-555.109"), cit("27 CFR 555.122", ECFR + "title-27/section-555.122")]},
    {"id": "atf-storage", "agency": "ATF",
     "title": "Storage in approved magazines, with notice to the local fire authority; from October 26, 2026 a written notice every 12 months too",
     "citations": [cit("27 CFR 555.201", ECFR + "title-27/section-555.201"), cit("27 CFR 555.221 (display fireworks)", ECFR + "title-27/section-555.221"),
                   cit("Final rule, 91 FR 60803 (Sept. 25, 2026)", FR + "2026/09/25/2026-19694/annual-notices-on-explosive-materials-storage-facilities-to-local-fire-authority")]},
    {"id": "atf-exemptions", "agency": "ATF",
     "title": "Outside ATF's explosives rules: consumer fireworks (UN0336, UN0337, UN0431, UN0432), small arms ammunition and its components, and up to 50 lb of black powder for antique firearms (ATF F 5400.3)",
     "citations": [cit("27 CFR 555.141", ECFR + "title-27/section-555.141"), cit("27 CFR 555.108(b)", ECFR + "title-27/section-555.108")]},
    {"id": "dot-approval", "agency": "DOT (PHMSA)",
     "title": "Every Class 1 explosive needs a PHMSA classification approval (EX number) before transport; packages are marked with it. Unapproved explosives are forbidden.",
     "citations": [cit("49 CFR 173.54", ECFR + "title-49/section-173.54"), cit("49 CFR 173.56", ECFR + "title-49/section-173.56"), cit("49 CFR 172.320", ECFR + "title-49/section-172.320")]},
    {"id": "dot-fireworks", "agency": "DOT (PHMSA)",
     "title": "Fireworks built to APA 87-1 can be approved through PHMSA's fireworks route or certified by a Fireworks Certification Agency; from September 8, 2026 FCAs can also certify display (1.3G) fireworks and fuses",
     "citations": [cit("49 CFR 173.64", ECFR + "title-49/section-173.64"), cit("49 CFR 173.65", ECFR + "title-49/section-173.65"),
                   cit("Final rule, 91 FR 51098 (Aug. 7, 2026)", FR + "2026/08/07/2026-16111/hazardous-materials-allowing-fireworks-certification-agencies-fcas-to-approve-professional-fireworks")]},
    {"id": "cpsc-fireworks", "agency": "CPSC",
     "title": "Consumer fireworks: chemical, construction and labeling requirements; fireworks whose bang comes from more than 2 grains (130 mg) of powder, such as cherry bombs and M-80s, and devices that fail part 1507 are banned",
     "citations": [cit("16 CFR part 1507", ECFR + "title-16/part-1507"), cit("16 CFR 1500.17", ECFR + "title-16/section-1500.17"), cit("16 CFR 1500.14", ECFR + "title-16/section-1500.14")]},
    {"id": "cpsc-certificate", "agency": "CPSC / CBP",
     "title": "Certificate of compliance for CPSC-regulated products (consumer fireworks, matchbooks), filed electronically with the entry from July 8, 2026",
     "citations": [cit("16 CFR part 1110", ECFR + "title-16/part-1110"), cit("Final rule, 90 FR 1800 (Jan. 8, 2025)", FR + "2025/01/08/2024-30826/certificates-of-compliance")]},
    {"id": "cpsc-matchbooks", "agency": "CPSC",
     "title": "Matchbooks: safety standard for construction and labeling",
     "citations": [cit("16 CFR part 1202", ECFR + "title-16/part-1202")]},
    {"id": "white-phosphorus", "agency": "CBP",
     "title": "Matches made with white phosphorus cannot be imported",
     "citations": [cit("HTSUS Ch. 36, additional U.S. note 1", CH36)]},
    {"id": "tsca", "agency": "EPA / CBP",
     "title": "Chemical substances and mixtures (propellant powders, bulk explosives, lighter fuel, fuel tablets): TSCA import certification at entry",
     "citations": [cit("19 CFR 12.121", ECFR + "title-19/section-12.121")]},
    {"id": "dot-hazmat", "agency": "DOT (PHMSA)",
     "title": "Matches, lighter-fuel refills, ferrocerium and fire starters can be hazardous materials in transport: check the Hazardous Materials Table for class, packaging and labels",
     "citations": [cit("49 CFR 172.101", ECFR + "title-49/section-172.101")]},
]
EXPL = ["atf-license", "atf-marking", "atf-storage", "atf-exemptions", "dot-approval"]
GROUP_RULES = {
    "3601": (EXPL + ["tsca"], "Propellant powders are explosive materials under ATF rules unless an exemption applies: small arms ammunition components, or up to 50 lb of commercial black powder for antique firearms. All need DOT approval to ship."),
    "3602": (EXPL + ["tsca"], "Dynamite, emulsions and other blasting explosives can be released only to a licensed importer or permittee. They must carry the importer's marks and be stored in approved magazines."),
    "3603": (EXPL, "Detonators, caps, igniters, fuses and detonating cord are explosive materials. Safety fuses and percussion caps for antique firearms fall under the black-powder exemption in 27 CFR 555.141(b)."),
    "3604": (["atf-license", "atf-exemptions", "atf-storage", "dot-approval", "dot-fireworks", "cpsc-fireworks", "cpsc-certificate"],
             "Consumer fireworks (1.4G) are exempt from ATF's explosives rules but must meet CPSC's rules and need an eFiled certificate. Display fireworks (1.3G) need an ATF license and magazine storage. Both need DOT approval or FCA certification."),
    "3605": (["cpsc-matchbooks", "cpsc-certificate", "white-phosphorus", "dot-hazmat"], "White phosphorus matches are banned. Matchbooks must meet CPSC's safety standard and carry a certificate."),
    "3606": (["tsca", "dot-hazmat"], "Lighter-fuel refills, ferrocerium and fire starters can be hazardous materials in transport. Fuels and metaldehyde need a TSCA certification."),
}
for g in te["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["ruleIds"], g["note"] = GROUP_RULES[g["heading"]]
FTA_FREE = {"3601.00.00.00", "3603.10.00.00", "3603.20.00.00", "3603.30.00.00", "3603.40.00.00", "3603.50.00.00", "3603.60.00.00",
            "3604.10.10.00", "3604.10.90.10", "3604.10.90.50", "3604.90.00.00", "3606.90.30.00", "3606.90.80.00"}
LINE_RULES = {
    "3604.10.10.00": ["atf-license", "atf-storage", "dot-approval", "dot-fireworks"],
    "3604.10.90.10": ["atf-exemptions", "dot-approval", "dot-fireworks", "cpsc-fireworks", "cpsc-certificate"],
    "3604.10.90.50": ["atf-license", "atf-exemptions", "dot-approval", "dot-fireworks", "cpsc-fireworks", "cpsc-certificate"],
    "3604.90.00.00": ["atf-exemptions", "dot-approval", "cpsc-fireworks", "cpsc-certificate"],
    "3605.00.00.30": ["cpsc-matchbooks", "white-phosphorus", "dot-hazmat"],
    "3605.00.00.60": ["cpsc-matchbooks", "cpsc-certificate", "white-phosphorus", "dot-hazmat"],
    "3606.10.00.00": ["tsca", "dot-hazmat"],
    "3606.90.30.00": ["dot-hazmat"],
    "3606.90.40.00": ["tsca", "dot-hazmat"],
    "3606.90.80.00": ["tsca", "dot-hazmat"],
}
for ln in te["lines"]:
    h = ln["heading"]
    ln["ruleIds"] = LINE_RULES.get(ln["hts"], GROUP_RULES[h][0])
    levers = ["usmca"]
    if ln["hts"] in FTA_FREE:
        levers.append("fta")
    if h in ("3604", "3606"):
        levers.append("classify")
    levers += ["us-goods-returned", "drawback", "ftz"]
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations. It is not legal advice. Explosives and fireworks rules also exist at state and local level, "
    "and carriers set their own limits. Check ATF, PHMSA and CPSC guidance and get a CBP ruling before importing."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 36: Explosives & Pyrotechnics — Tariff FAQ"
fc["seo"] = {
    "title": "Fireworks Tariff FAQ: Tariff on Fireworks From China, HS Code, Can You Import Fireworks? (HTS Ch. 36) | KoalaGains",
    "shortDescription": "Answers to what people search about fireworks and explosives tariffs: the tariff on fireworks from China, fireworks tariffs in 2025 and 2026, the fireworks HS code, how much comes from China, and what you need to import fireworks, matches and explosives.",
    "keywords": [
        "tariff on fireworks from china",
        "is there a tariff on fireworks",
        "fireworks tariffs 2026",
        "fireworks tariff exemption",
        "fireworks hs code",
        "can you import fireworks from china",
        "fireworks import license",
        "what percentage of fireworks are made in china",
        "hs code for matches",
        "hs code for explosives",
    ],
}
fc["intro"] = "Straight answers to the most-searched questions about U.S. tariffs and import rules for fireworks, explosives, matches and ferrocerium. Each answer links to the page with the full detail."
fc["keyTakeaways"] = [
    "Fireworks from China pay the base rate plus 12.5%: 17.8% for consumer fireworks and 14.9% for display fireworks. China's List 4B duty on fireworks has been suspended since 2019.",
    "The 2025 IEEPA duties (up to 150.3% on Chinese fireworks in April–May 2025) ended February 24, 2026. The 10% Section 122 surcharge ran until July 23, 2026, and the 2026 Section 301 duties began July 24.",
    "USMCA-qualifying explosives and detonators from Canada and Mexico pay nothing. EU goods pay 10% in total and most other suppliers 10% or 12.5%. Ferrocerium is exempt from every extra duty.",
    "Importing is regulated by hazard class: ATF licenses for explosives and display fireworks, DOT EX approval for every Class 1 item, CPSC rules and eFiled certificates for consumer fireworks.",
]
fc["questionSource"] = f"Google search suggestions, collected {SUGGEST_DATE}"
fc["faqs"] = [
    dict(id="china-fireworks", question="Is there a tariff on fireworks from China?",
         searchedAs=["tariff on fireworks from china", "is there a tariff on fireworks from china", "are there tariffs on fireworks from china", "current tariffs on fireworks from china", "tariff on chinese fireworks", "china fireworks tariffs"],
         answer="Yes. Chinese fireworks pay the base rate plus 12.5% under the 2026 Section 301 forced-labor action (9903.05.31), in force since July 24, 2026. That is 17.8% for consumer fireworks (3604.10.90, 5.3% base) and 14.9% for display fireworks (3604.10.10, 2.4% base). Fireworks are on China's Section 301 List 4B, which has been suspended since December 2019, so no List 3 or 4A duty applies. Other Chinese pyrotechnics such as party poppers and flares (3604.90) also pay List 4A and total 26.5%.",
         link="industry-areas"),
    dict(id="fireworks-2026", question="What are the fireworks tariffs in 2026?",
         searchedAs=["tariffs on fireworks 2026", "fireworks tariffs 2026", "current tariff on fireworks", "current fireworks tariffs", "fireworks tariff news"],
         answer="For Chinese consumer fireworks: 25.3% until February 23, 2026 (IEEPA), 15.3% from February 24 to July 23 under the 10% Section 122 surcharge, and 17.8% since July 24 under the 2026 Section 301 action. Fireworks from the EU pay 10% in total, and from most other Section 301 economies the base rate plus 10% or 12.5%. USMCA-qualifying fireworks from Mexico or Canada pay nothing.",
         link="tariff-updates"),
    dict(id="fireworks-2025", question="What were the tariffs on fireworks in 2025?",
         searchedAs=["tariffs on fireworks 2025", "fireworks tariffs 2025", "tariff impact on fireworks"],
         answer="Chinese consumer fireworks paid the 5.3% base rate plus IEEPA duties: 15.3% from February 4, 25.3% from March 4 and 35.3% from April 5. The reciprocal duty on China then rose to 84% on April 9 and 125% on April 10, so they paid 150.3% until May 13. They paid 35.3% again from May 14 and 25.3% from November 10, 2025. All IEEPA duties ended February 24, 2026.",
         link="tariff-updates"),
    dict(id="exempt", question="Are fireworks exempt from tariffs?",
         searchedAs=["fireworks tariff exemption", "is there a tariff on fireworks", "are fireworks tariffed", "do fireworks have tariffs"],
         answer="No. Fireworks have a 2.4% (display) or 5.3% (consumer) base rate. They are not on the 2026 Section 301 exemption list (note 52(b)), so goods of China and the other 59 covered economies pay 10% or 12.5% more. Their only relief is that China's List 4B duty has been suspended since 2019. USMCA-qualifying fireworks from Canada or Mexico pay no duty. In Chapter 36, only ferrocerium is on the exemption lists.",
         link="tariff-updates"),
    dict(id="july-4-prices", question="Do tariffs make July 4th fireworks more expensive?",
         searchedAs=["fireworks prices 2026", "fireworks prices going up", "are fireworks more expensive this year"],
         answer="We don't track retail prices, only the import tariff. Chinese consumer fireworks imported for July 4, 2026 (February 24 to July 23) paid 15.3%: the 5.3% base rate plus the 10% Section 122 surcharge. That compares with 35.3% for most of the 2025 season and 150.3% in April–May 2025. Since July 24, 2026 the rate is 17.8%, so fireworks for July 4, 2027 face 17.8% unless the rules change.",
         link="tariff-updates"),
    dict(id="made-in-china", question="What percentage of fireworks are made in China?",
         searchedAs=["what percentage of fireworks are made in china", "are most fireworks made in china", "are all fireworks made in china", "where do most fireworks come from", "fireworks imported from china"],
         answer=f"Of U.S. imports of fireworks and other pyrotechnics (heading 3604) in {yr}, {S['cn_fw_share']} by value came from China: {S['cn_3604']} of {S['h3604']}. Spain, Germany, Cambodia and Thailand shipped most of the rest. These are import figures from UN Comtrade; they do not count fireworks made in the United States.",
         link="understand-industry"),
    dict(id="hs-fireworks", question="What is the HS code for fireworks?",
         searchedAs=["fireworks hs code", "hs code for fireworks", "pyrotechnics hs code", "firecrackers hs code", "hs code 3604", "hs code 3604.90"],
         answer="3604.10 is fireworks. In the U.S. schedule, display or special fireworks (Class 1.3G) are 3604.10.10.00 (2.4%), consumer fireworks (Class 1.4G) 3604.10.90.10 and other fireworks 3604.10.90.50 (5.3%). Signal flares, rain rockets, fog signals, party poppers and other pyrotechnic articles are 3604.90.00.00 (6.5%). Firecrackers are fireworks too, but CPSC bans consumer fireworks whose bang comes from more than 2 grains (130 mg) of powder.",
         link=""),
    dict(id="can-import", question="Can you import fireworks from China?",
         searchedAs=["can you import fireworks from china", "can i import fireworks from china", "how to import fireworks from china", "can you import fireworks into us", "how to import consumer fireworks", "how to import fireworks"],
         answer="Yes, but the paperwork is strict. Every firework needs DOT transport approval: a PHMSA EX number or Fireworks Certification Agency certification (49 CFR 173.56, 173.64, 173.65). Consumer fireworks must meet CPSC's rules (16 CFR part 1507), and from July 8, 2026 their certificate of compliance must be filed electronically with the entry. Display fireworks are explosives under ATF rules, so the importer needs an ATF license. State and local laws also limit who may sell or use fireworks.",
         link="tariff-engineering"),
    dict(id="license", question="Do you need a license to import fireworks or explosives?",
         searchedAs=["fireworks import license", "fireworks import permit", "how to get a fireworks import license", "explosives import license", "explosives import permit", "import explosives"],
         answer="For explosives, detonators, black powder and display (1.3G) fireworks, yes: a federal explosives importer license or user permit from ATF (27 CFR 555.41). CBP releases the goods only on a certified copy (27 CFR 555.108). Consumer (1.4G) fireworks are exempt from ATF's explosives rules (27 CFR 555.141(a)(7)), but they still need DOT approval and CPSC compliance. ATF's separate import permit (Form 6) applies to items on the U.S. Munitions Import List (27 CFR 447.41).",
         link="tariff-engineering"),
    dict(id="hs-explosives", question="What is the HS code for explosives and detonators?",
         searchedAs=["hs code for explosives", "explosives hs code", "detonators hs code"],
         answer="Propellant powders are 3601.00 (3.25%). Prepared explosives are 3602.00: dynamite and other blasting explosives 3602.00.00.30, other 3602.00.00.60 (both Free). Heading 3603 covers safety fuses (3603.10, 3%), detonating cords (3603.20, 3%), percussion caps (3603.30, 4.2%), detonating caps (3603.40), igniters (3603.50) and electric detonators (3603.60), all 0.2%. Ammunition is in Chapter 93, not here.",
         link=""),
    dict(id="hs-matches", question="What is the HS code for matches?",
         searchedAs=["hs code for matches", "hs code matches", "hs code for safety matches", "matchbox hs code"],
         answer="3605.00: matches with natural wood stems are 3605.00.00.30 and other matches (such as paper book matches) 3605.00.00.60. Both are Free under the general rate. Chinese matches pay 20% (List 4A 7.5% + 12.5%), and matches from the other Section 301 economies 10% or 12.5%. White phosphorus matches cannot be imported, and matchbooks must meet CPSC's safety standard (16 CFR part 1202).",
         link=""),
    dict(id="hs-3606", question="What is the HS code for lighter gas refills, ferrocerium and fire starters?",
         searchedAs=["lighter gas refill hs code", "hs code 3606", "hs code 3606.10", "hs code 3606.90"],
         answer="Heading 3606. Liquid or liquefied-gas fuel in containers for filling lighters, up to 300 cm³, is 3606.10.00 (Free; Chinese refills pay 37.5%). Ferrocerium and other pyrophoric alloys (fire-steel rods, lighter flints) are 3606.90.30 (5.9%, exempt from the Section 301 duties). Metaldehyde fuel is 3606.90.40 (Free), and fire starters, fuel tablets and resin torches 3606.90.80 (5%). Lighters themselves are in Chapter 96.",
         link=""),
]

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("ok")
