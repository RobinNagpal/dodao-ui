import re,sys
L=open('c99r21.txt').read().split('\n')
note=None;sub=None;page=None
code=re.compile(r'(?<!\d)(96[0-2]\d\.\d{2}(?:\.\d{2}(?:\d{2})?)?)')
start=int(sys.argv[1]) if len(sys.argv)>1 else 0
for i,s in enumerate(L):
    m=re.match(r'^(\d{1,2})\.(\s|$)',s)
    if m and i>20000: note=m.group(1)
    m2=re.match(r'^\(([a-z]{1,4}|[ivx]+)\)\s',s)
    if m2: sub=(m2.group(1), s[:100])
    m3=re.match(r'<<PAGE (\d+)>>',s)
    if m3: page=m3.group(1)
    if s.startswith('9903.') : continue
    for c in code.findall(s):
        print(i+1,'page',page,'note',note,'sub',sub,'|',c,'|',s[:140])
