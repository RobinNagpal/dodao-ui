#!/bin/bash
# Regenerate the raw chapter 26 data file (no prose) into the scratch folder.
cd /Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui
pnpm tariff:generate-chapter --chapter 26 --slug 26-ores-slag-and-ash --title "Ores, Slag and Ash" --countries AU,CA,BR,ZA,PE,MX,NA,NO,JP,MG,CN,CL,SE,RU --claim ZA:D,NA:D,MG:D --out /private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad/ch26/gen.json --force
