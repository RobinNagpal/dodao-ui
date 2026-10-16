import sys, pypdf
r = pypdf.PdfReader(sys.argv[1])
out = open(sys.argv[2], 'w')
for i, p in enumerate(r.pages):
    t = p.extract_text() or ''
    out.write(f'[[PAGE {i+1}]]\n{t}\n')
