"""Fill the writer TODOs of the generated Chapter 85 content file.

usage: python3 fill85.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 85 + Chapter 99 notes 2(aa), 16, 18, 19, 20, 29, 30, 31, 33, 38, 39, 43,
50, 51, 52), the proclamations, executive orders and USTR / Commerce / ITC notices in sources85.py (Federal Register),
CBP CSMS messages, eCFR (titles 10, 19, 21, 47 and 49, up to date as of 2026-10-08), DHS UFLPA documents and UN Comtrade.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from sources85 import CH99, EXTRA  # noqa: E402
from groups85 import G  # noqa: E402
from sets85 import sets  # noqa: E402
from text85 import fill_rest  # noqa: E402

ASOF = "2026-10-13"
TITLE = (
    "Electrical Machinery and Equipment and Parts Thereof; Sound Recorders and Reproducers, Television Image and Sound Recorders "
    "and Reproducers, and Parts and Accessories of Such Articles"
)

d = json.load(open(sys.argv[1]))
d["chapter"]["title"] = TITLE
d["asOf"] = ASOF
S = sets(d)
assert len(S["all"]) == 982, len(S["all"])
N = {k: len(v) for k, v in S.items()}
assert N["ex52b"] == 73 and N["auto"] == 85 and N["mhdv"] == 67 and N["m25"] == 68 and N["m15"] == 15 and N["ca338"] == 62, N

rows = d["overview"]["rateTable"]["rows"]
LINE = {r["hts"]: r for r in rows if r["htsCode10"]}
ia = d["industryAreas"]
CTRY = {c["country"]: c for c in ia["countries"]}


def cell_total(country, hts, side="withoutUsmca"):
    cell = CTRY[country]["cells"][hts[:4]]
    for b in cell[side]["breakdown"]:
        if hts in b["lines"]:
            return b["total"]
    raise KeyError((country, hts))


def check(country, hts, expect, side="withoutUsmca"):
    got = cell_total(country, hts, side)
    assert got == expect, (country, hts, side, got, expect)


# Engine totals quoted in the prose (fail loudly if a regeneration changes them).
check("China", "8517.13.00.00", "Free")
check("Canada", "8517.13.00.00", "50%", "withUsmca")
check("India", "8517.13.00.00", "Free")
check("Vietnam", "8517.13.00.00", "Free")
check("China", "8507.60.00.10", "40.9% not a car or light-truck part / 53.4% car or light-truck part")
check("China", "8507.60.00.90", "40.9% not a car or light-truck part / 53.4% car or light-truck part")
check("China", "8542.31.00.25", "50%")
check("Taiwan", "8542.31.00.25", "Free")
check("China", "8541.43.00.10", "62.5%")
check("India", "8541.43.00.10", "10%")
check("Vietnam", "8541.43.00.10", "12.5%")
check("Mexico", "8544.42.90.90", "25%", "withUsmca")
check("Mexico", "8544.42.90.90", "27.6%")
check("South Korea", "8504.23.00.80", "15%")
check("Japan", "8511.40.00.00", "12.5% not a vehicle part / 15% car or light-truck part / 27.5% truck or bus part")
check("Mexico", "8528.72.64.60", "Free", "withUsmca")
check("Mexico", "8528.72.64.60", "13.9%")
check("China", "8528.72.64.60", "23.9%")
check("China", "8505.11.00.70", "27.1%")


def fmt_rate(x):
    return "Free" if x == 0 else (f"{x:g}%")


def base_range(lines):
    vals = []
    for h in lines:
        g = LINE[h]["effectiveGeneral"] or "Free"
        vals.append(0.0 if g == "Free" else float(g.rstrip("%")))
    lo, hi = min(vals), max(vals)
    return fmt_rate(lo) if lo == hi else f"{fmt_rate(lo)} to {fmt_rate(hi)}"


def plural(n, word="line"):
    return f"{n} {word}" + ("" if n == 1 else "s")


def extras(h):
    L = {x for x in S["all"] if x.startswith(h)}
    n = len(L)
    out = []
    c = lambda k: len(S[k] & L)  # noqa: E731
    china = []
    n25 = len((S["l1"] | S["l2"] | S["l3"] | S["n31b"] | S["n31g"]) & L)
    if c("n31f") or c("n31c"):
        china.append(f"50% on {c('n31f') + c('n31c')}")
    if n25:
        china.append(f"25% on {n25}")
    if c("l4a"):
        china.append(f"7.5% on {c('l4a')}")
    nochina = n - c("china_any")
    out.append("China Section 301: " + ", ".join(china) + (f" (none on {nochina})" if nochina else ""))
    if c("ex52b") == n:
        out.append("all exempt from the 2026 Section 301 duties")
    elif c("ex52b"):
        out.append(f"{c('ex52b')} exempt from the 2026 Section 301 duties")
    if c("auto"):
        out.append(f"Section 232 auto parts on {c('auto')} when they are car or light-truck parts")
    if c("mhdv"):
        out.append(f"truck and bus parts on {c('mhdv')}")
    if c("m25"):
        out.append(f"Section 232 metals 25% on {c('m25')}")
    if c("m15"):
        out.append(f"a 15% Section 232 floor on {c('m15')}")
    if c("uas"):
        out.append(f"drone docking stations 100% on {c('uas')}")
    if c("ca338"):
        out.append(f"Canada +50% (Section 338) on {c('ca338')}")
    return "; ".join(out) + "."


o = d["overview"]
for pg in o["productGroups"]:
    label, short, desc, ex = G[pg["heading"]]
    L = sorted(x for x in S["all"] if x.startswith(pg["heading"]))
    pg["label"] = label
    pg["blurb"] = f"{desc}: {plural(len(L))}, {base_range(L)}. " + extras(pg["heading"])
    pg["searchExamples"] = ex
for g in ia["groups"]:
    label, short, _, _ = G[g["heading"]]
    g["label"], g["shortLabel"] = label, short

# ------------------------------------------------------------------ overview
FREE = sum(1 for h in LINE if (LINE[h]["effectiveGeneral"] or "Free") == "Free")
DUT = sorted(float(LINE[h]["effectiveGeneral"].rstrip("%")) for h in LINE if (LINE[h]["effectiveGeneral"] or "Free") != "Free")
assert (DUT[0], DUT[-1]) == (1.3, 15.0), (DUT[0], DUT[-1])
o["h1"] = "HTS Chapter 85: Electrical Machinery, Electronics, Batteries & Semiconductors — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 85 Tariffs 2026: Electronics, Semiconductor, Battery & Solar Import Duty Rates | KoalaGains",
    "shortDescription": (
        f"Searchable U.S. duty table for all 982 HTS Chapter 85 lines: smartphones, chips, lithium-ion batteries, solar cells, motors, "
        "transformers, TVs, cable. Section 301 China rates (50% chips and solar), 2026 Section 301, Section 232 auto parts and metals, Canada 50%."
    ),
    "keywords": [
        "HTS Chapter 85",
        "HTSUS chapter 85",
        "chapter 85 us tariff",
        "electrical components tariffs",
        "semiconductor tariffs",
        "lithium-ion battery tariffs",
        "tariff on electronics from china",
        "solar panel tariffs",
        "Section 301 tariffs",
        "USMCA tariffs",
        "electrical equipment import duty",
    ],
}
o["stats"][2]["note"] = (
    f"China Section 301: {N['china_any']}; 2026 Section 301 (60 economies) and Brazil: {N['s301_26']}; Section 232 auto parts: {N['auto']} "
    f"(plus importer elections); truck and bus parts: {N['mhdv']}; Section 232 metals: {N['m25'] + N['m15']}; Canada Section 338: {N['ca338']}; "
    f"drone docking stations: {N['uas']}; Russia 35% in lieu of column 2: {N['ru35']}"
)
o["intro"] = (
    "Chapter 85 covers electrical machinery and electronics: motors, generators, wind turbines and transformers (8501–8504); batteries (8506–8507); "
    "household and personal appliances (8508–8516); smartphones, network gear, audio, cameras, radios and TVs (8517–8529); switching and control "
    "apparatus, capacitors, resistors and printed circuits (8530–8538); lamps and LEDs, semiconductors, solar cells and chips (8539–8542); "
    f"and other electrical apparatus, wire and cable, electrodes, insulators and e-waste (8543–8549). Base rates are low: **{FREE} of 982 lines are Free** and the rest pay 1.3% to 15%.\n\n"
    "What decides the cost is the extra duty, which depends on the country and the product:\n\n"
    f"- **China:** Section 301 covers {N['china_any']} lines: 25% (Lists 1–3) or 7.5% (List 4A), **50% on semiconductors, chips and solar cells** "
    "(U.S. note 31), and **25% on lithium-ion batteries and permanent magnets** since January 1, 2026. Most lines also pay the 12.5% 2026 Section 301 duty. "
    "Smartphones (8517.13) are on no China list and are exempt from the 2026 duty, so they enter **Free**.\n"
    f"- **60 other economies:** the 2026 Section 301 actions add 10% or 12.5% (the EU, Japan, Korea and Taiwan pay a 10%–15% floor instead) on {N['s301_26']} "
    f"lines. Smartphones, switches and routers (8517.62), SSDs, display modules, computer monitors, semiconductors and chips are exempt "
    f"(note 52(b), {N['ex52b']} lines); solar cells are not. USMCA goods of Canada and Mexico are exempt.\n"
    f"- **Section 232:** {N['auto']} lines (motors, lithium-ion and lead-acid batteries, ignition and lighting parts, car radios, wiring sets) pay 25% "
    "when they are parts of cars or light trucks (15% in total for the EU, Japan, Korea and Taiwan) and 25% when they are truck or bus parts; "
    f"{N['m25']} metal-heavy lines (transformers, wind turbines, insulated copper and aluminum cable) pay 25% of their full value and {N['m15']} a 15% floor; "
    "drone docking stations pay 100%.\n"
    f"- **Canada:** {N['ca338']} lines (smartphones, network gear, TVs, cameras, printed circuits) pay **50% under Section 338** since August 22, 2026, even with a USMCA claim.\n\n"
    "Two things that do **not** apply: the Section 232 semiconductor duty (Proclamation 11002, U.S. note 39) reaches only advanced chips in computers and "
    "computer parts of 8471.50, 8471.80 and 8473.30, not chips imported on their own; and the Section 201 solar safeguard ended on February 6, 2026. "
    "A new Section 232 duty of 15% plus minimum import prices on solar cells and modules starts December 4, 2026. Antidumping and countervailing duties "
    "on solar cells, aluminum wire and cable, large power transformers and graphite electrodes come on top; they are company-specific and not in this table."
)
o["workedExamples"] = [
    {
        "title": "Smartphones from China, India or Vietnam, and from Canada",
        "line": "8517.13.00.00",
        "body": "Smartphones are **Free** under the general rate, are on none of the China Section 301 lists, and 8517.13 is on the 2026 Section 301 "
        "exemption list (note 52(b), 9903.05.86). So a $500,000 shipment from China, India or Vietnam owes **no duty**. The IEEPA duties that applied "
        "in 2025 ended on February 24, 2026. The exception is Canada: 8517.13 is on the Section 338 list (note 51(b)(3), 9903.03.14), so Canadian "
        "smartphones pay **50%** since August 22, 2026, USMCA claim or not.",
    },
    {
        "title": "Lithium-ion EV battery packs from China",
        "line": "8507.60.00.10",
        "body": "**3.4%** base, **+25%** China Section 301 (note 31(g), 9903.91.06) and, as parts of passenger vehicles, **+25%** Section 232 (note 33(g), 9903.94.05): "
        "**53.4%**, or $534,000 on $1 million. The 12.5% 2026 Section 301 duty does not apply to Section 232 auto parts (note 52(f)(3)). A lithium-ion "
        "battery of 8507.60.00.90 used outside vehicles, for example in energy storage, enters under 9903.94.06 with no Section 232 duty and pays the 12.5% instead: **40.9%**.",
    },
    {
        "title": "Processors and controllers (8542.31) from China and from Taiwan",
        "line": "8542.31.00.25",
        "body": "Chips are **Free** at base. Chinese chips pay **+50%** under Section 301 (note 31(f), 9903.91.05, since January 1, 2025); 8542 is exempt from the "
        "2026 Section 301 duty. Chips from Taiwan, Malaysia, Korea or Vietnam pay **nothing**: 8542 is on the note 52(b) exemption list, and the 25% Section 232 "
        "semiconductor duty (9903.79.01) covers only certain advanced chips in computers of 8471.50, 8471.80 and 8473.30, not loose chips. A further Section 301 "
        "increase on Chinese semiconductors is set for June 23, 2027 at a rate USTR has not yet announced.",
    },
    {
        "title": "Solar modules from China, Vietnam or India",
        "line": "8541.43.00.10",
        "body": "Modules are **Free** at base and are not on the note 52(b) list. Chinese modules pay **62.5%** (50% note 31(c), 9903.91.02, plus 12.5%) and the 2012 and "
        "2015 AD/CVD orders; Vietnamese modules **12.5%** plus the June 2025 AD/CVD orders on Cambodia, Malaysia, Thailand and Vietnam; Indian modules **10%**; "
        "Commerce found dumping and subsidies on Indian, Indonesian and Lao cells and modules on September 16, 2026, and orders follow if the ITC finds injury. The Section 201 safeguard ended February 6, 2026. From December 4, 2026, Proclamation 11052 "
        "adds a 15% Section 232 duty and a minimum import price of $0.38 per watt for modules ($0.22 for cells).",
    },
    {
        "title": "Insulated copper cable from Mexico",
        "line": "8544.42.90.90",
        "body": "**2.6%** base, Free with a USMCA claim. The cable is on the Section 232 copper list (note 16(c)(viii)), so it pays **+25% of its full value** "
        "(9903.82.09) whatever the FTA claim: **25%** with USMCA, 27.6% without. The 2026 Section 301 duty does not apply to Section 232 metals goods "
        "(note 52(f)(1)). Cable whose aluminum, steel and copper are under 15% of its weight enters under 9903.82.03 with no Section 232 duty.",
    },
    {
        "title": "Large power transformer from South Korea",
        "line": "8504.23.00.80",
        "body": "Transformers over 10,000 kVA are on the note 16(c)(x) list of fixed industrial equipment, which pays a **15% floor** until December 31, 2027 "
        "(9903.82.10: the total is 15% when the base rate is lower). So a $5 million Korean transformer owes **$750,000** in tariff, KORUS or not. "
        "Large power transformers from Korea are also under a 2012 antidumping order, continued in 2024, with company-specific cash deposits on top. "
        "From January 1, 2028 the line moves to 25% on top of the base rate.",
    },
    {
        "title": "65-inch LCD TV from Mexico or China",
        "line": "8528.72.64.60",
        "body": "**3.9%** base. A USMCA-qualifying Mexican TV enters **Free**; without a USMCA claim it pays **13.9%** (3.9% + 10% under 9903.05.55). "
        "A Chinese TV pays **23.9%**: 3.9% + 7.5% List 4A + 12.5% 2026 Section 301.",
    },
]
o["notes"] = {
    "chapterNotes": (
        "**Exclusions (note 1).** Electrically warmed blankets and clothing, glass of heading 7011, semiconductor-manufacturing machines of heading 8486, "
        "medical vacuum apparatus (9018) and electrically heated furniture are not in Chapter 85. **Note 2:** headings 8501–8504 do not cover goods of "
        "8511, 8512, 8540, 8541 or 8542. **Note 3:** batteries of 8507 include ancillary components such as connectors, temperature control and circuit "
        "protection devices. **Note 4:** heading 8509 covers only domestic electromechanical appliances (most under 20 kg).\n\n"
        "**Definitions.** *Smartphones* (note 5) are cellular phones with a mobile operating system that runs multiple applications. *Solid-state "
        "non-volatile storage devices* and *smart cards* are defined in note 6; *flat panel display modules* (note 7) are display screens designed to be "
        "built into other goods, and heading 8524 takes precedence over every other heading. *Printed circuits* (note 8) carry only printed elements. "
        "*LED light sources* (note 11) are LED modules and LED lamps of 8539. Note 12 defines *semiconductor devices* (including semiconductor-based sensors, "
        "actuators, resonators and oscillators) and *electronic integrated circuits* (monolithic, hybrid, multichip and multi-component ICs); headings "
        "8541 and 8542 take precedence over every other heading except 8523.\n\n"
        "**Subheading notes** define high-speed, radiation-hardened and night-vision cameras (8525.81–8525.83) and spent batteries (8549.11–8549.19)."
    ),
    "additionalUsNotes": (
        "**1.** For 8501 and 8503, 746 W equals 1 horsepower. **2.** Toasters of 8516.72 include toaster-ovens. **3.** For 8517 and 8525, *transceivers* "
        "combine a transmitter and receiver that cannot work simultaneously. **4–6, 9, 10.** Rules for classifying television subassemblies, picture "
        "tubes and front panel assemblies (8529.90, 8540). **7.** *High definition* means a 16:9 or wider screen showing more than 700 scanning lines. "
        "**8.** The video display diagonal is the longest straight line across the visible faceplate. **11.** Lists the machines whose parts qualify for "
        "8538.90.10. Statistical notes define, among others, the crystalline silicon photovoltaic cells and modules reported under 8541.42.00.10 and "
        "8541.43.00.10."
    ),
}

# ------------------------------------------------------------------ tariffUpdates, industryAreas, engineering, FAQ
fill_rest(d, S, N, EXTRA, CH99, cell_total, ASOF)

with open(sys.argv[2], "w") as f:
    json.dump(d, f, ensure_ascii=False, indent=1)
print("wrote", sys.argv[2])
