import * as Phaser from 'phaser'

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: true })
  }

  create() {
    // This scene handles in-game UI elements that need to be rendered by Phaser
    // Most UI is handled by React components, but some game-specific UI can go here
    
    // Example: Damage numbers, floating text, etc.
    this.events.on('showDamage', this.showDamageNumber, this)
    this.events.on('showLevelUp', this.showLevelUpEffect, this)
  }

  private showDamageNumber(x: number, y: number, damage: number, isCritical: boolean = false) {
    const color = isCritical ? '#FFD700' : '#FF0000'
    const fontSize = isCritical ? '24px' : '18px'
    
    const damageText = this.add.text(x, y, `-${damage}`, {
      fontSize,
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5)

    // Animate the damage number
    this.tweens.add({
      targets: damageText,
      y: y - 50,
      alpha: 0,
      scale: isCritical ? 1.5 : 1.2,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy()
      }
    })
  }

  private showLevelUpEffect(x: number, y: number) {
    const levelUpText = this.add.text(x, y, 'LEVEL UP!', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Create particle effect
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.3, end: 0 },
      lifespan: 1000,
      quantity: 20
    })

    // Animate the text
    this.tweens.add({
      targets: levelUpText,
      y: y - 100,
      alpha: 0,
      scale: 2,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        levelUpText.destroy()
        particles.destroy()
      }
    })
  }

  showFloatingText(x: number, y: number, text: string, color: string = '#FFFFFF') {
    const floatingText = this.add.text(x, y, text, {
      fontSize: '16px',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5)

    this.tweens.add({
      targets: floatingText,
      y: y - 30,
      alpha: 0,
      duration: 1500,
      ease: 'Power1',
      onComplete: () => {
        floatingText.destroy()
      }
    })
  }
}