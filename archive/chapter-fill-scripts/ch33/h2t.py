import re,sys,html
t=open(sys.argv[1],errors='ignore').read()
m=re.search(r'<main.*?</main>',t,re.S)
if m: t=m.group(0)
t=re.sub(r'<script.*?</script>','',t,flags=re.S); t=re.sub(r'<style.*?</style>','',t,flags=re.S)
t=re.sub(r'<(br|p|li|h\d|tr|div)[^>]*>','\n',t)
t=html.unescape(re.sub(r'<[^>]+>','',t))
t=re.sub(r'[ \t]+',' ',t); t=re.sub(r'\n\s*\n+','\n',t)
print(t)
