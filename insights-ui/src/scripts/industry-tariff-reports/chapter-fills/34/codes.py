import re,sys
L=open('ch99.txt').read().split('\n')
def codes_in(a,b,prefix='34'):
    out=set()
    for l in L[a-1:b]:
        for tok in re.split(r'[\s;,()]+',l):
            tok=tok.strip('.')
            m=re.fullmatch(r'((?:\d{4}\.\d{2}\.\d{2}(?:\d{2})?)+)',tok)
            if m:
                s=m.group(1)
                # split greedy into 10-char 8-digit codes (statistical 13-char rare)
                i=0
                while i<len(s):
                    if re.match(r'\d{4}\.\d{2}\.\d{4}(\d{4}\.|$)',s[i:]) : out.add(s[i:i+12]); i+=12
                    else: out.add(s[i:i+10]); i+=10
            else:
                for c in re.findall(r'\d{4}\.\d{2}(?:\.\d{2,4})?',tok): out.add(c)
    return sorted(c for c in out if c.startswith(prefix))
if __name__=='__main__':
    a,b=int(sys.argv[1]),int(sys.argv[2]); print(codes_in(a,b))
