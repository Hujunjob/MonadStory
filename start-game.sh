#!/bin/bash

echo "🎮 Starting MonCraft - MapleStory Style Multiplayer Game"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Croquet API key!"
    echo "   Get one from: https://croquet.io/"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server..."
echo "Game will be available at: http://localhost:3000"
echo ""
echo "Game Controls:"
echo "- WASD / Arrow Keys: Move"
echo "- Space: Jump" 
echo "- Z: Attack"
echo "- X: Skill"
echo "- I: Inventory"
echo "- Enter: Chat"
echo ""
echo "URL Parameters:"
echo "- ?username=yourname - Set your username"
echo "- ?class=warrior - Choose character class (warrior/mage/archer/thief)"
echo "- ?room=roomname - Join specific room"
echo ""

npm run dev