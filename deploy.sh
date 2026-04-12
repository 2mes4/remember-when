#!/bin/bash

# Remember When - Unified All-in-One Deployment Script
# Usage: npm run deploy -- "version message"

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
  echo "❌ Error: Please provide a version message."
  echo "Usage: npm run deploy -- \"v1.1.7 - Description of changes\""
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
  echo "🔑 Not logged into npm. Please run 'npm login' first."
  exit 1
fi

echo "🔢 Incrementing CLI version (patch)..."
npm version patch -m "chore: bump version to %s"

echo "🚀 Publishing CLI to npm..."
npm publish --access public
cd ..
echo "✅ CLI published to npm."

# 3. OpenClaw Skill Deployment Phase
echo "🤖 [3/6] Deploying Skill to Clawhub..."
cd remember-when-skill

# Check version consistency or increment
# For skills we usually match the monorepo or increment separately.
# Here we increment monorepo version later, but let's ensure skill is updated.
npm version patch --no-git-tag-version || echo "No package.json in skill or version failed, continuing..."

SKILL_VERSION=$(node -e "try { console.log(require('./package.json').version) } catch(e) { console.log('1.0.0') }")
echo "🚀 Publishing skill v$SKILL_VERSION to Clawhub..."
npx clawhub publish . --version "$SKILL_VERSION"
cd ..
echo "✅ Skill deployed to Clawhub."

# 4. Documentation Sync & Global Versioning
echo "📚 [4/6] Synchronizing Monorepo Version..."
npm version patch --no-git-tag-version
echo "✅ Monorepo version bumped."

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
echo "Web:        https://remember-when.agentic.2mes4.com"
echo "Repo:       https://github.com/2mes4/remember-when"
echo "CLI:        https://www.npmjs.com/package/remember-when-cli"
echo "------------------------------------------"
