# Static (non-trade) content for Chapter 38. Imported by fill38.py.
FR = "https://www.federalregister.gov/documents/"
HTS_NOW = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH38 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2038"
ECFR = "https://www.ecfr.gov/current/"


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


EXTRA_SOURCES = [
    # ---- IEEPA (ended), Section 122 (expired), USMCA
    src("eo-14193", "Federal Register", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14194", "Federal Register", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14231", "Federal Register", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14232", "Federal Register", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    src("eo-14325", "Federal Register", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-07-31", "2025-08-06", FR + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14257", "Federal Register", "90 FR 15041", "Executive Order 14257", "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits", "2025-04-02", "2025-04-07", FR + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14389", "Federal Register", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("csms-67834313", "CBP", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    src("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    src("procl-11012", "Federal Register", "91 FR 9339", "Proclamation 11012", "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    src("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review", None, "2026-07-01", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    # ---- HTS editions / change records
    src("procl-10326", "Federal Register", "86 FR 73593", "Proclamation 10326", "To Modify the Harmonized Tariff Schedule of the United States and for Other Purposes", "2021-12-23", "2021-12-28", FR + "2021/12/28/2021-28334/to-modify-the-harmonized-tariff-schedule-of-the-united-states-and-for-other-purposes"),
    src("hts-cr-2026r2", "USITC", "HTSUS 2026 Revision 2 Change Record", "Change Record", "Harmonized Tariff Schedule of the United States (2026 Revision 2), Change Record", None, "2026-02-01", "https://hts.usitc.gov/reststop/file?release=2026HTSRev2&filename=Change%20Record"),
    src("hts-cr-2026r11", "USITC", "HTSUS 2026 Revision 11 Change Record", "Change Record", "Harmonized Tariff Schedule of the United States (2026 Revision 11), Change Record", None, "2026-07-01", "https://hts.usitc.gov/reststop/file?release=2026HTSRev11&filename=Change%20Record"),
    # ---- China Section 301
    src("fr-2025-21671", "Federal Register", "90 FR 55232", "Notice (USTR)", "Notice of Product Exclusion Extensions: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation", None, "2025-12-01", FR + "2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology"),
    src("fr-2026-08806", "Federal Register", "91 FR 24636", "Notice (USTR)", "Initiation of Second Four-Year Review Process: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation", None, "2026-05-06", FR + "2026/05/06/2026-08806/initiation-of-second-four-year-review-process-chinas-acts-policies-and-practices-related-to"),
    # ---- Fuel programs (biodiesel)
    src("fr-2026-06275", "Federal Register", "91 FR 16388", "Final rule (EPA)", "Renewable Fuel Standard (RFS) Program: Standards for 2026 and 2027, Partial Waiver of 2025 Cellulosic Biofuel Volume Requirement, and Other Changes", None, "2026-04-01", FR + "2026/04/01/2026-06275/renewable-fuel-standard-rfs-program-standards-for-2026-and-2027-partial-waiver-of-2025-cellulosic"),
    src("irs-45z", "IRS", "IRS: Clean Fuel Production Credit", "Agency guidance page", "Clean Fuel Production Credit (section 45Z)", None, "2026-03-16", "https://www.irs.gov/credits-deductions/clean-fuel-production-credit"),
    src("irs-p510", "IRS", "IRS Publication 510 (12/2025)", "Publication", "Publication 510, Excise Taxes (Including Fuel Tax Credits and Refunds)", None, "2025-12-01", "https://www.irs.gov/publications/p510"),
]

CHAPTER_NOTES = (
    "**Note 1.** This chapter does not cover: (a) separate chemically defined elements or compounds, except (1) artificial graphite (heading 3801); "
    "(2) insecticides, rodenticides, fungicides, herbicides, anti-sprouting products and plant-growth regulators, disinfectants and similar products put up "
    "as described in heading 3808; (3) products put up as charges for fire-extinguishers or in fire-extinguishing grenades (heading 3813); (4) certified "
    "reference materials specified in note 2; (5) products specified in note 3(a) or 3(c); (b) mixtures of chemicals with foodstuffs or other substances "
    "with nutritive value, of a kind used in the preparation of human foodstuffs (generally heading 2106); (c) products of heading 2404; (d) slag, ash and "
    "residues containing metals, arsenic or their mixtures and meeting note 3(a) or 3(b) to chapter 26 (heading 2620); (e) medicaments (heading 3003 or "
    "3004); or (f) spent catalysts of a kind used for extracting base metals or making their compounds (heading 2620) or for recovering precious metal "
    "(heading 7112), and catalysts consisting of metals or metal alloys in the form of, for example, finely divided powder or woven gauze (section XIV or XV).\n\n"
    "**Note 2.** (a) For heading 3822, \"certified reference materials\" are reference materials accompanied by a certificate stating the values of the "
    "certified properties, the methods used to determine them and the degree of certainty of each value, and suitable for analytical, calibrating or "
    "referencing purposes. (b) Except for products of chapter 28 or 29, heading 3822 takes precedence over any other heading for certified reference materials.\n\n"
    "**Note 3.** Heading 3824 includes, and no other heading covers: (a) cultured crystals (other than optical elements) weighing not less than 2.5 g each, "
    "of magnesium oxide or of the halides of the alkali or alkaline-earth metals; (b) fusel oil and Dippel's oil; (c) ink removers put up for retail sale; "
    "(d) stencil correctors, other correcting fluids and correction tapes (other than those of heading 9612), put up for retail sale; and (e) fusible ceramic "
    "firing testers (for example, Seger cones).\n\n"
    "**Note 4.** \"Municipal waste\" means waste collected from households, hotels, restaurants, hospitals, shops, offices and the like, road and pavement "
    "sweepings, and construction and demolition waste. It does not cover (a) materials or articles segregated from the waste (plastics, rubber, wood, paper, "
    "textiles, glass, metals, electrical and electronic waste and scrap, including spent batteries), which go in their own headings; (b) industrial waste; "
    "(c) waste pharmaceuticals (note 4(k) to chapter 30); or (d) clinical waste (note 6(a)).\n\n"
    "**Note 5.** For heading 3825, \"sewage sludge\" is sludge from urban effluent treatment plants, including pre-treatment waste, scourings and "
    "unstabilized sludge. Stabilized sludge suitable for use as fertilizer is excluded (chapter 31).\n\n"
    "**Note 6.** For heading 3825, \"other wastes\" means (a) clinical waste — contaminated waste from medical research, diagnosis, treatment or other "
    "medical, surgical, dental or veterinary procedures; (b) waste organic solvents; (c) wastes of metal pickling liquors, hydraulic fluids, brake fluids and "
    "anti-freezing fluids; and (d) other wastes from the chemical or allied industries. It does not cover wastes containing mainly petroleum oils or oils "
    "obtained from bituminous materials (heading 2710).\n\n"
    "**Note 7.** For heading 3826, \"biodiesel\" means mono-alkyl esters of fatty acids of a kind used as a fuel, derived from animal, vegetable or "
    "microbial fats and oils, whether or not used.\n\n"
    "**Subheading note 1.** Subheadings 3808.52 and 3808.59 cover only goods of heading 3808 containing one or more of: alachlor; aldicarb; aldrin; "
    "azinphos-methyl; binapacryl; camphechlor (toxaphene); captafol; carbofuran; chlordane; chlordimeform; chlorobenzilate; DDT; dieldrin; DNOC or its salts; "
    "dinoseb, its salts or esters; endosulfan; ethylene dibromide; ethylene dichloride; fluoroacetamide; heptachlor; hexachlorobenzene; HCH, including "
    "lindane; mercury compounds; methamidophos; monocrotophos; oxirane (ethylene oxide); parathion; parathion-methyl; pentachlorophenol, its salts or esters; "
    "perfluorooctane sulphonic acid and its salts; perfluorooctane sulphonamides; perfluorooctane sulphonyl fluoride; phosphamidon; 2,4,5-T, its salts or "
    "esters; tributyltin compounds; trichlorfon. (2026 Revision 21 deleted, as an erratum, a sentence that also placed dustable powder formulations of "
    "benomyl, carbofuran and thiram in 3808.59.)\n\n"
    "**Subheading note 2.** Subheadings 3808.61 to 3808.69 cover only goods of heading 3808 containing alpha-cypermethrin, bendiocarb, bifenthrin, "
    "chlorfenapyr, cyfluthrin, deltamethrin, etofenprox, fenitrothion, lambda-cyhalothrin, malathion, pirimiphos-methyl or propoxur.\n\n"
    "**Subheading note 3.** Subheadings 3824.81 to 3824.89 cover only mixtures and preparations containing one or more of: oxirane (ethylene oxide); PBBs; "
    "PCBs; PCTs; tris(2,3-dibromopropyl) phosphate; aldrin; camphechlor (toxaphene); chlordane; chlordecone; DDT; dieldrin; endosulfan; endrin; heptachlor; "
    "mirex; HCH, including lindane; pentachlorobenzene; hexachlorobenzene; perfluorooctane sulphonic acid and its salts; perfluorooctane sulphonamides; "
    "perfluorooctane sulphonyl fluoride; tetra-, penta-, hexa-, hepta- or octabromodiphenyl ethers; short-chain chlorinated paraffins (C10–C13, more than "
    "48% chlorine by weight).\n\n"
    "**Subheading note 4.** For subheadings 3825.41 and 3825.49, \"waste organic solvents\" are wastes containing mainly organic solvents, not fit for "
    "further use as presented as primary products, whether or not intended for recovery of the solvents.\n\n"
    "**Statistical notes.** (1) Hand sanitizer reported under 3808.94.5080 must meet U.S. Food and Drug Administration requirements for disinfecting hand "
    "sanitizers. (2) 3818.00.0040 covers doped monocrystalline silicon wafers, round (circular), of a kind used for semiconductor fabrication, typically made "
    "to SEMI M1 standards. (3) 3818.00.0045 covers doped monocrystalline silicon wafers, pseudo-square or rectangular, of a kind used in solar photovoltaic "
    "cells. (4) For heading 3824, \"biodiesel\" means fatty acid esters of a kind used as fuel, derived from animal or vegetable fats and oils, whether or not used."
)

# heading -> label, short label, blurb, search examples
GROUPS = {
    "3801": ("Artificial graphite & carbon pastes", "Graphite", "Artificial graphite, colloidal graphite, carbonaceous electrode pastes and other carbon preparations: 7 lines, Free to 4.9%. Includes spherical graphite (3801.10.50.10) and silicon-containing active anode material for batteries (3801.90.00.10, split out February 1, 2026).", ["artificial graphite", "synthetic graphite", "spherical graphite", "anode material", "graphite powder", "electrode paste"]),
    "3802": ("Activated carbon", "Activated carbon", "Activated carbon from coal, coconut or other sources, bone black and activated clays: 6 lines, 2.5% to 5.8%.", ["activated carbon", "activated charcoal", "coconut shell activated carbon", "granular activated carbon", "bone char"]),
    "3803": ("Tall oil", "Tall oil", "Crude or refined tall oil from kraft pulping: 1 line, Free.", ["tall oil", "crude tall oil"]),
    "3804": ("Lignin sulfonates & wood-pulp lyes", "Lignosulfonates", "Residual lyes from wood-pulp manufacture: lignin sulfonic acid and its salts are Free, other lyes 3.7%. Tall oil is 3803.", ["lignosulfonate", "lignin sulfonate", "black liquor"]),
    "3805": ("Turpentine & pine oil", "Turpentine", "Gum, wood or sulfate turpentine (5%), pine oil (Free) and other terpenic oils (3.7%): 3 lines.", ["turpentine", "pine oil", "sulfate turpentine", "dipentene"]),
    "3806": ("Rosin & ester gums", "Rosin", "Gum rosin and other rosin and resin acids (5%), rosin salts (3.7%), ester gums (6.5%) and other rosin derivatives (4.2%): 5 lines.", ["rosin", "gum rosin", "ester gum", "rosin ester"]),
    "3807": ("Wood tar & brewers' pitch", "Wood tar", "Wood tar, wood tar oils, wood creosote, wood naphtha, vegetable pitch and brewers' pitch: 1 line, 0.1%.", ["wood tar", "pine tar", "wood creosote"]),
    "3808": ("Pesticides, herbicides & disinfectants", "Pesticides", "Insecticides, fungicides, herbicides (glyphosate, glufosinate), plant-growth regulators, rodenticides, disinfectants and alcohol hand sanitizer (3808.94.50.80): 38 lines, Free to 6.5%. Pesticides also need EPA registration and a Notice of Arrival before the shipment lands.", ["pesticide", "insecticide", "herbicide", "glyphosate", "fungicide", "disinfectant", "hand sanitizer"]),
    "3809": ("Textile, paper & leather finishing agents", "Finishing agents", "Finishing agents, dye carriers and mordants for the textile, paper and leather industries: 6 lines, 6% to 6.5% (starch-based: 2.2¢/kg + 3%).", ["textile finishing agent", "dye carrier", "sizing agent", "leather finishing"]),
    "3810": ("Pickling preparations & soldering fluxes", "Fluxes", "Metal pickling preparations, soldering and welding powders and pastes, and fluxes: 4 lines, Free to 6.5%.", ["soldering flux", "solder paste", "welding flux", "pickling paste"]),
    "3811": ("Fuel & lubricant additives", "Additives", "Antiknock preparations, oxidation inhibitors, viscosity improvers, anti-corrosives and other additives for fuel and lubricating oils: 6 lines, Free to 6.5%.", ["lubricant additive", "oil additive", "fuel additive", "antiknock", "corrosion inhibitor"]),
    "3812": ("Rubber accelerators, plasticizers & stabilizers", "Rubber chemicals", "Prepared rubber accelerators, compound plasticizers and antioxidant or stabilizer preparations for rubber or plastics (e.g. TMQ): 10 lines, Free to 6.5%.", ["rubber accelerator", "plasticizer", "antioxidant", "TMQ", "UV stabilizer"]),
    "3813": ("Fire-extinguisher charges", "Fire extinguishers", "Preparations and charges for fire extinguishers and charged extinguishing grenades: 2 lines, Free (wholly inorganic) or 3.7%.", ["fire extinguisher powder", "fire extinguishing agent", "foam concentrate"]),
    "3814": ("Solvents, thinners & paint removers", "Solvents", "Composite organic solvents and thinners, paint and varnish removers: 4 lines, 6% to 6.5%.", ["paint thinner", "lacquer thinner", "solvent", "paint remover"]),
    "3815": ("Catalysts", "Catalysts", "Supported catalysts with nickel, precious metals (platinum-group split out February 1, 2026) or other active substances, and other catalytic preparations: 8 lines, Free to 6.5%.", ["catalyst", "nickel catalyst", "platinum catalyst", "zeolite catalyst"]),
    "3816": ("Refractory cements & mortars", "Refractories", "Refractory cements, mortars, castables and dolomite ramming mix: 3 lines, Free or 3%.", ["refractory cement", "refractory mortar", "castable refractory"]),
    "3817": ("Mixed alkylbenzenes (LAB)", "Alkylbenzenes", "Mixed linear alkylbenzenes (LAB) and other alkylbenzenes and alkylnaphthalenes: 3 lines, all 6.5%.", ["linear alkylbenzene", "LAB", "alkylbenzene"]),
    "3818": ("Doped silicon wafers & electronic chemicals", "Wafers", "Doped silicon, silicon carbide and gallium arsenide wafers and other doped elements and compounds for electronics: 7 lines, all Free. Chinese wafers pay 50% under Section 301; wafers are exempt from the 2026 Section 301 tariffs on other countries.", ["silicon wafer", "solar wafer", "semiconductor wafer", "SiC wafer", "gallium arsenide wafer"]),
    "3819": ("Brake & hydraulic fluids", "Brake fluid", "Hydraulic brake fluids and other hydraulic transmission liquids with less than 70% petroleum oil: 2 lines, 6.5%.", ["brake fluid", "DOT 4 brake fluid", "hydraulic fluid"]),
    "3820": ("Antifreeze & deicing fluids", "Antifreeze", "Antifreezing preparations and prepared deicing fluids (engine coolant, aircraft deicer): 1 line, 6.5%.", ["antifreeze", "coolant", "deicing fluid"]),
    "3821": ("Culture media", "Culture media", "Prepared culture media for micro-organisms, including viral transport media: 2 lines, 5%.", ["culture media", "viral transport media", "agar media"]),
    "3822": ("Diagnostic & laboratory reagents", "Lab reagents", "Diagnostic and laboratory reagents on a backing or prepared (test kits, reagent strips) and certified reference materials: 8 lines, all Free.", ["diagnostic reagent", "test kit", "laboratory reagent", "reference material"]),
    "3823": ("Industrial fatty acids & fatty alcohols", "Fatty acids", "Stearic and oleic acid (2.1¢/kg plus 3.8% or 3.2%), tall oil fatty acids, palm and coconut fatty acids and fatty acid distillates, acid oils, and industrial fatty alcohols: 9 lines. Several are exempt from the 2026 Section 301 duty for the EU, Malaysia, Indonesia and others, and pay 50% from Canada under Section 338.", ["stearic acid", "oleic acid", "fatty acid", "palm fatty acid distillate", "fatty alcohol", "tall oil fatty acid"]),
    "3824": ("Other chemical preparations (n.e.s.)", "Other preparations", "The catch-all heading: foundry binders, concrete admixtures, sorbitol, mixtures containing listed persistent pollutants, cultured crystals, cathode-material mixtures, fatty acid ester mixtures and other chemical preparations: 48 lines, Free to 6.5%.", ["chemical preparation", "concrete admixture", "sorbitol", "NMC cathode", "fatty acid ester mixture", "hs code 3824.99"]),
    "3825": ("Chemical, municipal & clinical waste", "Waste", "Municipal waste, sewage sludge, clinical waste, waste solvents and other chemical-industry waste: 9 lines, all Free.", ["municipal waste", "sewage sludge", "clinical waste", "waste solvent"]),
    "3826": ("Biodiesel", "Biodiesel", "Biodiesel (B100) at 4.6% and blends with less than 70% petroleum oil at 6.5%: 2 lines. Imported biodiesel does not earn the U.S. clean fuel production credit, and must meet EPA fuel and Renewable Fuel Standard rules.", ["biodiesel", "B100", "FAME", "biodiesel blend", "B99"]),
    "3827": ("Refrigerant & other halogenated blends", "Refrigerant blends", "Mixtures of halogenated methane, ethane or propane derivatives — HFC refrigerant blends such as R-410A, R-404A and R-407C, HCFC and CFC blends, halons: 20 lines, 3.7% or 6.5%. Bulk HFC imports need EPA allowances.", ["refrigerant blend", "R-410A", "R-404A", "R-407C", "HFC blend", "refrigerant gas"]),
}
