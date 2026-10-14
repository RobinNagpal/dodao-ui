"""Official sources used by the Chapter 80 fill script (fill80.py) that the generator does not emit.

Federal Register entries were checked against the FR API (citation, publication date, signing date, html_url) on 2026-10-13
(frmeta.jsonl). The IEEPA / Section 122 / Section 338 / AGOA / Section 232 metals documents are the same objects Chapter 74
shipped with (copied_sources.json), checked there.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH80 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2080"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
FRD = "https://www.federalregister.gov/documents"
ECFR = "https://www.ecfr.gov/current/title-19"


def src(id_, citation, document, title, signed, published, url, publisher="Federal Register"):
    return {"id": id_, "publisher": publisher, "citation": citation, "document": document, "title": title,
            "signed": signed, "published": published, "url": url}


COPIED = {s["id"]: s for s in json.load(open(os.path.join(HERE, "copied_sources.json")))}
COPIED.pop("hts-gn")  # replaced below: Chapter 80 cites general notes 3(b) and 16

NEW = [
    # ---------------------------------------------------------------- HTS
    src("hts-ch80", "HTSUS 2026 Revision 21, Chapter 80", "Harmonized Tariff Schedule",
        "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 80: Tin and Articles Thereof",
        None, "2026-10-07", CH80, publisher="USITC"),
    src("hts-gn", "HTSUS 2026 Revision 21, General Notes", "Harmonized Tariff Schedule",
        "Harmonized Tariff Schedule of the United States (2026 Revision 21), General Notes: note 3(b) (column 2 countries) and note 16 (AGOA beneficiary countries)",
        None, "2026-10-07", GN, publisher="USITC"),
    src("pl-117-110", "Pub. L. 117-110, 136 Stat. 1159", "Public Law 117-110", "Suspending Normal Trade Relations with Russia and Belarus Act",
        None, "2022-04-08", "https://www.govinfo.gov/content/pkg/PLAW-117publ110/html/PLAW-117publ110.htm", publisher="GovInfo (U.S. GPO)"),
    # ---------------------------------------------------------------- Section 232 processed critical minerals
    src("eo-14272", "90 FR 16437", "Executive Order 14272",
        "Ensuring National Security and Economic Resilience Through Section 232 Actions on Processed Critical Minerals and Derivative Products",
        "2025-04-15", "2025-04-18",
        f"{FRD}/2025/04/18/2025-06836/ensuring-national-security-and-economic-resilience-through-section-232-actions-on-processed-critical"),
    src("fr-2025-07273", "90 FR 17372", "Notice (BIS)",
        "Notice of Request for Public Comments on Section 232 National Security Investigation of Imports of Processed Critical Minerals and Derivative Products",
        None, "2025-04-25",
        f"{FRD}/2025/04/25/2025-07273/notice-of-request-for-public-comments-on-section-232-national-security-investigation-of-imports-of"),
    src("procl-11001", "91 FR 2439", "Proclamation 11001",
        "Adjusting Imports of Processed Critical Minerals and Their Derivative Products Into The United States", "2026-01-14", "2026-01-20",
        f"{FRD}/2026/01/20/2026-01045/adjusting-imports-of-processed-critical-minerals-and-their-derivative-products-into-the-united"),
    src("fr-2025-19813", "90 FR 50494", "Notice (U.S. Geological Survey)", "Final 2025 List of Critical Minerals", None, "2025-11-07",
        f"{FRD}/2025/11/07/2025-19813/final-2025-list-of-critical-minerals"),
    src("usgs-mcs-2026-tin", "USGS Mineral Commodity Summaries 2026: Tin", "Mineral Commodity Summaries",
        "Mineral Commodity Summaries 2026: Tin", None, "2026-02-05", "https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-tin.pdf",
        publisher="U.S. Geological Survey"),
    # ---------------------------------------------------------------- IEEPA Brazil
    src("eo-14323", "90 FR 37739", "Executive Order 14323", "Addressing Threats to the United States by the Government of Brazil",
        "2025-07-30", "2025-08-05",
        f"{FRD}/2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil"),
    src("eo-14361", "90 FR 54467", "Executive Order 14361", "Modifying the Scope of Tariffs on the Government of Brazil",
        "2025-11-20", "2025-11-26", f"{FRD}/2025/11/26/2025-21417/modifying-the-scope-of-tariffs-on-the-government-of-brazil"),
    # ---------------------------------------------------------------- tin mill products (steel, not Chapter 80)
    src("fr-2026-08745", "91 FR 24157", "Notice (Commerce, ITA)",
        "Tin Mill Products From the People's Republic of China, Taiwan, and the Republic of Türkiye: Initiation of Less-Than-Fair-Value Investigations",
        None, "2026-05-05",
        f"{FRD}/2026/05/05/2026-08745/tin-mill-products-from-the-peoples-republic-of-china-taiwan-and-the-republic-of-trkiye-initiation-of"),
    src("fr-2026-08744", "91 FR 24170", "Notice (Commerce, ITA)",
        "Tin Mill Products From the People's Republic of China: Initiation of Countervailing Duty Investigation", None, "2026-05-05",
        f"{FRD}/2026/05/05/2026-08744/tin-mill-products-from-the-peoples-republic-of-china-initiation-of-countervailing-duty-investigation"),
    src("fr-2026-18792", "91 FR 58418", "Notice (Commerce, ITA)",
        "Tin Mill Products From the People's Republic of China: Preliminary Affirmative Countervailing Duty Determination, Preliminary Affirmative Critical Circumstances Determination",
        None, "2026-09-15",
        f"{FRD}/2026/09/15/2026-18792/tin-mill-products-from-the-peoples-republic-of-china-preliminary-affirmative-countervailing-duty"),
    src("fr-2026-19274", "91 FR 59760", "Notice (Commerce, ITA)",
        "Tin Mill Products From the People's Republic of China: Preliminary Affirmative Determination of Sales at Less Than Fair Value",
        None, "2026-09-21",
        f"{FRD}/2026/09/21/2026-19274/tin-mill-products-from-the-peoples-republic-of-china-preliminary-affirmative-determination-of-sales"),
    src("fr-2026-19811", "91 FR 61247", "Notice (USITC)",
        "Tin Mill Products From China, Taiwan, and Turkey; Scheduling of the Final Phase of Countervailing Duty and Antidumping Duty Investigations",
        None, "2026-09-28",
        f"{FRD}/2026/09/28/2026-19811/tin-mill-products-from-china-taiwan-and-turkey-scheduling-of-the-final-phase-of-countervailing-duty"),
    # ---------------------------------------------------------------- CBP rulings
    src("ny-n357709", "NY N357709", "CBP ruling", "The tariff classification of tin-lead solder powder from France", None, "2026-01-29",
        "https://rulings.cbp.gov/ruling/N357709", publisher="U.S. Customs and Border Protection"),
    src("ny-n359194", "NY N359194", "CBP ruling", "The tariff classification of solder powder from Japan", None, "2026-08-31",
        "https://rulings.cbp.gov/ruling/N359194", publisher="U.S. Customs and Border Protection"),
    src("ny-k87486", "NY K87486", "CBP ruling", "The tariff classification of solder balls from Japan", None, "2004-07-18",
        "https://rulings.cbp.gov/ruling/K87486", publisher="U.S. Customs and Border Protection"),
    src("ny-n351599", "NY N351599", "CBP ruling", "The tariff classification of a metal container from South Korea", None, "2025-08-04",
        "https://rulings.cbp.gov/ruling/N351599", publisher="U.S. Customs and Border Protection"),
    # ---------------------------------------------------------------- SEC conflict minerals (not an import rule)
    src("fr-2012-21153", "77 FR 56274", "Final rule (SEC)", "Conflict Minerals", None, "2012-09-12",
        f"{FRD}/2012/09/12/2012-21153/conflict-minerals"),
]
ALL = dict(COPIED)
ALL.update({s["id"]: s for s in NEW})

# Non-source citation URLs (eCFR / U.S. Code / rulings), all checked on 2026-10-13.
SEC_13P1 = "https://www.ecfr.gov/current/title-17/section-240.13p-1"
SEC_FORM_SD = "https://www.ecfr.gov/current/title-17/section-249b.400"
USC_78M = "https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap2B-sec78m.htm"
USC_1278A = "https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap30-sec1278a.htm"
