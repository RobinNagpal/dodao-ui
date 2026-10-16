import json,urllib.request,urllib.parse,sys,time
out={}
for q in sys.argv[1:]:
    u='https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q='+urllib.parse.quote(q)
    try:
        r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf-8','ignore'))
        out[q]=r[1]
    except Exception as e: out[q]=str(e)
    time.sleep(0.3)
for k,v in out.items(): print(k,'=>',v)
json.dump(out,open('sugg-%d.json'%int(time.time()),'w'),indent=1)
