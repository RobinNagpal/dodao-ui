import re,sys
def codes(s):
    out=set()
    for line in s.split('\n'):
        line=line.strip()
        if not re.fullmatch(r'[\d.]+',line): continue
        st=[m.start() for m in re.finditer(r'(?=\d{4}\.\d{2}\.)',line)]
        # filter overlapping starts
        good=[];last=-10
        for p in st:
            if p>=last+8: good.append(p); last=p
        for i,p in enumerate(good):
            e=good[i+1] if i+1<len(good) else len(line)
            out.add(line[p:e])
    return out
def lists(f):
    t=open(f).read()
    a=t.index('Heading 9903.03.12 applies'); b=t.index('As provided in heading 9903.03.15')
    parts=re.split(r'Heading (9903\.03\.1[234]) applies',t[a:b])
    return {parts[i]:codes(parts[i+1]) for i in range(1,len(parts),2)}
A=lists(sys.argv[1]); B=lists(sys.argv[2])
for k in A:
    print(k,len(A[k]),len(B[k]),'ch13 removed',sorted(x for x in A[k]-B[k] if x[:2]=='13'),'added',sorted(x for x in B[k]-A[k] if x[:2]=='13'), 'ch13 now', sorted(x for x in B[k] if x.startswith('13')), 'tot -',len(A[k]-B[k]),'+',len(B[k]-A[k]))
