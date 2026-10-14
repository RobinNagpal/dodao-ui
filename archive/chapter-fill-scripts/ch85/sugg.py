import json,sys,time,urllib.request,urllib.parse
seeds=sys.argv[1:]
out={}
for s in seeds:
    url='https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q='+urllib.parse.quote(s)
    try:
        r=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=20)
        d=json.loads(r.read().decode('utf-8','ignore')); out[s]=d[1]
    except Exception as e: out[s]=['ERR '+str(e)]
    print(s,'=>',out[s]); time.sleep(0.6)
json.dump(out,open('sugg-%d.json'%int(time.time()),'w'),indent=1)
