import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

# Source objects for Chapter 36 that the generator does not add. Imported by fill36.py.
import glob
import json

FR = "https://www.federalregister.gov/documents/"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH36 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2036"
ECFR = "https://www.ecfr.gov/current/"
CHAPTERS = IU + "/src/tariff-data/chapters/"


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


def _existing():
    """Source objects already used (and link-checked) by other migrated chapters, by id."""
    out = {}
    for f in sorted(glob.glob(CHAPTERS + "*.json")):
        if "36-" in f:
            continue
        d = json.load(open(f))
        for page in ("tariffUpdates", "industryAreas"):
            for s in d.get(page, {}).get("sources", []):
                out.setdefault(s["id"], s)
    return out


EXISTING = _existing()
REUSE = [
    "eo-14193", "eo-14194", "eo-14195", "eo-14228", "eo-14257", "eo-14266", "eo-14298", "eo-14323", "eo-14325",
    "eo-14326", "eo-14357", "eo-14389", "procl-11012", "csms-67834313", "scotus-24-1287", "ustr-usmca-review",
]

NEW = [
    src("fr-2019-18838", "Federal Register", "84 FR 45821", "Notice (USTR)",
        "Notice of Modification of Section 301 Action: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",
        None, "2019-08-30", FR + "2019/08/30/2019-18838/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to"),
    src("fr-2019-27306", "Federal Register", "84 FR 69447", "Notice (USTR)",
        "Notice of Modification of Section 301 Action: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",
        None, "2019-12-18", FR + "2019/12/18/2019-27306/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to"),
    src("eo-14259", "Federal Register", "90 FR 15509", "Executive Order 14259",
        "Amendment to Reciprocal Tariffs and Updated Duties as Applied to Low-Value Imports From the People's Republic of China",
        "2025-04-08", "2025-04-14", FR + "2025/04/14/2025-06378/amendment-to-reciprocal-tariffs-and-updated-duties-as-applied-to-low-value-imports-from-the-peoples"),
    src("fr-2024-30826", "Federal Register", "90 FR 1800", "Final rule (CPSC)", "Certificates of Compliance",
        None, "2025-01-08", FR + "2025/01/08/2024-30826/certificates-of-compliance"),
    src("fr-2026-10962", "Federal Register", "91 FR 32889", "Final rule (PHMSA, HM-257A)",
        "Hazardous Materials: Streamlining Requirements for the Approval of Certain Energetic Materials",
        None, "2026-06-02", FR + "2026/06/02/2026-10962/hazardous-materials-streamlining-requirements-for-the-approval-of-certain-energetic-materials"),
    src("fr-2026-16111", "Federal Register", "91 FR 51098", "Final rule (PHMSA, HM-268Q)",
        "Hazardous Materials: Allowing Fireworks Certification Agencies (FCAs) To Approve Professional Fireworks",
        None, "2026-08-07", FR + "2026/08/07/2026-16111/hazardous-materials-allowing-fireworks-certification-agencies-fcas-to-approve-professional-fireworks"),
    src("fr-2026-19693", "Federal Register", "91 FR 61074", "Final rule (ATF)", "Implementing the Safe Explosives Act",
        None, "2026-09-25", FR + "2026/09/25/2026-19693/implementing-the-safe-explosives-act"),
    src("fr-2026-19694", "Federal Register", "91 FR 60803", "Final rule (ATF)", "Annual Notices on Explosive Materials Storage Facilities to Local Fire Authority",
        None, "2026-09-25", FR + "2026/09/25/2026-19694/annual-notices-on-explosive-materials-storage-facilities-to-local-fire-authority"),
    src("fr-2026-19692", "Federal Register", "91 FR 60911", "Proposed rule (ATF)", "Revising Requirements and Exceptions for Storing Explosives",
        None, "2026-09-25", FR + "2026/09/25/2026-19692/revising-requirements-and-exceptions-for-storing-explosives"),
    src("fr-2026-19691", "Federal Register", "91 FR 60920", "Proposed rule (ATF)", "Explosives Magazine Safety Requirements",
        None, "2026-09-25", FR + "2026/09/25/2026-19691/explosives-magazine-safety-requirements"),
]


def sources_for(ids):
    pool = dict(EXISTING)
    for s in NEW:
        pool[s["id"]] = s
    return [pool[i] for i in ids]


EXTRA_SOURCE_IDS = REUSE + [s["id"] for s in NEW]
