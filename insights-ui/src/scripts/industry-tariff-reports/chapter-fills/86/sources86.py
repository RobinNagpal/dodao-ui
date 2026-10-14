"""New official sources for Chapter 86 (not already used by another chapter file).

Federal Register URLs are the FR API `html_url` (checked 2026-10-13); eCFR / hts.usitc.gov URLs were opened.
"""

CH86_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2086"
CH98_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH99_PDF = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
FR = "https://www.federalregister.gov/documents"


def fr(doc, citation, title, published, slug, document="Notice (Commerce / ITA)", signed=None, publisher="Federal Register"):
    y, m, dd = published.split("-")
    return {
        "id": f"fr-{doc}",
        "publisher": publisher,
        "citation": citation,
        "document": document,
        "title": title,
        "signed": signed,
        "published": published,
        "url": f"{FR}/{y}/{m}/{dd}/{doc}/{slug}",
    }


ITC = "Notice (USITC)"
USTR = "Notice (USTR)"

_LIST = [
    {
        "id": "hts-ch86",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 86",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Section XVII and Chapter 86: Railway or Tramway Locomotives, Rolling Stock, Track Fixtures and Signaling Equipment",
        "signed": None,
        "published": "2026-10-07",
        "url": CH86_PDF,
    },
    # freight rail couplers
    fr("2023-14892", "88 FR 45138", "Certain Freight Rail Couplers and Parts Thereof From the People's Republic of China: Antidumping Duty Order", "2023-07-14",
       "certain-freight-rail-couplers-and-parts-thereof-from-the-peoples-republic-of-china-antidumping-duty"),
    fr("2023-14891", "88 FR 45135", "Certain Freight Rail Couplers and Parts Thereof From the People's Republic of China: Countervailing Duty Order", "2023-07-14",
       "certain-freight-rail-couplers-and-parts-thereof-from-the-peoples-republic-of-china-countervailing"),
    fr("2023-25201", "88 FR 78308", "Certain Freight Rail Couplers and Parts Thereof From Mexico: Antidumping Duty Order", "2023-11-15",
       "certain-freight-rail-couplers-and-parts-thereof-from-mexico-antidumping-duty-order"),
    fr("2025-22408", "90 FR 57215", "Certain Freight Rail Couplers and Parts Thereof From China; Notice of Remand Proceedings", "2025-12-10",
       "certain-freight-rail-couplers-and-parts-thereof-from-china-notice-of-remand-proceedings", ITC),
    fr("2025-15633", "90 FR 40059", "Certain Freight Rail Couplers and Parts Thereof From the Czech Republic and India: Initiation of Less-Than-Fair-Value Investigations", "2025-08-18",
       "certain-freight-rail-couplers-and-parts-thereof-from-the-czech-republic-and-india-initiation-of"),
    fr("2026-11263", "91 FR 33695", "Certain Freight Rail Couplers and Parts Thereof From Mexico: Final Results of Antidumping Duty Administrative Review; 2023-2024", "2026-06-04",
       "certain-freight-rail-couplers-and-parts-thereof-from-mexico-final-results-of-antidumping-duty"),
    fr("2026-19521", "91 FR 60588", "Certain Freight Rail Couplers and Parts Thereof From India: Final Affirmative Determination of Sales at Less Than Fair Value", "2026-09-24",
       "certain-freight-rail-couplers-and-parts-thereof-from-india-final-affirmative-determination-of-sales"),
    fr("2026-19522", "91 FR 60595", "Certain Freight Rail Couplers and Parts Thereof From India: Final Affirmative Countervailing Duty Determination", "2026-09-24",
       "certain-freight-rail-couplers-and-parts-thereof-from-india-final-affirmative-countervailing-duty"),
    fr("2026-19520", "91 FR 60598", "Certain Freight Rail Couplers and Parts Thereof From the Czech Republic: Final Affirmative Determination of Sales at Less Than Fair Value", "2026-09-24",
       "certain-freight-rail-couplers-and-parts-thereof-from-the-czech-republic-final-affirmative"),
    # railway tank cars
    fr("2026-20349", "91 FR 63308", "Railway Tank Cars and Parts Thereof From Mexico; Institution of Antidumping and Countervailing Duty Investigations and Scheduling of Preliminary Phase Investigations", "2026-10-05",
       "railway-tank-cars-and-parts-thereof-from-mexico-institution-of-antidumping-and-countervailing-duty", ITC),
    # 53-foot containers (no order)
    fr("2015-13750", "80 FR 32179", "53-Foot Domestic Dry Containers From China; Determinations", "2015-06-05", "53-foot-domestic-dry-containers-from-china-determinations", ITC),
    # Section 301 maritime, logistics and shipbuilding
    fr("2025-06927", "90 FR 17114", "Notice of Action and Proposed Action in Section 301 Investigation of China's Targeting the Maritime, Logistics, and Shipbuilding Sectors for Dominance", "2025-04-23",
       "notice-of-action-and-proposed-action-in-section-301-investigation-of-chinas-targeting-the-maritime", USTR),
    fr("2025-19568", "90 FR 48320", "Notice of Modification and Proposed Modification of Section 301 Action: China's Targeting of the Maritime, Logistics, and Shipbuilding Sectors for Dominance", "2025-10-16",
       "notice-of-modification-and-proposed-modification-of-section-301-action-chinas-targeting-of-the", USTR),
    fr("2025-19873", "90 FR 50947", "Notice of Modification of Section 301 Action: China's Targeting of the Maritime, Logistics, and Shipbuilding Sectors for Dominance (one-year suspension)", "2025-11-13",
       "notice-of-modification-of-section-301-action-chinas-targeting-of-the-maritime-logistics-and", USTR),
    # FRA freight car content rule
    fr("2024-30030", "89 FR 103677", "Freight Car Safety Standards Implementing the Infrastructure Investment and Jobs Act", "2024-12-19",
       "freight-car-safety-standards-implementing-the-infrastructure-investment-and-jobs-act", "Final rule (FRA)"),
    # FTZ example
    fr("2026-06194", "91 FR 15947", "Foreign-Trade Zone (FTZ) 30, Notification of Proposed Production Activity; Stadler US Inc; (Passenger Rolling Stock); Salt Lake City, Utah", "2026-03-31",
       "foreign-trade-zone-ftz-30-notification-of-proposed-production-activity-stadler-us-inc-passenger", "Notice (FTZ Board)"),
]

NEW = {s["id"]: s for s in _LIST}
