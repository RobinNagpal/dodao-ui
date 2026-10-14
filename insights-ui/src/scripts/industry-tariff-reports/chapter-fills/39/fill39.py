#!/usr/bin/env python3
"""Fill the writer parts of the generated Chapter 39 content file (re-runnable; see run.sh).

run.sh: generate -> python3 fill39.py -> pnpm tariff:compact-chapters -> prettier.
Facts come from the HTSUS 2026 Revision 21 (Chapters 39 and 99), measures.json, the Federal Register
(fr/ texts and frmeta.json in this folder), eCFR (ecfr/ in this folder) and UN Comtrade (trade/chapter-39.json).
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import FORBIDDEN_SOURCE, IU, OUT  # noqa: E402,F401

import collections
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
WT = IU
PATH = OUT  # run.sh copies the generated file here; filled in place
TODAY = '2026-10-13'
ECFR_DATE = '2026-10-08'
CH39 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2039'
CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'

d = json.load(open(PATH))
pool = json.load(open(os.path.join(HERE, 'pool.json')))
frmeta = {r['document_number']: r for r in json.load(open(os.path.join(HERE, 'frmeta.json')))['results']}


def ecfr(title, section):
    return f'https://www.ecfr.gov/current/title-{title}/section-{section}'


def ecfr_part(title, part):
    return f'https://www.ecfr.gov/current/title-{title}/part-{part}'


def fmt_usd(n):
    if n >= 1e9:
        return f'${n / 1e9:.2f}B'
    if n >= 1e6:
        return f'${n / 1e6:.0f}M'
    return f'${n / 1e3:.0f}K'


def frsrc(sid, docnum, document, publisher='Federal Register', signed=None):
    m = frmeta[docnum]
    return {
        'id': sid,
        'publisher': publisher,
        'citation': m['citation'],
        'document': document,
        'title': m['title'],
        'signed': signed,
        'published': m['publication_date'],
        'url': m['html_url'],
    }


ITA = 'Notice (Commerce, ITA)'
ITC = 'Notice (USITC)'
NEW_SOURCES = {
    s['id']: s
    for s in [
        frsrc('ad-pet-resin', '2022-07863', ITA),
        frsrc('cvd-pet-resin', '2022-07721', ITA),
        frsrc('ad-pet-film', '2026-06007', ITA),
        frsrc('ad-prcb', '2021-23375', ITA),
        frsrc('ad-prcb-sunset', '2026-15662', ITA),
        frsrc('ad-pva', '2026-19110', ITA),
        frsrc('ad-ptfe', '2022-05420', ITA),
        frsrc('cvd-ptfe', '2022-05419', ITA),
        frsrc('ad-epoxy', '2025-09454', ITA),
        frsrc('cvd-epoxy', '2025-09455', ITA),
        frsrc('itc-epoxy', '2025-09232', ITC, publisher='Federal Register'),
        frsrc('ad-mammo-tw', '2026-04766', ITA),
        frsrc('ad-mammo-kr', '2026-15220', ITA),
        frsrc('ad-lws-cn', '2025-03183', ITA),
        frsrc('ad-lws-vn', '2024-28022', ITA),
        frsrc('ad-ribbon', '2024-24749', ITA),
        frsrc('ad-geogrid', '2022-22153', ITA),
        frsrc('ad-ppbox-cn', '2026-05003', ITA),
        frsrc('ad-ppbox-vn', '2026-14421', ITA),
        frsrc('ad-door', '2026-16033', ITA),
        frsrc('ad-pet-sheet-rev', '2026-00384', ITA),
        frsrc('ad-ptmeg-init', '2026-08727', ITA),
        frsrc('itc-ptmeg', '2026-14351', ITC),
        frsrc('ad-ptmeg-postpone', '2026-17638', ITA),
        frsrc('ad-pfa-init', '2026-17819', ITA),
        frsrc('cvd-pfa-init', '2026-17817', ITA),
        frsrc('itc-pfa', '2026-19492', ITC),
        {
            'id': 'hts-ch39',
            'publisher': 'USITC',
            'citation': 'HTSUS 2026 Revision 21, Chapter 39',
            'document': 'Harmonized Tariff Schedule',
            'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 39: Plastics and Articles Thereof',
            'signed': None,
            'published': '2026-10-07',
            'url': CH39,
        },
        {
            'id': 'pl-117-78',
            'publisher': 'Congress.gov',
            'citation': 'P.L. 117-78 (135 Stat. 1525)',
            'document': 'Public Law 117-78',
            'title': 'Uyghur Forced Labor Prevention Act',
            'signed': '2021-12-23',
            'published': '2021-12-23',
            'url': 'https://www.congress.gov/117/plaws/publ78/PLAW-117publ78.pdf',
        },
    ]
}


def src(sid):
    s = NEW_SOURCES.get(sid) or pool.get(sid)
    if not s:
        raise SystemExit(f'unknown source {sid}')
    return json.loads(json.dumps(s))


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(src(sid))
            have.add(sid)


# ---------------------------------------------------------------------------------------------------
# Trade figures (UN Comtrade file the generator read)
# ---------------------------------------------------------------------------------------------------
trade = json.load(open(f'{WT}/src/tariff-data/trade/chapter-39.json'))
Y, PY = trade['latestYear'], trade['priorYear']
year_tot = {t['year']: t['totalUsd'] for t in trade['totalsByYear']}
TOTAL, PRIOR = year_tot[Y], year_tot[PY]
by_c = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
hc = collections.defaultdict(dict)
for r in trade['byHeadingCountry']:
    hc[r['heading']][r['country']] = r['importsUsd']


def imp(country):
    return by_c[country]['importsUsd']


def chg(country):
    c = by_c[country]
    return round((c['importsUsd'] / c['priorImportsUsd'] - 1) * 100, 1)


def himp(h, y=Y):
    return by_h[h].get(str(y), 0)


PRIMARY = sum(himp(f'39{i:02d}') for i in range(1, 15))
F = fmt_usd
CN, CA, MX, VN, KR, DE, JP, TW, TH, IN, GB, BR = (
    'China', 'Canada', 'Mexico', 'Viet Nam', 'Rep. of Korea', 'Germany', 'Japan', 'Other Asia, nes', 'Thailand', 'India', 'United Kingdom', 'Brazil',
)
assert abs(TOTAL - 74016591338) < 1, TOTAL  # the text below quotes 2025 figures

# ---------------------------------------------------------------------------------------------------
# Labels (the generator cuts long heading names with "…")
# ---------------------------------------------------------------------------------------------------
LABELS = {
    '3901': ('Polyethylene & other ethylene polymers, in primary forms', 'Polyethylene (PE)'),
    '3902': ('Polypropylene & other olefin polymers, in primary forms', 'Polypropylene (PP)'),
    '3903': ('Polystyrene, SAN & ABS, in primary forms', 'Polystyrene & ABS'),
    '3904': ('PVC, PTFE & other halogenated polymers, in primary forms', 'PVC & fluoropolymers'),
    '3905': ('Polyvinyl acetate, polyvinyl alcohol & other vinyl polymers', 'PVAc & PVA'),
    '3906': ('Acrylic polymers, in primary forms', 'Acrylics'),
    '3907': ('PET, polycarbonates, epoxy resins, polyethers & other polyesters', 'PET, PC & epoxy'),
    '3908': ('Polyamides (nylon), in primary forms', 'Nylon'),
    '3909': ('Amino resins, phenolic resins & polyurethanes', 'Amino, phenolic & PU'),
    '3910': ('Silicones, in primary forms', 'Silicones'),
    '3911': ('Petroleum resins, polyterpenes & other resins', 'Petroleum resins'),
    '3912': ('Cellulose & its chemical derivatives', 'Cellulose'),
    '3913': ('Natural polymers (alginates) & modified natural polymers', 'Natural polymers'),
    '3914': ('Ion-exchange resins', 'Ion exchangers'),
    '3915': ('Plastic waste, parings & scrap', 'Scrap'),
    '3916': ('Monofilament, rods, sticks & profile shapes', 'Rods & profiles'),
    '3917': ('Tubes, pipes, hoses & their fittings', 'Pipes & hoses'),
    '3918': ('Floor, wall & ceiling coverings, incl. vinyl flooring', 'Flooring'),
    '3919': ('Self-adhesive tape, film, labels & other flat shapes', 'Adhesive tape'),
    '3920': ('Film, sheet & strip, non-cellular and not reinforced', 'Film & sheet'),
    '3921': ('Foam & other plastic sheet, film & strip', 'Foam & other sheet'),
    '3922': ('Baths, sinks, toilet seats & other sanitary ware', 'Sanitary ware'),
    '3923': ('Packaging: boxes, bags, bottles, caps & closures', 'Packaging & bags'),
    '3924': ('Tableware, kitchenware & household articles', 'Household goods'),
    '3925': ("Builders' ware: tanks, doors, windows, shutters", "Builders' ware"),
    '3926': ('Other articles: office supplies, gloves, fittings, gaskets', 'Other articles'),
}

# ---------------------------------------------------------------------------------------------------
# Chapter, top-level sources
# ---------------------------------------------------------------------------------------------------
d['asOf'] = TODAY
d['chapter']['title'] = 'Plastics and Articles Thereof'
if not any('comtrade' in (s.get('url') or '') for s in d['sources']):
    d['sources'].append({'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': f'{Y} import figures'})
d['sources'].append({'label': 'Federal Register (Commerce/ITA antidumping and countervailing duty notices)', 'url': 'https://www.federalregister.gov/', 'note': 'AD/CVD orders on Chapter 39 goods'})

# ---------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------
ov = d['overview']
ov['h1'] = 'HTS Chapter 39: Plastics & Articles of Plastics — 2026 U.S. Tariff Rates'
ov['seo'] = {
    'title': 'HTS Chapter 39 Tariffs 2026: Plastic Resin, Film, Bags & Plastic Products Import Duty Rates | KoalaGains',
    'shortDescription': 'Searchable 2026 U.S. tariff table for all 319 HTS Chapter 39 lines — polyethylene, polypropylene, PVC and PET resin, '
    'plastic film, vinyl flooring, plastic bags and packaging, tableware and other plastic articles. Base rates Free to 6.5% plus the extra duty by '
    'country: 10%–12.5% under Section 301, up to 44% from China, 50% Section 338 on some Canadian goods.',
    'keywords': [
        'hts chapter 39',
        'htsus chapter 39',
        'chapter 39 hts 2026',
        'plastics and articles thereof',
        'plastic tariff code',
        'us tariffs on plastic products',
        'tariffs on plastic resin',
        'hts code for plastic parts',
        'hs code 3926.90',
        'hs code for plastic bags',
        'polyethylene tariff code',
        'u.s. plastic industry tariffs',
    ],
}
ov['intro'] = (
    'Chapter 39 covers plastics in two forms. **Primary forms** (headings 3901–3914) are the resins themselves — polyethylene, polypropylene, '
    'PVC, polystyrene, PET, epoxy and other polymers in pellets, powders and liquids. **Articles** (3915–3926) are what is made from them: scrap, '
    'pipes and hoses, vinyl flooring, tape, film and sheet, foam, packaging, bags and bottles, tableware, builders\' ware and every other '
    'article of plastics. Base rates are low: **33 of the 319 lines are Free and none is above 6.5%**.\n\n'
    f'The U.S. imported **{F(TOTAL)}** of these goods in {Y}: {F(PRIMARY)} of resins and the rest articles. **China** ({F(imp(CN))}) and '
    f'**Canada** ({F(imp(CA))}) supplied 40%, ahead of Mexico, Vietnam and South Korea. On top of the base rate comes the **extra duty by '
    'country**: since July 24, 2026 a Section 301 tariff on 60 economies — +10% for Canada, Mexico, India and the UK (USMCA-qualifying goods '
    'from Canada and Mexico are exempt), +12.5% for Vietnam and Thailand, **12.5% in total** for Korea and Japan and **10% in total** for the '
    'EU and Taiwan. **China pays +12.5% plus its 2018–2019 Section 301 lists** — +25% on most resins, film and packaging, +7.5% on some '
    'household goods — so most Chinese plastics pay 37.5% to 44%. Twenty Canadian subheadings, among them plastic bags, bottles, closures, '
    'tableware and vinyl tile, owe a **50% Section 338 duty even under USMCA**. On top of all this, **antidumping and countervailing duty '
    'orders** cover PET resin, PET film, polyethylene carrier bags, epoxy resins, PVA, PTFE, polypropylene corrugated boxes, fiberglass door '
    'panels and other goods from named countries.'
)

for s in ov['stats']:
    if s['label'] == 'Lines with an extra duty for some origins':
        s['note'] = (
            'Section 301 (2026, 60 economies): 319; Brazil: 319; China List 2: 189, List 3: 75, List 4A: 30; Canada Section 338: 51 (also on USMCA '
            'goods); Russia 35% in lieu of column 2: 40'
        )
ov['stats'].append({'label': 'AD/CVD orders', 'value': '12 products', 'note': 'PET resin, PET film, carrier bags, epoxy, PVA, PTFE and more — see Tariff updates'})

BLURBS = {
    '3901': (
        'Low-density, linear low-density and high-density polyethylene (LDPE, LLDPE, HDPE), EVA and other ethylene copolymers in pellets or '
        'powder. Mostly 6.5%. Canada supplied {ca3901} of the {t3901} imported in {y} — Free under USMCA and not on the Section 338 list. '
        'China List 2 (+25%) except 3901.40 (List 3).',
        ['polyethylene resin', 'HDPE pellets', 'LDPE', 'LLDPE', 'EVA resin', 'metallocene polyethylene', 'ethylene copolymer'],
    ),
    '3902': (
        'Polypropylene, polyisobutylene and propylene copolymers. 6.5%; elastomeric polyisobutylene (3902.20.10) Free. China List 2.',
        ['polypropylene resin', 'PP pellets', 'polyisobutylene', 'propylene copolymer', 'PP homopolymer'],
    ),
    '3903': (
        'Polystyrene (expandable or not), styrene-acrylonitrile (SAN) and acrylonitrile-butadiene-styrene (ABS). All 6.5%. China List 2.',
        ['polystyrene', 'EPS beads', 'ABS resin', 'SAN copolymer', 'high-impact polystyrene'],
    ),
    '3904': (
        'PVC resin (6.5%), mixed and plasticized PVC compounds, vinylidene chloride polymers and fluoropolymers such as PTFE (5.8%) and PFA. '
        'Granular PTFE from India and Russia carries antidumping and countervailing duties; PFA from India is under investigation. PVC is a CBP '
        'forced-labor high-priority sector.',
        ['PVC resin', 'polyvinyl chloride', 'PVC compound', 'PTFE', 'PVDF', 'fluoropolymer', 'PFA resin'],
    ),
    '3905': (
        'Polyvinyl acetate dispersions, vinyl acetate copolymers and polyvinyl alcohol (PVA, 3.2%). Free to 5.3%. PVA from China and Japan '
        'carries antidumping duties (orders continued September 18, 2026).',
        ['polyvinyl alcohol', 'PVA', 'PVOH', 'polyvinyl acetate', 'vinyl acetate copolymer', 'PVB'],
    ),
    '3906': (
        'Acrylic polymers: poly(methyl methacrylate) (PMMA) pellets, acrylic dispersions and superabsorbent polymers. Free to 6.3%. '
        'China List 2.',
        ['PMMA resin', 'acrylic resin', 'acrylic emulsion', 'superabsorbent polymer', 'acrylic copolymer'],
    ),
    '3907': (
        'PET bottle resin (3907.61, 6.5%), polycarbonates, epoxy resins (6.1%), polyacetals, polyethers, PLA, alkyds and other polyesters. '
        'Korea is the top supplier ({kr3907} in {y}). Antidumping duties apply to PET resin from Canada, China, India and Oman and to epoxy resins '
        'from Korea, Taiwan and Thailand; acrylate oligomers and PTMEG are covered or under investigation too.',
        ['PET resin', 'polycarbonate', 'epoxy resin', 'polyacetal POM', 'PLA', 'polyether polyol', 'polyester resin', 'PBT'],
    ),
    '3908': (
        'Polyamides in primary forms: nylon 6, 6/6, 11 and 12 pellets (3908.10, 6.3%); other polyamides Free or 6.5%. China List 2.',
        ['nylon 6', 'nylon 66', 'polyamide resin', 'nylon pellets', 'PA12'],
    ),
    '3909': (
        'Urea, melamine and phenolic resins and polyurethanes, including MDI-based polymers. Mostly 6.5%. China List 2, List 3 for 3909.31 and '
        '3909.39.',
        ['urea formaldehyde resin', 'melamine resin', 'phenolic resin', 'polyurethane', 'polymeric MDI'],
    ),
    '3910': ('Silicones in primary forms — silicone oils, rubbers and resins. 3%. China List 2.', ['silicone resin', 'silicone oil', 'silicone fluid', 'silicone rubber base']),
    '3911': (
        'Petroleum hydrocarbon resins, coumarone-indene, polyterpenes, polysulfides, polysulfones and other resins. Free to 6.5%. China List 2.',
        ['hydrocarbon resin', 'petroleum resin', 'polyterpene', 'polysulfone', 'tackifier resin'],
    ),
    '3912': (
        'Cellulose acetates, cellulose nitrate, carboxymethylcellulose (CMC) and other cellulose ethers. 4.2%–6.4%. China List 2 or List 3.',
        ['cellulose acetate', 'CMC', 'carboxymethyl cellulose', 'HPMC', 'cellulose ether', 'nitrocellulose'],
    ),
    '3913': (
        'Alginic acid and sodium alginate (4.2%), and modified natural polymers such as hardened proteins. China List 4A for alginates (an '
        'exclusion covers sodium alginate resins through November 9, 2026), List 2 or 3 for the rest.',
        ['sodium alginate', 'alginic acid', 'chitosan', 'hyaluronic acid', 'modified starch polymer'],
    ),
    '3914': ('Ion-exchange resins based on polymers of 3901–3913. Free or 3.9%. China List 2.', ['ion exchange resin', 'cation exchange resin', 'water softener resin']),
    '3915': (
        'Waste, parings and scrap of polyethylene, polystyrene, PVC and other plastics. All Free; China List 3 adds 25%.',
        ['plastic scrap', 'PET flakes', 'regrind', 'post-industrial plastic', 'plastic waste'],
    ),
    '3916': (
        'Monofilament over 1 mm, rods, sticks and profile shapes, such as PVC profiles and plastic edge banding. 3.1%–6.5%. Canada supplied '
        '{ca3916} in {y}.',
        ['PVC profile', 'plastic rod', 'monofilament', 'edge banding', 'plastic trim profile'],
    ),
    '3917': (
        'Rigid and flexible tubes, pipes and hoses — PVC, polyethylene and polypropylene pipe, garden hose, sausage casings — and their fittings. '
        '3.1% for most pipe and hose, 5.3% for fittings. Civil-aircraft hoses and tubes qualify for the aircraft exemptions.',
        ['PVC pipe', 'HDPE pipe', 'PEX tubing', 'garden hose', 'plastic pipe fittings', 'sausage casing', 'vinyl tubing'],
    ),
    '3918': (
        'Floor, wall and ceiling coverings in rolls or tiles: luxury vinyl tile and plank (LVT/SPC, 3918.10.10, 5.3%), vinyl sheet flooring and '
        'vinyl wall coverings. Vietnam supplied {vn3918} of the {t3918} imported in {y}. China List 3; 3918.10.10 from Canada is on the Section 338 '
        'list.',
        ['vinyl plank flooring', 'LVT', 'SPC flooring', 'vinyl tile', 'vinyl sheet flooring', 'vinyl wallcovering'],
    ),
    '3919': (
        'Self-adhesive plates, sheets, film, tape and strip: packing tape, electrical tape, labels and protective film. 5.8%, 6.5% for '
        'reflective tape. China List 2 (some polyethylene adhesive films are excluded through November 9, 2026).',
        ['packing tape', 'adhesive tape', 'electrical tape', 'self-adhesive labels', 'protective film', 'masking film'],
    ),
    '3920': (
        'Non-cellular film, sheet and strip: polyethylene film (4.2%), polypropylene film (4.2%), PVC film, acrylic sheet, polycarbonate sheet '
        'and PET film (4.2%). PET film from China, India, Taiwan and the UAE carries antidumping duties. China List 2.',
        ['polyethylene film', 'stretch film', 'BOPP film', 'PET film', 'PVC sheet', 'acrylic sheet', 'polycarbonate sheet'],
    ),
    '3921': (
        'Cellular (foam) sheet of polystyrene, PVC and polyurethane, and other film or sheet combined with other materials. 4.2%–6.5%. '
        'China List 2.',
        ['foam sheet', 'EVA foam', 'XPS board', 'polyurethane foam', 'PVC foam board', 'coated fabric film'],
    ),
    '3922': (
        'Baths, shower bases, sinks, washbasins, toilet seats and covers and other sanitary ware of plastics. All 6.3%. China List 4A '
        '(+7.5%) on baths, sinks and toilet seats, List 3 on the rest.',
        ['acrylic bathtub', 'shower base', 'toilet seat', 'plastic sink', 'shower tray'],
    ),
    '3923': (
        'Plastic packaging: boxes and crates, polyethylene bags and sacks (3923.21), bottles (3923.30), caps and closures (3923.50) and other '
        'containers. 3% for most, 5.3% for closures and spools. Polyethylene retail carrier bags (3923.21.00.85) carry antidumping duties from '
        'six countries. Canada, China and Mexico each supplied over $1.7B in {y}.',
        ['plastic bags', 'poly mailers', 'shopping bags', 'plastic bottles', 'bottle caps', 'plastic crates', 'corrugated plastic boxes', 'jerry cans'],
    ),
    '3924': (
        'Tableware and kitchenware (plates and cups 6.5%, trays 5.3%, other 3.4%) and other household and toilet articles such as storage '
        'containers, hangers and shower curtains. China supplied {cn3924} of the {t3924} imported in {y}; most lines pay +7.5% (List 4A) or '
        'nothing under the old China lists.',
        ['plastic tableware', 'food storage containers', 'plastic cups', 'plastic plates', 'shower curtain', 'plastic hangers', 'kitchen utensils'],
    ),
    '3925': (
        'Builders\' ware: tanks over 300 liters (6.3%), doors, windows and frames (5.3%), shutters and blinds, and other building fittings. '
        'Fiberglass door panels from China carry antidumping and countervailing duties since August 6, 2026.',
        ['vinyl windows', 'plastic doors', 'fiberglass door panels', 'septic tank', 'window blinds', 'plastic shutters'],
    ),
    '3926': (
        'Every other article of plastics: office and school supplies, apparel and gloves (seamless gloves Free), furniture fittings, statuettes, '
        'gaskets and seals, laboratory ware, face shields and the catch-all 3926.90.99 (5.3%). The largest heading — {t3926} in {y}, '
        '{cn3926} of it from China.',
        ['plastic parts', 'injection molded parts', 'disposable gloves', 'plastic gaskets', 'face shields', 'cable ties', 'plastic clips', 'phone case'],
    ),
}
FMT = {
    'y': Y,
    'ca3901': F(hc['3901'].get(CA, 0)),
    't3901': F(himp('3901')),
    'kr3907': F(hc['3907'].get(KR, 0)),
    'ca3916': F(hc['3916'].get(CA, 0)),
    'vn3918': F(hc['3918'].get(VN, 0)),
    't3918': F(himp('3918')),
    'cn3924': F(hc['3924'].get(CN, 0)),
    't3924': F(himp('3924')),
    't3926': F(himp('3926')),
    'cn3926': F(hc['3926'].get(CN, 0)),
}
for g in ov['productGroups']:
    h = g['heading']
    g['label'] = LABELS[h][0]
    blurb, ex = BLURBS[h]
    g['blurb'] = blurb.format(**FMT)
    g['searchExamples'] = ex

ov['workedExamples'] = [
    {
        'title': 'Polyethylene film from China',
        'line': '3920.10.00.00',
        'body': 'Film and sheet of polymers of ethylene pay 4.2%. China adds +12.5% under the 2026 Section 301 action (9903.05.31) and +25% because '
        '3920.10 is on List 2 (9903.88.02): **41.7%**, $4,170 on a $10,000 shipment. The same film pays 14.2% from India or the UK, 16.7% from '
        'Vietnam or Thailand, 10% in total from Germany or Taiwan, 12.5% from Korea or Japan, and nothing from Canada or Mexico under USMCA.',
    },
    {
        'title': 'Polyethylene retail carrier bags from Vietnam',
        'line': '3923.21.00.85',
        'body': 'Sacks and bags of polymers of ethylene pay 3%; Vietnam adds +12.5% (9903.05.84): **15.5%**, $1,550 on $10,000. Retail carrier bags '
        'with handles from Vietnam are also covered by an antidumping order and a countervailing duty order (continued October 27, 2021, 86 FR '
        '59366), so CBP collects a cash deposit at the rate Commerce set for the exporter on top. From China the bag pays 40.5% (3% + 12.5% + 25% '
        'List 3) plus the China antidumping duty.',
    },
    {
        'title': 'Vinyl plank flooring (rigid core) from Vietnam',
        'line': '3918.10.10.20',
        'body': 'Vinyl tile pays 5.3%. Vietnam adds +12.5%: **17.8%**, $1,780 on $10,000. From China it pays 42.8% (List 3 +25%), from Korea 12.5% in '
        'total, from Thailand 17.8%. From Canada vinyl tile is on the Section 338 list: 50% even with a USMCA claim. PVC is a forced-labor '
        'high-priority sector, so CBP can ask for supply-chain records back to the PVC resin.',
    },
    {
        'title': 'Plastic food storage containers from China',
        'line': '3924.10.40.00',
        'body': 'Other plastic tableware and kitchenware pays 3.4%. This line is on none of the 2018–2019 China lists, so China pays only the 2026 '
        'Section 301 duty: 3.4% + 12.5% = **15.9%**. Plastic plates and cups (3924.10.20, 6.5%) are on List 4A: 6.5% + 12.5% + 7.5% = 26.5%. Food-'
        'contact plastics must be made of substances FDA permits (21 CFR parts 174–178).',
    },
    {
        'title': 'HDPE resin and plastic bags from Canada',
        'line': '3901.20.50.00',
        'body': 'HDPE pays 6.5%. A USMCA-qualifying shipment from Canada pays **nothing** — 3901.20 is not on the Section 338 list — while a '
        'non-qualifying one pays 6.5% + 10% = 16.5%. Polyethylene bags (3923.21) from Canada are on the Section 338 list: 50% even under USMCA '
        '(U.S. note 51(a)), 63% without it.',
    },
]
snap = ov['tradeSnapshot']
snap['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar {Y} — before the '
    '2026 tariff changes. Taiwan appears in UN Comtrade as "Other Asia, nes".'
)


def read_notes():
    t = open(os.path.join(HERE, 'ch39.txt')).read()
    t = re.sub(r'Harmonized Tariff Schedule of the United States Revision 21 \(2026\)\nAnnotated for Statistical Reporting Purposes\n', '', t)
    t = re.sub(r'\nVII\n39-\d+\n', '\n', t)
    t = t.replace('Subheading Notes (con.)\n', '').replace('Notes (con.)\n', '')
    a = t.index('CHAPTER 39\nPLASTICS AND ARTICLES THEREOF')
    t = t[a:]
    n0 = t.index('Notes\n1. Throughout')
    s0 = t.index('Subheading Notes\n1.')
    u0 = t.index('Additional U.S. Notes\n1.')
    st0 = t.index('Statistical Note\n1.')
    end = t.index('Rates of Duty')
    chap = t[n0 + len('Notes\n'): s0]
    sub = t[s0 + len('Subheading Notes\n'): u0]
    add = t[u0 + len('Additional U.S. Notes\n'): st0]
    stat = t[st0 + len('Statistical Note\n'): end]
    return chap, sub, add, stat


def join_lines(block):
    out, cur = [], ''
    for line in block.strip().split('\n'):
        line = line.strip()
        if not line:
            continue
        m = re.match(r'^(\d+)\.\s', line)
        if m:
            if cur:
                out.append(cur)
            cur = line
        else:
            cur += (' ' if not cur.endswith('-') else '') + line
    if cur:
        out.append(cur)
    return [re.sub(r'\s+', ' ', x) for x in out]


chap, sub, add, stat = read_notes()


def md(paras, prefix='Note'):
    res = []
    for p in paras:
        m = re.match(r'^(\d+)\.\s(.*)$', p)
        res.append(f'**{prefix} {m.group(1)}.** {m.group(2)}')
    return '\n\n'.join(res)


chapter_notes = md(join_lines(chap)) + '\n\n' + md(join_lines(sub), 'Subheading note')
for bad in ('Harmonized Tariff', 'Annotated for'):
    assert bad not in chapter_notes, bad
ov['notes'] = {
    'chapterNotes': chapter_notes,
    'additionalUsNotes': md(join_lines(add), 'Additional U.S. note') + '\n\n' + md(join_lines(stat), 'Statistical note'),
}

# ---------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = 'HTS Chapter 39: Plastics & Articles of Plastics — Tariff Updates 2025–2026'
tu['seo'] = {
    'title': 'Plastics Tariff Updates 2026 (HTS Chapter 39): Section 301 by Country, China Lists, Canada Section 338, AD/CVD on PET Resin & Bags | KoalaGains',
    'shortDescription': 'Every 2025–2026 change to U.S. tariffs on plastic resins, film, bags, flooring and other Chapter 39 goods, with dates and '
    'official sources: the end of the IEEPA duties, the 2026 Section 301 tariffs on 60 economies, China List 2/3/4A, the Canada Section 338 '
    'duty, and antidumping orders on PET resin, PET film, carrier bags, epoxy and more.',
    'keywords': [
        'plastic tariffs',
        'tariffs on plastic',
        'us tariffs on plastics',
        'trump tariffs on plastic',
        'chapter 39 tariff updates',
        'china plastic tariffs',
        'canada plastic tariffs',
        'mexico plastic tariffs',
        'pet resin anti dumping',
        'polyethylene retail carrier bags antidumping',
    ],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 '
    'Revision 21** (in force October 9, 2026). **No Chapter 39 base rate changed**: all 317 lines in both editions carry the same General, '
    'Special and Column 2 rates, from Free to 6.5%. The only change is statistical: from July 1, 2026 laboratory ware of 3926.90.99 is split into '
    'separatory funnels (3926.90.99.15) and other laboratory ware (3926.90.99.20).\n\n'
    'Everything that changed sits on top of the base rate. In 2025 the IEEPA duties reached plastics from almost every country — up to 145% for '
    'China in April–May 2025 on top of its Section 301 lists, 25%–35% on non-USMCA goods from Mexico and Canada, 19%–20% for most of Southeast '
    'Asia, 15% in total for the EU and Japan — though a list of resin subheadings was exempt. The IEEPA duties **ended on February 24, 2026**, and the '
    '10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026** goods from 60 economies pay a **Section 301 '
    'tariff**: +10% or +12.5% for most, 10% or 12.5% in total for the EU, Taiwan, Korea and Japan. China still pays its **2018–2019 Section 301 '
    'lists** (+25% on List 2 and 3 goods, +7.5% on List 4A), which USTR continued on October 7, 2026. Since **August 22, 2026** twenty Chapter 39 '
    'subheadings from Canada pay a **50% Section 338 duty**, even under USMCA. Antidumping and countervailing duty orders add company-specific '
    'duties on 12 plastics products; three of them — polypropylene corrugated boxes, acrylate monomers and oligomers, and fiberglass door panels — came under orders in 2026.'
)
tu['scope'] = (
    'Measures that reach Chapter 39 from any country: the 2026 Section 301 tariffs on 60 economies and their exemptions (pharmaceutical-use '
    'resins, civil aircraft parts), the Brazil Section 301 tariff, the China Section 301 Lists 2, 3 and 4A and their product exclusions, the Canada '
    'Section 338 duty, Russia\'s rates in lieu of column 2, and the 2025–2026 IEEPA and Section 122 duties that have ended. **Antidumping (AD) and '
    'countervailing (CVD) duty orders in force** on Chapter 39 goods (Federal Register, checked October 13, 2026): PET resin (3907.61) — AD on '
    'Canada, China, India and Oman, CVD on China and India; PET film, sheet and strip (3920.62) — AD on China, India, Taiwan and the UAE, CVD on '
    'India (continued March 27, 2026); polyethylene retail carrier bags (3923.21.00.85) — AD on China, Indonesia, Malaysia, Taiwan, Thailand and '
    'Vietnam, CVD on Vietnam; polyvinyl alcohol (3905.30) — AD on China and Japan (continued September 18, 2026); granular PTFE resin '
    '(3904.61.00.10) — AD and CVD on India and Russia; epoxy resins (3907.30) — AD on Korea, Taiwan and Thailand, CVD on Korea and Taiwan (May '
    '27, 2025); multifunctional acrylate and methacrylate monomers and oligomers (3907.29, 3907.30, also Chapter 29 and 38 lines) — AD and CVD on '
    'Taiwan (March 11, 2026), AD on Korea (July 28, 2026); polypropylene corrugated boxes (3923.10.90) — AD and CVD on China (March 16, 2026), AD '
    'on Vietnam (July 17, 2026); fiberglass door panels (3925.20.00.10) — AD and CVD on China (August 6, 2026); laminated woven sacks (mainly '
    '6305.33, also 3923.21, 3923.29, 3921.90 and 3917.39) — AD and CVD on China and Vietnam; plastic decorative ribbon (3920.20.00.15, '
    '3926.40.00.10) — AD and CVD on China; and biaxial integral geogrids (3926.90.99) — AD and CVD on China. Under investigation: PTMEG '
    '(3907.29) from China, Korea, Taiwan and Vietnam, and PFA fluoropolymer (3904.69.50) from India. AD/CVD rates are set per exporter and are '
    'not in the rate-by-country grid. Section 232: no Chapter 39 subheading is on the mandatory automobile-parts, truck-parts or metals lists. For '
    'the rate each supplier pays, see Rates by country.'
)

PHARMA = (
    'Thirty-two resin subheadings (polyethylene 3901.90.90, PTFE 3904.61, other vinyl polymers 3905.91–.99, epoxy 3907.30, PET 3907.61, nylon 3908, '
    'silicones 3910 and others in note 52(e)) pay no 2026 Section 301 duty when they are for use in pharmaceutical applications (9903.05.89).'
)
AIRCRAFT = 'Civil-aircraft hoses, tubes and gaskets of 3917.21–3917.40 and 3926.90.45–.99 that meet general note 6 are exempt (9903.05.88).'
NO52 = 'No Chapter 39 line is on the general exemption list (note 52(b)) or on a note 52(j) country exception list.'
EXEMPT = {
    'cn-section-301': (
        'Section 301 (2026) plus China Section 301 Lists 2, 3 and 4A',
        '9903.05.31 / 9903.88.02 / 9903.88.03 / 9903.88.15',
        '+37.5% on most lines (+12.5% + 25%); +20% on List 4A lines; +12.5% on the 25 lines on no list',
        'Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31) and the 2018–2019 list duty — List 2 (+25%, 9903.88.02) on 189 '
        'lines, mainly resins, film, sheet and tape; List 3 (+25%, 9903.88.03) on 75 lines, mainly scrap, vinyl flooring, packaging, bags and '
        'bottles; List 4A (+7.5%, 9903.88.15) on 30 lines, among them plates and cups, sanitary ware, doors and windows and many 3926 articles. '
        'Twenty-five lines (some tableware, office supplies, gloves, statuettes, photo albums) are on no list. Product exclusions in note '
        '20(vvv), through November 9, 2026 (9903.88.69): AA/AMPS terpolymers (3906.90.50.00), polyethylene films with acrylic adhesive '
        '(3919.10.20.55, 3919.90.50.40/.60), PVdC- or PVOH-coated films (3920.62.00.90), all of 3923.21.00.95 (other polyethylene bags), PLA '
        'stopper-stirrers (3923.50.00.00), sodium alginate resins (3913.10.00.00), laboratory ware of 3926.90.99.15/.20, and sterile drapes and '
        'decanters (3926.90.99.89). No List 1 or 2024 increase (note 31) reaches Chapter 39. USTR continued the lists on October 7, 2026. '
        + PHARMA
        + ' The IEEPA duties on China (fentanyl and reciprocal) ended February 24, 2026.',
        'Chinese polyethylene film pays 41.7%, PVC resin 44%, plastic bags 40.5% (plus AD duty on carrier bags), vinyl flooring 42.8%, plastic '
        'plates and cups 26.5%, food storage containers 15.9%.',
    ),
    'ca-section-301': (
        'Section 301 tariff (non-USMCA goods) + Section 338 duty (all goods on the list)',
        '9903.03.14 / 9903.05.29',
        '+10% (non-USMCA); +50% on 20 subheadings, USMCA or not',
        'Two measures. The 2026 Section 301 duty (+10%, 9903.05.29) does not apply to USMCA-qualifying goods (9903.05.93). The Section 338 duty '
        '(+50%, from August 22, 2026, 9903.03.14) applies to products of Canada in 20 Chapter 39 subheadings — PLA and other polyesters '
        '(3907.70, 3907.99.50), vinyl tile (3918.10.10), self-adhesive tape and film (3919.10.20, 3919.90.50), polypropylene film (3920.20), foam '
        'sheet (3921.19), other sheet (3921.90.50), boxes and crates (3923.10.90), polyethylene bags (3923.21), bottles (3923.30), closures '
        '(3923.50), tableware (3924.10.20, 3924.10.40), household articles (3924.90.56), office supplies (3926.10), furniture and coachwork '
        'fittings (3926.30.10, 3926.30.50), statuettes (3926.40) and other articles (3926.90.99) — and U.S. note 51(a) applies it even when USMCA '
        'is claimed. Civil-aircraft articles meeting general note 6 are exempt (9903.03.16). The September 15, 2026 list revisions and the '
        'September 29, 2026 import bans changed no Chapter 39 entry. Polyethylene, polypropylene and PVC resins and most film are not on the '
        'list. Canadian PET resin is also subject to an antidumping order. The 35% IEEPA duty on non-USMCA goods ended February 24, 2026.',
        'USMCA-qualifying polyethylene resin from Canada pays nothing, but USMCA plastic bags, bottles, caps or tableware pay 50%; non-qualifying '
        'ones 63%–66.5%.',
    ),
    'mx-section-301': (
        'Section 301 tariff (non-USMCA goods)',
        '9903.05.55',
        '+10%',
        'USMCA-qualifying goods pay no Section 301 duty (9903.05.94); others pay +10% (9903.05.55). ' + NO52 + ' Mexico is not subject to the '
        'Canada Section 338 duties, and no AD/CVD order covers a Mexican Chapter 39 product. The 25% IEEPA duty on non-USMCA goods ended '
        'February 24, 2026.',
        'USMCA-qualifying plastic parts, packaging and pipe from Mexico pay nothing; non-qualifying goods pay the base rate plus 10% — 15.3% on '
        '3926.90.99 articles.',
    ),
    'vn-section-301': (
        'Section 301 tariff (forced-labor investigations)',
        '9903.05.84',
        '+12.5%',
        'Base rate + 12.5% (9903.05.84). ' + NO52 + ' ' + PHARMA + ' Vietnamese polyethylene retail carrier bags (AD and CVD), laminated woven '
        'sacks (AD and CVD) and polypropylene corrugated boxes (AD, 130.58% Vietnam-wide rate, July 17, 2026) also carry AD/CVD duties. The 20% '
        'IEEPA reciprocal duty ended February 24, 2026.',
        'Vietnamese vinyl flooring pays 17.8%, plastic household goods 15.9%, plastic bags 15.5% before any AD/CVD duty.',
    ),
    'kr-section-301': (
        'Section 301 tariff, Korea rate (12.5% in total)',
        '9903.05.71',
        '12.5% in place of the base rate',
        'Korean goods whose base rate is under 12.5% pay 12.5% in total (9903.05.71), so every Chapter 39 line — all at 6.5% or less — pays 12.5%, '
        'whatever its base rate or KORUS claim. ' + NO52 + ' ' + PHARMA + ' Korean epoxy resins carry AD (6.37% all-others) and CVD (1.30% '
        'all-others) duties, and multifunctional acrylate and methacrylate monomers and oligomers an AD duty (65.72% all-others) since July 28, '
        '2026; Korean PTMEG is under investigation. The IEEPA reciprocal duty ended February 24, 2026.',
        'Korean ABS, polycarbonate, PET resin, film and flooring all pay 12.5% of value — $1,250 on $10,000.',
    ),
    'eu-section-301': (
        'Section 301 tariff, EU rate (10% in total)',
        '9903.05.39',
        '10% in place of the base rate',
        'For EU goods whose base rate is under 10%, the total is 10% (9903.05.39) — every Chapter 39 line. ' + NO52 + ' ' + PHARMA + ' No AD/CVD '
        'order covers an EU Chapter 39 product. This replaced the 15%-in-total IEEPA rate, which ended February 24, 2026.',
        'German, Italian, French or Belgian resins, film and plastic articles pay 10% of value, whatever the base rate.',
    ),
    'jp-section-301': (
        'Section 301 tariff, Japan rate (12.5% in total)',
        '9903.05.49',
        '12.5% in place of the base rate',
        'Japanese goods whose base rate is under 12.5% pay 12.5% in total (9903.05.49) — every Chapter 39 line. ' + NO52 + ' ' + PHARMA + ' '
        + AIRCRAFT
        + ' Japanese polyvinyl alcohol carries an antidumping duty (order continued September 18, 2026). The 15%-in-total IEEPA rate ended '
        'February 24, 2026.',
        'Japanese acrylics, PVC and fluoropolymer resins and film pay 12.5% of value.',
    ),
    'tw-section-301': (
        'Section 301 tariff, Taiwan rate (10% in total)',
        '9903.05.76',
        '10% in place of the base rate',
        'Taiwanese goods whose base rate is under 10% pay 10% in total (9903.05.76) — every Chapter 39 line. ' + NO52 + ' ' + PHARMA + ' Taiwan '
        'carries AD/CVD duties on PET film (AD), polyethylene retail carrier bags (AD), epoxy resins (AD 19.21% and CVD 33.24% all-others) and '
        'acrylate monomers and oligomers (AD 130.23%, CVD 103.43%, March 11, 2026); Taiwanese PTMEG is under investigation. The IEEPA reciprocal '
        'duty ended February 24, 2026.',
        'Taiwanese resins, film and plastic articles pay 10% of value, before any AD/CVD duty.',
    ),
    'th-section-301': (
        'Section 301 tariff (forced-labor investigations)',
        '9903.05.77',
        '+12.5%',
        'Base rate + 12.5% (9903.05.77). ' + NO52 + ' ' + PHARMA + ' Thai polyethylene retail carrier bags and epoxy resins (5.25%) carry '
        'antidumping duties. The 19% IEEPA reciprocal duty ended February 24, 2026.',
        'Thai vinyl flooring pays 17.8%, polyethylene resin 19%, plastic bags 15.5% before any AD duty.',
    ),
    'in-section-301': (
        'Section 301 tariff (forced-labor investigations)',
        '9903.05.44',
        '+10%',
        'Base rate + 10% (9903.05.44). ' + NO52 + ' ' + PHARMA + ' Indian PET resin (AD and CVD), PET film (AD and CVD) and granular PTFE resin '
        '(AD and CVD) carry AD/CVD duties; PFA from India is under investigation (ITC preliminary affirmative, September 24, 2026). The IEEPA '
        'duties on India — 25% reciprocal from August 7, 2025 plus 25% from August 27, 2025 — ended in February 2026.',
        'Indian PET resin pays 16.5% plus AD and CVD deposits; plastic articles of 3926.90.99 pay 15.3%.',
    ),
    'gb-section-301': (
        'Section 301 tariff (forced-labor investigations)',
        '9903.05.81',
        '+10%',
        'Base rate + 10% (9903.05.81). ' + NO52 + ' ' + PHARMA + ' ' + AIRCRAFT + ' The 10% IEEPA reciprocal duty ended February 24, 2026.',
        'British resins pay 16.5%, film 14.2%–16.2%, plastic articles 15.3%.',
    ),
    'br-section-301': (
        'Section 301 tariffs: Brazil action plus 2026 forced-labor action',
        '9903.05.01 / 9903.05.27',
        '+37.5%',
        '+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 (9903.05.27). The Brazil '
        'exemption list (U.S. note 50(a)(ii)) names no Chapter 39 line; the same 32 resin subheadings are exempt from the 25% when for '
        'pharmaceutical use (9903.05.06), and civil-aircraft articles meeting general note 6 are exempt (9903.05.05). The 40% IEEPA duty on Brazil '
        '(Executive Order 14323) ended February 24, 2026.',
        'Brazilian polyethylene or PVC resin pays 44%, cellulose derivatives 41.7%–43.9%.',
    ),
    'ru-section-301': (
        'Section 301 tariff + rates in lieu of column 2 (40 lines)',
        '9903.05.66 / 9903.90.08',
        '+12.5% or 35% (in place of base) + +12.5%',
        'Russia pays column 2 rates (general note 3(b)) — 25% to 84.5% on Chapter 39 goods, some with a cents-per-kg part — plus +12.5% '
        '(9903.05.66). On 26 subheadings (40 lines), among them polypropylene, PTFE, polyethers, silicones, pipe, PET film and polyethylene sheet, '
        'the rate is 35% under 9903.90.08 in place of column 2 (U.S. note 30). Russian granular PTFE resin also carries AD and CVD duties.',
        'Russian plastics are effectively priced out: 37.5% to 97% before any AD/CVD duty.',
    ),
    'other-section-301': (
        'Section 301 tariff (forced-labor investigations)',
        '9903.05.20–9903.05.83',
        '+10% or +12.5%, or 10%/12.5% in total for some',
        'Rates by country: Malaysia, Cambodia, Indonesia and Pakistan +10%; Israel, Singapore, Türkiye, Saudi Arabia, Oman and the UAE +12.5%; '
        'Switzerland 12.5% in total. ' + NO52 + ' ' + PHARMA + ' AD orders also cover polyethylene retail carrier bags from Indonesia and '
        'Malaysia, PET resin from Oman and PET film from the UAE. Countries outside the 60 economies, such as Myanmar, Laos or Kenya, pay only the '
        'base rate.',
        'Malaysian plastic bags pay 13% before AD duty; Israeli or Singaporean resins 19%.',
    ),
}
for e in tu['inEffect']:
    measure, code, now, exemption, means = EXEMPT[e['id']]
    e['measure'] = measure
    e['ch99Code'] = code
    e['now'] = now
    e['exemption'] = exemption
    e['whatItMeans'] = means
    if e['id'] == 'other-section-301':
        e['country'] = 'Other Section 301 economies (incl. Malaysia, Israel, Türkiye, Singapore, Cambodia, Switzerland, Oman)'

ADCVD_IDS = [
    'ad-pet-resin', 'cvd-pet-resin', 'ad-pet-film', 'ad-prcb', 'ad-pva', 'ad-ptfe', 'cvd-ptfe', 'ad-epoxy', 'cvd-epoxy', 'ad-mammo-tw',
    'ad-mammo-kr', 'ad-lws-cn', 'ad-lws-vn', 'ad-ribbon', 'ad-geogrid', 'ad-ppbox-cn', 'ad-ppbox-vn', 'ad-door',
]
for e in tu['inEffect']:
    if e['id'] in ('cn-section-301',):
        for sid in ['fr-2025-21671', 'ad-pet-resin', 'ad-pet-film', 'ad-prcb', 'ad-pva', 'ad-door', 'ad-ppbox-cn']:
            if sid not in e['sourceIds']:
                e['sourceIds'].insert(-1, sid)
    extra = {
        'ca-section-301': ['ad-pet-resin', 'eo-14389'],
        'mx-section-301': ['eo-14389'],
        'vn-section-301': ['ad-prcb', 'ad-lws-vn', 'ad-ppbox-vn', 'eo-14389'],
        'kr-section-301': ['ad-epoxy', 'cvd-epoxy', 'ad-mammo-kr', 'itc-ptmeg', 'eo-14389'],
        'eu-section-301': ['eo-14389'],
        'jp-section-301': ['ad-pva', 'eo-14389'],
        'tw-section-301': ['ad-pet-film', 'ad-prcb', 'ad-epoxy', 'cvd-epoxy', 'ad-mammo-tw', 'eo-14389'],
        'th-section-301': ['ad-prcb', 'ad-epoxy', 'eo-14389'],
        'in-section-301': ['ad-pet-resin', 'cvd-pet-resin', 'ad-pet-film', 'ad-ptfe', 'cvd-ptfe', 'itc-pfa', 'eo-14384', 'eo-14389'],
        'gb-section-301': ['eo-14389'],
        'br-section-301': ['eo-14323', 'eo-14389'],
        'ru-section-301': ['ad-ptfe', 'cvd-ptfe'],
        'other-section-301': ['ad-prcb', 'ad-pet-resin', 'ad-pet-film'],
    }.get(e['id'], [])
    for sid in extra:
        if sid not in e['sourceIds']:
            e['sourceIds'].insert(-1, sid)


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    return {
        'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
        'countries': countries, 'sourceIds': sids,
    }


for c in tu['changes']:
    if c['id'] == 'base-rates':
        c['date'] = TODAY
        c['title'] = 'No Chapter 39 base-rate changes; two new statistical lines'
        c['detail'] = (
            'All 317 Chapter 39 lines that exist in both editions carry the same General, Special and Column 2 rates in 2026 Revision 21 as in the '
            '2025 Basic Edition. From July 1, 2026 statistical line 3926.90.99.10 (laboratory ware) was split into 3926.90.99.15 (separatory '
            'funnels) and 3926.90.99.20 (other); both keep the 5.3% rate.'
        )
    elif c['id'].startswith('section-301-nicaragua'):
        c['date'] = '2025-12-29'
        c['dateLabel'] = 'Published'
        c['title'] = 'Scheduled: Section 301 tariff on products of Nicaragua'
        c['detail'] = (
            'Products of Nicaragua that pay the column 1-general rate (that is, not entered under CAFTA-DR) will pay +10% (9903.89.01) from January '
            '1, 2027 and +15% from January 1, 2028. Today Nicaragua pays the 12.5% 2026 Section 301 duty (9903.05.58).'
        )
    elif c['id'].startswith('section-338-canada'):
        c['title'] = 'Canada Section 338 duty takes effect on 20 Chapter 39 subheadings'
        c['detail'] = (
            '50% on listed products of Canada after a 3-day suspension lapsed. Chapter 39 is on the motor-vehicle list (9903.03.14): PLA and other '
            'polyesters, vinyl tile, self-adhesive tape and film, polypropylene film, foam and other sheet, boxes and crates, polyethylene bags, '
            'bottles, closures, tableware and household articles, office supplies, furniture and coachwork fittings, statuettes and the 3926.90.99 '
            'catch-all — 51 statistical lines. Unlike the Section 301 duty, it applies to USMCA-qualifying goods too (U.S. note 51(a)).'
        )
    elif c['id'].startswith('section-301-2026-60-economies'):
        c['title'] = 'Section 301 tariffs on 60 economies cover all of Chapter 39'
        c['detail'] = (
            '10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 39 line is on the general exemption list (note 52(b)) '
            'or a country exception list (note 52(j)). EU and Taiwanese goods pay 10% in total, Korean, Japanese and Swiss goods 12.5% in total — '
            'every Chapter 39 line is below those levels. Thirty-two resin subheadings are exempt when for pharmaceutical use (9903.05.89), and '
            'twelve hose, tube and gasket lines when they are civil-aircraft articles (9903.05.88). USMCA-qualifying goods from Canada and Mexico are '
            'exempt (9903.05.93, 9903.05.94).'
        )
    elif c['id'].startswith('section-301-brazil'):
        c['title'] = 'Section 301 tariff on products of Brazil'
        c['detail'] = (
            '25% on all goods of Brazil (9903.05.01). No Chapter 39 line is on the Brazil exemption list (U.S. note 50(a)(ii)); pharmaceutical-use '
            'resins (9903.05.06) and civil-aircraft articles (9903.05.05) are exempt. From July 24 the 12.5% forced-labor tariff (9903.05.27) is '
            'added on top.'
        )
    else:
        raise SystemExit(f'unexpected generated change {c["id"]}')

EXTRA_CHANGES = [
    ch('cn-301-continue', 'reference', '2026-10-07', 'Published', 'China Section 301 lists continue after the four-year review',
       'USTR announced that the 2018–2019 China Section 301 actions did not terminate on their anniversaries because domestic industries asked '
       'for them to continue. For Chapter 39 this keeps +25% on List 2 resins, film and sheet and on List 3 flooring, packaging and bags, and '
       '+7.5% on List 4A goods.', '+25% / +7.5%', '+25% / +7.5%', 'China', ['fr-2026-20510']),
    ch('pfa-in', 'pending', '2026-09-24', 'Published', 'PFA fluoropolymer from India: ITC preliminary injury finding',
       'Commerce opened antidumping and countervailing duty investigations of perfluoroalkoxy alkane (PFA, 3904.69.50) from India on a petition '
       'filed August 5, 2026, and the ITC found a reasonable indication of injury. Duties would start only after affirmative preliminary '
       'determinations by Commerce.', None, 'Under investigation', 'India', ['ad-pfa-init', 'cvd-pfa-init', 'itc-pfa']),
    ch('pva-continue', 'reference', '2026-09-18', 'Published', 'Polyvinyl alcohol antidumping orders continued',
       'After the fourth sunset reviews, Commerce continued the antidumping orders on polyvinyl alcohol (3905.30) from Japan and China, in force '
       'since July and October 2003.', None, 'AD order continued', 'China, Japan', ['ad-pva']),
    ch('ca-338-scope', 'reference', '2026-09-15', 'Effective', 'Canada Section 338 lists revised; Chapter 39 entries unchanged',
       'Proclamations 11064 and 11065 added and removed provisions on the 9903.03.12 and 9903.03.14 lists. None of the added or removed '
       'provisions is in Chapter 39, and the September 29, 2026 Canadian import bans (alcoholic beverages, dairy and 8711.50 motorcycles) name '
       'no Chapter 39 product.', None, None, 'Canada', ['procl-11064', 'procl-11065', 'csms-69851916', 'procl-11063']),
    ch('ptmeg', 'pending', '2026-08-28', 'Published', 'PTMEG investigations: preliminary determinations due November 4, 2026',
       'Commerce initiated antidumping investigations of polytetramethylene ether glycol (PTMEG, 3907.29 and 2932.11) from China, Korea, '
       'Taiwan and Vietnam on May 5, 2026; the ITC made an affirmative preliminary injury finding on July 16, 2026. Commerce postponed its '
       'preliminary determinations to no later than November 4, 2026; cash deposits would start then if they are affirmative.', None,
       'Under investigation', 'China, South Korea, Taiwan, Vietnam', ['ad-ptmeg-init', 'itc-ptmeg', 'ad-ptmeg-postpone']),
    ch('door-panels', 'extraDuty', '2026-08-06', 'Published', 'Fiberglass door panels from China: AD and CVD orders',
       'Antidumping (China-wide rate 147.85%, separate rates 41.82%–104.31%) and countervailing (all-others 60.64%) duty orders on fiberglass '
       'door panels classified in 3925.20.00.10 (and 7019.90.51.50).', None, 'AD + CVD', 'China', ['ad-door']),
    ch('prcb-sunset', 'reference', '2026-08-03', 'Published', 'Polyethylene carrier bag orders scheduled for sunset reviews',
       'Commerce listed the antidumping orders on polyethylene retail carrier bags from China, Indonesia, Malaysia, Taiwan, Thailand and Vietnam '
       'and the Vietnam countervailing duty order for sunset reviews beginning in September 2026. The orders stay in force during the reviews.',
       None, None, 'China, Indonesia, Malaysia, Taiwan, Thailand, Vietnam', ['ad-prcb-sunset', 'ad-prcb']),
    ch('mammo-kr', 'extraDuty', '2026-07-28', 'Published', 'Acrylate monomers and oligomers from Korea: AD order',
       'Antidumping order on multifunctional acrylate and methacrylate monomers and oligomers from Korea (all-others 65.72%), entered under '
       '3907.29, 3907.30 and Chapter 29 and 38 lines.', None, 'AD', 'South Korea', ['ad-mammo-kr']),
    ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 import surcharge expired',
       'The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.', '+10%', 'None', 'All', ['procl-11012', 'hts-now']),
    ch('ppbox-vn', 'extraDuty', '2026-07-17', 'Published', 'Polypropylene corrugated boxes from Vietnam: AD order',
       'Antidumping order on polypropylene corrugated boxes (3923.10.90.00) from Vietnam, Vietnam-wide rate 130.58%.', None, 'AD', 'Vietnam',
       ['ad-ppbox-vn']),
    ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
       'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of '
       'the issues or until termination, so USMCA claims (SPI S) still remove the base rate and the Section 301 duty on Mexican and Canadian '
       'plastics — but not the Canadian Section 338 duty.', None, None, 'Canada, Mexico', ['ustr-usmca-review']),
    ch('pet-film-continue', 'reference', '2026-03-27', 'Published', 'PET film orders continued',
       'After sunset reviews, Commerce continued the antidumping orders on PET film, sheet and strip (3920.62) from China, India, Taiwan and the '
       'UAE and the countervailing duty order on India.', None, 'AD + CVD continued', 'China, India, Taiwan, UAE', ['ad-pet-film']),
    ch('ppbox-cn', 'extraDuty', '2026-03-16', 'Published', 'Polypropylene corrugated boxes from China: AD and CVD orders',
       'Antidumping (China-wide 83.64%) and countervailing (all-others 62.27%) duty orders on polypropylene corrugated boxes classified in '
       '3923.10.90.00.', None, 'AD + CVD', 'China', ['ad-ppbox-cn']),
    ch('mammo-tw', 'extraDuty', '2026-03-11', 'Published', 'Acrylate monomers and oligomers from Taiwan: AD and CVD orders',
       'Antidumping (130.23%) and countervailing (103.43%) duty orders on multifunctional acrylate and methacrylate monomers and oligomers from '
       'Taiwan, entered under 3907.29, 3907.30 and Chapter 29 and 38 lines.', None, 'AD + CVD', 'Taiwan', ['ad-mammo-tw']),
    ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
       '10% on products of all countries (9903.03.01) until July 23, 2026. Eighteen Chapter 39 resin subheadings — among them 3901.90.90, '
       '3902.90.00, 3904.61.00, 3907.10.00, 3907.21.00, 3911.90.25 and 3914.00.60 — were on the product exemption list (9903.03.03). '
       'USMCA-qualifying goods from Canada and Mexico were exempt.', 'None', '+10% (until July 23, 2026)', 'All', ['procl-11012', 'hts-now']),
    ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
       'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive '
       'Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on '
       'February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.', 'Varied by country',
       'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313']),
    ch('india-oil-end', 'extraDuty', '2026-02-07', 'Effective', "India's extra 25% IEEPA duty removed",
       'Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. The 25% reciprocal rate '
       'on India ended with the other IEEPA duties on February 24.', '+50%', '+25% (until February 24, 2026)', 'India', ['eo-14384']),
    ch('pet-sheet-revoked', 'reference', '2026-01-12', 'Published', 'PET sheet from Korea: antidumping order revoked',
       'No domestic party took part in the first sunset review, so Commerce revoked the antidumping order on PET sheet (3920.62) from Korea, '
       'effective for entries from September 10, 2025.', 'AD', 'Revoked',
       'South Korea', ['ad-pet-sheet-rev']),
    ch('cn-exclusions', 'reference', '2025-12-01', 'Published', 'China Section 301 exclusions on nine Chapter 39 products extended to November 9, 2026',
       'USTR extended 178 China Section 301 product exclusions through November 9, 2026, among them AA/AMPS terpolymers, polyethylene and '
       'coated films, other polyethylene bags (3923.21.00.95), PLA stopper-stirrers, sodium alginate resins, laboratory ware and sterile drapes '
       '(U.S. note 20(vvv), 9903.88.69). Matching goods skip the List 2, 3 or 4A duty; the 2026 Section 301 duty still applies.', None,
       'Through November 9, 2026', 'China', ['fr-2025-21671', 'hts-now']),
    ch('cn-ieepa-cut', 'extraDuty', '2025-11-10', 'Effective', 'China fentanyl duty cut to 10%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It ended with the other IEEPA duties on February '
       '24, 2026.', '+20%', '+10% (ended)', 'China', ['eo-14357']),
    ch('india-oil', 'extraDuty', '2025-08-27', 'Effective', 'Extra 25% on products of India',
       'Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025 (EO 14326): '
       '50% in all on Indian plastics, on top of the base rate. Ended February 7, 2026.', '+25%', '+50% (ended)', 'India', ['eo-14329', 'eo-14326']),
    ch('country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country reciprocal rates replace the 10% baseline',
       'Executive Order 14326 set country rates for goods entered from August 7, 2025: Thailand, Malaysia, Cambodia and Indonesia +19%, Vietnam '
       '+20%, India +25%, Korea +15%, the UK +10%. EU goods with a column 1 rate under 15% paid 15% in total — every Chapter 39 line. Resin '
       'subheadings on Annex II (9903.01.32) stayed exempt. Ended February 24, 2026.', '+10%', '+10% to +25% (ended)',
       'Listed countries, European Union', ['eo-14326', 'hts-now']),
    ch('ca-amended', 'extraDuty', '2025-07-31', 'Signed', 'Canada additional duty raised to 35%',
       'Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.', '+25%', '+35% (ended)', 'Canada',
       ['eo-14325']),
    ch('epoxy-orders', 'extraDuty', '2025-05-27', 'Published', 'Epoxy resins: AD orders on Korea, Taiwan and Thailand, CVD orders on Korea and Taiwan',
       'Orders on epoxy resins (3907.30.00) — antidumping all-others rates 6.37% (Korea), 19.21% (Taiwan) and 5.25% (Thailand), countervailing '
       'all-others rates 1.30% (Korea) and 33.24% (Taiwan). The ITC found imports from China and India negligible, so no order was issued on '
       'them.', None, 'AD + CVD', 'South Korea, Taiwan, Thailand', ['ad-epoxy', 'cvd-epoxy', 'itc-epoxy']),
    ch('cn-reciprocal-10', 'extraDuty', '2025-05-14', 'Effective', 'China reciprocal duty cut from 125% to 10%',
       'Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025. Chinese polyethylene film then '
       'paid 4.2% + 25% (List 2) + 20% + 10% = 59.2% until November 9, 2025. Ended February 24, 2026.', '+125%', '+10% (ended)', 'China',
       ['eo-14298']),
    ch('cn-125', 'extraDuty', '2025-04-10', 'Effective', 'China reciprocal duty raised to 125%',
       'Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% from April 10, 2025, and paused the higher country rates '
       'announced on April 2 for other countries. With the 20% fentanyl duty and the 25% List 2 duty, Chinese polyethylene film (4.2% base) paid '
       '174.2% until May 13, 2025.', None, '+125% (ended)', 'China', ['eo-14266']),
    ch('reciprocal', 'extraDuty', '2025-04-02', 'Signed', 'Reciprocal tariff on products of all countries',
       '10% baseline (9903.01.25) from April 5, 2025, and country rates (9903.02.xx); Canada and Mexico excluded. Chapter 39 resin subheadings '
       'on the Annex II exemption list (9903.01.32) — 18 in the list as last printed — were exempt. Ended February 24, 2026.', 'None', '+10% or more (ended)',
       'All except Canada, Mexico', ['eo-14257', 'hts-now']),
    ch('cn-ieepa', 'extraDuty', '2025-03-04', 'Effective', 'China fentanyl duty raised to 20%',
       'The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top '
       'of the Section 301 list duties. Ended February 24, 2026.', '+10%', '+20% (ended)', 'China', ['eo-14195', 'eo-14228']),
    ch('mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Mexico',
       '+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.', 'None', '+25% (ended)',
       'Mexico', ['eo-14194']),
    ch('ca-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duty on products of Canada',
       '+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.', 'None',
       '+25% (ended)', 'Canada', ['eo-14193']),
    ch('cn-list4a-cut', 'extraDuty', '2020-02-14', 'Effective', 'China List 4A duty cut to 7.5%',
       'Under the Phase One agreement USTR cut the List 4A duty (9903.88.15) from 15% to 7.5%. For Chapter 39 it covers 30 lines — plates and '
       'cups, sanitary ware, doors and windows, shutters and many 3926 articles.', '+15%', '+7.5%', 'China', ['fr-2020-00904']),
    ch('cn-list4a', 'extraDuty', '2019-09-01', 'Effective', 'China List 4A reaches household plastics and builders\' ware',
       'The fourth China Section 301 list put +15% on Chinese plastic tableware, sanitary ware, builders\' ware, alginates and other articles '
       '(9903.88.15).', 'None', '+15%', 'China', ['fr-2019-17865']),
    ch('cn-list3-25', 'extraDuty', '2019-05-10', 'Effective', 'China List 3 duty raised to 25%',
       'USTR raised the List 3 duty (9903.88.03) from 10% to 25%. For Chapter 39 List 3 covers 75 lines, among them plastic scrap, vinyl '
       'flooring, packaging, bags and bottles.', '+10%', '+25%', 'China', ['fr-2019-09681']),
    ch('cn-list3', 'extraDuty', '2018-09-24', 'Effective', 'China Section 301 List 3 reaches plastic packaging and flooring',
       'The third China Section 301 list put +10% on Chinese plastic scrap, vinyl flooring, boxes, bags, bottles, closures and other articles.',
       'None', '+10%', 'China', ['fr-2018-20610']),
    ch('cn-list2', 'extraDuty', '2018-08-23', 'Effective', 'China Section 301 List 2 reaches plastic resins, film and sheet',
       'The second China Section 301 list put +25% on Chinese polyethylene, polypropylene, PVC, PET and most other resins, plastic film and sheet, '
       'tape and foam (9903.88.02, 189 Chapter 39 lines).', 'None', '+25%', 'China', ['fr-2018-17709']),
]
have = {c['id'] for c in tu['changes']}
tu['changes'] += [c for c in EXTRA_CHANGES if c['id'] not in have]
tu['changes'].sort(key=lambda c: c['date'], reverse=True)

add_sources(
    tu,
    [
        'hts-ch39', 'fr-2026-20510', 'fr-2025-21671', 'procl-11064', 'procl-11065', 'csms-69851916', 'procl-11063', 'procl-11012',
        'ustr-usmca-review', 'scotus-24-1287', 'eo-14389', 'csms-67834313', 'eo-14384', 'eo-14329', 'eo-14326', 'eo-14325', 'eo-14323',
        'eo-14357', 'eo-14298', 'eo-14266', 'eo-14257', 'eo-14195', 'eo-14228', 'eo-14194', 'eo-14193', 'fr-2019-09681',
        'ad-prcb-sunset', 'itc-epoxy', 'ad-pet-sheet-rev', 'ad-ptmeg-init', 'itc-ptmeg', 'ad-ptmeg-postpone', 'ad-pfa-init', 'cvd-pfa-init',
        'itc-pfa',
    ]
    + ADCVD_IDS,
)
used = set()
for e in tu['inEffect']:
    used.update(e['sourceIds'])
for c in tu['changes']:
    used.update(c['sourceIds'])
add_sources(tu, sorted(used))
tu['stats'] = [s for s in tu['stats'] if s['label'] != 'IEEPA duties'] + [
    {'label': 'AD/CVD orders', 'value': '12 products', 'note': '3 new in 2026; PTMEG and PFA under investigation'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026'},
]

# ---------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 39: Plastics & Articles of Plastics — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Plastics Imports by Country 2025 — Resins, Film, Bags, Flooring & Plastic Products (HTS Chapter 39) | KoalaGains',
    'shortDescription': f'U.S. imports of HTS Chapter 39 plastics: {F(TOTAL)} in {Y}. Who supplies polyethylene and other resins, plastic film, '
    'vinyl flooring, packaging, bags, tableware and plastic parts — China, Canada, Mexico, Vietnam, Korea, Germany, Japan — with values by product '
    'and year from UN Comtrade.',
    'keywords': [
        'u.s. plastic industry',
        'us plastic imports by country',
        'plastic resin imports',
        'plastic products imports china',
        'vinyl flooring imports vietnam',
        'polyethylene imports from canada',
        'hts chapter 39 import statistics',
        'global plastic industry',
    ],
}
ui['lastCheckedAt'] = TODAY
for c in ui['byCountry']:
    if c.get('mainHeading') in LABELS:
        c['mainHeadingLabel'] = LABELS[c['mainHeading']][0]
peak = max(year_tot.items(), key=lambda kv: kv[1])
ui['why'] = (
    f'U.S. imports of Chapter 39 goods were **{F(TOTAL)} in {Y}**, {abs(round((TOTAL / PRIOR - 1) * 100, 1))}% less than the {F(PRIOR)} of {PY} '
    f'and well below the {F(peak[1])} peak of {peak[0]}. Articles of plastics made up {round(100 * (1 - PRIMARY / TOTAL))}% of it; the largest '
    f'headings were **other plastic articles (3926)** at {F(himp("3926"))}, **packaging, bags and bottles (3923)** at {F(himp("3923"))}, '
    f'**tableware and household articles (3924)** at {F(himp("3924"))} and **film and sheet (3920)** at {F(himp("3920"))}. Resins in primary '
    f'forms (3901–3914) came to {F(PRIMARY)}, led by PET, polycarbonate and epoxy (3907, {F(himp("3907"))}) and polyethylene (3901, '
    f'{F(himp("3901"))}).\n\n'
    f'**China** stayed the largest supplier at {F(imp(CN))} but fell {abs(chg(CN))}%; its trade is mostly finished articles — '
    f'{F(hc["3926"][CN])} of 3926 articles and {F(hc["3924"][CN])} of household goods. **Canada** ({F(imp(CA))}, {chg(CA)}%) is the main '
    f'source of resins — {F(hc["3901"][CA])} of polyethylene — and of film and packaging, and **Mexico** ({F(imp(MX))}, +{chg(MX)}%) of molded '
    f'parts and packaging. **Vietnam** grew {chg(VN)}% to {F(imp(VN))}, {F(hc["3918"][VN])} of it vinyl flooring (3918), and **Thailand** grew '
    f'{chg(TH)}% to {F(imp(TH))}, with vinyl flooring its largest product too. Korea ({F(imp(KR))}), Germany ({F(imp(DE))}) and Japan ({F(imp(JP))}) ship '
    'roughly half resins and half film, sheet and articles — Korea is the largest supplier of PET, polycarbonate and epoxy (3907) — while '
    f'Taiwan ({F(imp(TW))}) ships mainly packaging and articles.\n\n'
    f'The figures are annual and stop at {Y}, before the 2026 tariff changes (the end of the IEEPA duties in February, the Section 301 tariffs '
    'from July 24, 2026 and the Canada Section 338 duties from August 22); they do not show what those changes did. Duty-collected figures are not '
    'available from an official source yet.'
)
ui['coverageNote'] = (
    f'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade, for calendar years '
    f'{min(year_tot)}–{Y}. "Other Asia, nes" is how UN Comtrade reports Taiwan.'
)

# ---------------------------------------------------------------------------------------------------
# Industry areas (matrix)
# ---------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['h1'] = 'HTS Chapter 39: Plastics & Articles of Plastics — Tariff Rates by Country'
for g in ia['groups']:
    g['label'], g['shortLabel'] = LABELS[g['heading']]
RULE_LABELS = {
    'China': 'Base rate + 12.5% Section 301 (9903.05.31) + the 2018–2019 list duty: +25% List 2 (9903.88.02) on 189 lines — resins, film, sheet, '
    'tape, foam; +25% List 3 (9903.88.03) on 75 lines — scrap, flooring, packaging, bags, bottles; +7.5% List 4A (9903.88.15) on 30 lines. '
    'Twenty-five lines are on no list. Nine note 20(vvv) exclusions run to November 9, 2026. AD/CVD orders add more on PET resin, PET film, '
    'carrier bags, PVA, woven sacks, ribbon, geogrids, PP boxes and door panels.',
    'Canada': 'USMCA-qualifying: no Section 301 duty (9903.05.93); otherwise base rate + 10% (9903.05.29). On top, 50% Section 338 on 20 '
    'subheadings — vinyl tile, tape, PP film, foam sheet, boxes, bags, bottles, closures, tableware, office supplies, fittings, statuettes and '
    '3926.90.99 (9903.03.14) — whether or not USMCA is claimed. Resins and most film are not on the list.',
    'Mexico': 'USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February '
    '24, 2026.',
    'Vietnam': 'Base rate + 12.5% Section 301 (9903.05.84). No Chapter 39 line is exempt (except pharmaceutical-use resins). AD/CVD orders cover '
    'carrier bags, woven sacks and PP corrugated boxes.',
    'South Korea': 'Korea: 12.5% in total in place of the base rate (9903.05.71) — every Chapter 39 line, KORUS or not. AD/CVD orders cover epoxy '
    'resins and acrylate monomers and oligomers.',
    'Germany': 'EU: 10% in total in place of the base rate (9903.05.39) — every Chapter 39 line. The 15%-in-total IEEPA rate ended February 24, 2026.',
    'Japan': 'Japan: 12.5% in total in place of the base rate (9903.05.49) — every Chapter 39 line. Polyvinyl alcohol carries an AD duty.',
    'Taiwan': 'Taiwan: 10% in total in place of the base rate (9903.05.76) — every Chapter 39 line. AD/CVD orders cover PET film, carrier bags, '
    'epoxy resins and acrylate oligomers.',
    'Thailand': 'Base rate + 12.5% Section 301 (9903.05.77). AD orders cover carrier bags and epoxy resins.',
    'India': 'Base rate + 10% Section 301 (9903.05.44). AD/CVD orders cover PET resin, PET film and granular PTFE. The IEEPA duties (up to 50%) '
    'ended in February 2026.',
    'United Kingdom': 'Base rate + 10% Section 301 (9903.05.81). No Chapter 39 line is on the UK exception list.',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% 2026 Section 301 (9903.05.27). No Chapter 39 line is on the Brazil '
    'exemption list. The 40% IEEPA duty ended February 24, 2026.',
}
for c in ia['countries']:
    r = c['rule']
    if r.get('atLeast'):
        r['label'] = (
            'Countries outside the 60 Section 301 economies (for example Myanmar, Laos, Kenya) pay only the base rate. The 60 pay +10% or +12.5% '
            '(9903.05.20–9903.05.83) — Malaysia, Cambodia and Indonesia +10%, Israel, Singapore and Türkiye +12.5% — or 12.5% in total for '
            'Switzerland. Column 2 countries (Cuba, North Korea, Russia, Belarus) pay column 2 rates — 25% to 84.5%.'
        )
        r['ch99Code'] = '9903.05.20–9903.05.83'
    else:
        r['label'] = RULE_LABELS[c['country']]
    if c['country'] in ('Canada', 'Mexico', 'Germany', 'India', 'Brazil') and 'eo-14389' not in r['sourceIds']:
        r['sourceIds'].insert(-1, 'eo-14389')
add_sources(ia, ['eo-14389'])
ia['seo'] = {
    'title': 'Plastic Tariffs by Country 2026 — China, Canada, Mexico, Vietnam, Korea, Germany, Japan (HTS Ch. 39) | KoalaGains',
    'shortDescription': 'The total 2026 U.S. tariff on plastic resins, film, flooring, packaging, bags and plastic products by country: 10% in total '
    'for EU and Taiwanese goods, 12.5% for Korea and Japan, base +12.5% for Vietnam and Thailand, up to 44% for China, 50% Section 338 on some '
    'Canadian goods.',
    'keywords': [
        'china plastic tariffs',
        'canada plastic tariffs',
        'mexico plastic tariffs',
        'germany plastic tariffs',
        'south korea plastic tariffs',
        'tariffs on plastic from china',
        'plastics tariffs canada',
        'chapter 39 customs duty',
    ],
}
ia['intro'] = (
    'Chapter 39 base rates are low — Free to 6.5% — so the **extra duty by country** decides most of the cost. Each cell below is the base rate '
    'for that product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n'
    'Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** that started July 24, '
    '2026: **10% in total for Germany and the rest of the EU and for Taiwan**, **12.5% in total for Korea and Japan**, **+12.5% for Vietnam and '
    'Thailand**, **+10% for India and the UK**. **China adds 37.5%** on most resins, film, flooring and packaging (12.5% plus the 25% List 2 or '
    'List 3 duty), 20% on List 4A goods and 12.5% on the few lines on no list. USMCA-qualifying goods from Mexico pay nothing; from Canada they '
    'pay nothing except on the **20 subheadings with the 50% Section 338 duty**, which no USMCA claim removes. Antidumping and countervailing '
    'duties on specific products and exporters come on top and are listed on the Tariff updates page.'
)
assumptions = [a for a in ia['assumptions'] if 'TODO' not in a]
assumptions += [
    'Canada, "USMCA-qualifying" side: the Section 301 duty is removed (9903.05.93), but the 50% Section 338 duty stays on the 20 listed '
    'subheadings because U.S. note 51(a) applies it even when a special rate is claimed.',
    'Korea, Japan, the EU and Taiwan pay a fixed total (12.5% or 10%) in place of the base rate because every Chapter 39 base rate is below it; '
    'an FTA claim (KORUS) does not lower it.',
    'Not in the cells: the China note 20(vvv) exclusions that need the importer\'s confirmation that the goods match the description (whole-line '
    'exclusions for 3923.21.00.95 and 3926.90.99.15/.20 are applied); the pharmaceutical-use (9903.05.89, 9903.05.06) and civil-aircraft '
    '(9903.05.88, 9903.03.16) exemptions; AGOA, CAFTA-DR and other FTA preferences; and antidumping and countervailing duties, which are set per '
    'exporter (see Tariff updates).',
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge '
    '(9903.03.01) expired July 23, 2026; neither is applied.',
]
ia['assumptions'] = assumptions
ia['exemptionCheck'] = (
    'Read U.S. notes 16, 19, 20, 30, 31, 33, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general '
    'exemption list (note 52(b), 9903.05.86) has no Chapter 39 line, and no note 52(j) country exception list names one. Note 52(e) (9903.05.89) '
    'exempts 32 resin subheadings when the goods are for use in pharmaceutical applications, and note 52(d) (9903.05.88) exempts civil-aircraft '
    'articles of 3917.21–3917.40 and 3926.90.45–3926.90.99; the Brazil notes 50(a)(iv)–(v) mirror both, and the Brazil list (note 50(a)(ii)) has '
    'no Chapter 39 line. The Canada Section 338 motor-vehicle list (note 51(b)(3)) names 20 Chapter 39 subheadings; the alcoholic-beverage and '
    'dairy lists, the September 15, 2026 revisions and the September 29, 2026 import bans name none. China: List 2 (note 20(d)) covers 189 lines, '
    'List 3 (note 20(f)) 75 and List 4A (note 20(s)) 30; no List 1 line and no 2024 increase (note 31) reaches Chapter 39; nine note 20(vvv) '
    'exclusions run to November 9, 2026. Section 232: no Chapter 39 subheading is on the note 16 or 19 metal lists, the note 33(g) automobile-parts '
    'list or the note 38 truck-parts list. Note 30(b) sets 35% in place of column 2 for 26 Russian subheadings. A Federal Register search of '
    'Commerce (ITA) notices, cross-checked with the monthly "Opportunity To Request Administrative Review" lists from October 2025 to October '
    '2026, found AD/CVD orders on 12 Chapter 39 products (listed on Tariff updates).'
)

# ---------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = 'HTS Chapter 39: Plastics & Articles of Plastics — Import Rules & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Plastics into the U.S.: TSCA Certification, FDA Food-Contact Rules, AD/CVD Scope & Legal Ways to Lower Duty (HTS Ch. 39) | KoalaGains',
    'shortDescription': 'What each HTS Chapter 39 line needs at U.S. entry — TSCA certification for resins, FDA food-contact rules for packaging '
    'and tableware, CPSC rules for children\'s products, UFLPA tracing for PVC, AD/CVD deposits — and the legal ways to pay less: classification, '
    'origin, USMCA, the pharmaceutical-use and civil-aircraft exemptions, China exclusions, first sale, drawback and FTZ.',
    'keywords': [
        'tsca import certification',
        'plastic resin import requirements',
        'fda food contact plastics import',
        'pvc uflpa',
        'first-sale-for-export valuation',
        'usmca plastics rules of origin',
        'section 301 pharmaceutical use exemption',
        'cbp tariff engineering',
        'hts chapter 39 tariff engineering',
    ],
}
te['intro'] = (
    'Plastics need few licenses, but three rules decide whether a shipment clears smoothly. **Resins and other polymers in bulk** (3901–3914) are '
    'chemical substances under TSCA: the importer must certify to CBP that they comply with TSCA, or that they are not subject to it. **Food-contact '
    'plastics** — bottles, closures, containers, tableware, packaging film — must be made only of substances FDA allows. And **PVC products from '
    'China** are a forced-labor high-priority sector, so CBP can hold them until the importer traces the supply chain back to the resin. Products '
    'covered by an **antidumping or countervailing duty order** also need a cash deposit at entry.\n\n'
    'On cost, the base rate is small (Free to 6.5%) and the extra duty by country is large, so the levers that matter are the ones that change '
    'the country or the Chapter 99 treatment: the **country of origin** (+37.5% China, +12.5% Vietnam, 10% in total EU), **USMCA**, the '
    '**pharmaceutical-use** and **civil-aircraft** exemptions from the 2026 Section 301 duty, the **China product exclusions**, plus first-sale '
    'valuation, drawback and foreign-trade zones. Each lever depends on a document, listed below with its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = ECFR_DATE
CH99_LABEL = 'HTSUS Ch. 99, subch. III, U.S. notes 20, 50–52'
te['levers'] = [
    {
        'id': 'classify',
        'title': 'Classify correctly: primary form or article, polymer and form',
        'saves': 'The gap between line rates (Free to 6.5%) and, more often, between China lists: List 2 or 3 (+25%), List 4A (+7.5%) or no list',
        'appliesTo': 'All lines — for example resin (3901–3914) versus compound or article, film (3920) versus self-adhesive film (3919) or foam '
        '(3921), tableware (3924.10) versus packaging (3923)',
        'document': 'Technical data: polymer composition by weight, form (pellets, powder, liquid, sheet, article), cellular or not, adhesive or not, '
        'and use.',
        'caveat': 'Chapter note 4 classifies copolymers by the predominant comonomer, note 6 defines primary forms and note 10 limits 3920–3921 to '
        'flat products; a printed article may be Chapter 49 (section VII note 2). The declared line must match the goods; a ruling settles doubtful '
        'cases.',
        'citations': [
            {'label': 'HTSUS Chapter 39 notes 1–11 and subheading note 1', 'url': CH39},
            {'label': '19 CFR part 177 (rulings)', 'url': ecfr_part(19, 177)},
        ],
    },
    {
        'id': 'origin',
        'title': 'Know the country of origin — and where a plastic article gets it',
        'saves': 'The difference between country rates: 10% in total for the EU or Taiwan, +12.5% for Vietnam, +37.5% for most Chinese plastics',
        'appliesTo': 'All lines; the gap is widest on Chinese film, flooring, packaging and bags',
        'document': 'Production records showing where the resin was polymerized and where the article was molded, extruded or converted.',
        'caveat': 'The Section 301 and 338 duties follow the country of origin: the country where the article was last substantially transformed. '
        'Repacking, cutting to length or printing may not change origin; CBP can ask for proof, and AD/CVD orders can reach goods finished in a third '
        'country.',
        'citations': [
            {'label': '19 CFR 134.1 (country of origin)', 'url': ecfr(19, '134.1')},
            {'label': CH99_LABEL, 'url': CH99},
        ],
    },
    {
        'id': 'usmca',
        'title': 'Claim USMCA on goods from Mexico or Canada',
        'saves': 'The base rate (up to 6.5%) plus the 10% Section 301 duty',
        'appliesTo': 'All lines from Mexico; from Canada, the lines not on the Section 338 list — all resins, polyethylene and PET film, pipe and '
        'most articles',
        'document': 'A certification of origin from the importer, exporter or producer, kept ready for CBP.',
        'caveat': 'USMCA does not remove the 50% Section 338 duty on the 20 Canadian subheadings in U.S. note 51(b)(3). The good must meet the '
        'Chapter 39 rule of origin in General Note 11. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
        'citations': [
            {'label': '19 CFR 182.12', 'url': ecfr(19, '182.12')},
            {'label': 'HTSUS General Note 11 (USMCA rules of origin)', 'url': GN},
            {'label': 'HTSUS 9903.05.93 / 9903.05.94, U.S. notes 51–52', 'url': CH99},
        ],
    },
    {
        'id': 'pharma-use',
        'title': 'Claim the pharmaceutical-use exemption for resins',
        'saves': 'The 10%–12.5% 2026 Section 301 duty (9903.05.89) and the 25% Brazil duty (9903.05.06)',
        'appliesTo': 'The 32 resin subheadings in note 52(e) — 3901.90.90, 3902.90.00, PTFE 3904.61.00, vinyl polymers of 3905.91–3905.99, '
        '3906.90.50, most of 3907 (including epoxy 3907.30 and PET 3907.61), nylon 3908, 3909.10, 3909.40, silicones 3910, 3911.20–3911.90, '
        '3912.20–3912.90, 3913.90 and 3914.00 — when they are for use in pharmaceutical applications',
        'document': 'Evidence of the pharmaceutical end use (for example the buyer\'s use declaration and supply contract); report 9903.05.89 '
        'instead of the country heading.',
        'caveat': 'Only for goods actually used in pharmaceutical applications; it does not remove the China Section 301 list duties or AD/CVD.',
        'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. notes 52(e), 50(a)(v)', 'url': CH99}],
    },
    {
        'id': 'civil-aircraft',
        'title': 'Claim the civil-aircraft exemptions',
        'saves': 'The 2026 Section 301 duty (9903.05.88), the Brazil duty (9903.05.05) and the Canada Section 338 duty (9903.03.16)',
        'appliesTo': 'Tubes, pipes and hoses of 3917.21–3917.40 and gaskets and other articles of 3926.90.45, 3926.90.94, 3926.90.96 and '
        '3926.90.99 that are civil aircraft parts',
        'document': 'Proof that the goods meet general note 6 (certified for use in civil aircraft), and the matching Chapter 99 heading.',
        'caveat': 'Only for civil aircraft (not military or unmanned) articles that meet general note 6.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. notes 51(d), 52(d), 50(a)(iv)', 'url': CH99},
            {'label': 'HTSUS General Note 6', 'url': GN},
        ],
    },
    {
        'id': 'cn-exclusion',
        'title': 'Use a China Section 301 product exclusion',
        'saves': 'The 25% List 2 or 3 duty, or the 7.5% List 4A duty, on matching Chinese goods',
        'appliesTo': '3906.90.50.00 (AA/AMPS terpolymers), 3913.10.00.00 (sodium alginate resins), 3919.10.20.55 and 3919.90.50.40/.60 '
        '(polyethylene film with acrylic adhesive), 3920.62.00.90 (PVdC- or PVOH-coated film), 3923.21.00.95 (other polyethylene bags), '
        '3923.50.00.00 (PLA stopper-stirrers), 3926.90.99.15/.20 (laboratory ware), 3926.90.99.89 (sterile drapes and decanters)',
        'document': 'Product specifications showing the goods match the exclusion description; report 9903.88.69 instead of the list heading.',
        'caveat': 'In effect through November 9, 2026 unless USTR extends them. The 12.5% 2026 Section 301 duty (9903.05.31) still applies.',
        'citations': [
            {'label': 'HTSUS Ch. 99, subch. III, U.S. note 20(vvv), 9903.88.69', 'url': CH99},
            {'label': '90 FR 55232 (exclusions extended to November 9, 2026)', 'url': src('fr-2025-21671')['url']},
        ],
    },
    {
        'id': 'first-sale',
        'title': 'Value at the first sale for export when you buy through a middleman',
        'saves': 'Every ad valorem duty is charged on a lower value — the base rate, the Section 301 and 338 duties and AD/CVD deposits included — when '
        'the factory price to a trading company is lower than the price you pay',
        'appliesTo': 'All lines bought through a trading company or agent rather than straight from the resin maker or molder',
        'document': 'Proof that the first sale was a bona fide sale for export to the United States at arm\'s length: the factory invoice, contracts '
        'and payment records.',
        'caveat': 'Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.',
        'citations': [{'label': '19 CFR 152.103', 'url': ecfr(19, '152.103')}],
    },
    {
        'id': 'drawback',
        'title': 'Recover duty on goods you export or use to make exports',
        'saves': 'Up to 99% of the duties paid, when the imported resin or film (or goods made from it) is exported or destroyed',
        'appliesTo': 'Any line — for example resin molded into parts that are exported, or packaging film used on exported goods',
        'document': 'A drawback claim to CBP with import, manufacturing and export records.',
        'caveat': 'Claims have filing deadlines and record-keeping rules; check whether a given Chapter 99 duty or AD/CVD duty is eligible before '
        'relying on it.',
        'citations': [{'label': '19 CFR part 190', 'url': ecfr_part(19, 190)}],
    },
    {
        'id': 'ftz',
        'title': 'Process or hold goods in a foreign-trade zone',
        'saves': 'No duty on goods re-exported from the zone, and duty deferred until goods leave it for the U.S. market',
        'appliesTo': 'Any line — useful for resin compounders and converters that export part of their output',
        'document': 'Zone admission (CBP Form 214) and the zone operator\'s inventory records.',
        'caveat': 'Goods entered for U.S. consumption from a zone pay the duties in force on the entry date; TSCA and FDA rules still apply.',
        'citations': [{'label': '19 CFR part 146', 'url': ecfr_part(19, 146)}],
    },
    {
        'id': 'ch98',
        'title': 'Use a Chapter 98 provision for U.S. goods coming back',
        'saves': 'All duty on U.S.-made goods returned unchanged (9801.00.10), for example returned pallets of U.S. resin or rejected U.S. packaging',
        'appliesTo': 'Any line, for American goods returned without having been advanced in value or improved abroad',
        'document': 'Proof of U.S. origin and of the export, as CBP requires for the provision.',
        'caveat': 'The Section 301 and 338 duties also do not apply to goods properly entered under Chapter 98, except subchapter XXIII and '
        '9802.00.40–9802.00.80 (U.S. notes 51(a) and 52(a)).',
        'citations': [
            {'label': 'HTSUS Chapter 98, 9801.00.10', 'url': CH98},
            {'label': '19 CFR 10.1', 'url': ecfr(19, '10.1')},
        ],
    },
    {
        'id': 'ruling',
        'title': 'Get a binding classification ruling',
        'saves': 'Certainty where the line decides the rate, the China list and AD/CVD scope: compound versus resin, film versus foam, a bag on or off '
        'the carrier-bag order, a Canadian article on or off the Section 338 list',
        'appliesTo': 'Any line where composition, form or use decides the line',
        'document': 'A ruling request to CBP describing the article, its polymer content, form and use. AD/CVD scope questions go to Commerce.',
        'caveat': 'Rulings apply to the transaction described; a changed formulation may need a new one. CBP rulings do not decide AD/CVD scope.',
        'citations': [
            {'label': '19 CFR part 177', 'url': ecfr_part(19, 177)},
            {'label': '19 CFR 351.225 (AD/CVD scope rulings)', 'url': ecfr(19, '351.225')},
        ],
    },
]
te['rules'] = [
    {
        'id': 'tsca',
        'agency': 'EPA / CBP',
        'title': 'Resins and other polymers in bulk are TSCA chemical substances: before release the importer files a positive certification (they '
        'comply with TSCA) or a negative one (not subject to TSCA). Plastic articles need it only if a TSCA rule requires',
        'citations': [
            {'label': '19 CFR 12.121', 'url': ecfr(19, '12.121')},
            {'label': '40 CFR 707.20', 'url': ecfr(40, '707.20')},
            {'label': '15 U.S.C. 2612 (TSCA section 13)', 'url': 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap53-subchapI-sec2612.htm'},
        ],
    },
    {
        'id': 'fda-food',
        'agency': 'FDA',
        'title': 'Food-contact plastics (bottles, closures, containers, tableware, packaging) must be made only of substances FDA permits — for '
        'example olefin polymers meeting 21 CFR 177.1520. Food contact substances are outside FDA prior notice',
        'citations': [
            {'label': '21 CFR 174.5', 'url': ecfr(21, '174.5')},
            {'label': '21 CFR part 177', 'url': ecfr_part(21, 177)},
            {'label': '21 CFR 1.276 (prior notice definitions)', 'url': ecfr(21, '1.276')},
        ],
    },
    {
        'id': 'cpsc-children',
        'agency': 'CPSC',
        'title': 'Plastic products designed for children 12 or younger need third-party testing and a Children\'s Product Certificate, eFiled with the '
        'entry; child care articles (feeding and sleep items for children 3 or younger) may not contain the restricted phthalates',
        'citations': [
            {'label': '16 CFR 1110.13 (certificate eFiling)', 'url': ecfr(16, '1110.13')},
            {'label': '16 CFR 1307.3 (phthalates)', 'url': ecfr(16, '1307.3')},
        ],
    },
    {
        'id': 'fda-device',
        'agency': 'FDA',
        'title': 'Plastic medical articles — surgical and exam gloves, face shields and masks, medical pads, sterile drapes — are medical devices: '
        'the foreign maker must register and list them with FDA',
        'citations': [{'label': '21 CFR 807.40', 'url': ecfr(21, '807.40')}],
    },
    {
        'id': 'uflpa-pvc',
        'agency': 'CBP',
        'title': 'UFLPA: goods made wholly or in part in Xinjiang or by a company on the UFLPA Entity List are presumed made with forced labor and '
        'excluded. PVC is a high-priority sector: CBP asks for records tracing PVC products back to the ethylene and chlorine',
        'citations': [
            {'label': 'P.L. 117-78 (UFLPA)', 'url': src('pl-117-78')['url']},
            {'label': 'CBP forced labor operational guidance (PVC, Appendix A)', 'url': src('cbp-fl-guidance')['url']},
            {'label': 'DHS UFLPA Entity List', 'url': 'https://www.dhs.gov/uflpa-entity-list'},
        ],
    },
    {
        'id': 'adcvd-resins',
        'agency': 'Commerce / CBP',
        'title': 'Resin AD/CVD orders: PET resin (Canada, China, India, Oman; CVD China, India), polyvinyl alcohol (China, Japan), granular PTFE '
        '(India, Russia, AD and CVD), epoxy resins (Korea, Taiwan, Thailand; CVD Korea, Taiwan), acrylate monomers and oligomers (Taiwan AD and CVD, '
        'Korea AD). Cash deposits at entry; PTMEG and PFA are under investigation',
        'citations': [
            {'label': '19 CFR 351.211', 'url': ecfr(19, '351.211')},
            {'label': '87 FR 21871 (PET resin)', 'url': src('ad-pet-resin')['url']},
            {'label': '91 FR 59109 (PVA)', 'url': src('ad-pva')['url']},
            {'label': '87 FR 14514 (PTFE)', 'url': src('ad-ptfe')['url']},
            {'label': '90 FR 22237 (epoxy)', 'url': src('ad-epoxy')['url']},
        ],
    },
    {
        'id': 'adcvd-film-bags',
        'agency': 'Commerce / CBP',
        'title': 'Film and bag AD/CVD orders: PET film (China, India, Taiwan, UAE; CVD India), polyethylene retail carrier bags (China, Indonesia, '
        'Malaysia, Taiwan, Thailand, Vietnam; CVD Vietnam), laminated woven sacks (China, Vietnam, AD and CVD), plastic decorative ribbon (China, AD '
        'and CVD)',
        'citations': [
            {'label': '19 CFR 351.211', 'url': ecfr(19, '351.211')},
            {'label': '91 FR 14815 (PET film)', 'url': src('ad-pet-film')['url']},
            {'label': '86 FR 59366 (carrier bags)', 'url': src('ad-prcb')['url']},
            {'label': '90 FR 10809 (woven sacks, China)', 'url': src('ad-lws-cn')['url']},
            {'label': '89 FR 84865 (ribbon)', 'url': src('ad-ribbon')['url']},
        ],
    },
    {
        'id': 'adcvd-articles',
        'agency': 'Commerce / CBP',
        'title': 'Article AD/CVD orders: polypropylene corrugated boxes (China AD and CVD, Vietnam AD), fiberglass door panels (China, AD and CVD), '
        'biaxial integral geogrids (China, AD and CVD)',
        'citations': [
            {'label': '19 CFR 351.211', 'url': ecfr(19, '351.211')},
            {'label': '91 FR 12572 (PP boxes, China)', 'url': src('ad-ppbox-cn')['url']},
            {'label': '91 FR 50797 (door panels)', 'url': src('ad-door')['url']},
            {'label': '87 FR 61565 (geogrids)', 'url': src('ad-geogrid')['url']},
        ],
    },
    {
        'id': 'cbp-marking',
        'agency': 'CBP',
        'title': 'Country-of-origin marking in English, legible and permanent, on the article or, where the article cannot be marked, its container; '
        'bulk resin is marked on its bags or containers',
        'citations': [{'label': '19 CFR 134.11', 'url': ecfr(19, '134.11')}],
    },
    {
        'id': 'cbp-ch99',
        'agency': 'CBP',
        'title': 'Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or its exemption), the China list '
        'heading (9903.88.02, .03 or .15) or its exclusion (9903.88.69), Brazil (9903.05.01), Canada Section 338 (9903.03.14)',
        'citations': [
            {'label': CH99_LABEL, 'url': CH99},
            {'label': 'CBP CSMS # 69326983 (Section 301 guidance)', 'url': src('csms-69326983')['url']},
            {'label': 'CBP CSMS # 69606660 (Section 338 guidance)', 'url': src('csms-69606660')['url']},
        ],
    },
]
RULE_IDS = {r['id'] for r in te['rules']}
LEVER_IDS = {l['id'] for l in te['levers']}

PHARMA_SUB = {
    '39019090', '39029000', '39046100', '39059110', '39059150', '39059980', '39069050', '39071000', '39072100', '39072900', '39073000',
    '39076100', '39076900', '39077000', '39079950', '39081000', '39089020', '39091000', '39094000', '39100000', '39112000', '39119025',
    '39119045', '39119091', '39122000', '39123100', '39123900', '39129000', '39139020', '39139050', '39140020', '39140060',
}
AIR_SUB = {'39172100', '39172200', '39172300', '39172900', '39173100', '39173300', '39173900', '39174000', '39269045', '39269094', '39269096', '39269099'}
EXCL10 = {'3906905000', '3913100000', '3919102055', '3919905040', '3919905060', '3920620090', '3923210095', '3923500000', '3926909915', '3926909920', '3926909989'}
ADCVD_RESIN10 = {'3907610010', '3907610050', '3905300000', '3904610010', '3907300000', '3907290000'}
ADCVD_FILM10 = {'3920620020', '3920620050', '3920620090', '3923210085', '3923210080', '3923210095', '3923290000', '3921901100', '3921901500', '3917390050', '3920200015', '3926400010'}
ADCVD_ART10 = {'3923109000', '3925200010', '3926909989', '3925900000'}
rows = {r['hts']: r for r in ov['rateTable']['rows'] if r['hts']}


def pvc(r):
    t = (' '.join(r['ancestorPath']) + ' ' + r['description']).lower()
    return 'vinyl chloride' in t or 'polyvinyl chloride' in t or 'vinyl tile' in t


for ln in te['lines']:
    r = rows[ln['hts']]
    c10 = r['htsCode10']
    c8 = c10[:8]
    h = c10[:4]
    rules = []
    if h <= '3914':
        rules.append('tsca')
    if h == '3923' or c10.startswith('39241') or c10.startswith('39201') or c10.startswith('39202'):
        rules.append('fda-food')
    if h == '3924':
        rules.append('cpsc-children')
    if c10 in ('3926201010', '3926909950', '3926909989'):
        rules.append('fda-device')
    if pvc(r):
        rules.append('uflpa-pvc')
    if c10 in ADCVD_RESIN10:
        rules.append('adcvd-resins')
    if c10 in ADCVD_FILM10:
        rules.append('adcvd-film-bags')
    if c10 in ADCVD_ART10:
        rules.append('adcvd-articles')
    rules += ['cbp-marking', 'cbp-ch99']
    levers = ['classify', 'origin', 'usmca']
    if c8 in PHARMA_SUB:
        levers.append('pharma-use')
    if c8 in AIR_SUB:
        levers.append('civil-aircraft')
    if c10 in EXCL10:
        levers.append('cn-exclusion')
    levers += ['first-sale', 'drawback', 'ftz', 'ch98', 'ruling']
    assert set(rules) <= RULE_IDS and set(levers) <= LEVER_IDS
    ln['ruleIds'] = rules
    ln['leverIds'] = levers

GROUP_NOTES = {
    '3901': 'TSCA certification at entry. Polyethylene is 6.5% (EVA 5.3%; elastomeric 3901.90.10 and the terpolymers of 3901.30.20 Free); Canada, the main supplier, is Free under USMCA and off the Section 338 list.',
    '3902': 'TSCA certification at entry. 6.5%; elastomeric polyisobutylene (3902.20.10) Free. Russian polypropylene pays 35% in place of column 2.',
    '3903': 'TSCA certification at entry. All 6.5%. No AD/CVD order.',
    '3904': 'TSCA certification at entry. PVC is a UFLPA high-priority sector. Granular PTFE (3904.61.00.10) from India and Russia carries AD and CVD duties; PFA (3904.69.50) from India is under investigation.',
    '3905': 'TSCA certification at entry. Polyvinyl alcohol (3905.30) from China and Japan carries antidumping duties.',
    '3906': 'TSCA certification at entry. 3906.90.50 is on the pharmaceutical-use list and has a China exclusion for AA/AMPS terpolymers.',
    '3907': 'TSCA certification at entry. AD/CVD on PET resin (3907.61), epoxy resins (3907.30) and acrylate oligomers (3907.29, 3907.30); PTMEG (3907.29) under investigation. Most subheadings are on the pharmaceutical-use list.',
    '3908': 'TSCA certification at entry. Both nylon subheadings are on the pharmaceutical-use list.',
    '3909': 'TSCA certification at entry. 3909.31 and 3909.39 (MDI-type polyurethanes) are on China List 3, the rest on List 2.',
    '3910': 'TSCA certification at entry. 3%; on the pharmaceutical-use list.',
    '3911': 'TSCA certification at entry. Free to 6.5%.',
    '3912': 'TSCA certification at entry. Cellulose acetates and ethers, 4.2%–6.4%.',
    '3913': 'TSCA certification at entry. Sodium alginate resins from China are excluded from List 4A through November 9, 2026.',
    '3914': 'TSCA certification at entry. Free or 3.9%.',
    '3915': 'All Free. China List 3 adds 25%.',
    '3916': 'PVC profiles fall under the UFLPA PVC sector. Russian 3916 goods pay column 2.',
    '3917': 'PVC pipe and hose fall under the UFLPA PVC sector. Civil-aircraft hoses and tubes (3917.21–3917.40) qualify for the Section 301, Brazil and Canada exemptions.',
    '3918': 'PVC flooring is named in CBP\'s PVC tracing guidance. Vinyl tile (3918.10.10) from Canada pays the 50% Section 338 duty.',
    '3919': 'Two polyethylene adhesive films from China are excluded from List 2 through November 9, 2026. 3919.10.20 and 3919.90.50 from Canada are on the Section 338 list.',
    '3920': 'Food-contact packaging film must meet FDA rules. PET film (3920.62) carries AD/CVD duties; polypropylene film (3920.20) from Canada is on the Section 338 list.',
    '3921': 'Foam and other sheet; 3921.19 and 3921.90.50 from Canada are on the Section 338 list.',
    '3922': 'All 6.3%. Baths, sinks and toilet seats are on China List 4A (+7.5%), other sanitary ware on List 3.',
    '3923': 'Food-contact packaging must meet FDA rules. Carrier bags (3923.21.00.85) and PP corrugated boxes (3923.10.90) carry AD/CVD duties; most 3923 lines from Canada pay the 50% Section 338 duty.',
    '3924': 'Food-contact tableware must meet FDA rules; children\'s items need CPSC certification. 3924.10.20, 3924.10.40 and 3924.90.56 from Canada are on the Section 338 list.',
    '3925': 'Fiberglass door panels (3925.20.00.10) from China carry AD and CVD duties since August 6, 2026.',
    '3926': 'Medical gloves, face shields and drapes are FDA devices. Civil-aircraft gaskets and articles (3926.90.45–.99) qualify for the aircraft exemptions; 3926.10, 3926.30, 3926.40 and 3926.90.99 from Canada are on the Section 338 list.',
}
for g in te['groups']:
    h = g['heading']
    g['label'] = LABELS[h][0]
    g['note'] = GROUP_NOTES[h]
    ids = []
    for ln in te['lines']:
        if ln['hts'].replace('.', '').startswith(h):
            for rid in ln['ruleIds']:
                if rid not in ids:
                    ids.append(rid)
    g['ruleIds'] = ids
te['disclaimer'] = (
    'A checklist of where the rules are, with links to the regulations and the tariff schedule — not legal advice. Which line a plastic falls in, '
    'whether a product is inside an antidumping or countervailing duty order, and which Chapter 99 duties apply depend on the facts of each '
    'shipment, and the extra duties change by Federal Register notice and CBP guidance; confirm the current headings, AD/CVD cash-deposit rates and '
    'the TSCA and FDA requirements before each shipment.'
)

# ---------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = 'HTS Chapter 39: Plastics & Articles of Plastics — Tariff FAQ'
fc['seo'] = {
    'title': 'Plastic Tariffs FAQ 2026: China, Canada, Resin, PET, Bags & HS Codes for Plastics (HTS Ch. 39) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on plastics: tariffs on plastic from China and Canada, plastic resin and '
    'PET tariffs, antidumping duties on PET resin and plastic bags, and the HS codes for plastic bags, plastic parts (3926.90), containers (3923), '
    'tableware (3924), film, PVC and polyethylene.',
    'keywords': [
        'tariffs on plastic',
        'are there tariffs on plastic',
        'tariffs on plastic from china',
        'plastics tariffs canada',
        'tariffs on plastic resin',
        'tariffs on pet plastic',
        'pet resin anti dumping',
        'hs code for plastic bags',
        'hs code 3926.90',
        'hs code 3923',
        'hs code 3924',
        'hs code for plastic film',
        'hs code for pvc',
        'polyethylene tariff code',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for plastic resins, film, bags, packaging and other plastic '
    'products. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Base rates are low: 33 of the 319 Chapter 39 lines are Free and none is above 6.5% — most resins 6.5%, film 4.2%, bags and bottles 3%, '
    'plastic articles 5.3%.',
    'Since July 24, 2026 a Section 301 duty is added by country: +10% for India, the UK and non-USMCA goods from Canada and Mexico, +12.5% for '
    'Vietnam and Thailand, and a fixed total of 10% for the EU and Taiwan and 12.5% for Korea and Japan.',
    'China pays the most: +12.5% plus +25% on its List 2 and 3 goods (resins, film, flooring, packaging, bags) — up to 44% — and +7.5% on List 4A '
    'goods; USTR continued the lists on October 7, 2026.',
    'USMCA-qualifying goods from Mexico pay nothing. From Canada, 20 subheadings — plastic bags, bottles, closures, tableware, vinyl tile, PP film '
    'and others — pay a 50% Section 338 duty even under USMCA; resins are not on the list.',
    'Antidumping and countervailing duty orders cover 12 plastics products, among them PET resin, PET film, polyethylene carrier bags, epoxy, PVA, '
    'PTFE, polypropylene corrugated boxes and fiberglass door panels; PTMEG and PFA are under investigation.',
    'The IEEPA duties ended February 24, 2026 and the 10% Section 122 surcharge on July 23, 2026. Resins need a TSCA certification at entry, '
    'food-contact plastics must meet FDA rules, and Chinese PVC goods face forced-labor tracing.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'
fc['faqs'] = [
    {
        'id': 'hts-chapter-39',
        'question': 'What is HTS Chapter 39?',
        'searchedAs': ['hts chapter 39', 'htsus chapter 39', 'us hts chapter 39', 'hts code chapter 39', 'chapter 39 hts 2026', 'plastic tariff code'],
        'answer': 'Chapter 39 of the Harmonized Tariff Schedule of the United States, "Plastics and Articles Thereof", covers plastics in primary '
        'forms (resins such as polyethylene, polypropylene, PVC, PET and epoxy, headings 3901–3914) and articles of plastics (scrap, pipes, '
        'flooring, tape, film and sheet, packaging, bags, tableware, builders\' ware and other articles, headings 3915–3926). The 2026 Revision 21 '
        'has 319 tariff lines with base rates from Free to 6.5%.',
        'link': '',
    },
    {
        'id': 'plastic-tariffs',
        'question': 'Are there tariffs on plastic imported into the U.S. in 2026?',
        'searchedAs': ['tariffs on plastic', 'are there tariffs on plastic', 'us tariffs on plastics', 'us tariffs on plastic products', 'tariffs on plastic products', 'trump tariffs on plastic'],
        'answer': 'Yes. Every Chapter 39 line has a base rate of Free to 6.5%, and since July 24, 2026 a Section 301 duty is added for 60 economies: '
        '+10% for India, the UK and non-USMCA goods from Canada and Mexico, +12.5% for Vietnam and Thailand, 10% in total for the EU and Taiwan, '
        '12.5% in total for Korea and Japan, and +12.5% plus up to +25% for China. USMCA-qualifying goods from Mexico pay nothing; 20 Canadian '
        'subheadings pay a 50% Section 338 duty. The 2025 IEEPA tariffs ended February 24, 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'china-plastic',
        'question': 'What are the tariffs on plastic from China?',
        'searchedAs': ['tariffs on plastic from china', 'tariff on plastic from china', 'plastic tariffs china', 'china plastic tariffs'],
        'answer': 'Chinese plastics pay the base rate plus 12.5% (2026 Section 301, 9903.05.31) plus their 2018–2019 list duty: +25% on List 2 '
        'resins, film, sheet and tape and on List 3 scrap, flooring, packaging, bags and bottles, +7.5% on List 4A goods such as plates and cups. '
        'That is 44% on PVC or polyethylene resin, 41.7% on polyethylene film, 42.8% on vinyl flooring, 40.5% on plastic bags, 26.5% on plastic '
        'plates and 15.9% on food storage containers (on no list). AD/CVD duties add more on PET resin, PET film, carrier bags, PVA and other '
        'products. China supplied $16.87B in 2025, 21.6% less than in 2024.',
        'link': 'industry-areas',
    },
    {
        'id': 'canada-plastic',
        'question': 'What are the U.S. tariffs on plastics from Canada?',
        'searchedAs': ['plastics tariffs canada', 'canada plastic tariffs', 'us tariffs on canadian plastic'],
        'answer': 'USMCA-qualifying plastics from Canada pay no base rate and no Section 301 duty, so Canadian polyethylene and other resins enter '
        'free. But 20 Chapter 39 subheadings — polyethylene bags, bottles, closures, boxes, tableware, vinyl tile, polypropylene film, foam sheet, '
        'tape, office supplies and other articles — pay a 50% Section 338 duty since August 22, 2026, even under USMCA. Non-qualifying goods pay '
        'the base rate plus 10%, and 50% more on the listed lines. Canadian PET resin also carries an antidumping duty.',
        'link': 'industry-areas',
    },
    {
        'id': 'resin-tariffs',
        'question': 'What are the tariffs on plastic resin?',
        'searchedAs': ['tariffs on plastic resin', 'plastic resin tariffs', 'polyethylene tariffs', 'poly tariffs'],
        'answer': 'Most resins (polyethylene, polypropylene, PVC, polystyrene, PET) have a 6.5% base rate; PTFE is 5.8%, PVA 3.2%, silicones 3%. On '
        'top: +37.5% for China (List 2), 12.5% in total for Korea and Japan, 10% in total for EU and Taiwanese resin, +12.5% for Thailand, +10% '
        'for India, and nothing for USMCA-qualifying resin from Canada or Mexico. Resins used in pharmaceutical applications are exempt from the '
        '2026 Section 301 duty (9903.05.89), and AD/CVD orders cover PET resin, PVA, PTFE, epoxy and acrylate oligomers from named countries.',
        'link': 'industry-areas',
    },
    {
        'id': 'pet-antidumping',
        'question': 'Are there antidumping duties on PET resin and PET plastic?',
        'searchedAs': ['pet resin anti dumping', 'tariffs on pet plastic', 'polyethylene terephthalate tariff', 'polyethylene terephthalate tariff code'],
        'answer': 'Yes. PET bottle resin (3907.61, 6.5%) from Canada, China, India and Oman is under antidumping orders, and from China and India '
        'under countervailing duty orders, continued in April 2022. PET film, sheet and strip (3920.62, 4.2%) from China, India, Taiwan and the UAE '
        'is under antidumping orders and Indian PET film under a countervailing duty order, continued March 27, 2026. The PET sheet order on Korea '
        'was revoked from September 10, 2025. Cash-deposit rates are set per exporter and come on top of the base rate and Section 301 duty.',
        'link': 'tariff-updates',
    },
    {
        'id': 'plastic-bags',
        'question': 'What is the HS code and tariff for plastic bags?',
        'searchedAs': ['hs code for plastic bags', 'hts code for plastic bags', 'hs code for poly bags', 'hs code for polyethylene bags', 'plastic bags tariff code', 'polyethylene bag tariff code', 'tariff for plastic bags'],
        'answer': 'Sacks and bags of polyethylene are 3923.21 and of other plastics 3923.29, both 3%; polyethylene retail carrier bags with handles '
        'are 3923.21.00.85. Retail carrier bags from China, Indonesia, Malaysia, Taiwan, Thailand and Vietnam carry antidumping duties (Vietnam also '
        'countervailing). Chinese bags pay 40.5% (3% + 12.5% + 25% List 3) before AD duty, Vietnamese 15.5%, and Canadian bags 50% even under USMCA.',
        'link': '',
    },
    {
        'id': 'hs-3926',
        'question': 'What is HS code 3926.90 and what is the tariff on plastic parts?',
        'searchedAs': ['hs code 3926.90', 'hts code 3926.90', 'hs code 3926', 'hts code for plastic parts', 'tariff code for plastic parts', 'hts code for plastic molded parts'],
        'answer': '3926.90 covers other articles of plastics not specified elsewhere in Chapter 39 — molded parts, clips, cable ties, gaskets, '
        'laboratory ware, face shields; most fall in 3926.90.99 at 5.3%. Parts of machines, vehicles or instruments are classified with those goods '
        '(chapter note 2), not here. A 3926.90.99 article pays 15.3% from India or the UK, 17.8% from Vietnam, 10% from the EU, 25.3% from China '
        '(List 4A) and 50% from Canada even under USMCA (Section 338). It was the largest Chapter 39 import, $11.23B in 2025.',
        'link': '',
    },
    {
        'id': 'hs-3923',
        'question': 'What is HS code 3923?',
        'searchedAs': ['hs code 3923', 'hs code 3923.90', 'hs code 3923.10', 'hs code 3923.30', 'hs code for plastic containers', 'hts code for plastic bottles', 'hs code for plastic packaging'],
        'answer': 'Heading 3923 covers articles for the conveyance or packing of goods: boxes, cases and crates (3923.10, 3%), sacks and bags '
        '(3923.21, 3923.29, 3%), bottles and similar containers (3923.30, 3%), spools (3923.40, 5.3%), caps, lids and closures (3923.50, 5.3%) and '
        'other packaging (3923.90, 3%). Polypropylene corrugated boxes (3923.10.90) from China and Vietnam and carrier bags carry AD/CVD duties. '
        'Food-contact packaging must meet FDA rules.',
        'link': '',
    },
    {
        'id': 'hs-3924',
        'question': 'What is HS code 3924 for plastic tableware and household articles?',
        'searchedAs': ['hs code 3924.10', 'hs code 3924', 'hs code 3924.90', 'hts code 3924.10', 'hts code 3924.90', 'hts code for plastic cups'],
        'answer': '3924.10 is plastic tableware and kitchenware — plates, cups and bowls 6.5% (3924.10.20), trays 5.3%, dispensers and other items '
        '3.4% (3924.10.40) — and 3924.90 other household and toilet articles such as shower curtains, hangers and bathroom articles (3.1%–3.4%). '
        'From China plates and cups pay 26.5% (List 4A) and other kitchenware 15.9%. Food-contact items must meet FDA rules; children\'s items need '
        'a CPSC certificate.',
        'link': '',
    },
    {
        'id': 'hs-film',
        'question': 'What is the HS code for plastic film and sheet?',
        'searchedAs': ['hs code for plastic film', 'hs code for plastic sheet', 'hs code for polyethylene film', 'hs code for plastic wrap', 'hs code 3920', 'hs code 3920.10'],
        'answer': 'Non-cellular, unreinforced film and sheet are heading 3920: polyethylene film 3920.10 (4.2%), polypropylene 3920.20 (4.2%), PVC '
        '3920.43–3920.49 (3.1%–5.8%), acrylic sheet 3920.51, polycarbonate 3920.61 (5.8%) and PET 3920.62 (4.2%). Self-adhesive film and tape are '
        '3919, and foam or reinforced sheet 3921. Chinese film and sheet pay 37.5%–44% (List 2); PET film from China, India, Taiwan and the UAE also carries '
        'AD duties.',
        'link': '',
    },
    {
        'id': 'hs-pvc',
        'question': 'What is the HS code for PVC?',
        'searchedAs': ['hs code for pvc', 'hs code for pvc pipe', 'hs code for pvc resin', 'hs code for pvc flooring', 'hs code for pvc film', 'hs code for pvc sheet'],
        'answer': 'PVC resin not mixed with other substances is 3904.10 (6.5%), plasticized or mixed PVC 3904.21–3904.22. Rigid PVC pipe is '
        '3917.23 (3.1%), PVC profiles 3916.20 (5.8%), PVC flooring 3918.10 (4.2%–6.5%; vinyl tile 3918.10.10, 5.3%) and PVC film and sheet '
        '3920.43–3920.49. PVC is a UFLPA high-priority sector, so CBP can ask importers of Chinese PVC goods to trace the supply chain to the resin.',
        'link': '',
    },
    {
        'id': 'polyethylene-code',
        'question': 'What is the tariff code for polyethylene?',
        'searchedAs': ['polyethylene tariff code', 'hs code 3901', 'hs code 3901.20', 'hs code 3901.10', 'high density polyethylene tariff code', 'hts code for plastic pellets'],
        'answer': 'Polyethylene in primary forms is heading 3901: specific gravity under 0.94 (LDPE, LLDPE) 3901.10, 0.94 or more (HDPE) 3901.20, '
        'EVA 3901.30 and ethylene-alpha-olefin copolymers 3901.40 — mostly 6.5%. Canada supplied $2.97B of the $3.77B imported in 2025, Free under '
        'USMCA. Chinese polyethylene pays 44% (List 2 or 3), Korean 12.5% and EU 10% in total. A TSCA certification is required at entry.',
        'link': '',
    },
]
assert 11 <= len(fc['faqs']) <= 15

# ---------------------------------------------------------------------------------------------------
# Dates
# ---------------------------------------------------------------------------------------------------
for page in (tu, ui, ia, te, fc):
    page['lastCheckedAt'] = TODAY

s = json.dumps(d, ensure_ascii=False)
assert 'TODO' not in s, [m.start() for m in re.finditer('TODO', s)][:5]
assert FORBIDDEN_SOURCE not in s.lower()
json.dump(d, open(PATH, 'w'), ensure_ascii=False, indent=2)
print('filled', PATH, len(s))
