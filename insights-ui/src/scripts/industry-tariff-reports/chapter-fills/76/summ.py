import json,sys
d=json.load(open(sys.argv[1]))
ia=d['industryAreas']
only=sys.argv[2:] 
for c in ia['countries']:
    if only and c['country'] not in only: continue
    print('=====',c['country'], c['rule']['kind'])
    for h,cell in c['cells'].items():
        for side in ['withUsmca','withoutUsmca']:
            if side not in cell: continue
            for b in cell[side]['breakdown']:
                print(f"  {h} {side[:8]} base={b['base']} extra={b['extra']} total={b['total']} n={b['lineCount']} lines={','.join(x[:10] for x in b['lines'][:6])}")
