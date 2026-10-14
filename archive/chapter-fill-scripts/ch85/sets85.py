"""Line sets for Chapter 85 from measures.json (coverage prefixes) and the generated rate table."""
import json, os
MEAS = '/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui/src/tariff-data/calculator/measures.json'
_M = {x['measureKey']: x for x in json.load(open(MEAS))['measures']}

def lines_of(d):
    return [r for r in d['overview']['rateTable']['rows'] if r['htsCode10']]

def cov(d, key):
    x = _M[key]; inc = x['coverageInclude']; exc = x['coverageExclude']
    out = set()
    for r in lines_of(d):
        c = r['htsCode10']
        if inc and not any(c.startswith(p) for p in inc): continue
        if any(c.startswith(p) for p in exc): continue
        out.add(r['hts'])
    return out

def sets(d):
    S = {}
    S['all'] = {r['hts'] for r in lines_of(d)}
    S['ex52b'] = cov(d, 's301-2026-exempt-52b')
    S['l1'] = cov(d, 's301-china-list1'); S['l2'] = cov(d, 's301-china-list2'); S['l3'] = cov(d, 's301-china-list3') | cov(d, 's301-china-list3-described'); S['l4a'] = cov(d, 's301-china-list4a')
    S['n31b'] = cov(d, 's301-china-2024-31b'); S['n31c'] = cov(d, 's301-china-2024-31c'); S['n31f'] = cov(d, 's301-china-2024-31f'); S['n31g'] = cov(d, 's301-china-2024-31g')
    S['excl'] = set().union(*[cov(d, k) for k in _M if k.startswith('s301-china-excl-')])
    S['m25'] = cov(d, 's232-metals-25'); S['m15'] = cov(d, 's232-metals-equipment-15') | cov(d, 's232-metals-equipment-15-0608')
    S['auto'] = cov(d, 's232-auto-parts'); S['mhdv'] = cov(d, 's232-mhdv-parts-auto-part-overlap')
    S['ca338'] = cov(d, 'ca338-b3'); S['ru35'] = cov(d, 'ru-col2-35'); S['uas'] = cov(d, 's232-uas-docking')
    S['info'] = cov(d, 's301-2026-exempt-informational-materials')
    S['ru200'] = cov(d, 's232-aluminum-ru-derivatives') | cov(d, 's232-aluminum-ru-derivatives-0818')
    S['s301_26'] = S['all'] - S['ex52b']
    S['china_any'] = S['l1'] | S['l2'] | S['l3'] | S['l4a'] | S['n31b'] | S['n31c'] | S['n31f'] | S['n31g']
    return S
