import re,sys
L=open('/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch99.txt').read().split('\n')
PAT=re.compile(r'\d{4}\.\d{2}\.\d{2}(?:\d{2}(?!\d{2}\.))?')
def region(start, endpat):
    out=[]
    for i in range(start-1, len(L)):
        if i>start and re.match(endpat, L[i]): return out, i+1
        out+=PAT.findall(L[i].replace(' ',''))
    return out, None
R=[('annexII 9903.01.32',17067,r'^\(b\)'),('EU 9903.02.74',17634,r'^\(yy\)|^\(xxi'),('CH/LI',18285,r'^\(c\)'),('s122 9903.03.03',19192,r'^\(iii\)|^\(c\)'),('brazil 50(a)(ii)',36100,r'^\(iii\)'),('338 51(b)',36661,r'^\(c\)'),('52(b)',37069,r'^\(c\)'),('31(b)',34346,r'^\(c\)')]
for name,start,endpat in R:
    codes,end=region(start,endpat)
    print(name,'end',end,sorted(set(c for c in codes if c.startswith('81'))))
