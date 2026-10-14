import re,sys
# usage: codes.py file prefix -> prints line no, section header, codes with prefix
f=sys.argv[1]; pre=sys.argv[2]
rx=re.compile(r'\d{4}\.\d{2}\.\d{2}(?:\d{2})?(?=\d{4}\.\d{2}|\s|$|\))')
hdr=''
for i,l in enumerate(open(f),1):
    m=re.match(r'^\(([a-z]+|[ivx]+)\)',l.strip())
    if m or re.match(r'^\d+\.\s*$',l.strip()) : hdr=f'{i}:{l.strip()[:110]}'
    cs=[c for c in rx.findall(l) if c.startswith(pre)]
    # also 8-digit in prose
    cs+= [c for c in re.findall(r'\b(\d{4}\.\d{2}\.\d{2}(?:\d{2})?)\b',l) if c.startswith(pre) and c not in cs]
    if cs: print(i,'|',hdr,'|',cs)
