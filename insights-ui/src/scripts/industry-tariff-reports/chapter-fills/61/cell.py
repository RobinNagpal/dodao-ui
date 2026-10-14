import json,sys
d=json.load(open(sys.argv[1]))
def find(country, hts, side='withUsmca'):
    for c in d['industryAreas']['countries']:
        if c['country']!=country: continue
        cell=c['cells'].get(hts[:4])
        if not cell: return None
        for b in (cell.get(side) or {}).get('breakdown',[]):
            if any(l.startswith(hts) for l in b['lines']): return (b['base'],b['extra'],b['preference'],b['total'])
for q in sys.argv[2:]:
    country,hts=q.split(':')
    print(country,hts,'with',find(country,hts),'| without',find(country,hts,'withoutUsmca'))
