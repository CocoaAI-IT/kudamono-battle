import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.image('title-key-art', 'assets/ui/title-key-art.webp');
    this.load.image('portrait-strawberry', 'assets/ui/portrait-strawberry-samurai.webp');
    this.load.image('portrait-banana', 'assets/ui/portrait-banana-brawler.webp');
    this.load.image('portrait-grape', 'assets/ui/portrait-grape-gunner.png');
    this.load.image('portrait-watermelon', 'assets/ui/portrait-watermelon-tank.png');
    this.load.image('portrait-pineapple', 'assets/ui/portrait-pineapple-trapper.png');
    this.load.image('portrait-cherry', 'assets/ui/portrait-cherry-ninja.png');
    this.load.image('background-kitchen', 'assets/kitchen-stage.webp');
    const motions = ['idle', 'run', 'jump', 'quick', 'heavy', 'hurt'];

    for (const motion of motions) {
      this.load.image(`strawberry-${motion}`, `assets/characters/strawberry-samurai-${motion}.webp`);
      this.load.image(`banana-${motion}`, `assets/characters/banana-brawler-${motion}.webp`);
      this.load.image(`grape-${motion}`, `assets/characters/grape-gunner-${motion}.png`);
      this.load.image(`watermelon-${motion}`, `assets/characters/watermelon-tank-${motion}.png`);
      this.load.image(`pineapple-${motion}`, `assets/characters/pineapple-trapper-${motion}.png`);
      this.load.image(`cherry-${motion}`, `assets/characters/cherry-ninja-${motion}.png`);
    }
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
