import sys,urllib.request,re,html,os
# usage: gfr.py YYYY-MM-DD docnum ...
args=sys.argv[1:]
for i in range(0,len(args),2):
    date,n=args[i],args[i+1]
    p=f'g_{n}.txt'
    if not os.path.exists(p):
        u=f'https://www.govinfo.gov/content/pkg/FR-{date}/html/{n}.htm'
        t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode('utf-8','replace')
        t=html.unescape(re.sub(r'<[^>]+>','',t))
        open(p,'w').write(t)
    print('#####',n,os.path.getsize(p))
