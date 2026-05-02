import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.svg('background', 'assets/cyber-dojo-background.svg', { width: 1280, height: 720 });
    const motions = ['idle', 'run', 'jump', 'quick', 'heavy', 'hurt'];

    for (const motion of motions) {
      this.load.image(`strawberry-${motion}`, `assets/characters/strawberry-samurai-${motion}.png`);
      this.load.image(`banana-${motion}`, `assets/characters/banana-brawler-${motion}.png`);
    }
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
