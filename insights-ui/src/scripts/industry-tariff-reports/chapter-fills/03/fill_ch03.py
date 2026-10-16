"""Fill the writer parts of the generated Chapter 03 content file (issue #1803).

Run after `pnpm tariff:generate-chapter --chapter 3 ... --force`:
    python3 fill_ch03.py <path-to-03-fish-and-crustaceans.json>
"""
import json
import re
import sys

PATH = sys.argv[1]
d = json.load(open(PATH))

TODAY = '2026-10-11'
ECFR_AS_OF = '2026-10-08'
HTS_CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
HTS_CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
HTS_CH03 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%203'
FR = 'https://www.federalregister.gov/documents/'


def src(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


S = {
    'eo-14389': src('eo-14389', 'Federal Register', '91 FR 9437', 'Executive Order 14389', 'Ending Certain Tariff Actions', '2026-02-20', '2026-02-25',
                    FR + '2026/02/25/2026-03832/ending-certain-tariff-actions'),
    'csms-67834313': src('csms-67834313', 'CBP', 'CSMS # 67834313', 'CBP CSMS message', 'Ending Collection of International Emergency Economic Powers Act Duties', None, '2026-02-22',
                         'https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9'),
    'scotus-24-1287': src('scotus-24-1287', 'Supreme Court of the United States', '607 U.S. 229', 'Opinion, No. 24-1287', 'Learning Resources, Inc. v. Trump', None, '2026-02-20',
                          'https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf'),
    'procl-11012': src('procl-11012', 'Federal Register', '91 FR 9339', 'Proclamation 11012', 'Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems',
                       '2026-02-20', '2026-02-25', FR + '2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems'),
    'eo-14257': src('eo-14257', 'Federal Register', '90 FR 15041', 'Executive Order 14257',
                    'Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits', '2025-04-02', '2025-04-07',
                    FR + '2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and'),
    'eo-14193': src('eo-14193', 'Federal Register', '90 FR 9113', 'Executive Order 14193', 'Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border', '2025-02-01', '2025-02-07',
                    FR + '2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border'),
    'eo-14194': src('eo-14194', 'Federal Register', '90 FR 9117', 'Executive Order 14194', 'Imposing Duties To Address the Situation at Our Southern Border', '2025-02-01', '2025-02-07',
                    FR + '2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border'),
    'eo-14325': src('eo-14325', 'Federal Register', '90 FR 37957', 'Executive Order 14325', 'Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border', '2025-07-31',
                    '2025-08-06', FR + '2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border'),
    'eo-14326': src('eo-14326', 'Federal Register', '90 FR 37963', 'Executive Order 14326', 'Further Modifying the Reciprocal Tariff Rates', '2025-07-31', '2025-08-06',
                    FR + '2025/08/06/2025-15010/further-modifying-the-reciprocal-tariff-rates'),
    'eo-14329': src('eo-14329', 'Federal Register', '90 FR 38701', 'Executive Order 14329', 'Addressing Threats to the United States by the Government of the Russian Federation', '2025-08-06',
                    '2025-08-11', FR + '2025/08/11/2025-15267/addressing-threats-to-the-united-states-by-the-government-of-the-russian-federation'),
    'eo-14384': src('eo-14384', 'Federal Register', '91 FR 6501', 'Executive Order 14384', 'Modifying Duties To Address Threats to the United States by the Government of the Russian Federation',
                    '2026-02-06', '2026-02-11', FR + '2026/02/11/2026-02818/modifying-duties-to-address-threats-to-the-united-states-by-the-government-of-the-russian-federation'),
    'eo-14360': src('eo-14360', 'Federal Register', '90 FR 54091', 'Executive Order 14360', 'Modifying the Scope of the Reciprocal Tariffs With Respect to Certain Agricultural Products', '2025-11-14',
                    '2025-11-25', FR + '2025/11/25/2025-21203/modifying-the-scope-of-the-reciprocal-tariffs-with-respect-to-certain-agricultural-products'),
    'eo-14276': src('eo-14276', 'Federal Register', '90 FR 16993', 'Executive Order 14276', 'Restoring American Seafood Competitiveness', '2025-04-17', '2025-04-22',
                    FR + '2025/04/22/2025-07062/restoring-american-seafood-competitiveness'),
    'ustr-usmca-review': src('ustr-usmca-review', 'USTR', 'USTR press release', 'Statement', 'Ambassador Greer Issues Statement on the USMCA Joint Review', None, '2026-07-01',
                             'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review'),
    'fr-2025-21671': src('fr-2025-21671', 'Federal Register', '90 FR 55232', 'Notice (USTR)',
                         "Notice of Product Exclusion Extensions: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation", None, '2025-12-01',
                         FR + '2025/12/01/2025-21671/notice-of-product-exclusion-extensions-chinas-acts-policies-and-practices-related-to-technology'),
    # MMPA
    'mmpa-2025': src('mmpa-2025', 'Federal Register', '90 FR 42395', 'Notice (NOAA Fisheries)',
                     'Implementation of Fish and Fish Product Import Provisions of the Marine Mammal Protection Act — Notification of Comparability Findings and Implementation of Import Restrictions; Certification of Admissibility for Certain Fish Products',
                     None, '2025-09-02', FR + '2025/09/02/2025-16776/implementation-of-fish-and-fish-product-import-provisions-of-the-marine-mammal-protection'),
    'mmpa-nz-2026': src('mmpa-nz-2026', 'Federal Register', '91 FR 11962', 'Notice (NOAA Fisheries)',
                        'Implementation of Fish and Fish Product Import Provisions of the Marine Mammal Protection Act — Notification of Comparability Findings', None, '2026-03-11',
                        FR + '2026/03/11/2026-04747/implementation-of-fish-and-fish-product-import-provisions-of-the-marine-mammal-protection'),
    'mmpa-nc-gd-ie-2026': src('mmpa-nc-gd-ie-2026', 'Federal Register', '91 FR 12510', 'Rule (NOAA Fisheries)',
                              'Notification of Comparability Findings for New Caledonia, Grenada, and Ireland Under the Import Provisions of the Marine Mammal Protection Act', None, '2026-03-16',
                              FR + '2026/03/16/2026-05115/notification-of-comparability-findings-for-new-caledonia-grenada-and-ireland-under-the-import'),
    'mmpa-crab-2026': src('mmpa-crab-2026', 'Federal Register', '91 FR 25867', 'Notice (NOAA Fisheries)',
                          'Implementation of Fish and Fish Product Import Provisions of the Marine Mammal Protection Act — Notification of Comparability Findings', None, '2026-05-12',
                          FR + '2026/05/12/2026-09429/implementation-of-fish-and-fish-product-import-provisions-of-the-marine-mammal-protection'),
    'mmpa-anprm-2026': src('mmpa-anprm-2026', 'Federal Register', '91 FR 47798', 'Advance notice of proposed rulemaking (NOAA Fisheries)',
                           'Implementation of Fish and Fish Product Import Provisions of the Marine Mammal Protection Act', None, '2026-07-29',
                           FR + '2026/07/29/2026-15294/implementation-of-fish-and-fish-product-import-provisions-of-the-marine-mammal-protection-act'),
    # Russia
    'eo-14068': src('eo-14068', 'Federal Register', '87 FR 14381', 'Executive Order 14068',
                    'Prohibiting Certain Imports, Exports, and New Investment With Respect to Continued Russian Federation Aggression', '2022-03-11', '2022-03-15',
                    FR + '2022/03/15/2022-05554/prohibiting-certain-imports-exports-and-new-investment-with-respect-to-continued-russian-federation'),
    'eo-14114': src('eo-14114', 'Federal Register', '88 FR 89271', 'Executive Order 14114', "Taking Additional Steps With Respect to the Russian Federation's Harmful Activities", '2023-12-22',
                    '2023-12-26', FR + '2023/12/26/2023-28662/taking-additional-steps-with-respect-to-the-russian-federations-harmful-activities'),
    'ofac-ru-seafood': src('ofac-ru-seafood', 'Federal Register', '89 FR 78245', 'Rule (Treasury OFAC)', 'Publication of Russian Harmful Foreign Activities Sanctions Regulations Determinations', None,
                           '2024-09-25', FR + '2024/09/25/2024-21798/publication-of-russian-harmful-foreign-activities-sanctions-regulations-determinations'),
    # AD/CVD shrimp
    'adcvd-shrimp-2024': src('adcvd-shrimp-2024', 'Federal Register', '89 FR 104982', 'Notice (Commerce ITA)',
                             'Frozen Warmwater Shrimp From Indonesia: Antidumping Duty Order; Frozen Warmwater Shrimp From Ecuador, India, and the Socialist Republic of Vietnam: Countervailing Duty Orders',
                             None, '2024-12-26', FR + '2024/12/26/2024-30694/frozen-warmwater-shrimp-from-indonesia-antidumping-duty-order-frozen-warmwater-shrimp-from-ecuador'),
    'ad-shrimp-continued': src('ad-shrimp-continued', 'Federal Register', '88 FR 42914', 'Notice (Commerce ITA)',
                               "Certain Frozen Warmwater Shrimp From the People's Republic of China, India, Thailand, and the Socialist Republic of Vietnam: Continuation of Antidumping Duty Orders", None,
                               '2023-07-05', FR + '2023/07/05/2023-14181/certain-frozen-warmwater-shrimp-from-the-peoples-republic-of-china-india-thailand-and-the-socialist'),
    'ad-shrimp-in-2026': src('ad-shrimp-in-2026', 'Federal Register', '91 FR 56861', 'Notice (Commerce ITA)',
                             'Certain Frozen Warmwater Shrimp from India: Final Results of Antidumping Duty Administrative Review; 2024-2025', None, '2026-09-04',
                             FR + '2026/09/04/2026-18184/certain-frozen-warmwater-shrimp-from-india-final-results-of-antidumping-duty-administrative-review'),
    'cvd-shrimp-ec-2026': src('cvd-shrimp-ec-2026', 'Federal Register', '91 FR 58086', 'Notice (Commerce ITA)',
                              'Frozen Warmwater Shrimp From Ecuador: Amended Final Results of Countervailing Duty Expedited Review', None, '2026-09-14',
                              FR + '2026/09/14/2026-18697/frozen-warmwater-shrimp-from-ecuador-amended-final-results-of-countervailing-duty-expedited-review'),
    'ad-shrimp-th-2026': src('ad-shrimp-th-2026', 'Federal Register', '91 FR 63527', 'Notice (Commerce ITA)',
                             'Certain Frozen Warmwater Shrimp From Thailand: Final Results of Antidumping Duty Administrative Review and Final Determination of No Shipments; 2024-2025', None,
                             '2026-10-06', FR + '2026/10/06/2026-20488/certain-frozen-warmwater-shrimp-from-thailand-final-results-of-antidumping-duty-administrative'),
    # State Dept shrimp / turtles
    'state-609-2026': src('state-609-2026', 'Federal Register', '91 FR 21364', 'Notice (Department of State)', 'Annual Determination and Certification of Shrimp-Harvesting Nations', None, '2026-04-21',
                          FR + '2026/04/21/2026-07676/annual-determination-and-certification-of-shrimp-harvesting-nations'),
    # FDA cesium-137
    'fda-ia-99-52': src('fda-ia-99-52', 'FDA', 'Import Alert 99-52 (revised July 7, 2026)', 'Import alert',
                        'Import Alert 99-52: certification required for shrimp and spices from Java and Lampung, Indonesia (cesium-137)', None, '2026-07-07',
                        'https://www.accessdata.fda.gov/cms_ia/importalert_1188.html'),
    'fda-cs137-2025': src('fda-cs137-2025', 'FDA', 'FDA constituent update', 'Announcement',
                          'FDA Announces First Use of Import Certification Authority for Certain Shrimp and Spices Potentially Contaminated With Cesium-137', None, '2025-10-03',
                          'https://www.fda.gov/food/hfp-constituent-updates/fda-announces-first-use-import-certification-authority-certain-shrimp-and-spices-potentially'),
    'fda-cs137-page': src('fda-cs137-page', 'FDA', 'FDA web page (content current as of October 5, 2026)', 'Web page',
                          'FDA Response to Imported Foods Potentially Contaminated with Cesium-137', None, '2026-10-05',
                          'https://www.fda.gov/food/environmental-contaminants-food/fda-response-imported-foods-potentially-contaminated-cesium-137'),
}

d['asOf'] = TODAY

# ---------------------------------------------------------------- labels
LABELS = {
    '0301': ('Live fish', 'Live fish'),
    '0302': ('Fresh or chilled whole fish', 'Fresh fish'),
    '0303': ('Frozen whole fish', 'Frozen fish'),
    '0304': ('Fish fillets & other fish meat', 'Fillets'),
    '0305': ('Dried, salted & smoked fish', 'Dried & smoked'),
    '0306': ('Crustaceans: shrimp, lobster, crab', 'Crustaceans'),
    '0307': ('Molluscs: scallops, squid, oysters, clams', 'Molluscs'),
    '0308': ('Sea cucumbers, sea urchins & other aquatic invertebrates', 'Other invertebrates'),
    '0309': ('Edible seafood flours, meals & pellets', 'Flours & meals'),
}

# ---------------------------------------------------------------- overview
ov = d['overview']
ov['seo'] = {
    'title': 'HTS Chapter 03 Fish & Seafood Tariff Rates: Shrimp, Salmon, Crab, Lobster | KoalaGains',
    'shortDescription': 'Searchable duty table for all 562 HTS Chapter 03 lines — shrimp (0306.17), salmon, crab, lobster, tuna, scallops and other seafood. General, FTA and Column 2 rates plus the 2026 Section 301 duties by country, with USMCA rules.',
    'keywords': ['HTS Chapter 03', 'seafood tariff', 'fish import duty', 'shrimp tariff', 'HTS 0306.17 shrimp duty', 'salmon import duty', 'crab tariff', 'lobster tariff', 'USMCA seafood tariffs',
                 'Ecuadorian shrimp tariff', 'Chilean salmon import duties'],
}
ov['intro'] = (
    "Chapter 03 covers fish and seafood that are live, fresh, chilled, frozen, dried, salted or smoked — whole fish, fillets, shrimp, lobster, crab, scallops, squid, oysters, sea cucumbers and more. "
    "Of its **562 tariff lines, 511 are duty-free** under the general rate. The few that are not are mostly retail-size packs and specialty items: crabmeat (7.5%), sturgeon roe (15%), small packs of frozen fish meat (6%) and smoked salmon (5%).\n\n"
    "What decides the cost today is **where the seafood comes from**. The U.S. imported $21.76B of Chapter 03 goods in 2025, a quarter of it frozen shrimp. Since July 24, 2026 a Section 301 tariff adds **10% or 12.5% for 60 economies** — +10% for India, Ecuador and Indonesia, +12.5% for Chile, Norway and Vietnam — and China pays **37.5%** on most lines. "
    "**USMCA-qualifying seafood from Canada and Mexico enters free.** Shrimp from six countries also carries antidumping or countervailing duties, Russian seafood is banned, and fish from fisheries without a Marine Mammal Protection Act finding cannot be imported."
)
for st in ov['stats']:
    if st['label'] == 'Lines with an extra duty for some origins':
        st['note'] = 'Section 301 (60 economies, China, Brazil); USMCA goods exempt'
for g in ov['productGroups']:
    g['label'] = LABELS[g['heading']][0]
BLURBS = {
    '0301': ('Every live-fish line is duty-free: ornamental fish, trout, eels, carp, live bluefin tuna. Fish & Wildlife rules (injurious species, CITES) decide what may enter.',
             ['koi', 'goldfish', 'ornamental fish', 'live eel', 'trout', 'carp', 'live tuna']),
    '0302': ('Whole fresh fish, mostly Free: salmon, tuna, cod, halibut, tilapia, catfish. Duty falls only on scaled fish in small retail packs (3%), sole (1.1¢/kg) and sturgeon roe (15%).',
             ['fresh salmon', 'atlantic salmon', 'tuna', 'yellowfin', 'halibut', 'tilapia', 'mahi mahi', 'snapper', 'grouper']),
    '0303': ('Frozen whole fish, mostly Free. Flatfish such as sole and turbot, sardines, sharks and shark fins pay 1.1¢/kg, and sturgeon roe 15%.',
             ['frozen salmon', 'frozen tuna', 'albacore', 'mackerel', 'sardines', 'toothfish', 'roe']),
    '0304': ('Fillets — fresh or frozen salmon, cod, pollock, tilapia, catfish (pangasius), tuna — are Free. Other frozen fish meat (minced blocks, surimi) is Free in bulk but 6% in containers of 6.8 kg or less.',
             ['salmon fillet', 'cod fillet', 'pollock', 'tilapia fillet', 'swai', 'pangasius', 'surimi', 'tuna loin']),
    '0305': ('Dried, salted, smoked and brined fish, plus fish flours. Rates vary most here: smoked salmon 5%, salted salmon 3%, sturgeon roe 7.5%, herring and mackerel in small packs 4–5%; dried and salted cod and smoked trout are Free.',
             ['smoked salmon', 'salt cod', 'bacalao', 'dried fish', 'herring', 'anchovies', 'shark fins']),
    '0306': ('Shrimp, lobster, crab, crawfish — all Free except crabmeat (7.5%). Frozen warm-water shrimp (0306.17) is the largest import in the chapter, and the line that carries antidumping and countervailing duties.',
             ['shrimp', 'prawns', 'lobster', 'lobster tail', 'king crab', 'snow crab', 'crabmeat', 'crawfish']),
    '0307': ('Scallops, oysters, mussels, clams, squid, octopus, abalone and conch are Free; only land snails pay 5%. Live and fresh bivalves can come only from FDA-listed shippers.',
             ['scallops', 'oysters', 'mussels', 'clams', 'squid', 'octopus', 'abalone', 'escargot']),
    '0308': ('Sea cucumbers, sea urchins and jellyfish: all Free.', ['sea cucumber', 'sea urchin', 'uni', 'jellyfish']),
    '0309': ('Edible flours, meals and pellets of fish and shellfish: Free, except fish flour in packs of 6.8 kg or less (6%).', ['fish flour', 'fish meal', 'krill', 'shrimp powder']),
}
for g in ov['productGroups']:
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

ov['workedExamples'] = [
    {
        'title': 'A $100,000 container of frozen shrimp from India',
        'line': '0306.17.00',
        'body': "The general rate is Free. India is one of the 60 economies in the 2026 Section 301 action, so **10% of value** is added (9903.05.44): **$10,000**. On top of that, frozen warm-water shrimp from India carries an antidumping cash deposit (10.17% for exporters without their own rate; 4.04%–7.01% for the reviewed companies from September 4, 2026) and a countervailing deposit (5.77% for most exporters). At the 10.17% and 5.77% rates that is another **$15,940**.",
    },
    {
        'title': '$100,000 of fresh Atlantic salmon fillets from Chile',
        'line': '0304.41.00',
        'body': "Salmon fillets are Free under the general rate and under the Chile FTA (SPI **CL**). The FTA does not remove the 2026 Section 301 duty (U.S. note 52(a)), so Chilean salmon pays **12.5%** (9903.05.30): **$12,500**. Salmon from Norway pays the same 12.5%; salmon from the Faroe Islands or Iceland, which are not among the 60 economies, pays nothing extra.",
    },
    {
        'title': 'Live lobster from Nova Scotia',
        'line': '0306.32.00.10',
        'body': "Live lobster is Free, and USMCA-qualifying goods from Canada are exempt from the 10% Section 301 duty (9903.05.93), so lobster caught by Canadian boats pays **$0**. A shipment that does not qualify for USMCA pays 10% of its value (9903.05.29).",
    },
    {
        'title': '1,000 kg of frozen crabmeat from Indonesia',
        'line': '0306.14.20.00',
        'body': "Crabmeat is one of the few dutiable lines: **7.5%**. Indonesia adds **10%** (9903.05.45), so a $20,000 lot pays $1,500 + $2,000 = **$3,500**. Whole frozen crab in the shell (0306.14.40) is Free at base, so the same lot as crab in shell would pay only the 10%.",
    },
]
ts = ov['tradeSnapshot']
ts['totalDutyCollectedUsd'] = None
ts['effectiveDutyRateNote'] = "Duty-collected figures aren't available from an official source yet."
ts['biggestLines'] = [
    {'hts': '0306.17', 'label': 'Frozen warm-water shrimp & prawns'},
    {'hts': '0304.41', 'label': 'Fresh or chilled salmon fillets'},
]
ts['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. 2025 is the latest full year.'
ov['notes'] = {
    'chapterNotes': (
        "**Note 1.** This chapter does not cover: (a) mammals of heading 0106; (b) meat of mammals of heading 0106 (heading 0208 or 0210); (c) fish (including livers, roes and milt thereof) or crustaceans, molluscs or other aquatic invertebrates, dead and unfit or unsuitable for human consumption by reason of either their species or their condition (chapter 5); flours, meals or pellets of fish or of crustaceans, molluscs or other aquatic invertebrates, unfit for human consumption (heading 2301); or (d) caviar or caviar substitutes prepared from fish eggs (heading 1604).\n\n"
        "**Note 2.** In this chapter the term \"pellets\" means products which have been agglomerated either directly by compression or by the addition of a small quantity of binder.\n\n"
        "**Note 3.** Headings 0305 to 0308 do not cover flours, meals and pellets, fit for human consumption (heading 0309)."
    ),
    'additionalUsNotes': (
        "**Additional U.S. Note 1.** Certain fish, crustaceans, molluscs and other aquatic invertebrates are provided for in chapter 98.\n\n"
        "**Statistical Note 1.** Imports of shrimp or products of shrimp are subject to the provisions of section 609 of Public Law 101-162 of November 21, 1989 (16 U.S.C. 1537 note)."
    ),
}

# ---------------------------------------------------------------- tariff updates
tu = d['tariffUpdates']
tu['seo'] = {
    'title': 'HTS Chapter 03 Seafood Tariff Updates 2026: Shrimp, Salmon, Section 301 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 03 (fish and seafood) since January 2025: the end of the IEEPA duties, the 2026 Section 301 tariffs (India, Ecuador, Chile, Norway, China), shrimp antidumping and countervailing duties, MMPA import bans and the Russian seafood ban — with official sources.',
    'keywords': ['HTS Chapter 03 tariff updates', 'seafood tariff changes 2026', 'India shrimp antidumping duty', 'Ecuador shrimp import duties', 'Chile salmon tariff rates', 'China seafood tariff',
                 'USMCA seafood exemptions', 'MMPA seafood import ban'],
}
tu['intro'] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** (in force October 9, 2026). On all 562 Chapter 03 lines the base rates are the same in both.\n\n"
    "Everything that changed came on top of the base rate. The 2025 IEEPA duties — Canada +35%, Mexico +25%, India up to 50%, and the reciprocal tariff on everyone else — **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. "
    "Since **July 24, 2026**, seafood from 60 economies pays a **Section 301 tariff of 10% or 12.5%**; no Chapter 03 line is on the general exemption list. China also pays the 25% List 3 duty it has paid since 2019 (**37.5%** in all on most lines) and Brazil the 25% Brazil duty (**37.5%**). **USMCA-qualifying seafood from Canada and Mexico is exempt.**\n\n"
    "Seafood also has rules that are not tariffs: antidumping and countervailing duties on frozen shrimp from six countries, the ban on Russian seafood, and the Marine Mammal Protection Act import bans that took effect January 1, 2026. They are in the change log below."
)
tu['scope'] = ('Measures that reach Chapter 03 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil and Nicaragua Section 301 actions, China Section 301 List 3, the 2025–2026 IEEPA and Section 122 duties that have ended, '
               'and the non-tariff rules that decide whether seafood may enter (shrimp AD/CVD orders, MMPA import bans, the Russian seafood ban, FDA import certification). For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '562 of 562 lines'},
    {'label': 'Extra duties in effect', 'value': str(len(tu['inEffect']))},
    {'label': 'Compared', 'value': 'Jan 2025 → Rev 21'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]

IE = {
    'ca-section-301': (
        "USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.93). The 2025 IEEPA duty on Canada (+35%, 9903.01.10) ended February 24, 2026. The 2026 Section 338 duties and import bans on Canadian alcoholic beverages, dairy, motor vehicles and motorcycles list no Chapter 03 line.",
        "Lobster, crab and salmon from Canada that qualify for USMCA pay $0; seafood that does not qualify pays the base rate plus 10% of value.",
        ['eo-14389']),
    'cl-section-301': (
        "No Chapter 03 line is exempt for Chile. The Chile FTA (SPI CL) still removes the base rate on the few dutiable lines, but U.S. note 52(a) charges the Section 301 duty even when an FTA rate is claimed. The 2025 IEEPA reciprocal duty ended February 24, 2026.",
        "$100,000 of fresh salmon fillets from Chile (Free at base) pays $12,500.",
        ['eo-14389']),
    'in-section-301': (
        "No Chapter 03 line is exempt for India. The 2025 IEEPA duties on India — the 25% reciprocal rate and the extra 25% tied to Russian oil, 50% in all from August 27, 2025 — ended: the oil duty on February 7, 2026 (EO 14384) and the rest on February 24, 2026. Antidumping and countervailing duties on frozen warm-water shrimp from India are charged separately.",
        "A $100,000 container of frozen shrimp from India pays $10,000 Section 301 duty, plus the exporter's antidumping and countervailing cash deposits.",
        ['eo-14326', 'eo-14329', 'eo-14384', 'eo-14389', 'ad-shrimp-in-2026', 'adcvd-shrimp-2024']),
    'ec-section-301': (
        "U.S. note 52(j) exempts three Chapter 03 subheadings for Ecuador (9903.06.18): fresh albacore (0302.31), fresh yellowfin tuna (0302.32) and frozen tuna fillets (0304.87). The countervailing duty on frozen warm-water shrimp from Ecuador (order of December 2024) is charged separately; there is no antidumping order on Ecuadorian shrimp.",
        "Ecuadorian shrimp (Free at base) pays 10% of value plus the exporter's countervailing deposit; fresh yellowfin tuna from Ecuador pays nothing extra.",
        ['adcvd-shrimp-2024', 'cvd-shrimp-ec-2026']),
    'no-section-301': (
        "No Chapter 03 line is exempt for Norway. The 2025 IEEPA reciprocal duty ended February 24, 2026.",
        "Fresh Atlantic salmon from Norway (0302.14, Free at base) pays 12.5% of value.",
        ['eo-14389']),
    'vn-section-301': (
        "No Chapter 03 line is exempt for Vietnam. Frozen warm-water shrimp from Vietnam also carries antidumping (2005 order) and countervailing (2024 order) duties; pangasius (swai, basa) must pass USDA FSIS inspection.",
        "Frozen pangasius fillets (0304.62, Free at base) pay 12.5% of value.",
        ['adcvd-shrimp-2024', 'ad-shrimp-continued']),
    'id-section-301': (
        "No Chapter 03 line is exempt for Indonesia. Frozen warm-water shrimp from Indonesia carries an antidumping duty (3.90% for most exporters, order of December 2024). Since October 31, 2025 shrimp from Java and Lampung needs an Indonesian government certificate under FDA Import Alert 99-52.",
        "A $100,000 container of Indonesian shrimp pays $10,000, plus a 3.90% antidumping deposit for most exporters.",
        ['adcvd-shrimp-2024', 'fda-ia-99-52']),
    'cn-section-301': (
        "Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and +25% under List 3 (9903.88.03), which has covered 549 of the 562 Chapter 03 lines since 2018 (25% since May 10, 2019). The 13 lines not on List 3 — frozen cod, haddock, Alaska pollock and salmon fillets, surimi and some other frozen fish meat — pay 12.5%. Six frozen haddock and flatfish fillet lines are excluded from List 3 through November 9, 2026 (9903.88.69). The IEEPA duties on China ended February 24, 2026. Antidumping duty on Chinese frozen warm-water shrimp is charged separately.",
        "Frozen tilapia fillets from China (Free at base) pay 37.5% of value; frozen pollock fillets pay 12.5%. Seafood harvested by Russian vessels or in Russian waters cannot be imported even if processed in China (EO 14114).",
        ['eo-14389', 'fr-2025-21671', 'eo-14114']),
    'mx-section-301': (
        "USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.94). The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.",
        "USMCA-qualifying shrimp, tuna or octopus from Mexico pays $0; seafood that does not qualify pays the base rate plus 10% of value.",
        ['eo-14389']),
    'jp-section-301': (
        "For Japanese goods whose base rate is under 12.5%, the total is 12.5% (9903.05.49); at or above 12.5% (sturgeon roe, 15%) only the base rate is due (9903.05.48). No Chapter 03 line is on Japan's exception list.",
        "$100,000 of frozen scallops from Japan (Free at base) pays $12,500.",
        []),
    'eu-section-301': (
        "For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); sturgeon roe at 15% pays only its base rate (9903.05.38). No Chapter 03 line is on the EU exception list. This replaced the 15% IEEPA reciprocal rate, which ended February 24, 2026.",
        "Frozen fish from the Netherlands, Spain or Denmark pays 10% of value in place of the base rate.",
        ['eo-14389']),
    'br-section-301': (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 (9903.05.27). The Brazil exemption list (U.S. note 50(a)(ii), 9903.05.03) covers 11 Chapter 03 subheadings — fresh yellowfin and bigeye tuna, fresh mackerel and swordfish, fresh and frozen tilapia, fresh tilapia fillets, other fresh and frozen fish (0302.89.50, 0303.89) and frozen rock lobster (0306.11) — which pay only the 12.5%.",
        "Frozen rock lobster tails from Brazil pay 12.5% of value; most other Brazilian seafood pays 37.5%.",
        []),
    'other-section-301': (
        "Thailand, Peru, Australia, New Zealand, the Philippines and Singapore add +12.5%; Argentina, Bangladesh, Malaysia, Sri Lanka and the UK +10%; South Korea and Switzerland pay 12.5% and Taiwan 10% in total when the base rate is lower. An FTA claim removes only the base rate (U.S. note 52(a)). Countries outside the 60 economies — for example Iceland and the Faroe Islands — pay no extra duty. Russian-origin seafood is banned outright (EO 14068, EO 14114).",
        "Frozen shrimp from Thailand pays 12.5% of value plus the exporter's antidumping deposit; frozen cod from Iceland pays nothing extra.",
        ['eo-14068', 'eo-14114', 'ad-shrimp-continued']),
}
for e in tu['inEffect']:
    ex, wim, extra = IE[e['id']]
    e['exemption'] = ex
    e['whatItMeans'] = wim
    for s in extra:
        if s not in e['sourceIds']:
            e['sourceIds'].insert(len(e['sourceIds']) - 1, s)
    if e['id'] == 'cn-section-301':
        e['now'] = '+37.5% (12.5% on 19 lines)'

# change log -------------------------------------------------------------
gen = {c['id']: c for c in tu['changes']}
base = gen['base-rates']
base['date'] = TODAY
s301 = gen['section-301-2026-60-economies-2026-07-24']
s301['title'] = 'Section 301 tariffs on 60 economies cover all seafood'
s301['detail'] = ('10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), including the largest seafood suppliers: India, Ecuador and Indonesia +10%, Chile, Norway, Vietnam and Thailand +12.5%. '
                  'No Chapter 03 line is on the general exemption lists in U.S. note 52(b)–(e); only three tuna subheadings are exempt for Ecuador (note 52(j)). EU goods pay 10% in total and Japan 12.5% in total. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).')
s301['countries'] = '60 economies'
br = gen['section-301-brazil-2026-07-22']
br['title'] = 'Section 301 tariff on products of Brazil'
br['detail'] = '25% on all goods of Brazil (9903.05.01). 11 Chapter 03 subheadings are on the exemption list (U.S. note 50(a)(ii)), among them fresh yellowfin tuna, swordfish, tilapia and frozen rock lobster. From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on top.'
nic = {
    'id': 'nicaragua-301',
    'type': 'pending',
    'date': '2025-12-29',
    'dateLabel': 'Published',
    'title': 'Scheduled: Section 301 tariff on Nicaragua rises to 10% in 2027 and 15% in 2028',
    'detail': 'USTR set a Section 301 duty on goods of Nicaragua that do not originate under CAFTA-DR (9903.89.01): 0% in 2026, +10% from January 1, 2027 and +15% from January 1, 2028. Seafood that qualifies under CAFTA-DR (SPI P) is not covered. Nicaragua also pays the 12.5% 2026 Section 301 duty (9903.05.58).',
    'before': None,
    'now': '+10% (2027), +15% (2028)',
    'countries': 'Nicaragua',
    'sourceIds': ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99', 'hts-now'],
}

KEYS = ['id', 'type', 'date', 'dateLabel', 'title', 'detail', 'before', 'now', 'countries', 'sourceIds']
C = lambda **k: {key: k.get(key) for key in KEYS}
changes = [
    base,
    C(id='cn-301-continued', type='reference', date='2026-10-07', dateLabel='Published', title='China Section 301 duties continue',
      detail='USTR received requests to continue the 2018 China Section 301 actions, so they did not terminate on July 6, 2026 and stay in effect during the second four-year review. List 3 (+25%) therefore still applies to 549 Chapter 03 lines.',
      countries='China', sourceIds=['fr-2026-20510']),
    C(id='ad-shrimp-th', type='reference', date='2026-10-06', dateLabel='Published', title='Thailand shrimp antidumping review completed',
      detail='Commerce published the final results of the 2024–2025 administrative review of the antidumping order on frozen warm-water shrimp from Thailand, setting new company cash-deposit rates.',
      countries='Thailand', sourceIds=['ad-shrimp-th-2026']),
    C(id='cvd-shrimp-ec', type='reference', date='2026-09-14', dateLabel='Published', title='Ecuador shrimp countervailing duty: new rates for three exporters',
      detail='Amended final results of an expedited review set company-specific countervailing cash deposits on frozen warm-water shrimp: Empacadora del Pacífico 15.18%, Nirsa/Proposorja 2.23%, Propemar 2.25%. Other Ecuadorian exporters keep their rates from the 2024 order (3.78% for most).',
      countries='Ecuador', sourceIds=['cvd-shrimp-ec-2026', 'adcvd-shrimp-2024']),
    C(id='ad-shrimp-in', type='reference', date='2026-09-04', dateLabel='Published', title='India shrimp antidumping review: new cash-deposit rates',
      detail='Final results for February 2024–January 2025: Devi Group 4.04%, Sandhya 7.01%, other reviewed companies 5.53%. Exporters without their own rate keep the all-others rate of 10.17%. The 5.77% countervailing duty (5.87% for Devi) from the 2024 order also applies.',
      countries='India', sourceIds=['ad-shrimp-in-2026', 'adcvd-shrimp-2024']),
    C(id='mmpa-anprm', type='pending', date='2026-07-29', dateLabel='Published', title='Proposed: NOAA review of the Marine Mammal Protection Act import rules',
      detail='NOAA Fisheries asked for comments (due September 28, 2026) on a full review of the MMPA import regulations (50 CFR 216.24(h)). Nothing changes until a proposed and final rule are published; the import bans of January 1, 2026 stay in place.',
      countries='All', sourceIds=['mmpa-anprm-2026']),
    s301,
    C(id='s122-end', type='extraDuty', date='2026-07-23', dateLabel='Expired', title='Section 122 import surcharge expired',
      detail='The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', before='+10%', now='None', countries='All', sourceIds=['procl-11012', 'hts-now']),
    br,
    C(id='usmca-review', type='reference', date='2026-07-01', dateLabel='Announced', title='USMCA joint review: not renewed, still in force',
      detail='The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.',
      countries='Canada, Mexico', sourceIds=['ustr-usmca-review']),
    C(id='mmpa-crab', type='reference', date='2026-05-12', dateLabel='Published', title='MMPA: swimming crab from Vietnam, Indonesia and Sri Lanka allowed again; Philippines still barred',
      detail='After reconsideration, NOAA granted comparability findings to swimming crab fisheries of Vietnam, Indonesia and Sri Lanka. Two Philippine swimming crab fisheries stayed denied, and their crab is barred from June 11, 2026.',
      countries='Vietnam, Indonesia, Sri Lanka, Philippines', sourceIds=['mmpa-crab-2026']),
    C(id='state-609', type='reference', date='2026-04-21', dateLabel='Published', title='Shrimp/sea turtle certification for 2026',
      detail='The State Department certified 36 nations and Hong Kong under Section 609 of Public Law 101-162, plus specific fisheries in other countries. Wild-caught shrimp from anywhere else can enter only if it was harvested in a way the certification allows; every shrimp shipment needs a DS-2031 declaration.',
      countries='All shrimp exporters', sourceIds=['state-609-2026']),
    C(id='mmpa-2026-reconsiderations', type='reference', date='2026-03-16', dateLabel='Effective', title='MMPA: bans lifted for some fisheries of New Caledonia, Grenada and Ireland',
      detail='NOAA granted comparability findings on reapplication, so those fisheries may ship to the U.S. again. On March 11, 2026 NOAA also issued new findings for 15 New Zealand set-net and trawl fisheries, so their imports continue.',
      countries='New Caledonia, Grenada, Ireland, New Zealand', sourceIds=['mmpa-nc-gd-ie-2026', 'mmpa-nz-2026']),
    C(id='s122-start', type='extraDuty', date='2026-02-24', dateLabel='Effective', title='Section 122 surcharge replaces the IEEPA tariffs',
      detail='10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 03 line was on the product exemption list (9903.03.03); USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).',
      before='None', now='+10% (until July 23, 2026)', countries='All', sourceIds=['procl-11012', 'hts-now']),
    C(id='ieepa-end', type='extraDuty', date='2026-02-24', dateLabel='Effective', title='All IEEPA tariffs end',
      detail='After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
      before='Varied by country', now='None', countries='All', sourceIds=['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    C(id='india-oil-end', type='extraDuty', date='2026-02-07', dateLabel='Effective', title="India's extra 25% IEEPA duty removed",
      detail='Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from 12:01 a.m. EST on February 7, 2026. The 25% reciprocal rate on India ended with the other IEEPA duties on February 24.',
      before='+50%', now='+25% (until February 24, 2026)', countries='India', sourceIds=['eo-14384']),
    C(id='mmpa-bans', type='reference', date='2026-01-01', dateLabel='Effective', title='Marine Mammal Protection Act import bans take effect',
      detail='NOAA decided comparability findings for about 2,500 fisheries in 135 nations. Fish and fish products from fisheries denied a finding may not be imported from January 1, 2026 — among them fisheries of China, Vietnam, Indonesia, Ecuador, Mexico, Chile, Peru, Korea and Taiwan, and all fisheries of Russia, Namibia and some others. Other products shipped under the same HTS codes need a Certification of Admissibility.',
      countries='34 nations in part, 12 in full', sourceIds=['mmpa-2025']),
    nic,
    C(id='ag-exemption', type='reference', date='2025-11-13', dateLabel='Effective', title='Agricultural exemption did not cover seafood',
      detail='The exemption lists in U.S. note 2(v)(iii) of Chapter 99 contained no Chapter 03 line, so the reciprocal duties applied to fish and seafood until they ended on February 24, 2026.',
      countries='All countries subject to the reciprocal tariff', sourceIds=['eo-14360', 'hts-now']),
    C(id='fda-cs137', type='reference', date='2025-10-31', dateLabel='Effective', title='FDA certification required for shrimp from Java and Lampung, Indonesia',
      detail="After cesium-137 was found in shrimp from an Indonesian processor, FDA used its import certification authority for the first time: shrimp from Java and Lampung must come with a certificate from Indonesia's fisheries quality agency, or it is refused (Import Alert 99-52). FDA posted its assessment of Indonesia's program on October 5, 2026.",
      countries='Indonesia', sourceIds=['fda-cs137-2025', 'fda-ia-99-52', 'fda-cs137-page']),
    C(id='india-oil', type='extraDuty', date='2025-08-27', dateLabel='Effective', title='Extra 25% on products of India',
      detail="Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% reciprocal rate in force since August 7, 2025 (EO 14326): 50% in all on Indian shrimp. Ended February 7, 2026.",
      before='+25%', now='+50% (ended)', countries='India', sourceIds=['eo-14329', 'eo-14326']),
    C(id='ca-amended', type='extraDuty', date='2025-07-31', dateLabel='Signed', title='Canada additional duty raised to 35%',
      detail='Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.', before='+25%', now='+35% (ended)', countries='Canada', sourceIds=['eo-14325']),
    C(id='seafood-eo', type='reference', date='2025-04-17', dateLabel='Signed', title='Executive Order on American seafood competitiveness',
      detail='EO 14276 directed Commerce and USTR to prepare a seafood trade strategy, asked USTR to consider Section 301 action against unfair foreign seafood practices, and asked Commerce to consider revising expansions of the Seafood Import Monitoring Program. No SIMP rule change had been published as of October 11, 2026.',
      countries='All', sourceIds=['eo-14276']),
    C(id='reciprocal', type='extraDuty', date='2025-04-02', dateLabel='Signed', title='Reciprocal tariff on products of all countries',
      detail='10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.', before='None', now='+10% or more (ended)',
      countries='All except Canada, Mexico', sourceIds=['eo-14257']),
    C(id='mx-imposed', type='extraDuty', date='2025-02-01', dateLabel='Signed', title='Additional duty on products of Mexico',
      detail='+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.', before='None', now='+25% (ended)', countries='Mexico',
      sourceIds=['eo-14194']),
    C(id='ca-imposed', type='extraDuty', date='2025-02-01', dateLabel='Signed', title='Additional duty on products of Canada',
      detail='+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.', before='None', now='+25% (ended)',
      countries='Canada', sourceIds=['eo-14193']),
    C(id='adcvd-shrimp-2024', type='reference', date='2024-12-26', dateLabel='Published', title='New shrimp trade-remedy orders: Indonesia, Ecuador, India, Vietnam',
      detail='Commerce issued an antidumping order on frozen warm-water shrimp from Indonesia (3.90% for most exporters) and countervailing orders on shrimp from Ecuador (3.78%), India (5.77%) and Vietnam (2.84%). They add to the antidumping orders on shrimp from China, India, Thailand and Vietnam in force since 2005 and continued in 2023. Scope: HTS 0306.17 and some prepared shrimp in 1605.21 and 1605.29.',
      countries='Indonesia, Ecuador, India, Vietnam', sourceIds=['adcvd-shrimp-2024', 'ad-shrimp-continued']),
    C(id='ru-seafood', type='reference', date='2023-12-22', dateLabel='Signed', title='Russian seafood ban extended to fish processed in other countries',
      detail='EO 14068 (March 11, 2022) banned imports of Russian-origin fish and seafood. EO 14114 extended the ban to seafood harvested in Russian waters or by Russia-flagged vessels even when processed in a third country; Treasury listed salmon, cod, pollock and crab under it from December 22, 2023.',
      countries='Russia', sourceIds=['eo-14114', 'eo-14068', 'ofac-ru-seafood']),
]
changes.sort(key=lambda c: c['date'], reverse=True)
tu['changes'] = changes

srcs = {s['id']: s for s in tu['sources']}
for k, v in S.items():
    srcs.setdefault(k, v)
used = set()
for e in tu['inEffect']:
    used.update(e['sourceIds'])
for c in tu['changes']:
    used.update(c['sourceIds'])
used.update(['hts-now', 'hts-before', 'hts-now-cr'])
tu['sources'] = [s for s in srcs.values() if s['id'] in used]
missing = used - set(srcs)
assert not missing, missing

# ---------------------------------------------------------------- understand industry
ui = d['understandIndustry']
TITLE = d['chapter']['title']
ui['h1'] = f'HTS Chapter 03: {TITLE} — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Seafood Imports by Country & Product 2020–2025 (HTS Chapter 03) | KoalaGains',
    'shortDescription': 'U.S. imports of fish and seafood 2020–2025 by country, product and year: $21.76B in 2025. Shrimp, salmon and crab lead; Canada, Chile, India, Ecuador and Norway are the top suppliers.',
    'keywords': ['us seafood imports by country', 'us fish imports by country', 'where does the us import shrimp from', 'how much seafood does the us import', 'HTS Chapter 03 import statistics',
                 'us shrimp imports 2025', 'us salmon imports'],
}
for st in ui['stats']:
    if st['label'] == 'Largest product':
        st['note'] = 'Frozen warm-water shrimp & prawns (0306.17)'
for c in ui['byCountry']:
    if c.get('mainHeading') in LABELS:
        c['mainHeadingLabel'] = LABELS[c['mainHeading']][0]
ui['effectiveDuty'] = {
    'year': 2025,
    'dutyPaidUsd': None,
    'note': "Duty-collected figures aren't available from an official source yet. Almost every Chapter 03 line is Free at base, so what importers pay depends on the extra duties by country — none of which were in force in this form during 2025.",
}
ui['why'] = (
    "U.S. imports of fish and seafood were **$21.76B in 2025**, up 3.5% from $21.02B in 2024 but below the 2022 peak of $25.19B. 142 countries shipped Chapter 03 goods to the U.S., and the top five — Canada, Chile, India, Ecuador and Norway — supplied 57%.\n\n"
    "Three products make up almost half the total. **Frozen warm-water shrimp** (0306.17) was $5.22B (+12.3%), almost all of it from India, Ecuador, Indonesia and Vietnam. **Salmon** — fresh fillets $2.78B, frozen fillets $1.65B and fresh whole Atlantic salmon $1.22B — comes mainly from Chile, Norway and Canada. **Frozen crab** rose 45.6% to $1.56B.\n\n"
    "By country, Ecuador grew fastest among the large suppliers (+28%, to $1.81B, nearly all shrimp), followed by Norway (+18.2%). China fell 15% to $1.13B. These are 2025 figures: the 2026 Section 301 duties that now set the price of most imported seafood took effect on July 24, 2026, so their effect will first show in 2026 data. 2025 is the latest full year of U.S. trade data."
)
ui['sources'] = [
    {'label': 'UN Comtrade (public API), United States imports, HS chapter 03', 'url': 'https://comtradeplus.un.org/'},
]
ui['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ui['lastCheckedAt'] = TODAY

# ---------------------------------------------------------------- industry areas
ia = d['industryAreas']
ia['seo'] = {
    'title': 'HTS Chapter 03 Seafood Tariff Rates by Country — India, Ecuador, Chile, Norway, China | KoalaGains',
    'shortDescription': 'The total U.S. tariff on fish and seafood by country and product group: base rate plus the 2026 Section 301 duty, with USMCA and FTA rules applied. Canada, Chile, India, Ecuador, Norway, Vietnam, Indonesia, China, Mexico, Japan.',
    'keywords': ['tariff on shrimp from india', 'us tariff on ecuador shrimp', 'chile salmon tariff', 'norwegian salmon tariff', 'tariffs on canadian seafood', 'china seafood tariff',
                 'seafood tariff by country', 'HTS Chapter 03 tariff rates by country'],
}
ia['intro'] = (
    "For seafood the total rate depends almost entirely on **where it comes from**: 511 of the 562 lines are Free at base. Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** that started July 24, 2026. **USMCA-qualifying seafood from Canada and Mexico enters free**; India, Ecuador and Indonesia add **10%**; Chile, Norway and Vietnam add **12.5%** (an FTA does not remove it); Japan pays 12.5% and the EU 10% in place of lower base rates; and **China pays 37.5%** on most lines. "
    "Shrimp antidumping and countervailing duties come on top and are not in these totals."
)
ia['lastCheckedAt'] = TODAY
for g in ia['groups']:
    g['label'], g['shortLabel'] = LABELS[g['heading']]

RULE_LABELS = {
    'Canada': ('USMCA-qualifying: free, no extra duty (9903.05.93). Otherwise base rate + 10% Section 301 (9903.05.29). The 35% IEEPA duty ended February 24, 2026.', ['eo-14389']),
    'Chile': ('Base rate (Free on every line under the Chile FTA, SPI CL) + 12.5% Section 301 (9903.05.30). The FTA does not remove the Section 301 duty (U.S. note 52(a)).', []),
    'India': ('Base rate + 10% Section 301 (9903.05.44). The 2025 IEEPA duties (up to 50%) ended in February 2026. Shrimp antidumping and countervailing duties are extra and not shown.', ['eo-14384', 'eo-14389', 'adcvd-shrimp-2024']),
    'Ecuador': ('Base rate + 10% Section 301 (9903.05.35), except fresh albacore and yellowfin tuna and frozen tuna fillets (0302.31, 0302.32, 0304.87), exempt under U.S. note 52(j) (9903.06.18). The shrimp countervailing duty is extra and not shown.', ['adcvd-shrimp-2024']),
    'Norway': ('Base rate + 12.5% Section 301 (9903.05.60).', []),
    'Vietnam': ('Base rate + 12.5% Section 301 (9903.05.84). Shrimp antidumping and countervailing duties are extra and not shown.', ['adcvd-shrimp-2024']),
    'Indonesia': ('Base rate + 10% Section 301 (9903.05.45). The shrimp antidumping duty is extra and not shown.', ['adcvd-shrimp-2024']),
    'China': ('Base rate + 12.5% Section 301 (9903.05.31) + 25% List 3 (9903.88.03) on 543 of 562 lines. The 13 lines not on List 3 (frozen cod, haddock, pollock and salmon fillets, surimi) and 6 haddock and flatfish fillet lines excluded through November 9, 2026 (9903.88.69) pay 12.5%.', ['fr-2025-21671']),
    'Mexico': ('USMCA-qualifying: free, no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.', ['eo-14389']),
    'Japan': ('12.5% in place of the base rate when the base rate is lower (9903.05.49); the 15% sturgeon roe lines pay only their base rate (9903.05.48).', []),
    'Any other country': ('From the base rate alone (countries outside the 60 Section 301 economies, such as Iceland and the Faroe Islands) to base + 37.5% (Brazil). Thailand, Peru, Australia and New Zealand +12.5%; the EU 10% and Taiwan 10% in place of lower base rates; UK and Argentina +10%. Russian seafood is banned (EO 14068, EO 14114).',
                          ['eo-14068', 'eo-14114']),
}
for c in ia['countries']:
    lab, extra = RULE_LABELS[c['country']]
    c['rule']['label'] = lab
    for s in extra:
        if s not in c['rule']['sourceIds']:
            c['rule']['sourceIds'].insert(len(c['rule']['sourceIds']) - 1, s)

ia['assumptions'] = [a for a in ia['assumptions'] if 'TODO' not in a] + [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026 (India\'s extra 25% on February 7, 2026), and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'Antidumping and countervailing duties on frozen warm-water shrimp (antidumping: China, India, Thailand, Vietnam, Indonesia; countervailing: Ecuador, India, Vietnam) are company-specific cash deposits set by Commerce and are not in these totals.',
    'The rate is not the only gate: Russian-origin seafood is banned (EO 14068, EO 14114), and fish from fisheries denied a Marine Mammal Protection Act comparability finding may not be imported since January 1, 2026.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 03 code is on the Section 301 general exemption lists (note 52(b)–(e), 9903.05.86–9903.05.89) or the Canada Section 338 lists (note 51). '
    'The country lists in note 52(j) exempt only three Chapter 03 subheadings, all for Ecuador: 0302.31, 0302.32 and 0304.87. The Brazil exemption list (note 50(a)(ii), 9903.05.03) includes 11 Chapter 03 subheadings, which pay only the 12.5% forced-labor duty. '
    'China List 3 (note 20(f)) covers 549 of the 562 Chapter 03 lines; note 20(vvv)(iii) (9903.88.69) excludes six frozen haddock and flatfish fillet lines through November 9, 2026. No Chapter 03 line was on the IEEPA agricultural exemption lists (note 2(v)(iii)) or the Section 122 product exemption list (9903.03.03).'
)
ia_src = {s['id']: s for s in ia['sources']}
need = set()
for c in ia['countries']:
    need.update(c['rule']['sourceIds'])
for sid in need:
    if sid not in ia_src:
        ia_src[sid] = srcs[sid]
ia['sources'] = list(ia_src.values())

# ---------------------------------------------------------------- tariff engineering
te = d['tariffEngineering']
te['seo'] = {
    'title': 'Importing Seafood into the U.S.: FDA, NOAA SIMP & MMPA Rules and Legal Ways to Lower Duty (HTS Ch. 03) | KoalaGains',
    'shortDescription': 'The documents and rules for each HTS Chapter 03 line — FDA seafood HACCP and prior notice, NOAA Seafood Import Monitoring Program, MMPA import bans, shrimp DS-2031, FSIS catfish inspection — and the legal ways to pay less: USMCA, FTAs, bulk packs, Chapter 98.',
    'keywords': ['import seafood to usa', 'fda seafood import regulations', 'seafood import monitoring program', 'noaa seafood import monitoring program simp', 'marine mammal protection act import provisions',
                 'us seafood import ban', 'DS-2031 shrimp', 'usmca chapter 03 origin'],
}
te['intro'] = (
    "For seafood the paperwork often decides more than the tariff. **Every food line needs FDA clearance** — seafood HACCP verification and prior notice — and depending on the species, NOAA traceability data (SIMP), tuna and toothfish catch documents, a shrimp declaration, USDA inspection for catfish, or Fish & Wildlife permits. "
    "Since January 1, 2026, fish from fisheries without a Marine Mammal Protection Act finding cannot be imported at all, and Russian-origin seafood is banned.\n\n"
    "The legal ways to pay less are written into the schedule: claim **USMCA** for Canadian or Mexican seafood, use an **FTA** on the few dutiable lines, import **in bulk** instead of retail packs, or use a **Chapter 98** provision when it fits. Each depends on a document, listed below with its regulation."
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = ECFR_AS_OF
E = lambda t, s: {'label': t, 'url': s}
ECFR = 'https://www.ecfr.gov/current/'
te['levers'] = [
    {
        'id': 'usmca',
        'title': 'Claim USMCA on seafood from Canada or Mexico',
        'saves': 'The Section 301 duty — 10% of value for Canada or Mexico — plus any base rate',
        'appliesTo': 'All 562 lines, for goods that qualify as originating under USMCA (for example fish caught by a Canadian or Mexican vessel, or farmed there)',
        'document': 'A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the invoice or another document, and CBP can ask for it.',
        'caveat': 'Claiming without a valid certification exposes the entry to the 10% Section 301 duty plus penalties. Seafood caught by other countries\' vessels and only processed in Canada or Mexico may not qualify. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [E('19 CFR 182.12', ECFR + 'title-19/section-182.12'), E('HTSUS 9903.05.93 / 9903.05.94', HTS_CH99),
                      E('USTR statement on the USMCA joint review (July 1, 2026)', S['ustr-usmca-review']['url'])],
    },
    {
        'id': 'fta',
        'title': 'Claim an FTA rate on the dutiable lines',
        'saves': 'The base rate — for example 7.5% on crabmeat, 6% on small packs of frozen fish meat, 5% on smoked salmon',
        'appliesTo': 'The 51 lines with a base-rate duty, for goods originating in an FTA partner (Chile, Peru, Colombia, Korea, Australia, CAFTA-DR, Morocco and others listed in the Special column)',
        'document': "The origin certification or documentation the agreement requires, claimed with the agreement's SPI code on the entry.",
        'caveat': 'An FTA claim does not remove the 2026 Section 301 duty (U.S. note 52(a)) — Chilean or Peruvian seafood still pays 12.5%. GSP (SPI A, A*, A+) has been expired since December 31, 2020, so it saves nothing.',
        'citations': [E('HTSUS General Note 3(c) and Chapter 03 Special column', HTS_CH03), E('HTSUS Ch. 99, subch. III, U.S. note 52(a)', HTS_CH99)],
    },
    {
        'id': 'bulk',
        'title': 'Import in bulk packs instead of retail-size containers',
        'saves': 'Up to 6%: the schedule makes the bulk version of several products Free and charges only small packs',
        'appliesTo': 'Frozen fish meat other than fillets (0304.91–0304.99: Free in bulk or containers over 6.8 kg, 6% otherwise), scaled fresh fish (3% in containers of 6.8 kg or less), fish flour (0309.10: 6% in small packs), herring and mackerel fillets and salted herring (4–5% in small packs)',
        'document': 'Packing list and invoice showing the weight of each immediate container.',
        'caveat': 'The Section 301 duty for the country applies either way. Repacking into retail packs in the United States must still meet FDA labeling and the country-of-origin marking rules.',
        'citations': [E('HTSUS Chapter 03 (6.8 kg container lines)', HTS_CH03), E('19 CFR part 134 (country-of-origin marking)', ECFR + 'title-19/part-134')],
    },
    {
        'id': 'crab-form',
        'title': 'Know the product form: whole crab vs crabmeat',
        'saves': '7.5%: crab in the shell is Free, picked crabmeat is 7.5%',
        'appliesTo': 'Crab in heading 0306 (crabmeat 0306.14.20, 0306.33.20, 0306.93.20)',
        'document': 'A product description and, if the form is unclear, a binding ruling.',
        'caveat': 'Classification follows what is actually imported. Crabmeat that is cooked and prepared beyond chapter 03 (e.g. pasteurized in airtight containers) moves to heading 1605 with its own rates.',
        'citations': [E('HTSUS Chapter 03', HTS_CH03), E('19 CFR part 177', ECFR + 'title-19/part-177')],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision when it fits',
        'saves': 'The base rate and, for a properly claimed entry, the Section 301 duties: each provision below is Free',
        'appliesTo': 'Catch of U.S.-flag vessels, fish for public aquariums, and sport fish caught abroad by the importer',
        'document': 'Evidence of the qualifying facts — for American fisheries, the U.S. vessel documentation and catch records.',
        'caveat': 'The 2026 Section 301 duties, the China List 3 duty and the Brazil duty do not apply to goods properly entered under a Chapter 98 provision when CBP agrees the entry is appropriate, except entries under 9802 (U.S. notes 20, 50(a), 52(a)). Get CBP\'s agreement (or a ruling) before relying on it.',
        'provisions': [
            {'code': '9815.00.20.00', 'rate': 'Free', 'text': 'Products of American fisheries (fish, shellfish and other marine animals) not landed in a foreign country, or landed only for transshipment'},
            {'code': '9815.00.40.00', 'rate': 'Free', 'text': 'Fish of American fisheries (except cod, cusk, haddock, hake, mackerel, pollock and swordfish) landed abroad and only beheaded, eviscerated, chilled or frozen there'},
            {'code': '9810.00.70.00', 'rate': 'Free', 'text': 'Wild animals, including fish, for a public scientific collection for exhibition or for scientific or educational purposes'},
            {'code': '9804.00.55', 'rate': 'Free', 'text': 'Game fish killed abroad by the importer and imported by him for noncommercial purposes'},
        ],
        'citations': [E('HTSUS chapter 98', HTS_CH98), E('HTSUS Ch. 99, subch. III, U.S. note 52(a)', HTS_CH99)],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding ruling before you import',
        'saves': 'Certainty: a ruling fixes the classification (fillet vs other fish meat, crab vs crabmeat, chapter 03 vs chapter 16) before the goods arrive',
        'appliesTo': 'Any line where the classification decides the rate',
        'document': 'A ruling request to CBP describing the product, its processing and packing.',
        'caveat': 'Rulings apply to the transaction described; a different product or process may need its own. A ruling does not decide antidumping scope — that is Commerce.',
        'citations': [E('19 CFR part 177', ECFR + 'title-19/part-177')],
    },
]
R = lambda id, agency, title, cites: {'id': id, 'agency': agency, 'title': title, 'citations': [E(a, b) for a, b in cites]}
te['rules'] = [
    R('fda-haccp', 'FDA', 'Seafood HACCP: the importer must verify that each foreign processor follows seafood HACCP (written verification procedures and records), or buy from a country with an FDA agreement covering the product',
      [('21 CFR 123.12', ECFR + 'title-21/section-123.12'), ('21 CFR part 123', ECFR + 'title-21/part-123')]),
    R('fda-prior-notice', 'FDA', 'Prior notice before every food shipment arrives, and FDA registration of the foreign processing facility (seafood HACCP importers are exempt from FSVP)',
      [('21 CFR 1.279 (when to file)', ECFR + 'title-21/section-1.279'), ('21 CFR 1.281 (contents)', ECFR + 'title-21/section-1.281'), ('21 CFR 1.225 (facility registration)', ECFR + 'title-21/section-1.225'),
       ('21 CFR 1.501(b) (FSVP exemption)', ECFR + 'title-21/section-1.501')]),
    R('fda-shellfish', 'FDA', 'Live, fresh or frozen oysters, clams, mussels and whole scallops only from shippers on the Interstate Certified Shellfish Shippers List (Canada, Korea, New Zealand, Mexico, Spain, the Netherlands), with tagged shellstock from approved waters; scallop adductor muscle alone is exempt',
      [('21 CFR 123.28', ECFR + 'title-21/section-123.28'), ('21 CFR 123.3(h)', ECFR + 'title-21/section-123.3'),
       ('FDA: Interstate Certified Shellfish Shippers List (April 27, 2026)', 'https://www.fda.gov/food/federal-state-local-tribal-and-territorial-cooperative-human-food-programs/interstate-certified-shellfish-shippers-list'),
       ('FDA Import Alert 16-50', 'https://www.accessdata.fda.gov/cms_ia/importalert_46.html')]),
    R('fda-aquaculture', 'FDA', 'Aquaculture drug residues: shipments from listed firms are detained without examination until they show they are free of unapproved drugs (e.g. nitrofurans, malachite green); China shrimp, dace and eel are on a country-wide alert',
      [('FDA Import Alert 16-124', 'https://www.accessdata.fda.gov/cms_ia/importalert_27.html'), ('FDA Import Alert 16-129', 'https://www.accessdata.fda.gov/cms_ia/importalert_31.html'),
       ('FDA Import Alert 16-131', 'https://www.accessdata.fda.gov/cms_ia/importalert_33.html')]),
    R('fda-cs137', 'FDA', 'Indonesia: shrimp from Java and Lampung needs a shipment certificate from Indonesia\'s fisheries quality agency (since October 31, 2025); listed firms are detained',
      [('FDA Import Alert 99-52', S['fda-ia-99-52']['url']), ('FDA Import Alert 99-51', 'https://www.accessdata.fda.gov/cms_ia/importalert_1187.html'),
       ('FDA: response to cesium-137 in imported foods (October 5, 2026)', S['fda-cs137-page']['url'])]),
    R('noaa-simp', 'NOAA Fisheries', 'Seafood Import Monitoring Program: International Fisheries Trade Permit, harvest and landing data filed in ACE at entry, and 2 years of chain-of-custody records — for abalone, Atlantic and Pacific cod, blue crab, red king crab, mahi mahi, grouper, red snapper, sea cucumber, sharks, shrimp, swordfish and tunas',
      [('50 CFR 300.324', ECFR + 'title-50/section-300.324'), ('50 CFR 300.322 (trade permit)', ECFR + 'title-50/section-300.322'), ('50 CFR 300.323 (records)', ECFR + 'title-50/section-300.323')]),
    R('mmpa', 'NOAA Fisheries', 'Marine Mammal Protection Act: fish and fish products only from foreign fisheries with a comparability finding; products of denied fisheries are banned since January 1, 2026, and other products under the same HTS codes need a Certification of Admissibility',
      [('50 CFR 216.24(h)', ECFR + 'title-50/section-216.24'), ('90 FR 42395 (September 2, 2025)', S['mmpa-2025']['url'])]),
    R('noaa-tuna', 'NOAA Fisheries', 'Frozen and processed tuna: NOAA Form 370 (Fisheries Certificate of Origin) filed in ACE, with dolphin-safe documentation',
      [('50 CFR 216.24(f)', ECFR + 'title-50/section-216.24'), ('50 CFR part 216, subpart H', ECFR + 'title-50/part-216/subpart-H')]),
    R('noaa-hms', 'NOAA Fisheries', 'Bluefin tuna, frozen bigeye tuna, swordfish and shark fins: trade permit and a validated statistical or catch document',
      [('50 CFR part 300, subpart M', ECFR + 'title-50/part-300/subpart-M'), ('50 CFR part 635, subpart D', ECFR + 'title-50/part-635/subpart-D')]),
    R('noaa-toothfish', 'NOAA Fisheries', 'Toothfish (Chilean sea bass): trade permit, NOAA pre-approval for each frozen shipment, and a validated CCAMLR catch document',
      [('50 CFR 300.104–300.106', ECFR + 'title-50/part-300/subpart-G')]),
    R('state-609', 'U.S. Department of State', 'Shrimp: every shipment needs a DS-2031 declaration; wild-caught shrimp only from certified nations or fisheries, or harvested in a way that does not harm sea turtles',
      [('91 FR 21364 (2026 certification)', S['state-609-2026']['url']), ('HTSUS Ch. 03, Statistical Note 1', HTS_CH03)]),
    R('adcvd-shrimp', 'Commerce (ITA) / CBP', 'Frozen warm-water shrimp from China, India, Thailand, Vietnam and Indonesia (antidumping) and Ecuador, India and Vietnam (countervailing): cash deposits at the exporter\'s rate',
      [('89 FR 104982 (2024 orders)', S['adcvd-shrimp-2024']['url']), ('88 FR 42914 (2005 orders continued)', S['ad-shrimp-continued']['url']),
       ('91 FR 56861 (India, September 4, 2026)', S['ad-shrimp-in-2026']['url'])]),
    R('fsis-siluriformes', 'USDA FSIS', 'Catfish, pangasius, basa and swai (Siluriformes): only from FSIS-eligible countries and certified plants, with a foreign inspection certificate and FSIS re-inspection',
      [('9 CFR part 557', ECFR + 'title-9/part-557'), ('9 CFR 557.2', ECFR + 'title-9/section-557.2'), ('9 CFR 557.4', ECFR + 'title-9/section-557.4')]),
    R('fws-injurious', 'U.S. Fish & Wildlife Service', 'Injurious wildlife: live snakeheads, walking catfish, certain carps, mitten crabs and zebra mussels are banned; live or uneviscerated salmon and trout need a fish-pathologist virus certificate',
      [('50 CFR 16.13', ECFR + 'title-50/section-16.13')]),
    R('fws-3177', 'U.S. Fish & Wildlife Service', 'Wildlife declaration (Form 3-177) and FWS clearance for live ornamental fish and CITES-listed species; seafood for food is otherwise exempt',
      [('50 CFR 14.61', ECFR + 'title-50/section-14.61'), ('50 CFR 14.62 (shellfish and fishery products exemption)', ECFR + 'title-50/section-14.62')]),
    R('cites', 'U.S. Fish & Wildlife Service', 'CITES permits for listed species, such as eels (Anguilla), queen conch, many sharks and sturgeon',
      [('50 CFR part 23', ECFR + 'title-50/part-23')]),
    R('origin-label', 'CBP / USDA AMS', 'Country-of-origin marking on the container, and retail labeling of origin and "wild" or "farm-raised" for fish and shellfish sold in stores',
      [('19 CFR part 134', ECFR + 'title-19/part-134'), ('7 CFR 60.200', ECFR + 'title-7/section-60.200')]),
    R('russia-ban', 'Treasury (OFAC) / CBP', 'Russian seafood is banned, including fish caught in Russian waters or by Russia-flagged vessels and processed in another country',
      [('EO 14068 (87 FR 14381)', S['eo-14068']['url']), ('EO 14114 (88 FR 89271)', S['eo-14114']['url']), ('89 FR 78245 (OFAC determination)', S['ofac-ru-seafood']['url'])]),
]
GROUP = {
    '0301': (['fws-injurious', 'fws-3177', 'cites', 'fda-prior-notice', 'fda-haccp', 'russia-ban'],
             'Ornamental fish (0301.11, 0301.19) are not food: they need Fish & Wildlife clearance, not FDA. Live food fish (eels, carp, trout, tuna) follow the FDA food rules as well.'),
    '0302': (['fda-haccp', 'fda-prior-notice', 'mmpa', 'noaa-simp', 'noaa-hms', 'noaa-toothfish', 'fsis-siluriformes', 'fws-injurious', 'cites', 'origin-label', 'russia-ban'],
             'Which NOAA rules apply depends on the species: SIMP for cod, tunas, swordfish, sharks, snapper, grouper and mahi mahi; catch documents for bluefin, swordfish and toothfish. Whole uneviscerated salmon and trout need the FWS virus certificate.'),
    '0303': (['fda-haccp', 'fda-prior-notice', 'mmpa', 'noaa-simp', 'noaa-tuna', 'noaa-hms', 'noaa-toothfish', 'fsis-siluriformes', 'fws-injurious', 'cites', 'origin-label', 'russia-ban'],
             'Frozen tuna also needs NOAA Form 370; frozen bigeye and bluefin need a catch document.'),
    '0304': (['fda-haccp', 'fda-prior-notice', 'mmpa', 'noaa-simp', 'noaa-tuna', 'noaa-hms', 'noaa-toothfish', 'fsis-siluriformes', 'fda-aquaculture', 'cites', 'origin-label', 'russia-ban'],
             'Pangasius (swai, basa) and catfish fillets go through USDA FSIS, not FDA. Pollock and cod fillets processed in China must not be of Russian harvest.'),
    '0305': (['fda-haccp', 'fda-prior-notice', 'mmpa', 'noaa-simp', 'noaa-hms', 'cites', 'origin-label', 'russia-ban'], 'Smoked and dried fish are fully processed, so the FWS salmonid certificate does not apply.'),
    '0306': (['fda-haccp', 'fda-prior-notice', 'mmpa', 'noaa-simp', 'state-609', 'adcvd-shrimp', 'fda-aquaculture', 'fda-cs137', 'fws-injurious', 'origin-label', 'russia-ban'],
             'Shrimp carries the most paperwork in the chapter: DS-2031, SIMP data, and for frozen warm-water shrimp from six countries antidumping or countervailing deposits. SIMP covers blue crab and red king crab among crabs.'),
    '0307': (['fda-haccp', 'fda-prior-notice', 'fda-shellfish', 'mmpa', 'noaa-simp', 'cites', 'origin-label', 'russia-ban'],
             'Live and fresh bivalves (oysters, clams, mussels, whole scallops) can come only from listed shippers. Abalone is under SIMP; queen conch needs CITES permits.'),
    '0308': (['fda-haccp', 'fda-prior-notice', 'mmpa', 'noaa-simp', 'cites', 'origin-label', 'russia-ban'], 'Sea cucumbers are under SIMP, and some species need CITES permits.'),
    '0309': (['fda-haccp', 'fda-prior-notice', 'mmpa', 'origin-label', 'russia-ban'], None),
}
for g in te['groups']:
    g['label'] = LABELS[g['heading']][0]
    g['ruleIds'], g['note'] = GROUP[g['heading']]

RX = lambda p: re.compile(p, re.I)
TUNA = RX(r'tuna|thunnus|albacore|skipjack|bonito')
SIMP = RX(r'shrimp|prawn|abalone|\bcrab|\bcod\b|gadus|dolphin ?fish|mahi|grouper|snapper|sea cucumber|shark|swordfish|tuna|thunnus|albacore|skipjack')
HMS = RX(r'bluefin|swordfish|shark fin|xiphias')
TOOTH = RX(r'toothfish|dissostichus')
SHRIMP = RX(r'shrimp|prawn')
CATFISH = RX(r'ictalurus|pangasius|siluriformes|\bcatfish')
EEL = RX(r'\beels?\b|anguilla')
AQUA = RX(r'shrimp|prawn|\beels?\b|anguilla|tilapia|pangasius|ictalurus|\bcarp\b|crawfish|crayfish')
CITES = RX(r'\beels?\b|anguilla|shark|sturgeon|conch|strombus|sea cucumber')
SALMONID = RX(r'salmon|trout|salmo\b|oncorhynchus|hucho')
BULK = ('0302.45.11', '0302.46.11', '0302.54.11', '0302.55.11', '0302.56.11', '0302.59.11', '0302.71.11', '0302.72.11', '0302.73.11', '0302.79.11', '0302.84.11', '0302.85.11', '0302.89.11',
        '0304.91.90', '0304.92.90', '0304.93.90', '0304.94.90', '0304.95.90', '0304.99.91', '0309.10.90', '0305.39.20', '0305.39.40', '0305.61.20', '0305.69.20')
CRABMEAT = ('0306.14.20', '0306.33.20', '0306.93.20')
BIVALVE = ('0307.1', '0307.2', '0307.3', '0307.7')

for l in te['lines']:
    h, hd = l['hts'], l['heading']
    own = l['description']
    txt = ' '.join(l['ancestorPath'] + [own])
    ornamental = h.startswith('0301.11') or h.startswith('0301.19')
    rules = []
    if hd == '0301':
        rules += ['fws-injurious', 'cites' if (ornamental or CITES.search(own)) else None]
        rules += ['fws-3177'] if ornamental or CITES.search(own) else []
        if not ornamental:
            rules += ['fda-haccp', 'fda-prior-notice']
    else:
        rules += ['fda-haccp', 'fda-prior-notice', 'mmpa']
        if SIMP.search(txt) and not (hd == '0306' and RX(r'crab').search(txt) and not RX(r'king|blue|callinectes|crab').search(own)):
            rules.append('noaa-simp')
        if TUNA.search(txt) and hd in ('0303', '0304'):
            rules.append('noaa-tuna')
        if HMS.search(txt) or (hd == '0303' and RX(r'bigeye').search(txt)):
            rules.append('noaa-hms')
        if TOOTH.search(txt):
            rules.append('noaa-toothfish')
        if SHRIMP.search(txt):
            rules += ['state-609', 'fda-cs137']
        if h.startswith('0306.17'):
            rules.append('adcvd-shrimp')
        if AQUA.search(txt):
            rules.append('fda-aquaculture')
        if CATFISH.search(own) and 'wolf fish' not in own.lower() or any(h.startswith(p) for p in ('0302.72', '0303.24', '0304.32', '0304.62')):
            rules.append('fsis-siluriformes')
        if hd in ('0302', '0303') and SALMONID.search(txt):
            rules.append('fws-injurious')
        if h.startswith(BIVALVE):
            rules.append('fda-shellfish')
        if CITES.search(own):
            rules += ['cites', 'fws-3177']
        rules.append('origin-label')
    rules.append('russia-ban')
    seen = []
    for r in rules:
        if r and r not in seen:
            seen.append(r)
    l['ruleIds'] = seen
    levers = ['usmca']
    if l['general'] and l['general'] != 'Free':
        levers.append('fta')
    if h.startswith(BULK):
        levers.append('bulk')
    if h.startswith(CRABMEAT) or (hd == '0306' and RX(r'crab').search(txt)):
        levers.append('crab-form')
    levers += ['ch98', 'ruling']
    l['leverIds'] = levers

te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations — not legal advice. Which NOAA, FDA and Fish & Wildlife rules apply depends on the species, the country and the fishery; '
                    'check the agency before each new product or supplier, and check Commerce for the exporter\'s antidumping or countervailing rate.')

# ---------------------------------------------------------------- final conclusion
fc = d['finalConclusion']
fc['seo'] = {
    'title': 'Seafood Tariffs FAQ: Shrimp from India & Ecuador, Salmon, Canadian Lobster, HS Codes (HTS Ch. 03) | KoalaGains',
    'shortDescription': 'Answers to what people actually search about seafood tariffs: shrimp from India and Ecuador, Norwegian and Chilean salmon, Canadian seafood and lobster, HS codes for shrimp, salmon, crab and lobster, SIMP and the U.S. seafood import bans.',
    'keywords': ['tariff on shrimp', 'tariff on shrimp from india', 'us tariff on ecuador shrimp', 'tariff on salmon', 'tariff on norwegian salmon', 'tariffs on canadian seafood',
                 'tariffs on canadian lobster', 'hs code for shrimp', 'hs code for salmon', 'hs code for crab', 'seafood import monitoring program', 'us seafood import ban'],
}
fc['intro'] = 'Straight answers to the most common questions about importing fish and seafood into the U.S. — tariffs by country, HS codes and entry requirements. Each answer links to the page with the full detail.'
fc['keyTakeaways'] = [
    '511 of the 562 Chapter 03 lines are Free at base; the tariff on seafood is decided by the country of origin.',
    'The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff: +10% for India, Ecuador and Indonesia, +12.5% for Chile, Norway, Vietnam and Thailand, 37.5% for China on most lines; USMCA-qualifying seafood from Canada and Mexico is free.',
    'Frozen warm-water shrimp from six countries also pays antidumping or countervailing duties set per exporter.',
    'Some seafood cannot enter at all: Russian-origin seafood is banned, and fish from fisheries denied a Marine Mammal Protection Act finding has been barred since January 1, 2026.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (United States, English), collected October 11, 2026'
F = lambda id, q, sa, a, link: {'id': id, 'question': q, 'searchedAs': sa, 'answer': a, 'link': link}
fc['faqs'] = [
    F('shrimp-tariff', 'Is there a tariff on shrimp?', ['tariff on shrimp', 'tariffs on shrimp imports', 'us tariff on shrimp', 'trump tariff on shrimp'],
      'Frozen shrimp (0306.17) has a Free base rate, so the tariff depends on the country. Since July 24, 2026 the Section 301 duty adds 10% for India, Ecuador and Indonesia, 12.5% for Vietnam and Thailand, and 37.5% in all for China; USMCA-qualifying shrimp from Mexico is free. Frozen warm-water shrimp from China, India, Thailand, Vietnam and Indonesia also pays antidumping duty, and from Ecuador, India and Vietnam countervailing duty, at each exporter\'s rate. The U.S. imported $5.22B of frozen warm-water shrimp in 2025.',
      'industry-areas'),
    F('india-shrimp', 'What is the U.S. tariff on shrimp from India?', ['tariff on shrimp from india', 'us tariff on indian shrimp', 'india shrimp tariff', 'shrimp tariff india'],
      '10% of value under the 2026 Section 301 action (9903.05.44), plus antidumping and countervailing cash deposits. Since September 4, 2026 the antidumping rates are 4.04% (Devi Group), 7.01% (Sandhya) and 5.53% for the other reviewed companies, with 10.17% for exporters without their own rate; the countervailing rate is 5.77% for most exporters. The 50% IEEPA duties of 2025 ended in February 2026 (the extra 25% on February 7, the rest on February 24).',
      'tariff-updates'),
    F('ecuador-shrimp', 'What is the U.S. tariff on shrimp from Ecuador?', ['us tariff on ecuador shrimp', 'ecuador shrimp tariff'],
      '10% of value under the 2026 Section 301 action (9903.05.35), plus a countervailing cash deposit: 3.78% for most exporters, with company rates set on September 14, 2026 (for example 2.23% for Nirsa/Proposorja). There is no antidumping order on Ecuadorian shrimp. Ecuador shipped $1.81B of seafood to the U.S. in 2025, up 28%.',
      'tariff-updates'),
    F('canada-seafood', 'Are there U.S. tariffs on Canadian seafood?', ['tariffs on canadian seafood', 'us tariffs on canadian seafood', 'are there tariffs on canadian seafood', 'is there a tariff on canadian seafood', 'tariffs on seafood canada'],
      'Not if it qualifies for USMCA. USMCA-qualifying goods from Canada are exempt from the 10% Section 301 duty (9903.05.93), and every Chapter 03 line is Free under USMCA. Seafood that does not qualify pays the base rate plus 10% of value (9903.05.29). The 35% IEEPA duty of 2025 ended on February 24, 2026. Canada was the largest supplier in 2025, with $3.71B.',
      'industry-areas'),
    F('canada-lobster', 'Are there tariffs on lobster from Canada?', ['tariffs on canadian lobster', 'us tariffs on canadian lobster', 'are there tariffs on canadian lobster', 'tariffs on lobster canada'],
      'Live lobster (0306.32) and frozen lobster (0306.12) are Free, and USMCA-qualifying lobster from Canada pays no Section 301 duty, so the tariff is $0. Lobster that does not qualify for USMCA pays 10% of its value.',
      'industry-areas'),
    F('salmon-tariff', 'Is there a tariff on salmon?', ['tariff on salmon', 'is there a tariff on salmon', 'salmon tariffs', 'trump tariffs salmon'],
      'Fresh and frozen salmon and salmon fillets are Free at base, so it depends on the country: Chile and Norway pay 12.5% (9903.05.30, 9903.05.60), USMCA-qualifying salmon from Canada pays nothing, and salmon from the Faroe Islands or Iceland, which are not among the 60 Section 301 economies, pays nothing extra. Smoked salmon (0305.41) has a 5% base rate. The U.S. imported $2.78B of fresh salmon fillets in 2025.',
      'industry-areas'),
    F('norway-salmon', 'What is the U.S. tariff on Norwegian salmon?', ['tariff on norwegian salmon', 'us tariffs on norwegian salmon', 'norwegian salmon tariff', 'tariffs on norwegian salmon'],
      '12.5% of value since July 24, 2026 (9903.05.60); the base rate on fresh salmon and fillets is Free. The 2025 IEEPA reciprocal duty ended on February 24, 2026. Norway shipped $1.63B of seafood to the U.S. in 2025.',
      'industry-areas'),
    F('chile-salmon', 'What is the U.S. tariff on salmon from Chile?', ['chile salmon tariff'],
      '12.5% of value since July 24, 2026 (9903.05.30). Salmon is Free under the general rate and the Chile FTA, but the FTA does not remove the Section 301 duty (U.S. note 52(a)). $100,000 of fresh salmon fillets pays $12,500. Chile shipped $3.06B of seafood to the U.S. in 2025.',
      'industry-areas'),
    F('hs-shrimp', 'What is the HS code for shrimp?', ['hs code for shrimp', 'hs code for shrimp frozen', 'hs code for cooked shrimp', 'hs code for breaded shrimp', 'hs code for live shrimp', 'hs code for vannamei shrimps'],
      'Frozen warm-water shrimp, including vannamei, is 0306.17 (split by count size into 10-digit lines); frozen cold-water shrimp is 0306.16; live, fresh or chilled shrimp is 0306.35 or 0306.36. Shrimp cooked in the shell by steaming or boiling stays in 0306. Peeled cooked and breaded shrimp are prepared products in chapter 16 (1605.21, 1605.29). All are Free at base.',
      ''),
    F('hs-salmon', 'What is the HS code for salmon?', ['hs code for salmon', 'hs code for salmon fillet', 'hs code for fresh salmon', 'hs code for frozen salmon', 'hs code for smoked salmon'],
      'Fresh whole Atlantic salmon is 0302.14 and Pacific salmon 0302.13; frozen whole salmon 0303.11–0303.13; fresh fillets 0304.41; frozen fillets 0304.81; smoked salmon, Pacific or Atlantic, 0305.41 (5%). Canned salmon is in chapter 16 (1604.11).',
      ''),
    F('hs-crab', 'What is the HS code for crab and crab meat?', ['hs code for crab', 'hs code for crab meat', 'hs code for frozen crab', 'hs code king crab', 'hs code snow crab', 'hs code for live crabs'],
      'Frozen crab is 0306.14, with 10-digit lines for red, blue and golden king crab, snow crab and Dungeness crab (Free); frozen crabmeat is 0306.14.20 (7.5%). Live, fresh or chilled crab is 0306.33. Crab prepared or preserved, for example pasteurized crabmeat in airtight containers, is in chapter 16 (1605.10).',
      ''),
    F('hs-lobster', 'What is the HS code for lobster?', ['hs code for lobster', 'hs code for live lobster', 'hs code for lobster tails', 'hs code for lobster frozen'],
      'American and European lobster (Homarus) is 0306.32 live or fresh and 0306.12 frozen; rock lobster and spiny lobster tails are 0306.31 and 0306.11. All are Free at base.',
      ''),
    F('simp', 'What is the Seafood Import Monitoring Program (SIMP)?', ['seafood import monitoring program', 'noaa seafood import monitoring program', 'simp seafood', 'us seafood import monitoring program simp'],
      'A NOAA traceability rule for 13 species groups — abalone, Atlantic and Pacific cod, blue crab, red king crab, mahi mahi, grouper, red snapper, sea cucumber, sharks, shrimp, swordfish and tunas. The importer needs an International Fisheries Trade Permit, files harvest and landing data in ACE at entry, and keeps chain-of-custody records for two years (50 CFR 300.324). No SIMP rule change had been published as of October 11, 2026.',
      'tariff-engineering'),
    F('import-ban', 'What seafood is banned from import into the U.S.?', ['us seafood import ban', 'russian seafood ban', 'russian seafood import ban', 'seafood import prohibitions under the marine mammal protection act import provisions'],
      'Russian-origin seafood is banned (EO 14068), including fish caught in Russian waters or by Russian vessels and processed elsewhere (EO 14114). Since January 1, 2026, fish from foreign fisheries that NOAA denied a Marine Mammal Protection Act comparability finding may not be imported (50 CFR 216.24(h)); NOAA has since cleared some fisheries, such as swimming crab from Vietnam, Indonesia and Sri Lanka in May 2026.',
      'tariff-updates'),
    F('fda-seafood', 'What does FDA require to import seafood?', ['fda seafood import regulations', 'import seafood to usa', 'fda food import requirements'],
      'The foreign processor must be registered with FDA, a prior notice must be filed before each shipment arrives, and the importer must verify that the processor follows seafood HACCP (21 CFR 123.12). Live and fresh oysters, clams and mussels can come only from listed shippers, and FDA import alerts can detain shrimp and other aquaculture seafood from listed firms. NOAA, State Department, USDA and Fish & Wildlife rules may apply depending on the species.',
      'tariff-engineering'),
    F('us-imports', 'How much seafood does the U.S. import, and from where?', ['how much seafood does the us import', 'us seafood imports by country', 'us fish imports by country', 'where does the us import shrimp from'],
      '$21.76B of Chapter 03 fish and seafood in 2025, from 142 countries. The largest suppliers were Canada ($3.71B), Chile ($3.06B), India ($2.12B), Ecuador ($1.81B) and Norway ($1.63B). Frozen warm-water shrimp was the biggest product at $5.22B, mostly from India, Ecuador, Indonesia and Vietnam.',
      'understand-industry'),
]

json.dump(d, open(PATH, 'w'), ensure_ascii=False, indent=2)
print('filled')
