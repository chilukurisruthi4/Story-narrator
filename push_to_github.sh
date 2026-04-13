#!/bin/bash
set -e

OWNER="chilukurisruthi4"
REPO="Story-narrator"
BRANCH="claude/kids-storytelling-app-EwqF1"

echo ""
echo "StoryLand GitHub Push Script"
echo "=============================="
echo "Enter your GitHub Personal Access Token (must have 'repo' scope)."
echo "Input is hidden — it won't appear on screen."
echo ""
echo -n "Paste token: "
read -s TOKEN
echo ""

# Verify token has repo scope
echo "Verifying token..."
SCOPES=$(curl -si -H "Authorization: token $TOKEN" https://api.github.com/repos/$OWNER/$REPO 2>/dev/null | grep "x-oauth-scopes:" | tr -d '\r')
if [[ "$SCOPES" != *"repo"* ]]; then
  echo "ERROR: Token missing 'repo' scope. Please create a new token with 'repo' checked."
  exit 1
fi
echo "Token OK!"

push_file() {
  local FILE="$1"
  local CONTENT
  CONTENT=$(base64 -w 0 "$FILE" 2>/dev/null || base64 "$FILE")
  local RESULT
  RESULT=$(curl -s -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$OWNER/$REPO/contents/$FILE" \
    -d "{\"message\":\"Add $FILE\",\"content\":\"$CONTENT\",\"branch\":\"$BRANCH\"}")
  if echo "$RESULT" | grep -q '"sha"'; then
    echo "  ✓ $FILE"
  else
    echo "  ✗ $FILE: $(echo $RESULT | python3 -c 'import sys,json; print(json.load(sys.stdin).get("message","unknown error"))' 2>/dev/null)"
  fi
}

echo ""
echo "Initializing repo with README..."
README_CONTENT=$(echo "# StoryLand — Kids Storytelling App" | base64 -w 0 2>/dev/null || echo "# StoryLand — Kids Storytelling App" | base64)
INIT=$(curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$OWNER/$REPO/contents/README.md" \
  -d "{\"message\":\"Initialize repository\",\"content\":\"$README_CONTENT\"}")

INIT_SHA=$(echo "$INIT" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r.get('commit',{}).get('sha',''))" 2>/dev/null)
if [ -z "$INIT_SHA" ]; then
  echo "Init failed: $INIT"
  exit 1
fi
echo "  ✓ README.md (sha: ${INIT_SHA:0:8})"

echo ""
echo "Creating branch $BRANCH..."
BRANCH_RESULT=$(curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$OWNER/$REPO/git/refs" \
  -d "{\"ref\":\"refs/heads/$BRANCH\",\"sha\":\"$INIT_SHA\"}")
if echo "$BRANCH_RESULT" | grep -q '"ref"'; then
  echo "  ✓ Branch created"
else
  echo "  (Branch may already exist)"
fi

echo ""
echo "Pushing all source files..."
cd /home/user/Story-narrator

for FILE in $(git ls-files); do
  push_file "$FILE"
  sleep 0.3
done

echo ""
echo "All done! Visit: https://github.com/$OWNER/$REPO/tree/$BRANCH"
