"""FR API search with 429 backoff. usage: fr.py TERM GTE [k=v ...]  |  fr.py --doc NUM [NUM...]"""
import json,sys,urllib.request,urllib.parse,time,random
def get(url):
    for i in range(30):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (koala research)'})
            return json.load(urllib.request.urlopen(req,timeout=60))
        except urllib.error.HTTPError as e:
            if e.code==429: time.sleep(10+random.random()*20); continue
            raise
    raise SystemExit('gave up')
F=['title','publication_date','citation','document_number','html_url','type','signing_date','presidential_document_number','agencies','effective_on']
if sys.argv[1]=='--doc':
    for n in sys.argv[2:]:
        q=[('fields[]',f) for f in F]
        r=get(f'https://www.federalregister.gov/api/v1/documents/{n}.json?'+urllib.parse.urlencode(q))
        print(r['publication_date'],r.get('citation'),r['type'],r.get('signing_date') or '',r.get('effective_on') or '','|',r['title'][:200],'|',r['html_url'])
    sys.exit()
term=sys.argv[1]; gte=sys.argv[2]
q=[('per_page','100'),('order','newest'),('conditions[term]',term),('conditions[publication_date][gte]',gte)]
for e in sys.argv[3:]:
    k,v=e.split('=',1); q.append((k,v))
for f in F: q.append(('fields[]',f))
d=get('https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q))
print('count',d.get('count'))
for r in d.get('results',[]):
    ag=','.join(a.get('name') or a.get('raw_name','') for a in r.get('agencies',[]))[:40]
    print(r['publication_date'],r.get('citation'),r['type'],r['document_number'],'|',ag,'|',r['title'][:170],'|',r['html_url'])
