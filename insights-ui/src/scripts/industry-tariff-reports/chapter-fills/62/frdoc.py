import json,urllib.request,sys,re,html
for dn in sys.argv[1:]:
    u=f'https://www.federalregister.gov/api/v1/documents/{dn}.json'
    from frq import get; r=json.loads(get(u))
    meta={k:r.get(k) for k in ['document_number','citation','publication_date','signing_date','effective_on','title','html_url','type']}
    json.dump(meta,open(f'{dn}.meta.json','w'))
    g=f"https://www.govinfo.gov/content/pkg/FR-{r['publication_date']}/html/{dn}.htm"
    try:
        t=urllib.request.urlopen(urllib.request.Request(g,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode('utf-8','replace')
        t=html.unescape(re.sub(r'<[^>]+>','',t))
    except Exception as e: t='ERR '+str(e)
    open(f'{dn}.txt','w').write(t)
    print(json.dumps(meta), len(t))
