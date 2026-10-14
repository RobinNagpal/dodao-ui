import sys,urllib.request,re,os
# usage: gov.py <docnum> <yyyy-mm-dd>
dn,pd=sys.argv[1],sys.argv[2]
out=f'fr_{dn}.txt'
u=f'https://www.govinfo.gov/content/pkg/FR-{pd}/html/{dn}.htm'
t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf8','ignore')
t=re.sub(r'<[^>]+>','',t); t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
open(out,'w').write(t); print(dn,len(t))
