"""Line sets of Chapter 84 per Chapter 99 measure, from measures.json coverage (in force on ASOF)."""
import json

WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
MEAS = json.load(open(f"{WT}/src/tariff-data/calculator/measures.json"))["measures"]
BYKEY = {m["measureKey"]: m for m in MEAS}


def covered(key, lines):
    m = BYKEY[key]
    inc = [c.replace(".", "") for c in m["coverageInclude"]]
    exc = [c.replace(".", "") for c in m["coverageExclude"]]
    out = []
    for ln in lines:
        c = ln.replace(".", "")
        if (not inc or any(c.startswith(p) for p in inc)) and not any(c.startswith(p) for p in exc):
            out.append(ln)
    return sorted(out)


def build(lines):
    S = {}
    S["s232_25"] = covered("s232-metals-25", lines)
    S["s232_mobile"] = covered("s232-metals-mobile-25", lines)
    S["s232_eq15"] = sorted(set(covered("s232-metals-equipment-15", lines)) | set(covered("s232-metals-equipment-15-0608", lines)))
    S["s232_agparts"] = covered("s232-metals-ag-parts-15", lines)
    S["s232_moto"] = covered("s232-metals-motorcycle-parts", lines)
    S["auto"] = covered("s232-auto-parts", lines)
    S["auto_uk"] = covered("s232-auto-parts-uk", lines)
    S["mhdv"] = sorted(set(covered("s232-mhdv-parts", lines)) | set(covered("s232-mhdv-parts-auto-part-overlap", lines)))
    S["mhdv_only"] = covered("s232-mhdv-parts", lines)
    S["semi"] = covered("s232-semiconductors", lines)
    S["ca338"] = covered("ca338-b3", lines)
    S["ru35"] = covered("ru-col2-35", lines)
    S["rual"] = sorted(set(covered("s232-aluminum-ru-derivatives", lines)) | set(covered("s232-aluminum-ru-derivatives-0818", lines)))
    S["cn1"] = covered("s301-china-list1", lines)
    S["cn2"] = covered("s301-china-list2", lines)
    S["cn3"] = covered("s301-china-list3", lines)
    S["cn4a"] = covered("s301-china-list4a", lines)
    S["cn_sts"] = covered("s301-china-sts-cranes", lines)
    S["br_exempt"] = covered("s301-brazil-exempt-50a-ii", lines)
    S["certified"] = covered("s232-auto-parts-certified", lines)
    S["certified_mhdv"] = covered("s232-mhdv-parts-certified", lines)
    S["civil_air"] = covered("s232-metals-civil-aircraft-uk", lines)
    S["no_metal"] = covered("s232-metals-no-metal", lines)
    ex = [k for k in BYKEY if k.startswith("s301-china-excl-")]
    S["cn_excl"] = sorted({l for k in ex for l in covered(k, lines)})
    S["s232_any"] = sorted(set(S["s232_25"]) | set(S["s232_eq15"]) | set(S["s232_mobile"]))
    return S
