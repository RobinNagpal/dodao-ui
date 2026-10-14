import re,html,sys
f,secs=sys.argv[1],sys.argv[2:]
x=open(f).read()
for s in secs:
    m=re.search(r'<DIV8 N="%s"[^>]*>(.*?)</DIV8>'%re.escape(s),x,re.S)
    if not m: print('NOT FOUND',s); continue
    t=html.unescape(re.sub(r'<[^>]+>',' ',m.group(1))); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    print('#####',s,len(t)); print(t[:int(sys.argv[0] and 6000)])
