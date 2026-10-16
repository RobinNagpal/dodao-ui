import re,sys
f=sys.argv[1]; pre=sys.argv[2]
rx=re.compile(r'\d{4}\.\d{2}\.\d{2}(?:\d{2})?(?=\d{4}\.\d{2}|\s|$|\)|,|;)')
note='';sub='';last=''
for i,l in enumerate(open(f),1):
    s=l.strip()
    m=re.match(r'^(\d+)\.\s*(\(a\))?',s)
    if m and (s.endswith('.') and len(s)<5 or m.group(2)): note=m.group(1); sub=''
    m2=re.match(r'^\(([a-z]{1,2}|[ivx]+|\d+)\)',s)
    if m2: sub=s[:90]
    if re.match(r'^9903\.\d\d\.\d\d',s) or re.search(r'\.\.\.\s*\d/?9903',s): last=s[:60]
    cs=[c for c in rx.findall(s) if c.startswith(pre)]
    cs+= [c for c in re.findall(r'(?<![\d.])(\d{4}\.\d{2}(?:\.\d{2}(?:\d{2})?)?)(?![\d])',s) if c.startswith(pre) and c not in cs and len(c)<=10]
    if cs: print(i,'| note',note,'|',sub,'|',cs)
