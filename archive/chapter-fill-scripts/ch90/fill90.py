#!/usr/bin/env python3
"""Fill the writer parts of the Chapter 90 (optical, medical and precision instruments) content file after
`pnpm tariff:generate-chapter`.

Usage: python3 fill90.py <generated.json> <out.json>
Re-runnable: every regeneration of the data parts is followed by this script (see run.sh).
"""
import glob
import json
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
TODAY = '2026-10-13'
SLUG_FILE = '90-optical-and-precision-instruments'

d = json.load(open(SRC))

# Official sources already used (and checked) in other chapter files, by id.
REF_SOURCES = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if SLUG_FILE in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF_SOURCES.setdefault(s['id'], s)

MEASURES = {m['measureKey']: m for m in json.load(open(f'{WT}/src/tariff-data/calculator/measures.json'))['measures']}

CH90_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2090'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC_381 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title21/html/USCODE-2024-title21-chap9-subchapVIII-sec381.htm'
FDA_IMPORT_DEVICES = 'https://www.fda.gov/industry/importing-fda-regulated-products/importing-medical-devices'
FDA_IMPORT_REP = 'https://www.fda.gov/industry/importing-fda-regulated-products/importing-radiation-emitting-electronic-products'
FDA_REG_LIST = 'https://www.fda.gov/medical-devices/how-study-and-market-your-device/device-registration-and-listing'


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M' if n >= 1e8 else f'${n / 1e6:.1f}M'
    return f'${n / 1e3:.0f}K'


def pct(a, b):
    return round((a / b - 1) * 100, 1)


# ---------------------------------------------------------------------------------------------------
# Trade figures
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-90.json'))
Y = trade['latestYear']
PY = trade['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in trade['totalsByYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c_all = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hs6 = {x['hs6']: x for x in trade['byHs6']}
by_hc = {(r['heading'], r['country']): r['importsUsd'] for r in trade['byHeadingCountry']}


def imp(country, year=None):
    c = by_c_all.get(country)
    if not c:
        return 0
    return c['importsUsd'] if year is None else c['byYear'].get(str(year), 0)


def chg(country):
    c = by_c_all[country]
    return pct(c['importsUsd'], c['priorImportsUsd'])


def hy(h, year=None):
    return by_h.get(h, {}).get(str(year or Y), 0)


def h6(code):
    return by_hs6[code.replace('.', '')]['importsUsd']


ranked = sorted(trade['byCountry'], key=lambda c: -c['importsUsd'])
TOP = [c['country'] for c in ranked]
assert TOP[:4] == ['Mexico', 'Germany', 'China', 'Ireland'], TOP[:6]


# ---------------------------------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------------------------------
def frsrc(sid, citation, document, title, published, url, signed=None):
    return {
        'id': sid,
        'publisher': 'Federal Register',
        'citation': citation,
        'document': document,
        'title': title,
        'signed': signed,
        'published': published,
        'url': url,
    }


NEW_SOURCES = {
    'hts-ch90': {
        'id': 'hts-ch90',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 90',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 90: Optical, Photographic, Cinematographic, '
        'Measuring, Checking, Precision, Medical or Surgical Instruments and Apparatus; Parts and Accessories Thereof',
        'signed': None,
        'published': '2026-10-07',
        'url': CH90_PDF,
    },
    'bis-232-medical': frsrc(
        'bis-232-medical',
        '90 FR 46383',
        'Notice (Commerce / BIS)',
        'Notice of Request for Public Comments on Section 232 National Security Investigation of Imports of Personal Protective Equipment, '
        'Medical Consumables, and Medical Equipment, Including Devices',
        '2025-09-26',
        'https://www.federalregister.gov/documents/2025/09/26/2025-18729/notice-of-request-for-public-comments-on-section-232-national-'
        'security-investigation-of-imports-of',
    ),
    'procl-11002': frsrc(
        'procl-11002',
        '91 FR 2443',
        'Proclamation 11002',
        'Adjusting Imports of Semiconductors, Semiconductor Manufacturing Equipment, and Their Derivative Products Into the United States',
        '2026-01-20',
        'https://www.federalregister.gov/documents/2026/01/20/2026-01052/adjusting-imports-of-semiconductors-semiconductor-manufacturing-'
        'equipment-and-their-derivative',
        signed='2026-01-14',
    ),
    'ad-alext-cn': frsrc(
        'ad-alext-cn',
        '76 FR 30650',
        'Notice (Commerce, A-570-967)',
        "Aluminum Extrusions from the People's Republic of China: Antidumping Duty Order (scope covers extrusions entered as parts of other "
        'products, under other HTS chapters)',
        '2011-05-26',
        'https://www.federalregister.gov/documents/2011/05/26/2011-13086/aluminum-extrusions-from-the-peoples-republic-of-china-antidumping-'
        'duty-order',
    ),
}


def src(sid):
    if sid in NEW_SOURCES:
        return NEW_SOURCES[sid]
    return REF_SOURCES[sid]


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(json.loads(json.dumps(src(sid))))
            have.add(sid)


# ---------------------------------------------------------------------------------------------------
# Coverage counts from the official measures (10-digit lines)
# ---------------------------------------------------------------------------------------------------
rows = d['overview']['rateTable']['rows']
LINES = [r for r in rows if r['htsCode10']]


def covered(key):
    m = MEASURES[key]
    inc = [c.replace('.', '') for c in m['coverageInclude'] if c.startswith('90')]
    exc = [c.replace('.', '') for c in m['coverageExclude'] if c.startswith('90')]
    return [r['hts'] for r in LINES if any(r['htsCode10'].startswith(c) for c in inc) and not any(r['htsCode10'].startswith(c) for c in exc)]


N_LINES = len(LINES)
N_DUT = sum(1 for r in LINES if r['dutiable'])
N_L1 = len(covered('s301-china-list1'))
N_L2 = len(covered('s301-china-list2'))
N_L3 = len(covered('s301-china-list3'))
N_L4A = len(covered('s301-china-list4a'))
N_31 = len(covered('s301-china-2024-31d'))
N_CN_NONE = N_LINES - N_L1 - N_L2 - N_L3 - N_L4A - N_31
N_52B = len(covered('s301-2026-exempt-52b'))
N_GB = len(covered('s301-2026-except-gb'))
N_CA338 = len(covered('ca338-b3'))
N_RU = len(covered('ru-col2-35'))
N_RU_AL = len(covered('s232-aluminum-ru-derivatives'))
N_AIR = len(covered('s301-2026-exempt-52d-civil-aircraft'))
N_AUTO = len(covered('s232-auto-parts'))
N_MHDV = len(covered('s232-mhdv-parts-auto-part-overlap'))
assert (N_LINES, N_52B, N_GB, N_CA338, N_RU, N_31, N_AUTO, N_MHDV) == (421, 10, 63, 1, 8, 4, 5, 2), (
    N_LINES, N_52B, N_GB, N_CA338, N_RU, N_31, N_AUTO, N_MHDV)
assert (N_L1, N_L2, N_L3, N_L4A, N_CN_NONE) == (193, 25, 85, 61, 53), (N_L1, N_L2, N_L3, N_L4A, N_CN_NONE)

# ---------------------------------------------------------------------------------------------------
# Chapter + labels
# ---------------------------------------------------------------------------------------------------
SHORT = 'Optical, Medical & Precision Instruments'

GROUP_LABELS = {
    '9001': ('Optical fibers, contact lenses, spectacle lenses & unmounted optics', 'Fibers & lenses'),
    '9002': ('Mounted lenses, filters, prisms & mirrors for instruments', 'Mounted optics'),
    '9003': ('Eyeglass frames & parts', 'Eyeglass frames'),
    '9004': ('Sunglasses, safety glasses & goggles', 'Sunglasses & goggles'),
    '9005': ('Binoculars, telescopes & astronomical instruments', 'Binoculars & telescopes'),
    '9006': ('Still cameras, flash units & parts', 'Cameras'),
    '9007': ('Cinematographic cameras & projectors', 'Cine cameras'),
    '9008': ('Image projectors, enlargers & reducers', 'Projectors'),
    '9010': ('Photo lab equipment, negatoscopes & projection screens', 'Photo lab & screens'),
    '9011': ('Optical microscopes', 'Optical microscopes'),
    '9012': ('Electron microscopes & diffraction apparatus', 'Electron microscopes'),
    '9013': ('Lasers, rifle scopes, magnifiers & other optical devices', 'Lasers & optical devices'),
    '9014': ('Compasses, autopilots & navigational instruments', 'Navigation instruments'),
    '9015': ('Surveying, rangefinders, weather & geophysical instruments', 'Surveying & weather'),
    '9016': ('Precision balances (5 cg or better)', 'Precision balances'),
    '9017': ('Drafting instruments, calipers, micrometers & measuring tapes', 'Drafting & hand measuring'),
    '9018': ('Medical, surgical, dental & veterinary instruments (incl. syringes, catheters, ECG, ultrasound, MRI)', 'Medical instruments'),
    '9019': ('Massage & mechano-therapy apparatus, oxygen therapy, ventilators & CPAP', 'Therapy & respiratory'),
    '9020': ('Breathing appliances & gas masks', 'Breathing appliances'),
    '9021': ('Orthopedic devices, implants, artificial joints, hearing aids & pacemakers', 'Orthopedics & implants'),
    '9022': ('X-ray, CT & radiotherapy apparatus and X-ray tubes', 'X-ray & CT'),
    '9023': ('Demonstration instruments & models', 'Demonstration models'),
    '9024': ('Materials-testing machines (hardness, strength)', 'Materials testing'),
    '9025': ('Thermometers, pyrometers, barometers, hydrometers & hygrometers', 'Thermometers & gauges'),
    '9026': ('Flow meters, level gauges & pressure instruments', 'Flow & pressure'),
    '9027': ('Laboratory analysis instruments: spectrometers, chromatographs, analyzers', 'Lab analyzers'),
    '9028': ('Gas, liquid & electricity supply meters', 'Utility meters'),
    '9029': ('Counters, taximeters, speedometers & tachometers', 'Counters & speedometers'),
    '9030': ('Oscilloscopes, multimeters, electrical test & radiation-measuring instruments', 'Electrical test'),
    '9031': ('Measuring & inspection machines: CMMs, wafer and mask inspection, test benches', 'Measuring & inspection'),
    '9032': ('Thermostats, manostats & automatic regulating instruments', 'Thermostats & controls'),
    '9033': ('Parts & accessories not specified elsewhere in Chapter 90', 'Other parts'),
}

BLURBS = {
    '9001': (
        'Optical fibers, fiber bundles and fiber cables not of heading 8544 pay 6.7%; contact lenses and spectacle lenses 2%; polarizing sheets '
        'and unmounted lenses, prisms and mirrors enter Free.',
        ['optical fiber', 'contact lenses', 'eyeglass lenses', 'polarizing film', 'optical lens', 'prism', 'fiber optic cable'],
    ),
    '9002': (
        'Mounted lenses and other optical elements that are parts of instruments: projection lenses 2.45%, other camera objective lenses 2.3%; '
        'CCTV camera lenses, filters, mounted prisms and mirrors enter Free.',
        ['camera lens', 'objective lens', 'CCTV lens', 'optical filter', 'lens filter', 'mounted prism'],
    ),
    '9003': (
        'Plastic spectacle frames and frame parts pay 2.5%; frames of metal and other materials enter Free.',
        ['eyeglass frames', 'glasses frames', 'spectacle frames', 'optical frames', 'frame parts'],
    ),
    '9004': (
        'Sunglasses pay 2%; safety glasses, safety goggles, swimming goggles and other spectacles 2.5%. Finished corrective eyeglasses are '
        'classified here too.',
        ['sunglasses', 'safety glasses', 'goggles', 'reading glasses', 'ski goggles', 'blue light glasses'],
    ),
    '9005': (
        'Prism binoculars enter Free; optical telescopes and monoculars pay 8%, other astronomical instruments 6%. Parts and accessories pay '
        '"the rate applicable to the article of which they are a part" — the importer names that article (see below).',
        ['binoculars', 'telescope', 'monocular', 'spotting scope', 'astronomical telescope', 'telescope mount'],
    ),
    '9006': (
        'Most film cameras — SLR, 35 mm, instant-print and other cameras valued over $10 — and flash units enter Free; instant and other '
        'cameras valued $10 or less pay 6.8%, some fixed-focus and roll-film cameras 4%; camera parts 5.8%, other parts 3.9%. Digital cameras '
        'are not here (heading 8525).',
        ['instant camera', 'film camera', 'camera flash', 'underwater camera', 'disposable camera', 'camera parts'],
    ),
    '9007': (
        'Cinematographic cameras enter Free; cine projectors Free to 4.9%; parts and accessories Free to 3.9%.',
        ['movie camera', 'cinema projector', 'film projector', 'cine camera parts'],
    ),
    '9008': (
        'Slide projectors pay 7%, other image projectors 4.6%; microform readers 3.5%, or Free if they can make copies; enlargers and reducers '
        'Free; parts Free or 2.9%. Video and data projectors are not here (heading 8528).',
        ['slide projector', 'overhead projector', 'image projector', 'photo enlarger'],
    ),
    '9010': (
        'Automatic film processors pay 2.4%; most other darkroom apparatus, negatoscopes and projection screens enter Free; some parts 2.9%.',
        ['projection screen', 'darkroom equipment', 'film processor', 'negatoscope', 'X-ray film viewer'],
    ),
    '9011': (
        'Compound optical microscopes enter Free; stereoscopic microscopes with a camera pay 3.9% and other stereo microscopes 7.2%; parts '
        'Free.',
        ['microscope', 'stereo microscope', 'compound microscope', 'biological microscope', 'microscope parts'],
    ),
    '9012': (
        'Electron and other non-optical microscopes and diffraction apparatus, and their parts, enter Free.',
        ['electron microscope', 'SEM', 'TEM', 'diffraction apparatus'],
    ),
    '9013': (
        'Lasers (other than laser diodes) enter Free. Telescopic sights for rifles pay 14.9% (1.4% if designed for infrared light) and their '
        'parts 16%; periscopes and similar 5.3%; magnifiers and loupes 6.6%; door viewers 5.8%; other optical devices and other parts '
        '4.5%. 9013.90.80 parts are also a Section 232 derivative article (15% in total).',
        ['laser', 'rifle scope', 'magnifying glass', 'loupe', 'door viewer', 'laser module', 'optical device'],
    ),
    '9014': (
        'Compasses, gyrocompasses, autopilots, ship logs, depth sounders and other navigational instruments, and their parts, enter Free. '
        'Radar and GPS receivers are in heading 8526.',
        ['compass', 'autopilot', 'gyrocompass', 'depth sounder', 'fish finder', 'navigation instrument'],
    ),
    '9015': (
        'Rangefinders, theodolites, total stations, levels, photogrammetric, weather and geophysical instruments enter Free, except '
        'non-electrical levels (2.8%). Rangefinders of 9015.10 can carry the Section 232 auto-parts duty when they are car parts.',
        ['rangefinder', 'total station', 'theodolite', 'laser level', 'weather station', 'seismograph', 'surveying instrument'],
    ),
    '9016': (
        'Balances with a sensitivity of 5 cg or better: electrical 3.9%, jewelers\' 2.9%, other 3.3%, including parts.',
        ['precision balance', 'analytical balance', 'jewelry scale', 'lab scale'],
    ),
    '9017': (
        'Plotters enter Free; other drafting machines, slide rules and calculating instruments 3.9%; other drawing and marking-out '
        'instruments 4.6%; micrometers and calipers 5.8%, other gauges 3.9%; other hand measuring instruments such as rulers and tape measures '
        '5.3%. Parts take the rate of the article they belong to.',
        ['caliper', 'micrometer', 'tape measure', 'ruler', 'protractor', 'drafting tools', 'plotter'],
    ),
    '9018': (
        'All medical, surgical, dental and veterinary instruments enter Free: ECG, ultrasound, MRI and patient monitors, syringes and '
        'needles, catheters and cannulas, dental drills and burs, ophthalmic instruments, surgical instruments, defibrillators and dialysis '
        'apparatus. The extra duty depends on origin: Chinese syringes and needles pay 100% more under Section 301.',
        ['syringe', 'needle', 'catheter', 'ultrasound', 'MRI', 'ECG', 'surgical instruments', 'blood pressure monitor', 'dental instruments', 'stethoscope'],
    ),
    '9019': (
        'Massage apparatus, mechano-therapy appliances, oxygen and aerosol therapy apparatus, ventilators, CPAP machines and nebulizers enter '
        'Free.',
        ['massage gun', 'massager', 'CPAP', 'ventilator', 'nebulizer', 'oxygen concentrator', 'therapy device'],
    ),
    '9020': (
        'Gas masks and breathing appliances with mechanical parts or replaceable filters pay 2.5%; complete underwater breathing devices Free. '
        'Plain protective masks without filters are classified by material.',
        ['gas mask', 'respirator', 'breathing apparatus', 'SCBA', 'diving regulator'],
    ),
    '9021': (
        'All orthopedic and implant devices enter Free: bone plates and screws, braces and splints, artificial joints, dental implants and '
        'teeth, other prosthetics, hearing aids, pacemakers and other implanted devices.',
        ['orthopedic brace', 'knee implant', 'hip implant', 'dental implant', 'hearing aid', 'pacemaker', 'prosthesis', 'stent'],
    ),
    '9022': (
        'X-ray, CT, dental X-ray and radiotherapy apparatus, X-ray tubes and ionization smoke detectors enter Free; generators, beam-delivery '
        'units and parts pay 0.8%–1.4%.',
        ['X-ray machine', 'CT scanner', 'dental X-ray', 'radiotherapy', 'X-ray tube', 'baggage scanner'],
    ),
    '9023': (
        'Instruments, apparatus and models designed only for demonstration in education or exhibitions enter Free.',
        ['anatomical model', 'teaching model', 'demonstration model', 'educational model'],
    ),
    '9024': (
        'Machines and appliances for testing the hardness, strength, compressibility or elasticity of materials, and their parts, enter Free.',
        ['hardness tester', 'tensile tester', 'universal testing machine', 'materials testing'],
    ),
    '9025': (
        'Thermometers and pyrometers — liquid-filled, digital and infrared — enter Free, as do their parts; other electrical instruments such '
        'as electronic hygrometers 1.7%; barometers 1%, hydrometers 2.9%, hygrometers 1.4%, recording instruments 1%, others 1.6%.',
        ['thermometer', 'infrared thermometer', 'digital thermometer', 'hygrometer', 'barometer', 'hydrometer', 'pyrometer'],
    ),
    '9026': (
        'Flow meters, level gauges, pressure gauges and transmitters, heat meters and their parts enter Free.',
        ['flow meter', 'pressure gauge', 'pressure transmitter', 'level sensor', 'manometer', 'water meter parts'],
    ),
    '9027': (
        'Spectrometers, chromatographs, gas and smoke analyzers, mass spectrometers, NMR instruments, microtomes and their parts enter Free; '
        'exposure meters 1.2%.',
        ['spectrometer', 'gas analyzer', 'chromatograph', 'mass spectrometer', 'pH meter', 'lab analyzer', 'particle counter'],
    ),
    '9028': (
        'Gas meters and liquid (water) meters pay 16¢ each + 2.5%; electricity meters and parts enter Free.',
        ['gas meter', 'water meter', 'electricity meter', 'smart meter'],
    ),
    '9029': (
        'Speedometers, tachometers, odometers and production counters enter Free; taximeters 5.3%, bicycle speedometers 6%, stroboscopes 16¢ '
        'each + 2.5%. Revolution counters and speedometers can carry the Section 232 auto-parts or truck-parts duty when they are vehicle '
        'parts.',
        ['speedometer', 'tachometer', 'odometer', 'counter', 'pedometer', 'taximeter'],
    ),
    '9030': (
        'Oscilloscopes, spectrum analyzers, multimeters, network analyzers, semiconductor-wafer testers and radiation detectors enter Free; '
        'resistance-measuring instruments without a recorder 1.7%.',
        ['oscilloscope', 'multimeter', 'spectrum analyzer', 'Geiger counter', 'clamp meter', 'network analyzer'],
    ),
    '9031': (
        'Balancing machines, coordinate-measuring machines, optical inspection systems including wafer, photomask and reticle inspection, and '
        'other measuring instruments enter Free; test benches 1.7%. Ten semiconductor-related lines are exempt from the 2026 Section 301 duty.',
        ['coordinate measuring machine', 'CMM', 'wafer inspection', 'test bench', 'sensor', 'measuring instrument', 'profile projector'],
    ),
    '9032': (
        'Thermostats pay 1.7%; manostats and hydraulic or pneumatic regulators Free; voltage regulators for 6, 12 or 24 V systems 1.1%; other '
        'automatic regulating and control instruments and parts 1.7%.',
        ['thermostat', 'temperature controller', 'pressure regulator', 'PID controller', 'voltage regulator', 'process controller'],
    ),
    '9033': (
        'Parts and accessories not covered elsewhere in the chapter: LED backlight modules and touch screens without display enter Free, other '
        'parts 4.4%.',
        ['LED backlight', 'touch screen', 'instrument parts', 'spare parts'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 90: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'A+':
        e['name'] = 'GSP, least-developed beneficiary countries — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — in force to December 31, 2026'

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov['seo']['title'] = (
    'HTS Chapter 90 Tariffs 2026: Medical Device, Optical & Precision Instrument Import Duty Rates by Country | KoalaGains'
)
ov['seo']['shortDescription'] = (
    f'Searchable 2026 U.S. tariff table for all {N_LINES} HTS Chapter 90 lines — medical devices, syringes, implants, hearing aids, X-ray and '
    'lab instruments, lenses, eyeglasses, cameras and measuring equipment. Base rates Free to 16%, plus the extra duty by country: Section '
    '301, China lists, Section 232 and Canada Section 338.'
)
ov['seo']['keywords'] = [
    'hts chapter 90',
    'htsus chapter 90',
    'medical device tariffs',
    'medical equipment tariffs',
    'health care equipment tariffs',
    'tariffs on medical devices from china',
    'medical device tariff code',
    'hs code for medical devices',
    'hs code 9018',
    'hs code 9021',
    'optical instruments tariffs',
    'hs code 9031',
]

ov['notes']['chapterNotes'] = (
    '**Note 1.** This chapter does not cover: (a) articles of a kind used in machines, appliances or for other technical uses, of vulcanized '
    'rubber other than hard rubber (heading 4016), of leather or of composition leather (heading 4205) or of textile material (heading 5911); '
    '(b) supporting belts or other support articles of textile material, whose intended effect on the organ to be supported or held derives '
    'solely from their elasticity (for example, maternity belts, thoracic support bandages, abdominal support bandages, supports for joints or '
    'muscles) (section XI); (c) refractory goods of heading 6903; ceramic wares for laboratory, chemical or other technical uses, of heading '
    '6909; (d) glass mirrors, not optically worked, of heading 7009, or mirrors of base metal or of precious metal, not being optical elements '
    '(heading 8306 or chapter 71); (e) goods of heading 7007, 7008, 7011, 7014, 7015 or 7017; (f) parts of general use, as defined in note 2 '
    'to section XV, of base metal (section XV) or similar goods of plastics (chapter 39); however, articles specially designed for use '
    'exclusively in implants in medical, surgical, dental or veterinary sciences are to be classified in heading 9021; (g) pumps '
    'incorporating measuring devices, of heading 8413; weight-operated counting or checking machinery, or separately entered weights for '
    'balances (heading 8423); lifting or handling machinery (headings 8425 to 8428); paper or paperboard cutting machines of all kinds '
    '(heading 8441); fittings for adjusting work or tools on machine tools or water-jet cutting machines, of heading 8466, including fittings '
    'with optical devices for reading the scale (for example, "optical" dividing heads) but not those which are in themselves essentially '
    'optical instruments (for example, alignment telescopes); calculating machines (heading 8470); valves or other appliances of heading 8481, '
    'machines and apparatus (including apparatus for the projection or drawing of circuit patterns on sensitized semiconductor materials) of '
    'heading 8486; (h) searchlights or spotlights of a kind used for cycles or motor vehicles (heading 8512); portable electric lamps of '
    'heading 8513; cinematographic sound recording, reproducing or re-recording apparatus (heading 8519); sound-heads (heading 8522); '
    'television cameras, digital cameras and video camera recorders (heading 8525); radar apparatus, radio navigational aid apparatus and '
    'radio remote control apparatus (heading 8526); connectors for optical fibers, optical fiber bundles and cables (heading 8536); numerical '
    'control apparatus (heading 8537); sealed beam lamp units of heading 8539; optical fiber cables of heading 8544; (ij) searchlights or '
    'spotlights of heading 9405; (k) articles of chapter 95; (l) monopods, bipods, tripods and similar articles, of heading 9620; (m) capacity '
    'measures, which are to be classified according to their constituent material; or (n) spools, reels or similar supports (which are to be '
    'classified according to their constituent material, for example, in heading 3923 or section XV).\n\n'
    '**Note 2.** Subject to note 1 above, parts and accessories for machines, apparatus, instruments or articles of this chapter are to be '
    'classified according to the following rules: (a) parts and accessories which are goods included in any of the headings of this chapter '
    'or of chapter 84, 85 or 91 (other than heading 8487, 8548 or 9033) are in all cases to be classified in their respective headings; (b) '
    'other parts and accessories, if suitable for use solely or principally with a particular kind of machine, instrument or apparatus, or '
    'with a number of machines, instruments or apparatus of the same heading (including a machine, instrument or apparatus of heading 9010, '
    '9013 or 9031) are to be classified with the machines, instruments or apparatus of that kind; (c) all other parts and accessories are to '
    'be classified in heading 9033.\n\n'
    '**Note 3.** The provisions of notes 3 and 4 to section XVI apply also to this chapter.\n\n'
    '**Note 4.** Heading 9005 does not apply to telescopic sights for fitting to arms, periscopic telescopes for fitting to submarines or '
    'tanks, or to telescopes for machines, appliances, instruments or apparatus of this chapter or section XVI; such telescopic sights and '
    'telescopes are to be classified in heading 9013.\n\n'
    '**Note 5.** Measuring or checking optical instruments, appliances or machines which, but for this note, could be classified both in '
    'heading 9013 and in heading 9031 are to be classified in heading 9031.\n\n'
    '**Note 6.** For the purposes of heading 9021, the expression "orthopedic appliances" means appliances for: (a) preventing or correcting '
    'bodily deformities; or (b) supporting or holding parts of the body following an illness, operation or injury. Orthopedic appliances '
    'include footwear and special insoles designed to correct orthopedic conditions, provided that they are either (1) made to measure or (2) '
    'mass-produced, entered singly and not in pairs and designed to fit either foot equally.\n\n'
    '**Note 7.** Heading 9032 applies only to: (a) instruments and apparatus for automatically controlling the flow, level, pressure or other '
    'variables of liquids or gases, or for automatically controlling temperature, whether or not their operation depends on an electrical '
    'phenomenon which varies according to the factor to be automatically controlled, which are designed to bring this factor to, and '
    'maintain it at, a desired value, stabilized against disturbances, by constantly or periodically measuring its actual value; and (b) '
    'automatic regulators of electrical quantities, and instruments or apparatus for automatically controlling non-electrical quantities the '
    'operation of which depends on an electrical phenomenon varying according to the factor to be controlled, which are designed to bring '
    'this factor to, and maintain it at, a desired value, stabilized against disturbances, by constantly or periodically measuring its actual '
    'value.'
)
ov['notes']['additionalUsNotes'] = (
    '**1.** For the purposes of headings 9001 and 9002, the term "optically worked" refers to glass the surface of which has been ground or '
    'polished in order to produce the required optical properties.\n\n'
    '**2.** For the purposes of this chapter, the term "electrical" when used in reference to instruments, appliances, apparatus and '
    'machines, refers to those articles the operation of which depends on an electrical phenomenon which varies according to the factor to '
    'be ascertained.\n\n'
    '**3.** For the purposes of this chapter, the terms "optical appliances" and "optical instruments" refer only to those appliances and '
    'instruments which incorporate one or more optical elements, but do not include any appliances or instruments in which the incorporated '
    'optical element or elements are solely for viewing a scale or for some other subsidiary purpose.\n\n'
    '**4.** For the purposes of this chapter, the term "printed circuit assembly" means goods consisting of one or more printed circuits of '
    'heading 8534 with one or more active elements assembled thereon, with or without passive elements. For the purposes of this note, '
    '"active elements" means diodes, transistors and similar semiconductor devices, whether or not photosensitive, of heading 8541, and '
    'integrated circuits of heading 8542.'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            f'Section 301 (2026, 60 economies): {N_LINES - N_52B} (not the {N_52B} semiconductor-equipment lines on the note 52(b) list); '
            f'Brazil: {N_LINES}; China Lists 1–4A: {N_L1 + N_L2 + N_L3 + N_L4A}; China 2024 increase (100%, syringes and needles): {N_31}; '
            f'Canada Section 338: {N_CA338} (also on USMCA goods); Section 232 vehicle parts: {N_AUTO} (only when they are car, truck or bus '
            f'parts); Section 232 metals: 1; Russia: {N_RU} lines at 35% in lieu of column 2 and {N_RU_AL} at 200% on aluminum'
        )

snap = ov['tradeSnapshot']
snap['effectiveDutyRateNote'] = 'Duty-collected figures aren’t available from an official source yet.'
snap['totalDutyCollectedUsd'] = None
snap['source'] = f'UN Comtrade, United States imports, HS chapter 90 ({Y})'
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes.'
)

exec(open(__file__.replace('fill90.py', 'fill90_text.py')).read())

json.dump(d, open(OUT, 'w'), ensure_ascii=False, indent=2)
print('wrote', OUT)
