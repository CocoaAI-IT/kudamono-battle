import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.image('title-key-art', 'assets/ui/title-key-art.webp');
    this.load.image('portrait-strawberry', 'assets/ui/portrait-strawberry-samurai.webp');
    this.load.image('portrait-banana', 'assets/ui/portrait-banana-brawler.webp');
    this.load.image('portrait-grape', 'assets/ui/portrait-grape-gunner.jpg');
    this.load.image('portrait-watermelon', 'assets/ui/portrait-watermelon-tank.jpg');
    this.load.image('portrait-pineapple', 'assets/ui/portrait-pineapple-trapper.jpg');
    this.load.image('portrait-cherry', 'assets/ui/portrait-cherry-ninja.jpg');
    this.load.image('background-kitchen', 'assets/kitchen-stage.webp');
    this.load.image('background-dark-board', 'assets/dark-board-stage.jpg');
    const motions = ['idle', 'run', 'jump', 'quick', 'heavy', 'hurt'];
    const characters = ['strawberry', 'banana', 'grape', 'watermelon', 'pineapple', 'cherry'];
    const effectRoles = ['quick', 'heavy', 'projectile', 'trap', 'armor', 'combo'];

    for (const motion of motions) {
      this.load.image(`strawberry-${motion}`, `assets/characters/strawberry-samurai-${motion}.webp`);
      this.load.image(`banana-${motion}`, `assets/characters/banana-brawler-${motion}.webp`);
      this.load.image(`grape-${motion}`, `assets/characters/grape-gunner-${motion}.png`);
      this.load.image(`watermelon-${motion}`, `assets/characters/watermelon-tank-${motion}.png`);
      this.load.image(`pineapple-${motion}`, `assets/characters/pineapple-trapper-${motion}.png`);
      this.load.image(`cherry-${motion}`, `assets/characters/cherry-ninja-${motion}.png`);
    }

    for (const character of characters) {
      for (const role of effectRoles) {
        this.load.image(`effect-${character}-${role}`, `assets/effects/${character}-${role}.png`);
      }
    }
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
