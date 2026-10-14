import json,sys,urllib.request,urllib.parse
term,gte,lte=sys.argv[1:4]
excl=sys.argv[4] if len(sys.argv)>4 else 'administrative review|Opportunity to Request|Initiation of Five-Year|Institution of Five-Year|Scheduling|Initiation of Antidumping and Countervailing Duty Administrative|Changed Circumstances|Preliminary Results'
import re
p=[('per_page','200'),('order','newest'),('conditions[term]','"'+term+'"'),('conditions[publication_date][gte]',gte),('conditions[publication_date][lte]',lte),('conditions[agencies][]','international-trade-administration'),('conditions[agencies][]','international-trade-commission')]
for f in ['document_number','title','publication_date','citation','agency_names']: p.append(('fields[]',f))
u='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(p)
d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})))
print('count',d['count'])
for r in d.get('results',[]):
    if excl and re.search(excl,r['title'],re.I): continue
    print(r['publication_date'],r['document_number'],r['citation'],'|','ITC' if 'Commission' in ','.join(r['agency_names']) else 'ITA','|',r['title'][:200])
