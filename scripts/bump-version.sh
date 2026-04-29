#!/bin/bash
set -e

TYPE=${1:-patch} # patch | minor | major

# Bump package.json and capture new version
NEW_VERSION=$(npm version $TYPE --no-git-tag-version | tr -d 'v')

# Sync app.json
node -e "
  const fs = require('fs');
  const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  app.expo.version = '$NEW_VERSION';
  app.expo.runtimeVersion = '$NEW_VERSION';
  app.expo.android = app.expo.android || {};
  app.expo.android.versionCode = (app.expo.android.versionCode || 0) + 1;
  const parts = '$NEW_VERSION'.split('.').map(Number);
  fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
"

echo "Bumped to $NEW_VERSION"
