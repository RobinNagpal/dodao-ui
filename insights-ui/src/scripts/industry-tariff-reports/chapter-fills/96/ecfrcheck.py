import json,sys
idx={}
def walk(n,t):
    if n.get('type') in ('section','part'):
        idx[(t,n['type'],n['identifier'])]=n.get('label_description') or n.get('label')
    for c in n.get('children',[]) or []: walk(c,t)
for t in (16,19,21,49,50):
    walk(json.load(open(f'struct-{t}.json')),t)
for spec in sys.argv[1:]:
    t,s=spec.split(':'); t=int(t)
    k='section' if '.' in s else 'part'
    print(spec, idx.get((t,k,s),'MISSING'))
