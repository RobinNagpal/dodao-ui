import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json,sys
WT=IU
m=json.load(open(f'{WT}/src/tariff-data/calculator/measures.json'))['measures']
d=json.load(open('gen.json'))
rows=d['overview']['rateTable']['rows']
L=[r['htsCode10'] for r in rows if r.get('htsCode10')]
def hit(codes,line):
    return any(line.startswith(c.replace('.','')) or line.replace('.','').startswith(c.replace('.','')) for c in codes)
for x in m:
    inc=[c for c in x['coverageInclude'] if c.replace('.','').startswith('90')]
    exc=[c for c in x['coverageExclude'] if c.replace('.','').startswith('90')]
    if inc or exc:
        n=sum(1 for l in L if hit(inc,l) and not hit(exc,l))
        print(x['measureKey'],x['ch99Code'],x['program'],x.get('rateKind'),x.get('ratePct'),x['effectiveFrom'],x['effectiveTo'],'n=',n,'inc',inc[:40],'exc',exc[:10], 'cond',x['conditions'])
