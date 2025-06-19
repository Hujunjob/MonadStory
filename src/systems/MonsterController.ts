import * as Phaser from 'phaser'
import { Monster, Player } from '../types/game'

export class MonsterController {
  private scene: Phaser.Scene
  private aiUpdateInterval = 500 // Update AI every 500ms
  private lastAiUpdate = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  update(monster: Monster, sprite: Phaser.GameObjects.Sprite, player: Player) {
    const now = Date.now()
    
    // Only update AI at intervals to improve performance
    if (now - this.lastAiUpdate > this.aiUpdateInterval) {
      this.updateAI(monster, sprite, player)
      this.lastAiUpdate = now
    }

    // Always update movement and animation
    this.updateMovement(monster, sprite)
    this.updateAnimation(monster, sprite)
  }

  private updateAI(monster: Monster, sprite: Phaser.GameObjects.Sprite, player: Player) {
    if (monster.health <= 0) {
      monster.state = 'dead'
      return
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      monster.x, monster.y,
      player.x, player.y
    )

    // AI behavior based on monster type and distance
    switch (monster.type) {
      case 'slime':
        this.updateSlimeAI(monster, sprite, player, distanceToPlayer)
        break
      case 'goblin':
        this.updateGoblinAI(monster, sprite, player, distanceToPlayer)
        break
      case 'skeleton':
        this.updateSkeletonAI(monster, sprite, player, distanceToPlayer)
        break
      case 'orc':
        this.updateOrcAI(monster, sprite, player, distanceToPlayer)
        break
      case 'dragon':
        this.updateDragonAI(monster, sprite, player, distanceToPlayer)
        break
    }
  }

  private updateSlimeAI(monster: Monster, sprite: Phaser.GameObjects.Sprite, player: Player, distance: number) {
    const aggroRange = 100
    const attackRange = 40

    if (distance <= attackRange) {
      monster.state = 'attacking'
      monster.targetPlayerId = player.id
      this.performAttack(monster, sprite, player)
    } else if (distance <= aggroRange) {
      monster.state = 'chasing'
      monster.targetPlayerId = player.id
      this.moveTowards(monster, sprite, player.x, player.y, 80)
    } else {
      monster.state = 'idle'
      monster.targetPlayerId = undefined
    }
  }

  private updateGoblinAI(monster: Monster, sprite: Phaser.GameObjects.Sprite, player: Player, distance: number) {
    const aggroRange = 150
    const attackRange = 50

    if (distance <= attackRange) {
      monster.state = 'attacking'
      monster.targetPlayerId = player.id
      this.performAttack(monster, sprite, player)
    } else if (distance <= aggroRange) {
      monster.state = 'chasing'
      monster.targetPlayerId = player.id
      this.moveTowards(monster, sprite, player.x, player.y, 120)
    } else {
      monster.state = 'patrolling'
      monster.targetPlayerId = undefined
      this.patrol(monster, sprite)
    }
  }

  private updateSkeletonAI(monster: Monster, sprite: Phaser.GameObjects.Sprite, player: Player, distance: number) {
    const aggroRange = 200
    const attackRange = 60

    if (distance <= attackRange) {
      monster.state = 'attacking'
      monster.targetPlayerId = player.id
      this.performAttack(monster, sprite, player)
    } else if (distance <= aggroRange) {
      monster.state = 'chasing'
      monster.targetPlayerId = player.id
      this.moveTowards(monster, sprite, player.x, player.y, 100)
    } else {
      monster.state = 'idle'
      monster.targetPlayerId = undefined
    }
  }

  private updateOrcAI(monster: Monster, sprite: Phaser.GameObjects.Sprite, player: Player, distance: number) {
    const aggroRange = 180
    const attackRange = 70

    if (distance <= attackRange) {
      monster.state = 'attacking'
      monster.targetPlayerId = player.id
      this.performAttack(monster, sprite, player)
    } else if (distance <= aggroRange) {
      monster.state = 'chasing'
      monster.targetPlayerId = player.id
      this.moveTowards(monster, sprite, player.x, player.y, 90)
    } else {
      monster.state = 'patrolling'
      monster.targetPlayerId = undefined
      this.patrol(monster, sprite)
    }
  }

  private updateDragonAI(monster: Monster, sprite: Phaser.GameObjects.Sprite, player: Player, distance: number) {
    const aggroRange = 300
    const attackRange = 100

    if (distance <= attackRange) {
      monster.state = 'attacking'
      monster.targetPlayerId = player.id
      this.performAttack(monster, sprite, player)
    } else if (distance <= aggroRange) {
      monster.state = 'chasing'
      monster.targetPlayerId = player.id
      this.moveTowards(monster, sprite, player.x, player.y, 60) // Slower but more powerful
    } else {
      monster.state = 'idle'
      monster.targetPlayerId = undefined
    }
  }

  private moveTowards(monster: Monster, sprite: Phaser.GameObjects.Sprite, targetX: number, targetY: number, speed: number) {
    const body = sprite.body as Phaser.Physics.Arcade.Body
    if (!body) return

    const dx = targetX - monster.x
    const dy = targetY - monster.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 5) {
      const velocityX = (dx / distance) * speed
      body.setVelocityX(velocityX)
      
      // Update monster position
      monster.x = sprite.x
      monster.y = sprite.y
    } else {
      body.setVelocityX(0)
    }
  }

  private patrol(monster: Monster, sprite: Phaser.GameObjects.Sprite) {
    const body = sprite.body as Phaser.Physics.Arcade.Body
    if (!body) return

    // Simple patrol: move left and right randomly
    const patrolSpeed = 30
    const randomDirection = Math.random() > 0.5 ? 1 : -1
    
    body.setVelocityX(patrolSpeed * randomDirection)
    
    monster.x = sprite.x
    monster.y = sprite.y
  }

  private performAttack(monster: Monster, sprite: Phaser.GameObjects.Sprite, _player: Player) {
    // Create attack effect
    const attackDamage = this.calculateMonsterDamage(monster)
    
    // Create visual attack effect
    const attackEffect = this.scene.add.circle(
      sprite.x,
      sprite.y,
      30,
      0xFF0000,
      0.3
    )

    this.scene.time.delayedCall(300, () => {
      attackEffect.destroy()
    })

    // Emit attack event for combat system
    const attackInfo = {
      monsterId: monster.id,
      damage: attackDamage,
      x: sprite.x,
      y: sprite.y,
      width: 60,
      height: 60,
      timestamp: Date.now()
    }

    this.scene.events.emit('monsterAttack', attackInfo)
  }

  private updateMovement(monster: Monster, sprite: Phaser.GameObjects.Sprite) {
    // Update monster position from sprite
    monster.x = sprite.x
    monster.y = sprite.y
  }

  private updateAnimation(monster: Monster, sprite: Phaser.GameObjects.Sprite) {
    // Update sprite based on monster state
    // In a real implementation, you would change animations here
    
    switch (monster.state) {
      case 'idle':
        sprite.setTint(0xffffff) // Normal color
        break
      case 'chasing':
        sprite.setTint(0xffaaaa) // Slightly red tint
        break
      case 'attacking':
        sprite.setTint(0xff0000) // Red tint
        break
      case 'dead':
        sprite.setTint(0x555555) // Gray tint
        sprite.setAlpha(0.5)
        break
    }
  }

  private calculateMonsterDamage(monster: Monster): number {
    let baseDamage = 15

    // Scale damage with monster level and type
    switch (monster.type) {
      case 'slime':
        baseDamage = 10 + monster.level * 2
        break
      case 'goblin':
        baseDamage = 15 + monster.level * 3
        break
      case 'skeleton':
        baseDamage = 20 + monster.level * 4
        break
      case 'orc':
        baseDamage = 25 + monster.level * 5
        break
      case 'dragon':
        baseDamage = 50 + monster.level * 10
        break
    }

    // Add random variance
    const variance = 0.2
    const randomFactor = 1 + (Math.random() - 0.5) * variance * 2
    
    return Math.round(baseDamage * randomFactor)
  }

  // Public method to spawn a monster
  spawnMonster(type: string, level: number, x: number, y: number): Monster {
    const monster: Monster = {
      id: `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      level,
      health: this.getMonsterMaxHealth(type, level),
      maxHealth: this.getMonsterMaxHealth(type, level),
      x,
      y,
      state: 'idle'
    }

    return monster
  }

  private getMonsterMaxHealth(type: string, level: number): number {
    let baseHealth = 50

    switch (type) {
      case 'slime':
        baseHealth = 30 + level * 10
        break
      case 'goblin':
        baseHealth = 50 + level * 15
        break
      case 'skeleton':
        baseHealth = 80 + level * 20
        break
      case 'orc':
        baseHealth = 120 + level * 30
        break
      case 'dragon':
        baseHealth = 300 + level * 100
        break
    }

    return baseHealth
  }
}