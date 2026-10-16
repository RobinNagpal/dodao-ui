import re,sys
L=open('ch99.txt').read().split('\n')
pat=re.compile(r'^\(([a-z]{1,4})\)\s')
npat=re.compile(r'^(\d{1,2})\.\s')
def hdr(i):
    sub=note=None
    for j in range(i,0,-1):
        s=L[j-1]
        if sub is None and pat.match(s): sub=(j,s[:140])
        if npat.match(s) and note is None: note=(j,s[:140])
        if sub and note: break
    return note,sub
for a in sys.argv[1:]:
    i=int(a); n,s=hdr(i)
    print(i,'| NOTE',n,'| SUB',s)
