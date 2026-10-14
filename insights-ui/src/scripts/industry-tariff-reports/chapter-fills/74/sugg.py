import json,urllib.request,urllib.parse,time,sys
seeds=sys.argv[1:]
out={}
for s in seeds:
    u='https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q='+urllib.parse.quote(s)
    try:
        r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read().decode('utf-8','replace'))
        out[s]=r[1]
    except Exception as e: out[s]=['ERR '+str(e)]
    print(s,'=>',out[s]); time.sleep(0.4)
json.dump(out,open('sugg_%d.json'%int(time.time()),'w'),indent=1)
