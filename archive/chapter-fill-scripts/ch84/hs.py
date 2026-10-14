import json,sys,urllib.request,urllib.parse,re,time
heads=sys.argv[1:]
for h in heads:
  out={}
  for page in (1,2,3):
    p=[('per_page','100'),('page',str(page)),('order','newest'),('conditions[term]',h),('conditions[publication_date][gte]','2019-01-01'),('conditions[agencies][]','international-trade-administration')]
    for f in ['document_number','title','publication_date','citation']: p.append(('fields[]',f))
    try:
      d=json.load(urllib.request.urlopen(urllib.request.Request('https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(p),headers={'User-Agent':'Mozilla/5.0'})))
    except Exception as e: print(h,'ERR',e); break
    for r in d.get('results',[]):
      t=r['title']
      if re.search(r'Continuation|Order|Revocation|Initiation of (Less|Countervailing)|Initiation of a Less',t) and not re.search(r'Administrative Review|Opportunity|Advance Notification|Five-Year \(Sunset\)',t):
        name=re.split(r':',t)[0]
        out.setdefault(name,[]).append((r['publication_date'],r['document_number']))
    if not d.get('next_page_url'): break
    time.sleep(0.5)
  print('###',h,'total',d.get('count'))
  for k,v in out.items(): print('   ',k[:120],'|',v[0])
