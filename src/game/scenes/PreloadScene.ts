import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.image('title-key-art', 'assets/ui/title-key-art.webp');
    this.load.image('portrait-strawberry', 'assets/ui/portrait-strawberry-samurai.webp');
    this.load.image('portrait-banana', 'assets/ui/portrait-banana-brawler.webp');
    this.load.image('background-kitchen', 'assets/kitchen-stage.webp');
    const motions = ['idle', 'run', 'jump', 'quick', 'heavy', 'hurt'];

    for (const motion of motions) {
      this.load.image(`strawberry-${motion}`, `assets/characters/strawberry-samurai-${motion}.webp`);
      this.load.image(`banana-${motion}`, `assets/characters/banana-brawler-${motion}.webp`);
    }
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
