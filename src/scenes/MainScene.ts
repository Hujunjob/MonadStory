import * as Phaser from 'phaser'
import { Player, Monster, GameState, InputState } from '../types/game'
import { PlayerController } from '../systems/PlayerController'
import { MonsterController } from '../systems/MonsterController'
import { CombatSystem } from '../systems/CombatSystem'

export class MainScene extends Phaser.Scene {
  private gameState!: GameState
  private dispatch!: (action: any) => void
  private playerController!: PlayerController
  private monsterController!: MonsterController
  private combatSystem!: CombatSystem
  
  private player!: Player
  private playerSprite!: Phaser.GameObjects.Sprite
  private monsterSprites: Map<string, Phaser.GameObjects.Sprite> = new Map()
  
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private inputState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    skill1: false,
    skill2: false,
    skill3: false,
    inventory: false
  }

  private lastInputTime = 0
  private inputBuffer = 100 // 100ms input buffer

  constructor() {
    super({ key: 'MainScene' })
  }

  create() {
    // Get game state and dispatch from registry
    this.gameState = this.registry.get('gameState')
    this.dispatch = this.registry.get('dispatch')

    // Initialize systems
    this.playerController = new PlayerController(this)
    this.monsterController = new MonsterController(this)
    this.combatSystem = new CombatSystem(this)

    // Set up world
    this.setupWorld()
    this.setupInput()
    this.setupCamera()
    
    // Create player
    this.createPlayer()
    
    // Set up physics
    this.setupPhysics()

    // Start game loop
    this.events.on('update', this.gameUpdate, this)
  }

  private setupWorld() {
    // Create background
    this.add.rectangle(
      this.gameState.currentMap.width / 2,
      this.gameState.currentMap.height / 2,
      this.gameState.currentMap.width,
      this.gameState.currentMap.height,
      0x87CEEB // Sky blue
    ).setDepth(-100)

    // Create platforms
    this.platforms = this.physics.add.staticGroup()
    
    this.gameState.currentMap.platforms.forEach(platform => {
      const platformSprite = this.add.rectangle(
        platform.x + platform.width / 2,
        platform.y + platform.height / 2,
        platform.width,
        platform.height,
        platform.type === 'solid' ? 0x8B4513 : 0x654321 // Brown colors
      )
      
      this.physics.add.existing(platformSprite, true)
      this.platforms.add(platformSprite)
    })

    // Create monsters
    this.gameState.currentMap.monsters.forEach((monsterSpawn, index) => {
      const monsterId = `monster_${index}`
      const monster: Monster = {
        id: monsterId,
        type: monsterSpawn.monsterType,
        level: monsterSpawn.level,
        health: 100,
        maxHealth: 100,
        x: monsterSpawn.x,
        y: monsterSpawn.y,
        state: 'idle'
      }
      
      this.dispatch({ type: 'ADD_MONSTER', payload: monster })
      this.createMonsterSprite(monster)
    })
  }

  private setupInput() {
    // Set up input handling
    this.input.keyboard!.on('keydown', this.handleKeyDown, this)
    this.input.keyboard!.on('keyup', this.handleKeyUp, this)
  }

  private handleKeyDown(event: KeyboardEvent) {
    const now = this.time.now
    if (now - this.lastInputTime < this.inputBuffer) return
    
    switch (event.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        this.inputState.left = true
        break
      case 'd':
      case 'arrowright':
        this.inputState.right = true
        break
      case 'w':
      case 'arrowup':
      case ' ':
        this.inputState.jump = true
        break
      case 's':
      case 'arrowdown':
        this.inputState.down = true
        break
      case 'z':
        this.inputState.attack = true
        break
      case 'x':
        this.inputState.skill1 = true
        break
      case 'c':
        this.inputState.skill2 = true
        break
      case 'i':
        this.inputState.inventory = true
        break
    }
    
    this.lastInputTime = now
  }

  private handleKeyUp(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        this.inputState.left = false
        break
      case 'd':
      case 'arrowright':
        this.inputState.right = false
        break
      case 'w':
      case 'arrowup':
      case ' ':
        this.inputState.jump = false
        break
      case 's':
      case 'arrowdown':
        this.inputState.down = false
        break
      case 'z':
        this.inputState.attack = false
        break
      case 'x':
        this.inputState.skill1 = false
        break
      case 'c':
        this.inputState.skill2 = false
        break
      case 'i':
        this.inputState.inventory = false
        break
    }
  }

  private setupCamera() {
    // Set camera bounds
    this.cameras.main.setBounds(0, 0, this.gameState.currentMap.width, this.gameState.currentMap.height)
    this.cameras.main.setZoom(1)
  }

  private createPlayer() {
    // Create a default player
    const spawnPoint = this.gameState.currentMap.spawnPoints[0]
    
    // Get URL parameters for customization
    const urlParams = new URLSearchParams(window.location.search)
    const username = urlParams.get('username') || 'Player'
    const characterClass = urlParams.get('class') || 'warrior'
    
    console.log('Creating player:', { username, characterClass })
    
    this.player = {
      id: 'player_1',
      username: username,
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      x: spawnPoint.x,
      y: spawnPoint.y,
      velocityX: 0,
      velocityY: 0,
      direction: 'right',
      state: 'idle',
      characterClass: characterClass as any,
      equipment: { accessories: [] },
      inventory: []
    }

    // Add to game state
    this.dispatch({ type: 'ADD_PLAYER', payload: this.player })

    // Create sprite
    this.createPlayerSprite()
  }

  private createPlayerSprite() {
    this.playerSprite = this.add.rectangle(
      this.player.x,
      this.player.y,
      32,
      48,
      0xFF6B6B // Red color for player
    ) as any

    // Add physics
    this.physics.add.existing(this.playerSprite)
    const body = this.playerSprite.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(32, 48)

    // Make camera follow player
    this.cameras.main.startFollow(this.playerSprite)
    
    // Add player name label
    const playerLabel = this.add.text(this.player.x, this.player.y - 30, this.player.username, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#006600',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5)
    
    // Store label reference
    ;(this.playerSprite as any).nameLabel = playerLabel
    
    console.log('Created player sprite for:', this.player.username)
  }

  private createMonsterSprite(monster: Monster) {
    const sprite = this.add.rectangle(
      monster.x,
      monster.y,
      24,
      32,
      0xFF4444 // Dark red for monsters
    ) as any

    this.physics.add.existing(sprite)
    const body = sprite.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(24, 32)

    this.monsterSprites.set(monster.id, sprite)
  }

  private setupPhysics() {
    // Player vs platforms
    this.physics.add.collider(this.playerSprite, this.platforms)
    
    // Monsters vs platforms
    this.monsterSprites.forEach(sprite => {
      this.physics.add.collider(sprite, this.platforms)
    })
  }

  // Remove multiplayer methods - no longer needed for single player

  private gameUpdate() {
    // Only update if player exists
    if (!this.player || !this.playerSprite) {
      return
    }

    // Update player
    this.playerController.update(this.player, this.playerSprite, this.inputState)
    
    // Update monsters
    Object.values(this.gameState.monsters).forEach(monster => {
      const sprite = this.monsterSprites.get(monster.id)
      if (sprite) {
        this.monsterController.update(monster, sprite, this.player)
      }
    })

    // Update combat
    this.combatSystem.update()

    // Update player name label position
    if ((this.playerSprite as any).nameLabel) {
      ;(this.playerSprite as any).nameLabel.setPosition(
        this.playerSprite.x, 
        this.playerSprite.y - 30
      )
    }

    // Update local game state
    if (this.playerSprite.body) {
      const body = this.playerSprite.body as Phaser.Physics.Arcade.Body
      
      this.dispatch({
        type: 'UPDATE_PLAYER',
        payload: {
          playerId: this.player.id,
          player: {
            x: this.playerSprite.x,
            y: this.playerSprite.y,
            velocityX: body.velocity.x,
            velocityY: body.velocity.y,
            direction: this.player.direction,
            state: this.player.state
          }
        }
      })
    }
  }

  // Public getters for systems
  getPlatforms() {
    return this.platforms
  }

  getPlayer() {
    return this.player
  }

  getPlayerSprite() {
    return this.playerSprite
  }

  getMonsterSprites() {
    return this.monsterSprites
  }

  getGameState() {
    return this.gameState
  }

  getDispatch() {
    return this.dispatch
  }
}