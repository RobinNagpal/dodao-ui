import sys,json,urllib.request,urllib.parse
q=sys.argv[1]; extra=sys.argv[2] if len(sys.argv)>2 else ''
url='https://www.federalregister.gov/api/v1/documents.json?per_page=40&order=newest&conditions[term]='+urllib.parse.quote(q)+extra+'&fields[]=title&fields[]=publication_date&fields[]=document_number&fields[]=citation&fields[]=type&fields[]=html_url&fields[]=signing_date&fields[]=presidential_document_number'
r=json.load(urllib.request.urlopen(url))
print(r.get('count'))
for d in r['results']:
    print(d['publication_date'],d['document_number'],d.get('citation'),d['type'][:6],d.get('presidential_document_number') or '', d['title'][:150])
