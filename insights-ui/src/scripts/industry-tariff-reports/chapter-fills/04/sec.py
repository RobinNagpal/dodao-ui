import re,sys,html
f,n=sys.argv[1],sys.argv[2]; lim=int(sys.argv[3]) if len(sys.argv)>3 else 3000
x=open(f).read()
m=re.search(r'<DIV8 N="'+re.escape(n)+r'"[^>]*>(.*?)</DIV8>',x,re.S)
t=html.unescape(re.sub(r'<[^>]+>',' ',m.group(1))); t=re.sub(r'\s+',' ',t)
print(t[:lim])
