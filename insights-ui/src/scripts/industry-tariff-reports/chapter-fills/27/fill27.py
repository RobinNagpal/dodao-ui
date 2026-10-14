"""Fill the writer TODOs of the generated Chapter 27 content file.

usage: python3 fill27.py <generated.json> <out.json>
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from fill27_static import EXTRA_SOURCES, EXCISE_SF_IDS, CH27, CH99, ECFR, FR, GN, IRS_I6627, IRS_I720, SF2026, USC4081, USC4611, USE_IRS  # noqa: E402
from fill27_trade import apply_trade  # noqa: E402

ECFR_AS_OF = "2026-10-08"
TITLE = "Mineral Fuels, Mineral Oils and Products of Their Distillation; Bituminous Substances; Mineral Waxes"
SHORT = "Mineral Fuels & Oils"

d = json.load(open(sys.argv[1]))
d["chapter"]["title"] = TITLE

# ---------------------------------------------------------------- overview (non-trade parts)
o = d["overview"]
o["h1"] = f"HTS Chapter 27: {SHORT} (Oil, Gas, Coal) — Tariff Rates"

# The generator picks up the first row of Chapter 28 ("I. CHEMICAL ELEMENTS") after heading 2716; drop it.
rows = o["rateTable"]["rows"]
o["rateTable"]["rows"] = [r for r in rows if not (r["hts"] is None and r["description"].strip().upper().startswith("I. CHEMICAL ELEMENTS"))]
o["rateTable"]["rowCount"] = len(o["rateTable"]["rows"])

o["notes"] = {
    "chapterNotes": (
        "**Note 1.** This chapter does not cover: (a) separate chemically defined organic compounds, other than pure methane and propane, which are classified in heading 2711; "
        "(b) medicaments of heading 3003 or 3004; or (c) mixed unsaturated hydrocarbons of heading 3301, 3302 or 3805.\n\n"
        "**Note 2.** References in heading 2710 to \"petroleum oils and oils obtained from bituminous minerals\" include not only petroleum oils and oils obtained from bituminous minerals, "
        "but also similar oils, as well as those consisting mainly of mixed unsaturated hydrocarbons, obtained by any process, provided that the weight of the nonaromatic constituents exceeds "
        "that of the aromatic constituents. However, the references do not include liquid synthetic polyolefins of which less than 60 percent by volume distills at 300 °C, after conversion "
        "to 1,013 millibars when a reduced-pressure distillation method is used (chapter 39).\n\n"
        "**Note 3.** For the purposes of heading 2710, \"waste oils\" means waste containing mainly petroleum oils and oils obtained from bituminous minerals (as described in note 2), whether "
        "or not mixed with water. These include: (a) such oils no longer fit for use as primary products (for example, used lubricating oils, used hydraulic oils and used transformer oils); "
        "(b) sludge oils from the storage tanks of petroleum oils, mainly containing such oils and a high concentration of additives (for example, chemicals) used in the manufacture of the "
        "primary products; and (c) such oils in the form of emulsions in water or mixtures with water, such as those resulting from oil spills, storage tank washings, or from the use of "
        "cutting oils for machining operations.\n\n"
        "**Subheading notes.** (1) \"Anthracite\" (2701.11) is coal with a volatile matter limit (dry, mineral-matter-free basis) not exceeding 14%. (2) \"Bituminous coal\" (2701.12) has a volatile "
        "matter limit exceeding 14% and a calorific value of at least 5,833 kcal/kg (moist, mineral-matter-free basis). (3) In 2707.10–2707.40, benzol, toluol, xylol and naphthalene mean products "
        "with more than 50% by weight of benzene, toluene, xylenes or naphthalene. (4) In 2710.12, \"light oils and preparations\" are those of which 90% or more by volume (including losses) "
        "distill at 210 °C (ISO 3405 / ASTM D 86). (5) In heading 2710, \"biodiesel\" means mono-alkyl esters of fatty acids of a kind used as a fuel, derived from animal, vegetable or microbial "
        "fats and oils, whether or not used."
    ),
    "additionalUsNotes": (
        "**Note 1.** Crude petroleum oils, crude oils obtained from bituminous minerals and reconstituted crude petroleum that are products of Canada are admitted free of duty if, within 180 days "
        "of entry, documentation shows that, under a commercial exchange agreement between U.S. and Canadian refiners approved by the Secretary of Energy, an import license was issued and an "
        "equivalent amount of domestic or duty-paid foreign crude was exported to Canada under an export license.\n\n"
        "**Note 2.** For heading 2710, \"petroleum oils\" includes only products having a congealing point (ASTM D 938) below 30 °C or, if not below 30 °C, meeting the density and cone/needle "
        "penetration limits set out in the note.\n\n"
        "**Note 3.** For 2710.12.15, \"motor fuel\" is any product derived primarily from petroleum, shale or natural gas, whether or not containing additives, which is principally used as a fuel "
        "in internal-combustion or other engines.\n\n"
        "**Note 4.** For 2710.12.18, 2710.19.25 and 2710.20.15, \"motor fuel blending stock\" means any product (except naphthas of 2710.12.25) derived primarily from petroleum, shale oil or "
        "natural gas, whether or not containing additives, to be used for direct blending in the manufacture of motor fuel.\n\n"
        "**Note 5.** In weighing the components of the mixtures of 2710.12.45 and 2710.19.45, naphtha and other petroleum derivatives present as solvents are disregarded.\n\n"
        "**Note 6.** For heading 2716, \"electrical energy\" does not include electrical energy transmitted as a medium of communication, and electrical energy is not subject to the entry "
        "requirements of 19 U.S.C. 1484 but is entered on a periodic basis under Treasury regulations.\n\n"
        "**Note 7.** A barrel (bbl) means 158.98 liters measured at 15.6 °C.\n\n"
        "**Note 8.** 2712.10.00 does not include petroleum jelly suitable for the care of the skin, put up in retail packings for that use (3304.99.10).\n\n"
        "**Statistical note 1.** For 2710.12.4560, \"renewable fuels\" are fuels produced from biogenic material (ISO 16620-2 / ASTM D 6866)."
    ),
}

GROUPS = {
    "2701": dict(label="Coal and coal briquettes", short="Coal",
                 blurb="Anthracite, bituminous coal (including coking and thermal coal), other coal and coal briquettes: 6 lines, all Free. China pays 25% (List 3). Russian-origin coal is banned under Executive Order 14066.",
                 examples=["coal", "anthracite", "bituminous coal", "metallurgical coal", "coking coal", "thermal coal"]),
    "2702": dict(label="Lignite", short="Lignite",
                 blurb="Lignite (brown coal), loose or agglomerated: 2 lines, Free. China pays 25% (List 3).",
                 examples=["lignite", "brown coal"]),
    "2703": dict(label="Peat", short="Peat",
                 blurb="Peat and peat litter, including horticultural peat moss: 1 line, Free. China pays 25% (List 3); Russia pays 35% in place of its Column 2 rate.",
                 examples=["peat", "peat moss", "sphagnum peat moss", "peat litter"]),
    "2704": dict(label="Coke and semicoke", short="Coke",
                 blurb="Coke and semicoke of coal, lignite or peat, and retort carbon (metallurgical and foundry coke): 3 lines, Free. Coke is on none of the China Section 301 lists, so it is Free from China too.",
                 examples=["coke", "metallurgical coke", "foundry coke", "semicoke", "retort carbon"]),
    "2705": dict(label="Coal gas and similar gases", short="Coal gas",
                 blurb="Coal gas, water gas, producer gas and similar manufactured gases (not natural gas): 1 line, Free. China pays 25% (List 3).",
                 examples=["coal gas", "producer gas", "water gas", "syngas"]),
    "2706": dict(label="Coal tar and mineral tars", short="Tar",
                 blurb="Tar distilled from coal, lignite or peat and other mineral tars: 1 line, Free. China pays 25% (List 3).",
                 examples=["coal tar", "mineral tar", "reconstituted tar"]),
    "2707": dict(label="Coal-tar distillation products (benzene, toluene, xylenes)", short="Coal-tar products",
                 blurb="Benzene, toluene, xylenes, naphthalene, creosote oils, phenols and other products of high-temperature coal tar: 17 lines. Most are Free; carbazole and cresols pay 0.9¢/kg + 3% and phenol 2.9¢/kg + 12.5%.",
                 examples=["benzene", "toluene", "xylene", "naphthalene", "creosote", "phenol", "cresol"]),
    "2708": dict(label="Pitch and pitch coke", short="Pitch",
                 blurb="Pitch and pitch coke from coal tar or other mineral tars (binder pitch for aluminum anodes and electrodes): 2 lines, Free. China pays 25% (List 3).",
                 examples=["coal tar pitch", "pitch coke", "binder pitch"]),
    "2709": dict(label="Crude oil", short="Crude oil",
                 blurb="Crude petroleum and lease condensate: 5.25¢ per barrel below 25° API (heavy crude) and 10.5¢ per barrel at 25° API or more. Free under USMCA and most FTAs. China pays 25% on top; Russian and Iranian crude is banned.",
                 examples=["crude oil", "heavy crude", "light crude", "condensate", "Canadian crude", "WCS"]),
    "2710": dict(label="Refined petroleum products (gasoline, diesel, jet fuel)", short="Refined products",
                 blurb="Gasoline, jet fuel, naphtha, kerosene, diesel, heating oil, residual fuel oil, lubricating oils, greases, biodiesel blends and waste oils: 76 lines, all dutiable — 52.5¢/bbl for motor fuel and jet fuel, 5.25–10.5¢/bbl for fuel oils, 84¢/bbl for lubricating oils, 7% for other oils.",
                 examples=["gasoline", "diesel", "jet fuel", "fuel oil", "lubricating oil", "naphtha", "kerosene", "base oil"]),
    "2711": dict(label="Natural gas, LNG and LPG (propane, butane)", short="Gas / LNG / LPG",
                 blurb="Liquefied natural gas, propane, butanes, ethylene, propylene and natural gas by pipeline: 17 lines, all Free. China pays 25% (List 3). Russian-origin LNG is banned; imports of natural gas need DOE authorization.",
                 examples=["natural gas", "LNG", "propane", "butane", "LPG", "pipeline gas"]),
    "2712": dict(label="Petroleum jelly and waxes", short="Waxes",
                 blurb="Petroleum jelly, paraffin wax, microcrystalline wax, slack wax, montan wax and similar mineral waxes: 4 lines, Free. China pays 25% (paraffin wax 7.5%).",
                 examples=["petroleum jelly", "paraffin wax", "microcrystalline wax", "slack wax", "montan wax"]),
    "2713": dict(label="Petroleum coke and bitumen", short="Pet coke / bitumen",
                 blurb="Petroleum coke (calcined and not calcined), petroleum bitumen (asphalt binder) and other petroleum residues: 4 lines, Free. China pays 25% (List 3).",
                 examples=["petroleum coke", "pet coke", "calcined petroleum coke", "bitumen", "asphalt"]),
    "2714": dict(label="Natural bitumen, oil shale and tar sands", short="Natural bitumen",
                 blurb="Natural bitumen and asphalt, asphaltites and asphaltic rocks, bituminous or oil shale and tar sands: 2 lines, Free. China pays 25% (List 3).",
                 examples=["natural asphalt", "gilsonite", "oil shale", "tar sands", "asphaltite"]),
    "2715": dict(label="Bituminous mixtures", short="Bitumen mixes",
                 blurb="Bituminous mixtures based on natural asphalt, bitumen, petroleum bitumen, mineral tar or pitch (asphalt mastics, cut-backs): 1 line, Free. China pays 25% (List 3).",
                 examples=["asphalt mastic", "cut-back bitumen", "bituminous mixture", "asphalt emulsion"]),
    "2716": dict(label="Electricity", short="Electricity",
                 blurb="Electrical energy: 1 line, Free from every country, including China (no Section 301 list covers it). Entered periodically rather than shipment by shipment (Additional U.S. note 6).",
                 examples=["electricity", "electrical energy", "power imports", "hydropower"]),
}
for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["blurb"] = G["blurb"]
    g["searchExamples"] = G["examples"]

for st in o["stats"]:
    if st["label"].startswith("Lines with a base-rate duty"):
        st["note"] = "Crude oil, refined products and 3 coal-tar chemicals"
    if st["label"].startswith("Lines with an extra duty"):
        st["note"] = "China: Section 301 (25% on 124 lines, 7.5% on 13); Russia: 2 lines. Russian oil, LNG and coal are banned."

o["workedExamples"] = [
    {
        "title": "500,000 barrels of heavy Canadian crude",
        "line": "2709.00.10.00",
        "body": "Crude oil testing under 25° API pays **5.25¢ per barrel**. Claimed under USMCA (SPI S), it is **Free**; without a claim it is $26,250 (500,000 × $0.0525). U.S. note 52(b) exempts crude from the 10% Section 301 duty on Canada, so nothing else is added. In 2025 a non-USMCA cargo also paid the 10% IEEPA energy duty until February 24, 2026. Not a tariff, but still owed: the **petroleum Superfund excise tax** on imported crude (16.4¢ per barrel in the statute, indexed for inflation{SF2026}), paid to the IRS rather than CBP.",
    },
    {
        "title": "300,000 barrels of gasoline from the Netherlands",
        "line": "2710.12.15.19",
        "body": "Unleaded gasoline (motor fuel) pays **52.5¢ per barrel**: $157,500 on 300,000 barrels. The EU has no free trade agreement with the U.S., and the 10% Section 301 duty on EU goods does not apply because 2710.12.15 is on the note 52(b) exemption list. The importer must also meet EPA's fuel standards as a gasoline importer (40 CFR part 1090), carry renewable fuel obligations (40 CFR part 80), and pay federal excise tax of 18.4¢ per gallon when the gasoline is entered or removed at the terminal rack — none of which is in the tariff grid.",
    },
    {
        "title": "Lubricating oil from China",
        "line": "2710.19.30.20",
        "body": "Engine lubricating oil pays **84¢ per barrel**, and because 2710.19.30 is on Section 301 **List 2**, Chinese-origin oil adds **25% of value** (9903.88.02). A $200,000 shipment of 1,000 barrels pays $840 + $50,000 = **$50,840**. The 12.5% 2026 Section 301 duty on China does not stack on top (note 52(b)).",
    },
    {
        "title": "Crude oil or LNG from Russia",
        "line": "2709.00.20.90",
        "body": "Russian-origin crude oil, petroleum fuels and products, LNG and coal **cannot be imported** into the United States: Executive Order 14066 has banned them since March 2022, and the national emergency behind it was continued on March 24, 2026. The tariff calculator does not model this ban; it would show Russia's Column 2 rate (21¢ per barrel). OFAC's guidance excludes Russian goods that were substantially transformed into a foreign-made product from \"Russian Federation origin\" (FAQ 1019).",
    },
]

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = f"HTS Chapter 27: {SHORT} — Oil & Gas Tariff Updates"
tu["seo"] = {
    "title": "Oil & Gas Tariff Updates 2025–2026: Canadian Oil, Energy Exemptions, Russia & Venezuela (HTS Ch. 27) | KoalaGains",
    "shortDescription": "Every U.S. tariff change for crude oil, gasoline, diesel, natural gas, LNG and coal since January 2025: the 10% tariff on Canadian energy and when it ended, the energy exemptions from the reciprocal, Section 122 and 2026 Section 301 tariffs, China's Section 301 duties, and the Russia, Iran and Venezuela oil sanctions, with Federal Register citations.",
    "keywords": [
        "oil tariffs",
        "oil and gas tariffs",
        "canadian oil tariff",
        "10 tariff on canadian energy",
        "USMCA oil tariffs",
        "energy tariff exemption",
        "oil tariffs russia",
        "tariff on venezuelan oil",
        "oil tariffs iran",
        "crude oil import tariffs",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** "
    "(in force October 9, 2026). All 141 Chapter 27 lines carry the same base rates in both — from Free on coal, natural gas and LNG to 5.25–10.5¢ per barrel "
    "on crude oil and 52.5¢ per barrel on gasoline and jet fuel.\n\n"
    "What changed were the extra duties, and energy was carved out of most of them. In 2025 non-USMCA energy from **Canada** paid a **10%** IEEPA duty (other "
    "Canadian goods 25%, later 35%), non-USMCA goods from **Mexico** paid **25%**, and goods from **China** paid a 10–20% fentanyl duty. Every Chapter 27 subheading "
    "was on the exemption lists of the April 2025 reciprocal tariff, the Brazil and India IEEPA duties, the 2026 Section 122 surcharge and the **2026 Section 301 "
    "tariffs** on 60 economies (U.S. note 52(b)). All IEEPA duties **ended on February 24, 2026**.\n\n"
    "Today the only extra tariffs are China's **Section 301** duties (25% on most lines, 7.5% on a few) and, for **Russia**, Column 2 rates — but Russian-origin crude "
    "oil, petroleum products, LNG and coal are **banned** outright under Executive Order 14066. Iranian-origin oil is banned under the Iran sanctions regulations, and "
    "Venezuelan oil can be bought only under a Treasury general license. Sanctions and federal excise taxes (the petroleum Superfund tax on crude and petroleum products) are listed "
    "below for reference; the tariff calculator does not price them."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 27 from any country (China Section 301 Lists 2, 3 and 4A; Russia's Column 2 and in-lieu rates; the 2026 Section 301 and "
    "Brazil actions, whose exemption lists cover the whole chapter; the ended IEEPA and Section 122 duties), plus the sanctions-based import bans on Russian, Iranian "
    "and Venezuelan energy and the federal petroleum excise taxes, which the tariff calculator does not model. No antidumping or countervailing duty order covers a "
    "Chapter 27 product. For the rate each supplier pays, see Rates by country."
)
for x in tu["inEffect"]:
    if x["country"] == "China":
        x["measure"] = "Section 301 tariffs, Lists 2, 3 and 4A (2018–2020)"
        x["exemption"] = (
            "List 3 (+25%, 9903.88.03) covers 59 of the 76 Chapter 27 subheadings — coal, lignite, peat, coal tar and its products, crude oil, gasoline, jet fuel, "
            "diesel and fuel oils, natural gas, LNG, propane, petroleum jelly, petroleum coke, bitumen and asphalt. List 2 (+25%, 9903.88.02) covers lubricating oils "
            "and greases (2710.19.30–2710.19.40), and List 4A (+7.5%, 9903.88.15) phenol (2707.99.51), waste oils (2710.91, 2710.99) and paraffin wax (2712.20). "
            "Coke (2704) and electricity (2716) are on no list. The 12.5% 2026 Section 301 duty on China (9903.05.31) does not apply, because every Chapter 27 "
            "subheading is on the note 52(b) exemption list (9903.05.86). The IEEPA fentanyl duty on China ended February 24, 2026. USTR confirmed on October 7, 2026 "
            "that the 2018 actions continue during their four-year review."
        )
        x["whatItMeans"] = (
            "Chinese-origin fuel, coal, LNG or wax pays 25% of its value on top of the base rate (7.5% for phenol, waste oil and paraffin wax). A $1 million cargo of "
            "Chinese gasoline pays $250,000 plus 52.5¢ per barrel. Chinese coke and electricity pay nothing extra."
        )
        for sid in ["fr-2026-20510", "eo-14389"]:
            if sid not in x["sourceIds"]:
                x["sourceIds"].insert(-1, sid)
    elif x["country"] == "Russia":
        x["measure"] = "Column 2 rates, 35% in lieu of Column 2 (peat) and Section 232 aluminum derivatives (one line)"
        x["exemption"] = (
            "Russia has paid Column 2 rates since April 9, 2022 (Pub. L. 117-110): 21¢ per barrel on crude oil and fuel oils, $1.05 per barrel on gasoline and jet fuel, "
            "$1.68 per barrel on lubricating oils, 45% on calcined petroleum coke and 2.2¢/kg on paraffin wax. Peat (2703.00) pays 35% instead of its Column 2 rate "
            "(9903.90.08, Proclamation 10420), and steam cylinder oils (2710.19.30.50) are a Section 232 aluminum derivative at +200% (9903.85.68). The 12.5% 2026 "
            "Section 301 duty on Russia (9903.05.66) does not apply under note 52(b). Separately, Executive Order 14066 bans imports of Russian-origin crude oil, "
            "petroleum fuels, oils and products of their distillation, LNG, coal and coal products; the calculator does not model the ban."
        )
        x["whatItMeans"] = (
            "Russian crude, refined products, LNG and coal cannot be imported at all. Russian goods outside the ban, such as peat, pay Column 2 or in-lieu rates "
            "(35% on peat)."
        )
        for sid in ["pl-117-110", "eo-14066", "ru-emergency-2026"]:
            if sid not in x["sourceIds"]:
                x["sourceIds"].insert(-1, sid)

for s in EXTRA_SOURCES:
    if s["id"] not in {x["id"] for x in tu["sources"]}:
        tu["sources"].append(s)

base = [c for c in tu["changes"] if c["type"] == "baseRate"]
pending_gen = [c for c in tu["changes"] if c["type"] == "pending"]
for c in base:
    c["detail"] = (
        "All 141 Chapter 27 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition; "
        "no line was added, removed or renumbered."
    )
for c in pending_gen:
    if "Nicaragua" in c["title"]:
        c["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
        c["detail"] = (
            "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), "
            "with no exemption for energy products. The rate is 0% in 2026. Nicaragua is a minor supplier of Chapter 27 goods."
        )


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


changes = base + pending_gen + [
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their July 6 and August 23, 2026 anniversaries and remain in effect pending the statutory review. The 25% and 7.5% duties on Chinese Chapter 27 goods continue.",
       None, None, "China", ["fr-2026-20510"]),
    ch("ve-gl46e", "reference", "2026-09-28", "Issued", "Venezuelan oil license updated (General License 46E)",
       "OFAC's current Venezuela General License 46E lets established U.S. entities (organized on or before January 29, 2025) lift, buy, refine and import Venezuelan-origin oil and petrochemical products, with payments to blocked Venezuelan government entities going into the Treasury-held Foreign Government Deposit Funds. It excludes dealings with Russian, Iranian, North Korean or Cuban persons, Chinese-controlled entities and blocked vessels. Coal is covered by General License 51D.",
       None, "Allowed under license", "Venezuela", ["ofac-gl46e", "ofac-gl51d"]),
    ch("s301-60-exempt", "reference", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: energy exempt",
       "The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect, but all 76 Chapter 27 subheadings are on the general exemption list in U.S. note 52(b) (9903.05.86). Crude oil, fuels, natural gas and coal from Canada, Mexico, Saudi Arabia, Iraq, Colombia, Guyana, Brazil, the EU and the other listed economies pay no Section 301 duty; only China still pays its older Section 301 duties.",
       None, "Exempt", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired (energy was exempt)",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026. Every Chapter 27 subheading was on its product exemption list (9903.03.03), so energy imports never paid it.",
       None, None, "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301-exempt", "reference", "2026-07-22", "Effective", "Brazil Section 301 tariff: energy exempt",
       "The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect; all Chapter 27 subheadings, including crude oil, are on its exemption list (U.S. note 50(a)(ii), 9903.05.03).",
       None, "Exempt", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("ir-gl-x-end", "reference", "2026-07-17", "Expired", "Temporary license for Iranian oil revoked and expired",
       "OFAC revoked General License X on July 7, 2026 and its wind-down license X1 expired on July 17, 2026. GL X (issued June 21, 2026) had authorized the production, delivery and sale of Iranian-origin crude oil, petrochemical and petroleum products through August 21, 2026, including importation into the United States incident to those sales. The import ban of 31 CFR 560.201 applies again in full.",
       "Authorized (GL X)", "Banned", "Iran", ["ofac-gl-x", "ecfr-560-201"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) on Canadian and Mexican crude and fuels still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("ru-emergency-continued", "reference", "2026-03-24", "Signed", "Russia national emergency continued; oil, LNG and coal import ban stays",
       "The President continued the national emergency of Executive Order 14024, as expanded by Executive Order 14066, beyond April 15, 2026. The ban on importing Russian-origin crude oil, petroleum products, LNG and coal remains in force.",
       None, "Banned", "Russia", ["ru-emergency-2026", "eo-14066"]),
    ch("ir-gl-u", "reference", "2026-03-20", "Issued", "Iranian oil already at sea temporarily allowed (General License U)",
       "OFAC General License U authorized the sale, delivery and offloading — including importation into the United States — of Iranian-origin crude oil and petroleum products loaded on vessels by March 20, 2026, through April 19, 2026. It expired on that date.",
       "Banned", "Allowed for cargoes loaded by March 20 (expired April 19, 2026)", "Iran", ["ofac-gl-u", "ecfr-560-201"]),
    ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; energy exempt",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. All Chapter 27 subheadings were on the product exemption list (9903.03.03).",
       None, "Exempt", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end, including the 10% on Canadian energy",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, reciprocal, Brazil, India, Venezuelan-oil, Cuba-oil and Iran tariff orders, and CBP stopped collecting the duties for goods entered from 12:00 a.m. ET on February 24. For Chapter 27 this removed the 10% duty on non-USMCA Canadian energy, the 25% on non-USMCA Mexican goods and the 10% fentanyl duty on Chinese goods.",
       "Canada 10% (energy), Mexico 25%, China 10%", "None", "Canada, Mexico, China", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("ir-secondary", "reference", "2026-02-06", "Signed", "Tariff authorized on countries that buy from Iran",
       "Executive Order 14382 allowed an additional duty (for example 25%) on goods of any country found to buy goods or services from Iran, after findings by Commerce and State. It was an IEEPA tariff and ended with Executive Order 14389 on February 24, 2026. It did not change the ban on importing Iranian goods into the United States.",
       None, "Up to +25% on a buyer country's goods (ended)", "Countries trading with Iran", ["eo-14382", "eo-14389"]),
    ch("cu-oil-secondary", "reference", "2026-01-29", "Signed", "Tariff authorized on countries that supply oil to Cuba",
       "Executive Order 14380 allowed an additional duty on goods of any country found to sell or provide oil to Cuba, after findings by Commerce and State. It was an IEEPA tariff and ended with Executive Order 14389 on February 24, 2026.",
       None, "Additional duty on a supplier country's goods (ended)", "Countries supplying oil to Cuba", ["eo-14380", "eo-14389"]),
    ch("in-25-end", "extraDuty", "2026-02-07", "Effective", "India's 25% Russian-oil tariff removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) imposed because India imported Russian oil, after India committed to stop importing it. Energy products had been exempt from that duty anyway (they were on the note 2(v)(iii) exemption list).",
       "+25% (energy exempt)", "None", "India", ["eo-14384", "eo-14329"]),
    ch("ve-gl46", "reference", "2026-01-29", "Issued", "Treasury opens Venezuelan oil purchases to U.S. companies (General License 46)",
       "OFAC General License 46 authorized established U.S. entities to buy, transport, refine and import Venezuelan-origin oil from the Government of Venezuela and PdVSA, with payments made into the Foreign Government Deposit Funds created by Executive Order 14373 (January 9, 2026). It has since been amended several times (46A–46E).",
       "Blocked (PdVSA sanctions)", "Allowed under license", "Venezuela", ["ofac-gl46", "eo-14373"]),
    ch("osltf-expired", "reference", "2026-01-01", "Effective", "Oil spill tax on imported petroleum expires; Superfund tax continues",
       "The 9¢ per barrel Oil Spill Liability Trust Fund tax on imported petroleum products and domestic crude expired after December 31, 2025, (26 U.S.C. 4611(f)(2)). The petroleum Superfund tax of 16.4¢ per barrel, indexed for inflation since 2024, continues{SF2026}. These are IRS excise taxes, not customs duties, and the tariff calculator does not include them.",
       "Superfund rate + 9¢ oil spill tax", "Superfund tax only", "All", EXCISE_SF_IDS),
    ch("cn-fentanyl-10", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "Executive Order 14357 cut the IEEPA duty on products of China (9903.01.24) from 20% to 10%. It applied to Chapter 27 goods, which had no energy exemption from this duty, until February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("in-25", "reference", "2025-08-27", "Effective", "25% tariff on India over Russian oil purchases: energy exempt",
       "Executive Order 14329 added 25% on products of India because India imported Russian oil. Chapter 27 products were on its exemption list (the same list as the reciprocal tariff), so Indian diesel, jet fuel and other fuels did not pay it. Ended February 7, 2026.",
       None, "Exempt", "India", ["eo-14329", "eo-14384"]),
    ch("br-40", "reference", "2025-08-06", "Effective", "40% IEEPA tariff on Brazil: crude oil and fuels exempt",
       "Executive Order 14323 imposed 40% on products of Brazil, but every Chapter 27 subheading, including crude oil, was on its exemption list. Ended February 24, 2026.",
       None, "Exempt", "Brazil", ["eo-14323", "eo-14389"]),
    ch("ca-35", "extraDuty", "2025-08-01", "Effective", "Canada duty raised to 35%; energy stays at 10%",
       "Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10); energy and energy resources (9903.01.13) stayed at 10%. Ended February 24, 2026.",
       "+25% (energy +10%)", "+35% (energy +10%) (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "reference", "2025-04-05", "Effective", "Reciprocal tariff: energy on the exemption list",
       "The 10% baseline (9903.01.25) and country rates applied to products of all countries except Canada and Mexico, but energy and energy products were on Annex II of Executive Order 14257, and every Chapter 27 subheading was on the exemption list (U.S. note 2(v)(iii), 9903.01.32). Crude oil, LNG, coal and refined products never paid the reciprocal tariff. Ended February 24, 2026.",
       None, "Exempt", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("ve-secondary", "reference", "2025-03-24", "Signed", "Tariff authorized on countries that import Venezuelan oil",
       "Executive Order 14245 authorized a 25% tariff, at the Secretary of State's discretion from April 2, 2025, on all goods of any country that imports Venezuelan oil. It was an IEEPA tariff and ended with Executive Order 14389 on February 24, 2026.",
       None, "Up to +25% on a buyer country's goods (ended)", "Countries importing Venezuelan oil", ["eo-14245", "eo-14389"]),
    ch("usmca-exempt", "extraDuty", "2025-03-07", "Effective", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Non-USMCA Canadian energy kept paying 10% and non-USMCA Mexican goods 25%. Ended February 24, 2026.",
       "+10% / +25%", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("ca-mx-imposed", "extraDuty", "2025-03-04", "Effective", "10% on Canadian energy, 25% on Mexican goods, 20% on Chinese goods",
       "The IEEPA duties signed February 1, 2025 took effect: +10% on Canadian energy and energy resources (crude oil, natural gas, lease condensates, natural gas liquids, refined petroleum products, coal and others, 9903.01.13) and +25% on other Canadian goods (9903.01.10); +25% on goods of Mexico (9903.01.01), with no energy carve-out. China's fentanyl duty, in force since February 4, 2025 at 10%, rose to 20% (Executive Order 14228). All ended February 24, 2026.",
       "None", "Canada energy +10%, Mexico +25%, China +20% (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195", "eo-14228", "eo-14156"]),
    ch("ru-35-peat", "extraDuty", "2022-07-27", "Effective", "35% in place of Column 2 on certain Russian goods, including peat",
       "Proclamation 10420 set a 35% rate, in place of the Column 2 rate, on listed products of Russia (9903.90.08, U.S. note 30). Peat (2703.00) is the one Chapter 27 subheading on the list.",
       "Column 2 (Free)", "35%", "Russia", ["procl-10420"]),
    ch("ru-col2", "baseRate", "2022-04-09", "Effective", "Russia and Belarus moved to Column 2",
       "The Suspending Normal Trade Relations with Russia and Belarus Act ended normal trade relations, so products of Russia and Belarus pay Column 2 rates: 21¢ per barrel on crude oil, $1.05 per barrel on gasoline and jet fuel, 45% on calcined petroleum coke.",
       "Column 1 (General)", "Column 2", "Russia, Belarus", ["pl-117-110"]),
    ch("ru-ban", "reference", "2022-03-08", "Signed", "Ban on Russian crude oil, petroleum products, LNG and coal",
       "Executive Order 14066 prohibited the importation into the United States of Russian Federation-origin crude oil; petroleum; petroleum fuels, oils and products of their distillation; liquefied natural gas; coal; and coal products. Other forms of Russian energy are not covered (OFAC FAQ 1014). The ban is still in force and is not modeled by the tariff calculator.",
       None, "Banned", "Russia", ["eo-14066", "ofac-faq-1014"]),
]
gen_by_id = {c["id"]: c for c in tu["changes"]}
for c in tu["changes"]:
    # keep the generator's Russia aluminum-derivative entry, reworded
    if c["type"] == "extraDuty" and "aluminum" in c["title"].lower():
        c["title"] = "Russian steam cylinder oils added to the 200% Section 232 aluminum list"
        c["detail"] = (
            "Commerce's August 2025 inclusions put 2710.19.30.50 (steam cylinder oils) on the Section 232 aluminum derivative list (U.S. note 19(k)). Products of Russia "
            "on that list pay +200% (9903.85.68). Russian petroleum oils are banned by Executive Order 14066 in any case."
        )
        c["countries"] = "Russia"
        changes.append(c)
for c in changes:
    c["id"] = c["id"].replace(" ", "")
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "141 of 141 lines", "note": "Free to 84¢/bbl"},
    {"label": "Extra duties in effect", "value": "2", "note": "China Section 301; Russia Column 2 and in-lieu rates"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026 (Canada energy 10%)"},
]
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]

# ---------------------------------------------------------------- industryAreas (non-trade parts)
ia = d["industryAreas"]
ia["h1"] = f"HTS Chapter 27: {SHORT} — Oil & Gas Tariff Rates by Country"
for g in ia["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["shortLabel"] = G["short"]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 19, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. All 76 Chapter 27 subheadings are on the Section 301 general "
    "exemption list (note 52(b), 9903.05.86) and the Brazil exemption list (note 50(a)(ii), 9903.05.03), and none is on the Canada Section 338 lists (note 51). "
    "China: 59 subheadings are on List 3 (note 20(f)), 3 on List 2 (note 20(d)) and 12 on List 4A (note 20(s)); 2704.00 and 2716.00 are on none, and no product exclusion "
    "for Chapter 27 is in effect. Russia: 2703.00 is in note 30(b) (35% in lieu of Column 2) and 2710.19.30.50 in note 19(k) (aluminum derivatives, 200% for Russia). "
    "All 76 were also on the exemption lists of the ended reciprocal tariff (note 2(v)(iii)), the ended Brazil IEEPA duty and the expired Section 122 surcharge "
    "(9903.03.03). Sanctions-based import bans (Russia, Iran) are outside the HTS and are not priced in the matrix."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = f"HTS Chapter 27: {SHORT} — Import Rules & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Crude Oil, Fuel, LNG & Coal: EPA, DOE, CBP & Sanctions Rules and Legal Ways to Lower Duty (HTS Ch. 27) | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 27 line — EPA fuel standards and renewable fuel obligations for gasoline and diesel importers, DOE natural gas import authorization, CBP petroleum gauging, Russia, Iran and Venezuela sanctions, Superfund and fuel excise taxes — and the legal ways to pay less duty: USMCA and FTA claims, petroleum substitution drawback and foreign-trade zones.",
    "keywords": [
        "importing crude oil requirements",
        "EPA fuel importer registration",
        "DOE natural gas import authorization",
        "petroleum drawback 1313(p)",
        "superfund tax imported petroleum",
        "russian oil import ban",
        "venezuela general license 46",
        "USMCA crude oil",
    ],
}
te["intro"] = (
    "The tariff on Chapter 27 goods is small — Free to 84¢ per barrel, Free with a USMCA or FTA claim — so for most importers the bigger costs and risks are elsewhere: "
    "**sanctions** (Russian oil, LNG and coal and Iranian oil are banned; Venezuelan oil needs a Treasury license), **China's Section 301** duty of 25%, and "
    "**excise taxes** that the IRS collects on entry (the petroleum Superfund tax of 16.4¢ per barrel, indexed for inflation{SF2026}, and 18.4¢ or 24.4¢ per gallon on gasoline, diesel and kerosene).\n\n"
    "The paperwork depends on the product: gasoline and diesel importers must meet EPA fuel-quality rules and renewable fuel obligations, natural gas and LNG imports "
    "need Department of Energy authorization, bulk petroleum is gauged and sampled by CBP, and most fuels are hazardous materials in transport. Each rule and lever "
    "below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF

USMCA_CIT = {"label": "19 CFR 182.12 (USMCA certification of origin)", "url": ECFR + "title-19/section-182.12"}
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on Canadian and Mexican crude oil and fuels",
        "saves": "The base rate: 5.25–10.5¢ per barrel on crude, 52.5¢ on gasoline and jet fuel, 84¢ on lubricating oils. In 2025 a USMCA claim also avoided the 10% IEEPA duty on Canadian energy and 25% on Mexican goods.",
        "appliesTo": "All dutiable lines of 2707, 2709 and 2710 for originating goods of Canada or Mexico",
        "document": "A USMCA certification of origin from the importer, exporter or producer (no prescribed form); claim SPI \"S\" on the entry. Crude oil produced in Canada or Mexico is wholly obtained there.",
        "caveat": "Today a claim saves only the base rate: note 52(b) exempts Chapter 27 from the 10% Section 301 duties on Canada and Mexico with or without a claim. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            USMCA_CIT,
            {"label": "HTSUS General Note 11 (USMCA)", "url": GN},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA, CBTPA or AGOA rate for other suppliers",
        "saves": "The per-barrel base rate on crude oil and refined products from FTA partners (Colombia, Peru, Korea, Australia, Chile, Israel, Morocco, Oman, Panama, Singapore and others), CBTPA countries such as Guyana and Trinidad and Tobago (through September 30, 2030), and AGOA countries such as Nigeria (through December 31, 2026).",
        "appliesTo": "Dutiable lines of 2707, 2709 and 2710 whose Special column lists the program",
        "document": "Origin documentation meeting the agreement's rules and the program's SPI on the entry (for example CO, R or D).",
        "caveat": "GSP (A, A+) has lapsed since December 31, 2020, so a GSP code gives no benefit. A preference claim does not remove China's Section 301 duty.",
        "citations": [
            {"label": "HTSUS General Notes (FTA, CBTPA note 17, AGOA)", "url": GN},
            {"label": "USTR statement on AGOA reauthorization (February 3, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"},
        ],
    },
    {
        "id": "petroleum-drawback",
        "title": "Use petroleum substitution drawback when you export fuels",
        "saves": "Up to 99% of the duties (and, within limits, certain federal excise taxes) paid on imported petroleum derivatives, when a product of the same kind and quality is exported — the exported barrels do not have to be the imported ones.",
        "appliesTo": "Qualified articles of headings 2707, 2708 and 2710–2715 (not crude oil of 2709)",
        "document": "A drawback claim to CBP under 19 U.S.C. 1313(p), matching imports to exports of the same 8-digit HTS number or commercially interchangeable product (19 CFR 191.171–191.176).",
        "caveat": "Drawback of excise tax is limited to the tax paid on the substituted merchandise (19 CFR 191.171(d)). Claims must be filed within the drawback time limits.",
        "citations": [
            {"label": "19 CFR 191.171", "url": ECFR + "title-19/section-191.171"},
            {"label": "19 CFR 191.172 (qualified articles)", "url": ECFR + "title-19/section-191.172"},
            {"label": "19 CFR part 191", "url": ECFR + "title-19/part-191"},
        ],
    },
    {
        "id": "ftz",
        "title": "Store, blend or refine in a foreign-trade zone",
        "saves": "Defers duty until goods leave the zone for the U.S. market, and no duty is owed on product exported from the zone.",
        "appliesTo": "Crude oil and refined products (2709, 2710) and other Chapter 27 goods handled in an approved zone or subzone",
        "document": "FTZ Board authorization for the zone or subzone and CBP admission and entry procedures (15 CFR part 400; 19 CFR part 146).",
        "caveat": "Zone status and any production activity (such as refining) need FTZ Board approval, which can come with conditions; admission, inventory control and entries follow CBP's zone procedures.",
        "citations": [
            {"label": "19 CFR part 146 (foreign-trade zones)", "url": ECFR + "title-19/part-146"},
            {"label": "15 CFR part 400 (FTZ Board)", "url": ECFR + "title-15/part-400"},
        ],
    },
    {
        "id": "origin",
        "title": "Know the country of origin — China pays 25%, Russia and Iran are banned",
        "saves": "25% of value: Chinese-origin goods pay Section 301 (7.5% on a few lines); the same product from any other origin pays no extra tariff. Getting origin wrong on Russian or Iranian energy is a sanctions violation, not a duty question.",
        "appliesTo": "All lines (China); crude oil, fuels, LNG and coal (Russia, Iran)",
        "document": "Certificates of origin and production records showing where the oil was produced or refined. For refined products, origin follows where the goods were last substantially transformed; OFAC's guidance excludes Russian goods substantially transformed into a foreign-made product from \"Russian Federation origin\" (FAQ 1019). Ask CBP for a ruling when unsure.",
        "caveat": "Blending or storing in a third country does not change origin. Venezuelan-origin oil may be imported only under OFAC General License 46E or a specific license.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 20 (China lists)", "url": CH99},
            {"label": "OFAC FAQ 1019 (Russian Federation origin)", "url": "https://ofac.treasury.gov/faqs/1019"},
            {"label": "19 CFR part 177 (rulings)", "url": ECFR + "title-19/part-177"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback of China's Section 301 duty on re-exported goods",
        "saves": "Up to 99% of the Section 301 duty paid on Chinese-origin goods that are re-exported, unused or in an exported product",
        "appliesTo": "All lines, for goods of China",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Sanctions penalties and excise taxes outside the drawback rules are not refundable this way.",
        "citations": [
            {"label": "19 CFR part 191", "url": ECFR + "title-19/part-191"},
        ],
    },
]
te["rules"] = [
    {"id": "epa-fuels", "agency": "EPA",
     "title": "Gasoline, diesel and their blendstocks: importers must register with EPA and meet the fuel quality standards (sulfur, benzene, volatility) for each imported batch, with testing by vessel, rail or truck",
     "citations": [
         {"label": "40 CFR 1090.1600", "url": ECFR + "title-40/section-1090.1600"},
         {"label": "40 CFR 1090.1605 (imports by marine vessel)", "url": ECFR + "title-40/section-1090.1605"},
         {"label": "40 CFR 1090.1610 (imports by rail or truck)", "url": ECFR + "title-40/section-1090.1610"},
     ]},
    {"id": "epa-rfs", "agency": "EPA",
     "title": "Gasoline and diesel importers are obligated parties under the Renewable Fuel Standard and must retire RINs for their imported volumes",
     "citations": [{"label": "40 CFR 80.1406", "url": ECFR + "title-40/section-80.1406"}]},
    {"id": "doe-gas", "agency": "DOE (Office of Fossil Energy and Carbon Management)",
     "title": "Natural gas and LNG: imports require authorization from DOE under section 3 of the Natural Gas Act, applied for at least 90 days ahead",
     "citations": [
         {"label": "10 CFR 590.201", "url": ECFR + "title-10/section-590.201"},
         {"label": "10 CFR 590.202 (contents of applications)", "url": ECFR + "title-10/section-590.202"},
     ]},
    {"id": "cbp-petroleum", "agency": "CBP",
     "title": "Bulk petroleum and petroleum products: CBP controls unlading and gauging (meters, shore tanks or vessel ullages) and the entry summary reports API gravity and quantity",
     "citations": [
         {"label": "19 CFR 151.41", "url": ECFR + "title-19/section-151.41"},
         {"label": "19 CFR 151.42", "url": ECFR + "title-19/section-151.42"},
     ]},
    {"id": "tsca", "agency": "EPA / CBP",
     "title": "Chemical substances and mixtures (fuels, coal-tar chemicals, waxes): TSCA import certification (positive or negative) at entry",
     "citations": [{"label": "19 CFR 12.121", "url": ECFR + "title-19/section-12.121"}]},
    {"id": "hazmat", "agency": "U.S. DOT (PHMSA)",
     "title": "Crude oil, gasoline, diesel, jet fuel, LPG, LNG and flammable coal-tar products are hazardous materials in transport: shipping papers, marking and packaging",
     "citations": [{"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": ECFR + "title-49/section-172.101"}]},
    {"id": "ofac-russia", "agency": "Treasury (OFAC)",
     "title": "Russian Federation-origin crude oil, petroleum fuels, oils and products of their distillation, LNG, coal and coal products: import prohibited (Executive Order 14066); not in the tariff calculator",
     "citations": [
         {"label": "Executive Order 14066 (87 FR 13625)", "url": FR + "2022/03/10/2022-05232/prohibiting-certain-imports-and-new-investments-with-respect-to-continued-russian-federation-efforts"},
         {"label": "31 CFR part 587", "url": ECFR + "title-31/part-587"},
         {"label": "OFAC FAQ 1014", "url": "https://ofac.treasury.gov/faqs/1014"},
     ]},
    {"id": "ofac-iran", "agency": "Treasury (OFAC)",
     "title": "Goods of Iranian origin, including crude oil and petroleum products: import prohibited; the 2026 temporary oil licenses (GL U, GL X) have expired",
     "citations": [
         {"label": "31 CFR 560.201", "url": ECFR + "title-31/section-560.201"},
         {"label": "OFAC GL X and X1 (91 FR 61758)", "url": FR + "2026/09/30/2026-20010/publication-of-iran-related-web-general-licenses-x-and-x1"},
     ]},
    {"id": "ofac-venezuela", "agency": "Treasury (OFAC)",
     "title": "Venezuelan-origin oil, petrochemicals and coal from the Government of Venezuela or PdVSA: allowed for established U.S. entities under General Licenses 46E (oil) and 51D (coal), with payments into the Foreign Government Deposit Funds",
     "citations": [
         {"label": "31 CFR part 591", "url": ECFR + "title-31/part-591"},
         {"label": "Venezuela General License 46E", "url": "https://ofac.treasury.gov/media/936996/download?inline"},
         {"label": "Venezuela General License 51D", "url": "https://ofac.treasury.gov/media/936856/download?inline"},
     ]},
    {"id": "irs-superfund", "agency": "IRS",
     "title": "Imported petroleum products (crude, refined and residual oil): petroleum Superfund excise tax of 16.4¢ per barrel, indexed for inflation{SF2026}, on entry for consumption, use or warehousing; the 9¢ oil spill tax expired after 2025 (not in the tariff calculator)",
     "citations": [
         {"label": "26 U.S.C. 4611", "url": USC4611},
     ] + ([{"label": "IRS Instructions for Form 6627 (Rev. January 2026)", "url": IRS_I6627}] if USE_IRS else [])},
    {"id": "irs-fuel-excise", "agency": "IRS",
     "title": "Gasoline (18.4¢ per gallon), diesel and kerosene (24.4¢ per gallon): federal excise tax on entry into the United States unless entered by bulk transfer by a registered taxable fuel registrant (then due at the terminal rack) (not in the tariff calculator)",
     "citations": [
         {"label": "26 CFR 48.4081-3", "url": ECFR + "title-26/section-48.4081-3"},
         {"label": "26 U.S.C. 4081 (rates)", "url": USC4081},
     ] + ([{"label": "IRS Instructions for Form 720", "url": IRS_I720}] if USE_IRS else [])},
    {"id": "electricity", "agency": "CBP",
     "title": "Electricity is not entered shipment by shipment under 19 U.S.C. 1484 but on a periodic basis under Treasury regulations (Additional U.S. note 6 to Chapter 27)",
     "citations": [
         {"label": "HTSUS Chapter 27, Additional U.S. note 6", "url": CH27},
     ]},
]
GROUP_RULES = {
    "2701": (["tsca", "ofac-russia", "ofac-iran", "ofac-venezuela"], "Russian-origin coal is banned (Executive Order 14066). Venezuelan coal from Carbozulia is covered by General License 51D. China pays 25% (List 3)."),
    "2702": (["tsca", "ofac-russia", "ofac-iran"], "Russian-origin lignite counts as coal under the Executive Order 14066 ban."),
    "2703": (["ofac-iran"], "Peat is not an energy product under the Russia ban, but Russian peat pays 35% in place of the Column 2 rate."),
    "2704": (["tsca", "ofac-russia", "ofac-iran"], "Coke is a coal product under the Russia ban. It is on no China Section 301 list."),
    "2705": (["tsca", "hazmat", "ofac-iran"], "Manufactured gases are hazardous materials in transport."),
    "2706": (["tsca", "hazmat", "ofac-iran"], None),
    "2707": (["tsca", "hazmat", "ofac-iran"], "Benzene, toluene and xylenes are flammable liquids in transport. Carbazole, phenol and cresols are the only dutiable lines."),
    "2708": (["tsca", "ofac-iran"], None),
    "2709": (["cbp-petroleum", "irs-superfund", "tsca", "hazmat", "ofac-russia", "ofac-iran", "ofac-venezuela"],
             "Russian and Iranian crude is banned; Venezuelan crude needs General License 46E. Every barrel also pays the petroleum Superfund excise tax{SF2026} to the IRS."),
    "2710": (["epa-fuels", "epa-rfs", "irs-fuel-excise", "irs-superfund", "cbp-petroleum", "tsca", "hazmat", "ofac-russia", "ofac-iran", "ofac-venezuela"],
             "Gasoline, diesel and blendstocks fall under EPA's fuel rules and the Renewable Fuel Standard; gasoline, diesel and kerosene carry federal fuel excise tax. Lubricating oils and greases from China are on List 2 (+25%)."),
    "2711": (["doe-gas", "hazmat", "tsca", "ofac-russia", "ofac-iran", "ofac-venezuela"],
             "Natural gas and LNG imports need DOE authorization. Russian-origin LNG is banned."),
    "2712": (["tsca", "ofac-russia", "ofac-iran"], "Paraffin wax from China pays 7.5% (List 4A); the other waxes 25%."),
    "2713": (["tsca", "ofac-russia", "ofac-iran", "ofac-venezuela"], "Petroleum coke and bitumen are petroleum products under the Russia ban."),
    "2714": (["tsca", "ofac-iran"], None),
    "2715": (["tsca", "ofac-iran"], None),
    "2716": (["electricity", "ofac-iran"], "Electricity is Free from every country, including China."),
}
for g in te["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["ruleIds"], g["note"] = GROUP_RULES[g["heading"]]
EPA_FUEL_SUBS = ("2710.12.15", "2710.12.18", "2710.12.25", "2710.12.45", "2710.19.11", "2710.19.06", "2710.19.24", "2710.19.25", "2710.20.05", "2710.20.10", "2710.20.15")
EXCISE_SUBS = ("2710.12.15", "2710.12.18", "2710.19.11", "2710.19.16", "2710.19.24", "2710.19.25", "2710.19.26", "2710.20.10", "2710.20.15", "2710.20.25")
GAS_SUBS = ("2711.11", "2711.21")
for ln in te["lines"]:
    h = ln["heading"]
    sub8 = ln["hts"][:10]
    rules = list(GROUP_RULES[h][0])
    if h == "2710":
        rules = [r for r in rules if not ((r in ("epa-fuels", "epa-rfs") and not sub8.startswith(EPA_FUEL_SUBS)) or (r == "irs-fuel-excise" and not sub8.startswith(EXCISE_SUBS)))]
        if sub8.startswith(("2710.91", "2710.99")):
            rules = [r for r in rules if r not in ("irs-superfund",)]
    if h == "2711" and not ln["hts"].startswith(GAS_SUBS):
        rules = [r for r in rules if r != "doe-gas"]
    ln["ruleIds"] = rules
    dutiable = (ln["general"] or "Free") != "Free"
    levers = []
    if dutiable:
        levers += ["usmca", "fta"]
    if h in ("2707", "2708", "2710", "2711", "2712", "2713", "2714", "2715"):
        levers.append("petroleum-drawback")
    if h in ("2709", "2710"):
        levers.append("ftz")
    levers.append("origin")
    if h not in ("2704", "2716"):
        levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal or tax advice. Sanctions licenses change often; check OFAC's current general "
    "licenses before contracting, and the IRS for current excise tax rates."
)

apply_trade(d)

out = json.dumps(d, ensure_ascii=False, indent=2).replace("{SF2026}", SF2026)
assert "{SF2026}" not in out
open(sys.argv[2], "w").write(out)
print("ok")
