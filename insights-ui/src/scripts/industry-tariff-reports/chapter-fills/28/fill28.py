"""Fill the writer TODOs of the generated Chapter 28 content file.

usage (from insights-ui/): python3 $S/fill28.py $S/gen.json src/tariff-data/chapters/28-inorganic-and-metal-compounds.json

Regenerate + refill (from insights-ui/):
  pnpm tariff:generate-chapter --chapter 28 --slug 28-inorganic-and-metal-compounds \
    --title "Inorganic Chemicals; Organic or Inorganic Compounds of Precious Metals, of Rare-Earth Metals, of Radioactive Elements or of Isotopes" \
    --countries CA,FR,GB,DE,CN,RU,BR,NL,MX,JP,KR,TT,CL,IN,IL --out $S/gen.json --force
  python3 $S/fill28.py $S/gen.json src/tariff-data/chapters/28-inorganic-and-metal-compounds.json && npx prettier --write <that file>
"""
import collections
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from adcvd28 import AD_CHANGES, AD_GROUP_NOTES, AD_LEVER, AD_RULES, AD_SOURCES, AD_SUMMARY  # noqa: E402
from groups28 import GROUPS  # noqa: E402
from rules28 import ECFR_AS_OF, RULES  # noqa: E402
from static28 import ADDITIONAL_US_NOTES, CH28, CH99, CHAPTER_NOTES, ECFR, EXTRA_SOURCES, GN, SUGGESTIONS_DATE  # noqa: E402

d = json.load(open(sys.argv[1]))
TITLE = "Inorganic Chemicals, Rare-Earth, Precious-Metal & Radioactive Compounds"
H = f"HTS Chapter 28: {TITLE}"
MEASURES = json.load(open(os.path.join(os.getcwd(), "src/tariff-data/calculator/measures.json")))
trade = json.load(open(os.path.join(os.getcwd(), "src/tariff-data/trade/chapter-28.json")))


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


def pct(a, p):
    return f"{(a - p) / p * 100:+.0f}%"


# ---------------------------------------------------------------- data helpers
rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
N = len(leaf)


def cov(key):
    s = set()
    for x in MEASURES["measures"]:
        if x["measureKey"] == key:
            s |= {c for c in x["coverageInclude"] if c.startswith("28")}
    return s


B52, E52, BR50 = cov("s301-2026-exempt-52b"), cov("s301-2026-exempt-52e-pharma-use"), cov("s301-brazil-exempt-50a-ii")
L1, L3, L4A = cov("s301-china-list1"), cov("s301-china-list3"), cov("s301-china-list4a")
R31B, R31F = cov("s301-china-2024-31b"), cov("s301-china-2024-31f")
RU35 = cov("ru-col2-35") | cov("ru-col2-35-0401")
EXEMPT_LINES = sum(1 for r in leaf if r["htsCode10"][:8] in B52)
COVERED_LINES = N - EXEMPT_LINES
DUTIABLE = sum(1 for r in leaf if r["dutiable"])
assert len(B52) == 90 and len(E52) == 41 and len(BR50) == 87, (len(B52), len(E52), len(BR50))
assert EXEMPT_LINES == 134 and COVERED_LINES == 202, (EXEMPT_LINES, COVERED_LINES)
E52_LINES = sum(1 for r in leaf if r["htsCode10"][:8] in E52)
RU_LINES = sum(1 for r in leaf if r["htsCode10"][:8] in RU35)
CN_LINES = sum(1 for r in leaf if r["htsCode10"][:8] in (L1 | L3 | L4A | R31B | R31F))

ia = d["industryAreas"]
COUNTRY = {c["country"]: c for c in ia["countries"]}


def total(country, line, usmca=False):
    """The engine's total for one 10-digit line (dotted) and matrix country."""
    c = COUNTRY[country]
    for cell in c["cells"].values():
        for br in cell["withUsmca" if usmca else "withoutUsmca"]["breakdown"]:
            if line in br["lines"]:
                return br["total"]
    raise KeyError((country, line))


u = d["understandIndustry"]
yr, pyr = u["latestYear"], u["priorYear"]
tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
T, P = tot[yr], tot[pyr]
peak = max(tot.items(), key=lambda kv: kv[1])
byc = {c["country"]: c for c in trade["byCountry"]}
head = {h["heading"]: h["byYear"] for h in trade["byHeading"]}
hc = {(r["country"], r["heading"]): r["importsUsd"] for r in trade["byHeadingCountry"]}
line6 = {l["hs6"]: l for l in trade["byHs6"]}


def H6(code):
    return line6[code]["importsUsd"]


def C(name):
    return byc[name]["importsUsd"]


def HD(h, y=yr):
    return head[h][str(y)]


S = dict(
    T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", peak_y=peak[0], peak=b(peak[1]), y2020=b(tot[2020]),
    ca=b(C("Canada")), fr=b(C("France")), gb=b(C("United Kingdom")), de=b(C("Germany")), cn=b(C("China")), cn_p=b(byc["China"]["priorImportsUsd"]),
    ru=b(C("Russian Federation")), br=b(C("Brazil")), nl=b(C("Netherlands")), mx=b(C("Mexico")), jp=b(C("Japan")), kr=b(C("Rep. of Korea")),
    tt=b(C("Trinidad and Tobago")), cl=b(C("Chile")), inn=b(C("India")), il=b(C("Israel")),
    rad=b(HD("2844")), rad_share=f"{HD('2844') / T * 100:.0f}%", leu=b(H6("284420")), natu=b(H6("284410")), iso=b(H6("284443")),
    fr_rad=b(hc[("France", "2844")]), gb_rad=b(hc[("United Kingdom", "2844")]), ca_rad=b(hc[("Canada", "2844")]), ru_rad=b(hc[("Russian Federation", "2844")]),
    nl_rad=b(hc[("Netherlands", "2844")]), de_rad=b(hc[("Germany", "2844")]), kz_rad=b(hc[("Kazakhstan", "2844")]),
    nh3=b(HD("2814")), ca_nh3=b(hc[("Canada", "2814")]), tt_nh3=b(hc[("Trinidad and Tobago", "2814")]),
    alu=b(HD("2818")), br_alu=b(hc[("Brazil", "2818")]), alu_p=b(HD("2818", pyr)),
    sb=b(H6("282580")), sb_p=b(H6("282580") and line6["282580"]["priorImportsUsd"]),
    si=b(H6("280469")), poly=b(H6("280461")), poly_p=b(line6["280461"]["priorImportsUsd"]), br_2804=b(hc[("Brazil", "2804")]), ca_2804=b(hc[("Canada", "2804")]),
    h2so4=b(H6("280700")), ca_h2so4=b(hc[("Canada", "2807")]), cb=b(H6("280300")), h3po4=b(H6("280920")),
    licarb=b(H6("283691")), licarb_p=b(line6["283691"]["priorImportsUsd"]), ar_li=b(hc[("Argentina", "2836")]), cl_li=b(hc[("Chile", "2836")]),
    iodine=b(H6("280120")), cl_iod=b(hc[("Chile", "2801")]), ree=b(HD("2846")), cn_ree=b(hc[("China", "2846")]),
    cn_2811=b(hc[("China", "2811")]), helium=b(H6("280429")), hf=b(H6("281111")), kr_2841=b(hc[("Rep. of Korea", "2841")]),
    ca_share=f"{C('Canada') / T * 100:.0f}%",
)
print({k: v for k, v in S.items()})

# Engine totals quoted in the prose — asserted so the text can't drift from the grid.
CHK = {
    ("France", "2844.20.00.10"): "Free",
    ("Russia", "2844.20.00.10"): "Free",
    ("China", "2844.20.00.10"): "7.5%",
    ("Canada", "2814.10.00.00"): "Free",
    ("Trinidad and Tobago", "2814.10.00.00"): "Free",
    ("China", "2814.10.00.00"): "25%",
    ("China", "2836.91.00.50"): "28.7%",
    ("Chile", "2836.91.00.50"): "Free",
    ("United Kingdom", "2836.91.00.50"): "3.7%",
    ("China", "2804.61.00.00"): "50%",
    ("Germany", "2804.61.00.00"): "Free",
    ("China", "2846.90.80.90"): "3.7%",
    ("China", "2846.10.00.10"): "5.5%",
    ("China", "2825.80.00.00"): "Free",
    ("Brazil", "2818.20.00.00"): "Free",
    ("Brazil", "2804.69.10.00"): "17.8%",
    ("China", "2801.10.00.00"): "37.5%",
    ("Canada", "2801.10.00.00"): "10%",
    ("Germany", "2801.10.00.00"): "10%",
    ("Japan", "2815.12.00.00"): "12.5%",
    ("China", "2841.61.00.00"): "42.5%",
}
for (cty, ln), want in CHK.items():
    got = total(cty, ln)
    assert got == want, (cty, ln, got, want)
assert total("Canada", "2801.10.00.00", usmca=True) == "Free"

# ---------------------------------------------------------------- overview
o = d["overview"]
o["h1"] = f"{H} — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 28 Tariffs: Inorganic Chemicals, Uranium, Ammonia, Rare Earths & Polysilicon Import Duties | KoalaGains",
    "shortDescription": (
        f"Searchable duty table for all {N} HTS Chapter 28 lines — uranium, ammonia, alumina, acids, caustic soda, silicon and polysilicon, lithium carbonate, "
        "rare-earth compounds, iodine and more. Base rates, the 2026 Section 301 rates and the 90 exempt subheadings, China's 25–50%, and the antidumping orders on chemicals."
    ),
    "keywords": [
        "HTS Chapter 28",
        "htsus chapter 28",
        "inorganic chemicals tariffs",
        "chemical tariffs",
        "us chemical tariffs",
        "rare earth tariffs",
        "polysilicon tariffs",
        "uranium tariffs",
        "ammonia tariff code",
        "hs code 2804",
    ],
}
o["intro"] = (
    "Chapter 28 covers inorganic chemicals and the compounds of precious metals, rare-earth metals, radioactive elements and isotopes: chlorine and iodine, "
    "industrial gases, silicon and polysilicon, sulfuric, phosphoric and hydrochloric acid, ammonia, caustic soda, alumina, metal oxides, salts such as "
    "carbonates, sulfates and phosphates, rare-earth compounds, and uranium. Base rates are low: "
    f"{N - DUTIABLE} of the {N} tariff lines are Free and none is above 5.5%. The U.S. imported **{S['T']}** of these goods in {yr}; **uranium** "
    f"(heading 2844) alone was {S['rad']}, followed by alumina ({S['alu']}) and ammonia ({S['nh3']}).\n\n"
    "What decides the duty today is the country and the exact subheading. The **2026 Section 301 tariffs** add 10% or 12.5% on goods of 60 economies, but "
    f"**90 subheadings ({EXEMPT_LINES} lines)** — uranium, ammonia, sulfuric acid, alumina, polysilicon, lithium carbonate, rare-earth compounds, cobalt, "
    "antimony and many other critical-mineral chemicals — are exempt under U.S. note 52(b). USMCA goods of Canada and Mexico are exempt too. China pays "
    "its List 3 duty of 25% on top (37.5% in total on most lines), and Chinese polysilicon 50%. Several chemicals also carry **antidumping or countervailing "
    "duties**, and many carry the **Superfund chemical excise tax** — neither is included in the tariff calculator."
)
for st in o["stats"]:
    if st["label"].startswith("Lines with an extra duty"):
        st["note"] = (
            f"2026 Section 301 on {COVERED_LINES} lines ({EXEMPT_LINES} exempt, USMCA goods exempt); China Section 301 lists on {CN_LINES} lines; Russia 35% on {RU_LINES}"
        )
    if st["label"].startswith("Lines with a base-rate duty"):
        st["note"] = "Highest base rate 5.5%"
o["stats"] = [st for st in o["stats"]]


def china_phrase(h, L):
    """Short China summary for a heading, from the engine's China cells."""
    cell = COUNTRY["China"]["cells"].get(h)
    if not cell:
        return ""
    totals = cell["withoutUsmca"]["totals"]
    return "China " + (" or ".join(totals[:3]) if len(totals) <= 3 else f"{totals[0]} to {max(totals, key=lambda t: float(t.rstrip('%')) if t.endswith('%') else 0)}")


def tariff_sentence(h):
    L = [r for r in leaf if r["heading"] == h]
    n = len(L)
    ex = sum(1 for r in L if r["htsCode10"][:8] in B52)
    pe = sum(1 for r in L if r["htsCode10"][:8] in E52)
    parts = []
    if ex == n:
        parts.append("all exempt from the 2026 Section 301 tariffs (U.S. note 52(b))" if n > 1 else "exempt from the 2026 Section 301 tariffs (U.S. note 52(b))")
    elif ex:
        parts.append(f"{ex} of {n} lines exempt from the 2026 Section 301 tariffs (U.S. note 52(b))")
    else:
        parts.append("the 2026 Section 301 tariffs apply" if n > 1 else "the 2026 Section 301 tariff applies")
    if pe:
        parts.append(f"{pe} exempt only when for pharmaceutical use (note 52(e))")
    return "; ".join(parts) + "."


for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"], g["searchExamples"] = G[0], G[3]
    g["blurb"] = f"{G[2]} Tariffs: {tariff_sentence(g['heading'])}"
    if g["heading"] in AD_GROUP_NOTES:
        g["blurb"] += f" {AD_GROUP_NOTES[g['heading']][0]}"

ts = o["tradeSnapshot"]
ts["biggestLines"] = [
    {"hts": "2844.20", "label": "Enriched uranium and its compounds"},
    {"hts": "2844.10", "label": "Natural uranium and its compounds"},
]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
o["notes"] = {"chapterNotes": CHAPTER_NOTES, "additionalUsNotes": ADDITIONAL_US_NOTES}
o["workedExamples"] = [
    {
        "title": "Enriched uranium from France vs. Russia",
        "line": "2844.20.00.10",
        "body": (
            "Uranium oxide enriched in U-235 is **Free** under the general rate and on the U.S. note 52(b) exemption list, so it pays no 2026 Section 301 duty "
            "from any country: a $10,000,000 cargo from France, the United Kingdom or the Netherlands pays **$0** in duty. Russian enriched uranium is also Free "
            "under the column 2 rate, but the **Prohibiting Russian Uranium Imports Act** bans it unless the Department of Energy grants a waiver, and waivers end "
            "no later than January 1, 2028. Chinese enriched uranium pays 7.5% (List 4A, 9903.88.15). Every importer also needs the U.S. consignee's NRC license."
        ),
    },
    {
        "title": "Anhydrous ammonia from Trinidad and Tobago or Canada",
        "line": "2814.10.00.00",
        "body": (
            "Anhydrous ammonia is **Free** and on the note 52(b) exemption list, so ammonia from Trinidad and Tobago, Canada or Algeria pays no customs duty. "
            "Chinese ammonia pays 25% (List 3). The importer that sells or uses the ammonia owes the **Superfund chemical excise tax** of **$5.28 per ton** "
            "(26 U.S.C. 4661) — $52,800 on 10,000 tons — unless it goes into fertilizer or animal feed (26 U.S.C. 4662(b)). The tax is filed with the IRS on "
            "Form 6627, not paid to CBP."
        ),
    },
    {
        "title": "Lithium carbonate from Argentina, Chile and China",
        "line": "2836.91.00.50",
        "body": (
            "Lithium carbonate carries a **3.7%** base rate and is on the note 52(b) exemption list. From Argentina it pays 3.7% ($37,000 on $1,000,000); "
            "from Chile it is **Free** with a U.S.–Chile FTA claim; from China it pays **28.7%** (3.7% + 25% List 3, 9903.88.03) — $287,000 on the same "
            "$1,000,000. EU goods pay the 3.7% base rate only, because the EU's 10% minimum does not apply to exempt subheadings."
        ),
    },
    {
        "title": "Polysilicon from China and Germany — and the December 2026 minimum price",
        "line": "2804.61.00.00",
        "body": (
            "Silicon of at least 99.99% purity (polysilicon) is **Free** and on the note 52(b) exemption list. Chinese polysilicon pays **50%** under the 2024 "
            "Section 301 four-year review (9903.91.05); German, Malaysian or Norwegian polysilicon pays nothing. From **December 4, 2026**, Proclamation 11052 "
            "adds a Section 232 minimum import price of **$21/kg** (heading 9903.45.33): an importer that does not document a first sale at or above $21/kg "
            "pays a specific duty of $21/kg, and one that does pays the difference between the entered value and $21/kg if the entered value is lower."
        ),
    },
    {
        "title": "Rare-earth oxides from China",
        "line": "2846.90.80.90",
        "body": (
            "Rare-earth compounds are on the note 52(b) exemption list and are **not on any China Section 301 list**, so Chinese rare-earth oxides pay only "
            "their base rate: 3.7% on most rare-earth compounds of 2846.90.80, Free on lanthanum, yttrium and scandium compounds of 2846.90.20 and 2846.90.40, "
            "and 5.5% on cerium compounds (2846.10). No Section 232 tariff applies: Proclamation 11001 (January 14, 2026) chose negotiations for processed "
            "critical minerals instead of tariffs."
        ),
    },
]

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = f"{H} — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 28 Tariff Updates — Chemical, Uranium, Rare Earth & Polysilicon Tariffs Since 2025 | KoalaGains",
    "shortDescription": (
        "What changed for inorganic chemical imports since January 2025: the IEEPA duties and their end, the 2026 Section 122 surcharge, the 2026 Section 301 "
        "tariffs and their 90 exempt subheadings, China's polysilicon and critical-mineral rates, the Section 232 polysilicon minimum price and the antidumping "
        "orders — with Federal Register citations."
    ),
    "keywords": [
        "us chemical tariffs",
        "tariffs on chemicals from china",
        "section 301 chemicals",
        "section 232 polysilicon tariffs",
        "critical minerals tariffs",
        "rare earth tariffs china",
        "uranium tariffs",
        "chemical tariffs canada",
    ],
}
tu["intro"] = (
    f"This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** "
    f"(in force October 9, 2026). No Chapter 28 base rate changed; nine statistical lines were added to split existing subheadings.\n\n"
    "The extra duties changed a lot. In 2025, non-USMCA goods of Canada and Mexico paid IEEPA duties (10% for Canadian uranium and critical minerals) and "
    "goods of most other countries the reciprocal tariff — except 86 Chapter 28 subheadings, mainly critical minerals and energy goods. Those duties **ended "
    "on February 24, 2026**; the 10% Section 122 surcharge that followed ran until July 23, 2026. Since **July 24, 2026** the **2026 Section 301 tariffs** "
    f"apply 10% or 12.5% to goods of 60 economies, with 90 Chapter 28 subheadings exempt (U.S. note 52(b)) and USMCA goods exempt. China pays its 2018–2019 "
    "list duties on top, and since the 2024 review 25% on certain critical minerals and 50% on polysilicon.\n\n"
    "Coming next: a **Section 232 minimum import price of $21/kg on polysilicon** from December 4, 2026. "
    f"{AD_SUMMARY} Antidumping and countervailing duties are set by the Commerce Department and are **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 28 from any country (the 2026 Section 301 actions on 60 economies and Brazil, China's Section 301 lists, the Russia "
    "rates in lieu of column 2, the ended IEEPA and Section 122 duties), the Section 232 actions on critical minerals and polysilicon, and the antidumping and "
    "countervailing duty orders on Chapter 28 chemicals, which the tariff calculator does not model. For the rate each supplier pays, see Rates by country."
)

E52_TXT = (
    f"90 Chapter 28 subheadings ({EXEMPT_LINES} lines) are exempt under U.S. note 52(b) (9903.05.86), among them uranium (2844.10–2844.30), ammonia, "
    "sulfuric acid, alumina, polysilicon, lithium carbonate and hydroxide, rare-earth metals and compounds, cobalt, antimony and iron oxides; "
    f"41 more ({E52_LINES} lines), such as hydrochloric and phosphoric acid and caustic soda, are exempt only when for pharmaceutical use (note 52(e), 9903.05.89)."
)
IEEPA_END = "The IEEPA duties ended February 24, 2026, and the Section 122 surcharge expired July 23, 2026."
INEFFECT = {
    "ca-section-301": (
        f"Does not apply to goods entered under USMCA (9903.05.93, U.S. note 52(g)). {E52_TXT} No Chapter 28 good is on the Canada Section 338 lists (note 51). {IEEPA_END}",
        "Non-USMCA Canadian chlorine, caustic soda or carbon black pays 10% of its value; Canadian uranium, ammonia and sulfuric acid are exempt, and USMCA goods pay only the base rate.",
    ),
    "mx-section-301": (
        f"Does not apply to goods entered under USMCA (9903.05.94, U.S. note 52(h)). {E52_TXT} {IEEPA_END}",
        "Non-USMCA Mexican phosphoric acid and sodium or aluminum sulfate pay 10%; hydrofluoric acid, zinc oxide and sulfuric acid are exempt; USMCA goods pay only the base rate.",
    ),
    "eu-section-301": (
        f"For goods of EU member states the total is 10% when the base rate is lower (U.S. note 52(k)): Free lines pay 10%, and lines with a 0.1–5.5% base rate also 10% in total. {E52_TXT} The 15% IEEPA rate for the EU ended February 24, 2026.",
        "French, Dutch and German enriched uranium and Belgian lithium hydroxide pay nothing extra (exempt); German sodium hydrosulfite, Belgian phosphoric acid and other covered EU chemicals pay 10% in total.",
    ),
    "jp-section-301": (
        f"For goods of Japan the total is 12.5% when the base rate is lower (U.S. note 52(k)). {E52_TXT} The 15% IEEPA rate for Japan ended February 24, 2026.",
        "Japanese caustic soda, hydrochloric acid and precious-metal compounds pay 12.5% in total; exempt subheadings pay only the base rate.",
    ),
    "gb-section-301": (
        f"{E52_TXT} The 10% IEEPA rate for the United Kingdom ended February 24, 2026.",
        "British uranium (the second-largest supply lane) is exempt; other covered UK chemicals pay base rate + 10%.",
    ),
    "in-section-301": (
        f"{E52_TXT} No India-specific product list covers Chapter 28. The IEEPA duties on India ended February 24, 2026.",
        "Indian carbon black and stable isotopes pay base rate + 10%; Indian exempt subheadings pay only the base rate.",
    ),
    "ru-section-301": (
        f"Russia pays column 2 rates (general note 3(b)). For 56 subheadings ({RU_LINES} lines), 35% replaces the column 2 rate (9903.90.08, U.S. note 30; from July 27, 2022, or April 1, 2023 for those added by Proclamation 10523). The 12.5% Section 301 duty (9903.05.66) is added except on the note 52(b) subheadings. Russian low-enriched uranium is banned by statute unless DOE grants a waiver (until January 1, 2028).",
        "Russian enriched uranium pays no duty (column 2 Free, exempt from Section 301) but needs a DOE waiver; other Russian chemicals pay 35% or their column 2 rate, plus 12.5% unless exempt.",
    ),
    "br-section-301": (
        "The 25% Brazil duty (9903.05.01) exempts 87 Chapter 28 subheadings under U.S. note 50(a)(ii) (9903.05.03) — the note 52(b) list minus sulfur, nitrogen, sulfuric acid, ammonia and one nitrate line, plus silicon metal (2804.69) and one silicate — and the 12.5% 2026 duty exempts the 90 note 52(b) subheadings. The 40% IEEPA duty on Brazil ended February 24, 2026.",
        "Brazilian alumina (the largest Brazilian lane) pays nothing extra; Brazilian silicon metal 17.8% (5.3% + 12.5%); ammonia and sulfuric acid 25%; most other Brazilian chemicals 37.5% plus base rate.",
    ),
    "kr-section-301": (
        f"For goods of South Korea the total is 12.5% when the base rate is lower (U.S. note 52(k)), even with a KORUS claim (note 52(a)). {E52_TXT}",
        "Korean caustic soda and other covered chemicals pay 12.5% in total; exempt subheadings are Free with a KORUS claim.",
    ),
    "il-section-301": (
        f"{E52_TXT} A U.S.–Israel FTA claim removes the base rate but not the Section 301 duty (note 52(a)).",
        "Israeli sodium bromide and phosphoric acid pay 12.5%; exempt subheadings are Free with an FTA claim.",
    ),
    "cl-section-301": (
        f"{E52_TXT} A U.S.–Chile FTA claim removes the base rate but not the Section 301 duty (note 52(a)). Iodine and lithium carbonate, Chile's main exports to the U.S. in this chapter, are exempt.",
        "Chilean iodine and lithium carbonate enter Free with an FTA claim; Chilean potassium nitrate (2834.21, exempt) also Free.",
    ),
    "tt-section-301": (
        f"{E52_TXT} Ammonia, Trinidad and Tobago's main export to the U.S. in this chapter, is exempt.",
        "Trinidadian ammonia pays no customs duty; covered chemicals pay base rate + 10%.",
    ),
    "cn-section-301": (
        "List 3 (9903.88.03, U.S. note 20(f)) covers 230 Chapter 28 subheadings at 25%; List 1 (9903.88.01) the stable isotopes of 2845.20–2845.90 at 25%; List 4A (9903.88.15) seven subheadings, among them enriched uranium (2844.20) and artificial corundum, at 7.5%; note 31(b) (9903.91.01, since September 27, 2024) seven critical-mineral subheadings such as tungstates and radioactive isotopes (2844.41–2844.44) at 25%; and note 31(f) (9903.91.05, since January 1, 2025) polysilicon at 50%. "
        "Not on any China list: rare-earth metals and compounds (2805.30, 2846), alumina (2818.20), antimony oxides (2825.80), depleted uranium and thorium compounds (2844.30), silicon carbide (2849.20) and a few other exempt subheadings. The 12.5% 2026 duty (9903.05.31) stacks on top except for the note 52(b) subheadings. Sodium metal in bulk solid form is excluded from List 3 through November 9, 2026 (9903.88.69). "
        f"USTR confirmed on October 7, 2026 that the 2018 actions continue during their four-year review. {IEEPA_END}",
        "Most Chinese Chapter 28 chemicals pay 37.5% plus the base rate; exempt chemicals that are on List 3, such as ammonia, zinc oxide, natural uranium and lithium carbonate, 25% plus base; polysilicon 50%; enriched uranium 7.5%; rare-earth oxides, alumina and antimony oxide only the base rate.",
    ),
    "other-section-301": (
        f"{E52_TXT} Rates: 10% for some economies (e.g. Argentina, Malaysia), 12.5% for others (e.g. Algeria, Kazakhstan, Morocco, the Philippines, Qatar, Türkiye); Switzerland and Taiwan pay a total of 12.5% or 10% in place of a lower base rate. Countries outside the 60, such as Uzbekistan and Bolivia, pay only the base rate.",
        "Kazakh uranium and Argentine lithium carbonate are exempt; Turkish boric acid and borax pay base rate + 12.5%; Swiss cyanides 12.5% in total.",
    ),
}
for x in tu["inEffect"]:
    if x["id"] in INEFFECT:
        x["exemption"], x["whatItMeans"] = INEFFECT[x["id"]]
    else:
        raise KeyError(x["id"])
    if "IEEPA" in x["exemption"] and "eo-14389" not in x["sourceIds"]:
        x["sourceIds"].append("eo-14389")
    if x["id"] == "cn-section-301":
        x["now"] = "+37.5% on most lines; +25%, +20%, +12.5%, +7.5% or none on others; polysilicon +50%"
        for sid in ("fr-2025-21671",):
            if sid not in x["sourceIds"]:
                x["sourceIds"].append(sid)
    if x["id"] == "ru-section-301":
        x["now"] = "+12.5%, 35% in place of column 2, or both; none on exempt lines"
    if x["id"] == "br-section-301":
        x["now"] = "+37.5% on most lines; +25% or +12.5% on some; none on 128 lines"

have = {s["id"] for s in tu["sources"]}
for s in EXTRA_SOURCES + AD_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])

GEN_DETAIL = {
    "section-301-nicaragua-scheduled-2027-01-01": (
        "Section 301 tariff on Nicaragua phases in from 2027",
        "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), with no exemption list for Chapter 28. The rate is 0% in 2026.",
    ),
    "section-301-2026-60-economies-2026-07-24": (
        "2026 Section 301 tariffs on 60 economies take effect",
        f"10% or 12.5% on goods of 60 economies (9903.05.20–9903.05.84), on top of the base rate, including China, Japan, South Korea, India, Israel, Chile, Trinidad and Tobago, the EU (10% in total) and non-USMCA goods of Canada and Mexico. 90 Chapter 28 subheadings are exempt under U.S. note 52(b) (9903.05.86) and 41 more when for pharmaceutical use (note 52(e)); the other {COVERED_LINES} of {N} lines are covered.",
    ),
    "section-301-brazil-2026-07-22": (
        "25% Section 301 tariff on Brazil takes effect",
        "25% on goods of Brazil (9903.05.01), on top of the base rate and the 12.5% 2026 duty. 87 Chapter 28 subheadings are exempt under U.S. note 50(a)(ii) (9903.05.03), including alumina, silicon metal, uranium and rare-earth compounds; 45 more when for pharmaceutical use (note 50(a)(v)).",
    ),
    "section-301-china-2024-four-year-review-2025-01-01": (
        "50% Section 301 tariff on Chinese polysilicon",
        "As announced in the 2024 four-year review, polysilicon of China (2804.61) pays 50% from January 1, 2025 (9903.91.05, U.S. note 31(f)), up from 25% under List 3. USTR's December 2025 semiconductor action schedules a further increase for June 23, 2027, in an amount not yet announced.",
    ),
}
base = []
for c in tu["changes"]:
    if c["id"] in GEN_DETAIL:
        c["title"], c["detail"] = GEN_DETAIL[c["id"]]
    if c["type"] == "baseRate":
        c["title"] = "No Chapter 28 base-rate changes"
        c["detail"] = (
            f"All {N} Chapter 28 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. Nine "
            "statistical lines are new, splitting existing subheadings without a rate change: germanium dioxide and zirconium dioxide (2825.60), lithium chloride "
            "(2827.39.90), zirconium carbonates (2836.99.50) and selenides and tellurides (2842.90.90)."
        )
    if "TODO" in c["detail"]:
        raise ValueError(c["id"])
    base.append(c)


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


changes = base + AD_CHANGES + [
    ch("polysilicon-232", "pending", "2026-08-06", "Signed", "Section 232 minimum import price on polysilicon from December 4, 2026",
       "Proclamation 11052 (signed August 6, 2026) sets a minimum import price of $21/kg for polysilicon (2804.61.00.00) from December 4, 2026 (new heading 9903.45.33, U.S. note 42). An importer that documents a first U.S. sale at or above $21/kg pays nothing more when the entered value is at least $21/kg, or the shortfall when it is lower; without the documentation the duty is $21/kg. It applies in addition to the Section 301 duties. Ingots and wafers (3818) and solar cells and modules (8541) also get a 15% duty.",
       None, "$21/kg minimum import price", "All", ["procl-11052"]),
    ch("polysilicon-stockpiling", "extraDuty", "2026-09-22", "Effective", "Limits on polysilicon imports before the minimum price starts",
       "A BIS temporary final rule (September 22 – December 3, 2026) lets Commerce bar importers that stockpile polysilicon ahead of December 4, and limits importers registered with CBP on or after August 6, 2026 to 12 kg of polysilicon (2804.61.00) a week unless Commerce grants a waiver.",
       None, "Import limits until December 3", "All", ["fr-2026-19537"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their 2026 anniversaries and remain in effect during the statutory review. The 25% List 3 duty on most Chinese Chapter 28 chemicals continues.",
       None, None, "China", ["fr-2026-20510"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% Section 122 surcharge (9903.03.01) ended after its 150 days on July 23, 2026; the 2026 Section 301 tariffs took over the next day.",
       "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply — and still lift the 2026 Section 301 duty on Canadian and Mexican goods.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("critical-minerals-plurilateral", "reference", "2026-02-26", "Published", "USTR asks for comments on a critical-minerals trade agreement",
       "Following Proclamation 11001, USTR requested public comments on the design of a plurilateral agreement on trade in critical minerals, including price floors and other measures. No tariff has resulted.",
       None, None, "All", ["fr-2026-03868"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. USMCA goods of Canada and Mexico were exempt, and so were the same 86 Chapter 28 subheadings as under the reciprocal tariff (9903.03.03), including uranium, rare-earth compounds, polysilicon and lithium carbonate; ammonia, sulfuric acid, caustic soda and chlorine paid.",
       None, "+10% (ended)", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("critical-minerals-232", "reference", "2026-01-14", "Signed", "Section 232 on processed critical minerals: negotiations, no tariff",
       "Proclamation 11001 agreed with Commerce that imports of processed critical minerals and their derivative products threaten national security, but directed Commerce and USTR to negotiate agreements (considering price floors) instead of imposing tariffs. No Section 232 duty applies to rare-earth, lithium, cobalt or other Chapter 28 critical-mineral compounds.",
       None, None, "All", ["procl-11001", "eo-14272"]),
    ch("cn-fentanyl-cut", "extraDuty", "2025-11-10", "Effective", "China IEEPA fentanyl duty cut to 10%",
       "Executive Order 14357 lowered the IEEPA duty on products of China from 20% to 10% from November 10, 2025. Ended February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("reciprocal-country-rates", "extraDuty", "2025-08-07", "Effective", "Reciprocal tariff raised to country-specific rates",
       "Executive Order 14326 replaced the 10% baseline with country rates for goods entered from August 7, 2025 — for example 15% for Japan, South Korea, Israel and Trinidad and Tobago... and 15% in total for the EU. The exempt subheadings stayed exempt. Ended February 24, 2026.",
       "+10%", "Higher country rates (ended)", "All except Canada, Mexico", ["eo-14326"]),
    ch("brazil-ieepa", "extraDuty", "2025-08-06", "Effective", "Extra 40% IEEPA duty on goods of Brazil",
       "Executive Order 14323 added 40% on goods of Brazil, on top of the reciprocal tariff, for goods entered from August 6, 2025, with an annex of exempt products. Ended February 24, 2026.",
       None, "+40% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada IEEPA duty raised to 35% on non-USMCA goods",
       "Raised the IEEPA duty on Canadian goods not entered under USMCA from 25% to 35% (9903.01.10); Canadian energy, uranium and critical minerals stayed at 10% (9903.01.13). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on most Chapter 28 goods",
       "10% baseline (9903.01.25) on products of all countries except Canada and Mexico, from April 5, 2025. 86 Chapter 28 subheadings — among them uranium, polysilicon, rare-earth metals and compounds, lithium carbonate and hydroxide, cobalt, antimony, manganese and titanium oxides and iodine — are on the exemption list printed in the schedule (U.S. note 2(v)(iii)(a)); ammonia, sulfuric acid, caustic soda, chlorine and most salts paid. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("ca-mx-usmca", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.",
       "+25%", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("cn-fentanyl-20", "extraDuty", "2025-03-04", "Effective", "China IEEPA fentanyl duty raised to 20%",
       "Executive Order 14228 raised the IEEPA duty on products of China (9903.01.20) from 10% to 20%, on top of the Section 301 duties. Ended February 24, 2026.",
       "+10%", "+20% (ended)", "China", ["eo-14228"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada, Mexico and China",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, with 10% for Canadian energy resources, uranium and critical minerals (9903.01.13); +10% on goods of China (9903.01.20) from February 4, 2025. Ended February 24, 2026.",
       "None", "+25% / +10% (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195"]),
    ch("cn-31b", "extraDuty", "2024-09-27", "Effective", "25% Section 301 tariff on Chinese critical minerals",
       "The 2024 four-year review moved seven Chapter 28 subheadings — among them tungstates, a tungsten oxide line, radioactive isotopes (2844.41–2844.44) and a carbide line — to heading 9903.91.01 at 25% from September 27, 2024 (U.S. note 31(b)).",
       None, "+25%", "China", ["fr-2024-21217", "hts-chapter-99"]),
    ch("ru-col2-35", "extraDuty", "2022-07-27", "Effective", "35% in lieu of column 2 on certain Russian chemicals",
       f"Proclamation 10420 set a 35% rate in place of the column 2 rate for listed products of Russia (9903.90.08, U.S. note 30), and Proclamation 10523 added more from April 1, 2023, including carbon black (2803), selenium (2804.90), calcium (2805.12) and rare-earth compounds (2846.90). 56 Chapter 28 subheadings ({RU_LINES} lines) are covered. Still in force.",
       "Column 2 rate", "35%", "Russia", ["procl-10420", "procl-10523", "hts-chapter-99"]),
    ch("ru-uranium-ban", "reference", "2024-08-11", "Effective", "Ban on Russian low-enriched uranium takes effect",
       "The Prohibiting Russian Uranium Imports Act (Public Law 118-62, signed May 13, 2024) bans imports of unirradiated low-enriched uranium produced in Russia or by a Russian entity from August 11, 2024, with DOE waivers capped each year and ending no later than January 1, 2028. The NRC applies it to natural uranium too. This is an import ban, not a tariff.",
       None, None, "Russia", ["nrc-2024-11164", "doe-2024-11392"]),
]
changes.sort(key=lambda c: c["date"], reverse=True)
for c in changes:
    c["detail"] = c["detail"].replace("Trinidad and Tobago... and", "Trinidad and Tobago, and")
tu["changes"] = changes
tu["sources"] += [s for s in [
    dict(id="nrc-2024-11164", publisher="Federal Register", citation="89 FR 45926", document="Notice (NRC)", title="Effect of Statutory Prohibition on Uranium Imports From the Russian Federation", signed=None, published="2024-05-24",
         url="https://www.federalregister.gov/documents/2024/05/24/2024-11164/effect-of-statutory-prohibition-on-uranium-imports-from-the-russian-federation"),
    dict(id="doe-2024-11392", publisher="Federal Register", citation="89 FR 45871", document="Notice (DOE)", title="Instructions for Requesting a Waiver From the Secretary of Energy for the Import of Russian Low-Enriched Uranium (LEU) Into the United States", signed=None, published="2024-05-24",
         url="https://www.federalregister.gov/documents/2024/05/24/2024-11392/instructions-for-requesting-a-waiver-from-the-secretary-of-energy-for-the-import-of-russian"),
] if s["id"] not in have]
tu["stats"] = [
    {"label": "Base rates unchanged", "value": f"{N} of {N} lines", "note": "9 new statistical lines, same rates"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (60 economies, Brazil, China); Russia 35%"},
    {"label": "Exempt subheadings", "value": "90", "note": "U.S. note 52(b), 2026 Section 301"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
missing = used - {s["id"] for s in tu["sources"]}
assert not missing, missing
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]
SRC = {s["id"]: s for s in tu["sources"]}

# ---------------------------------------------------------------- understandIndustry
LABEL = {h: GROUPS[h][0] for h in GROUPS}
u["h1"] = f"{H} — U.S. Import Statistics"
u["seo"] = {
    "title": "U.S. Inorganic Chemical Imports by Country — Uranium, Ammonia, Alumina (HTS Chapter 28) | KoalaGains",
    "shortDescription": (
        f"Where U.S. imports of inorganic chemicals come from, 2020–{yr}: {S['T']} in {yr}, {S['rad_share']} of it uranium from France, the UK, Canada and "
        "Russia; ammonia from Canada and Trinidad and Tobago; alumina from Brazil; rare-earth compounds from China. By country, by product and over time, from UN Comtrade."
    ),
    "keywords": [
        "us chemical imports",
        "where does the us get uranium",
        "us uranium imports by country",
        "us enriched uranium imports",
        "us ammonia imports",
        "us rare earth imports by country",
        "HTS Chapter 28 import statistics",
    ],
}
for st in u["stats"]:
    if st["label"] == "Largest product":
        st["note"] = "Enriched uranium and its compounds (2844.20)"
for c in u["byCountry"]:
    if c["mainHeading"] in LABEL:
        c["mainHeadingLabel"] = LABEL[c["mainHeading"]]
u["why"] = (
    f"U.S. imports of Chapter 28 goods were **{S['T']} in {yr}**, {S['chg']} from {S['P']} in {pyr}, almost level with the {S['peak_y']} peak of {S['peak']} "
    f"and up from {S['y2020']} in 2020. **Uranium** (heading 2844) is the largest item by far: {S['rad']} ({S['rad_share']}), mostly enriched uranium "
    f"({S['leu']}) and natural uranium compounds such as uranium hexafluoride ({S['natu']}), plus radioactive isotopes for medicine and industry ({S['iso']}). "
    f"It comes from **France** ({S['fr_rad']}), the **United Kingdom** ({S['gb_rad']}), **Canada** ({S['ca_rad']}), **Russia** ({S['ru_rad']}), the Netherlands "
    f"({S['nl_rad']}), Germany ({S['de_rad']}) and Kazakhstan ({S['kz_rad']}). That is why France and the UK rank second and third among all suppliers.\n\n"
    f"**Alumina and aluminum hydroxide** (heading 2818) rose to {S['alu']} from {S['alu_p']}, {S['br_alu']} of it from Brazil. **Ammonia** was {S['nh3']}: "
    f"{S['ca_nh3']} from Canada and {S['tt_nh3']} from Trinidad and Tobago. Silicon metal ({S['si']}) is the largest item of heading 2804, where Brazil and Canada are the top suppliers; polysilicon imports "
    f"rose to {S['poly']} from {S['poly_p']}. **Antimony oxides** more than doubled to {S['sb']}. Other large lines are sulfuric acid ({S['h2so4']}, mostly from "
    f"Canada), carbon black ({S['cb']}), phosphoric acid ({S['h3po4']}), iodine ({S['iodine']}, {S['cl_iod']} from Chile), lithium carbonate ({S['licarb']}, "
    f"from Argentina and Chile) and rare-earth compounds ({S['ree']}, {S['cn_ree']} from China).\n\n"
    f"Canada is the largest supplier overall ({S['ca']}, {S['ca_share']}), shipping uranium, ammonia, sulfuric acid and sodium chlorate that mostly enter "
    f"Free. Imports from China fell to {S['cn']} from {S['cn_p']}. The {yr} figures predate the 2026 Section 301 tariffs, which exempt uranium, ammonia, "
    f"alumina and most critical-mineral chemicals. {yr} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
)
u["sources"] = u["sources"] + [{"label": "HTSUS 2026 Revision 21, Chapter 99 (U.S. note 52(b) exemption list)", "url": CH99}]

# ---------------------------------------------------------------- industryAreas
ia["h1"] = f"{H} — Tariff Rates by Country"
for g in ia["groups"]:
    G = GROUPS[g["heading"]]
    g["label"], g["shortLabel"] = G[0], G[1]
ia["seo"] = {
    "title": "Chemical Tariffs by Country — Canada, France, UK, China, Russia, Brazil (HTS Ch. 28 Inorganic Chemicals) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on inorganic chemicals by country and product group: Free with USMCA for Canada and Mexico, 10% for the EU and the UK, 12.5% "
        "for Japan and South Korea, up to 37.5% plus base for China and Brazil — with the 90 exempt subheadings (uranium, ammonia, alumina, critical minerals) explained."
    ),
    "keywords": [
        "chemical tariffs canada",
        "us tariffs on china chemicals",
        "tariff on chemicals from india",
        "us tariffs on chemicals",
        "uranium tariff canada",
        "china critical minerals tariffs",
        "chemical tariff code",
    ],
}
ia["intro"] = (
    "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
    "Base rates in this chapter are 0–5.5%, so the total is mainly the **2026 Section 301 rate** of the country: 10% or 12.5%, or a 10% (EU) or 12.5% "
    "(Japan, South Korea) total in place of a lower base rate.\n\n"
    "Two things change the answer. A **USMCA claim** removes the 10% duty on Canadian and Mexican goods — compare the two Canada and Mexico columns. And 90 "
    "subheadings (uranium, ammonia, sulfuric acid, alumina, polysilicon, lithium carbonate, rare-earth compounds and most critical-mineral chemicals) are "
    "**exempt** under U.S. note 52(b), so they pay only the base rate from almost every country. China pays its List 3 duty on top (37.5% plus base on most "
    "lines), Brazil a further 25%. The table does **not** include antidumping or countervailing duties, the Superfund chemical excise tax or the December 2026 "
    "Section 232 polysilicon minimum price."
)
EX = "90 subheadings (134 lines) are exempt (U.S. note 52(b), 9903.05.86)"
labels = {
    "Canada": (f"Free with a USMCA claim (9903.05.93). Without one: base rate + 10% Section 301 (9903.05.29) on {COVERED_LINES} lines; {EX}, including uranium, ammonia and sulfuric acid. No Chapter 28 good is on the Section 338 lists; the IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "France": (f"EU: 10% in total when the base rate is lower (9903.05.39, note 52(k)) on {COVERED_LINES} lines; {EX}, including enriched uranium. The 15% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "United Kingdom": (f"Base rate + 10% Section 301 (9903.05.81) on {COVERED_LINES} lines; {EX}, including uranium. The 10% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Germany": (f"EU: 10% in total when the base rate is lower (9903.05.39, note 52(k)) on {COVERED_LINES} lines; {EX}. The 15% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "China": ("Base rate + 25% List 3 (9903.88.03, 230 subheadings) + 12.5% (9903.05.31) except on the note 52(b) subheadings: 37.5% on most lines; 25% on exempt List 3 lines such as ammonia, zinc oxide and lithium carbonate; 7.5% on enriched uranium and corundum (List 4A); 50% on polysilicon (9903.91.05); none on rare-earth compounds, alumina, antimony oxides and other unlisted exempt lines. IEEPA duties ended February 24, 2026.", ["fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2024-21217", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
    "Russia": (f"Column 2 rates, with 35% in their place on 56 subheadings (9903.90.08, note 30), + 12.5% Section 301 (9903.05.66) except on the note 52(b) subheadings. Enriched uranium is Free but banned without a DOE waiver (Public Law 118-62).", ["procl-10420", "procl-10523", "fr-2026-15181", "hts-now"]),
    "Brazil": ("Base rate + 12.5% (9903.05.27) + 25% Brazil Section 301 (9903.05.01): 37.5% plus base on most lines. Exempt: the note 52(b) subheadings from the 12.5% and 87 subheadings under note 50(a)(ii) from the 25% (alumina, uranium and rare earths pay nothing extra; silicon metal 12.5%; ammonia and sulfuric acid 25%). The 40% IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "fr-2026-14542", "eo-14389", "hts-now"]),
    "Netherlands": (f"EU: 10% in total when the base rate is lower (9903.05.39, note 52(k)) on {COVERED_LINES} lines; {EX}, including uranium. The 15% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Mexico": (f"Free with a USMCA claim (9903.05.94). Without one: base rate + 10% Section 301 (9903.05.55) on {COVERED_LINES} lines; {EX}, including zinc oxide and sulfuric acid. The 25% IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Japan": (f"12.5% in total when the base rate is lower (9903.05.49, note 52(k)) on {COVERED_LINES} lines; {EX}. The 15% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "South Korea": (f"12.5% in total when the base rate is lower (9903.05.71, note 52(k)) on {COVERED_LINES} lines, even with a KORUS claim; {EX} and Free with a KORUS claim where the line offers it.", ["fr-2026-15181", "hts-now"]),
    "Trinidad and Tobago": (f"Base rate + 10% Section 301 (9903.05.78) on {COVERED_LINES} lines; {EX}, including ammonia.", ["fr-2026-15181", "hts-now"]),
    "Chile": (f"Base rate (Free with a U.S.–Chile FTA claim) + 12.5% Section 301 (9903.05.30) on {COVERED_LINES} lines, even with the FTA claim (note 52(a)); {EX}, including iodine and lithium carbonate.", ["fr-2026-15181", "hts-now"]),
    "India": (f"Base rate + 10% Section 301 (9903.05.44) on {COVERED_LINES} lines; {EX}. The IEEPA duties ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Israel": (f"Base rate (Free with a U.S.–Israel FTA claim) + 12.5% Section 301 (9903.05.47) on {COVERED_LINES} lines, even with the FTA claim (note 52(a)); {EX}.", ["fr-2026-15181", "hts-now"]),
    "Any other country": ("Base rate + 10% or 12.5% for the other Section 301 economies (e.g. Argentina 10%; Kazakhstan, Qatar and Türkiye 12.5%), a 12.5% or 10% total for Switzerland and Taiwan, and the base rate only for countries outside the 60 (e.g. Bolivia, Uzbekistan). Nicaragua pays 0% until January 1, 2027. Belarus, Cuba and North Korea pay column 2 rates.", ["fr-2026-15181", "fr-2025-23892", "hts-now"]),
}
for c in ia["countries"]:
    c["rule"]["label"], c["rule"]["sourceIds"] = labels[c["country"]]
have = {s["id"] for s in ia["sources"]}
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in have:
            ia["sources"].append(SRC[sid])
            have.add(sid)
ia["sources"] = [s for s in ia["sources"] if s["id"] in {i for c in ia["countries"] for i in c["rule"]["sourceIds"]} | {"hts-now"}]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026. Neither is applied.",
    "Exemption lists checked in the 2026 Revision 21: U.S. note 52(b) (90 Chapter 28 subheadings exempt from the 2026 Section 301 duties), note 52(e) (41 more when for pharmaceutical use, not applied), note 50(a)(ii) (87 exempt from the Brazil duty), notes 20(b), 20(f) and 20(s) (China Lists 1, 3 and 4A), note 31 (China 2024 review) and note 30 (Russia). No country-specific Section 301 exemption list and no Canada Section 338 list covers Chapter 28.",
    "Not included: antidumping and countervailing duties on Chapter 28 chemicals, the Superfund chemical excise tax (an IRS tax, not a customs duty), the Section 232 polysilicon minimum import price from December 4, 2026, the ban on Russian low-enriched uranium, and entry rules (TSCA certification, DEA listed chemicals, NRC licenses).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) exempts 90 Chapter 28 "
    "subheadings, from 2801.20 (iodine) to 2853.90.90, including 2804.61 (polysilicon), 2807 (sulfuric acid), 2814 (ammonia), 2818 (alumina), 2836.91 "
    "(lithium carbonate), 2844.10–2844.30 (uranium) and 2846 (rare-earth compounds); note 52(e) (9903.05.89) exempts 41 more only for pharmaceutical use. "
    "Note 50(a)(ii) exempts 87 subheadings from the Brazil duty (the 52(b) list without 2802, 2804.30, 2807, 2814.10, 2814.20 and 2834.29.10, plus 2804.69.10, "
    "2804.69.50 and 2839.19). No Chapter 28 subheading is on a country-specific Section 301 exemption list (note 52(j)) or on the Canada Section 338 lists "
    "(note 51). Note 20 puts 230 Chapter 28 subheadings on China List 3, four on List 1 and seven on List 4A; note 31 adds seven at 25% and polysilicon at 50%."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = f"{H} — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Inorganic Chemicals: TSCA, DEA, NRC Rules and Legal Ways to Lower Duty (HTS Ch. 28) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 28 line — TSCA import certification, DEA listed chemicals (iodine, phosphorus, permanganate), NRC licenses and the "
        "Russian uranium ban, CWC declarations, hazmat, the Superfund chemical tax, antidumping orders — and the legal ways to pay less: USMCA, exempt subheadings, FTAs, drawback."
    ),
    "keywords": [
        "tsca certification",
        "tsca certification statement",
        "dea form 486",
        "superfund tax chemicals list",
        "superfund chemical excise tax rates",
        "russian uranium import ban",
        "potassium permanganate import",
        "silicon metal antidumping",
    ],
}
te["intro"] = (
    f"Chapter 28 base rates are low ({N - DUTIABLE} of {N} lines Free, none above 5.5%), so the levers that matter are about the **extra duties**: a USMCA "
    "claim removes the 10% Section 301 duty on Canadian and Mexican goods, the 90 exempt subheadings pay no 2026 Section 301 duty from any country, FTA claims "
    "remove the base rate, and drawback can return duties on chemicals that are exported again. Antidumping and countervailing duties and the Superfund "
    "chemical excise tax are **not included in the tariff calculator**.\n\n"
    "The paperwork depends on the chemical: every shipment needs a TSCA certification; iodine, phosphorus, hydriodic and hypophosphorous acid and the "
    "permanganates are DEA listed chemicals; uranium and radioactive isotopes need an NRC-licensed consignee and Russian uranium a DOE waiver; Chemical "
    "Weapons Convention chemicals need BIS declarations; mercury imports are reported to EPA; and acids, gases and phosphorus are hazardous materials in "
    "transport. Each rule and lever below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on Canadian and Mexican chemicals",
        "saves": "10% of value: the 2026 Section 301 duty on Canada (9903.05.29) and Mexico (9903.05.55) does not apply to goods entered under USMCA (9903.05.93 / 9903.05.94), and the base rate (up to 5.5%) is removed too",
        "appliesTo": f"The {COVERED_LINES} lines not on the note 52(b) list (plus the base rate on any dutiable line), for originating goods of Canada or Mexico",
        "document": "A USMCA certification of origin from the importer, exporter or producer with the minimum data elements; it need not follow a prescribed format and CBP can ask for it. Chapter 28 goods usually qualify through a change in tariff classification or a chemical reaction in Canada or Mexico, under the product-specific rules of General Note 11.",
        "caveat": "Mixing, dilution or repackaging alone does not confer origin. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ECFR + "title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (USMCA)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "exempt-lines",
        "title": "Classify to the exact subheading",
        "saves": "10–12.5% (37.5% for China): the 90 note 52(b) subheadings pay no 2026 Section 301 duty, and rare-earth compounds, alumina (2818.20) and antimony oxides are on no China list",
        "appliesTo": "Uranium, ammonia, sulfuric acid, alumina, polysilicon, lithium compounds, rare earths, cobalt, antimony, iron and manganese oxides and the other exempt chemicals",
        "document": "A certificate of analysis or specification sheet that supports the subheading: for example polysilicon (99.99% silicon or more, 2804.61, exempt) versus silicon metal (2804.69, not exempt), lithium carbonate (2836.91, exempt) versus other carbonates, or rare-earth compound by predominant metal (2846.90.20 / .40 / .80).",
        "caveat": "Classification follows the General Rules of Interpretation and chapter note 1 (separate, chemically defined compounds); it cannot be chosen to save duty. Mixtures and preparations move to chapter 38. When unsure, ask CBP for a binding ruling.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)", "url": CH99},
            {"label": "HTSUS Chapter 28 notes", "url": CH28},
            {"label": "19 CFR part 177 (binding rulings)", "url": ECFR + "title-19/part-177"},
        ],
    },
    {
        "id": "pharma-use",
        "title": "Document pharmaceutical use for the note 52(e) chemicals",
        "saves": "10–12.5%: 41 Chapter 28 subheadings — such as hydrochloric and phosphoric acid, caustic soda and potash, sodium bicarbonate, potassium carbonate, hydrogen peroxide and isotopes — are exempt from the 2026 Section 301 duty when for use in pharmaceutical applications (9903.05.89); the same for Brazil's 25% (note 50(a)(v))",
        "appliesTo": f"The {E52_LINES} lines of the 41 note 52(e) subheadings, when they go into pharmaceutical manufacture",
        "document": "Evidence of the pharmaceutical end use (purchase orders or contracts with a drug manufacturer, the grade such as USP or EP) kept to support the claim if CBP asks.",
        "caveat": "Industrial-grade goods for other uses pay the duty. The claim does not lift China's List 3 duty.",
        "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 52(e)", "url": CH99}],
    },
    {
        "id": "origin",
        "title": "Compare countries of origin",
        "saves": "Up to 12.5 points (more for China): EU and UK goods pay 10%, Japan and South Korea 12.5% in total, USMCA goods and countries outside the 60 Section 301 economies nothing; China up to 37.5% plus base",
        "appliesTo": f"The {COVERED_LINES} lines not on the note 52(b) list",
        "document": "The commercial invoice and a certificate of analysis or manufacturer's declaration showing where the chemical was produced (reacted), not just where it was blended or packed.",
        "caveat": "Section 301 duties follow the country of origin, not the shipping country. Antidumping orders follow their own scope and may cover goods processed in a third country.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99},
            {"label": "19 CFR part 177 (binding rulings)", "url": ECFR + "title-19/part-177"},
        ],
    },
    {
        "id": "fta-base",
        "title": "Claim an FTA preference on the dutiable lines",
        "saves": "The base rate of up to 5.5% on the 233 dutiable lines — for example helium and argon 3.7%, titanium oxides and cerium compounds 5.5%, lithium carbonate 3.7%",
        "appliesTo": "Goods of FTA partners such as Australia, Chile, Colombia, Israel, Korea, Morocco, Peru or Singapore, on lines that list their code in the Special column",
        "document": "The origin documentation required by the agreement (19 CFR part 10 and the agreement's subpart).",
        "caveat": "The Section 301 duty still applies when an FTA rate is claimed (note 52(a)), and Japan, South Korea and the EU pay their 12.5% or 10% total either way on covered lines. GSP has lapsed.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN},
            {"label": "19 CFR part 10", "url": ECFR + "title-19/part-10"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on chemicals that are exported again",
        "saves": "Up to 99% of the duties paid, including the Section 301 duties, on imported chemicals that are exported unused or used to make exported goods; a substitute chemical of the same 8-digit subheading can be used",
        "appliesTo": f"All {N} lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191); substitution claims under 19 U.S.C. 1313(b) or (j)(2) within 5 years.",
        "caveat": "Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3).",
        "citations": [
            {"label": "19 CFR part 191", "url": ECFR + "title-19/part-191"},
            {"label": "19 CFR 191.3", "url": ECFR + "title-19/section-191.3"},
            {"label": "19 U.S.C. 1313", "url": "https://www.govinfo.gov/link/uscode/19/1313"},
        ],
    },
    {
        "id": "superfund-exempt",
        "title": "Use the Superfund chemical tax exemptions",
        "saves": "The excise tax per ton (e.g. $5.28 on ammonia, $0.52 on sulfuric acid, $0.48 on nitric acid) when the chemical goes into fertilizer or animal feed, is exported, or is used to make another taxable chemical",
        "appliesTo": "Taxable chemicals of 26 U.S.C. 4661 imported and sold or used in the United States — ammonia, chlorine, acids, caustic soda and potash, phosphorus, bromine, arsenic, mercury and others",
        "document": "Exemption certificates and records under the IRS regulations; the tax and any credit are reported on Form 6627 with Form 720.",
        "caveat": "This is an IRS excise tax, not a customs duty; it is not shown in the tariff calculator.",
        "citations": [
            {"label": "26 U.S.C. 4662", "url": "https://www.govinfo.gov/link/uscode/26/4662"},
            {"label": "IRS Instructions for Form 6627", "url": "https://www.irs.gov/instructions/i6627"},
        ],
    },
    AD_LEVER,
]
te["rules"] = RULES + AD_RULES
RULE_IDS = {r["id"] for r in te["rules"]}

# Per heading: which rules apply, plus a note.
DEA1 = {"2801": "Iodine (2801.20) is a List I chemical: DEA registration and an import declaration for every shipment.",
        "2804": "Red and white phosphorus (2804.70) are List I chemicals. Polysilicon (2804.61) gets a $21/kg Section 232 minimum import price from December 4, 2026.",
        "2811": "Hydriodic acid and hypophosphorous acid (in 2811.19) are List I chemicals. Hydrogen cyanide (2811.12) is a Schedule 3 CWC chemical.",
        "2835": "Hypophosphites (2835.10) are List I chemicals: DEA registration and an import declaration for every shipment."}
NOTES = {
    "2801": "Chlorine is a toxic gas in transport (UN1017) and a Superfund taxable chemical ($5.40/t), as is bromine ($8.90/t).",
    "2802": "Sulfur sold as a fungicide or other pesticide needs an EPA Notice of Arrival.",
    "2803": "No agency rule beyond the TSCA certification.",
    "2805": "Mercury (2805.40) is reported to EPA's mercury inventory and is a Superfund taxable chemical; its export is banned. Sodium metal in bulk solid form from China is excluded from List 3 through November 9, 2026.",
    "2806": "Hydrochloric acid is a DEA List II chemical, but imports are excluded from the declaration rules. It is a hazardous material (UN1789).",
    "2807": "Sulfuric acid is a DEA List II chemical, but imports are excluded from the declaration rules. Superfund tax $0.52/t unless for fertilizer or feed.",
    "2808": "Nitric acid is a hazardous material (UN2031) and a Superfund taxable chemical ($0.48/t), exempt for fertilizer.",
    "2809": "Phosphoric acid for pharmaceutical use is exempt from the 2026 Section 301 duty (note 52(e)).",
    "2810": "Boric acid sold as an insecticide needs an EPA Notice of Arrival.",
    "2812": "Phosgene, phosphorus trichloride, oxychloride and pentachloride, sulfur chlorides and thionyl chloride are Schedule 3 CWC chemicals; arsenic trichloride is Schedule 2.",
    "2814": "Anhydrous ammonia is a toxic gas in transport (UN1005) and a Superfund taxable chemical ($5.28/t), exempt for fertilizer or feed.",
    "2815": "Caustic soda solution is a hazardous material (UN1824); Superfund tax $0.56/t (sodium hydroxide) or $0.44/t (potassium hydroxide).",
    "2817": "No agency rule beyond the TSCA certification.",
    "2818": "No agency rule beyond the TSCA certification. Alumina is exempt from the 2026 Section 301 duty and not on China's List 3.",
    "2819": "Chromic acid (chromium trioxide) pays the Superfund tax on imported substances.",
    "2822": "No agency rule beyond the TSCA certification.",
    "2824": "Lead oxide is a Superfund taxable chemical ($8.28/t).",
    "2825": "Nickel oxide pays the Superfund tax on imported substances; cuprous and cupric oxide are taxable chemicals.",
    "2827": "Zinc chloride, stannous and stannic chloride are Superfund taxable chemicals.",
    "2829": "Sodium chlorate sold as a herbicide needs an EPA Notice of Arrival.",
    "2833": "Copper sulfate sold as a pesticide needs an EPA Notice of Arrival; cupric sulfate and zinc sulfate are Superfund taxable chemicals.",
    "2841": "Potassium and sodium permanganate are DEA List II chemicals: an import declaration for 500 kg or more. Sodium and potassium dichromate are Superfund taxable chemicals.",
    "2844": "Uranium and radioactive isotopes enter only to an NRC-licensed consignee; Russian low-enriched (and, per the NRC, natural) uranium needs a DOE waiver until January 1, 2028.",
    "2845": "Heavy water and deuterium need no NRC import license (10 CFR 110.1(b)(4)).",
    "2847": "Hydrogen peroxide is a hazardous material (UN2014/UN2015) and pays the Superfund tax on imported substances.",
    "2852": "Mercury compounds are reported to EPA's mercury inventory.",
    "2853": "Cyanogen chloride (2853.10) is a Schedule 3 CWC chemical. Aluminum and zinc phosphide sold as fumigants need an EPA Notice of Arrival.",
}


def group_rules(h):
    r = ["tsca"]
    if h in ("2801", "2804", "2811", "2835"):
        r.append("dea-list1")
    if h in ("2806", "2807", "2841"):
        r.append("dea-list2")
    if h in ("2844", "2845"):
        r.append("nrc")
    if h == "2844":
        r.append("ru-uranium-ban")
    if h in ("2811", "2812", "2853"):
        r.append("cwc")
    if h in ("2805", "2852"):
        r.append("mercury")
    if h in ("2801", "2804", "2805", "2806", "2807", "2808", "2811", "2812", "2814", "2815", "2837", "2847", "2850", "2853"):
        r.append("dot-hazmat")
    if h in ("2802", "2810", "2829", "2833", "2853"):
        r.append("epa-pesticide")
    if h in ("2801", "2804", "2805", "2806", "2807", "2808", "2811", "2814", "2815", "2819", "2824", "2825", "2827", "2830", "2833", "2841", "2847", "2852"):
        r.append("superfund-tax")
    if h == "2804":
        r.append("s232-polysilicon")
    for rid in AD_GROUP_NOTES.get(h, (None, []))[1]:
        r.append(rid)
    for rid in r:
        assert rid in RULE_IDS, rid
    return r


for g in te["groups"]:
    h = g["heading"]
    g["label"] = GROUPS[h][0]
    g["ruleIds"] = group_rules(h)
    note = " ".join(x for x in (DEA1.get(h), NOTES.get(h), AD_GROUP_NOTES.get(h, (None,))[0]) if x)
    g["note"] = note or "No agency rule beyond the TSCA certification and, for hazardous chemicals, DOT hazmat rules."

AD_LINES = {}
for rid, prefixes in [(r["id"], r.get("_hts", [])) for r in AD_RULES]:
    for p in prefixes:
        AD_LINES.setdefault(p, []).append(rid)
for r in te["rules"]:
    r.pop("_hts", None)

LINE_RULES = {
    "2801.20": ["dea-list1"], "2804.70": ["dea-list1"], "2811.19.61": ["dea-list1"], "2835.10": ["dea-list1"],
    "2806.10": ["dea-list2"], "2807.00": ["dea-list2"], "2841.61": ["dea-list2"], "2841.69": ["dea-list2"],
    "2805.40": ["mercury"], "2852": ["mercury"], "2804.61": ["s232-polysilicon"],
    "2811.12": ["cwc"], "2812.11": ["cwc"], "2812.12": ["cwc"], "2812.13": ["cwc"], "2812.14": ["cwc"], "2812.15": ["cwc"], "2812.16": ["cwc"],
    "2812.17": ["cwc"], "2812.19.00.10": ["cwc"], "2853.10": ["cwc"],
    "2844": ["nrc"], "2844.10": ["ru-uranium-ban"], "2844.20": ["ru-uranium-ban"],
    "2814": ["superfund-tax", "dot-hazmat"], "2801.10": ["superfund-tax", "dot-hazmat"], "2801.30.20": ["superfund-tax"], "2807.00": ["superfund-tax", "dot-hazmat"],
    "2808": ["superfund-tax", "dot-hazmat"], "2815.11": ["superfund-tax"], "2815.12": ["superfund-tax", "dot-hazmat"], "2815.20": ["superfund-tax"],
    "2811.11": ["superfund-tax", "dot-hazmat"], "2806.10": ["superfund-tax", "dot-hazmat"], "2804.70": ["superfund-tax", "dot-hazmat"], "2804.80": ["superfund-tax"],
    "2805.40": ["superfund-tax", "dot-hazmat"], "2819.10": ["superfund-tax"], "2824": ["superfund-tax"], "2825.40": ["superfund-tax"], "2825.50": ["superfund-tax"],
    "2827.39.25": ["superfund-tax"], "2827.39.65": ["superfund-tax"], "2833.25": ["superfund-tax", "epa-pesticide"], "2833.29.45": ["superfund-tax"], "2841.30": ["superfund-tax"],
    "2841.50": ["superfund-tax"], "2847": ["superfund-tax", "dot-hazmat"], "2810": ["epa-pesticide"], "2829.11": ["epa-pesticide"], "2802": ["epa-pesticide"],
    "2853.90": ["epa-pesticide"],
}
for k, v in AD_LINES.items():
    LINE_RULES[k] = LINE_RULES.get(k, []) + v
CN_LISTED = L3 | L1 | L4A | R31B | R31F
for l in te["lines"]:
    hts = l["hts"]
    rids = ["tsca"]
    for prefix, extra in LINE_RULES.items():
        if hts.startswith(prefix):
            rids += [x for x in extra if x not in rids]
    for rid in rids:
        assert rid in RULE_IDS, rid
    l["ruleIds"] = rids
    code8 = hts.replace(".", "")[:8]
    lev = ["origin", "drawback"]
    if code8 not in B52:
        lev.insert(0, "usmca")
    else:
        lev.insert(0, "exempt-lines")
    if code8 in E52:
        lev.append("pharma-use")
    if l["general"] not in ("Free", None):
        lev.append("fta-base")
    if "superfund-tax" in rids:
        lev.append("superfund-exempt")
    if any(r in rids for r in [x["id"] for x in AD_RULES]):
        lev.append(AD_LEVER["id"])
    l["leverIds"] = lev
te["disclaimer"] = (
    "This page summarizes official rules for orientation; it is not legal advice. Agency rules change — check the cited regulation (text current to "
    f"{ECFR_AS_OF}), the scope of any antidumping or countervailing duty order, and the IRS instructions before importing, and ask CBP for a binding ruling "
    "when the classification or origin is unclear."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = f"{H} — Tariff FAQ"
fc["seo"] = {
    "title": "Chemical Tariffs FAQ — HTS Chapter 28: Rare Earth, Polysilicon, Uranium & China Chemical Tariffs | KoalaGains",
    "shortDescription": (
        "Answers to the most-searched questions on inorganic chemical tariffs: tariffs on chemicals from China, rare-earth and critical-mineral tariffs, the "
        "Section 232 polysilicon tariff, uranium tariffs, the Superfund chemical tax and the HTS codes for ammonia, silicon and lithium carbonate."
    ),
    "keywords": [
        "tariffs on chemicals from china",
        "are there tariffs on rare earth minerals",
        "section 232 polysilicon tariffs",
        "critical minerals exempt from tariffs",
        "us uranium tariffs",
        "superfund chemical excise tax rates",
        "hs code 2804.61",
        "ammonia tariff code",
    ],
}
fc["intro"] = (
    "The questions below are the ones people search for most about tariffs on inorganic chemicals, critical minerals and uranium. Each answer is drawn "
    "from the official sources on the other pages of this chapter, as of the current tariff schedule (2026 Revision 21)."
)
fc["keyTakeaways"] = [
    f"Base rates are low: {N - DUTIABLE} of {N} Chapter 28 lines are Free and none is above 5.5%; no base rate changed between January 2025 and October 2026.",
    "The 2026 Section 301 tariffs (10% or 12.5%, since July 24, 2026) cover 202 lines, but 90 subheadings — uranium, ammonia, sulfuric acid, alumina, polysilicon, lithium carbonate, rare earths and most critical-mineral chemicals — are exempt, and USMCA goods are exempt.",
    "China pays 25% (List 3) plus 12.5% on most chemicals, 50% on polysilicon and 7.5% on enriched uranium; rare-earth compounds, alumina and antimony oxides from China pay only the base rate.",
    "No Section 232 tariff applies to critical minerals (Proclamation 11001 chose negotiations), but polysilicon gets a $21/kg minimum import price from December 4, 2026.",
    "Russian low-enriched uranium is banned without a DOE waiver, and waivers end by January 1, 2028.",
    "Antidumping and countervailing duties on chemicals such as silicon metal and potassium permanganate, and the Superfund chemical excise tax, come on top and are not in the tariff calculator.",
]
fc["questionSource"] = f"Google search suggestions, collected {SUGGESTIONS_DATE}"

for (cty, ln), want in {
    ("India", "2803.00.00.10"): "10%",
    ("China", "2823.00.00.00"): "30.5%",
    ("Germany", "2823.00.00.00"): "5.5%",
    ("Canada", "2844.20.00.10"): "Free",
    ("Canada", "2815.12.00.00"): "10%",
    ("China", "2804.69.10.00"): "17.8%",
    ("Russia", "2804.69.10.00"): "33.5%",
}.items():
    got = total(cty, ln)
    assert got == want, (cty, ln, got, want)


def faq(id, q, searched, a, link):
    return dict(id=id, question=q, searchedAs=searched, answer=a, link=link)


fc["faqs"] = [
    faq("china-chemicals", "What are the U.S. tariffs on chemicals from China?",
        ["tariffs on chemicals from china", "us tariffs on china chemicals", "us tariffs on chemicals", "section 301 list 3", "section 301 chemicals"],
        "Most Chinese inorganic chemicals (Chapter 28) pay their base rate (0–5.5%) plus 25% under Section 301 List 3 (9903.88.03) plus 12.5% under the 2026 Section 301 action (9903.05.31) — 37.5% plus base, for example 37.5% on chlorine. Chemicals on the 2026 exemption list but on List 3, such as ammonia, zinc oxide and lithium carbonate, pay base + 25%. Chinese polysilicon pays 50%, enriched uranium 7.5%, and rare-earth compounds, alumina (2818.20) and antimony oxides only the base rate. Some products, such as potassium permanganate and calcium hypochlorite, also pay antidumping duties. The 2025 IEEPA duties on China ended February 24, 2026.",
        "industry-areas"),
    faq("rare-earth", "Are there tariffs on rare earth minerals and compounds from China?",
        ["are there tariffs on rare earth minerals", "rare earth tariffs china", "us tariff on china rare earth", "chinese rare earth tariffs", "rare earth elements tariffs", "rare earth metals tariffs"],
        "Only the base rate. Rare-earth metals (2805.30, 5%) and rare-earth compounds (2846: Free, 3.7% or 5.5%) are not on any China Section 301 list and are exempt from the 2026 Section 301 tariffs (U.S. note 52(b)), so Chinese rare-earth oxides pay 3.7% on most lines and 5.5% on cerium compounds. No Section 232 tariff applies: Proclamation 11001 (January 14, 2026) chose negotiations on processed critical minerals instead. Rare-earth magnets are not in this chapter (heading 8505).",
        ""),
    faq("polysilicon-232", "What is the Section 232 tariff on polysilicon?",
        ["232 polysilicon tariffs", "section 232 polysilicon tariffs", "us polysilicon tariffs", "polysilicon tariffs", "trump polysilicon tariff details", "15 tariff on polysilicon"],
        "Proclamation 11052 (August 6, 2026) sets a minimum import price of $21/kg for polysilicon (2804.61.00.00) from December 4, 2026 (heading 9903.45.33): an importer that does not document a first U.S. sale at or above $21/kg pays $21/kg, and one that does pays the difference when the entered value is below $21/kg. The 15% Section 232 duty applies to polysilicon ingots and wafers (3818) and solar cells and modules (8541), not to polysilicon itself. Today polysilicon is Free and exempt from the 2026 Section 301 tariffs, except from China, which pays 50% under Section 301 (9903.91.05).",
        "tariff-updates"),
    faq("critical-minerals", "Are critical minerals exempt from tariffs?",
        ["critical minerals exempt from tariffs", "critical minerals tariffs", "section 232 critical minerals tariffs", "us critical minerals tariff decision", "critical minerals section 232 tariff decisions", "china critical minerals tariffs"],
        "Largely, yes. The 2026 Section 301 tariffs exempt 90 Chapter 28 subheadings (U.S. note 52(b)), including lithium, cobalt, antimony, manganese, rare-earth, gallium and germanium compounds, polysilicon and uranium. The Section 232 investigation of processed critical minerals ended with Proclamation 11001 (January 14, 2026), which chose negotiations and possible price floors instead of tariffs. China is the exception: most critical-mineral chemicals still pay China's 25% List 3 duty, and seven subheadings such as tungstates pay 25% under the 2024 review.",
        "tariff-updates"),
    faq("uranium-tariff", "Is there a tariff on uranium?",
        ["uranium tariffs", "us uranium tariffs", "uranium tariff canada", "trump uranium tariffs"],
        "No. Natural uranium compounds (2844.10.20) and enriched uranium (2844.20) are Free and exempt from the 2026 Section 301 tariffs, so uranium from Canada, France, the United Kingdom, the Netherlands, Germany or Kazakhstan pays no duty; uranium metal (2844.10.10) is 5%. Chinese enriched uranium pays 7.5% (List 4A). In 2025, Canadian uranium paid a 10% IEEPA duty when not entered under USMCA; that ended February 24, 2026. The U.S. consignee must hold an NRC license.",
        "industry-areas"),
    faq("russia-uranium", "Does the U.S. still import uranium from Russia?",
        ["does the us still import uranium from russia", "does the us import uranium from russia", "us russian uranium imports", "russian uranium ban", "russian uranium import ban", "us russian uranium ban"],
        f"Only with a waiver. The Prohibiting Russian Uranium Imports Act bans low-enriched uranium produced in Russia or by a Russian entity from August 11, 2024; the Department of Energy may grant waivers up to 464,183 kg in 2026 and 459,083 kg in 2027, and all waivers end by January 1, 2028. The U.S. still imported {S['ru_rad']} of Russian uranium and radioactive goods in {yr}. Russian uranium is also under a Commerce antidumping suspension agreement. It pays no tariff.",
        "understand-industry"),
    faq("where-uranium", "Where does the U.S. get its uranium?",
        ["where does the us get uranium", "where does the us import uranium from", "us uranium imports by country", "where does the us get enriched uranium", "what countries does the us import uranium from"],
        f"In {yr} the U.S. imported {S['rad']} of uranium and other radioactive goods (heading 2844): {S['leu']} of enriched uranium and {S['natu']} of natural uranium compounds. The largest suppliers were France ({S['fr_rad']}), the United Kingdom ({S['gb_rad']}), Canada ({S['ca_rad']}), Russia ({S['ru_rad']}), the Netherlands ({S['nl_rad']}), Germany ({S['de_rad']}) and Kazakhstan ({S['kz_rad']}).",
        "understand-industry"),
    faq("us-chemical-tariffs", "How do the 2026 U.S. tariffs affect chemical imports?",
        ["us chemical tariffs", "tariffs chemical industry", "trump tariffs on chemicals", "trump tariffs chemical industry", "chemical tariffs"],
        f"For inorganic chemicals the main tariff since July 24, 2026 is the 2026 Section 301 action: 10% or 12.5% on goods of 60 economies (10% in total for the EU, 12.5% in total for Japan and South Korea), on top of base rates of 0–5.5%. It covers {COVERED_LINES} of {N} Chapter 28 lines; 90 subheadings are exempt and USMCA goods of Canada and Mexico are exempt. The IEEPA tariffs of 2025 ended February 24, 2026 and the 10% Section 122 surcharge ran until July 23, 2026. Organic chemicals are in Chapter 29.",
        "tariff-updates"),
    faq("india-chemicals", "What is the U.S. tariff on chemicals from India?",
        ["tariff on chemicals from india", "us tariff on chemicals from india", "us tariffs india chemicals", "us tariff on india chemicals"],
        "Indian inorganic chemicals pay their base rate plus 10% under the 2026 Section 301 action (9903.05.44) — 10% on Indian carbon black, for example — unless the subheading is on the note 52(b) exemption list. Sodium nitrite from India also pays antidumping and countervailing duties, and chromium trioxide from India faces new ones once the ITC votes. The 2025 IEEPA duties on India ended February 24, 2026.",
        "industry-areas"),
    faq("superfund", "What is the Superfund chemical excise tax, and which chemicals are taxed?",
        ["superfund chemical tax", "superfund tax chemicals list", "superfund taxable chemicals list", "superfund chemical excise tax rates", "superfund tax on chemicals", "superfund tax rate 2026"],
        "It is a federal excise tax (26 U.S.C. 4661), reinstated from July 1, 2022 through 2031, on taxable chemicals sold or used by their manufacturer, producer or importer — not a customs duty. Chapter 28 examples per ton: ammonia $5.28, chlorine $5.40, hydrogen fluoride $8.46, phosphorus, bromine, arsenic and mercury $8.90, lead oxide $8.28, sulfuric acid $0.52, caustic soda $0.56, nitric acid $0.48 and potassium hydroxide $0.44. Imported hydrogen peroxide, chromic acid and nickel oxide pay the tax on imported substances (26 U.S.C. 4671). Ammonia, sulfuric and nitric acid for fertilizer or feed are exempt. It is reported on IRS Form 6627.",
        "tariff-engineering"),
    faq("silicon-hs", "What is the HS code for silicon metal and polysilicon, and what duty applies?",
        ["silicon metal hs code", "hs code 2804.69", "hs code 2804.61", "polysilicon hs code", "polycrystalline silicon hs code"],
        "Silicon with at least 99.99% silicon (polysilicon) is 2804.61.00.00: Free, exempt from the 2026 Section 301 tariffs, 50% for China, and a $21/kg minimum import price from December 4, 2026. Silicon metal is 2804.69.10 (99% to under 99.99% silicon, 5.3%) or 2804.69.50 (under 99%, 5.5%); it is not exempt, so for example Brazil pays 17.8% and China 17.8%, and silicon metal from ten countries also carries antidumping or countervailing duties. Wafers cut from doped silicon are heading 3818.",
        ""),
    faq("silicon-ad", "Which countries face antidumping duties on silicon metal?",
        ["silicon metal antidumping"],
        "Silicon metal (2804.69) is under antidumping orders on China (since 1991), Russia (2003), Bosnia and Herzegovina, Iceland and Malaysia (2021), Angola and Laos (April 2026) and Australia and Norway (August 2026), and countervailing duty orders on Kazakhstan, Laos, Australia and Norway. Cash deposits for exporters without their own rate range from 2.47% (Norway AD) to 94.44% (Laos AD). Polysilicon (2804.61) is excluded from every order. These duties are not in the tariff calculator.",
        "tariff-updates"),
    faq("ammonia-code", "What is the tariff code for ammonia, and is there a tariff on it?",
        ["ammonia tariff code", "ammonia tariffs", "hs code 2814", "hs code 2814.10", "us ammonia imports"],
        f"Anhydrous ammonia is 2814.10.00.00 and ammonia in water 2814.20.00.00. Both are Free and exempt from the 2026 Section 301 tariffs, so ammonia from Canada ({S['ca_nh3']} in {yr}) or Trinidad and Tobago ({S['tt_nh3']}) pays no customs duty; Chinese ammonia pays 25% (List 3). The importer owes the Superfund chemical excise tax of $5.28 per ton unless the ammonia goes into fertilizer or animal feed. Ammonium nitrate and other ammonium fertilizers are in Chapter 31.",
        ""),
    faq("lithium", "What are the U.S. tariffs on lithium carbonate and lithium hydroxide?",
        ["lithium tariffs", "us tariff on lithium", "lithium tariffs china", "lithium carbonate hs code", "lithium hydroxide hs code"],
        "Lithium carbonate is 2836.91 and lithium oxide and hydroxide 2825.20, both 3.7% and exempt from the 2026 Section 301 tariffs. Argentine lithium carbonate pays 3.7%; Chilean, Australian and Korean goods are Free with an FTA claim; Chinese lithium carbonate pays 28.7% (3.7% + 25% List 3). Lithium-ion batteries are not in this chapter (8507).",
        ""),
    faq("tio2-code", "What is the HTS code for titanium dioxide?",
        ["titanium dioxide hts code", "titanium dioxide hs code", "titanium oxide hs code", "titanium dioxide tariffs", "titanium dioxide tariff code"],
        "Titanium oxides, including titanium dioxide not prepared as a pigment, are 2823.00.00.00 at 5.5%. The line is exempt from the 2026 Section 301 tariffs, so German TiO2 of this line pays 5.5% (Korean is Free with a KORUS claim); Chinese pays 30.5% (5.5% + 25% List 3). Titanium dioxide pigments and preparations with 80% or more TiO2 are classified in heading 3206, not here.",
        ""),
]
links = {"", "tariff-updates", "understand-industry", "industry-areas", "tariff-engineering"}
assert all(f["link"] in links for f in fc["faqs"])
assert 11 <= len(fc["faqs"]) <= 15

# ---------------------------------------------------------------- final checks + write
d["asOf"] = "2026-10-12"
d["sources"] = d["sources"] + [
    {"label": "Federal Register", "url": "https://www.federalregister.gov/", "note": "proclamations, executive orders, USTR, Commerce and USITC notices"},
    {"label": "eCFR", "url": "https://www.ecfr.gov/", "note": f"agency import rules (text current to {ECFR_AS_OF})"},
]


def walk(n, path=""):
    if isinstance(n, dict):
        for k, v in n.items():
            walk(v, f"{path}.{k}")
    elif isinstance(n, list):
        for i, v in enumerate(n):
            walk(v, f"{path}[{i}]")
    elif isinstance(n, str) and "TODO" in n:
        raise ValueError(f"TODO left at {path}: {n[:80]}")


walk(d)
json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
