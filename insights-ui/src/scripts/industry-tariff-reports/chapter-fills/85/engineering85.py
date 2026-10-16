"""Import documents and duty levers for Chapter 85 (tariffEngineering)."""
from sets85 import cov

E = "https://www.ecfr.gov/current"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH85 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2085"
FRD = "https://www.federalregister.gov/documents"


def c(label, url):
    return {"label": label, "url": url}


def ecfr(t, s):
    return c(f"{t} CFR {s}", f"{E}/title-{t}/section-{s}")


CH99_C = lambda n: c(f"HTSUS Ch. 99, subch. III, U.S. note {n}", CH99)  # noqa: E731
P11021 = c("Proclamation 11021 (91 FR 18201)", f"{FRD}/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states")
P11032 = c("Proclamation 11032 (91 FR 34085)", f"{FRD}/2026/06/04/2026-11314/further-adjusting-the-tariff-regimes-for-imports-of-aluminum-steel-and-copper-into-the-united-states")
P10908 = c("Proclamation 10908 (90 FR 14705)", f"{FRD}/2025/04/03/2025-05930/adjusting-imports-of-automobiles-and-automobile-parts-into-the-united-states")
P10984 = c("Proclamation 10984 (90 FR 48451)", f"{FRD}/2025/10/22/2025-19639/adjusting-imports-of-medium--and-heavy-duty-vehicles-medium--and-heavy-duty-vehicle-parts-and-buses")
P11052 = c("Proclamation 11052 (91 FR 51975)", f"{FRD}/2026/08/11/2026-16400/adjusting-imports-of-polysilicon-and-its-derivatives-into-the-united-states")
CSMS_AUTO = c("CBP CSMS # 64916652", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3de8cac")
CSMS_MHDV = c("CBP CSMS # 66665333", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3f93b75")
CSMS_MET = c("CBP CSMS # 68253075", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4117593")
USTR_2026 = c("USTR notice of Section 301 actions on 60 economies (91 FR 47318)", f"{FRD}/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies")
USTR_EXCL = c("USTR exclusion extensions (90 FR 55232)", f"{FRD}/2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology")

RULES = [
    {"id": "marking", "agency": "CBP", "title": "Country-of-origin marking on the article or its container, in English, legibly and permanently", "citations": [ecfr(19, "134.11"), ecfr(19, "134.1")]},
    {"id": "s301", "agency": "CBP / USTR", "title": "Section 301: report the China heading (9903.88.01–.15, 9903.91.01–.06) and the 2026 heading for the country (9903.05.20–.84), or the exemption heading: 9903.05.86 (note 52(b) electronics), .88 (civil aircraft), .90 (Section 232 goods), .92 (informational materials), .93/.94 (USMCA); China exclusions 9903.88.69 only for the products described",
     "citations": [CH99_C("20, 31, 52"), USTR_2026, USTR_EXCL]},
    {"id": "s232", "agency": "CBP", "title": "Section 232: report the heading with the Chapter 85 line: auto parts 9903.94.05 (partner headings .32/.43/.53/.63/.67) or 9903.94.06 (USMCA or not a vehicle part); truck parts 9903.74.08, .10 or .11; metals 9903.82.09/.10 or the relief headings 9903.82.01/.03/.05/.06/.13/.23/.25; drone docking stations 9903.08.20–.26. Goods admitted to a foreign-trade zone must take privileged foreign status; no drawback of the auto-parts duty",
     "citations": [CH99_C("16, 33, 38, 43"), CSMS_AUTO, CSMS_MHDV, CSMS_MET, ecfr(19, "146.41")]},
    {"id": "fcc", "agency": "FCC", "title": "Radio-frequency devices (phones, routers, wireless audio, cameras, TVs, remote controls, microwave ovens) need a valid FCC equipment authorization, or another import condition, before import for sale; the consignee must be able to document the condition",
     "citations": [ecfr(47, "2.1204"), ecfr(47, "2.803")]},
    {"id": "fcc-covered", "agency": "FCC", "title": "No authorization for equipment of Covered List entities and, from October 13, 2026, for devices containing their logic-bearing components; online marketplaces must show the FCC ID",
     "citations": [ecfr(47, "2.903"), c("FCC Third Report and Order (91 FR 57798)", f"{FRD}/2026/09/11/2026-18535/protecting-against-national-security-threats-to-the-communications-supply-chain-through-the")]},
    {"id": "doe", "agency": "DOE", "title": "Energy conservation: regulated electric motors, distribution transformers, external power supplies, battery chargers, lamps and water heaters must meet DOE standards and be certified; non-compliant imports are refused admission",
     "citations": [ecfr(10, "429.5"), ecfr(10, "429.12"), ecfr(10, "430.32"), ecfr(10, "431.25"), ecfr(10, "431.196")]},
    {"id": "fda-rad", "agency": "FDA", "title": "Radiation-emitting electronic products (microwave ovens, sunlamps and UV lamps, cathode-ray tubes) must meet FDA performance standards; foreign makers designate a U.S. agent",
     "citations": [ecfr(21, "1002.1"), ecfr(21, "1005.25"), ecfr(21, "1030.10")]},
    {"id": "lithium", "agency": "DOT (PHMSA)", "title": "Lithium cells and batteries, and equipment containing them, must pass UN tests and be packed and marked as hazardous materials for transport",
     "citations": [ecfr(49, "173.185")]},
    {"id": "uflpa", "agency": "CBP / DHS", "title": "UFLPA: goods made in Xinjiang or by UFLPA Entity List companies are presumed made with forced labor and detained unless the importer proves otherwise; polysilicon is a high-priority enforcement sector, so solar importers should be able to trace the polysilicon in their cells and modules",
     "citations": [c("CBP: Uyghur Forced Labor Prevention Act", "https://www.cbp.gov/trade/forced-labor/UFLPA"), c("CBP: UFLPA Operational Guidance for Importers", "https://www.cbp.gov/document/guidance/uflpa-operational-guidance-importers"),
                   c("DHS: UFLPA Strategy, 2025 update", "https://www.dhs.gov/sites/default/files/2025-08/25_0819_plcy_uflpa-strategy-2025-update-508.pdf"), c("UFLPA Entity List update (91 FR 48913)", f"{FRD}/2026/08/03/2026-15628/notice-regarding-the-uyghur-forced-labor-prevention-act-entity-list")]},
    {"id": "adcvd", "agency": "Commerce (ITA) / CBP", "title": "AD/CVD cash deposits where an order covers the goods: solar cells and modules (China, Taiwan, Cambodia, Malaysia, Thailand, Vietnam; India, Indonesia and Laos pending), aluminum wire and cable (China; also when finished in Vietnam or Korea), large power transformers (Korea), small-diameter graphite electrodes (China). The written scope, not the HTS number, decides",
     "citations": [c("Solar orders on Cambodia, Malaysia, Thailand, Vietnam (90 FR 26786)", f"{FRD}/2025/06/24/2025-11588/crystalline-silicon-photovoltaic-cells-whether-or-not-assembled-into-modules-from-the-socialist"),
                   c("Solar orders on China (77 FR 73018)", f"{FRD}/2012/12/07/2012-29668/crystalline-silicon-photovoltaic-cells-whether-or-not-assembled-into-modules-from-the-peoples"),
                   c("Aluminum wire and cable orders (84 FR 70496)", f"{FRD}/2019/12/23/2019-27641/aluminum-wire-and-cable-from-the-peoples-republic-of-china-antidumping-duty-and-countervailing-duty"),
                   c("Large power transformers order continued (89 FR 72373)", f"{FRD}/2024/09/05/2024-19899/large-power-transformers-from-the-republic-of-korea-continuation-of-antidumping-duty-order")]},
    {"id": "usmca-cert", "agency": "CBP", "title": "USMCA claims for goods of Canada and Mexico need a certification of origin, produced on request",
     "citations": [ecfr(19, "182.12")]},
    {"id": "civil-aircraft", "agency": "CBP", "title": "Civil aircraft articles: certification that the goods meet general note 6 (relief from the 2026 Section 301, Brazil and Canada duties and, for some partners, the metals duty)",
     "citations": [ecfr(19, "10.183"), CH99_C("52(d)")]},
    {"id": "polysilicon", "agency": "CBP / Commerce (BIS)", "title": "Solar cells and modules entered from December 4, 2026: documentation that the first arm's-length U.S. sale is at or above the minimum import price ($0.22/W cells, $0.38/W modules), or the specific duty applies; until then, BIS anti-stockpiling limits",
     "citations": [P11052, c("BIS temporary final rule (91 FR 60505)", f"{FRD}/2026/09/24/2026-19537/measures-to-restrict-stockpiling-of-polysilicon-and-polysilicon-derivatives-under-proclamation-11052")]},
]

LEVERS = [
    {
        "id": "usmca", "title": "Qualify the goods for USMCA (Mexico, Canada)",
        "saves": "The base rate, the 10% 2026 Section 301 duty and the Section 232 auto-parts and truck-parts duties (9903.94.06, 9903.74.10)",
        "appliesTo": "Goods of Mexico and Canada that meet the USMCA rules of origin",
        "document": "A USMCA certification of origin from the importer, exporter or producer, with records supporting the tariff-shift or regional value content rule.",
        "caveat": "USMCA does not lift the Section 232 metals duty (insulated cable, transformers) or Canada's 50% Section 338 duty on smartphones, network gear, TVs and the other note 51(b)(3) lines.",
        "citations": [ecfr(19, "182.12"), CH99_C("33(h), 38, 52(g)–(h)")],
    },
    {
        "id": "not-auto-part", "title": "Document that listed goods are not vehicle parts",
        "saves": "The 25% Section 232 auto-parts duty (or the 15% partner rate): note 33(h)(ii) sends listed goods that are not parts of cars or light trucks to 9903.94.06 at 0%",
        "appliesTo": "The 85 lines on the note 33(g) list: motors (8501.32–.52), lead-acid and lithium-ion batteries (8507.10, 8507.60), ignition and lighting, car audio, boards (8537.10/.20), wiring sets (8544.30)",
        "document": "Evidence of the goods' design and use: specifications, the buyer and the application (for example energy-storage or consumer-device batteries). CBP may ask for it.",
        "caveat": "CBP's CSMS # 64916652 repeats the HTS rule but CBP has not published how it decides whether a multi-use article (a lithium-ion cell, a motor) is a vehicle part, so whether end use or design governs is unconfirmed. Without the 232 duty, the 2026 Section 301 duty applies instead.",
        "citations": [CH99_C("33(g)–(h)"), CSMS_AUTO, P10908],
    },
    {
        "id": "parts-election", "title": "Elect the Section 232 auto-part treatment where it is cheaper",
        "saves": "For EU, Japanese, Korean and Taiwanese parts on the metals list, 15% in total instead of the base rate plus 25%",
        "appliesTo": "Parts not on the note 33(g) or 38(i) lists, used for U.S. vehicle production or repair",
        "document": "The importer of record's certification that the parts are for automobile (or truck) production or repair in the United States (headings 9903.94.07, 9903.94.45/.55/.65/.69, 9903.74.09).",
        "caveat": "Optional and binding for the entry: elsewhere it usually raises the duty to 25%. Not available for Chapter 72, 73 or 76 goods.",
        "citations": [CH99_C("33(p), 33(r), 38(j)"), P10984, CSMS_MHDV],
    },
    {
        "id": "metal-content", "title": "Use the Section 232 metals relief headings",
        "saves": "All or part of the 25% (or 15% floor) metals duty",
        "appliesTo": "The 83 Chapter 85 lines on the metals lists (transformers, large motors, generating sets, insulated cable, appliance parts)",
        "document": "Bills of materials and weights: no aluminum, steel or copper (9903.82.01, none); metals under 15% of the weight (9903.82.03, none); at least 85% U.S.-melted or smelted and cast metal (9903.82.06, 10%); UK goods with 95% UK metal (9903.82.05, 15%); parts for agricultural or industrial equipment (9903.82.25, 15% in total until 2027); motorcycle parts for U.S. manufacturing (9903.82.13, none).",
        "caveat": "Each is a claim the importer must support with mill and supplier records; Russia, Belarus, Cuba and North Korea cannot use most of them.",
        "citations": [CH99_C("16"), P11021, P11032, c("Commerce technical corrections (91 FR 23056)", f"{FRD}/2026/04/29/2026-08297/notice-of-technical-corrections-to-the-harmonized-tariff-schedule-of-the-united-states-for-duties")],
    },
    {
        "id": "classify", "title": "Classify precisely: the electronics exemptions are by subheading",
        "saves": "The 2026 Section 301 duty (10%–12.5%) and the Brazil duty on goods that belong in an exempt subheading",
        "appliesTo": "Borderline goods: display modules (8524, exempt) versus parts (8529); switching and routing apparatus (8517.62, exempt) versus other network apparatus (8517.69); ICs and multi-component ICs (8542) versus modules of 8543 or 8473",
        "document": "Technical data supporting the classification; for certainty, a binding CBP ruling.",
        "caveat": "Only the correct classification counts: chapter notes 7 and 12 set the precedence of 8524, 8541 and 8542. Misclassification risks penalties.",
        "citations": [c("HTSUS Chapter 85, notes 7 and 12", CH85), CH99_C("52(b)"), ecfr(19, "177.2")],
    },
    {
        "id": "exclusions", "title": "Claim a China Section 301 exclusion",
        "saves": "The China list duty (25% or 7.5%) on the excluded product",
        "appliesTo": "26 Chapter 85 lines with a product-specific exclusion (motors, power supplies, switches, PCBs, cables) until November 9, 2026",
        "document": "Report 9903.88.69 with the Chapter 85 line; the goods must match the exclusion's product description exactly.",
        "caveat": "Expires November 9, 2026 unless USTR extends it again; the 12.5% 2026 duty is not excluded.",
        "citations": [USTR_EXCL, CH99_C("20(vvv)")],
    },
    {
        "id": "info-materials", "title": "Recorded informational materials",
        "saves": "The 2026 Section 301 duty (9903.05.92) and the Brazil duty (9903.05.09)",
        "appliesTo": "Discs, tapes and other media of 8523.29, 8523.41, 8523.49 and 8523.80.10 carrying films, recordings or other informational content",
        "document": "Description of the recorded content (films, recordings, publications).",
        "caveat": "Does not lift the China list duties (List 4A on most media) or Canada's Section 338 duty.",
        "citations": [CH99_C("52"), USTR_2026],
    },
    {
        "id": "origin", "title": "Know the country of origin before you buy",
        "saves": "The China rates (up to 62.5%) when the goods are genuinely made elsewhere",
        "appliesTo": "All lines, especially chips, solar cells and modules, batteries and cable",
        "document": "Production records showing where the article was substantially transformed (for example where the chip was fabricated, the cell made or the cable drawn and insulated).",
        "caveat": "Simple assembly or packaging in a third country does not change origin, and Commerce has found solar modules and aluminum cable finished in Southeast Asia to circumvent the China AD/CVD orders.",
        "citations": [ecfr(19, "134.1"), c("Solar circumvention determination (88 FR 57419)", f"{FRD}/2023/08/23/2023-18161/antidumping-and-countervailing-duty-orders-on-crystalline-silicon-photovoltaic-cells-whether-or-not")],
    },
    {
        "id": "ch98", "title": "U.S. components assembled abroad (Chapter 98)",
        "saves": "Duty on the value of U.S.-made components",
        "appliesTo": "Electronics assembled abroad from U.S.-made fabricated components (for example U.S. chips or boards)",
        "document": "Foreign assembler's declaration and importer's endorsement showing the U.S. components and their value.",
        "caveat": "The 2026 Section 301 duty is charged on the value less the U.S. components; Section 232 goods entered under 9802.00.60 pay on the full value.",
        "provisions": [
            {"code": "9802.00.80", "rate": "Duty on the full value less the cost or value of U.S. components", "text": "Articles assembled abroad from fabricated components, the product of the United States"},
            {"code": "9801.00.10", "rate": "Free", "text": "Products of the United States returned without having been advanced in value or improved in condition abroad"},
        ],
        "citations": [ecfr(19, "10.14"), CH99_C("52(a)")],
    },
    {
        "id": "civil-aircraft", "title": "Civil aircraft parts",
        "saves": "The 2026 Section 301 and Brazil duties, Canada's Section 338 duty and, for the UK, Japan, the EU and Korea, the metals duty",
        "appliesTo": "The 240 Chapter 85 lines on the note 52(d) list (motors, transformers, batteries, lighting, radios, wiring) when used in civil aircraft",
        "document": "A general note 6 certification (19 CFR 10.183).",
        "caveat": "Does not lift China's Section 301 list duties or the Section 232 auto-parts duty.",
        "citations": [ecfr(19, "10.183"), CH99_C("51(d), 52(d)")],
    },
    {
        "id": "drawback", "title": "Recover duties on exported goods (drawback)",
        "saves": "Eligible duties paid on goods that are exported, or used to make exported goods",
        "appliesTo": "All lines",
        "document": "A drawback claim with import, export and (for manufacturing drawback) production records.",
        "caveat": "No drawback of the Section 232 auto-parts duty; metals drawback only for trade-agreement partners' Annex I-B and III derivatives; polysilicon-duty drawback only for partners' goods.",
        "citations": [ecfr(19, "191.3"), CSMS_AUTO, P11021, P11052],
    },
]

NOTES = {
    "8501": "Motors 8501.32–.52 are on the auto-parts list (25% when for cars, 15% total for EU/Japan/Korea/Taiwan); large motors and wind-turbine generators are Section 232 metals goods (25%). DOE efficiency rules apply to regulated motors; PV generators can fall within the solar AD/CVD scope.",
    "8502": "Spark-ignition and wind generating sets pay the 25% metals duty on the full value; diesel sets do not.",
    "8504": "Transformers up to 10,000 kVA pay 25% (metals); larger ones a 15% floor through 2027. Large power transformers from Korea carry an AD order. DOE standards cover distribution transformers, external power supplies and battery chargers. 8504.40.95.80 includes drone docking stations (100%).",
    "8505": "Chinese permanent magnets pay 25% since January 1, 2026; sintered NdFeB magnets (8505.11.00.70) are exempt from the 2026 Section 301 duty.",
    "8506": "Lithium primary cells are hazardous materials in transport.",
    "8507": "Lithium-ion and lead-acid batteries are on the auto-parts list (25% when for cars). Chinese lithium-ion batteries pay 25% under Section 301 plus 12.5% or the auto duty. Hazmat rules apply; solar modules imported with batteries can be in the solar AD/CVD scope.",
    "8511": "Ignition and starting equipment is on the auto-parts and truck-parts lists.",
    "8512": "Vehicle lighting, wipers and defrosters are on the auto-parts and truck-parts lists.",
    "8516": "Microwave ovens need FCC authorization and FDA radiation compliance; water heaters and cooking products follow DOE rules; ranges, ovens and some parts pay the 25% metals duty, space heaters a 15% floor.",
    "8517": "Smartphones and 8517.62 apparatus are exempt from the 2026 Section 301 duty; Canadian phones and network gear pay 50% (Section 338). FCC authorization required; Covered List equipment barred.",
    "8523": "SSDs (8523.51) are exempt from the 2026 duty; recorded informational media can use 9903.05.92.",
    "8524": "All display modules are exempt from the 2026 Section 301 duty; heading 8524 takes precedence over other headings.",
    "8525": "Cameras and transmitters need FCC authorization; Covered List video-surveillance equipment is barred. Canadian goods pay 50%.",
    "8528": "Computer monitors (8528.52) are exempt from the 2026 duty; TVs are not. Canadian monitors and TVs pay 50%.",
    "8537": "Boards of 8537.10/.20 are on the auto-parts list; 8537.10.91.70 includes drone docking stations (100%).",
    "8539": "Sealed-beam lamps are auto and truck parts; DOE lamp standards and FDA sunlamp rules apply; 11 lines pay 35% for Russia.",
    "8541": "Chips and semiconductors: 50% from China, exempt from the 2026 duty elsewhere. Solar cells and modules: 50% + 12.5% from China, 2026 duty elsewhere, AD/CVD on China, Taiwan and Southeast Asia, UFLPA polysilicon tracing, and from December 4, 2026 the Section 232 polysilicon duty and minimum prices.",
    "8542": "50% from China (note 31(f)); Free from everyone else. Not covered by the Section 232 semiconductor duty.",
    "8544": "Insulated copper and aluminum cable pays 25% (metals) on the full value, USMCA or not; Chinese aluminum wire and cable carries AD/CVD. Wiring sets (8544.30) are auto and truck parts.",
    "8545": "Small-diameter graphite electrodes from China are under an AD order; large-diameter electrodes from China and India are under investigation.",
}


def fill_engineering(d, S, N, ECFR_AS_OF):
    te = d["tariffEngineering"]
    te["h1"] = "HTS Chapter 85: Electrical Machinery & Electronics — Import Documents & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Electronics, Batteries & Solar: FCC, DOE, UFLPA, Section 232 Rules & Ways to Lower Duty (HTS Ch. 85) | KoalaGains",
        "shortDescription": "The rules for each HTS Chapter 85 line: FCC equipment authorization, DOE energy certification, FDA radiation rules, lithium battery "
        "hazmat, UFLPA polysilicon tracing, Section 232 and Section 301 entry headings, AD/CVD, plus legal ways to pay less: USMCA, not-a-vehicle-part, "
        "metals relief, exclusions, classification and Chapter 98.",
        "keywords": [
            "HTS Chapter 85",
            "tariff mitigation",
            "electronics tariff exemption",
            "FCC equipment authorization import",
            "UFLPA polysilicon",
            "section 232 auto parts hts list",
            "section 301 exclusions",
            "electronics exempt from tariffs list",
            "first sale valuation",
        ],
    }
    te["intro"] = (
        "Most Chapter 85 goods need an agency clearance as well as the right tariff headings. Radio-frequency devices need **FCC equipment authorization**, and "
        "equipment of Covered List companies (and, from October 13, 2026, devices with their logic components) cannot be authorized. Regulated motors, "
        "transformers, power supplies, lamps and water heaters need **DOE certification**; microwave ovens and other radiation-emitting products follow "
        "**FDA** standards; lithium batteries are **hazardous materials** in transport; and solar products face **UFLPA** forced-labor screening that "
        "traces polysilicon to its source.\n\n"
        "The legal ways to pay less depend on the product: USMCA origin, documenting that a listed battery or motor is not a vehicle part, the Section 232 "
        "metals relief headings, the remaining China exclusions, exact classification into the exempt electronics subheadings, the informational-materials "
        "and civil-aircraft reliefs, Chapter 98 for U.S. components and drawback. Each rule and lever links to its regulation or proclamation."
    )
    te["regulationsAsOf"] = ECFR_AS_OF
    te["rules"] = RULES
    te["levers"] = LEVERS
    rule_ids = {r["id"] for r in RULES}
    lever_ids = {lv["id"] for lv in LEVERS}

    fcc_h = {"8516", "8517", "8518", "8519", "8521", "8525", "8526", "8527", "8528", "8529", "8531", "8543"}
    covered_h = {"8517", "8525", "8526", "8528", "8529"}
    doe_h = {"8501", "8504", "8516", "8539"}
    fda_h = {"8516", "8539", "8540"}
    lith_h = {"8506", "8507", "8549"}
    uflpa_h = {"8504", "8507", "8541"}
    adcvd_lines = {h for h in S["all"] if h.startswith(("8541.42", "8541.43", "8501.71", "8501.72", "8501.80", "8507.20.80", "8544.42.90", "8544.49.90", "8504.23", "8504.90.96", "8545.11"))}
    civil = cov(d, "s301-2026-exempt-52d-civil-aircraft")
    s232 = S["auto"] | S["mhdv"] | S["m25"] | S["m15"] | S["uas"]
    poly = {h for h in S["all"] if h.startswith(("8541.42", "8541.43"))}
    classify_h = {"8505", "8517", "8523", "8524", "8528", "8529", "8541", "8542", "8543"}

    for g in te["groups"]:
        h = g["heading"]
        L = {x for x in S["all"] if x.startswith(h)}
        ids = ["marking", "s301", "usmca-cert"]
        if L & s232:
            ids.append("s232")
        for rid, hs in (("fcc", fcc_h), ("fcc-covered", covered_h), ("doe", doe_h), ("fda-rad", fda_h), ("lithium", lith_h), ("uflpa", uflpa_h)):
            if h in hs:
                ids.append(rid)
        if L & adcvd_lines:
            ids.append("adcvd")
        if L & civil:
            ids.append("civil-aircraft")
        if L & poly:
            ids.append("polysilicon")
        g["ruleIds"] = ids
        n = len(L)
        g["note"] = NOTES.get(h) or (
            f"{n} lines. Section 301 and USMCA rules apply as listed"
            + ("; FCC authorization for radio-frequency models" if h in fcc_h else "")
            + ("; Section 232 metals or vehicle-part duties on some lines" if L & s232 else "")
            + "."
        )
    for ln in te["lines"]:
        h = ln["hts"]
        hd = h[:4]
        r = ["marking", "s301", "usmca-cert"]
        if h in s232:
            r.append("s232")
        for rid, hs in (("fcc", fcc_h), ("fcc-covered", covered_h), ("doe", doe_h), ("fda-rad", fda_h), ("lithium", lith_h), ("uflpa", uflpa_h)):
            if hd in hs:
                r.append(rid)
        if h in adcvd_lines:
            r.append("adcvd")
        if h in civil:
            r.append("civil-aircraft")
        if h in poly:
            r.append("polysilicon")
        lv = ["usmca", "origin"]
        if h in S["auto"]:
            lv.append("not-auto-part")
        if h in S["m25"] or h in S["m15"]:
            lv += ["metal-content", "parts-election"]
        if hd in classify_h:
            lv.append("classify")
        if h in S["excl"]:
            lv.append("exclusions")
        if h in S["info"]:
            lv.append("info-materials")
        if h in civil:
            lv.append("civil-aircraft")
        lv += ["ch98", "drawback"]
        assert set(r) <= rule_ids and set(lv) <= lever_ids
        ln["ruleIds"], ln["leverIds"] = r, lv
    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 and Section 301 headings change often, "
        "AD/CVD rates are company-specific and change with each review, and FCC, DOE and FDA requirements depend on the exact product; check the current Chapter 99 "
        "notes, CBP's CSMS messages and the agency rules before importing."
    )
