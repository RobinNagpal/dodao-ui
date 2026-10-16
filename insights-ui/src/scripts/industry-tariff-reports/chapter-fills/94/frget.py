import json,urllib.request,sys,re,html
import time
def getj(u):
    for i in range(8):
        try: return json.loads(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read())
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(15*(i+1)); continue
            raise
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'}
for dn in sys.argv[1:]:
    u=f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=citation&fields[]=publication_date&fields[]=signing_date&fields[]=title&fields[]=html_url&fields[]=type&fields[]=effective_on'
    d=getj(u)
    g=f"https://www.govinfo.gov/content/pkg/FR-{d['publication_date']}/html/{dn}.htm"
    try:
        t=urllib.request.urlopen(urllib.request.Request(g,headers=UA),timeout=60).read().decode('utf-8','replace')
        t=html.unescape(re.sub(r'<[^>]+>','',t))
    except Exception as e: t='ERR '+str(e)
    open(f'{dn}.txt','w').write(json.dumps(d)+'\n'+t)
    print(dn,d['citation'],d['publication_date'],len(t),d['title'][:90])
