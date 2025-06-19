import * as Phaser from 'phaser'
import { Player, InputState } from '../types/game'

export class PlayerController {
  private scene: Phaser.Scene
  private moveSpeed = 200
  private jumpPower = -500
  private airControl = 0.8

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  update(player: Player, sprite: Phaser.GameObjects.Sprite, input: InputState) {
    const body = sprite.body as Phaser.Physics.Arcade.Body
    if (!body) return

    // Horizontal movement
    let velocityX = 0
    
    // Check if player is on ground (touching ground)
    const isOnGround = body.touching.down || body.blocked.down

    if (input.left) {
      velocityX = -this.moveSpeed
      player.direction = 'left'
      player.state = isOnGround ? 'walking' : 'falling'
    } else if (input.right) {
      velocityX = this.moveSpeed
      player.direction = 'right'
      player.state = isOnGround ? 'walking' : 'falling'
    } else {
      player.state = isOnGround ? 'idle' : 'falling'
    }

    // Apply air control when in air
    if (!isOnGround) {
      const currentVelX = body.velocity.x
      velocityX = currentVelX + (velocityX - currentVelX) * this.airControl * (1/60)
    }

    body.setVelocityX(velocityX)

    // Jumping
    if (input.jump && isOnGround) {
      body.setVelocityY(this.jumpPower)
      player.state = 'jumping'
      
      // Play jump sound effect
      if (this.scene.sound.get('jump')) {
        this.scene.sound.play('jump', { volume: 0.3 })
      }
    }

    // Attacking
    if (input.attack && !['attacking', 'dead'].includes(player.state)) {
      this.performAttack(player, sprite)
    }

    // Skills
    if (input.skill1) {
      this.useSkill(player, sprite, 1)
    }

    // Update sprite direction
    if (player.direction === 'left') {
      sprite.setScale(-1, 1)
    } else {
      sprite.setScale(1, 1)
    }

    // Update player position
    player.x = sprite.x
    player.y = sprite.y
    player.velocityX = body.velocity.x
    player.velocityY = body.velocity.y
  }

  private performAttack(player: Player, sprite: Phaser.GameObjects.Sprite) {
    player.state = 'attacking'
    
    // Create attack hitbox
    const attackRange = 60
    const attackX = player.direction === 'right' ? 
      sprite.x + attackRange/2 : sprite.x - attackRange/2
    
    const attackHitbox = this.scene.add.rectangle(
      attackX,
      sprite.y,
      attackRange,
      40,
      0xFF0000,
      0.3
    )

    // Make hitbox temporary
    this.scene.time.delayedCall(200, () => {
      attackHitbox.destroy()
      if (player.state === 'attacking') {
        player.state = 'idle'
      }
    })

    // Add physics to hitbox for collision detection
    this.scene.physics.add.existing(attackHitbox, true)

    // Play attack sound
    if (this.scene.sound.get('attack')) {
      this.scene.sound.play('attack', { volume: 0.4 })
    }

    // Store attack info for combat system
    const attackInfo = {
      playerId: player.id,
      damage: this.calculateAttackDamage(player),
      x: attackX,
      y: sprite.y,
      width: attackRange,
      height: 40,
      timestamp: Date.now()
    }

    this.scene.events.emit('playerAttack', attackInfo)
  }

  private useSkill(player: Player, sprite: Phaser.GameObjects.Sprite, skillSlot: number) {
    // Implement skill system based on character class
    switch (player.characterClass) {
      case 'warrior':
        this.useWarriorSkill(player, sprite, skillSlot)
        break
      case 'mage':
        this.useMageSkill(player, sprite, skillSlot)
        break
      case 'archer':
        this.useArcherSkill(player, sprite, skillSlot)
        break
      case 'thief':
        this.useThiefSkill(player, sprite, skillSlot)
        break
    }
  }

  private useWarriorSkill(player: Player, sprite: Phaser.GameObjects.Sprite, skillSlot: number) {
    if (player.mana < 10) return // Not enough mana

    switch (skillSlot) {
      case 1: // Power Strike
        player.mana -= 10
        player.state = 'attacking'
        
        // Enhanced attack with wider range
        const attackRange = 100
        const attackX = player.direction === 'right' ? 
          sprite.x + attackRange/2 : sprite.x - attackRange/2
        
        const skillHitbox = this.scene.add.rectangle(
          attackX,
          sprite.y,
          attackRange,
          60,
          0xFFAA00,
          0.5
        )

        this.scene.time.delayedCall(300, () => {
          skillHitbox.destroy()
          player.state = 'idle'
        })

        this.scene.physics.add.existing(skillHitbox, true)

        const attackInfo = {
          playerId: player.id,
          damage: this.calculateAttackDamage(player) * 1.5,
          x: attackX,
          y: sprite.y,
          width: attackRange,
          height: 60,
          timestamp: Date.now(),
          isSkill: true
        }

        this.scene.events.emit('playerAttack', attackInfo)
        break
    }
  }

  private useMageSkill(player: Player, sprite: Phaser.GameObjects.Sprite, skillSlot: number) {
    if (player.mana < 15) return

    switch (skillSlot) {
      case 1: // Fireball
        player.mana -= 15
        this.createProjectile(player, sprite, 'fireball')
        break
    }
  }

  private useArcherSkill(player: Player, sprite: Phaser.GameObjects.Sprite, skillSlot: number) {
    if (player.mana < 8) return

    switch (skillSlot) {
      case 1: // Power Shot
        player.mana -= 8
        this.createProjectile(player, sprite, 'arrow', 1.5)
        break
    }
  }

  private useThiefSkill(player: Player, sprite: Phaser.GameObjects.Sprite, skillSlot: number) {
    if (player.mana < 12) return

    switch (skillSlot) {
      case 1: // Dash Attack
        player.mana -= 12
        const dashDistance = 150
        const dashDirection = player.direction === 'right' ? 1 : -1
        
        // Quick dash movement
        const body = sprite.body as Phaser.Physics.Arcade.Body
        body.setVelocityX(dashDistance * dashDirection * 5)
        
        // Reset velocity after dash
        this.scene.time.delayedCall(200, () => {
          body.setVelocityX(0)
        })
        break
    }
  }

  private createProjectile(player: Player, sprite: Phaser.GameObjects.Sprite, type: string, damageMultiplier: number = 1) {
    const projectileSpeed = 400
    const direction = player.direction === 'right' ? 1 : -1
    
    const projectile = this.scene.add.circle(
      sprite.x + (30 * direction),
      sprite.y,
      8,
      type === 'fireball' ? 0xFF4400 : 0x888888
    )

    this.scene.physics.add.existing(projectile)
    const body = projectile.body as Phaser.Physics.Arcade.Body
    body.setVelocity(projectileSpeed * direction, 0)

    // Destroy projectile after time or collision
    this.scene.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.destroy()
      }
    })

    // Add collision detection for projectile
    const projectileInfo = {
      playerId: player.id,
      damage: this.calculateAttackDamage(player) * damageMultiplier,
      sprite: projectile,
      type,
      timestamp: Date.now()
    }

    this.scene.events.emit('projectileCreated', projectileInfo)
  }

  private calculateAttackDamage(player: Player): number {
    let baseDamage = 20
    
    // Add weapon damage if equipped
    if (player.equipment.weapon) {
      baseDamage += player.equipment.weapon.damage
    }
    
    // Add level scaling
    baseDamage += player.level * 2
    
    // Add random variance (±20%)
    const variance = 0.2
    const randomFactor = 1 + (Math.random() - 0.5) * variance * 2
    
    return Math.round(baseDamage * randomFactor)
  }
}