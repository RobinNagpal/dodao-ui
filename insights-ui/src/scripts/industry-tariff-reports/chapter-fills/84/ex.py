import json,sys,urllib.request,urllib.parse,time,re
# usage: ex.py docnum date term [term...]
dn,date=sys.argv[1:3]
for term in sys.argv[3:]:
  p=[('per_page','100'),('conditions[term]',term),('conditions[publication_date][is]',date),('fields[]','document_number'),('fields[]','excerpts')]
  d=json.load(urllib.request.urlopen(urllib.request.Request('https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(p),headers={'User-Agent':'Mozilla/5.0'})))
  hit=[r for r in d.get('results',[]) if r['document_number']==dn]
  ex=re.sub(r'<[^>]+>','',hit[0]['excerpts']) if hit else 'NO MATCH'
  print(f'[{dn} {term}]',ex)
  time.sleep(0.4)
