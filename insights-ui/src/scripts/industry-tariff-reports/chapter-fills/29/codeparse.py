import re
def parse_codes(text):
    out = []
    for line in text.split("\n"):
        s = line.strip()
        if not re.fullmatch(r"[\d.]+", s): continue
        starts = [p - 4 for p in range(4, len(s) - 3) if s[p] == "." and s[p + 3] == "." and s[p-4:p].isdigit() and (p - 5 < 0 or s[p-5] != ".")]
        # starts must be consistent: each start must be at end of previous code (len 10 or 12)
        starts = sorted(set(starts))
        for i, st in enumerate(starts):
            en = starts[i + 1] if i + 1 < len(starts) else len(s)
            out.append(s[st:en])
    return out
