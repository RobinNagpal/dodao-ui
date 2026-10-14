"""Fill the writer TODOs of the generated Chapter 29 content file (re-runnable).

usage: python3 fill29.py <generated.json> <out.json>

All prose lives here (and in fill29_groups.py / fill29_engineering.py / fill29_faq.py); numbers are read from the
generated file, measures.json and the trade summary so the file can be regenerated after generator changes.
"""
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fill29_lib import Lines, TRADE, WT, usd, n  # noqa: E402
from fill29_groups import GROUPS  # noqa: E402
from fill29_sources import all_sources  # noqa: E402
import fill29_engineering  # noqa: E402
import fill29_faq  # noqa: E402

AS_OF = "2026-10-12"
ECFR_AS_OF = "2026-10-08"

src_in, out_path = sys.argv[1], os.path.abspath(sys.argv[2])
d = json.load(open(src_in))
L = Lines(d)
S = all_sources()
NL = len(L.lines)

d["asOf"] = AS_OF
d["chapter"]["title"] = "Organic Chemicals"

# ------------------------------------------------------------------ trade figures
T = {y["year"]: y["totalUsd"] for y in TRADE["totalsByYear"]}
YR, PY = TRADE["latestYear"], TRADE["priorYear"]
BYC = {c["country"]: c for c in TRADE["byCountry"]}
HC = {(r["country"], r["heading"]): r["importsUsd"] for r in TRADE["byHeadingCountry"]}
HS6 = {h["hs6"]: h for h in TRADE["byHs6"]}
HEAD = {h["heading"]: h["byYear"] for h in TRADE["byHeading"]}
ie, cn, india, sg = BYC["Ireland"], BYC["China"], BYC["India"], BYC["Singapore"]
ch, kr = BYC["Switzerland"], BYC["Rep. of Korea"]
ex_ie = T[YR] - ie["importsUsd"]
ex_ie_p = T[PY] - ie["priorImportsUsd"]
chg = (T[YR] - T[PY]) / T[PY] * 100
F = dict(
    T=usd(T[YR]), P=usd(T[PY]), chg=f"{chg:+.1f}%", ie=usd(ie["importsUsd"]), ie_p=usd(ie["priorImportsUsd"]),
    ie_2937=usd(HC[("Ireland", "2937")]), h2937=usd(HEAD["2937"][str(YR)]), h2937_p=usd(HEAD["2937"][str(PY)]),
    s293719=usd(HS6["293719"]["importsUsd"]), s293719_p=usd(HS6["293719"]["priorImportsUsd"]),
    ex_ie=usd(ex_ie), ex_ie_p=usd(ex_ie_p), cn=usd(cn["importsUsd"]), india=usd(india["importsUsd"]), sg=usd(sg["importsUsd"]),
    ch=usd(ch["importsUsd"]), ch_p=usd(ch["priorImportsUsd"]), kr=usd(kr["importsUsd"]), kr_p=usd(kr["priorImportsUsd"]),
    ie_share=f"{ie['importsUsd'] / T[YR] * 100:.0f}%",
)

# ------------------------------------------------------------------ line counts used in text
cnt = dict(
    lines=n(NL), dut=n(len(L.dutiable)), free=n(NL - len(L.dutiable)), K=n(len(L.K)), Lc=n(len(L.L)), b52=n(len(L.b52)), e52=n(len(L.e52)),
    p40=n(len(L.p40)), l3=n(len(L.l3)), l3d=n(len(L.l3d)), l4a=n(len(L.l4a)), ru30=n(len(L.ru30)),
    s301=n(NL - len(L.b52)), nolist=n(NL - len(L.l3 | L.l3d | L.l4a)), neither=n(NL - len(L.b52 | L.e52)),
)
rates = {}
for l in L.lines:
    rates[l["effectiveGeneral"]] = rates.get(l["effectiveGeneral"], 0) + 1
top_rates = sorted(((k, v) for k, v in rates.items() if k != "Free"), key=lambda kv: -kv[1])[:3]
cnt["top_rates"] = ", ".join(f"{k} ({v} lines)" for k, v in top_rates)

# =================================================================== OVERVIEW
o = d["overview"]
o["h1"] = "HTS Chapter 29: Organic Chemicals — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 29 Organic Chemicals Tariff Rates — HS Code 29 Import Duties, APIs, Section 232 & 301 | KoalaGains",
    "shortDescription": (
        f"Searchable duty table for all {cnt['lines']} HTS Chapter 29 organic chemical lines — hydrocarbons, alcohols, acids, amines, heterocyclics, "
        "vitamins, hormones, antibiotics and drug APIs. Base rates Free to 6.5%, the Pharmaceutical Appendix, Section 232 pharma, Section 301 and China duties."
    ),
    "keywords": [
        "HTS Chapter 29",
        "htsus chapter 29",
        "hts code chapter 29",
        "HS code 29",
        "organic chemicals hs code",
        "hs code for organic chemicals",
        "tariffs on chemicals",
        "us tariffs on chemicals",
        "chemical tariff code",
        "pharmaceutical appendix",
        "tariff on api",
        "Organic chemicals",
    ],
}
o["intro"] = (
    "Chapter 29 covers separately defined organic chemicals: hydrocarbons and their halogenated or nitrated derivatives (2901–2904); alcohols, phenols, ethers, "
    "aldehydes, ketones and carboxylic acids (2905–2918); esters, amines, amides and other nitrogen compounds (2919–2929); organo-sulfur, organo-inorganic and "
    "heterocyclic compounds, where most drug active ingredients sit (2930–2935); and vitamins, hormones, glycosides, alkaloids, pure sugars and antibiotics (2936–2942). "
    f"It has **{cnt['lines']} tariff lines**: {cnt['free']} are Free and {cnt['dut']} carry a base duty, most often {cnt['top_rates']}. "
    f"The U.S. imported **{F['T']}** of these chemicals in {YR}, {F['ie']} of it from Ireland — {F['ie_2937']} of that in hormones (2937).\n\n"
    f"Two schedule rules can remove the base rate for any column-1 country: the **Pharmaceutical Appendix** (\"Free (K)\", {cnt['K']} lines) for listed drug "
    f"ingredients and the **intermediate chemicals for dyes** appendix (\"Free (L)\", {cnt['Lc']} lines). The extra duties sit on top: the **2026 Section 301 tariffs** "
    f"on 60 economies (10% or 12.5%) reach {cnt['s301']} lines — only {cnt['b52']} (vitamins, hormones, alkaloids, antibiotics and a few others) are exempt outright, "
    f"and {cnt['e52']} more are exempt only when the chemical is for use in pharmaceutical applications (9903.05.89). Goods of **China** also pay the older Section 301 "
    f"lists (25% on {n(len(L.l3 | L.l3d))} lines, 7.5% on {cnt['l4a']}), goods of **Brazil** a further 25%, and patented drug ingredients on {cnt['p40']} lines the "
    "**Section 232 pharmaceutical duty** (100%; 15% for the EU, Japan, South Korea and Switzerland; 0% for the UK; nothing for generics). "
    "Canadian mannitol, sorbitol, glycerol and D-arabinose pay a 50% Section 338 duty, and Russian goods pay a 35% rate on 128 lines.\n\n"
    "Not in the table: **antidumping and countervailing duties** on more than 25 chemicals (citric acid, glycine, MSG, melamine, HFC refrigerants, vanillin, "
    "erythritol and others), the **Superfund excise tax** on imported benzene, toluene, xylene, ethylene, propylene and other taxable chemicals ($9.74 a ton), "
    "the ozone-depleting-chemical tax, and the entry rules of DEA (listed precursors and controlled substances), EPA (TSCA, HFC allowances) and FDA (drug ingredients)."
)

# stats: keep the generated counts, make the note readable
for s in o["stats"]:
    if s["label"].startswith("Lines with an extra duty"):
        s["note"] = (
            f"2026 Section 301: {cnt['s301']} · Brazil: {n(NL - len(L.br_a2))} · China lists: {n(len(L.l3 | L.l3d | L.l4a))} · "
            f"Russia: {cnt['ru30']} · Section 232 pharma: {cnt['p40']} · Canada Section 338: {len(L.ca338)}; USMCA goods exempt from Section 301"
        )
    if s["label"] == "Lines with a base-rate duty":
        s["note"] = f"{cnt['K']} of them Free under the Pharmaceutical Appendix (K) when the product is listed"

# product groups
for g in o["productGroups"]:
    h = g["heading"]
    label, short, examples, note = GROUPS[h]
    hl = L.heading(h)
    nfree = sum(1 for l in hl if not l["dutiable"])
    k = sum(1 for l in hl if l["htsCode10"] in L.K)
    rs = {}
    for l in hl:
        if l["dutiable"]:
            rs[l["effectiveGeneral"]] = rs.get(l["effectiveGeneral"], 0) + 1
    if not rs:
        ratetxt = f"{len(hl)} line{'s' if len(hl) != 1 else ''}, all Free"
    else:
        common = max(rs.items(), key=lambda kv: kv[1])[0]
        ratetxt = f"{len(hl)} line{'s' if len(hl) != 1 else ''}: {nfree} Free, {len(hl) - nfree} dutiable (most at {common})"
        if k:
            ratetxt += f"; {k} can enter Free under the Pharmaceutical Appendix"
    g["label"] = label
    g["blurb"] = f"{ratetxt}." + (f" {note}" if note else "")
    g["searchExamples"] = examples

# worked examples (totals read from the matrix so they stay consistent with Rates by country)
def cell_row(country, hts):
    c = next(x for x in d["industryAreas"]["countries"] if x["country"] == country)
    for cell in c["cells"].values():
        for b in cell["withoutUsmca"]["breakdown"]:
            if hts in b["lines"]:
                return b, cell
    raise KeyError((country, hts))


def cell_row_usmca(country, hts):
    c = next(x for x in d["industryAreas"]["countries"] if x["country"] == country)
    for cell in c["cells"].values():
        for b in cell["withUsmca"]["breakdown"]:
            if hts in b["lines"]:
                return b
    raise KeyError((country, hts))


ie_row, _ = cell_row("Ireland", "2937.19.00.00")
assert ie_row["total"] == "Free generic / Free specialty / 15% patented", ie_row["total"]
in_row, _ = cell_row("India", "2933.59.21.00")
assert in_row["total"] == "6.5% specialty / 16.5% generic / 100% patented", in_row["total"]
assert "2933592100" in L.e52 and "2933592100" in L.K and "2933592100" in L.p40
cn_row, _ = cell_row("China", "2918.14.00.00")
assert cn_row["total"] == "43.5%", cn_row["total"]
ca_row, _ = cell_row("Canada", "2905.44.00.00")
ca_row_u = cell_row_usmca("Canada", "2905.44.00.00")
assert ca_row["total"] == "64.9%" and ca_row_u["total"] == "50%", (ca_row["total"], ca_row_u["total"])

o["workedExamples"] = [
    {
        "title": "Polypeptide hormone API from Ireland",
        "line": "2937.19.00.00",
        "body": (
            "The base rate is **Free** and heading 2937 is on the U.S. note 52(b) list, so the 10% Section 301 duty on EU goods does not apply. "
            "The line is on the Section 232 list (U.S. note 40(c)): a **patented** ingredient — one covered by a valid U.S. patent and listed in FDA's Orange or "
            "Purple Book, or the API or key starting material for such a drug — pays **15% of its value in place of the base rate** (9903.04.62), so a $10M "
            "shipment owes **$1.5M**. A **generic** ingredient pays nothing extra (9903.04.67), and so does an inactive ingredient, which is not a "
            f"\"pharmaceutical article\" (9903.04.69). Ireland shipped {F['ie_2937']} of Chapter 29 hormones to the U.S. in {YR}."
        ),
    },
    {
        "title": "Generic antihistamine API from India",
        "line": "2933.59.21.00",
        "body": (
            "The line's base rate is **6.5%** and India pays the 2026 Section 301 duty as **+10%** (9903.05.44), so with no claims the generic API owes "
            "**16.5%** — $16,500 on $100,000. Two claims can take that to **$0**: the line is on U.S. note 52(e), so an ingredient for use in pharmaceutical "
            "applications is exempt from the Section 301 duty (9903.05.89), and if the drug is listed in the Pharmaceutical Appendix the base rate is **Free (K)**. "
            "Generics pay no Section 232 duty (9903.04.67); the same API sold for a patented drug would pay **100%**, because India has no reduced rate."
        ),
    },
    {
        "title": "Citric acid from China",
        "line": "2918.14.00.00",
        "body": (
            "Base rate **6%**, plus **12.5%** for China under the 2026 Section 301 action (9903.05.31) and **25%** under Section 301 List 3 (9903.88.03): "
            "**43.5%** in total, or $43,500 on a $100,000 shipment. On top of that come the **antidumping and countervailing duty** cash deposits under the "
            "2009 orders on citric acid from China, which Commerce continued on May 29, 2026; they are set per exporter and are not in the tariff calculator. "
            "Citric acid used in pharmaceutical applications can be exempted from the 12.5% (note 52(e)), but not from List 3 or the AD/CVD orders."
        ),
    },
    {
        "title": "Sorbitol from Canada",
        "line": "2905.44.00.00",
        "body": (
            "Base rate **4.9%**. Sorbitol is on the U.S. note 51(b)(3) list of the **Section 338** duty on Canadian goods (9903.03.14), which adds **50%** even when "
            "the goods qualify for USMCA. A USMCA-qualifying shipment therefore pays **50%** (the base rate and the 10% Section 301 duty are waived); a "
            "non-qualifying one pays **64.9%** (4.9% + 10% under 9903.05.29 + 50%)."
        ),
    },
]

o["notes"] = {
    "chapterNotes": (
        "**Note 1.** Except where the context otherwise requires, the headings of this chapter apply only to: (a) separate chemically defined organic compounds, "
        "whether or not containing impurities; (b) mixtures of two or more isomers of the same organic compound (whether or not containing impurities), except "
        "mixtures of acyclic hydrocarbon isomers (other than stereoisomers), whether or not saturated (chapter 27); (c) the products of headings 2936 to 2939 or "
        "the sugar ethers, sugar acetals and sugar esters, and their salts, of heading 2940, or the products of heading 2941, whether or not chemically defined; "
        "(d) products mentioned in (a), (b) or (c) dissolved in water; (e) products mentioned in (a), (b) or (c) dissolved in other solvents provided that the "
        "solution constitutes a normal and necessary method of putting up these products adopted solely for reasons of safety or for transport and that the "
        "solvent does not render the product particularly suitable for specific use rather than for general use; (f) the products mentioned in (a) to (e) with "
        "an added stabilizer (including an anticaking agent) necessary for their preservation or transport; (g) the products mentioned in (a) to (f) with an added "
        "anti-dusting agent or a coloring or odoriferous substance or an emetic added to facilitate their identification or for safety reasons, provided that the "
        "additions do not render the product particularly suitable for specific use rather than for general use; (h) the following products, diluted to standard "
        "strengths, for the production of azo dyes: diazonium salts, couplers used for these salts and diazotizable amines and their salts.\n\n"
        "**Note 2.** This chapter does not cover: (a) goods of heading 1504 or crude glycerol of heading 1520; (b) ethyl alcohol (heading 2207 or 2208); "
        "(c) methane or propane (heading 2711); (d) the compounds of carbon mentioned in note 2 to chapter 28; (e) immunological products of heading 3002; "
        "(f) urea (heading 3102 or 3105); (g) coloring matter of vegetable or animal origin (heading 3203), synthetic organic coloring matter, synthetic organic "
        "products of a kind used as fluorescent brightening agents or as luminophores (heading 3204) and dyes or other coloring matter put up in forms or "
        "packings for retail sale (heading 3212); (h) enzymes (heading 3507); (ij) metaldehyde, hexamethylenetetramine or similar substances put up in forms "
        "(for example, tablets, sticks or similar forms) for use as fuels, or liquid or liquefied-gas fuels in containers of a kind used for filling or refilling "
        "cigarette or similar lighters, of a capacity not exceeding 300 cm³ (heading 3606); (k) products put up as charges for fire extinguishers or put up in "
        "fire-extinguishing grenades, of heading 3813; ink removers put up in packings for retail sale, of heading 3824; or (l) optical elements, for example, "
        "of ethylenediamine tartrate (heading 9001).\n\n"
        "**Note 3.** Goods which could be included in two or more of the headings of this chapter are to be classified in that one of those headings which "
        "occurs last in numerical order.\n\n"
        "**Note 4.** In headings 2904 to 2906, 2908 to 2911 and 2913 to 2920, any reference to halogenated, sulfonated, nitrated or nitrosated derivatives "
        "includes a reference to compound derivatives, such as sulfohalogenated, nitrohalogenated, nitrosulfonated or nitrosulfohalogenated derivatives. Nitro "
        "or nitroso groups are not to be taken as \"nitrogen-functions\" for the purposes of heading 2929. For the purposes of headings 2911, 2912, 2914, 2918 and "
        "2922, \"oxygen function\", the characteristic organic oxygen-containing group of those respective headings, is restricted to the oxygen-functions "
        "referred to in headings 2905 to 2920.\n\n"
        "**Note 5.** (A) The esters of acid-function organic compounds of subchapters I to VII with organic compounds of these subchapters are to be classified "
        "with that compound which is classified in the heading placed last in numerical order in these subchapters. (B) Esters of ethyl alcohol with acid-function "
        "organic compounds of subchapters I to VII are to be classified in the same heading as the corresponding acid-function compounds. (C) Subject to note 1 to "
        "section VI and note 2 to chapter 28: (1) inorganic salts of organic compounds such as acid-, phenol- or enol-function compounds or organic bases, of "
        "subchapters I to X or heading 2942, are to be classified in the heading appropriate to the organic compound; (2) salts formed between organic compounds "
        "of subchapters I to X or heading 2942 are to be classified in the heading appropriate to the base or to the acid (including phenol- or enol-function "
        "compounds) from which they are formed, whichever occurs last in numerical order in the chapter; and (3) co-ordination compounds, other than products "
        "classifiable in subchapter XI or heading 2941, are to be classified in the heading which occurs last in numerical order in chapter 29, among those "
        "appropriate to the fragments formed by \"cleaving\" of all metal bonds, other than metal-carbon bonds. (D) Metal alcoholates are to be classified in the "
        "same heading as the corresponding alcohols except in the case of ethanol (heading 2905). (E) Halides of carboxylic acids are to be classified in the same "
        "heading as the corresponding acids.\n\n"
        "**Note 6.** The compounds of headings 2930 and 2931 are organic compounds the molecules of which contain, in addition to atoms of hydrogen, oxygen or "
        "nitrogen, atoms of other nonmetals or of metals (such as sulfur, arsenic or lead) directly linked to carbon atoms. Heading 2930 (organo-sulfur compounds) "
        "and heading 2931 (other organo-inorganic compounds) do not include sulfonated or halogenated derivatives (including compound derivatives) which, apart "
        "from hydrogen, oxygen and nitrogen, only have directly linked to carbon the atoms of sulfur or of a halogen which give them their nature of sulfonated or "
        "halogenated derivatives (or compound derivatives).\n\n"
        "**Note 7.** Headings 2932, 2933 and 2934 do not include epoxides with a three-membered ring, ketone peroxides, cyclic polymers of aldehydes or of "
        "thioaldehydes, anhydrides of polybasic carboxylic acids, cyclic esters of polyhydric alcohols or phenols with polybasic acids, or imides of polybasic "
        "acids. These provisions apply only when the ring-position hetero-atoms are those resulting solely from the cyclizing function or functions here listed.\n\n"
        "**Note 8.** For the purposes of heading 2937: (a) the term \"hormones\" includes hormone-releasing or hormone-stimulating factors, hormone inhibitors and "
        "hormone antagonists (antihormones); (b) the expression \"used primarily as hormones\" applies not only to hormone derivatives and structural analogues "
        "used primarily for their hormonal effect, but also to those derivatives and structural analogues used primarily as intermediates in the synthesis of "
        "products of this heading.\n\n"
        "**Subheading Note 1.** Within any one heading of this chapter, derivatives of a chemical compound (or group of chemical compounds) are to be classified "
        "in the same subheading as that compound (or group of compounds) provided that they are not more specifically covered by any other subheading and that "
        "there is no residual subheading named \"Other\" in the series of subheadings concerned.\n\n"
        "**Subheading Note 2.** Note 3 to chapter 29 does not apply to the subheadings of this chapter."
    ),
    "additionalUsNotes": None,
}

ts = o["tradeSnapshot"]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
for bl in ts["biggestLines"]:
    if bl["hts"] == "2937.19":
        bl["label"] = "Polypeptide, protein and glycoprotein hormones and their derivatives (other than somatotropin and insulin)"
    elif bl["hts"] == "2934.99":
        bl["label"] = "Nucleic acids and other heterocyclic compounds n.e.s."

# =================================================================== TARIFF UPDATES
fill29_engineering.CNT = cnt
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 29: Organic Chemicals — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 29 Tariff Updates 2026 — Chemicals & API Tariffs: Section 232 Pharma, Section 301, China, AD/CVD | KoalaGains",
    "shortDescription": (
        "What changed for organic chemical imports since January 2025: the IEEPA duties (including China's fentanyl duty) and their end, the Section 122 "
        "surcharge, the 2026 Section 301 tariffs and their pharmaceutical exemptions, the Section 232 duty on patented drug ingredients, and new AD/CVD orders — "
        "with Federal Register citations."
    ),
    "keywords": [
        "chemical tariffs",
        "us chemical tariffs",
        "trump tariffs on chemicals",
        "us tariffs on china chemicals",
        "tariffs on chemicals from china",
        "section 232 pharmaceuticals",
        "section 232 pharmaceutical tariffs",
        "pharma api tariffs",
        "section 301 chemicals",
        "section 301 list 3",
    ],
}
n_new = sum(1 for x in tu["lines"] if x["status"] != "unchanged")
n_changed = sum(1 for x in tu["lines"] if x["status"] == "changed")
assert n_changed == 0
tu["intro"] = (
    f"This page compares the **2025 Basic Edition** of the tariff schedule, in force at the start of 2025, with the current **2026 Revision 21** (in force "
    f"October 9, 2026). **No Chapter 29 base rate changed.** {n(NL - n_new)} of the {cnt['lines']} lines are identical; {n_new} are new statistical lines that split "
    "existing provisions at the same rate — DEA-listed drug precursors (MAPA, APAA, BMK and PMK glycidic acids, 4-AP and 1-boc-4-AP) and named drug "
    "ingredients such as diphenhydramine, phenylephrine, lorazepam, dexamethasone, atropine, doxycycline, vancomycin and clindamycin, most of them added in "
    "Revision 11 (July 1, 2026).\n\n"
    "The extra duties changed several times. In 2025 the **IEEPA** duties reached Chapter 29: 10% then 20% (later 10%) on all goods of China under the "
    "fentanyl order, 25% (Canada 35%) on non-USMCA goods of Canada and Mexico, and the April 2025 reciprocal tariff on goods of other countries except the "
    f"{n(508)} lines on its exemption list, mostly drug ingredients, vitamins, hormones and antibiotics. All IEEPA duties **ended on February 24, 2026**; the "
    "Section 122 surcharge that replaced them used the same exemption list and expired on July 23, 2026.\n\n"
    f"What applies now: the **2026 Section 301 tariffs** on 60 economies (10% or 12.5%, from July 24, 2026) on {cnt['s301']} lines, with a pharmaceutical-use "
    f"exemption for {cnt['e52']} of them; the 25% Section 301 tariff on **Brazil** (from July 22, 2026); the **China** Section 301 lists (25% and 7.5%), which "
    f"USTR confirmed on October 7, 2026 continue; the **Section 232 duty on patented pharmaceutical ingredients** on {cnt['p40']} lines (from July 31, 2026 for "
    "the 17 Annex III companies and September 29, 2026 for everyone else); the 50% **Section 338** duty on four Canadian sugar alcohols and sugars (from "
    "August 22, 2026); and Russia's 35% rate. New **antidumping and countervailing duty** orders on L-lysine, MDI, erythritol, hexamine, vanillin, 2,4-D, "
    "alkyl phosphate esters and melamine are listed below for reference; they are set company by company and are **not in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 29 from any country: the 2026 Section 301 tariffs on 60 economies and on Brazil and their exemption lists, the "
    "2018–2019 China Section 301 lists, the Section 232 pharmaceutical duty, the Canada Section 338 duty, the Russia rates under U.S. note 30 and the Section 232 "
    "aluminum derivative duty on Russian goods, plus the ended IEEPA and Section 122 duties. Antidumping and countervailing duty orders on Chapter 29 products "
    "are listed as reference entries; they are not priced in the tariff calculator. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates changed", "value": f"0 of {cnt['lines']} lines"},
    {"label": "New statistical lines", "value": f"{n_new} of {cnt['lines']}", "note": "Same rates; precursor chemicals and named APIs"},
    {"label": "Lines on the Section 232 list", "value": f"{cnt['p40']} of {cnt['lines']}", "note": "Patented drug ingredients only"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

ALL_HTS = ["hts-chapter-99", "hts-now"]
tu["inEffect"] = [
    {
        "id": "s232-default",
        "country": "All countries (default)",
        "measure": "Section 232 duty on patented pharmaceuticals and their ingredients",
        "ch99Code": "9903.04.60",
        "before": "None",
        "now": "100% (in place of base)",
        "exemption": (
            f"Covers only the {cnt['p40']} Chapter 29 lines in U.S. note 40(c) — drug ingredients in 2918–2942 such as polypeptide hormones (2937.19), insulin "
            "(2937.12), steroids, antibiotics and many \"Drugs\" lines — and only when the goods are an active ingredient or key starting material for a patented "
            "drug listed in FDA's Orange or Purple Book. Generic ingredients: no extra duty (9903.04.67). Inactive ingredients, excipients and chemicals not used "
            "for a drug: no Section 232 duty (9903.04.69). Other lower headings: onshoring plan 20% (9903.04.64), onshoring plus an MFN pricing agreement 0% "
            "(9903.04.65), listed specialty products from listed jurisdictions 0% (9903.04.66), U.S.-origin API made into dosage form abroad (9903.04.68), "
            "clinical trials and R&D (9903.04.70). Patented articles under 9903.04.60–9903.04.66 are excluded from the 2026 Section 301 duties (note 52(f)(8))."
        ),
        "whatItMeans": (
            "A patented API from India, China, Singapore or Canada pays 100% of its value in total — the 100% replaces the base rate, it is not added to it. "
            "The same chemical sold for a generic drug pays only the base rate and any Section 301 duty."
        ),
        "effectiveFrom": "2026-09-29",
        "effectiveSourceId": "procl-11020",
        "sourceIds": ["procl-11020", "csms-69395344", "csms-70054007", "bis-specialty", "bis-onshoring"] + ALL_HTS,
    },
    {
        "id": "s232-deal15",
        "country": "EU, Japan, South Korea, Switzerland, Liechtenstein",
        "measure": "Section 232 duty on patented pharmaceuticals (deal rate)",
        "ch99Code": "9903.04.62",
        "before": "None",
        "now": "15% (in place of base)",
        "exemption": (
            "Same scope as 9903.04.60. Generics pay nothing extra (9903.04.67). Specialty products (orphan drugs, plasma-derived, cell and gene therapies, ADCs and "
            "others Commerce listed on September 23, 2026) from these countries pay 0% (9903.04.66)."
        ),
        "whatItMeans": f"A patented polypeptide hormone API from Ireland (2937.19) pays 15% of its value in total; Ireland supplied {F['ie_2937']} of Chapter 29 hormones in {YR}.",
        "effectiveFrom": "2026-09-29",
        "effectiveSourceId": "procl-11020",
        "sourceIds": ["procl-11020", "csms-70054007", "bis-specialty"] + ALL_HTS,
    },
    {
        "id": "s232-uk",
        "country": "United Kingdom",
        "measure": "Section 232 duty on patented pharmaceuticals (UK rate)",
        "ch99Code": "9903.04.63",
        "before": "None",
        "now": "+0%",
        "exemption": "Set at +10% by Proclamation 11020 and cut to +0% from July 31, 2026 under the U.S.–UK pharmaceutical pricing arrangement; patented UK ingredients must still be entered under 9903.04.63.",
        "whatItMeans": "A patented ingredient made in the UK pays only its base rate (and the 10% Section 301 duty on UK goods only if it is not entered under a Section 232 heading).",
        "effectiveFrom": "2026-07-31",
        "effectiveSourceId": "bis-uk",
        "sourceIds": ["bis-uk", "csms-69415934"] + ALL_HTS,
    },
    {
        "id": "s301-2026",
        "country": "60 economies (incl. EU, China, India, Singapore, Switzerland, Japan, UK, Canada, Mexico, Brazil)",
        "measure": "Section 301 tariff (forced-labor investigations)",
        "ch99Code": "9903.05.20–9903.05.84",
        "before": "None",
        "now": "+10% or +12.5% (EU 10%, Japan, South Korea and Switzerland 12.5% in place of base)",
        "exemption": (
            f"{cnt['b52']} lines are exempt for every use (U.S. note 52(b), 9903.05.86): all of 2936 (vitamins), 2937 (hormones) and 2941 (antibiotics), most "
            f"of 2939 (alkaloids), and 2915.29.30, 2918.29.75, 2926.90.30, 2930.20.10 and 2933.19.23. {cnt['e52']} more lines are exempt when the goods are for use "
            "in pharmaceutical applications, even if entered Free (K) (note 52(e), 9903.05.89). Patented drug ingredients entered under 9903.04.60–9903.04.66 are "
            "excluded (note 52(f)(8)); USMCA goods of Canada and Mexico are exempt (9903.05.93, 9903.05.94); 4,7-dichloroquinoline (2933.49.08) from Ecuador is "
            f"exempt (note 52(j)(12)). {cnt['neither']} lines have no exemption at all — mainly industrial hydrocarbons, solvents, monomers and intermediates. "
            "The duty applies also when an FTA, GSP or Free (K)/(L) rate is claimed (note 52(a))."
        ),
        "whatItMeans": (
            "Indian acetone or methanol for industrial use pays its base rate +10%; the same chemicals from China +12.5% on top of the China lists; from Germany or Ireland 10% "
            "in total. A vitamin or antibiotic pays none of it; an API on the note 52(e) list for a drug maker pays none of it once the use is declared."
        ),
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2026-15181", "fr-2026-15274"] + ALL_HTS,
    },
    {
        "id": "br-301",
        "country": "Brazil",
        "measure": "Section 301 tariff (Brazil investigation)",
        "ch99Code": "9903.05.01",
        "before": "None",
        "now": "+25%",
        "exemption": (
            f"{n(len(L.br_a2))} lines are exempt (U.S. note 50(a)(ii), 9903.05.03) — the vitamins, hormones, antibiotics and alkaloids of note 52(b) plus five "
            f"2903.19 chlorinated solvents; {n(len(L.br_a5))} more when for pharmaceutical use (note 50(a)(v), 9903.05.06); patented drug ingredients under "
            "9903.04.60–9903.04.66 are excluded. The 25% is added to the base rate and to the 12.5% that Brazil pays under 9903.05.27."
        ),
        "whatItMeans": "A Brazilian industrial chemical at a 5.5% base rate pays 43% (5.5% + 12.5% + 25%).",
        "effectiveFrom": "2026-07-22",
        "effectiveSourceId": "fr-2026-14542",
        "sourceIds": ["fr-2026-14542"] + ALL_HTS,
    },
    {
        "id": "cn-301-lists",
        "country": "China",
        "measure": "Section 301 tariff (2018–2019 China lists 3 and 4A)",
        "ch99Code": "9903.88.03 / 9903.88.04 / 9903.88.15",
        "before": "+25% / +7.5%",
        "now": "+25% / +7.5%",
        "exemption": (
            f"Not new: List 3 (+25%, 9903.88.03) covers {cnt['l3']} Chapter 29 lines and 9903.88.04 eight more 2931.90.90 lines; List 4A (+7.5%, 9903.88.15) "
            f"covers {cnt['l4a']} lines, including mannitol, sorbitol and glycerol. {cnt['nolist']} lines are on no list — among them all vitamins (2936), hormones (2937) and "
            "antibiotics (2941) and most alkaloids. Two product exclusions run until November 9, 2026: sodium adipate (2917.12.50.00) and NBPT "
            "(2929.90.50.95) (9903.88.69). USTR confirmed on October 7, 2026 that the actions continue during their four-year review. The China lists stack with "
            "the 12.5% 2026 Section 301 duty (9903.05.31). The IEEPA fentanyl duty (10%, then 20%, then 10%) ended February 24, 2026."
        ),
        "whatItMeans": "Chinese citric acid (base 6%) pays 43.5% (6% + 12.5% + 25%) before antidumping duties; Chinese vitamin C (Free, note 52(b)) pays nothing extra.",
        "effectiveFrom": "2019-05-10",
        "effectiveSourceId": "fr-2019-09681",
        "sourceIds": ["fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "fr-2025-21671"] + ALL_HTS,
    },
    {
        "id": "ca-338",
        "country": "Canada",
        "measure": "Section 338 duty (offsetting Canadian discrimination, motor vehicles action)",
        "ch99Code": "9903.03.14",
        "before": "None",
        "now": "+50%",
        "exemption": (
            "Only four Chapter 29 provisions are on U.S. note 51(b)(3): mannitol (2905.43), sorbitol (2905.44), glycerol (2905.45) and D-arabinose (2940.00.20). "
            "The 50% applies also to USMCA-qualifying goods and on top of the base rate and the 10% Section 301 duty. D-ribose (2940.00.60) was on the list from "
            "August 22 until Proclamation 11065 removed it from September 15, 2026."
        ),
        "whatItMeans": "Canadian sorbitol pays 50% with a USMCA claim and 64.9% without one.",
        "effectiveFrom": "2026-08-22",
        "effectiveSourceId": "procl-11056",
        "sourceIds": ["procl-11048", "procl-11056", "procl-11065", "csms-69606660", "csms-69851916"] + ALL_HTS,
    },
    {
        "id": "ru-col2",
        "country": "Russia",
        "measure": "Rates in lieu of column 2 (U.S. note 30) and Section 232 aluminum derivatives",
        "ch99Code": "9903.90.08 / 9903.85.68",
        "before": "35% (in place of column 2)",
        "now": "35% (in place of column 2); +200% on 5 lines",
        "exemption": (
            f"Russia pays the column 2 rates (often 15.4¢/kg plus 40–60% for Chapter 29); on {cnt['ru30']} lines listed in note 30(b) the rate is 35% instead. "
            "Five fluorinated-hydrocarbon lines (2903.43.10, 2903.45.10, 2903.49.00, 2903.51.10, 2903.59.90) are on the Section 232 aluminum derivative list and "
            "pay a further 200% as products of Russia (9903.85.68). The 12.5% 2026 Section 301 duty on Russia (9903.05.66) applies on top."
        ),
        "whatItMeans": f"Russian Chapter 29 chemicals face column 2 or 35% rates plus 12.5%: the U.S. imported ${BYC['Russian Federation']['importsUsd'] / 1e6:.1f}M of them in {YR}.",
        "effectiveFrom": "2022-07-27",
        "effectiveSourceId": "procl-10420",
        "sourceIds": ["procl-10420", "procl-10523", "procl-10522", "fr-2025-15819"] + ALL_HTS,
    },
]


# change log ------------------------------------------------------------------
def chg_(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


changes = [
    chg_("base-rates", "baseRate", AS_OF, "Checked", "No Chapter 29 base-rate changes",
         f"Every line that exists in both editions carries the same General rate in the 2026 Revision 21 as in the 2025 Basic Edition; {n_new} lines are new "
         "statistical breakouts at the rate of the line they were split from.", None, None, None, ["hts-before", "hts-now", "hts-now-cr"]),
    chg_("cbs-prelim", "pending", "2026-10-08", "Published", "CBS rubber accelerator from China: preliminary countervailing duty",
         "Commerce preliminarily found countervailable subsidies on N-cyclohexylbenzothiazole-2-sulfenamide (CBS, 2934.20) from China; the antidumping "
         "investigation opened June 2, 2026 is still under way. Cash deposits apply from the preliminary determination; final determinations are pending.",
         None, None, "China", ["cvd-cbs-prelim", "ad-cbs-init", "cvd-cbs-init"]),
    chg_("cn-301-continue", "reference", "2026-10-07", "Published", "China Section 301 lists continue during the four-year review",
         f"USTR announced that the 2018 China Section 301 actions did not terminate on their July 6 and August 23, 2026 anniversaries. For Chapter 29 this keeps "
         f"25% on {n(len(L.l3 | L.l3d))} lines (List 3) and 7.5% on {cnt['l4a']} lines (List 4A).", "+25% / +7.5%", "+25% / +7.5%", "China", ["fr-2026-20510"]),
    chg_("nicaragua-2027", "pending", "2026-10-07", "Announced", "Section 301 tariff on Nicaragua phases in from 2027",
         "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), "
         "with no exemption list for chemicals. The rate is 0% in 2026.", None, "+10% to +15%", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99"]),
    chg_("methionine-sunset", "reference", "2026-10-05", "Published", "Methionine antidumping orders: Commerce sunset results",
         "In expedited sunset reviews, Commerce found that revoking the 2021 antidumping orders on methionine (2930.40) from France, Japan and Spain would likely "
         "lead to continued dumping. The ITC is conducting full reviews; the orders stay in force meanwhile.", None, None, "France, Japan, Spain",
         ["ad-methionine-sunset", "ad-methionine-fr", "ad-methionine-jp-es"]),
    chg_("s232-all", "extraDuty", "2026-09-29", "Effective", "Section 232 pharmaceutical duty extended to all companies",
         f"The interim 0% heading for companies not named in Annex III (9903.04.61) ended. Patented drug ingredients on the {cnt['p40']} Chapter 29 lines now pay "
         "100% (9903.04.60), 15% from the EU, Japan, South Korea and Switzerland (9903.04.62) or 0% from the UK (9903.04.63) unless a lower heading applies.",
         "Free (9903.04.61)", "100% / 15% / 0%", "All", ["procl-11020", "csms-70054007"] + ALL_HTS),
    chg_("tham-prelim", "pending", "2026-09-24", "Published", "THAM (tromethamine) from China: preliminary countervailing duty",
         "Commerce preliminarily found countervailable subsidies on tris(hydroxymethyl)aminomethane (2922.19) from China; the antidumping investigation opened "
         "May 18, 2026 is still under way.", None, None, "China", ["cvd-tham-prelim", "ad-tham-init", "cvd-tham-init"]),
    chg_("s232-specialty", "extraDuty", "2026-09-23", "Published", "Specialty-drug 0% rate defined",
         "Commerce named the categories (orphan drugs, plasma-derived therapies, cell and gene therapies, ADCs, nuclear medicines, fertility treatments, CBRN "
         "countermeasures, animal health) and the jurisdictions — including the EU, Japan, South Korea, Switzerland, the UK and India, but not China or Singapore — "
         "whose specialty products and their ingredients enter at 0% (9903.04.66). CBP added 9903.04.70 (0%) for clinical-trial and R&D use.",
         None, None, "All", ["bis-specialty", "hts-now"]),
    chg_("fatty-prelim", "pending", "2026-09-22", "Published", "Fatty acids from Indonesia and Malaysia: preliminary antidumping duties",
         "Commerce preliminarily found dumping of certain fatty acids (scope includes 2915.70, 2915.90 and 2916.15) from Indonesia and Malaysia, after "
         "preliminary countervailing duty findings in July 2026. Final determinations are pending.", None, None, "Indonesia, Malaysia",
         ["ad-fatty-id-prelim", "ad-fatty-my-prelim", "ad-fatty-init"]),
    chg_("lysine-orders", "reference", "2026-09-16", "Published", "Antidumping and countervailing duty orders on L-lysine from China",
         "Commerce issued AD and CVD orders on L-lysine (2922.41) from China; importers post cash deposits at each exporter's rate.", None, None, "China", ["ad-lysine"]),
    chg_("ca338-ribose", "extraDuty", "2026-09-15", "Effective", "D-ribose removed from the Canada Section 338 list",
         "Proclamation 11065 narrowed the U.S. note 51(b)(3) list from September 15, 2026; D-ribose (2940.00.60) no longer pays the 50%, while mannitol, sorbitol, "
         "glycerol and D-arabinose still do.", "+50%", "None", "Canada", ["procl-11065", "csms-69851916"]),
    chg_("citric-ca-in", "pending", "2026-08-26", "Published", "Citric acid from India and Canada: preliminary antidumping results",
         "Commerce preliminarily found dumping of citric acid and citrate salts (2918.14, 2918.15) from India and none from Canada; in June it had preliminarily "
         "found countervailable subsidies for both. Final determinations and the ITC's final vote are pending.", None, None, "India, Canada",
         ["ad-citric-in-prelim", "ad-citric-ca-prelim", "cvd-citric-in-prelim", "cvd-citric-ca-prelim", "ad-citric-ca-in-init"]),
    chg_("ca338-start", "extraDuty", "2026-08-22", "Effective", "50% Section 338 duty on Canadian mannitol, sorbitol, glycerol and sugars",
         "Products of Canada on U.S. note 51(b)(3) pay +50% (9903.03.14), including USMCA-qualifying goods. In Chapter 29 that is 2905.43, 2905.44, 2905.45, "
         "2940.00.20 and, until September 14, 2940.00.60. Proclamation 11056 moved the start from August 19 to August 22, 2026.", None, "+50%", "Canada",
         ["procl-11048", "procl-11056", "csms-69606660"]),
    chg_("r32-continue", "reference", "2026-08-11", "Published", "Antidumping order on R-32 refrigerant from China continued",
         "After the first five-year review, the antidumping order on difluoromethane (R-32, 2903.42) from China stays in force.", None, None, "China", ["ad-r32"]),
    chg_("corrosion-continue", "reference", "2026-08-06", "Published", "Corrosion inhibitor orders on China continued",
         "Commerce continued the AD and CVD orders on tolyltriazole and benzotriazole (2933.99) from China.", None, None, "China", ["ad-corrosion"]),
    chg_("s232-start", "extraDuty", "2026-07-31", "Effective", "Section 232 pharmaceutical duty starts for the 17 Annex III companies; UK cut to 0%",
         "Patented drug ingredients imported for the large drugmakers named in Annex III to Proclamation 11020 pay 100%, 15% for EU/Japanese/Korean/Swiss origin. "
         "The same day Commerce cut the UK rate (9903.04.63) from +10% to +0%. Generics pay nothing extra (9903.04.67).", "None", "100% / 15% / 0%", "All",
         ["procl-11020", "csms-69395344", "bis-uk", "csms-69415934"]),
    chg_("monomers-kr", "reference", "2026-07-28", "Published", "Antidumping order on acrylate monomers and oligomers from South Korea",
         "Commerce issued an antidumping order on certain multifunctional acrylate and methacrylate monomers and oligomers (scope includes 2916.12 and 2916.14) "
         "from South Korea; Taiwan has been under AD and CVD orders since March 11, 2026.", None, None, "South Korea, Taiwan", ["ad-monomers-kr", "ad-monomers-tw"]),
    chg_("s301-2026", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies; pharmaceutical exemptions",
         f"10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). {cnt['b52']} Chapter 29 lines are exempt under note 52(b) and {cnt['e52']} more when "
         "for pharmaceutical use (note 52(e)); patented drug ingredients under Section 232 are excluded.", "None", "+10% / +12.5%", "60 economies",
         ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    chg_("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
         "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.", "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    chg_("br-301", "extraDuty", "2026-07-22", "Effective", "25% Section 301 tariff on Brazil",
         f"USTR imposed 25% on all products of Brazil (9903.05.01), on top of Brazil's 12.5% under 9903.05.27. {n(len(L.br_a2))} Chapter 29 lines are exempt "
         "(note 50(a)(ii)), more when for pharmaceutical use (note 50(a)(v)).", "None", "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    chg_("stat-jul", "reference", "2026-07-01", "Effective", "36 new statistical lines (Revision 11)",
         "Revision 11 split 18 Chapter 29 provisions to track DEA-listed precursors (MAPA, APAA, BMK and PMK glycidic acids, 4-AP and 1-boc-4-AP) and named drug "
         "ingredients (diphenhydramine, phenylephrine, dexamethasone, atropine, doxycycline, tobramycin, vancomycin, clindamycin, rocuronium, tacrolimus, timolol, "
         "acetylcysteine), plus ethylene carbonate and dimethyl sulfide. Rates did not change.", None, None, None, ["hts-2026-rev11"]),
    chg_("mdi-order", "reference", "2026-06-25", "Published", "Antidumping order on MDI from China",
         "Commerce issued an antidumping order on methylene diphenyl diisocyanate (MDI, 2929.10) from China.", None, None, "China", ["ad-mdi"]),
    chg_("msg-continue", "reference", "2026-06-05", "Published", "MSG antidumping orders continued",
         "The antidumping orders on monosodium glutamate (2922.42) from China and Indonesia stay in force after the second sunset review.", None, None,
         "China, Indonesia", ["ad-msg"]),
    chg_("citric-cn-continue", "reference", "2026-05-29", "Published", "Citric acid orders on China continued",
         "Commerce continued the 2009 antidumping and countervailing duty orders on citric acid and citrate salts (2918.14, 2918.15) from China after the third "
         "sunset review.", None, None, "China", ["ad-citric-cn"]),
    chg_("thfa-continue", "reference", "2026-05-05", "Published", "Tetrahydrofurfuryl alcohol order on China continued",
         "The antidumping order on tetrahydrofurfuryl alcohol (2932.13) from China stays in force after the fourth sunset review.", None, None, "China", ["ad-thfa"]),
    chg_("s232-procl", "extraDuty", "2026-04-02", "Signed", "Section 232 duties on patented pharmaceuticals and ingredients proclaimed",
         "Proclamation 11020 set 100% on patented drugs and their active ingredients and key starting materials (U.S. note 40(c) lists 72 Chapter 29 lines), 15% for "
         "the EU, Japan, South Korea, Switzerland and Liechtenstein, 10% for the UK, 20% with an approved onshoring plan and 0% with onshoring plus an MFN pricing "
         "agreement. Generics, biosimilars and their ingredients are excluded.", None, None, "All", ["procl-11020", "bis-232-init"]),
    chg_("erythritol-orders", "reference", "2026-03-27", "Published", "AD and CVD orders on erythritol from China",
         "Commerce issued antidumping and countervailing duty orders on erythritol (2905.49) from China.", None, None, "China", ["ad-erythritol"]),
    chg_("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
         "10% on products of all countries (9903.03.01) until July 23, 2026, with the reciprocal tariff's product exemption list (9903.03.03): about 508 of the "
         "1,227 Chapter 29 lines were exempt, mostly drug ingredients, vitamins, hormones and antibiotics.", "None", "+10% (until July 23, 2026)", "All",
         ["procl-11012", "hts-chapter-99"]),
    chg_("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
         "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended "
         "the China fentanyl duty, the Canada and Mexico duties and the reciprocal tariff, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on "
         "February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but no longer collected.", "+10% to +35%", "None", "All",
         ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    chg_("acetone-continue", "reference", "2026-02-06", "Published", "Acetone antidumping orders continued",
         "The antidumping orders on acetone (2914.11) from Belgium, Singapore, South Africa, South Korea and Spain stay in force after the first sunset review.",
         None, None, "Belgium, Singapore, South Africa, South Korea, Spain", ["ad-acetone"]),
    chg_("hexamine-orders-2026", "reference", "2026-01-07", "Published", "Hexamine orders on Germany, India and Saudi Arabia",
         "Commerce issued antidumping orders on hexamethylenetetramine (2933.69) from Germany, India and Saudi Arabia and a countervailing duty order on India; "
         "China has been under AD and CVD orders since September 11, 2025.", None, None, "Germany, India, Saudi Arabia, China",
         ["ad-hexamine-de-in-sa", "cvd-hexamine-in", "ad-hexamine-cn"]),
    chg_("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
         "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on February 24, 2026.",
         "+20%", "+10%", "China", ["eo-14357"]),
    chg_("ru-aluminum", "extraDuty", "2025-08-18", "Effective", "Five Russian fluorocarbon lines added to the Section 232 aluminum derivative list",
         "Commerce added 120 provisions, including five Chapter 29 fluorinated-hydrocarbon lines, to the aluminum derivative list; as products of Russia they pay "
         "+200% (9903.85.68).", None, "+200%", "Russia", ["fr-2025-15819", "procl-10522"]),
    chg_("ca-35", "extraDuty", "2025-08-01", "Effective", "Canada IEEPA duty raised to 35%",
         "The IEEPA duty on non-USMCA goods of Canada (9903.01.10) went from 25% to 35%. Ended February 24, 2026.", "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    chg_("vanillin-orders", "reference", "2025-07-28", "Published", "AD and CVD orders on vanillin from China",
         "Commerce issued antidumping and countervailing duty orders on vanillin (2912.41) from China.", None, None, "China", ["ad-vanillin"]),
    chg_("alkylphos-orders", "reference", "2025-06-11", "Published", "AD and CVD orders on alkyl phosphate esters from China",
         "Commerce issued antidumping and countervailing duty orders on certain alkyl phosphate esters such as TCPP (2919.90) from China.", None, None, "China",
         ["ad-alkylphos"]),
    chg_("24d-orders", "reference", "2025-05-27", "Published", "AD and CVD orders on 2,4-D from China and India",
         "Commerce issued antidumping and countervailing duty orders on 2,4-dichlorophenoxyacetic acid and its salts and esters from China and India.", None, None,
         "China, India", ["ad-24d", "cvd-24d"]),
    chg_("dotp-orders", "reference", "2025-05-22", "Published", "Antidumping orders on DOTP from four countries",
         "Commerce issued antidumping orders on dioctyl terephthalate (2917.39) from Malaysia, Poland, Taiwan and Türkiye; South Korea has been under an order since 2017.",
         None, None, "Malaysia, Poland, Taiwan, Türkiye", ["ad-dotp", "ad-dotp-kr"]),
    chg_("reciprocal", "extraDuty", "2025-04-05", "Effective", "Reciprocal tariff; many drug ingredients exempt",
         "10% baseline (9903.01.25) and higher country rates (9903.02.xx) on products of all countries except Canada and Mexico. About 508 of today's Chapter 29 "
         "lines were on the Annex II exemption list (9903.01.32); hydrocarbons, solvents and most industrial intermediates were not. Ended February 24, 2026.",
         "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    chg_("melamine-orders", "reference", "2025-01-31", "Published", "Melamine orders on six countries",
         "Commerce issued antidumping orders on melamine (2933.61) from Germany, Japan, the Netherlands and Trinidad and Tobago and countervailing duty orders on "
         "Germany, Qatar and Trinidad and Tobago; India followed with AD and CVD orders on April 9, 2025.", None, None,
         "Germany, Japan, Netherlands, Trinidad and Tobago, Qatar, India", ["ad-melamine", "cvd-melamine", "ad-melamine-in"]),
    chg_("glycine-continue", "reference", "2025-01-28", "Published", "Glycine orders continued",
         "The antidumping orders on glycine (2922.49.43) from India, China, Japan and Thailand and the countervailing duty orders on India and China stay in force.",
         None, None, "India, China, Japan, Thailand", ["ad-glycine"]),
    chg_("usmca-exempt", "extraDuty", "2025-03-07", "Effective", "USMCA goods exempted from the Canada and Mexico IEEPA duties",
         "From March 7, 2025, goods entered under USMCA no longer paid the IEEPA duties on Canada and Mexico; non-USMCA Chapter 29 goods kept paying 25%.",
         "+25%", "USMCA goods exempt", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    chg_("cn-ieepa-20", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%, with no chemical exemption",
         "The IEEPA duty on all products of China and Hong Kong (9903.01.20, then 9903.01.24) rose from +10% to +20%. Unlike the reciprocal tariff it had no "
         "exemption list, so every Chapter 29 chemical paid it, on top of the Section 301 lists.", "+10%", "+20%", "China", ["eo-14228"]),
    chg_("cn-ieepa-10", "extraDuty", "2025-02-04", "Effective", "China fentanyl duty: +10% on all goods of China",
         "Executive Order 14195, aimed at the synthetic opioid supply chain, imposed +10% on all products of China and Hong Kong (9903.01.20) from February 4, 2025.",
         "None", "+10%", "China", ["eo-14195"]),
    chg_("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada and Mexico",
         "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including Chapter 29 chemicals. Ended February 24, 2026.",
         "None", "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194"]),
]
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes

# =================================================================== UNDERSTAND INDUSTRY
u = d["understandIndustry"]
u["h1"] = "HTS Chapter 29: Organic Chemicals — U.S. Import Statistics"
u["seo"] = {
    "title": "U.S. Organic Chemical Imports by Country & Product (HTS Ch. 29) — Ireland, China, India | KoalaGains",
    "shortDescription": (
        f"Where U.S. organic chemical imports come from, 2020–{YR}: {F['T']} in {YR}, {F['ie_share']} from Ireland (mostly hormones), then China, India, "
        "Singapore and Germany. By country, by product and over time, from UN Comtrade."
    ),
    "keywords": [
        "us chemical imports",
        "organic chemical imports by country",
        "chemical imports from china",
        "organic chemical import from china",
        "HTS Chapter 29 import statistics",
    ],
}
u["why"] = (
    f"U.S. imports of Chapter 29 organic chemicals were **{F['T']} in {YR}**, {F['chg']} on {F['P']} in {PY}. Almost all of the increase came from **Ireland**: "
    f"{F['ie']}, up from {F['ie_p']}, and {F['ie_2937']} of it in heading 2937 (hormones). Across all suppliers, subheading 2937.19 — polypeptide, protein and "
    f"glycoprotein hormones other than insulin and somatotropin — rose from {F['s293719_p']} to {F['s293719']}. Without Ireland, imports were {F['ex_ie']}, down "
    f"from {F['ex_ie_p']}.\n\n"
    f"**China** ({F['cn']}) ships a broad mix: nitrogen heterocyclics (2933), hormones, organo-inorganic compounds (2931) and vitamins (2936). **India** "
    f"({F['india']}) and **Singapore** ({F['sg']}) mainly ship drug ingredients in 2933 and 2934. Imports from **Switzerland** fell to {F['ch']} from {F['ch_p']} "
    f"and from **South Korea** to {F['kr']} from {F['kr_p']}. **Canada** is the largest source of hydrocarbons (2901). Comtrade figures do not say why a "
    "partner's trade moved, so we do not attribute these changes to tariffs.\n\n"
    f"These are {YR} figures: they include the IEEPA duties of 2025 but predate the Section 232 pharmaceutical duty and the 2026 Section 301 tariffs. "
    f"{YR} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
)
for st in u["stats"]:
    if st["label"] == "Largest product":
        st["note"] = "Polypeptide, protein and glycoprotein hormones other than insulin and somatotropin (2937.19)"
u["sources"] = [
    {"label": f"UN Comtrade (public API), United States imports, HS chapter 29 (retrieved {TRADE['retrievedAt']})", "url": "https://comtradeplus.un.org/"},
]
u["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
u["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."

# =================================================================== INDUSTRY AREAS
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 29: Organic Chemicals — Tariff Rates by Country"
ia["seo"] = {
    "title": "Organic Chemical Tariff Rates by Country — Ireland, China, India, EU, Canada (HTS Ch. 29) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on organic chemicals by country and product group: base rate plus the 2026 Section 301 duty, the China lists, the Section 232 "
        "duty on patented drug ingredients and the Canada Section 338 duty — for Ireland, China, India, Singapore, Germany, Canada, Switzerland, Japan and more."
    ),
    "keywords": [
        "tariff on chemicals from india",
        "us tariff on chemicals from india",
        "us tariffs on china chemicals",
        "tariffs on chemicals from china",
        "us tariffs india chemicals",
        "pharmaceutical tariffs ireland",
        "pharmaceutical tariffs india",
        "pharmaceutical tariffs us eu",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
    "Where a group has several rates, the cell shows each total that some line pays; select it to see which lines carry which rate.\n\n"
    "Three things decide most Chapter 29 totals. **Origin:** the 2026 Section 301 duty is 10% in place of the base rate for EU goods, 12.5% in place of it "
    "for Switzerland and Japan, +10% for India, the UK, Canada and Mexico and +12.5% for China, Singapore and Brazil — and China adds 25% or 7.5% under its "
    "older lists. **Product type** for the drug-ingredient lines on the Section 232 list: patented ingredients pay 100% (15% from the EU, Japan, Korea and "
    "Switzerland; 0% from the UK), generics nothing extra. **End use:** the matrix does **not** apply the pharmaceutical-use exemption from Section 301 "
    f"(9903.05.89, {cnt['e52']} lines) or the Pharmaceutical Appendix (Free (K), {cnt['K']} lines), because both depend on the importer's claim — an API for a "
    "drug maker often pays less than the cell shows. Antidumping and countervailing duties are not included."
)

RULES = {
    "Ireland": "EU",
    "Germany": "EU",
    "Netherlands": "EU",
    "Italy": "EU",
}
s232_tail_deal = "Patented drug ingredients on the 72 Section 232 lines pay 15% in place of the base rate (9903.04.62); listed specialty products 0% (9903.04.66); generics nothing extra."
s232_tail_100 = "Patented drug ingredients on the 72 Section 232 lines pay 100% in place of the base rate (9903.04.60); generics nothing extra."
exempt_tail = f"{cnt['b52']} lines (vitamins, hormones, antibiotics, most alkaloids) are exempt from Section 301 (9903.05.86); {cnt['e52']} more when for pharmaceutical use (9903.05.89, not applied here)."
LABELS = {
    "EU": f"2026 Section 301: 10% in place of the base rate (9903.05.39), so a non-exempt line pays 10% in total whatever its ad valorem base rate. {exempt_tail} {s232_tail_deal} The 2025 IEEPA duties ended February 24, 2026.",
    "China": (
        f"2026 Section 301 +12.5% (9903.05.31) plus the 2018–2019 lists: +25% on {n(len(L.l3 | L.l3d))} lines (9903.88.03 / 9903.88.04) and +7.5% on "
        f"{cnt['l4a']} (9903.88.15); {cnt['nolist']} lines are on no list. {exempt_tail} {s232_tail_100} China is not on the specialty list. The IEEPA fentanyl "
        "duty ended February 24, 2026. AD/CVD orders (citric acid, glycine, MSG, HFCs, melamine and others) are not shown."
    ),
    "India": f"2026 Section 301 +10% (9903.05.44). {exempt_tail} {s232_tail_100} Listed specialty products 0% (9903.04.66). AD/CVD orders on glycine, 2,4-D, melamine and hexamine are not shown.",
    "Singapore": f"2026 Section 301 +12.5% (9903.05.68); the U.S.–Singapore FTA (SG) removes the base rate but not the Section 301 duty. {exempt_tail} {s232_tail_100} Singapore is not on the specialty list.",
    "Switzerland": f"2026 Section 301: 12.5% in place of the base rate (9903.05.74). {exempt_tail} {s232_tail_deal}",
    "Japan": f"2026 Section 301: 12.5% in place of the base rate (9903.05.49). {exempt_tail} {s232_tail_deal}",
    "United Kingdom": f"2026 Section 301 +10% (9903.05.81). {exempt_tail} Patented drug ingredients pay +0% under 9903.04.63 (cut from 10% on July 31, 2026); generics nothing extra.",
    "Canada": (
        "USMCA-qualifying: no Section 301 duty (9903.05.93). Otherwise +10% (9903.05.29). Mannitol, sorbitol, glycerol and D-arabinose pay +50% under Section 338 "
        f"(9903.03.14) with or without a USMCA claim. {s232_tail_100} The 2025 IEEPA duty (25%, then 35%) ended February 24, 2026."
    ),
    "Mexico": f"USMCA-qualifying: no Section 301 duty (9903.05.94). Otherwise +10% (9903.05.55). {s232_tail_100} The 2025 IEEPA duty (25%) ended February 24, 2026.",
    "Brazil": (
        f"2026 Section 301 +12.5% (9903.05.27) plus the Brazil Section 301 duty +25% (9903.05.01): 37.5% on top of the base rate. {n(len(L.br_a2))} lines are "
        f"exempt from the 25% (9903.05.03) and {cnt['b52']} from the 12.5% (9903.05.86); more when for pharmaceutical use (not applied here). {s232_tail_100}"
    ),
    "Any other country": (
        "Countries outside the 60 Section 301 economies (and outside column 2) pay only the base rate; the other Section 301 economies pay +10% or +12.5% "
        "(Taiwan 10% and South Korea 12.5% in place of the base rate). Patented drug ingredients pay 100% except from the EU, Japan, South Korea, Switzerland, "
        "Liechtenstein (15%) and the UK (0%). Russia pays column 2 or 35% (note 30)."
    ),
}
for c in ia["countries"]:
    key = RULES.get(c["country"], c["country"])
    c["rule"]["label"] = LABELS[key]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The pharmaceutical-use exemption from the Section 301 duties (9903.05.89 / 9903.05.06) and the Pharmaceutical Appendix (Free (K)) and dyes appendix "
    "(Free (L)) are not applied: they need the importer's claim. An API for a drug maker on a note 52(e) line pays no Section 301 duty, and a listed drug "
    "ingredient pays no base rate.",
    "Section 232 cells show the patented, generic and specialty totals separately; \"specialty\" (0%) applies only to products Commerce has designated, "
    "from a listed jurisdiction.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) "
    "expired July 23, 2026; neither is applied.",
    "Antidumping and countervailing duties are not included: more than 25 Chapter 29 products carry orders (citric acid, glycine, MSG, L-lysine, MDI, "
    "melamine, hexamine, HFC refrigerants, acetone, vanillin, erythritol and others), at company-specific rates. Neither are the Superfund chemical excise tax "
    "or the ozone-depleting-chemical tax, which are paid to the IRS.",
    "Entry rules still apply: DEA import declarations and permits for listed chemicals and controlled substances, TSCA certification, EPA allowances for HFCs "
    "and ozone-depleting substances, and FDA registration for drug ingredients.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 29, 30, 40, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. "
    f"Note 52(b) (9903.05.86) exempts {cnt['b52']} Chapter 29 lines (2936, 2937, 2941, most of 2939, and 2915.29.30, 2918.29.75, 2926.90.30, 2930.20.10, "
    f"2933.19.23) and note 52(e) (9903.05.89) {cnt['e52']} more when for pharmaceutical use; the Brazil lists 50(a)(ii) and 50(a)(v) cover {n(len(L.br_a2))} and "
    f"{n(len(L.br_a5))} lines. Note 52(j)(12) exempts 4,7-dichloroquinoline (2933.49.08) from Ecuador. Note 40(c) lists {cnt['p40']} Chapter 29 lines for "
    f"Section 232. Note 20: {cnt['l3']} lines on List 3 (20(f)), 8 under 20(g), {cnt['l4a']} on List 4A (20(s)); exclusions in 20(vvv)(iii) for sodium "
    "adipate and NBPT run to November 9, 2026. Note 51(b)(3) lists four Chapter 29 provisions for Canada; note 30(b) lists "
    f"{cnt['ru30']} lines for Russia. The ended reciprocal tariff and Section 122 surcharge exempted about 508 lines (note 2(v)(iii)(a), 9903.03.03)."
)
used_ia = set()
for c in ia["countries"]:
    used_ia.update(c["rule"]["sourceIds"])

# =================================================================== TARIFF ENGINEERING / FAQ
fill29_engineering.apply(d, L, cnt, F, ECFR_AS_OF, AS_OF)
fill29_faq.apply(d, L, cnt, F, AS_OF, YR, BYC, HC)

# =================================================================== SOURCES
ids = set()
for e in tu["inEffect"]:
    ids.update(e["sourceIds"])
for c in tu["changes"]:
    ids.update(c["sourceIds"])
gen_sources = {s["id"]: s for s in tu["sources"]}
merged = {}
for i in sorted(ids):
    if i in S:
        merged[i] = S[i]
    elif i in gen_sources:
        merged[i] = gen_sources[i]
    else:
        raise KeyError(f"source {i} not defined")
order = ["hts-now", "hts-now-cr", "hts-before", "hts-chapter-99", "hts-2026-rev11"]
tu["sources"] = [merged[i] for i in order if i in merged] + sorted((v for k, v in merged.items() if k not in order), key=lambda s: s["published"], reverse=True)
ia_ids = set(used_ia) | {"hts-now"}
for i in ia_ids:
    if i not in S and i not in gen_sources:
        raise KeyError(f"industryAreas source {i} not defined")
ia["sources"] = [S.get(i) or gen_sources[i] for i in sorted(ia_ids)]

d["sources"] = [
    {"label": "Harmonized Tariff Schedule of the United States", "url": "https://hts.usitc.gov/", "note": "rate table rows, chapter notes and Chapter 99 (2026 Revision 21)"},
    {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": f"{YR} import figures"},
    {"label": "Federal Register", "url": "https://www.federalregister.gov/", "note": "proclamations, executive orders, USTR and Commerce notices"},
    {"label": "Electronic Code of Federal Regulations", "url": "https://www.ecfr.gov/", "note": f"entry rules (up to date as of {ECFR_AS_OF})"},
]

# =================================================================== write
txt = json.dumps(d, ensure_ascii=False, indent=2)
assert "TODO" not in txt, re.findall(r".{60}TODO.{40}", txt)[:5]
open(out_path, "w").write(txt + "\n")
subprocess.run(["npx", "prettier", "--config", os.path.join(WT, ".prettierrc"), "--write", out_path], cwd=WT, check=True)
print("wrote", out_path)
