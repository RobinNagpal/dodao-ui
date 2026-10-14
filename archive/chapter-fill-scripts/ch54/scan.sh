cd /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch54
: > scan.out
for c in $(cat codes10.txt); do echo "=== $c" >> scan.out; python3 frs.py "$c" 2005-01-01 'conditions[agencies][]=international-trade-administration' | head -4 >> scan.out; sleep 2; done
echo DONE >> scan.out
