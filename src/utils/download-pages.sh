#!/bin/bash

# Base URL for the API
BASE_URL="https://quran.ksu.edu.sa/interface.php?ui=pc&do=hilites&mosshaf=hafs&t=28&page="

# This script is now deprecated and no longer in use since the highlight feature was removed
# Directory to save JSON files - No longer needed
# OUTPUT_DIR="quran_hilites"
# mkdir -p "$OUTPUT_DIR"

# Loop through pages 1 to 604
for ((page=1; page<=604; page++))
do
    wget --no-check-certificate "${BASE_URL}${page}" -O "${OUTPUT_DIR}/page_${page}.json"
    if [ $? -eq 0 ]; then
        echo "Successfully downloaded page ${page}"
    else
        echo "Failed to download page ${page}"
    fi
    # Optional: Add a small delay to avoid overwhelming the server
    sleep 0.5
done