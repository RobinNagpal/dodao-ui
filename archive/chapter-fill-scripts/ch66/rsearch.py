import json,urllib.request,urllib.parse,sys,time
for q in sys.argv[1:]:
    u='https://rulings.cbp.gov/api/search?'+urllib.parse.urlencode({'term':q,'collection':'ALL','commodityGrouping':'ALL','pageSize':12,'page':1,'sortBy':'DATE_DESC'})
    r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read())
    print('#####',q,r.get('totalHits'))
    for x in r['rulings']:
        print(' ',x['rulingNumber'],x['rulingDate'][:10],x['tariffs'],'|',x['subject'][:140].replace('\n',' '),'| revokedBy',x['revokedBy'],'modBy',x['modifiedBy'])
    time.sleep(0.5)
