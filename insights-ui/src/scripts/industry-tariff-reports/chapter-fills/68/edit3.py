p='fill68_text3.py'; s=open(p).read()
start=s.index('# Human labels for the two quartz facts'); end=s.index("for bad in (")
s=s[:start]+"# The generator labels the quartz-fact cells itself (#1843); only guard against raw fact names.\nblob = json.dumps([ia['countries'], ia['biggestLanes']]).replace(': null', '')\n"+s[end:]
a="cells show three totals — not a quartz surface product, quartz entered in quota (+25%, '\n    '9903.45.30), and quartz entered over quota (+50%, 9903.45.31)."
assert a in s
s=s.replace(a,"cells show three totals — \"not quartz surface\", \"quartz surface product within '\n    'quota\" (+25%, 9903.45.30) and \"quartz surface product over quota\" (+50%, 9903.45.31).")
open(p,'w').write(s)
