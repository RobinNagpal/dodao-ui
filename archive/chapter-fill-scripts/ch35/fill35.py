"""Fill the writer TODOs of the generated Chapter 35 content file.

usage: python3 fill35.py <generated.json> <out.json>
Re-runnable: regenerate with pnpm tariff:generate-chapter (run.sh in this folder does both) and run again.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from fill35_static import AS_OF, CH35, CH99, ECFR, ECFR_AS_OF, EXTRA_SOURCES, GN, HTS_NOW, RULING, SUGGEST_DATE  # noqa: E402

TRADE = "/Users/robin/projects/worktrees/chapter-migration-1810-batch2/insights-ui/src/tariff-data/trade/chapter-35.json"

d = json.load(open(sys.argv[1]))
trade = json.load(open(TRADE))


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


# ---------------------------------------------------------------- trade figures used in prose
YR, PYR = trade["latestYear"], trade["priorYear"]
tot = {y["year"]: y["totalUsd"] for y in trade["totalsByYear"]}
T, P = tot[YR], tot[PYR]
byc = {c["country"]: c for c in trade["byCountry"]}
hc = {(r["country"], r["heading"]): r["importsUsd"] for r in trade["byHeadingCountry"]}
head = {h["heading"]: h["byYear"][str(YR)] for h in trade["byHeading"]}
headp = {h["heading"]: h["byYear"][str(PYR)] for h in trade["byHeading"]}
hs6 = {l["hs6"]: l for l in trade["byHs6"]}
peak = max(tot.items(), key=lambda kv: kv[1])
imp = lambda c: byc[c]["importsUsd"]  # noqa: E731
S = dict(
    T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", peak_y=peak[0], peak=b(peak[1]),
    dk=b(imp("Denmark")), cn=b(imp("China")), de=b(imp("Germany")), nz=b(imp("New Zealand")), br=b(imp("Brazil")), ca=b(imp("Canada")),
    fr=b(imp("France")), jp=b(imp("Japan")), ie=b(imp("Ireland")), mx=b(imp("Mexico")), au=b(imp("Australia")),
    dk_enz=b(hc[("Denmark", "3507")]), nz_cas=b(hc[("New Zealand", "3501")]), nz_alb=b(hc[("New Zealand", "3502")]),
    br_prot=b(hc[("Brazil", "3504")]), br_gel=b(hc[("Brazil", "3503")]), cn_prot=b(hc[("China", "3504")]), de_glue=b(hc[("Germany", "3506")]),
    ca_prot=b(hc[("Canada", "3504")]), ca_glue=b(hc[("Canada", "3506")]), mx_glue=b(hc[("Mexico", "3506")]), au_starch=b(hc[("Australia", "3505")]),
    cn_starch=b(hc[("China", "3505")]),
    enz=b(head["3507"]), prot=b(head["3504"]), glue=b(head["3506"]), cas=b(head["3501"]), starch=b(head["3505"]), gel=b(head["3503"]), alb=b(head["3502"]),
    gel_p=b(headp["3503"]), alb_p=b(headp["3502"]), wpc=b(hs6["350220"]["importsUsd"]), wpc_p=b(hs6["350220"]["priorImportsUsd"]),
    enz_share=f"{head['3507'] / T * 100:.0f}%", nparts=next(y["partnerCount"] for y in trade["totalsByYear"] if y["year"] == YR),
)
CA_338 = sum(hc.get(("Canada", h), 0) for h in ("3501", "3502", "3503", "3504", "3505"))
S["ca_338_heads"] = b(CA_338)
print({k: v for k, v in S.items()})

# ---------------------------------------------------------------- chapter + overview
d["chapter"]["title"] = "Albuminoidal substances; modified starches; glues; enzymes"
o = d["overview"]
o["h1"] = "HTS Chapter 35: Albuminoidal Substances, Modified Starches, Glues & Enzymes — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 35 Tariff Rates 2026 — Casein, Whey Protein, Gelatin, Collagen, Glues & Enzymes Import Duty | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 33 HTS Chapter 35 lines — casein, caseinates, whey protein isolate, egg albumin, gelatin, collagen and pea protein, modified starches, glues and adhesives, enzymes — with the 2026 Section 301, Section 338 (Canada) and China duties by country.",
    "keywords": [
        "HTS Chapter 35",
        "hts chapter 35 import duty rates",
        "albuminoidal substances; modified starches; glues; enzymes tariff",
        "gelatin hs code",
        "collagen hs code",
        "casein hs code",
        "whey protein hs code",
        "hs code for glue",
        "enzyme hs code",
        "modified starch hs code",
    ],
}
o["intro"] = (
    "Chapter 35 covers protein and starch-based industrial and food ingredients: casein, caseinates and milk protein concentrate (3501), egg albumin "
    "and whey protein isolates (3502), gelatin and animal glues (3503), peptones and other proteins such as collagen and pea protein (3504), dextrins "
    "and modified starches (3505), prepared glues and adhesives (3506) and enzymes (3507). The U.S. imported **"
    f"{S['T']}** of them in {YR}; enzymes were the largest product ({S['enz']}), led by Denmark.\n\n"
    "Base rates are low — **8 of the 33 lines are Free**, most others are 2–6% or a few cents per kilogram — so the **extra duties decide the cost**. "
    "No Chapter 35 line is on the exemption lists of the 2026 Section 301 tariffs: EU goods pay 10% in total, Japan and South Korea 12.5% in total, "
    "New Zealand, Australia and most other suppliers +10% or +12.5%, Brazil +37.5%, and China +20% or +37.5%. Canadian casein, whey protein, "
    "gelatin, protein isolates and modified starches pay a **50% Section 338 duty even when they qualify for USMCA**. Pea protein from China and "
    "hard gelatin capsules from four countries also carry antidumping and countervailing duties, which are not in the tariff calculator."
)
GROUPS = {
    "3501": dict(
        label="Casein, caseinates & casein glues", short="Casein",
        blurb="Casein, milk protein concentrate (3501.10.10), caseinates and casein glues: 4 lines — casein Free, MPC and caseinates 0.37¢/kg, casein glue 6%. All four subheadings are on Canada's 50% Section 338 dairy list.",
        examples=["casein", "rennet casein", "acid casein", "sodium caseinate", "calcium caseinate", "milk protein concentrate", "MPC"],
    ),
    "3502": dict(
        label="Albumins: egg white & whey protein isolate", short="Albumins / whey",
        blurb="Egg albumin (dried 47.6¢/kg, other 9.7¢/kg), milk albumin and whey protein concentrates of more than 80% whey protein (Free), and other albumins (Free): 4 lines.",
        examples=["whey protein isolate", "whey protein concentrate 80", "egg albumin", "egg white powder", "milk albumin", "lactalbumin"],
    ),
    "3503": dict(
        label="Gelatin & animal glue", short="Gelatin",
        blurb="Edible, photographic and other gelatin (2.8¢/kg + 3.8%), inedible gelatin and animal glue (1.2¢/kg + 3.2% or 2.8¢/kg + 3.8% by value), fish glue and isinglass: 6 lines.",
        examples=["gelatin", "edible gelatin", "bovine gelatin", "gelatin powder", "fish gelatin", "animal glue", "isinglass"],
    ),
    "3504": dict(
        label="Peptones & other proteins (collagen, pea protein)", short="Proteins",
        blurb="Protein isolates (5%) and other protein substances (4%) — including collagen and collagen peptides, pea protein, peptones and hide powder: 4 lines. Pea protein from China is under antidumping and countervailing duty orders.",
        examples=["collagen peptides", "hydrolyzed collagen", "pea protein isolate", "protein isolate", "peptone", "hide powder"],
    ),
    "3505": dict(
        label="Dextrins, modified starches & starch glues", short="Modified starch",
        blurb="Dextrins and modified starches — pregelatinized, esterified, etherified; corn, potato, tapioca — at 0.7¢/kg, and starch- or dextrin-based glues at 2.1¢/kg + 2.9%: 6 lines.",
        examples=["modified starch", "modified corn starch", "modified tapioca starch", "pregelatinized starch", "dextrin", "starch glue"],
    ),
    "3506": dict(
        label="Prepared glues & adhesives", short="Glues / adhesives",
        blurb="Retail glues of up to 1 kg (animal glue 6.5%, other 2.1%), polymer- and rubber-based adhesives (2.1%; optically clear adhesives Free) and other prepared adhesives (2.1%): 5 lines.",
        examples=["glue", "super glue", "glue stick", "hot melt adhesive", "epoxy adhesive", "optically clear adhesive"],
    ),
    "3507": dict(
        label="Enzymes", short="Enzymes",
        blurb="Rennet, penicillin G amidase and other enzymes and enzyme preparations — proteases, amylases, lipases, cellulases and others: 4 lines, all Free under the general rate.",
        examples=["enzymes", "rennet", "protease", "amylase", "lipase", "cellulase", "enzyme preparation"],
    ),
}
for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["blurb"] = G["blurb"]
    g["searchExamples"] = G["examples"]

for st in o["stats"]:
    if st["label"].startswith("Lines with an extra duty"):
        st["note"] = "Section 301 (2026): all 33; China lists: all 33; Brazil: all 33; Canada Section 338: 21, USMCA goods included"
    if st["label"].endswith("share") and "+" in st["label"]:
        st["label"] = "Denmark + China share"

o["workedExamples"] = [
    {
        "title": "20 t of whey protein isolate from New Zealand",
        "line": "3502.20.00.00",
        "body": "Whey protein concentrates of more than 80% whey protein (dry basis) are **Free** under the general rate, but New Zealand is one of the 60 economies in the 2026 Section 301 action, so the shipment pays **+12.5%** (9903.05.57). On a $300,000 entry that is **$37,500**. No Chapter 35 line is on the note 52(b) exemption list, and the United States has no trade agreement with New Zealand that changes this.",
    },
    {
        "title": "Rennet casein from Canada, USMCA-qualifying",
        "line": "3501.10.50.00",
        "body": "Casein is Free under the general rate and a USMCA claim removes Canada's 10% Section 301 duty (9903.05.93). But casein is on the **Section 338 dairy list** (U.S. note 51(b)(2), 9903.03.13), and that 50% applies **whether or not** the goods qualify for USMCA. A $100,000 entry pays **$50,000**; without a USMCA claim it pays $60,000 (50% + 10%).",
    },
    {
        "title": "Pea protein isolate from China",
        "line": "3504.00.10.00",
        "body": "Protein isolates pay **5%** general, plus **7.5%** Section 301 List 4A (9903.88.15) and **12.5%** 2026 Section 301 (9903.05.31) — **25%** in tariffs. On top, high-protein pea protein is under **antidumping and countervailing duty orders** (89 FR 68390): the China-wide antidumping cash deposit is 269.77% and the all-others countervailing rate 15.84%, unless the exporter has its own rate. The calculator shows only the 25%.",
    },
    {
        "title": "Industrial enzymes from Denmark",
        "line": "3507.90.70.10",
        "body": "Enzymes are **Free** under the general rate. EU goods pay the 2026 Section 301 rate as a floor: 10% replaces any lower base rate (U.S. note 52, 9903.05.39), so the total is **10%** — $10,000 on a $100,000 entry. If the enzymes are for pharmaceutical use, note 52(e) exempts them (9903.05.89) and the duty is $0.",
    },
]
o["tradeSnapshot"]["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
o["tradeSnapshot"]["biggestLines"] = [{"hts": "3507.90", "label": "Enzymes other than rennet"}, {"hts": "3504.00", "label": "Peptones and other proteins (collagen, pea protein)"}]
o["notes"] = {
    "chapterNotes": (
        "**Note 1.** This chapter does not cover: (a) yeasts (heading 2102); (b) blood fractions (other than blood albumin not prepared for therapeutic or "
        "prophylactic uses), medicaments or other products of chapter 30; (c) enzymatic preparations for pre-tanning (heading 3202); (d) enzymatic soaking or "
        "washing preparations or other products of chapter 34; (e) hardened proteins (heading 3913); or (f) gelatin products of the printing industry (chapter 49).\n\n"
        "**Note 2.** For the purposes of heading 3505, the term \"dextrins\" means starch degradation products with a reducing sugar content, expressed as "
        "dextrose on the dry substance, not exceeding 10 percent. Such products with a reducing sugar content exceeding 10 percent fall in heading 1702."
    ),
    "additionalUsNotes": (
        "**Additional U.S. note 1.** For the purposes of subheading 3501.10.10, \"milk protein concentrate\" means any complete milk protein (casein plus "
        "lactalbumin) concentrate."
    ),
}

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 35: Albuminoidal Substances, Modified Starches, Glues & Enzymes — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 35 Tariff Updates 2026 — Casein, Whey, Gelatin, Glue & Enzyme Duties Since 2025 | KoalaGains",
    "shortDescription": "What changed for HTS Chapter 35 imports since January 2025: the IEEPA duties and their end, the Section 122 surcharge, the 2026 Section 301 tariffs on 60 economies and Brazil, Canada's 50% Section 338 duty on casein, whey and gelatin, China's Section 301 lists and the pea protein and capsule AD/CVD orders — with Federal Register citations.",
    "keywords": [
        "hts chapter 35 tariff updates",
        "hts chapter 35 import duty rates",
        "canada section 338 dairy tariff casein",
        "usmca casein import duty",
        "china section 301 enzymes",
        "section 122 tariff enzymes",
        "pea protein antidumping china",
        "gelatin capsules antidumping",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** "
    "(in force October 9, 2026). **No Chapter 35 base rate changed**; five statistical lines were added (pea protein, organic and other; other proteins; and a split of "
    "other enzymes).\n\n"
    "The extra duties changed a lot. In 2025 non-USMCA goods from Canada and Mexico paid IEEPA duties, Chinese goods paid IEEPA duties on top of the "
    "older Section 301 lists, and every other country paid the reciprocal tariff — no Chapter 35 line was exempt. All IEEPA duties **ended on February 24, 2026**, "
    "and a 10% Section 122 surcharge applied until July 23, 2026. Since **July 24, 2026** the **2026 Section 301 tariffs** reach all 33 lines from 60 economies "
    "(only enzymes for pharmaceutical use are exempt), Brazil pays 37.5%, and since **August 22, 2026** Canada's casein, whey protein, gelatin, protein "
    "isolates and modified starches pay a **50% Section 338 duty**, USMCA or not.\n\n"
    "Antidumping and countervailing duties on **pea protein from China** and on **hard empty capsules** (which may be entered as gelatin) are listed "
    "for reference; they are company-specific and **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 35 from any country — the 2026 Section 301 action on 60 economies and on Brazil, Canada's Section 338 duties, "
    "China's Section 301 lists 3 and 4A, the Russia-only Section 232 aluminum and column 2 measures, and the ended IEEPA, Section 122 and Section 232 "
    "derivative duties — plus the antidumping and countervailing duty orders that cover Chapter 35 goods, which the tariff calculator does not model. "
    "For the total each supplier pays, see Rates by country."
)

S301_EX = (
    "No Chapter 35 subheading is on the general exemption list in U.S. note 52(b). Enzymes of 3507.90.70 for use in pharmaceutical applications are exempt "
    "under note 52(e) (9903.05.89)."
)
IEEPA_END = "The IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
INEFFECT = {
    "eu-section-301": (
        "EU goods (Denmark, Germany, France, Ireland, the Netherlands, Belgium and the other member states) pay the 2026 Section 301 rate as a floor: 10% "
        "in total, replacing any lower base rate (U.S. note 52). " + S301_EX + " " + IEEPA_END,
        "Every Chapter 35 line from the EU pays 10% of its value, unless its base rate works out higher (only the per-kilogram rates on low-value goods can). $100,000 of Danish enzymes or German adhesives pays $10,000.",
        ["eo-14389"],
    ),
    "cn-section-301": (
        "Two older China lists stack with the 12.5% 2026 Section 301 duty: List 3 (+25%, note 20(f), 9903.88.03) covers dried egg albumin, other albumins, "
        "prepared glues and adhesives and enzymes — 10 subheadings; List 4A (+7.5%, note 20(s), 9903.88.15) covers casein, caseinates, other egg albumin, "
        "whey protein, gelatin, protein isolates and other proteins, modified starches and starch glues — 14 subheadings. No product exclusion is in effect "
        "for the chapter; USTR confirmed on October 7, 2026 that the 2018–2019 actions continue during their four-year review. " + S301_EX + " "
        "The IEEPA duties on China ended February 24, 2026. Pea protein also carries antidumping and countervailing duties, not shown here.",
        "Chinese goods pay the base rate plus 20% (List 4A lines) or 37.5% (List 3 lines). $100,000 of Chinese adhesives at 2.1% pays $39,600; $100,000 of modified starch pays $20,000 plus 0.7¢/kg.",
        ["fr-2024-19071", "eo-14389"],
    ),
    "nz-section-301": (
        S301_EX + " The United States has no free trade agreement with New Zealand, so the base rate applies too. " + IEEPA_END,
        "New Zealand casein, milk protein concentrate and whey protein pay the base rate plus 12.5%: $300,000 of whey protein isolate (Free) pays $37,500.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Two Section 301 actions stack: 25% on all products of Brazil (9903.05.01, note 50) and the 12.5% 2026 forced-labor duty (9903.05.27). No Chapter 35 "
        "subheading is on the Brazil exemption list (note 50(a)(ii)) or the note 52(b) list; enzymes of 3507.90.70 for pharmaceutical use are exempt from "
        "both (notes 50(a)(v) and 52(e)). " + IEEPA_END,
        "Brazilian collagen, gelatin and other proteins pay the base rate plus 37.5%: $100,000 of collagen peptides (3504.00.50, 4%) pays $41,500.",
        ["eo-14389"],
    ),
    "ca-section-301": (
        "Section 338 (Proclamations 11047 and 11048, in effect August 22, 2026) adds 50% on 13 subheadings, and note 51 applies it to USMCA-qualifying goods "
        "too: the dairy list (note 51(b)(2), 9903.03.13) has casein, milk protein concentrate, caseinates, casein glues, milk albumin and whey protein "
        "concentrates (3502.20) and other proteins (3504.00.50); the second list (note 51(b)(3), 9903.03.14) has egg albumin (3502.11), other albumins (3502.90), "
        "gelatin (3503.00.40, 3503.00.55), protein isolates (3504.00.10), modified starches (3505.10) and starch glues (3505.20). The 10% Section 301 duty "
        "(9903.05.29) applies only to non-USMCA goods (relief 9903.05.93). No Chapter 35 product is on the September 29, 2026 import-ban lists. "
        "The IEEPA duty (35% from August 1, 2025) ended February 24, 2026.",
        "USMCA-qualifying Canadian casein, whey protein, gelatin or modified starch pays 50% of its value; other Canadian Chapter 35 goods pay nothing with a "
        "USMCA claim. Without one, add the base rate and 10%.",
        ["procl-11062", "eo-14389", "ustr-usmca-review"],
    ),
    "jp-section-301": (
        "Japan pays the 2026 Section 301 rate as a floor: 12.5% in total, replacing any lower base rate (note 52). " + S301_EX + " " + IEEPA_END,
        "Every Chapter 35 line from Japan pays 12.5% of its value, unless its base rate works out higher.",
        ["eo-14389"],
    ),
    "gb-section-301": (
        S301_EX + " The UK rate is added to the base rate. The aluminum derivative duty on four adhesive lines ended for UK goods on April 6, 2026. " + IEEPA_END,
        "UK goods pay the base rate plus 10%: $100,000 of whey protein isolate (Free) pays $10,000.",
        ["eo-14389", "procl-11021"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods are exempt (9903.05.94). " + S301_EX + " Mexico is not covered by Canada's Section 338 duties. The IEEPA duty on non-USMCA Mexican goods (25%) ended February 24, 2026.",
        "USMCA-qualifying Mexican adhesives and other Chapter 35 goods enter Free; without a USMCA claim they pay the base rate plus 10%.",
        ["eo-14389", "ustr-usmca-review"],
    ),
    "au-section-301": (
        "The 12.5% applies even when the Australia FTA rate (AU, Free on every dutiable line) is claimed (note 52(a)). " + S301_EX + " " + IEEPA_END,
        "Australian modified starch, protein and casein pay 12.5% of their value with an AU claim (the base rate is removed, the 12.5% is not).",
        ["eo-14389"],
    ),
    "kr-section-301": (
        "South Korea pays the 2026 Section 301 rate as a floor: 12.5% in total, replacing any lower base rate, with or without a KORUS claim (note 52). " + S301_EX + " " + IEEPA_END,
        "Every Chapter 35 line from South Korea pays 12.5% of its value.",
        ["eo-14389"],
    ),
    "ru-section-301": (
        "Russia pays column 2 rates (for example 30.5% on other proteins and 20% on most adhesives). Under Proclamation 10420, three subheadings — rubber- and polymer-based adhesives "
        "(3506.91.50), other adhesives (3506.99) and other enzymes (3507.90.70) — pay 35% in place of column 2 (note 30, 9903.90.08). Four adhesive "
        "subheadings (3506.10.50, 3506.91.10, 3506.91.50, 3506.99) are on the note 19(k) aluminum derivative list and pay +200% (9903.85.68). "
        "The 12.5% 2026 Section 301 duty (9903.05.66) is added to all of them.",
        "Russian Chapter 35 goods pay column 2 plus 12.5%; Russian adhesives can pay more than 200%.",
        [],
    ),
    "other-section-301": (
        S301_EX + " Countries outside the 60 economies pay only the base rate. " + IEEPA_END,
        "Most other suppliers — Thailand, India, Argentina, Switzerland, Vietnam, Israel and others — pay the base rate plus 10% or 12.5%; Switzerland and Taiwan, like the EU, pay it as a floor.",
        ["eo-14389"],
    ),
}
for x in tu["inEffect"]:
    ex, wim, extra = INEFFECT[x["id"]]
    x["exemption"] = ex
    x["whatItMeans"] = wim
    for sid in extra:
        if sid not in x["sourceIds"]:
            x["sourceIds"].insert(len(x["sourceIds"]) - 1, sid)
    if x["id"] == "cn-section-301":
        x["measure"] = "Section 301: 2026 action on 60 economies + China lists 3 and 4A (2018–2019)"
    if x["id"] == "ca-section-301":
        x["measure"] = "Section 338 (Canada) + Section 301 (2026, 60 economies)"
        x["now"] = "+50% (13 subheadings, USMCA or not); +10% more without USMCA"
    if x["id"] == "ru-section-301":
        x["measure"] = "Column 2 + Section 301 (2026) + Section 232 aluminum (Russia) + Proclamation 10420"
        x["now"] = "+12.5%; 35% in place of column 2 on 3 subheadings; +200% on 4 adhesive subheadings"
        x["before"] = "Column 2; 35% in place of column 2 on 3 subheadings"
    if x["id"] == "other-section-301":
        x["now"] = "+10% or +12.5% (10% or 12.5% in total for Switzerland and Taiwan)"

have = {s["id"] for s in tu["sources"]}
for s in EXTRA_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])

base = [c for c in tu["changes"] if c["type"] == "baseRate"]
for c in base:
    c["title"] = "No Chapter 35 base-rate changes"
    c["detail"] = (
        "All 28 lines that exist in both editions carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition. "
        "Five statistical lines are new and take their 8-digit parent's rate: pea protein, certified organic and other (3504.00.50.10, .50.50), other "
        "proteins (3504.00.50.80), and a split of other enzymes into proteases, amylases, lipases, cellulases, pectinases, oxidases and catalases "
        "(3507.90.70.10) and others (3507.90.70.80)."
    )
pending_gen = [c for c in tu["changes"] if c["type"] == "pending"]
for c in pending_gen:
    c["title"] = "Scheduled: Section 301 tariff on products of Nicaragua"
    c["detail"] = (
        "Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January 1, 2027 "
        "and +15% from January 1, 2028. CAFTA-DR originating goods are not covered (U.S. note 29). Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58)."
    )


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


changes = base + pending_gen + [
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018–2019 China actions, so they did not terminate on their anniversaries and remain in effect pending the statutory review. The 25% List 3 and 7.5% List 4A duties on Chinese Chapter 35 goods continue.",
       None, None, "China", ["fr-2026-20510"]),
    ch("pea-reviews-2026", "reference", "2026-10-01", "Published", "New administrative reviews of the pea protein orders begin",
       "Commerce initiated reviews of the antidumping order (August 1, 2025–July 31, 2026) and the countervailing duty order (calendar 2025) on pea protein from China. Cash-deposit rates change only when a review's final results are published.",
       None, None, "China", ["fr-2026-20160"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canada import bans do not reach Chapter 35",
       "From September 29, 2026 certain Canadian dairy products, alcoholic beverages and motorcycles moved from the 50% Section 338 duty to an import ban. No Chapter 35 line is on the ban lists: Canadian casein, caseinates and whey protein stay at 50%.",
       None, None, "Canada", ["procl-11062", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duties cover 13 Chapter 35 subheadings",
       "50% on products of Canada took effect after a 3-day suspension lapsed. The dairy list (note 51(b)(2), 9903.03.13) covers casein, milk protein concentrate, caseinates, casein glues, whey protein concentrates (3502.20) and other proteins (3504.00.50); the 9903.03.14 list (note 51(b)(3)) covers egg albumin (3502.11), other albumins, gelatin (3503.00.40, 3503.00.55), protein isolates, modified starches and starch glues. The duty applies to USMCA-qualifying goods too.",
       None, "+50%", "Canada", ["procl-11047", "procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99"]),
    ch("section-301-2026-60-economies-2026-07-24", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies cover all of Chapter 35",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 35 subheading is on the general exemption list (note 52(b)); only enzymes of 3507.90.70 for pharmaceutical use are exempt (note 52(e)). EU goods pay 10% in total; Japan, South Korea and Switzerland 12.5% in total; Taiwan 10% in total. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).",
       None, "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", "None", "All", ["procl-11012", "hts-now"]),
    ch("section-301-brazil-2026-07-22", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). No Chapter 35 subheading is on the exemption list (note 50(a)(ii)); enzymes of 3507.90.70 for pharmaceutical use are exempt (note 50(a)(v), 9903.05.06). From July 24 the 12.5% forced-labor duty (9903.05.27) is added on top, for 37.5% in all.",
       None, "+25% (+37.5% from July 24)", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("s232-derivatives-end", "extraDuty", "2026-04-06", "Effective", "Section 232 derivative duty on four adhesive lines ends",
       "Proclamation 11021 replaced the aluminum and steel derivative lists; the new lists (note 16(c)) include no Chapter 35 line, so adhesives of 3506.10.50, 3506.91.10, 3506.91.50 and 3506.99 stopped paying the Section 232 duty. Russian-origin aluminum derivatives still pay 200% (9903.85.68).",
       "+50% on metal content", "None (Russia +200%)", "All except Russia", ["procl-11021", "hts-chapter-99"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 35 line was on the product exemption list (9903.03.03); USMCA-qualifying goods from Canada and Mexico were exempt.",
       None, "+10%", "All", ["procl-11012", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("capsules-orders", "reference", "2026-02-23", "Published", "Antidumping and countervailing duties on hard empty capsules",
       "Commerce issued orders on hard empty capsules from Brazil, China, India and Vietnam. They are classifiable in 9602.00.10.40 and 9602.00.50.10, but Commerce notes that gelatin capsules may be entered under 3503.00.55.10 — the orders apply either way. Antidumping rates: Brazil 77.63%, China 18.71%, India 11.70% (all-others cash deposit), Vietnam 46.24%; countervailing all-others rates 10.67%, 6.90%, 7.06% and 2.45%.",
       None, None, "Brazil, China, India, Vietnam", ["fr-2026-03484", "fr-2026-03485"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Announced", "AGOA reauthorized through December 31, 2026",
       "AGOA (SPI D) makes most dutiable Chapter 35 lines Free for eligible sub-Saharan countries. GSP (SPI A, A*, A+) remains expired since December 31, 2020.",
       None, None, "Sub-Saharan Africa", ["ustr-agoa-2026", "cbp-gsp"]),
    ch("s232-derivatives", "extraDuty", "2025-08-18", "Effective", "Section 232 derivative duty reaches four adhesive lines",
       "Commerce added 3506.10.50 (retail glues other than animal glue), 3506.91.10, 3506.91.50 (polymer and rubber adhesives) and 3506.99 to the steel and aluminum derivative lists, so their steel and aluminum content paid the 50% Section 232 duty (9903.81.91, 9903.85.08), and Russian aluminum content 200% (9903.85.68).",
       "None", "+50% on metal content", "All", ["fr-2025-15819", "procl-10522"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx) from April 5, 2025; Canada and Mexico excluded. No Chapter 35 line was on the Annex II exemption list, and the November 2025 agricultural exemptions did not cover the chapter. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("usmca-exempt", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.",
       "+25%", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("ca-mx-cn-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada, Mexico and China",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025, and an additional duty on goods of China (9903.01.20) from February 4, 2025 — including all Chapter 35 goods. Ended February 24, 2026.",
       "None", "+25% (Canada, Mexico); +10% (China) (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195"]),
    ch("pea-orders", "reference", "2024-08-26", "Published", "Antidumping and countervailing duty orders on pea protein from China",
       "Orders on high-protein pea protein (at least 65% protein, dry weight) from China, classified in 3504.00.10 and 3504.00.50 (and 2106.10). The antidumping cash deposit is 269.77% for the China-wide entity and 111.65% for the separate-rate exporters; the countervailing rate is 15.84% for all others (15.15%–16.52% for the examined companies, 355.89% for non-cooperating ones). The first countervailing review was rescinded on April 9, 2026, so these rates still apply.",
       None, None, "China", ["fr-2024-19071", "fr-2026-06857"]),
]
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "28 of 28 lines", "note": "Plus 5 new statistical lines"},
    {"label": "Extra duties in effect", "value": "12", "note": "Section 301 (60 economies, Brazil, China lists), Section 338 (Canada), Russia measures"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]
missing = used - {s["id"] for s in tu["sources"]}
assert not missing, missing

# ---------------------------------------------------------------- understandIndustry
u = d["understandIndustry"]
u["h1"] = "HTS Chapter 35: Albuminoidal Substances, Modified Starches, Glues & Enzymes — U.S. Import Statistics"
u["seo"] = {
    "title": "U.S. Imports of Enzymes, Casein, Whey Protein, Gelatin & Adhesives by Country (HTS Ch. 35) | KoalaGains",
    "shortDescription": f"Where U.S. Chapter 35 imports come from, 2020–{YR}: {S['T']} in {YR} — enzymes from Denmark, casein and whey protein from New Zealand and Ireland, collagen and gelatin from Brazil, adhesives from Germany and Mexico. By country, product and year, from UN Comtrade.",
    "keywords": [
        "hts chapter 35 import statistics",
        "us enzyme imports by country",
        "us casein imports new zealand",
        "us gelatin imports",
        "us adhesive imports",
        "us whey protein isolate imports",
    ],
}
for st in u["stats"]:
    if st["label"].startswith("Top 2 share"):
        st["label"] = "Denmark + China share"
    if st["label"] == "Largest product":
        st["note"] = "Enzymes other than rennet (3507.90)"
u["byYearCaption"] = f"U.S. imports of Chapter 35 goods each year, split into the two largest suppliers in {YR} (Denmark and China) and everyone else."
u["why"] = (
    f"U.S. imports of Chapter 35 goods were **{S['T']} in {YR}**, down {S['chg'].lstrip('-')} from {S['P']} in {PYR} and below the {S['peak_y']} peak of {S['peak']}. "
    f"No single supplier dominates: {S['nparts']} countries shipped, and the top two — **Denmark** ({S['dk']}) and **China** ({S['cn']}) — had about a fifth of the total.\n\n"
    f"Each product has its own supply base. **Enzymes** ({S['enz']}, {S['enz_share']} of the chapter) come mainly from Denmark ({S['dk_enz']}), Japan, Germany, "
    f"Finland and France. **Casein and caseinates** ({S['cas']}) come from New Zealand ({S['nz_cas']}), Ireland, Denmark and France; **whey protein isolates** "
    f"(milk albumin, {S['wpc']}, up from {S['wpc_p']}) and other albumins mainly from Denmark, New Zealand and the UK. **Other proteins** — collagen, pea protein, peptones — ({S['prot']}) come from Brazil ({S['br_prot']}), "
    f"China ({S['cn_prot']}) and Canada ({S['ca_prot']}). **Adhesives** ({S['glue']}) come from Germany ({S['de_glue']}), Mexico ({S['mx_glue']}) and Canada; "
    f"**modified starches** ({S['starch']}) from China, Thailand and Australia; **gelatin** ({S['gel']}, down from {S['gel_p']}) from Brazil, Canada, China, France and Argentina.\n\n"
    f"The duty picture changed only after these figures: since July and August 2026 nearly all of these suppliers pay the 2026 Section 301 tariffs, Brazil 37.5%, "
    f"and most of Canada's casein, albumin, gelatin, protein and starch trade (headings 3501–3505, {S['ca_338_heads']} in {YR}) is on the 50% Section 338 lists. "
    f"{YR} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
)
u["sources"] = u["sources"] + [
    {"label": "Federal Register 91 FR 47318 (2026 Section 301 actions on 60 economies, July 28, 2026)", "url": "https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies"},
    {"label": "HTSUS 2026 Revision 21, Chapter 99 (U.S. note 51, Section 338 lists)", "url": CH99},
]

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 35: Albuminoidal Substances, Modified Starches, Glues & Enzymes — Tariff Rates by Country"
ia["seo"] = {
    "title": "Chapter 35 Tariffs by Country — Casein, Whey, Gelatin, Enzymes & Glue from Denmark, China, New Zealand, Canada (HTS Ch. 35) | KoalaGains",
    "shortDescription": "The total U.S. tariff on HTS Chapter 35 goods by country and product group: 10% in total for the EU, 12.5% for Japan and Korea, +12.5% for New Zealand and Australia, +37.5% for Brazil, +20% or +37.5% for China, and 50% on Canadian casein, whey and gelatin even under USMCA.",
    "keywords": [
        "new zealand casein tariff",
        "denmark enzymes tariff",
        "canada tariff on casein",
        "china tariff on enzymes",
        "brazil collagen tariff",
        "hts chapter 35 tariff by country",
    ],
}
ia["intro"] = (
    "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
    "In Chapter 35 the **extra duty is usually larger than the base rate**: no line is on the 2026 Section 301 exemption lists, so the EU pays 10% in total, "
    "Japan and South Korea 12.5% in total, New Zealand, Australia and the UK the base rate plus 10% or 12.5%, Brazil plus 37.5%, and China plus 20% or 37.5%.\n\n"
    "**Canada** is the exception to the USMCA rule: casein, caseinates, whey protein, egg albumin, gelatin, protein isolates and modified starches pay **50% "
    "under Section 338 even with a USMCA claim**; Canadian adhesives and enzymes are Free with one. Mexican goods are Free with USMCA. The table does **not** "
    "include antidumping or countervailing duties (pea protein from China; hard gelatin capsules from Brazil, China, India and Vietnam)."
)
LABEL = {
    "3501": "Casein", "3502": "Albumins / whey", "3503": "Gelatin", "3504": "Proteins", "3505": "Modified starch", "3506": "Glues / adhesives", "3507": "Enzymes",
}
for g in ia["groups"]:
    g["label"] = GROUPS[g["heading"]]["label"]
    g["shortLabel"] = GROUPS[g["heading"]]["short"]
EU = "EU: 10% in total on every line. The 2026 Section 301 rate for EU goods (9903.05.39) replaces any lower base rate (U.S. note 52), and no Chapter 35 subheading is on the note 52(b) exemption list; enzymes for pharmaceutical use are exempt (note 52(e)). The IEEPA duty ended February 24, 2026."
EU_IDS = ["fr-2026-15181", "eo-14389", "hts-chapter-99", "hts-now"]
labels = {
    "Denmark": (EU, EU_IDS), "Germany": (EU, EU_IDS), "France": (EU, EU_IDS), "Ireland": (EU, EU_IDS), "Netherlands": (EU, EU_IDS),
    "China": ("Base rate + 12.5% 2026 Section 301 (9903.05.31) + 7.5% List 4A (9903.88.15) on casein, whey protein, gelatin, proteins and starches, or + 25% List 3 (9903.88.03) on dried egg albumin, other albumins, adhesives and enzymes. No exclusions; the IEEPA duties ended February 24, 2026. Pea protein also carries AD/CVD, not shown.",
              ["fr-2026-15181", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "fr-2024-19071", "hts-now"]),
    "New Zealand": ("Base rate + 12.5% 2026 Section 301 (9903.05.57); no Chapter 35 subheading is on the note 52(b) exemption list and there is no U.S.–New Zealand FTA. The IEEPA duty ended February 24, 2026.",
                    ["fr-2026-15181", "eo-14389", "hts-chapter-99", "hts-now"]),
    "Brazil": ("Base rate + 25% Section 301 (9903.05.01) + 12.5% 2026 Section 301 (9903.05.27). No Chapter 35 subheading is on the Brazil exemption list (note 50(a)(ii)); enzymes for pharmaceutical use are exempt from both (notes 50(a)(v), 52(e)).",
               ["fr-2026-14542", "fr-2026-15181", "hts-chapter-99", "hts-now"]),
    "Canada": ("USMCA-qualifying: no Section 301 duty (9903.05.93), but +50% Section 338 on 13 subheadings regardless of USMCA — casein, caseinates, whey protein and 3504.00.50 proteins (9903.03.13), egg albumin, other albumins, gelatin, protein isolates and modified starches (9903.03.14). Not USMCA: base rate + 10% (9903.05.29) + that 50%. Adhesives and enzymes are outside Section 338.",
               ["procl-11047", "procl-11048", "procl-11056", "csms-69606660", "fr-2026-15181", "hts-chapter-99", "hts-now"]),
    "Japan": ("12.5% in total on every line: the 2026 Section 301 rate for Japan (9903.05.49) replaces any lower base rate (note 52). No Chapter 35 subheading is on the note 52(b) list. The IEEPA duty ended February 24, 2026.",
              ["fr-2026-15181", "eo-14389", "hts-chapter-99", "hts-now"]),
    "South Korea": ("12.5% in total on every line, with or without a KORUS claim: the 2026 Section 301 rate (9903.05.71) replaces any lower base rate (note 52). The IEEPA duty ended February 24, 2026.",
                    ["fr-2026-15181", "eo-14389", "hts-chapter-99", "hts-now"]),
    "United Kingdom": ("Base rate + 10% 2026 Section 301 (9903.05.81); no Chapter 35 subheading is on the note 52(b) list. The Section 232 derivative duty on four adhesive lines ended April 6, 2026; the IEEPA duty February 24, 2026.",
                       ["fr-2026-15181", "procl-11021", "eo-14389", "hts-chapter-99", "hts-now"]),
    "Mexico": ("USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise base rate + 10% 2026 Section 301 (9903.05.55). Mexico is not covered by Canada's Section 338 duties.",
               ["fr-2026-15181", "ustr-usmca-review", "hts-chapter-99", "hts-now"]),
    "Australia": ("The Australia FTA (AU) makes every dutiable line Free, but the 12.5% 2026 Section 301 duty (9903.05.23) applies even when AU is claimed (note 52(a)): 12.5% in total. The IEEPA duty ended February 24, 2026.",
                  ["fr-2026-15181", "eo-14389", "hts-chapter-99", "hts-now"]),
    "Any other country": ("Base rate plus 10% or 12.5% for the other 2026 Section 301 economies — Belgium, Lithuania, Finland, Italy and the other EU states (10% in total), Thailand, India, Argentina, Switzerland, Vietnam and more. Countries outside the 60 economies pay only the base rate. Russia (column 2 country) pays more: see Tariff updates.",
                          ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
}
for c in ia["countries"]:
    c["rule"]["label"], c["rule"]["sourceIds"] = labels[c["country"]]
have = {s["id"] for s in ia["sources"]}
tu_src = {s["id"]: s for s in d["tariffUpdates"]["sources"]}
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in have:
            ia["sources"].append(tu_src[sid])
            have.add(sid)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Canada's Section 338 duty (9903.03.13, 9903.03.14) is applied on both sides of the Canada row, because U.S. note 51(a) applies it to goods eligible for USMCA treatment too.",
    "Antidumping and countervailing duties are not included: pea protein from China (3504.00.10, 3504.00.50; China-wide antidumping cash deposit 269.77%) and hard empty capsules from Brazil, China, India and Vietnam (which may be entered under 3503.00.55.10). Their rates are company-specific.",
    "The pharmaceutical-use exemption for enzymes of 3507.90.70 (notes 52(e) and 50(a)(v)) needs the importer's confirmation and is not applied; where it applies, the 2026 Section 301 and Brazil duties are $0.",
    "Entry rules still apply: food-grade proteins, gelatin, starches and enzymes need FDA prior notice; casein, caseinates and milk albumin from foot-and-mouth disease regions an APHIS permit (9 CFR 94.16); dried egg albumin an FSIS-eligible country (9 CFR 590.910).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 19, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 35 subheading is on the Section 301 "
    "general exemption list (note 52(b)) or the Brazil exemption list (note 50(a)(ii)); 3507.90.70 appears only on the pharmaceutical-use lists (notes 52(e) and "
    "50(a)(v)). Thirteen subheadings are on Canada's Section 338 lists (note 51(b)(2): 3501.10.10, 3501.10.50, 3501.90.20, 3501.90.60, 3502.20, 3504.00.50; "
    "note 51(b)(3): 3502.11, 3502.90, 3503.00.40, 3503.00.55, 3504.00.10, 3505.10, 3505.20) — unchanged from Revision 18 (September 2, 2026) through Revision 21 — and none on "
    "the September 29, 2026 import-ban lists. China List 3 (note 20(f)) has 10 subheadings and List 4A (note 20(s)) 14; no exclusion covers the chapter. "
    "None was on the ended reciprocal-tariff (note 2(v)(iii)) or Section 122 (9903.03.03) exemption lists. Note 19(k) still lists four 3506 adhesive "
    "subheadings for the Russia-only 200% aluminum duty; note 16(c), which since April 6, 2026 sets the other Section 232 derivative duties, lists none."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "HTS Chapter 35: Albuminoidal Substances, Modified Starches, Glues & Enzymes — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Gelatin, Casein, Whey Protein, Enzymes & Adhesives: FDA, APHIS, TSCA Rules & Ways to Lower Duty (HTS Ch. 35) | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 35 line — FDA prior notice and FSVP for food proteins and gelatin, APHIS permits for casein and animal-derived proteins, FSIS for egg albumin, TSCA certification for adhesives and industrial enzymes — the pea protein and capsule AD/CVD orders, and the legal ways to pay less.",
    "keywords": [
        "import gelatin requirements",
        "APHIS casein import permit",
        "FDA prior notice whey protein",
        "TSCA certification adhesives",
        "pea protein antidumping china",
        "duty drawback on industrial adhesives",
        "enzymes pharmaceutical use section 301 exemption",
    ],
}
te["intro"] = (
    "Chapter 35 goods are mostly food and pharmaceutical ingredients or industrial chemicals, so **which agency signs off depends on the use**. Food-grade "
    "casein, whey protein, egg albumin, gelatin, collagen, pea protein, modified food starch and food enzymes are FDA-regulated foods (registration, prior "
    "notice, FSVP); animal-derived ones can also need USDA APHIS clearance, and dried egg albumin USDA FSIS. Adhesives, industrial starches and industrial "
    "enzymes need a TSCA certification.\n\n"
    "With base rates this low, the money is in the **extra duties**: the right origin and USMCA claim, the pharmaceutical-use exemption for enzymes, the right "
    "classification (a binding ruling), staying outside the pea protein and capsule AD/CVD orders, and drawback on goods you export. Each rule and lever "
    "below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF


def cit(label, url):
    return {"label": label, "url": url}


te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on goods from Canada or Mexico",
        "saves": "The 10% Section 301 duty plus the base rate (up to 6.5%, or 47.6¢/kg on dried egg albumin). For Canada it does not remove the 50% Section 338 duty on the 13 listed subheadings.",
        "appliesTo": "All 33 lines, for goods that meet the Chapter 35 rules of origin in General Note 11",
        "document": "A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the invoice or another document, and CBP can ask for it.",
        "caveat": "Canadian casein, caseinates, whey protein, egg albumin, gelatin, protein isolates and modified starches pay 50% under Section 338 even with a USMCA claim (U.S. note 51(a)). The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            cit("19 CFR 182.12", ECFR + "title-19/section-182.12"),
            cit("HTSUS General Note 11 (USMCA)", GN),
            cit("HTSUS Ch. 99, subch. III, U.S. notes 51 and 52", CH99),
            cit("USTR statement on the USMCA joint review (July 1, 2026)", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
        ],
    },
    {
        "id": "fta",
        "title": "Claim another free trade agreement or AGOA",
        "saves": "The base rate — for example 5% on protein isolates, 6.5% on retail animal glue, 47.6¢/kg on dried egg albumin — on goods from Australia, Bahrain, Chile, Colombia, Israel, Jordan, South Korea, Morocco, Oman, Panama, Peru, Singapore, the CAFTA-DR countries and AGOA beneficiaries",
        "appliesTo": "The 25 dutiable lines (the 8 Free lines have no base rate to remove)",
        "document": "The origin proof each agreement requires (a certification or declaration of origin) and records to back it up.",
        "caveat": "An FTA removes the base rate but not the 2026 Section 301 duty, which applies even when a special rate is claimed (U.S. note 52(a)); for South Korea the 12.5% floor applies anyway. AGOA runs through December 31, 2026; GSP (A, A*, A+) has been expired since December 31, 2020.",
        "citations": [
            cit("HTSUS General Notes 3(c) and 8–34", GN),
            cit("HTSUS Ch. 99, subch. III, U.S. note 52(a)", CH99),
            cit("USTR statement on AGOA reauthorization (February 3, 2026)", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"),
        ],
    },
    {
        "id": "pharma-use",
        "title": "Declare enzymes for pharmaceutical use",
        "saves": "The whole 2026 Section 301 duty (10%–12.5%) and, for Brazil, the 25% duty too",
        "appliesTo": "3507.90.70 (other enzymes) for use in pharmaceutical applications",
        "document": "Enter under 9903.05.89 (and 9903.05.06 for Brazil) with records showing the pharmaceutical use, such as the purchaser's drug-manufacturing use and specifications.",
        "caveat": "Only enzymes actually for pharmaceutical applications qualify; industrial and food enzymes pay the duty. It does not remove China's 25% List 3 duty.",
        "citations": [cit("HTSUS Ch. 99, subch. III, U.S. notes 52(e) and 50(a)(v)", CH99)],
    },
    {
        "id": "ruling",
        "title": "Get the classification right — ask CBP for a binding ruling",
        "saves": "The gap between neighboring lines: whey protein isolate (3502.20) is Free, protein isolates 5% (3504.00.10), other proteins 4%; casein (3501.10.50) Free vs caseinates 0.37¢/kg; optically clear adhesives (3506.91.10) Free vs 2.1%. Classification also decides whether Canada's Section 338 list, a China list or an AD/CVD order applies.",
        "appliesTo": "All 33 lines, especially protein powders, collagen and milk protein products",
        "document": "A binding ruling request to CBP with the product's composition, protein content and use (19 CFR part 177). For example, CBP has ruled bovine collagen powder into 3504.00.50 (N301872), whey protein isolate 90 into 3502.20 (N282570), pea protein isolate into 3504.00.10 (N359602) and a milk protein isolate into 3504.00.10 (N020518).",
        "caveat": "A ruling binds only the product described. Note 2 sends dextrins with more than 10% reducing sugar to heading 1702, and flavored protein shake mixes are classified outside Chapter 35 (a protein shake mix went to 1806.90.90 in N309121).",
        "citations": [
            cit("19 CFR part 177", ECFR + "title-19/part-177"),
            cit("CBP ruling N301872 (bovine collagen)", RULING + "N301872"),
            cit("CBP ruling N282570 (whey protein isolate)", RULING + "N282570"),
            cit("CBP ruling N359602 (pea protein isolate)", RULING + "N359602"),
            cit("HTSUS Chapter 35 notes", CH35),
        ],
    },
    {
        "id": "origin",
        "title": "Know the country of origin",
        "saves": "Up to 37.5 percentage points: the same Free-rated enzyme pays 10% from the EU, 12.5% from Japan, 37.5% from Brazil or China (List 3), and nothing from Mexico under USMCA",
        "appliesTo": "All 33 lines",
        "document": "Production records showing where the goods were made. For proteins processed in several countries, origin follows the last substantial transformation; CBP's 2026 ruling N359602 on pea protein isolate refined in Cambodia from Chinese concentrate is an example.",
        "caveat": "Origin for tariffs and the scope of an AD/CVD order are decided separately: the pea protein orders cover Chinese pea protein blended in third countries.",
        "citations": [
            cit("CBP ruling N359602 (origin of pea protein isolate)", RULING + "N359602"),
            cit("HTSUS Ch. 99, subch. III, U.S. notes 20, 50, 51 and 52", CH99),
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check the AD/CVD scope before you buy",
        "saves": "The whole antidumping and countervailing duty when the product is outside the order",
        "appliesTo": "Pea protein from China (3504.00.10, 3504.00.50); hard empty capsules from Brazil, China, India and Vietnam (entered under 3503.00.55.10 or 9602)",
        "document": "The order's written scope. The pea protein orders cover pea protein of at least 65% protein (dry weight) and exclude textured pea protein, pea protein crisps, chickpea protein, finished foods such as bars and baked goods, and blends with less than 5% high-protein pea protein. When unsure, request a scope ruling from Commerce.",
        "caveat": "A product inside the scope pays the cash deposit whatever HTS line it is entered under, and AD/CVD are not refundable through drawback.",
        "citations": [
            cit("89 FR 68390 (pea protein orders)", "https://www.federalregister.gov/documents/2024/08/26/2024-19071/certain-pea-protein-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty-orders"),
            cit("91 FR 8433 (hard empty capsules, antidumping)", "https://www.federalregister.gov/documents/2026/02/23/2026-03484/hard-empty-capsules-from-brazil-the-peoples-republic-of-china-india-and-the-socialist-republic-of"),
            cit("19 CFR 351.225 (scope rulings)", ECFR + "title-19/section-351.225"),
        ],
    },
    {
        "id": "drawback",
        "title": "Recover duty on goods you export",
        "saves": "Up to 99% of the duties paid — including the Section 301 and Section 338 duties — when the imported goods, or goods made from them, are exported or destroyed",
        "appliesTo": "Any line, for example adhesives or proteins used in exported products",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Antidumping and countervailing duties are not subject to drawback (19 CFR 191.3(b)(3)). Claims have filing deadlines and record-keeping rules.",
        "citations": [cit("19 CFR part 191", ECFR + "title-19/part-191"), cit("19 CFR 191.3", ECFR + "title-19/section-191.3")],
    },
]
te["rules"] = [
    {"id": "fda-registration", "agency": "FDA", "title": "Food-grade products: the foreign facility that makes or packs them must be registered with FDA",
     "citations": [cit("21 CFR 1.225", ECFR + "title-21/section-1.225")]},
    {"id": "fda-prior-notice", "agency": "FDA / CBP", "title": "Food-grade products: prior notice to FDA before the shipment arrives",
     "citations": [cit("21 CFR 1.281", ECFR + "title-21/section-1.281"), cit("21 CFR 1.276 (definitions)", ECFR + "title-21/section-1.276")]},
    {"id": "fda-fsvp", "agency": "FDA", "title": "Food-grade products: the U.S. importer needs a foreign supplier verification program (FSVP)",
     "citations": [cit("21 CFR 1.502", ECFR + "title-21/section-1.502")]},
    {"id": "fda-modstarch", "agency": "FDA", "title": "Modified food starch: only the treatments and limits listed for food starch-modified may be used in food",
     "citations": [cit("21 CFR 172.892", ECFR + "title-21/section-172.892")]},
    {"id": "fda-cattle", "agency": "FDA", "title": "Cattle-derived food and cosmetic ingredients: the importer affirms at entry that no prohibited cattle materials are used (gelatin and milk products are not prohibited cattle materials) and keeps records",
     "citations": [cit("21 CFR 189.5", ECFR + "title-21/section-189.5"), cit("21 CFR 700.27", ECFR + "title-21/section-700.27")]},
    {"id": "aphis-milk", "agency": "USDA APHIS", "title": "Casein, caseinates and lactalbumin from regions with foot-and-mouth disease: only with written APHIS permission",
     "citations": [cit("9 CFR 94.16", ECFR + "title-9/section-94.16")]},
    {"id": "aphis-pap", "agency": "USDA APHIS", "title": "Animal-derived proteins (processed animal protein, including hydrolyzed proteins such as collagen peptides, and their derivatives): prohibited unless an exception applies; usually a VS permit (VS Form 16-3) and a veterinary certificate",
     "citations": [cit("9 CFR 95.4", ECFR + "title-9/section-95.4"), cit("9 CFR 95.1 (definitions)", ECFR + "title-9/section-95.1")]},
    {"id": "fsis-egg", "agency": "USDA FSIS", "title": "Dried and other egg albumin (egg products): only from countries FSIS has found eligible, with a foreign inspection certificate, and reinspected at an official import establishment",
     "citations": [cit("9 CFR 590.910", ECFR + "title-9/section-590.910"), cit("9 CFR 590.915", ECFR + "title-9/section-590.915")]},
    {"id": "tsca", "agency": "EPA / CBP", "title": "Adhesives, industrial starches and industrial enzymes: TSCA import certification (positive or negative) at entry",
     "citations": [cit("19 CFR 12.121", ECFR + "title-19/section-12.121"), cit("40 CFR 707.20", ECFR + "title-40/section-707.20")]},
    {"id": "adcvd-pea", "agency": "Commerce (ITA) / CBP", "title": "Pea protein from China: antidumping (China-wide cash deposit 269.77%) and countervailing duty (all others 15.84%) orders — not in the tariff calculator",
     "citations": [cit("89 FR 68390 (orders, August 26, 2024)", "https://www.federalregister.gov/documents/2024/08/26/2024-19071/certain-pea-protein-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty-orders")]},
    {"id": "adcvd-capsules", "agency": "Commerce (ITA) / CBP", "title": "Hard empty (gelatin) capsules from Brazil, China, India and Vietnam: antidumping and countervailing duty orders — not in the tariff calculator",
     "citations": [cit("91 FR 8433 (antidumping orders)", "https://www.federalregister.gov/documents/2026/02/23/2026-03484/hard-empty-capsules-from-brazil-the-peoples-republic-of-china-india-and-the-socialist-republic-of"),
                   cit("91 FR 8415 (countervailing duty orders)", "https://www.federalregister.gov/documents/2026/02/23/2026-03485/hard-empty-capsules-from-brazil-the-peoples-republic-of-china-india-and-the-socialist-republic-of")]},
]
FOOD = ["fda-registration", "fda-prior-notice", "fda-fsvp"]
GROUP_RULES = {
    "3501": (FOOD + ["aphis-milk", "tsca"], "Food-grade casein, caseinates and milk protein concentrate follow FDA food rules; from foot-and-mouth disease regions they need written APHIS permission (9 CFR 94.16(b)(3)). Casein glues (3501.90.20) are chemicals and need a TSCA certification. All four subheadings pay Canada's 50% Section 338 duty."),
    "3502": (FOOD + ["fsis-egg", "aphis-milk"], "Egg albumin is an egg product: FSIS allows it only from eligible countries with a foreign inspection certificate. Milk albumin and whey protein isolates follow the FDA food rules and APHIS's milk-product rule (lactalbumin is named in 9 CFR 94.16(b)(3))."),
    "3503": (FOOD + ["fda-cattle", "aphis-pap", "tsca", "adcvd-capsules"], "Edible gelatin follows FDA food rules; bovine gelatin is not a prohibited cattle material, but the importer must affirm compliance at entry. Inedible gelatin and animal glue are chemicals (TSCA). Hard gelatin capsules from Brazil, China, India and Vietnam are under AD/CVD orders whatever line they are entered under."),
    "3504": (FOOD + ["aphis-pap", "fda-cattle", "adcvd-pea"], "Collagen, collagen peptides, peptones and other animal-derived proteins fall under APHIS's processed-animal-protein rules (hydrolyzed proteins are named in 9 CFR 95.1). Pea protein from China (3504.00.10, 3504.00.50) is under AD/CVD orders."),
    "3505": (FOOD + ["fda-modstarch", "tsca"], "Modified food starch must meet 21 CFR 172.892; starches and starch glues for paper, textiles or adhesives are chemicals and need a TSCA certification."),
    "3506": (["tsca"], "Prepared glues and adhesives are chemical mixtures: TSCA certification at entry. Russian-origin adhesives of four subheadings pay the 200% aluminum derivative duty and three pay 35% under Proclamation 10420."),
    "3507": (FOOD + ["tsca"], "Food enzymes follow FDA food rules; industrial enzymes (detergent, textile, feed processing) need a TSCA certification; enzymes for medicines are FDA drug ingredients and can use the pharmaceutical-use Section 301 exemption."),
}
for g in te["groups"]:
    g["label"] = GROUPS[g["heading"]]["label"]
    g["ruleIds"], g["note"] = GROUP_RULES[g["heading"]]

PEA = {"3504.00.10.00", "3504.00.50.10", "3504.00.50.50"}
for ln in te["lines"]:
    h, code = ln["heading"], ln["hts"]
    sub = code[:10]
    if h == "3501":
        rules = ["tsca"] if code.startswith("3501.90.20") else FOOD + ["aphis-milk"]
    elif h == "3502":
        rules = FOOD + (["fsis-egg"] if code.startswith("3502.1") else ["aphis-milk"] if code.startswith("3502.20") else ["aphis-pap"])
    elif h == "3503":
        if code.startswith("3503.00.10"):
            rules = ["tsca"]
        elif code.startswith("3503.00.55.10"):
            rules = FOOD + ["fda-cattle", "aphis-pap", "adcvd-capsules"]
        elif code.startswith("3503.00.55"):
            rules = ["aphis-pap", "tsca"]
        else:
            rules = ["aphis-pap", "tsca"]
    elif h == "3504":
        rules = FOOD + (["adcvd-pea"] if code in PEA else []) + ([] if code.startswith("3504.00.50.10") or code.startswith("3504.00.50.50") else ["aphis-pap", "fda-cattle"])
    elif h == "3505":
        rules = (FOOD + ["fda-modstarch", "tsca"]) if code.startswith("3505.10") else ["tsca"]
    elif h == "3506":
        rules = ["tsca"]
    else:
        rules = (["tsca"] if code.startswith("3507.90.20") else FOOD + ["tsca"])
    ln["ruleIds"] = rules
    levers = ["origin", "usmca", "ruling", "drawback"]
    if (ln["general"] or "Free") != "Free":
        levers.insert(2, "fta")
    if code.startswith("3507.90.70"):
        levers.insert(1, "pharma-use")
    if "adcvd-pea" in rules or "adcvd-capsules" in rules:
        levers.insert(1, "adcvd-scope")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. AD/CVD rates are company-specific and change with each "
    "administrative review; check Commerce's latest notice and CBP's cash-deposit instructions before importing. Which agency rules apply depends on the "
    "product's source and intended use."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 35: Albuminoidal Substances, Modified Starches, Glues & Enzymes — Tariff FAQ"
fc["seo"] = {
    "title": "HTS Chapter 35 FAQ: HS Codes for Gelatin, Collagen, Casein, Whey Protein, Glue & Enzymes + 2026 Tariffs | KoalaGains",
    "shortDescription": "Answers to what people search about HTS Chapter 35: HS codes for gelatin, gelatin capsules, collagen, casein, whey protein, pea protein, egg albumin, modified starch, glue and enzymes, and the 2026 tariffs on whey protein and protein powder.",
    "keywords": [
        "hts chapter 35",
        "gelatin hs code",
        "hs code for gelatin capsules",
        "collagen hs code",
        "casein hs code",
        "whey protein hs code",
        "whey protein tariffs",
        "pea protein hs code",
        "hs code for glue",
        "enzyme hs code",
        "modified starch hs code",
        "egg albumin hs code",
    ],
}
fc["intro"] = "Straight answers to the most common searches about HTS Chapter 35 — which HS code a product falls under and what it pays today. Each answer links to the page with the full detail."
fc["keyTakeaways"] = [
    "Chapter 35 base rates are low — 8 of 33 lines are Free, most others 2–6% or a few cents per kilogram — but no line is exempt from the 2026 Section 301 tariffs: EU goods pay 10% in total, Japan and Korea 12.5%, New Zealand and Australia +12.5%, Brazil +37.5%, China +20% or +37.5%.",
    "Canadian casein, caseinates, whey protein, egg albumin, gelatin, protein isolates and modified starches pay a 50% Section 338 duty since August 22, 2026, even when they qualify for USMCA; Canadian adhesives and enzymes and USMCA goods from Mexico are Free.",
    "The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026. Pea protein from China and hard gelatin capsules from Brazil, China, India and Vietnam carry antidumping and countervailing duties that the tariff calculator does not include.",
]
fc["questionSource"] = f"Google search suggestions, collected {SUGGEST_DATE}"
fc["faqs"] = [
    dict(id="what-is-ch35", question="What is HTS Chapter 35 (albuminoidal substances)?",
         searchedAs=["hts chapter 35", "chapter 35 hts", "albuminoidal substances", "albuminoidal substances meaning"],
         answer=f"Chapter 35 of the Harmonized Tariff Schedule covers albuminoidal (protein) substances and related products: casein and caseinates (3501), albumins such as egg white and whey protein isolate (3502), gelatin and animal glue (3503), peptones and other proteins such as collagen and pea protein (3504), dextrins and modified starches (3505), prepared glues and adhesives (3506) and enzymes (3507) — 33 ten-digit U.S. lines. The U.S. imported {S['T']} of them in {YR}.",
         link=""),
    dict(id="gelatin", question="What is the HS code for gelatin?",
         searchedAs=["gelatin hs code", "hs code for gelatin", "hts code for gelatin", "gelatin powder hs code", "bovine gelatin hs code", "fish gelatin hs code", "edible gelatin hs code", "gelatin tariff code"],
         answer="3503.00. Edible gelatin, whether bovine, porcine or fish, in sheets or powder, is 3503.00.55.10; photographic gelatin 3503.00.55.20; other gelatin 3503.00.55.50 — all 2.8¢/kg + 3.8%. Inedible gelatin and animal glue is 3503.00.20 (under 88¢/kg, 1.2¢/kg + 3.2%) or 3503.00.40 (88¢/kg or more), and fish glue 3503.00.10. Canadian gelatin of 3503.00.40 and 3503.00.55 pays 50% under Section 338; EU gelatin 10% in total; Brazilian gelatin the base rate plus 37.5%.",
         link=""),
    dict(id="gelatin-capsules", question="What is the HS code for empty gelatin capsules, and are there duties on them?",
         searchedAs=["hs code for gelatin capsules", "gelatin capsules hs code", "hs code for empty gelatin capsules", "hs code for empty hard gelatin capsules"],
         answer="Commerce's 2026 orders describe hard empty capsules as classifiable in 9602.00.10.40 and 9602.00.50.10, and note that gelatin capsules may also be entered under 3503.00.55.10. Whichever line is used, capsules from Brazil, China, India and Vietnam are under antidumping and countervailing duty orders since February 2026: antidumping cash deposits of 77.63% (Brazil), 18.71% (China), 11.70% (India, all others) and 46.24% (Vietnam), plus countervailing duties of 2.45%–10.67%.",
         link="tariff-updates"),
    dict(id="collagen", question="What is the HS code for collagen or collagen peptides?",
         searchedAs=["collagen hs code", "collagen powder hs code", "collagen peptide hs code", "hydrolyzed collagen hs code", "bovine collagen hs code", "collagen tariff code", "marine collagen tariff code"],
         answer="Collagen and collagen peptides as an ingredient are generally 3504.00.50 — other protein substances and their derivatives, 4% general. CBP classified bovine collagen gel and powder there in ruling N301872. Collagen mixed into a finished supplement or drink can fall in another chapter, so check CBP rulings or ask for one. Brazilian collagen pays the base rate plus 37.5%, Chinese +20%, Canadian 3504.00.50 goods 50% under Section 338.",
         link="tariff-engineering"),
    dict(id="casein", question="What is the HS code for casein and sodium caseinate?",
         searchedAs=["casein hs code", "hs code for casein", "rennet casein hs code", "acid casein hs code", "hs code for sodium caseinate", "sodium caseinate hs code", "hs code calcium caseinate", "hs code 3501.10"],
         answer="3501. Casein — rennet or acid — is 3501.10.50 (Free); milk protein concentrate, meaning any complete milk protein (casein plus lactalbumin) concentrate, is 3501.10.10 (0.37¢/kg); sodium, calcium and other caseinates are 3501.90.60 (0.37¢/kg); casein glues 3501.90.20 (6%). New Zealand casein pays the base rate plus 12.5%, EU casein 10% in total, and Canadian casein 50% under Section 338 even with USMCA.",
         link=""),
    dict(id="whey-hs", question="What is the HS code for whey protein isolate or concentrate?",
         searchedAs=["whey protein hs code", "whey isolate hs code", "whey protein concentrate hs code", "hs code for whey protein isolate", "hs code 3502.20", "whey protein tariff code"],
         answer="Whey protein concentrates with more than 80% whey protein on a dry basis, including isolates, are 3502.20.00 (milk albumin), Free under the general rate; CBP ruled whey protein isolate 90 there (N282570). Lower-protein whey protein concentrates and whey powder are classified in Chapter 4 (heading 0404), not Chapter 35.",
         link=""),
    dict(id="whey-tariff", question="Are there tariffs on whey protein imports?",
         searchedAs=["tariff on whey protein", "whey protein tariffs", "new zealand whey protein", "new zealand whey protein isolate"],
         answer="The base rate on whey protein isolate (3502.20) is Free, but the 2026 extra duties apply: New Zealand +12.5%, the EU 10% in total, the UK +10%, Canada 50% under Section 338 (with or without USMCA), China +20%. USMCA-qualifying Mexican whey protein is Free. The U.S. imported $" + f"{hs6['350220']['importsUsd'] / 1e6:.0f}M of it in {YR}.",
         link="industry-areas"),
    dict(id="protein-powder", question="Are there tariffs on protein powder?",
         searchedAs=["protein powder tariffs", "are there tariffs on protein powder", "tariffs on protein powder", "protein powder hs code", "protein powder tariff code"],
         answer="It depends on the classification. Whey protein isolate is 3502.20 (Free base), pea, soy and other protein isolates 3504.00.10 (5%), other proteins 3504.00.50 (4%) — each plus the 2026 Section 301 duty for the country. Flavored or blended shake mixes are usually classified outside Chapter 35: CBP put a protein shake mix from China in 1806.90.90 (ruling N309121). Pea protein from China also pays antidumping and countervailing duties.",
         link="tariff-engineering"),
    dict(id="pea-protein", question="What is the HS code for pea protein, and is there an antidumping duty on Chinese pea protein?",
         searchedAs=["pea protein hs code", "pea protein hts code", "pea protein isolate hs code", "pea protein tariff", "antidumping pea protein china", "pea protein antidumping", "pea protein isolate china"],
         answer="Pea protein isolate is 3504.00.10 (5%; CBP ruling N359602, 2026); other pea protein is 3504.00.50.10 (certified organic) or 3504.00.50.50 (4%). Since August 2024, high-protein pea protein (65% or more) from China is under antidumping and countervailing duty orders: 269.77% China-wide antidumping cash deposit (111.65% for separate-rate exporters) and 15.84% countervailing for all others — on top of 5% + 7.5% List 4A + 12.5% Section 301.",
         link="tariff-engineering"),
    dict(id="enzymes", question="What is the HS code for enzymes?",
         searchedAs=["hs code for enzymes", "enzyme hs code", "enzyme tariff code", "enzyme powder hs code", "enzyme preparation hs code", "hs code 3507.90", "hts 3507.90"],
         answer="3507. Rennet is 3507.10; penicillin G amidase 3507.90.20; other enzymes and prepared enzymes 3507.90.70 — proteases, amylases, lipases, cellulases, pectinases, oxidases and catalases under statistical suffix 10, others under 80. All are Free under the general rate. Enzymatic pre-tanning and washing preparations and enzyme medicaments are excluded (Chapters 32, 34 and 30). Danish enzymes pay 10% in total; Chinese +37.5%; enzymes for pharmaceutical use are exempt from the 2026 Section 301 duty.",
         link=""),
    dict(id="glue", question="What is the HS code for glue and adhesives?",
         searchedAs=["hs code for glue", "glue tariff code", "glue stick tariff code", "super glue tariff code", "hts code for adhesives", "adhesive tariff code", "hts 3506.91", "hs code 3506.99"],
         answer="Mostly 3506. Glues put up for retail sale in packs of up to 1 kg (glue sticks, super glue) are 3506.10 — animal glue 6.5%, others 2.1%; adhesives based on plastics polymers or rubber are 3506.91 (2.1%, optically clear adhesives Free); other prepared adhesives 3506.99 (2.1%). Starch glues are 3505.20, casein glues 3501.90.20, animal glue in bulk 3503.00. Self-adhesive plastic tape and labels are not Chapter 35. Chinese adhesives pay +37.5%, German 10% in total.",
         link=""),
    dict(id="modified-starch", question="What is the HS code for modified starch and dextrin?",
         searchedAs=["modified starch hs code", "modified corn starch hs code", "modified tapioca starch hs code", "dextrin hs code", "hs code 3505.10", "maltodextrin hs code"],
         answer="3505.10.00 (0.7¢/kg) covers dextrins and modified starches such as pregelatinized, esterified or etherified starch: dextrin from potato starch .15, other dextrin .20; other modified starch from corn .40, from potato .45, other (for example tapioca) .92. Under Chapter 35 note 2, dextrins with more than 10% reducing sugar — which can include maltodextrin — belong in heading 1702. Starch glues are 3505.20.",
         link=""),
    dict(id="egg-albumin", question="What is the HS code for egg albumin or egg white powder?",
         searchedAs=["egg albumin hs code", "egg white powder hs code", "egg albumen powder hs code", "egg albumin powder hs code", "hs code 3502"],
         answer="Dried egg albumin (egg white powder) is 3502.11.00 at 47.6¢/kg; other egg albumin 3502.19.00 at 9.7¢/kg. As egg products they can enter only from countries USDA FSIS has found eligible, with a foreign inspection certificate. Dried egg albumin from China pays +37.5%, from Canada +50% under Section 338.",
         link="tariff-engineering"),
]

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("ok")
