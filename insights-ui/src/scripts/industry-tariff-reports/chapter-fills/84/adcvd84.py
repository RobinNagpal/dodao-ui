"""Commerce AD/CVD orders on Chapter 84 goods, by product, with Federal Register sources (FR API html_url, checked 2026-10-13)."""


def _s(doc, citation, title, published, slug, document="Notice (Commerce / ITA)"):
    y, m, dd = published.split("-")
    return {
        "id": f"fr-{doc}",
        "publisher": "Federal Register",
        "citation": citation,
        "document": document,
        "title": title,
        "signed": None,
        "published": published,
        "url": f"https://www.federalregister.gov/documents/{y}/{m}/{dd}/{doc}/{slug}",
    }


ITC = "Notice (USITC)"
ADCVD_SOURCES = [
    # engines
    _s("2021-09318", "86 FR 23675", "Certain Vertical Shaft Engines Between 99cc and Up to 225cc, and Parts Thereof From the People's Republic of China: Antidumping and Countervailing Duty Orders", "2021-05-04", "certain-vertical-shaft-engines-between-99cc-and-up-to-225cc-and-parts-thereof-from-the-peoples"),
    _s("2026-15473", "91 FR 48369", "Certain Vertical Shaft Engines Between 99cc and Up To 225cc, and Parts Thereof (Small Vertical Engines) From the People's Republic of China: Final Results of the Expedited First Sunset Review of the Antidumping Duty Order", "2026-07-31", "certain-vertical-shaft-engines-between-99cc-and-up-to-225cc-and-parts-thereof-small-vertical-engines"),
    _s("2026-15566", "91 FR 48366", "Certain Vertical Shaft Engines Between 99cc and Up to 225cc, and Parts Thereof From the People's Republic of China: Final Results of the Expedited First Sunset Review of the Countervailing Duty Order", "2026-07-31", "certain-vertical-shaft-engines-between-99cc-and-up-to-225cc-and-parts-thereof-from-the-peoples"),
    _s("2026-16020", "91 FR 50892", "Small Vertical Shaft Engines From China; Scheduling of Expedited Five-Year Reviews", "2026-08-06", "small-vertical-shaft-engines-from-china-scheduling-of-expedited-five-year-reviews", ITC),
    _s("2026-19519", "91 FR 60587", "Certain Vertical Shaft Engines Between 99cc and 225cc, and Parts Thereof, From the People's Republic of China: Affirmative Final Determinations of Circumvention of the Antidumping and Countervailing Duty Orders-5C65M0 and BC70M0 Engines", "2026-09-24", "certain-vertical-shaft-engines-between-99cc-and-225cc-and-parts-thereof-from-the-peoples-republic-of"),
    _s("2026-17031", "91 FR 53844", "Certain Large Vertical Shaft Engines Between 225cc and 999cc, and Parts Thereof From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2026-08-20", "certain-large-vertical-shaft-engines-between-225cc-and-999cc-and-parts-thereof-from-the-peoples"),
    _s("2026-16302", "91 FR 51747", "Large Vertical Shaft Engines From China; Determinations", "2026-08-11", "large-vertical-shaft-engines-from-china-determinations", ITC),
    # outdoor power equipment
    _s("2022-10789", "87 FR 30448", "Certain Walk-Behind Snow Throwers and Parts Thereof From the People's Republic of China: Antidumping Duty and Countervailing Duty Orders", "2022-05-19", "certain-walk-behind-snow-throwers-and-parts-thereof-from-the-peoples-republic-of-china-antidumping"),
    _s("2026-05000", "91 FR 12570", "Tow-Behind Lawn Groomers and Certain Parts Thereof From the People's Republic of China: Continuation of Antidumping Duty Order", "2026-03-16", "tow-behind-lawn-groomers-and-certain-parts-thereof-from-the-peoples-republic-of-china-continuation"),
    _s("2024-02902", "89 FR 9834", "Gas Powered Pressure Washers From the People's Republic of China: Antidumping Duty and Countervailing Duty Orders", "2024-02-12", "gas-powered-pressure-washers-from-the-peoples-republic-of-china-antidumping-duty-and-countervailing"),
    _s("2023-23612", "88 FR 73311", "Gas Powered Pressure Washers From the Socialist Republic of Vietnam: Antidumping Duty Order", "2023-10-25", "gas-powered-pressure-washers-from-the-socialist-republic-of-vietnam-antidumping-duty-order"),
    _s("2026-18249", "91 FR 57132", "Certain Walk-Behind Lawn Mowers and Parts Thereof From the People's Republic of China and the Socialist Republic of Vietnam: Final Results of Sunset Review and Revocation of Orders", "2026-09-08", "certain-walk-behind-lawn-mowers-and-parts-thereof-from-the-peoples-republic-of-china-and-the"),
    _s("2026-19401", "91 FR 60414", "Walk-Behind Lawn Mowers From China and Vietnam; Termination of Five-Year Reviews", "2026-09-23", "walk-behind-lawn-mowers-from-china-and-vietnam-termination-of-five-year-reviews", ITC),
    # lifting and handling
    _s("2022-08014", "87 FR 22190", "Certain Mobile Access Equipment and Subassemblies Thereof From the People's Republic of China: Antidumping Duty Order", "2022-04-14", "certain-mobile-access-equipment-and-subassemblies-thereof-from-the-peoples-republic-of-china"),
    _s("2021-26890", "86 FR 70439", "Certain Mobile Access Equipment and Subassemblies Thereof From the People's Republic of China: Countervailing Duty Order and Amended Final Affirmative Countervailing Duty Determination", "2021-12-10", "certain-mobile-access-equipment-and-subassemblies-thereof-from-the-peoples-republic-of-china"),
    _s("2025-24034", "90 FR 61373", "Mobile Access Equipment From the People's Republic of China: Notice of Court Decision Not in Harmony With the Final Determination of Antidumping Investigation; Notice of Amended Final Determination", "2025-12-31", "mobile-access-equipment-from-the-peoples-republic-of-china-notice-of-court-decision-not-in-harmony"),
    _s("2026-20159", "91 FR 62473", "Antidumping or Countervailing Duty Order, Finding, or Suspended Investigation; Advance Notification of Sunset Review (November 2026)", "2026-10-01", "antidumping-or-countervailing-duty-order-finding-or-suspended-investigation-advance-notification-of"),
    _s("2026-14950", "91 FR 46396", "Lattice Boom Crawler Cranes From Japan: Antidumping Duty Order", "2026-07-23", "lattice-boom-crawler-cranes-from-japan-antidumping-duty-order"),
    _s("2026-14597", "91 FR 45282", "Lattice-Boom Crawler Cranes (LBCCs) From Japan; Determination", "2026-07-20", "lattice-boom-crawler-cranes-lbccs-from-japan-determination", ITC),
    # appliances
    _s("2022-18611", "87 FR 52904", "Large Residential Washers From the People's Republic of China: Continuation of the Antidumping Duty Order", "2022-08-30", "large-residential-washers-from-the-peoples-republic-of-china-continuation-of-the-antidumping-duty"),
    _s("2024-23916", "89 FR 83635", "Large Residential Washers From Mexico: Continuation of the Antidumping Duty Order", "2024-10-17", "large-residential-washers-from-mexico-continuation-of-the-antidumping-duty-order"),
    _s("2019-09213", "84 FR 19763", "Large Residential Washers From Mexico and the Republic of Korea: Continuation of Antidumping Duty Order (Mexico) and Revocation of Antidumping and Countervailing Duty Orders (Korea)", "2019-05-06", "large-residential-washers-from-mexico-and-the-republic-of-korea-continuation-of-antidumping-duty"),
    _s("2026-07107", "91 FR 18818", "Certain Kitchen Appliance Shelving and Racks From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2026-04-13", "certain-kitchen-appliance-shelving-and-racks-from-the-peoples-republic-of-china-continuation-of"),
    _s("2025-10633", "90 FR 24590", "Large Top Mount Combination Refrigerator-Freezers From Thailand: Termination of Less-Than-Fair-Value Investigation", "2025-06-11", "large-top-mount-combination-refrigerator-freezers-from-thailand-termination-of-less-than-fair-value"),
    _s("2022-11003", "87 FR 31209", "Seamless Refined Copper Pipe and Tube From the People's Republic of China and Mexico: Continuation of Antidumping Duty Orders", "2022-05-23", "seamless-refined-copper-pipe-and-tube-from-the-peoples-republic-of-china-and-mexico-continuation-of"),
    _s("2021-17375", "86 FR 44691", "Seamless Refined Copper Pipe and Tube From the Socialist Republic of Vietnam: Antidumping Duty Order", "2021-08-13", "seamless-refined-copper-pipe-and-tube-from-the-socialist-republic-of-vietnam-antidumping-duty-order"),
    _s("2026-13415", "91 FR 40575", "Seamless Refined Copper Pipe and Tube From Vietnam; Institution of a Five-Year Review", "2026-07-02", "seamless-refined-copper-pipe-and-tube-from-vietnam-institution-of-a-five-year-review", ITC),
    # bearings, aluminum parts
    _s("2024-05938", "89 FR 20163", "Tapered Roller Bearings and Parts Thereof, Finished and Unfinished, From the People's Republic of China: Continuation of the Antidumping Duty Order", "2024-03-21", "tapered-roller-bearings-and-parts-thereof-finished-and-unfinished-from-the-peoples-republic-of-china"),
    _s("2022-23810", "87 FR 66128", "Aluminum Extrusions From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2022-11-02", "aluminum-extrusions-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order-and"),
    # industrial
    _s("2021-01979", "86 FR 7528", "Forged Steel Fluid End Blocks From the Federal Republic of Germany and Italy: Amended Final Antidumping Duty Determination for the Federal Republic of Germany and Antidumping Duty Orders", "2021-01-29", "forged-steel-fluid-end-blocks-from-the-federal-republic-of-germany-and-italy-amended-final"),
    _s("2021-01978", "86 FR 7535", "Forged Steel Fluid End Blocks From China, Germany, India, and Italy: Countervailing Duty Orders, and Amended Final Affirmative Countervailing Duty Determination for China", "2021-01-29", "forged-steel-fluid-end-blocks-from-the-peoples-republic-of-china-the-federal-republic-of-germany"),
    _s("2026-07313", "91 FR 20091", "Forged Steel Fluid End Blocks From the Federal Republic of Germany and Italy: Final Results of the Expedited First Sunset Reviews of the Antidumping Duty Orders", "2026-04-15", "forged-steel-fluid-end-blocks-from-the-federal-republic-of-germany-and-italy-final-results-of-the"),
    _s("2026-07315", "91 FR 20100", "Forged Steel Fluid End Blocks From China, Germany, India, and Italy: Final Results of the Expedited First Sunset Reviews of the Countervailing Duty Orders", "2026-04-15", "forged-steel-fluid-end-blocks-from-the-peoples-republic-of-china-the-federal-republic-of-germany"),
    _s("2026-10933", "91 FR 32438", "Fluid End Blocks From China, Germany, India, and Italy; Scheduling of Full Five-Year Reviews", "2026-06-01", "fluid-end-blocks-from-china-germany-india-and-italy-scheduling-of-full-five-year-reviews", ITC),
    _s("2026-01454", "91 FR 3117", "Slag Pots From the People's Republic of China: Antidumping Duty Order and Countervailing Duty Order", "2026-01-26", "slag-pots-from-the-peoples-republic-of-china-antidumping-duty-order-and-countervailing-duty-order"),
    _s("2024-27426", "89 FR 92624", "Aluminum Lithographic Printing Plates From Japan and the People's Republic of China: Antidumping Order; Aluminum Lithographic Printing Plates From the People's Republic of China: Countervailing Duty Order", "2024-11-22", "aluminum-lithographic-printing-plates-from-japan-and-the-peoples-republic-of-china-antidumping-order"),
    _s("2026-05847", "91 FR 14708", "Aluminum Lithographic Printing Plates From China and Japan (remand proceedings)", "2026-03-26", "aluminum-lithographic-printing-plates-from-china-and-japan", ITC),
    # open investigations
    _s("2026-10516", "91 FR 31406", "Stationary and Portable Air Compressors From the People's Republic of China, Malaysia, and the Socialist Republic of Vietnam: Initiation of Less-Than-Fair-Value Investigations", "2026-05-27", "stationary-and-portable-air-compressors-from-the-peoples-republic-of-china-malaysia-and-the"),
    _s("2026-10526", "91 FR 31425", "Stationary and Portable Air Compressors From the People's Republic of China, Malaysia, and the Socialist Republic of Vietnam: Initiation of Countervailing Duty Investigations", "2026-05-27", "stationary-and-portable-air-compressors-from-the-peoples-republic-of-china-malaysia-and-the"),
    _s("2026-12263", "91 FR 36880", "Air Compressors From China, Malaysia, and Vietnam; Determinations", "2026-06-18", "air-compressors-from-china-malaysia-and-vietnam-determinations", ITC),
    _s("2026-20165", "91 FR 62474", "Stationary and Portable Air Compressors From the People's Republic of China: Preliminary Affirmative Countervailing Duty Determination and Alignment of Final Determination With Final Antidumping Duty Determination", "2026-10-01", "stationary-and-portable-air-compressors-from-the-peoples-republic-of-china-preliminary-affirmative"),
    _s("2026-20166", "91 FR 62468", "Stationary and Portable Air Compressors From Malaysia: Preliminary Affirmative Countervailing Duty Determination and Alignment of Final Determination With Final Antidumping Duty Determination", "2026-10-01", "stationary-and-portable-air-compressors-from-malaysia-preliminary-affirmative-countervailing-duty"),
    _s("2026-20164", "91 FR 62471", "Stationary and Portable Air Compressors From the Socialist Republic of Vietnam: Preliminary Affirmative Countervailing Duty Determination, and Alignment of Final Determination With Final Antidumping Duty Determination", "2026-10-01", "stationary-and-portable-air-compressors-from-the-socialist-republic-of-vietnam-preliminary"),
    _s("2026-18706", "91 FR 58060", "Certain Linear Hydraulic Cylinders and Parts Thereof From Canada, the People's Republic of China, India, the Republic of Korea, and Mexico: Initiation of Less-Than-Fair-Value Investigations", "2026-09-14", "certain-linear-hydraulic-cylinders-and-parts-thereof-from-canada-the-peoples-republic-of-china-india"),
    _s("2026-18707", "91 FR 58067", "Certain Linear Hydraulic Cylinders and Parts Thereof From the People's Republic of China, India, and Mexico: Initiation of Countervailing Duty Investigations", "2026-09-14", "certain-linear-hydraulic-cylinders-and-parts-thereof-from-the-peoples-republic-of-china-india-and"),
]
_IDS = {s["id"] for s in ADCVD_SOURCES}

# (rule id, agency, title, [(label, source id)])
ADCVD_RULES = [
    ("adcvd-engines", "Commerce (ITA) / CBP",
     "Engine AD/CVD orders (China): small vertical shaft engines of 99cc up to 225cc and their subassemblies (8407.90, 8409.91; mounted on mowers or pressure washers under 8433.11 and 8424.30) and large "
     "vertical shaft engines of 225cc to 999cc (8407.90, 8409.91). The large-engine orders were continued in August 2026; Commerce's 2026 sunset findings on the small-engine orders are affirmative and the "
     "ITC's expedited review is pending, so those orders stay in force. Two Zongshen engine models were found in September 2026 to circumvent the small-engine orders. Not in the tariff calculator",
     [("86 FR 23675 (small engine orders)", "fr-2021-09318"), ("91 FR 48369 (small engines AD sunset)", "fr-2026-15473"), ("91 FR 48366 (small engines CVD sunset)", "fr-2026-15566"),
      ("91 FR 50892 (small engines, ITC review)", "fr-2026-16020"), ("91 FR 60587 (small engines circumvention)", "fr-2026-19519"),
      ("91 FR 53844 (large engines continued)", "fr-2026-17031"), ("91 FR 51747 (large engines, ITC vote)", "fr-2026-16302")]),
    ("adcvd-outdoor", "Commerce (ITA) / CBP",
     "Outdoor power equipment AD/CVD orders: walk-behind snow throwers and parts (China, 8430.20, 8431.49), tow-behind lawn groomers and parts (China, AD only; 8432.41, 8432.42, 8432.80, 8432.90, 8479.89, "
     "8479.90), gas-powered pressure washers (China AD/CVD, Vietnam AD; 8424.30, 8424.90). The walk-behind lawn mower orders (China AD/CVD, Vietnam AD; 8433.11) were revoked in September 2026. "
     "Not in the tariff calculator",
     [("87 FR 30448 (snow throwers)", "fr-2022-10789"), ("91 FR 12570 (lawn groomers continued)", "fr-2026-05000"), ("89 FR 9834 (pressure washers, China)", "fr-2024-02902"),
      ("88 FR 73311 (pressure washers, Vietnam)", "fr-2023-23612"), ("91 FR 57132 (lawn mowers revoked)", "fr-2026-18249"), ("91 FR 60414 (lawn mowers, ITC termination)", "fr-2026-19401")]),
    ("adcvd-lifting", "Commerce (ITA) / CBP",
     "Lifting equipment AD/CVD orders: mobile access equipment such as boom and scissor lifts and their subassemblies (China AD/CVD; 8427.10, 8427.20, 8427.90, 8431.20; first sunset review starts November "
     "2026) and lattice boom crawler cranes and crane assemblies (Japan AD, July 2026; 8426.49, 8425.19, 8431.49). Not in the tariff calculator",
     [("87 FR 22190 (mobile access equipment AD)", "fr-2022-08014"), ("86 FR 70439 (mobile access equipment CVD)", "fr-2021-26890"),
      ("90 FR 61373 (mobile access equipment, court remand)", "fr-2025-24034"), ("91 FR 62473 (sunset review notice)", "fr-2026-20159"),
      ("91 FR 46396 (crawler cranes, Japan)", "fr-2026-14950"), ("91 FR 45282 (crawler cranes, ITC vote)", "fr-2026-14597")]),
    ("adcvd-appliances", "Commerce (ITA) / CBP",
     "Appliance AD/CVD orders: large residential washers and parts (China and Mexico AD; 8450.11, 8450.20, 8450.90), kitchen appliance shelving and racks for refrigerators and ovens (China AD/CVD; "
     "8418.99, 8419.90), seamless refined copper pipe and tube that may enter as A/C parts (China, Mexico and Vietnam AD; 8415.90). The Korean washer orders were revoked (2019) and the Thai "
     "refrigerator-freezer investigation was terminated in 2025 without an order. Not in the tariff calculator",
     [("87 FR 52904 (washers, China)", "fr-2022-18611"), ("89 FR 83635 (washers, Mexico)", "fr-2024-23916"), ("84 FR 19763 (washers, Korea revoked)", "fr-2019-09213"),
      ("91 FR 18818 (kitchen appliance racks)", "fr-2026-07107"), ("87 FR 31209 (copper tube, China, Mexico)", "fr-2022-11003"),
      ("86 FR 44691 (copper tube, Vietnam)", "fr-2021-17375"), ("91 FR 40575 (copper tube, Vietnam sunset)", "fr-2026-13415"),
      ("90 FR 24590 (refrigerators, Thailand terminated)", "fr-2025-10633")]),
    ("adcvd-bearings", "Commerce (ITA) / CBP",
     "Bearing AD order: tapered roller bearings and parts, finished and unfinished, from China (8482.20, 8482.91, 8482.99, 8483.20, 8483.30, 8483.90; continued 2024). Not in the tariff calculator",
     [("89 FR 20163 (tapered roller bearings)", "fr-2024-05938")]),
    ("adcvd-aluminum", "Commerce (ITA) / CBP",
     "Aluminum extrusion AD/CVD orders (China) reach extruded aluminum parts that may enter under Chapter 84 provisions (8414.59, 8415.90, 8418.99, 8419.90, 8422.90, 8424.90, 8473.30, 8479.89, 8479.90, "
     "8481.90, 8486.90, 8487.90). Not in the tariff calculator",
     [("87 FR 66128 (aluminum extrusions continued)", "fr-2022-23810")]),
    ("adcvd-industrial", "Commerce (ITA) / CBP",
     "Industrial machinery part AD/CVD orders: forged steel fluid end blocks for pumps (8413.91; AD and CVD on Germany and Italy, CVD on China and India; ITC full sunset review under way), slag pots "
     "(China AD/CVD, January 2026; 8454.20), aluminum lithographic printing plates (China and Japan AD, China CVD; may enter under 8442.50; ITC court-ordered remand under way). Not in the tariff calculator",
     [("86 FR 7528 (fluid end blocks AD)", "fr-2021-01979"), ("86 FR 7535 (fluid end blocks CVD)", "fr-2021-01978"), ("91 FR 20091 (fluid end blocks AD sunset)", "fr-2026-07313"),
      ("91 FR 20100 (fluid end blocks CVD sunset)", "fr-2026-07315"), ("91 FR 32438 (fluid end blocks, ITC review)", "fr-2026-10933"), ("91 FR 3117 (slag pots)", "fr-2026-01454"),
      ("89 FR 92624 (printing plates)", "fr-2024-27426"), ("91 FR 14708 (printing plates, ITC remand)", "fr-2026-05847")]),
    ("adcvd-pending", "Commerce (ITA) / CBP",
     "Open AD/CVD investigations: stationary and portable air compressors from China, Malaysia and Vietnam (8414.80; preliminary CVD findings affirmative, October 2026) and linear hydraulic cylinders "
     "and parts from Canada, China, India, Korea and Mexico (8412.21, 8412.90; CVD on China, India, Mexico; initiated September 2026). Not in the tariff calculator",
     [("91 FR 31406 (air compressors AD initiation)", "fr-2026-10516"), ("91 FR 31425 (air compressors CVD initiation)", "fr-2026-10526"), ("91 FR 36880 (air compressors, ITC preliminary)", "fr-2026-12263"),
      ("91 FR 62474 (air compressors CVD prelim, China)", "fr-2026-20165"), ("91 FR 62468 (air compressors CVD prelim, Malaysia)", "fr-2026-20166"),
      ("91 FR 62471 (air compressors CVD prelim, Vietnam)", "fr-2026-20164"), ("91 FR 58060 (hydraulic cylinders AD initiation)", "fr-2026-18706"),
      ("91 FR 58067 (hydraulic cylinders CVD initiation)", "fr-2026-18707")]),
]
for _r in ADCVD_RULES:
    for _lab, _sid in _r[3]:
        assert _sid in _IDS, _sid

ADCVD_BY_HEADING = {
    "8407": ["adcvd-engines"],
    "8409": ["adcvd-engines"],
    "8412": ["adcvd-pending"],
    "8413": ["adcvd-industrial"],
    "8414": ["adcvd-pending", "adcvd-aluminum"],
    "8415": ["adcvd-appliances", "adcvd-aluminum"],
    "8418": ["adcvd-appliances", "adcvd-aluminum"],
    "8419": ["adcvd-appliances", "adcvd-aluminum"],
    "8422": ["adcvd-aluminum"],
    "8424": ["adcvd-outdoor", "adcvd-engines", "adcvd-aluminum"],
    "8425": ["adcvd-lifting"],
    "8426": ["adcvd-lifting"],
    "8427": ["adcvd-lifting"],
    "8430": ["adcvd-outdoor"],
    "8431": ["adcvd-lifting", "adcvd-outdoor"],
    "8432": ["adcvd-outdoor"],
    "8433": ["adcvd-engines", "adcvd-outdoor"],
    "8442": ["adcvd-industrial"],
    "8450": ["adcvd-appliances"],
    "8454": ["adcvd-industrial"],
    "8473": ["adcvd-aluminum"],
    "8479": ["adcvd-outdoor", "adcvd-aluminum"],
    "8481": ["adcvd-aluminum"],
    "8482": ["adcvd-bearings"],
    "8483": ["adcvd-bearings"],
    "8486": ["adcvd-aluminum"],
    "8487": ["adcvd-aluminum"],
}
for _h, _rs in ADCVD_BY_HEADING.items():
    for _rid in _rs:
        assert _rid in {r[0] for r in ADCVD_RULES}, _rid

ADCVD_BY_COUNTRY = {
    "China": "Chinese vertical shaft engines, snow throwers, lawn groomers, pressure washers, aerial work platforms, washers, kitchen appliance racks, tapered roller bearings, aluminum extrusion parts, fluid end blocks, slag pots and printing plates carry AD/CVD orders (air compressors and hydraulic cylinders under investigation), not shown.",
    "Japan": "Japanese lattice boom crawler cranes and aluminum printing plates carry AD orders, not shown.",
    "Mexico": "Mexican large residential washers and copper tube carry AD orders (hydraulic cylinders under investigation), not shown.",
    "Vietnam": "Vietnamese gas-powered pressure washers and copper tube carry AD orders (air compressors under investigation), not shown.",
    "South Korea": "Korean linear hydraulic cylinders are under AD investigation (the Korean washer orders were revoked in 2019), not shown.",
    "Germany": "German forged steel fluid end blocks carry AD/CVD orders, not shown.",
    "Italy": "Italian forged steel fluid end blocks carry AD/CVD orders, not shown.",
    "India": "Indian forged steel fluid end blocks carry a CVD order (hydraulic cylinders under investigation), not shown.",
    "Malaysia": "Malaysian air compressors are under AD/CVD investigation, not shown.",
    "Canada": "Canadian linear hydraulic cylinders are under AD investigation, not shown.",
}
ADCVD_COUNTRY_SOURCES = {
    "China": ["fr-2026-17031", "fr-2022-08014", "fr-2022-18611", "fr-2024-05938"],
    "Japan": ["fr-2026-14950", "fr-2024-27426"],
    "Mexico": ["fr-2024-23916", "fr-2022-11003", "fr-2026-18706"],
    "Vietnam": ["fr-2023-23612", "fr-2021-17375", "fr-2026-10516"],
    "South Korea": ["fr-2026-18706", "fr-2019-09213"],
    "Germany": ["fr-2026-07313", "fr-2026-07315"],
    "Italy": ["fr-2026-07313", "fr-2026-07315"],
    "India": ["fr-2026-07315", "fr-2026-18706"],
    "Malaysia": ["fr-2026-10516", "fr-2026-20166"],
    "Canada": ["fr-2026-18706"],
}
for _c, _ids in ADCVD_COUNTRY_SOURCES.items():
    for _sid in _ids:
        assert _sid in _IDS, _sid

# Change-log entries (fields of text84.ch()).
ADCVD_CHANGES = [
    dict(id="adcvd-compressors-2026", type="pending", date="2026-10-01", label="Preliminary", title="Air compressor investigations: preliminary subsidy findings",
         detail="Commerce opened antidumping and countervailing duty investigations on stationary and portable air compressors (8414.80) from China, Malaysia and Vietnam in May 2026; the ITC's preliminary "
         "injury vote was affirmative, and on October 1, 2026 Commerce issued affirmative preliminary countervailing duty determinations for all three countries. Final duties depend on the final determinations.",
         before=None, now="Investigation", countries="China, Malaysia, Vietnam", ids=["fr-2026-10516", "fr-2026-10526", "fr-2026-12263", "fr-2026-20165", "fr-2026-20166", "fr-2026-20164"]),
    dict(id="adcvd-small-engines-circ-2026", type="reference", date="2026-09-24", label="Published", title="Two Chinese engine models found to circumvent the small-engine orders",
         detail="Commerce found that Zongshen's 5C65M0 and BC70M0 engine models are later-developed merchandise that circumvents the AD/CVD orders on small vertical shaft engines from China, so they pay those duties.",
         before=None, now="China AD/CVD applies", countries="China", ids=["fr-2026-19519"]),
    dict(id="adcvd-cylinders-2026", type="pending", date="2026-09-14", label="Initiated", title="New investigations: linear hydraulic cylinders",
         detail="Commerce opened antidumping investigations on linear hydraulic cylinders and parts (8412.21, 8412.90) from Canada, China, India, Korea and Mexico, and countervailing duty investigations on China, "
         "India and Mexico. Duties depend on the preliminary and final determinations.",
         before=None, now="Investigation", countries="Canada, China, India, Korea, Mexico", ids=["fr-2026-18706", "fr-2026-18707"]),
    dict(id="adcvd-mowers-2026", type="reference", date="2026-09-08", label="Revoked", title="Walk-behind lawn mower orders revoked",
         detail="Commerce revoked the antidumping and countervailing duty orders on walk-behind lawn mowers from China and the antidumping order on Vietnam (8433.11) because no domestic party took part in the first sunset review; the ITC ended its review.",
         before="AD/CVD orders", now="Revoked", countries="China, Vietnam", ids=["fr-2026-18249", "fr-2026-19401"]),
    dict(id="adcvd-engines-2026", type="reference", date="2026-08-20", label="Published", title="Engine orders: large engines continued, small-engine review pending",
         detail="Commerce continued the AD and CVD orders on large vertical shaft engines of 225cc to 999cc from China (August 20). For small engines of 99cc up to 225cc, Commerce found in July that revocation "
         "would lead to continued dumping and subsidies; the ITC's expedited review was scheduled in August and the orders stay in force meanwhile.",
         before=None, now="Orders continue", countries="China", ids=["fr-2026-17031", "fr-2026-16302", "fr-2026-15473", "fr-2026-15566", "fr-2026-16020"]),
    dict(id="adcvd-cranes-2026", type="extraDuty", date="2026-07-23", label="Published", title="New AD order on lattice boom crawler cranes from Japan",
         detail="Commerce issued an antidumping order on lattice boom crawler cranes from Japan, entered under 8426.49 (crane assemblies also under 8425.19 and 8431.49).",
         before=None, now="AD cash deposits", countries="Japan", ids=["fr-2026-14950", "fr-2026-14597"]),
    dict(id="adcvd-fluid-end-2026", type="reference", date="2026-04-15", label="Published", title="Fluid end block orders: Commerce sunset results",
         detail="Commerce found that revoking the 2021 orders on forged steel fluid end blocks (8413.91) would lead to continued dumping (Germany, Italy) and subsidies (China, Germany, India, Italy); the ITC is "
         "conducting full five-year reviews and the orders stay in force meanwhile.",
         before=None, now="Orders continue during review", countries="China, Germany, India, Italy", ids=["fr-2026-07313", "fr-2026-07315", "fr-2026-10933"]),
    dict(id="adcvd-racks-groomers-2026", type="reference", date="2026-04-13", label="Published", title="Kitchen appliance rack and lawn groomer orders continued",
         detail="Commerce continued the AD/CVD orders on kitchen appliance shelving and racks from China (8418.99, 8419.90; April 13) and the AD order on tow-behind lawn groomers from China (8432; March 16).",
         before=None, now="Orders continue", countries="China", ids=["fr-2026-07107", "fr-2026-05000"]),
    dict(id="adcvd-plates-2026", type="reference", date="2026-03-26", label="Published", title="Printing plate orders on court-ordered ITC remand",
         detail="The ITC opened remand proceedings on its injury determinations for aluminum lithographic printing plates from China and Japan after a court remand; the 2024 orders remain in place pending the outcome.",
         before=None, now="Orders in force", countries="China, Japan", ids=["fr-2026-05847", "fr-2024-27426"]),
    dict(id="adcvd-slagpots-2026", type="extraDuty", date="2026-01-26", label="Published", title="New AD/CVD orders on slag pots from China",
         detail="Commerce issued antidumping and countervailing duty orders on slag pots from China (8454.20 and 7309.00).",
         before=None, now="AD/CVD cash deposits", countries="China", ids=["fr-2026-01454"]),
    dict(id="adcvd-mae-2025", type="reference", date="2025-12-31", label="Published", title="Aerial work platform AD rates amended after court ruling",
         detail="After a final Court of International Trade judgment, Commerce amended its final antidumping determination on mobile access equipment from China; the first sunset review of the orders begins in November 2026.",
         before=None, now="Orders continue", countries="China", ids=["fr-2025-24034", "fr-2026-20159"]),
    dict(id="adcvd-fridges-2025", type="reference", date="2025-06-11", label="Terminated", title="Thai refrigerator-freezer investigation ended without an order",
         detail="Commerce terminated the antidumping investigation on large top-mount combination refrigerator-freezers from Thailand after the petitioner withdrew its petition.",
         before="Investigation", now="No order", countries="Thailand", ids=["fr-2025-10633"]),
]
for _c in ADCVD_CHANGES:
    for _sid in _c["ids"]:
        assert _sid in _IDS, _sid
