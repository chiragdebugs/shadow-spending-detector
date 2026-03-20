#!/bin/bash

# ========================================
# COPY THESE COMMANDS AND RUN THEM
# ========================================

echo "What is your GitHub username?"
read GITHUB_USERNAME

echo ""
echo "Running commands..."
echo ""

# Navigate to project
cd /app

# Add remote (remove if exists)
git remote remove origin 2>/dev/null

# Add your repository
git remote add origin https://github.com/$GITHUB_USERNAME/shadow-spending-detector.git

echo "✅ Remote added!"
echo ""
echo "Now pushing to GitHub..."
echo ""

# Push to GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "  🎉 SUCCESS! Your code is on GitHub!"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "View your repository at:"
    echo "  https://github.com/$GITHUB_USERNAME/shadow-spending-detector"
    echo ""
    echo "Next step: Deploy to Vercel"
    echo "  https://vercel.com/new"
    echo ""
else
    echo ""
    echo "❌ Push failed. This might be because:"
    echo "  1. You haven't created the repository on GitHub yet"
    echo "  2. You need a Personal Access Token"
    echo ""
    echo "Solutions:"
    echo "  1. Create repo at: https://github.com/new"
    echo "  2. Get token at: https://github.com/settings/tokens"
    echo "  3. Run this script again"
    echo ""
fi
