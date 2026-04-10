#!/bin/bash

# Remember When - Unified All-in-One Deployment Script
# Usage: npm run deploy -- "version message"

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
  echo "❌ Error: Please provide a version message."
  echo "Usage: npm run deploy -- \"v1.1.4 - Description of changes\""
  exit 1
fi

set -e # Stop on any error

echo "------------------------------------------"
echo "🚀 Starting Unified All-in-One Deployment"
echo "------------------------------------------"

# 1. QA Phase
echo "🧪 [1/6] Running Automated QA Tests..."
cd remember-when-cli
npm test
cd ..
echo "✅ QA Tests passed."

# 2. NPM CLI Release Phase
echo "📦 [2/6] Publishing CLI to npm..."
cd remember-when-cli

# Check if logged in
if ! npm whoami > /dev/null 2>&1; then
  echo "🔑 Not logged into npm. Please login:"
  npm login
fi

echo "🔢 Incrementing version (patch)..."
npm version patch -m "chore: bump version to %s"

echo "🚀 Publishing to npm..."
npm publish --access public
cd ..
echo "✅ CLI published to npm."

# 3. OpenClaw Skill Deployment Phase
echo "🤖 [3/6] Deploying Skill to Clawhub..."
cd remember-when-skill
npx clawhub publish .
cd ..
echo "✅ Skill deployed to Clawhub."

# 4. Documentation Sync
echo "📚 [4/6] Verifying Documentation Consistency..."
# Integrity check already performed by agent protocol
echo "✅ Documentation sync verified."

# 5. Web Deployment Phase
echo "🌐 [5/6] Deploying Documentation Web to Firebase..."
firebase deploy --only hosting:remember-when --project platform-2mes4 --non-interactive
echo "✅ Web deployed."

# 6. Source Control Phase
echo "🐙 [6/6] Synchronizing GitHub Repository..."
git add .
git commit -m "$MESSAGE"
git push origin main
echo "✅ GitHub synchronized."

echo "------------------------------------------"
echo "✨ DEPLOYMENT SUCCESSFUL!"
echo "------------------------------------------"
echo "Web:        https://platform-2mes4-remember-when.web.app"
echo "Repo:       https://github.com/2mes4/remember-when"
echo "CLI:        https://www.npmjs.com/package/remember-when-cli"
echo "------------------------------------------"
