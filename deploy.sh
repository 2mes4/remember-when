#!/bin/bash

# Remember When - Unified Deployment Script
# Usage: ./deploy.sh "version message"

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
  echo "Error: Please provide a version message."
  echo "Usage: ./deploy.sh \"v1.1.1 - Added multi-language support\""
  exit 1
fi

echo "--- 🚀 Starting Unified Deployment ---"

# 1. Deploy Documentation Web to Firebase
echo "📦 Deploying Web to Firebase Hosting..."
firebase deploy --only hosting:remember-when --project platform-2mes4 --non-interactive

# 2. Update GitHub Repository
echo "🐙 Updating GitHub Repository..."
git add .
git commit -m "$MESSAGE"
git push origin main

# 3. Publish CLI to npm (Optional/Manual Check)
echo "📦 Ready to publish CLI to npm?"
echo "Run: cd remember-when-cli && npm publish --access public"

# 4. Success Message
echo "--- ✅ Deployment Complete! ---"
echo "Web: https://platform-2mes4-remember-when.web.app"
echo "Repo: https://github.com/2mes4/remember-when"
