import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.load.svg('background', 'assets/cyber-dojo-background.svg', { width: 1280, height: 720 });
    this.load.svg('player', 'assets/astra-ronin.svg', { width: 192, height: 192 });
    this.load.svg('cpu', 'assets/volt-kensei.svg', { width: 192, height: 192 });
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
