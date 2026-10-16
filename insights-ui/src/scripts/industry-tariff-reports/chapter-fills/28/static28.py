"""Static (non-trade) sources and chapter notes for HTS Chapter 28. Imported by fill28.py."""

FR = "https://www.federalregister.gov/documents/"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH28 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2028"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
ECFR = "https://www.ecfr.gov/current/"
SUGGESTIONS_DATE = "October 12, 2026"


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


EXTRA_SOURCES = [
    # 2025 IEEPA actions and their end
    src("eo-14193", "Federal Register", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14194", "Federal Register", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"),
    src("eo-14195", "Federal Register", "90 FR 9121", "Executive Order 14195", "Imposing Duties To Address the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-02-01", "2025-02-07", FR + "2025/02/07/2025-02408/imposing-duties-to-address-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    src("eo-14228", "Federal Register", "90 FR 11463", "Executive Order 14228", "Further Amendment to Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-03-03", "2025-03-07", FR + "2025/03/07/2025-03775/further-amendment-to-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of"),
    src("eo-14231", "Federal Register", "90 FR 11785", "Executive Order 14231", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03990/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14232", "Federal Register", "90 FR 11787", "Executive Order 14232", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Southern Border", "2025-03-06", "2025-03-11", FR + "2025/03/11/2025-03991/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-southern-border"),
    src("eo-14257", "Federal Register", "90 FR 15041", "Executive Order 14257", "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits", "2025-04-02", "2025-04-07", FR + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    src("eo-14323", "Federal Register", "90 FR 37739", "Executive Order 14323", "Addressing Threats to the United States by the Government of Brazil", "2025-07-30", "2025-08-05", FR + "2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil"),
    src("eo-14325", "Federal Register", "90 FR 37957", "Executive Order 14325", "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-07-31", "2025-08-06", FR + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    src("eo-14326", "Federal Register", "90 FR 37963", "Executive Order 14326", "Further Modifying the Reciprocal Tariff Rates", "2025-07-31", "2025-08-06", FR + "2025/08/06/2025-15010/further-modifying-the-reciprocal-tariff-rates"),
    src("eo-14357", "Federal Register", "90 FR 50725", "Executive Order 14357", "Modifying Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "2025-11-04", "2025-11-07", FR + "2025/11/07/2025-19825/modifying-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"),
    src("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    src("eo-14389", "Federal Register", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03832/ending-certain-tariff-actions"),
    src("csms-67834313", "CBP", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    src("procl-11012", "Federal Register", "91 FR 9339", "Proclamation 11012", "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25", FR + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    src("ustr-usmca-review", "USTR", "USTR press release", "Statement", "Ambassador Greer Issues Statement on the USMCA Joint Review", None, "2026-07-01", "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"),
    # China Section 301 product exclusions (sodium metal)
    src("fr-2025-21671", "Federal Register", "90 FR 55232", "Notice (USTR)", "Notice of Product Exclusion Extensions: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation", None, "2025-12-01", FR + "2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology"),
    # Section 232: processed critical minerals (negotiations) and polysilicon (minimum import price)
    src("eo-14272", "Federal Register", "90 FR 16437", "Executive Order 14272", "Ensuring National Security and Economic Resilience Through Section 232 Actions on Processed Critical Minerals and Derivative Products", "2025-04-15", "2025-04-18", FR + "2025/04/18/2025-06836/ensuring-national-security-and-economic-resilience-through-section-232-actions-on-processed-critical"),
    src("procl-11001", "Federal Register", "91 FR 2439", "Proclamation 11001", "Adjusting Imports of Processed Critical Minerals and Their Derivative Products Into The United States", "2026-01-14", "2026-01-20", FR + "2026/01/20/2026-01045/adjusting-imports-of-processed-critical-minerals-and-their-derivative-products-into-the-united"),
    src("fr-2026-03868", "Federal Register", "91 FR 9686", "Notice (USTR)", "Request for Comments on the Design of a Plurilateral Agreement on Trade in Critical Minerals and Policy Actions To Strengthen the Resilience of Critical Minerals Supply Chains", None, "2026-02-26", FR + "2026/02/26/2026-03868/request-for-comments-on-the-design-of-a-plurilateral-agreement-on-trade-in-critical-minerals-and"),
    src("fr-2025-13345", "Federal Register", "90 FR 31955", "Notice (BIS)", "Notice of Request for Public Comments on Section 232 National Security Investigation of Imports of Polysilicon and its Derivatives", None, "2025-07-16", FR + "2025/07/16/2025-13345/notice-of-request-for-public-comments-on-section-232-national-security-investigation-of-imports-of"),
    src("procl-11052", "Federal Register", "91 FR 51975", "Proclamation 11052", "Adjusting Imports of Polysilicon and Its Derivatives Into the United States", "2026-08-06", "2026-08-11", FR + "2026/08/11/2026-16400/adjusting-imports-of-polysilicon-and-its-derivatives-into-the-united-states"),
    src("fr-2026-19537", "Federal Register", "91 FR 60505", "Temporary final rule (BIS)", "Measures To Restrict Stockpiling of Polysilicon and Polysilicon Derivatives Under Proclamation 11052", None, "2026-09-24", FR + "2026/09/24/2026-19537/measures-to-restrict-stockpiling-of-polysilicon-and-polysilicon-derivatives-under-proclamation-11052"),
]

# Chapter notes (HTSUS 2026 Revision 21, Chapter 28)
CHAPTER_NOTES = (
    "**Note 1.** Except where the context otherwise requires, the headings of this chapter apply only to: (a) separate chemical elements and separate chemically "
    "defined compounds, whether or not containing impurities; (b) the products mentioned in (a) above dissolved in water; (c) the products mentioned in (a) above "
    "dissolved in other solvents provided that the solution constitutes a normal and necessary method of putting up these products adopted solely for reasons of "
    "safety or for transport and that the solvent does not render the product particularly suitable for specific use rather than for general use; (d) the products "
    "mentioned in (a), (b) or (c) above with an added stabilizer (including an anticaking agent) necessary for their preservation or transport; (e) the products "
    "mentioned in (a), (b), (c) or (d) above with an added antidusting agent or a coloring substance added to facilitate their identification or for safety reasons, "
    "provided that the additions do not render the product particularly suitable for specific use rather than for general use.\n\n"
    "**Note 2.** In addition to dithionites and sulfoxylates, stabilized with organic substances (heading 2831), carbonates and peroxocarbonates of inorganic bases "
    "(heading 2836), cyanides, cyanide oxides and complex cyanides of inorganic bases (heading 2837), fulminates, cyanates and thiocyanates, of inorganic bases "
    "(heading 2842), organic products included in headings 2843 to 2846 and 2852 and carbides (heading 2849), only the following compounds of carbon are to be "
    "classified in this chapter: (a) oxides of carbon, hydrogen cyanide and fulminic, isocyanic, thiocyanic and other simple or complex cyanogen acids (heading "
    "2811); (b) halide oxides of carbon (heading 2812); (c) carbon disulfide (heading 2813); (d) thiocarbonates, selenocarbonates, tellurocarbonates, "
    "selenocyanates, tellurocyanates, tetrathiocyanatodiamminochromates (reineckates) and other complex cyanates, of inorganic bases (heading 2842); (e) hydrogen "
    "peroxide, solidified with urea (heading 2847), carbon oxysulfide, thiocarbonyl halides, cyanogen, cyanogen halides and cyanamide and its metal derivatives "
    "(heading 2853) other than calcium cyanamide, whether or not pure (chapter 31).\n\n"
    "**Note 3.** Subject to the provisions of note 1 to section VI, this chapter does not cover: (a) sodium chloride or magnesium oxide, whether or not pure, or "
    "other products of section V; (b) organo-inorganic compounds other than those mentioned in note 2 above; (c) products mentioned in note 2, 3, 4 or 5 to chapter "
    "31; (d) inorganic products of a kind used as luminophores, of heading 3206; glass frit and other glass in the form of powder, granules or flakes, of heading "
    "3207; (e) artificial graphite (heading 3801); products put up as charges for fire-extinguishers or put up in fire-extinguishing grenades, of heading 3813; ink "
    "removers put up in packings for retail sale, of heading 3824; cultured crystals (other than optical elements) weighing not less than 2.5 g each, of the halides "
    "of the alkali or alkaline-earth metals, of heading 3824; (f) precious or semiprecious stones (natural, synthetic or reconstructed) or dust or powder of such "
    "stones (headings 7102 to 7105), or precious metals or precious metal alloys of chapter 71; (g) the metals, whether or not pure, metal alloys or cermets, "
    "including sintered metal carbides (metal carbides sintered with a metal), of section XV; or (h) optical elements, for example, of the halides of the alkali or "
    "alkaline-earth metals (heading 9001).\n\n"
    "**Note 4.** Chemically defined complex acids consisting of a nonmetal acid of subchapter II and a metal acid of subchapter IV are to be classified in heading "
    "2811.\n\n"
    "**Note 5.** Headings 2826 to 2842 apply only to metal or ammonium salts or peroxysalts. Except where the context otherwise requires, double or complex salts "
    "are to be classified in heading 2842.\n\n"
    "**Note 6.** Heading 2844 applies only to: (a) technetium (atomic No. 43), promethium (atomic No. 61), polonium (atomic No. 84) and all elements with an "
    "atomic number greater than 84; (b) natural or artificial radioactive isotopes (including those of the precious metals or of the base metals of sections XIV "
    "and XV), whether or not mixed together; (c) compounds, inorganic or organic, of these elements or isotopes, whether or not chemically defined, whether or not "
    "mixed together; (d) alloys, dispersions (including cermets), ceramic products and mixtures containing these elements or isotopes or inorganic or organic "
    "compounds thereof and having a specific radioactivity exceeding 74 becquerels per gram (0.002 microcurie per gram); (e) spent (irradiated) fuel elements "
    "(cartridges) of nuclear reactors; (f) radioactive residues whether or not usable. The term \"isotopes\", for the purposes of this note and of the wording of "
    "headings 2844 and 2845, refers to: (i) individual nuclides, excluding, however, those existing in nature in the monoisotopic state; (ii) mixtures of isotopes "
    "of one and the same element, enriched in one or several of the said isotopes, that is, elements of which the natural isotopic composition has been "
    "artificially modified.\n\n"
    "**Note 7.** Heading 2853 includes copper phosphide (phosphor copper) containing more than 15 percent by weight of phosphorus.\n\n"
    "**Note 8.** Chemical elements (for example, silicon and selenium) doped for use in electronics are to be classified in this chapter, provided that they are in "
    "forms unworked as drawn, or in the form of cylinders or rods. When cut in the form of discs, wafers or similar forms, they fall in heading 3818.\n\n"
    "**Subheading note 1.** For the purposes of subheading 2852.10, the expression \"chemically defined\" means all organic or inorganic compounds of mercury "
    "meeting the requirements of paragraphs (a) to (e) of note 1 to chapter 28 or paragraphs (a) to (h) of note 1 to chapter 29.\n\n"
    "**Statistical note 1.** For the purposes of heading 2804, the term \"m3\" (cubic meter) means a standard cubic meter measured at 21°C at 760 mm (1013 "
    "millibars) pressure."
)

# Section VI additional U.S. note 3 matters for chapter 28 "other" lines; quoted as the additional U.S. notes that apply to this chapter.
ADDITIONAL_US_NOTES = (
    "Chapter 28 has no additional U.S. notes of its own. The additional U.S. notes to section VI apply: **Note 1.** In determining the amount of duty applicable "
    "to a solution of a single compound in water subject to duty in this section at a specific rate, an allowance in weight or volume, as the case may be, shall be "
    "made for the water in excess of any water of crystallization which may be present in the undissolved compound. **Note 3.** The term \"products described in "
    "additional U.S. note 3 to section VI\" refers to any product not listed in the Chemical Appendix to the Tariff Schedule and (a) for which the importer "
    "furnishes the Chemical Abstracts Service (C.A.S.) registry number and certifies that such registry number is not listed in the Chemical Appendix, or (b) "
    "which the importer certifies not to have a C.A.S. registry number and not to be listed in the Chemical Appendix, either under the name used to make Customs "
    "entry or under any other name by which it may be known."
)
