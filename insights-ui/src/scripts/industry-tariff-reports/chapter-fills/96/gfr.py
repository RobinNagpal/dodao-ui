import json,sys,urllib.request,re,os
for dn in sys.argv[1:]:
    out=f'fr_{dn}.txt'
    if os.path.exists(out) and os.path.getsize(out)>3000: continue
    meta=json.load(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=citation&fields[]=publication_date&fields[]=title&fields[]=html_url',headers={'User-Agent':'Mozilla/5.0'})))
    d=meta['publication_date']
    u=f'https://www.govinfo.gov/content/pkg/FR-{d}/html/{dn}.htm'
    try:
        t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode('utf8','ignore')
    except Exception as e:
        print(dn,'ERR',e); continue
    t=re.sub(r'<[^>]+>','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    open(out,'w').write(f"{meta['citation']} | {d} | {meta['title']} | {meta['html_url']}\n"+t)
    print(dn,meta['citation'],len(t))
