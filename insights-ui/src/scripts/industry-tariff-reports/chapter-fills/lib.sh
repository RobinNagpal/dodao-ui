# Shared setup for chapter-fills/<NN>/run.sh (sourced, bash). Each run.sh sets SLUG, sources this file, calls
# `generate <chapter-specific generator flags>` and then runs its fill script: python3 "$HERE/fill.py" "$GEN" "$OUT".
#
# `pnpm tariff:refresh-chapter <NN>` sets the variables below and afterwards compacts, formats and validates OUT.
# The defaults let `bash chapter-fills/<NN>/run.sh` work on its own too (it then writes the real chapter file).
#   IU                  the insights-ui folder
#   CHAPTER_FILL_CACHE  cache/scratch root (default <os tmp>/koala-chapter-fills)
#   GEN                 generator output (default $CHAPTER_FILL_CACHE/<NN>/gen.json)
#   OUT                 content file to write (default src/tariff-data/chapters/$SLUG.json)
#   AS_OF               generator --as-of (default today)
#   HTS_FILE_ARG        HTS JSON to pass as --hts-file (default: the generator downloads it into its cache)
#   GEN_OFFLINE=1       pass --offline to the generator (cached HTS/FR data only)
#   REUSE_GEN=1         skip the generator and fill the existing $GEN (e.g. an older generator output)
HERE=$(cd "$(dirname "${BASH_SOURCE[1]}")" && pwd)
NN=$(basename "$HERE")
IU=${IU:-$(cd "$HERE/../../../../.." && pwd)}
_tmp=${TMPDIR:-/tmp}
CHAPTER_FILL_CACHE=${CHAPTER_FILL_CACHE:-${_tmp%/}/koala-chapter-fills}
GEN=${GEN:-$CHAPTER_FILL_CACHE/$NN/gen.json}
OUT=${OUT:-$IU/src/tariff-data/chapters/$NN-${SLUG#*-}.json}
AS_OF=${AS_OF:-$(date +%F)}
HTS_FILE=${HTS_FILE_ARG:-$CHAPTER_FILL_CACHE/generator/hts_2026_revision_21_json.json}
PYTHONHASHSEED=${PYTHONHASHSEED:-0}  # stable order for scripts that sort sources by date only
export IU HERE CHAPTER_FILL_CACHE GEN OUT AS_OF HTS_FILE PYTHONHASHSEED
mkdir -p "$(dirname "$GEN")" "$(dirname "$OUT")"
cd "$IU"

# pnpm tariff:generate-chapter for this chapter, writing $GEN. Pass the chapter-specific flags (--title, --countries, --claim…).
generate() {
  if [ "${REUSE_GEN:-}" = "1" ]; then
    [ -f "$GEN" ] || { echo "REUSE_GEN=1 but $GEN does not exist" >&2; return 1; }
    echo "Reusing $GEN (generator skipped)"
    return 0
  fi
  local extra=()
  [ -n "${HTS_FILE_ARG:-}" ] && extra+=(--hts-file "$HTS_FILE_ARG")
  [ "${GEN_OFFLINE:-}" = "1" ] && extra+=(--offline)
  pnpm tariff:generate-chapter --chapter "$((10#$NN))" --slug "$SLUG" "$@" \
    --as-of "$AS_OF" --cache-dir "$CHAPTER_FILL_CACHE/generator" --out "$GEN" --force ${extra[@]+"${extra[@]}"}
}

# Put the derived per-line fields (heading, general, description, ancestorPath, searchText) back into $GEN, for fill
# scripts written before the generator stopped storing them. The runner compacts the result again.
expand_gen() {
  pnpm exec tsx src/scripts/industry-tariff-reports/expand-chapter-content.ts "$GEN"
}
