"""Fill the writer TODOs of the generated Chapter 08 content file.

usage: python3 fill.py <generated.json> <out.json>
"""
import json
import sys

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from eng import LEVERS, RULES, GROUPS, CHAPTER_NOTES, US_NOTES, HTS_CH99  # noqa: E402

src, out = sys.argv[1], sys.argv[2]
g = json.load(open(src))
CHECKED = '2026-10-11'
FR = 'https://www.federalregister.gov/documents/'

# ---------------------------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------------------------
rows = g['overview']['rateTable']['rows']
lines = [r for r in rows if r['htsCode10']]
EXEMPT = [l.strip() for l in open(__file__.rsplit('/', 1)[0] + '/exempt08.txt') if l.strip()]


def is_exempt(code10):
    return any(code10.startswith(p) for p in EXEMPT)


N_EXEMPT = sum(1 for r in lines if is_exempt(r['htsCode10']))
N_COVERED = len(lines) - N_EXEMPT
assert (N_EXEMPT, N_COVERED) == (77, 163), (N_EXEMPT, N_COVERED)

ia = g['industryAreas']
countries = {c['country']: c for c in ia['countries']}


def bd(country, heading, hts, side='withoutUsmca'):
    for b in countries[country]['cells'][heading][side]['breakdown']:
        if any(l.startswith(hts) for l in b['lines']):
            return b['total']
    raise KeyError((country, heading, hts))


# Facts quoted in prose — fail loudly if the engine output ever disagrees.
assert bd('Mexico', '0804', '0804.40', 'withUsmca') == 'Free'
assert bd('Mexico', '0804', '0804.40') == '11.2¢/kg'
assert bd('Peru', '0810', '0810.40') == '12.5%'
assert bd('Peru', '0806', '0806.10.60') == '12.5%'
assert bd('Chile', '0806', '0806.10.20') == '12.5%'
assert bd('Vietnam', '0801', '0801.32') == 'Free'
assert bd('Guatemala', '0803', '0803.90') == 'Free'
assert bd('Mexico', '0810', '0810.40') == '10%'
assert bd('Mexico', '0805', '0805.50.20') == '2.2¢/kg + 10%'
assert bd('Costa Rica', '0804', '0804.30') == 'Free'
assert bd('Chile', '0809', '0809.29') == '12.5%'
assert bd('Vietnam', '0802', '0802.32') == '26.5¢/kg + 12.5%'

ui = g['understandIndustry']
trade_total = ui['byYear'][-1]['totalUsd']
assert round(trade_total / 1e9, 2) == 25.66
bc = {c['country']: c for c in ui['byCountry']}
assert round(bc['Mexico']['importsUsd'] / 1e9, 2) == 10.36 and round(bc['Peru']['importsUsd'] / 1e9, 2) == 3.48


def setall(obj, **kw):
    for k, v in kw.items():
        obj[k] = v


# ---------------------------------------------------------------------------------------------
# Short labels for the 14 headings (generator labels are truncated with "…")
# ---------------------------------------------------------------------------------------------
LABELS = {
    '0801': ('Coconuts, Brazil nuts & cashews', 'Coconuts & cashews'),
    '0802': ('Other nuts (almonds, hazelnuts, walnuts, pistachios, pecans…)', 'Other nuts'),
    '0803': ('Bananas & plantains', 'Bananas'),
    '0804': ('Dates, figs, pineapples, avocados, guavas & mangoes', 'Avocados, mangoes, pineapples'),
    '0805': ('Citrus fruit', 'Citrus'),
    '0806': ('Grapes & raisins', 'Grapes'),
    '0807': ('Melons, watermelons & papayas', 'Melons & papayas'),
    '0808': ('Apples, pears & quinces', 'Apples & pears'),
    '0809': ('Apricots, cherries, peaches, plums', 'Stone fruit'),
    '0810': ('Other fresh fruit (berries, kiwifruit, tropical fruit)', 'Berries & other fruit'),
    '0811': ('Frozen fruit & nuts', 'Frozen fruit'),
    '0812': ('Fruit provisionally preserved', 'Preserved fruit'),
    '0813': ('Dried fruit (prunes, apricots…) & mixtures', 'Dried fruit'),
    '0814': ('Citrus & melon peel', 'Peel'),
}

# ---------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------
ov = g['overview']
ov['h1'] = 'HTS Chapter 08: Edible Fruit and Nuts — Tariff Rates'
ov['seo'] = {
    'title': 'HTS Chapter 08 Fruit & Nuts Tariff Rates & Import Duties (2026) | KoalaGains',
    'shortDescription': 'Searchable 2026 duty table for all 240 HTS Chapter 08 lines — avocados, bananas, grapes, berries, citrus, cashews, almonds and dried fruit. General, FTA and Column 2 rates, the 2026 Section 301 duty by country and the fruit exempt from it.',
    'keywords': [
        'hts chapter 08',
        'edible fruit and nuts; peel of citrus fruit or melons tariff',
        'hts chapter 08 import duty rates',
        'fruit and nuts import duty',
        'avocado import duty',
        'banana tariff',
        'peruvian blueberries import duty',
        'usmca edible fruit and nuts exemption',
        '2026 hts chapter 08 tariff updates',
        'citrus fruit peel customs duty',
    ],
}
ov['intro'] = (
    'Chapter 08 covers fruit and nuts — fresh, chilled, frozen, dried or provisionally preserved — plus citrus and melon peel. '
    'Its **240 tariff lines** carry mostly small printed rates (11.2¢/kg on avocados, 1.1¢/kg on strawberries, Free on bananas and blueberries), '
    'but a few are steep and seasonal: cantaloupes entered outside August 1–September 15 pay 29.8%, other melons 28%, frozen strawberries 11.2%.\n\n'
    'The U.S. imported **$25.66B** of Chapter 08 goods in 2025; Mexico alone supplied 40% and USMCA-qualifying Mexican and Canadian produce enters free. '
    'Since July 24, 2026 most other suppliers add a **Section 301 tariff of 10% or 12.5%** — Peru and Chile +12.5%, Guatemala and Ecuador +10%, '
    '10% in total for the EU — but **77 lines are exempt**: bananas, avocados, pineapples, mangoes, oranges, limes, coconuts, cashews and other tropical '
    'fruit and nuts (U.S. note 52(b)). For fresh fruit, USDA APHIS decides whether a fruit may come from a given country at all.'
)
ov['stats'][2]['note'] = f'Section 301: {N_COVERED} lines for the 60 economies; the {N_EXEMPT} exempt lines only for China (older lists, most of them); USMCA goods exempt'
ov['stats'].append({'label': 'Lines exempt from the 2026 Section 301 duty', 'value': f'{N_EXEMPT} of {len(lines)}', 'note': 'U.S. note 52(b)–(c): bananas, avocados, pineapples, mangoes, oranges, limes, cashews…'})

BLURBS = {
    '0801': ('Coconuts, Brazil nuts and cashews are Free on every line and on the Section 301 exemption list, so they enter duty-free from any country except China (older Section 301 lists). Vietnam supplied $768M, mostly shelled cashews.', ['coconut', 'desiccated coconut', 'cashew', 'cashew kernels', 'brazil nut']),
    '0802': ('Most nuts pay a per-kilogram rate — shelled almonds 24¢/kg, shelled walnuts 26.5¢/kg, shelled pecans 17.6¢/kg, pistachios 0.9–1.9¢/kg — and the Section 301 duty. Chestnuts, macadamias, pine, kola and areca nuts are exempt from Section 301.', ['almond', 'walnut', 'pistachio', 'pecan', 'hazelnut', 'macadamia', 'pine nut', 'chestnut']),
    '0803': ('Bananas are Free and exempt from Section 301; only dried plantains carry a duty (1.4%). Guatemala, Ecuador, Costa Rica, Colombia and Honduras ship most of the volume.', ['banana', 'plantain', 'organic banana']),
    '0804': ('The largest group by value. Avocados pay 11.2¢/kg (Free under USMCA), pineapples 0.44–1.1¢/kg, mangoes 6.6¢/kg fresh — all three exempt from Section 301. Dates (up to 29.8%) and figs are not exempt.', ['avocado', 'hass avocado', 'mango', 'pineapple', 'guava', 'mangosteen', 'date', 'medjool', 'fig']),
    '0805': ('Oranges, mandarins and grapefruit pay 1.5–2.5¢/kg, limes 0.8% or 1.8¢/kg. Oranges and limes are exempt from Section 301; lemons, mandarins and grapefruit are not. Grapefruit rates change with the month of entry.', ['orange', 'mandarin', 'clementine', 'tangerine', 'lemon', 'lime', 'grapefruit', 'pomelo']),
    '0806': ('Fresh table grapes pay $1.13 or $1.80 per cubic meter and are Free from April 1 to June 30; raisins pay 1.8–2.8¢/kg. Not exempt from Section 301 — Peru and Chile pay +12.5%.', ['grape', 'table grapes', 'raisin', 'sultana', 'currant']),
    '0807': ('The highest base rates in the chapter, and seasonal: watermelons 9% (December–March) or 17%, cantaloupes 12.8% (August 1–September 15) or 29.8%, other melons 5.4% or 28%. Papayas (5.4%) are exempt from Section 301.', ['watermelon', 'cantaloupe', 'honeydew', 'melon', 'papaya']),
    '0808': ('Apples are Free; pears and quinces are Free from April 1 to June 30 and 0.3¢/kg otherwise. Quinces are exempt from Section 301.', ['apple', 'pear', 'quince', 'organic apple']),
    '0809': ('Cherries and nectarines are Free, apricots 0.2¢/kg, plums Free January–May and 0.5¢/kg otherwise. None is exempt from Section 301 — cherries from Chile pay 12.5%.', ['cherry', 'peach', 'nectarine', 'plum', 'apricot']),
    '0810': ('Berries are the second-largest group: blueberries, raspberries and blackberries are Free or near-free at base but pay the Section 301 duty. Kiwifruit, durians, lychee, dragon fruit and other tropical fruit are exempt.', ['blueberry', 'strawberry', 'raspberry', 'blackberry', 'cranberry', 'kiwifruit', 'lychee', 'dragon fruit', 'pomegranate', 'persimmon']),
    '0811': ('Frozen fruit is mostly ad valorem: strawberries 11.2%, raspberries 4.5%, mangoes 10.9%, cherries and other fruit 14.5%; blueberries are Free. Frozen bananas, pineapples, mangoes, papayas and coconut meat are exempt from Section 301.', ['frozen strawberries', 'frozen blueberries', 'frozen raspberries', 'frozen mango', 'frozen fruit', 'acai']),
    '0812': ('Fruit preserved only for transport (in brine, sulfur water or SO₂) and not edible as entered: cherries 13.4¢/kg, fruit mixtures 11.2%.', ['brined cherries', 'provisionally preserved fruit', 'sulfured fruit']),
    '0813': ('Dried apricots 1.8¢/kg, dried apples 0.74¢/kg, dried blueberries 1.4¢/kg; dried prunes and mixtures of nuts or dried fruit pay 14%. None is exempt from Section 301.', ['dried apricot', 'prune', 'dried fruit', 'trail mix', 'dried cranberry', 'dried mango']),
    '0814': ('Orange and citron peel are Free; lime and other peel 1.6¢/kg.', ['orange peel', 'lemon peel', 'citrus peel', 'watermelon rind']),
}
for pg in ov['productGroups']:
    b, ex = BLURBS[pg['heading']]
    pg['label'] = LABELS[pg['heading']][0]
    pg['blurb'] = b
    pg['searchExamples'] = ex

ov['workedExamples'] = [
    {'title': '18,000 kg of Hass avocados from Michoacán', 'line': '0804.40.00.40', 'body': 'The general rate is 11.2¢/kg: 18,000 × $0.112 = **$2,016**. With a USMCA claim (SPI **S**) it is **$0**. Avocados are on the Section 301 exemption list (9903.05.86), so even a Mexican shipment that does not qualify for USMCA pays only the $2,016 — no 10% on top.'},
    {'title': '$100,000 of fresh blueberries from Peru', 'line': '0810.40.00.29', 'body': 'Blueberries are Free at base, but Peru is one of the 60 Section 301 economies and blueberries are not exempt: 12.5% × $100,000 = **$12,500** (9903.05.63). Claiming the Peru TPA does not help — it removes only the base rate, which is already Free.'},
    {'title': '$60,000 of table grapes from Chile entered in March', 'line': '0806.10.20', 'body': 'Grapes entered February 15–March 31 are $1.13/m³, which the Chile FTA (SPI **CL**) makes Free. The Section 301 duty for Chile still applies: 12.5% × $60,000 = **$7,500** (9903.05.30). The same grapes entered April 1–June 30 would be Free at base but still pay the $7,500.'},
    {'title': '$250,000 of shelled cashews from Vietnam', 'line': '0801.32.00.00', 'body': 'Cashews are Free and on the Section 301 exemption list, so the duty is **$0** — although Vietnam pays +12.5% on most other goods (9903.05.84). Shelled walnuts from Vietnam, by contrast, pay 26.5¢/kg plus 12.5%.'},
]
ts = ov['tradeSnapshot']
ts['totalDutyCollectedUsd'] = None
ts['effectiveDutyRateNote'] = "Duty-collected figures aren't available from an official source yet."
ts['coverageNote'] = 'Imports are CIF values reported by the United States to UN Comtrade for 2025; they are not duty-paid figures.'
ov['notes'] = {'chapterNotes': CHAPTER_NOTES, 'additionalUsNotes': US_NOTES}

# ---------------------------------------------------------------------------------------------
# Sources (TariffUpdateSource) added to tariffUpdates / industryAreas
# ---------------------------------------------------------------------------------------------
def S(id, publisher, citation, document, title, signed, published, url):
    return {'id': id, 'publisher': publisher, 'citation': citation, 'document': document, 'title': title, 'signed': signed, 'published': published, 'url': url}


EXTRA_SOURCES = [
    S('eo-14389', 'Federal Register', '91 FR 9437', 'Executive Order 14389', 'Ending Certain Tariff Actions', '2026-02-20', '2026-02-25', FR + '2026/02/25/2026-03832/ending-certain-tariff-actions'),
    S('csms-67834313', 'CBP', 'CSMS # 67834313', 'CBP CSMS message', 'Ending Collection of International Emergency Economic Powers Act Duties', None, '2026-02-22', 'https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9'),
    S('scotus-24-1287', 'Supreme Court of the United States', '607 U.S. 229', 'Opinion, No. 24-1287', 'Learning Resources, Inc. v. Trump', None, '2026-02-20', 'https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf'),
    S('procl-11012', 'Federal Register', '91 FR 9339', 'Proclamation 11012', 'Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems', '2026-02-20', '2026-02-25', FR + '2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems'),
    S('eo-14193', 'Federal Register', '90 FR 9113', 'Executive Order 14193', 'Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border', '2025-02-01', '2025-02-07', FR + '2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border'),
    S('eo-14194', 'Federal Register', '90 FR 9117', 'Executive Order 14194', 'Imposing Duties To Address the Situation at Our Southern Border', '2025-02-01', '2025-02-07', FR + '2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border'),
    S('eo-14257', 'Federal Register', '90 FR 15041', 'Executive Order 14257', 'Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits', '2025-04-02', '2025-04-07', FR + '2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and'),
    S('eo-14323', 'Federal Register', '90 FR 37739', 'Executive Order 14323', 'Addressing Threats to the United States by the Government of Brazil', '2025-07-30', '2025-08-05', FR + '2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil'),
    S('eo-14360', 'Federal Register', '90 FR 54091', 'Executive Order 14360', 'Modifying the Scope of the Reciprocal Tariffs With Respect to Certain Agricultural Products', '2025-11-14', '2025-11-25', FR + '2025/11/25/2025-21203/modifying-the-scope-of-the-reciprocal-tariffs-with-respect-to-certain-agricultural-products'),
    S('eo-14361', 'Federal Register', '90 FR 54467', 'Executive Order 14361', 'Modifying the Scope of Tariffs on the Government of Brazil', '2025-11-20', '2025-11-26', FR + '2025/11/26/2025-21417/modifying-the-scope-of-tariffs-on-the-government-of-brazil'),
    S('ustr-usmca-review', 'USTR', 'USTR press release', 'Statement', 'Ambassador Greer Issues Statement on the USMCA Joint Review', None, '2026-07-01', 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review'),
    S('ustr-agoa-2026', 'USTR', 'USTR press release', 'Statement', 'Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act', None, '2026-02-03', 'https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act'),
    S('cbp-gsp', 'CBP', 'CBP web page (modified August 6, 2026)', 'Web page', 'Generalized System of Preferences (GSP)', None, '2026-08-06', 'https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences'),
    S('fr-2026-04584', 'Federal Register', '91 FR 11131', 'Final rule (USDA AMS)', 'Avocados Grown in South Florida and Imported Avocados; Change in Maturity Requirements', None, '2026-03-09', FR + '2026/03/09/2026-04584/avocados-grown-in-south-florida-and-imported-avocados-change-in-maturity-requirements'),
    S('fr-2026-02372', 'Federal Register', '91 FR 5365', 'Proposed rule (USDA AMS)', 'Kiwifruit Grown in California and Imported Kiwifruit; Modification of Handling Regulations', None, '2026-02-06', FR + '2026/02/06/2026-02372/kiwifruit-grown-in-california-and-imported-kiwifruit-modification-of-handling-regulations'),
    S('fr-2025-18267', 'Federal Register', '90 FR 45315', 'Direct final rule (USDA AMS)', 'Imported Walnuts; Suspension of Handling Regulations', None, '2025-09-22', FR + '2025/09/22/2025-18267/imported-walnuts-suspension-of-handling-regulations'),
    S('fr-2024-31144', 'Federal Register', '89 FR 106231', 'Final rule (USDA AMS)', 'Section 8e Import Inspection Fee Structure', None, '2024-12-30', FR + '2024/12/30/2024-31144/section-8e-import-inspection-fee-structure'),
    S('fr-2025-01903', 'Federal Register', '90 FR 8367', 'Final rule; delay of effective date (USDA AMS)', 'Section 8e Import Inspection Fee Structure', None, '2025-01-29', FR + '2025/01/29/2025-01903/section-8e-import-inspection-fee-structure'),
    S('fr-2026-19044', 'Federal Register', '91 FR 58838', 'Notice (USDA APHIS)', 'Notice of Availability of a Pest Risk Analysis for the Importation of Fresh Coconut Fruit From Belize Into the United States', None, '2026-09-17', FR + '2026/09/17/2026-19044/notice-of-availability-of-a-pest-risk-analysis-for-the-importation-of-fresh-coconut-fruit-from'),
    S('fr-2026-11636', 'Federal Register', '91 FR 35176', 'Notice (USDA APHIS)', 'Notice of Proposed Revision to Requirements for the Importation of Fresh Pineapple (Ananas comosus (L.)) From the Philippines and Thailand Into the United States', None, '2026-06-10', FR + '2026/06/10/2026-11636/notice-of-proposed-revision-to-requirements-for-the-importation-of-fresh-pineapple-ananas-comosus-l'),
    S('fr-2026-04206', 'Federal Register', '91 FR 10364', 'Notice (USDA APHIS)', 'Notice of Proposed Revision to Requirements for the Importation of Pineapples From Taiwan Into the United States', None, '2026-03-03', FR + '2026/03/03/2026-04206/notice-of-proposed-revision-to-requirements-for-the-importation-of-pineapples-from-taiwan-into-the'),
    S('fr-2025-09657', 'Federal Register', '90 FR 22679', 'Notice (USDA APHIS)', 'Notice of Decision To Authorize the Importation of Fresh Pineapple (Ananas comosus) Fruit From Indonesia Into the United States', None, '2025-05-29', FR + '2025/05/29/2025-09657/notice-of-decision-to-authorize-the-importation-of-fresh-pineapple-ananas-comosus-fruit-from'),
    S('fr-2025-14091', 'Federal Register', '90 FR 35265', 'Notice (USDA APHIS)', 'Notice of Decision To Deregulate Light Brown Apple Moth for Fruit Imported From New Zealand Into the United States', None, '2025-07-25', FR + '2025/07/25/2025-14091/notice-of-decision-to-deregulate-light-brown-apple-moth-for-fruit-imported-from-new-zealand-into-the'),
    S('fda-traceability', 'FDA', 'FDA web page (content current as of October 8, 2026)', 'Web page', 'FSMA Final Rule on Requirements for Additional Traceability Records for Certain Foods', None, '2026-10-08', 'https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods'),
    S('pl-119-37', 'GovInfo', 'Pub. L. 119-37', 'Public law', 'Continuing Appropriations, Agriculture, Legislative Branch, Military Construction and Veterans Affairs, and Extensions Act, 2026', '2025-11-12', '2025-11-12', 'https://www.govinfo.gov/content/pkg/PLAW-119publ37/pdf/PLAW-119publ37.pdf'),
]
SRC = {s['id']: s for s in EXTRA_SOURCES}

# ---------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------
tu = g['tariffUpdates']
tu['h1'] = 'HTS Chapter 08: Edible Fruit and Nuts — Tariff Updates'
tu['seo'] = {
    'title': 'HTS Chapter 08 Fruit & Nuts Tariff Updates 2026 — What Changed Since January 2025 | KoalaGains',
    'shortDescription': 'What changed for HTS Chapter 08 (fruit and nuts) since January 2025: unchanged base rates, the end of the IEEPA duties, the 2026 Section 301 tariffs on Peru, Chile, Vietnam and others, the fruit exempt from them, and USDA import rules — with Federal Register citations.',
    'keywords': [
        'hts chapter 08 tariff updates',
        'peru tariff on edible fruit and nuts',
        'vietnam cashew import duties 2026',
        'usmca chapter 08 tariff exemptions',
        'mexico avocado tariff rates',
        'chile fresh grapes import tax',
        'section 301 tariff fruit',
        'banana tariff exemption',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** '
    '(in force October 9, 2026). No Chapter 08 base rate changed; 14 new 10-digit statistical lines split out certified-organic fruit, wild blueberries and '
    'grapefruit entered in October.\n\n'
    'The changes came on top of the base rate. The 2025 IEEPA duties (Mexico and Canada +25% or +35% on non-USMCA goods, the reciprocal tariff of 10% or more on '
    'everyone else) **ended on February 24, 2026**; from November 13, 2025 bananas, avocados, pineapples, mangoes, oranges, limes, coconuts, cashews and other '
    'tropical produce had already been exempt from the reciprocal tariff. The 10% Section 122 surcharge that followed (with the same produce exempt) expired on '
    'July 23, 2026. Since **July 24, 2026**, fruit and nuts from 60 economies pay a **Section 301 tariff of 10% or 12.5%** — Peru, Chile, Costa Rica, Colombia and '
    f'Vietnam +12.5%, Guatemala, Ecuador and Honduras +10% — except on the **{N_EXEMPT} exempt lines**. Brazil pays +37.5% and China up to +37.5%. '
    '**USMCA-qualifying produce from Mexico and Canada is exempt.**'
)
tu['scope'] = (
    'Measures that reach Chapter 08 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption list, the Brazil Section 301 tariff, the '
    'China Section 301 Lists 3 and 4A, the scheduled Nicaragua Section 301 increases, the 2025–2026 IEEPA and Section 122 duties that have ended, and USDA '
    'and FDA import rules that changed. For the rate each supplier pays, see Rates by country.'
)

EXEMPT_TXT = (
    f'The {N_EXEMPT} lines on the Section 301 exemption list (9903.05.86, U.S. note 52(b)) — bananas, plantains, avocados, pineapples, mangoes, guavas, oranges, '
    'limes, papayas, kiwifruit, quinces, coconuts, cashews, Brazil nuts, chestnuts, macadamia and pine nuts, lychee and other tropical fruit, and several frozen '
    'tropical fruits — pay no Section 301 duty; etrogs and frozen tropical fruit nesoi are exempt on declaration (9903.05.87).'
)
IEEPA_END = 'The IEEPA reciprocal tariff ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.'
IE = {
    'mx-section-301': ('USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.94). ' + EXEMPT_TXT + ' The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.',
                       'USMCA-qualifying avocados, berries and limes from Mexico pay $0. A Mexican shipment that does not qualify pays the base rate plus 10% on non-exempt fruit (berries, lemons, grapes, melons, nuts) — avocados, limes and mangoes stay at the base rate only.'),
    'pe-section-301': (EXEMPT_TXT + ' The Peru TPA (SPI PE) removes the base rate but not the Section 301 duty (U.S. note 52(a)). ' + IEEPA_END,
                       'Peruvian blueberries and table grapes pay 12.5% of value; Peruvian avocados and mangoes pay nothing (Free under the Peru TPA and exempt from Section 301).'),
    'cl-section-301': (EXEMPT_TXT + ' The Chile FTA (SPI CL) removes the base rate but not the Section 301 duty. ' + IEEPA_END,
                       'Chilean grapes, cherries, blueberries and mandarins pay 12.5% of value; Chilean avocados and kiwifruit pay nothing.'),
    'gt-section-301': (EXEMPT_TXT + ' CAFTA-DR (SPI P) removes the base rate but not the Section 301 duty; the CAFTA-DR relief in 9903.05.95 covers textiles only. ' + IEEPA_END,
                       'Guatemalan bananas (the bulk of the trade) pay nothing; Guatemalan melons and berries pay 10% of value.'),
    'cr-section-301': (EXEMPT_TXT + ' CAFTA-DR (SPI P) removes the base rate but not the Section 301 duty; the CAFTA-DR relief in 9903.05.95 covers textiles only. ' + IEEPA_END,
                       'Costa Rican pineapples and bananas pay nothing; Costa Rican melons pay 12.5% of value.'),
    'vn-section-301': (EXEMPT_TXT + ' ' + IEEPA_END,
                       'Vietnamese cashews and coconuts pay nothing; Vietnamese walnuts, dried fruit and frozen fruit pay the base rate plus 12.5%.'),
    'ec-section-301': (EXEMPT_TXT + ' ' + IEEPA_END,
                       'Ecuadorian bananas pay nothing, and pineapples and mangoes pay only their base rate (no Section 301 duty); berries and other non-exempt fruit pay the base rate plus 10%.'),
    'co-section-301': (EXEMPT_TXT + ' The Colombia TPA (SPI CO) removes the base rate but not the Section 301 duty. ' + IEEPA_END,
                       'Colombian bananas, avocados and limes pay nothing; Colombian lemons, berries and other non-exempt fruit pay 12.5% of value.'),
    'ca-section-301': ('USMCA-qualifying goods entered free under USMCA pay no Section 301 duty (9903.05.93). ' + EXEMPT_TXT + ' The 2025 IEEPA duty on Canada (+35%, 9903.01.10) ended February 24, 2026. The 2026 Section 338 duties and bans on Canadian alcoholic beverages, dairy and motor vehicles list no Chapter 08 line.',
                       'USMCA-qualifying frozen blueberries and fresh fruit from Canada pay $0; Canadian fruit that does not qualify pays the base rate plus 10% on non-exempt lines.'),
    'hn-section-301': (EXEMPT_TXT + ' CAFTA-DR (SPI P) removes the base rate but not the Section 301 duty; the CAFTA-DR relief in 9903.05.95 covers textiles only. ' + IEEPA_END,
                       'Honduran bananas pay nothing; Honduran melons and watermelons pay 10% of value.'),
    'eu-section-301': (EXEMPT_TXT + ' For EU goods whose base rate (or its ad valorem equivalent) is under 10% the total is 10% (9903.05.39); lines with a higher base rate pay the base rate only. This replaced the 15% IEEPA reciprocal rate (9903.02.20), which ended February 24, 2026.',
                       'Spanish clementines pay 10% of value in place of the 1.9¢/kg base rate; melons whose base rate is above 10% (12.8%–29.8%) pay that base rate only.'),
    'br-section-301': ('+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 (9903.05.27). The same exemption list applies to both (9903.05.03, note 50(a)(ii); 9903.05.86), and etrogs and frozen tropical fruit nesoi are exempt on declaration (9903.05.04, 9903.05.87). The 2025 IEEPA duty on Brazil (+40%, Executive Order 14323) ended February 24, 2026.',
                       'Brazilian mangoes, Brazil nuts and cashews pay nothing extra; Brazilian grapes, melons and lemons pay the base rate plus 37.5%.'),
    'cn-section-301': ('Three Section 301 duties can apply: +25% under List 3 (9903.88.03, since May 10, 2019) or +7.5% under List 4A (9903.88.15, since February 14, 2020), depending on the line, plus +12.5% under the 2026 action (9903.05.31) on non-exempt lines. The exemption list removes only the 2026 duty, so exempt fruit and nuts from China still pay 25% or 7.5%. USTR continued the China actions on October 7, 2026. The IEEPA duty on China ended February 24, 2026.',
                       'Chinese walnuts or dried fruit pay the base rate plus 37.5% or 20%; Chinese cashews or coconut products pay 25% or 7.5%.'),
    'other-section-301': (EXEMPT_TXT + ' Rates by economy: +12.5% for Australia, New Zealand, Thailand, the Philippines, South Africa, Turkey, Israel and others; +10% for India, Indonesia, Argentina and others; Japan, South Korea and Switzerland 12.5% and Taiwan 10% in total when the base rate is lower. Nicaragua (+12.5%, 9903.05.58) also faces its own Section 301 duty of 10% from January 1, 2027 on goods not entered under CAFTA-DR. Countries outside the 60 (for example Panama or Kenya) pay no 2026 Section 301 duty.',
                          'Turkish dried apricots and figs or Indian cashews: apricots and figs pay the base rate plus the country rate; Indian cashews are exempt and pay nothing.'),
}
for e in tu['inEffect']:
    e['exemption'], e['whatItMeans'] = IE[e['id']]
    if e['id'] == 'br-section-301':
        e['sourceIds'] = e['sourceIds'] + ['eo-14323', 'eo-14389']
    if e['id'] in ('mx-section-301', 'ca-section-301'):
        e['sourceIds'] = e['sourceIds'] + ['eo-14389']

CHG = {
    'section-301-nicaragua-2028-01-01': 'The Nicaragua Section 301 action raises its duty on all products of Nicaragua to 15% from January 1, 2028 (9903.89.01), unless USTR modifies it. It stacks with the 12.5% 2026 Section 301 duty on Nicaragua (9903.05.58) on non-exempt lines.',
    'section-301-nicaragua-2027-01-01': 'The Nicaragua Section 301 action (0% in 2026) rises to 10% on all products of Nicaragua from January 1, 2027, and to 15% a year later (9903.89.01). It reaches every Chapter 08 line, including the fruit exempt from the 2026 action (where Nicaragua pays nothing extra today).',
    'base-rates': '226 of 240 lines carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the 2025 Basic Edition; none changed. The other 14 are new 10-digit statistical lines (certified-organic splits for pineapples, dried mangoes, frozen strawberries, frozen pineapples and frozen mangoes; wild frozen blueberries; grapefruit and pomelos entered in October) at the rate of their 8-digit parent.',
    'section-301-2026-60-economies-2026-07-24': f'+10% or +12.5% on all products of 60 economies (9903.05.20–9903.05.84), with EU goods at 10% and Japan, South Korea and Switzerland at 12.5% in total where the base rate is lower. In Chapter 08 it reaches {N_COVERED} of 240 lines; the other {N_EXEMPT} are on the exemption list (9903.05.86) — the same tropical fruit and nuts that were exempt from the reciprocal tariff and the Section 122 surcharge. USMCA-qualifying goods from Mexico and Canada are exempt (9903.05.93, 9903.05.94).',
    'section-301-brazil-2026-07-22': f'25% on all goods of Brazil (9903.05.01), except the subheadings on its exemption list (9903.05.03) — the same {N_EXEMPT} Chapter 08 lines exempt from the 60-economy action. From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on top.',
}
for ch in tu['changes']:
    if ch['id'] in CHG:
        ch['detail'] = CHG[ch['id']]
    if ch['id'] == 'section-301-2026-60-economies-2026-07-24':
        ch['countries'] = '60 economies'


def C(id, type, date, label, title, detail, before, now, countries, sids):
    return {'id': id, 'type': type, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now, 'countries': countries, 'sourceIds': sids}


NEW_CHANGES = [
    C('fda-trace-2028', 'reference', '2026-10-09', 'Checked', 'FDA food traceability rule: not enforced before July 20, 2028', 'Fresh melons, papayas, mangoes, guavas, lychee and other tropical tree fruit are on the Food Traceability List. The original compliance date (January 20, 2026) was pushed out: Pub. L. 119-37 directed FDA not to enforce the rule before July 20, 2028, and FDA says it will comply (page current as of October 8, 2026).', 'January 20, 2026', 'July 20, 2028', 'All', ['fda-traceability', 'pl-119-37']),
    C('coconut-belize', 'pending', '2026-09-17', 'Published', 'Proposed: fresh coconuts from Belize', 'APHIS published a pest risk analysis finding that designated phytosanitary measures can mitigate the risks of fresh coconut fruit from Belize. Comments are due November 16, 2026; imports are not authorized until APHIS issues a decision.', None, None, 'Belize', ['fr-2026-19044']),
    C('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired', 'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    C('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force', 'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply to Mexican and Canadian fruit.', None, None, 'Mexico, Canada', ['ustr-usmca-review']),
    C('pineapple-ph-th', 'pending', '2026-06-10', 'Published', 'Proposed: wider access for fresh pineapple from the Philippines and Thailand', 'APHIS proposed letting all varieties of fresh pineapple from the Philippines and Thailand into all U.S. ports, and Thai pineapple without irradiation. The comment period closed August 10, 2026; no final decision had been published as of October 11, 2026.', None, None, 'Philippines, Thailand', ['fr-2026-11636']),
    C('avocado-maturity', 'reference', '2026-04-08', 'Effective', 'Imported avocado maturity rules changed', 'AMS changed the South Florida avocado maturity schedule so certain sizes of the Beta variety can ship earlier, and made the matching change to the Section 8e avocado import regulation (7 CFR 944.31).', None, None, 'All', ['fr-2026-04584']),
    C('pineapple-taiwan', 'pending', '2026-03-03', 'Published', 'Proposed: fresh pineapple from Taiwan to all U.S. states', 'APHIS proposed allowing any variety of fresh pineapple from Taiwan into any U.S. state or territory (today only at least 50% Smooth Cayenne, into Guam and the Northern Mariana Islands). The comment period closed May 4, 2026; no final decision had been published as of October 11, 2026.', None, None, 'Taiwan', ['fr-2026-04206']),
    C('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs', '10% on products of all countries (9903.03.01) until July 23, 2026. Forty-eight Chapter 08 subheadings — bananas, avocados, pineapples, mangoes, oranges, limes, coconuts, cashews and other tropical produce — were on the product exemption lists (9903.03.03, 9903.03.04); USMCA-qualifying goods from Mexico and Canada were exempt.', 'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'hts-now']),
    C('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end', 'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.', 'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    C('kiwi-size', 'pending', '2026-02-06', 'Published', 'Proposed: smaller minimum size for imported kiwifruit', 'AMS proposed relaxing the minimum size for kiwifruit (except Actinidia chinensis) under the California marketing order and the Section 8e kiwifruit import regulation (7 CFR 944.550). Comments closed April 7, 2026; no final rule had been published as of October 11, 2026.', None, None, 'All', ['fr-2026-02372']),
    C('agoa-renewed', 'reference', '2026-02-03', 'Signed', 'AGOA reauthorized through December 31, 2026', 'The Consolidated Appropriations Act, 2026 renewed AGOA (SPI D) retroactively from September 30, 2025. Most dutiable Chapter 08 lines list D in the Special column. GSP (SPI A, A+, A*) remains expired since December 31, 2020, so GSP claims pay the general rate.', 'Lapsed (from September 30, 2025)', 'In force to December 31, 2026', 'AGOA beneficiary countries', ['ustr-agoa-2026', 'cbp-gsp']),
    C('ag-exemption', 'extraDuty', '2025-11-13', 'Effective', 'Tropical fruit and nuts exempted from the reciprocal tariff', 'Executive Order 14360 added agricultural products to the reciprocal-tariff exemption list (U.S. note 2(v)(iii) to Chapter 99), including 48 Chapter 08 subheadings: bananas, plantains, avocados, pineapples, mangoes, guavas, oranges, limes, papayas, kiwifruit, coconuts, cashews, Brazil nuts, macadamias and other tropical produce. Executive Order 14361 made a similar change to Brazil\'s 40% IEEPA duty from the same date. Grapes, berries, apples, lemons, almonds and most other temperate fruit and nuts stayed covered until the IEEPA duties ended.', '+10% or more', 'None on listed lines', 'All countries subject to the reciprocal tariff', ['eo-14360', 'eo-14361', 'hts-now']),
    C('walnut-stay', 'reference', '2025-11-06', 'Effective', 'Walnut import regulation stayed', 'AMS stayed the Section 8e grade and size regulation for imported walnuts (7 CFR 999.100) to match the suspended California walnut handling rules, so imported walnuts no longer need USDA grade inspection.', 'USDA inspection required', 'Stayed', 'All', ['fr-2025-18267']),
    C('br-ieepa', 'extraDuty', '2025-08-06', 'Effective', 'Additional 40% IEEPA duty on products of Brazil', '+40% on Brazilian goods (Executive Order 14323, signed July 30, 2025), with an annex of exempt products; narrowed for agricultural products from November 13, 2025 (Executive Order 14361). Ended February 24, 2026.', 'None', '+40% (ended)', 'Brazil', ['eo-14323', 'eo-14361']),
    C('lbam-nz', 'reference', '2025-07-25', 'Published', 'New Zealand fruit no longer needs a light brown apple moth declaration', 'APHIS removed the requirement that fruit from New Zealand (including kiwifruit and apples) carry a phytosanitary-certificate declaration of freedom from light brown apple moth.', 'Additional declaration', 'Not required', 'New Zealand', ['fr-2025-14091']),
    C('pineapple-indonesia', 'reference', '2025-05-29', 'Published', 'Fresh pineapple from Indonesia authorized', 'APHIS authorized fresh pineapple fruit for consumption from Indonesia under designated phytosanitary measures.', 'Not authorized', 'Authorized', 'Indonesia', ['fr-2025-09657']),
    C('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries', '10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.', 'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257']),
    C('8e-fees', 'reference', '2025-03-20', 'Effective', 'Section 8e import inspection fees charged per pound', 'AMS moved Section 8e import inspection fees (avocados, citrus, grapes, kiwifruit, dates, nuts, raisins and other 8e commodities) from a per-carlot to a per-pound basis, with half-price additional sublots. The rule was published December 30, 2024 and its effective date delayed to March 20, 2025.', 'Per carlot', 'Per pound', 'All', ['fr-2024-31144', 'fr-2025-01903']),
    C('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico', '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.', 'None', '+25% (ended)', 'Mexico', ['eo-14194']),
    C('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada', '+25% on non-USMCA goods (9903.01.10), raised to +35% from August 1, 2025; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.', 'None', '+25% (ended)', 'Canada', ['eo-14193']),
]
nic = [c for c in tu['changes'] if c['id'].startswith('section-301-nicaragua-')]
assert nic  # the generator wrote two dated entries when this script was written; it now writes one (#1863)
nic_sids = nic[0]['sourceIds']
tu['changes'] = [c for c in tu['changes'] if not c['id'].startswith('section-301-nicaragua-')]
NEW_CHANGES.append(C('section-301-nicaragua', 'pending', '2025-12-29', 'Published', 'Scheduled: Section 301 duty on products of Nicaragua rises to 10% (2027) and 15% (2028)',
    'USTR set a Section 301 duty, phased in over two years, on products of Nicaragua entered at the general rate (9903.89.01): +10% from January 1, 2027 and +15% from January 1, 2028. Goods originating under CAFTA-DR are not covered (U.S. note 29(a)). Where it applies it reaches every Chapter 08 line, including the fruit exempt from the 2026 action, and stacks with the 12.5% 2026 Section 301 duty on Nicaragua (9903.05.58) on non-exempt lines.',
    'None', '+10% (2027), +15% (2028)', 'Nicaragua', nic_sids))
tu['changes'] = sorted(tu['changes'] + NEW_CHANGES, key=lambda c: c['date'], reverse=True)

used = {sid for e in tu['inEffect'] for sid in e['sourceIds']} | {sid for c in tu['changes'] for sid in c['sourceIds']}
have = {s['id'] for s in tu['sources']}
for sid in sorted(used - have):
    tu['sources'].append(SRC[sid])
tu['lastCheckedAt'] = CHECKED

# ---------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------
ui['h1'] = 'HTS Chapter 08: Edible Fruit and Nuts — U.S. Import Statistics'
ui['seo'] = {
    'title': 'HTS Chapter 08 Fruit & Nut Import Statistics by Country & Product | KoalaGains',
    'shortDescription': 'U.S. fruit and nut imports 2020–2025 by country, product and year: $25.66B in 2025. Mexico 40%, Peru 14%, Chile 10%; avocados, bananas, grapes and blueberries lead.',
    'keywords': [
        'united states tariffs on edible fruit and nuts',
        'us fruit imports by country',
        'us avocado imports mexico',
        'fresh bananas import duty',
        'us blueberry imports peru',
        'hts chapter 08 import statistics',
        'usda aphis compliance',
    ],
}
for c in ui['byCountry']:
    if c['mainHeading']:
        c['mainHeadingLabel'] = LABELS[c['mainHeading']][0]
ui['effectiveDuty'] = {'year': 2025, 'dutyPaidUsd': None, 'note': "Duty-collected figures aren't available from an official source yet."}
ui['why'] = (
    'U.S. imports of fruit and nuts were **$25.66B in 2025**, 1.4% less than in 2024 ($26.02B) and 32% more than in 2020 ($19.47B). '
    '**Mexico** supplied $10.36B (40%) — avocados and other 0804 fruit ($3.98B) and berries ($3.40B) — and fell 6.5%, while **Peru** grew 16.8% to $3.48B on table grapes and blueberries. '
    'Chile ($2.51B), Guatemala ($1.83B) and Costa Rica ($1.37B) follow.\n\n'
    'By product, **avocados** (0804.40, $3.80B), **bananas** (0803.90, $2.89B) and **fresh grapes** (0806.10, $2.83B) lead, then blueberries and cranberries (0810.40, $2.29B) and raspberries and blackberries (0810.20, $1.69B). '
    'Shelled cashews, mostly from Vietnam, fell 20% to $858M.\n\n'
    'The duty actually paid is small relative to the value. Mexico and Canada ship mostly under USMCA, the Central and South American suppliers claim CAFTA-DR, Chile, Peru or Colombia FTA rates, and '
    f'subheadings worth about $11.8B in 2025 — avocados, bananas, pineapples, mangoes, oranges, cashews, kiwifruit and other tropical produce — are exempt from the 2026 Section 301 duty. '
    'Peru, Chile, Costa Rica and Colombia still pay +12.5% (Guatemala, Ecuador and Honduras +10%) on non-exempt fruit such as grapes, blueberries, cherries and melons since July 24, 2026. '
    '2025 is the latest full year of U.S. trade data, so none of these figures yet reflect that duty.'
)
ui['sources'].append({'label': 'HTSUS 2026 Revision 21, Chapter 99, U.S. note 52(b) (Section 301 exemption list)', 'url': HTS_CH99})
ui['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade; Comtrade does not report duty paid.'
ui['lastCheckedAt'] = CHECKED

# ---------------------------------------------------------------------------------------------
# Industry areas
# ---------------------------------------------------------------------------------------------
ia['h1'] = 'HTS Chapter 08: Edible Fruit and Nuts — Tariff Rates by Country'
ia['seo'] = {
    'title': 'HTS Chapter 08 Fruit & Nut Tariff Rates by Country — Mexico, Peru, Chile, Guatemala | KoalaGains',
    'shortDescription': 'The total U.S. tariff on fruit and nuts by country and product group: base rate plus the 2026 Section 301 duty, with USMCA, FTA and the tropical-fruit exemption applied. Mexico, Peru, Chile, Guatemala, Costa Rica, Vietnam, Ecuador, Colombia, Canada, Honduras.',
    'keywords': [
        'avocado import duty rates',
        'chile fresh fruit customs duty',
        'hts chapter 08 import duty',
        'fresh blueberry trade impact',
        'us fruit and nut import tariffs',
        'mexico tariff on edible fruit and nuts',
        'tariff on blueberries from peru',
        'tariff on bananas',
    ],
}
ia['intro'] = (
    'The total rate on fruit and nuts depends on **where it comes from and whether the fruit is on the exemption list**. Each cell below is the base rate for that product group '
    'plus the extra duty for that country, minus any preference — computed from the current tariff schedule.\n\n'
    '**USMCA-qualifying produce from Mexico and Canada enters free.** Peru, Chile, Costa Rica and Colombia claim FTA rates that zero the base rate but still pay the **12.5% Section 301 duty** '
    'on grapes, berries, cherries and other non-exempt fruit; Guatemala, Ecuador and Honduras pay 10%. **Bananas, avocados, pineapples, mangoes, limes, oranges and cashews are exempt**, '
    'so for the largest tropical lanes the total is still Free.'
)
for gr in ia['groups']:
    gr['label'], gr['shortLabel'] = LABELS[gr['heading']]
EXTRA_LBL = ' Exempt lines (9903.05.86): bananas, avocados, pineapples, mangoes, oranges, limes, kiwifruit, coconuts, cashews and other tropical produce. IEEPA duties ended February 24, 2026.'
RL = {
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55) on 163 of 240 lines.' + EXTRA_LBL,
    'Canada': 'USMCA-qualifying: no extra duty (9903.05.93). Otherwise base rate +10% Section 301 (9903.05.29) on 163 of 240 lines.' + EXTRA_LBL,
    'Peru': 'Peru TPA (PE) removes the base rate where the line lists it; +12.5% Section 301 (9903.05.63) on 163 of 240 lines.' + EXTRA_LBL,
    'Chile': 'Chile FTA (CL) removes the base rate where the line lists it; +12.5% Section 301 (9903.05.30) on 163 of 240 lines.' + EXTRA_LBL,
    'Guatemala': 'CAFTA-DR (P) removes the base rate where the line lists it; +10% Section 301 (9903.05.40) on 163 of 240 lines.' + EXTRA_LBL,
    'Costa Rica': 'CAFTA-DR (P) removes the base rate where the line lists it; +12.5% Section 301 (9903.05.33) on 163 of 240 lines.' + EXTRA_LBL,
    'Honduras': 'CAFTA-DR (P) removes the base rate where the line lists it; +10% Section 301 (9903.05.42) on 163 of 240 lines.' + EXTRA_LBL,
    'Colombia': 'Colombia TPA (CO) removes the base rate where the line lists it; +12.5% Section 301 (9903.05.32) on 163 of 240 lines.' + EXTRA_LBL,
    'Vietnam': 'Base rate +12.5% Section 301 (9903.05.84) on 163 of 240 lines; no FTA.' + EXTRA_LBL,
    'Ecuador': 'Base rate +10% Section 301 (9903.05.35) on 163 of 240 lines; no FTA (GSP expired).' + EXTRA_LBL,
    'Any other country': 'From the base rate only (countries outside the 60 Section 301 economies, such as Panama or Kenya) to +37.5% for Brazil (9903.05.01 + 9903.05.27) and China (9903.88.03 + 9903.05.31) on non-exempt lines; Chinese fruit pays 25% or 7.5% even on exempt lines.',
}
for c in ia['countries']:
    c['rule']['label'] = RL[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if 'TODO' not in a] + [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'FTA preferences remove the base rate only; the 2026 Section 301 duty applies to FTA and CAFTA-DR goods (U.S. note 52(a)). AGOA (SPI D) is in force through December 31, 2026 but is not applied here; GSP has been expired since December 31, 2020.',
    'Seasonal lines (grapes, melons, pears, plums, strawberries, grapefruit, mangoes) are shown with every rate they can carry; the rate in force on the date of entry applies.',
    'The rate is not the only gate: fresh fruit may be imported only from origins APHIS has approved (ACIR database), often with a treatment, and Section 8e fruit must pass USDA grade inspection.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) lists 46 Chapter 08 subheadings ({} ten-digit lines) exempt from the 2026 Section 301 duties for every country, '
    'and note 52(c) (9903.05.87) exempts etrogs (0805.90.01) and frozen tropical fruit nesoi (0811.90.80) on declaration; note 50(a)(ii)–(iii) gives Brazil the same exemptions. '
    'No Chapter 08 code is on the country exception lists in note 52(j) or on the Canada Section 338 lists (note 51). China Section 301 List 3 (note 20(f)) and List 4A (note 20(s)) cover the Chapter 08 subheadings, exempt ones included.'
).format(N_EXEMPT)
ia['lastCheckedAt'] = CHECKED

# ---------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------
te = g['tariffEngineering']
te['h1'] = 'HTS Chapter 08: Edible Fruit and Nuts — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Fruit & Nuts: APHIS Permits, Phytosanitary Rules & Legal Ways to Lower Duty (HTS Ch. 08) | KoalaGains',
    'shortDescription': 'The permits, certificates and inspections for each HTS Chapter 08 line — USDA APHIS fruit rules and treatments, USDA AMS Section 8e grade inspection, FDA prior notice and FSVP — and the legal ways to pay less: USMCA, FTAs, seasonal rates and the Section 301 exemption list.',
    'keywords': [
        'import fruit into the us requirements',
        'aphis fruit import permit',
        'phytosanitary certificate fruit import',
        'section 8e import regulations',
        'usmca agricultural rules of origin',
        'section 122 global tariff',
        'agricultural tariff engineering',
        'fsvp fresh produce importer',
    ],
}
te['intro'] = (
    'For fresh fruit the first question is not the rate but **whether the fruit may come from that country at all**: USDA APHIS lists every approved fruit-and-origin pair, '
    'often with a treatment (cold, heat or irradiation) or a pest-free area. Avocados, citrus, grapes, kiwifruit, dates and several nuts must also pass **USDA AMS Section 8e** '
    'grade inspection, and all food needs FDA prior notice and a Foreign Supplier Verification Program.\n\n'
    'The ways to pay less are written into the schedule: claim **USMCA** for Mexican and Canadian produce, an **FTA rate** for Chile, Peru, Colombia or CAFTA-DR fruit, '
    '**time the entry** for seasonal lines, and report the **Section 301 exemption** for tropical fruit and nuts. Each depends on a document, listed below with its regulation.'
)
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = LEVERS
te['rules'] = RULES
te['disclaimer'] = 'A checklist of where the rules are, with links to the regulations — not legal advice. Fruit import approvals and treatments differ by country and change often; check the APHIS ACIR database and your permit before each shipment.'
te['lastCheckedAt'] = CHECKED
for grp in te['groups']:
    grp['label'] = LABELS[grp['heading']][0]
    grp['ruleIds'], grp['note'] = GROUPS[grp['heading']]

AMS_BY_PREFIX = [
    ('0804.40', 'ams-avocado'), ('0804.10', 'ams-dates'), ('0805.10', 'ams-citrus'), ('0805.40', 'ams-citrus'), ('0806.10', 'ams-grapes'),
    ('0806.20.10', 'ams-raisins'), ('0806.20.20', 'ams-raisins'), ('0810.50', 'ams-kiwi'), ('0809.40', 'ams-prunes'), ('0813.20', 'ams-prunes'),
    ('0802.21', 'ams-nuts'), ('0802.22', 'ams-nuts'), ('0802.31', 'ams-nuts'), ('0802.32', 'ams-nuts'), ('0802.51', 'ams-nuts'), ('0802.52', 'ams-nuts'),
]
TRACE = ('0804.50', '0807', '0810.90.46.40', '0810.90.46.50')
SEASONAL = ('0804.50.40', '0804.50.60', '0805.40', '0806.10', '0807.11', '0807.19', '0808.30', '0808.40', '0809.30', '0809.40', '0810.10', '0810.20.10', '0810.20.90')
FTA_SPI = ('CL', 'PE', 'CO', 'P,', 'P)', 'AU', 'KR')
row_by_hts = {r['hts']: r for r in lines}
for ln in te['lines']:
    h = ln['heading']
    base = [r for r in GROUPS[h][0] if not r.startswith('ams-') and r not in ('nop-organic', 'fda-trace')]
    if h == '0804' and ln['hts'][:7] in ('0804.10', '0804.20'):
        base = ['aphis-dried', 'aphis-fresh', 'fda-entry']
    rules = list(base)
    for p, rid in AMS_BY_PREFIX:
        if ln['hts'].startswith(p) and rid not in rules:
            rules.append(rid)
    if any(r.startswith('ams-') for r in rules) and 'ams-8e' not in rules:
        rules.append('ams-8e')
    if ln['hts'].startswith(TRACE):
        rules.append('fda-trace')
    if 'organic' in ln['description'].lower():
        rules.append('nop-organic')
    levers = ['usmca']
    spec = row_by_hts[ln['hts']]['effectiveSpecial'] or ''
    if (ln['general'] or 'Free') != 'Free' and any(s in spec.replace(' ', '') for s in FTA_SPI):
        levers.append('fta')
    if ln['hts'].startswith(SEASONAL):
        levers.append('season')
    if is_exempt(ln['hts'].replace('.', '')):
        levers.append('s301-exempt')
    if any(r.startswith('ams-') and r != 'ams-8e' for r in rules) and not ln['hts'].startswith(('0802.31', '0802.32')):
        levers.append('sc6')
    levers.append('ruling')
    ln['ruleIds'], ln['leverIds'] = rules, levers

# ---------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------
fc = g['finalConclusion']
fc['h1'] = 'HTS Chapter 08: Edible Fruit and Nuts — Tariff FAQ'
fc['seo'] = {
    'title': 'Fruit & Nut Tariffs FAQ: Mexican Avocados, Bananas, Peru Blueberries, HS Codes (HTS Ch. 08) | KoalaGains',
    'shortDescription': 'Answers to what people search about fruit and nut tariffs in 2026: avocados from Mexico, bananas, blueberries from Peru, grapes, cashews, mangoes, HS codes for avocados, bananas, cashews and dates, and bringing fruit into the U.S.',
    'keywords': [
        'is there a tariff on avocados from mexico',
        'tariff on mexican avocados',
        'are there tariffs on bananas',
        'trump tariffs on bananas',
        'is there a tariff on blueberries from peru',
        'is there a tariff on cashews',
        'tariff on mangoes',
        'are there tariffs on fruit from mexico',
        'hs code avocado',
        'hs code for bananas',
        'hs code for cashew nuts',
        'bringing fruit into the us',
    ],
}
fc['intro'] = 'Straight answers to the most common questions about U.S. tariffs on fruit and nuts — by country and product, HS codes and entry rules. Each answer links to the page with the full detail.'
fc['keyTakeaways'] = [
    'USMCA-qualifying fruit and nuts from Mexico and Canada enter free — no base rate, no extra duty.',
    f'The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 a Section 301 tariff of 10% or 12.5% applies to fruit from 60 economies, including Peru, Chile, Guatemala, Costa Rica, Colombia, Ecuador and Vietnam — but {N_EXEMPT} lines (bananas, avocados, pineapples, mangoes, oranges, limes, cashews, coconuts and other tropical produce) are exempt.',
    'For fresh fruit, USDA APHIS approval of the fruit and origin decides whether it can enter at all; avocados, citrus, grapes, kiwifruit, dates and some nuts also need USDA grade inspection.',
]
fc['questionSource'] = 'Google search suggestions, collected October 11, 2026'
fc['lastCheckedAt'] = CHECKED
fc['faqs'] = [
    {'id': 'mexico-avocados', 'question': 'Is there a tariff on avocados from Mexico?', 'searchedAs': ['is there a tariff on avocados from mexico', 'tariff on mexican avocados', 'us tariffs on mexican avocados', 'are there tariffs on mexican avocados', 'tariff on avocados'],
     'answer': 'Not if they qualify for USMCA: avocados (0804.40) have a base rate of 11.2¢/kg that USMCA makes Free, and avocados are on the Section 301 exemption list (9903.05.86). A Mexican shipment that does not qualify pays only the 11.2¢/kg — about $2,016 on an 18,000 kg load — with no 10% on top. The 25% IEEPA duty of 2025 never applied to USMCA goods and ended on February 24, 2026. The U.S. imported $3.80B of avocados in 2025, most of it from Mexico.', 'link': 'industry-areas'},
    {'id': 'bananas', 'question': 'Are there tariffs on bananas?', 'searchedAs': ['are there tariffs on bananas', 'tariffs on bananas', 'trump tariffs on bananas', 'current tariffs on bananas', 'did trump put tariffs on bananas', 'us cut tariffs on bananas'],
     'answer': 'No. Fresh bananas (0803.90) are Free at base, and bananas were taken off the reciprocal tariff from November 13, 2025 (Executive Order 14360). They are on the Section 301 exemption list (9903.05.86), so bananas from Guatemala, Ecuador, Costa Rica, Colombia or Honduras pay no Section 301 duty either. Only dried plantains carry a base rate (1.4%). China is the exception: its older Section 301 lists still apply.', 'link': 'tariff-updates'},
    {'id': 'peru-blueberries', 'question': 'Is there a tariff on blueberries from Peru?', 'searchedAs': ['is there a tariff on blueberries from peru', 'tariff on blueberries', 'is there a tariff on blueberries', 'peruvian blueberries import duty'],
     'answer': 'Yes, since July 24, 2026: 12.5% of value under the Section 301 duty on goods of Peru (9903.05.63). Fresh blueberries (0810.40) are Free at base, so the Peru TPA does not lower the bill, and blueberries are not on the exemption list. Blueberries from Mexico that qualify for USMCA remain duty-free; from Chile they also pay 12.5%.', 'link': 'industry-areas'},
    {'id': 'mexico-fruit', 'question': 'Are there tariffs on fruits and vegetables from Mexico?', 'searchedAs': ['are there tariffs on fruits and vegetables from mexico', 'are there tariffs on fruit from mexico', 'is there tariffs on fruits and vegetables', 'mexico tariff on edible fruit and nuts'],
     'answer': 'For fruit that qualifies for USMCA, no — the base rate is Free and the 10% Section 301 duty on Mexican goods does not apply (9903.05.94). Mexico supplied $10.36B of the $25.66B of fruit and nuts imported in 2025. Mexican fruit that does not qualify pays the base rate plus 10% on non-exempt lines such as berries, lemons and melons; avocados, limes and mangoes pay only the base rate. Vegetables are in Chapter 07.', 'link': 'industry-areas'},
    {'id': 'cashews', 'question': 'Is there a tariff on cashews?', 'searchedAs': ['is there a tariff on cashews', 'tariff on cashews', 'cashew import', 'vietnam cashew import duties 2026'],
     'answer': 'Cashews (0801.31 in shell, 0801.32 shelled) are Free and on the Section 301 exemption list, so cashews from Vietnam, India or Africa enter duty-free even though Vietnam pays +12.5% on most other goods. Only Chinese cashews pay a Section 301 duty (the older List 3 or 4A rate). The U.S. imported $858M of shelled cashews in 2025.', 'link': 'industry-areas'},
    {'id': 'mangoes', 'question': 'Is there a tariff on mangoes?', 'searchedAs': ['is there a tariff on mangoes', 'tariff on mangoes'],
     'answer': 'Fresh mangoes (0804.50) pay 6.6¢/kg, which USMCA, the Peru, Colombia and Chile agreements and CAFTA-DR make Free. Mangoes are exempt from the 2026 Section 301 duty, so the base rate is the whole tariff. Most origins must treat mangoes (hot water or irradiation) under APHIS rules.', 'link': 'tariff-engineering'},
    {'id': 'grapes', 'question': 'What is the tariff on grapes?', 'searchedAs': ['tariffs on grapes', 'chile fresh grapes import tax'],
     'answer': 'Fresh table grapes (0806.10) are $1.13 per cubic meter from February 15 to March 31, Free from April 1 to June 30 and $1.80 per cubic meter otherwise; the Chile and Peru agreements make all of these Free. Grapes are not exempt from Section 301, so Chilean and Peruvian grapes pay 12.5% of value since July 24, 2026 — $7,500 on a $60,000 load. Imported table grapes must also meet USDA Section 8e grade rules.', 'link': 'industry-areas'},
    {'id': 'nuts', 'question': 'Is there a tariff on nuts?', 'searchedAs': ['is there a tariff on nuts', 'tariff on nuts', 'tariff on brazil nuts', 'tariffs on pistachios'],
     'answer': 'It depends on the nut. Cashews, Brazil nuts, coconuts, chestnuts, macadamias and pine nuts are Free or nearly so and exempt from Section 301. Almonds (24¢/kg shelled), walnuts (26.5¢/kg shelled), hazelnuts, pecans and pistachios (0.9–1.9¢/kg) pay a per-kilogram rate plus the Section 301 duty for the country — for example 12.5% for Turkey or Vietnam. Imported pistachios also need an aflatoxin certificate for each lot (7 CFR 999.600).', 'link': ''},
    {'id': 'hs-avocado', 'question': 'What is the HS code for avocados?', 'searchedAs': ['hs code avocado', 'avocado fruit hs code', 'hs code hass avocado', 'hs code fresh avocado', 'hs code frozen avocado'],
     'answer': 'Fresh or dried avocados are 0804.40; the U.S. 10-digit lines are 0804.40.00.20 (Hass and Hass-like, certified organic), 0804.40.00.40 (other Hass) and 0804.40.00.90 (other avocados), all at 11.2¢/kg. Frozen avocado goes to 0811.90.80 (14.5%), and avocado oil is in Chapter 15, not here.', 'link': ''},
    {'id': 'hs-banana', 'question': 'What is the HS code for bananas?', 'searchedAs': ['hs code for bananas', 'hs code for banana plantain'],
     'answer': 'Bananas other than plantains are 0803.90 (Free), split into certified organic, other fresh and dried. Plantains are 0803.10 — fresh Free, dried 1.4%. Frozen bananas are 0811.90.10 (3.4%); banana chips and other prepared bananas are in Chapter 20.', 'link': ''},
    {'id': 'hs-cashew', 'question': 'What is the HS code for cashew nuts?', 'searchedAs': ['hs code for cashew nuts', 'hs code for cashew', 'hs code for cashew kernels', 'hs code for raw cashew nuts', 'roasted cashew nuts hs code'],
     'answer': 'Raw cashews in shell are 0801.31 and shelled cashew kernels 0801.32, both Free. Roasted or salted cashews are prepared nuts, classified in Chapter 20 (2008.19), not Chapter 08.', 'link': ''},
    {'id': 'hs-dates', 'question': 'What is the HS code for dates?', 'searchedAs': ['hs code for dates', 'hs code for medjool dates', 'hs code for fresh dates', 'hs code for date fruit'],
     'answer': 'Dates are 0804.10: whole dates packed in units of 4.6 kg or less are 0804.10.20 (13.2¢/kg), larger packs with pits 0804.10.40 (1¢/kg) or pitted 0804.10.60 (2.8¢/kg), and other dates (for example chopped) 0804.10.80 at 29.8%. Dates are not exempt from Section 301, and dates for direct sale must meet USDA Section 8e grade rules.', 'link': ''},
    {'id': 'hs-dried-fruit', 'question': 'What is the HS code for dried fruits and nuts?', 'searchedAs': ['hs code for dried fruits', 'hs code for dried fruits and nuts', 'hs code for dried apricots', 'hs code for mix dry fruit'],
     'answer': 'Dried fruit is in Chapter 08 by fruit: raisins 0806.20, dried dates, figs, pineapples and mangoes in 0804, and other dried fruit in 0813 — apricots 0813.10 (1.8¢/kg), prunes 0813.20, apples 0813.30. Mixtures of nuts or dried fruit are 0813.50 at 14%. Dried fruit may be partially rehydrated or sulfured and stay in Chapter 08 (Chapter note 3).', 'link': ''},
    {'id': 'bring-fruit', 'question': 'Can I bring fruit into the U.S.?', 'searchedAs': ['bringing fruit into the us', 'bringing fruit into the us from canada', 'bringing dried fruit into the us', "why can't you bring fruit into the us", 'importing fruit to usa'],
     'answer': 'Fresh fruit must be on APHIS\'s approved list for its country of origin and is inspected at entry; much of it needs a permit, a phytosanitary certificate or a treatment against fruit flies and other pests (7 CFR 319.56). Fruit grown in Canada needs no APHIS permit but is still inspected, and dried, cured or processed fruit and nuts are generally exempt from the permit. Commercial shipments also need FDA prior notice and an importer with a Foreign Supplier Verification Program.', 'link': 'tariff-engineering'},
    {'id': 'us-imports', 'question': 'How much fruit does the U.S. import, and from where?', 'searchedAs': ['us fruit imports by country', 'fresh fruit imports', 'cashew importers in usa'],
     'answer': '$25.66B of fruit and nuts in 2025. Mexico supplied 40% ($10.36B), then Peru ($3.48B), Chile ($2.51B), Guatemala ($1.83B) and Costa Rica ($1.37B). Avocados ($3.80B), bananas ($2.89B) and fresh grapes ($2.83B) were the largest products.', 'link': 'understand-industry'},
]

g['asOf'] = CHECKED
for s in g['sources']:
    pass

json.dump(g, open(out, 'w'), ensure_ascii=False, indent=2)
print('ok', out)
