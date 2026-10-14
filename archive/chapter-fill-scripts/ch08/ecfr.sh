#!/bin/bash
curl -s --compressed "https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-$1.xml?part=$2&section=$3" | sed 's/<[^>]*>/ /g' | tr -s ' \n'
