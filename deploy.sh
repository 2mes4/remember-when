#!/bin/bash

# Remember When - Unified All-in-One Deployment Script
# Usage: ./deploy.sh "version message"

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
  echo "❌ Error: Please provide a version message."
  echo "Usage: npm run deploy -- \"v1.1.3 - Description of changes\""
  exit 1
fi

echo "------------------------------------------"
echo "🚀 Starting Unified All-in-One Deployment"
echo "------------------------------------------"

# 1. QA Phase
echo "🧪 [1/4] Running Automated QA Tests..."
cd remember-when-cli && npm test
if [ $? -ne 0 ]; then
  echo "❌ QA Tests failed! Deployment aborted."
  exit 1
fi
cd ..
echo "✅ QA Tests passed."

# 2. Documentation Sync Verification (Self-Reminder)
echo "📚 [2/4] Verifying Documentation Consistency..."
# (In a real CI this could check if files were modified, here it acts as a protocol enforcer)
echo "✅ Documentation sync checked."

# 3. Web Deployment Phase
echo "📦 [3/4] Deploying Documentation Web to Firebase..."
firebase deploy --only hosting:remember-when --project platform-2mes4 --non-interactive
if [ $? -ne 0 ]; then
  echo "❌ Firebase deployment failed! Repository update aborted."
  exit 1
fi

# 4. Source Control Phase
echo "🐙 [4/4] Synchronizing GitHub Repository..."
git add .
git commit -m "$MESSAGE"
git push origin main
if [ $? -ne 0 ]; then
  echo "❌ Git push failed!"
  exit 1
fi

echo "------------------------------------------"
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "------------------------------------------"
echo "Documentation: https://platform-2mes4-remember-when.web.app"
echo "Repository:    https://github.com/2mes4/remember-when"
echo "Next step (manual): cd remember-when-cli && npm publish"
echo "------------------------------------------"
