import * as Phaser from 'phaser'
import { MainScene } from '../scenes/MainScene'
import { Player, Monster } from '../types/game'

interface AttackInfo {
  playerId?: string
  monsterId?: string
  damage: number
  x: number
  y: number
  width: number
  height: number
  timestamp: number
  isSkill?: boolean
}

interface ProjectileInfo {
  playerId: string
  damage: number
  sprite: Phaser.GameObjects.GameObject
  type: string
  timestamp: number
}

export class CombatSystem {
  private scene: MainScene
  private activeAttacks: AttackInfo[] = []
  private activeProjectiles: ProjectileInfo[] = []
  private lastCleanup = 0

  constructor(scene: MainScene) {
    this.scene = scene
    
    // Listen for attack events
    this.scene.events.on('playerAttack', this.handlePlayerAttack, this)
    this.scene.events.on('monsterAttack', this.handleMonsterAttack, this)
    this.scene.events.on('projectileCreated', this.handleProjectileCreated, this)
  }

  update() {
    // Clean up old attacks and projectiles periodically
    const now = Date.now()
    if (now - this.lastCleanup > 1000) {
      this.cleanupOldAttacks()
      this.lastCleanup = now
    }

    // Update projectiles
    this.updateProjectiles()
  }

  private handlePlayerAttack(attackInfo: AttackInfo) {
    this.activeAttacks.push(attackInfo)
    
    // Check collision with monsters
    const gameState = this.scene.getGameState()
    const monsterSprites = this.scene.getMonsterSprites()
    
    Object.values(gameState.monsters).forEach(monster => {
      if (monster.state === 'dead') return
      
      const monsterSprite = monsterSprites.get(monster.id)
      if (!monsterSprite) return
      
      // Check if attack overlaps with monster
      if (this.checkOverlap(attackInfo, monster)) {
        this.damageMonster(monster, attackInfo.damage, attackInfo.isSkill)
      }
    })
  }

  private handleMonsterAttack(attackInfo: AttackInfo) {
    this.activeAttacks.push(attackInfo)
    
    // Check collision with player
    const player = this.scene.getPlayer()
    
    if (this.checkOverlap(attackInfo, player)) {
      this.damagePlayer(player, attackInfo.damage)
    }
  }

  private handleProjectileCreated(projectileInfo: ProjectileInfo) {
    this.activeProjectiles.push(projectileInfo)
    
    // Set up collision detection for the projectile
    const gameState = this.scene.getGameState()
    const monsterSprites = this.scene.getMonsterSprites()
    const platforms = this.scene.getPlatforms()
    
    // Projectile vs monsters
    Object.values(gameState.monsters).forEach(monster => {
      const monsterSprite = monsterSprites.get(monster.id)
      if (monsterSprite && monster.state !== 'dead') {
        this.scene.physics.add.overlap(
          projectileInfo.sprite as any,
          monsterSprite,
          () => {
            this.damageMonster(monster, projectileInfo.damage, true)
            this.destroyProjectile(projectileInfo)
          }
        )
      }
    })
    
    // Projectile vs platforms
    this.scene.physics.add.collider(
      projectileInfo.sprite as any,
      platforms,
      () => {
        this.destroyProjectile(projectileInfo)
      }
    )
  }

  private checkOverlap(attackInfo: AttackInfo, target: Player | Monster): boolean {
    const targetHalfWidth = 16 // Assuming 32px wide sprites
    const targetHalfHeight = 24 // Assuming 48px tall sprites
    
    return (
      target.x + targetHalfWidth > attackInfo.x - attackInfo.width / 2 &&
      target.x - targetHalfWidth < attackInfo.x + attackInfo.width / 2 &&
      target.y + targetHalfHeight > attackInfo.y - attackInfo.height / 2 &&
      target.y - targetHalfHeight < attackInfo.y + attackInfo.height / 2
    )
  }

  private damageMonster(monster: Monster, damage: number, isCritical: boolean = false) {
    if (monster.state === 'dead') return
    
    // Calculate actual damage (could add armor reduction here)
    const actualDamage = Math.max(1, damage)
    monster.health = Math.max(0, monster.health - actualDamage)
    
    // Show damage number
    const uiScene = this.scene.scene.get('UIScene')
    if (uiScene) {
      uiScene.events.emit('showDamage', monster.x, monster.y - 20, actualDamage, isCritical)
    }
    
    // Check if monster died
    if (monster.health <= 0) {
      this.killMonster(monster)
    }
    
    // Update monster in game state
    this.scene.getDispatch()({
      type: 'UPDATE_MONSTER',
      payload: {
        monsterId: monster.id,
        monster: { health: monster.health, state: monster.state }
      }
    })
  }

  private damagePlayer(player: Player, damage: number) {
    // Calculate actual damage (could add armor reduction here)
    const actualDamage = Math.max(1, damage)
    player.health = Math.max(0, player.health - actualDamage)
    
    // Show damage number
    const uiScene = this.scene.scene.get('UIScene')
    if (uiScene) {
      uiScene.events.emit('showDamage', player.x, player.y - 20, actualDamage, false)
    }
    
    // Check if player died
    if (player.health <= 0) {
      this.killPlayer(player)
    }
    
    // Update player in game state
    this.scene.getDispatch()({
      type: 'UPDATE_PLAYER',
      payload: {
        playerId: player.id,
        player: { health: player.health, state: player.state }
      }
    })
  }

  private killMonster(monster: Monster) {
    monster.state = 'dead'
    
    // Award experience to player
    const player = this.scene.getPlayer()
    const expGain = this.calculateExpGain(monster)
    player.experience += expGain
    
    // Check for level up
    const expNeeded = this.getExpNeededForLevel(player.level + 1)
    if (player.experience >= expNeeded) {
      this.levelUpPlayer(player)
    }
    
    // Show floating text
    const uiScene = this.scene.scene.get('UIScene') as any
    if (uiScene && typeof uiScene.showFloatingText === 'function') {
      uiScene.showFloatingText(
        monster.x, 
        monster.y - 40, 
        `+${expGain} EXP`, 
        '#00FF00'
      )
    }
    
    // Schedule monster respawn
    this.scheduleMonsterRespawn(monster)
  }

  private killPlayer(player: Player) {
    player.state = 'dead'
    
    // Respawn player after delay
    this.scene.time.delayedCall(3000, () => {
      this.respawnPlayer(player)
    })
  }

  private levelUpPlayer(player: Player) {
    player.level++
    player.experience = 0
    
    // Increase stats
    player.maxHealth += 20
    player.health = player.maxHealth // Full heal on level up
    player.maxMana += 10
    player.mana = player.maxMana
    
    // Show level up effect
    const uiScene = this.scene.scene.get('UIScene')
    if (uiScene) {
      uiScene.events.emit('showLevelUp', player.x, player.y)
    }
    
    // Play level up sound
    if (this.scene.sound.get('levelup')) {
      this.scene.sound.play('levelup', { volume: 0.5 })
    }
  }

  private respawnPlayer(player: Player) {
    const spawnPoint = this.scene.getGameState().currentMap.spawnPoints[0]
    player.x = spawnPoint.x
    player.y = spawnPoint.y
    player.health = player.maxHealth
    player.state = 'idle'
    
    // Update sprite position
    const sprite = this.scene.getPlayerSprite()
    sprite.setPosition(player.x, player.y)
  }

  private scheduleMonsterRespawn(monster: Monster) {
    // Find the monster spawn info
    const map = this.scene.getGameState().currentMap
    const monsterSpawn = map.monsters.find(spawn => 
      Math.abs(spawn.x - monster.x) < 50 && Math.abs(spawn.y - monster.y) < 50
    )
    
    if (monsterSpawn) {
      this.scene.time.delayedCall(monsterSpawn.respawnTime, () => {
        // Reset monster
        monster.health = monster.maxHealth
        monster.state = 'idle'
        monster.targetPlayerId = undefined
        
        // Reset sprite
        const monsterSprites = this.scene.getMonsterSprites()
        const sprite = monsterSprites.get(monster.id)
        if (sprite) {
          sprite.setPosition(monsterSpawn.x, monsterSpawn.y)
          sprite.setAlpha(1)
          sprite.setTint(0xffffff)
        }
      })
    }
  }

  private updateProjectiles() {
    this.activeProjectiles = this.activeProjectiles.filter(projectile => {
      if (!projectile.sprite.active) {
        return false // Remove destroyed projectiles
      }
      return true
    })
  }

  private destroyProjectile(projectileInfo: ProjectileInfo) {
    if (projectileInfo.sprite.active) {
      projectileInfo.sprite.destroy()
    }
    
    // Remove from active projectiles
    const index = this.activeProjectiles.indexOf(projectileInfo)
    if (index > -1) {
      this.activeProjectiles.splice(index, 1)
    }
  }

  private cleanupOldAttacks() {
    const now = Date.now()
    const maxAge = 2000 // 2 seconds
    
    this.activeAttacks = this.activeAttacks.filter(
      attack => now - attack.timestamp < maxAge
    )
    
    this.activeProjectiles = this.activeProjectiles.filter(
      projectile => now - projectile.timestamp < 10000 // 10 seconds max
    )
  }

  private calculateExpGain(monster: Monster): number {
    let baseExp = 10
    
    switch (monster.type) {
      case 'slime':
        baseExp = 5 + monster.level * 2
        break
      case 'goblin':
        baseExp = 8 + monster.level * 3
        break
      case 'skeleton':
        baseExp = 12 + monster.level * 4
        break
      case 'orc':
        baseExp = 15 + monster.level * 5
        break
      case 'dragon':
        baseExp = 50 + monster.level * 20
        break
    }
    
    return baseExp
  }

  private getExpNeededForLevel(level: number): number {
    // Exponential experience curve
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }
}