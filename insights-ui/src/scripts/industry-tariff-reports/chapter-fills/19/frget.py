# usage: python3 frget.py DOCNUM [DOCNUM...]  -> fr/<doc>.txt (govinfo html stripped) + fr/<doc>.meta.json
import sys,json,re,html,urllib.request,os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'fr')
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read().decode('utf-8','replace')
for doc in sys.argv[1:]:
    meta=json.loads(get(f'https://www.federalregister.gov/api/v1/documents/{doc}.json?fields[]=title&fields[]=publication_date&fields[]=citation&fields[]=html_url&fields[]=signing_date&fields[]=effective_on&fields[]=type&fields[]=agencies&fields[]=executive_order_number&fields[]=proclamation_number'))
    json.dump(meta,open(f'{D}/{doc}.meta.json','w'),indent=1)
    pd=meta['publication_date']
    try:
        s=get(f'https://www.govinfo.gov/content/pkg/FR-{pd}/html/{doc}.htm')
        s=html.unescape(re.sub('<[^>]+>','',s))
    except Exception as e:
        s=f'ERR {e}'
    open(f'{D}/{doc}.txt','w').write(s)
    print(doc, pd, meta['citation'], len(s), meta['title'][:120])
