import json,sys
d=json.load(open(sys.argv[1]))
want=sys.argv[3:]
for c in d['industryAreas']['countries']:
    if c['country']!=sys.argv[2]: continue
    for h,cell in c['cells'].items():
        for side in ('withoutUsmca','withUsmca'):
            for b in cell[side]['breakdown']:
                for l in b['lines']:
                    if any(l.startswith(w) for w in want):
                        print(side[:7],l,'| base',b['base'],'| extra',b['extra'],'| pref',b['preference'],'| total',b['total'])
