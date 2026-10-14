"""Authored text and official facts for the Chapter 13 content file (used by fill.py)."""

CHECKED = "2026-10-12"
ECFR_DATE = "2026-10-08"
HTS21 = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
GN_URL = "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes"
CH99_URL = "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099"
CH13_URL = "https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2013"


def ecfr(title, section):
    return f"https://www.ecfr.gov/current/title-{title}/section-{section}"


LABELS = {
    "1301": ("Gum arabic, shellac & natural resins", "Gums & resins"),
    "1302": ("Plant extracts, pectin, agar & thickeners", "Extracts & thickeners"),
}
EU_MEMBERS = {"France", "Spain", "Germany", "Italy", "Denmark"}

HS6_LABELS = {
    "1302.19": ("Other plant extracts (herbal and botanical extracts, ginseng, aloe, poppy straw)", "herbal botanical extract ginseng aloe cashew nut shell liquid"),
    "1302.20": ("Pectin, pectinates and pectates", "pectin citrus apple"),
    "1302.32": ("Guar gum and locust bean gum", "guar gum locust bean gum carob"),
    "1302.39": ("Other thickeners (carrageenan and others)", "carrageenan seaweed thickener"),
    "1301.20": ("Gum arabic (acacia gum)", "gum arabic acacia"),
    "1301.90": ("Other natural gums and resins (shellac, karaya, tragacanth, balsams, turpentine gum)", "shellac lac karaya tragacanth mastic frankincense"),
    "1302.31": ("Agar-agar", "agar seaweed"),
    "1302.12": ("Licorice extract", "licorice liquorice"),
    "1302.13": ("Hops extract", "hops beer"),
    "1302.11": ("Opium", "opium"),
    "1302.14": ("Ephedra extract", "ephedra"),
}

# ---------------------------------------------------------------- overview
OV_H1 = "HTS Chapter 13: Lac, Gums, Resins & Plant Extracts — Tariff Rates"
OV_SEO = {
    "title": "HTS Chapter 13 Tariff Rates: Gum Arabic, Guar Gum, Pectin, Carrageenan & Plant Extracts | KoalaGains",
    "shortDescription": (
        "Searchable duty table for all 24 HTS Chapter 13 lines: gum arabic, shellac, guar and locust bean gum, pectin, agar-agar, "
        "carrageenan, licorice, hops and herbal extracts, opium. General, FTA and Column 2 rates plus the 2026 extra duty by country."
    ),
    "keywords": [
        "HTS Chapter 13",
        "gum arabic HS code",
        "guar gum import duty",
        "pectin HS code",
        "carrageenan import duty",
        "agar-agar customs duty",
        "locust bean gum customs duty",
        "hop extracts HTS 1302.13",
        "botanical extract HS code",
        "HS code 1302.19",
    ],
}
OV_INTRO = (
    "Chapter 13 covers natural gums and resins and what is extracted from plants: gum arabic, shellac, karaya and tragacanth, "
    "guar and locust bean gum, pectin, agar-agar, carrageenan, licorice and hops extracts, ginseng and other herbal extracts, and "
    "opium. Its **24 tariff lines** carry low printed rates: 16 are Free, and the dutiable ones range from 1% (ginseng and other "
    "therapeutic extracts) to 3.8% (licorice extract), plus 89¢/kg on hops extract.\n\n"
    "The extra duty by country is what matters. The 2025 IEEPA tariffs ended on February 24, 2026. Since **July 24, 2026** goods "
    "from 60 economies pay a **Section 301 tariff**: +10% for India, the largest supplier, 10% in total for the EU, +12.5% for "
    "the Philippines and Chile, and **+20% for China** once its 7.5% List 4A duty is added. **Canada is the outlier**: 20 of the "
    "24 lines carry a **50% Section 338 duty** that applies even to USMCA goods. USMCA-qualifying goods from Mexico enter free, "
    "and gum arabic from Chad or Sudan, which are not among the 60 economies, pays nothing."
)
PRODUCT_GROUPS = {
    "1301": (
        "Gum arabic (Free), shellac and seed lac, balsams, tragacanth, karaya, mastic, frankincense and other natural gums and "
        "resins (Free), and turpentine gum at 1.3%. Gum arabic comes mainly through France and from Chad and Sudan; shellac and "
        "other resins from India and Thailand.",
        ["gum arabic", "acacia gum", "shellac", "seed lac", "karaya", "tragacanth", "frankincense", "mastic gum", "balsam"],
    ),
    "1302": (
        "Plant saps and extracts — opium, licorice (3.8%), hops (89¢/kg), ephedra, ginseng and other therapeutic extracts (1%), "
        "herbal and botanical extracts, cashew nut shell liquid (Free) — plus pectin, agar-agar, guar and locust bean gum (Free) "
        "and carrageenan and other thickeners (3.2%).",
        ["guar gum", "pectin", "carrageenan", "agar agar", "locust bean gum", "licorice extract", "hops extract", "ginseng extract", "herbal extract", "aloe extract"],
    ),
}
WORKED_EXAMPLES = [
    {
        "title": "A $40,000 container of guar gum from India",
        "line": "1302.32.00.20",
        "body": "Guar gum is Free at the general rate, so the only charge is India's **10% Section 301 duty** (9903.05.44): "
        "$40,000 × 10% = **$4,000**. India has no Chapter 13 exception list. Guar from Indonesia or Cambodia, whose exception "
        "lists name subheading 1302.32, would pay $0.",
    },
    {
        "title": "Carrageenan from the Philippines or Chile",
        "line": "1302.39.00.10",
        "body": "Carrageenan is 3.2%. From the Philippines a $50,000 shipment pays 3.2% + 12.5% (9903.05.64) = 15.7%, "
        "**$7,850**. Chile's FTA (SPI **CL**) makes the 3.2% Free, but the 12.5% Section 301 duty (9903.05.30) still applies to "
        "FTA goods: **$6,250**.",
    },
    {
        "title": "500 kg of hops extract from Germany",
        "line": "1302.13.00.00",
        "body": "Hops extract is 89¢/kg: $445 on 500 kg. For EU goods whose base rate is under 10% of value, the Section 301 action "
        "charges **10% in place of the base rate** (9903.05.39), working out a per-kilo rate's share of the customs value (U.S. "
        "note 52(k)). At $30/kg ($15,000) the 89¢/kg is 3% of value, so the duty is **$1,500**. Only an extract worth less than "
        "$8.90/kg would pay the 89¢/kg alone.",
    },
    {
        "title": "Pectin from Canada versus Mexico",
        "line": "1302.20.00.00",
        "body": "Pectin is on Canada's Section 338 list (9903.03.14), which applies **even when USMCA is claimed**: a $20,000 "
        "USMCA-qualifying shipment pays 50%, **$10,000**; without USMCA it also pays 10% Section 301, **$12,000**. The same "
        "pectin from Mexico, USMCA-qualifying, pays **$0** (9903.05.94).",
    },
    {
        "title": "Gum arabic from Chad",
        "line": "1301.20.00.00",
        "body": "Gum arabic is Free, and Chad is not one of the 60 Section 301 economies, so a $30,000 shipment pays **$0**. Gum "
        "arabic that is a product of France pays the EU's 10% (**$3,000**); from Cambodia, El Salvador or Jordan it is exempt "
        "by their exception lists.",
    },
]
CHAPTER_NOTES = (
    "**Note 1.** Heading 1302 applies, inter alia, to licorice extract and extract of pyrethrum, extract of hops, extract of "
    "aloes and opium. The heading does not apply to: (a) licorice extract containing more than 10 percent by weight of sucrose "
    "or put up as confectionery (heading 1704); (b) malt extract (heading 1901); (c) extracts of coffee, tea or maté (heading "
    "2101); (d) vegetable saps or extracts constituting alcoholic beverages (chapter 22); (e) camphor, glycyrrhizin or other "
    "products of heading 2914 or 2938; (f) concentrates of poppy straw containing not less than 50 percent by weight of "
    "alkaloids (heading 2939); (g) medicaments of heading 3003 or 3004 or blood-grouping reagents (heading 3822); (h) tanning or "
    "dyeing extracts (heading 3201 or 3203); (ij) essential oils, concretes, absolutes, resinoids, extracted oleoresins, aqueous "
    "distillates or aqueous solutions of essential oils or preparations based on odoriferous substances of a kind used for the "
    "manufacture of beverages (chapter 33); or (k) natural rubber, balata, gutta-percha, guayule, chicle or similar natural gums "
    "(heading 4001)."
)

# ---------------------------------------------------------------- tariff updates
TU_H1 = "HTS Chapter 13: Lac, Gums, Resins & Plant Extracts — Tariff Updates"
TU_SEO = {
    "title": "HTS Chapter 13 Tariff Updates 2026: Gum Arabic, Guar Gum, Pectin & Plant Extracts | KoalaGains",
    "shortDescription": (
        "What changed for HTS Chapter 13 (gums, resins, pectin, carrageenan, plant extracts) since January 2025: the end of the IEEPA "
        "tariffs and the Section 122 surcharge, the 2026 Section 301 tariffs, Canada's 50% Section 338 duty, with Federal Register citations."
    ),
    "keywords": [
        "HTS Chapter 13 tariff updates",
        "guar gum import duty India",
        "Section 301 tariffs on botanical extracts",
        "China tariff on plant extracts",
        "Canada Section 338 pectin",
        "gum arabic tariff 2026",
    ],
}
TU_INTRO = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). No Chapter 13 base rate changed. The only line change is that "
    "other plant extracts (1302.19.91) gained a separate statistical line for certified organic extracts in Revision 11, both Free.\n\n"
    "Everything else happened on top of the base rate. The 2025 IEEPA duties — up to 50% on India, 40% plus the reciprocal rate on "
    "Brazil, a 10%–20% fentanyl duty plus the reciprocal rate on China — **ended on February 24, 2026**, and the 10% Section 122 "
    "surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section 301 "
    "tariff of 10% or 12.5%**; China also keeps its 7.5% List 4A duty (**20%** in all) and Brazil adds 25% (**37.5%**). Since "
    "**August 22, 2026** most Canadian Chapter 13 goods pay a **50% Section 338 duty**, USMCA or not. USMCA-qualifying goods from "
    "Mexico pay nothing extra."
)
TU_SCOPE = (
    "Measures that reach Chapter 13 from any country: the 2026 Section 301 tariffs on 60 economies (with their country exception "
    "lists), the Brazil Section 301 tariff, China Section 301 List 4A, Canada's Section 338 duties, the Nicaragua Section 301 "
    "phase-in, and the 2025–2026 IEEPA and Section 122 duties that have ended. No antidumping or countervailing duty order covers "
    "a Chapter 13 product. For the rate each supplier pays, see Rates by country."
)

NEW_SOURCES = {
    "fr-2026-16296": {
        "id": "fr-2026-16296",
        "publisher": "Federal Register",
        "citation": "91 FR 51834",
        "document": "Proposed rule (FDA)",
        "title": "Substances Generally Recognized as Safe",
        "signed": None,
        "published": "2026-08-11",
        "url": "https://www.federalregister.gov/documents/2026/08/11/2026-16296/substances-generally-recognized-as-safe",
    },
    "fr-2025-23316": {
        "id": "fr-2025-23316",
        "publisher": "Federal Register",
        "citation": "90 FR 59281",
        "document": "Notice (Commerce, ITA)",
        "title": "Implementing Certain Tariff-Related Elements of the Framework for a United States-Switzerland-Liechtenstein Agreement on Fair, Balanced, and Reciprocal Trade",
        "signed": None,
        "published": "2025-12-18",
        "url": "https://www.federalregister.gov/documents/2025/12/18/2025-23316/implementing-certain-tariff-related-elements-of-the-framework-for-a-united",
    },
    "fr-2024-07859": {
        "id": "fr-2024-07859",
        "publisher": "Federal Register",
        "citation": "89 FR 26129",
        "document": "Notice (Commerce, ITA)",
        "title": "Xanthan Gum From the People's Republic of China: Continuation of Antidumping Duty Order",
        "signed": None,
        "published": "2024-04-15",
        "url": "https://www.federalregister.gov/documents/2024/04/15/2024-07859/xanthan-gum-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order",
    },
}

EXCEPTIONS_52J = (
    "No Chapter 13 line is on the general exemption list (U.S. note 52(b)), but the country exception lists in note 52(j) exempt "
    "gum arabic (1301.20) for Cambodia, El Salvador and Jordan; poppy straw extract (1302.19.21) for Switzerland, Cambodia and "
    "Jordan; agar-agar (1302.31) for Switzerland, Cambodia, Taiwan, Indonesia, Ecuador and Jordan; guar and locust bean gum "
    "(1302.32) for Switzerland, Cambodia, El Salvador, Indonesia and Jordan; boswellia (frankincense, in 1301.90.91) for Malaysia, "
    "Cambodia, Guatemala and Taiwan; and aloe, Tasmanian pepper, coconut and centella extracts (in 1302.19.91) for Cambodia, "
    "Guatemala, El Salvador, Argentina, Taiwan, Indonesia, Ecuador and Jordan."
)

IN_EFFECT = {
    "in": {
        "measure": "Section 301 tariff (2026, 60 economies)",
        "exemption": "India has no Chapter 13 exception list in U.S. note 52(j), and no Chapter 13 line is on the general exemption "
        "list (note 52(b)). GSP (SPI A), printed on several lines, has been expired since December 31, 2020. The 2025 IEEPA duties "
        "on India ended in 2026: the extra 25% (9903.01.84) on February 7 and the 25% reciprocal rate on February 24.",
        "whatItMeans": "Indian guar gum and most plant extracts are Free at the base rate and pay 10%; ginseng and other "
        "therapeutic extracts (1302.19.41) pay 11%. In late 2025 the same guar gum paid 50%.",
        "extraSources": ["eo-14329", "eo-14384", "eo-14389", "cbp-gsp"],
    },
    "cn": {
        "measure": "Section 301 tariffs: 2026 action plus List 4A",
        "exemption": "Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31, from July 24, 2026) and +7.5% under "
        "List 4A (9903.88.15), which covers all 14 Chapter 13 subheadings (7.5% since February 14, 2020). No Chapter 13 line is on "
        "note 52(b) or on a China exclusion. USTR confirmed on October 7, 2026 that the China actions continue during their "
        "four-year review. The IEEPA duties on China (the 10%–20% fentanyl duty and the reciprocal tariff) ended February 24, 2026.",
        "whatItMeans": "Chinese plant extracts and gum arabic pay 20%, ginseng extract 21%, carrageenan 23.2% and licorice "
        "extract 23.8%.",
        "extraSources": ["eo-14389"],
    },
    "eu": {
        "measure": "Section 301 tariff (2026, 60 economies)",
        "exemption": "Every Chapter 13 base rate is under 10%, so EU goods pay 10% in total on every line (9903.05.39). For hops "
        "extract (89¢/kg) the 10% total applies while the 89¢ is under 10% of the value, i.e. above $8.90/kg (U.S. note 52(k)). "
        "The EU exception list (9903.05.97) and the general list (note 52(b)) name no Chapter 13 line. This replaced the 15% "
        "EU reciprocal rate, which ended February 24, 2026.",
        "whatItMeans": "Gum arabic and licorice extract from France, agar and locust bean gum from Spain, pectin from Germany "
        "and Denmark and Italian extracts all pay 10% of value; the 3.8% licorice rate is absorbed in it.",
        "extraSources": ["eo-14389"],
    },
    "mx": {
        "measure": "Section 301 tariff (2026, 60 economies)",
        "exemption": "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). Mexico has no Section 338 "
        "measure and no Chapter 13 exception list. The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "whatItMeans": "USMCA-qualifying Mexican pectin ($41M in 2025) and plant extracts pay $0; goods that do not qualify pay "
        "the base rate plus 10%.",
        "extraSources": ["eo-14389"],
    },
    "ph": {
        "measure": "Section 301 tariff (2026, 60 economies)",
        "exemption": "The Philippines has no Chapter 13 exception list, and no Chapter 13 line is on note 52(b). GSP has expired, "
        "and carrageenan's subheading offers it only to least-developed countries (A+). The IEEPA reciprocal tariff ended "
        "February 24, 2026.",
        "whatItMeans": "Philippine carrageenan, the largest source ($34.5M in 2025), pays 3.2% + 12.5% = 15.7%.",
        "extraSources": ["eo-14389"],
    },
    "br": {
        "measure": "Section 301 tariffs: Brazil action plus 2026 action",
        "exemption": "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, "
        "2026 (9903.05.27). Neither exemption list (note 50(a)(ii), 9903.05.03; note 52(b), 9903.05.86) names a Chapter 13 line. "
        "The 40% IEEPA duty on Brazil (9903.01.77) ended February 24, 2026.",
        "whatItMeans": "Brazilian pectin ($20.0M in 2025) pays 37.5%.",
        "extraSources": ["eo-14389"],
    },
    "cl": {
        "measure": "Section 301 tariff (2026, 60 economies)",
        "exemption": "The Chile FTA (SPI CL) makes every Chapter 13 base rate Free, but the 12.5% duty still applies to FTA goods "
        "(U.S. note 52(a)). Chile has no Chapter 13 exception list. The IEEPA reciprocal tariff ended February 24, 2026.",
        "whatItMeans": "Chilean carrageenan ($19.4M in 2025) pays 12.5% with an FTA claim, 15.7% without.",
        "extraSources": ["eo-14389"],
    },
    "ca": {
        "measure": "Section 338 duties + Section 301 tariff (2026)",
        "now": "+60% or +10% (USMCA: +50% or none)",
        "effectiveSourceId": "procl-11048",
        "exemption": "Section 338: +50% on products of Canada on 20 of the 24 lines — 1301.90.91 (balsams, shellac, seed lac, "
        "tragacanth, karaya and other gums) under 9903.03.13 (note 51(b)(2)), and gum arabic, turpentine gum, hops extract, "
        "ginseng and other therapeutic extracts, other plant extracts, pectin, agar-agar, guar and locust bean gum and carrageenan "
        "under 9903.03.14 (note 51(b)(3)). The lists are named after the Canadian dairy and auto measures they answer, not the "
        "goods they cover. USMCA claims do not remove this duty (note 51(a)). Opium, licorice, ephedra and poppy straw extract are "
        "not listed. The September 15, 2026 scope changes and the September 29 import bans did not touch Chapter 13. Section 301: "
        "USMCA-qualifying goods pay no 10% (9903.05.93). The 35% IEEPA duty (9903.01.10) ended February 24, 2026.",
        "whatItMeans": "USMCA-qualifying Canadian pectin or hops extract pays 50%; without USMCA, 60% plus the base rate. "
        "Canadian licorice extract pays $0 with USMCA and 3.8% + 10% without.",
        "extraSources": ["procl-11064", "procl-11062", "eo-14389"],
    },
    "other": {
        "country": "Other Section 301 economies (incl. South Korea, Indonesia, Japan, Morocco, Switzerland, Taiwan, UK, Vietnam)",
        "measure": "Section 301 tariff (2026, 60 economies)",
        "now": "+10% or +12.5%",
        "exemption": "Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10% in total when the base rate is lower; "
        "the others add 10% or 12.5% to the base rate. " + EXCEPTIONS_52J + " Countries outside the 60 economies, such as Chad "
        "and Sudan, pay only the base rate. Nicaragua's separate Section 301 duty is 0% in 2026.",
        "whatItMeans": "Korean ginseng extract pays 12.5% in total; Indonesian agar and guar gum pay $0; Moroccan agar pays 12.5%; "
        "British hops extract pays 89¢/kg plus 10%.",
        "extraSources": ["fr-2025-23316", "eo-14389"],
    },
}
TU_EXTRA_SOURCES = [
    "hts-2026-rev11",
    "fr-2026-16296",
    "fr-2025-23316",
    "eo-14389",
    "csms-67834313",
    "scotus-24-1287",
    "procl-11012",
    "procl-11064",
    "procl-11062",
    "ustr-usmca-review",
    "eo-14194",
    "eo-14193",
    "eo-14325",
    "eo-14257",
    "eo-14360",
    "eo-14195",
    "eo-14228",
    "eo-14357",
    "eo-14326",
    "eo-14329",
    "eo-14384",
    "eo-14323",
    "ustr-agoa-2026",
    "crs-agoa",
    "procl-11030",
    "cbp-gsp",
]

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
CA338 = ["procl-11047", "procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]


def ch(id_, type_, date, label, title, detail, before, now, countries, sources):
    return {
        "id": id_,
        "type": type_,
        "date": date,
        "dateLabel": label,
        "title": title,
        "detail": detail,
        "before": before,
        "now": now,
        "countries": countries,
        "sourceIds": sources,
    }


CHANGES = [
    ch("base-rates", "baseRate", CHECKED, "Checked", "No Chapter 13 base-rate changes",
       "22 of 24 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. The "
       "other two are new statistical lines from Revision 11 (in force July 1, 2026): other vegetable saps and extracts "
       "(1302.19.91) now separate certified organic (1302.19.91.45) from other (1302.19.91.55), both Free.",
       None, None, None, ["hts-before", "hts-now", "hts-now-cr", "hts-2026-rev11"]),
    ch("cn-301-continue", "reference", "2026-10-07", "Published", "China Section 301 List 4A continues",
       "USTR received requests to continue the China Section 301 actions, so they stay in effect during the four-year review. "
       "For Chapter 13 this keeps +7.5% (9903.88.15) on every line from China, on top of the 12.5% 2026 duty.",
       "+7.5%", "+7.5%", "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canada dairy-scope import ban does not reach Chapter 13",
       "Proclamation 11062 bans certain Canadian dairy-scope goods from September 29, 2026. Its list (provisions in headings 0404, 1702, 1703 "
       "and 2202) does not include 1301.90.91, which stays on the 50% duty list (9903.03.13).",
       None, None, "Canada", ["procl-11062", "hts-chapter-99"]),
    ch("ca-scope", "reference", "2026-09-15", "Effective", "Canada Section 338 lists modified; Chapter 13 lines unchanged",
       "Proclamations 11064 and 11065 changed the 9903.03.12 and 9903.03.14 lists and made the duties apply on top of Section 232 "
       "duties. No Chapter 13 line was added or removed.",
       None, None, "Canada", ["procl-11064", "procl-11065", "csms-69851916", "hts-chapter-99"]),
    ch("section-338-canada-2026-08-22", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duties cover 20 Chapter 13 lines",
       "50% on products of Canada (9903.03.13 for 1301.90.91; 9903.03.14 for 1301.20, 1301.90.40, 1302.13, 1302.19.41, "
       "1302.19.91, 1302.20, 1302.31, 1302.32 and 1302.39), effective after the 3-day suspension in Proclamation 11056 lapsed. "
       "USMCA claims do not remove it, and it stacks with the 10% Section 301 duty on non-USMCA goods.",
       "None", "+50%", "Canada", CA338),
    ch("gras-proposed", "pending", "2026-08-11", "Proposed", "FDA proposes mandatory GRAS notices",
       "FDA proposed to require a GRAS notice before a food substance is used on a self-determined GRAS basis. Ingredients listed "
       "or affirmed as GRAS in 21 CFR parts 182, 184 or 186 under their conditions of use would not need one; that covers gum "
       "arabic, pectins, agar-agar, guar, locust bean, karaya and tragacanth gums and licorice. Plant extracts sold as food "
       "ingredients without such a listing would. Comments close December 9, 2026; not in force.",
       None, None, "All", ["fr-2026-16296"]),
    ch("section-301-2026-60-economies-2026-07-24", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies cover Chapter 13",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). EU goods pay 10% in total and Japan, South Korea "
       "and Switzerland 12.5% in total when the base rate is lower. No Chapter 13 line is on the general exemption list (U.S. note "
       "52(b)); country exception lists exempt gum arabic, poppy straw extract, agar, guar and locust bean gum, boswellia and aloe "
       "extracts for some countries (note 52(j)). USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). FTA claims remove "
       "the base rate but not this duty.",
       "None", "+10% / +12.5%", "60 economies", S301),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", "None", "All", ["procl-11012", "hts-now"]),
    ch("section-301-brazil-2026-07-22", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01). Its exemption list (U.S. note 50(a)(ii), 9903.05.03) names no Chapter 13 line. "
       "From July 24 the 12.5% tariff (9903.05.27) is added on top: 37.5% in all.",
       "None", "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending "
       "resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 13 line was on the product exemption list "
       "(9903.03.03); USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
       "None", "+10% (until July 23, 2026)", "All", ["procl-11012", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
       "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
       "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
       "printed in Revision 21 but are no longer in effect.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("india-oil-end", "extraDuty", "2026-02-07", "Effective", "India's extra 25% IEEPA duty removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84). The 25% reciprocal rate on India "
       "ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025. AGOA (SPI D) "
       "makes every dutiable Chapter 13 line Free for eligible sub-Saharan countries. GSP (SPI A, A+), printed on the same lines, "
       "remains expired since December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA beneficiary countries",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp", "hts-now"]),
    ch("section-301-nicaragua-scheduled-2027-01-01", "pending", "2025-12-12", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in 2026, "
       "10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 13 line.",
       "None", "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("swiss-framework", "reference", "2025-11-14", "Effective", "Switzerland: poppy straw extract, agar and guar exempted",
       "The U.S.–Switzerland–Liechtenstein framework exempted poppy straw extract (1302.19.21), agar-agar (1302.31) and guar and "
       "locust bean gum (1302.32) from the 15% reciprocal rate on Swiss goods (notice published December 18, 2025). The same three "
       "subheadings are on Switzerland's 2026 Section 301 exception list (9903.05.98).",
       None, None, "Switzerland, Liechtenstein", ["fr-2025-23316", "hts-chapter-99"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 13 "
       "line until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, "
       "2025 (EO 14326): 50% in all on Indian guar gum and plant extracts. Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil from August 6, 2025, on top of the 10% reciprocal "
       "duty. Ended February 24, 2026.",
       "None", "+40% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 13 line was on the "
       "agricultural exemption list added in November 2025 (EO 14360). Ended February 24, 2026.",
       "None", "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257", "eo-14360"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to "
       "+20%, on top of the 7.5% List 4A duty.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.",
       "None", "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.",
       "None", "+25% (ended)", "Canada", ["eo-14193"]),
]

# ---------------------------------------------------------------- understand industry
UI_H1 = "HTS Chapter 13: Lac, Gums, Resins & Plant Extracts — U.S. Import Statistics"
UI_SEO = {
    "title": "HTS Chapter 13 Import Statistics: Guar Gum, Pectin, Gum Arabic & Plant Extracts by Country | KoalaGains",
    "shortDescription": (
        "U.S. imports of gums, resins, pectin, thickeners and plant extracts 2020–2025, by country, product and year. $1.73B in "
        "2025, down 4.6% from 2024; India and China supplied 47%."
    ),
    "keywords": [
        "guar gum importers in USA",
        "US imports of plant extracts",
        "gum arabic imports by country",
        "pectin imports United States",
        "carrageenan imports Philippines",
        "HTS Chapter 13 import statistics",
    ],
}
UI_WHY = (
    "U.S. imports of Chapter 13 goods were **$1.73B in 2025**, down 4.6% from $1.81B in 2024 and below the 2022 peak of $2.11B. "
    "More than nine-tenths is heading 1302, and one line dominates: **other plant extracts (1302.19), $1.04B or 60%**, mostly from "
    "India ($343M) and China ($271M), then France, Spain and Italy. Next come pectin ($189M, up 23%; Germany $60M, Mexico $41M, "
    "Denmark and Brazil), guar and locust bean gum ($182M; India $134M) and carrageenan and other thickeners ($118M; the "
    "Philippines $35M and Chile $19M).\n\n"
    "Heading 1301 was $145M: **gum arabic $94M**, more than half shipped from France, with Chad ($16M, four times its 2024 "
    "level) and Sudan ($12M) the main African sources; and shellac, karaya, mastic and other resins $51M, half from India. "
    "Opium imports were $19,599 and ephedra extract none.\n\n"
    "India (29%) and China (17%) supplied 47% of the total. China fell 18% in 2025, a year in which Chinese goods also paid the "
    "IEEPA duties on top of List 4A; Mexico (+27%) and Germany (+19%) grew. Those duties ended on February 24, 2026, and since "
    "July 24, 2026 a Section 301 tariff of 10% or 12.5% applies instead. 2025 is the latest full year of U.S. trade data."
)
UI_SOURCES = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 13 (retrieved 2026-10-12)", "url": "https://comtradeplus.un.org/"},
    {"label": "UN Comtrade (public API), United States imports by partner for each Chapter 13 HS subheading, 2025 (retrieved 2026-10-12)", "url": "https://comtradeplus.un.org/"},
]

# ---------------------------------------------------------------- industry areas
IA_H1 = "HTS Chapter 13: Lac, Gums, Resins & Plant Extracts — Tariff Rates by Country"
IA_SEO = {
    "title": "HTS Chapter 13 Tariff Rates by Country: Guar Gum from India, Pectin, Carrageenan, Gum Arabic | KoalaGains",
    "shortDescription": (
        "The total U.S. tariff on gums, resins, pectin, thickeners and plant extracts by country: base rate plus the 2026 Section 301 "
        "duty, Canada's 50% Section 338 duty, USMCA and FTA rules applied. India, China, France, Spain, Germany, Mexico, Philippines and more."
    ),
    "keywords": [
        "guar gum import duty India",
        "Sudan gum arabic tariff",
        "China tariff on plant extracts",
        "France pectin and agar-agar customs duty",
        "carrageenan tariff Philippines",
        "Canada Section 338 pectin",
    ],
}
IA_INTRO = (
    "The total rate on gums, pectin and plant extracts depends on **where they come from** far more than on what they are. Each "
    "cell below is the base rate for that product group plus the extra duty for that country, minus any preference, computed from "
    "the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the main extra duty is the **Section 301 tariff on 60 economies** that "
    "started July 24, 2026: **India +10%**, **EU 10% in total**, the Philippines and Chile +12.5% (Chile keeps a Free base rate "
    "under its FTA), **China +20%** with List 4A and **Brazil +37.5%**. **USMCA-qualifying goods from Mexico enter free.** "
    "**Canada pays 50%** on 20 of the 24 lines under Section 338 even with a USMCA claim. Gum arabic from **Chad** pays nothing."
)
RULE_LABELS = {
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; India has no Chapter 13 exception list. Guar gum and most extracts are Free, so they pay 10%. The IEEPA duties on India (up to 50%) ended by February 24, 2026.",
    "China": "Base rate plus 12.5% Section 301 (9903.05.31) and 7.5% List 4A (9903.88.15) on every line: 20% on top. No China exclusion names a Chapter 13 product. The IEEPA duties ended February 24, 2026.",
    "EU": "10% in total in place of the base rate (9903.05.39): every Chapter 13 base rate is under 10%, so every line pays 10% (hops extract while it is worth over $8.90/kg). No EU exception covers Chapter 13.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "Philippines": "Base rate plus 12.5% Section 301 (9903.05.64): carrageenan pays 3.2% + 12.5% = 15.7%. No Chapter 13 exception list; GSP has expired.",
    "Brazil": "Base rate plus 25% (9903.05.01) and 12.5% (9903.05.27) Section 301: 37.5% on top. Neither exemption list names a Chapter 13 line.",
    "Chile": "Base rate Free under the Chile FTA (CL), plus 12.5% Section 301 (9903.05.30) on every line (U.S. note 52(a)).",
    "Canada": "Section 338: +50% on 20 of 24 lines (9903.03.13 for 1301.90.91; 9903.03.14 for nine other subheadings), USMCA claims included. Section 301: +10% (9903.05.29) unless USMCA-qualifying (9903.05.93). Opium, licorice, ephedra and poppy straw extract are off the 338 lists.",
    "Chad": "Not one of the 60 Section 301 economies: base rate only, so gum arabic, Chad's Chapter 13 export, is Free.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies, such as Sudan) up to +12.5% (9903.05.20–9903.05.84); Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10%. Note 52(j) exception lists exempt gum arabic, poppy straw extract, agar, guar and locust bean gum, boswellia and aloe extracts for some countries.",
}
RULE_EXTRA_SOURCES = {
    "India": ["eo-14389"],
    "China": ["eo-14389"],
    "Mexico": ["eo-14389"],
    "Canada": ["eo-14389"],
    "Any other country": ["fr-2025-23316"],
}
IA_ASSUMPTIONS = [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
    "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Canada: the 50% Section 338 duty (9903.03.13, 9903.03.14) applies to USMCA goods too (U.S. note 51(a)), so the "
    "USMCA-qualifying side shows 50% on the 20 listed lines and Free on the other four.",
    "EU: 9903.05.39 sets a 10% total when the base rate, or its ad valorem equivalent, is under 10% (U.S. note 52(k)). For hops "
    "extract (89¢/kg) the matrix prices $10 per kg; extract worth less than $8.90/kg would pay only the 89¢/kg.",
    "Country exception lists that name a product inside a subheading (boswellia in 1301.90.91; aloe, Tasmanian pepper, coconut "
    "and centella in 1302.19.91) need the importer to confirm the product, so they are not applied; whole-subheading exceptions "
    "(gum arabic, poppy straw extract, agar, guar and locust bean gum) are.",
    "No antidumping or countervailing duty order covers a Chapter 13 product. Xanthan gum, which is under an antidumping order on "
    "China, is classified in 3913.90.20 (chapter 39), not here. There are no quota or Chapter 98 rates and no excise taxes on these lines.",
    "AGOA (SPI D) was reauthorized on February 3, 2026 through December 31, 2026; it would make the dutiable base rates Free for "
    "eligible sub-Saharan suppliers.",
    "Entry also needs agency clearance not shown here: DEA import permits for opium and poppy straw extract, FDA food rules for "
    "gums, pectin and extracts, EPA notice for pyrethrum extract sold as a pesticide (see Import documents).",
]
IA_EXEMPTION_CHECK = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 13 code is on the "
    "Section 301 general exemption list (note 52(b), 9903.05.86), the description lists in note 52(c)–(e), the EU or UK "
    "exception lists, the Brazil exemption list (note 50(a)(ii), 9903.05.03), the Section 122 exemption list (9903.03.03) or the "
    "2025 reciprocal agricultural exemption. Country exception lists in note 52(j) name 1301.20, 1302.19.21, 1302.31 and 1302.32 "
    "(Switzerland, Cambodia, El Salvador, Taiwan, Indonesia, Ecuador, Jordan) and products within 1301.90.91 and 1302.19.91. All 14 "
    "Chapter 13 subheadings are on China List 4A (note 20(s)), and none is on a China exclusion. Ten subheadings are on Canada's "
    "Section 338 lists (note 51(b)(2) and (b)(3)), unchanged by the September 2026 modifications."
)
IA_EXTRA_SOURCES = ["eo-14389", "procl-11012", "fr-2025-23316", "fr-2024-07859", "ustr-agoa-2026", "crs-agoa", "cbp-gsp"]

# ---------------------------------------------------------------- tariff engineering
TE_H1 = "HTS Chapter 13: Lac, Gums, Resins & Plant Extracts — Import Documents & Ways to Lower Duty"
TE_SEO = {
    "title": "Importing Gums, Pectin & Plant Extracts: FDA, DEA & EPA Rules and Legal Ways to Lower Duty (HTS Ch. 13) | KoalaGains",
    "shortDescription": (
        "The rules for each HTS Chapter 13 line — FDA prior notice, facility registration, FSVP and GRAS status for gum arabic, "
        "pectin, guar and carrageenan, DEA permits for opium and poppy straw, EPA notice for pyrethrum — and the legal ways to pay "
        "less: USMCA, FTAs, sourcing, rulings, drawback."
    ),
    "keywords": [
        "import gum arabic FDA requirements",
        "is gum arabic FDA approved",
        "pectin FDA GRAS",
        "DEA import permit poppy straw",
        "USMCA origin exemption for agar-agar",
        "FSVP botanical extracts",
        "carrageenan FDA food additive",
    ],
}
TE_INTRO = (
    "Most Chapter 13 goods are food ingredients, so **FDA decides whether a shipment clears**: prior notice, a registered foreign "
    "facility and a U.S. importer that verifies its supplier. Gum arabic, pectin, agar, guar and locust bean gum, karaya, "
    "tragacanth and licorice are affirmed as GRAS, and carrageenan is an approved food additive. **Opium and poppy straw extract "
    "are Schedule II narcotic raw materials**: only DEA-registered importers with a permit, from approved source countries. "
    "Ephedra extracts with ephedrine alkaloids cannot go into dietary supplements.\n\n"
    "The ways to pay less are in the schedule and the customs rules: claim **USMCA** on Mexican goods, claim an **FTA** where the "
    "base rate is the cost, buy from an origin with **no Section 301 duty or an exception** for the product, buy **hops extract "
    "concentrated**, get a **binding ruling** where two lines differ in rate, and claim **drawback** on exported goods. Each "
    "depends on a document, listed below with its regulation."
)
LEVERS = [
    {
        "id": "usmca",
        "title": "Claim USMCA on goods from Mexico (and Canada)",
        "saves": "The Section 301 duty — 10% of value for Mexico or Canada — plus the base rate. For Canada the 50% Section 338 duty stays.",
        "appliesTo": "All 24 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in any format. Chapter 13 rules: extracts, "
        "pectin, agar, guar and locust bean gum must be made from materials of another chapter (e.g. plants, seeds, seaweed), not "
        "from imported extracts; gum arabic may be processed from raw gum of any origin; carrageenan may contain up to 50% "
        "non-originating carrageenan by weight.",
        "caveat": "On 20 lines Canadian goods pay the 50% Section 338 duty with or without USMCA (U.S. note 51(a)). The USMCA was "
        "not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11, Chapter 13 rules", "url": GN_URL},
            {"label": "HTSUS 9903.05.93 / 9903.05.94 and U.S. note 51", "url": CH99_URL},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA or AGOA rate where the base rate is the cost",
        "saves": "The base rate: 3.8% (licorice extract), 3.2% (carrageenan and other thickeners), 1.3% (turpentine gum), 1% "
        "(ginseng, ephedra and other therapeutic extracts) or 89¢/kg (hops extract)",
        "appliesTo": "The 8 dutiable lines, for goods of Australia, Bahrain, Chile, Colombia, Israel, Jordan, Korea, Morocco, Oman, "
        "Panama, Peru, Singapore, CAFTA-DR, CBERA (E) and AGOA countries (through December 31, 2026)",
        "document": "Proof of origin under the agreement and the SPI on the entry line (AU, CL, KR, MA, …, D for AGOA).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)); for Korea the 12.5% total applies anyway. "
        "GSP (A, A+) has been expired since December 31, 2020, so a GSP claim pays the general rate.",
        "citations": [
            {"label": "HTSUS General Note 3(c)", "url": GN_URL},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99_URL},
            {"label": "CBP: GSP status", "url": "https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences"},
        ],
    },
    {
        "id": "origin",
        "title": "Buy from an origin with no Section 301 duty, or with an exception for the product",
        "saves": "The 10% or 12.5% Section 301 duty (20% for China, 37.5% for Brazil)",
        "appliesTo": "All lines. Origins outside the 60 economies (e.g. Chad and Sudan for gum arabic) pay only the base rate; "
        "country exception lists exempt gum arabic, poppy straw extract, agar, guar and locust bean gum, boswellia and aloe "
        "extracts for named countries (Cambodia, Indonesia, Jordan, Switzerland, Taiwan and others)",
        "document": "A commercial invoice and certificate showing the country where the goods were produced; for a named product "
        "inside a subheading (boswellia, aloe extract), documents that identify it.",
        "caveat": "Origin is where the goods were produced or last substantially transformed, not where they were shipped from. "
        "Mixing or repacking in a third country does not change it.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(j)", "url": CH99_URL},
            {"label": "19 CFR part 134 (country of origin marking)", "url": "https://www.ecfr.gov/current/title-19/part-134"},
        ],
    },
    {
        "id": "hops-concentrate",
        "title": "Buy hops extract in concentrated form",
        "saves": "Duty per unit of bittering value: 1302.13 is 89¢ per kilogram whatever the alpha-acid content, so a more "
        "concentrated extract carries less duty per brew",
        "appliesTo": "Hops extract (1302.13.00.00), from countries that pay the base rate",
        "document": "Commercial invoice stating net weight; a certificate of analysis for the extract's specification.",
        "caveat": "For EU goods the 10% total replaces the 89¢/kg whenever the extract is worth more than $8.90/kg, so "
        "concentration does not lower the duty on EU extract. Hop cones and pellets are heading 1210, not this line.",
        "citations": [
            {"label": "HTSUS Chapter 13 (1302.13.00)", "url": CH13_URL},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(k)", "url": CH99_URL},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where neighbouring lines differ: 1% (therapeutic extracts, 1302.19.41) vs Free (other extracts, "
        "1302.19.91); 3.2% (carrageenan, 1302.39) vs Free (agar, guar, pectin); chapter 13 vs heading 1704, 2106, 2938 or chapter 30",
        "appliesTo": "Plant extracts, thickeners and gums whose classification decides the rate",
        "document": "A ruling request to CBP describing the product, its composition, extraction process and intended use.",
        "caveat": "Rulings apply to the transaction described; a different extract may need its own.",
        "citations": [{"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"}],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the product, or what it is made into, is exported",
        "saves": "Up to 99% of the duties paid on imported gums, pectin or extracts used in goods that are exported",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Drawback needs set-up (a manufacturing ruling for manufacturing claims) and refunds only duties actually paid.",
        "citations": [{"label": "19 CFR part 190", "url": "https://www.ecfr.gov/current/title-19/part-190"}],
    },
]
RULES = [
    {
        "id": "fda-prior-notice",
        "agency": "FDA",
        "title": "Prior notice of every food or food-ingredient shipment, confirmed before arrival (at least 2 hours by road, 4 by rail or air, 8 by water)",
        "citations": [
            {"label": "21 CFR 1.279", "url": ecfr(21, "1.279")},
            {"label": "21 CFR part 1, subpart I", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-I"},
        ],
    },
    {
        "id": "fda-registration",
        "agency": "FDA",
        "title": "The foreign plant that makes or packs the gum, pectin or extract must be registered with FDA as a food facility",
        "citations": [{"label": "21 CFR part 1, subpart H", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-H"}],
    },
    {
        "id": "fda-fsvp",
        "agency": "FDA",
        "title": "Foreign Supplier Verification Program: the U.S. importer must assess hazards and verify each foreign supplier",
        "citations": [{"label": "21 CFR part 1, subpart L", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-L"}],
    },
    {
        "id": "fda-ingredient",
        "agency": "FDA",
        "title": "Ingredient status: gum arabic, karaya, tragacanth, pectins, agar, guar, locust bean gum and licorice are affirmed as GRAS within set conditions; carrageenan is a food additive with its own conditions. FDA proposed on August 11, 2026 to require GRAS notices for substances not listed (comments to December 9, 2026)",
        "citations": [
            {"label": "21 CFR 184.1330 (acacia, gum arabic)", "url": ecfr(21, "184.1330")},
            {"label": "21 CFR 184.1349 (karaya)", "url": ecfr(21, "184.1349")},
            {"label": "21 CFR 184.1351 (tragacanth)", "url": ecfr(21, "184.1351")},
            {"label": "21 CFR 184.1588 (pectins)", "url": ecfr(21, "184.1588")},
            {"label": "21 CFR 184.1115 (agar-agar)", "url": ecfr(21, "184.1115")},
            {"label": "21 CFR 184.1339 (guar gum)", "url": ecfr(21, "184.1339")},
            {"label": "21 CFR 184.1343 (locust bean gum)", "url": ecfr(21, "184.1343")},
            {"label": "21 CFR 184.1408 (licorice)", "url": ecfr(21, "184.1408")},
            {"label": "21 CFR 172.620 (carrageenan)", "url": ecfr(21, "172.620")},
            {"label": "91 FR 51834 (GRAS proposed rule)", "url": NEW_SOURCES["fr-2026-16296"]["url"]},
        ],
    },
    {
        "id": "fda-labeling",
        "agency": "FDA",
        "title": "Food labeling for retail packs: name, ingredients, net quantity and nutrition facts",
        "citations": [{"label": "21 CFR part 101", "url": "https://www.ecfr.gov/current/title-21/part-101"}],
    },
    {
        "id": "dea-narcotic",
        "agency": "DEA",
        "title": "Opium and poppy straw are Schedule II: import only by a DEA-registered importer with an import permit, and only from Turkey, India, Spain, France, Poland, Hungary or Australia (at least 80% from Turkey and India)",
        "citations": [
            {"label": "21 CFR 1308.12(b)", "url": ecfr(21, "1308.12")},
            {"label": "21 CFR 1301.11", "url": ecfr(21, "1301.11")},
            {"label": "21 CFR 1312.11", "url": ecfr(21, "1312.11")},
            {"label": "21 CFR 1312.13(f)–(g)", "url": ecfr(21, "1312.13")},
        ],
    },
    {
        "id": "ephedra",
        "agency": "FDA / DEA",
        "title": "Ephedra: dietary supplements containing ephedrine alkaloids are adulterated; ephedrine is a DEA List I chemical, and imports of listed chemicals need an import declaration 15 days ahead",
        "citations": [
            {"label": "21 CFR 119.1", "url": ecfr(21, "119.1")},
            {"label": "21 CFR 1310.02", "url": ecfr(21, "1310.02")},
            {"label": "21 CFR 1313.12", "url": ecfr(21, "1313.12")},
        ],
    },
    {
        "id": "epa-pesticide",
        "agency": "EPA / CBP",
        "title": "Pyrethrum and other extracts imported as pesticides: a Notice of Arrival must be filed and reviewed by EPA before entry",
        "citations": [{"label": "19 CFR 12.112", "url": ecfr(19, "12.112")}],
    },
    {
        "id": "tsca",
        "agency": "EPA / CBP",
        "title": "Gums, resins and oils entered for industrial use (shellac for coatings, turpentine gum, cashew nut shell liquid): TSCA import certification",
        "citations": [
            {"label": "19 CFR 12.118", "url": ecfr(19, "12.118")},
            {"label": "19 CFR 12.121", "url": ecfr(19, "12.121")},
        ],
    },
    {
        "id": "nop-organic",
        "agency": "USDA AMS",
        "title": "Certified organic extracts: each shipment needs NOP Import Certificate data in ACE",
        "citations": [{"label": "7 CFR 205.273", "url": ecfr(7, "205.273")}],
    },
    {
        "id": "aphis-packaging",
        "agency": "USDA APHIS",
        "title": "Wood pallets and crates must be ISPM 15 treated and marked",
        "citations": [{"label": "7 CFR 319.40-3", "url": ecfr(7, "319.40-3")}],
    },
]
FOOD = ["fda-prior-notice", "fda-registration", "fda-fsvp", "fda-labeling"]
GROUP_RULES = {
    "1301": FOOD + ["fda-ingredient", "tsca", "aphis-packaging"],
    "1302": FOOD + ["fda-ingredient", "dea-narcotic", "ephedra", "epa-pesticide", "tsca", "nop-organic", "aphis-packaging"],
}
GROUP_NOTES = {
    "1301": "Gum arabic, karaya and tragacanth are GRAS food ingredients and follow the FDA food rules; shellac, balsams and "
    "turpentine gum entered for coatings or other industrial use need TSCA certification instead.",
    "1302": "Opium and poppy straw extract need DEA registration and an import permit; ephedra cannot go into dietary supplements; "
    "pyrethrum extract sold as a pesticide needs EPA notice; pectin, agar, guar, locust bean gum, carrageenan and food extracts "
    "follow the FDA food rules.",
}
GRAS_LINES = ("1301.20", "1301.90.91.30", "1301.90.91.40", "1302.12", "1302.20", "1302.31", "1302.32", "1302.39.00.10")
NOT_FOOD = ("1301.90.40", "1302.11", "1302.14", "1302.19.21", "1302.19.91.20")
TSCA_LINES = ("1301.90.40", "1301.90.91", "1302.19.91.20")
DUTIABLE_FTA = ("1301.90.40", "1302.12", "1302.13", "1302.14", "1302.19.41", "1302.39")


def rules_for(hts):
    ids = []
    if not hts.startswith(NOT_FOOD):
        ids += FOOD
    if hts.startswith(GRAS_LINES):
        ids.append("fda-ingredient")
    if hts.startswith(("1302.11", "1302.19.21")):
        ids.append("dea-narcotic")
    if hts.startswith("1302.14"):
        ids.append("ephedra")
    if hts == "1302.19.91.55":
        ids.append("epa-pesticide")
    if hts.startswith(TSCA_LINES):
        ids.append("tsca")
    if hts == "1302.19.91.45":
        ids.append("nop-organic")
    ids.append("aphis-packaging")
    return ids


def levers_for(hts, general):
    ids = ["usmca"]
    if hts.startswith(DUTIABLE_FTA):
        ids.append("fta")
    ids.append("origin")
    if hts.startswith("1302.13"):
        ids.append("hops-concentrate")
    if hts.startswith(("1302.19", "1302.39", "1301.90", "1302.12")):
        ids.append("ruling")
    ids.append("drawback")
    return ids


TE_DISCLAIMER = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. FDA, DEA and EPA requirements change; "
    "check them before each shipment."
)

# ---------------------------------------------------------------- final conclusion
FC_H1 = "HTS Chapter 13: Lac, Gums, Resins & Plant Extracts — Tariff FAQ"
FC_SEO = {
    "title": "Gum Arabic, Guar Gum, Pectin & Plant Extract Tariffs FAQ: HS Codes & 2026 Duties (HTS Ch. 13) | KoalaGains",
    "shortDescription": (
        "Answers to what people search about Chapter 13 imports: HS codes for gum arabic, guar gum, pectin, carrageenan, agar, "
        "shellac, licorice, hops and herbal extracts, and the 2026 tariff from India, China, France, Canada and Sudan."
    ),
    "keywords": [
        "hs code gum arabic",
        "hs code for guar gum",
        "pectin hs code",
        "hs code carrageenan",
        "agar agar hs code",
        "hs code locust bean gum",
        "hs code shellac",
        "1302.19 hs code",
        "hs code herbal extract",
        "xanthan gum hs code",
    ],
}
FC_INTRO = (
    "Straight answers to the most common questions about importing gums, resins, pectin, thickeners and plant extracts into the "
    "U.S. — HS codes, tariffs by country and entry requirements. Each answer links to the page with the full detail."
)
KEY_TAKEAWAYS = [
    "Chapter 13 base rates are low — 16 of 24 lines are Free and the rest are 1%–3.8% or 89¢/kg — so the extra duty by country sets the cost.",
    "The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the Section 301 tariff adds 10% for India, 10% in total for the EU, 12.5% for the Philippines and Chile, and 20% for China with List 4A.",
    "Canadian goods on 20 of 24 lines pay a 50% Section 338 duty even with a USMCA claim; USMCA-qualifying goods from Mexico pay nothing extra.",
    "Gum arabic from Chad or Sudan pays no extra duty; exception lists exempt gum arabic, agar, guar and aloe extracts for a few other countries.",
    "Opium and poppy straw extract need DEA permits; gums, pectin and food extracts need FDA prior notice, a registered facility and FSVP.",
]
QUESTION_SOURCE = "Google search suggestions, collected October 12, 2026"
FAQS = [
    {
        "id": "gum-arabic-hs",
        "question": "What is the HS code for gum arabic (acacia gum)?",
        "searchedAs": ["hs code gum arabic", "hs code gum acacia", "imported gum arabic hsn code"],
        "answer": "1301.20.00.00, Free at the general rate. FDA affirms acacia "
        "(gum arabic) as GRAS within the limits in 21 CFR 184.1330. Chewing gum is heading 1704, not here. The U.S. imported $94M "
        "of gum arabic in 2025, more than half shipped from France.",
        "link": "",
    },
    {
        "id": "gum-arabic-sudan",
        "question": "Is there a U.S. tariff on gum arabic from Sudan or Chad?",
        "searchedAs": ["gum arabic from sudan", "gum arabic sudan", "gum acacia sudan", "gum arabic chad", "gum arabic suppliers in chad"],
        "answer": "No. Gum arabic is Free, and neither Sudan nor Chad is one of the 60 economies in the 2026 Section 301 action, so "
        "it enters with no duty. Chad shipped $16M and Sudan $12M in 2025. Gum arabic that is a product of France pays the EU's 10%, "
        "from China 20%, from Canada 50% under Section 338; Cambodia, El Salvador and Jordan have an exception for it.",
        "link": "industry-areas",
    },
    {
        "id": "guar-gum",
        "question": "What is the HS code and U.S. tariff for guar gum?",
        "searchedAs": ["hs code for guar gum", "hs code for guar gum powder", "guar gum tariff code", "hsn code of guar gum", "guar gum importers in usa"],
        "answer": "Guar gum is 1302.32.00.20 (locust bean gum is 1302.32.00.40), Free at the general rate. India supplied $134M of "
        "the $182M imported in 2025 and pays the 10% Section 301 duty (9903.05.44), so Indian guar gum pays 10% in total — down "
        "from 50% under the IEEPA duties in late 2025. Guar from Indonesia, Cambodia, El Salvador, Jordan or Switzerland is exempt; "
        "from China it pays 20%.",
        "link": "industry-areas",
    },
    {
        "id": "pectin",
        "question": "What is the HS code for pectin?",
        "searchedAs": ["pectin hs code", "hs code for pectin powder", "citrus pectin hs code", "apple pectin hs code", "pectin fda"],
        "answer": "1302.20.00.00 (pectic substances, pectinates and pectates), Free at the general rate, whether citrus or apple "
        "pectin. FDA affirms pectins as GRAS (21 CFR 184.1588). Imports were $189M in 2025, led by Germany and Mexico. EU pectin pays "
        "10%, USMCA-qualifying Mexican pectin $0, Brazilian 37.5% and Canadian 50% (Section 338). Jams and jellies are heading 2007.",
        "link": "",
    },
    {
        "id": "carrageenan",
        "question": "What is the HS code and import duty for carrageenan?",
        "searchedAs": ["hs code carrageenan", "hs code refined carrageenan", "carrageenan tariff code", "carrageenan philippines"],
        "answer": "Carrageenan, refined or semi-refined, is 1302.39.00.10 at 3.2%. From the Philippines, the largest supplier ($34.5M "
        "in 2025), it pays 3.2% + 12.5% = 15.7%; from Chile 12.5% with an FTA claim; from the EU 10%; from China 23.2%. FDA lists "
        "carrageenan as a food additive (21 CFR 172.620).",
        "link": "industry-areas",
    },
    {
        "id": "agar",
        "question": "What is the HS code for agar-agar?",
        "searchedAs": ["hs code agar agar", "agar agar powder hs code", "hs code agar powder", "agar agar fda"],
        "answer": "1302.31.00.00, Free at the general rate. Spain ($10.4M) and Morocco ($7.1M) were the largest suppliers of the $35M "
        "imported in 2025: Spanish agar pays 10%, Moroccan 12.5%. Agar from Switzerland, Cambodia, Taiwan, Indonesia, Ecuador or "
        "Jordan is exempt from the Section 301 duty. FDA affirms agar-agar as GRAS (21 CFR 184.1115).",
        "link": "industry-areas",
    },
    {
        "id": "locust-bean",
        "question": "What is the HS code for locust bean gum?",
        "searchedAs": ["hs code locust bean gum"],
        "answer": "1302.32.00.40 (mucilages and thickeners from locust beans), Free at the general rate; guar gum shares the "
        "subheading as 1302.32.00.20. Spain and Italy shipped $19M of subheading 1302.32 in 2025; EU goods pay 10% in total. FDA affirms locust "
        "(carob) bean gum as GRAS (21 CFR 184.1343).",
        "link": "",
    },
    {
        "id": "shellac-1301",
        "question": "What is the HS code for shellac, karaya and tragacanth (HS 1301)?",
        "searchedAs": ["hs code shellac", "hsn code for shellac", "gum karaya hs code", "tragacanth hs code", "hs code 1301", "hs code 1301.90"],
        "answer": "Heading 1301 covers lac and natural gums and resins. Under 1301.90.91 (Free): balsams .05, bleached shellac .10, "
        "seed lac .20, tragacanth .30, karaya .40 and other gums and resins .90. Turpentine gum is 1301.90.40 at 1.3%, gum arabic "
        "1301.20. India supplied half of the $51M of 1301.90 imports in 2025 and pays 10%. Canadian 1301.90.91 goods pay 50% under "
        "Section 338.",
        "link": "",
    },
    {
        "id": "frankincense-mastic",
        "question": "What is the HS code for frankincense resin and mastic gum?",
        "searchedAs": ["hs code frankincense", "hs code for frankincense resin", "hs code for mastic gum"],
        "answer": "As natural gum-resins they fall in 1301.90.91 (other natural gums and resins), Free at the general rate. Mastic from "
        "Greece pays the EU's 10%. Boswellia (frankincense) is on the Section 301 exception lists of Malaysia, Cambodia, Guatemala "
        "and Taiwan. Frankincense oil, an essential oil, is chapter 33.",
        "link": "tariff-updates",
    },
    {
        "id": "plant-extract",
        "question": "What is the HS code for plant, herbal or botanical extracts (1302.19)?",
        "searchedAs": ["1302.19 hs code", "hts code 1302.19", "1302.19 tariff code", "hs code plant extract", "hs code herbal extract", "hs code for botanical extracts", "hs code ashwagandha extract"],
        "answer": "Most fall in 1302.19, the largest Chapter 13 line ($1.04B in 2025). Extracts with therapeutic or prophylactic "
        "properties, such as ginseng, are 1302.19.41 at 1%; poppy straw extract is 1302.19.21 (Free); all other extracts are "
        "1302.19.91, Free — cashew nut shell liquid .20, certified organic .45, other .55. Which line an extract such as "
        "ashwagandha takes depends on its properties, so a CBP binding ruling settles it. Finished supplements are usually "
        "classified elsewhere. Indian extracts pay 10%, Chinese 20%.",
        "link": "tariff-engineering",
    },
    {
        "id": "licorice",
        "question": "What is the HS code for licorice extract?",
        "searchedAs": ["hs code licorice extract", "licorice hs code", "hs code for licorice root"],
        "answer": "1302.12.00.00 at 3.8%. Licorice root itself is chapter 12, licorice extract with more than 10% sucrose or put up "
        "as confectionery is heading 1704, and glycyrrhizin is heading 2938 (chapter note 1). France supplied $10.4M of the $15.5M "
        "imported in 2025 and pays 10% in total; licorice extract from China pays 23.8%.",
        "link": "",
    },
    {
        "id": "hops-extract",
        "question": "What is the HS code and tariff for hops extract?",
        "searchedAs": ["hops extract hs code", "hs code 1302.13"],
        "answer": "1302.13.00.00 at 89¢/kg, Free under the FTAs. Hop cones and pellets are heading 1210. German extract (the largest "
        "source) pays 10% of value in place of the 89¢/kg when it is worth more than $8.90/kg; British extract pays 89¢/kg plus "
        "10%; Canadian extract pays 50% under Section 338 even with USMCA.",
        "link": "industry-areas",
    },
    {
        "id": "ginseng-aloe",
        "question": "What are the HS codes for ginseng extract and aloe vera extract?",
        "searchedAs": ["hs code ginseng extract", "ginseng hs code", "hs code aloe vera extract", "aloe vera extract powder hs code"],
        "answer": "Ginseng extract is 1302.19.41.20 at 1%; ginseng root is chapter 12. Aloe extract is in heading 1302 (chapter note "
        "1), under 1302.19.91 (Free). Korean ginseng extract pays 12.5% in total, Chinese 21%. Aloe extracts are on the Section 301 "
        "exception lists of eight countries, including Indonesia, Taiwan, Guatemala and El Salvador.",
        "link": "tariff-updates",
    },
    {
        "id": "xanthan",
        "question": "Is xanthan gum classified in Chapter 13?",
        "searchedAs": ["xanthan gum hs code", "xanthan gum food grade hs code", "xanthan gum powder hs code"],
        "answer": "No. Xanthan gum is made by fermentation, not taken from a plant, and is classified in 3913.90.20 (chapter 39). "
        "Xanthan gum from China is also under an antidumping order, continued in April 2024. Chapter 13 thickeners are the plant "
        "ones: guar, locust bean gum, agar, carrageenan and pectin.",
        "link": "industry-areas",
    },
    {
        "id": "china-india",
        "question": "What tariffs apply to gums and plant extracts from China and India in 2026?",
        "searchedAs": ["tariffs on china products", "tariffs on china imports to us", "tariffs on india imports to us", "tariffs on indian goods in usa"],
        "answer": "Since July 24, 2026 Indian goods pay a 10% Section 301 duty on top of the base rate, and Chinese goods pay 12.5% "
        "plus the 7.5% List 4A duty, 20% in all. On Chapter 13 that means 10% (India) or 20% (China) on Free lines such as guar gum "
        "and most extracts. The 2025 IEEPA duties ended on February 24, 2026. India and China supplied 47% of 2025 imports.",
        "link": "tariff-updates",
    },
]
