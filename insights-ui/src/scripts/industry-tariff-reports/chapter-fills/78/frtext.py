import json,sys,urllib.request,re,os,time
def get(u):
    for i in range(8):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
        except Exception as e: time.sleep(10*(i+1))
    raise SystemExit('fail '+u)
for dn in sys.argv[1:]:
    out=f'fr_{dn}.txt'
    if os.path.exists(out): continue
    meta=json.loads(get(f'https://www.federalregister.gov/api/v1/documents/{dn}.json'))
    t=get(meta['raw_text_url']).decode('utf8','ignore')
    t=re.sub(r'<[^>]+>','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    open(out,'w').write(f"{meta['citation']} | {meta['publication_date']} | {meta['title']} | {meta['html_url']}\n"+t)
    print(dn,meta['citation'],len(t))
