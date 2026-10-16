import json,sys,urllib.request,urllib.parse,time
def search(term,gte='2000-01-01',agency='international-trade-administration',n=20):
    q=[('per_page',str(n)),('order','newest'),('conditions[term]',term),('conditions[publication_date][gte]',gte)]
    if agency: q.append(('conditions[agencies][]',agency))
    for f in ['title','publication_date','citation','document_number','html_url']: q.append(('fields[]',f))
    url='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q)
    for a in range(6):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=60))
        except Exception as e:
            time.sleep(10*(a+1))
    return {}
if __name__=='__main__':
    for term in sys.argv[1:]:
        d=search(term)
        print('##',term,d.get('count'))
        for r in d.get('results',[]):
            print('  ',r['publication_date'],r.get('citation'),r['document_number'],'|',r['title'][:150],'|',r['html_url'])
