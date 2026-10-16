import json,sys,urllib.request,os,re,html
os.makedirs('fr',exist_ok=True)
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
for dn in sys.argv[1:]:
    p=f'fr/{dn}.txt'
    if os.path.exists(p) and os.path.getsize(p)>2000 and b'Request Access' not in open(p,'rb').read(): continue
    try:
        meta=json.loads(get(f'https://www.federalregister.gov/api/v1/documents/{dn}.json'))
        open(f'fr/{dn}.meta.json','w').write(json.dumps({k:meta.get(k) for k in ('document_number','citation','publication_date','title','html_url','type','signing_date','effective_on')}))
        g=f"https://www.govinfo.gov/content/pkg/FR-{meta['publication_date']}/html/{dn}.htm"
        t=get(g).decode('utf8','replace')
        t=html.unescape(re.sub(r'<[^>]+>','',t))
        open(p,'w').write(t)
    except Exception as e: print('ERR',dn,e)
