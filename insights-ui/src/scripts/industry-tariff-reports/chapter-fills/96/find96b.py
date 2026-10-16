import re,json
L=open('c99r21.txt').read().split('\n')
d=json.load(open('gen.json'))
codes=sorted({r['hts'][:10] for r in d['overview']['rateTable']['rows'] if r['hts'] and len(r['hts'])>=10})
# page -> note header heuristics: record last line that starts with "<n>." or "(x)" 
page=None; hdrs=[]
pages={}
for i,s in enumerate(L):
    m3=re.match(r'<<PAGE (\d+)>>',s)
    if m3: page=int(m3.group(1))
    pages[i]=page
import collections
hits=collections.defaultdict(list)
for i,s in enumerate(L):
    if s.startswith('9903.') or s.startswith('9902.'): pass
    for c in codes:
        if c in s: hits[pages[i]].append((i+1,c))
for p in sorted(k for k in hits if k is not None):
    print('PAGE',p, sorted({c for _,c in hits[p]}))
