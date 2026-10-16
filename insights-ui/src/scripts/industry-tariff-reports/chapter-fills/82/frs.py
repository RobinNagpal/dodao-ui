import json,sys,urllib.request,urllib.parse
q=sys.argv[1]; extra=sys.argv[2] if len(sys.argv)>2 else ''
u='https://www.federalregister.gov/api/v1/documents.json?per_page=100&order=newest&fields[]=document_number&fields[]=citation&fields[]=publication_date&fields[]=title&fields[]=type&fields[]=html_url&conditions[term]='+urllib.parse.quote(q)+extra
r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60))
print(r.get('count'))
for x in r.get('results',[]):
    print(x['publication_date'],x['document_number'],x['citation'],x['type'][:6],'|',x['title'][:150])
