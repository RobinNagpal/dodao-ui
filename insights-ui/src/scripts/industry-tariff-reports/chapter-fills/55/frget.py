import json,sys,urllib.request,os,re,html
for dn in sys.argv[1:]:
  out=f'fr/{dn}.txt'
  if os.path.exists(out) and os.path.getsize(out)>4000: continue
  u=f'https://www.federalregister.gov/api/v1/documents/{dn}.json'
  m=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})))
  meta={k:m.get(k) for k in ['title','citation','publication_date','signing_date','html_url','document_number','type','effective_on','presidential_document_number']}
  json.dump(meta,open(f'fr/{dn}.meta.json','w'),indent=1)
  g=f"https://www.govinfo.gov/content/pkg/FR-{m['publication_date']}/html/{dn}.htm"
  try:
    t=urllib.request.urlopen(urllib.request.Request(g,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf-8','replace')
  except Exception as e:
    print('ERR',dn,g,e); continue
  t=html.unescape(re.sub('<[^>]+>','',t))
  open(out,'w').write(t)
  print(dn, meta['citation'], meta['publication_date'], len(t), meta['html_url'])
