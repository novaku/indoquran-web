#!/bin/bash
# This script replaces all logger.sql calls in the codebase with logger.debug calls

echo "Replacing logger.sql calls with logger.debug in the codebase..."

# Find and replace in all TypeScript files
find /Users/novaherdi/Documents/GitHub/indoquran-web/src -type f -name "*.ts" -exec sed -i '' 's/logger\.sql(/logger\.debug(/g' {} \;
find /Users/novaherdi/Documents/GitHub/indoquran-web/src -type f -name "*.tsx" -exec sed -i '' 's/logger\.sql(/logger\.debug(/g' {} \;

echo "SQL logging calls have been replaced with debug logging calls"
