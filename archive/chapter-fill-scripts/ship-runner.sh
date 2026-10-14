#!/bin/zsh
# Ships queued chapters serially. Each cycle takes everything queued so far as one PR.
SP=/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad
Q=$SP/ship-queue.txt; touch $Q $SP/shipped.txt $SP/ship-failed.txt
while true; do
  [ -f $SP/ship-stop ] && { echo "stop flag"; exit 0; }
  while pgrep -f "ship-chapters.sh" >/dev/null; do sleep 30; done
  [ -f $SP/ship-stop ] && { echo "stop flag"; exit 0; }
  BATCH=($(grep -vxF -f <(cat $SP/shipped.txt $SP/ship-failed.txt) $Q | sort -u))
  if [ ${#BATCH[@]} -eq 0 ]; then sleep 60; continue; fi
  echo "=== $(date +%H:%M) shipping ${BATCH[*]}"
  if zsh $SP/ship-chapters.sh "${BATCH[@]}" > $SP/ship-log-$(date +%H%M%S).txt 2>&1; then
    printf "%s\n" "${BATCH[@]}" >> $SP/shipped.txt; echo "=== $(date +%H:%M) SHIPPED ${BATCH[*]}"
  else
    printf "%s\n" "${BATCH[@]}" >> $SP/ship-failed.txt; echo "=== $(date +%H:%M) FAILED ${BATCH[*]} (see latest ship-log)"
  fi
done
