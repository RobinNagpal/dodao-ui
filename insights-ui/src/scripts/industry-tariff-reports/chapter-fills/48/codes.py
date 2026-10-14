import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import CACHE  # noqa: E402,F401

import re,sys
L=open(CACHE + '/47/ch99r21.txt').read().split('\n')
def codes(a,b,pref='48'):
    out=[]
    for l in L[a-1:b]:
        s=l.strip()
        if re.fullmatch(r'[0-9.; ]+',s):
            out+=re.findall(r'\d{4}\.\d{2}\.\d{2}(?:\d{2}(?=\d{4}\.|$|[; ]))?',s.replace(' ',''))
    return sorted(set(x for x in out if x.startswith(pref)))
if __name__=='__main__':
    a,b=int(sys.argv[1]),int(sys.argv[2]); print(codes(a,b, sys.argv[3] if len(sys.argv)>3 else '48'))
