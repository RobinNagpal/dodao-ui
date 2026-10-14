import json,sys,urllib.parse,urllib.request
def q(term, gte='2025-01-01', agency=None, n=40, typ=None):
    p=[('conditions[term]',term),('conditions[publication_date][gte]',gte),('per_page',str(n)),('order','newest')]
    if agency: p.append(('conditions[agencies][]',agency))
    if typ: p.append(('conditions[type][]',typ))
    url='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(p)
    d=json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})))
    print('==',term,agency or '', d.get('count'))
    for r in d.get('results',[]): print(' ',r['publication_date'],r['document_number'],r['type'],'|',r['title'][:170])
if __name__=='__main__':
    a=sys.argv[1:]
    q(a[0], a[1] if len(a)>1 else '2025-01-01', a[2] if len(a)>2 and a[2] else None)
