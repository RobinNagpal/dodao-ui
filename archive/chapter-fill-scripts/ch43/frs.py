import json,sys,urllib.parse,subprocess
term=sys.argv[1]; since=sys.argv[2] if len(sys.argv)>2 else '2025-01-01'
extra=sys.argv[3:]  # e.g. type=PRESDOCU
q=[('per_page','100'),('order','newest'),('conditions[term]',term),('conditions[publication_date][gte]',since)]
for e in extra:
    k,v=e.split('=',1); q.append((f'conditions[{k}][]' if k in('type','agencies') else f'conditions[{k}]',v))
for f in ['document_number','title','publication_date','citation','html_url','agencies','type','signing_date']:
    q.append(('fields[]',f))
url='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q)
x=subprocess.run(['curl','-s','-A','Mozilla/5.0',url],capture_output=True,text=True).stdout
d=json.loads(x)
print('count',d.get('count'))
for r in d.get('results',[]):
    print(r['publication_date'],r.get('signing_date'),r['citation'],r['document_number'],r['type'][:6],(r['agencies'][0]['name'] if r['agencies'] else '')[:22],'|',r['title'][:150],'|',r['html_url'])
