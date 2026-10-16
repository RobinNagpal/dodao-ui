# Static (non-trade) sources and constants for Chapter 34. Imported by fill34.py.
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FR = "https://www.federalregister.gov/documents/"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH34 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2034"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
ECFR = "https://www.ecfr.gov/current/"
ECFR_AS_OF = "2026-10-08"


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


# Sources already vetted in other migrated chapters (same ids, same documents).
_LIB = json.load(open(os.path.join(HERE, "all_sources.json")))
REUSED = [_LIB[k] for k in [
    "eo-14193", "eo-14194", "eo-14195", "eo-14228", "eo-14231", "eo-14232", "eo-14257", "eo-14298", "eo-14325", "eo-14326",
    "eo-14357", "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "fr-2025-21671",
    "cbp-gsp", "crs-agoa", "ustr-agoa-2026",
]]

NEW = [
    # Antidumping duty order: petroleum wax candles from China (A-570-504)
    src("fr-2021-23560", "Federal Register", "86 FR 59984", "Notice (Commerce)",
        "Petroleum Wax Candles From the People's Republic of China: Continuation of the Antidumping Duty Order", None, "2021-10-29",
        FR + "2021/10/29/2021-23560/petroleum-wax-candles-from-the-peoples-republic-of-china-continuation-of-the-antidumping-duty-order"),
    src("fr-2021-14710", "Federal Register", "86 FR 36523", "Notice (Commerce)",
        "Petroleum Wax Candles From the People's Republic of China: Final Results of the Expedited Fifth Sunset Review of the Antidumping Duty Order",
        None, "2021-07-12",
        FR + "2021/07/12/2021-14710/petroleum-wax-candles-from-the-peoples-republic-of-china-final-results-of-the-expedited-fifth-sunset"),
    src("fr-2026-17811", "Federal Register", "91 FR 56127", "Notice (Commerce)", "Initiation of Five-Year (Sunset) Reviews", None, "2026-09-01",
        FR + "2026/09/01/2026-17811/initiation-of-five-year-sunset-reviews"),
    src("fr-2026-17862", "Federal Register", "91 FR 56205", "Notice (USITC)", "Petroleum Wax Candles From China; Institution of a Five-Year Review",
        None, "2026-09-01", FR + "2026/09/01/2026-17862/petroleum-wax-candles-from-china-institution-of-a-five-year-review"),
    # Section 232 aluminum: 2025 rate increase and 2026 restructuring
    src("procl-10947", "Federal Register", "90 FR 24199", "Proclamation 10947", "Adjusting Imports of Aluminum and Steel Into the United States",
        "2025-06-03", "2025-06-09", FR + "2025/06/09/2025-10524/adjusting-imports-of-aluminum-and-steel-into-the-united-states"),
    src("procl-11021", "Federal Register", "91 FR 18201", "Proclamation 11021",
        "Strengthening Actions Taken To Adjust Imports of Aluminum, Steel, and Copper Into the United States", "2026-04-02", "2026-04-09",
        FR + "2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states"),
]

EXTRA_SOURCES = REUSED + NEW
