import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.image('background', 'assets/kitchen-stage.webp');
    const motions = ['idle', 'run', 'jump', 'quick', 'heavy', 'hurt'];

    for (const motion of motions) {
      this.load.image(`strawberry-${motion}`, `assets/characters/strawberry-samurai-${motion}.webp`);
      this.load.image(`banana-${motion}`, `assets/characters/banana-brawler-${motion}.webp`);
    }
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
