import re,sys
lines=open(sys.argv[1]).read().split('\n')
hdr=re.compile(r'^(\d{1,2}\.\s*\([a-z]+\)|\([a-z]{1,4}\)\s|\(\d+\)\s|\([ivx]+\)\s|9903\.\d\d\.\d\d)')
last=[]
res={}
for i,l in enumerate(lines):
    if hdr.match(l): last.append((i+1,l[:150]))
    toks=re.findall(r'\d{4}\.\d{2}(?:\.\d{2})?',l)
    hit=[t for t in toks if re.match(r'350[1-7]',t)]
    if hit:
        # nearest headers
        ctx=[h for h in last[-3:]]
        key=ctx[-1] if ctx else None
        res.setdefault(key,[]).extend(hit)
for k,v in res.items():
    print(k); print('   ',sorted(set(v)))
