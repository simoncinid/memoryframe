#!/bin/bash

# Test script per MemoryFrame Backend
# Uso: ./test-curl.sh

BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "=== MemoryFrame Backend Test ==="
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Health Check
echo "1. Testing /health endpoint..."
curl -s "$BASE_URL/health" | jq .
echo ""

# Test 2: Generate endpoint (requires test images)
echo "2. Testing /api/generate endpoint..."
echo "   (Requires 3 test images: personA.jpg, personB.jpg, background.jpg)"
echo ""

# Check if test images exist
if [ -f "personA.jpg" ] && [ -f "personB.jpg" ] && [ -f "background.jpg" ]; then
  echo "   Found test images. Sending request..."
  
  curl -X POST "$BASE_URL/api/generate" \
    -F "personA=@personA.jpg" \
    -F "personB=@personB.jpg" \
    -F "background=@background.jpg" \
    -F "style=photorealistic" \
    -F "scene=Two people standing together in a beautiful garden during golden hour" \
    -F "size=1024x1024" \
    -F "quality=medium" \
    -H "Accept: application/json" \
    | jq '.request_id, .mime_type, .generation_time_ms'
  
  echo ""
else
  echo "   Test images not found. Create these files:"
  echo "   - personA.jpg"
  echo "   - personB.jpg"
  echo "   - background.jpg"
  echo ""
  echo "   Example command with images:"
  echo '   curl -X POST "'$BASE_URL'/api/generate" \'
  echo '     -F "personA=@/path/to/personA.jpg" \'
  echo '     -F "personB=@/path/to/personB.jpg" \'
  echo '     -F "background=@/path/to/background.jpg" \'
  echo '     -F "style=photorealistic" \'
  echo '     -F "scene=Two people in a park at sunset"'
fi

echo ""
echo "=== Test Complete ==="

