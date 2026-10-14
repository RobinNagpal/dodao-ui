import json,sys
d=json.load(open(sys.argv[1]))
ia=d['industryAreas']; C={c['country']:c for c in ia['countries']}
rows={r['hts']:r for r in d['overview']['rateTable']['rows'] if r['htsCode10']}
def find(cn,hts):
    c=C[cn]; h=hts[:4]; cell=c['cells'].get(h)
    out={}
    for side in ('withUsmca','withoutUsmca'):
        for b in cell[side]['breakdown']:
            if hts in b['lines']: out[side]=(b['base'],b['extra'],b['preference'],b['total'])
    return out
for arg in sys.argv[2:]:
    cn,hts=arg.split('@')
    r=rows.get(hts)
    print(cn,hts,(r['description'][:60],r['effectiveGeneral'],r['effectiveSpecial']) if r else 'NO ROW'); 
    for k,v in find(cn,hts).items(): print('   ',k,v)
