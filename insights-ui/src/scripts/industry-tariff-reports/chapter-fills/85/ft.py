import json,sys,urllib.request,re,os,time
# usage: ft.py docnum [docnum...]  -> fr_<doc>.txt from govinfo (FR API for metadata)
UA={'User-Agent':'Mozilla/5.0'}
for dn in sys.argv[1:]:
    out=f'fr_{dn}.txt'
    if os.path.exists(out) and os.path.getsize(out)>3000: continue
    meta=json.load(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=citation&fields[]=publication_date&fields[]=title&fields[]=html_url&fields[]=signing_date&fields[]=presidential_document_number',headers=UA),timeout=60))
    pd=meta['publication_date']
    u=f'https://www.govinfo.gov/content/pkg/FR-{pd}/html/{dn}.htm'
    try:
        t=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=90).read().decode('utf8','ignore')
    except Exception as e:
        print(dn,'ERR',e); continue
    t=re.sub(r'<[^>]+>','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
    open(out,'w').write(f"{meta['citation']} | {pd} | signed {meta.get('signing_date')} | {meta['title']} | {meta['html_url']}\n"+t)
    print(dn,meta['citation'],pd,len(t))
