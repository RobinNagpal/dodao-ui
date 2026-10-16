#!/bin/zsh
# Ship finished chapter files from the batch-2 worktree: one PR from current main with the chapter + trade files,
# the CHAPTER_FILES registration and the documented calc-enabled line; merge when GitHub checks pass; deploy;
# flush CloudFront; verify pages; add the chapters to TARIFF_CALC_MEASURES_ENABLED.
# Usage: ship-chapters.sh 53-other-veg-textile-fibers [more slugs...]
set -u
# Paths: REPO = this checkout's root (main), SHIP_SRC = the insights-ui folder of the batch worktree holding the finished files.
REPO=${REPO:-$(cd "$(dirname "$0")/../../../../.." && git rev-parse --show-toplevel)}
WORKTREES=${WORKTREES:-$(dirname "$REPO")/worktrees}
export AWS_REGION=us-east-1
SRC=${SHIP_SRC:?set SHIP_SRC to the batch worktree's insights-ui folder}
SLUGS=("$@")
NUMS=(); for s in "${SLUGS[@]}"; do NUMS+=("${s%%-*}"); done
BR="ship-ch-$(IFS=-; echo "${NUMS[*]}")"
WT=$WORKTREES/$BR
cd "$REPO" && git fetch -q origin && git worktree add -q "$WT" -b "$BR" origin/main || exit 1
cd "$WT/insights-ui"
ln -s "$REPO/insights-ui/node_modules" node_modules
for s in "${SLUGS[@]}"; do
  n=${s%%-*}
  cp "$SRC/src/tariff-data/chapters/$s.json" src/tariff-data/chapters/ || exit 1
  cp "$SRC/src/tariff-data/trade/chapter-$n.json" src/tariff-data/trade/ || exit 1
done
python3 - "${SLUGS[@]}" <<'EOF'
import re, sys
p = 'src/utils/tariff-reports/chapter-prototype.ts'
s = open(p).read()
lines = s.split('\n')
entry = re.compile(r"^  '(\d+)-[a-z0-9-]+': \(\) => import\('@/tariff-data/chapters/[^']+\.json'\),$")
idx = [i for i, l in enumerate(lines) if entry.match(l)]
for slug in sys.argv[1:]:
    if any(f"'{slug}'" in lines[i] for i in idx):
        continue
    n = int(slug.split('-')[0])
    new = f"  '{slug}': () => import('@/tariff-data/chapters/{slug}.json'),"
    pos = next((i for i in idx if int(entry.match(lines[i]).group(1)) > n), idx[-1] + 1)
    lines.insert(pos, new)
    idx = [i for i, l in enumerate(lines) if entry.match(l)]
open(p, 'w').write('\n'.join(lines))
d = '../docs/insights-ui/tariffs/calculator-data-refresh.md'
t = open(d).read()
m = re.search(r'<!-- calc-enabled-chapters: ([0-9,]+) -->', t)
cur = sorted(set(int(x) for x in m.group(1).split(',')) | {int(x.split('-')[0]) for x in sys.argv[1:]})
t = t.replace(m.group(0), '<!-- calc-enabled-chapters: ' + ','.join(map(str, cur)) + ' -->')
open(d, 'w').write(t)
print('enabled', ','.join(map(str, cur)))
EOF
npx prettier --write src/utils/tariff-reports/chapter-prototype.ts >/dev/null
for s in "${SLUGS[@]}"; do
  pnpm tariff:validate-chapters --file src/tariff-data/chapters/$s.json --check-calculator --check-hts 2>&1 | grep -E "^=== " | grep -v "PASS: 0 error(s), 0 warning(s)" && { echo "VALIDATION FAILED $s"; exit 1; }
done
pnpm tariff:calc-readiness --check-enabled --no-write 2>&1 | grep -q "Every enabled chapter is READY" || { echo "READINESS FAILED"; exit 1; }
rm node_modules
git add -A && git commit -q -m "Migrate chapter(s) ${NUMS[*]} to Approach-2 and enable the calculator (#1812 batch 2)

Each passes validate-chapters --check-calculator --check-hts (0 errors, 0 warnings, 0 mismatches) and is READY.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>" || exit 1
git push -q -u origin "$BR" 2>/dev/null
PR=$(gh pr create --base main --head "$BR" --title "Migrate chapter(s) ${NUMS[*]} to Approach-2 + enable calculator (#1812 batch 2)" --body "Part of #1812 (batch 2). Chapter content files for: ${SLUGS[*]}. Each passes \`pnpm tariff:validate-chapters --check-calculator --check-hts\` with 0 errors, 0 warnings and 0 mismatches, and is READY under \`pnpm tariff:calc-readiness\`. Registers them in \`CHAPTER_FILES\` and adds them to the documented \`calc-enabled-chapters\` line; the production App Setting is updated after deploy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)" | tail -1)
echo "PR $PR"
HEAD=$(git rev-parse HEAD); sleep 60
until [ "$(gh pr checks "$PR" 2>/dev/null | grep -v -i vercel | grep -v skipping | grep -cv pass)" = "0" ]; do
  gh pr checks "$PR" 2>/dev/null | grep -v -i vercel | grep -q fail && { echo "CHECK FAILED $PR"; exit 1; }; sleep 30; done
# main may have moved (another ship): update the branch and wait again if GitHub needs it
gh pr merge "$PR" --merge --match-head-commit "$HEAD" || { echo "MERGE FAILED $PR"; exit 1; }
SHA=$(gh pr view "$PR" --json mergeCommit -q .mergeCommit.oid); echo "merged $SHA"; sleep 60
for i in $(seq 1 90); do R=$(gh run list --workflow insights-ui-deploy-aws.yml --commit $SHA --json status,conclusion -q '.[0]|"\(.status) \(.conclusion)"'); [[ "$R" == completed* ]] && break; sleep 30; done
echo "deploy $R"; [[ "$R" == "completed success" ]] || exit 1
ID=$(aws cloudfront create-invalidation --distribution-id EZI5H8FKNE9R1 --paths "/industry-tariff-report/*" --query Invalidation.Id --output text) || exit 1
aws cloudfront wait invalidation-completed --distribution-id EZI5H8FKNE9R1 --id $ID && echo "invalidation Completed"
BAD=0
for s in "${SLUGS[@]}"; do for sub in "" /tariff-updates /understand-industry /industry-areas /tariff-engineering /final-conclusion; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "https://koalagains.com/industry-tariff-report/chapters/$s$sub"); [ "$c" = 200 ] || { echo "$s$sub $c"; BAD=$((BAD+1)); }; done; done
echo "pages not 200: $BAD"; [ $BAD = 0 ] || exit 1
CUR=$(aws ssm get-parameter --name /koalagains/insights-ui/TARIFF_CALC_MEASURES_ENABLED --query Parameter.Value --output text)
NEW=$(python3 -c "import sys; c=set(int(x) for x in sys.argv[1].split(',') if x.strip().isdigit()); c|=set(int(x) for x in sys.argv[2:]); print(','.join(map(str,sorted(c))))" "$CUR" "${NUMS[@]}")
aws ssm put-parameter --name /koalagains/insights-ui/TARIFF_CALC_MEASURES_ENABLED --type String --overwrite --value "$NEW" --query Version --output text
echo "calculator enabled: $NEW"
cd "$REPO" && git worktree remove --force "$WT" && git branch -D -q "$BR"
echo "SHIPPED ${SLUGS[*]}"
