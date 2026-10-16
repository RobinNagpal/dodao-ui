"""Fill the writer TODOs of the generated Chapter 25 content file.

usage: python3 fill25.py <generated.json> <out.json>

Regenerate + refill (from insights-ui/):
  pnpm tariff:generate-chapter --chapter 25 --slug 25-salt-sulfur-and-cements \
    --title "Salt; Sulfur; Earths and Stone; Plastering Materials, Lime and Cement" \
    --countries CA,TR,MX,VN,PE,CN,ES,CL,EG,GR,IN,BR --out $S/gen.json --force
  python3 $S/fill25.py $S/gen.json src/tariff-data/chapters/25-salt-sulfur-and-cements.json && npx prettier --write <that file>
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from static25 import CH99, CHAPTER_NOTES, ECFR, ECFR_AS_OF, EXTRA_SOURCES, GROUPS, SUGGESTIONS_DATE  # noqa: E402

d = json.load(open(sys.argv[1]))
NAME = "Salt, Sulfur, Earths & Stone, Lime and Cement"
H = f"HTS Chapter 25: {NAME}"


def b(usd):
    return f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M"


def pct(a, p):
    return f"{(a - p) / p * 100:+.0f}%"


# ---------------------------------------------------------------- trade figures
u = d["understandIndustry"]
yr, pyr = u["latestYear"], u["priorYear"]
tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
T, P = tot[yr], tot[pyr]
peak = max(tot.items(), key=lambda kv: kv[1])
trade = json.load(open(os.path.join(os.getcwd(), "src/tariff-data/trade/chapter-25.json")))
byc = {c["country"]: c for c in trade["byCountry"]}
head = {h["heading"]: h["byYear"] for h in trade["byHeading"]}
hc = {(r["country"], r["heading"]): r["importsUsd"] for r in trade["byHeadingCountry"]}
line = {l["hs6"]: l for l in trade["byHs6"]}


def H6(code):
    return line[code]["importsUsd"]


def C(name):
    return byc[name]["importsUsd"]


cement = head["2523"][str(yr)]
cement_p = head["2523"][str(pyr)]
salt, salt_p = head["2501"][str(yr)], head["2501"][str(pyr)]
sulfur, sulfur_p = head["2503"][str(yr)], head["2503"][str(pyr)]
S = dict(
    T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", peak_y=peak[0], peak=b(peak[1]),
    ca=b(C("Canada")), ca_share=f"{C('Canada') / T * 100:.0f}%", tr=b(C("Türkiye")), mx=b(C("Mexico")), vn=b(C("Viet Nam")),
    pe=b(C("Peru")), cn=b(C("China")), es=b(C("Spain")), cl=b(C("Chile")), eg=b(C("Egypt")), gr=b(C("Greece")), inn=b(C("India")),
    br=b(C("Brazil")), jp=b(C("Japan")),
    cement=b(cement), cement_p=b(cement_p), cement_share=f"{cement / T * 100:.0f}%",
    gray=b(H6("252329")), white=b(H6("252321")), clinker=b(H6("252310")),
    tr_cem=b(hc[("Türkiye", "2523")]), ca_cem=b(hc[("Canada", "2523")]), vn_cem=b(hc[("Viet Nam", "2523")]), mx_cem=b(hc[("Mexico", "2523")]),
    eg_cem=b(hc[("Egypt", "2523")]), gr_cem=b(hc[("Greece", "2523")]),
    salt=b(salt), salt_p=b(salt_p), salt_chg=pct(salt, salt_p), cl_salt=b(hc[("Chile", "2501")]), ca_salt=b(hc[("Canada", "2501")]),
    mx_salt=b(hc[("Mexico", "2501")]), eg_salt=b(hc[("Egypt", "2501")]), es_salt=b(hc[("Spain", "2501")]), bs_salt=b(hc[("Bahamas", "2501")]),
    sulfur=b(sulfur), sulfur_p=b(sulfur_p), ca_sulfur=b(hc[("Canada", "2503")]),
    pe_phos=b(hc[("Peru", "2510")]), cn_mag=b(hc[("China", "2519")]), cn_gra=b(hc[("China", "2504")]), gra=b(head["2504"][str(yr)]),
    barite=b(head["2511"][str(yr)]), in_bar=b(hc[("India", "2511")]), fluor=b(H6("252922") + H6("252921") if "252921" in line else H6("252922")),
    mx_fluor=b(hc[("Mexico", "2529")]), stone=b(head["2515"][str(yr)] + head["2516"][str(yr)]), gypsum=b(head["2520"][str(yr)]),
    ca_share_n=C("Canada") / T * 100,
)
print({k: v for k, v in S.items()})

# ---------------------------------------------------------------- overview
o = d["overview"]
o["h1"] = f"{H} — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 25 Tariffs: Cement, Salt, Gypsum, Stone & Graphite Import Duties | KoalaGains",
    "shortDescription": (
        "Searchable duty table for all 101 HTS Chapter 25 lines — cement and clinker, salt, sulfur, gypsum, lime, sand, granite and marble blocks, "
        "graphite, barite, fluorspar and more. Base rates, the 2026 Section 301 rates and exemptions, China's 25–37.5%, and the antidumping order on Japanese cement."
    ),
    "keywords": [
        "HTS Chapter 25",
        "cement tariffs",
        "salt tariffs",
        "construction materials tariffs",
        "building materials tariffs",
        "cement import duty",
        "hs code for cement",
        "hs code for salt",
        "graphite tariffs",
    ],
}
o["intro"] = (
    "Chapter 25 covers salt, sulfur, earths and stone, plastering materials, lime and cement — the bulk minerals behind construction and industry: portland cement "
    "and clinker, road and table salt, gypsum, lime, sand and gravel, granite and marble blocks, and industrial minerals such as natural graphite, barite, fluorspar, "
    f"magnesia, kaolin and talc. **91 of the 101 tariff lines are Free** under the general rate; the rest are cut stone, crude barite, calcined dolomite and "
    f"micaceous iron oxides at 2.8–3% or $1.25/t. The U.S. imported **{S['T']}** of these goods in {yr}, {S['cement']} of it cement.\n\n"
    "What decides the duty today is the country. The **2026 Section 301 tariffs** add 10% or 12.5% on goods of 60 economies — Türkiye and Vietnam cement and "
    "Chilean salt pay 12.5% — but 19 subheadings of critical and industrial minerals (sulfur, natural graphite, phosphate rock, barite, magnesia, fluorspar and "
    "others) are on the exemption list in U.S. note 52(b). USMCA goods of Canada and Mexico are exempt, so most Canadian and Mexican cement, salt and gypsum enter "
    "Free. China pays 25% under List 3 plus 12.5% — 37.5% extra on most lines — and natural graphite from China 25% since January 1, 2026. Gray portland cement "
    "from Japan also carries an **antidumping duty**, which the tariff calculator does not include."
)
for st in o["stats"]:
    if st["label"].startswith("Lines with an extra duty"):
        st["note"] = "2026 Section 301 on 74 lines (USMCA goods exempt); China List 3 on 84 lines"
    if st["label"].startswith("Canada + "):
        st["label"] = "Canada + Türkiye share"
for g in o["productGroups"]:
    G = GROUPS[g["heading"]]
    g["label"], g["blurb"], g["searchExamples"] = G[0], G[2], G[3]
ts = o["tradeSnapshot"]
ts["topCountries"] = [{"name": "Canada", "importsUsd": C("Canada")}, {"name": "Türkiye", "importsUsd": C("Türkiye")}]
ts["biggestLines"] = [{"hts": "2523.29", "label": "Portland cement (gray)"}, {"hts": "2501.00", "label": "Salt"}]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
o["notes"] = {"chapterNotes": CHAPTER_NOTES, "additionalUsNotes": None}
o["workedExamples"] = [
    {
        "title": "A cargo of portland cement from Türkiye",
        "line": "2523.29.00.00",
        "body": (
            "Gray portland cement is **Free** under the general rate, but it is not on the U.S. note 52(b) exemption list, so goods of Türkiye pay the **12.5%** "
            "2026 Section 301 duty (9903.05.79). On a $1,000,000 cargo that is **$125,000**. The same cement from Canada or Mexico is Free when entered under "
            "USMCA (9903.05.93 / 9903.05.94); from Vietnam or Egypt it is also 12.5%, from Greece or Spain 10% (the EU rate, 9903.05.39)."
        ),
    },
    {
        "title": "Road salt from Chile vs. Canada",
        "line": "2501.00.00.00",
        "body": (
            "Salt is Free under the general rate. Chilean salt pays the **12.5%** Section 301 duty on Chile (9903.05.30) even with a U.S.–Chile FTA claim, "
            "because note 52(a) keeps the duty for FTA goods: $600,000 of rock salt pays **$75,000**. Canadian salt entered under USMCA pays **$0**. Between "
            "August 22 and September 14, 2026, Canadian salt and portland cement paid an extra **50%** under Section 338 (9903.03.14), USMCA or not, until "
            "Proclamation 11065 took them off the list."
        ),
    },
    {
        "title": "Natural flake graphite from China",
        "line": "2504.10.10.00",
        "body": (
            "Crystalline flake graphite is Free under the general rate and on the note 52(b) exemption list, so the 12.5% 2026 Section 301 duty on China does "
            "not apply. Since **January 1, 2026** Chinese natural graphite pays **25%** (9903.91.06, from the 2024 four-year review): $200,000 of flake pays "
            "**$50,000**. Flake from Mozambique, Madagascar or Brazil pays nothing extra. The ITC voted on April 3, 2026 not to impose antidumping or "
            "countervailing duties on active anode material from China, so no AD/CVD order applies."
        ),
    },
    {
        "title": "Granite blocks cut into slabs, from Brazil",
        "line": "2516.12.00.30",
        "body": (
            "Granite merely cut into slabs at least 7.5 cm thick carries a **2.8%** base rate. Goods of Brazil add the 25% Brazil Section 301 duty (9903.05.01) "
            "and the 12.5% 2026 Section 301 duty (9903.05.27): **40.3%** in total, or $40,300 on $100,000. From India the same slabs pay 12.8% (2.8% + 10%); "
            "from Italy or Spain 10% (the EU rate replaces the 2.8%). Polished or edged slabs and countertops are classified in heading 6802, not here."
        ),
    },
]

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = f"{H} — Tariff Updates"
tu["seo"] = {
    "title": "HTS Chapter 25 Tariff Updates — Cement, Salt, Graphite & Stone Tariffs Since 2025 | KoalaGains",
    "shortDescription": (
        "What changed for cement, salt, sulfur, gypsum, stone and graphite imports since January 2025: the IEEPA duties and their end, the 2026 Section 122 "
        "surcharge, the 2026 Section 301 tariffs and their mineral exemptions, the 50% Section 338 duty on Canadian salt and cement and its reversal, and China's "
        "graphite tariff — with Federal Register citations."
    ),
    "keywords": [
        "cement tariffs 2026",
        "tariff on canadian cement",
        "cement tariff reversal canada",
        "50 tariff on cement",
        "graphite tariffs china",
        "salt tariffs",
        "construction materials tariffs",
        "section 301 tariffs 2026",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** "
    "(in force October 9, 2026). The base rates of all 101 Chapter 25 lines are the same in both.\n\n"
    "The extra duties changed a lot. In 2025, non-USMCA goods of Canada and Mexico paid IEEPA duties and goods of most other countries the reciprocal tariff "
    "(10%, later higher by country) — except 18 mineral subheadings such as graphite, barite, magnesia and fluorspar. Those duties **ended on February 24, 2026**; "
    "the 10% Section 122 surcharge that followed ran until July 23, 2026. Since **July 24, 2026** the **2026 Section 301 tariffs** apply 10% or 12.5% to goods of "
    "60 economies, with 19 Chapter 25 subheadings exempt (U.S. note 52(b)) and USMCA goods exempt. Canadian salt and cement also paid a **50% Section 338** duty "
    "from August 22 to September 14, 2026. China pays its 2018–2019 List 3 duty on top, and natural graphite from China pays 25% since January 1, 2026.\n\n"
    "The antidumping order on **gray portland cement and clinker from Japan** is listed below for reference; antidumping duties are set by the Commerce "
    "Department and are **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 25 from any country (the 2026 Section 301 actions on 60 economies and Brazil, China's Section 301 lists, the Russia "
    "rates in lieu of column 2, the ended Section 338, IEEPA and Section 122 duties) plus the antidumping order on cement from Japan, which the tariff calculator "
    "does not model. For the rate each supplier pays, see Rates by country."
)

E52 = "19 Chapter 25 subheadings are exempt under U.S. note 52(b) (9903.05.86): sulfur, natural graphite, phosphate rock, barite, magnesite and magnesia (except 2519.90.50), chrysotile and amosite asbestos (2524.90), fluorspar, kieserite and Epsom salts, and the other minerals of 2530.90."
IEEPA_END = "The IEEPA duties ended February 24, 2026, and the Section 122 surcharge expired July 23, 2026."
INEFFECT = {
    "ca-section-301": (
        f"Does not apply to goods entered under USMCA (9903.05.93, U.S. note 52(g)). {E52} The 50% Section 338 duty on Canadian salt (2501.00.00) and portland cement (2523.29.00) applied from August 22 to September 14, 2026 and was removed by Proclamation 11065. {IEEPA_END}",
        "Non-USMCA Canadian cement, salt, gypsum or stone pays 10% of its value; the same goods with a USMCA claim pay only the base rate (mostly Free).",
    ),
    "mx-section-301": (
        f"Does not apply to goods entered under USMCA (9903.05.94, U.S. note 52(h)). {E52} {IEEPA_END}",
        "Non-USMCA Mexican cement, salt and gypsum pay 10%; with a USMCA claim they pay only the base rate. Mexican fluorspar is exempt either way.",
    ),
    "tr-section-301": (
        f"{E52} No Türkiye-specific product list covers Chapter 25. The 15% IEEPA reciprocal rate of 2025 ended February 24, 2026.",
        "Turkish cement and marble pay 12.5% on top of the base rate: $1,000,000 of cement pays $125,000; cut travertine pays 15.5% (3% + 12.5%).",
    ),
    "vn-section-301": (
        f"{E52} No Vietnam-specific product list covers Chapter 25. The 20% IEEPA reciprocal rate of 2025 ended February 24, 2026.",
        "Vietnamese cement and clinker pay 12.5% of their value; barite from Vietnam is exempt.",
    ),
    "pe-section-301": (
        f"{E52} A U.S.–Peru TPA claim does not remove the duty (note 52(a)). Peru's main export to the U.S. in this chapter, phosphate rock (2510), is on the exemption list.",
        "Peruvian phosphate rock pays no extra duty; other Peruvian Chapter 25 goods pay 12.5%.",
    ),
    "cn-section-301": (
        "List 3 (9903.88.03, U.S. note 20(f)) covers 64 Chapter 25 subheadings at 25%; not covered are natural graphite (moved to 9903.91.06, 25% from January 1, 2026), fire-clay (2508.30), barite (2511.10), magnesite and magnesia (2519), talc (2526), fluorspar (2529.21, 2529.22) and 2530.90.80. "
        f"The 12.5% 2026 duty (9903.05.31) stacks on top except for the note 52(b) subheadings. USTR confirmed on October 7, 2026 that the 2018 actions continue during their four-year review. {IEEPA_END}",
        "Most Chinese Chapter 25 goods pay 37.5% (25% + 12.5%); sulfur, phosphate rock, natural graphite, kieserite and Epsom salts 25%; talc and fire-clay 12.5%; magnesia (except 2519.90.50), barite and fluorspar no extra duty.",
    ),
    "eu-section-301": (
        f"For goods of EU member states the total is 10% when the base rate is lower (U.S. note 52(k)): Free lines pay 10%, the 2.8–3% stone lines also 10% in total. {E52} The 15% IEEPA rate for the EU ended February 24, 2026.",
        "Spanish salt and gypsum, Greek cement and Italian marble pay 10% of their value in total.",
    ),
    "cl-section-301": (
        f"{E52} A U.S.–Chile FTA claim does not remove the duty (note 52(a)). Salt, Chile's main export to the U.S. in this chapter, is not on the exemption list.",
        "Chilean road salt pays 12.5%: $600,000 of salt pays $75,000.",
    ),
    "eg-section-301": (f"{E52} No Egypt-specific product list covers Chapter 25.", "Egyptian cement and salt pay 12.5% of their value."),
    "in-section-301": (
        f"{E52} No India-specific product list covers Chapter 25. India's main export here, barite (2511.10), is exempt. The IEEPA duties on India ended February 24, 2026.",
        "Indian barite pays no extra duty; Indian granite slabs pay 12.8% (2.8% + 10%).",
    ),
    "br-section-301": (
        "The 25% Brazil duty (9903.05.01) exempts 20 Chapter 25 subheadings under U.S. note 50(a)(ii) (9903.05.03) — the note 52(b) list minus sulfur, plus kaolin (2507) and crude mica (2525.10) — and the 12.5% 2026 duty exempts the 19 note 52(b) subheadings. The 40% IEEPA duty on Brazil ended February 24, 2026.",
        "Brazilian granite slabs pay 40.3% (2.8% + 25% + 12.5%); Brazilian graphite, phosphate rock and fluorspar pay nothing extra; kaolin and crude mica 12.5%; sulfur 25%.",
    ),
    "ru-section-301": (
        "Russia pays column 2 rates (general note 3(b)). For salt (2501), diatomite (2512), slate (2514), 'other' magnesia (2519.90.50) and 2530.90.80, 35% replaces the column 2 rate (9903.90.08, U.S. note 30, since July 27, 2022). The 12.5% Section 301 duty (9903.05.66) is added except on the note 52(b) subheadings.",
        "Russian salt pays 47.5% (35% + 12.5%); other Russian Chapter 25 goods pay their column 2 rate plus 12.5% unless exempt.",
    ),
    "other-section-301": (
        f"{E52} Rates: 10% for some economies (e.g. Argentina, Ecuador, Malaysia, Pakistan, Trinidad and Tobago, the United Kingdom), 12.5% for others (e.g. Algeria, the Bahamas, Colombia, Morocco, Saudi Arabia, the UAE); Japan, South Korea, Switzerland and Taiwan pay a total of 12.5% or 10% in place of a lower base rate. Countries outside the 60, such as Laos, Madagascar and Mozambique, pay only the base rate.",
        "Bahamian salt and Colombian or Algerian cement pay 12.5%; British goods 10%; Laotian barite and Malagasy graphite nothing extra.",
    ),
}
for x in tu["inEffect"]:
    if x["id"] in INEFFECT:
        x["exemption"], x["whatItMeans"] = INEFFECT[x["id"]]
    extra = (["procl-11048", "procl-11065"] if x["id"] == "ca-section-301" else []) + (["eo-14389"] if "IEEPA" in x["exemption"] else [])
    for sid in extra:
        if sid not in x["sourceIds"]:
            x["sourceIds"].append(sid)
    if x["id"] == "cn-section-301" and "fr-2026-20510" not in x["sourceIds"]:
        x["sourceIds"].append("fr-2026-20510")

have = {s["id"] for s in tu["sources"]}
for s in EXTRA_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])

GEN_DETAIL = {
    "section-301-nicaragua-scheduled-2027-01-01": (
        "Section 301 tariff on Nicaragua phases in from 2027",
        "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), with no exemption list for Chapter 25. The rate is 0% in 2026.",
    ),
    "section-338-canada-end-2026-09-14": (
        "Section 338 duty on Canadian salt and cement removed",
        "Proclamation 11065 took salt (2501.00.00) and other portland cement (2523.29.00) off the 9903.03.14 list for goods entered from September 15, 2026, along with other subheadings. Since then Canadian salt and cement pay only the 2026 Section 301 rate (10%, or nothing with a USMCA claim).",
    ),
    "section-338-canada-2026-08-22": (
        "50% Section 338 duty on Canadian salt and cement",
        "Proclamation 11048 (signed July 20, 2026) imposed a 50% duty under section 338 of the Tariff Act on listed products of Canada (9903.03.14, U.S. note 51(b)(3)), including salt (2501.00.00) and other portland cement (2523.29.00). Proclamation 11056 moved the start from August 19 to August 22, 2026. The duty applied even to goods entered under USMCA (note 51(a)).",
    ),
    "section-301-2026-60-economies-2026-07-24": (
        "2026 Section 301 tariffs on 60 economies take effect",
        "10% or 12.5% on goods of 60 economies (9903.05.20–9903.05.84), on top of the base rate, including Türkiye, Vietnam, Chile, Egypt, Peru, India, the EU (10% in total) and non-USMCA goods of Canada and Mexico. 19 Chapter 25 subheadings are exempt under U.S. note 52(b) (9903.05.86); the other 74 lines are covered.",
    ),
    "section-301-brazil-2026-07-22": (
        "25% Section 301 tariff on Brazil takes effect",
        "25% on goods of Brazil (9903.05.01), on top of the base rate and the 12.5% 2026 duty. 20 Chapter 25 subheadings are exempt under U.S. note 50(a)(ii) (9903.05.03), including graphite, phosphate rock, barite, kaolin, crude mica and fluorspar; granite and other stone are covered.",
    ),
    "section-301-china-2024-four-year-review-2026-01-01": (
        "25% Section 301 tariff on natural graphite from China",
        "As announced in the 2024 four-year review, natural graphite of China (2504.10.10, 2504.10.50, 2504.90.00) pays 25% from January 1, 2026 (9903.91.06, U.S. note 31(g)); before that it was not covered by the China Section 301 lists.",
    ),
}
base = []
for c in tu["changes"]:
    if c["id"] in GEN_DETAIL:
        c["title"], c["detail"] = GEN_DETAIL[c["id"]]
    if c["type"] == "baseRate":
        c["detail"] = "All 101 Chapter 25 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition; no line was added, removed or renumbered."
    if c["id"] == "section-338-canada-2026-08-22":
        c["now"] = "+50% (ended)"
    if c["id"] == "section-338-canada-end-2026-09-14":
        c["now"] = "None"
    base.append(c)


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


changes = base + [
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 duties continue during the four-year review",
       "USTR received requests to continue the 2018 China actions, so they did not terminate on their 2026 anniversaries and remain in effect during the statutory review. The 25% List 3 duty on Chinese salt, cement, stone and other Chapter 25 goods continues.",
       None, None, "China", ["fr-2026-20510"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026; the 2026 Section 301 tariffs took over the next day.",
       "+10%", "None", "All", ["procl-11012", "hts-chapter-99"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply — and still lift the 2026 Section 301 duty on Canadian and Mexican goods.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("aam-itc-negative", "reference", "2026-04-03", "Published", "No antidumping or countervailing duties on graphite anode material from China",
       "Commerce found dumping and subsidies on active anode material from China (final determinations of February 17, 2026), but the ITC determined that the U.S. industry was not materially retarded, so no orders were issued. The investigation covered goods of 2504.10.10 and 2504.10.50 (natural graphite) as well as 3801.",
       None, None, "China", ["fr-2026-06488", "fr-2026-02998"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. USMCA goods of Canada and Mexico were exempt, and so were the same 18 mineral subheadings as under the reciprocal tariff (9903.03.03); sulfur, salt, cement, gypsum and stone paid.",
       None, "+10% (ended)", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("critical-minerals-232", "reference", "2026-01-14", "Signed", "Section 232 on processed critical minerals: negotiations, no tariff",
       "Proclamation 11001 agreed with Commerce that imports of processed critical minerals and derivative products threaten national security, but directed Commerce and USTR to negotiate agreements (including possible price floors) instead of imposing tariffs. No Section 232 duty applies to graphite, fluorspar, barite or other Chapter 25 minerals.",
       None, None, "All", ["procl-11001"]),
    ch("reciprocal-country-rates", "extraDuty", "2025-08-07", "Effective", "Reciprocal tariff raised to country-specific rates",
       "Executive Order 14326 replaced the 10% baseline with country rates for goods entered from August 7, 2025 — for example 15% for Türkiye, 20% for Vietnam and 15% in total for the EU. The 18 exempt mineral subheadings stayed exempt. Ended February 24, 2026.",
       "+10%", "Higher country rates (ended)", "All except Canada, Mexico", ["eo-14326"]),
    ch("brazil-ieepa", "extraDuty", "2025-08-06", "Effective", "Extra 40% IEEPA duty on goods of Brazil",
       "Executive Order 14323 added 40% on goods of Brazil, on top of the reciprocal tariff, for goods entered from August 6, 2025; Brazilian granite and other stone paid it. Ended February 24, 2026.",
       None, "+40% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-08-01", "Effective", "Canada IEEPA duty raised to 35% on non-USMCA goods",
       "Raised the IEEPA duty on Canadian goods not entered under USMCA from 25% to 35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on most Chapter 25 goods",
       "10% baseline (9903.01.25) on products of all countries except Canada and Mexico, from April 5, 2025. 18 Chapter 25 subheadings — natural graphite, phosphate rock, barite, magnesite and magnesia (except 2519.90.50), chrysotile and amosite asbestos, fluorspar and the minerals of 2530.20 and 2530.90 — are on the exemption list printed in the schedule (U.S. note 2(v)(iii)(a)); cement, salt, sulfur, gypsum, lime and stone paid. Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257", "hts-chapter-99"]),
    ch("ca-mx-usmca", "extraDuty", "2025-03-06", "Signed", "USMCA goods exempted from the Canada and Mexico duties",
       "From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico, so USMCA-qualifying cement, salt and gypsum entered Free again. Ended February 24, 2026.",
       "+25%", "USMCA goods exempt (ended)", "Canada, Mexico", ["eo-14231", "eo-14232"]),
    ch("ca-mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duties on products of Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including Chapter 25 goods such as cement and salt. Ended February 24, 2026.",
       "None", "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194"]),
    ch("jp-cement-ad", "reference", "2023-02-10", "Published", "Antidumping order on cement and clinker from Japan continued",
       "After the fifth five-year review, Commerce continued the 1991 antidumping order on gray portland cement and cement clinker from Japan (2523.29, 2523.10 and, when entered there, 2523.90). Commerce found that dumping margins of up to 69.89% would be likely if the order were revoked. Microfine cement is excluded. Not included in the tariff calculator.",
       None, None, "Japan", ["fr-2023-02815", "fr-2022-21522"]),
    ch("asbestos-ban", "reference", "2024-03-28", "Published", "EPA bans most chrysotile asbestos imports",
       "EPA's TSCA rule prohibits importing chrysotile asbestos for chlor-alkali diaphragms after May 28, 2024 and for sheet gaskets after May 27, 2026, with limited phase-outs (40 CFR part 751, subpart I). This is an import ban, not a tariff.",
       None, None, "All", ["fr-2024-05972"]),
    ch("ru-col2-35", "extraDuty", "2022-07-27", "Effective", "35% in lieu of column 2 on certain Russian goods",
       "Proclamation 10420 set a 35% rate in place of the column 2 rate for listed products of Russia (9903.90.08, U.S. note 30), including salt (2501), diatomite (2512), slate (2514), 'other' magnesia (2519.90.50) and 2530.90.80. Still in force.",
       "Column 2 rate", "35%", "Russia", ["procl-10420", "hts-chapter-99"]),
    ch("mx-cement-revoked", "reference", "2009-04-06", "Published", "Antidumping order on Mexican cement revoked",
       "Commerce revoked the antidumping order on gray portland cement and clinker from Mexico after the 2006 U.S.–Mexico cement agreement, so Mexican cement carries no antidumping duty.",
       None, None, "Mexico", ["fr-e9-7692"]),
]
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "101 of 101 lines", "note": "91 Free"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (60 economies, Brazil, China); Russia 35%"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]
used = {i for c in tu["changes"] for i in c["sourceIds"]} | {i for x in tu["inEffect"] for i in x["sourceIds"]} | {"hts-now", "hts-before"}
tu["sources"] = [s for s in tu["sources"] if s["id"] in used]
SRC = {s["id"]: s for s in tu["sources"]}

# ---------------------------------------------------------------- understandIndustry
u["h1"] = f"{H} — U.S. Import Statistics"
u["seo"] = {
    "title": "U.S. Cement, Salt & Mineral Imports by Country — HTS Chapter 25 Import Statistics | KoalaGains",
    "shortDescription": (
        f"Where U.S. imports of cement, salt, sulfur, gypsum, stone and industrial minerals come from, 2020–{yr}: {S['T']} in {yr}, {S['ca_share']} from Canada, "
        f"cement from Türkiye, Canada and Vietnam, salt from Chile and Canada. By country, by product and over time, from UN Comtrade."
    ),
    "keywords": [
        "us cement imports by country",
        "where does the us import cement from",
        "where does the us get salt from",
        "us salt imports",
        "salt imports by country",
        "cement imports usa",
        "HTS Chapter 25 import statistics",
    ],
}
u["byYearPartners"] = ["Canada", "Türkiye"]
for st in u["stats"]:
    if st["label"].startswith("Top 2 share"):
        st["label"] = "Canada + Türkiye share"
    if st["label"] == "Largest product":
        st["note"] = "Gray portland cement (2523.29)"
u["why"] = (
    f"U.S. imports of Chapter 25 goods were **{S['T']} in {yr}**, {S['chg']} from {S['P']} in {pyr} and below the {S['peak_y']} peak of {S['peak']}. "
    f"**Cement** is the biggest item: {S['cement']} ({S['cement_share']}), mostly gray portland cement ({S['gray']}) plus white cement ({S['white']}) and "
    f"clinker ({S['clinker']}). It comes from **Türkiye** ({S['tr_cem']}), **Canada** ({S['ca_cem']}), **Vietnam** ({S['vn_cem']}), Mexico ({S['mx_cem']}), "
    f"Egypt ({S['eg_cem']}) and Greece ({S['gr_cem']}).\n\n"
    f"**Salt** imports rose to {S['salt']} ({S['salt_chg']} on {S['salt_p']}), led by Chile ({S['cl_salt']}) and Canada ({S['ca_salt']}), then Spain, Egypt, "
    f"Mexico and the Bahamas. **Sulfur** jumped to {S['sulfur']} from {S['sulfur_p']}, {S['ca_sulfur']} of it from Canada. Peru ships phosphate rock "
    f"({S['pe_phos']}), China mainly magnesia ({S['cn_mag']}) and natural graphite ({S['cn_gra']}), India, Vietnam and Morocco barite, and Mexico and Canada fluorspar, feldspar and nepheline syenite (heading 2529).\n\n"
    f"Canada is the largest supplier overall ({S['ca']}, {S['ca_share']}), shipping cement, sulfur, crushed stone and salt that mostly enter Free under USMCA. "
    f"The {yr} figures predate the 2026 Section 301 tariffs, which now add 10–12.5% on Turkish, Vietnamese, Egyptian and Chilean cement and salt but exempt "
    f"the critical and industrial minerals. {yr} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
)
u["sources"] = u["sources"] + [
    {"label": "HTSUS 2026 Revision 21, Chapter 99 (U.S. note 52(b) exemption list)", "url": CH99},
]

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = f"{H} — Tariff Rates by Country"
for g in ia["groups"]:
    G = GROUPS[g["heading"]]
    g["label"], g["shortLabel"] = G[0], G[1]
ia["seo"] = {
    "title": "Cement, Salt & Stone Tariffs by Country — Canada, Türkiye, Mexico, Vietnam, China, Brazil (HTS Ch. 25) | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on cement, salt, sulfur, gypsum, stone and industrial minerals by country and product group: Free with USMCA for Canada and "
        "Mexico, 12.5% for Türkiye, Vietnam, Chile and Egypt, 10% for the EU and India, up to 37.5% for China and 40.3% for Brazilian granite — with the mineral exemptions explained."
    ),
    "keywords": [
        "tariff on canadian cement",
        "cement tariffs canada",
        "brazil granite tariff",
        "italian marble tariffs",
        "natural stone tariffs",
        "salt tariffs",
        "cement tariffs us",
    ],
}
ia["intro"] = (
    "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
    "Most Chapter 25 base rates are Free, so the total is mainly the **2026 Section 301 rate** of the country: 10% or 12.5%, or 10% in total for EU goods.\n\n"
    "Two things change the answer. A **USMCA claim** removes the 10% duty on Canadian and Mexican goods — compare the two Canada and Mexico columns. And 19 "
    "mineral subheadings (sulfur, natural graphite, phosphate rock, barite, most magnesia, fluorspar and others) are **exempt** under U.S. note 52(b), so they "
    "stay Free from almost every country. China pays its List 3 duty on top (up to 37.5%), Brazil a further 25%. The table does **not** include the "
    "antidumping duty on cement from Japan."
)
EX = "19 mineral subheadings are exempt (U.S. note 52(b), 9903.05.86)"
labels = {
    "Canada": (f"Free with a USMCA claim (9903.05.93). Without one: base rate + 10% Section 301 (9903.05.29) on 74 lines; {EX}. The 50% Section 338 duty on salt and portland cement ended September 14, 2026; the IEEPA duty (35%) ended February 24, 2026.", ["fr-2026-15181", "procl-11065", "eo-14389", "hts-now"]),
    "Mexico": (f"Free with a USMCA claim (9903.05.94). Without one: base rate + 10% Section 301 (9903.05.55) on 74 lines; {EX}. The 25% IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Türkiye (Turkey)": (f"Base rate + 12.5% Section 301 (9903.05.79) on 74 lines — cement, marble, travertine, salt; {EX}. The 15% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Vietnam": (f"Base rate + 12.5% Section 301 (9903.05.84) on 74 lines — cement and clinker; {EX}, including barite. The 20% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Peru": (f"Base rate + 12.5% Section 301 (9903.05.63) on 74 lines, even with a Peru TPA claim (note 52(a)); {EX}, including phosphate rock (2510).", ["fr-2026-15181", "hts-now"]),
    "China": ("Base rate + 25% List 3 (9903.88.03, 64 subheadings) + 12.5% (9903.05.31) except on the note 52(b) subheadings: 37.5% on most lines; 25% on sulfur, phosphate rock, chrysotile and amosite asbestos, kieserite, Epsom salts, cryolite and natural graphite (9903.91.06); 12.5% on talc and fire-clay; none on magnesia (except 2519.90.50), barite, fluorspar and 2530.90.80. IEEPA duties ended February 24, 2026.", ["fr-2018-20610", "fr-2019-09681", "fr-2024-21217", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
    "Spain": (f"EU: 10% in total when the base rate is lower (9903.05.39, note 52(k)) on 74 lines — salt, gypsum, stone; {EX}. The 15% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "Chile": (f"Base rate + 12.5% Section 301 (9903.05.30) on 74 lines, even with a U.S.–Chile FTA claim (note 52(a)) — salt pays 12.5%; {EX}.", ["fr-2026-15181", "hts-now"]),
    "Egypt": (f"Base rate + 12.5% Section 301 (9903.05.36) on 74 lines — cement and salt; {EX}.", ["fr-2026-15181", "hts-now"]),
    "Greece": (f"EU: 10% in total when the base rate is lower (9903.05.39, note 52(k)) on 74 lines — cement; {EX}. The 15% IEEPA rate ended February 24, 2026.", ["fr-2026-15181", "eo-14389", "hts-now"]),
    "India": (f"Base rate + 10% Section 301 (9903.05.44) on 74 lines — granite slabs pay 12.8%; {EX}, including barite.", ["fr-2026-15181", "hts-now"]),
    "Brazil": ("Base rate + 12.5% (9903.05.27) + 25% Brazil Section 301 (9903.05.01): 37.5% on most lines, 40.3% on cut granite. Exempt: the note 52(b) subheadings from the 12.5% and 20 subheadings under note 50(a)(ii) from the 25% (graphite, phosphate rock, barite, most magnesia and fluorspar pay nothing; kaolin and crude mica 12.5%; sulfur 25%). The 40% IEEPA duty ended February 24, 2026.", ["fr-2026-15181", "fr-2026-14542", "eo-14389", "hts-now"]),
    "Any other country": ("Base rate + 10% or 12.5% for the other Section 301 economies (e.g. Algeria, the Bahamas, Colombia and Saudi Arabia 12.5%; the UK 10%), a 12.5% or 10% floor for Japan, South Korea, Switzerland and Taiwan, and the base rate only for countries outside the 60 (e.g. Laos, Madagascar, Mozambique). Nicaragua pays 0% until January 1, 2027. Russia, Belarus, Cuba and North Korea pay column 2 rates.", ["fr-2026-15181", "fr-2025-23892", "hts-now"]),
}
for c in ia["countries"]:
    c["rule"]["label"], c["rule"]["sourceIds"] = labels[c["country"]]
have = {s["id"] for s in ia["sources"]}
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in have:
            ia["sources"].append(SRC[sid])
            have.add(sid)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026; the Section 122 surcharge (9903.03.01) expired July 23, 2026; and the 50% Section 338 duty on Canadian salt and portland cement (9903.03.14) applied only from August 22 to September 14, 2026. None is applied.",
    "Exemption lists checked in the 2026 Revision 21: U.S. note 52(b) (19 Chapter 25 subheadings exempt from the 2026 Section 301 duties), note 50(a)(ii) (20 exempt from the Brazil duty), note 20(f) (64 on China List 3) and note 31(g) (natural graphite, China). No country-specific Section 301 product list covers Chapter 25.",
    "The antidumping duty on gray portland cement and clinker from Japan is not included. Nor are entry rules: TSCA import certification, the EPA asbestos ban, FDA prior notice for food salt and USDA APHIS inspection of earth and stone.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) exempts 19 Chapter 25 subheadings: "
    "2503.00.00, 2504.10.10, 2504.10.50, 2504.90.00, 2510.10.00, 2510.20.00, 2511.10.10, 2511.10.50, 2519.10.00, 2519.90.10, 2519.90.20, 2524.90.00, 2529.21.00, "
    "2529.22.00, 2530.20.10, 2530.20.20, 2530.90.10, 2530.90.20 and 2530.90.80. Note 50(a)(ii) exempts the same list except 2503.00.00, plus 2507.00.00 and "
    "2525.10.00, from the Brazil duty. No Chapter 25 subheading is on a country-specific Section 301 exemption list or, since September 15, 2026, on the Canada "
    "Section 338 lists (note 51). Note 20(f) puts 64 Chapter 25 subheadings on China List 3; note 31(g) covers natural graphite."
)

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = f"{H} — Import Documents & Ways to Lower Duty"
te["seo"] = {
    "title": "Importing Cement, Salt, Stone & Minerals: Required Documents and Legal Ways to Lower Duty (HTS Ch. 25) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 25 line — TSCA import certification, the EPA asbestos ban, FDA prior notice for food salt, USDA APHIS rules for clay, "
        "stone and soil, DOT hazmat for sulfur and asbestos, the antidumping order on Japanese cement — and the legal ways to pay less: USMCA, exempt subheadings, drawback."
    ),
    "keywords": [
        "import cement requirements",
        "importing salt FDA prior notice",
        "TSCA certification import",
        "asbestos import ban",
        "USMCA certificate of origin",
        "cement antidumping japan",
        "duty drawback",
    ],
}
te["intro"] = (
    "Most Chapter 25 goods are Free under the general rate, so the levers that matter are about the **extra duties**: a USMCA claim removes the 10% Section 301 "
    "duty on Canadian and Mexican goods, the 19 exempt mineral subheadings pay no 2026 Section 301 duty from any country, and drawback can return duties on goods "
    "that are exported again. Gray portland cement from Japan carries an **antidumping duty** that the tariff calculator does not include.\n\n"
    "The paperwork depends on the product: every bulk mineral needs a TSCA certification, asbestos is largely banned, salt for food needs an FDA prior notice, "
    "earth and stone must be free of soil, and sulfur and asbestos are hazardous materials in transport. Each rule and lever below links to its regulation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on Canadian and Mexican goods",
        "saves": "10% of value: the 2026 Section 301 duty on Canada (9903.05.29) and Mexico (9903.05.55) does not apply to goods entered under USMCA (9903.05.93 / 9903.05.94) — on most cement, salt, gypsum, lime, stone and clay",
        "appliesTo": "The 74 lines not on the note 52(b) list, for originating goods of Canada or Mexico",
        "document": "A USMCA certification of origin from the importer, exporter or producer, with the minimum data elements; it need not follow a prescribed format and CBP can ask for it. Minerals extracted in Canada or Mexico are wholly obtained goods under USMCA.",
        "caveat": "The claim did not help against the 50% Section 338 duty of August 22 – September 14, 2026, which applied to USMCA goods. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ECFR + "title-19/section-182.12"},
            {"label": "HTSUS General Note 11 (USMCA)", "url": "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "origin",
        "title": "Compare countries of origin",
        "saves": "Up to 12.5 points of duty: Türkiye, Vietnam, Egypt and Chile pay 12.5%, the EU and India 10%, USMCA goods and countries outside the 60 Section 301 economies nothing; China up to 37.5%",
        "appliesTo": "The 74 lines not on the note 52(b) list",
        "document": "Mill or quarry certificates and the commercial invoice showing where the mineral was mined, or where cement was ground from clinker. When processing in a third country may change origin (for example grinding imported clinker into cement), ask CBP for a binding ruling.",
        "caveat": "Section 301 duties follow the country of origin, not the shipping country. Antidumping orders follow their own scope: cement ground in a third country from Japanese clinker may still be covered.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99},
            {"label": "19 CFR part 177 (binding rulings)", "url": ECFR + "title-19/part-177"},
        ],
    },
    {
        "id": "exempt-lines",
        "title": "Classify minerals to the exact subheading",
        "saves": "10–12.5% (37.5% for China): the 19 note 52(b) subheadings pay no 2026 Section 301 duty, and several of them are not on China's List 3",
        "appliesTo": "Sulfur, graphite, phosphate rock, barite, magnesia, asbestos (2524.90), fluorspar and the 2530.20 / 2530.90 minerals",
        "document": "Assay or specification sheets that support the subheading: for example fused or dead-burned magnesia (2519.90.10, exempt) versus other magnesia (2519.90.50, not exempt), barite (2511.10, exempt) versus witherite (2511.20), or fluorspar grades (2529.21 / 2529.22).",
        "caveat": "Classification follows the HTS General Rules of Interpretation and chapter note 1 (no calcining or mixing beyond the heading); it cannot be chosen to save duty. Calcined or chemically processed products may move to chapter 28 or 68.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)", "url": CH99},
            {"label": "HTSUS Chapter 25 notes", "url": "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2025"},
        ],
    },
    {
        "id": "fta-base",
        "title": "Claim an FTA preference on the dutiable stone and barite lines",
        "saves": "The 2.8–3% base rate on cut granite, travertine, sandstone and calcined dolomite, the 2.9% on micaceous iron oxides and $1.25/t on crude barite",
        "appliesTo": "The 10 lines with a base-rate duty, for goods of FTA partners such as Chile, Peru, Colombia, Morocco, Israel or Australia",
        "document": "The origin documentation required by the agreement (19 CFR part 10 and the agreement's subpart).",
        "caveat": "The Section 301 duty still applies when an FTA rate is claimed (note 52(a)). EU goods pay 10% in total either way.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"},
            {"label": "19 CFR part 10", "url": ECFR + "title-19/part-10"},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on goods that are exported again",
        "saves": "Up to 99% of the duties paid, including the Section 301 duties, on imported minerals that are exported unused or used to make exported goods",
        "appliesTo": "All 101 lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Antidumping and countervailing duties are not refundable as drawback (19 CFR 191.3(b)(3)).",
        "citations": [
            {"label": "19 CFR part 191", "url": ECFR + "title-19/part-191"},
            {"label": "19 CFR 191.3", "url": ECFR + "title-19/section-191.3"},
        ],
    },
    {
        "id": "ad-scope",
        "title": "Check the scope of the Japan cement antidumping order",
        "saves": "The antidumping duty, when the cement is outside the order",
        "appliesTo": "Cement and clinker of Japan (2523.10, 2523.29, 2523.90)",
        "document": "The order's written scope decides, not the HTS number. Microfine cement is excluded and Commerce ruled that 'Nittetsu Super Fine' cement is outside the scope; classes G and H oil-well cement are inside. When unsure, request a scope ruling.",
        "caveat": "Cement inside the scope pays the cash deposit set by Commerce even if entered under another HTS line.",
        "citations": [
            {"label": "88 FR 8812 (order continued, scope)", "url": "https://www.federalregister.gov/documents/2023/02/10/2023-02815/gray-portland-cement-and-cement-clinker-from-japan-continuation-of-antidumping-duty-order"},
            {"label": "19 CFR 351.225 (scope rulings)", "url": ECFR + "title-19/section-351.225"},
        ],
    },
]
te["rules"] = [
    {
        "id": "tsca",
        "agency": "EPA / CBP",
        "title": "Minerals and chemical substances in bulk: TSCA import certification (positive or negative) at entry",
        "citations": [{"label": "19 CFR 12.121", "url": ECFR + "title-19/section-12.121"}],
    },
    {
        "id": "fda-salt",
        "agency": "FDA",
        "title": "Salt for food or animal feed: prior notice to FDA before the shipment arrives (2 to 8 hours ahead, by mode)",
        "citations": [{"label": "21 CFR 1.279", "url": ECFR + "title-21/section-1.279"}],
    },
    {
        "id": "aphis-soil",
        "agency": "USDA APHIS",
        "title": "Clay, talc, chalk, slate, gravel, stone and quarry products: not 'soil' if free of organic material, so no APHIS permit, but inspected at the port; soil itself needs a permit",
        "citations": [{"label": "7 CFR 330.203", "url": ECFR + "title-7/section-330.203"}],
    },
    {
        "id": "epa-pesticide",
        "agency": "EPA / CBP",
        "title": "Sulfur or diatomaceous earth imported as a pesticide product: EPA Notice of Arrival before the shipment arrives",
        "citations": [{"label": "19 CFR 12.112", "url": ECFR + "title-19/section-12.112"}],
    },
    {
        "id": "dot-hazmat",
        "agency": "U.S. DOT (PHMSA)",
        "title": "Sulfur (UN1350; molten UN2448, class 4.1), asbestos (UN2212, UN2590, class 9) and quicklime (UN1910, air only) are in the Hazardous Materials Table: check whether the shipment needs hazmat shipping papers, marking and packaging",
        "citations": [{"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": ECFR + "title-49/section-172.101"}],
    },
    {
        "id": "epa-asbestos",
        "agency": "EPA",
        "title": "Chrysotile asbestos: import banned for chlor-alkali diaphragms (after May 28, 2024) and sheet gaskets (after May 27, 2026), other uses phased out; any other new use of asbestos needs 90-day notice to EPA",
        "citations": [
            {"label": "40 CFR 751.505", "url": ECFR + "title-40/section-751.505"},
            {"label": "40 CFR 751.509", "url": ECFR + "title-40/section-751.509"},
            {"label": "40 CFR 721.11095 (significant new use rule)", "url": ECFR + "title-40/section-721.11095"},
        ],
    },
    {
        "id": "ad-cement-japan",
        "agency": "Commerce (ITA) / CBP",
        "title": "Gray portland cement and clinker from Japan: antidumping duty cash deposit (not in the tariff calculator)",
        "citations": [
            {"label": "88 FR 8812 (continued, February 10, 2023)", "url": "https://www.federalregister.gov/documents/2023/02/10/2023-02815/gray-portland-cement-and-cement-clinker-from-japan-continuation-of-antidumping-duty-order"},
            {"label": "87 FR 60121 (sunset review, margin up to 69.89%)", "url": "https://www.federalregister.gov/documents/2022/10/04/2022-21522/gray-portland-cement-and-cement-clinker-from-japan-final-results-of-expedited-sunset-review-of-the"},
        ],
    },
]
SOIL = {"2505", "2506", "2507", "2508", "2509", "2512", "2513", "2514", "2515", "2516", "2517", "2518", "2521", "2526"}
GROUP_NOTES = {
    "2501": "Salt for human food or animal feed needs an FDA prior notice; road and industrial salt does not. Not on the Section 301 exemption list: USMCA salt is Free, Chilean salt pays 12.5%.",
    "2502": "No agency rule beyond the TSCA certification.",
    "2503": "Sulfur is a hazardous material in transport (check special provision 30 for formed sulfur such as prills and granules). Sulfur sold as a fungicide or other pesticide needs an EPA Notice of Arrival.",
    "2504": "No AD/CVD order: the ITC voted on April 3, 2026 against duties on active anode material from China. No Section 232 duty: Proclamation 11001 chose negotiations for critical minerals.",
    "2505": "Sand must be free of soil and organic material; clean mineral sand needs no APHIS permit but can be inspected.",
    "2506": "Quartz and quartzite must be free of soil. Engineered quartz slabs are heading 6810 and fall under other trade remedies.",
    "2507": "Kaolin and other clays are not 'soil' under APHIS rules if free of organic material.",
    "2508": "Bentonite and other clays are not 'soil' under APHIS rules if free of organic material.",
    "2509": "Chalk is not 'soil' under APHIS rules if free of organic material.",
    "2510": "No agency rule beyond the TSCA certification. No AD/CVD order covers phosphate rock (the phosphate orders cover fertilizers of chapter 31).",
    "2511": "No AD/CVD order covers barite.",
    "2512": "Diatomaceous earth sold as an insecticide is a pesticide product and needs an EPA Notice of Arrival.",
    "2513": "Pumice and natural abrasives must be free of soil.",
    "2514": "Slate must be free of soil.",
    "2515": "Stone blocks and slabs must be free of soil. Polished or worked slabs and tiles are heading 6802.",
    "2516": "Stone blocks and slabs must be free of soil. Polished granite and countertops are heading 6802.",
    "2517": "Gravel and crushed stone must be free of soil and organic material.",
    "2518": "Dolomite must be free of soil.",
    "2519": "No AD/CVD order covers magnesia (the order on magnesia carbon bricks from China covers bricks, not raw magnesia).",
    "2520": "No agency rule beyond the TSCA certification.",
    "2521": "Limestone must be free of soil.",
    "2522": "Quicklime is a hazardous material only when shipped by air.",
    "2523": "Gray portland cement and clinker from Japan are under an antidumping order; Mexican cement has not been since 2009.",
    "2524": "Chrysotile asbestos imports are largely banned under TSCA; any other new use of asbestos needs EPA notice. Asbestos is a hazardous material in transport.",
    "2525": "No agency rule beyond the TSCA certification.",
    "2526": "Talc and steatite are not 'soil' under APHIS rules if free of organic material.",
    "2528": "No agency rule beyond the TSCA certification.",
    "2529": "No AD/CVD order covers fluorspar or feldspar.",
    "2530": "No agency rule beyond the TSCA certification.",
}


def group_rules(h):
    r = ["tsca"]
    if h == "2501":
        r.append("fda-salt")
    if h in SOIL:
        r.append("aphis-soil")
    if h in ("2503", "2512"):
        r.append("epa-pesticide")
    if h in ("2503", "2522", "2524"):
        r.append("dot-hazmat")
    if h == "2524":
        r.append("epa-asbestos")
    if h == "2523":
        r.append("ad-cement-japan")
    return r


for g in te["groups"]:
    g["label"] = GROUPS[g["heading"]][0]
    g["ruleIds"] = group_rules(g["heading"])
    g["note"] = GROUP_NOTES[g["heading"]]
EXEMPT52 = {"2503.00.00", "2504.10.10", "2504.10.50", "2504.90.00", "2510.10.00", "2510.20.00", "2511.10.10", "2511.10.50", "2519.10.00", "2519.90.10", "2519.90.20",
            "2524.90.00", "2529.21.00", "2529.22.00", "2530.20.10", "2530.20.20", "2530.90.10", "2530.90.20", "2530.90.80"}
for ln in te["lines"]:
    h, sub = ln["heading"], ln["hts"][:10]
    rules = group_rules(h)
    if h == "2522" and sub != "2522.10.00":
        rules = [r for r in rules if r != "dot-hazmat"]
    ln["ruleIds"] = rules
    if sub in EXEMPT52:
        levers = ["exempt-lines", "drawback"]
    else:
        levers = ["usmca", "origin", "drawback"]
    if (ln["general"] or "Free") != "Free":
        levers.insert(-1, "fta-base")
    if h == "2523" and sub in ("2523.10.00", "2523.29.00", "2523.90.00"):
        levers.insert(-1, "ad-scope")
    if h in ("2511", "2519", "2529", "2530", "2524") and "exempt-lines" not in levers:
        levers.insert(0, "exempt-lines")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Antidumping cash-deposit rates are company-specific and change with "
    "each administrative review; check Commerce's latest notice and CBP's instructions before importing cement from Japan."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = f"{H} — Tariff FAQ"
fc["seo"] = {
    "title": "Cement, Salt & Stone Tariffs FAQ: Canada Cement, Graphite, Granite, HS Codes (HTS Ch. 25) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about Chapter 25 tariffs: is there a tariff on cement or salt, the Canadian cement tariff and its reversal, graphite "
        "tariffs on China, granite and marble tariffs, where the U.S. gets its cement and salt, and HS codes for cement, salt, gypsum, sand, graphite and sulfur."
    ),
    "keywords": [
        "is there a tariff on cement",
        "tariff on canadian cement",
        "cement tariff reversal canada",
        "is there a tariff on salt",
        "graphite tariffs china",
        "where does the us import cement from",
        "where does the us get salt from",
        "hs code for cement",
        "hs code for salt",
        "construction materials tariffs",
    ],
}
fc["intro"] = "Straight answers to the most common questions about U.S. tariffs on cement, salt, stone and industrial minerals — by country, by product and by HS code. Each answer links to the page with the full detail."
fc["keyTakeaways"] = [
    "91 of the 101 Chapter 25 lines are Free under the general rate; the extra cost comes from the 2026 Section 301 tariffs: 12.5% on cement and salt from Türkiye, Vietnam, Egypt and Chile, 10% in total for EU goods, nothing for USMCA goods of Canada and Mexico.",
    "19 mineral subheadings — sulfur, natural graphite, phosphate rock, barite, most magnesia, fluorspar and others — are exempt from the 2026 Section 301 duties. China still pays 25% on graphite and up to 37.5% on most other Chapter 25 goods.",
    "The IEEPA duties ended February 24, 2026, the Section 122 surcharge July 23, 2026, and the 50% Section 338 duty on Canadian salt and cement lasted only from August 22 to September 14, 2026. Cement from Japan still carries an antidumping duty, not shown in the calculator.",
]
fc["questionSource"] = f"Google search suggestions, collected {SUGGESTIONS_DATE}"
fc["faqs"] = [
    dict(id="cement-tariff", question="Is there a tariff on cement?",
         searchedAs=["is there a tariff on cement", "tariff on cement", "us tariff on cement", "cement tariffs us", "tariffs on cement imports", "cement tariffs"],
         answer="Cement (2523) is Free under the general rate, but since July 24, 2026 the 2026 Section 301 tariffs add 12.5% on cement from Türkiye, Vietnam, Egypt, Colombia and Algeria, 10% in total on EU cement (Greece, Spain, France) and 12.5% on Korean cement. Canadian and Mexican cement entered under USMCA pays nothing; Chinese cement pays 37.5%. Gray portland cement and clinker from Japan also pay an antidumping duty.",
         link="industry-areas"),
    dict(id="canada-cement", question="Is there a tariff on Canadian cement? What was the cement tariff reversal?",
         searchedAs=["tariff on canadian cement", "cement tariffs canada", "cement tariff reversal canada", "cement tariff reversal", "50 tariff on cement", "does the us import cement from canada"],
         answer=f"Canadian cement entered under USMCA is Free; without a USMCA claim it pays the 10% 2026 Section 301 duty. From August 22 to September 14, 2026, Proclamation 11048 put a 50% Section 338 duty on Canadian portland cement (2523.29.00) and salt, even under USMCA; Proclamation 11065 removed both from the list for goods entered from September 15, 2026. Canada shipped {S['ca_cem']} of cement to the U.S. in {yr}.",
         link="tariff-updates"),
    dict(id="where-cement", question="Where does the U.S. import cement from?",
         searchedAs=["where does the us import cement from", "us cement imports by country", "where does the us get its cement", "does the us import cement", "how much cement does the us import", "us cement imports"],
         answer=f"The U.S. imported {S['cement']} of cement and clinker in {yr}. The largest suppliers were Türkiye ({S['tr_cem']}), Canada ({S['ca_cem']}), Vietnam ({S['vn_cem']}), Mexico ({S['mx_cem']}), Egypt ({S['eg_cem']}) and Greece ({S['gr_cem']}). Most of it is gray portland cement (2523.29).",
         link="understand-industry"),
    dict(id="salt-tariff", question="Is there a tariff on salt?",
         searchedAs=["is there a tariff on salt", "tariff on salt", "salt tariffs", "road salt tariffs", "rock salt tariff"],
         answer="Salt (2501.00.00), including road and rock salt, is Free under the general rate but not on the 2026 Section 301 exemption list, so salt from Chile, Egypt and the Bahamas pays 12.5%, EU salt 10% in total, and non-USMCA salt from Canada or Mexico 10%. USMCA salt is Free. Chinese salt pays 37.5%; Russian salt 47.5%. Canadian salt also paid a 50% Section 338 duty from August 22 to September 14, 2026.",
         link="industry-areas"),
    dict(id="where-salt", question="Where does the U.S. get its salt from?",
         searchedAs=["where does the us get salt from", "where does the us get road salt", "where does the us get rock salt from", "where does the us get most of its salt", "us salt imports", "salt imports by country"],
         answer=f"Salt imports were {S['salt']} in {yr} ({S['salt_chg']} on {pyr}). Chile ({S['cl_salt']}) and Canada ({S['ca_salt']}) were the largest suppliers, followed by Spain ({S['es_salt']}), Egypt ({S['eg_salt']}), Mexico ({S['mx_salt']}) and the Bahamas ({S['bs_salt']}).",
         link="understand-industry"),
    dict(id="hs-salt", question="What is the HS code for salt, sea salt or Epsom salt?",
         searchedAs=["hs code for salt", "salt tariff code", "sea salt tariff code", "epsom salt tariff code"],
         answer="All salt — table salt, sea salt, rock salt, road salt, brine and pure sodium chloride — is one line, 2501.00.00.00, Free. Natural Epsom salts are 2530.20.20 (Free), while chemically produced magnesium sulfate is in chapter 28 (2833.21). Salt tablets and seasoned salts are classified elsewhere.",
         link=""),
    dict(id="hs-cement", question="What is the HS code for cement?",
         searchedAs=["hs code for cement", "hs code for portland cement", "hs code for white portland cement", "hs code for cement clinker", "cement tariff code", "ordinary portland.cement hs code"],
         answer="Heading 2523: cement clinker 2523.10, white portland cement 2523.21, other (gray, ordinary) portland cement 2523.29, aluminous cement 2523.30 and other hydraulic cements such as slag cement 2523.90. All are Free under the general rate. Cement board and concrete blocks are chapter 68, not here.",
         link=""),
    dict(id="hs-gypsum", question="What is the HS code for gypsum?",
         searchedAs=["hs code for gypsum", "hs code for gypsum powder", "hs code for gypsum plaster", "gypsum tariff code", "hs code for natural gypsum"],
         answer="Natural gypsum and anhydrite are 2520.10.00; plasters of calcined gypsum (plaster of Paris) are 2520.20.00. Both are Free under the general rate. Gypsum board, drywall and ceiling boards are heading 6809.",
         link=""),
    dict(id="graphite-china", question="What are the U.S. tariffs on graphite from China?",
         searchedAs=["graphite tariffs china", "us graphite tariffs against china", "graphite tariffs", "tariff on chinese graphite", "trump graphite tariff", "graphite tariff exemption"],
         answer="Natural graphite from China (2504) pays 25% under Section 301 since January 1, 2026 (9903.91.06). It is on the 2026 Section 301 exemption list, so graphite from other countries pays nothing extra and China does not pay the 12.5% on top. No antidumping or countervailing duty applies: the ITC voted against duties on active anode material from China on April 3, 2026. Synthetic graphite is chapter 38.",
         link="tariff-updates"),
    dict(id="hs-graphite", question="What is the HS code for graphite?",
         searchedAs=["hs code for graphite", "hs code for graphite powder", "hs code for graphite flakes", "hs code for artificial graphite"],
         answer="Natural graphite is heading 2504: crystalline flake (not flake dust) 2504.10.10, other powder or flakes 2504.10.50 and other natural graphite 2504.90.00, all Free under the general rate. Artificial (synthetic) graphite is 3801.10, and graphite electrodes 8545.",
         link=""),
    dict(id="stone-tariffs", question="What are the tariffs on granite and marble?",
         searchedAs=["granite tariffs", "brazil granite tariff", "marble tariffs", "italian marble tariffs", "natural stone tariffs", "stone tariffs"],
         answer="Blocks and slabs merely cut are in Chapter 25: granite 2.8%, travertine and sandstone 3%, marble Free. On top: Brazil 37.5% (40.3% in total on cut granite), Türkiye 12.5%, India 10%, Italy and Spain 10% in total, China 37.5% or more. Polished slabs, tiles and countertops are heading 6802, with different rates.",
         link="industry-areas"),
    dict(id="hs-stone", question="What is the HS code for granite, marble or natural stone?",
         searchedAs=["hs code for granite", "hs code for granite slabs", "hs code for marble", "hs code for marble slabs", "hs code for marble blocks", "hs code for natural stone"],
         answer="Crude or merely cut blocks and slabs: marble 2515.11 (crude) and 2515.12.10 (cut), travertine 2515.12.20, granite 2516.11 (crude) and 2516.12 (cut), sandstone 2516.20, other building stone 2516.90. Granules and powder of marble or granite are 2517.41 and 2517.49. Polished or otherwise worked stone, including countertops and tiles, is heading 6802.",
         link=""),
    dict(id="hs-sand-lime", question="What is the HS code for sand, quartz, limestone or lime?",
         searchedAs=["hs code for sand", "hs code for quartz sand", "hs code for quartz", "hs code for limestone", "hs code for lime", "hs code for hydrated lime", "hs code for quick lime"],
         answer="Silica and quartz sand 2505.10, other natural sand 2505.90, quartz 2506.10, quartzite 2506.20; limestone flux and limestone for lime or cement 2521.00, crushed limestone for aggregate 2517.10; quicklime 2522.10, slaked (hydrated) lime 2522.20 and hydraulic lime 2522.30. All are Free under the general rate. Engineered quartz slabs and countertops are heading 6810.",
         link=""),
    dict(id="hs-sulfur", question="What is the HS code for sulfur?",
         searchedAs=["hs code for sulfur", "hs code for granular sulfur", "hs code for sulphur granules", "hs code for sulfur powder", "sulphur hs code"],
         answer="Sulfur of all kinds — crude, granular, prilled or molten — is 2503.00.00 (crude or unrefined 2503.00.00.10, other .90), Free and exempt from the 2026 Section 301 duties. Sublimed, precipitated and colloidal sulfur are 2802.00.00.",
         link=""),
    dict(id="construction", question="Are building and construction materials affected by tariffs?",
         searchedAs=["construction materials tariffs", "building materials tariffs", "construction materials affected by tariffs", "building materials affected by tariffs"],
         answer="For the Chapter 25 materials — cement, gypsum, lime, sand, gravel and building stone — yes, through the 2026 Section 301 tariffs: 12.5% for Türkiye, Vietnam and Egypt, 10% for the EU and India, nothing for USMCA goods of Canada and Mexico; China pays up to 37.5%. The IEEPA tariffs of 2025 ended February 24, 2026.",
         link="tariff-updates"),
]

d["asOf"] = "2026-10-12"
json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("ok")
