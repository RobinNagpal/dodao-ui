import json,sys,urllib.request,urllib.parse
q=sys.argv[1]
u='https://www.federalregister.gov/api/v1/documents.json?per_page=100&order=newest&fields[]=document_number&fields[]=citation&fields[]=publication_date&fields[]=title&conditions[publication_date][gte]=2023-01-01&conditions[term]='+urllib.parse.quote(q)
r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60))
print(q, r.get('count'))
for x in r.get('results',[]): print(' ',x['publication_date'],x['document_number'],'|',x['title'][:140])
