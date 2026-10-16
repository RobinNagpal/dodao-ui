import sys,urllib.request,re,os,json
# usage: gi.py docnum pubdate
for arg in sys.argv[1:]:
    dn,pd=arg.split('@')
    out=f'fr_{dn}.txt'
    if os.path.exists(out): continue
    u=f'https://www.govinfo.gov/content/pkg/FR-{pd}/html/{dn}.htm'
    try:
        t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode('utf8','ignore')
    except Exception as e:
        print(dn,'ERR',e); continue
    t=re.sub(r'<[^>]+>','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    open(out,'w').write(t); print(dn,len(t))
