# MonCraft - MapleStory Style Multiplayer Game

A multiplayer side-scrolling platformer game inspired by MapleStory, built with Phaser 3, React, TypeScript, Vite, and Croquet for real-time multiplayer functionality.

## Features

- **Real-time Multiplayer**: Up to 10 players per room using Croquet networking
- **Character Classes**: Choose from Warrior, Mage, Archer, or Thief
- **Combat System**: Attack monsters and level up your character  
- **Skill System**: Class-specific skills with mana costs
- **Chat System**: Real-time chat with other players
- **Monster AI**: Different monster types with unique behaviors
- **Level Progression**: Gain experience and level up
- **Inventory System**: Collect and manage items
- **Responsive UI**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Croquet API key (get one from https://croquet.io/)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd moncraft
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Croquet API key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Game Controls

- **WASD** or **Arrow Keys**: Move character
- **Space**: Jump
- **Z**: Attack
- **X**: Use Skill 1
- **C**: Use Skill 2  
- **I**: Toggle Inventory
- **Enter**: Open Chat

## Character Classes

### Warrior
- High health and defense
- Strong melee attacks
- Skills: Power Strike (enhanced attack)

### Mage  
- High mana and magical damage
- Ranged magical attacks
- Skills: Fireball (projectile attack)

### Archer
- Balanced stats with ranged attacks
- High accuracy and critical hits
- Skills: Power Shot (enhanced arrow)

### Thief
- High speed and agility
- Quick attacks and mobility
- Skills: Dash Attack (teleport strike)

## Multiplayer Features

### Room System
- Join public lobbies or create private rooms
- URL parameters for easy room sharing:
  - `?room=myroom` - Join specific room
  - `?username=player1` - Set username
  - `?class=warrior` - Choose character class

### Real-time Synchronization
- Player movements and animations
- Combat actions and damage
- Chat messages
- Monster AI and respawning
- Level progression

## Architecture

### Frontend Stack
- **React 18**: UI components and state management
- **Phaser 3**: Game engine and rendering
- **TypeScript**: Type safety and development experience
- **Vite**: Fast development and building

### Networking
- **Croquet**: Real-time multiplayer synchronization
- **Model-View Architecture**: Deterministic game state
- **Event-driven Communication**: Pub/sub messaging system

### Game Systems
- **Player Controller**: Input handling and movement
- **Monster Controller**: AI behaviors and pathfinding  
- **Combat System**: Damage calculation and collision detection
- **Level System**: Experience and progression mechanics

## Project Structure

```
src/
├── components/         # React components
│   ├── GameComponent.tsx
│   ├── UIOverlay.tsx
│   └── GameProvider.tsx
├── scenes/            # Phaser game scenes
│   ├── PreloadScene.ts
│   ├── MainScene.ts
│   └── UIScene.ts
├── systems/           # Game logic systems
│   ├── PlayerController.ts
│   ├── MonsterController.ts
│   └── CombatSystem.ts
├── models/            # Croquet networking
│   ├── CroquetModels.ts
│   ├── CroquetView.ts
│   └── CroquetSession.ts
├── types/             # TypeScript definitions
│   └── game.ts
└── assets/            # Game assets
```

## Development

### Adding New Features

1. **New Character Class**: 
   - Update `CharacterClass` type in `types/game.ts`
   - Add class logic to `PlayerController.ts`
   - Create skill handlers

2. **New Monster Type**:
   - Update `MonsterType` type in `types/game.ts`  
   - Add AI behavior to `MonsterController.ts`
   - Set stats in `CroquetModels.ts`

3. **New Skill**:
   - Add skill to appropriate class handler
   - Implement visual effects in game scenes
   - Add networking events if needed

### Performance Optimization

- Use object pooling for frequently created/destroyed objects
- Implement level-of-detail for distant players/monsters
- Optimize network message frequency
- Use sprite atlases for better texture management

## Deployment

### Environment Variables
```bash
VITE_CROQUET_API_KEY=your_production_api_key
VITE_GAME_VERSION=1.0.0
VITE_MAX_PLAYERS_PER_ROOM=10
```

### Hosting Options
- **Vercel**: Easy deployment with automatic SSL
- **Netlify**: Static hosting with CDN
- **AWS S3 + CloudFront**: Scalable static hosting
- **Your own server**: Full control over deployment

### CDN Recommendations
- Use CDN for game assets (images, sounds)
- Enable gzip compression
- Set appropriate cache headers
- Optimize images with WebP format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

- Built with [Phaser 3](https://phaser.io/)
- Multiplayer powered by [Croquet](https://croquet.io/)  
- Inspired by MapleStory
- UI components with [React](https://reactjs.org/)

## Support

For questions or issues:
- Open a GitHub issue
- Check the [Croquet documentation](https://croquet.io/docs/)
- Join our Discord community (link coming soon)