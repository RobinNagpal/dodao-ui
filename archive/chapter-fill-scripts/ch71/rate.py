import json,sys
d=json.load(open(sys.argv[1]))
ia=d['industryAreas']
def rate(country,hts,usmca=False):
    for c in ia['countries']:
        if c['country']!=country: continue
        h=hts[:4]; cell=c['cells'].get(h)
        if not cell: return None
        side=cell.get('withUsmca' if usmca else 'withoutUsmca') or cell.get('rates') or cell
        for b in side['breakdown']:
            if hts in b['lines']: return (b['base'],b['extra'],b['preference'],b['total'])
    return None
for q in sys.argv[2:]:
    parts=q.split(':'); u=len(parts)>2
    print(q, rate(parts[0],parts[1],u))
