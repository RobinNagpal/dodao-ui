import json, sys, time, urllib.request, urllib.parse
qs=[l.strip() for l in open('lines10.txt')]+"5603.92.0090 5603.12.0090 5603.14.9090 5603.94.9090 5607.49.1500 5607.50.4000 5609.00.3000 5609.00.4000".split()
out={}
for q in qs:
    params=[('conditions[term]',q),('conditions[agencies][]','international-trade-administration'),('per_page','20'),('fields[]','title'),('fields[]','publication_date'),('fields[]','document_number'),('order','newest')]
    url='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(params)
    for i in range(5):
        try:
            d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30)); break
        except Exception as e:
            time.sleep(3*(i+1))
    else:
        print(q,'FAIL'); continue
    titles=sorted(set((r['publication_date'],r['title'][:90]) for r in d.get('results',[])),reverse=True)
    if d.get('count'):
        print(q,d['count'],titles[:3])
    time.sleep(0.7)
