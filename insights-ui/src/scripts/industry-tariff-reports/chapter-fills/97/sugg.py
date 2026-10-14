import json,urllib.request,urllib.parse,sys,time
seeds=[l.strip() for l in open(sys.argv[1]) if l.strip()]
out={}
for s in seeds:
    u='https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q='+urllib.parse.quote(s)
    try:
        r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=15).read().decode('utf-8','replace'))
        out[s]=r[1]
    except Exception as e:
        out[s]=str(e)
    print(s,'=>',out[s]); time.sleep(0.4)
json.dump(out,open('sugg_%d.json'%int(time.time()),'w'),indent=1)
