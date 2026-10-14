# Writer content for Chapter 68, part 4 — trade-driven pages and FAQ. Exec'd by fill68.py.
# ruff: noqa

ALIASES = {'Turkey': ['Türkiye', 'Turkey'], 'Vietnam': ['Viet Nam', 'Vietnam'], 'Korea': ['Rep. of Korea', 'South Korea', 'Korea, Republic of']}


def cname(n):
    for a in ALIASES.get(n, [n]):
        if a in by_c_all:
            return a
    return n


def I(n):
    return imp(cname(n))


def C(n):
    return chg(cname(n))


def share(v):
    return round(v / total * 100)


ranked = sorted(trade['byCountry'], key=lambda c: -c['importsUsd'])
top = [c['country'] for c in ranked[:10]]
DISPLAY = {'Viet Nam': 'Vietnam', 'Türkiye': 'Turkey', 'Rep. of Korea': 'South Korea', 'Other Asia, nes': 'Taiwan'}


def disp(n):
    return DISPLAY.get(n, n)


h = {k: hy(k) for k in GROUP_LABELS}
h_rank = sorted(h, key=lambda k: -h[k])
top2 = [disp(c) for c in top[:2]]
two_share = share(I(top[0]) + I(top[1]))
s6810 = by_hs6.get('681099')

ui['h1'] = f'HTS Chapter 68: {SHORT} — U.S. Import Statistics'
exec(open(__file__.replace('fill68.py', 'fill68_text5.py')).read())
