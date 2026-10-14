"""Static (non-trade) content for HTS Chapter 25. Imported by fill25.py."""

FR = "https://www.federalregister.gov/documents/"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH25 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2025"
ECFR = "https://www.ecfr.gov/current/"
ECFR_AS_OF = "2026-10-08"
SUGGESTIONS_DATE = "October 12, 2026"


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


EXTRA_SOURCES = [
    # 2025 IEEPA actions and their end
    src("eo-14193", "Federal Register", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14194", "Federal Register", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14231", "Federal Register", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14232", "Federal Register", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    src("eo-14257", "Federal Register", "90 FR 15041", "Executive Order 14257", "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits", "2025-04-02", "2025-04-07", FR + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14323", "Federal Register", "90 FR 37739", "Executive Order 14323", "Addressing Threats to the United States by the Government of Brazil", "2025-07-30", "2025-08-05", FR + "2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil"),
    src("eo-14325", "Federal Register", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-07-31", "2025-08-06", FR + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14326", "Federal Register", "90 FR 37963", "Executive Order 14326", "Further Modifying the Reciprocal Tariff Rates", "2025-07-31", "2025-08-06", FR + "2025/08/06/2025-15010/further-modifying-the-reciprocal-tariff-rates"),
    src("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    src("eo-14389", "Federal Register", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("csms-67834313", "CBP", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    src("procl-11012", "Federal Register", "91 FR 9339", "Proclamation 11012", "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    src("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review", None, "2026-07-01", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    # Section 232 critical minerals (negotiations, no tariff)
    src("procl-11001", "Federal Register", "91 FR 2439", "Proclamation 11001", "Adjusting Imports of Processed Critical Minerals and Their Derivative Products Into The United States", "2026-01-14", "2026-01-20", FR + "2026/01/20/2026-01045/adjusting-imports-of-processed-critical-minerals-and-their-derivative-products-into-the-united"),
    # AD/CVD: active anode material (graphite) from China — no orders
    src("fr-2026-02998", "Federal Register", "91 FR 7247", "Notice (Commerce)", "Active Anode Material From the People's Republic of China: Final Affirmative Determination of Sales at Less Than Fair Value", None, "2026-02-17", FR + "2026/02/17/2026-02998/active-anode-material-from-the-peoples-republic-of-china-final-affirmative-determination-of-sales-at"),
    src("fr-2026-06488", "Federal Register", "91 FR 16968", "Notice (USITC)", "Active Anode Material from China; Determinations", None, "2026-04-03", FR + "2026/04/03/2026-06488/active-anode-material-from-china-determinations"),
    # AD: gray portland cement and clinker from Japan (in force); Mexico (revoked 2009)
    src("fr-2022-21522", "Federal Register", "87 FR 60121", "Notice (Commerce)", "Gray Portland Cement and Cement Clinker From Japan: Final Results of Expedited Sunset Review of the Antidumping Duty Order", None, "2022-10-04", FR + "2022/10/04/2022-21522/gray-portland-cement-and-cement-clinker-from-japan-final-results-of-expedited-sunset-review-of-the"),
    src("fr-2023-02815", "Federal Register", "88 FR 8812", "Notice (Commerce)", "Gray Portland Cement and Cement Clinker From Japan: Continuation of Antidumping Duty Order", None, "2023-02-10", FR + "2023/02/10/2023-02815/gray-portland-cement-and-cement-clinker-from-japan-continuation-of-antidumping-duty-order"),
    src("fr-e9-7692", "Federal Register", "74 FR 15435", "Notice (Commerce)", "Gray Portland Cement and Clinker From Mexico: Final Results of Changed-Circumstances Review, Revocation of Antidumping Duty Order, and Termination of Five-Year (Sunset) Review of Antidumping Duty Order", None, "2009-04-06", FR + "2009/04/06/E9-7692/gray-portland-cement-and-clinker-from-mexico-final-results-of-changed-circumstances-review"),
    # EPA asbestos rule
    src("fr-2024-05972", "Federal Register", "89 FR 21970", "Rule (EPA)", "Asbestos Part 1; Chrysotile Asbestos; Regulation of Certain Conditions of Use Under the Toxic Substances Control Act (TSCA)", None, "2024-03-28", FR + "2024/03/28/2024-05972/asbestos-part-1-chrysotile-asbestos-regulation-of-certain-conditions-of-use-under-the-toxic-substances"),
]

# Chapter notes (HTSUS 2026 Revision 21, Chapter 25)
CHAPTER_NOTES = (
    "**Note 1.** Except where their context or note 4 to this chapter otherwise requires, the headings of this chapter cover only products which are in the crude "
    "state or which have been washed (even with chemical substances eliminating the impurities without changing the structure of the product), crushed, ground, "
    "powdered, levigated, sifted, screened, concentrated by flotation, magnetic separation or other mechanical or physical processes (except crystallization), but not "
    "products which have been roasted, calcined, obtained by mixing or subjected to processing beyond that mentioned in each heading. The products of this chapter may "
    "contain an added anti-dusting agent, provided that such addition does not render the product particularly suitable for a specific use rather than for general use.\n\n"
    "**Note 2.** This chapter does not cover: (a) sublimed sulfur, precipitated sulfur or colloidal sulfur (heading 2802); (b) earth colors containing 70 percent or more "
    "by weight of combined iron evaluated as Fe2O3 (heading 2821); (c) medicaments or other products of chapter 30; (d) perfumery, cosmetic or toilet preparations "
    "(chapter 33); (e) dolomite ramming mix (heading 3816); (f) setts, curbstones or flagstones (heading 6801); mosaic cubes and the like (heading 6802); roofing, "
    "facing or damp course slates (heading 6803); (g) precious or semiprecious stones (heading 7102 or 7103); (h) cultured crystals (other than optical elements) "
    "weighing not less than 2.5 g each, of sodium chloride or of magnesium oxide, of heading 3824; optical elements of sodium chloride or of magnesium oxide (heading "
    "9001); (ij) billiard chalks (heading 9504); or (k) writing or drawing chalks or tailors' chalks (heading 9609).\n\n"
    "**Note 3.** Any products classifiable in heading 2517 and any other heading of the chapter are to be classified in heading 2517.\n\n"
    "**Note 4.** Heading 2530 applies, inter alia, to: vermiculite, perlite and chlorites, unexpanded; earth colors, whether or not calcined or mixed together; natural "
    "micaceous iron oxides; meerschaum (whether or not in polished pieces); amber; agglomerated meerschaum and agglomerated amber, in plates, rods, sticks or similar "
    "forms, not worked after molding; jet; strontianite (whether or not calcined), other than strontium oxide; broken pieces of pottery, brick or concrete.\n\n"
    "**Statistical note 1.** For the purposes of heading 2525: (a) the term \"split block mica\" means mica, not exceeding 0.508 mm in thickness, that has been split "
    "and selected within a tolerance of 0.203 mm, but which has not been cut or stamped to dimensions, shape or form; (b) the term \"mica splittings\" means mica "
    "laminae in book-form or book-pack, or in loose pack, suitable for use in the manufacture of agglomerated (built-up) mica included in heading 6815."
)

EXEMPT_NOTE = "on the 2026 Section 301 exemption list (U.S. note 52(b))"

# label, shortLabel, blurb, search examples
GROUPS = {
    "2501": ("Salt (road, rock, sea and table salt)", "Salt",
             "Rock salt and road (deicing) salt, sea salt, table salt, brine and pure sodium chloride: one line, Free. Salt is not on any exemption list, so the 2026 Section 301 rates apply (Chile, Egypt and the Bahamas 12.5%); USMCA salt from Canada and Mexico is Free. Salt for food or feed needs an FDA prior notice.",
             ["road salt", "rock salt", "sea salt", "table salt", "deicing salt", "sodium chloride", "brine"]),
    "2502": ("Unroasted iron pyrites", "Iron pyrites",
             "Unroasted iron pyrites: one line, Free.",
             ["iron pyrites", "pyrite"]),
    "2503": ("Sulfur (crude and other)", "Sulfur",
             f"Crude or unrefined sulfur and other sulfur (granular, prilled, molten): 2 lines, Free and {EXEMPT_NOTE}. China pays 25% (List 3) and Brazil 25%. Sublimed, precipitated and colloidal sulfur are in heading 2802.",
             ["sulfur", "sulphur", "granular sulfur", "molten sulfur", "elemental sulfur", "crude sulfur"]),
    "2504": ("Natural graphite", "Natural graphite",
             f"Natural flake, powder and other graphite: 3 lines, Free and {EXEMPT_NOTE}. Natural graphite from China pays 25% under Section 301 since January 1, 2026 (9903.91.06). Synthetic (artificial) graphite is heading 3801.",
             ["natural graphite", "flake graphite", "graphite powder", "amorphous graphite", "crystalline flake graphite"]),
    "2505": ("Natural sands (silica, quartz and other sand)", "Natural sand",
             "Silica and quartz sand (including sand with 95% or more silica, used for glass and fracking) and other natural sands: 3 lines, Free. Metal-bearing sands are in chapter 26.",
             ["silica sand", "quartz sand", "frac sand", "construction sand", "natural sand"]),
    "2506": ("Quartz and quartzite", "Quartz",
             "Quartz other than natural sand, and quartzite crude or cut into blocks or slabs: 4 lines, Free. Engineered quartz countertops and slabs are not here (heading 6810).",
             ["quartz", "quartzite", "quartz powder", "quartz lumps"]),
    "2507": ("Kaolin (china clay)", "Kaolin",
             "Kaolin and other kaolinic clays, calcined or not: one line, Free. On Brazil's Section 301 exemption list (U.S. note 50(a)(ii)), not on the 2026 list.",
             ["kaolin", "china clay", "calcined kaolin", "kaolinic clay"]),
    "2508": ("Other clays (bentonite, ball clay, fire-clay)", "Other clays",
             "Bentonite, fire-clay, ball clay and other clays, fuller's earth, andalusite, kyanite, sillimanite, mullite and chamotte: 8 lines, Free. Expanded clays are heading 6806.",
             ["bentonite", "ball clay", "fire clay", "fuller's earth", "kyanite", "mullite", "chamotte"]),
    "2509": ("Chalk", "Chalk",
             "Natural chalk, crude or other: 2 lines, Free. Writing, drawing and billiard chalks are not here (headings 9609 and 9504).",
             ["chalk", "natural chalk", "chalk powder"]),
    "2510": ("Natural calcium phosphates (phosphate rock)", "Phosphate rock",
             f"Natural calcium phosphates and phosphatic chalk, unground or ground: 2 lines, Free and {EXEMPT_NOTE} and Brazil's list. China pays 25% (List 3). Peru is the main supplier.",
             ["phosphate rock", "rock phosphate", "natural calcium phosphate", "apatite"]),
    "2511": ("Barite (barytes) and witherite", "Barite",
             f"Natural barium sulfate (barite) and barium carbonate (witherite): 3 lines. Ground barite is Free, crude barite $1.25/t (2511.10.50), witherite Free. Barite is {EXEMPT_NOTE} and not on China's List 3, so it pays no extra tariff from most countries.",
             ["barite", "barytes", "drilling grade barite", "barium sulfate", "witherite"]),
    "2512": ("Diatomaceous earth (kieselguhr)", "Diatomite",
             "Siliceous fossil meals such as kieselguhr, tripolite and diatomite: one line, Free.",
             ["diatomaceous earth", "diatomite", "kieselguhr", "DE powder"]),
    "2513": ("Pumice, emery, corundum and garnet", "Pumice / abrasives",
             "Pumice stone, emery, natural corundum, natural garnet and other natural abrasives: 4 lines, Free.",
             ["pumice", "pumice stone", "garnet abrasive", "emery", "natural corundum"]),
    "2514": ("Slate (blocks and slabs)", "Slate",
             "Slate, crude or merely cut into blocks or slabs: one line, Free. Roofing and facing slates are heading 6803.",
             ["slate", "slate blocks", "slate slabs"]),
    "2515": ("Marble and travertine (blocks and slabs)", "Marble / travertine",
             "Marble, travertine and other calcareous building stone, crude or merely cut into blocks or slabs: 4 lines. Crude and cut marble are Free; cut travertine and other calcareous stone pay 3%. Polished slabs and tiles are heading 6802.",
             ["marble", "marble blocks", "marble slabs", "travertine", "alabaster"]),
    "2516": ("Granite, sandstone and other building stone", "Granite / sandstone",
             "Granite, porphyry, basalt, sandstone and other monumental or building stone, crude or merely cut into blocks or slabs: 7 lines. Crude stone is Free; cut granite pays 2.8% and cut sandstone and other stone 3%. Polished or worked stone, such as countertops, is heading 6802.",
             ["granite", "granite blocks", "granite slabs", "sandstone", "basalt", "porphyry"]),
    "2517": ("Gravel, crushed stone and macadam", "Gravel / crushed stone",
             "Pebbles, gravel, crushed limestone and other stone for concrete aggregate, road and railway ballast, slag macadam, tarred macadam, and marble or granite granules and powder: 7 lines, Free. By note 3, goods that fit 2517 and another heading go here.",
             ["gravel", "crushed stone", "aggregate", "limestone aggregate", "ballast", "marble chips"]),
    "2518": ("Dolomite", "Dolomite",
             "Dolomite, crude (Free) or calcined or sintered (3%): 2 lines. Dolomite ramming mix is heading 3816.",
             ["dolomite", "calcined dolomite", "dolomite powder"]),
    "2519": ("Magnesite and magnesia", "Magnesite / magnesia",
             f"Natural magnesium carbonate (magnesite), fused and dead-burned magnesia, caustic calcined magnesite and other magnesium oxide: 4 lines, Free. Three of them are {EXEMPT_NOTE} and none is on China's List 3, so Chinese magnesia pays no extra tariff except the 'other' line (2519.90.50, 12.5%).",
             ["magnesite", "dead burned magnesia", "fused magnesia", "caustic calcined magnesia", "magnesium oxide"]),
    "2520": ("Gypsum, anhydrite and plaster", "Gypsum / plaster",
             "Natural gypsum and anhydrite, and plasters of calcined gypsum or calcium sulfate: 2 lines, Free. Gypsum board (drywall) is heading 6809.",
             ["gypsum", "gypsum powder", "anhydrite", "plaster of paris", "gypsum plaster"]),
    "2521": ("Limestone flux and limestone for lime or cement", "Limestone flux",
             "Limestone flux and limestone of a kind used to make lime or cement: one line, Free.",
             ["limestone", "limestone flux", "cement limestone"]),
    "2522": ("Quicklime, slaked (hydrated) lime and hydraulic lime", "Lime",
             "Quicklime, slaked (hydrated) lime and hydraulic lime: 3 lines, Free. Pure calcium oxide and hydroxide are heading 2825.",
             ["quicklime", "hydrated lime", "slaked lime", "hydraulic lime", "burnt lime"]),
    "2523": ("Cement and cement clinker", "Cement",
             "Portland cement (white and gray), aluminous cement, other hydraulic cements and cement clinker: 5 lines, Free. Cement is the largest import in the chapter. Gray portland cement and clinker from Japan are also under a 1991 antidumping order.",
             ["portland cement", "cement", "white cement", "cement clinker", "aluminous cement", "slag cement"]),
    "2524": ("Asbestos", "Asbestos",
             "Crocidolite, amosite, chrysotile and other asbestos: 7 lines, Free. Chrysotile and amosite (2524.90) are on the 2026 Section 301 exemption list; crocidolite (2524.10) is not. EPA bans most chrysotile asbestos imports and requires notice for any other new use.",
             ["asbestos", "chrysotile", "amosite", "crocidolite"]),
    "2525": ("Mica", "Mica",
             "Crude mica, split block mica and splittings, mica powder and mica waste: 5 lines, Free. Crude mica (2525.10) is on Brazil's Section 301 exemption list. Worked and built-up mica are in chapter 68.",
             ["mica", "mica powder", "mica flakes", "mica splittings"]),
    "2526": ("Talc and steatite", "Talc",
             "Natural steatite (soapstone) and talc, crushed or not: 2 lines, Free. Not on China's List 3, so Chinese talc pays only the 12.5% 2026 Section 301 rate.",
             ["talc", "talc powder", "steatite", "soapstone"]),
    "2528": ("Natural borates", "Borates",
             "Natural sodium and calcium borates and their concentrates (not borates separated from natural brine): 3 lines, Free. Refined borax and boric acid are chapter 28.",
             ["borate", "natural borax", "colemanite", "ulexite", "tincal"]),
    "2529": ("Feldspar, nepheline syenite and fluorspar", "Feldspar / fluorspar",
             f"Feldspar, leucite, nepheline syenite and fluorspar (acid and metallurgical grade): 5 lines, Free. Fluorspar (2529.21, 2529.22) is {EXEMPT_NOTE} and not on China's List 3, so no Section 301 duty applies to it from any country.",
             ["fluorspar", "acid grade fluorspar", "metallurgical fluorspar", "feldspar", "nepheline syenite"]),
    "2530": ("Other minerals (vermiculite, perlite, Epsom salts, earth colors)", "Other minerals",
             "Unexpanded vermiculite, perlite and chlorites, kieserite and natural Epsom salts, natural cryolite, micaceous iron oxides (2.9%), celestite, earth colors and other minerals: 8 lines. Most are on the 2026 Section 301 exemption list; vermiculite and perlite (2530.10) are not.",
             ["vermiculite", "perlite", "epsom salt", "kieserite", "earth colors", "celestite", "micaceous iron oxide"]),
}
