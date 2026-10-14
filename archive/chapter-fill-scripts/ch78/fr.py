import json,sys,urllib.request,urllib.parse,time
term=sys.argv[1]; gte=sys.argv[2] if len(sys.argv)>2 else '2026-08-01'
extra=sys.argv[3:]
q=[('per_page','100'),('order','newest'),('conditions[term]',term),('conditions[publication_date][gte]',gte)]
for e in extra:
  k,v=e.split('=',1); q.append((k,v))
for f in ['title','publication_date','citation','document_number','html_url','type','signing_date','presidential_document_number','agencies']:
  q.append(('fields[]',f))
url='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q)
for i in range(8):
  try:
    d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60)); break
  except Exception as e:
    time.sleep(10*(i+1))
print('count',d.get('count'))
for r in d.get('results',[]):
  ag=','.join(a.get('name') or a.get('raw_name','') for a in r.get('agencies',[]))[:40]
  print(r['publication_date'],r.get('citation'),r['type'],r.get('presidential_document_number') or '', r.get('signing_date') or '','|',ag,'|',r['title'][:160],'|',r['html_url'])
