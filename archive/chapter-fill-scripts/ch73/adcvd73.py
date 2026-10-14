"""Commerce AD/CVD orders on Chapter 73 goods, by product, with Federal Register sources (FR API html_url, checked 2026-10-13)."""


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
    # pipe and tube
    _s("2024-00397", "89 FR 1877", "Certain Welded Carbon Steel Pipes and Tubes From India, Thailand, and Turkey; Circular Welded Non-Alloy Steel Pipe From Brazil, Mexico, Korea, and Taiwan: Continuation of Antidumping Duty Orders, Continuation of Countervailing Duty Order (Turkey), and Revocation (Brazil)", "2024-01-11", "certain-welded-carbon-steel-pipes-and-tubes-from-india-thailand-and-the-republic-of-turkey-certain"),
    _s("2024-31411", "89 FR 107107", "Circular Welded Carbon-Quality Steel Pipe From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders", "2024-12-31", "circular-welded-carbon-quality-steel-pipe-from-the-peoples-republic-of-china-continuation-of"),
    _s("2022-28406", "87 FR 80524", "Circular Welded Carbon-Quality Steel Pipe From Oman, Pakistan, and the United Arab Emirates: Continuation of Antidumping Duty Orders", "2022-12-30", "circular-welded-carbon-quality-steel-pipe-from-oman-pakistan-and-the-united-arab-emirates"),
    _s("2026-02104", "91 FR 4871", "Circular Welded Carbon Quality Steel Pipe From the People's Republic of China: Final Affirmative Determination of Circumvention of the Antidumping Duty and Countervailing Duty Orders", "2026-02-03", "circular-welded-carbon-quality-steel-pipe-from-the-peoples-republic-of-china-final-affirmative"),
    _s("2025-05926", "90 FR 14963", "Circular Welded Carbon Quality Steel Line Pipe From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2025-04-07", "circular-welded-carbon-quality-steel-line-pipe-from-the-peoples-republic-of-china-continuation-of"),
    _s("2021-13978", "86 FR 34720", "Welded Line Pipe From the Republic of Korea and the Republic of Turkey: Continuation of Antidumping and Countervailing Duty Orders", "2021-06-30", "welded-line-pipe-from-the-republic-of-korea-and-the-republic-of-turkey-continuation-of-antidumping"),
    _s("2026-00784", "91 FR 2097", "Welded Large Diameter Line Pipe From Japan: Continuation of Antidumping Duty Order", "2026-01-16", "welded-large-diameter-line-pipe-from-japan-continuation-of-antidumping-duty-order"),
    _s("2025-08506", "90 FR 20446", "Large Diameter Welded Pipe From Canada, China, Greece, India, Korea, and Türkiye: Continuation of Antidumping Duty and Countervailing Duty Orders", "2025-05-14", "large-diameter-welded-pipe-from-canada-the-peoples-republic-of-china-greece-india-the-republic-of"),
    _s("2026-12570", "91 FR 37388", "Oil Country Tubular Goods From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2026-06-23", "oil-country-tubular-goods-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order"),
    _s("2020-17632", "85 FR 48665", "Oil Country Tubular Goods From India, Korea, Turkey, Ukraine, and Vietnam: Continuation of Antidumping and Countervailing Duty Orders", "2020-08-12", "oil-country-tubular-goods-from-india-the-republic-of-korea-the-republic-of-turkey-ukraine-and-the"),
    _s("2022-25401", "87 FR 70785", "Oil Country Tubular Goods From Argentina, Mexico, and the Russian Federation: Antidumping Duty Orders", "2022-11-21", "oil-country-tubular-goods-from-argentina-mexico-and-the-russian-federation-antidumping-duty-orders"),
    _s("2022-25402", "87 FR 70782", "Oil Country Tubular Goods From the Republic of Korea and the Russian Federation: Countervailing Duty Orders", "2022-11-21", "oil-country-tubular-goods-from-the-republic-of-korea-and-the-russian-federation-countervailing-duty"),
    _s("2026-19879", "91 FR 61439", "Oil Country Tubular Goods From India, South Korea, Turkey, Ukraine, and Vietnam; Determinations", "2026-09-29", "oil-country-tubular-goods-from-india-south-korea-turkey-ukraine-and-vietnam-determinations", ITC),
    _s("2026-03972", "91 FR 9811", "Oil Country Tubular Goods From the People's Republic of China: Final Affirmative Determination of Circumvention of the Antidumping Duty and Countervailing Duty Orders", "2026-02-27", "oil-country-tubular-goods-from-the-peoples-republic-of-china-final-affirmative-determination-of"),
    _s("2026-08196", "91 FR 22806", "Certain Oil Country Tubular Goods from Austria, Taiwan, and the United Arab Emirates: Initiation of Less-Than-Fair-Value Investigations", "2026-04-28", "certain-oil-country-tubular-goods-from-austria-taiwan-and-the-united-arab-emirates-initiation-of"),
    _s("2021-19752", "86 FR 51118", "Seamless Carbon and Alloy Steel Standard, Line and Pressure Pipe From the People's Republic of China: Continuation of Antidumping Duty and Countervailing Duty Orders", "2021-09-14", "seamless-carbon-and-alloy-steel-standard-line-and-pressure-pipe-from-the-peoples-republic-of-china"),
    _s("2026-13489", "91 FR 40980", "Seamless Carbon and Alloy Steel Standard, Line, and Pressure Pipe From the Czech Republic, Korea, Russia, and Ukraine: Final Results of the Expedited First Sunset Reviews of the Antidumping Duty Orders", "2026-07-06", "seamless-carbon-and-alloy-steel-standard-line-and-pressure-pipe-from-the-czech-republic-republic-of"),
    _s("2023-12619", "88 FR 38487", "Carbon and Alloy Seamless Standard, Line and Pressure Pipe (Under 4 1/2 Inches) From Japan and Romania: Continuation of the Antidumping Duty Orders", "2023-06-13", "carbon-and-alloy-seamless-standard-line-and-pressure-pipe-under-412-inches-from-japan-and-romania"),
    _s("2023-18162", "88 FR 57416", "Certain Small Diameter Seamless Carbon and Alloy Standard, Line and Pressure Pipe From Germany: Continuation of Antidumping Duty Order", "2023-08-23", "certain-small-diameter-seamless-carbon-and-alloy-standard-line-and-pressure-pipe-from-germany"),
    _s("2026-17772", "91 FR 56121", "Light-Walled Rectangular Pipe and Tube From China, Mexico, Korea, and Türkiye: Continuation of Antidumping Duty Orders and Countervailing Duty Order", "2026-09-01", "light-walled-rectangular-pipe-and-tube-from-the-peoples-republic-of-china-mexico-the-republic-of"),
    _s("2023-04449", "88 FR 13781", "Light-Walled Welded Rectangular Carbon Steel Tubing From Taiwan: Continuation of Antidumping Duty Order", "2023-03-06", "light-walled-welded-rectangular-carbon-steel-tubing-from-taiwan-continuation-of-antidumping-duty"),
    _s("2022-06929", "87 FR 19068", "Heavy Walled Rectangular Welded Carbon Steel Pipes and Tubes From Korea, Mexico, and Turkey: Continuation of the Antidumping Duty Orders and Countervailing Duty Order", "2022-04-01", "heavy-walled-rectangular-welded-carbon-steel-pipes-and-tubes-from-the-republic-of-korea-mexico-and"),
    _s("2025-09565", "90 FR 22468", "Circular Welded Austenitic Stainless Pressure Pipe From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2025-05-28", "circular-welded-austenitic-stainless-pressure-pipe-from-the-peoples-republic-of-china-continuation"),
    _s("2025-09564", "90 FR 22467", "Welded Stainless Steel Pressure Pipe From Malaysia, Thailand, and Vietnam: Continuation of Antidumping Duty Orders", "2025-05-28", "welded-stainless-steel-pressure-pipe-from-malaysia-thailand-and-the-socialist-republic-of-vietnam"),
    _s("2022-10153", "87 FR 29109", "Welded Stainless Pressure Pipe From India: Continuation of Antidumping and Countervailing Duty Orders", "2022-05-12", "welded-stainless-pressure-pipe-from-india-continuation-of-antidumping-and-countervailing-duty-orders"),
    _s("2022-28381", "87 FR 80154", "Welded ASTM A-312 Stainless Steel Pipe From the Republic of Korea and Taiwan: Continuation of Antidumping Duty Orders", "2022-12-29", "welded-astm-a-312-stainless-steel-pipe-from-the-republic-of-korea-and-taiwan-continuation-of"),
    _s("2026-16193", "91 FR 51462", "Welded Stainless Line and Pressure Pipe From India, Türkiye, and the United Arab Emirates: Initiation of Less-Than-Fair-Value Investigations", "2026-08-10", "welded-stainless-line-and-pressure-pipe-from-india-the-republic-of-trkiye-and-the-united-arab"),
    _s("2024-03684", "89 FR 13687", "Certain Cold-Drawn Mechanical Tubing of Carbon and Alloy Steel From Germany, India, Italy, China, Korea, and Switzerland: Continuation of Antidumping Duty Orders and Countervailing Duty Orders", "2024-02-23", "certain-cold-drawn-mechanical-tubing-of-carbon-and-alloy-steel-from-germany-india-italy-the-peoples"),
    # fittings, cast-iron pipe
    _s("2022-02923", "87 FR 7998", "Certain Carbon Steel Butt-Weld Pipe Fittings From Brazil, Japan, Taiwan, Thailand, and China: Continuation of the Antidumping Duty Orders", "2022-02-11", "certain-carbon-steel-butt-weld-pipe-fittings-from-brazil-japan-taiwan-thailand-and-the-peoples"),
    _s("2023-07636", "88 FR 21979", "Stainless Steel Butt-Weld Pipe Fittings From Italy, Malaysia, and the Philippines: Continuation of Antidumping Duty Orders", "2023-04-12", "stainless-steel-butt-weld-pipe-fittings-from-italy-malaysia-and-the-philippines-continuation-of"),
    _s("2024-02386", "89 FR 8167", "Forged Steel Fittings From the People's Republic of China, Italy, and Taiwan: Continuation of Antidumping and Countervailing Duty Orders", "2024-02-06", "forged-steel-fittings-from-the-peoples-republic-of-china-italy-and-taiwan-continuation-of"),
    _s("2026-07314", "91 FR 20094", "Forged Steel Fittings From India and the Republic of Korea: Final Results of the Expedited First Sunset Reviews of the Antidumping Duty Orders", "2026-04-15", "forged-steel-fittings-from-india-and-the-republic-of-korea-final-results-of-the-expedited-first"),
    _s("2023-23990", "88 FR 74430", "Stainless Steel Flanges From India and the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders", "2023-10-31", "stainless-steel-flanges-from-india-and-the-peopless-republic-of-china-continuation-of-antidumping"),
    _s("2024-26767", "89 FR 90667", "Cast Iron Soil Pipe From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders", "2024-11-18", "cast-iron-soil-pipe-from-the-peoples-republic-of-china-continuation-of-antidumping-and"),
    _s("2024-00329", "89 FR 1541", "Cast Iron Soil Pipe Fittings From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2024-01-10", "cast-iron-soil-pipe-fittings-from-the-peoples-republic-of-china-continuation-of-antidumping-duty"),
    _s("2025-10948", "90 FR 25234", "Malleable Cast Iron Pipe Fittings From the People's Republic of China: Continuation of Antidumping Duty Order", "2025-06-16", "malleable-cast-iron-pipe-fittings-from-the-peoples-republic-of-china-continuation-of-antidumping"),
    _s("2025-00991", "90 FR 4723", "Non-Malleable Cast Iron Pipe Fittings From the People's Republic of China: Continuation of Antidumping Duty Order", "2025-01-16", "non-malleable-cast-iron-pipe-fittings-from-the-peoples-republic-of-china-continuation-of-antidumping"),
    # structures, castings
    _s("2026-05439", "91 FR 13287", "Utility Scale Wind Towers From Canada, Vietnam, Indonesia, and Korea: Continuation of Antidumping and Countervailing Duty Orders", "2026-03-19", "utility-scale-wind-towers-from-canada-the-socialist-republic-of-vietnam-indonesia-and-the-republic"),
    _s("2024-25230", "89 FR 86314", "Utility Scale Wind Towers From China and Vietnam: Continuation of Antidumping Duty Orders and Countervailing Duty Order", "2024-10-30", "utility-scale-wind-towers-from-the-peoples-republic-of-china-and-the-socialist-republic-of-vietnam"),
    _s("2021-26404", "86 FR 69014", "Utility Scale Wind Towers From India and Malaysia: Antidumping Duty Orders", "2021-12-06", "utility-scale-wind-towers-from-india-and-malaysia-antidumping-duty-orders"),
    _s("2021-17406", "86 FR 45707", "Utility Scale Wind Towers From Spain: Antidumping Duty Order", "2021-08-16", "utility-scale-wind-towers-from-spain-antidumping-duty-order"),
    _s("2021-11465", "86 FR 29247", "Steel Grating From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders", "2021-06-01", "steel-grating-from-the-peoples-republic-of-china-continuation-of-antidumping-and-countervailing-duty"),
    _s("2026-09460", "91 FR 27023", "Temporary Steel Fencing From the People's Republic of China: Antidumping Duty Order and Countervailing Duty Order", "2026-05-13", "temporary-steel-fencing-from-the-peoples-republic-of-china-antidumping-duty-order-and-countervailing"),
    _s("2020-05845", "85 FR 16129", "Fabricated Structural Steel From Canada, China, and Mexico (negative final injury determinations)", "2020-03-20", "fabricated-structural-steel-from-canada-china-and-mexico", ITC),
    _s("2022-11864", "87 FR 33710", "Certain Iron Construction Castings From Brazil, Canada, and China: Continuation of Antidumping and Countervailing Duty Orders", "2022-06-03", "certain-iron-construction-castings-from-brazil-canada-and-the-peoples-republic-of-china-continuation"),
    _s("2025-11175", "90 FR 25996", "Certain High Chrome Cast Iron Grinding Media From India: Amended Final Affirmative Antidumping Duty Determination and Antidumping Duty Order; Countervailing Duty Order", "2025-06-18", "certain-high-chrome-cast-iron-grinding-media-from-india-amended-final-affirmative-antidumping-duty"),
    _s("2026-01454", "91 FR 3117", "Slag Pots From the People's Republic of China: Antidumping Duty Order and Countervailing Duty Order", "2026-01-26", "slag-pots-from-the-peoples-republic-of-china-antidumping-duty-order-and-countervailing-duty-order"),
    # wire products, fasteners, springs
    _s("2025-07582", "90 FR 18644", "Certain Steel Nails From the People's Republic of China: Continuation of Antidumping Duty Order", "2025-05-01", "certain-steel-nails-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order"),
    _s("2021-13172", "86 FR 32672", "Certain Steel Nails From Korea, Malaysia, Oman, Taiwan, and Vietnam: Continuation of Antidumping and Countervailing Duty Orders", "2021-06-22", "certain-steel-nails-from-the-republic-of-korea-malaysia-the-sultanate-of-oman-taiwan-and-the"),
    _s("2023-19628", "88 FR 62542", "Certain Steel Nails From the United Arab Emirates: Continuation of Antidumping Duty Order", "2023-09-12", "certain-steel-nails-from-the-united-arab-emirates-continuation-of-antidumping-duty-order"),
    _s("2025-02454", "90 FR 9310", "Steel Wire Garment Hangers From the People's Republic of China: Continuation of Antidumping Duty Order", "2025-02-11", "steel-wire-garment-hangers-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order"),
    _s("2023-22523", "88 FR 70931", "Steel Wire Garment Hangers From Taiwan and Vietnam: Continuation of Antidumping Duty Orders and Countervailing Duty Order", "2023-10-13", "steel-wire-garment-hangers-from-taiwan-and-the-socialist-republic-of-vietnam-continuation-of"),
    _s("2026-11266", "91 FR 33689", "Prestressed Concrete Steel Wire Strand From Brazil, India, Japan, Mexico, Korea, and Thailand: Continuation of Antidumping Duty and Countervailing Duty Orders", "2026-06-04", "prestressed-concrete-steel-wire-strand-from-brazil-india-japan-mexico-the-republic-of-korea-and"),
    _s("2021-02081", "86 FR 7703", "Prestressed Concrete Steel Wire Strand From Argentina, Colombia, Egypt, the Netherlands, Saudi Arabia, Taiwan, Turkey, and the United Arab Emirates: Antidumping Duty Orders", "2021-02-01", "prestressed-concrete-steel-wire-strand-from-argentina-colombia-egypt-the-netherlands-saudi-arabia"),
    _s("2025-11753", "90 FR 27279", "Carbon and Alloy Steel Threaded Rod From India, Taiwan, Thailand, and China: Continuation of Antidumping Duty Orders and Countervailing Duty Order", "2025-06-26", "carbon-and-alloy-steel-threaded-rod-from-india-taiwan-thailand-and-the-peoples-republic-of-china"),
    _s("2021-16982", "86 FR 43525", "Standard Steel Welded Wire Mesh From Mexico: Antidumping Duty Order", "2021-08-09", "standard-steel-welded-wire-mesh-from-mexico-antidumping-duty-order"),
    _s("2026-19436", "91 FR 60414", "Standard Steel Welded Wire Mesh From Mexico; Determinations", "2026-09-23", "standard-steel-welded-wire-mesh-from-mexico-determinations", ITC),
    _s("2026-01282", "91 FR 2911", "Overhead Door Counterbalance Torsion Springs From the People's Republic of China: Antidumping Duty Order and Countervailing Duty Order", "2026-01-23", "overhead-door-counterbalance-torsion-springs-from-the-peoples-republic-of-china-antidumping-duty"),
    _s("2026-04223", "91 FR 10583", "Overhead Door Counterbalance Torsion Springs From India: Antidumping Duty and Countervailing Duty Orders", "2026-03-04", "overhead-door-counterbalance-torsion-springs-from-india-antidumping-duty-and-countervailing-duty"),
    _s("2025-06718", "90 FR 16498", "Uncovered Innerspring Units From China, Vietnam, and South Africa: Continuation of Antidumping Duty Orders", "2025-04-18", "uncovered-innerspring-units-from-the-peoples-republic-of-china-the-socialist-republic-of-vietnam-and"),
    # household, containers, racks
    _s("2025-03860", "90 FR 11720", "Steel Racks and Parts Thereof, From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders", "2025-03-11", "steel-racks-and-parts-thereof-from-the-peoples-republic-of-china-continuation-of-antidumping-and"),
    _s("2026-07107", "91 FR 18818", "Certain Kitchen Appliance Shelving and Racks From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", "2026-04-13", "certain-kitchen-appliance-shelving-and-racks-from-the-peoples-republic-of-china-continuation-of"),
    _s("2026-19852", "91 FR 61439", "Boltless Steel Shelving Units Prepackaged for Sale From China; Determinations", "2026-09-29", "boltless-steel-shelving-units-prepackaged-for-sale-from-china-determinations", ITC),
    _s("2025-12876", "90 FR 30627", "Steel Propane Cylinders From the People's Republic of China and Thailand: Continuation of Antidumping Duty Orders and Countervailing Duty Order", "2025-07-10", "steel-propane-cylinders-from-the-peoples-republic-of-china-and-thailand-continuation-of-antidumping"),
    _s("2024-27170", "89 FR 92095", "Refillable Stainless-Steel Kegs From Mexico and China: Final Results of Sunset Reviews and Revocation of Orders", "2024-11-21", "refillable-stainless-steel-kegs-from-mexico-and-the-peoples-republic-of-china-final-results-of"),
    _s("2024-03376", "89 FR 12824", "Drawn Stainless Steel Sinks From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders", "2024-02-20", "drawn-stainless-steel-sinks-from-the-peoples-republic-of-china-continuation-of-antidumping-and"),
]
_IDS = {s["id"] for s in ADCVD_SOURCES}

# (rule id, agency, title, [(label, source id)])
ADCVD_RULES = [
    ("adcvd-pipe", "Commerce (ITA) / CBP",
     "Pipe and tube AD/CVD orders: circular welded standard pipe (China, India, Korea, Mexico, Oman, Pakistan, Taiwan, Thailand, Türkiye, UAE), welded line pipe (China, Korea, Türkiye; Japan large-diameter), "
     "large-diameter welded pipe (Canada, China, Greece, India, Korea, Türkiye), OCTG (China, India, Korea, Türkiye, Ukraine, Vietnam, Argentina, Mexico, Russia), seamless standard, line and pressure pipe "
     "(China, Czechia, Germany, Japan, Korea, Romania, Russia, Ukraine), light- and heavy-walled rectangular tube (China, Korea, Mexico, Taiwan, Türkiye), welded stainless pressure pipe (China, India, Korea, "
     "Malaysia, Taiwan, Thailand, Vietnam) and cold-drawn mechanical tubing (China, Germany, India, Italy, Korea, Switzerland). New investigations: OCTG from Austria, Taiwan and the UAE; welded stainless "
     "line and pressure pipe from India, Türkiye and the UAE. Not in the tariff calculator",
     [("89 FR 1877 (standard pipe)", "fr-2024-00397"), ("89 FR 107107 (standard pipe, China)", "fr-2024-31411"), ("87 FR 80524 (standard pipe, Oman, Pakistan, UAE)", "fr-2022-28406"),
      ("90 FR 14963 (line pipe, China)", "fr-2025-05926"), ("86 FR 34720 (line pipe, Korea, Türkiye)", "fr-2021-13978"), ("91 FR 2097 (large-diameter line pipe, Japan)", "fr-2026-00784"),
      ("90 FR 20446 (large-diameter welded pipe)", "fr-2025-08506"), ("91 FR 37388 (OCTG, China)", "fr-2026-12570"), ("85 FR 48665 (OCTG, 2014 orders)", "fr-2020-17632"),
      ("91 FR 61439 (OCTG, ITC 2026 sunset vote)", "fr-2026-19879"), ("87 FR 70785 (OCTG, Argentina, Mexico, Russia)", "fr-2022-25401"), ("87 FR 70782 (OCTG CVD, Korea, Russia)", "fr-2022-25402"),
      ("91 FR 22806 (OCTG investigations, 2026)", "fr-2026-08196"), ("86 FR 51118 (seamless pipe, China)", "fr-2021-19752"), ("91 FR 40980 (seamless pipe, 2026 sunset)", "fr-2026-13489"),
      ("88 FR 38487 (seamless pipe, Japan, Romania)", "fr-2023-12619"), ("88 FR 57416 (seamless pipe, Germany)", "fr-2023-18162"), ("91 FR 56121 (light-walled rectangular tube)", "fr-2026-17772"),
      ("88 FR 13781 (rectangular tube, Taiwan)", "fr-2023-04449"), ("87 FR 19068 (heavy-walled rectangular tube)", "fr-2022-06929"), ("90 FR 22468 (stainless pressure pipe, China)", "fr-2025-09565"),
      ("90 FR 22467 (stainless pressure pipe, Malaysia, Thailand, Vietnam)", "fr-2025-09564"), ("87 FR 29109 (stainless pressure pipe, India)", "fr-2022-10153"),
      ("87 FR 80154 (A-312 stainless pipe, Korea, Taiwan)", "fr-2022-28381"), ("91 FR 51462 (welded stainless line pipe investigations, 2026)", "fr-2026-16193"),
      ("89 FR 13687 (cold-drawn mechanical tubing)", "fr-2024-03684")]),
    ("adcvd-fittings", "Commerce (ITA) / CBP",
     "Fitting and cast-iron pipe AD/CVD orders: carbon steel butt-weld fittings (Brazil, China, Japan, Taiwan, Thailand), stainless butt-weld fittings (Italy, Malaysia, Philippines), forged steel fittings "
     "(China, Italy, Taiwan; India and Korea), stainless steel flanges (China, India), cast-iron soil pipe and soil pipe fittings, malleable and non-malleable cast-iron fittings (China). Not in the tariff calculator",
     [("87 FR 7998 (carbon butt-weld fittings)", "fr-2022-02923"), ("88 FR 21979 (stainless butt-weld fittings)", "fr-2023-07636"), ("89 FR 8167 (forged fittings)", "fr-2024-02386"),
      ("91 FR 20094 (forged fittings, India, Korea)", "fr-2026-07314"), ("88 FR 74430 (stainless flanges)", "fr-2023-23990"), ("89 FR 90667 (cast-iron soil pipe)", "fr-2024-26767"),
      ("89 FR 1541 (soil pipe fittings)", "fr-2024-00329"), ("90 FR 25234 (malleable fittings)", "fr-2025-10948"), ("90 FR 4723 (non-malleable fittings)", "fr-2025-00991")]),
    ("adcvd-structures", "Commerce (ITA) / CBP",
     "Structure AD/CVD orders: utility-scale wind towers (Canada, China, India, Indonesia, Korea, Malaysia, Spain, Vietnam), steel grating (China), temporary steel fencing (China, 2026), slag pots (China, 2026). "
     "Fabricated structural steel has no order (ITC negative, 2020). Not in the tariff calculator",
     [("91 FR 13287 (wind towers, 2026)", "fr-2026-05439"), ("89 FR 86314 (wind towers, China, Vietnam)", "fr-2024-25230"), ("86 FR 69014 (wind towers, India, Malaysia)", "fr-2021-26404"),
      ("86 FR 45707 (wind towers, Spain)", "fr-2021-17406"), ("86 FR 29247 (steel grating)", "fr-2021-11465"), ("91 FR 27023 (temporary steel fencing)", "fr-2026-09460"),
      ("91 FR 3117 (slag pots)", "fr-2026-01454"), ("85 FR 16129 (fabricated structural steel, ITC negative)", "fr-2020-05845")]),
    ("adcvd-wire", "Commerce (ITA) / CBP",
     "Wire, fastener and spring AD/CVD orders: steel nails (China, Korea, Malaysia, Oman, Taiwan, UAE, Vietnam), prestressed concrete steel wire strand (22 countries incl. China, India, Japan, Korea, Mexico), "
     "steel threaded rod (China, India, Taiwan, Thailand), standard welded wire mesh (Mexico), overhead door torsion springs (China, India, 2026), uncovered innerspring units (China, South Africa, Vietnam). "
     "Not in the tariff calculator",
     [("90 FR 18644 (nails, China)", "fr-2025-07582"), ("86 FR 32672 (nails, Korea, Malaysia, Oman, Taiwan, Vietnam)", "fr-2021-13172"), ("88 FR 62542 (nails, UAE)", "fr-2023-19628"),
      ("91 FR 33689 (PC strand)", "fr-2026-11266"), ("86 FR 7703 (PC strand, 2021 orders)", "fr-2021-02081"), ("90 FR 27279 (threaded rod)", "fr-2025-11753"),
      ("86 FR 43525 (welded wire mesh, Mexico)", "fr-2021-16982"), ("91 FR 60414 (wire mesh, ITC 2026)", "fr-2026-19436"), ("91 FR 2911 (torsion springs, China)", "fr-2026-01282"),
      ("91 FR 10583 (torsion springs, India)", "fr-2026-04223"), ("90 FR 16498 (innerspring units)", "fr-2025-06718")]),
    ("adcvd-household", "Commerce (ITA) / CBP",
     "Household, container and rack AD/CVD orders: drawn stainless steel sinks (China), steel wire garment hangers (China, Taiwan, Vietnam), steel racks, kitchen appliance shelving and boltless steel shelving (China), "
     "steel propane cylinders (China, Thailand). The stainless keg orders were revoked (China and Mexico in 2024). Not in the tariff calculator",
     [("89 FR 12824 (stainless sinks)", "fr-2024-03376"), ("90 FR 9310 (hangers, China)", "fr-2025-02454"), ("88 FR 70931 (hangers, Taiwan, Vietnam)", "fr-2023-22523"),
      ("90 FR 11720 (steel racks)", "fr-2025-03860"), ("91 FR 18818 (kitchen appliance racks)", "fr-2026-07107"), ("91 FR 61439 (boltless shelving, ITC 2026)", "fr-2026-19852"),
      ("90 FR 30627 (propane cylinders)", "fr-2025-12876"), ("89 FR 92095 (stainless kegs revoked)", "fr-2024-27170")]),
    ("adcvd-castings", "Commerce (ITA) / CBP",
     "Casting AD/CVD orders: iron construction castings such as manhole covers (Brazil, Canada, China), high-chrome cast-iron grinding media (India, 2025). Not in the tariff calculator",
     [("87 FR 33710 (iron construction castings)", "fr-2022-11864"), ("90 FR 25996 (grinding media)", "fr-2025-11175")]),
]
for _r in ADCVD_RULES:
    for _lab, _sid in _r[3]:
        assert _sid in _IDS, _sid

ADCVD_BY_HEADING = {
    "7303": ["adcvd-fittings"],
    "7304": ["adcvd-pipe"],
    "7305": ["adcvd-pipe"],
    "7306": ["adcvd-pipe"],
    "7307": ["adcvd-fittings"],
    "7308": ["adcvd-structures"],
    "7309": ["adcvd-structures"],
    "7311": ["adcvd-household"],
    "7312": ["adcvd-wire"],
    "7314": ["adcvd-wire"],
    "7317": ["adcvd-wire"],
    "7318": ["adcvd-wire"],
    "7320": ["adcvd-wire"],
    "7321": ["adcvd-household"],
    "7323": ["adcvd-household"],
    "7324": ["adcvd-household"],
    "7325": ["adcvd-castings"],
    "7326": ["adcvd-household", "adcvd-structures"],
}

ADCVD_BY_COUNTRY = {
    "China": "Most Chinese pipe and tube, fittings, nails, threaded rod, hangers, racks, sinks, wind towers, grating, fencing, torsion springs and PC strand also carry AD/CVD, not shown.",
    "Canada": "Canadian large-diameter welded pipe, wind towers and iron construction castings carry AD/CVD orders, not shown.",
    "Mexico": "Mexican standard pipe, rectangular tube, OCTG, PC strand and welded wire mesh carry AD/CVD orders, not shown.",
    "South Korea": "Korean standard and line pipe, OCTG, large-diameter, seamless, rectangular and stainless pipe, mechanical tubing, forged fittings, nails, PC strand and wind towers carry AD/CVD orders, not shown.",
    "Taiwan": "Taiwanese standard pipe, rectangular tube, stainless pipe, fittings, nails, hangers, threaded rod and PC strand carry AD orders (OCTG under investigation), not shown.",
    "Vietnam": "Vietnamese OCTG, stainless pressure pipe, nails, hangers, wind towers and innerspring units carry AD/CVD orders, not shown.",
    "India": "Indian standard and stainless pipe, OCTG, large-diameter pipe, mechanical tubing, forged fittings, flanges, threaded rod, PC strand, wind towers, torsion springs and grinding media carry AD/CVD orders, not shown.",
    "Japan": "Japanese line pipe, seamless pipe, butt-weld fittings and PC strand carry AD orders, not shown.",
    "Germany": "German seamless pipe and mechanical tubing carry AD orders, not shown.",
    "Italy": "Italian mechanical tubing, forged fittings, stainless butt-weld fittings and PC strand carry AD orders, not shown.",
    "Thailand": "Thai standard and stainless pipe, butt-weld fittings, threaded rod, PC strand and propane cylinders carry AD orders, not shown.",
    "Brazil": "Brazilian butt-weld fittings, PC strand and iron construction castings carry AD/CVD orders, not shown.",
    "Türkiye": "Turkish standard, line, large-diameter and rectangular pipe, OCTG and PC strand carry AD/CVD orders, not shown.",
    "Malaysia": "Malaysian stainless pressure pipe, stainless butt-weld fittings, nails, PC strand and wind towers carry AD/CVD orders, not shown.",
    "Indonesia": "Indonesian wind towers and PC strand carry AD/CVD orders, not shown.",
    "Spain": "Spanish wind towers and PC strand carry AD orders, not shown.",
}
ADCVD_COUNTRY_SOURCES = {
    "China": ["fr-2024-31411", "fr-2026-12570", "fr-2025-07582"],
    "Canada": ["fr-2025-08506", "fr-2026-05439"],
    "Mexico": ["fr-2024-00397", "fr-2022-25401", "fr-2021-16982"],
    "South Korea": ["fr-2024-00397", "fr-2020-17632"],
    "Taiwan": ["fr-2024-00397", "fr-2021-13172"],
    "Vietnam": ["fr-2020-17632", "fr-2021-13172"],
    "India": ["fr-2024-00397", "fr-2020-17632"],
    "Japan": ["fr-2026-00784", "fr-2023-12619"],
    "Germany": ["fr-2023-18162", "fr-2024-03684"],
    "Italy": ["fr-2024-03684", "fr-2024-02386"],
    "Thailand": ["fr-2024-00397", "fr-2025-09564"],
    "Brazil": ["fr-2022-02923", "fr-2022-11864"],
    "Türkiye": ["fr-2024-00397", "fr-2020-17632"],
    "Malaysia": ["fr-2025-09564", "fr-2021-13172"],
    "Indonesia": ["fr-2026-05439"],
    "Spain": ["fr-2021-17406"],
}

# Change-log entries (fields of text73.ch()).
ADCVD_CHANGES = [
    dict(id="adcvd-octg-2026-09", type="reference", date="2026-09-29", label="Voted", title="ITC keeps the 2014 OCTG orders; boltless shelving orders kept",
         detail="The ITC voted to keep the antidumping orders on oil country tubular goods from India, Korea, Türkiye, Ukraine and Vietnam and the countervailing duty orders on India and Türkiye (Commerce's continuation "
         "notice was not yet published on October 13, 2026), and to keep the orders on boltless steel shelving from China. On September 23 it also voted to keep the welded wire mesh orders on Mexico.",
         before=None, now="Orders continue", countries="India, Korea, Türkiye, Ukraine, Vietnam, China, Mexico", ids=["fr-2026-19879", "fr-2026-19852", "fr-2026-19436"]),
    dict(id="adcvd-lwr-2026", type="reference", date="2026-09-01", label="Published", title="Light-walled rectangular tube orders continued",
         detail="Commerce continued the antidumping orders on light-walled rectangular pipe and tube (7306.61) from China, Mexico, Korea and Türkiye and the countervailing duty order on China.",
         before=None, now="Orders continue", countries="China, Mexico, Korea, Türkiye", ids=["fr-2026-17772"]),
    dict(id="adcvd-stainless-line-2026", type="pending", date="2026-08-10", label="Initiated", title="New investigations: welded stainless line and pressure pipe",
         detail="Commerce opened antidumping investigations on welded stainless line and pressure pipe from India, Türkiye and the UAE (and countervailing duty investigations on India and Türkiye); the ITC's "
         "preliminary injury vote in September was affirmative. Duties depend on the preliminary and final determinations.",
         before=None, now="Investigation", countries="India, Türkiye, UAE", ids=["fr-2026-16193"]),
    dict(id="adcvd-seamless-2026", type="reference", date="2026-07-06", label="Published", title="Seamless pipe orders: Commerce sunset results",
         detail="Commerce found that revoking the 2021 antidumping orders on seamless carbon and alloy standard, line and pressure pipe from Czechia, Korea, Russia and Ukraine would lead to continued dumping; the ITC's full review is under way.",
         before=None, now="Orders continue during review", countries="Czechia, Korea, Russia, Ukraine", ids=["fr-2026-13489"]),
    dict(id="adcvd-octg-china-2026", type="reference", date="2026-06-23", label="Published", title="OCTG from China orders continued; PC strand orders continued",
         detail="Commerce continued the 2010 antidumping and countervailing duty orders on oil country tubular goods from China (June 23) and the orders on prestressed concrete steel wire strand from Brazil, India, "
         "Japan, Mexico, Korea and Thailand (June 4).",
         before=None, now="Orders continue", countries="China, Brazil, India, Japan, Mexico, Korea, Thailand", ids=["fr-2026-12570", "fr-2026-11266"]),
    dict(id="adcvd-fencing-2026", type="reference", date="2026-05-13", label="Published", title="New AD/CVD orders on temporary steel fencing from China",
         detail="Commerce issued antidumping and countervailing duty orders on temporary steel fencing from China, entered mainly under 7308.90.95, 7326.90.86 and 7323.99.90.",
         before=None, now="AD/CVD cash deposits", countries="China", ids=["fr-2026-09460"]),
    dict(id="adcvd-octg-new-2026", type="pending", date="2026-04-28", label="Initiated", title="New OCTG investigations on Austria, Taiwan and the UAE",
         detail="Commerce opened antidumping investigations on oil country tubular goods from Austria, Taiwan and the UAE and a countervailing duty investigation on Austria; the ITC's preliminary vote was "
         "affirmative and Commerce's preliminary subsidy finding on Austria (September 2026) was affirmative.",
         before=None, now="Investigation", countries="Austria, Taiwan, UAE", ids=["fr-2026-08196"]),
    dict(id="adcvd-towers-2026", type="reference", date="2026-03-19", label="Published", title="Wind tower orders continued",
         detail="Commerce continued the 2020 antidumping and countervailing duty orders on utility-scale wind towers (7308.20) from Canada, Indonesia, Korea and Vietnam.",
         before=None, now="Orders continue", countries="Canada, Indonesia, Korea, Vietnam", ids=["fr-2026-05439"]),
    dict(id="adcvd-springs-2026", type="reference", date="2026-03-04", label="Published", title="New AD/CVD orders on overhead door torsion springs",
         detail="Commerce issued antidumping and countervailing duty orders on overhead door counterbalance torsion springs (7320.20) from China (January 23, 2026) and India (March 4, 2026).",
         before=None, now="AD/CVD cash deposits", countries="China, India", ids=["fr-2026-01282", "fr-2026-04223"]),
    dict(id="adcvd-circumvention-2026", type="reference", date="2026-02-27", label="Published", title="Circumvention findings on Chinese pipe finished in Oman and Thailand",
         detail="Commerce found that circular welded pipe finished in Oman from Chinese hot-rolled steel (February 3) and seamless OCTG finished in Thailand from Chinese billets (February 27) circumvent the China orders, so those imports pay the China AD/CVD deposits.",
         before=None, now="China AD/CVD applies", countries="China, Oman, Thailand", ids=["fr-2026-02104", "fr-2026-03972"]),
    dict(id="adcvd-slagpots-2026", type="reference", date="2026-01-26", label="Published", title="New AD/CVD orders on slag pots from China",
         detail="Commerce issued antidumping and countervailing duty orders on slag pots from China (7309.00.00.90 and 8454.20).",
         before=None, now="AD/CVD cash deposits", countries="China", ids=["fr-2026-01454"]),
    dict(id="adcvd-2025-continuations", type="reference", date="2025-07-10", label="Published", title="2025 sunset reviews keep pipe, nail, hanger, rack and cylinder orders",
         detail="Commerce continued the orders on steel wire garment hangers from China (February), steel racks from China (March), welded line pipe from China (April), steel nails from China (May), large-diameter "
         "welded pipe from six countries (May), stainless pressure pipe from China, Malaysia, Thailand and Vietnam (May), threaded rod from four countries (June) and steel propane cylinders from China and Thailand (July).",
         before=None, now="Orders continue", countries="China, Canada, Greece, India, Korea, Malaysia, Taiwan, Thailand, Türkiye, Vietnam",
         ids=["fr-2025-02454", "fr-2025-03860", "fr-2025-05926", "fr-2025-07582", "fr-2025-08506", "fr-2025-09565", "fr-2025-09564", "fr-2025-11753", "fr-2025-12876"]),
    dict(id="adcvd-grinding-2025", type="reference", date="2025-06-18", label="Published", title="New AD/CVD orders on high-chrome grinding media from India",
         detail="Commerce issued antidumping and countervailing duty orders on high-chrome cast-iron grinding media (7325.91) from India.",
         before=None, now="AD/CVD cash deposits", countries="India", ids=["fr-2025-11175"]),
]
