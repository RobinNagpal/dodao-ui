import json,sys,urllib.request,urllib.parse,time,re,collections
def q(params):
    u='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(params)
    for i in range(5):
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (Macintosh)','Accept':'application/json'}),timeout=60).read())
        except Exception as e:
            time.sleep(5*(i+1))
    return {}
if __name__=='__main__':
    for t in sys.argv[1:]:
        p=[('conditions[term]',f'"{t}"'),('conditions[agencies][]','international-trade-administration'),('conditions[publication_date][gte]','2015-01-01'),('per_page','100'),('fields[]','title')]
        d=q(p); c=collections.Counter()
        for x in d.get('results',[]): c[re.split(r':',x['title'])[0][:90]]+=1
        print('==',t,d.get('count'))
        for k,v in c.most_common(10): print('   ',v,k)
        time.sleep(2)
