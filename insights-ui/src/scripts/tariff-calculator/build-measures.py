# Builds src/tariff-data/calculator/measures.json from note-coverage.json plus the reviewed measure definitions below
# (rates, countries, conditions, dates and official sources). Run: python3 src/scripts/tariff-calculator/build-measures.py
# Review every change to the definitions against the cited official documents; see docs/insights-ui/tariffs/calculator-data-refresh.md.
import json, sys
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tariff-data', 'calculator') + os.sep
cov = json.load(open(ROOT + 'note-coverage.json'))['notes']
ED = '2026 Revision 21'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'

def hts_note(n):
    return {'citation': f'HTSUS 2026 Revision 21, Chapter 99, subchapter III, U.S. note {n}', 'url': CH99_PDF, 'published': '2026-10-07'}

SRC = {
  'ustr-301-fl': {'citation': '91 FR 47318 (USTR notice of actions in the Section 301 forced-labor investigations of 60 economies)', 'url': 'https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies', 'published': '2026-07-28'},
  'pm-301-fl': {'citation': '91 FR 47717 (Presidential Memorandum of July 23, 2026: Section 301 actions on 60 economies)', 'url': 'https://www.federalregister.gov/documents/2026/07/28/2026-15274/actions-by-the-united-states-in-the-investigations-under-section-301-of-the-trade-act-of-1974-of-the', 'published': '2026-07-28'},
  'ustr-301-br': {'citation': '91 FR 45516 (USTR notice of action: Brazil Section 301 investigation)', 'url': 'https://www.federalregister.gov/documents/2026/07/20/2026-14542/notice-of-action-brazils-acts-policies-and-practices-related-to-digital-trade-and-electronic-payment', 'published': '2026-07-20'},
  'ustr-301-cn-3-increase': {'citation': '84 FR 20459 (USTR: List 3 rate increased from 10% to 25%)', 'url': 'https://www.federalregister.gov/documents/2019/05/09/2019-09681/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to', 'published': '2019-05-09'},
  'ustr-301-cn-4a': {'citation': '84 FR 43304 (USTR: List 4A imposed)', 'url': 'https://www.federalregister.gov/documents/2019/08/20/2019-17865/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to', 'published': '2019-08-20'},
  'ustr-301-cn-4a-cut': {'citation': '85 FR 3741 (USTR: List 4A rate cut from 15% to 7.5% from February 14, 2020)', 'url': 'https://www.federalregister.gov/documents/2020/01/22/2020-00904/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to', 'published': '2020-01-22'},
  'ustr-cn-301-continue': {'citation': '91 FR 64212 (USTR: China Section 301 actions continue during the four-year review)', 'url': 'https://www.federalregister.gov/documents/2026/10/07/2026-20510/continuation-of-actions-chinas-acts-policies-and-practices-related-to-technology-transfer', 'published': '2026-10-07'},
  'procl-11020': {'citation': '91 FR 18183 (Proclamation 11020: Adjusting Imports of Pharmaceuticals and Pharmaceutical Ingredients)', 'url': 'https://www.federalregister.gov/documents/2026/04/09/2026-06956/adjusting-imports-of-pharmaceuticals-and-pharmaceutical-ingredients-into-the-united-states', 'published': '2026-04-09'},
  'csms-69395344': {'citation': 'CBP CSMS # 69395344 (Section 232 duties on patented pharmaceuticals: guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/422e390', 'published': '2026-07-30'},
  'csms-70054007': {'citation': 'CBP CSMS # 70054007 (Section 232 pharmaceuticals: updated guidance)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42cf077', 'published': '2026-09-28'},
  'bis-uk': {'citation': '91 FR 49406 (Commerce/BIS: UK patented pharmaceuticals reduced to 0%)', 'url': 'https://www.federalregister.gov/documents/2026/08/04/2026-15799/notice-of-reduction-of-tariffs-on-patented-pharmaceuticals-and-pharmaceutical-ingredients-for', 'published': '2026-08-04'},
  'csms-69415934': {'citation': 'CBP CSMS # 69415934 (UK patented pharmaceuticals: reduction to 0%)', 'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/42333fe', 'published': '2026-08-01'},
  'bis-specialty': {'citation': '91 FR 60360 (Commerce/BIS: specialty pharmaceuticals, eligible jurisdictions and technical corrections)', 'url': 'https://www.federalregister.gov/documents/2026/09/23/2026-19498/guidance-and-procedures-for-implementing-tariff-adjustments-for-specialty-pharmaceuticals-and', 'published': '2026-09-23'},
}
def S(*ids): return [SRC[i] for i in ids]

EU = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE']

# 2026 Section 301 (U.S. note 52) duty headings: code, key suffix, name, countries, rate, kind
S301 = [
 ('20','dz','Algeria',['DZ'],12.5),('21','ao','Angola',['AO'],12.5),('22','ar','Argentina',['AR'],10),('23','au','Australia',['AU'],12.5),
 ('24','bs','the Bahamas',['BS'],12.5),('25','bh','Bahrain',['BH'],12.5),('26','bd','Bangladesh',['BD'],10),('27','br','Brazil',['BR'],12.5),
 ('28','kh','Cambodia',['KH'],10),('29','ca','Canada',['CA'],10),('30','cl','Chile',['CL'],12.5),('31','cn','China',['CN'],12.5),
 ('32','co','Colombia',['CO'],12.5),('33','cr','Costa Rica',['CR'],12.5),('34','do','the Dominican Republic',['DO'],12.5),('35','ec','Ecuador',['EC'],10),
 ('36','eg','Egypt',['EG'],12.5),('37','sv','El Salvador',['SV'],10),('39','eu','the European Union',EU,10),('40','gt','Guatemala',['GT'],10),
 ('41','gy','Guyana',['GY'],12.5),('42','hn','Honduras',['HN'],10),('43','hk','Hong Kong',['HK'],12.5),('44','in','India',['IN'],10),
 ('45','id','Indonesia',['ID'],10),('46','iq','Iraq',['IQ'],12.5),('47','il','Israel',['IL'],12.5),('49','jp','Japan',['JP'],12.5),
 ('50','jo','Jordan',['JO'],10),('51','kz','Kazakhstan',['KZ'],12.5),('52','kw','Kuwait',['KW'],12.5),('53','ly','Libya',['LY'],12.5),
 ('54','my','Malaysia',['MY'],10),('55','mx','Mexico',['MX'],10),('56','ma','Morocco',['MA'],12.5),('57','nz','New Zealand',['NZ'],12.5),
 ('58','ni','Nicaragua',['NI'],12.5),('59','ng','Nigeria',['NG'],12.5),('60','no','Norway',['NO'],12.5),('61','om','Oman',['OM'],12.5),
 ('62','pk','Pakistan',['PK'],10),('63','pe','Peru',['PE'],12.5),('64','ph','the Philippines',['PH'],12.5),('65','qa','Qatar',['QA'],12.5),
 ('66','ru','Russia',['RU'],12.5),('67','sa','Saudi Arabia',['SA'],12.5),('68','sg','Singapore',['SG'],12.5),('69','za','South Africa',['ZA'],12.5),
 ('71','kr','South Korea',['KR'],12.5),('72','lk','Sri Lanka',['LK'],10),('74','ch','Switzerland',['CH'],12.5),('76','tw','Taiwan',['TW'],10),
 ('77','th','Thailand',['TH'],12.5),('78','tt','Trinidad and Tobago',['TT'],10),('79','tr','Türkiye',['TR'],12.5),('80','ae','the United Arab Emirates',['AE'],12.5),
 ('81','gb','the United Kingdom',['GB'],10),('82','uy','Uruguay',['UY'],12.5),('83','ve','Venezuela',['VE'],12.5),('84','vn','Vietnam',['VN'],12.5),
]
assert len(S301) == 60
FLOOR_PAIR = {'39': '38', '49': '48', '71': '70', '74': '73', '76': '75'}
ALL_S301_CODES = [f'9903.05.{n:02d}' for n in range(20, 85)]

def rec(**kw):
    base = dict(measureKey=None, program=None, ch99Code=None, rateKind=None, ratePct=None, countriesInclude=[], countriesExclude=[],
                coverageInclude=[], coverageExclude=[], conditions={}, replacesCodes=[], effectiveFrom=None, effectiveTo=None,
                sources=[], htsEdition=ED)
    base.update(kw)
    return base

measures = []
P301 = 'Section 301 (2026, 60 economies)'
for n, k, name, countries, rate, in [(a,b,c,d,e) for a,b,c,d,e in S301]:
    code = f'9903.05.{n}'
    r = rec(measureKey=f's301-2026-{k}', program=P301, ch99Code=code, countriesInclude=countries,
            effectiveFrom='2026-07-24', sources=S('ustr-301-fl', 'pm-301-fl') + [hts_note(52)])
    if n in FLOOR_PAIR:
        r.update(rateKind='floor', ratePct=rate,
                 notes=f'Products of {name}: U.S. note 52(k) makes the total {rate:g}% when the column 1 rate (or its ad valorem equivalent) is under {rate:g}% '
                       f'({code}); at or above {rate:g}% no additional duty is due (9903.05.{FLOOR_PAIR[n]}). Modeled as a floor: max(base, {rate:g}%).'
                       + (' For South Korea, a claimed KORUS (KR) special rate is the column 1 rate compared.' if k == 'kr' else ''))
    else:
        r.update(rateKind='additive', ratePct=rate, notes=f'Products of {name}: base rate + {rate:g}%. U.S. note 52(a): applies also when an FTA/GSP special rate is claimed.')
    if k in ('ca', 'mx'):
        r['conditions'] = {'usmcaQualifying': False}
        r['notes'] += f" Not for goods of {name} entered free under USMCA (U.S. note 52({'g' if k == 'ca' else 'h'}), {'9903.05.93' if k == 'ca' else '9903.05.94'})."
    measures.append(r)

# USMCA relief
for k, name, code, dutycode, sub in [('ca', 'Canada', '9903.05.93', '9903.05.29', 'g'), ('mx', 'Mexico', '9903.05.94', '9903.05.55', 'h')]:
    measures.append(rec(measureKey=f's301-2026-usmca-{k}', program=P301, ch99Code=code, rateKind='relief', countriesInclude=[k.upper()],
        conditions={'usmcaQualifying': True}, replacesCodes=[dutycode], effectiveFrom='2026-07-24',
        sources=S('ustr-301-fl') + [hts_note(52)],
        notes=f'U.S. note 52({sub}): products of {name} entered free of duty under USMCA (SPI S/S+), including lines whose general rate is already Free, pay no Section 301 duty.'))

# General exemptions
measures.append(rec(measureKey='s301-2026-exempt-52b', program=P301, ch99Code='9903.05.86', rateKind='relief',
    coverageInclude=cov['52(b)'], replacesCodes=ALL_S301_CODES, effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52)],
    notes=f"U.S. note 52(b): the {len(cov['52(b)'])} subheadings listed are exempt from 9903.05.20–9903.05.84 for every country (in Chapter 30: 45 subheadings in 3001–3004 and 3006). No Chapter 01 line is listed."))
ch30e = [c for c in cov['52(e)'] if c.startswith('30')]
measures.append(rec(measureKey='s301-2026-exempt-52e-pharma-use-ch30', program=P301, ch99Code='9903.05.89', rateKind='relief',
    coverageInclude=ch30e, replacesCodes=ALL_S301_CODES, effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52)],
    notes=f"U.S. note 52(e): articles for use in pharmaceutical applications. Only the {len(ch30e)} Chapter 30 subheadings of the {len(cov['52(e)'])}-line list are modeled "
          "(goods there are presumed for pharmaceutical use, as in the Chapter 30 content file). The Chapter 28/29/38/39 lines of the list need a pharmaceutical-use "
          "claim the calculator conditions cannot express yet, so they are left out (see note-coverage.json \"52(e)\")."))

# Country exceptions 52(j)
EXC = [
 ('52(j)(1)', '9903.05.96', 'gb', ['GB'], ['9903.05.81'], 'the United Kingdom'),
 ('52(j)(2)', '9903.05.97', 'eu', EU, ['9903.05.38', '9903.05.39'], 'the European Union'),
 ('52(j)(3)', '9903.05.98', 'ch', ['CH'], ['9903.05.73', '9903.05.74'], 'Switzerland'),
 ('52(j)(4)(i)', '9903.05.99', 'my', ['MY'], ['9903.05.54'], 'Malaysia'),
 ('52(j)(5)(i)', '9903.06.02', 'kh', ['KH'], ['9903.05.28'], 'Cambodia'),
 ('52(j)(6)(i)', '9903.06.04', 'gt', ['GT'], ['9903.05.40'], 'Guatemala'),
 ('52(j)(7)(i)', '9903.06.07', 'sv', ['SV'], ['9903.05.37'], 'El Salvador'),
 ('52(j)(8)(i)', '9903.06.10', 'ar', ['AR'], ['9903.05.22'], 'Argentina'),
 ('52(j)(9)(i)', '9903.06.12', 'bd', ['BD'], ['9903.05.26'], 'Bangladesh'),
 ('52(j)(10)(i)', '9903.06.14', 'tw', ['TW'], ['9903.05.75', '9903.05.76'], 'Taiwan'),
 ('52(j)(11)(i)', '9903.06.16', 'id', ['ID'], ['9903.05.45'], 'Indonesia'),
 ('52(j)(12)(i)', '9903.06.18', 'ec', ['EC'], ['9903.05.35'], 'Ecuador'),
 ('52(j)(13)(i)', '9903.06.20', 'jo', ['JO'], ['9903.05.50'], 'Jordan'),
]
for sub, code, k, countries, repl, name in EXC:
    codes = cov[sub]
    ch01 = [c for c in codes if c.startswith('01')]
    measures.append(rec(measureKey=f's301-2026-except-{k}', program=P301, ch99Code=code, rateKind='relief', countriesInclude=countries,
        coverageInclude=codes, replacesCodes=repl, effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52)],
        notes=f'U.S. note {sub}: products of {name} classifiable in the {len(codes)} listed provisions pay no Section 301 duty under {", ".join(repl)}.'
              + (f' Chapter 01 lines: {", ".join(ch01)}.' if ch01 else ' No Chapter 01 or 30 line is listed.')))

# Brazil Section 301 (U.S. note 50)
PBR = 'Section 301 (Brazil)'
measures.append(rec(measureKey='s301-brazil', program=PBR, ch99Code='9903.05.01', rateKind='additive', ratePct=25, countriesInclude=['BR'],
    effectiveFrom='2026-07-22', sources=S('ustr-301-br') + [hts_note(50)],
    notes='U.S. note 50(a)(i): products of Brazil pay base rate + 25%, also when an FTA/GSP special rate is claimed. Stacks with the 12.5% 2026 Section 301 duty (9903.05.27).'))
measures.append(rec(measureKey='s301-brazil-exempt-50a-ii', program=PBR, ch99Code='9903.05.03', rateKind='relief', countriesInclude=['BR'],
    coverageInclude=cov['50(a)(ii)'], replacesCodes=['9903.05.01'], effectiveFrom='2026-07-22', sources=S('ustr-301-br') + [hts_note(50)],
    notes=f"U.S. note 50(a)(ii): the {len(cov['50(a)(ii)'])} listed subheadings are exempt from 9903.05.01 (in Chapter 30, the same 45 subheadings as note 52(b)). No Chapter 01 line is listed."))
ch30v = [c for c in cov['50(a)(v)'] if c.startswith('30')]
measures.append(rec(measureKey='s301-brazil-exempt-50a-v-pharma-use-ch30', program=PBR, ch99Code='9903.05.06', rateKind='relief', countriesInclude=['BR'],
    coverageInclude=ch30v, replacesCodes=['9903.05.01'], effectiveFrom='2026-07-22', sources=S('ustr-301-br') + [hts_note(50)],
    notes=f"U.S. note 50(a)(v): Brazilian articles for use in pharmaceutical applications. Only the {len(ch30v)} Chapter 30 subheadings of the {len(cov['50(a)(v)'])}-line list are modeled "
          "(presumed for pharmaceutical use, as in the Chapter 30 content file); the other lines need a pharmaceutical-use claim the conditions cannot express yet."))

# China Section 301 lists (U.S. note 20) — Chapters 01 and 30 only
PCN = 'Section 301 (China, 2018-2019 lists)'
l3 = [c for c in cov['20(f)'] if c[:2] in ('01', '30')]
l4a = [c for c in cov['20(s)(i)'] if c[:2] in ('01', '30')]
measures.append(rec(measureKey='s301-china-list3', program=PCN, ch99Code='9903.88.03', rateKind='additive', ratePct=25, countriesInclude=['CN'],
    coverageInclude=l3, effectiveFrom='2019-05-10', sources=S('ustr-301-cn-3-increase', 'ustr-cn-301-continue') + [hts_note(20)],
    notes=f"List 3, U.S. note 20(e)–(f): base rate + 25% (25% since May 10, 2019). Coverage is limited to the Chapter 01 and 30 lines of the {len(cov['20(f)'])}-line list "
          f"({', '.join(l3)}); the full list is in note-coverage.json \"20(f)\". Product exclusions in note 20 for these lines have expired."))
measures.append(rec(measureKey='s301-china-list4a', program=PCN, ch99Code='9903.88.15', rateKind='additive', ratePct=7.5, countriesInclude=['CN'],
    coverageInclude=l4a, effectiveFrom='2020-02-14', sources=S('ustr-301-cn-4a', 'ustr-301-cn-4a-cut', 'ustr-cn-301-continue') + [hts_note(20)],
    notes=f"List 4A, U.S. note 20(r)–(s): base rate + 7.5% (15% from September 1, 2019, cut to 7.5% from February 14, 2020). Coverage is limited to the Chapter 01 and 30 lines "
          f"of the {len(cov['20(s)(i)'])}-line list: all {sum(1 for c in l4a if c.startswith('01'))} Chapter 01 subheadings and 3006.93.20, 3006.93.50; the full list is in note-coverage.json \"20(s)(i)\". "
          "The Chapter 01 exclusions in notes 20(ddd) and 20(jjj) (research macaques, 0106.11.00.00) have expired. Stacks with the 12.5% 2026 Section 301 duty (9903.05.31)."))

# Section 232 pharmaceuticals (U.S. note 40)
P232 = 'Section 232 (pharmaceuticals)'
c40 = cov['40(c)']
REPL_301 = ALL_S301_CODES + ['9903.05.01']
DEAL = EU + ['JP', 'KR', 'CH', 'LI']
SPECIALTY = sorted(EU + ['AR', 'BD', 'KH', 'EC', 'SV', 'GT', 'IN', 'ID', 'JP', 'JO', 'MY', 'MK', 'KR', 'CH', 'LI', 'TW', 'TH', 'GB', 'VN'])
COV_NOTE = f'Coverage: the {len(c40)} provisions of U.S. note 40(c) (77 in Chapter 30: 3002, 3003, 3004; the rest are Chapter 29 ingredients).'
STACK_NOTE = 'Patented articles under 9903.04.60–9903.04.66 are excluded from the 2026 Section 301 duties (U.S. note 52(f)(8)) and the Brazil duty (note 50(a)(vi)(8)), so those codes are replaced.'
measures.append(rec(measureKey='s232-pharma-patented', program=P232, ch99Code='9903.04.60', rateKind='floor', ratePct=100, countriesExclude=sorted(DEAL + ['GB']),
    coverageInclude=c40, conditions={'productTypes': ['patented', 'specialty']}, replacesCodes=REPL_301, effectiveFrom='2026-09-29',
    sources=S('procl-11020', 'csms-69395344', 'csms-70054007', 'bis-specialty') + [hts_note(40)],
    notes='U.S. note 40(d): when the column 1 rate is below 100%, the total is 100%; when above, no additional duty. Modeled as a floor: max(base, 100%). '
          'In force for all importers from September 29, 2026 (companies in Annex III to Proclamation 11020 from July 31, 2026). '
          'Specialty products from jurisdictions not on the 9903.04.66 list are charged as patented. Note 40(b): collected even when an FTA special rate is claimed. '
          'Company onshoring/MFN-pricing headings 9903.04.64 (+20%) and 9903.04.65 (0%), U.S.-API 9903.04.68, non-pharmaceutical 9903.04.69 and R&D 9903.04.70 are not modeled (no condition for them yet). '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-deal-15', program=P232, ch99Code='9903.04.62', rateKind='floor', ratePct=15, countriesInclude=DEAL,
    coverageInclude=c40, conditions={'productTypes': ['patented', 'specialty']}, replacesCodes=REPL_301, effectiveFrom='2026-09-29',
    sources=S('procl-11020', 'csms-70054007') + [hts_note(40)],
    notes='U.S. note 40(f): patented articles of Japan, the EU, South Korea, Switzerland or Liechtenstein; when the column 1 rate is below 15% the total is 15%, otherwise no additional duty. Modeled as a floor: max(base, 15%). '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-uk', program=P232, ch99Code='9903.04.63', rateKind='additive', ratePct=0, countriesInclude=['GB'],
    coverageInclude=c40, conditions={'productTypes': ['patented', 'specialty']}, replacesCodes=REPL_301, effectiveFrom='2026-07-31',
    sources=S('bis-uk', 'csms-69415934') + [hts_note(40)],
    notes='U.S. note 40(g): patented articles of the United Kingdom, base rate + 0% (set at 10% by Proclamation 11020, reduced to 0% from July 31, 2026). Must still be entered under 9903.04.63. '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-specialty', program=P232, ch99Code='9903.04.66', rateKind='additive', ratePct=0, countriesInclude=SPECIALTY,
    coverageInclude=c40, conditions={'productTypes': ['specialty']}, replacesCodes=['9903.04.60', '9903.04.62', '9903.04.63'] + REPL_301, effectiveFrom='2026-09-29',
    sources=S('procl-11020', 'bis-specialty') + [hts_note(40)],
    notes='U.S. note 40(h)(iii): orphan drugs, nuclear medicines, plasma-derived therapies, fertility drugs, cell and gene therapies, ADCs, CBRN countermeasures and animal-health products '
          'of the jurisdictions BIS listed on September 23, 2026 (EU, Argentina, Bangladesh, Cambodia, Ecuador, El Salvador, Guatemala, India, Indonesia, Japan, Jordan, Malaysia, North Macedonia, '
          'South Korea, Switzerland, Liechtenstein, Taiwan, Thailand, United Kingdom, Vietnam): base rate + 0%. Products meeting an urgent U.S. health need (BIS approval, any origin) are not modeled. '
          + COV_NOTE + ' ' + STACK_NOTE))
measures.append(rec(measureKey='s232-pharma-generic', program=P232, ch99Code='9903.04.67', rateKind='relief',
    coverageInclude=c40, conditions={'productTypes': ['generic']}, replacesCodes=['9903.04.60', '9903.04.62', '9903.04.63'], effectiveFrom='2026-07-31',
    sources=S('procl-11020', 'csms-70054007') + [hts_note(40)],
    notes='Proclamation 11020 clause 5 and U.S. note 40(c)(iii): generic pharmaceuticals, biosimilars and their ingredients pay no Section 232 duty (entered under 9903.04.67). '
          'They are not in 9903.04.60–9903.04.66, so the 2026 Section 301 and Brazil duties still apply unless another exemption covers the line (all Chapter 30 lines of note 40(c) are on note 52(b) / 50(a)(ii)). '
          + COV_NOTE))

out = {'htsEdition': ED, 'reviewedAt': '2026-10-09', 'measures': measures}
json.dump(out, open(ROOT + 'measures.json', 'w'), ensure_ascii=False, indent=2)
print(len(measures), 'measures')
