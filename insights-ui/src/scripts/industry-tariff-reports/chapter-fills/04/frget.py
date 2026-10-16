import json,sys,urllib.request,re,html,os,time
for doc in sys.argv[1:]:
    out=f'fr/{doc}.txt'
    if os.path.exists(out) and os.path.getsize(out)>4000: continue
    m=json.load(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{doc}.json?fields[]=title&fields[]=citation&fields[]=publication_date&fields[]=signing_date&fields[]=effective_on&fields[]=html_url',headers={'User-Agent':'Mozilla/5.0'})))
    d=m['publication_date']
    u=f'https://www.govinfo.gov/content/pkg/FR-{d}/html/{doc}.htm'
    try:
        raw=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode('utf-8','ignore')
    except Exception as e:
        print(doc,'ERR',e); continue
    raw=html.unescape(re.sub(r'<[^>]+>','',raw))
    open(out,'w').write(f"TITLE: {m['title']}\nCIT: {m['citation']}\nPUB: {d}\nSIGNED: {m.get('signing_date')}\nEFF: {m.get('effective_on')}\nURL: {m['html_url']}\n\n"+raw)
    print(doc, m['citation'], d, len(raw)); time.sleep(0.5)
