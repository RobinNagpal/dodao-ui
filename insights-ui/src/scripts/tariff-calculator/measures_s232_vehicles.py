# Section 232 vehicles (issue #1796): passenger vehicles and light trucks and their parts (U.S. note 33, headings
# 9903.94.xx; Proclamations 10908, 10925, 10984 and the UK / Japan / EU / South Korea / Taiwan implementing notices) and
# medium- and heavy-duty vehicles, buses and their parts (U.S. note 38, headings 9903.74.xx; Proclamation 10984), plus the
# 2026 Section 301 / Brazil Section 301 relief for goods under those headings (notes 52(f)(2), (3), (5), (6) and
# 50(a)(vi)(2), (3), (5), (6); headings 9903.05.90 / 9903.05.07).
#
# Call from build-measures.py (after rec / S / hts_note are defined):
#
#     from measures_s232_vehicles import s232_vehicles_measures
#     program_cov = json.load(open(ROOT + 'program-coverage.json'))['notes']
#     measures += s232_vehicles_measures(cov, program_cov, rec=rec, S=S, hts_note=hts_note)
#
#   s232_vehicles_measures(cov, program_cov, *, rec, S, hts_note) -> list[dict]
#     cov          note-coverage.json "notes" (only cross-checked; its 33(g) mis-splits "8707 8707.10.0020", so
#                  program-coverage.json is the coverage source here)
#     program_cov  program-coverage.json "notes": 33(b), 33(g), 33(i), 33(j), 38(b), 38(c), 38(i) — checked against the
#                  Revision 21 Chapter 99 PDF (same code sets, read left to right)
#     rec / S / hts_note  build-measures.py's record factory, source lookup ('ustr-301-fl', 'ustr-301-br') and note source
#
# Facts (src/tariff-data/calculator/confirmation-facts.json) this module depends on:
#   passengerVehiclePart (must answer)  — the article is a part of a passenger vehicle or light truck. Note 33(g) lists whole
#        subheadings (8471, 8507.60, 8544.30 …) whose goods are mostly not car parts; CBP: 9903.94.05 applies to "parts of
#        passenger vehicles … classifiable in" 33(g), 9903.94.06 to the listed articles "that are not parts of passenger
#        vehicles" (CSMS # 64916652). So the 25% follows the article, not the classification.
#   mediumHeavyVehiclePart (must answer) — same for note 38(i) / 9903.74.08 vs 9903.74.11.
#   notPassengerVehicleOrLightTruck (default false) — 33(c)(i) / 9903.94.02: an article of a 33(b) subheading that is not a
#        passenger vehicle or light truck. On 8704.60.00 (in both 33(b) and 38(b)) "yes" means the truck is an MHDV.
#   notMediumHeavyVehicle (default false) — 38(e) / 9903.74.05.
#   vehicle25YearsOld (default false) — 33(e) / 9903.94.04 and 38(g) / 9903.74.07.
#   ukAutoQuotaAvailable (default true) — 33(i) / 9903.94.31: the entry fits within the UK 100,000-vehicle quota.
#
# Overlapping lists (checked line by line in validation): 8704.60.00 is in 33(b) and 38(b); chassis of 8706 are in 33(g),
# 38(b) and 38(i); 171 provisions are in both 33(g) and 38(i). One article is one kind of vehicle (part), so the note 38
# measures on those lines carry the extra fact conditions below and the two programs never both charge.
#
# Not modelled (see each measure's notes): the import adjustment offsets (Proclamations 10925 / 10984 — company-specific
# credits), the opt-in certified-parts headings 9903.94.07 / .33 / .44 / .45 / .54 / .55 / .64 / .65 / .68 / .69 and
# 9903.74.09 (notes 33(p)–(r), 38(j): any non-listed part the importer elects to enter as an auto / MHDV part), knock-down
# kits and parts compilations (no USMCA relief), Chapter 98 entries, and the UK quota fill.

PROGRAM_AUTOS = 'Section 232 (passenger vehicles and light trucks)'
PROGRAM_AUTO_PARTS = 'Section 232 (automobile parts)'
PROGRAM_MHDV = 'Section 232 (medium- and heavy-duty vehicles and buses)'
PROGRAM_MHDV_PARTS = 'Section 232 (medium- and heavy-duty vehicle parts)'
PROGRAM_301 = 'Section 301 (2026, 60 economies)'
PROGRAM_301_BR = 'Section 301 (Brazil)'

REVIEWED = '2026-10-11'

EU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT',
      'RO', 'SK', 'SI', 'ES', 'SE']
USMCA = ['CA', 'MX']

# Duties the vehicle / parts entries "shall not be subject to" (notes 33(a), (f), (i)–(u), 38(a), (h); CSMS # 66665333).
METALS = ['9903.82.02'] + [f'9903.82.{n:02d}' for n in range(4, 27)]
IEEPA_CA_MX = ['9903.01.01', '9903.01.10']
WOOD = ['9903.76.01', '9903.76.02', '9903.76.03']
ALL_S301 = [f'9903.05.{n:02d}' for n in range(20, 85)]

SRC = {
    'procl-10908': {'citation': '90 FR 14705 (Proclamation 10908: Adjusting Imports of Automobiles and Automobile Parts — 25% from April 3 / May 3, 2025)',
                    'url': 'https://www.federalregister.gov/documents/2025/04/03/2025-05930/adjusting-imports-of-automobiles-and-automobile-parts-into-the-united-states',
                    'published': '2025-04-03'},
    'procl-10925': {'citation': '90 FR 18899 (Proclamation 10925: Amendments to Adjusting Imports of Automobiles and Automobile Parts — import adjustment offset)',
                    'url': 'https://www.federalregister.gov/documents/2025/05/02/2025-07833/amendments-to-adjusting-imports-of-automobiles-and-automobile-parts-into-the-united-states',
                    'published': '2025-05-02'},
    'procl-10984': {'citation': '90 FR 48451 (Proclamation 10984: Adjusting Imports of Medium- and Heavy-Duty Vehicles, Medium- and Heavy-Duty Vehicle Parts, and Buses — from November 1, 2025)',
                    'url': 'https://www.federalregister.gov/documents/2025/10/22/2025-19639/adjusting-imports-of-medium--and-heavy-duty-vehicles-medium--and-heavy-duty-vehicle-parts-and-buses',
                    'published': '2025-10-22'},
    'ita-uk': {'citation': '90 FR 27851 (Commerce/ITA: automobiles and automobile parts from the United Kingdom under Executive Order 14309 — 9903.94.31 / 9903.94.32 from June 30, 2025)',
               'url': 'https://www.federalregister.gov/documents/2025/06/30/2025-12060/imports-of-automobiles-automobile-parts-civil-aircraft-and-civil-aircraft-parts-from-the-united',
               'published': '2025-06-30'},
    'ita-jp': {'citation': '90 FR 44638 (Commerce/ITA: implementing the United States-Japan Agreement — automobiles and parts 15% from September 16, 2025)',
               'url': 'https://www.federalregister.gov/documents/2025/09/16/2025-17908/implementing-certain-tariff-related-elements-of-the-united-states-japan-agreement',
               'published': '2025-09-16'},
    'ita-eu': {'citation': '90 FR 46136 (Commerce/ITA: implementing the U.S.-EU Framework Agreement — automobiles and parts 15% from August 1, 2025)',
               'url': 'https://www.federalregister.gov/documents/2025/09/25/2025-18660/implementing-certain-tariff-related-elements-of-the-us-eu-framework-on-an-agreement-on-reciprocal',
               'published': '2025-09-25'},
    'ustr-kr': {'citation': '90 FR 55964 (implementing the U.S.-Korea Strategic Trade and Investment Deal — automobiles and parts 15% from November 1, 2025)',
                'url': 'https://www.federalregister.gov/documents/2025/12/04/2025-21940/implementing-certain-tariff-related-elements-of-the-us-korea-strategic-trade-and-investment-deal',
                'published': '2025-12-04'},
    'ita-tw': {'citation': '91 FR 31818 (Commerce/ITA: implementing the AIT-TECRO Agreement — automobile parts of Taiwan 15% from May 1, 2026)',
               'url': 'https://www.federalregister.gov/documents/2026/05/28/2026-10571/implementing-certain-tariff-related-elements-of-a-trade-and-security-agreement-between-the-american',
               'published': '2026-05-28'},
    'csms-64624801': {'citation': 'CBP CSMS # 64624801 (GUIDANCE: Import Duties on Certain Automobiles)',
                      'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3da18a1', 'published': '2025-04-02'},
    'csms-64916652': {'citation': 'CBP CSMS # 64916652 (UPDATE to CSMS # 64913145: GUIDANCE: Import Duties on Certain Automobile Parts — 9903.94.06 for articles that are not parts of passenger vehicles)',
                      'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3de8cac', 'published': '2025-05-01'},
    'csms-65649652': {'citation': 'CBP CSMS # 65649652 (GUIDANCE: Applying Section 232 Import Duties on USMCA-Qualifying Passenger Vehicles and Light Trucks — 9903.94.03 non-U.S. content)',
                      'url': 'https://content.govdelivery.com/bulletins/gd/USDHSCBP-3e9bbf4', 'published': '2025-07-16'},
    'csms-66665333': {'citation': 'CBP CSMS # 66665333 (GUIDANCE: Import Duties on Medium- and Heavy-duty Trucks, Medium- and Heavy-duty Truck Parts and Buses)',
                      'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3f93b75', 'published': '2025-10-29'},
    'csms-68559236': {'citation': 'CBP CSMS # 68559236 (GUIDANCE: Applying Section 232 Import Duties on USMCA-Qualifying Medium- and Heavy-Duty Vehicles — 9903.74.03 non-U.S. content)',
                      'url': 'https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4162184', 'published': '2026-05-06'},
    'cbp-auto-faq': {'citation': 'CBP, Section 232 Additional FAQs - Automobiles and Auto Parts (last modified December 19, 2025)',
                     'url': 'https://www.cbp.gov/trade/programs-administration/entry-summary/section-232-additional-faqs-autos', 'published': '2025-12-19'},
}


def _s(*ids):
    return [SRC[i] for i in ids]


def _covers(prefixes, code):
    return any(code.startswith(p) for p in prefixes)


def _overlap(a, b):
    """Prefixes where two coverage lists meet: for each related pair, the longer (narrower) prefix."""
    return sorted({max(x, y, key=len) for x in a for y in b if x.startswith(y) or y.startswith(x)})


def _partition(codes, groups):
    """Split a coverage list for overlap handling.

    groups: ordered [(tag, prefixes)], earlier = higher priority; every prefix lies within `codes`.
    Returns {tag: (include, exclude)} with tag None for the lines in no group. A line belongs to the first group whose
    prefix covers it; exclusions carve out the narrower prefixes of higher-priority groups (and, for the plain part,
    of every group)."""
    out = {}
    taken = []  # prefixes claimed by higher-priority groups
    for tag, prefs in groups:
        inc = [p for p in prefs if not _covers(taken, p)]
        exc = sorted({t for t in taken if any(t.startswith(p) and t != p for p in inc)})
        out[tag] = (sorted(inc), exc)
        taken += inc
    plain = [c for c in codes if c not in taken and not _covers([t for t in taken if len(t) < len(c)], c)]
    out[None] = (sorted(plain), sorted({t for t in taken if any(t.startswith(p) and t != p for p in plain)}))
    return out


def _merge_conditions(base, extra):
    c = {k: list(v) if isinstance(v, list) else v for k, v in base.items()}
    for k, v in extra.items():
        c[k] = sorted(set(c.get(k, [])) | set(v))
    return c


def s232_vehicles_measures(cov, program_cov, *, rec, S, hts_note):
    B33, G33, I33, J33 = program_cov['33(b)'], program_cov['33(g)'], program_cov['33(i)'], program_cov['33(j)']
    B38, C38, I38 = program_cov['38(b)'], program_cov['38(c)'], program_cov['38(i)']

    # Cross-checks (a failure means the HTS changed — re-review notes 33 / 38 against the Chapter 99 PDF).
    assert len(B33) == 17 and all(c[:4] in ('8703', '8704') for c in B33), '33(b) changed'
    assert sorted(B33) == sorted(cov['33(b)']) and sorted(I33) == sorted(cov['33(i)']) and sorted(J33) == sorted(cov['33(j)'])
    assert set(I33) <= set(B33) and all(c.startswith('8703') for c in I33), '33(i) must be the 8703 part of 33(b)'
    assert len(G33) == 130 and '8707' in G33 and '8507' + '60' in G33, '33(g) changed'
    assert all(any(j.startswith(g) for g in G33) for j in J33), 'a 33(j) UK line is outside 33(g)'
    assert len(B38) == 25 and len(C38) == 10 and len(I38) == 182, 'note 38 lists changed'
    assert all(c.startswith('8702') for c in C38)

    ov_b33_b38 = _overlap(B33, B38)   # 8704.60.00: light truck or MHDV
    ov_g33_b38 = _overlap(G33, B38)   # chassis of 8706 listed both as auto parts and as MHDVs
    ov_i38_b38 = _overlap(I38, B38)   # chassis of 8706 listed both as MHDV parts and as MHDVs
    ov_g33_i38 = _overlap(G33, I38)   # parts listed in both parts lists
    assert ov_b33_b38 == ['87046000'], ov_b33_b38
    assert not _overlap(B33, G33) and not _overlap(B33, I38) and not _overlap(C38, B33 + G33 + I38 + B38)

    measures = []
    autos_n33 = hts_note(33)
    n38 = hts_note(38)
    stack_cn = ('Stacks with the China Section 301 duties (notes 20 and 31, e.g. 9903.91.03 at 100% on electric vehicles of 8703.80): note 33(a) — '
                '"any additional duty prescribed in any provision of this subchapter … shall be imposed in addition".')

    # ------------------------------------------------------------------------------------------------------------
    # Note 33: passenger vehicles and light trucks (33(b): 17 subheadings of 8703 / 8704)
    # ------------------------------------------------------------------------------------------------------------
    VEH_DUTY = ['9903.94.01', '9903.94.03', '9903.94.31', '9903.94.40', '9903.94.41', '9903.94.50', '9903.94.51', '9903.94.60', '9903.94.61']
    veh_cov = f'Coverage: the {len(B33)} subheadings of U.S. note 33(b) (8703.22–8703.90 and light trucks 8704.21, 8704.31, 8704.41, 8704.51, 8704.60).'
    measures.append(rec(
        measureKey='s232-autos', program=PROGRAM_AUTOS, ch99Code='9903.94.01', rateKind='additive', ratePct=25,
        countriesExclude=sorted(EU + ['JP', 'KR']), coverageInclude=sorted(B33), conditions={'usmcaQualifying': False},
        replacesCodes=METALS + IEEPA_CA_MX, effectiveFrom='2025-04-03',
        sources=_s('procl-10908', 'csms-64624801', 'cbp-auto-faq') + [autos_n33], reviewedAt=REVIEWED,
        notes='Heading 9903.94.01, U.S. note 33(a)–(b): passenger vehicles (sedans, SUVs, crossovers, minivans, cargo vans) and light trucks of every '
              'country pay base rate + 25% (since April 3, 2025; used vehicles too, CBP FAQ). Collected also when an FTA/GSP special rate is claimed. '
              'Products of Japan, the EU and South Korea use their 15% deal headings instead (countriesExclude); USMCA-qualifying vehicles use '
              '9903.94.03 (non-U.S. content). The United Kingdom stays here for vehicles outside the 100,000-vehicle quota and for its light trucks. '
              'Entries under this heading do not pay the Section 232 metals duties (9903.82.02, 9903.82.04–9903.82.26) or the Canada / Mexico duties '
              '9903.01.10 / 9903.01.01 (note 33(a)(1)–(3)), and no 2026 Section 301 duty (note 52(f)(2), see s301-2026-exempt-52f-vehicles). '
              'Reliefs: 9903.94.02 (an article of these subheadings that is not a passenger vehicle or light truck) and 9903.94.04 (manufactured 25 '
              'or more years before the entry year), on the importer\'s confirmation. ' + stack_cn + ' ' + veh_cov))
    measures.append(rec(
        measureKey='s232-autos-usmca-non-us-content', program=PROGRAM_AUTOS, ch99Code='9903.94.03', rateKind='additive', ratePct=25,
        countriesInclude=USMCA, coverageInclude=sorted(B33), conditions={'usmcaQualifying': True}, effectiveFrom='2025-04-03',
        contentBasis='nonUsContent', sources=_s('procl-10908', 'csms-65649652') + [autos_n33], reviewedAt=REVIEWED,
        notes='Heading 9903.94.03, U.S. note 33(d): USMCA-qualifying passenger vehicles and light trucks (SPI "S"/"S+") pay 25% on the value of the '
              'non-U.S. content only (customs value minus the U.S. content — the value attributable to parts wholly obtained, produced entirely or '
              'substantially transformed in the United States), "upon approval from the Secretary of Commerce"; the U.S. content enters under 9903.94.02 '
              'at 0% (CSMS # 65649652: two entry lines). The importer enters the U.S.-content value Commerce approved; without an approval enter 0, '
              'which charges 25% on the full value — the same as 9903.94.01. Note 52(f)(2) lists 9903.94.03 (and 9903.94.02 as applied to that U.S. '
              'content), so no 2026 Section 301 duty. Note 33(d) carries no metals / IEEPA carve-out, so none is modelled here. ' + veh_cov))
    measures.append(rec(
        measureKey='s232-autos-uk-quota', program=PROGRAM_AUTOS, ch99Code='9903.94.31', rateKind='additive', ratePct=7.5, countriesInclude=['GB'],
        coverageInclude=sorted(I33), conditions={'factsTrue': ['ukAutoQuotaAvailable']}, replacesCodes=['9903.94.01'] + METALS,
        effectiveFrom='2025-06-30', sources=_s('ita-uk') + [autos_n33], reviewedAt=REVIEWED,
        notes=f'Heading 9903.94.31, U.S. note 33(i): passenger vehicles of 8703 ({len(I33)} subheadings) that are products of the United Kingdom pay '
              'base rate + 7.5% (combined 10% with the 2.5% column 1 rate) within the tariff-rate quota — 100,000 vehicles per calendar year from 2026 '
              '(65,205 in 2025), at most 25,000 per quarter plus quantity carried forward (Q1→Q3, Q2→Q4). Entries over the quota pay 9903.94.01 '
              '(25%). Applies while the importer confirms the quota is open (fact ukAutoQuotaAvailable, default yes; CBP publishes the fill). '
              'UK light trucks (8704) are not in 33(i) and pay 9903.94.01. Not subject to the metals duties (note 33(i)(1)); no 2026 Section 301 '
              'duty (note 52(f)(2)).'))
    deal_veh = [
        ('jp', ['JP'], '9903.94.41', '9903.94.40', '33(k)', '2025-09-16', 'ita-jp', 'Japan', ' (Executive Order 14345)'),
        ('eu', EU, '9903.94.51', '9903.94.50', '33(n)', '2025-08-01', 'ita-eu', 'the European Union', ''),
        ('kr', ['KR'], '9903.94.61', '9903.94.60', '33(s)', '2025-11-01', 'ustr-kr', 'South Korea', ''),
    ]
    for k, countries, low, high, sub, start, src, name, extra in deal_veh:
        kr = k == 'kr'
        measures.append(rec(
            measureKey=f's232-autos-{k}-15', program=PROGRAM_AUTOS, ch99Code=low, rateKind='floor', ratePct=15, countriesInclude=sorted(countries),
            coverageInclude=sorted(B33), replacesCodes=METALS, effectiveFrom=start, sources=_s(src) + [autos_n33], reviewedAt=REVIEWED,
            notes=f'Headings {high} / {low}, U.S. notes {sub} and 33(m): passenger vehicles and light trucks that are products of {name}{extra}. When the '
                  f'column 1{"-General or column 1-Special (KORUS, SPI \"KR\")" if kr else "-General"} rate (or its ad valorem equivalent: duty ÷ customs '
                  f'value) is under 15%, the total is 15% ({low}); at or above 15% no additional duty is due ({high}) — e.g. light trucks at 25% stay 25%. '
                  'Modelled as a floor: max(base, 15%), in place of 9903.94.01 (countriesExclude there). Not subject to the metals duties; no 2026 '
                  f'Section 301 duty (note 52(f)(2)). In effect from {start}. ' + veh_cov))
    measures.append(rec(
        measureKey='s232-autos-not-passenger-vehicle', program=PROGRAM_AUTOS, ch99Code='9903.94.02', rateKind='relief', coverageInclude=sorted(B33),
        conditions={'factsTrue': ['notPassengerVehicleOrLightTruck']}, replacesCodes=VEH_DUTY, effectiveFrom='2025-04-03',
        sources=_s('procl-10908', 'csms-65649652') + [autos_n33], reviewedAt=REVIEWED,
        notes='Heading 9903.94.02, U.S. note 33(c)(i): articles of the 33(b) subheadings that are not passenger vehicles (sedans, SUVs, crossovers, '
              'minivans, cargo vans) or light trucks pay no Section 232 automobile duty — only when the importer confirms it (fact '
              'notPassengerVehicleOrLightTruck). They still pay the 2026 Section 301 duty: note 52(f)(2) lists 9903.94.02 only as applied to the U.S. '
              'content of 33(d) vehicles. On 8704.60.00, which note 38(b) also lists, a truck that is not a light truck is a medium- or heavy-duty '
              'vehicle and pays 9903.74.01 instead (s232-mhdv-light-truck-overlap).'))
    measures.append(rec(
        measureKey='s232-autos-25-years-old', program=PROGRAM_AUTOS, ch99Code='9903.94.04', rateKind='relief', coverageInclude=sorted(B33),
        conditions={'factsTrue': ['vehicle25YearsOld']}, replacesCodes=VEH_DUTY, effectiveFrom='2025-04-03',
        sources=_s('procl-10908', 'cbp-auto-faq') + [autos_n33], reviewedAt=REVIEWED,
        notes='Heading 9903.94.04, U.S. note 33(e): passenger vehicles and light trucks manufactured in a year at least 25 years before the year of entry '
              'pay no Section 232 duty (fact vehicle25YearsOld). Note 52(f)(2) does not list 9903.94.04, so the 2026 Section 301 duty applies.'))

    # ------------------------------------------------------------------------------------------------------------
    # Note 33: automobile parts (33(g): 130 provisions; UK 33(j): 267 statistical numbers)
    # ------------------------------------------------------------------------------------------------------------
    PART = {'factsTrue': ['passengerVehiclePart']}
    parts_cov = (f'Coverage: the {len(G33)} provisions of U.S. note 33(g) (tires, glass, engines 8407/8408, pumps, bearings, motors, lithium-ion and '
                 'lead-acid batteries 8507, ignition and lighting 8511/8512, radios 8527, wiring sets 8544.30, chassis 8706, bodies 8707, parts 8708, seats '
                 '9401.20, also 8471 and others). The duty follows the article: 9903.94.05 applies to "parts of passenger vehicles … and light trucks" '
                 'classifiable there, and 9903.94.06 to the listed articles that are not (note 33(h)(ii); CBP CSMS # 64916652), so it is charged only when '
                 'the importer confirms the article is such a part (fact passengerVehiclePart, must be answered).')
    parts_except = ('Entries of these parts do not pay the Section 232 metals duties (9903.82.02, 9903.82.04–9903.82.26), the Canada / Mexico duties '
                    '9903.01.10 / 9903.01.01 or the wood duties 9903.76.01–9903.76.03 (note 33(f)(1)–(4)), and no 2026 Section 301 duty (note 52(f)(3)).')
    measures.append(rec(
        measureKey='s232-auto-parts', program=PROGRAM_AUTO_PARTS, ch99Code='9903.94.05', rateKind='additive', ratePct=25,
        countriesExclude=sorted(EU + ['JP', 'KR', 'TW']), coverageInclude=sorted(G33), conditions={'usmcaQualifying': False, **PART},
        replacesCodes=METALS + IEEPA_CA_MX + WOOD, effectiveFrom='2025-05-03',
        sources=_s('procl-10908', 'procl-10925', 'csms-64916652', 'cbp-auto-faq') + [autos_n33], reviewedAt=REVIEWED,
        notes='Heading 9903.94.05, U.S. note 33(f)–(g): parts of passenger vehicles and light trucks pay base rate + 25% from May 3, 2025, also when an '
              'FTA/GSP special rate is claimed. USMCA-qualifying parts (other than knock-down kits or parts compilations) enter under 9903.94.06 with '
              'no duty (note 33(h)(i)) — s232-auto-parts-usmca. Products of Japan, the EU, South Korea and Taiwan use their 15% deal headings; '
              'products of the United Kingdom in the 33(j) statistical numbers use 9903.94.32 (10%). ' + parts_except + ' ' + stack_cn + ' '
              'Not modelled: the import adjustment offset (note 33(g), Proclamation 10925 — a credit for U.S. vehicle assemblers) and knock-down '
              'kits. ' + parts_cov))
    measures.append(rec(
        measureKey='s232-auto-parts-usmca', program=PROGRAM_AUTO_PARTS, ch99Code='9903.94.06', rateKind='relief', countriesInclude=USMCA,
        coverageInclude=sorted(G33), conditions={'usmcaQualifying': True, **PART}, replacesCodes=['9903.94.05'] + METALS + IEEPA_CA_MX + WOOD,
        effectiveFrom='2025-05-03', sources=_s('procl-10908', 'csms-64916652', 'csms-66665333', 'cbp-auto-faq') + [autos_n33], reviewedAt=REVIEWED,
        notes='Heading 9903.94.06, U.S. note 33(h)(i): parts of passenger vehicles and light trucks eligible for USMCA (SPI "S"/"S+"), other than '
              'automobile knock-down kits or parts compilations, pay no Section 232 duty (no non-U.S.-content charge for parts until Commerce sets '
              'one up; CBP FAQ: also for USMCA parts self-certified for U.S. production or repair). CSMS # 66665333: parts under 9903.94.06 are '
              '"subject to" Proclamation 10908 and do not pay the metals, Canada / Mexico and wood duties. Note 52(f)(3) lists 9903.94.06 as applied '
              'to USMCA parts of passenger vehicles, so no 2026 Section 301 duty either. Knock-down kits are not modelled. ' + parts_cov))
    measures.append(rec(
        measureKey='s232-auto-parts-uk', program=PROGRAM_AUTO_PARTS, ch99Code='9903.94.32', rateKind='inPlaceOfBase', ratePct=10, countriesInclude=['GB'],
        coverageInclude=sorted(J33), conditions=PART, replacesCodes=['9903.94.05'] + METALS + WOOD, effectiveFrom='2025-06-30',
        sources=_s('ita-uk') + [autos_n33], reviewedAt=REVIEWED,
        notes=f'Heading 9903.94.32 (rate "10%"), U.S. note 33(j): parts of passenger vehicles and light trucks that are products of the United Kingdom, '
              f'in the {len(J33)} statistical reporting numbers listed, pay a total of 10% "including any most-favored-nation tariff" (90 FR 27851) — '
              'modelled in place of the base rate. Other 33(g) lines from the UK pay 9903.94.05 (25%). Not subject to the metals or wood duties '
              '(note 33(j)(1)–(2)); no 2026 Section 301 duty (note 52(f)(3)). Charged only when the importer confirms the article is such a part '
              '(fact passengerVehiclePart). 9903.94.33 (other UK parts certified for UK automobiles, note 33(q)) is opt-in and not modelled.'))
    deal_parts = [
        ('jp', ['JP'], '9903.94.43', '9903.94.42', '33(l)', '2025-09-16', 'ita-jp', 'Japan', WOOD),
        ('eu', EU, '9903.94.53', '9903.94.52', '33(o)', '2025-08-01', 'ita-eu', 'the European Union', WOOD),
        ('kr', ['KR'], '9903.94.63', '9903.94.62', '33(t)', '2025-11-01', 'ustr-kr', 'South Korea', WOOD + ['9903.76.23']),
        ('tw', ['TW'], '9903.94.67', '9903.94.66', '33(u)', '2026-05-01', 'ita-tw', 'Taiwan', WOOD + ['9903.76.24']),
    ]
    for k, countries, low, high, sub, start, src, name, wood in deal_parts:
        kr = k == 'kr'
        measures.append(rec(
            measureKey=f's232-auto-parts-{k}-15', program=PROGRAM_AUTO_PARTS, ch99Code=low, rateKind='floor', ratePct=15, countriesInclude=sorted(countries),
            coverageInclude=sorted(G33), conditions=PART, replacesCodes=METALS + wood, effectiveFrom=start, sources=_s(src) + [autos_n33],
            reviewedAt=REVIEWED,
            notes=f'Headings {high} / {low}, U.S. notes {sub}, 33(g) and 33(m): parts of passenger vehicles and light trucks that are products of {name}. '
                  f'When the column 1{"-General or column 1-Special (KORUS)" if kr else "-General"} rate (or its ad valorem equivalent) is under 15%, the '
                  f'total is 15% ({low}); at or above 15%, no additional duty ({high}). Modelled as a floor: max(base, 15%), in place of 9903.94.05. '
                  f'Not subject to the metals duties or the wood duties {", ".join(wood)} (note {sub}); no 2026 Section 301 duty (note 52(f)(3)). '
                  f'In effect from {start}. The certified-parts headings of note 33(r) (opt-in, parts outside 33(g)) are not modelled. ' + parts_cov))

    # ------------------------------------------------------------------------------------------------------------
    # Note 38: medium- and heavy-duty vehicles (38(b)), buses (38(c)), parts (38(i))
    # ------------------------------------------------------------------------------------------------------------
    MHDV_DUTY = ['9903.74.01', '9903.74.02', '9903.74.03']
    mhdv_cov = (f'Coverage: the {len(B38)} provisions of U.S. note 38(b) (road tractors 8701.21–8701.29, trucks of 8704 over 5 t G.V.W. and 8704.10, '
                '8704.60, special-purpose vehicles 8705.40 / 8705.90, chassis of 8706, works trucks 8709.11 / 8709.19).')
    overlap_groups = [
        ('lightTruck', ov_b33_b38, {'factsTrue': ['notPassengerVehicleOrLightTruck']},
         ' On 8704.60.00, which note 33(b) also lists (electric trucks of any weight), the light-truck treatment (9903.94.01) is the default; this '
         'duty applies when the importer confirms the truck is not a light truck (fact notPassengerVehicleOrLightTruck), which also lifts 9903.94.01.'),
        ('autoPart', ov_g33_b38, {'factsFalse': ['passengerVehiclePart']},
         ' These chassis of 8706 are also listed as automobile parts in note 33(g): when the importer confirms they are for a passenger vehicle or '
         'light truck (fact passengerVehiclePart), 9903.94.05 applies instead.'),
    ]
    parts_b38 = _partition(B38, [(t, p) for t, p, _, _ in overlap_groups])

    def mhdv_vehicle_records(key, code, base_cond, extra_kw, note_text):
        for tag, _, cond, tail in [(None, None, {}, '')] + overlap_groups:
            inc, exc = parts_b38[tag]
            if not inc:
                continue
            measures.append(rec(
                measureKey=key + ('' if tag is None else f'-{"light-truck" if tag == "lightTruck" else "auto-part"}-overlap'),
                program=PROGRAM_MHDV, ch99Code=code, coverageInclude=inc, coverageExclude=exc, conditions=_merge_conditions(base_cond, cond),
                reviewedAt=REVIEWED, **extra_kw, notes=note_text + tail + (f' Lines: {", ".join(inc)}.' if tag else '')))

    mhdv_vehicle_records(
        's232-mhdv', '9903.74.01', {'usmcaQualifying': False},
        dict(rateKind='additive', ratePct=25, replacesCodes=METALS + IEEPA_CA_MX, effectiveFrom='2025-11-01',
             sources=_s('procl-10984', 'csms-66665333') + [n38]),
        'Heading 9903.74.01, U.S. note 38(a)–(b): medium- and heavy-duty vehicles of every country pay base rate + 25% from November 1, 2025, also when '
        'an FTA/GSP special rate is claimed (no country deal rates). USMCA-qualifying vehicles use 9903.74.03 (non-U.S. content). Not subject to the '
        'metals duties or 9903.01.10 / 9903.01.01 (note 38(a)(1)–(3)); no 2026 Section 301 duty (note 52(f)(5)). Reliefs on the importer\'s '
        'confirmation: 9903.74.05 (not an MHDV) and 9903.74.07 (25 or more years old). Not modelled: the MHDV import adjustment offset '
        '(Proclamation 10984 clause 4). ' + mhdv_cov)
    mhdv_vehicle_records(
        's232-mhdv-usmca-non-us-content', '9903.74.03', {'usmcaQualifying': True},
        dict(rateKind='additive', ratePct=25, countriesInclude=USMCA, contentBasis='nonUsContent', replacesCodes=METALS + IEEPA_CA_MX,
             effectiveFrom='2025-11-01', sources=_s('procl-10984', 'csms-66665333', 'csms-68559236') + [n38]),
        'Heading 9903.74.03, U.S. note 38(d): USMCA-qualifying medium- and heavy-duty vehicles (SPI "S"/"S+") pay 25% on the non-U.S. content only '
        '(customs value minus the U.S. content Commerce approved; the U.S. content enters under 9903.74.06 at 0% — CSMS # 68559236). Without a Commerce '
        'approval enter 0 as the U.S. content: 25% on the full value, as under 9903.74.01. Buses of 8702 have no such option (Proclamation 10984 '
        'clause 2). CSMS # 66665333: MHDVs do not pay the metals duties or 9903.01.10 / 9903.01.01. No 2026 Section 301 duty (note 52(f)(5) lists '
        '9903.74.03 and 9903.74.06). ' + mhdv_cov)
    measures.append(rec(
        measureKey='s232-buses', program=PROGRAM_MHDV, ch99Code='9903.74.02', rateKind='additive', ratePct=10, coverageInclude=sorted(C38),
        replacesCodes=METALS + IEEPA_CA_MX, effectiveFrom='2025-11-01', sources=_s('procl-10984', 'csms-66665333') + [n38], reviewedAt=REVIEWED,
        notes=f'Heading 9903.74.02, U.S. note 38(c): buses and other vehicles of heading 8702 ({len(C38)} subheadings) of every country pay base rate + '
              '10% from November 1, 2025, also when an FTA special rate (USMCA included: Proclamation 10984 clause 2 gives buses no non-U.S.-content '
              'option) is claimed. Not subject to the metals duties or 9903.01.10 / 9903.01.01; no 2026 Section 301 duty (note 52(f)(5)). '
              '25-year-old vehicles: 9903.74.07.'))
    measures.append(rec(
        measureKey='s232-mhdv-not-mhdv', program=PROGRAM_MHDV, ch99Code='9903.74.05', rateKind='relief', coverageInclude=sorted(B38),
        conditions={'factsTrue': ['notMediumHeavyVehicle']}, replacesCodes=MHDV_DUTY, effectiveFrom='2025-11-01',
        sources=_s('procl-10984', 'csms-66665333') + [n38], reviewedAt=REVIEWED,
        notes='Heading 9903.74.05, U.S. note 38(e): articles of the 38(b) provisions that are not medium- and heavy-duty vehicles pay no Section 232 '
              'duty (fact notMediumHeavyVehicle). Note 52(f)(5) does not list 9903.74.05, so the 2026 Section 301 duty applies.'))
    measures.append(rec(
        measureKey='s232-mhdv-25-years-old', program=PROGRAM_MHDV, ch99Code='9903.74.07', rateKind='relief', coverageInclude=sorted(B38 + C38),
        conditions={'factsTrue': ['vehicle25YearsOld']}, replacesCodes=MHDV_DUTY, effectiveFrom='2025-11-01',
        sources=_s('procl-10984', 'csms-66665333') + [n38], reviewedAt=REVIEWED,
        notes='Heading 9903.74.07, U.S. note 38(g): medium- and heavy-duty vehicles and buses (38(b), 38(c)) manufactured in a year at least 25 years '
              'before the year of entry pay no Section 232 duty (fact vehicle25YearsOld). Note 52(f)(5) does not list 9903.74.07, so the 2026 '
              'Section 301 duty applies.'))

    # MHDV parts. The chassis that note 38(b) lists as MHDVs are left to the vehicle measures (no second 25%).
    PART38 = {'factsTrue': ['mediumHeavyVehiclePart']}
    parts38_cov = (f'Coverage: the {len(I38)} provisions of U.S. note 38(i) (tires, glass, engines, pumps, bearings, motors, batteries, lighting, '
                   'brakes, axles, wheels, seats and other parts of 8708). The duty follows the article: 9903.74.08 applies to parts of medium- and '
                   'heavy-duty vehicles, 9903.74.11 to the listed articles that are not (note 38(l)), so it is charged only when the importer confirms '
                   'the article is such a part (fact mediumHeavyVehiclePart, must be answered).')
    p38 = _partition(I38, [('chassis', ov_i38_b38), ('autoPart', ov_g33_i38)])
    p38_tail = {None: '', 'autoPart': ' These provisions are also in note 33(g): a part of a passenger vehicle or light truck pays 9903.94.05 instead '
                                      '(fact passengerVehiclePart), so this duty needs that fact answered "no".'}
    for key, code, kind, rate, base_cond, extra_kw, text in [
        ('s232-mhdv-parts', '9903.74.08', 'additive', 25, {'usmcaQualifying': False, **PART38},
         dict(replacesCodes=METALS + IEEPA_CA_MX + WOOD, sources=_s('procl-10984', 'csms-66665333') + [n38]),
         'Heading 9903.74.08, U.S. note 38(h)–(i): parts of medium- and heavy-duty vehicles pay base rate + 25% from November 1, 2025, also when an '
         'FTA/GSP special rate is claimed. USMCA-qualifying parts (other than knock-down kits) enter under 9903.74.10 with no duty '
         '(s232-mhdv-parts-usmca). Not subject to the metals duties, 9903.01.10 / 9903.01.01 or the wood duties 9903.76.01–9903.76.03 (note '
         '38(h)(1)–(4)); no 2026 Section 301 duty (note 52(f)(6)). Not modelled: the MHDV import adjustment offset (note 38(i), Proclamation '
         '10984), 9903.74.09 (opt-in certified parts outside 38(i), note 38(j)) and knock-down kits. The 8706 chassis that note 38(b) lists '
         'as vehicles are charged there (coverageExclude). '),
        ('s232-mhdv-parts-usmca', '9903.74.10', 'relief', None, {'usmcaQualifying': True, **PART38},
         dict(countriesInclude=USMCA, replacesCodes=['9903.74.08'] + METALS + IEEPA_CA_MX + WOOD,
              sources=_s('procl-10984', 'csms-66665333') + [n38]),
         'Heading 9903.74.10, U.S. note 38(k): parts of medium- and heavy-duty vehicles that qualify for USMCA (SPI "S"/"S+"), other than knock-down '
         'kits or parts compilations, pay no Section 232 duty (Proclamation 10984 clause 3: until Commerce sets up a non-U.S.-content process). '
         'CSMS # 66665333: these parts do not pay the metals, Canada / Mexico or wood duties either. No 2026 Section 301 duty (note 52(f)(6) lists '
         '9903.74.10). '),
    ]:
        for tag in (None, 'autoPart'):
            inc, exc = p38[tag]
            measures.append(rec(
                measureKey=key + ('' if tag is None else '-auto-part-overlap'), program=PROGRAM_MHDV_PARTS, ch99Code=code, rateKind=kind,
                ratePct=rate, coverageInclude=inc, coverageExclude=exc,
                conditions=_merge_conditions(base_cond, {} if tag is None else {'factsFalse': ['passengerVehiclePart']}),
                effectiveFrom='2025-11-01', reviewedAt=REVIEWED, **extra_kw,
                notes=text + parts38_cov + p38_tail[tag] + (f' {len(inc)} provisions here.' if tag else '')))

    # ------------------------------------------------------------------------------------------------------------
    # 2026 Section 301 (note 52(f), 9903.05.90) and Brazil Section 301 (note 50(a)(vi), 9903.05.07)
    # ------------------------------------------------------------------------------------------------------------
    f_items = [
        ('vehicles', '2', sorted(B33), {'factsFalse': ['notPassengerVehicleOrLightTruck', 'vehicle25YearsOld']},
         'passenger vehicles and light trucks under 9903.94.01, 9903.94.03 (and 9903.94.02 as applied to their U.S. content), 9903.94.31, '
         '9903.94.40/.41, 9903.94.50/.51 and 9903.94.60/.61 — every 33(b) vehicle except articles that are not passenger vehicles or light trucks '
         '(9903.94.02) and vehicles 25 or more years old (9903.94.04), which pay the duty'),
        ('auto-parts', '3', sorted(G33), PART,
         'parts of passenger vehicles and light trucks under 9903.94.05, 9903.94.06 (USMCA parts), 9903.94.07, 9903.94.32/.33 and the deal headings '
         '9903.94.42–9903.94.69 — every 33(g) article confirmed to be such a part (fact passengerVehiclePart); articles that are not parts of '
         'passenger vehicles (9903.94.06 under note 33(h)(ii)) pay the duty'),
        ('mhdv', '5', sorted(B38 + C38), {'factsFalse': ['notMediumHeavyVehicle', 'vehicle25YearsOld']},
         'medium- and heavy-duty vehicles, buses and other vehicles under 9903.74.01, 9903.74.02, 9903.74.03 and 9903.74.06 — every 38(b) / 38(c) '
         'vehicle except articles that are not MHDVs (9903.74.05) and vehicles 25 or more years old (9903.74.07)'),
        ('mhdv-parts', '6', sorted(I38), PART38,
         'medium- and heavy-duty vehicle parts under 9903.74.08, 9903.74.09 and 9903.74.10 — every 38(i) article confirmed to be such a part '
         '(fact mediumHeavyVehiclePart)'),
    ]
    for key, item, codes, cond, what in f_items:
        measures.append(rec(
            measureKey=f's301-2026-exempt-52f-{key}', program=PROGRAM_301, ch99Code='9903.05.90', rateKind='relief', coverageInclude=codes,
            conditions=cond, replacesCodes=ALL_S301, effectiveFrom='2026-07-24', sources=S('ustr-301-fl') + [hts_note(52), hts_note(33 if item in '23' else 38)],
            reviewedAt=REVIEWED,
            notes=f'U.S. note 52(f)({item}) (heading 9903.05.90): the 2026 Section 301 duties 9903.05.20–9903.05.84 do not apply to {what}. Every country. '
                  'Not modelled: parts subject to an import adjustment offset (also listed in 52(f)(3)/(6)).'))
        measures.append(rec(
            measureKey=f's301-brazil-exempt-50a-vi-{key}', program=PROGRAM_301_BR, ch99Code='9903.05.07', rateKind='relief', countriesInclude=['BR'],
            coverageInclude=codes, conditions=cond, replacesCodes=['9903.05.01'], effectiveFrom='2026-07-22',
            sources=S('ustr-301-br') + [hts_note(50), hts_note(33 if item in '23' else 38)], reviewedAt=REVIEWED,
            notes=f'U.S. note 50(a)(vi)({item}) (heading 9903.05.07): the 25% Brazil Section 301 duty (9903.05.01) does not apply to {what}.'))

    for m in measures:
        assert m['htsEdition'] == '2026 Revision 21' and m['effectiveFrom'] and m['sources'] and m.get('notes')
    return measures
