import json,urllib.request,sys,re,html,os
for n in sys.argv[1:]:
    p=f'fr_{n}.txt'
    if not os.path.exists(p):
        m=json.loads(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{n}.json',headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read())
        t=urllib.request.urlopen(urllib.request.Request(m['raw_text_url'],headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode('utf-8','replace')
        t=html.unescape(re.sub(r'<[^>]+>','',t))
        open(p,'w').write(json.dumps({k:m.get(k) for k in ['title','citation','publication_date','signing_date','effective_on','html_url','type','document_number','comments_close_on','agencies']},default=str)[:1500]+'\n\n'+t)
    print('#####',n,os.path.getsize(p))
