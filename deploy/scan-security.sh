#!/bin/zsh

# Security scanning script for Docker images
# This script scans Docker images for vulnerabilities using Docker Scout

echo "🔒 Running security scan on IndoQuran Web Docker image"

# Build the image if needed
if [[ $1 == "--build" ]]; then
  echo "🏗️ Building image first..."
  docker build -t indoquran-web:latest -f ./deploy/Dockerfile .
fi

# Scan the image using Docker Scout
echo "🔍 Scanning image for vulnerabilities..."
docker scout cves indoquran-web:latest

# Get the vulnerability counts
HIGH_VULNS=$(docker scout cves indoquran-web:latest --format json | grep -c '"severity":"high"')
CRITICAL_VULNS=$(docker scout cves indoquran-web:latest --format json | grep -c '"severity":"critical"')

# Exit with error if critical or high vulnerabilities found
if [ $CRITICAL_VULNS -gt 0 ]; then
  echo "❌ ${CRITICAL_VULNS} critical vulnerabilities found!"
  echo "🛑 Build failed due to critical security vulnerabilities"
  exit 1
elif [ $HIGH_VULNS -gt 0 ]; then
  echo "⚠️ ${HIGH_VULNS} high vulnerabilities found!"
  echo "Please review and fix these vulnerabilities"
  # Optionally exit with error for high vulnerabilities as well
  # exit 1
else
  echo "✅ No critical or high vulnerabilities found"
fi

echo "🔒 Security scan completed"
