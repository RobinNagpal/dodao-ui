import json,sys
d=json.load(open(sys.argv[1]))
ia=d['industryAreas']
for c in ia['countries']:
  if c['country'] in sys.argv[2:]:
    print('==',c['country'], c['rule']['label'])
    for h,cell in c['cells'].items():
      for side in ('withoutUsmca','withUsmca'):
        if side=='withUsmca' and c['country'] not in ('Canada','Mexico'): continue
        for b in cell[side]['breakdown']:
          print('  ',side[:5],h,b['base'],'|',b['extra'],'|',b['preference'],'|',b['total'],b['lineCount'], b['lines'])
