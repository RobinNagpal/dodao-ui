import json,sys,urllib.request,re,os
for dn in sys.argv[1:]:
    out=f'fr_{dn}.txt'
    if os.path.exists(out): continue
    meta=json.load(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{dn}.json',headers={'User-Agent':'Mozilla/5.0'})))
    t=urllib.request.urlopen(urllib.request.Request(meta['raw_text_url'],headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf8','ignore')
    t=re.sub(r'<[^>]+>','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    open(out,'w').write(f"{meta['citation']} | {meta['publication_date']} | {meta['title']} | {meta['html_url']}\n"+t)
    print(dn,meta['citation'],len(t))
