import json,urllib.request,sys,re,os
for n in sys.argv[1:]:
    p=f'r_{n}.txt'
    if not os.path.exists(p):
        t=json.loads(urllib.request.urlopen(urllib.request.Request('https://rulings.cbp.gov/api/ruling/'+n,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read())['text']
        open(p,'w').write(re.sub(r'[\r\f]+','\n',t))
    print('#####',n); print(open(p).read()[:int(os.environ.get('N','3000'))])
