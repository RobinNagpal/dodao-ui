import re,sys,html,urllib.request,os
def get(date,doc):
    fn=f'{doc}.htm'
    if not os.path.exists(fn) or os.path.getsize(fn)<2000:
        u=f'https://www.govinfo.gov/content/pkg/FR-{date}/html/{doc}.htm'
        open(fn,'wb').write(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read())
    t=html.unescape(re.sub(r'<[^>]+>','',open(fn,encoding='utf-8',errors='replace').read()))
    open(f'{doc}.txt','w').write(t)
    return re.sub(r'\s+',' ',t)
if __name__=='__main__':
    date,doc=sys.argv[1],sys.argv[2]; pats=sys.argv[3:]
    t=get(date,doc); print('==',doc,len(t))
    for p in pats:
        for m in list(re.finditer(r'.{0,500}'+p+r'.{0,500}',t,re.I))[:3]: print('['+p+']',m.group(0)); print('--')
