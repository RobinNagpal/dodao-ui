import json,sys,urllib.request,urllib.parse
q=sys.argv[1]; since=sys.argv[2] if len(sys.argv)>2 else '2024-06-01'; extra=sys.argv[3:] 
params=[('per_page','50'),('order','newest'),('conditions[term]',q),('conditions[publication_date][gte]',since)]
for f in ['title','publication_date','agency_names','document_number','type','citation','html_url']: params.append(('fields[]',f))
for e in extra: k,v=e.split('=',1); params.append((k,v))
url='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(params)
r=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})))
print('count',r.get('count'))
for x in r.get('results',[]): print(x['publication_date'],x['type'][:6],x['document_number'],x['citation'],'|',','.join(x['agency_names'])[:40],'|',x['title'][:140])
