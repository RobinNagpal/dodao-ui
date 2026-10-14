import json,sys
d=json.load(open('gen.json'))
ia=d['industryAreas']
def total(country,hts,side='withoutUsmca'):
    for c in ia['countries']:
        if c['country']!=country: continue
        cell=c['cells'][hts[:4]]
        s=cell.get(side) or cell.get('withUsmca')
        for b in s['breakdown']:
            if hts in b['lines']: return b['total'], b['extra']
for a in sys.argv[1:]:
    c,h=a.split(':'); side='withoutUsmca'
    if h.endswith('U'): h=h[:-1]; side='withUsmca'
    print(c,h,side,total(c,h,side))
