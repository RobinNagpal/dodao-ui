import json,urllib.request,urllib.parse,sys,time
def get(url):
    for i in range(8):
        try: return json.loads(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read())
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(15*(i+1)); continue
            raise
term=sys.argv[1]; since=sys.argv[2] if len(sys.argv)>2 else '2024-01-01'
q={'conditions[term]':term,'conditions[publication_date][gte]':since,'per_page':'100','order':'newest',
   'fields[]':['document_number','publication_date','title','citation','html_url','type']}
if len(sys.argv)>3: q['conditions[agencies][]']=sys.argv[3]
r=get('https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q,doseq=True))
print('##',term,r.get('count'))
for d in r.get('results',[]):
    print(d['publication_date'],d['document_number'],d['citation'],'|',d['title'][:170])
