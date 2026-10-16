import json,sys,urllib.request,urllib.parse
q=sys.argv[1]; extra=sys.argv[2:] 
params=[('conditions[term]',q),('per_page','50'),('order','newest'),('fields[]','document_number'),('fields[]','citation'),('fields[]','publication_date'),('fields[]','title'),('fields[]','html_url'),('fields[]','type'),('fields[]','agency_names')]
for e in extra:
    k,v=e.split('=',1); params.append((k,v))
u='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(params)
import time
for i in range(8):
    try:
        r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60)); break
    except Exception as e: time.sleep(10*(i+1))
print(r.get('count'))
for x in r.get('results',[]):
    print(x['publication_date'],x['document_number'],x['citation'],x['type'][:6],'|',x['title'][:170],'|',x['html_url'])
