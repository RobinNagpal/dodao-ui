"""Fill the writer TODOs of the generated Chapter 34 content file.

usage: python3 fill34.py <generated.json> <out.json>

Regenerate the input with:
  cd insights-ui && pnpm tariff:generate-chapter --chapter 34 --slug 34-soaps-waxes-and-preparations \
    --title '<official title>' --countries CA,MX,VN,CN,DE,KR,FR,JP,IN,GB,IT,CO --out <scratch>/34-gen.json --force
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fill34_static import CH34, CH99, ECFR, ECFR_AS_OF, EXTRA_SOURCES, GN  # noqa: E402
from fill34_trade import apply_trade  # noqa: E402

d = json.load(open(sys.argv[1]))
SHORT = "Soap, Detergents, Waxes & Candles"

# ---------------------------------------------------------------- overview (non-trade parts)
o = d["overview"]
o["h1"] = f"HTS Chapter 34: {SHORT} — Tariff Rates"
o["notes"] = {
    "chapterNotes": (
        "**Note 1.** This chapter does not cover: (a) edible mixtures or preparations of animal, vegetable or microbial fats or oils of a kind used as "
        "mold release preparations (heading 1517); (b) separate chemically defined compounds; or (c) shampoos, dentifrices, shaving creams and foams "
        "or bath preparations, containing soap or other organic surface-active agents (heading 3305, 3306 or 3307).\n\n"
        "**Note 2.** For the purposes of heading 3401, the expression \"soap\" applies only to soap soluble in water. Soap and the other products of "
        "heading 3401 may contain added substances (for example, disinfectants, abrasive powders, fillers or medicaments). Products containing abrasive "
        "powders remain classified in heading 3401 only if in the form of bars, cakes or molded pieces or shapes. In other forms they are to be "
        "classified in heading 3405 as \"scouring powders and similar preparations\".\n\n"
        "**Note 3.** For the purposes of heading 3402, \"organic surface-active agents\" are products which when mixed with water at a concentration "
        "of 0.5 percent at 20°C and left to stand for one hour at the same temperature: (a) give a transparent or translucent liquid or stable emulsion "
        "without separation of insoluble matter; and (b) reduce the surface tension of water to 4.5 x 10⁻² N/m (45 dyne/cm) or less.\n\n"
        "**Note 4.** In heading 3403 the expression \"petroleum oils and oils obtained from bituminous minerals\" applies to the products defined in "
        "note 2 to chapter 27.\n\n"
        "**Note 5.** In heading 3404, subject to the exclusions provided below, the expression \"artificial waxes and prepared waxes\" applies only to: "
        "(a) chemically produced organic products of a waxy character, whether or not water-soluble; (b) products obtained by mixing different waxes; "
        "(c) products of a waxy character with a basis of one or more waxes and containing fats, resins, mineral substances or other materials. The "
        "heading does not apply to: (a) goods of heading 1516, 3402 or 3823 even if having a waxy character; (b) unmixed animal waxes or unmixed "
        "vegetable waxes, whether or not refined or colored, of heading 1521; (c) mineral waxes or similar products of heading 2712, whether or not "
        "intermixed or merely colored; or (d) waxes mixed with, dispersed in or dissolved in a liquid medium (headings 3405, 3809, etc.)."
    ),
    "additionalUsNotes": None,
}

GROUPS = {
    "3401": dict(
        label="Soap & skin-washing preparations",
        short="Soap",
        blurb="Bar soap (toilet, Castile, laundry bars), soap flakes and powders, liquid hand soap and body wash put up for retail sale, and wipes impregnated with soap or detergent: 6 lines, Free except 4% for liquid skin cleansers containing an aromatic surfactant (3401.30.10). Shampoos and bath preparations are not here (Chapter 33).",
        examples=["bar soap", "liquid hand soap", "body wash", "Castile soap", "laundry soap bar", "soap noodles"],
    ),
    "3402": dict(
        label="Surfactants, detergents & cleaners",
        short="Detergents",
        blurb="Anionic, cationic and nonionic surfactants (LAS, sulfated alcohols), laundry and dishwashing detergents and cleaning preparations, retail or bulk: 22 lines at 3.7% to 6.5%, except Free for retail detergents with no aromatic surfactant (3402.50.51).",
        examples=["laundry detergent", "dish soap", "detergent pods", "surfactant", "LABSA", "cleaning preparation"],
    ),
    "3403": dict(
        label="Lubricating preparations",
        short="Lubricants",
        blurb="Lubricants, greases, cutting oils, mold-release and anti-rust preparations, and textile or leather treatment preparations with less than 70% petroleum oil: 8 lines at 0.2% to 6.5%. Lubricants that are 70% or more petroleum oil are in Chapter 27.",
        examples=["lubricant", "grease", "cutting oil", "mold release agent", "lubricant spray", "textile lubricant"],
    ),
    "3404": dict(
        label="Artificial & prepared waxes",
        short="Waxes",
        blurb="Polyethylene glycol waxes, blended and chemically produced waxes, and prepared waxes containing bleached beeswax: 4 lines, all Free. Unmixed beeswax (1521) and paraffin wax (2712) are classified elsewhere.",
        examples=["artificial wax", "PEG wax", "candle wax blend", "prepared wax", "lignite wax"],
    ),
    "3405": dict(
        label="Polishes & scouring preparations",
        short="Polishes",
        blurb="Shoe polish, furniture and floor polish, car polishes, metal and glass polishes and scouring powders, including wipes impregnated with them: 5 lines, all Free.",
        examples=["shoe polish", "car wax", "furniture polish", "scouring powder", "metal polish"],
    ),
    "3406": dict(
        label="Candles",
        short="Candles",
        blurb="Candles, tapers and the like, scented or not: one line, Free. Candles from China are also under a 1986 antidumping order, and Canadian candles pay a 50% Section 338 duty since August 22, 2026.",
        examples=["candles", "scented candles", "soy candles", "pillar candles", "tealights", "votive candles"],
    ),
    "3407": dict(
        label="Modeling pastes & dental waxes",
        short="Modeling pastes",
        blurb="Modeling clay and play dough, dental waxes and impression compounds put up in sets or plates, and plaster-based dental preparations: 2 lines, both Free.",
        examples=["modeling clay", "play dough", "dental wax", "impression compound", "modeling dough"],
    ),
}
for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["blurb"] = G["blurb"]
    g["searchExamples"] = G["examples"]

for st in o["stats"]:
    if st["label"].startswith("Lines with an extra duty"):
        st["note"] = (
            "2026 Section 301 on 60 economies (USMCA goods of Canada and Mexico exempt), China Section 301 Lists 2, 3 and 4A, "
            "Brazil 25%, and 50% on Canadian candles"
        )

o["workedExamples"] = [
    {
        "title": "$60,000 of scented candles from Vietnam",
        "line": "3406.00.00.00",
        "body": "Candles are **Free** under the general rate, but Vietnam is one of the 60 economies under the 2026 Section 301 action, so they pay **+12.5%** (9903.05.84): **$7,500**. Chapter 34 has no general exemption from that duty. Before July 24, 2026 the same candles paid the 10% Section 122 surcharge, and in 2025 Vietnam's IEEPA reciprocal rate.",
    },
    {
        "title": "$100,000 of candles from Canada",
        "line": "3406.00.00.00",
        "body": "Since August 22, 2026 candles of Canada pay **+50%** under Section 338 (9903.03.14, Proclamation 11048), **even when entered under USMCA**: **$50,000**. Without a USMCA claim the 10% Section 301 duty on Canada (9903.05.29) is added too, for 60% ($60,000). Every other Chapter 34 product of Canada that qualifies for USMCA enters Free.",
    },
    {
        "title": "$40,000 of liquid hand soap from China",
        "line": "3401.30.50.00",
        "body": "Liquid skin-washing preparations without an aromatic surfactant are **Free** at base, but Chinese goods pay **+25%** under Section 301 List 3 (9903.88.03) and **+12.5%** under the 2026 Section 301 action (9903.05.31): **37.5%**, or **$15,000**. The same soap from Mexico under USMCA pays nothing.",
    },
    {
        "title": "$20,000 of lubricating preparations from Germany",
        "line": "3403.99.00.00",
        "body": "The general rate is **6.5%** ($1,300). For goods of the EU the 2026 Section 301 rate replaces a base rate below 10% with a flat **10%** (9903.05.39), so the duty is **$2,000**. Lubricants that are 70% or more petroleum oil are classified in Chapter 27, not here.",
    },
]

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = f"HTS Chapter 34: {SHORT} — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 34 Tariff Updates 2026 — Soap, Detergent & Candle Duties Since 2025 | KoalaGains",
    "shortDescription": "What changed for soap, detergent, lubricant, wax and candle imports since January 2025: the IEEPA duties and their end, the Section 122 surcharge, the 2026 Section 301 tariffs on 60 economies, 50% on Canadian candles and the China candle antidumping order, with Federal Register citations.",
    "keywords": [
        "hts chapter 34 tariff updates",
        "candle tariffs 2026",
        "us candle import tariffs",
        "section 338 canada candles",
        "china section 301 soap tariffs",
        "import duty on soap and organic surface-active agents",
        "usmca hts chapter 34 exemptions",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current "
    "**2026 Revision 21** (in force October 9, 2026). All 48 Chapter 34 lines carry the same base rates in both — Free to 6.5%.\n\n"
    "What changed were the extra duties. In 2025 Chapter 34 goods paid IEEPA duties: 25% (Canada later 35%) on non-USMCA goods of Canada and Mexico, "
    "fentanyl and reciprocal duties on China, and the reciprocal tariff on almost everyone else. Those duties **ended on February 24, 2026**, and the "
    "10% **Section 122** surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** the **2026 Section 301 tariffs** on 60 economies "
    "apply to the whole chapter — there is no general exemption list for soap, detergents or candles — and USMCA goods of Canada and Mexico are exempt. "
    "Since **August 22, 2026** candles of Canada pay **50%** under Section 338, USMCA or not. China keeps its 2018–2019 Section 301 duties on top.\n\n"
    "Separately, candles of petroleum wax from China have been under an **antidumping duty order** since 1986. It is listed below for reference; it is "
    "set exporter by exporter by the Commerce Department and is **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 34 from any country (2026 Section 301 on 60 economies, Brazil Section 301, China Section 301 Lists 2, 3 "
    "and 4A, Canada Section 338, Russia's column 2 replacement rates and 200% aluminum duty; the ended IEEPA and Section 122 duties), plus the "
    "antidumping duty order on petroleum wax candles from China, which the tariff calculator does not model. For the rate each supplier pays, see Rates by country."
)

EXEMPT_52E = (
    "Five subheadings — 3401.30.10, 3402.42.10, 3402.42.20, 3402.42.90 and 3402.50.11 — are exempt when the goods are for use in pharmaceutical "
    "applications (U.S. note 52(e), 9903.05.89); no other Chapter 34 line is on a note 52 exemption list."
)
IEEPA_END = "The IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
IN_EFFECT = {
    "Canada": (
        f"USMCA-qualifying goods are exempt from the 10% (9903.05.93, note 52(g)). The 50% Section 338 duty (9903.03.14, U.S. note 51(b)(3)) covers "
        f"only candles (3406.00.00) and applies even under USMCA, on top of any other duty. {EXEMPT_52E} The 2025 IEEPA duty (35% on non-USMCA goods) "
        "ended February 24, 2026.",
        "Most Chapter 34 goods of Canada that qualify for USMCA enter Free. Candles pay 50% regardless: $100,000 of Canadian candles pays $50,000, or $60,000 without a USMCA claim. Non-USMCA soap or detergent pays its base rate plus 10%.",
    ),
    "Mexico": (
        f"USMCA-qualifying goods are exempt (9903.05.94, note 52(h)). {EXEMPT_52E} The 2025 IEEPA duty (25% on non-USMCA goods) ended February 24, 2026.",
        "Detergents, soap and candles from Mexico that qualify for USMCA enter Free; without a USMCA claim they pay the base rate plus 10%.",
    ),
    "Vietnam": (
        f"{EXEMPT_52E} {IEEPA_END}",
        "Every Chapter 34 product of Vietnam pays its base rate plus 12.5%: $60,000 of Vietnamese candles pays $7,500.",
    ),
    "China": (
        "Section 301 coverage by 8-digit subheading (U.S. note 20): 34 subheadings on List 3 (+25%, 9903.88.03), the lubricating preparations "
        "3403.19.10, 3403.19.50 and 3403.99.00 on List 2 (+25%, 9903.88.02), and 3401.19.00 (other soap in bars or impregnated nonwovens) and 3406.00.00 (candles) on List 4A "
        "(+7.5%, 9903.88.15); modeling pastes and dental waxes (3407) are on no list. A USTR product exclusion (note 20(vvv)(iv), 9903.88.69) removes "
        "the List 4A duty from 3401.19.00.00 through November 9, 2026. The 12.5% 2026 duty (9903.05.31) stacks on top; " + EXEMPT_52E[0].lower() + EXEMPT_52E[1:]
        + " USTR confirmed on October 7, 2026 that the China actions continue during their four-year review. The IEEPA duties on China ended February 24, 2026. "
        "Petroleum wax candles also carry an antidumping duty, not shown here.",
        "Most Chinese soap, detergent, lubricant, wax and polish pays its base rate plus 37.5%: $40,000 of liquid hand soap pays $15,000. Candles pay 20% plus the antidumping duty, 3401.19.00 soap 12.5% while the exclusion lasts, and modeling clay 12.5%.",
    ),
    "European Union": (
        f"Heading 9903.05.39 applies to EU goods whose column 1 rate is below 10%, which is every Chapter 34 line: the total becomes 10%. "
        f"No Chapter 34 line is on the EU list in note 52(j)(2). {EXEMPT_52E} {IEEPA_END}",
        "EU soap, detergents, lubricants and candles pay a flat 10%, whatever the base rate: $20,000 of German lubricant at 6.5% pays $2,000.",
    ),
    "South Korea": (
        f"Heading 9903.05.71 applies to Korean goods whose column 1 rate is below 12.5% — every Chapter 34 line — and sets the total at 12.5%, "
        f"also when the KORUS preference (KR) is claimed (note 52(a)). {EXEMPT_52E} {IEEPA_END}",
        "Korean Chapter 34 goods pay a flat 12.5%, with or without a KORUS claim.",
    ),
    "Japan": (
        f"Heading 9903.05.49 applies to Japanese goods whose column 1 rate is below 12.5% — every Chapter 34 line — and sets the total at 12.5%. {EXEMPT_52E} {IEEPA_END}",
        "Japanese Chapter 34 goods pay a flat 12.5%, including the lower JP rates printed for some lubricants.",
    ),
    "India": (f"{EXEMPT_52E} {IEEPA_END}", "Indian Chapter 34 goods pay the base rate plus 10%: Free candles pay 10%, 3.7% detergents 13.7%."),
    "United Kingdom": (
        f"No Chapter 34 line is on the UK list in note 52(j)(1) (9903.05.96). {EXEMPT_52E} {IEEPA_END}",
        "British Chapter 34 goods pay the base rate plus 10%.",
    ),
    "Colombia": (
        f"Note 52(a): the duty applies also when the U.S.–Colombia TPA preference (CO) is claimed; the CO claim removes only the base rate. {EXEMPT_52E} {IEEPA_END}",
        "With a CO claim, Colombian soap and detergents pay 12.5%; without it, the base rate plus 12.5%.",
    ),
    "Brazil": (
        "Two Section 301 actions stack: 25% (9903.05.01) and 12.5% (9903.05.27). No Chapter 34 line is on the Brazil exemption list (note 50(a)(ii)); "
        "the five pharmaceutical-use subheadings are exempt from the 25% under note 50(a)(v) (9903.05.06) and from the 12.5% under note 52(e). "
        "The 2025 IEEPA duty on Brazil ended February 24, 2026.",
        "Brazilian Chapter 34 goods pay the base rate plus 37.5%.",
    ),
    "Russia": (
        "Russia pays column 2 rates (general note 3(b)); 10 Chapter 34 subheadings pay 35% instead (9903.90.08, note 30). 16 subheadings (liquid skin cleansers, several "
        "detergents, lubricants and polishes) pay +200% when they are derivative aluminum articles containing aluminum smelted or cast in Russia "
        "(9903.85.68, note 19(k)). The 12.5% Section 301 duty (9903.05.66) is added on top.",
        "Russian Chapter 34 goods pay their column 2 rate (up to 53.5% plus a per-kilogram duty) or 35%, plus 12.5%. U.S. imports from Russia in this chapter are negligible.",
    ),
}
for x in tu["inEffect"]:
    c = x["country"]
    if c.startswith("Other Section 301 economies"):
        x["exemption"] = (
            f"Rates are 10% or 12.5% by country; Switzerland and Taiwan pay a flat 12.5% and 10% where the base rate is lower. {EXEMPT_52E} "
            "No country list in note 52(j) names a Chapter 34 line. " + IEEPA_END
        )
        x["whatItMeans"] = "Chapter 34 goods of these economies pay the base rate plus 10% or 12.5%, or a flat 10% or 12.5%."
        continue
    ex, wim = IN_EFFECT[c]
    x["exemption"], x["whatItMeans"] = ex, wim
    if c == "China":
        for sid in ["fr-2025-21671"]:
            if sid not in x["sourceIds"]:
                x["sourceIds"].insert(-1, sid)

for s in EXTRA_SOURCES:
    if s["id"] not in {x["id"] for x in tu["sources"]}:
        tu["sources"].append(s)

base = [c for c in tu["changes"] if c["type"] == "baseRate"]
for c in base:
    c["detail"] = (
        "All 48 Chapter 34 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition; "
        "no line was added, removed or renumbered."
    )


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


gen = {c["id"]: c for c in tu["changes"]}
nic = next(c for c in tu["changes"] if c["type"] == "pending")
nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
nic["detail"] = (
    "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 "
    "(9903.89.01, U.S. note 29), with no exemption for Chapter 34. The rate is 0% in 2026; Nicaragua's 12.5% 2026 Section 301 duty (9903.05.58) applies meanwhile."
)

changes = base + [nic] + [
    ch("candles-sunset-2026", "pending", "2026-09-01", "Published", "Sixth five-year review of the China candle antidumping order begins",
       "Commerce and the ITC started the sixth sunset review of the 1986 antidumping duty order on petroleum wax candles from China (A-570-504; ITC 731-TA-282). "
       "Responses to the ITC were due October 1, 2026 and comments on their adequacy by November 16, 2026. The order stays in force during the review.",
       None, None, "China", ["fr-2026-17811", "fr-2026-17862"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their July 6 and August 23, 2026 anniversaries and remain in effect pending the statutory review. Chapter 34 keeps List 3 (+25%), List 2 (+25%) and List 4A (+7.5%) duties.",
       None, None, "China", ["fr-2026-20510"]),
    ch("ca-338-candles", "extraDuty", "2026-08-22", "Effective", "50% Section 338 duty on candles from Canada",
       "Proclamation 11048 imposed additional duties under Section 338 of the Tariff Act of 1930 on a list of Canadian products to offset Canada's surtax on U.S. motor vehicles. "
       "Candles (3406.00.00) are on list (b)(3) of U.S. note 51 and pay +50% (9903.03.14) from August 22, 2026 (Proclamation 11056 moved the start from August 19), "
       "also when entered under USMCA. Proclamation 11065 changed the list from September 15, 2026 but kept candles. No other Chapter 34 line is covered.",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916", "hts-chapter-99"]),
    ch("s301-60", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies reach all of Chapter 34",
       "The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect. Chapter 34 has no general "
       "exemption under U.S. note 52(b): only five surfactant and soap subheadings are exempt when for pharmaceutical use (note 52(e)). USMCA goods of Canada and Mexico "
       "are exempt (9903.05.93, 9903.05.94). The EU pays a flat 10%, Japan and South Korea a flat 12.5%, where the base rate is lower.",
       None, "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026. It had applied to Chapter 34 goods of every country except the nonionic surfactants of "
       "3402.42 (on the exemption list, 9903.03.03) and USMCA goods of Canada and Mexico (9903.03.07, 9903.03.08).",
       "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Brazil Section 301 tariff reaches all of Chapter 34",
       "The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect. No Chapter 34 line is on the Brazil exemption list (U.S. note 50(a)(ii)); "
       "the five pharmaceutical-use subheadings are exempt only for that use (note 50(a)(v), 9903.05.06). From July 24 the 12.5% 60-economy duty is added.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, "
       "so USMCA claims (SPI S) still remove the base rate and the 10% Section 301 duty on Canada and Mexico.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("s232-restructure", "reference", "2026-04-06", "Effective", "Section 232 aluminum duty no longer reaches Chapter 34 (except Russia)",
       "Proclamation 11021 rebuilt the metals tariffs around new product lists (U.S. note 16(c)) and ended the duties on derivative articles left off them. No Chapter 34 line "
       "is on the new lists, so the aluminum-content duty that 16 Chapter 34 subheadings paid from August 18, 2025 stopped. Russia's 200% duty on derivative aluminum articles "
       "(9903.85.68, note 19(k)) still covers them.",
       "+50% on aluminum content", "None (Russia 200%)", "All", ["procl-11021", "hts-chapter-99"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Only the 3402.42 nonionic surfactants were on its product exemption list "
       "(9903.03.03); USMCA goods of Canada and Mexico were exempt.",
       None, "+10%", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, "
       "China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. For Chapter 34 this removed the 35% (Canada) and "
       "25% (Mexico) duties on non-USMCA goods, the 10% fentanyl and 10% reciprocal duties on China, and the reciprocal rates on other countries.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("cn-excl-ext", "reference", "2025-12-01", "Published", "China exclusion for subheading 3401.19 soap extended to November 9, 2026",
       "USTR extended 178 Section 301 product exclusions, including the one for 3401.19.00.00 (other soap and organic surface-active products in bars, cakes or molded shapes, and impregnated paper and nonwovens), which removes the 7.5% List 4A duty "
       "(9903.88.69). The exclusion runs through November 9, 2026.",
       None, "Excluded through 2026-11-09", "China", ["fr-2025-21671", "hts-chapter-99"]),
    ch("cn-fentanyl-10", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut from 20% to 10%",
       "Executive Order 14357 lowered the IEEPA duty on products of China (9903.01.24) from 20% to 10%. Ended February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("s232-inclusions", "extraDuty", "2025-08-18", "Effective", "Section 232 aluminum duty extended to 16 Chapter 34 subheadings",
       "Commerce added 407 HTS codes to the steel and aluminum derivative lists, among them liquid skin cleansers (3401.30), several surfactant and detergent lines, "
       "lubricating preparations (3403.19, 3403.99) and polishes (3405.10–3405.90). They paid the Section 232 aluminum duty "
       "(50% since June 4, 2025) on the value of their aluminum content. Ended for all countries but Russia on April 6, 2026.",
       None, "+50% on aluminum content (ended)", "All", ["fr-2025-15819", "procl-10947"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal-country", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates take effect",
       "The reciprocal tariff moved from the 10% baseline to the country rates listed in Annex I of Executive Order 14326, including an all-in 15% rate for "
       "most EU goods (9903.02.19–9903.02.20). Ended February 24, 2026.",
       "+10%", "Country rate (ended)", "All except Canada, Mexico, China", ["eo-14326"]),
    ch("cn-reciprocal-10", "extraDuty", "2025-05-14", "Effective", "China reciprocal rate cut to 10%",
       "After the U.S.–China talks in Geneva, the reciprocal duty on products of China fell from 125% to 10% (9903.01.25). Ended February 24, 2026.",
       "+125%", "+10% (ended)", "China", ["eo-14298"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff covers Chapter 34",
       "10% baseline (9903.01.25) from April 5, 2025 and country rates on products of all countries except Canada and Mexico. Only the 3402.42 nonionic surfactants "
       "were on the Annex II exemption list (9903.01.32). Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("usmca-exempt", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.",
       "+25%", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("cn-fentanyl-20", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "Executive Order 14228 raised the IEEPA duty on products of China from 10% to 20%. Ended February 24, 2026.",
       "+10%", "+20% (ended)", "China", ["eo-14228"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada, Mexico and China",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025, and +10% on goods of China from February 4, 2025, including Chapter 34 goods. Ended February 24, 2026.",
       "None", "+25% / +10% (ended)", "Canada, Mexico, China", ["eo-14193", "eo-14194", "eo-14195"]),
    ch("candles-continued", "reference", "2021-10-29", "Published", "China candle antidumping order continued for five more years",
       "After the fifth sunset review, Commerce continued the 1986 antidumping duty order on petroleum wax candles from China (3406.00.00), having found that revocation "
       "would likely lead to dumping margins of up to 104.33%. The order covers scented or unscented candles of petroleum wax with fiber or paper-cored wicks in the "
       "listed shapes (tapers, pillars, votives, wax-filled containers and others); the written scope, not the HTS number, decides.",
       None, None, "China", ["fr-2021-23560", "fr-2021-14710"]),
]
for c in changes:
    assert " " not in c["id"], c["id"]
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "48 of 48 lines", "note": "Free to 6.5%"},
    {"label": "Section 301 economies", "value": "60", "note": "+10% or +12.5%; Brazil a further +25%"},
    {"label": "Canadian candles", "value": "+50%", "note": "Section 338, since August 22, 2026"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]

# ---------------------------------------------------------------- industryAreas (non-trade parts)
ia = d["industryAreas"]
ia["h1"] = f"HTS Chapter 34: {SHORT} — Tariff Rates by Country"
for g in ia["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["shortLabel"] = G["short"]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 19, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 34 subheading is on the Section 301 "
    "general exemption lists (note 52(b)–(d)), the country lists of note 52(j), or the Brazil exemption list (note 50(a)(ii)); five (3401.30.10, 3402.42.10, "
    "3402.42.20, 3402.42.90, 3402.50.11) are exempt only for pharmaceutical use (notes 52(e) and 50(a)(v)), which the table does not assume. Of the Canada "
    "Section 338 lists (note 51), only candles (3406.00.00, list (b)(3)) appear. China: 34 subheadings are on List 3, three on List 2 and two on List 4A "
    "(note 20); the only exclusion in effect is 3401.19.00.00 (note 20(vvv)(iv), through November 9, 2026). No Chapter 34 line is on the note 16(c) metals "
    "lists; 16 are on note 19(k), which now matters only for Russia's 200% (9903.85.68). The ended reciprocal tariff and Section 122 surcharge exempted only 3402.42."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = f"HTS Chapter 34: {SHORT} — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Soap, Detergent & Candles: FDA, EPA, CPSC Rules & Legal Ways to Lower Duty (HTS Ch. 34) | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 34 line — FDA's soap vs cosmetic vs drug line, antibacterial soap ingredients, EPA registration for disinfecting cleaners, TSCA certification, the CPSC lead-wick candle ban, aerosol hazmat — the China candle antidumping order, and legal ways to pay less duty.",
    "keywords": [
        "import soap requirements fda",
        "is soap a cosmetic fda",
        "antibacterial soap fda rule",
        "import candles from china antidumping",
        "lead wick candles ban",
        "tsca certification import",
        "usmca rules of origin chapter 34",
        "chapter 34 tariff engineering strategies",
    ],
}
te["intro"] = (
    "What decides the duty on Chapter 34 goods today is mostly **origin**: USMCA goods of Canada and Mexico enter Free (except Canadian candles, 50%), "
    "the 60 Section 301 economies pay 10% or 12.5% on top of a base rate of up to 6.5%, and Chinese goods pay up to 37.5% more. Candles of petroleum wax "
    "from China also carry an **antidumping duty** that the tariff calculator does not include.\n\n"
    "The paperwork depends on what the product claims to do. FDA decides whether a cleanser is \"soap\", a cosmetic or an over-the-counter drug; EPA "
    "registers cleaners that claim to disinfect; most chemical products need a TSCA certification; CPSC bans lead-cored candle wicks; and aerosol "
    "lubricants and polishes are hazardous materials in transport. Each rule and lever below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican goods",
        "saves": "The base rate (up to 6.5%) and the 10% Section 301 duty on Canada (9903.05.29) or Mexico (9903.05.55): a 3.7% detergent goes from 13.7% to Free",
        "appliesTo": "All 48 lines, for originating goods of Canada or Mexico (not the 50% on Canadian candles)",
        "document": "A USMCA certification of origin from the importer, exporter or producer, meeting the Chapter 34 product-specific rule in General Note 11: a change of heading for soap (3401) and for polishes, candles and modeling pastes (3405–3407); a change of subheading, or a regional value content of at least 60% (transaction value) or 50% (net cost), for surfactants, lubricants and waxes (3402–3404).",
        "caveat": "The 50% Section 338 duty on Canadian candles applies even under USMCA. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ECFR + "title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (USMCA rules of origin)", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 51 and 52(g)–(h)", "url": CH99},
        ],
    },
    {
        "id": "origin",
        "title": "Compare supplier countries — the extra duty ranges from 0 to 37.5%",
        "saves": "Up to 37.5% of value: for candles, 12.5% from Vietnam, 10% from India or the EU, Free from Mexico under USMCA, against 20% plus antidumping duty from China and 50% from Canada",
        "appliesTo": "All 48 lines",
        "document": "Commercial invoice and production records showing where the goods were made. For blends and refills, origin follows where the goods were last substantially transformed; ask CBP for a binding ruling when a Chinese concentrate is diluted or packed elsewhere.",
        "caveat": "Diluting, mixing or repacking in a third country does not always change origin. The antidumping order follows its own scope and country rules, separate from the tariff origin.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20 and 52", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": ECFR + "title-19/part-177"},
        ],
    },
    {
        "id": "pharma-use",
        "title": "Claim the pharmaceutical-use exemption for listed surfactants",
        "saves": "The 10% or 12.5% Section 301 duty (and Brazil's 25%) on goods for use in pharmaceutical applications",
        "appliesTo": "3401.30.10, 3402.42.10, 3402.42.20, 3402.42.90 and 3402.50.11",
        "document": "Entry under 9903.05.89 (Brazil: 9903.05.06) with records showing the goods are for use in pharmaceutical applications.",
        "caveat": "Only those five subheadings and only that end use; the same surfactants for detergents or cosmetics pay the duty. It does not remove China's List 3 duty.",
        "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 50(a)(v) and 52(e)", "url": CH99}],
    },
    {
        "id": "classification",
        "title": "Get the line right — several pairs differ only by formula",
        "saves": "Up to 6.5% of value: liquid skin cleansers and retail detergents are Free unless they contain an aromatic or modified aromatic surfactant (then 4%); lubricants with 50% or more petroleum oil pay 0.2% instead of 1.4% to 6.1%",
        "appliesTo": "3401.30, 3402.50, 3403.11, 3403.19",
        "document": "The formula (surfactant types, petroleum-oil content) and, when the line is unclear, a binding ruling from CBP before importing.",
        "caveat": "Classification follows the goods as imported; change the formula only for real product reasons. Shampoo, bath foam and shaving cream are Chapter 33, and lubricants with 70% or more petroleum oil Chapter 27 (chapter note 1; heading 3403).",
        "citations": [
            {"label": "HTSUS Chapter 34 (notes and headings)", "url": CH34},
            {"label": "19 CFR part 177 (rulings)", "url": ECFR + "title-19/part-177"},
        ],
    },
    {
        "id": "candle-scope",
        "title": "Check the candle antidumping scope before buying from China",
        "saves": "The whole antidumping duty, when the candle is outside the order",
        "appliesTo": "3406.00.00, candles of China",
        "document": "The order's written scope: candles made from petroleum wax with fiber or paper-cored wicks, in the listed shapes. When a candle's wax blend or shape makes coverage unclear, request a scope ruling from Commerce.",
        "caveat": "A candle inside the scope pays the cash deposit at the exporter's rate whatever its HTS line. Antidumping duties cannot be refunded as drawback.",
        "citations": [
            {"label": "86 FR 59984 (order continued, scope)", "url": "https://www.federalregister.gov/documents/2021/10/29/2021-23560/petroleum-wax-candles-from-the-peoples-republic-of-china-continuation-of-the-antidumping-duty-order"},
            {"label": "19 CFR 351.225 (scope rulings)", "url": ECFR + "title-19/section-351.225"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on goods that are exported",
        "saves": "Up to 99% of the duties paid on goods re-exported unused or used to make exported products",
        "appliesTo": "All 48 lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191). CBP's Section 301 FAQ says Section 301 duties are eligible for drawback.",
        "caveat": "Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)).",
        "citations": [
            {"label": "19 CFR part 191", "url": ECFR + "title-19/part-191"},
            {"label": "19 CFR 191.3", "url": ECFR + "title-19/section-191.3"},
            {"label": "CBP: Section 301 trade remedies FAQs", "url": "https://www.cbp.gov/trade/programs-administration/entry-summary/section-301-trade-remedies/faqs"},
        ],
    },
]
te["rules"] = [
    {
        "id": "fda-soap",
        "agency": "FDA",
        "title": "Soap vs cosmetic: only alkali salts of fatty acids sold only as soap are \"soap\" (outside FDA's cosmetic rules); synthetic-detergent cleansers for the body are cosmetics",
        "citations": [{"label": "21 CFR 701.20", "url": ECFR + "title-21/section-701.20"}],
    },
    {
        "id": "fda-cosmetic",
        "agency": "FDA",
        "title": "Cosmetics (liquid hand soap, body wash): facility registration and product listing under the Modernization of Cosmetics Regulation Act of 2022",
        "citations": [
            {"label": "FDA: Registration and Listing of Cosmetic Product Facilities and Products", "url": "https://www.fda.gov/cosmetics/registration-listing-cosmetic-product-facilities-and-products"},
            {"label": "FDA: MoCRA", "url": "https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022-mocra"},
        ],
    },
    {
        "id": "fda-otc",
        "agency": "FDA",
        "title": "Antibacterial (antiseptic) hand and body washes are OTC drugs: washes with any of 19 listed ingredients, including triclosan and triclocarban, need FDA new-drug approval, and foreign drug establishments must register with FDA",
        "citations": [
            {"label": "21 CFR 310.545(a)(27)", "url": ECFR + "title-21/section-310.545"},
            {"label": "81 FR 61106 (final rule, September 6, 2016)", "url": "https://www.federalregister.gov/documents/2016/09/06/2016-21337/safety-and-effectiveness-of-consumer-antiseptics-topical-antimicrobial-drug-products-for"},
            {"label": "21 CFR 207.17", "url": ECFR + "title-21/section-207.17"},
        ],
    },
    {
        "id": "epa-pesticide",
        "agency": "EPA / CBP",
        "title": "Cleaners and wipes that claim to disinfect or kill germs are pesticides: EPA registration and a Notice of Arrival before the shipment arrives",
        "citations": [
            {"label": "40 CFR 152.15", "url": ECFR + "title-40/section-152.15"},
            {"label": "19 CFR 12.111", "url": ECFR + "title-19/section-12.111"},
            {"label": "19 CFR 12.112", "url": ECFR + "title-19/section-12.112"},
        ],
    },
    {
        "id": "tsca",
        "agency": "EPA / CBP",
        "title": "Chemical substances and mixtures (surfactants, detergents, lubricants, waxes): TSCA import certification (positive or negative) at entry",
        "citations": [{"label": "19 CFR 12.121", "url": ECFR + "title-19/section-12.121"}],
    },
    {
        "id": "cpsc-wicks",
        "agency": "CPSC",
        "title": "Candles with metal-cored wicks: banned unless the core is no more than 0.06% lead, and shipping cartons must say \"Conforms to 16 CFR 1500.17(a)(13)\"",
        "citations": [{"label": "16 CFR 1500.17(a)(13)", "url": ECFR + "title-16/section-1500.17"}],
    },
    {
        "id": "cpsc-art",
        "agency": "CPSC",
        "title": "Modeling clay and dough for children: art-material hazard labeling (ASTM D-4236) and a Children's Product Certificate",
        "citations": [
            {"label": "16 CFR 1500.14(b)(8)", "url": ECFR + "title-16/section-1500.14"},
            {"label": "16 CFR 1110.11", "url": ECFR + "title-16/section-1110.11"},
        ],
    },
    {
        "id": "dot-aerosol",
        "agency": "U.S. DOT (PHMSA)",
        "title": "Products in aerosol cans (spray lubricants, polishes, foaming cleansers): hazardous materials (UN1950) for shipping papers, marking and packaging",
        "citations": [
            {"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": ECFR + "title-49/section-172.101"},
            {"label": "49 CFR 173.306", "url": ECFR + "title-49/section-173.306"},
        ],
    },
    {
        "id": "ad-candles",
        "agency": "Commerce (ITA) / CBP",
        "title": "Petroleum wax candles from China: antidumping duty cash deposit at the exporter's rate (not in the tariff calculator)",
        "citations": [
            {"label": "86 FR 59984 (order continued, October 29, 2021)", "url": "https://www.federalregister.gov/documents/2021/10/29/2021-23560/petroleum-wax-candles-from-the-peoples-republic-of-china-continuation-of-the-antidumping-duty-order"},
            {"label": "91 FR 56205 (sixth five-year review, September 1, 2026)", "url": "https://www.federalregister.gov/documents/2026/09/01/2026-17862/petroleum-wax-candles-from-china-institution-of-a-five-year-review"},
        ],
    },
    {
        "id": "marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on each retail article or its container (soap bars, detergent bottles, candles)",
        "citations": [{"label": "19 CFR 134.11", "url": ECFR + "title-19/section-134.11"}],
    },
]
GROUP_RULES = {
    "3401": (["fda-soap", "fda-cosmetic", "fda-otc", "epa-pesticide", "tsca", "marking"],
             "Which agency applies depends on the claims: true soap sold only as soap is outside FDA's cosmetic rules; other body cleansers are cosmetics; antibacterial washes are OTC drugs; wipes claiming to disinfect need EPA registration."),
    "3402": (["tsca", "epa-pesticide", "dot-aerosol", "marking"],
             "Bulk surfactants and detergents need a TSCA certification. Cleaners that claim to disinfect or sanitize are pesticides under EPA rules. The nonionic surfactants of 3402.42 were the only Chapter 34 lines exempt from the 2025 reciprocal tariff and the Section 122 surcharge."),
    "3403": (["tsca", "dot-aerosol"],
             "Lubricants with 70% or more petroleum oil are classified in Chapter 27. Spray lubricants in aerosol cans are hazardous materials in transport."),
    "3404": (["tsca"], "Unmixed beeswax (1521) and paraffin wax (2712) are not in this heading. No antidumping order covers waxes."),
    "3405": (["tsca", "dot-aerosol", "marking"], "Aerosol polishes are hazardous materials in transport. Polishes in liquid or paste form, including waxes dispersed in a liquid, belong here rather than in 3404 (chapter note 5)."),
    "3406": (["cpsc-wicks", "ad-candles", "marking"],
             "Candles of petroleum wax from China are under the 1986 antidumping order (sixth review started September 1, 2026); candles of Canada pay 50% under Section 338 since August 22, 2026."),
    "3407": (["cpsc-art", "marking"], "Modeling pastes are not on any China Section 301 list, so Chinese modeling clay pays only the 12.5% 2026 duty."),
}
for g in te["groups"]:
    G = GROUPS[g["heading"]]
    g["label"] = G["label"]
    g["ruleIds"], g["note"] = GROUP_RULES[g["heading"]]
PHARMA = {"3401.30.10", "3402.42.10", "3402.42.20", "3402.42.90", "3402.50.11"}
CLASSIF = ("3401.30", "3402.50", "3403.11", "3403.19")
for ln in te["lines"]:
    h = ln["heading"]
    sub = ln["hts"][:10]
    rules = list(GROUP_RULES[h][0])
    if h == "3401":
        rules = ["fda-soap", "fda-otc", "tsca", "marking"] + (["fda-cosmetic", "epa-pesticide"] if sub.startswith("3401.30") or sub.startswith("3401.19") else [])
    if h == "3407":
        rules = ["cpsc-art", "marking"] if sub == "3407.00.20" else ["tsca", "marking"]
    ln["ruleIds"] = rules
    levers = ["usmca", "origin"]
    if sub in PHARMA:
        levers.append("pharma-use")
    if sub.startswith(CLASSIF):
        levers.append("classification")
    if h == "3406":
        levers.append("candle-scope")
    levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Antidumping rates are exporter-specific and change with "
    "each administrative review; check Commerce's latest notice and CBP's cash-deposit instructions before importing candles from China."
)

apply_trade(d)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("ok")
