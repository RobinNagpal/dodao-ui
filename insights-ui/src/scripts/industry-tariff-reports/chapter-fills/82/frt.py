import json,sys,urllib.request,urllib.parse
q=sys.argv[1]; must=sys.argv[2].lower()
page=1;n=0
while page<=10:
    u='https://www.federalregister.gov/api/v1/documents.json?per_page=100&page=%d&order=newest&fields[]=document_number&fields[]=citation&fields[]=publication_date&fields[]=title&fields[]=type&conditions[term]=%s'%(page,urllib.parse.quote(q))
    r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60))
    for x in r.get('results',[]):
        if must in x['title'].lower():
            print(x['publication_date'],x['document_number'],x['citation'],'|',x['title'][:170]); n+=1
    if not r.get('next_page_url'): break
    page+=1
