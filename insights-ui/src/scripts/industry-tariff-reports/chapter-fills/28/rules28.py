"""Agency rules, levers and per-heading entry notes for HTS Chapter 28 (tariff-engineering page). Imported by fill28.py.

Every regulation was read on eCFR (versioner API, text current to 2026-10-08) or govinfo.gov.
"""
from static28 import CH99, CH28, ECFR, GN

ECFR_AS_OF = "2026-10-08"
GOVINFO_USC = "https://www.govinfo.gov/link/uscode/"
FRD = "https://www.federalregister.gov/documents/"

RULES = [
    {
        "id": "tsca",
        "agency": "EPA / CBP",
        "title": "Every Chapter 28 chemical: TSCA import certification (positive, or negative for a chemical not subject to TSCA) filed before release; without it CBP detains the shipment",
        "citations": [
            {"label": "19 CFR 12.121", "url": ECFR + "title-19/section-12.121"},
            {"label": "19 CFR 12.122–12.127 (detention, EPA review)", "url": ECFR + "title-19/part-12"},
            {"label": "40 CFR 707.20", "url": ECFR + "title-40/section-707.20"},
        ],
    },
    {
        "id": "dea-list1",
        "agency": "DEA",
        "title": "Iodine, red and white phosphorus, hydriodic acid, and hypophosphorous acid and its salts (List I): DEA importer registration and a DEA Form 486 import declaration at least 15 days before release (3 business days for regular importers); no threshold except 1.7 kg for hydriodic acid",
        "citations": [
            {"label": "21 CFR 1310.02", "url": ECFR + "title-21/section-1310.02"},
            {"label": "21 CFR 1310.04 (thresholds)", "url": ECFR + "title-21/section-1310.04"},
            {"label": "21 CFR 1309.21 (registration)", "url": ECFR + "title-21/section-1309.21"},
            {"label": "21 CFR 1313.12 (import declaration)", "url": ECFR + "title-21/section-1313.12"},
        ],
    },
    {
        "id": "dea-list2",
        "agency": "DEA",
        "title": "Potassium and sodium permanganate (List II): DEA Form 486 import declaration at least 15 days before release for shipments of 500 kg or more. Hydrochloric and sulfuric acid are List II chemicals, but their imports are excluded from the declaration rules",
        "citations": [
            {"label": "21 CFR 1310.02(b)", "url": ECFR + "title-21/section-1310.02"},
            {"label": "21 CFR 1310.08 (excluded transactions)", "url": ECFR + "title-21/section-1310.08"},
            {"label": "21 CFR 1313.12", "url": ECFR + "title-21/section-1313.12"},
            {"label": "21 CFR 1313.13 (declaration contents)", "url": ECFR + "title-21/section-1313.13"},
        ],
    },
    {
        "id": "nrc",
        "agency": "NRC",
        "title": "Uranium, thorium, plutonium and radioactive isotopes: imported under the NRC general license only when the U.S. consignee holds an NRC or Agreement State license to possess the material; irradiated fuel over 100 kg per shipment and radioactive waste need a specific license (NRC Form 7). Heavy water and deuterium need no NRC import license",
        "citations": [
            {"label": "10 CFR 110.27 (general license for imports)", "url": ECFR + "title-10/section-110.27"},
            {"label": "10 CFR 110.1(b)(4) (deuterium not covered)", "url": ECFR + "title-10/section-110.1"},
            {"label": "10 CFR 110.50 (advance notice)", "url": ECFR + "title-10/section-110.50"},
        ],
    },
    {
        "id": "ru-uranium-ban",
        "agency": "DOE / NRC",
        "title": "Russian uranium: low-enriched uranium produced in Russia or by a Russian entity is banned since August 11, 2024 (NRC also applies the ban to natural uranium). DOE waivers, capped at 464,183 kg in 2026 and 459,083 kg in 2027, end no later than January 1, 2028",
        "citations": [
            {"label": "Public Law 118-62 (Prohibiting Russian Uranium Imports Act)", "url": "https://www.govinfo.gov/content/pkg/PLAW-118publ62/html/PLAW-118publ62.htm"},
            {"label": "89 FR 45926 (NRC: effect of the statutory prohibition)", "url": FRD + "2024/05/24/2024-11164/effect-of-statutory-prohibition-on-uranium-imports-from-the-russian-federation"},
            {"label": "89 FR 45871 (DOE waiver instructions)", "url": FRD + "2024/05/24/2024-11392/instructions-for-requesting-a-waiver-from-the-secretary-of-energy-for-the-import-of-russian"},
        ],
    },
    {
        "id": "cwc",
        "agency": "Commerce (BIS)",
        "title": "Chemical Weapons Convention chemicals: arsenic trichloride (Schedule 2) cannot be imported from countries outside the Convention and needs an annual declaration above 1 t; phosgene, hydrogen cyanide, cyanogen chloride and the phosphorus and sulfur chlorides (Schedule 3) need an annual declaration when imports of one chemical exceed 30 t",
        "citations": [
            {"label": "15 CFR 713.3", "url": ECFR + "title-15/section-713.3"},
            {"label": "15 CFR 714.2", "url": ECFR + "title-15/section-714.2"},
        ],
    },
    {
        "id": "mercury",
        "agency": "EPA",
        "title": "Elemental mercury and mercury compounds: importers report quantities and countries of origin to EPA's mercury inventory every three years (reporting year 2027, due July 1, 2028); export of elemental mercury and five mercury compounds is banned",
        "citations": [
            {"label": "40 CFR part 713", "url": ECFR + "title-40/part-713"},
            {"label": "15 U.S.C. 2611(c)", "url": GOVINFO_USC + "15/2611"},
        ],
    },
    {
        "id": "dot-hazmat",
        "agency": "U.S. DOT (PHMSA)",
        "title": "Hazardous materials in transport: for example anhydrous ammonia (UN1005), chlorine (UN1017), sulfuric acid (UN1830), hydrochloric acid (UN1789), caustic soda solution (UN1824), hydrogen peroxide (UN2014/UN2015), nitric acid (UN2031), white phosphorus (UN1381) and mercury (UN2809) need hazmat shipping papers, marking and packaging",
        "citations": [{"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": ECFR + "title-49/section-172.101"}],
    },
    {
        "id": "epa-pesticide",
        "agency": "EPA / CBP",
        "title": "Chemicals imported as pesticides (for example boric acid, sodium chlorate, copper sulfate, sulfur or aluminum and zinc phosphide sold as a pesticide): EPA Notice of Arrival before the shipment arrives; otherwise the TSCA certification applies",
        "citations": [{"label": "19 CFR 12.112", "url": ECFR + "title-19/section-12.112"}],
    },
    {
        "id": "superfund-tax",
        "agency": "IRS",
        "title": "Superfund chemical excise tax (not a customs duty): due when the importer sells or uses a taxable chemical, e.g. ammonia $5.28, chlorine $5.40, hydrogen fluoride $8.46, phosphorus, arsenic, bromine and mercury $8.90, sulfuric acid $0.52 and caustic soda $0.56 per ton; imported hydrogen peroxide, chromic acid and nickel oxide pay the tax on imported substances. Reported on Form 6627 with Form 720",
        "citations": [
            {"label": "26 U.S.C. 4661", "url": GOVINFO_USC + "26/4661"},
            {"label": "26 U.S.C. 4662 (exemptions)", "url": GOVINFO_USC + "26/4662"},
            {"label": "26 U.S.C. 4671", "url": GOVINFO_USC + "26/4671"},
            {"label": "IRS Instructions for Form 6627", "url": "https://www.irs.gov/instructions/i6627"},
        ],
    },
    {
        "id": "s232-polysilicon",
        "agency": "Commerce (BIS) / CBP",
        "title": "Polysilicon (2804.61): Section 232 minimum import price of $21/kg from December 4, 2026; until then, new importers registered on or after August 6, 2026 may bring in at most 12 kg a week without a Commerce waiver",
        "citations": [
            {"label": "Proclamation 11052 (91 FR 51975)", "url": FRD + "2026/08/11/2026-16400/adjusting-imports-of-polysilicon-and-its-derivatives-into-the-united-states"},
            {"label": "91 FR 60505 (stockpiling rule)", "url": FRD + "2026/09/24/2026-19537/measures-to-restrict-stockpiling-of-polysilicon-and-polysilicon-derivatives-under-proclamation-11052"},
        ],
    },
]
