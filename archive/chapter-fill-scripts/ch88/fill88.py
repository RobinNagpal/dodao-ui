"""Fill the writer TODOs of the generated Chapter 88 (Aircraft, Spacecraft, and Parts Thereof) content file.

usage: python3 fill88.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 88, general note 6, Chapter 98, Chapter 99 subchapter III notes 2, 20,
21, 29, 30, 35, 43, 50, 51, 52), Proclamations 11040 (aircraft, Section 232) and 11055 (drones, Section 232), the
IEEPA / Section 122 / 2026 Section 301 documents, the USTR large-civil-aircraft notices, the 2017-2018 Commerce and ITC
determinations on large civil aircraft from Canada, eCFR (titles 14, 19, 22, 47; up to date as of 2026-10-08), the FCC
notices in the Federal Register, and UN Comtrade.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources88 import CH88, CH98, CH99, EXTRA, GN  # noqa: E402

ASOF = "2026-10-13"
ECFR_AS_OF = "2026-10-08"
E19 = "https://www.ecfr.gov/current/title-19"
E14 = "https://www.ecfr.gov/current/title-14"

d = json.load(open(sys.argv[1]))
d["asOf"] = ASOF
rows = d["overview"]["rateTable"]["rows"]
LINE = {r["hts"]: r for r in rows if r["htsCode10"]}
assert len(LINE) == 67, len(LINE)
MIL = {h for h, r in LINE.items() if any("Military" in x for x in [r["description"]] + r["ancestorPath"])}
print(sorted(MIL))
ia = d["industryAreas"]
CTRY = {c["country"]: c for c in ia["countries"]}
VARIED = "civilAircraftGn6" in (ia.get("variedFacts") or [])
OFF_LIST = {h for h in LINE if h.startswith("8802.60") or h.startswith("8804") or h.startswith("8805.10") or h.startswith("8805.21") or h.startswith("8807.90.30")}
ON_LIST = set(LINE) - OFF_LIST
assert len(ON_LIST) == 60, len(ON_LIST)
CIV = len(ON_LIST - MIL)
print("on list", len(ON_LIST), "military", len(MIL), "civil-eligible", CIV)


def money(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    if v >= 1e6:
        return f"${v / 1e6:.1f}M"
    return f"${v / 1e3:.0f}K"


# ------------------------------------------------------------------ trade facts (UN Comtrade, CIF)
ui = d["understandIndustry"]
TOT = ui["byYear"][-1]["totalUsd"]
PRIOR = ui["byYear"][-2]["totalUsd"]
BYC = {c["country"]: c for c in ui["byCountry"]}
BYL = {x["hs6"]: x for x in ui["byLine"]}
BHC = {}
for x in ui["byHeadingCountry"]:
    BHC[(x["heading"], x["country"])] = x["importsUsd"]
H = {}
for x in ui["byHeadingCountry"]:
    H[x["heading"]] = H.get(x["heading"], 0) + x["importsUsd"]
assert abs(TOT - 33849954259) < 1, TOT


def imp(c):
    return BYC[c]["importsUsd"]


def share(v):
    return f"{100 * v / TOT:.0f}%"


# ================================================================== overview
o = d["overview"]
o["h1"] = "HTS Chapter 88: Aircraft, Spacecraft, and Parts Thereof — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 88 Aircraft Tariffs: Airplanes, Helicopters, Drones & Aircraft Parts Duty Rates | KoalaGains",
    "shortDescription": "Searchable duty table for all 67 HTS Chapter 88 lines: airplanes, helicopters, gliders, spacecraft, parachutes, flight simulators, drones and aircraft parts. Almost all Free at base; when civil aircraft (general note 6) are exempt from the 2026 Section 301 and Brazil duties; the Section 232 drone duty of 25% to 100%; China's 25% List 1 duty.",
    "keywords": [
        "HTS Chapter 88",
        "aircraft tariffs",
        "aircraft parts tariffs",
        "civil aircraft tariff exemption",
        "drone tariffs",
        "hts code for aircraft parts",
        "hts code for drones",
        "hs code 8807",
        "hts code 8802",
        "hts code for helicopter parts",
        "parachute hs code",
        "aerospace tariffs",
        "aerospace and defense tariffs",
        "aircraft, spacecraft, and parts thereof",
        "Agreement on Trade in Civil Aircraft",
    ],
}
o["intro"] = (
    "Chapter 88 covers aircraft and spacecraft: balloons, gliders and hang gliders (8801), helicopters, airplanes, "
    "satellites and launch vehicles (8802), parachutes and paragliders (8804), launching gear and ground flight "
    "simulators (8805), unmanned aircraft (drones, 8806) and parts of aircraft and drones (8807). **66 of the 67 tariff "
    "lines are Free** under the general rate; only parachutes (8804) pay a base duty of 3%. The U.S. imported "
    f"**{money(TOT)}** of Chapter 88 goods in 2025, mostly airplanes, helicopters and aircraft parts from "
    "Canada, France, Germany, the United Kingdom, Brazil and Japan.\n\n"
    "What decides the duty today is **civil-aircraft status** and origin. Civil aircraft, engines, parts and ground "
    "flight simulators that meet the criteria of **general note 6** (the Agreement on Trade in Civil Aircraft: used in "
    "aircraft and covered by an FAA certificate or an FAA-recognized foreign airworthiness approval, not bought for the "
    "Department of Defense or Coast Guard unless certified) are exempt from the **2026 Section 301 duties** of 10% or "
    "12.5% (U.S. note 52(d), 9903.05.88) and from **Brazil's 25%** (note 50(a)(iv), 9903.05.05). So a certified civil "
    "airliner, helicopter or part enters **Free** from the EU, the UK, Japan, Brazil and most other countries. "
    "Articles that do not qualify (military aircraft and parts, and spacecraft and satellite parts, which are not on "
    "the civil-aircraft list) pay the Section 301 duty for their origin. **China** pays 25% under Section 301 List 1 "
    "on helicopters, airplanes, drones and parts (7.5% on balloons and gliders under List 4A), with no civil-aircraft "
    "exception. **Drones** of 8806 also pay the Section 232 duty that began September 3, 2026: +100% with thermal "
    "imaging or over 25 kg, +25% for other drones up to 25 kg (9903.08.21 / 9903.08.22). The 2019 Airbus-dispute "
    "duties on EU and UK aircraft (9903.89.05) have been suspended since 2021, and Proclamation 11040 (July 9, 2026) "
    "found aircraft imports a national-security threat but imposed **no tariff** for now."
)
o["stats"] = [
    {"label": "Tariff lines", "value": "67"},
    {"label": "Lines with a base-rate duty", "value": "1 of 67", "note": "Parachutes (8804.00.00), 3%"},
    {
        "label": "Lines with an extra duty for some origins",
        "value": "67 of 67",
        "note": "2026 Section 301: all 67 (60 lines are on the civil-aircraft list, so general-note-6 civil aircraft are exempt there); Brazil 25%: all 67 (same civil-aircraft exemption); China List 1, 3 or 4A: all 67; Section 232 drones: 16 lines of 8806 and 8807; Russia 35% in lieu of column 2: 31.",
    },
    {"label": "2025 imports", "value": money(TOT)},
    {"label": "Canada + France share", "value": share(imp("Canada") + imp("France"))},
]
G = {
    "8801": (
        "Balloons, airships, gliders and hang gliders: 3 lines, all Free. Non-powered aircraft that meet general note 6 are exempt from the 2026 Section 301 and Brazil duties; China pays 7.5% (List 4A).",
        ["hot air balloon", "glider", "sailplane", "hang glider", "airship", "dirigible"],
    ),
    "8802": (
        "Helicopters, airplanes by unladen weight, satellites and launch vehicles: 36 lines, all Free, with separate statistical lines for military and civil, new and used aircraft. Certified civil aircraft are exempt from the 2026 Section 301 duties; spacecraft (8802.60) are not on that list.",
        ["helicopter", "business jet", "airliner", "Airbus A320", "Embraer", "single engine airplane", "turboprop", "communications satellite", "launch vehicle"],
    ),
    "8804": (
        "Parachutes, paragliders, rotochutes and their parts: 1 line, 3% (Free under USMCA and most FTAs). Not on the civil-aircraft list, so the 2026 Section 301 duty applies to it.",
        ["parachute", "paraglider", "paramotor wing", "reserve parachute", "rotochute", "cargo parachute"],
    ),
    "8805": (
        "Aircraft launching gear, deck arrestors, air combat simulators and other ground flight simulators and their parts: 3 lines, all Free. Only flight simulators of 8805.29 are on the civil-aircraft exemption list.",
        ["flight simulator", "full flight simulator", "air combat simulator", "aircraft catapult", "arresting gear"],
    ),
    "8806": (
        "Unmanned aircraft by take-off weight, remote-controlled or not, and passenger drones: 11 lines, all Free at base. Since September 3, 2026 drones of 8806.21–8806.99 pay a Section 232 duty of 25% or 100% on top of other duties.",
        ["drone", "DJI drone", "quadcopter", "FPV drone", "agricultural drone", "thermal drone", "eVTOL passenger drone", "UAV"],
    ),
    "8807": (
        "Propellers and rotors, undercarriages, other parts of airplanes, helicopters and drones, and parts of communications satellites: 13 lines, all Free, with statistical lines for civil-aircraft use. The biggest import line of the chapter.",
        ["aircraft parts", "fuselage", "wing", "landing gear", "propeller", "helicopter rotor blade", "drone parts", "satellite parts"],
    ),
}
for g in o["productGroups"]:
    g["blurb"], g["searchExamples"] = G[g["heading"]]
o["workedExamples"] = [
    {
        "title": "A new airliner from France",
        "line": "8802.40.01.40",
        "body": "Passenger airplanes over 15,000 kg are **Free** under the general rate. France pays the EU's 2026 Section 301 duty of **10% in place of the base rate** (9903.05.39), but civil aircraft that meet general note 6 are exempt (U.S. note 52(d), heading 9903.05.88). A certified civil airliner therefore pays **$0**. The 15% large-civil-aircraft duty of 2020 (9903.89.05) has been suspended for EU products since 2021. A military transport (statistical suffix .20 or .30) cannot use the civil-aircraft exemption and pays 10%: **$10M on a $100M aircraft**.",
    },
    {
        "title": "A regional jet from Brazil",
        "line": "8802.30.01.30",
        "body": "Multiple-engine airplanes of 2,000–4,536 kg (and 8802.40 for heavier jets) are Free at base. Brazil pays **25%** (9903.05.01) plus the **12.5%** 2026 Section 301 duty (9903.05.27), 37.5% in all. A civil aircraft that meets general note 6 is exempt from both (notes 50(a)(iv) and 52(d), headings 9903.05.05 and 9903.05.88), so it pays **$0**. Without the civil-aircraft certification it would pay $375,000 on $1M.",
    },
    {
        "title": "Aircraft parts from Japan and China",
        "line": "8807.30.00.30",
        "body": "Other parts of airplanes and helicopters for civil aircraft are Free. From **Japan** the 2026 Section 301 duty is **12.5% in place of the base rate** (9903.05.49), lifted for general-note-6 civil aircraft parts (9903.05.88): **$0**. From **China** the same part pays the **25%** List 1 duty (9903.88.01) even when it is a certified civil aircraft part, because note 20 has no civil-aircraft exception; only the 12.5% (9903.05.31) is lifted. On $10,000 that is **$2,500**, or $3,750 for a non-civil part.",
    },
    {
        "title": "A small camera drone from China or Vietnam",
        "line": "8806.22.00.00",
        "body": "Remote-controlled drones of 250 g to 7 kg are Free at base. Since September 3, 2026 a drone without thermal imaging pays the **25%** Section 232 duty (9903.08.22) and one with thermal imaging **100%** (9903.08.21). From **China** add 12.5% (9903.05.31) and 25% List 1 (9903.88.01): **62.5%** without thermal imaging ($625 on a $1,000 drone) or **137.5%** with it. From **Vietnam**: 12.5% + 25% = **37.5%**, or 112.5% with thermal imaging. Drones on the Blue UAS lists or the FCC Conditional Approval list on September 2, 2026 start paying the drone duty on February 9, 2027.",
    },
    {
        "title": "A drone from Germany or the UK with allied critical components",
        "line": "8806.22.00.00",
        "body": "If the importer certifies that substantially all the drone's critical components and technology come from the U.S., Japan, South Korea, Taiwan, Switzerland, Liechtenstein, the EU or the UK (U.S. note 43(d)), an EU drone's Section 232 duty becomes **15% in all** (9903.08.24) and a UK drone's **+10%** (9903.08.23). The 2026 Section 301 duty still applies on top: the calculator gives **25%** for Germany (10% + 15%) and **20%** for the UK (10% + 10%); a drone that meets general note 6 drops the Section 301 part.",
    },
    {
        "title": "Parachutes from Canada",
        "line": "8804.00.00.00",
        "body": "Parachutes pay **3%**, the only base duty in the chapter. With a USMCA claim a Canadian parachute is **Free**, and note 52(g) (9903.05.93) also lifts the 10% Section 301 duty on Canada. Without the claim it pays 3% + 10% = **13%**. Parachutes are not on the civil-aircraft list, so general note 6 does not help.",
    },
]
snap = o["tradeSnapshot"]
snap["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
snap["source"] = "UN Comtrade, United States imports, HS chapter 88 (2025)"
snap["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
snap["biggestLines"] = [
    {"hts": "8807.30", "label": "Other parts of airplanes, helicopters or unmanned aircraft"},
    {"hts": "8802.40", "label": "Airplanes and other aircraft over 15,000 kg unladen"},
]
o["notes"] = {
    "chapterNotes": (
        "**Note 1.** For the purposes of this chapter, the expression \"unmanned aircraft\" means any aircraft, other than "
        "those of heading 8801, designed to be flown without a pilot on board. They may be designed to carry a payload or "
        "equipped with permanently integrated digital cameras or other equipment which would enable them to perform "
        "utilitarian functions during their flight. The expression \"unmanned aircraft\", however, does not cover flying "
        "toys, designed solely for amusement purposes (heading 9503).\n\n"
        "**Subheading note 1.** For the purposes of subheadings 8802.11 to 8802.40, the expression \"unladen weight\" means "
        "the weight of the machine in normal flying order, excluding the weight of the crew and of fuel and equipment other "
        "than permanently fitted items of equipment.\n\n"
        "**Subheading note 2.** For the purposes of subheadings 8806.21 to 8806.24 and 8806.91 to 8806.94, the expression "
        "\"maximum take-off weight\" means the maximum weight of the machine in normal flying order, at take-off, including "
        "the weight of payload, equipment and fuel.\n\n"
        "The statistical lines \"for use in civil aircraft\" of 8807 refer to general note 6 (footnote 2/), and the lines "
        "with a 1/ footnote refer to heading 9903.90.08 (Russia, 35% in lieu of the column 2 rate)."
    ),
    "additionalUsNotes": None,
}

# ================================================================== tariffUpdates
tu = d["tariffUpdates"]
have = {x["id"] for x in tu["sources"]}
for x in EXTRA:
    if x["id"] not in have:
        tu["sources"].append(x)
        have.add(x["id"])
tu["h1"] = "HTS Chapter 88: Aircraft, Spacecraft, and Parts Thereof — Tariff Updates"
tu["seo"] = {
    "title": "Aircraft & Drone Tariff Updates 2025–2026: Civil Aircraft Exemption, Section 232 Drones, Airbus Duties (HTS Ch. 88) | KoalaGains",
    "shortDescription": "What changed for aircraft, drone and aircraft-parts imports since 2025: the civil-aircraft exemptions in the 2025 UK, EU, Japan and Korea deals, the end of the IEEPA duties and Section 122, the 2026 Section 301 and Brazil duties and their civil-aircraft exemption, the Section 232 drone duty, the Section 232 aircraft finding with no tariff, and the suspended Airbus-dispute duties.",
    "keywords": [
        "aircraft tariffs 2026",
        "trump aircraft tariffs",
        "section 232 aircraft",
        "section 232 commercial aircraft",
        "section 232 unmanned aircraft systems",
        "drone tariffs",
        "airbus tariffs",
        "airbus boeing dispute tariffs",
        "eu aircraft tariffs",
        "uk aerospace tariffs",
        "brazil aircraft tariffs",
        "civil aircraft tariff exemption",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, "
    "and the current **2026 Revision 21** (in force October 9, 2026). The base rates did not change: 66 of the 67 "
    "Chapter 88 lines are Free in both, and parachutes stay at 3%.\n\n"
    "The extra duties changed a lot, and civil aircraft were treated differently from almost everything else. In 2025 "
    "aircraft paid the IEEPA duties: 25% (later 35%) on non-USMCA goods of Canada and Mexico and the reciprocal tariff "
    "on most other countries. Civil aircraft and parts were then exempted country by country as trade deals were "
    "implemented: the **UK** from June 30, 2025, the **EU** from September 1, **Japan** from September 16 and **South "
    "Korea**, **Switzerland** and **Liechtenstein** from November 14, 2025; Brazil's 40% IEEPA duty excepted them from "
    "the start. All IEEPA duties **ended on February 24, 2026**; the 10% Section 122 surcharge that replaced them "
    "(civil aircraft exempt, 9903.03.05) expired on **July 23, 2026**.\n\n"
    "Today the **2026 Section 301 duties** on 60 economies (from July 24, 2026) and **Brazil's 25%** (from July 22, "
    "2026) reach every line, with an exemption for general-note-6 civil aircraft; China pays its **2018–2019 Section 301** "
    "duties; and **drones** pay the **Section 232 drone duty** from September 3, 2026. **Proclamation 11040** (July 9, "
    "2026) found that imports of commercial aircraft, jet engines and parts threaten national security but imposed no "
    "tariff, directing negotiations with an update due within 180 days. No antidumping or countervailing duty order "
    "covers Chapter 88 goods."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 88 from any country: the 2026 Section 301 duties on 60 economies and their "
    "civil-aircraft exemption (note 52(d)), Brazil Section 301 (note 50), China Section 301 Lists 1, 3 and 4A (note 20), "
    "the Section 232 drone duty (note 43), Russia's column 2 and 35% rates (note 30) and the 200% Russian aluminum duty "
    "on one parts line (note 19), the pending Nicaragua duty (note 29), and the suspended large-civil-aircraft duties on "
    "EU and UK products (note 21). Also the ended IEEPA and Section 122 duties, the Section 232 aircraft action "
    "(Proclamation 11040, no tariff), the Canada Section 338 duties (which list no Chapter 88 line) and the 2017–2018 "
    "large civil aircraft AD/CVD case (no order). For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "67 of 67 lines", "note": "66 Free; parachutes 3%"},
    {"label": "Extra-duty programs in effect", "value": "5", "note": "2026 Section 301, Brazil 301, China 301, Section 232 drones, Russia"},
    {"label": "On the civil-aircraft list", "value": "60 of 67 lines", "note": "General-note-6 civil aircraft there are exempt from the 2026 Section 301 and Brazil duties"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
CIVIL = (
    "Civil aircraft, engines, parts and ground flight simulators that meet general note 6 are exempt (U.S. note 52(d), "
    "heading 9903.05.88) on the listed Chapter 88 provisions: 8801.00.00, 8802.11–8802.40, 8805.29, all of 8806 and "
    "8807.10, 8807.20, 8807.30 and 8807.90.90. Not listed: spacecraft and satellites (8802.60), parachutes (8804), "
    "launching gear and air combat simulators (8805.10, 8805.21) and parts of communications satellites (8807.90.30). "
    "Military aircraft are outside the definition."
)
ENDED = "The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026."
IE = {
    "ca-section-301": (
        f"Goods entered free under USMCA are exempt (note 52(g), 9903.05.93). {CIVIL} Canada's Section 338 duties (note 51, 9903.03.12–9903.03.14) list no Chapter 88 line; their civil-aircraft relief (9903.03.16) therefore changes nothing here. {ENDED}",
        "Canadian business jets, helicopters, regional aircraft and parts enter Free with either a USMCA claim or general note 6 certification. Only non-USMCA, non-certified goods (for example military parts) pay 10%.",
    ),
    "eu-section-301": (
        f"{CIVIL} No Chapter 88 line is on the EU exception list of note 52(j)(2). The 2019–2020 large-civil-aircraft duties (9903.89.05–9903.89.63) have been suspended for EU products since July 11, 2021 (note 21(x)). {ENDED}",
        "EU products pay at least 10%: the duty replaces the Free base rate. Certified civil aircraft and parts, including Airbus airliners, pay nothing; military articles and satellites pay 10%.",
    ),
    "bloc-at-section-232": (
        "Applies only when the importer certifies that substantially all the critical components and technology are products of the United States, Japan, South Korea, Taiwan, Switzerland, Liechtenstein, an EU member or the United Kingdom (U.S. note 43(d)); otherwise these countries pay 9903.08.21 / 9903.08.22 like everyone else. Companies with an approved onshoring plan import without the drone duty (9903.08.25 / 9903.08.26). For Blue UAS and FCC Conditional Approval list products the duty starts February 9, 2027.",
        "Drones and covered drone parts from the EU, Japan, South Korea, Switzerland, Liechtenstein and Taiwan pay 15% in all for the drone duty (with a 0% base, the full 15%) instead of 25% or 100%. The 2026 Section 301 duty is still added.",
    ),
    "gb-section-301": (
        f"{CIVIL} No Chapter 88 line is on the UK exception list of note 52(j)(1). The drone duty is +10% (9903.08.23) only with the note 43(d) critical-components certification; otherwise +25% or +100%. The large-civil-aircraft duties have been suspended for UK products since July 4, 2021 (note 21(w)). {ENDED}",
        "Certified UK civil aircraft parts, the UK's main Chapter 88 export, enter Free; other UK goods pay 10%. UK drones pay the drone duty on top.",
    ),
    "br-section-301": (
        "Civil aircraft that meet general note 6 are exempt from both duties: the 25% under note 50(a)(iv) (9903.05.05) and the 12.5% under note 52(d) (9903.05.88), on the same Chapter 88 provisions. No Chapter 88 line is on the general Brazil exemption list (note 50(a)(ii)). Brazil's 40% IEEPA duty (2025) also excepted civil aircraft; it ended February 24, 2026.",
        "Certified Embraer jets, parts and simulators enter Free. A non-certified article pays 37.5%: $375,000 on $1M.",
    ),
    "jp-section-301": (
        f"{CIVIL} {ENDED}",
        "Japanese products pay at least 12.5%: the duty replaces the Free base rate. Certified civil aircraft parts (most of Japan's $2.1B of Chapter 88 exports to the U.S. are parts of 8807) pay nothing.",
    ),
    "mx-section-301": (
        f"Goods entered free under USMCA are exempt (note 52(h), 9903.05.94). {CIVIL} {ENDED}",
        "Mexican aircraft parts ($1.7B in 2025) enter Free with a USMCA claim or general note 6 certification; otherwise 10%.",
    ),
    "ch-section-301": (
        f"{CIVIL} No Chapter 88 line is on the Swiss exception list of note 52(j)(3). {ENDED}",
        "Swiss products pay at least 12.5% in place of the Free base rate. Certified civil aircraft and parts, such as Pilatus aircraft, enter Free.",
    ),
    "kr-section-301": (
        f"{CIVIL} {ENDED}",
        "Korean products pay at least 12.5% in place of the Free base rate; certified civil aircraft parts enter Free.",
    ),
    "il-section-301": (
        f"{CIVIL} The U.S.-Israel FTA rate does not lift the duty (note 52(a)). {ENDED}",
        "Israeli civil aircraft and parts with general note 6 certification enter Free; military and other articles pay 12.5%.",
    ),
    "cn-section-301": (
        "The 12.5% (9903.05.31) does not apply to general-note-6 civil aircraft (note 52(d)). The China Section 301 duties have no civil-aircraft exception: List 1 (note 20(b), 9903.88.01, 25%) covers 8802, 8805, 8806 and 8807; List 3 (9903.88.03, 25%) covers parachutes (8804); List 4A (9903.88.15, 7.5%) covers balloons and gliders (8801). No product exclusion in note 20 covers a Chapter 88 line. USTR continued the 2018 actions pending its four-year review (91 FR 64212). The 2025 IEEPA duties on China ended February 24, 2026.",
        "Chinese aircraft parts pay 25% even when certified civil (37.5% otherwise); drones pay 25% + 12.5% + the 25% or 100% drone duty.",
    ),
    "au-section-301": (
        f"{CIVIL} {ENDED}",
        "Australian civil aircraft parts with general note 6 certification enter Free; other goods pay 12.5% (the AUSFTA rate does not lift it).",
    ),
    "tr-section-301": (
        f"{CIVIL} {ENDED}",
        "Turkish aircraft parts ($303M in 2025, nearly all 8807) enter Free when they are certified civil aircraft parts; otherwise 12.5%.",
    ),
    "vn-section-301": (
        f"{CIVIL} {ENDED}",
        "Vietnam was the largest drone supplier in 2025: its drones pay 12.5% plus the 25% or 100% drone duty.",
    ),
    "ru-section-301": (
        "Russia pays the column 2 rates (30% on aircraft, 27.5% on most parts) since 2022; on the 31 lines listed in note 30(b) (8802.20, 8806 and 8807 except satellite parts) heading 9903.90.08 sets 35% in lieu of column 2. Other parts of airplanes not for civil aircraft (8807.30.00.60) are also on the aluminum derivative list and pay the 200% Russian aluminum duty (9903.85.68). The 12.5% 2026 Section 301 duty is lifted for general-note-6 civil aircraft.",
        "Russian aircraft and parts are effectively priced out: a non-civil airplane part of 8807.30.00.60 pays 12.5% + 35% + 200% = 247.5%.",
    ),
    "other-section-301": (
        f"{CIVIL} {ENDED}",
        "Products of the other listed economies pay 10% or 12.5% unless they are certified civil aircraft articles.",
    ),
    "all-section-232-1": (
        "Covers drones of 8806.21–8806.99 (8806.10 passenger drones are not covered) and, only for systems over 25 kg MTOW that are not for retail delivery, agriculture or the Department of War, parts of 8807.10–8807.30 and 8807.90.90 (note 43(c)(2)); parts for manned aircraft or other drones enter under 9903.08.20 with no drone duty. Lower rates: 9903.08.23 / 9903.08.24 with the allied critical-components certification; 9903.08.25 / 9903.08.26 for approved onshoring plans. For Blue UAS and FCC Conditional Approval list products the duty starts February 9, 2027. Charged on top of FTA rates (note 43(b)); civil-aircraft status does not lift it.",
        "Drones up to 25 kg pay +25% without thermal imaging or +100% with it; drones over 25 kg and their covered parts pay +100%. Only manufacturing drawback is allowed for goods of trade-agreement partners with at least 85% partner content (Proclamation 11055 clause 8), and drones admitted to a foreign-trade zone must take privileged foreign status.",
    ),
}
for e in tu["inEffect"]:
    assert e["id"] in IE, e["id"]
    e["exemption"], e["whatItMeans"] = IE[e["id"]]
    if e["id"] == "cn-section-301" and "fr-2026-20510" not in e["sourceIds"]:
        e["sourceIds"].append("fr-2026-20510")
    if e["id"] in ("br-section-301",):
        e["sourceIds"].append("csms-69302472")
    if e["id"] == "bloc-at-section-232" or e["id"] == "all-section-232-1":
        pass
    if "section-301" in e["id"] and e["id"] not in ("br-section-301",) and "csms-69326983" not in e["sourceIds"]:
        e["sourceIds"].append("csms-69326983")

GEN_DETAIL = {
    "section-232-unmanned-aircraft-systems-2026-09-03": (
        "Section 232 drone duty takes effect",
        "Proclamation 11055 (August 13, 2026) imposed Section 232 duties on unmanned aircraft systems and components (U.S. note 43). In Chapter 88: +100% on drones over 25 kg (8806.24, .29, .94, .99) and on drones up to 25 kg with thermal imaging (9903.08.21), +25% on drones up to 25 kg without thermal imaging (9903.08.22), and +100% on parts of 8807 only for drone systems over 25 kg (not retail-delivery, agricultural or Department of War). Products of the EU, Japan, South Korea, Taiwan, Switzerland and Liechtenstein pay 15% in all, and the UK +10%, with a critical-components certification (9903.08.23 / .24). Approved onshoring plans import duty-free (9903.08.25 / .26).",
    ),
    "section-232-unmanned-aircraft-systems-scheduled-2027-02-09": (
        "Drone duty for Blue UAS and FCC Conditional Approval products from February 9, 2027",
        "For companies and products on the Department of War's Blue UAS Cleared List or Blue UAS Framework, or the FCC's Conditional Approval list, on September 2, 2026, and their components, the Section 232 drone duty starts 180 days after the proclamation: February 9, 2027 (Proclamation 11055 clause 7).",
    ),
    "section-301-2026-60-economies-2026-07-24": (
        "2026 Section 301 duties on 60 economies; civil aircraft exempt",
        "The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect, reaching all 67 Chapter 88 lines. Civil aircraft, engines, parts and ground flight simulators that meet general note 6 are exempt on the 60 lines of the listed provisions (U.S. note 52(d), 9903.05.88), whether or not \"Free (C)\" is claimed. Spacecraft, parachutes, launching gear, air combat simulators and satellite parts are not on that list. Canadian and Mexican goods entered under USMCA are exempt (notes 52(g)–(h)).",
    ),
    "section-301-brazil-2026-07-22": (
        "Brazil Section 301: 25%, civil aircraft exempt",
        "The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect. Civil aircraft that meet general note 6 are exempt on the same provisions as note 52(d) (note 50(a)(iv), 9903.05.05), which covers Embraer aircraft and parts. Other Chapter 88 goods of Brazil pay 25% plus the 12.5% 2026 Section 301 duty.",
    ),
    "section-301-nicaragua-scheduled-2027-01-01": (
        "Section 301 tariff on Nicaragua phases in from 2027",
        "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every Chapter 88 line. The rate is 0% in 2026.",
    ),
    "section-232-aluminum-russia-2025-03-12": (
        "200% Section 232 duty on Russian aluminum reaches one parts line",
        "Proclamation 10895 kept the 200% duty on Russian aluminum and derivatives (9903.85.68). In Chapter 88 the derivative list includes other parts of airplanes and helicopters not for civil aircraft (8807.30.00.60), so Russian-origin parts there pay 200% on top of the column 2-based rate. The same 200% applies to articles of any origin made with aluminum smelted or cast in Russia; the calculator does not model that case.",
    ),
}
for c in tu["changes"]:
    if c["id"] in GEN_DETAIL:
        c["title"], c["detail"] = GEN_DETAIL[c["id"]]
    elif c["id"] == "base-rates":
        c["detail"] = "All 67 Chapter 88 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition; no line was added, removed or renumbered. 66 lines are Free; parachutes (8804) are 3%."
    assert "TODO" not in c["detail"], c["id"]
for c in tu["changes"]:
    if c["id"] == "section-301-2026-60-economies-2026-07-24":
        c["now"] = "+10% to +12.5% (GN6 civil aircraft exempt)"
        c["sourceIds"].append("csms-69326983")
    if c["id"] == "section-301-brazil-2026-07-22":
        c["now"] = "+25% (GN6 civil aircraft exempt)"
        c["sourceIds"].append("csms-69302472")


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    for i in ids:
        assert i in have, (id, i)
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


tu["changes"] += [
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their anniversaries and remain in effect pending the statutory review. The 25% List 1 duty on Chinese helicopters, airplanes, drones and aircraft parts continues.",
       None, None, "China", ["fr-2026-20510"]),
    ch("fcc-uas-import", "pending", "2026-08-03", "Published", "FCC proposes to bar imports of certain foreign military-grade drones",
       "The FCC's Public Safety and Homeland Security Bureau and Office of Engineering and Technology sought comment (due September 2, 2026) on prohibiting the continued importation and marketing of certain military-grade foreign-made drones and drone critical components on the FCC Covered List, under 47 CFR 2.939. No final action had been published by October 13, 2026. The Covered List already bars new FCC equipment authorizations for drones and drone critical components produced in a foreign country (47 CFR 2.903; 91 FR 57798).",
       None, None, "All", ["fr-2026-15659", "fr-2026-18535"]),
    ch("procl-11040-update", "pending", "2026-07-15", "Published", "Section 232 aircraft: negotiations, update due by January 5, 2027",
       "Proclamation 11040 directs the Secretary of Commerce and the Trade Representative to negotiate agreements on imports of commercial aircraft, jet engines and parts and to update the President within 180 days (by January 5, 2027). The President may consider other remedies, including tariffs, if no agreement is reached or it is not carried out (19 U.S.C. 1862(c)(3)(A)).",
       None, None, "All", ["procl-11040"]),
    ch("procl-11040", "reference", "2026-07-09", "Signed", "Section 232 aircraft finding: no tariff imposed",
       "Commerce found that imports of commercial aircraft, jet engines and their parts threaten to impair national security and recommended negotiations and no immediate tariffs. Proclamation 11040 concurred and imposed no duty, so certified civil aircraft and parts still enter at the rates above. Chapter 99 has no heading for this action.",
       None, None, "All", ["procl-11040", "fr-2025-08500"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026.", "+10% (civil aircraft exempt)", "None", "All",
       ["procl-11012", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still exempt Canadian and Mexican goods from the 2026 Section 301 duty.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; civil aircraft exempt",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Civil aircraft, engines, parts and simulators that met general note 6 were exempt on the listed provisions (9903.03.05), and USMCA goods of Canada and Mexico were exempt (9903.03.07, 9903.03.08). Drones and other non-certified articles paid 10%.",
       "Varied by country", "+10% (civil aircraft and USMCA goods exempt)", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("kr-ch-civil-aircraft", "extraDuty", "2025-11-14", "Effective", "South Korea, Switzerland and Liechtenstein: civil aircraft exempted from the reciprocal tariff",
       "Implementing the U.S.-Korea deal and the U.S.-Switzerland-Liechtenstein framework, Commerce exempted civil aircraft (other than military and unmanned aircraft), engines, parts and simulators meeting general note 6 from the countries' reciprocal tariffs (headings 9903.02.81, 9903.02.85, 9903.02.90), effective for goods entered from November 14, 2025. Ended with all IEEPA duties on February 24, 2026.",
       "15% (all-inclusive)", "Free for civil aircraft (ended)", "South Korea, Switzerland, Liechtenstein", ["fr-2025-21940", "fr-2025-23316"]),
    ch("jp-civil-aircraft", "extraDuty", "2025-09-16", "Effective", "Japan: civil aircraft exempted from the reciprocal tariff",
       "Executive Order 14345 and Commerce's notice exempted Japanese products under the Agreement on Trade in Civil Aircraft, except unmanned aircraft, from the 15% reciprocal tariff (9903.96.02). Ended with all IEEPA duties on February 24, 2026.",
       "15% (all-inclusive)", "Free for civil aircraft (ended)", "Japan", ["eo-14345", "fr-2025-17908"]),
    ch("eu-civil-aircraft", "extraDuty", "2025-09-01", "Effective", "EU: civil aircraft and parts exempted from the reciprocal tariff",
       "Under Executive Order 14346 and the U.S.-EU framework, Commerce exempted EU civil aircraft, engines, parts and simulators meeting general note 6 from the 15% reciprocal tariff (heading 9903.02.76), retroactive to goods entered from September 1, 2025 (notice published September 25). Ended with all IEEPA duties on February 24, 2026.",
       "15% (all-inclusive)", "Free for civil aircraft (ended)", "European Union", ["eo-14346", "fr-2025-18660"]),
    ch("brazil-ieepa-40", "extraDuty", "2025-08-06", "Effective", "Brazil: 40% IEEPA duty; civil aircraft excepted",
       "Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77). Civil aircraft, engines, parts and simulators meeting general note 6 were excepted (9903.01.82, U.S. note 2(x)(iv)), so certified Embraer aircraft and parts paid only the 10% reciprocal tariff. Ended February 24, 2026.",
       "None", "+40% (civil aircraft excepted; ended)", "Brazil", ["eo-14323"]),
    ch("drone-232-initiation", "reference", "2025-07-01", "Initiated", "Section 232 investigation of drones begins",
       "Commerce initiated a Section 232 investigation of imports of unmanned aircraft systems and their parts and components (comments due August 6, 2025). It led to Proclamation 11055.",
       None, None, "All", ["fr-2025-13365"]),
    ch("uk-civil-aircraft", "extraDuty", "2025-06-30", "Effective", "UK: civil aircraft exempted from the 10% reciprocal tariff",
       "Executive Order 14309 implemented the U.S.-UK Economic Prosperity Deal; from June 30, 2025 UK civil aircraft (all aircraft other than military aircraft), engines, parts and simulators meeting general note 6 were exempt from the 10% reciprocal tariff (9903.96.01, U.S. note 35(a)). Ended with all IEEPA duties on February 24, 2026.",
       "+10%", "Free for civil aircraft (ended)", "United Kingdom", ["eo-14309", "fr-2025-12060"]),
    ch("aircraft-232-initiation", "reference", "2025-05-01", "Initiated", "Section 232 investigation of commercial aircraft and jet engines begins",
       "Commerce initiated a Section 232 investigation of imports of commercial aircraft, jet engines and their parts (comments due June 3, 2025). It concluded with Proclamation 11040 (no tariff).",
       None, None, "All", ["fr-2025-08500"]),
    ch("cn-ieepa", "extraDuty", "2025-05-14", "Effective", "China IEEPA duties: reciprocal rate cut to 10%",
       "Chinese aircraft, drones and parts paid IEEPA duties on top of List 1: a fentanyl-related 10% from February 4, 2025 (20% from March 4, back to 10% from November 10, 2025) and a reciprocal duty that rose to 125% in April 2025 and was cut to 10% from May 14, 2025. No civil-aircraft exception applied. All ended February 24, 2026.",
       "+125% reciprocal", "+10% reciprocal (ended)", "China", ["eo-14195", "eo-14228", "eo-14259", "eo-14266", "eo-14298", "eo-14357"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff covers aircraft and parts",
       "10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025, later country-specific rates. No Chapter 88 line was on the Annex II exemption list, so aircraft, drones and parts paid it until the country deals above exempted civil aircraft. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("usmca-exempt", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Non-USMCA aircraft and parts kept paying (35% for Canada from August 1, 2025). Ended February 24, 2026.",
       "+25%", "+25%, USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232", "eo-14325"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including aircraft and parts. Ended February 24, 2026.",
       "None", "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194"]),
    ch("lca-suspend-5y", "reference", "2021-07-11", "Effective", "Airbus-dispute duties suspended for five years",
       "After the June 2021 U.S.-EU and U.S.-UK understandings on large civil aircraft, USTR suspended the Section 301 large-civil-aircraft duties for five years, from July 4, 2021 for UK goods and July 11, 2021 for EU goods. Revision 21 still says the duties (9903.89.05–9903.89.63) do not apply (U.S. note 21(w)–(x)); no notice reinstating them had been published by October 13, 2026.",
       "+15% on large civil aircraft", "Suspended", "EU, United Kingdom", ["ustr-lca-suspend", "hts-chapter-99"]),
    ch("lca-suspend-4m", "reference", "2021-03-11", "Effective", "Airbus-dispute duties first suspended for four months",
       "USTR suspended the large-civil-aircraft duties for four months on UK goods from March 4, 2021 and on EU goods from March 11, 2021, following joint statements with the UK and the EU.",
       "+15% on large civil aircraft", "Suspended", "EU, United Kingdom", ["ustr-lca-uk-2021", "ustr-lca-eu-2021"]),
    ch("lca-15", "extraDuty", "2020-03-18", "Effective", "Large-civil-aircraft duty raised to 15%",
       "USTR raised the Section 301 duty on new airplanes over 30,000 kg (statistical numbers 8802.40.0040, .0060, .0070) from France, Germany, Spain and the UK from 10% to 15% (9903.89.05).",
       "+10%", "+15%", "France, Germany, Spain, United Kingdom", ["ustr-lca-2020"]),
    ch("lca-10", "extraDuty", "2019-10-18", "Effective", "Section 301 duty on Airbus aircraft in the WTO dispute",
       "USTR imposed a 10% Section 301 duty on new large civil aircraft from France, Germany, Spain and the UK, enforcing U.S. WTO rights in the large-civil-aircraft (Airbus) subsidies dispute.",
       "None", "+10%", "France, Germany, Spain, United Kingdom", ["ustr-lca-2019"]),
    ch("lca-canada-itc", "reference", "2018-02-20", "Published", "No AD/CVD order on large civil aircraft from Canada",
       "Commerce had found subsidies and dumping of 100- to 150-seat large civil aircraft from Canada (subheading 8802.40.00), but the ITC determined that the U.S. industry was not materially injured or threatened, so no antidumping or countervailing duty order was issued. No AD/CVD order covers any Chapter 88 good today.",
       None, None, "Canada", ["itc-lca-2018", "ita-lca-cvd", "ita-lca-ad"]),
]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ================================================================== understandIndustry
de = BYC["Germany"]
ui["h1"] = "HTS Chapter 88: Aircraft, Spacecraft, and Parts Thereof — U.S. Import Statistics"
ui["seo"] = {
    "title": "U.S. Aircraft & Aircraft Parts Imports by Country: Canada, France, Germany, UK, Brazil (HTS Ch. 88) | KoalaGains",
    "shortDescription": f"Where U.S. imports of aircraft, helicopters, drones and aircraft parts come from, 2020–2025: {money(TOT)} in 2025, led by Canada and France. By country, by product and over time, from UN Comtrade.",
    "keywords": [
        "us aircraft imports",
        "aircraft parts imports by country",
        "us imports of aircraft from canada",
        "airbus imports us",
        "drone imports by country",
        "HTS Chapter 88 import statistics",
        "aerospace imports",
    ],
}
ui["byYearCaption"] = "U.S. imports of Chapter 88 goods each year, split into the two largest 2025 suppliers (Canada and France) and everyone else."
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
d8806 = BYL
drones25 = H.get("8806", 0)
ui["why"] = (
    f"U.S. imports of Chapter 88 goods were **{money(TOT)} in 2025**, down {100 * (PRIOR - TOT) / PRIOR:.1f}% from "
    f"{money(PRIOR)} in 2024, the highest year in the series, and up from {money(ui['byYear'][0]['totalUsd'])} in 2020. "
    f"Two product groups make up almost all of it: **parts** of aircraft and drones (8807, {money(H['8807'])}), of which "
    f"other parts of airplanes and helicopters (8807.30) alone were {money(BYL['8807.30']['importsUsd'])}, and **complete "
    f"aircraft** (8802, {money(H['8802'])}), mainly airplanes over 15,000 kg ({money(BYL['8802.40']['importsUsd'])}, down "
    f"from {money(BYL['8802.40']['priorImportsUsd'])}) and 2,000–15,000 kg ({money(BYL['8802.30']['importsUsd'])}).\n\n"
    f"**Canada** ({money(imp('Canada'))}, {share(imp('Canada'))}) ships both complete aircraft "
    f"({money(BHC[('8802', 'Canada')])}) and parts ({money(BHC[('8807', 'Canada')])}). **France** ({money(imp('France'))}) "
    f"is mostly complete aircraft ({money(BHC[('8802', 'France')])}), as are **Germany** ({money(imp('Germany'))}, down "
    f"from {money(de['priorImportsUsd'])} in 2024) and **Brazil** ({money(imp('Brazil'))}, {money(BHC[('8802', 'Brazil')])} "
    f"of aircraft). The **United Kingdom** ({money(imp('United Kingdom'))}), **Japan** ({money(imp('Japan'))}) and "
    f"**Mexico** ({money(imp('Mexico'))}) ship almost only parts.\n\n"
    f"**Drones** (8806) were {money(drones25)} in 2025, down from {money(480504491)} in 2024; small remote-controlled "
    f"drones of 250 g to 7 kg (8806.22) fell from {money(BYL['8806.22']['priorImportsUsd'])} to "
    f"{money(BYL['8806.22']['importsUsd'])}. Vietnam ({money(BHC[('8806', 'Viet Nam')])}) and China "
    f"({money(BHC[('8806', 'China')])}) were the largest drone suppliers.\n\n"
    "2025 is the latest full year of trade data, so the 2026 Section 301 and Section 232 drone duties are not yet "
    "visible in these figures. UN Comtrade does not say which imports were certified civil aircraft articles, the "
    "status that decides whether the 2026 Section 301 duties apply. Duty-collected figures aren't available from an "
    "official source yet."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 88 (retrieved 2026-10-13)", "url": "https://comtradeplus.un.org/"},
]
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Aircraft deliveries are lumpy: a few airliners can move a country's total by hundreds of millions of dollars from one year to the next."

# ================================================================== industryAreas
ihave = {x["id"] for x in ia["sources"]}
for x in EXTRA:
    if x["id"] in ("hts-gn", "eo-14389", "procl-11012", "fr-2026-20510", "ustr-lca-suspend") and x["id"] not in ihave:
        ia["sources"].append(x)
        ihave.add(x["id"])
ia["h1"] = "HTS Chapter 88: Aircraft, Spacecraft, and Parts Thereof — Tariff Rates by Country"
ia["seo"] = {
    "title": "Aircraft & Drone Tariff Rates by Country: Canada, France, UK, Brazil, Japan, China (HTS Ch. 88) | KoalaGains",
    "shortDescription": "The total U.S. tariff on aircraft, aircraft parts and drones by country: Free for certified civil aircraft from most suppliers, 10% to 37.5% otherwise, 25% to 37.5% from China, and 25% to 137.5% on drones under the Section 232 drone duty.",
    "keywords": [
        "aircraft tariffs canada",
        "canadian aircraft tariffs",
        "eu aircraft tariffs",
        "brazil aircraft tariffs",
        "uk aerospace tariffs",
        "chinese drone tariffs",
        "dji tariffs",
        "aircraft parts tariff by country",
    ],
}
civil_note = (
    "Cells show two totals where it matters: **civil aircraft** (the article meets general note 6, the Agreement on Trade "
    "in Civil Aircraft, SPI \"C\": it is used in aircraft and covered by an FAA certificate or an FAA-recognized foreign "
    "approval, so the 2026 Section 301 duty is lifted by 9903.05.88 and Brazil's 25% by 9903.05.05) and **not civil "
    "aircraft** (military articles, uncertified goods, or no claim). A total with no label in a cell with labelled totals "
    "belongs to lines that are not on the civil-aircraft list, so the answer does not change their duty."
    if VARIED
    else "The totals assume the article is **not** a certified civil aircraft article; civil aircraft that meet general note 6 are exempt from the 2026 Section 301 and Brazil duties, which makes most aircraft and parts Free (see the rule under each country)."
)
ia["intro"] = (
    "Each cell below is the base rate for that product group plus the extra duties for that country, minus any "
    "preference, from the current tariff schedule. Almost every Chapter 88 line is Free at base, so the totals are the "
    "extra duties.\n\n"
    f"{civil_note} Spacecraft, parachutes, launching gear, air combat simulators and satellite parts are not on the "
    "civil-aircraft list and always pay the Section 301 duty for their origin. China's 25% List 1 duty has no "
    "civil-aircraft exception. **Drones** (8806) show a range: +25% (no thermal imaging) or +100% (thermal imaging, or "
    "over 25 kg) under Section 232, on top of the country's duties; passenger drones (8806.10) are outside the drone "
    "duty. The lower partner rates for drones (15% in all for the EU, Japan, Korea and Switzerland; +10% for the UK) "
    "need a critical-components certification and are not shown."
)
L = {
    "Canada": "USMCA goods: Free (note 52(g), 9903.05.93). Otherwise +10% (9903.05.29), lifted for general-note-6 civil aircraft (9903.05.88). Parachutes 3% at base (Free with USMCA). Drones: +25% or +100% Section 232 even with USMCA. No Chapter 88 line is on the Section 338 lists. The 2025 IEEPA duty (35%) ended February 24, 2026.",
    "France": "EU: 10% in place of the Free base rate (9903.05.39); Free for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% (15% in all with the critical-components certification, 9903.08.24). The suspended Airbus-dispute duties (9903.89.05) and the ended 15% IEEPA rate are not applied.",
    "Germany": "EU: 10% in place of the Free base rate (9903.05.39); Free for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% (15% in all with the critical-components certification, 9903.08.24). The suspended Airbus-dispute duties (9903.89.05) and the ended 15% IEEPA rate are not applied.",
    "Italy": "EU: 10% in place of the Free base rate (9903.05.39); Free for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% (15% in all with the critical-components certification, 9903.08.24). The ended 15% IEEPA rate is not applied.",
    "United Kingdom": "+10% (9903.05.81), lifted for general-note-6 civil aircraft (9903.05.88); parachutes 3% + 10%. Drones: +25% or +100% (+10% with the critical-components certification, 9903.08.23). The suspended Airbus-dispute duties and the ended 10% IEEPA tariff are not applied.",
    "Brazil": "+25% (9903.05.01) and +12.5% (9903.05.27) = 37.5%; both lifted for general-note-6 civil aircraft (9903.05.05, 9903.05.88), so certified Embraer aircraft and parts are Free. Drones add +25% or +100%. The 2025 IEEPA duties (10% + 40%) ended February 24, 2026.",
    "Japan": "12.5% in place of the Free base rate (9903.05.49); Free for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% (15% in all with the critical-components certification). The ended 15% IEEPA rate is not applied.",
    "Mexico": "USMCA goods: Free (note 52(h), 9903.05.94). Otherwise +10% (9903.05.55), lifted for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% Section 232 even with USMCA. The 2025 IEEPA duty ended February 24, 2026.",
    "Switzerland": "12.5% in place of the Free base rate (9903.05.74); Free for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% (15% in all with the critical-components certification). The ended IEEPA rate is not applied.",
    "South Korea": "12.5% in place of the Free base rate (9903.05.71); Free for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% (15% in all with the critical-components certification). The ended IEEPA rate is not applied.",
    "Israel": "+12.5% (9903.05.47), lifted for general-note-6 civil aircraft (9903.05.88); the U.S.-Israel FTA rate (Free on parachutes) does not remove it. Drones: +25% or +100%.",
    "China": "+12.5% (9903.05.31), lifted for general-note-6 civil aircraft, plus Section 301 List 1 +25% (9903.88.01) on 8802, 8805, 8806 and 8807 with no civil-aircraft exception, List 3 +25% on parachutes (9903.88.03) and List 4A +7.5% on balloons and gliders (9903.88.15). Drones add +25% or +100%. The 2025 IEEPA duties ended February 24, 2026.",
    "Australia": "+12.5% (9903.05.23), lifted for general-note-6 civil aircraft (9903.05.88); the AUSFTA rate does not remove it. Drones: +25% or +100%.",
    "Türkiye (Turkey)": "+12.5% (9903.05.79), lifted for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100%.",
    "Vietnam": "+12.5% (9903.05.84), lifted for general-note-6 civil aircraft (9903.05.88). Drones: +25% or +100% Section 232; Vietnam was the largest U.S. drone supplier in 2025.",
    "Any other country": "Free (base rate only) for countries outside the 60 Section 301 economies; the listed economies pay 10% or 12.5% (9903.05.20–9903.05.83) unless the article is a general-note-6 civil aircraft article. Drones add +25% or +100% from every country. Russia (column 2 rates, 35% in lieu on 31 lines, 200% on Russian aluminum parts) and other column 2 countries are not in this range.",
}
for c in ia["countries"]:
    assert c["country"] in L, c["country"]
    c["rule"]["label"] = L[c["country"]]
    if c["country"] == "China" and "fr-2026-20510" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].append("fr-2026-20510")
    if c["country"] in ("France", "Germany", "Italy", "United Kingdom") and "ustr-lca-suspend" not in c["rule"]["sourceIds"]:
        c["rule"]["sourceIds"].append("ustr-lca-suspend")
    c["rule"]["sourceIds"].append("hts-gn") if "hts-gn" not in c["rule"]["sourceIds"] else None
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    (
        "Civil aircraft: on the 60 lines of the note 52(d) list each total is shown twice: \"civil aircraft\" (meets general note 6, SPI C; relieved from the 2026 Section 301 duty by 9903.05.88 and, for Brazil, from the 25% by 9903.05.05) and \"not civil aircraft\". Unlabelled totals are lines off that list (spacecraft 8802.60, parachutes, launching gear 8805.10, air combat simulators 8805.21, satellite parts 8807.90.30). Military statistical lines (for example 8802.40.01.15) can never be civil aircraft, so only their \"not civil aircraft\" total applies. The Section 232 metals reliefs for civil aircraft (9903.96.01, 9903.96.02, 9903.02.76, 9903.02.81 for the UK, Japan, the EU and South Korea) change nothing here, because no Section 232 metals duty reaches Chapter 88 goods from those countries. China's List 1 duty and the drone duty apply either way."
        if VARIED
        else "Civil aircraft: the totals are for an article that does not meet general note 6. A general-note-6 civil aircraft article on the note 52(d) list is exempt from the 2026 Section 301 duty (9903.05.88) and, for Brazil, from the 25% (9903.05.05)."
    ),
    "The IEEPA duties (9903.01.xx, 9903.02.xx), including their civil-aircraft exemptions (9903.02.76, 9903.02.81, 9903.96.01, 9903.96.02), are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "The large-civil-aircraft Section 301 duties on EU and UK products (9903.89.05–9903.89.63) are suspended (U.S. note 21(w)–(x)) and not applied. Proclamation 11040 (Section 232 aircraft) imposed no duty.",
    "Drones: the Section 232 drone duty is shown at its general rates (9903.08.21 / 9903.08.22); the partner rates (9903.08.23 / 9903.08.24), onshoring-plan relief (9903.08.25 / 9903.08.26) and the February 9, 2027 start for Blue UAS and FCC Conditional Approval list products are not applied. Parts of 8807 are shown without the drone duty (parts for manned aircraft or drones up to 25 kg, 9903.08.20).",
    "No antidumping or countervailing duty order covers Chapter 88 goods.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 19, 20, 21, 29, 30, 35, 43, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. "
    "No Chapter 88 line is on the 2026 Section 301 general exemption lists (note 52(b)–(c)) or any country exception "
    "list in note 52(j). 60 of the 67 lines (8801.00.00, 8802.11–8802.40, 8805.29, 8806 and 8807 except 8807.90.30) "
    "are on the civil-aircraft list of note 52(d) (9903.05.88) and of note 50(a)(iv) for Brazil (9903.05.05); no "
    "Chapter 88 line is on the Brazil general exemption list (note 50(a)(ii)). Canada's Section 338 lists (note 51(b)) "
    "name no Chapter 88 line. China: 8802, 8805, 8806 and 8807 are on List 1 (note 20(b)), 8804 on List 3 (note "
    "20(f)) and 8801 on List 4A, with no product exclusion in effect. Note 43(c) lists 8806.21–8806.99 and four 8807 "
    "subheadings for the drone duty. Note 30(b) lists 31 Chapter 88 lines (35% in lieu of column 2 for Russia), and "
    "8807.30.00.60 is on the aluminum derivative list used by the 200% Russian aluminum duty (note 19)."
)

# ================================================================== tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "HTS Chapter 88: Aircraft, Spacecraft, and Parts Thereof — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Aircraft, Drones & Aircraft Parts: Civil Aircraft Certification, FAA Rules & Duty Savings (HTS Ch. 88) | KoalaGains",
    "shortDescription": "Tariff engineering for HTS Chapter 88: claim the general note 6 civil-aircraft exemption (19 CFR 10.183), use USMCA, the drone partner and onshoring rates, repairs-abroad and returned-goods provisions, temporary importation under bond and drawback, and meet FAA airworthiness, registration, FCC and ITAR rules.",
    "keywords": [
        "importing an aircraft into the united states",
        "how to import an aircraft into the us",
        "civil aircraft tariff exemption",
        "general note 6 civil aircraft",
        "19 CFR 10.183",
        "aircraft parts tariff exemption",
        "drone import requirements",
        "HTS Chapter 88 tariff engineering",
    ],
}
te["intro"] = (
    "Almost every Chapter 88 line is Free under the general rate, so the levers are about the extra duties, and the "
    "biggest one is **civil-aircraft status**. An aircraft, engine, part or ground flight simulator that meets general "
    "note 6 (used in aircraft and covered by an FAA certificate or an FAA-recognized foreign airworthiness approval) is "
    "exempt from the 2026 Section 301 duties and Brazil's 25%. The importer claims it by entering the goods with special "
    "program indicator **\"C\"** where a \"Free (C)\" rate is printed, is deemed to certify civil use, and must keep the "
    "order or contract and airworthiness evidence (19 CFR 10.183). For Chapter 99 relief, notes 52(d) and 50(a)(iv) "
    "apply whether or not \"Free (C)\" is claimed, but the article must still meet general note 6.\n\n"
    "Then: claim USMCA for Canadian and Mexican goods; for drones, use the partner critical-components certification or "
    "an approved onshoring plan; use the Chapter 98 provisions for aircraft and parts repaired abroad, returned or "
    "brought in temporarily; and recover duties by drawback. Before an imported aircraft can fly it needs FAA "
    "airworthiness acceptance and U.S. registration; drones also need FCC authorization and, if military, ITAR rules "
    "apply. Each rule and lever links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["disclaimer"] = "A checklist of where the rules are, with links to the regulations; not legal advice. Whether an article meets general note 6 depends on its FAA certification and end use; confirm with CBP (a binding ruling under 19 CFR part 177) and the FAA before importing."
HTS99 = {"label": "HTSUS Ch. 99, subch. III, U.S. notes 50 and 52", "url": CH99}
te["levers"] = [
    {
        "id": "civil-aircraft",
        "title": "Claim civil-aircraft status (general note 6)",
        "saves": "10% or 12.5% (2026 Section 301) and, for Brazil, 25%: certified civil aircraft and parts on the note 52(d) list pay none of them. Does not lift China's List 1 duty or the drone duty.",
        "appliesTo": "8801.00.00, 8802.11–8802.40, 8805.29, 8806, 8807.10, 8807.20, 8807.30, 8807.90.90 (not military aircraft, spacecraft, parachutes or satellite parts)",
        "document": "Evidence that the article is used as original or replacement equipment in aircraft and is manufactured or operated under an FAA certificate or an FAA-recognized foreign airworthiness approval (or a pending or future application by a type and production certificate holder): the written order or contract plus the airworthiness documents, kept for CBP (19 CFR 10.183(e)). Enter with SPI \"C\" where \"Free (C)\" is printed; the importer is deemed to certify civil use.",
        "caveat": "Articles purchased for the Department of Defense or the Coast Guard qualify only if they meet the use test and are FAA-certified or covered by an accepted application (19 CFR 10.183(b)). A claim may be made by amending the entry before liquidation is final, but refunds carry no interest (general note 6(a)).",
        "citations": [
            {"label": "HTSUS General Note 6", "url": GN},
            {"label": "19 CFR 10.183", "url": f"{E19}/section-10.183"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 50(a)(iv) and 52(d)", "url": CH99},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican aircraft and parts",
        "saves": "10% of value: the 2026 Section 301 duty on Canada (9903.05.29) or Mexico (9903.05.55), and the 3% base rate on parachutes",
        "appliesTo": "Originating goods of Canada and Mexico, every heading",
        "document": "A USMCA certification of origin from the importer, exporter or producer, in the importer's possession when the claim is made (19 CFR 182.12). Rules of origin: General Note 11.",
        "caveat": "USMCA does not lift the Section 232 drone duty (note 43(b)). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": f"{E19}/section-182.12"},
            {"label": "HTSUS General Note 11 (USMCA)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "uas-partner",
        "title": "Drones: certify allied critical components",
        "saves": "Cuts the drone duty from 25% or 100% to 15% in all for products of the EU, Japan, South Korea, Taiwan, Switzerland and Liechtenstein (9903.08.24), or to +10% for the UK (9903.08.23)",
        "appliesTo": "Drones of 8806.21–8806.99 and covered parts of 8807 from those countries",
        "document": "The importer's certification that substantially all the critical components and technology are products of the U.S., Japan, South Korea, Taiwan, Switzerland, Liechtenstein, an EU member or the UK, under the process Commerce establishes (Proclamation 11055 clause 4).",
        "caveat": "The 2026 Section 301 duty is still added unless the drone meets general note 6.",
        "citations": [
            {"label": "Proclamation 11055 (91 FR 53699)", "url": "https://www.federalregister.gov/documents/2026/08/19/2026-16979/adjusting-imports-of-unmanned-aircraft-systems-and-unmanned-aircraft-systems-components-into-the"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 43(d)", "url": CH99},
        ],
    },
    {
        "id": "uas-onshoring",
        "title": "Drones: import under an approved onshoring plan",
        "saves": "The whole Section 232 drone duty (25% or 100%), within the volumes the approval allows (9903.08.25 / 9903.08.26)",
        "appliesTo": "Drones and covered parts (8806.21–8806.99, 8807) and production equipment for a company building U.S. drone production",
        "document": "An onshoring plan approved by the Department of War, DHS or the Secretary of Commerce, committing to build, refurbish or expand a U.S. facility before January 20, 2029 (Proclamation 11055 clause 6).",
        "caveat": "Benefits can be rescinded, retroactively in cases of fraud, if the company fails to meet its commitments.",
        "citations": [
            {"label": "Proclamation 11055 (91 FR 53699)", "url": "https://www.federalregister.gov/documents/2026/08/19/2026-16979/adjusting-imports-of-unmanned-aircraft-systems-and-unmanned-aircraft-systems-components-into-the"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 43", "url": CH99},
        ],
    },
    {
        "id": "uas-classify",
        "title": "Drones and parts: classify by weight, thermal imaging and end use",
        "saves": "75 points of drone duty (25% instead of 100%) for a drone up to 25 kg without thermal imaging; the whole drone duty for passenger drones (8806.10) and for 8807 parts used in manned aircraft or in drones up to 25 kg (9903.08.20)",
        "appliesTo": "8806 and 8807",
        "document": "Specifications showing the maximum take-off weight (subheading note 2), whether a thermal imaging sensor is fitted, and, for parts, the aircraft or drone system they are for.",
        "caveat": "Classification follows the article as imported. Flying toys designed solely for amusement are in 9503, not 8806 (chapter note 1). A binding ruling (19 CFR part 177) settles a doubtful case.",
        "citations": [
            {"label": "HTSUS Chapter 88, notes", "url": CH88},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 43(c)", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{E19}/part-177"},
        ],
    },
    {
        "id": "ch98",
        "title": "Use the Chapter 98 provisions for repairs, returns and temporary entry",
        "saves": "Duty on only the value of repairs or alterations made abroad (9802.00.40 / 9802.00.50), no duty on previously duty-paid aircraft engines and propellers re-imported unimproved (9801.00.30), and no duty at entry for aircraft and parts brought in temporarily for repair or processing and re-exported (9813.00.05, under bond)",
        "appliesTo": "Aircraft, engines, propellers and parts sent abroad for maintenance, repair and overhaul, or brought in for U.S. MRO work",
        "document": "For 9802: the foreign repairer's declaration and the importer's endorsement (19 CFR 10.8). For 9813: an entry under bond, re-export within the bond period (19 CFR 10.31).",
        "caveat": "The 2026 Section 301 and Brazil duties apply to the value of repairs under 9802.00.40–.60 (notes 50(a) and 52(a)). Section 232 drone duties: goods claimed under Chapter 98 remain subject to the provision's terms (note 43(b)).",
        "provisions": [
            {"code": "9801.00.30", "rate": "Free", "text": "Aircraft engines, propellers and their parts previously imported duty-paid, re-imported without being advanced in value or improved in condition"},
            {"code": "9802.00.40", "rate": "Duty on the value of the repairs", "text": "Articles repaired or altered abroad under warranty"},
            {"code": "9802.00.50", "rate": "Duty on the value of the repairs", "text": "Articles exported for repairs or alterations"},
            {"code": "9813.00.05", "rate": "Free, under bond", "text": "Articles to be repaired, altered or processed in the United States and re-exported"},
        ],
        "citations": [
            {"label": "HTSUS Chapter 98", "url": CH98},
            {"label": "19 CFR 10.8", "url": f"{E19}/section-10.8"},
            {"label": "19 CFR 10.31", "url": f"{E19}/section-10.31"},
        ],
    },
    {
        "id": "drawback",
        "title": "Recover duties by drawback when aircraft or parts are exported",
        "saves": "Up to 99% of duties paid on imported aircraft parts used to make, or re-exported as, exported goods",
        "appliesTo": "Dutiable imports of any heading that are exported or used in exported aircraft",
        "document": "A drawback claim under 19 CFR part 190 with import and export records.",
        "caveat": "For the Section 232 drone duty only manufacturing drawback is allowed, and only for goods of trade-agreement partners with at least 85% partner content (Proclamation 11055 clause 8). Drones admitted to a foreign-trade zone must take privileged foreign status (clause 9).",
        "citations": [
            {"label": "19 CFR part 190", "url": f"{E19}/part-190"},
            {"label": "19 CFR 191.3", "url": f"{E19}/section-191.3"},
            {"label": "Proclamation 11055 (91 FR 53699)", "url": "https://www.federalregister.gov/documents/2026/08/19/2026-16979/adjusting-imports-of-unmanned-aircraft-systems-and-unmanned-aircraft-systems-components-into-the"},
        ],
    },
]
te["rules"] = [
    {
        "id": "gn6-docs",
        "agency": "CBP",
        "title": "Civil-aircraft claims: entry with SPI \"C\" where printed, a deemed certification of civil use, and the order or contract plus airworthiness evidence kept for CBP (19 CFR 10.183(c)–(e), general note 6)",
        "citations": [{"label": "19 CFR 10.183", "url": f"{E19}/section-10.183"}, {"label": "HTSUS General Note 6", "url": GN}],
    },
    {
        "id": "faa-airworthiness",
        "agency": "FAA",
        "title": "Imported aircraft need a U.S. type certificate issued on the basis of the exporting authority's certification under a bilateral agreement (14 CFR 21.29) and a standard airworthiness certificate (14 CFR 21.183(c)); foreign engines, propellers and articles are accepted only with an export airworthiness approval under such an agreement (14 CFR 21.500, 21.502)",
        "citations": [
            {"label": "14 CFR 21.29", "url": f"{E14}/section-21.29"},
            {"label": "14 CFR 21.183", "url": f"{E14}/section-21.183"},
            {"label": "14 CFR 21.500", "url": f"{E14}/section-21.500"},
            {"label": "14 CFR 21.502", "url": f"{E14}/section-21.502"},
        ],
    },
    {
        "id": "faa-registration",
        "agency": "FAA",
        "title": "Aircraft registration: an aircraft may be registered in the U.S. only if not registered abroad (14 CFR 47.3); one last registered in a foreign country needs evidence that the foreign registration has ended (14 CFR 47.37)",
        "citations": [{"label": "14 CFR 47.3", "url": f"{E14}/section-47.3"}, {"label": "14 CFR 47.37", "url": f"{E14}/section-47.37"}],
    },
    {
        "id": "uas-faa",
        "agency": "FAA",
        "title": "Drones: small unmanned aircraft must be registered before operation (14 CFR 48.15, 107.13), and drones produced for operation in U.S. airspace must meet the remote identification design and production rules (14 CFR part 89, subpart F)",
        "citations": [
            {"label": "14 CFR 48.15", "url": f"{E14}/section-48.15"},
            {"label": "14 CFR 107.13", "url": f"{E14}/section-107.13"},
            {"label": "14 CFR 89.501", "url": f"{E14}/section-89.501"},
        ],
    },
    {
        "id": "fcc-rf",
        "agency": "FCC",
        "title": "Drones are radio-frequency devices: they may be imported only with a valid FCC equipment authorization or under a listed exception (47 CFR 2.1204), and drones and drone critical components produced abroad that are on the Covered List cannot get new authorizations (47 CFR 2.903)",
        "citations": [
            {"label": "47 CFR 2.1204", "url": "https://www.ecfr.gov/current/title-47/section-2.1204"},
            {"label": "47 CFR 2.903", "url": "https://www.ecfr.gov/current/title-47/section-2.903"},
            {"label": "FCC final rule, 91 FR 57798 (September 11, 2026)", "url": "https://www.federalregister.gov/documents/2026/09/11/2026-18535/protecting-against-national-security-threats-to-the-communications-supply-chain-through-the"},
        ],
    },
    {
        "id": "s232-uas",
        "agency": "CBP / Commerce",
        "title": "Section 232 drone duty: declare 9903.08.20–9903.08.26 with the 8806 or 8807 line; partner and onshoring rates need Commerce's certification or approval (Proclamation 11055, U.S. note 43)",
        "citations": [
            {"label": "Proclamation 11055 (91 FR 53699)", "url": "https://www.federalregister.gov/documents/2026/08/19/2026-16979/adjusting-imports-of-unmanned-aircraft-systems-and-unmanned-aircraft-systems-components-into-the"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 43", "url": CH99},
        ],
    },
    {
        "id": "itar-temp",
        "agency": "State (DDTC)",
        "title": "Military aircraft and parts: U.S.-origin defense articles may be temporarily imported for servicing and re-exported without a license (22 CFR 123.4); other defense-article imports follow the ITAR",
        "citations": [{"label": "22 CFR 123.4", "url": "https://www.ecfr.gov/current/title-22/section-123.4"}],
    },
    {
        "id": "s301-entry",
        "agency": "CBP",
        "title": "2026 Section 301 and Brazil duties: report the country heading (9903.05.20–9903.05.84, 9903.05.01) or the civil-aircraft exemption heading (9903.05.88, 9903.05.05) with the Chapter 88 line",
        "citations": [HTS99, {"label": "CBP CSMS # 69326983 (Section 301 forced labor import duties)", "url": next(x["url"] for x in EXTRA if x["id"] == "csms-69326983")}],
    },
]
te["groups"] = []
GROUP_RULES = {
    "8801": (["gn6-docs", "faa-airworthiness", "faa-registration", "s301-entry"], "Balloons and gliders are aircraft: FAA certification and registration apply, and civil ones can use general note 6."),
    "8802": (["gn6-docs", "faa-airworthiness", "faa-registration", "s301-entry", "itar-temp"], "The core of the chapter: civil aircraft need FAA acceptance and registration; military statistical lines cannot use general note 6; spacecraft (8802.60) are not on the civil-aircraft list."),
    "8804": (["s301-entry"], "Parachutes pay 3% and are outside the civil-aircraft list; USMCA and other FTAs make them Free."),
    "8805": (["gn6-docs", "s301-entry", "itar-temp"], "Only other ground flying trainers (8805.29, civil flight simulators) are on the civil-aircraft list; launching gear and air combat simulators are not."),
    "8806": (["gn6-docs", "uas-faa", "fcc-rf", "s232-uas", "s301-entry"], "The most regulated group: Section 232 drone duty, FCC authorization and Covered List, FAA registration and remote ID."),
    "8807": (["gn6-docs", "faa-airworthiness", "s232-uas", "s301-entry", "itar-temp"], "Parts: the civil-aircraft statistical lines (.15, .30) refer to general note 6; parts for drones over 25 kg pay the drone duty."),
}
for g in d["tariffEngineering"]["groups"] if False else []:
    pass
gen_groups = {g["heading"]: g for g in json.load(open(sys.argv[1]))["tariffEngineering"]["groups"]}
for h, g in gen_groups.items():
    rid, note = GROUP_RULES[h]
    te["groups"].append({"heading": h, "label": g["label"], "ruleIds": rid, "note": note})
for ln in te["lines"]:
    h = ln["hts"]
    head = h[:4]
    rules = list(GROUP_RULES[head][0])
    if head in ("8802", "8805", "8807") and h not in MIL:
        rules = [r for r in rules if r != "itar-temp"]
    levers = []
    on_list = not (h.startswith("8802.60") or head == "8804" or h.startswith("8805.10") or h.startswith("8805.21") or h.startswith("8807.90.30"))
    if on_list and h not in MIL:
        levers.append("civil-aircraft")
    else:
        rules = [r for r in rules if r != "gn6-docs"]
    levers.append("usmca")
    if head == "8806" and not h.startswith("8806.10"):
        levers += ["uas-partner", "uas-onshoring", "uas-classify"]
    if head == "8806" and h.startswith("8806.10"):
        rules = [r for r in rules if r != "s232-uas"]
        levers.append("uas-classify")
    if head == "8807" and not h.startswith("8807.90.30"):
        levers += ["uas-classify"]
    if head == "8807" and h.startswith("8807.90.30"):
        rules = [r for r in rules if r != "s232-uas"]
    if head in ("8802", "8807", "8805"):
        levers.append("ch98")
    levers.append("drawback")
    ln["ruleIds"], ln["leverIds"] = rules, levers

# ================================================================== finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 88: Aircraft, Spacecraft, and Parts Thereof — Tariff FAQ"
fc["seo"] = {
    "title": "Aircraft & Drone Tariffs FAQ: Are Aircraft Parts Exempt? Drone Tariffs, Airbus, Canada, HS 8807 (HTS Ch. 88) | KoalaGains",
    "shortDescription": "Answers to what people search about aircraft tariffs: are aircraft and aircraft parts exempt from tariffs, the civil aircraft exemption, drone and DJI tariffs, Airbus tariffs, Canadian, Brazilian and EU aircraft tariffs, Section 232 on aircraft, and HS codes for aircraft parts, drones and helicopters.",
    "keywords": [
        "aircraft tariffs",
        "are aircraft parts exempt from tariffs",
        "civil aircraft tariff exemption",
        "drone tariffs",
        "dji tariffs",
        "airbus tariffs",
        "tariffs on canadian aircraft",
        "brazil aircraft tariffs",
        "section 232 aircraft",
        "hts code for aircraft parts",
        "hs code for drones",
        "hs code 8807",
        "civil aircraft agreement wto",
        "hts chapter 88",
    ],
}
fc["intro"] = "Straight answers to the most common questions about U.S. tariffs on aircraft, aircraft parts and drones, by country and by HS code. Each answer links to the page with the full detail."
fc["keyTakeaways"] = [
    "66 of the 67 Chapter 88 lines are Free at base (parachutes 3%). Civil aircraft, engines, parts and simulators that meet general note 6 are also exempt from the 2026 Section 301 duties and Brazil's 25%, so certified civil aircraft and parts enter Free from the EU, UK, Japan, Brazil, Canada and most other suppliers.",
    "Non-civil articles (military aircraft and parts, spacecraft, satellite parts, parachutes) pay 10% or 12.5% from the 60 Section 301 economies (Free for USMCA goods) and 37.5% from Brazil; China pays 25% under List 1 even on civil aircraft parts.",
    "Drones pay the Section 232 drone duty since September 3, 2026: +25% up to 25 kg without thermal imaging, +100% with thermal imaging or over 25 kg, on top of other duties (lower rates for allied-component drones). The IEEPA duties ended February 24, 2026, the Airbus-dispute duties remain suspended, and Section 232 on commercial aircraft (Proclamation 11040) imposed no tariff.",
]
fc["questionSource"] = "Google search suggestions (United States, English), collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "exempt",
        "question": "Are aircraft and aircraft parts exempt from U.S. tariffs?",
        "searchedAs": ["are aircraft exempt from tariffs", "are aircraft parts exempt from tariffs", "are aircraft parts exempt from us tariffs", "is aviation exempt from tariffs", "aircraft parts tariff exemption", "aircraft tariff exemption", "aviation tariff exemption"],
        "answer": "Mostly yes, if they are civil aircraft. 66 of the 67 Chapter 88 lines are Free at base, and civil aircraft, engines, parts and ground flight simulators that meet general note 6 (used in aircraft and covered by an FAA certificate or an FAA-recognized foreign approval) are exempt from the 2026 Section 301 duties (U.S. note 52(d), 9903.05.88) and Brazil's 25% (9903.05.05). Not exempt: military aircraft and parts, spacecraft and satellite parts, parachutes, China's 25% List 1 duty, and the Section 232 drone duty.",
        "link": "tariff-updates",
    },
    {
        "id": "civil-exemption",
        "question": "What is the civil aircraft tariff exemption and how do I claim it?",
        "searchedAs": ["civil aircraft tariff exemption", "civil aircraft tariff", "civil aircraft agreement", "civil aircraft agreement wto", "1979 civil aircraft agreement", "civil aircraft definition"],
        "answer": "It comes from the WTO Agreement on Trade in Civil Aircraft, implemented in general note 6 (special program indicator \"C\"). A civil aircraft article is used as original or replacement equipment in aircraft and is made or operated under an FAA certificate or an FAA-recognized foreign airworthiness approval; articles bought for the Department of Defense or Coast Guard qualify only if certified. The importer claims \"Free (C)\" where printed, is deemed to certify civil use, and keeps the order or contract and airworthiness evidence (19 CFR 10.183). The Chapter 99 exemptions (9903.05.88, 9903.05.05) apply whether or not \"Free (C)\" is claimed.",
        "link": "tariff-engineering",
    },
    {
        "id": "drones",
        "question": "What are the tariffs on drones?",
        "searchedAs": ["drone tariffs", "drone tariffs us", "new drone tariffs", "chinese drone tariffs", "china drone tariffs", "when do drone tariffs start", "section 232 drones", "section 232 unmanned aircraft systems"],
        "answer": "Since September 3, 2026 drones of 8806.21–8806.99 pay a Section 232 duty (Proclamation 11055): +25% for drones up to 25 kg without thermal imaging (9903.08.22) and +100% for those with thermal imaging or over 25 kg (9903.08.21), on top of other duties. A Chinese drone without thermal imaging pays 62.5% (12.5% + 25% List 1 + 25%); with thermal imaging 137.5%. Products on the Blue UAS or FCC Conditional Approval lists on September 2, 2026 start paying on February 9, 2027. Allied-component drones from the EU, Japan, Korea, Switzerland and Taiwan pay 15% for the drone duty and UK drones +10%.",
        "link": "industry-areas",
    },
    {
        "id": "dji",
        "question": "How much tariff is on a DJI drone?",
        "searchedAs": ["dji tariffs", "dji tariffs us", "dji drone tariff", "dji 100 tariff", "dji trump tariffs", "dji drone tariff code"],
        "answer": "A drone made in China and classified in 8806.21–8806.93 (up to 25 kg) pays 12.5% (2026 Section 301, 9903.05.31) + 25% (Section 301 List 1, 9903.88.01) + the Section 232 drone duty of 25% without thermal imaging or 100% with it: 62.5% or 137.5% of the customs value. Drones also need a valid FCC equipment authorization to be imported (47 CFR 2.1204), and the FCC Covered List bars new authorizations for drones produced abroad (47 CFR 2.903).",
        "link": "industry-areas",
    },
    {
        "id": "drone-code",
        "question": "What is the HTS code for drones?",
        "searchedAs": ["hts code for drones", "hs code for drones", "harmonized tariff code for drones", "drone tariff code", "hs code for dji drones", "hs code for agricultural drones", "hs code for military drones"],
        "answer": "Heading 8806 (unmanned aircraft), split by passenger drones (8806.10), remote-controlled-only drones (8806.21–8806.29) and other drones (8806.91–8806.99), and by maximum take-off weight: up to 250 g, 250 g–7 kg, 7–25 kg, 25–150 kg and over 150 kg. All are Free at base. Drone parts go in 8807 (8807.30 for other parts of airplanes, helicopters or unmanned aircraft). Toy drones designed solely for amusement are in 9503, not 8806 (chapter note 1).",
        "link": "",
    },
    {
        "id": "parts-code",
        "question": "What is the HTS code for aircraft parts?",
        "searchedAs": ["hts code for aircraft parts", "hs code for aircraft parts", "harmonized tariff code for aircraft parts", "hts code for civil aircraft parts", "hs code for airplane parts", "hs code 8807", "8807 hs code", "hs code 8807.30", "aircraft parts tariff code", "hts code for aerospace parts"],
        "answer": "Parts that are not more specifically classified elsewhere go in 8807: propellers and rotors (8807.10), undercarriages (8807.20), other parts of airplanes, helicopters or drones (8807.30), parts of communications satellites (8807.90.30) and other parts (8807.90.90). Each has statistical lines for civil-aircraft use (for the Department of Defense or Coast Guard, or other) and for other use. All are Free at base. Engines (8411, 8407), instruments (9014) and many other aircraft components are classified in their own chapters.",
        "link": "",
    },
    {
        "id": "helicopter-code",
        "question": "What is the HS code for helicopters and helicopter parts?",
        "searchedAs": ["hts code for helicopter parts", "hs code for helicopter", "hs code for helicopter parts", "hs code for helicopter spare parts", "hs code for civil helicopter parts"],
        "answer": "Helicopters are 8802.11 (unladen weight up to 2,000 kg) and 8802.12 (over 2,000 kg), with statistical lines for military, new and used. Rotors and their parts are 8807.10 and other helicopter parts 8807.30. All are Free at base; civil helicopters and parts that meet general note 6 are also exempt from the 2026 Section 301 duties.",
        "link": "",
    },
    {
        "id": "canada",
        "question": "Are there U.S. tariffs on Canadian aircraft and aircraft parts?",
        "searchedAs": ["aircraft tariffs canada", "tariffs on canadian aircraft", "us tariffs on canadian aircraft", "canadian aircraft tariffs", "aerospace tariffs canada", "canadian tariffs on aircraft parts"],
        "answer": "Not if they qualify for USMCA or general note 6. Canadian goods pay the 10% 2026 Section 301 duty (9903.05.29) only without a USMCA claim, and certified civil aircraft and parts are exempt anyway (9903.05.88). Canada's Section 338 duties list no Chapter 88 line. Drones pay the Section 232 drone duty even with USMCA. The 2025 IEEPA duty (25%, then 35%) ended February 24, 2026. Canada shipped $9.10B of Chapter 88 goods to the U.S. in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "airbus",
        "question": "Are there tariffs on Airbus aircraft?",
        "searchedAs": ["airbus tariffs", "us tariffs on airbus", "tariffs on airbus aircraft", "airbus boeing tariffs", "airbus boeing dispute tariffs", "trump airbus tariffs", "eu aircraft tariffs", "us eu tariffs aircraft"],
        "answer": "Not on certified civil aircraft. EU products pay the 2026 Section 301 duty of 10% in place of the base rate (9903.05.39), but general-note-6 civil aircraft and parts are exempt (9903.05.88), so a new Airbus airliner from France or Germany enters Free. The Airbus-dispute duties (10% from October 2019, 15% from March 2020 on new large aircraft from France, Germany, Spain and the UK) have been suspended since 2021. The 15% IEEPA reciprocal rate exempted EU civil aircraft from September 1, 2025 and ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "brazil",
        "question": "Is there a tariff on Brazilian aircraft such as Embraer?",
        "searchedAs": ["brazil aircraft tariffs", "embraer tariffs", "embraer tariff exemption", "embraer us tariffs", "brazil tariffs embraer"],
        "answer": "Not on certified civil aircraft. Brazil pays 25% (9903.05.01) plus the 12.5% 2026 Section 301 duty (9903.05.27), but civil aircraft, engines, parts and simulators that meet general note 6 are exempt from both (9903.05.05, 9903.05.88). Non-certified Brazilian Chapter 88 goods pay 37.5%. Brazil's 2025 IEEPA duty of 40% also excepted civil aircraft and ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "uk",
        "question": "What is the U.S. tariff on UK aerospace goods?",
        "searchedAs": ["uk aerospace tariffs", "uk us aerospace tariff deal"],
        "answer": "Certified UK civil aircraft and parts enter Free: the 10% 2026 Section 301 duty on the UK (9903.05.81) does not apply to general-note-6 civil aircraft (9903.05.88). Under the 2025 Economic Prosperity Deal UK civil aircraft were exempt from the 10% reciprocal tariff from June 30, 2025, until all IEEPA duties ended on February 24, 2026. Other UK Chapter 88 goods pay 10%; UK drones also pay the drone duty (+10% with the allied-components certification).",
        "link": "industry-areas",
    },
    {
        "id": "section-232",
        "question": "Is there a Section 232 tariff on aircraft?",
        "searchedAs": ["section 232 aircraft", "section 232 aircraft parts", "section 232 commercial aircraft", "section 232 civil aircraft", "section 232 aircraft investigation", "section 232 investigation commercial aircraft", "trump aircraft tariffs"],
        "answer": "No duty on manned aircraft. Commerce's Section 232 investigation of commercial aircraft, jet engines and parts (begun May 1, 2025) found a threat to national security, but Proclamation 11040 (July 9, 2026) imposed no tariff and directed negotiations, with an update due within 180 days. Section 232 does apply to drones (Proclamation 11055, from September 3, 2026).",
        "link": "tariff-updates",
    },
    {
        "id": "china-parts",
        "question": "What are the tariffs on aircraft parts from China?",
        "searchedAs": ["tariffs on aircraft parts", "us tariffs on aircraft parts", "are there tariffs on aircraft parts", "tariffs aircraft parts"],
        "answer": "Chinese aircraft parts of 8807 pay 25% under Section 301 List 1 (9903.88.01) plus 12.5% under the 2026 Section 301 action (9903.05.31): 37.5%. Certified civil aircraft parts are exempt only from the 12.5%, so they pay 25%. From most other suppliers certified civil aircraft parts are Free.",
        "link": "industry-areas",
    },
    {
        "id": "import-aircraft",
        "question": "How do I import an aircraft into the United States?",
        "searchedAs": ["importing an aircraft into the united states", "how to import an aircraft into the us"],
        "answer": "File a CBP entry under the 8802 line (Free at base) with the Chapter 99 heading for its origin, or the civil-aircraft exemption heading 9903.05.88 for a general-note-6 civil aircraft, keeping the airworthiness evidence (19 CFR 10.183). To fly it, the FAA must accept it: a type certificate based on the exporting authority's certification under a bilateral agreement (14 CFR 21.29) and a standard airworthiness certificate (14 CFR 21.183(c)). It must be registered in the U.S., with evidence that any foreign registration has ended (14 CFR 47.3, 47.37).",
        "link": "tariff-engineering",
    },
    {
        "id": "imports",
        "question": "Where do U.S. aircraft imports come from?",
        "searchedAs": ["aircraft tariffs us", "us tariffs on aircraft", "tariffs on aircraft"],
        "answer": f"U.S. imports of Chapter 88 goods were {money(TOT)} in 2025 (UN Comtrade, CIF). Canada ({money(imp('Canada'))}) and France ({money(imp('France'))}) supplied {share(imp('Canada') + imp('France'))}, followed by Germany, the UK, Brazil, Japan and Mexico. Parts (8807, {money(H['8807'])}) and complete aircraft (8802, {money(H['8802'])}) make up almost all of it; drones were {money(H['8806'])}.",
        "link": "understand-industry",
    },
]
assert 11 <= len(fc["faqs"]) <= 15, len(fc["faqs"])

d["sources"] = [
    {"label": "Harmonized Tariff Schedule of the United States", "url": "https://hts.usitc.gov/", "note": "rate table rows, Chapter 88 notes, general note 6 and Chapter 99 (2026 Revision 21)"},
    {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": "2025 import figures"},
]


def walk(x, p=""):
    if isinstance(x, dict):
        for k, v in x.items():
            walk(v, f"{p}.{k}")
    elif isinstance(x, list):
        for i, v in enumerate(x):
            walk(v, f"{p}[{i}]")
    elif isinstance(x, str):
        assert "TODO" not in x, p
        assert "[forbidden-source-name]" not in x.lower(), p


walk(d)
json.dump(d, open(sys.argv[2], "w"), indent=2, ensure_ascii=False)
print("wrote", sys.argv[2], "civil varied:", VARIED)
