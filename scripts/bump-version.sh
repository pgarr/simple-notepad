#!/bin/bash
set -e

TYPE=${1:-patch} # patch | minor | major

# Bump package.json and capture new version
NEW_VERSION=$(npm version $TYPE --no-git-tag-version | tr -d 'v')

# Sync app.json and capture new versionCode
NEW_VERSION_CODE=$(node -e "
  const fs = require('fs');
  const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  app.expo.version = '$NEW_VERSION';
  app.expo.runtimeVersion = '$NEW_VERSION';
  app.expo.android = app.expo.android || {};
  app.expo.android.versionCode = (app.expo.android.versionCode || 0) + 1;
  fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
  process.stdout.write(String(app.expo.android.versionCode));
")

# Sync android/app/build.gradle (EAS reads this when a native android/ dir exists)
sed -i "s/versionCode [0-9]*/versionCode $NEW_VERSION_CODE/" android/app/build.gradle
sed -i "s/versionName \"[^\"]*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle

echo "Bumped to $NEW_VERSION (versionCode $NEW_VERSION_CODE)"
