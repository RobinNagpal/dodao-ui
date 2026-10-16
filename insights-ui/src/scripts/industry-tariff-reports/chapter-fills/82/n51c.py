import re,sys
t=open(sys.argv[1]).read()
i=t.find('Heading 9903.03.14 applies'); j=t.find('(c) As provided in heading 9903.03.15',i)
if i<0: print('no 9903.03.14 list'); sys.exit()
s2=re.sub(r'\s','',t[i:j])
print(sorted(set(re.findall(r'82\d\d\.\d\d(?:\.\d\d)?',s2))))
