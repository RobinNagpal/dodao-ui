"""Chapter 56 tariff-engineering page (rules + levers) and the change log. Trade-independent."""
from fill56_static import CH98, CH99, CH56, CH50, GN, CA338, CN_EXCL, NEW_SOURCES, ecfr, ecfr_part


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


CHANGES = [
    ch("cn-exclusions-end", "pending", "2026-10-13", "Checked", "China nonwoven exclusions expire after November 9, 2026",
       "The Section 301 product exclusions for staple-fibre nonwovens of 25–70 g/m² (5603.92.00.70, 5603.92.00.95) and "
       "70–150 g/m² (5603.93.00.90) from China (U.S. note 20(vvv)(iii)(9)–(10), 9903.88.69) run through November 9, 2026. "
       "Unless USTR extends them again, these lines pay the 25% List 3 duty again from November 10, on top of the 12.5%.",
       "Excluded from the 25%", "+25% again from November 10, 2026 (unless extended)", "China",
       ["fr-2025-21671", "hts-chapter-99", "hts-now"]),
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 List 3 continues",
       "USTR received requests to continue the 2018 China Section 301 actions, so they stay in effect during the four-year "
       "review. For Chapter 56 this keeps +25% (9903.88.03) on every subheading, from wadding and felt to rope and nets.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 56",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles from "
       "September 29, 2026. No Chapter 56 line is on their annexes, so Canadian nonwovens and cordage still enter, paying "
       "the 50% Section 338 duty where listed.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; Chapter 56 nonwovens stay on it",
       "Proclamation 11065 added and deleted products on the 9903.03.14 list from September 15, 2026. It neither added nor "
       "removed a Chapter 56 provision: Revision 21 still lists " + CA338 + " in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on most nonwovens and braided synthetic cordage",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in the provisions of U.S. note 51(b)(3). In "
       "Chapter 56 that is " + CA338 + " — 17 of 81 lines. It is charged even when USMCA is claimed and on top of the 10% "
       "Section 301 duty on non-USMCA goods. Planned for August 19, it took effect August 22 after a 3-day suspension "
       "(Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 56 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 56 subheading is on the general "
       "exemption list (note 52(b)) or on the EU, UK, Swiss, Japanese or Korean exception lists; only Jordan's list covers "
       "the whole chapter, and Guatemala's and El Salvador's lists cover it for goods entered under CAFTA-DR. EU and "
       "Taiwanese goods pay 10% and Japanese, Korean and Swiss goods 12.5% in total, in place of a lower base rate; "
       "USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). FTA claims remove the base rate but not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). Brazil's exemption list (U.S. note 50(a)(ii), 9903.05.03) names one "
       "Chapter 56 subheading, sisal and agave binder or baler twine (5607.21.00). From July 24 the 12.5% 2026 action "
       "(9903.05.27) is added on top, including on baler twine.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("twist-ties-sunset", "reference", "2026-06-30", "Published", "Twist ties from China: AD/CVD orders likely to continue",
       "Commerce's expedited sunset reviews found that revoking the antidumping and countervailing duty orders on twist "
       "ties from China (A-570-131, C-570-132) would likely lead to dumping margins up to 72.96% and subsidy rates of "
       "111.96%. The orders name 5609.00.30.00 as a primary entry number. The ITC decided on June 5, 2026 to conduct full "
       "five-year reviews; the orders stay in force until it decides.",
       None, None, "China", ["fr-2026-13105", "fr-2026-12961", "fr-2026-12537", "fr-2021-07630"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance: cotton tracing applies to cotton wadding",
       "CBP's operational guidance for importers lists supply-chain tracing documents for the UFLPA high-priority sectors, "
       "including cotton and cotton products. Cotton wadding (5601.21) and cotton netting, hammocks and cordage articles "
       "fall under the cotton guidance; the UFLPA presumption applies to goods of any kind made wholly or in part in "
       "Xinjiang or by a listed entity.",
       None, None, "China", ["cbp-fl-guidance", "pl-117-78"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 56 subheading was on the product "
       "exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
       None, "+10% (until July 23, 2026)", "All", ["procl-11012", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
       "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
       "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
       "printed in Revision 21 but are no longer in effect.",
       "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("india-oil-end", "extraDuty", "2026-02-07", "Effective", "India's extra 25% IEEPA duty removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. India's "
       "25% reciprocal rate ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) is printed "
       "on six Chapter 56 subheadings — 5607.29.00, 5607.41.10, 5607.49.10, 5607.90.35, 5608.90.23 and 5608.90.30. GSP (SPI A), "
       "printed on the same six, remains expired since December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("nicaragua-301", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 56 line.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-exclusions-extended", "reference", "2025-12-01", "Published", "China nonwoven exclusions extended to November 9, 2026",
       "USTR extended all 178 China Section 301 exclusions under 9903.88.69, including three nonwoven statistical lines of "
       "staple fibres (" + CN_EXCL + "). They remove the 25% List 3 duty, not the 12.5% 2026 action.",
       None, "Excluded through November 9, 2026", "China", ["fr-2025-21671", "fr-2024-11904", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 56 "
       "line on top of the 25% List 3 duty until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian twine, rope, felt and nonwovens. "
       "Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates, for example India +25%, Vietnam and Taiwan +20%, "
       "Japan and South Korea +15%, and 15% in total for EU goods. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil (9903.01.77), on top of the 10% reciprocal "
       "duty. Its exemption list (9903.01.81) included sisal baler twine (5607.21.00). Ended February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323", "hts-chapter-99"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 56 subheading was on "
       "the general exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) "
       "to +20%, on top of the 25% List 3 duty on Chapter 56 goods.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended "
       "February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
]


def src_url(sid, pool):
    return (NEW_SOURCES.get(sid) or pool[sid])["url"]


def engineering(pool):
    page = {
        "h1": "Importing Nonwovens, Felt, Rope & Netting (HTS Ch. 56): Origin Rules, Documents & Ways to Lower Duty",
        "seo": {
            "title": "Importing Nonwovens, Rope & Twine: Textile Origin, FTC Labeling, UFLPA & Duty Savings (HTS Chapter 56) | KoalaGains",
            "shortDescription": (
                "The CBP, FTC and FDA rules for each HTS Chapter 56 line — textile country of origin (19 CFR 102.21), "
                "manufacturer ID, invoice and fibre-content labeling, UFLPA, AD/CVD on twist ties — and the legal ways to pay "
                "less: USMCA, CAFTA-DR, the China nonwoven exclusion, rulings, samples and drawback."
            ),
            "keywords": [
                "importing nonwoven fabric rules",
                "19 CFR 102.21 nonwovens origin",
                "usmca preferential origin",
                "uflpa compliance for textile wadding",
                "first sale for export valuation",
                "nonwoven sample hs code",
                "hts chapter 56 tariff engineering",
            ],
        },
        "intro": (
            "Chapter 56 goods are textiles, so **CBP's textile rules decide their origin**: nonwovens and felt are from where "
            "the web was formed, rope and twine from where the filaments were extruded or the fibres spun, and made-up nets "
            "from where the netting was made or the net assembled (19 CFR 102.21). Every entry names the manufacturer through "
            "a manufacturer identification code, and goods made wholly or in part in Xinjiang are presumed barred under the "
            "UFLPA.\n\n"
            "The ways to pay less are in the schedule: claim **USMCA** on North American goods (it removes the 10% Section "
            "301 duty but not Canada's 50% Section 338 duty on listed nonwovens), claim **CAFTA-DR** for Central American "
            "textiles, use **China's nonwoven exclusion** while it lasts, get a **ruling** where weight per m², fibre or "
            "construction decides the line, enter **samples** under Chapter 98, and claim **drawback** on re-exports. Each "
            "depends on a document, listed below with its regulation."
        ),
        "disclaimer": (
            "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, the China "
            "exclusions, the Canada Section 338 list and AD/CVD scopes change by proclamation and notice; check them before "
            "each shipment."
        ),
    }
    page["levers"] = [
        {
            "id": "usmca",
            "title": "Claim USMCA on nonwovens, felt, yarn, rope or nets made in Mexico or Canada",
            "saves": "The 10% Section 301 duty for Mexico or Canada plus the base rate (up to 14.1%, or the compound felt and rope rates)",
            "appliesTo": "All 81 lines, for goods that qualify as originating: made in North America from fibres or yarn that "
            "are not non-originating man-made filaments or fibres (chapters 54–55) or non-originating wool, cotton or "
            "vegetable-fibre yarn and fabric (General Note 11, Chapter 56 rules)",
            "document": "A certification of origin from the importer, exporter or producer, in any format, with the SPI \"S\" "
            "on the entry line.",
            "caveat": "For Canada, USMCA does not remove the 50% Section 338 duty on " + CA338 + ". The USMCA was not "
            "renewed at the July 1, 2026 joint review but remains in force.",
            "citations": [
                {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
                {"label": "HTSUS General Note 11 (Chapter 56 rules)", "url": GN},
                {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
            ],
        },
        {
            "id": "cafta-jordan",
            "title": "Source CAFTA-DR or Jordanian textiles that are exempt from the Section 301 duty",
            "saves": "The 10%–12.5% Section 301 duty, and the base rate where the FTA rate is Free",
            "appliesTo": "Every Chapter 56 line from Jordan (U.S. note 52(j), 9903.06.20); every line from Guatemala and El "
            "Salvador entered under CAFTA-DR (9903.06.06, 9903.06.09); CAFTA-DR textile goods of Costa Rica, the Dominican "
            "Republic, Honduras and Nicaragua entered duty-free under CAFTA-DR (note 52(i), 9903.05.95)",
            "document": "Proof of origin under the agreement and the SPI (P or P+ for CAFTA-DR, JO for Jordan) with the "
            "exemption heading on the entry line.",
            "caveat": "The goods must originate under the agreement's textile rules, which generally require regional yarn or "
            "fibre. A CAFTA-DR claim also keeps Nicaraguan goods out of the 2027 Nicaragua Section 301 duty.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
                {"label": "HTSUS General Note 29 (CAFTA-DR)", "url": GN},
            ],
        },
        {
            "id": "china-exclusion",
            "title": "Claim the China product exclusion for listed staple-fibre nonwovens",
            "saves": "The 25% List 3 duty (the 12.5% 2026 duty still applies)",
            "appliesTo": "Chinese nonwovens of staple fibres classified in " + CN_EXCL + ", entered by November 9, 2026",
            "document": "Heading 9903.88.69 reported with the excluded statistical number.",
            "caveat": "The exclusion is tied to those statistical numbers; impregnated or coated nonwovens (.10 lines) and "
            "filament nonwovens (5603.1x) pay the full 37.5%. It ends after November 9, 2026 unless USTR extends it again.",
            "citations": [
                {"label": "HTSUS U.S. note 20(vvv)(iii)(9)–(10), heading 9903.88.69", "url": CH99},
                {"label": "90 FR 55232 (exclusions extended to November 9, 2026)", "url": src_url("fr-2025-21671", pool)},
            ],
        },
        {
            "id": "fta",
            "title": "Claim an FTA or AGOA rate where the base rate is the cost",
            "saves": "The base rate: up to 14.1% (cotton hammocks and netting), 13.2% (metalized yarn), 12% (laminated "
            "needleloom felt), 10.6% (other needleloom felt), 8.5% (fish netting), 8% (fishing nets, gimped yarn) and the "
            "compound felt and rope rates",
            "appliesTo": "The 47 dutiable lines, for goods of Korea, Australia, Chile, Colombia, Peru, Panama, Israel, "
            "Morocco, Bahrain, Oman and Singapore; AGOA countries (through December 31, 2026) only on 5607.29, 5607.41.10, "
            "5607.49.10, 5607.90.35, 5608.90.23 and 5608.90.30",
            "document": "Proof of origin under the agreement and the SPI on the entry line (KR, AU, CL, CO, PE, PA, IL, MA, "
            "BH, OM, SG, D).",
            "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)); Korea's 12.5% applies in total "
            "whatever the KORUS rate. GSP (A) has been expired since December 31, 2020. The Automotive Products Trade Act "
            "(B) applies only to original motor-vehicle equipment from Canada.",
            "citations": [
                {"label": "HTSUS General Note 3(c)", "url": GN},
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
                {"label": "CBP: GSP status", "url": src_url("cbp-gsp", pool)},
            ],
        },
        {
            "id": "ruling",
            "title": "Get a binding classification ruling where weight, fibre or construction decides the line",
            "saves": "Up to 14.1 points of base rate, and certainty for exclusion and Section 338 claims: nonwoven (Free) vs. "
            "felt (6.3%–12%) vs. coated fabric of chapter 59; filament vs. staple-fibre nonwoven and weight per m² (which "
            "decides the China exclusion and the Canada list); yarn vs. twine by decitex (Section XI note 3); braided vs. "
            "unbraided rope; knotted netting (5608) vs. knitted or tulle netting (6003, 5804)",
            "appliesTo": "Any line where the material, weight per m², bonding, coating or construction is in doubt",
            "document": "A ruling request to CBP describing fibre content by weight, construction, weight per m² or decitex "
            "and any coating (19 CFR part 177); invoices must state the same details (19 CFR 141.89).",
            "caveat": "Rulings apply to the transaction described; a different blend, weight or coating may need its own.",
            "citations": [
                {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
                {"label": "HTSUS Chapter 56 notes", "url": CH56},
                {"label": "HTSUS Section XI notes (printed with Chapter 50)", "url": CH50},
            ],
        },
        {
            "id": "first-sale",
            "title": "Declare the first-sale price when goods pass through a middleman",
            "saves": "Duty on the middleman's markup — every ad valorem duty, including Section 301 and Section 338, is charged "
            "on the transaction value",
            "appliesTo": "All lines bought through a trading company or agent, when the factory's sale to the middleman was "
            "for export to the United States",
            "document": "The factory's invoice to the middleman and proof the sale was destined for the U.S. at the time "
            "(purchase orders, shipping documents), filed with the entry.",
            "caveat": "The earlier sale must be a bona fide arm's-length sale for export to the U.S.; CBP may ask for the "
            "whole chain of documents.",
            "citations": [
                {"label": "19 CFR 152.103 (transaction value)", "url": ecfr(19, "152.103")},
            ],
        },
        {
            "id": "samples",
            "title": "Enter swatches and sample cuts as samples",
            "saves": "All duty — base rate and the Section 301, China and Canada duties",
            "appliesTo": "Nonwoven, felt and netting swatches and rope samples valued at $1 or less each, or marked, torn or "
            "perforated so they cannot be sold, used only to solicit orders",
            "document": "Entry under 9811.00.60 with the samples marked or mutilated as the heading requires.",
            "caveat": "Usable cuts or sample rolls for production do not qualify. U.S. notes 20, 51 and 52 exempt goods "
            "properly entered under Chapter 98 from those extra duties.",
            "provisions": [
                {"code": "9811.00.60", "rate": "Free", "text": "Samples valued not over $1 each, or marked, torn, perforated or otherwise treated so they are unsuitable for sale, used only for soliciting orders for products of foreign countries"}
            ],
            "citations": [
                {"label": "HTSUS 9811.00.60", "url": CH98},
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20(a), 51, 52(a)", "url": CH99},
            ],
        },
        {
            "id": "drawback",
            "title": "Claim drawback when the goods, or what they are made into, are exported",
            "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported nonwovens, felt, yarn or rope "
            "re-exported or used in exported goods",
            "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
            "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
            "caveat": "Only duties actually paid are refunded; manufacturing drawback needs a ruling or a general "
            "manufacturing ruling.",
            "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
        },
    ]
    page["rules"] = [
        {
            "id": "textile-origin",
            "agency": "CBP",
            "title": "Textile country of origin: felt and nonwovens from where a fabric-making process formed them (or where "
            "greige goods were both dyed and printed with two more finishing operations); special yarn (5604–5606), twine and "
            "rope from where the filaments were extruded or the fibres spun; knotted netting from where it was made, and nets "
            "with non-textile attachments from where they were wholly assembled; 5609 articles from where the filaments were "
            "extruded or the fibres spun; wadding by a change of heading that excludes staple fibres of 5105, 5203 and "
            "5501–5507",
            "citations": [{"label": "19 CFR 102.21(c), (e)", "url": ecfr(19, "102.21")}],
        },
        {
            "id": "textile-mid",
            "agency": "CBP",
            "title": "Manufacturer identification code (MID) of the company that performed the origin-conferring operation on "
            "every entry — this replaced the textile declaration, eliminated in 2011",
            "citations": [
                {"label": "19 CFR 102.23", "url": ecfr(19, "102.23")},
                {"label": "76 FR 14575 (textile declarations eliminated)", "url": src_url("fr-2011-6253", pool)},
            ],
        },
        {
            "id": "cita-transship",
            "agency": "CBP / CITA",
            "title": "Entry is denied for textiles from a company named by CITA in the Federal Register for illegal "
            "transshipment or for being unable to verify production",
            "citations": [{"label": "19 CFR 102.24", "url": ecfr(19, "102.24")}],
        },
        {
            "id": "invoice",
            "agency": "CBP",
            "title": "Invoice details for textile fibre products: each fibre by generic name and percentage by weight, in order "
            "of predominance; for yarns, single or plied and whether put up for retail sale",
            "citations": [
                {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
                {"label": "19 CFR 141.89 (Textile fiber products; Yarns)", "url": ecfr(19, "141.89")},
            ],
        },
        {
            "id": "ftc-labeling",
            "agency": "FTC",
            "title": "Textile Fiber Products Identification Act: batts, yarns, fabrics (including felt and nonwoven fabric) and "
            "hammocks sold onward must show fibre content and the country where processed or made; disposable nonwovens for "
            "one-time use and products not on the covered list (such as rope, twine and nets) are excluded",
            "citations": [
                {"label": "16 CFR 303.45", "url": ecfr(16, "303.45")},
                {"label": "16 CFR 303.33", "url": ecfr(16, "303.33")},
            ],
        },
        {
            "id": "uflpa",
            "agency": "CBP",
            "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List are presumed made "
            "with forced labor and excluded unless the importer rebuts it; cotton wadding and other cotton goods fall under "
            "CBP's cotton tracing guidance",
            "citations": [
                {"label": "P.L. 117-78 (UFLPA)", "url": src_url("pl-117-78", pool)},
                {"label": "CBP forced labor operational guidance (June 2026)", "url": src_url("cbp-fl-guidance", pool)},
            ],
        },
        {
            "id": "adcvd-twist-ties",
            "agency": "Commerce / CBP",
            "title": "Antidumping and countervailing duty orders on twist ties from China (A-570-131, C-570-132) name "
            "5609.00.30.00; Chinese twist ties entered here need the AD/CVD case numbers and cash deposits",
            "citations": [
                {"label": "86 FR 19602 (orders)", "url": src_url("fr-2021-07630", pool)},
                {"label": "91 FR 39591 (AD sunset, 2026)", "url": src_url("fr-2026-13105", pool)},
            ],
        },
        {
            "id": "adcvd-ribbon",
            "agency": "Commerce / CBP",
            "title": "Antidumping and countervailing duty orders on plastic decorative ribbon from China (A-570-075, "
            "C-570-076) list 5609.00.30.00 and 5609.00.40.00 among the numbers the ribbon may enter under",
            "citations": [
                {"label": "84 FR 10786 (orders)", "url": src_url("fr-2019-05520", pool)},
                {"label": "89 FR 84865 (continued 2024)", "url": src_url("fr-2024-24749", pool)},
            ],
        },
        {
            "id": "fda-swabs",
            "agency": "FDA",
            "title": "Flocked swabs sold for medical specimen collection are FDA-regulated devices (Class I); the foreign "
            "establishment must register and list the device",
            "citations": [
                {"label": "21 CFR 866.2900", "url": ecfr(21, "866.2900")},
                {"label": "21 CFR part 807", "url": ecfr_part(21, 807)},
            ],
        },
        {
            "id": "cbp-marking",
            "agency": "CBP",
            "title": "Country-of-origin marking on the article or, for bulk rolls, coils and bales, on its container",
            "citations": [
                {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
                {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
            ],
        },
    ]
    BASE = ["textile-origin", "textile-mid", "cita-transship", "invoice", "uflpa", "cbp-marking"]
    group_rules = {
        "5601": BASE + ["ftc-labeling", "fda-swabs"],
        "5602": BASE + ["ftc-labeling"],
        "5603": BASE + ["ftc-labeling"],
        "5604": BASE + ["ftc-labeling"],
        "5605": BASE + ["ftc-labeling"],
        "5606": BASE + ["ftc-labeling"],
        "5607": BASE,
        "5608": BASE + ["ftc-labeling"],
        "5609": BASE + ["adcvd-twist-ties", "adcvd-ribbon"],
    }
    notes = {
        "5601": "Wadding changes origin by a change of heading, but not from carded or combed staple fibres (5105, 5203, "
        "5501–5507); articles of wadding, flock and neps change origin even from wadding. Flocked swabs for specimen collection are FDA devices. Cotton wadding is a "
        "UFLPA cotton product.",
        "5602": "Felt takes the origin of the country where a fabric-making process formed it. Wool felt carries compound "
        "rates (49.5¢/kg + 7.5%, 52.9¢/kg + 8%), so invoices must state net weight.",
        "5603": "Nonwovens take the origin of the country where a fabric-making process formed the web. Weight per m² and filament vs. staple "
        "decide the line, the China exclusion (5603.92.00.70/.95, 5603.93.00.90) and the Canada Section 338 list. Disposable "
        "one-time-use nonwovens are outside FTC labeling.",
        "5604": "Coated or covered yarn takes the origin of the country where the textile filaments were extruded or the "
        "fibres spun, not where they were coated.",
        "5605": "Metalized yarn takes the origin of the country where the filaments were extruded or the fibres spun.",
        "5606": "Gimped and chenille yarn take the origin of the country where the filaments were extruded or the fibres "
        "spun.",
        "5607": "Twine and rope take the origin of the country where the filaments or strip were extruded or the fibres "
        "spun — twisting or braiding imported yarn does not change it. Braided synthetic cordage (5607.50.40) is on "
        "Canada's Section 338 list; sisal baler twine is on Brazil's exemption list.",
        "5608": "Netting takes the origin of the country where it was knotted; nets with non-textile attachments, of the "
        "country where they were wholly assembled. Hammocks are on the FTC covered list.",
        "5609": "Articles of yarn, twine or rope take the origin of the country where the filaments were extruded or the "
        "fibres spun. Chinese twist ties and plastic decorative ribbon entered here can be subject to AD/CVD orders.",
    }
    def line_rules(hts):
        rules = list(group_rules[hts[:4]])
        # FDA covers only the flocked swabs line; FTC labeling covers hammocks but not other nets.
        if "fda-swabs" in rules and hts != "5601.22.00.50":
            rules.remove("fda-swabs")
        if hts.startswith("5608") and hts != "5608.90.23.00":
            rules.remove("ftc-labeling")
        return rules

    def group_rule_fn(h):
        return group_rules[h]

    return page, line_rules, group_rule_fn, notes


def line_levers(hts, dutiable, canada338):
    lev = ["usmca", "cafta-jordan"]
    if hts in ("5603.92.00.70", "5603.92.00.95", "5603.93.00.90"):
        lev.append("china-exclusion")
    if hts in dutiable:
        lev.append("fta")
    lev += ["ruling", "first-sale", "samples", "drawback"]
    return lev
