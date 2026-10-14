#!/usr/bin/env python3
"""Fill the writer TODOs of src/tariff-data/chapters/04-dairy-eggs-honey.json (issue #1811).

Re-runnable: reads the generator output (gen.json in this folder, or the chapter file) and writes the chapter file.
  python3 fill04.py            # from scratch/ch04/gen.json
"""
import glob
import json
import os
import re

ROOT = '/Users/robin/projects/worktrees/chapter-migration-1811/insights-ui'
CH = f'{ROOT}/src/tariff-data/chapters'
FILE = f'{CH}/04-dairy-eggs-honey.json'
HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'gen.json')
TODAY = '2026-10-12'
REGS_AS_OF = '2026-10-08'

d = json.load(open(GEN))

HTS_CH4 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%204'
HTS_CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
HTS_CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fr(doc, date, slug):
    y, m, dd = date.split('-')
    return f'https://www.federalregister.gov/documents/{y}/{m}/{dd}/{doc}/{slug}'


# ---------------------------------------------------------------------------------------------
# Sources: reuse the exact source objects other migrated chapters already verified, add new ones
# ---------------------------------------------------------------------------------------------
REUSE = ['eo-14193', 'eo-14194', 'eo-14257', 'eo-14325', 'eo-14389', 'scotus-24-1287', 'csms-67834313', 'procl-11012',
         'ustr-usmca-review', 'eo-14323', 'procl-11062', 'ustr-ausfta-2026']
reuse = {}
for f in sorted(glob.glob(f'{CH}/*.json')):
    if f.endswith('04-dairy-eggs-honey.json'):
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            if s.get('id') in REUSE and s['id'] not in reuse:
                reuse[s['id']] = s
missing = [i for i in REUSE if i not in reuse]
assert not missing, missing


def src(id, publisher, citation, document, title, signed, published, url):
    return {'id': id, 'publisher': publisher, 'citation': citation, 'document': document, 'title': title,
            'signed': signed, 'published': published, 'url': url}


NEW = [
    src('hts-ch4', 'USITC', 'HTSUS 2026 Revision 21, Chapter 4', 'Harmonized Tariff Schedule',
        "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 4: Dairy Produce; Birds' Eggs; Natural Honey; Edible Products of Animal Origin",
        None, '2026-10-07', HTS_CH4),
    src('hts-ch98', 'USITC', 'HTSUS 2026 Revision 21, Chapter 98', 'Harmonized Tariff Schedule',
        'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 98', None, '2026-10-07', HTS_CH98),
    src('fr-2022-12498', 'Federal Register', '87 FR 35501', 'Notice (Commerce ITA)',
        'Raw Honey From Argentina, Brazil, India, and the Socialist Republic of Vietnam: Antidumping Duty Orders', None, '2022-06-10',
        fr('2022-12498', '2022-06-10', 'raw-honey-from-argentina-brazil-india-and-the-socialist-republic-of-vietnam-antidumping-duty-orders')),
    src('fr-2023-21823', 'Federal Register', '88 FR 68103', 'Notice (Commerce ITA)',
        "Honey From the People's Republic of China: Continuation of Antidumping Duty Order", None, '2023-10-03',
        fr('2023-21823', '2023-10-03', 'honey-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-order')),
    src('fr-2026-11121', 'Federal Register', '91 FR 33147', 'Notice (Commerce ITA)',
        'Raw Honey From Brazil: Final Results of Antidumping Duty Administrative Review, 2023-2024', None, '2026-06-03',
        fr('2026-11121', '2026-06-03', 'raw-honey-from-brazil-final-results-of-antidumping-duty-administrative-review-2023-2024')),
    src('fr-2026-11865', 'Federal Register', '91 FR 35670', 'Notice (Commerce ITA)',
        'Raw Honey From Argentina: Final Results of the Antidumping Duty Administrative Review; 2023-2024', None, '2026-06-12',
        fr('2026-11865', '2026-06-12', 'raw-honey-from-argentina-final-results-of-the-antidumping-duty-administrative-review-2023-2024')),
    src('fr-2026-11866', 'Federal Register', '91 FR 35667', 'Notice (Commerce ITA)',
        'Raw Honey From the Socialist Republic of Vietnam: Final Results of Antidumping Duty Administrative Review; 2023-2024', None,
        '2026-06-12',
        fr('2026-11866', '2026-06-12', 'raw-honey-from-the-socialist-republic-of-vietnam-final-results-of-antidumping-duty-administrative')),
    src('fr-2026-12301', 'Federal Register', '91 FR 36804', 'Notice (Commerce ITA)',
        'Raw Honey from India: Final Results of Antidumping Duty Administrative Review; 2023-2024', None, '2026-06-18',
        fr('2026-12301', '2026-06-18', 'raw-honey-from-india-final-results-of-antidumping-duty-administrative-review-2023-2024')),
    src('fr-2026-15436', 'Federal Register', '91 FR 48070', 'Notice (Commerce ITA)',
        'Raw Honey From Argentina: Amended Final Results of Antidumping Duty Administrative Review and Notice of Correction; 2023-2024',
        None, '2026-07-30',
        fr('2026-15436', '2026-07-30', 'raw-honey-from-argentina-amended-final-results-of-antidumping-duty-administrative-review-and-notice')),
    src('fr-2026-18701', 'Federal Register', '91 FR 58087', 'Notice (Commerce ITA)',
        'Raw Honey From Argentina: Preliminary Results of Antidumping Duty Administrative Review; 2024-2025', None, '2026-09-14',
        fr('2026-18701', '2026-09-14', 'raw-honey-from-argentina-preliminary-results-of-antidumping-duty-administrative-review-2024-2025')),
    src('fr-2026-18702', 'Federal Register', '91 FR 58071', 'Notice (Commerce ITA)',
        'Raw Honey From the Socialist Republic of Vietnam: Preliminary Results and Rescission, in Part, of Antidumping Duty Administrative Review; 2024-2025',
        None, '2026-09-14',
        fr('2026-18702', '2026-09-14', 'raw-honey-from-the-socialist-republic-of-vietnam-preliminary-results-and-rescission-in-part-of')),
    src('fr-2026-18718', 'Federal Register', '91 FR 58089', 'Notice (Commerce ITA)',
        'Raw Honey From Brazil: Preliminary Results of Antidumping Duty Administrative Review; 2024-2025', None, '2026-09-14',
        fr('2026-18718', '2026-09-14', 'raw-honey-from-brazil-preliminary-results-of-antidumping-duty-administrative-review-2024-2025')),
    src('fas-safeguard-2026', 'Federal Register', '91 FR 56419', 'Notice (USDA FAS)',
        'WTO Agricultural Quantity-Based Safeguard Trigger Levels', None, '2026-09-02',
        fr('2026-17953', '2026-09-02', 'wto-agricultural-quantity-based-safeguard-trigger-levels')),
    src('fas-dairy-fee-2027', 'Federal Register', '91 FR 56419', 'Notice (USDA FAS)',
        'Assessment of Fees for Dairy Import Licenses for the 2027 Tariff-Rate Import Quota Year', None, '2026-09-02',
        fr('2026-17954', '2026-09-02', 'assessment-of-fees-for-dairy-import-licenses-for-the-2027-tariff-rate-import-quota-year')),
    src('fas-dairy-appendices-2027', 'Federal Register', '91 FR 56421', 'Notice (USDA FAS)',
        'Adjustment of Appendices Under the Dairy Tariff-Rate Quota Import Licensing Regulation', None, '2026-09-02',
        fr('2026-17952', '2026-09-02', 'adjustment-of-appendices-under-the-dairy-tariff-rate-quota-import-licensing-regulation')),
    src('fas-dairy-proposed', 'Federal Register', '91 FR 11174', 'Proposed rule (USDA FAS)',
        'Dairy Tariff-Rate Quota Import Licensing Program', None, '2026-03-09',
        fr('2026-04599', '2026-03-09', 'dairy-tariff-rate-quota-import-licensing-program')),
    src('fas-dairy-proposed-ext', 'Federal Register', '91 FR 17893', 'Proposed rule; extension of comment period (USDA FAS)',
        'Dairy Tariff-Rate Quota Import Licensing Program', None, '2026-04-09',
        fr('2026-06873', '2026-04-09', 'dairy-tariff-rate-quota-import-licensing-program')),
    src('ustr-lca-suspension', 'Federal Register', '86 FR 36313', 'Notice (USTR)',
        'Suspension of Action: Enforcement of U.S. WTO Rights in the Large Civil Aircraft Dispute', None, '2021-07-09',
        fr('2021-14550', '2021-07-09', 'suspension-of-action-enforcement-of-us-wto-rights-in-the-large-civil-aircraft-dispute')),
    src('usda-egg-plan', 'USDA APHIS', 'USDA announcement (February 26, 2025)', 'Agency announcement',
        'USDA Invests Up To $1 Billion to Combat Avian Flu and Reduce Egg Prices', None, '2025-02-26',
        'https://www.aphis.usda.gov/news/agency-announcements/usda-invests-1-billion-combat-avian-flu-reduce-egg-prices'),
]
NEW_BY_ID = {s['id']: s for s in NEW}


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for i in ids:
        if i in have:
            continue
        s = NEW_BY_ID.get(i) or reuse.get(i)
        assert s, i
        page['sources'].append(s)
        have.add(i)


d['asOf'] = TODAY

# ---------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------
ov = d['overview']
ov['seo']['title'] = 'HTS Chapter 04: Dairy, Eggs & Honey Tariff Rates — Cheese, Butter, Milk Powder Import Duties | KoalaGains'
ov['seo']['shortDescription'] = (
    'Searchable duty table for all 272 HTS Chapter 04 lines — milk, cream, yogurt, whey, butter, cheese, eggs and honey. '
    'In-quota and over-quota dairy rates, FTA quotas, the 2026 Section 301 duties by country, the Canada Section 338 dairy duties and the honey antidumping orders.')
ov['seo']['keywords'] = ['HTS Chapter 04', 'dairy tariffs', 'cheese tariff', 'tariff on cheese from Europe', 'butter import tariff',
                         'dairy tariff rate quota', 'honey tariff', 'honey HS code 0409', 'egg imports tariff', 'USMCA dairy',
                         'natural honey imports', 'HTS 0406 cheese duty rate']
ov['intro'] = (
    "Chapter 04 covers dairy produce — milk and cream, milk powder, yogurt, whey, butter and cheese — plus birds' eggs, natural honey "
    'and edible insects. Its **272 tariff lines** are among the most complicated in the schedule because most dairy goods sit under a '
    '**tariff-rate quota**: the same cheese, butter or milk powder has a low in-quota line (for example 6.4%–25% of value on cheese, '
    '12.3¢/kg on butter) and an "Other" over-quota line with a high specific rate ($1.055–$2.269/kg on cheese, $1.541/kg on butter). '
    'Most in-quota dairy entries need a **USDA import licence**. Eggs (2.8¢ a dozen) and honey (1.9¢/kg) have low base rates.\n\n'
    'The U.S. imported **$4.06B** of Chapter 04 goods in 2025, led by cheese ($1.70B), honey ($691M) and butter and other milk fats ($494M). Since '
    '**July 24, 2026** goods from 60 economies pay a Section 301 duty on top: 10% in total for the EU, +10% or +12.5% for most others, '
    '+37.5% for Brazil. USMCA goods from Mexico enter free, but **Canadian dairy** pays a 50% Section 338 duty on 60 lines even with a USMCA claim, '
    'and Canadian whey has been **banned since September 29, 2026**. Raw honey from Argentina, Brazil, India, Vietnam and China also '
    'carries antidumping duties.')
BLURBS = {
    '0401': ('Fluid milk and cream by fat content. Skim and low-fat milk pay fractions of a cent per liter; cream over 6% fat is under a '
             'tariff-rate quota (additional U.S. notes 5 and 6) — 3.2¢/liter or 12.3¢/kg in quota, 77.2¢/liter or $1.646/kg above it. '
             'Fluid milk and cream also need an FDA Federal Import Milk Act permit.'),
    '0402': ('Milk powder, condensed and evaporated milk. Skim milk powder pays 3.3¢/kg in quota (note 7) and 86.5¢/kg above it; whole '
             'milk powder 6.8¢–13.7¢/kg in quota and $1.092–$1.556/kg above. On the Canada Section 338 dairy list (50%).'),
    '0403': ('Yogurt, buttermilk, kefir, sour cream and other fermented milk. Yogurt pays 20% in quota (note 10) or $1.035/kg + 17% above '
             'it; flavoured yogurt outside the quota description pays 17%.'),
    '0404': ('Whey, whey protein concentrate, modified whey and milk protein concentrate. Whey protein concentrate pays 8.5% with no quota; '
             'milk protein concentrate 0.37¢/kg; dried whey 3.3¢/kg in quota or 87.6¢/kg above. Whey (0404.10) from Canada is banned '
             'since September 29, 2026.'),
    '0405': ('Butter, ghee, butter oil, anhydrous milk fat and dairy spreads. Butter pays 12.3¢/kg in quota (note 6, licence required) and '
             '$1.541/kg above it; ghee and anhydrous milk fat 10% in quota or $1.865/kg + 8.5% above.'),
    '0406': ('Cheese and curd — 156 lines split by type (Cheddar, Swiss, Italian-type, blue-mold, Edam and Gouda, American-type) and by '
             'quota. In-quota lines (additional U.S. notes 16–25) pay 6.4%–25% with a USDA licence; over-quota lines pay $1.055–$2.269/kg. '
             "Sheep's-milk cheeses such as Pecorino Romano and Roquefort, and soft-ripened cheese like Brie, are outside the quotas."),
    '0407': ("Eggs in shell: hatching eggs, fresh table eggs and preserved eggs, all at 2.8¢ a dozen. Table eggs need an AMS foreign "
             'inspection certificate and must come from a region APHIS lists as free of highly pathogenic avian influenza and Newcastle '
             'disease, or meet APHIS conditions.'),
    '0408': ('Liquid, frozen and dried egg products and yolks: 9.7¢/kg, or 47.6¢/kg dried. Egg products are inspected by USDA FSIS and '
             'can come only from countries FSIS has found eligible.'),
    '0409': ('Natural honey at 1.9¢/kg, split for statistics into certified organic, comb and retail-packed honey, and bulk honey by colour. '
             'Raw (bulk) honey from Argentina, Brazil, India and Vietnam is under 2022 antidumping orders, and honey from China under a 2001 order.'),
    '0410': ('Edible insects and other edible animal products not elsewhere specified (for example edible bird nests and royal jelly) at 1.1%.'),
}
EXAMPLES = {
    '0401': ['milk', 'cream', 'skim milk', 'heavy cream', 'whole milk', 'sour cream fluid', 'organic milk', 'goat milk'],
    '0402': ['milk powder', 'skim milk powder', 'nonfat dry milk', 'whole milk powder', 'condensed milk', 'evaporated milk',
             'dulce de leche', 'infant milk powder'],
    '0403': ['yogurt', 'greek yogurt', 'kefir', 'buttermilk', 'sour cream', 'skyr', 'labneh', 'fermented milk'],
    '0404': ['whey', 'whey protein concentrate', 'whey powder', 'milk protein concentrate', 'modified whey', 'lactose-reduced whey',
             'casein', 'demineralized whey'],
    '0405': ['butter', 'irish butter', 'ghee', 'butter oil', 'anhydrous milk fat', 'dairy spread', 'clarified butter', 'cultured butter'],
    '0406': ['cheese', 'parmesan', 'cheddar', 'gouda', 'swiss cheese', 'gruyere', 'mozzarella', 'brie', 'feta', 'pecorino'],
    '0407': ['eggs', 'table eggs', 'hatching eggs', 'fertilized eggs', 'duck eggs', 'quail eggs', 'century eggs', 'shell eggs'],
    '0408': ['egg yolk', 'egg powder', 'dried eggs', 'liquid eggs', 'frozen egg', 'egg products', 'dried yolk'],
    '0409': ['honey', 'manuka honey', 'raw honey', 'organic honey', 'comb honey', 'bulk honey', 'acacia honey', 'clover honey'],
    '0410': ['insects', 'cricket flour', 'edible insects', 'bird nest', 'royal jelly', 'mealworms'],
}
for g in ov['productGroups']:
    g['blurb'] = BLURBS[g['heading']]
    g['searchExamples'] = EXAMPLES[g['heading']]

ov['workedExamples'] = [
    {'title': 'Parmigiano Reggiano wheels from Italy',
     'line': '0406.90.32.00',
     'body': ('10,000 kg at $15/kg ($150,000). Inside the EU share of the Italian-type cheese quota (additional U.S. note 21), with a '
              'USDA licence, the line is 0406.90.31 at 25%: **$37,500**. Without a licence the same cheese enters 0406.90.32 at $2.146/kg: '
              '**$21,460** — at this price the "over-quota" rate is lower than the in-quota 25%. Both are above 10% of value, so the EU '
              'Section 301 rate (10% in total, 9903.05.39) adds nothing. The price-based safeguard stops at $3.35/kg, so it does not apply either.')},
    {'title': 'Irish butter in 25 kg blocks',
     'line': '0405.10.20.00',
     'body': ('20,000 kg at $7/kg ($140,000). Inside the 6,977 t butter quota (note 6) with a USDA licence it is 0405.10.10 at 12.3¢/kg '
              '($2,460, 1.8% of value) — but EU goods with a base rate under 10% pay **10% in total** under Section 301: **$14,000**. '
              'Over quota it is 0405.10.20 at $1.541/kg: **$30,820** (22% of value, so no Section 301 add-on).')},
    {'title': 'Bulk light-amber honey from India',
     'line': '0409.00.00.56',
     'body': ('20,000 kg in drums at $2.50/kg ($50,000). Base duty 1.9¢/kg = **$380**; India pays +10% under Section 301 (9903.05.44) = '
              '**$5,000**. Raw honey from India is also under an antidumping order: a cash deposit at the exporter\'s rate, or **5.87%** for '
              'exporters without their own rate (87 FR 35501) — about **$2,935** more. Retail jars of 5 lb or less are outside the order.')},
    {'title': 'Canadian Cheddar with a USMCA claim',
     'line': '0406.90.08.10',
     'body': ('5,000 kg at $9/kg ($45,000). Canada\'s Cheddar quota is 833,417 kg (note 18) and USMCA-qualifying cheese is Free — but '
              '0406.90.08 is one of the Chapter 04 lines on the Canada Section 338 list (9903.03.12, since September 15, 2026), and that '
              '50% applies even with a USMCA claim: **$22,500**. The 10% Section 301 duty on Canada does not apply to USMCA goods (9903.05.93).')},
    {'title': 'Table eggs from Türkiye',
     'line': '0407.21.00.30',
     'body': ('30,000 dozen at $2.00/dozen ($60,000). Base duty 2.8¢ a dozen = **$840**; Türkiye pays +12.5% under Section 301 (9903.05.79) '
              '= **$7,500**. The eggs need an AMS foreign inspection certificate (7 CFR 57.915) and, if they come from a region APHIS lists '
              'for avian influenza or Newcastle disease, the certificate and handling conditions of 9 CFR 94.6(c).')},
]
ov['notes']['chapterNotes'] = (
    '**Note 1.** "Milk" means full cream milk or partially or completely skimmed milk.\n\n'
    '**Note 2.** Yogurt (heading 0403) may be concentrated or flavoured and may contain added sugar, fruit, nuts, cocoa, spices, coffee, '
    "cereals or bakers' wares, provided nothing added replaces a milk constituent and the product keeps the essential character of yogurt.\n\n"
    '**Note 3.** "Butter" (heading 0405) is natural, whey or recombined butter derived exclusively from milk with 80%–95% milkfat, at '
    'most 2% milk solids-not-fat and at most 16% water. "Dairy spreads" are water-in-oil spreads with milkfat as the only fat, at 39% '
    'or more but less than 80% milkfat.\n\n'
    '**Note 4.** Concentrated whey with added milk or milkfat is cheese (0406) if it has 5% or more milkfat in the dry matter, 70%–85% '
    'dry matter and is molded or mouldable.\n\n'
    '**Note 5.** Not covered: inedible non-living insects (0511); whey products over 95% lactose (1702); milk products in which a natural '
    'constituent is replaced by another substance (1901 or 2106); albumins, including whey protein concentrates over 80% whey protein '
    'in the dry matter (3502), and globulins (3504).\n\n'
    '**Note 6.** "Insects" (0410) are edible non-living insects, whole or in parts, fresh, chilled, frozen, dried, smoked, salted or in '
    'brine, and insect flours and meals fit for human consumption; otherwise prepared insects go to section IV.\n\n'
    '**Subheading notes.** "Modified whey" (0404.10) is whey with lactose, proteins or minerals removed or added; "butter" in 0405.10 '
    'does not include dehydrated butter or ghee (0405.90).')
ov['notes']['additionalUsNotes'] = (
    '**Note 1.** Defines "dairy products described in additional U.S. note 1 to chapter 4": malted milk and articles of milk or cream, '
    'articles over 5.5% butterfat suitable as food ingredients, and dried milk, whey or buttermilk mixtures with over 16% milk solids '
    'not packed for the ultimate consumer.\n\n'
    '**Note 2.** "EU 27" means products of the 27 EU member states.\n\n'
    '**Note 3.** "Soft ripened cow\'s milk cheese": a mold-ripened crust, ripening from the surface inward, at least 50% fat (dry basis) '
    'and at least 65% moisture in the non-fat matter.\n\n'
    '**Note 4.** Defines "capable of being further processed", "prepared for marketing to the ultimate consumer" and "ultimate consumer" '
    '(not hospitals, prisons, military, restaurants, hotels, bars or bakeries).\n\n'
    '**Notes 5–14 (quotas on milk, cream, butter, powders and butterfat products).** Yearly in-quota quantities: cream 6% to 45% fat '
    '6,694,840 liters (New Zealand at least 5,678,117 liters); butter and high-fat cream 6,977,000 kg; skim and whole milk powder '
    '5,261,000 kg, 3,321,300 kg and 99,500 kg; note 1 dairy products 4,105,000 kg (Australia at least 1,016,046 kg); condensed and '
    'evaporated milk 6,857,300 kg with country shares for Australia, Canada, Denmark, Germany and the Netherlands; dried milk, cream and '
    'whey 296,000 kg; butter substitutes and butter oil 6,080,500 kg. Milk protein concentrate (note 13) means 40% or more protein. '
    'Notes 6, 7, 8, 12 and 14 require a USDA import licence. Mexico is excluded from all of these quotas (USMCA goods of Mexico enter free).\n\n'
    '**Note 15.** No weight allowance for inedible protective coverings of cheese.\n\n'
    '**Notes 16–25 (cheese quotas, by country).** Other cheese (note 16): EU 27 25,632,850 kg, New Zealand 11,322,000 kg, Australia '
    '3,050,000 kg, United Kingdom 2,213,374 kg, Switzerland 1,720,000 kg, Costa Rica 1,550,000 kg, Canada 1,141,000 kg and smaller '
    'shares. Blue-mold (17): EU 27 2,805,383 kg. Cheddar (18): New Zealand 8,200,000 kg, Australia 2,450,000 kg, United Kingdom '
    '895,948 kg, Canada 833,417 kg (aged unpasteurized Canadian Cheddar certified by Canada needs no licence). American-type (19), '
    'Edam and Gouda (20: EU 27 6,389,000 kg), Italian-type (21: Argentina 6,383,000 kg, EU 27 5,407,000 kg, Uruguay 1,178,000 kg), '
    'Swiss without eyes and Gruyère-process (22: EU 27 5,925,000 kg, Switzerland 1,850,000 kg), low-fat cheese (23), Swiss with eyes '
    '(25: EU 27 22,900,000 kg, Norway 6,883,000 kg, Switzerland 3,630,000 kg). All need a USDA licence. Stilton from the UK has no '
    'quantity limit (note 24).\n\n'
    '**Note 26.** Eggs of wild birds may not be imported, except game-bird eggs for propagation under Interior Department rules and '
    'specimens for scientific collections.')

# ---------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['seo']['title'] = 'HTS Chapter 04 Tariff Updates 2026 — Canada Dairy Duties & Ban, Section 301 on Cheese, Honey Antidumping | KoalaGains'
tu['seo']['shortDescription'] = (
    'What changed for dairy, egg and honey imports (HTS Chapter 04) since January 2025: the end of the IEEPA and Section 122 duties, '
    'the 2026 Section 301 tariffs on cheese and butter, the 50% Section 338 duties and whey ban on Canadian dairy, the honey '
    'antidumping reviews and the 2026 dairy quota and licensing notices, with Federal Register citations.')
tu['seo']['keywords'] = ['HTS Chapter 04 tariff updates', 'dairy tariffs 2026', 'us tariff on canadian dairy', 'Canada dairy import ban',
                         'Section 301 cheese tariff', 'honey antidumping duty', 'Section 122 tariffs dairy', 'dairy tariff rate quotas 2026']
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current '
    '**2026 Revision 21** (in force October 9, 2026). **All 272 Chapter 04 base rates are unchanged** — the dairy quotas, the '
    'in-quota and over-quota rates, 2.8¢ a dozen on eggs and 1.9¢/kg on honey are the same as in January 2025.\n\n'
    'What changed sits on top of the base rate. The 2025 IEEPA tariffs ended on February 24, 2026, and the 10% Section 122 surcharge '
    'that replaced them expired on July 23, 2026. Since **July 24, 2026** dairy, eggs and honey from 60 economies pay a **Section 301** '
    'duty: 10% in total for EU cheese and butter whose base rate is lower, +10% for India, Argentina, the UK and non-USMCA goods of '
    'Canada and Mexico, +12.5% for New Zealand, Australia, Türkiye, Vietnam and Switzerland (a 12.5% floor), +37.5% for Brazil. '
    '**Canada** was singled out: a **50% Section 338 duty** on Canadian milk powder, whey, many cheeses and honey since August 22 and '
    'September 15, 2026 — USMCA claims do not avoid it — and an **import ban on Canadian whey** since September 29, 2026. Honey '
    'importers also saw new antidumping review results for Argentina, Brazil, India and Vietnam.')
tu['scope'] = (
    'Measures that reach Chapter 04 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the '
    'older China Section 301 lists, the Canada Section 338 duties and import ban, the Section 232 aluminum duty on three Russian lines, '
    'the Nicaragua Section 301 tariff that starts in 2027, the 2025–2026 IEEPA and Section 122 duties that have ended, the honey '
    'antidumping orders, and USDA notices on dairy quotas and licensing. Dairy tariff-rate quotas and the Chapter 99 subchapter IV '
    'agricultural safeguards are part of the base schedule and are explained on the duty-saving rules page. For the rate each supplier '
    'pays, see Rates by country.')

IE = {
    'nz-section-301': (
        'No Chapter 04 line is on the general Section 301 exemption list (U.S. note 52(b)) or a country exception list. New Zealand has '
        'no FTA with the United States, so its cheese and butter use the WTO country shares of the dairy quotas (for example 11,322,000 kg '
        'of note 16 cheese and 8,200,000 kg of Cheddar) and pay the over-quota rate above them. The IEEPA reciprocal duty ended February 24, 2026.',
        'New Zealand butter, whey protein, milk protein concentrate and manuka honey pay their base rate plus 12.5% of value — on honey '
        '1.9¢/kg plus 12.5%. New Zealand is not under any honey antidumping order.'),
    'eu-section-301': (
        'For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); lines already at 10% or '
        'more pay only their base rate. No Chapter 04 line is on the general exemption list (note 52(b)) or the EU exception list. This '
        'replaced the IEEPA reciprocal rate for the EU, which ended February 24, 2026. The 2019 large civil aircraft (Airbus) Section 301 '
        'duties on EU cheese and butter (9903.89.xx) are still printed in Chapter 99 but suspended since 2021 (U.S. note 21(x); 86 FR 36313).',
        'Most EU cheese already pays more than 10% — up to 25% in quota or $1.055–$2.269/kg above — so for cheese the Section 301 rate '
        'often adds nothing. Low-rate goods are lifted to 10%: in-quota butter (12.3¢/kg), cream, eggs and honey from the EU pay 10% of value.'),
    'ca-section-301': (
        'USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.93). The Section 338 duties are separate and '
        'apply **even with a USMCA claim** (U.S. note 51(a)): milk powder, whey and milk protein products (9903.03.13, 52 provisions, '
        'from August 22, 2026), 23 cheese provisions (9903.03.12, from September 15, 2026), honey (9903.03.14, from August 22, 2026) and '
        'other cheese 0406.90.99 (9903.03.14, from September 15, 2026). Whey (all of 0404.10) moved from the 50% duty to an import ban on '
        'September 29, 2026 (Proclamation 11062). The 35% IEEPA duty on non-USMCA Canadian goods ended February 24, 2026.',
        'USMCA-qualifying Canadian yogurt, butter, eggs and the unlisted cheeses enter free (in-quota dairy within Canada\'s USMCA quotas). '
        'Canadian skim milk powder, Cheddar, many other cheeses and honey pay **50% of value** even under USMCA; non-qualifying goods pay '
        'base + 10% + 50%. Canadian whey cannot be imported at all.'),
    'mx-section-301': (
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94). Mexico is excluded from the WTO dairy quotas (additional U.S. notes '
        '5–25) because USMCA-qualifying Mexican dairy is free without limit (Chapter 98 subchapter XXIII, 9823.xx.01). The 25% IEEPA duty '
        'on non-USMCA Mexican goods ended February 24, 2026.',
        'USMCA-qualifying Mexican milk powder, cheese, eggs and honey enter free. Non-qualifying goods pay the base rate plus 10% of value — '
        'for dairy the over-quota rate, since Mexico has no WTO quota share.'),
    'in-section-301': (
        'No Chapter 04 line is on the general exemption list (note 52(b)) or an India exception list. GSP has lapsed, so no '
        'GSP rate applies. The IEEPA duties on India ended February 24, 2026.',
        'Indian honey — the largest supplier in 2025 at $180M — pays 1.9¢/kg plus 10% of value, plus an antidumping cash deposit on raw '
        'honey (5.87% unless the exporter has its own rate). Ghee pays 10% in quota or $1.865/kg + 8.5% above, plus 10%.'),
    'br-section-301': (
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 (9903.05.27). '
        'One Chapter 04 line is on the Brazil exemption list: **certified organic honey (0409.00.00.05)** pays no 25% (U.S. note 50(a)(ii), '
        '9903.05.03), but still pays the 12.5%. The 2025 IEEPA duties on Brazil (10% reciprocal plus 40%) ended February 24, 2026.',
        'Brazilian conventional honey pays 1.9¢/kg plus 37.5% of value, plus an antidumping cash deposit on raw honey; certified organic '
        'Brazilian honey pays 1.9¢/kg plus 12.5% plus the deposit. Brazilian eggs ($46M in 2025) pay 2.8¢ a dozen plus 37.5%.'),
    'ar-section-301': (
        'No Chapter 04 line is on an exemption list. Argentina has WTO shares of the cheese quotas (6,383,000 kg of Italian-type cheese, '
        '235,000 kg of Edam and Gouda). The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'Argentine raw honey pays 1.9¢/kg plus 10% of value plus an antidumping cash deposit (16.92% all-others rate; 17.76% for '
        'companies reviewed for 2023–2024).'),
    'gb-section-301': (
        'No Chapter 04 line is on an exemption list. The United Kingdom has its own WTO quota shares since Brexit (for example 2,213,374 kg '
        'of note 16 cheese, 895,948 kg of Cheddar, 23,617 kg of blue-mold cheese), and UK Stilton has no quota limit (note 24). The 10% '
        'IEEPA reciprocal duty ended February 24, 2026. The suspended 2019 aircraft-dispute duties covered UK cheese too.',
        'UK Cheddar pays 12% in quota (with a licence) or $1.227/kg above it, plus 10% of value; UK eggs pay 2.8¢ a dozen plus 10%.'),
    'tr-section-301': (
        'No Chapter 04 line is on an exemption list. The IEEPA reciprocal duty on Türkiye ended February 24, 2026.',
        'Turkish table eggs — $29M in 2025 — pay 2.8¢ a dozen plus 12.5% of value, about $0.25 a dozen extra at $2 a dozen.'),
    'ch-section-301': (
        'For Swiss goods the Section 301 rate works as a 12.5% floor (9903.05.74). Insects (0410.10) are on Switzerland\'s exception list '
        '(U.S. note 52(j)(3), 9903.05.98). Switzerland has WTO cheese quota shares: 1,720,000 kg of note 16 cheese, 1,850,000 kg of '
        'Swiss/Gruyère without eyes and 3,630,000 kg of Swiss with eyes. The IEEPA reciprocal duty ended February 24, 2026.',
        'Gruyère and Emmentaler pay their in-quota rate (6.4% for Swiss with eyes, 10%–19% for others) lifted to 12.5% where lower, or the '
        'over-quota $1.803–$2.269/kg — whichever is higher than 12.5% of value.'),
    'vn-section-301': (
        'No Chapter 04 line is on an exemption list. The IEEPA reciprocal duty on Vietnam ended February 24, 2026.',
        'Vietnamese raw honey pays 1.9¢/kg plus 12.5% of value plus an antidumping cash deposit — 17.80% for exporters with a separate '
        'rate in the 2023–2024 review, 60.03% for the Vietnam-wide entity.'),
    'au-section-301': (
        'U.S. note 52(a): the 12.5% applies even when an Australia FTA (AU) rate is claimed. No Chapter 04 line is on an exemption list. '
        'Australia has its own FTA dairy quotas in Chapter 98 (9822.04.05–9822.04.65; 2026 quantities in 91 FR 16080) on top of its WTO '
        'shares. The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'Australian dairy within the FTA quotas, honey and eggs pay 0% base duty plus 12.5% of value; dairy above the FTA quota pays the '
        'over-quota rate plus 12.5%.'),
    'cn-section-301': (
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and either +25% under List 3 (9903.88.03 — whey, butter, '
        'eggs, egg products, honey and insects, 28 lines) or +7.5% under List 4A (9903.88.15 — milk, cream, yogurt, cheese and the rest). '
        'The IEEPA duty on China ended February 24, 2026. Chinese honey is also under an antidumping order since 2001, continued in 2023.',
        'Chinese honey pays 1.9¢/kg plus 37.5% of value plus antidumping duty; Chinese cheese or milk powder pays its base rate plus 20%.'),
    'ru-section-301': (
        'Russia pays the Column 2 rates and the 12.5% Section 301 duty (9903.05.66). Three condensed-milk lines (0402.99.68, 0402.99.70, '
        '0402.99.90) are on the Section 232 aluminum derivative list and pay a further 200% when they are products of Russia (9903.85.68).',
        'Chapter 04 imports from Russia are negligible; for the three listed lines the duty would exceed 200% of value.'),
    'other-section-301': (
        'No Chapter 04 line is on the general exemption list (note 52(b)). Insects (0410.10) are on the exception lists of Malaysia, '
        'Cambodia, Indonesia, Ecuador and Jordan (note 52(j); 9903.05.99, 9903.06.02, 9903.06.16, 9903.06.18, 9903.06.20). Chile, '
        'Colombia, Peru, Korea, Panama and the CAFTA-DR countries keep their FTA rates, but the Section 301 duty applies on top (note 52(a)). '
        'Countries outside the 60 economies pay no extra duty.',
        'Chilean milk powder ($62M in 2025) enters free under the Chile FTA but pays 12.5% of value; Colombian and Peruvian dairy pay 10% '
        'or 12.5%. Indonesian edible insects (0410.10) are on Indonesia\'s exception list and pay only 1.1%; other edible animal products such as bird nests (0410.90) pay 1.1% plus 10%.'),
}
for e in tu['inEffect']:
    ex, wim = IE[e['id']]
    e['exemption'] = ex
    e['whatItMeans'] = wim
tu['inEffect'][[e['id'] for e in tu['inEffect']].index('ca-section-301')]['sourceIds'].append('procl-11062')
tu['inEffect'][[e['id'] for e in tu['inEffect']].index('eu-section-301')]['sourceIds'].append('ustr-lca-suspension')
tu['inEffect'][[e['id'] for e in tu['inEffect']].index('au-section-301')]['sourceIds'].append('ustr-ausfta-2026')
for k in ('cn-section-301',):
    tu['inEffect'][[e['id'] for e in tu['inEffect']].index(k)]['sourceIds'].append('fr-2023-21823')
for k in ('in-section-301', 'ar-section-301', 'vn-section-301', 'br-section-301'):
    tu['inEffect'][[e['id'] for e in tu['inEffect']].index(k)]['sourceIds'].append('fr-2022-12498')
tu['inEffect'][[e['id'] for e in tu['inEffect']].index('ar-section-301')]['sourceIds'].append('fr-2026-15436')
tu['inEffect'][[e['id'] for e in tu['inEffect']].index('vn-section-301')]['sourceIds'].append('fr-2026-11866')

gen_changes = {c['id']: c for c in tu['changes']}
gen_changes['section-301-nicaragua-scheduled-2027-01-01']['detail'] = (
    'Scheduled Section 301 duty on products of Nicaragua (9903.89.01): 0% in 2026, +10% from January 1, 2027 and +15% from '
    'January 1, 2028. CAFTA-DR originating goods are excluded. Nicaragua sold $59M of Chapter 04 goods to the U.S. in 2025, mostly cheese; '
    'it already pays the 12.5% forced-labor Section 301 duty (9903.05.58).')
gen_changes['section-338-canada-2026-09-15']['title'] = 'Canada Section 338: 50% extended to Canadian cheeses'
gen_changes['section-338-canada-2026-09-15']['detail'] = (
    'Proclamations 11064 and 11065 added provisions to the Canada lists from September 15, 2026 (CSMS 69851916): 23 cheese provisions '
    'joined the 9903.03.12 list (for example 0406.10.64, 0406.20.33, 0406.30.91, 0406.40.70, 0406.90.08, 0406.90.12, 0406.90.95) and '
    'other cheese 0406.90.99 joined 9903.03.14. They pay base rate + 50%, including USMCA goods (U.S. note 51(a)).')
gen_changes['section-338-canada-2026-08-22']['title'] = 'Canada Section 338: 50% on Canadian milk powder, whey and honey'
gen_changes['section-338-canada-2026-08-22']['detail'] = (
    'Proclamation 11047 (dairy, 9903.03.13) put a 50% duty on Canadian skim and whole milk powder (0402.10, 0402.21), evaporated milk '
    '(0402.91.03, 0402.91.06), 0402.99.68, whey (0404.10) and milk protein products (0404.90); Proclamation 11048 (9903.03.14) listed '
    'natural honey (0409.00.00). Both were due August 19, were suspended for three days (Proclamation 11056) and took effect August 22, '
    '2026. The duty applies even to USMCA-qualifying goods (U.S. note 51(a)).')
gen_changes['section-301-2026-60-economies-2026-07-24']['detail'] = (
    'USTR\'s forced-labor Section 301 action: +10% or +12.5% on products of 60 economies (9903.05.20–9903.05.84), or 10% / 12.5% in '
    'total in place of a lower base rate for the EU, Switzerland, Japan, Korea and Taiwan. No Chapter 04 line is on the general '
    'exemption list; insects (0410.10) are on six country exception lists. USMCA goods of Canada and Mexico are exempt (9903.05.93, 9903.05.94).')
gen_changes['section-301-brazil-2026-07-22']['detail'] = (
    '+25% on products of Brazil (9903.05.01), on top of the 12.5% forced-labor action two days later. Certified organic honey '
    '(0409.00.00.05) is the only Chapter 04 line on the Brazil exemption list (U.S. note 50(a)(ii), 9903.05.03).')
gen_changes['section-232-aluminum-russia-2025-08-18']['detail'] = (
    'Commerce added 0402.99.68, 0402.99.70 and 0402.99.90 (condensed milk, which is often canned in aluminum) to the Section 232 aluminum '
    'derivative list; products of Russia pay +200% (9903.85.68). No other origin pays a Section 232 duty on Chapter 04 goods.')


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {'id': id, 'type': type, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before,
            'now': now, 'countries': countries, 'sourceIds': sids}


NEW_CHANGES = [
    ch('ca-dairy-ban', 'extraDuty', '2026-09-29', 'Effective', 'Canadian whey banned from import',
       'Proclamation 11062 moved Canadian whey and modified whey (all eight 0404.10 lines) from the 50% Section 338 duty to an import '
       'ban for goods imported from 12:01 a.m. ET on September 29, 2026. The ban has no USMCA exception. Whey already imported but not '
       'yet entered before that date pays the 50%. The other Canadian dairy lines on the 9903.03.13 list (milk powder, milk protein '
       'products) still pay 50%.',
       '+50%', 'Import banned', 'Canada', ['procl-11062', 'hts-now']),
    ch('honey-ad-prelim-2025', 'reference', '2026-09-14', 'Published', 'Honey antidumping: preliminary 2024–2025 review rates',
       'Commerce\'s preliminary rates for June 2024 – May 2025 entries: Argentina 1.93% (NEXCO), 6.80% (Villamora), 3.48% for '
       'non-selected companies; Brazil 1.67% (Melbras), 2.64% (Minamel), 2.16% non-selected; Vietnam 30.21% (Ban Me Thuot), 39.61% '
       '(Daklak), 34.91% for separate-rate companies. Cash deposits change only when the final results are published.',
       None, None, 'Argentina, Brazil, Vietnam', ['fr-2026-18701', 'fr-2026-18718', 'fr-2026-18702']),
    ch('dairy-trq-2027', 'reference', '2026-09-02', 'Published', 'USDA sets 2027 dairy licence fee and quota safeguard triggers',
       'USDA FAS set the 2027 dairy import licence fee at $325 per licence, moved quantities from the historical to the lottery licence '
       'category for 2027, and published the 2026 quantity-based safeguard trigger levels (for example 13,939,120 kg for Cheddar, '
       '25,149,925 kg for Italian-type cheese, 65,006,970 kg for butter). The notice sets trigger levels only; quantity-based safeguard '
       'duties apply only during a period the Secretary of Agriculture announces.',
       None, None, 'All', ['fas-dairy-fee-2027', 'fas-dairy-appendices-2027', 'fas-safeguard-2026']),
    ch('honey-ad-final-2024', 'reference', '2026-07-30', 'Published', 'Honey antidumping: final 2023–2024 review rates',
       'Final rates for June 2023 – May 2024 entries, published June 3 – July 30, 2026: Argentina 17.76% (amended; ACA and non-examined '
       'companies); Brazil 4.48% (Melbras), 10.48% (Minamel), 7.48% non-examined; India 6.98% (Indocan), 1.11% (Shakti), 3.99% non-selected; '
       'Vietnam 26.77% (Ban Me Thuot), 8.83% (Daklak), 17.80% separate rate, 60.03% Vietnam-wide entity. These became the cash deposit '
       'rates for those exporters; others keep the all-others rates (Argentina 16.92%, Brazil 9.38%, India 5.87%).',
       None, None, 'Argentina, Brazil, India, Vietnam',
       ['fr-2026-15436', 'fr-2026-11865', 'fr-2026-11121', 'fr-2026-12301', 'fr-2026-11866']),
    ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
       'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
       'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending '
       'resolution of the issues or until termination, so USMCA claims (SPI S, S+) and the Canada dairy quotas in Chapter 98 subchapter '
       'XXIII still apply.', None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    ch('ausfta-2026', 'reference', '2026-03-31', 'Published', 'Australia FTA dairy quotas for 2026',
       'USTR published the 2026 Australia FTA quantities: for example 25,497,000 liters of cream (9822.04.05), 9,751 t (9822.04.35) and '
       '5,572 t (9822.04.40) of cheese, 1,395 t of Cheddar (9822.04.45), 10,199 t of condensed milk (9822.04.30) and 2,790 t of butter '
       'and butterfat goods (9822.04.10). Within them, Australian dairy is Free; above them it pays the over-quota rate.',
       None, None, 'Australia', ['ustr-ausfta-2026', 'hts-ch98']),
    ch('dairy-licensing-proposed', 'pending', '2026-03-09', 'Proposed', 'Proposed rewrite of the dairy import licensing rules',
       'USDA FAS proposed amending 7 CFR part 6 subpart B: clearer language, a new section on licence transfers, stronger suspension and '
       'revocation, and an earlier surrender date so surrendered quantities can be reallocated sooner. Comments closed April 23, 2026 '
       '(extended from April 8); no final rule has been published.',
       None, None, 'All', ['fas-dairy-proposed', 'fas-dairy-proposed-ext']),
    ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
       '10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 04 line was on the product exemption lists '
       '(9903.03.03–9903.03.06); USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).',
       'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'hts-now']),
    ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
       'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, '
       'Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods '
       'entered from 12:00 a.m. ET on February 24. No Chapter 04 line had been on the 2025 agricultural exemption lists. The 9903.01.xx '
       'and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.',
       'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    ch('br-40', 'extraDuty', '2025-08-06', 'Effective', '40% IEEPA duty on products of Brazil',
       '+40% on most products of Brazil (9903.01.77) on top of the 10% reciprocal duty — Brazilian honey and eggs included. Ended '
       'February 24, 2026.', 'None', '+40% (ended)', 'Brazil', ['eo-14323']),
    ch('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
       'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.', '+25%', '+35% (ended)',
       'Canada', ['eo-14325']),
    ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
       '10% baseline (9903.01.25) and higher country rates (9903.02.xx), later adjusted by country deals; Canada and Mexico '
       'excluded. No dairy, egg or honey line was taken out by the November 2025 '
       'agricultural exemptions. Ended February 24, 2026.', 'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257']),
    ch('egg-plan', 'reference', '2025-02-26', 'Announced', 'USDA avian-flu and egg-price plan',
       'USDA announced up to $1 billion for biosecurity, farmer relief and vaccine research to fight highly pathogenic avian influenza and '
       'lower egg prices, and said it would look at temporary egg imports. No tariff changed: shell eggs stayed at 2.8¢ a dozen. U.S. '
       'imports of fresh table eggs (0407.21) rose from $6.8M in 2024 to $122.4M in 2025 (UN Comtrade).',
       None, None, 'All', ['usda-egg-plan']),
    ch('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
       '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.', 'None',
       '+25% (ended)', 'Mexico', ['eo-14194']),
    ch('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
       '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.',
       'None', '+25% (ended)', 'Canada', ['eo-14193']),
]
tu['changes'] = sorted(list(gen_changes.values()) + NEW_CHANGES, key=lambda c: c['date'], reverse=True)
add_sources(tu, ['hts-ch4', 'hts-ch98', 'procl-11062', 'fr-2022-12498', 'fr-2023-21823', 'fr-2026-11121', 'fr-2026-11865',
                 'fr-2026-11866', 'fr-2026-12301', 'fr-2026-15436', 'fr-2026-18701', 'fr-2026-18702', 'fr-2026-18718',
                 'fas-safeguard-2026', 'fas-dairy-fee-2027', 'fas-dairy-appendices-2027', 'fas-dairy-proposed', 'fas-dairy-proposed-ext',
                 'ustr-lca-suspension', 'usda-egg-plan', 'ustr-ausfta-2026', 'ustr-usmca-review', 'procl-11012', 'scotus-24-1287',
                 'eo-14389', 'csms-67834313', 'eo-14323', 'eo-14325', 'eo-14257', 'eo-14194', 'eo-14193'])

# ---------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 04: Dairy, Eggs & Honey — U.S. Import Statistics'
ui['seo']['title'] = 'U.S. Dairy, Cheese, Egg & Honey Imports by Country 2020–2025 (HTS Ch. 04) | KoalaGains'
ui['seo']['shortDescription'] = (
    'U.S. imports of dairy, eggs and honey 2020–2025 by country, product and year: $4.06B in 2025, down 9.7%, led by cheese from '
    'Italy and France, New Zealand butter and whey, Indian and Argentine honey — and a jump in egg imports.')
ui['seo']['keywords'] = ['us dairy imports by country', 'us cheese imports by country', 'us honey imports by country',
                         'us egg imports by country', 'where does the us import eggs from', 'does the us import milk',
                         'HTS Chapter 04 import statistics']
ui['why'] = (
    'U.S. imports of Chapter 04 goods fell from **$4.49B in 2024 to $4.06B in 2025** (−9.7%), after rising every year since 2020 '
    '($2.70B). The drop came from **cheese** (−$301M to $1.70B) and **butter** (0405 −$333M to $494M): imports from Ireland halved '
    'from $641M to $318M, Italy fell from $536M to $398M and Switzerland from $133M to $57M. Those were the countries whose goods '
    'paid the 2025 IEEPA reciprocal duties on top of over-quota cheese and '
    'butter rates that were already high.\n\n'
    '**Eggs went the other way.** After avian influenza cut the U.S. laying flock, shell-egg imports (0407) more than doubled from $92M '
    'to $221M and fresh table eggs (0407.21) rose from $6.8M to $122.4M — from Brazil, Canada, Mexico, Türkiye and the UK. **Honey** '
    'grew 6.2% to $691M; India ($180M), Argentina ($139M), Brazil ($104M) and New Zealand ($79M) supply most of it, and the 2022 '
    'antidumping orders shape which exporters sell raw honey. New Zealand stayed the largest single supplier ($579M) on butter, whey and '
    'milk protein concentrate. 2025 is the latest full year of U.S. trade data, so the 2026 Section 301 and Canada Section 338 duties '
    'are not yet in these figures.')
ui['effectiveDuty']['note'] = (
    "Duty-collected figures aren't available from an official source yet. Most cheese and butter pays either an in-quota rate (with a "
    'USDA licence) or a specific over-quota rate; eggs and honey carry low base rates, and honey can carry antidumping deposits that are '
    'not part of the tariff.')

# ---------------------------------------------------------------------------------------------
# Industry areas (rates by country)
# ---------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo']['title'] = 'Dairy, Cheese & Honey Tariff Rates by Country — EU, New Zealand, Canada, India (HTS Ch. 04) | KoalaGains'
ia['seo']['shortDescription'] = (
    'The total U.S. tariff on dairy, eggs and honey by country and product group: base rate (in quota and above quota) plus the 2026 '
    'Section 301 duty and the Canada Section 338 duties, with USMCA and FTA quotas applied. Italy, France, Ireland, New Zealand, Canada, '
    'Mexico, India, Brazil, Argentina and more.')
ia['seo']['keywords'] = ['tariff on italian cheese', 'tariff on french cheese', 'tariff on irish butter', 'us tariff on canadian dairy',
                         'tariff on new zealand products', 'us tariff on indian honey', 'tariff on swiss cheese',
                         'HTS Chapter 04 tariff rates by country']
ia['intro'] = (
    'The total rate on dairy, eggs and honey depends on **what it is, whether it enters inside a quota, and where it comes from**. '
    'Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference — computed '
    'from the current tariff schedule with the same engine as the tariff calculator. Dairy cells mix in-quota and over-quota lines; '
    'quota lines priced under an FTA quota (Australia, USMCA Canada) show "within quota" and "above quota" totals.\n\n'
    '**EU cheese and butter** pay 10% in total where the base rate is lower, otherwise the base rate (most over-quota cheese is already '
    'well above 10%). **New Zealand, Australia, Vietnam and Türkiye** pay +12.5%, **India, Argentina and the UK** +10%, **Brazil** +37.5% '
    '(+12.5% on certified organic honey). USMCA goods from **Mexico** enter free; **Canada** pays 50% on milk powder, many cheeses '
    'and honey even with a USMCA claim, and its whey is banned. Antidumping deposits on honey are on top of these rates and are not in the grid.')
RULE_LABELS = {
    'New Zealand': 'Base rate + 12.5% Section 301 (9903.05.57) on every line. No FTA: dairy uses New Zealand\'s WTO quota shares (for example 11,322,000 kg of note 16 cheese, 8,200,000 kg of Cheddar) and pays the over-quota rate above them.',
    'Italy': 'EU: 10% in total where the base rate (or its value equivalent) is under 10%, otherwise the base rate (9903.05.39). Italian-type cheese uses the EU 27 quota share (5,407,000 kg) at 15%–25% with a licence, or $2.146/kg above it.',
    'France': 'EU: 10% in total where the base rate is under 10%, otherwise the base rate (9903.05.39). Soft-ripened cheese such as Brie is outside the quotas; most other cheese is in-quota (with a licence) or over-quota.',
    'Canada': 'USMCA-qualifying: Free, no Section 301 (9903.05.93), but + 50% Section 338 on the listed lines even under USMCA — milk powder, whey and milk protein products (9903.03.13), 23 cheese provisions (9903.03.12), honey and 0406.90.99 (9903.03.14); whey (0404.10) is banned since September 29, 2026. Canada\'s USMCA dairy quotas (9823.xx) price in-quota Free and above-quota at the over-quota rate + 10%. Otherwise base rate + 10% Section 301 (9903.05.29) + 50% on the listed lines.',
    'Ireland': 'EU: 10% in total where the base rate is under 10%, otherwise the base rate (9903.05.39). Butter: 12.3¢/kg in quota (licence) → 10%; $1.541/kg above it.',
    'Mexico': 'USMCA-qualifying: Free, no extra duty (9903.05.94), with no quota limit. Otherwise base rate + 10% Section 301 (9903.05.55); Mexico has no share of the WTO dairy quotas, so non-qualifying dairy pays the over-quota rate.',
    'India': 'Base rate + 10% Section 301 (9903.05.44) on every line. Raw honey also carries an antidumping deposit (not in the grid).',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% forced-labor Section 301 (9903.05.27) = +37.5%, except certified organic honey (0409.00.00.05), which pays only the 12.5% (9903.05.03). Raw honey also carries an antidumping deposit.',
    'Argentina': 'Base rate + 10% Section 301 (9903.05.22). Argentina has WTO cheese quota shares (6,383,000 kg Italian-type). Raw honey also carries an antidumping deposit.',
    'Netherlands': 'EU: 10% in total where the base rate is under 10%, otherwise the base rate (9903.05.39). Gouda and Edam use the EU 27 share of the note 20 quota (6,389,000 kg) at 15% with a licence, or $1.803/kg above it.',
    'Spain': 'EU: 10% in total where the base rate is under 10%, otherwise the base rate (9903.05.39). Manchego and other sheep\'s-milk cheeses are outside the quotas.',
    'Greece': 'EU: 10% in total where the base rate is under 10%, otherwise the base rate (9903.05.39). Feta made from sheep\'s or goat\'s milk is outside the quotas.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). The UK has its own WTO quota shares (2,213,374 kg of note 16 cheese, 895,948 kg of Cheddar); UK Stilton has no quota limit.',
    'Germany': 'EU: 10% in total where the base rate is under 10%, otherwise the base rate (9903.05.39).',
    'Türkiye (Turkey)': 'Base rate + 12.5% Section 301 (9903.05.79) on every line.',
    'Switzerland': '12.5% in total where the base rate is under 12.5%, otherwise the base rate (9903.05.74); insects (0410.10) are on Switzerland\'s exception list (9903.05.98). Swiss cheese uses Switzerland\'s WTO quota shares.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). Raw honey also carries an antidumping deposit (17.80%–60.03% in the latest final results).',
    'Australia': 'Base rate (Free with an AU claim on most lines) + 12.5% Section 301 (9903.05.23) — note 52(a) keeps the 12.5% on FTA goods. Over-quota dairy lines take their AU rate from Chapter 98 (9822.04.05–9822.04.65): Free within the 2026 FTA quantity (91 FR 16080), the over-quota rate above it.',
    'Any other country': 'Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10%–12.5% in total for the EU, Japan, Korea, Switzerland and Taiwan; China pays +20% or +37.5% (List 4A or List 3 on top of the 2026 action). FTA partners such as Chile, Colombia, Peru and Korea keep their FTA rates, with the Section 301 duty on top.',
}
for c in ia['countries']:
    c['rule']['label'] = RULE_LABELS[c['country']]
    if c['country'] == 'Canada':
        c['rule']['sourceIds'].append('procl-11062')
    if c['country'] == 'Australia':
        c['rule']['sourceIds'].append('ustr-ausfta-2026')
    if c['country'] in ('India', 'Brazil', 'Argentina', 'Vietnam'):
        c['rule']['sourceIds'].append('fr-2022-12498')
assert ia['assumptions'][5].startswith('TODO')
ia['assumptions'][5:] = [
    'Dairy groups mix in-quota lines ("described in additional U.S. note N", usually needing a USDA import licence) and over-quota '
    '"Other" lines with a much higher specific rate. Which one applies depends on whether the country\'s quota share is open and the '
    'importer holds a licence; select a cell to see the lines.',
    'Quota lines priced under an FTA quota show tiers: Australia\'s Chapter 98 quotas (9822.04.05–9822.04.65; 2026 quantities in 91 FR '
    '16080) and Canada\'s USMCA quotas (9823.xx). Within the FTA quota the AU or USMCA rate is Free; above it the over-quota rate applies, '
    'and for Canada the 10% Section 301 duty too, because the goods are no longer entered free under USMCA. Chapter 98 prints the Canadian '
    'over-quota skim milk powder rate as "86.5¢/liter"; the underlying 0402.10.50 and 0402.21.25 rate is 86.5¢/kg.',
    'Not in the grid: the Chapter 99 subchapter IV agricultural safeguard duties (9904.04.01–9904.06.49), which apply only to over-quota '
    'dairy entries valued below a trigger price (for example butter under $2.40/kg, Italian-type cheese under $3.35/kg) or during a '
    'quantity-based period USDA announces, and never to goods of Canada, Mexico, Australia, Chile, Korea, Colombia, Peru, Panama and the '
    'other FTA partners named in subchapter IV note 1; and antidumping duties on raw honey from Argentina, Brazil, India, Vietnam and China.',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 '
    'surcharge (9903.03.01) expired July 23, 2026; neither is applied. The 2019 aircraft-dispute duties on EU and UK cheese '
    '(9903.89.xx) are suspended (U.S. note 21(x)) and not applied.',
    'The rate is not the only gate: Canadian whey is banned; eggs and egg products must meet APHIS avian-influenza and Newcastle rules '
    'and AMS or FSIS inspection; fluid milk and cream need an FDA import permit.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 2(aa), 20, 21, 50, 51 and 52 to Chapter 99 subchapter III and subchapter IV in the 2026 Revision 21. No Chapter 04 '
    'line is on the Section 301 general exemption list (note 52(b)), on the Section 122 product exemption lists (note 2(aa)) or on the '
    '2025 IEEPA agricultural exemption list. Certified organic honey (0409.00.00.05) is the only line on the Brazil exemption list (note '
    '50(a)(ii), 9903.05.03). Insects (0410.10) are on the note 52(j) exception lists of Switzerland, Malaysia, Cambodia, Indonesia, '
    'Ecuador and Jordan. The Canada lists in note 51(b) name 52 dairy provisions (9903.03.13, 28 of them in Chapter 04), 23 cheese '
    'provisions (9903.03.12) and honey plus 0406.90.99 (9903.03.14); Proclamation 11062 bans 0404.10 from Canada. Chapter 04 subheadings '
    'are on China List 3 (note 20(f), 21 subheadings) or List 4A (note 20(s)(i)). The aircraft-dispute duties of note 21 are suspended. '
    'Subchapter IV safeguards and antidumping orders are explained in the assumptions and are not priced.')
add_sources(ia, ['procl-11062', 'ustr-ausfta-2026', 'fr-2022-12498', 'hts-ch4', 'hts-ch98'])

# ---------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = 'HTS Chapter 04: Dairy, Eggs & Honey — Import Documents & Ways to Lower Duty'
te['seo']['title'] = 'Importing Dairy, Eggs & Honey into the U.S.: USDA Licences, FDA & APHIS Rules, Quotas & Ways to Lower Duty (HTS Ch. 04) | KoalaGains'
te['seo']['shortDescription'] = (
    'The documents and rules for each HTS Chapter 04 line — USDA dairy import licences, FDA milk permits, prior notice and FSVP, APHIS '
    'avian-influenza rules for eggs, FSIS egg products, honey antidumping and labelling — and the legal ways to pay less: in-quota entry, '
    'FTA and USMCA quotas, binding rulings and drawback.')
te['seo']['keywords'] = ['dairy import license', 'usda dairy import license', 'dairy import licensing program', 'importing cheese into the us',
                         'importing eggs into the us', 'honey import requirements fda', 'new zealand manuka honey import duty',
                         'irish butter import tariff', 'usmca chapter 04 rules', 'dairy tariff rate quota']
te['intro'] = (
    'For dairy the first question is usually not the rate but **which line you can use**: most cheese, butter, milk powder and cream has '
    'an in-quota line at a low rate and an over-quota line at a high specific rate, and the in-quota line needs a **USDA import licence** '
    '(7 CFR part 6) for most products. Then come the agency gates: an FDA permit for fluid milk and cream, pasteurization, prior notice '
    'and the foreign supplier verification program for all food; APHIS rules on milk products from foot-and-mouth regions and on eggs '
    'from avian-influenza regions; AMS inspection certificates for shell eggs and FSIS eligibility for egg products.\n\n'
    'The legal ways to pay less are mostly about **where and how the goods enter**: inside the quota with a licence, under an FTA or '
    'USMCA quota, as a correctly classified product (a binding ruling settles disputes like whey protein concentrate vs. whey), or with '
    'drawback on re-export. For honey, the antidumping order covers raw bulk honey, not retail jars of 5 lb or less.')
te['regulationsAsOf'] = REGS_AS_OF
CBP_QUOTA = 'https://www.cbp.gov/trade/quota'


def lever(id, title, saves, appliesTo, document, caveat, cites):
    return {'id': id, 'title': title, 'saves': saves, 'appliesTo': appliesTo, 'document': document, 'caveat': caveat,
            'citations': [{'label': a, 'url': b} for a, b in cites]}


te['levers'] = [
    lever('dairy-quota', 'Enter dairy inside the tariff-rate quota with a USDA licence',
          'The gap between the in-quota and over-quota rate — for butter 12.3¢/kg vs $1.541/kg (about $28,000 on 20 t); for Cheddar 12% vs $1.227/kg',
          'Lines "described in additional U.S. note 6–25 to this chapter" (in quota) vs the matching "Other" over-quota lines of 0401–0406',
          'A USDA FAS dairy import licence for licensed articles (historical, non-historical lottery or designated licences, applied for '
          'each year; $325 per licence for 2027), and entry under the in-quota subheading against the country\'s quota share. Notes 5, '
          '9, 10 and 11 quotas need no licence and are filled first come, first served at CBP.',
          'Licences are issued per article and country and are not freely transferable; unused quantities must be surrendered on time. '
          'For high-priced cheese the over-quota specific rate can be lower than the in-quota ad valorem rate — compare both.',
          [('7 CFR 6.22 (licence required)', ecfr(7, '6.22')), ('7 CFR part 6, subpart B', ecfr_part(7, 6)),
           ('HTSUS Ch. 4, additional U.S. notes 5–25', HTS_CH4), ('91 FR 56419 (2027 licence fee)', NEW_BY_ID['fas-dairy-fee-2027']['url']),
           ('CBP: Quotas', CBP_QUOTA)]),
    lever('fta-quota', 'Use an FTA dairy quota (Australia, Canada, Israel, Colombia, Panama)',
          'The whole over-quota rate on the quantity covered — for Australian cheese about $1.2–$2.3/kg; the 2026 Section 301 duty still applies to Australia',
          'Over-quota lines whose Special column says "See 9822.04.xx (AU)", "See 9823.xx (S+)", "See 9908.04.xx (IL)", "See 9918.04.xx (CO)" or "See 9919.04.xx (PA)"',
          'An FTA origin claim (SPI AU, S+, IL, CO, PA) and entry under the Chapter 98/99 quota heading while the FTA quantity is open — '
          'for Australia 2026 quantities from 186 t (skim milk powder) to 9,751 t (cheese) and 25,497,000 liters of cream; Australian '
          'dairy also needs Australia\'s export certificate.',
          'FTA quotas fill first come, first served; above them the over-quota rate applies. For Canada, the Section 338 50% applies even '
          'within the USMCA quota on the listed lines.',
          [('HTSUS Ch. 98, subchapter XXII notes 8–19 (Australia)', HTS_CH98), ('USTR, 91 FR 16080 (2026 AUSFTA quantities)', reuse['ustr-ausfta-2026']['url']),
           ('HTSUS Ch. 98, subchapter XXIII notes 1–7 (USMCA)', HTS_CH98), ('CBP: Quotas', CBP_QUOTA)]),
    lever('usmca', 'Qualify Mexican and Canadian dairy for USMCA',
          'Mexico: the full rate plus 10% — USMCA-qualifying Mexican dairy, eggs and honey are Free with no quota limit. Canada: Free within the USMCA quotas, no 10% Section 301 duty',
          'Every Chapter 04 line (SPI S or S+)',
          'A USMCA certification of origin (19 CFR 182.12) for originating goods — for dairy, usually made from milk of the USMCA region.',
          'Canadian milk powder, many cheeses and honey still pay the 50% Section 338 duty under USMCA, and Canadian whey is banned. '
          'The USMCA joint review (July 1, 2026) did not end the agreement; it remains in force.',
          [('19 CFR 182.12', ecfr(19, '182.12')), ('HTSUS General Note 11', 'https://hts.usitc.gov/'),
           ('HTSUS Ch. 98, subchapter XXIII', HTS_CH98)]),
    lever('fta', 'Claim another FTA (Chile, Korea, Peru, Morocco, CAFTA-DR, Bahrain, Oman, Singapore, Jordan)',
          'The full base rate — even over-quota cheese and butter are Free for most of these partners',
          'Lines whose Special column lists CL, KR, PE, MA, P, BH, OM, SG or JO',
          'Origin documentation for the FTA claim (SPI) at entry.',
          'The 2026 Section 301 duty applies on top of FTA rates for countries among the 60 economies (U.S. note 52(a)) — Chile, Korea, '
          'Peru, Colombia and the CAFTA-DR countries pay 10% or 12.5%.',
          [('HTSUS General Notes', 'https://hts.usitc.gov/'), ('HTSUS Ch. 99, U.S. note 52', HTS_CH99)]),
    lever('ruling', 'Get the classification right — and confirm it with a binding ruling',
          'Up to the whole difference between quota and non-quota lines, e.g. whey protein concentrate at 8.5% with no quota vs modified whey at $1.035/kg + 8.5% over quota; milk protein concentrate at 0.37¢/kg',
          'Every Chapter 04 line; most useful for whey, milk protein, dairy blends, cheese types and honey grades',
          'A CBP binding ruling request under 19 CFR part 177 with composition (fat, protein, lactose, dry matter) and process details.',
          'Chapter notes decide: over 80% whey protein is an albumin (3502), over 95% lactose is 1702, products replacing a milk '
          'constituent go to 1901 or 2106 — which have their own quotas and duties.',
          [('19 CFR 177.1', ecfr(19, '177.1')), ('HTSUS Ch. 4, notes 1–6 and additional U.S. notes 1, 13', HTS_CH4)]),
    lever('drawback', 'Recover duties on dairy that is re-exported or used in exported goods',
          'Up to 99% of the duties paid, including on over-quota cheese, butter and milk powder used in exported products',
          'Every Chapter 04 line',
          'A drawback claim under 19 CFR part 191 (unused merchandise or manufacturing drawback) within five years of import.',
          'Each Chapter 99 duty has its own drawback treatment; keep the import and export records that tie them together.',
          [('19 CFR 191.3', ecfr(19, '191.3')), ('19 CFR part 191', ecfr_part(19, 191))]),
    lever('honey-retail', 'Know what the honey antidumping orders cover',
          'The antidumping deposit — 5.87% to 60.03% of value depending on country and exporter',
          'Natural honey, 0409.00.00 (the orders name 0409.00.00.05, .35, .45, .56 and .65)',
          'The orders cover raw honey (not filtered to remove most pollen, below 25 microns) from Argentina, Brazil, India and Vietnam, '
          'and exclude honey packaged for retail sale in containers of 5 lb or less. Exporters with their own reviewed rate pay that '
          'rate instead of the all-others rate.',
          'The written scope controls, not the HTS number; filtered honey is outside the 2022 orders but honey from China has its own '
          '2001 order. Evading an order through a third country is enforced by CBP.',
          [('87 FR 35501 (raw honey orders)', NEW_BY_ID['fr-2022-12498']['url']),
           ('88 FR 68103 (China honey order continued)', NEW_BY_ID['fr-2023-21823']['url']),
           ('CBP: Antidumping and countervailing duties', 'https://www.cbp.gov/trade/priority-issues/adcvd')]),
    lever('br-organic-honey', 'Brazilian honey: the certified organic line is exempt from the 25% Brazil duty',
          '25% of value on Brazilian certified organic honey',
          'Certified organic natural honey, 0409.00.00.05, products of Brazil',
          'Entry under 0409.00.00.05 with organic certification meeting an approved standard (HTSUS General Statistical Note 6) and the '
          'exemption heading 9903.05.03.',
          'The 12.5% forced-labor Section 301 duty (9903.05.27) and the raw-honey antidumping deposit still apply.',
          [('HTSUS Ch. 99, U.S. note 50(a)(ii)', HTS_CH99), ('91 FR 45516 (Brazil Section 301 action)', 'https://www.federalregister.gov/documents/2026/07/20/2026-14542/notice-of-action-brazils-acts-policies-and-practices-related-to-digital-trade-and-electronic-payment')]),
]


def rule(id, agency, title, cites):
    return {'id': id, 'agency': agency, 'title': title, 'citations': [{'label': a, 'url': b} for a, b in cites]}


te['rules'] = [
    rule('fas-dairy-license', 'USDA FAS', 'In-quota dairy articles under additional U.S. notes 6, 7, 8, 12, 14 and 16–25 may be entered only by or for the holder of a USDA dairy import licence',
         [('7 CFR 6.20', ecfr(7, '6.20')), ('7 CFR 6.22', ecfr(7, '6.22')), ('7 CFR 6.33 (licence fee)', ecfr(7, '6.33'))]),
    rule('cbp-quota', 'CBP', 'Tariff-rate quota lines are filled and reported by CBP; entries over the quantity pay the over-quota rate',
         [('19 CFR 132.2', ecfr(19, '132.2')), ('19 CFR 132.11', ecfr(19, '132.11')), ('CBP: Quotas', CBP_QUOTA)]),
    rule('ag-safeguard', 'USDA / CBP', 'Over-quota dairy may owe an extra safeguard duty if valued below the trigger price, or during an announced quantity-based period (not for FTA partners listed in subchapter IV note 1)',
         [('HTSUS Ch. 99, subchapter IV', HTS_CH99), ('91 FR 56419 (2026 trigger levels)', NEW_BY_ID['fas-safeguard-2026']['url'])]),
    rule('fda-fima', 'FDA', 'Milk and cream need a Federal Import Milk Act permit held by the shipper, with dairy farm and plant inspection',
         [('21 CFR 1210.2', ecfr(21, '1210.2')), ('21 CFR 1210.20', ecfr(21, '1210.20'))]),
    rule('fda-pasteurization', 'FDA', 'Milk and milk products in final package form for direct human consumption must be pasteurized',
         [('21 CFR 1240.61', ecfr(21, '1240.61'))]),
    rule('fda-cheese', 'FDA', 'Cheeses sold under a standardized name must meet the standard of identity (for example pasteurization or 60-day aging for raw-milk cheese)',
         [('21 CFR part 133', ecfr_part(21, 133))]),
    rule('fda-prior-notice', 'FDA', 'Prior notice of imported food before arrival, and registration of the foreign food facility',
         [('21 CFR 1.279', ecfr(21, '1.279')), ('21 CFR 1.281', ecfr(21, '1.281')), ('21 CFR 1.285', ecfr(21, '1.285'))]),
    rule('fda-fsvp', 'FDA', 'Importers must run a foreign supplier verification program (FSVP) for imported food and be identified at entry',
         [('21 CFR part 1, subpart L', 'https://www.ecfr.gov/current/title-21/part-1/subpart-L'), ('21 CFR 1.509', ecfr(21, '1.509'))]),
    rule('aphis-dairy', 'USDA APHIS', 'Milk and milk products from regions with foot-and-mouth disease enter only if shelf-stable, consigned for approved processing or otherwise as 9 CFR 94.16 allows; cheese, butter and butter oil are exempt',
         [('9 CFR 94.16', ecfr(9, '94.16')), ('9 CFR 94.1', ecfr(9, '94.1'))]),
    rule('aphis-eggs', 'USDA APHIS', 'Eggs (other than hatching eggs) from regions with highly pathogenic avian influenza or Newcastle disease need a government veterinary certificate and sealed, sanitized cases, or other conditions of 9 CFR 94.6',
         [('9 CFR 94.6', ecfr(9, '94.6'))]),
    rule('aphis-hatching', 'USDA APHIS', 'Hatching eggs need an APHIS import permit and a health certificate',
         [('9 CFR 93.204', ecfr(9, '93.204')), ('9 CFR 93.205', ecfr(9, '93.205'))]),
    rule('ams-shell-eggs', 'USDA AMS', 'Shell eggs need a foreign inspection certificate and are inspected on arrival; restricted eggs may not be imported for consumers',
         [('7 CFR 57.915', ecfr(7, '57.915')), ('7 CFR 57.900', ecfr(7, '57.900')), ('7 CFR 57.925', ecfr(7, '57.925'))]),
    rule('fda-shell-eggs', 'FDA', 'Shell eggs must be held at 45°F or below and carry the safe handling statement; producers with 3,000 or more laying hens follow the Salmonella Enteritidis rule',
         [('21 CFR 115.50', ecfr(21, '115.50')), ('21 CFR 101.17', ecfr(21, '101.17')), ('21 CFR part 118', ecfr_part(21, 118))]),
    rule('fsis-egg-products', 'USDA FSIS', 'Egg products only from countries FSIS has found eligible, with a foreign inspection certificate, and reinspected at entry',
         [('9 CFR 590.910', ecfr(9, '590.910')), ('9 CFR 590.915', ecfr(9, '590.915')), ('9 CFR 590.925', ecfr(9, '590.925'))]),
    rule('honey-adcvd', 'Commerce ITA / CBP', 'Raw honey from Argentina, Brazil, India and Vietnam (2022 orders) and honey from China (2001 order) needs antidumping cash deposits at entry',
         [('87 FR 35501', NEW_BY_ID['fr-2022-12498']['url']), ('88 FR 68103', NEW_BY_ID['fr-2023-21823']['url']),
          ('CBP: AD/CVD', 'https://www.cbp.gov/trade/priority-issues/adcvd')]),
    rule('fda-honey-label', 'FDA', 'Honey with added sweeteners cannot be labelled simply "honey"; FDA guidance on honey labelling',
         [('FDA guidance: Proper Labeling of Honey and Honey Products', 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-proper-labeling-honey-and-honey-products')]),
    rule('ca-whey-ban', 'President / CBP', 'Whey and modified whey (0404.10) that is a product of Canada may not be imported from September 29, 2026',
         [('Proclamation 11062 (91 FR 58319)', reuse['procl-11062']['url'])]),
    rule('wild-bird-eggs', 'Interior (FWS)', 'Eggs of wild birds may not be imported, except game-bird eggs for propagation and scientific specimens',
         [('HTSUS Ch. 4, additional U.S. note 26', HTS_CH4), ('50 CFR part 14', ecfr_part(50, 14))]),
]
RULE_IDS = {r['id'] for r in te['rules']}
LEVER_IDS = {l['id'] for l in te['levers']}

# Line-level mapping
rows = {r['hts']: r for r in ov['rateTable']['rows'] if r.get('hts')}
LICENSED_NOTES = {6, 7, 8, 12, 14, 16, 17, 18, 19, 20, 21, 22, 23, 25}
SAFEGUARD_SUBS = set('''0401.40.25 0401.50.25 0401.50.75 0402.10.50 0402.21.25 0402.21.50 0402.21.90 0402.29.50 0402.91.70 0402.91.90
0402.99.45 0402.99.55 0402.99.90 0403.20.50 0403.90.16 0403.90.45 0403.90.55 0403.90.65 0403.90.78 0403.90.95 0404.10.15 0404.10.90
0404.90.50 0405.10.20 0405.20.30 0405.20.70 0405.90.20 0406.10.08 0406.10.18 0406.10.28 0406.10.38 0406.10.48 0406.10.58 0406.10.68
0406.10.78 0406.10.88 0406.20.28 0406.20.33 0406.20.39 0406.20.48 0406.20.53 0406.20.63 0406.20.67 0406.20.71 0406.20.75 0406.20.79
0406.20.83 0406.20.87 0406.20.91 0406.30.18 0406.30.28 0406.30.38 0406.30.48 0406.30.53 0406.30.63 0406.30.67 0406.30.71 0406.30.75
0406.30.79 0406.30.83 0406.30.87 0406.30.91 0406.40.70 0406.90.12 0406.90.18 0406.90.32 0406.90.37 0406.90.42 0406.90.48 0406.90.54
0406.90.68 0406.90.74 0406.90.78 0406.90.84 0406.90.88 0406.90.92 0406.90.94 0406.90.97'''.split())


def own_or_parent(hts):
    """Rate-table row for a line, else its 8-digit parent (descriptions like 'described in note N' sit on the 8-digit row)."""
    r = rows.get(hts)
    parent = rows.get(hts[:10])
    return r, parent


GROUP_RULES = {}
for line in te['lines']:
    h = line['hts']
    head = h[:4]
    sub8 = h[:10]
    r, parent = own_or_parent(h)
    desc = ' '.join(x['description'] or '' for x in (r, parent) if x)
    special = (r or {}).get('effectiveSpecial') or ''
    rids = ['fda-prior-notice', 'fda-fsvp']
    lids = []
    if head in ('0401', '0402', '0403', '0404', '0405', '0406'):
        rids.append('aphis-dairy')
        if head == '0401':
            rids += ['fda-fima', 'fda-pasteurization']
        if head in ('0402', '0403'):
            rids.append('fda-pasteurization')
        if head == '0406':
            rids.append('fda-cheese')
        m = re.search(r'additional U\.S\. ?note (\d+)', desc)
        in_quota = bool(m) or 'general note 15' in desc
        over = sub8 in SAFEGUARD_SUBS
        if m and int(m.group(1)) in LICENSED_NOTES:
            rids.append('fas-dairy-license')
        if in_quota or over:
            rids.append('cbp-quota')
            lids.append('dairy-quota')
        if over:
            rids.append('ag-safeguard')
        if head == '0404' and sub8.startswith('0404.10'):
            rids.append('ca-whey-ban')
    elif head == '0407':
        if sub8 in ('0407.11.00', '0407.19.00'):
            rids.append('aphis-hatching')
        else:
            rids += ['aphis-eggs', 'ams-shell-eggs', 'fda-shell-eggs']
        if sub8 in ('0407.19.00', '0407.29.00', '0407.90.00'):
            rids.append('wild-bird-eggs')
    elif head == '0408':
        rids += ['aphis-eggs', 'fsis-egg-products']
    elif head == '0409':
        rids += ['honey-adcvd', 'fda-honey-label']
        lids.append('honey-retail')
        if h == '0409.00.00.05':
            lids.append('br-organic-honey')
    if re.search(r'See 98|See 99', special):
        lids.append('fta-quota')
    lids += ['usmca', 'fta', 'ruling', 'drawback']
    seen = []
    line['ruleIds'] = [x for x in rids if not (x in seen or seen.append(x))]
    seen = []
    line['leverIds'] = [x for x in lids if not (x in seen or seen.append(x))]
    assert set(line['ruleIds']) <= RULE_IDS and set(line['leverIds']) <= LEVER_IDS
    GROUP_RULES.setdefault(head, [])
    for x in line['ruleIds']:
        if x not in GROUP_RULES[head]:
            GROUP_RULES[head].append(x)

GROUP_NOTES = {
    '0401': 'Cream over 6% fat is under quota (notes 5 and 6; note 6 needs a licence). Fluid milk and cream need an FDA import milk permit.',
    '0402': 'Skim and whole milk powder (notes 7, 8, 9) and condensed milk (note 11) are under quota. On the Canada Section 338 dairy list; 0402.99.68–.90 are on the aluminum derivative list (Russia).',
    '0403': 'Yogurt and sour cream lines described in note 10 are in quota (no licence); the "Other" lines are over quota. APHIS rules for milk products from foot-and-mouth regions apply.',
    '0404': 'Whey (0404.10) from Canada is banned since September 29, 2026. Whey protein concentrate (0404.10.05) and milk protein concentrate (0404.90.10) have no quota.',
    '0405': 'Butter (note 6) and butter oil, ghee and anhydrous milk fat (note 14) need a USDA licence in quota. Cheese, butter and butter oil are exempt from the APHIS milk-product rule.',
    '0406': 'Most cow\'s-milk cheese is under one of the quotas of notes 16–25 (licence required); sheep\'s- and goat\'s-milk cheese and soft-ripened cheese are not. FDA standards of identity apply to named cheeses.',
    '0407': 'Table eggs: AMS certificate and APHIS avian-influenza/Newcastle rules. Hatching eggs: APHIS permit and health certificate. Wild-bird eggs are prohibited (note 26).',
    '0408': 'Egg products only from countries FSIS has found eligible, with a foreign inspection certificate.',
    '0409': 'Raw honey from Argentina, Brazil, India, Vietnam and China carries antidumping deposits; retail packs of 5 lb or less are outside the 2022 orders.',
    '0410': 'Edible insects must be fit for human consumption; FDA food import rules apply.',
}
for g in te['groups']:
    g['ruleIds'] = GROUP_RULES[g['heading']]
    g['note'] = GROUP_NOTES[g['heading']]
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations — not legal advice. Disease restrictions, licence allocations '
    'and antidumping rates change during the year; check APHIS, FSIS, USDA FAS and Commerce before each shipment.')

# ---------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = 'HTS Chapter 04: Dairy, Eggs & Honey — Tariff FAQ'
fc['seo']['title'] = 'Dairy, Cheese, Butter, Egg & Honey Tariffs FAQ: EU Cheese, Canadian Dairy, Irish Butter, Honey HS Code | KoalaGains'
fc['seo']['shortDescription'] = (
    'Answers to what people search about dairy, egg and honey tariffs: the tariff on European, Italian, French and Swiss cheese, '
    'Canadian dairy, Irish butter, honey from India and New Zealand, where U.S. eggs come from, dairy import licences and HS codes.')
fc['seo']['keywords'] = ['is there a tariff on cheese', 'tariffs on cheese from europe', 'parmesan cheese tariff', 'us tariff on canadian dairy',
                         'tariff on irish butter', 'tariff on honey', 'honey hs code', 'manuka honey tariff', 'where does the us import eggs from',
                         'is there a tariff on eggs', 'dairy import license', 'hts code for cheese']
fc['intro'] = (
    'Straight answers to the most common questions about importing dairy, eggs and honey into the U.S. Every rate and date comes from '
    'the other pages of this report, which cite the tariff schedule, the Federal Register and USDA.')
fc['keyTakeaways'] = [
    'Dairy is a quota product: most cheese, butter, milk powder and cream has a low in-quota rate (with a USDA licence for most) and a high '
    'specific over-quota rate. Eggs (2.8¢ a dozen) and honey (1.9¢/kg) have low base rates. No base rate changed between January 2025 and October 2026.',
    'Since July 24, 2026 the extra duty depends on origin: 10% in total for EU cheese and butter priced under 10%, +10% for India, '
    'Argentina and the UK, +12.5% for New Zealand, Australia, Türkiye and Vietnam, +37.5% for Brazil. USMCA goods from Mexico enter free.',
    'Canada is the exception: a 50% Section 338 duty on Canadian milk powder, many cheeses and honey even with a USMCA claim, and a ban on '
    'Canadian whey since September 29, 2026. Raw honey from Argentina, Brazil, India, Vietnam and China also carries antidumping deposits.',
]
fc['questionSource'] = 'Google search suggestions, collected October 12, 2026'


def faq(id, q, searched, a, link):
    return {'id': id, 'question': q, 'searchedAs': searched, 'answer': a, 'link': link}


fc['faqs'] = [
    faq('cheese-europe', 'Is there a tariff on cheese from Europe — Italian and French cheese?',
        ['is there a tariff on cheese', 'tariffs on cheese from europe', 'european cheese tariff', 'tariff on italian cheese',
         'tariff on french cheese', 'us tariffs on french cheese'],
        'Yes. EU cheese pays its base rate — 6.4% to 25% inside the EU share of the cheese quotas (with a USDA licence) or $1.055 to $2.269 '
        'per kg above them — and, since July 24, 2026, the EU Section 301 rate: 10% in total where the base rate is lower (9903.05.39). '
        'Because most cheese already pays more than 10%, that usually adds nothing; it lifts low-rate goods like in-quota butter and cream '
        'to 10%. Soft-ripened cheese such as Brie and sheep\'s-milk cheese such as Roquefort and Pecorino are outside the quotas. The 2019 '
        'aircraft-dispute duties on EU cheese remain suspended, and the IEEPA reciprocal duty ended February 24, 2026.',
        'industry-areas'),
    faq('parmesan', 'What is the tariff on Parmesan cheese?',
        ['parmesan cheese tariff', 'tariff on parmesan cheese', 'is there a tariff on parmesan cheese', 'parmesan tariffs'],
        'Parmesan and Reggiano in original loaves are 0406.90.31 at 25% inside the Italian-type cheese quota (additional U.S. note 21; '
        'EU 27 share 5,407,000 kg, licence required) and 0406.90.32 at $2.146/kg above it. For a wheel priced at $15/kg the over-quota '
        'rate is about 14% of value — less than 25%. Both are above 10%, so the EU Section 301 rate adds nothing. Grated Parmesan has its '
        'own lines under 0406.20.',
        ''),
    faq('swiss-cheese', 'Is there a tariff on Swiss cheese and Gruyère?',
        ['tariff on swiss cheese', 'swiss cheese tariffs', 'tariff on gruyere cheese', 'is there a tariff on gruyere cheese'],
        'Yes. Swiss cheese with eyes (Emmentaler) pays 6.4% inside its quota (additional U.S. note 25; Switzerland 3,630,000 kg) or '
        '$1.877/kg above it; Gruyère-process and Swiss without eyes are under note 22 (Switzerland 1,850,000 kg). Since July 24, 2026 '
        'products of Switzerland pay 12.5% in total where the base rate is lower (9903.05.74), so in-quota Emmentaler pays 12.5%. EU-made '
        'Gruyère and Emmentaler use the EU shares and the 10% EU rate.',
        'industry-areas'),
    faq('canada-dairy', 'Does the U.S. have tariffs on Canadian dairy?',
        ['us tariff on canadian dairy', 'us tariffs on canada dairy', 'dairy tariffs canada us', 'does us have tariffs on canadian dairy',
         'cheese tariff canada', 'us tariff on canadian milk'],
        'Yes, since August 2026. Section 338 Proclamation 11047 put a 50% duty on Canadian milk powder, whey and milk protein products '
        '(9903.03.13) from August 22, 2026; 23 cheese provisions (9903.03.12) and other cheese 0406.90.99 followed on September 15, and '
        'honey (9903.03.14) on August 22. The 50% applies even with a USMCA claim. Canadian whey (0404.10) has been banned since '
        'September 29, 2026 (Proclamation 11062). USMCA-qualifying Canadian dairy that is not listed — yogurt, butter, many cheeses — '
        'still enters free within Canada\'s USMCA quotas.',
        'tariff-updates'),
    faq('dairy-license', 'What is a USDA dairy import licence and when do I need one?',
        ['dairy import license', 'usda dairy import license', 'dairy import licensing program', 'dairy tariff rate quotas',
         'dairy import permit'],
        'Most in-quota dairy — butter, milk powder, butter oil and nearly all cheese quotas (additional U.S. notes 6, 7, 8, 12, 14 and '
        '16–25 to Chapter 4) — can be entered at the low in-quota rate only by or for a holder of a USDA Foreign Agricultural Service '
        'licence (7 CFR 6.22). Licences are issued per article and country each year; the 2027 fee is $325 per licence. Without one the '
        'same goods pay the over-quota rate. Fluid milk and cream also need a separate FDA import milk permit (21 CFR part 1210). USDA '
        'proposed revising the licensing rules in March 2026; no final rule has been published.',
        'tariff-engineering'),
    faq('irish-butter', 'What is the tariff on Irish butter?',
        ['tariff on irish butter', 'irish butter tariff', 'is there a tariff on irish butter', 'what is the tariff on irish butter',
         'tariff on butter'],
        'Butter is 0405.10. Inside the 6,977,000 kg butter quota (additional U.S. note 6, USDA licence) it is 12.3¢/kg — lifted to 10% '
        'of value in total for EU goods since July 24, 2026. Above the quota it is $1.541/kg (0405.10.20), about 22% at $7/kg, with no '
        'Section 301 add-on. U.S. butter imports from Ireland fell sharply in 2025, when EU goods also paid the IEEPA reciprocal duty.',
        'industry-areas'),
    faq('honey-tariff', 'Is there a tariff on honey?',
        ['tariff on honey', 'us tariff on honey', 'honey tariffs', 'is there a tariff on honey', 'us tariff on indian honey'],
        'Natural honey (0409.00.00) has a base rate of 1.9¢/kg, Free under most FTAs. Since July 24, 2026 honey from the 60 Section 301 '
        'economies pays +10% (India, Argentina) or +12.5% (New Zealand, Vietnam, Australia), +37.5% from Brazil (12.5% for certified '
        'organic). Raw bulk honey from Argentina, Brazil, India and Vietnam also carries antidumping deposits under the 2022 orders — for '
        'example 5.87% for Indian exporters without their own rate — and Chinese honey under a 2001 order.',
        'tariff-updates'),
    faq('honey-hs', 'What is the HS code for honey?',
        ['honey hs code', 'hs code honey', 'natural honey tariff code', 'honey tariff code', 'manuka honey tariff code', 'hs tariff code honey'],
        'Natural honey is HS 0409.00 and HTS 0409.00.00, with statistical suffixes: .05 certified organic, .10 comb honey and honey '
        'packaged for retail sale, and .35, .45, .56 and .65 for other honey by colour (white or lighter, extra light amber, light amber, '
        'amber or darker). Manuka honey uses the same codes. Honey with added sugar or flavouring is not 0409 — it is classified as a food '
        'preparation, usually in Chapter 17 or 21.',
        ''),
    faq('manuka-nz', 'What is the tariff on manuka honey and other New Zealand products?',
        ['manuka honey tariff', 'tariff on new zealand products', 'us tariff on new zealand', 'tariff on new zealand goods'],
        'New Zealand honey pays 1.9¢/kg plus 12.5% of value (Section 301, 9903.05.57, since July 24, 2026); it is not under an '
        'antidumping order. The same 12.5% applies to New Zealand butter, whey and milk protein concentrate on top of their base or '
        'over-quota rates. New Zealand has no FTA with the U.S. The IEEPA reciprocal duty ended February 24, 2026.',
        'industry-areas'),
    faq('canadian-honey', 'Is there a tariff on Canadian honey?',
        ['tariff on canadian honey', 'canadian honey tariffs', 'honey tariffs canada'],
        'Yes: since August 22, 2026 honey that is a product of Canada pays a 50% Section 338 duty (9903.03.14, Proclamation 11048), '
        'even when it qualifies for USMCA. Non-USMCA Canadian honey also pays the 1.9¢/kg base rate and the 10% Section 301 duty.',
        'tariff-updates'),
    faq('eggs-imports', 'Where does the U.S. import eggs from?',
        ['where does the us import eggs from', 'does the us import eggs', 'us egg imports by country', 'are eggs imported to the us',
         'egg imports usa', 'does the us import eggs from other countries'],
        'Shell-egg imports (0407) more than doubled in 2025 to $221M as avian influenza cut U.S. supply; fresh table eggs alone went from '
        '$6.8M to $122.4M. The biggest suppliers were Brazil ($46M), Canada ($45M), Mexico ($36M), Türkiye ($29M) and the UK ($23M), '
        'per UN Comtrade. Egg products (0408) came mainly from Canada, Lithuania, China and Thailand.',
        'understand-industry'),
    faq('eggs-tariff', 'Is there a tariff on eggs?',
        ['is there a tariff on eggs', 'eggs tariff', 'tariff on eggs'],
        'Shell eggs pay 2.8¢ a dozen (Free under USMCA and most FTAs); dried egg products 47.6¢/kg and other egg products 9.7¢/kg. Since '
        'July 24, 2026 eggs from Section 301 economies also pay 10% or 12.5% of value (Brazil 37.5%), and EU eggs 10% in total. Imports '
        'must also meet APHIS avian-influenza and Newcastle disease rules and AMS or FSIS inspection.',
        'industry-areas'),
    faq('hts-codes', 'What are the HTS codes for cheese, eggs and butter?',
        ['hts code for cheese', 'hs code for cheese', 'hts code for eggs', 'hs code for eggs', 'hts chapter 4', 'tariff code for cheese'],
        'Cheese is heading 0406 (0406.10 fresh cheese and curd, 0406.20 grated or powdered, 0406.30 processed, 0406.40 blue-veined, 0406.90 '
        'other), split into 156 lines by type and quota. Shell eggs are 0407 (0407.21.00.30 for fresh table eggs) and egg products 0408. '
        'Butter is 0405.10, ghee and butter oil 0405.90, milk powder 0402 and whey 0404. Search the full table on the overview page.',
        ''),
    faq('milk-powder-whey', 'What is the tariff on milk powder and whey protein?',
        ['milk powder tariff code', 'milk powder hs code', 'whey protein tariffs', 'whey protein tariff code'],
        'Skim milk powder is 0402.10: 3.3¢/kg inside the 5,261,000 kg quota (note 7, licence) and 86.5¢/kg above it. Whey protein '
        'concentrate is 0404.10.05 at 8.5% with no quota; dried whey 3.3¢/kg in quota or 87.6¢/kg above; milk protein concentrate '
        '0404.90.10 at 0.37¢/kg. Products over 80% whey protein are albumins in heading 3502. Origin extras apply on top, and Canadian '
        'whey is banned.',
        'tariff-engineering'),
    faq('import-milk', 'Does the U.S. import milk and dairy?',
        ['does the us import milk', 'does the us import dairy', 'does the us import milk from other countries', 'do we import milk'],
        'Yes, though mostly as cheese, butter, whey and milk powder rather than fluid milk. The U.S. imported $4.06B of Chapter 04 goods in '
        '2025; fluid milk and cream (0401) were only $66M, mostly from Mexico and Canada. Cheese was $1.70B (Italy, France, Spain, the '
        'Netherlands), butter $419M (Ireland, New Zealand) and milk powder and condensed milk (0402) $232M (Mexico, Chile).',
        'understand-industry'),
]

d['finalConclusion'] = fc

# ---------------------------------------------------------------------------------------------
# Write + sanity
# ---------------------------------------------------------------------------------------------
s = json.dumps(d, ensure_ascii=False, indent=2)
# canonical Federal Register slug for Proclamation 11046 (the generator copies a longer slug from measures.json)
s = s.replace('2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united-states',
              '2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united')
assert 'TODO' not in s, [m.start() for m in re.finditer('TODO', s)][:5]
assert '[forbidden-source-name]' not in s.lower()
open(FILE, 'w').write(s + '\n')
print('wrote', FILE, len(s))
