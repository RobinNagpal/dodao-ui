# Chapter 61 tariff updates, matrix and trade page (exec'd by fill.py)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 61 Tariff Updates: Knitted Apparel, T-Shirts, Sweaters & Socks (2025–2026)"
tu["seo"]["title"] = "Clothing Tariffs 2026: HTS Chapter 61 Knit Apparel Tariff Updates — China, Vietnam, Cambodia, Bangladesh | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for U.S. knitted apparel tariffs since January 2025: the end of the IEEPA duties and the Section 122 "
    "surcharge, the 2026 Section 301 tariffs on 60 economies (Vietnam +12.5%, Cambodia and Bangladesh +10%), the CAFTA-DR "
    "and Jordan exemptions, China List 4A, Canada's Section 338 duty on T-shirts and sweaters, AGOA and Haiti renewals and "
    "the end of de minimis."
)
tu["seo"]["keywords"] = [
    "hts chapter 61 tariff",
    "hts chapter 61 tariff updates",
    "clothing tariffs 2026",
    "apparel tariffs by country",
    "vietnam apparel import duty 2026",
    "cambodia and bangladesh apparel tariffs",
    "section 301 tariffs on knitwear",
    "tariff on clothing from china",
    "tariff on clothes from india to usa",
    "de minimis apparel",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, "
    "and the current **2026 Revision 21** (in force October 9, 2026). **No Chapter 61 base rate changed**: all 838 lines "
    "carry the same General, Special and Column 2 rates, from Free to 32% and compound rates such as 61.7¢/kg + 16%.\n\n"
    "Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached every garment — 20% for "
    "Vietnam, Bangladesh and Sri Lanka, 19% for Cambodia, Indonesia and Pakistan, 50% for India from August 27, 2025, and "
    "up to 125% plus 20% for China in April–May 2025. They **ended on February 24, 2026**, and the 10% Section 122 "
    "surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a "
    "**Section 301 tariff** of 10% or 12.5%, but **CAFTA-DR apparel entered duty-free is exempt** (note 52(i)) and "
    "**Jordan's** exception list covers almost every Chapter 61 subheading. China still pays **+7.5% (List 4A)** on 714 "
    "lines, and since **August 22, 2026** six Canadian subheadings — cotton T-shirts, cotton and man-made-fibre sweaters, "
    "women's synthetic dresses and trousers, synthetic gloves — owe a **50% Section 338 duty** even under USMCA. AGOA and "
    "the Haiti HOPE/HELP programs were renewed through December 31, 2026, and the $800 de minimis exemption stays "
    "suspended, so apparel shipped direct to consumers pays full duty."
)
tu["scope"] = (
    "Measures that reach Chapter 61 from any country: the 2026 Section 301 tariffs on 60 economies and their CAFTA-DR, "
    "Jordan, Guatemala and El Salvador exemptions; the Brazil Section 301 tariff; China Section 301 List 4A, its "
    "babies'-sleep-sack exclusion and the suspended List 4B; the Canada Section 338 duty; the Nicaragua Section 301 duty "
    "scheduled for 2027; the 2025–2026 IEEPA and Section 122 duties that have ended; and the suspension of de minimis. "
    "Preference-program changes (AGOA, Haiti HOPE/HELP, GSP, USMCA review) and the UFLPA forced-labor rules are listed for "
    "reference. No Section 232 action and no antidumping or countervailing duty order covers a Chapter 61 product. For the "
    "rate each supplier pays, see Rates by country."
)

IE = {x["id"]: x for x in tu["inEffect"]}
NO_LIST = "{c}'s exception list in note 52(j) names no Chapter 61 subheading, and no Chapter 61 line is on the general exemption list (note 52(b)). "
GEN_NO = "No Chapter 61 line is on the general exemption list (note 52(b)) or on a country exception list for {c}. "
CAFTA_TXT = (
    "CAFTA-DR textile and apparel goods (general note 29(d)(v)) of {c} entered free of duty under CAFTA-DR — SPI P, or a "
    "subchapter XXII Chapter 98 provision such as short-supply heading 9822.05.01 — pay no Section 301 duty (note 52(i), "
    "9903.05.95). That covers 821 of the 838 lines. The other "
    + FREE_GENERAL
    + " — print no P rate, so they cannot be entered under CAFTA-DR and pay the duty. "
)
EXEMPT = {
    "vn-section-301": (
        GEN_NO.format(c="Vietnam") + ENDED + " Vietnam's IEEPA rate had been 20% (9903.02.69) from August 7, 2025.",
        "Vietnamese cotton T-shirts and sweatshirts pay 29% (16.5% + 12.5%), polyester sweaters and hoodies 44.5%, "
        "synthetic leggings 40.7%.",
        ["eo-14326", "eo-14389"],
    ),
    "cn-section-301": (
        "Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) on every line, and +7.5% under List 4A "
        "(9903.88.15, U.S. note 20(s)) on 209 subheadings, 714 of the 838 lines. The other " + NOT_4A + ", so they pay only "
        "12.5%. One List 4A exclusion (9903.88.69, note 20(vvv)(iv)) runs through November 9, 2026: babies' knit cotton "
        "sleep sacks with a neck opening and two-way zipper (6111.20.60.70). USTR's four-year review kept List 4A in "
        "place. The IEEPA duties on China ended February 24, 2026.",
        "Chinese cotton T-shirts pay 36.5%, polyester sweaters and hoodies 52%, synthetic leggings 48.2%, cotton socks "
        "33.5%; wholly cashmere sweaters (List 4B) 16.5%.",
        ["fr-2025-21671", "fr-2019-27306", "eo-14389"],
    ),
    "kh-section-301": (
        NO_LIST.format(c="Cambodia") + ENDED + " Cambodia's IEEPA rate had been 19% (9903.02.11).",
        "Cambodian cotton T-shirts and sweatshirts pay 26.5%, polyester sweaters 42%.",
        ["eo-14326", "eo-14389"],
    ),
    "bd-section-301": (
        NO_LIST.format(c="Bangladesh") + ENDED + " Bangladesh's IEEPA rate had been 20% (9903.02.05).",
        "Bangladeshi cotton T-shirts and sweaters pay 26.5%, polyester sweaters 42%, cotton briefs 17.4%.",
        ["eo-14326", "eo-14389"],
    ),
    "id-section-301": (
        NO_LIST.format(c="Indonesia") + ENDED + " Indonesia's IEEPA rate had been 19% (9903.02.27).",
        "Indonesian cotton T-shirts pay 26.5%, synthetic leggings 38.2%.",
        ["eo-14326", "eo-14389"],
    ),
    "in-section-301": (
        GEN_NO.format(c="India")
        + "GSP (SPI A, A*), still printed on six gloves, scarves and accessories lines, has been expired since December 31, 2020. The "
        "IEEPA duties on India — 25% reciprocal from August 7, 2025 plus 25% from August 27, 2025 — ended in February 2026.",
        "Indian cotton T-shirts and knit tops pay 26.5%, cotton nightwear 18.5%.",
        ["cbp-gsp", "eo-14329", "eo-14384", "eo-14389"],
    ),
    "hn-section-301": (
        CAFTA_TXT.format(c="Honduras") + ENDED + " Honduras's IEEPA rate had been the 10% baseline.",
        "Honduran T-shirts, sweatshirts and socks that qualify under CAFTA-DR enter with no duty at all; non-qualifying "
        "goods pay the base rate plus 10%.",
        ["csms-69326983", "eo-14389"],
    ),
    "ni-section-301": (
        CAFTA_TXT.format(c="Nicaragua")
        + "Separately, Nicaraguan goods not entered under CAFTA-DR will pay a Nicaragua Section 301 duty (9903.89.01) of 10% "
        "from January 1, 2027 and 15% from January 1, 2028. Nicaragua's IEEPA rate had been 18% (9903.02.47); "
        + ENDED,
        "CAFTA-DR-qualifying Nicaraguan apparel pays nothing; non-qualifying goods pay the base rate plus 12.5% now, and "
        "10% more from 2027.",
        ["csms-69326983", "fr-2025-22690", "fr-2025-23892", "eo-14389"],
    ),
    "jo-section-301": (
        LIST_EXCEPT
        + ". For Jordan the list applies whether or not the US–Jordan FTA is claimed, so only graduated compression hosiery "
        "(6115.10, 9 lines) pays the 10% (9903.05.50). Jordan's IEEPA rate had been 15% (9903.02.31); " + ENDED,
        "Jordanian apparel under the US–Jordan FTA (SPI JO) enters Free with no extra duty; compression socks pay 10%.",
        ["eo-14326", "eo-14389"],
    ),
    "pk-section-301": (
        GEN_NO.format(c="Pakistan") + "GSP has been expired since December 31, 2020. " + ENDED + " Pakistan's IEEPA rate had "
        "been 19%.",
        "Pakistani cotton socks pay 23.5%, cotton T-shirts 26.5%.",
        ["cbp-gsp", "eo-14326", "eo-14389"],
    ),
    "gt-section-301": (
        CAFTA_TXT.format(c="Guatemala")
        + "Guatemala's own list (note 52(j)(6)(iii), 9903.06.06) also exempts 245 of the 252 subheadings when CAFTA-DR is "
        "claimed. " + ENDED,
        "Guatemalan T-shirts and knit tops under CAFTA-DR pay nothing; without the claim the base rate plus 10%.",
        ["csms-69326983", "eo-14389"],
    ),
    "sv-section-301": (
        CAFTA_TXT.format(c="El Salvador")
        + "El Salvador's own list (note 52(j)(7)(iii), 9903.06.09) also exempts 245 of the 252 subheadings when CAFTA-DR "
        "is claimed. " + ENDED,
        "Salvadoran T-shirts, socks and underwear under CAFTA-DR pay nothing; without the claim the base rate plus 10%.",
        ["csms-69326983", "eo-14389"],
    ),
    "lk-section-301": (
        GEN_NO.format(c="Sri Lanka") + ENDED + " Sri Lanka's IEEPA rate had been 20% (9903.02.57).",
        "Sri Lankan synthetic panties pay 25.6%, cotton T-shirts 26.5%.",
        ["eo-14326", "eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94), including goods entered under the USMCA tariff "
        "preference levels (9823.53.01–.02). Under USMCA (General Note 11) knit apparel generally qualifies only if the yarn "
        "and fabric are from the region and the garment is cut (or knit to shape) and sewn there. Mexico is not subject to "
        "the Canada Section 338 duty. The 25% IEEPA duty on non-USMCA goods (9903.01.01) ended February 24, 2026.",
        "USMCA-qualifying Mexican T-shirts and sweaters pay nothing; non-qualifying goods pay the base rate plus 10% — "
        "26.5% on cotton T-shirts.",
        ["eo-14194", "eo-14389"],
    ),
    "eg-section-301": (
        GEN_NO.format(c="Egypt")
        + "Egypt has no free trade agreement with the United States. " + ENDED + " Egypt's IEEPA rate had been the 10% "
        "baseline.",
        "Egyptian cotton T-shirts and sweatshirts pay 29%.",
        ["eo-14389"],
    ),
    "do-section-301": (
        CAFTA_TXT.format(c="the Dominican Republic") + ENDED + " The Section 122 surcharge also exempted CAFTA-DR textile and "
        "apparel goods (9903.03.09).",
        "Dominican apparel that qualifies under CAFTA-DR pays nothing; non-qualifying goods pay the base rate plus 12.5%.",
        ["csms-69326983", "eo-14389"],
    ),
    "eu-section-301": (
        "EU goods pay 10% in total in place of the base rate (9903.05.39) when the base rate is under 10%; at or above "
        "10% nothing is added (note 52(k)). Most Chapter 61 cotton and synthetic lines are above 10%, so Italian and "
        "Portuguese knitwear usually pays just its base rate; cashmere sweaters (4%), silk garments and other low-rated "
        "lines pay 10%. The EU exception list (note 52(j)(2)) names no Chapter 61 subheading. " + ENDED,
        "An Italian wool sweater pays 16%, a cashmere one 10%, a cotton T-shirt 16.5%.",
        ["eo-14326", "eo-14389"],
    ),
    "ca-section-301": (
        "Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). "
        "The Section 338 duty (+50%, from August 22, 2026, 9903.03.14) applies to products of Canada in six Chapter 61 "
        "subheadings — " + CA338 + " — 55 statistical lines, and U.S. note 51(a) applies it even when USMCA or another "
        "special rate is claimed (Chapter 98 entries are outside it, except USMCA entries of subchapter XXIII, such as the tariff preference levels, and 9802 entries). The September 15, 2026 list "
        "revisions (Proclamations 11064, 11065) added or removed no Chapter 61 provision. No Chapter 61 line is on the "
        "September 29, 2026 import-ban annexes. The 35% IEEPA duty on non-USMCA goods ended February 24, 2026.",
        "A USMCA-qualifying Canadian cotton T-shirt or sweatshirt pays 50%; a non-qualifying one 76.5%. All other USMCA "
        "knitwear from Canada pays nothing.",
        ["procl-11064", "procl-11065", "procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 61 line; the Brazil exemption list (U.S. note "
        "50(a)(ii)) names none. The 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% reciprocal and 40%) "
        "ended February 24, 2026.",
        "Brazilian knitwear pays 37.5% on top of the base rate — 54% on cotton T-shirts.",
        ["eo-14323", "eo-14389"],
    ),
    "other-section-301": (
        LIST_EXCEPT
        + "; no other country list names a Chapter 61 code. Costa Rica's CAFTA-DR apparel is exempt under note 52(i). "
        "Countries outside the 60 economies — Haiti, Kenya, Madagascar, Lesotho, Ethiopia, Myanmar and others — pay only "
        "the base rate. Peru, Colombia and other FTA partners keep the FTA's Free base rate but pay the Section 301 duty "
        "(note 52(a)). " + ENDED,
        "Peruvian cotton T-shirts under the Peru TPA pay 12.5%; Thai and Turkish knitwear the base rate plus 12.5%; "
        "Kenyan or Haitian garments the base rate, or nothing under AGOA or HOPE/HELP.",
        ["eo-14389"],
    ),
}
for k, (ex, wim, extra) in EXEMPT.items():
    IE[k]["exemption"] = ex
    IE[k]["whatItMeans"] = wim
    for sid in extra:
        if sid not in IE[k]["sourceIds"]:
            IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
IE["other-section-301"]["country"] = (
    "Other Section 301 economies (incl. Peru, the Philippines, Thailand, Türkiye, Costa Rica, Malaysia, Taiwan, South Korea)"
)
IE["cn-section-301"]["measure"] = "Section 301 tariffs: 2026 action plus List 4A"
IE["cn-section-301"]["now"] = "+20% on 714 lines; +12.5% on the 124 former List 4B lines"
IE["ca-section-301"]["measure"] = "Section 301 tariff (non-USMCA goods) + Section 338 duty (6 subheadings, USMCA or not)"
IE["ca-section-301"]["now"] = "+10% (non-USMCA); +50% on 6 subheadings, USMCA or not"
for k in ("hn-section-301", "ni-section-301", "gt-section-301", "sv-section-301", "do-section-301"):
    IE[k]["measure"] = "Section 301 tariff (2026, 60 economies); CAFTA-DR apparel exempt"
    IE[k]["now"] = IE[k]["now"] + " (none on CAFTA-DR apparel)"
IE["jo-section-301"]["now"] = "+10% on 9 lines (6115.10 only)"
missing = [k for k, x in IE.items() if "TODO" in x["exemption"] + x["whatItMeans"]]
assert not missing, missing
add_sources(tu, [s for v in EXEMPT.values() for s in v[2]])

# ---------------------------------------------------------------- change log
gen = {c["id"]: c for c in tu["changes"]}
base = gen["base-rates"]
base["title"] = "No Chapter 61 base-rate changes"
base["detail"] = (
    "All 838 Chapter 61 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 "
    "Basic Edition; no line was added, split or renumbered."
)
for c in tu["changes"]:
    if c["id"].startswith("section-338-canada"):
        c["title"] = "Canada Section 338 duty of 50% on cotton T-shirts, sweaters and four other knit subheadings"
        c["detail"] = (
            "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods listed in U.S. note 51(b)(3), which names "
            + CA338
            + " — 55 Chapter 61 lines. It is charged even when USMCA is claimed, and on top of the 10% Section 301 duty on "
            "non-USMCA goods. Planned for August 19, it took effect August 22 after a 3-day suspension (Proclamation 11056)."
        )
    elif c["id"].startswith("section-301-2026-60-economies"):
        c["title"] = "Section 301 tariffs on 60 economies — CAFTA-DR and Jordanian apparel exempt"
        c["detail"] = (
            "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84): 12.5% for Vietnam, China, Egypt, the "
            "Dominican Republic, Nicaragua, Thailand, Türkiye, Peru and the Philippines; 10% for Cambodia, Bangladesh, "
            "Indonesia, India, Pakistan, Sri Lanka, Honduras, Guatemala, El Salvador, Jordan, Mexico and Canada; 10% in "
            "total for the EU. No Chapter 61 line is on the general exemption list. CAFTA-DR textile and apparel goods "
            "entered free of duty are exempt (note 52(i), 9903.05.95); " + LIST_EXCEPT + ". USMCA-qualifying goods are "
            "exempt (9903.05.93, 9903.05.94), and so are goods entered under a Chapter 98 provision other than 9802 — for "
            "example AGOA (9819.11) or Haiti HOPE/HELP (9820.61) apparel. Other FTA claims remove the base rate but not "
            "this duty."
        )
    elif c["id"].startswith("section-301-brazil"):
        c["title"] = "Section 301 tariff on products of Brazil"
        c["detail"] = (
            "25% on all goods of Brazil (9903.05.01). No Chapter 61 line is on the Brazil exemption list (U.S. note "
            "50(a)(ii)). From July 24 the 12.5% 2026 action (9903.05.27) is added on top."
        )
    elif c["id"].startswith("section-301-nicaragua"):
        c["title"] = "Scheduled: Section 301 tariff on products of Nicaragua"
        c["detail"] = (
            "USTR's action on Nicaragua adds a duty (9903.89.01) on Nicaraguan goods that are not entered under CAFTA-DR: "
            "0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028, on every Chapter 61 line. "
            "CAFTA-DR-originating apparel — most of Nicaragua's $1.7B of knitwear shipments — is not covered."
        )


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {"id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before,
            "now": now, "countries": countries, "sourceIds": sids}


EXTRA = [
    ch("lvs-nprm", "pending", "2026-10-08", "Proposed", "CBP proposes new entry rules for low-value and mail shipments",
       "CBP proposed to change filing requirements for informal entries of goods valued at $2,500 or less, create an "
       "electronic informal entry type for mail and add bonding requirements. Comments are due December 7, 2026. It would "
       "change how small parcels of clothing are entered, not their duty rate.",
       None, None, "All", ["cbp-nprm-lvs"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 List 4A continues",
       "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
       "four-year review. For Chapter 61 this keeps +7.5% (9903.88.15) on 714 of the 838 lines; List 4B stays suspended.",
       "+7.5%", "+7.5%", "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 61",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
       "from September 29, 2026. No Chapter 61 line is on their annexes.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; Chapter 61 entries unchanged",
       "Proclamations 11064 and 11065 added and removed provisions on the Section 338 lists from September 15, 2026. None of "
       "them is in Chapter 61, so the six Chapter 61 subheadings stay on the 9903.03.14 list in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11064", "procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) and the apparel tariff preference "
       "levels still remove the base rate and the Section 301 duty on Mexican and Canadian knitwear.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("dm-ifr", "reference", "2026-06-24", "Effective", "CBP suspends de minimis indefinitely",
       "Two interim final rules suspend the $800 de minimis exemption in CBP's regulations: 19 CFR 10.151(b) for every mode "
       "except mail, and 19 CFR 145.31(b) for mail, until CBP announces otherwise. A T-shirt or hoodie shipped direct to a "
       "U.S. consumer needs an entry and pays the full duty — base rate plus the extra duty for its origin.",
       "Free under $800", "Full duty, any value", "All", ["cbp-ifr-dm", "cbp-ifr-mail"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance: cotton and apparel are high-priority sectors",
       "CBP's operational guidance for importers lists the supply-chain tracing documents it expects for the UFLPA "
       "high-priority sectors, which include cotton and cotton products and apparel. Garments made wholly or in part in "
       "Xinjiang or by a listed entity — including garments of Xinjiang cotton sewn in another country — are presumed "
       "barred unless the importer rebuts the presumption.",
       None, None, "All (Xinjiang inputs)", ["cbp-fl-guidance", "pl-117-78"]),
    ch("procl-11030", "reference", "2026-05-22", "Published", "AGOA and Haiti HOPE/HELP extensions written into the HTS",
       "Proclamation 11030 (signed May 19, 2026) amended general note 16, the AGOA apparel note in Chapter 98 subchapter XIX "
       "and the Haiti note in subchapter XX so that AGOA, its regional-apparel and third-country-fabric programs, and the "
       "Haiti HOPE/HELP duty-free treatment run through December 31, 2026.",
       None, "Through December 31, 2026", "AGOA beneficiaries, Haiti", ["procl-11030", "hts-ch98", "hts-now"]),
    ch("ieepa-refunds", "reference", "2026-04-20", "Deployed", "CBP opens CAPE for IEEPA duty refunds",
       "CBP deployed the Consolidated Administration and Processing of Entries (CAPE) function in ACE: importers of record "
       "and their brokers file a CAPE Declaration listing entries, and ACE removes the IEEPA Chapter 99 lines and refunds "
       "the IEEPA duties with interest. Section 301, List 4A and Section 338 duties are not refunded.",
       None, None, "All", ["cbp-ieepa-refunds"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 61 subheading was on the product "
       "exemption lists. USMCA-qualifying goods from Canada and Mexico (9903.03.07, 9903.03.08) and CAFTA-DR textile and "
       "apparel goods entered duty-free (9903.03.09) were exempt.",
       None, "+10% (until July 23, 2026)", "All", ["procl-11012", "csms-67844987", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
       "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
       "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
       "printed in Revision 21 but are no longer in effect.",
       "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("dm-continued", "reference", "2026-02-20", "Signed", "De minimis suspension continued after the IEEPA ruling",
       "Executive Order 14388 kept duty-free de minimis treatment suspended for all countries.",
       None, None, "All", ["eo-14388"]),
    ch("india-oil-end", "extraDuty", "2026-02-07", "Effective", "India's extra 25% IEEPA duty removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. India's "
       "25% reciprocal rate ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA and Haiti HOPE/HELP reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025, with "
       "its regional-apparel and third-country-fabric programs, and extended the Haiti HOPE/HELP duty-free treatment "
       "through December 31, 2026. For knit apparel these programs work through Chapter 98 (9819.11.xx for AGOA, "
       "9820.61.xx for Haiti) rather than the SPI D column, which is printed on only six Chapter 61 lines. GSP remains "
       "expired since December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries, Haiti",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "usc-3721", "usc-2703a", "cbp-gsp", "hts-now"]),
    ch("cn-exclusions-extended", "reference", "2025-12-01", "Published", "China List 4A exclusion for babies' sleep sacks extended",
       "USTR extended 178 China Section 301 product exclusions through November 9, 2026, including one in Chapter 61: "
       "babies' knit cotton sleep sacks with a neck opening and two-way zipper (6111.20.60.70). It "
       "removes the 7.5% List 4A duty (9903.88.69) but not the 12.5% 2026 duty.",
       None, "Excluded through November 9, 2026", "China", ["fr-2025-21671", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 61 "
       "line on top of List 4A until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("dm-suspended", "reference", "2025-08-29", "Effective", "De minimis exemption suspended for all countries",
       "Executive Order 14324 ended duty-free entry for shipments valued at $800 or less (19 U.S.C. 1321) from every "
       "country, effective for goods entered from August 29, 2025. Direct-to-consumer clothing parcels have paid duty "
       "since then.",
       "Free under $800", "Dutiable", "All", ["eo-14324", "cbp-dm-2025", "usc-1321"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August "
       "7, 2025: 50% in all on Indian apparel, on top of the base rate. Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country reciprocal rates replace the 10% baseline",
       "Executive Order 14326 set country rates for goods entered from August 7, 2025 — for the main knitwear suppliers "
       "Vietnam, Bangladesh and Sri Lanka +20%, Cambodia, Indonesia, Pakistan, Thailand and the Philippines +19%, "
       "Nicaragua +18%, Jordan, Lesotho and Madagascar +15%, India +25%, and 15% in total for EU goods; Central American "
       "Honduras, Guatemala, El Salvador and the Dominican Republic stayed at the 10% baseline (Costa Rica 15%). Ended February 24, 2026.",
       "+10%", "+10% to +25% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("dm-statute", "reference", "2025-07-04", "Signed", "Law ends the de minimis exemption from July 1, 2027",
       "Section 70531 of P.L. 119-21 terminates the de minimis exemption of 19 U.S.C. 1321(a)(2)(C) effective July 1, 2027, "
       "as CBP's 2026 rules note.",
       None, None, "All", ["pl-119-21", "cbp-ifr-dm", "usc-1321"]),
    ch("cn-reciprocal-10", "extraDuty", "2025-05-14", "Effective", "China reciprocal duty cut from 125% to 10%",
       "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. A Chinese "
       "cotton T-shirt then paid 16.5% + 7.5% (List 4A) + 20% + 10% = 54% until November 9, 2025. Ended February 24, 2026.",
       "+125%", "+10% (ended)", "China", ["eo-14298"]),
    ch("cn-125", "extraDuty", "2025-04-10", "Effective", "China reciprocal duty raised to 125%",
       "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, on top of List 4A and "
       "the 20% fentanyl duty, and paused the higher country rates announced April 2 for others (Vietnam 46%, Cambodia "
       "49%, Bangladesh 37%), which never took effect.",
       None, "+125% (ended)", "China", ["eo-14266"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. No "
       "Chapter 61 product was exempt. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong went from +10% (from February 4, 2025) to +20%, on top of List 4A.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt. Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt. Ended February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
    ch("uflpa-effective", "reference", "2022-06-21", "Effective", "UFLPA presumption takes effect",
       "The Uyghur Forced Labor Prevention Act's rebuttable presumption applies from June 21, 2022: goods mined, produced "
       "or manufactured wholly or in part in Xinjiang, or by an entity on the UFLPA Entity List, are presumed made with "
       "forced labor and barred. It succeeded CBP's December 2020 withhold release order on cotton products of the Xinjiang "
       "Production and Construction Corps and the January 2021 region-wide order on Xinjiang cotton.",
       None, "Presumption applies", "All (Xinjiang inputs)",
       ["pl-117-78", "cbp-uflpa", "dhs-uflpa-entity-list", "cbp-wro-xinjiang", "cbp-wro-xpcc"]),
    ch("cn-4a-cut", "extraDuty", "2020-02-14", "Effective", "China List 4A duty cut to 7.5%",
       "Under the Phase One agreement USTR cut the List 4A duty (9903.88.15) from 15% to 7.5%. The rate on the 714 Chapter "
       "61 lines has been 7.5% ever since.",
       "+15%", "+7.5%", "China", ["fr-2020-00904"]),
    ch("cn-4b-suspended", "reference", "2019-12-18", "Published", "China List 4B suspended before it took effect",
       "USTR suspended indefinitely the 15% List 4B duty (9903.88.16) that was to start December 15, 2019. List 4B held 43 "
       "Chapter 61 subheadings — among them wholly cashmere sweaters, silk garments and hockey gloves — so those Chinese "
       "garments never paid a China list duty.",
       "+15% scheduled", "Suspended", "China", ["fr-2019-27306"]),
    ch("cn-4a", "extraDuty", "2019-09-01", "Effective", "China Section 301 List 4A reaches apparel",
       "The fourth China Section 301 list put +15% on 209 Chapter 61 subheadings — most cotton and man-made-fibre "
       "T-shirts, sweaters, trousers, underwear, socks and babies' wear. No Chapter 61 line was on Lists 1–3.",
       None, "+15%", "China", ["fr-2019-17865"]),
]
have = {c["id"] for c in tu["changes"]}
tu["changes"] += [c for c in EXTRA if c["id"] not in have]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)
add_sources(tu, [s for c in tu["changes"] for s in c["sourceIds"]])
stats = [s for s in tu["stats"] if s["label"] != "IEEPA duties"]
stats.append({"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"})
tu["stats"] = stats

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 61 Tariff Rates by Country: Vietnam, China, Cambodia, Bangladesh, CAFTA-DR & More"
ia["seo"]["title"] = "Clothing Tariffs by Country 2026: Knit Apparel Import Duty — Vietnam, China, Cambodia, Honduras (HTS 61) | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total 2026 U.S. tariff on T-shirts, sweaters, hoodies, leggings, underwear and socks by country: Vietnam 29% on "
    "cotton tees, China 36.5%, Cambodia and Bangladesh 26.5%, CAFTA-DR and Jordan Free, USMCA Free (Canada 50% on six "
    "subheadings), with the 32% man-made-fibre lines priced too."
)
ia["seo"]["keywords"] = [
    "apparel tariffs by country",
    "knitted apparel import duty rates",
    "cafta-dr knitted apparel sourcing",
    "vietnam tariff on knitted apparel",
    "china apparel tariffs",
    "bangladesh apparel tariffs",
    "india apparel tariffs",
    "mexico apparel tariffs",
    "synthetic activewear customs duty",
    "knitted sweaters import duty rates",
]
ia["intro"] = (
    "Knit apparel base rates are among the highest in the schedule — 16.5% on a cotton T-shirt, 32% on a polyester "
    "sweatshirt — and the extra duty **depends on where the garment was made**. Each cell below is the base rate for "
    "that product group plus the extra duty for that country, minus any preference — computed from the current tariff "
    "schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 "
    "economies** (from July 24, 2026): **Vietnam, Egypt and the Dominican Republic +12.5%**, **Cambodia, Bangladesh, "
    "Indonesia, India, Pakistan and Sri Lanka +10%**, EU knitwear 10% in total. **China pays +20%** on most lines (12.5% "
    "plus List 4A). **CAFTA-DR apparel** from Honduras, Nicaragua, Guatemala, El Salvador and the Dominican Republic, "
    "priced here with the CAFTA-DR claim, and **Jordanian** apparel are Free with no extra duty. **USMCA goods from "
    "Mexico pay nothing**, and Canada pays 50% under Section 338 on six subheadings even with USMCA. Haiti and Kenya are "
    "outside the 60 economies and pay only the base rate — or nothing under the Haiti and AGOA Chapter 98 programs, which "
    "the grid does not apply."
)
CAFTA_RULE = (
    "With a CAFTA-DR claim (SPI P), as shown: no base rate and no Section 301 duty on 821 of the 838 lines — CAFTA-DR "
    "apparel entered free of duty is exempt (note 52(i), 9903.05.95){extra}. The " + FREE_GENERAL + " — carry no P rate and "
    "pay {rate} ({code}). Goods that do not meet the CAFTA-DR rules of origin pay the base rate plus {rate}."
)
RULES = {
    "Vietnam": "Base rate + 12.5% Section 301 (9903.05.84) on every Chapter 61 line; no exception list. The 20% IEEPA "
    "duty ended February 24, 2026.",
    "China": "Base rate + 12.5% Section 301 (9903.05.31) on every line, plus 7.5% List 4A (9903.88.15) on 714 of the 838 "
    "lines: +20% on cotton and synthetic T-shirts, sweaters, trousers, underwear, socks and babies' wear; +12.5% on the 124 "
    "former List 4B lines (wholly cashmere sweaters, silk garments, hockey gloves and others). The babies'-sleep-sack "
    "exclusion (9903.88.69) needs the importer's claim and is not applied.",
    "Cambodia": "Base rate + 10% Section 301 (9903.05.28); Cambodia's exception list names no Chapter 61 subheading. The 19% "
    "IEEPA duty ended February 24, 2026.",
    "Bangladesh": "Base rate + 10% Section 301 (9903.05.26); Bangladesh's exception list names no Chapter 61 subheading. "
    "The 20% IEEPA duty ended February 24, 2026.",
    "Indonesia": "Base rate + 10% Section 301 (9903.05.45); Indonesia's exception list names no Chapter 61 subheading.",
    "India": "Base rate + 10% Section 301 (9903.05.44); no exception list. GSP has expired; the IEEPA duties (up to 50%) "
    "ended in February 2026.",
    "Honduras": CAFTA_RULE.format(extra="", rate="10%", code="9903.05.42"),
    "Nicaragua": CAFTA_RULE.format(extra="", rate="12.5%", code="9903.05.58")
    + " Non-CAFTA-DR goods will also pay the Nicaragua Section 301 duty (9903.89.01) of 10% from January 1, 2027.",
    "Jordan": "With the US–Jordan FTA claim (SPI JO), as shown: Free, and Jordan's exception list (9903.06.20) exempts 245 of "
    "the 252 subheadings from the Section 301 duty whether or not the FTA is claimed. Only graduated compression hosiery "
    "(6115.10) pays 10% (9903.05.50).",
    "Pakistan": "Base rate + 10% Section 301 (9903.05.62); no exception list. GSP has expired; the 19% IEEPA duty ended "
    "February 24, 2026.",
    "Guatemala": CAFTA_RULE.format(extra="; Guatemala's own list, 9903.06.06, also covers 245 subheadings when CAFTA-DR is "
                                   "claimed", rate="10%", code="9903.05.40"),
    "El Salvador": CAFTA_RULE.format(extra="; El Salvador's own list, 9903.06.09, also covers 245 subheadings when CAFTA-DR "
                                     "is claimed", rate="10%", code="9903.05.37"),
    "Sri Lanka": "Base rate + 10% Section 301 (9903.05.72); no exception list. The 20% IEEPA duty ended February 24, 2026.",
    "Mexico": "USMCA-qualifying (including goods under the USMCA tariff preference levels): base rate Free and no Section "
    "301 duty (9903.05.94). Otherwise base rate + 10% (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Egypt": "Base rate + 12.5% Section 301 (9903.05.36); no exception list and no FTA.",
    "Dominican Republic": CAFTA_RULE.format(extra="", rate="12.5%", code="9903.05.34"),
    "Haiti": "Base rate only: Haiti is not one of the 60 Section 301 economies. Knit apparel wholly assembled or knit-to-shape "
    "in Haiti can enter Free under the HOPE/HELP headings 9820.61.25–9820.61.45 (through December 31, 2026) or the CBTPA "
    "headings 9820.11.xx, which the grid does not apply.",
    "Kenya": "Base rate only, with AGOA (SPI D) applied on the six lines that print it: Kenya is not one of the 60 Section 301 "
    "economies. Most Kenyan knitwear enters Free under the AGOA apparel headings 9819.11.xx (third-country fabric allowed, "
    "through December 31, 2026), which the grid does not apply.",
    "Italy": "EU: 10% in total in place of the base rate when the base rate is under 10% (9903.05.39) — cashmere sweaters, "
    "silk garments, ties and other low-rated lines; lines at 10% or more, most cotton and synthetic knitwear, pay only their "
    "base rate. The 15%-in-total IEEPA rate ended February 24, 2026.",
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on " + CA338 + ", even "
    "with USMCA. Otherwise base rate + 10% (9903.05.29), and 50% more on those six.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies, such as Madagascar, "
    "Lesotho, Ethiopia and Myanmar) to base rate + 12.5% (9903.05.20–9903.05.84) for Thailand, Türkiye, Peru and the "
    "Philippines; Brazil pays +37.5%. Costa Rica's CAFTA-DR apparel is exempt but shown here without the claim. Column 2 "
    "countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates of up to 90%.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    extra = {"China": ["fr-2025-21671", "fr-2019-27306"], "India": ["cbp-gsp", "eo-14384"], "Pakistan": ["cbp-gsp"],
             "Haiti": ["procl-11030", "usc-2703a", "hts-ch98"], "Kenya": ["procl-11030", "usc-3721", "hts-ch98"],
             "Honduras": ["csms-69326983"], "Nicaragua": ["csms-69326983", "fr-2025-23892"], "Guatemala": ["csms-69326983"],
             "El Salvador": ["csms-69326983"], "Dominican Republic": ["csms-69326983"]}.get(c["country"], [])
    if c["country"] not in ("Any other country", "Haiti", "Kenya"):
        extra = extra + ["eo-14389"]
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Knit ensembles (6103.22–6103.29, 6104.22–6104.29) have the base rate \"the rate applicable to each garment in the "
    "ensemble if separately entered\". The cells show that text plus the extra duty, because the base duty depends on the "
    "garments in the set. The tariff calculator prices it: enter each garment's 10-digit line and value (the values add "
    "up to the shipment value, and per-kilogram rates ask for the weight); each garment pays its own rate on its own value, "
    "and the extra duties are charged on the whole value. Under an FTA claim the ensemble line itself is Free.",
    "CAFTA-DR countries are priced with the CAFTA-DR claim (SPI P): the base rate is Free and note 52(i) removes the "
    "Section 301 duty. Lines whose General rate is already Free print no P, so they cannot be entered under CAFTA-DR and "
    "keep the duty.",
    "Chapter 98 programs are not in the grid: AGOA apparel (9819.11.xx), Haiti HOPE/HELP (9820.61.xx) and CBTPA "
    "(9820.11.xx), the USMCA tariff preference levels (9823.52–9823.53) and U.S.-component assembly (9802.00.80). Goods "
    "properly entered under a Chapter 98 provision other than 9802 also escape the 2026 Section 301 duty (note 52(a)).",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied. The Nicaragua Section 301 duty "
    "(9903.89.01) starts January 1, 2027 and is not applied.",
    "EU rates of \"10% in total\" replace the base rate when it is lower (U.S. note 52(k)); where the base rate is higher, "
    "only the base rate applies.",
    "Not in the grid: the UFLPA presumption against garments containing Xinjiang cotton, CBP textile entry rules, and FTC "
    "and CPSC labeling and flammability rules — see Import documents. No antidumping or countervailing duty order and no "
    "Section 232 action covers a Chapter 61 product.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 16, 19, 20, 30, 31, 33, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) "
    "(9903.05.86) names no Chapter 61 code, and the carve-outs in 52(c)–(f) do not reach apparel. Note 52(i) (9903.05.95) "
    "exempts CAFTA-DR textile and apparel goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and "
    "Nicaragua entered free of duty under CAFTA-DR. Of the note 52(j) country lists, only Jordan's (9903.06.20) and — for "
    "CAFTA-DR claims — Guatemala's (9903.06.06) and El Salvador's (9903.06.09) name Chapter 61 codes: 245 of the 252 "
    "subheadings, all but 6115.10; the UK, EU, Swiss, Malaysian, Cambodian, Argentine, Bangladeshi, Taiwanese, Indonesian "
    "and Ecuadorian lists name none. Note 50(a)(ii) names no Chapter 61 code for Brazil. Note 51(b)(3) puts 6104.43.20, "
    "6104.63.20, 6109.10.00, 6110.20.20, 6110.30.30 and 6116.93.88 on the Canada Section 338 list (9903.03.14). Note 20(s) "
    "puts 209 Chapter 61 subheadings on List 4A; the other 43 are on List 4B (note 20(u)), which is suspended; no Chapter "
    "61 line is on Lists 1–3, and note 20(vvv)(iv) excludes one product (babies' sleep sacks, 6111.20.60.70) through "
    "November 9, 2026. Note 31 (2024 increases) and note 30 (Russia, 9903.90.08) list no Chapter 61 line. No Section 232 "
    "heading (notes 16, 19, 33, 36–39) reaches a Chapter 61 product; the Section 232 certified-parts elections are opt-in "
    "and left out. A Federal Register search of Commerce (ITA) notices found no antidumping or countervailing duty order "
    "on a Chapter 61 product."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

# ---------------------------------------------------------------- understandIndustry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 61: Knitted Apparel — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "U.S. Knit Apparel Imports by Country: Vietnam, China, Cambodia, Bangladesh — HTS Chapter 61 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    f"U.S. imports of T-shirts, sweaters, sweatshirts, leggings, underwear, socks and other knitted apparel {min(TOT)}–{Y} "
    f"by country and product: {TOTAL} in {Y}. Vietnam supplied {round(sh('Vietnam'))}%, China {round(sh('China'))}%, "
    f"Cambodia {round(sh('Cambodia'))}% and CAFTA-DR countries {round(CAFTA_TOT / TOT[Y] * 100)}%."
)
ui["seo"]["keywords"] = [
    "apparel imports by country",
    "us clothing imports 2025",
    "knitted apparel imports united states",
    "southeast asia knitted apparel sourcing",
    "vietnam apparel exports to us",
    "cambodia garment exports to us",
    "cafta-dr apparel imports",
    "hts 6112 activewear imports",
]
ui["byYearCaption"] = (
    f"U.S. imports of Chapter 61 goods each year, split into the two largest {Y} suppliers (Vietnam and China) and everyone else."
)
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["why"] = (
    f"U.S. imports of knitted and crocheted apparel were **{TOTAL} in {Y}**, {abs(TOT_CHG)}% {'less' if TOT_CHG < 0 else 'more'} "
    f"than the {m(TOT[PY])} of {PY} and well below the {m(TOT[2022])} peak of 2022. **Vietnam** overtook China as the largest "
    f"supplier at **{m(imp('Vietnam'))}** ({round(sh('Vietnam'))}%, up {chg('Vietnam')}%), while **China** fell "
    f"{abs(chg('China'))}% to **{m(imp('China'))}** ({round(sh('China'))}%) — in {Y} Chinese garments carried List 4A, the "
    f"IEEPA fentanyl duty and, from April, the reciprocal tariff. **Cambodia** ({m(imp('Cambodia'))}, up {chg('Cambodia')}%), "
    f"**Bangladesh** ({m(imp('Bangladesh'))}), **Indonesia** ({m(imp('Indonesia'))}) and **India** ({m(imp('India'))}) "
    f"followed. The CAFTA-DR countries — Honduras, Nicaragua, Guatemala, El Salvador, the Dominican Republic and Costa "
    f"Rica — together shipped **{m(CAFTA_TOT)}**, and **Jordan** {m(imp('Jordan'))}, and both can enter Free, with no "
    f"Section 301 duty, when the garments meet the agreements' rules of origin.\n\n"
    f"By product, heading 6110 — sweaters, pullovers, sweatshirts, hoodies and cardigans — was **{m(hy('6110'))}**, more "
    f"than a quarter of the chapter; cotton ones (6110.20) alone were {m(HS6['611020']['importsUsd'])} and man-made-fibre "
    f"ones (6110.30) {m(HS6['611030']['importsUsd'])}. **T-shirts and tank tops** (6109) were {m(hy('6109'))}, of which "
    f"cotton {m(HS6['610910']['importsUsd'])}; women's suits, dresses, skirts, trousers and leggings (6104) "
    f"{m(hy('6104'))}; women's underwear and sleepwear (6108) {m(hy('6108'))}; men's trousers and ensembles (6103) "
    f"{m(hy('6103'))}; and socks and hosiery (6115) {m(hy('6115'))}.\n\n"
    "The IEEPA duties that pushed sourcing away from China in 2025 ended on February 24, 2026. Since July 24, 2026 the "
    "main extra duty is a Section 301 tariff of 10% or 12.5% on 60 economies that exempts CAFTA-DR and Jordanian apparel, "
    f"and China keeps List 4A. {Y} is the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": f"UN Comtrade (public API), United States imports, HS chapter 61 (retrieved {trade['retrievedAt']})",
     "url": "https://comtradeplus.un.org/"}
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the "
    f"6-digit level, for calendar years {min(TOT)}–{Y}. \"Other Asia, nes\" is how UN Comtrade reports Taiwan."
)
