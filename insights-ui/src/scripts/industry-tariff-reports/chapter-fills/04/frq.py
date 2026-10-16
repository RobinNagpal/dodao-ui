import json,sys,urllib.request,urllib.parse
# usage: frq.py term gte lte [agency]
term,gte,lte=sys.argv[1:4]
q=[('conditions[term]',term),('conditions[publication_date][gte]',gte),('conditions[publication_date][lte]',lte),('per_page','50'),('order','oldest')]
if len(sys.argv)>4: q.append(('conditions[agencies][]',sys.argv[4]))
for f in ['title','publication_date','document_number','citation','html_url','type']: q.append(('fields[]',f))
u='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q)
d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})))
print('count',d.get('count'))
for r in d.get('results',[]): print(r['publication_date'],r['document_number'],r['citation'],r['type'][:6],'|',r['title'][:150],'|',r['html_url'])
