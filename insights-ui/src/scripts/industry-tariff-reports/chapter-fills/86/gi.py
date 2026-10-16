import json,sys,urllib.request,re,os,time
def op(req,timeout=60):
    for i in range(8):
        try: return urllib.request.urlopen(req,timeout=timeout)
        except urllib.error.HTTPError as e:
            if e.code in (429,503): time.sleep(10*(i+1)); continue
            raise
    raise RuntimeError('retries')
for dn in sys.argv[1:]:
    out=f'gi_{dn}.txt'
    if os.path.exists(out): continue
    meta=json.load(op(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=publication_date&fields[]=citation&fields[]=title&fields[]=html_url',headers={'User-Agent':'Mozilla/5.0'})))
    u=f"https://www.govinfo.gov/content/pkg/FR-{meta['publication_date']}/html/{dn}.htm"
    t=op(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode('utf8','ignore')
    t=re.sub(r'<[^>]+>','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    open(out,'w').write(f"{meta['citation']} | {meta['publication_date']} | {meta['title']} | {meta['html_url']}\n"+t)
    print(dn,meta['citation'],len(t))
