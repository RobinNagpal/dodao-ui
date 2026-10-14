"""Commerce AD/CVD orders and investigations on Chapter 86 goods, with Federal Register sources (FR API html_url, checked 2026-10-13).

Rates are from the orders / latest final results:
- China couplers: AD order 88 FR 45138 (China-wide 169.90%; cash deposit 139.49% after the export-subsidy offset), CVD order 88 FR 45135 (265.99%).
  Admin reviews rescinded (91 FR 12358, 91 FR 29453), so those rates stand. ITC remand under way (90 FR 57215).
- Mexico couplers: AD order 88 FR 78308 (ASF-K de Mexico and all others 48.10%); 2023-2024 review 91 FR 33695 (Amsted Rail / ASF-K 6.50%).
- Czech Republic / India couplers: Commerce final determinations 91 FR 60588 / 60595 / 60598 (September 24, 2026); ITC final vote pending.
- Railway tank cars from Mexico: petition September 30, 2026, ITC institution 91 FR 63308 (preliminary vote due November 16, 2026).
"""

ADCVD_RULES = [
    # (id, agency, title, [(label, source id)])
    ("adcvd-couplers-cn", "Commerce / CBP",
     "AD/CVD on freight rail couplers and parts from China (8607.30.10; also 7326.90.86 and 7325.99.50, and couplers already fitted to railcars of 8606): AD cash deposit 139.49% (China-wide) plus CVD 265.99%; country of origin is where the coupler body or knuckle was cast or forged",
     [("88 FR 45138 (AD order)", "fr-2023-14892"), ("88 FR 45135 (CVD order)", "fr-2023-14891"), ("90 FR 57215 (ITC remand)", "fr-2025-22408")]),
    ("adcvd-couplers-mx", "Commerce / CBP",
     "AD on freight rail couplers and parts from Mexico: 6.50% for Amsted Rail / ASF-K de Mexico after the 2023-2024 review; 48.10% all others; couplers fitted to railcars are covered",
     [("88 FR 78308 (AD order)", "fr-2023-25201"), ("91 FR 33695 (review results)", "fr-2026-11263")]),
    ("adcvd-couplers-cz-in", "Commerce / ITC",
     "Freight rail couplers from the Czech Republic and India: Commerce's final AD and CVD determinations are affirmative (Czech 73.74%; India AD 2.32%–71.01%, CVD 9.71%–75%); orders follow only if the ITC's final injury vote is affirmative",
     [("91 FR 60598 (Czech AD final)", "fr-2026-19520"), ("91 FR 60588 (India AD final)", "fr-2026-19521"), ("91 FR 60595 (India CVD final)", "fr-2026-19522")]),
    ("adcvd-tankcars-mx", "ITC / Commerce",
     "Railway tank cars and parts from Mexico (8606.10): AD and CVD petition filed September 30, 2026; no duty yet, but cash deposits could start after affirmative preliminary determinations",
     [("91 FR 63308 (ITC institution)", "fr-2026-20349")]),
]

ADCVD_BY_HEADING = {
    "8606": ["adcvd-couplers-cn", "adcvd-couplers-mx", "adcvd-tankcars-mx"],
    "8607": ["adcvd-couplers-cn", "adcvd-couplers-mx", "adcvd-couplers-cz-in"],
}
ADCVD_BY_LINE = {
    "8607.30.10.10": ["adcvd-couplers-cn", "adcvd-couplers-mx", "adcvd-couplers-cz-in"],
    "8607.30.10.50": ["adcvd-couplers-cn", "adcvd-couplers-mx", "adcvd-couplers-cz-in"],
    "8607.30.10.90": ["adcvd-couplers-cn", "adcvd-couplers-mx", "adcvd-couplers-cz-in"],
    "8606.10.00.00": ["adcvd-couplers-cn", "adcvd-couplers-mx", "adcvd-tankcars-mx"],
    "8606.30.00.00": ["adcvd-couplers-cn", "adcvd-couplers-mx"],
    "8606.91.00.00": ["adcvd-couplers-cn", "adcvd-couplers-mx"],
    "8606.92.00.00": ["adcvd-couplers-cn", "adcvd-couplers-mx"],
    "8606.99.01.30": ["adcvd-couplers-cn", "adcvd-couplers-mx"],
    "8606.99.01.60": ["adcvd-couplers-cn", "adcvd-couplers-mx"],
}

ADCVD_BY_COUNTRY = {
    "China": "Chinese freight rail couplers (8607.30.10, and couplers on finished railcars) also pay AD 139.49% and CVD 265.99%, not shown.",
    "Mexico": "Mexican freight rail couplers pay AD (6.50% for Amsted Rail / ASF-K, 48.10% others), and a September 2026 AD/CVD petition targets Mexican railway tank cars; not shown.",
    "India": "Commerce's final AD/CVD determinations on Indian freight rail couplers are affirmative; duties start only if the ITC votes affirmatively. Not shown.",
    "Czechia": "Commerce found Czech freight rail couplers dumped at 73.74%; duties start only if the ITC votes affirmatively. Not shown.",
}
ADCVD_COUNTRY_SOURCES = {
    "China": ["fr-2023-14892", "fr-2023-14891"],
    "Mexico": ["fr-2023-25201", "fr-2026-11263", "fr-2026-20349"],
    "India": ["fr-2026-19521", "fr-2026-19522"],
    "Czechia": ["fr-2026-19520"],
}

# Change-log entries (fields of text86.ch()).
ADCVD_CHANGES = [
    dict(id="adcvd-tankcars-2026", type="pending", date="2026-10-05", label="Published", title="AD/CVD petition on railway tank cars from Mexico",
         detail="UTLX Manufacturing petitioned on September 30, 2026 for antidumping and countervailing duties on railway tank cars and parts from Mexico (8606.10). The ITC instituted its "
         "investigations; its preliminary vote is due by November 16, 2026, and Commerce sets any cash deposits after its own preliminary determinations.",
         before=None, now="Investigation", countries="Mexico", ids=["fr-2026-20349"]),
    dict(id="adcvd-couplers-cz-in-2026", type="pending", date="2026-09-24", label="Published", title="Final AD/CVD determinations on couplers from the Czech Republic and India",
         detail="Commerce made final affirmative determinations on freight rail couplers and parts (8607.30.10): Czech dumping margin 73.74%; Indian dumping margins 2.32%–71.01% (all others 5.24%) "
         "and subsidy rates 9.71%–75% (all others 9.71%). Orders follow only if the ITC's final injury vote, due within 45 days, is affirmative.",
         before=None, now="Investigation (final phase)", countries="Czech Republic, India", ids=["fr-2026-19520", "fr-2026-19521", "fr-2026-19522"]),
    dict(id="adcvd-couplers-mx-review-2026", type="reference", date="2026-06-04", label="Published", title="Mexico coupler AD rate cut to 6.50% in first review",
         detail="Commerce's first administrative review of the antidumping order on freight rail couplers from Mexico set a 6.50% margin for Amsted Rail / ASF-K de Mexico (period May 2023 to "
         "October 2024); that is now the company's cash deposit rate. Other Mexican producers stay at 48.10%.",
         before="48.10%", now="6.50% (Amsted / ASF-K)", countries="Mexico", ids=["fr-2026-11263"]),
    dict(id="adcvd-couplers-cn-remand-2025", type="reference", date="2025-12-10", label="Published", title="ITC reconsiders its China coupler injury finding on court remand",
         detail="The Court of International Trade sent the ITC's 2023 injury determination on Chinese freight rail couplers back for reconsideration (Wabtec v. United States, Slip Op. 25-134). "
         "The China AD and CVD orders stay in force while the remand runs.",
         before=None, now="Orders continue", countries="China", ids=["fr-2025-22408"]),
    dict(id="adcvd-couplers-cz-in-2025", type="reference", date="2025-08-18", label="Initiated", title="New coupler investigations on the Czech Republic and India",
         detail="Commerce opened antidumping investigations on freight rail couplers and parts from the Czech Republic and India and a countervailing duty investigation on India.",
         before=None, now="Investigation", countries="Czech Republic, India", ids=["fr-2025-15633"]),
    dict(id="adcvd-couplers-mx-2023", type="extraDuty", date="2023-11-15", label="Published", title="AD order on freight rail couplers from Mexico",
         detail="Commerce issued an antidumping order on freight rail couplers and parts from Mexico at 48.10%. Like the China order, it covers couplers fitted to railcars, by the country where the coupler parts were cast.",
         before=None, now="AD 48.10%", countries="Mexico", ids=["fr-2023-25201"]),
    dict(id="adcvd-couplers-cn-2023", type="extraDuty", date="2023-07-14", label="Published", title="AD/CVD orders on freight rail couplers from China",
         detail="Commerce issued antidumping (China-wide 169.90%, cash deposit 139.49%) and countervailing duty (265.99%) orders on freight rail couplers, knuckles and coupler bodies from China, "
         "including those fitted to railcars of 8606 entered from third countries.",
         before=None, now="AD 139.49% + CVD 265.99%", countries="China", ids=["fr-2023-14892", "fr-2023-14891"]),
]
