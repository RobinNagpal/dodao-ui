"""Official sources for the Chapter 87 fill script (fill87.py).

Every Federal Register entry was checked against the FR API (citation, publication date, html_url); the text was read from
the govinfo HTML of the same document (g-<doc>.txt in this folder).
"""
import glob
import json

WT = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui'
SLUG_FILE = '87-motor-vehicles-and-parts'

CH87_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2087'
CH98_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
CH99_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
GN_PDF = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
USC_30112 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title49/html/USCODE-2024-title49-subtitleVI-partA-chap301-subchapII-sec30112.htm'
USC_30141 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title49/html/USCODE-2024-title49-subtitleVI-partA-chap301-subchapIII-sec30141.htm'
USC_2085 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap47-sec2085.htm'
USC_7522 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title42/html/USCODE-2024-title42-chap85-subchapII-partA-sec7522.htm'

# Official sources already used (and checked) in other chapter files, by id.
REF = {}
for f in sorted(glob.glob(f'{WT}/src/tariff-data/chapters/*.json')):
    if SLUG_FILE in f:
        continue
    x = json.load(open(f))
    for page in ('tariffUpdates', 'industryAreas'):
        for s in (x.get(page) or {}).get('sources', []):
            REF.setdefault(s['id'], s)


_META = json.load(open(__file__.replace('sources87.py', 'fr_meta.json')))


def fr(sid, citation, document, title, published, docnum, slug, signed=None):
    """FR source; the url, citation, date and title are taken from the FR API record (fr_meta.json) and must agree."""
    m = _META[docnum]
    assert m['citation'] == citation and m['publication_date'] == published, (sid, m['citation'], m['publication_date'])
    return {
        'id': sid,
        'publisher': 'Federal Register',
        'citation': citation,
        'document': document,
        'title': m['title'],
        'signed': signed,
        'published': published,
        'url': m['html_url'],
    }


ITA = 'Notice (Commerce, International Trade Administration)'
ITC = 'Notice (U.S. International Trade Commission)'

NEW = {
    'hts-ch87': {
        'id': 'hts-ch87',
        'publisher': 'USITC',
        'citation': 'HTSUS 2026 Revision 21, Chapter 87',
        'document': 'Harmonized Tariff Schedule',
        'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 87: Vehicles Other Than Railway or Tramway '
        'Rolling Stock, and Parts and Accessories Thereof',
        'signed': None,
        'published': '2026-10-07',
        'url': CH87_PDF,
    },
    # ---------------------------------------------------------------- AD/CVD: chassis
    'ad-chassis-cn': fr(
        'ad-chassis-cn', '86 FR 36093', ITA + ', A-570-135',
        "Certain Chassis and Subassemblies Thereof From the People's Republic of China: Antidumping Duty Order",
        '2021-07-08', '2021-14561', 'certain-chassis-and-subassemblies-thereof-from-the-peoples-republic-of-china-antidumping-duty-order',
    ),
    'cvd-chassis-cn': fr(
        'cvd-chassis-cn', '86 FR 24844', ITA + ', C-570-136',
        "Certain Chassis and Subassemblies Thereof From the People's Republic of China: Countervailing Duty Order and Amended Final "
        'Affirmative Countervailing Duty Determination',
        '2021-05-10', '2021-09848',
        'certain-chassis-and-subassemblies-thereof-from-the-peoples-republic-of-china-countervailing-duty-order-and',
    ),
    'chassis-cn-sunset-ad': fr(
        'chassis-cn-sunset-ad', '91 FR 49423', ITA,
        "Chassis and Subassemblies Thereof From the People's Republic of China: Final Results of the Expedited First Sunset Review of "
        'the Antidumping Duty Order',
        '2026-08-04', '2026-15748',
        'chassis-and-subassemblies-thereof-from-the-peoples-republic-of-china-final-results-of-the-expedited-first-sunset',
    ),
    'chassis-cn-sunset-cvd': fr(
        'chassis-cn-sunset-cvd', '91 FR 47814', ITA,
        "Certain Chassis and Subassemblies Thereof From the People's Republic of China: Final Results of the Expedited First Sunset "
        'Review of the Countervailing Duty Order',
        '2026-07-29', '2026-15232',
        'certain-chassis-and-subassemblies-thereof-from-the-peoples-republic-of-china-final-results-of-the-expedited',
    ),
    'itc-chassis-cn-5yr': fr(
        'itc-chassis-cn-5yr', '91 FR 62745', ITC,
        'Chassis and Subassemblies From China; Scheduling of Expedited Five-Year Reviews',
        '2026-10-02', '2026-20201', 'chassis-and-subassemblies-from-china-scheduling-of-expedited-five-year-reviews',
    ),
    'ad-chassis-mtv': fr(
        'ad-chassis-mtv', '91 FR 36806', ITA,
        'Certain Chassis and Subassemblies Thereof From Mexico, Thailand, and the Socialist Republic of Vietnam: Antidumping Duty Orders',
        '2026-06-18', '2026-12330',
        'certain-chassis-and-subassemblies-thereof-from-mexico-thailand-and-the-socialist-republic-of-vietnam',
    ),
    'cvd-chassis-mt': fr(
        'cvd-chassis-mt', '91 FR 36800', ITA,
        'Certain Chassis and Subassemblies Thereof From Mexico and Thailand: Countervailing Duty Orders',
        '2026-06-18', '2026-12329', 'certain-chassis-and-subassemblies-thereof-from-mexico-and-thailand-countervailing-duty-orders',
    ),
    'itc-chassis-mtv': fr(
        'itc-chassis-mtv', '91 FR 35554', ITC,
        'Chassis and Subassemblies From Mexico, Thailand, and Vietnam; Determinations',
        '2026-06-11', '2026-11656', 'chassis-and-subassemblies-from-mexico-thailand-and-vietnam-determinations',
    ),
    # ---------------------------------------------------------------- AD/CVD: wheels
    'adcvd-wheels-cn': fr(
        'adcvd-wheels-cn', '84 FR 24098', ITA,
        "Certain Steel Wheels From the People's Republic of China: Antidumping and Countervailing Duty Orders",
        '2019-05-24', '2019-11015', 'certain-steel-wheels-from-the-peoples-republic-of-china-antidumping-and-countervailing-duty-orders',
    ),
    'wheels-cn-cont': fr(
        'wheels-cn-cont', '89 FR 90665', ITA,
        "Certain Steel Wheels From the People's Republic of China: Continuation of Antidumping Duty and Countervailing Duty Orders",
        '2024-11-18', '2024-26768',
        'certain-steel-wheels-from-the-peoples-republic-of-china-continuation-of-antidumping-duty-and-countervailing',
    ),
    'wheels-cn-circ': fr(
        'wheels-cn-circ', '91 FR 13280', ITA,
        "Certain Steel Wheels From the People's Republic of China: Initiation of Circumvention Inquiries on the Antidumping and "
        'Countervailing Duty Orders',
        '2026-03-19', '2026-05443',
        'certain-steel-wheels-from-the-peoples-republic-of-china-initiation-of-circumvention-inquiries-on-the',
    ),
    'adcvd-trailer-wheels-cn': fr(
        'adcvd-trailer-wheels-cn', '84 FR 45952', ITA,
        "Certain Steel Trailer Wheels 12 to 16.5 Inches From the People's Republic of China: Antidumping Duty and Countervailing Duty "
        'Orders',
        '2019-09-03', '2019-18937',
        'certain-steel-trailer-wheels-12-to-165-inches-from-the-peoples-republic-of-china-antidumping-duty-and',
    ),
    'trailer-wheels-cn-cont': fr(
        'trailer-wheels-cn-cont', '90 FR 13732', ITA,
        "Certain Steel Wheels 12 to 16.5 Inches in Diameter From the People's Republic of China: Continuation of Antidumping Duty Order "
        'and Countervailing Duty Order',
        '2025-03-26', '2025-05113',
        'certain-steel-wheels-12-to-165-inches-in-diameter-from-the-peoples-republic-of-china-continuation-of',
    ),
    # ---------------------------------------------------------------- AD/CVD: brake drums
    'ad-brake-drums': fr(
        'ad-brake-drums', '90 FR 38730', ITA,
        "Certain Brake Drums From the People's Republic of China and the Republic of Türkiye: Antidumping Duty Orders",
        '2025-08-12', '2025-15248',
        'certain-brake-drums-from-the-peoples-republic-of-china-and-the-republic-of-trkiye-antidumping-duty-orders',
    ),
    'cvd-brake-drums': fr(
        'cvd-brake-drums', '90 FR 38753', ITA,
        "Certain Brake Drums From the People's Republic of China and the Republic of Türkiye: Countervailing Duty Orders",
        '2025-08-12', '2025-15249',
        'certain-brake-drums-from-the-peoples-republic-of-china-and-the-republic-of-trkiye-countervailing-duty',
    ),
    'brake-drums-circ': fr(
        'brake-drums-circ', '91 FR 60082', ITA,
        "Certain Brake Drums From the People's Republic of China: Preliminary Affirmative Determination of Circumvention of the "
        'Antidumping Duty and Countervailing Duty Orders',
        '2026-09-22', '2026-19372',
        'certain-brake-drums-from-the-peoples-republic-of-china-preliminary-affirmative-determination-of',
    ),
    # ---------------------------------------------------------------- AD/CVD: hand trucks, golf carts, van trailers
    'ad-hand-trucks': fr(
        'ad-hand-trucks', '91 FR 56632', ITA,
        "Hand Trucks and Certain Parts Thereof From the People's Republic of China: Continuation of Antidumping Duty Order",
        '2026-09-03', '2026-18011',
        'hand-trucks-and-certain-parts-thereof-from-the-peoples-republic-of-china-continuation-of-antidumping',
    ),
    'adcvd-lsptv': fr(
        'adcvd-lsptv', '90 FR 38759', ITA,
        "Certain Low-Speed Personal Transportation Vehicles From the People's Republic of China: Amended Final Antidumping Duty "
        'Determination and Antidumping Duty Order; Amended Final Determination of Countervailing Duty Investigation and Countervailing '
        'Duty Order',
        '2025-08-12', '2025-15244',
        'certain-low-speed-personal-transportation-vehicles-from-the-peoples-republic-of-china-amended-final',
    ),
    'itc-lsptv': fr(
        'itc-lsptv', '90 FR 38176', ITC,
        'Low Speed Personal Transportation Vehicles From China; Determinations',
        '2025-08-07', '2025-14995', 'low-speed-personal-transportation-vehicles-from-china-determinations',
    ),
    'ad-van-trailers-cn': fr(
        'ad-van-trailers-cn', '91 FR 55837', ITA + ', A-570-219',
        "Van-Type Trailers and Subassemblies Thereof From the People's Republic of China: Final Affirmative Determination of Sales at "
        'Less Than Fair Value',
        '2026-08-31', '2026-17750',
        'van-type-trailers-and-subassemblies-thereof-from-the-peoples-republic-of-china-final-affirmative',
    ),
    'cvd-van-trailers-cn': fr(
        'cvd-van-trailers-cn', '91 FR 55840', ITA,
        "Van-Type Trailers and Subassemblies Thereof From the People's Republic of China: Final Affirmative Countervailing Duty "
        'Determination',
        '2026-08-31', '2026-17749',
        'van-type-trailers-and-subassemblies-thereof-from-the-peoples-republic-of-china-final-affirmative',
    ),
    'ad-van-trailers-mx-prelim': fr(
        'ad-van-trailers-mx-prelim', '91 FR 49416', ITA,
        'Van-Type Trailers and Subassemblies Thereof From Mexico: Preliminary Affirmative Determination of Sales at Less Than Fair Value, '
        'Postponement of Final Determination, and Extension of Provisional Measures',
        '2026-08-04', '2026-15764',
        'van-type-trailers-and-subassemblies-thereof-from-mexico-preliminary-affirmative-determination-of-sales',
    ),
    'ad-van-trailers-ca-prelim': fr(
        'ad-van-trailers-ca-prelim', '91 FR 49407', ITA,
        'Van-Type Trailers and Subassemblies Thereof From Canada: Preliminary Affirmative Determination of Sales at Less Than Fair Value, '
        'Postponement of Final Determination, and Extension of Provisional Measures',
        '2026-08-04', '2026-15763',
        'van-type-trailers-and-subassemblies-thereof-from-canada-preliminary-affirmative-determination-of-sales',
    ),
    'cvd-van-trailers-mx-prelim': fr(
        'cvd-van-trailers-mx-prelim', '91 FR 34218', ITA,
        'Certain Van-Type Trailers and Subassemblies Thereof From Mexico: Preliminary Affirmative Countervailing Duty Determination and '
        'Alignment of Final Determination With Final Antidumping Duty Determination',
        '2026-06-05', '2026-11348',
        'certain-van-type-trailers-and-subassemblies-thereof-from-mexico-preliminary-affirmative-countervailing',
    ),
    'itc-van-trailers-schedule': fr(
        'itc-van-trailers-schedule', '91 FR 53422', ITC,
        'Van-Type Trailers and Subassemblies From Canada, China, and Mexico; Revised Schedule for the Subject Investigations',
        '2026-08-18', '2026-16787',
        'van-type-trailers-and-subassemblies-from-canada-china-and-mexico-revised-schedule-for-the-subject',
    ),
}

for _sid, _s in NEW.items():
    assert _sid == _s['id'], _sid


def src(sid):
    if sid in NEW:
        return json.loads(json.dumps(NEW[sid]))
    return json.loads(json.dumps(REF[sid]))


def add_sources(page, ids):
    have = {s['id'] for s in page['sources']}
    for sid in ids:
        if sid not in have:
            page['sources'].append(src(sid))
            have.add(sid)
