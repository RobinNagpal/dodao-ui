import json,sys,urllib.request,urllib.parse,re
import os; AG=os.environ.get('AG','international-trade-administration'); term=sys.argv[1]; gte=sys.argv[2]; pat=re.compile(sys.argv[3],re.I); skip=re.compile(sys.argv[4],re.I) if len(sys.argv)>4 else None
seen=0
for page in range(1,20):
    q=[('per_page','100'),('page',str(page)),('order','newest'),('conditions[term]',term),('conditions[publication_date][gte]',gte),('conditions[agencies][]',AG)]
    for f in ['title','publication_date','citation','document_number','html_url','type']: q.append(('fields[]',f))
    u='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q)
    import time
    for k in range(8):
        try:
            d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60)); break
        except Exception as e:
            time.sleep(15*(k+1))
    res=d.get('results',[])
    for r in res:
        if pat.search(r['title']) and not (skip and skip.search(r['title'])):
            print(r['publication_date'],r['citation'],r['document_number'],'|',r['title'][:230])
    if len(res)<100: break
