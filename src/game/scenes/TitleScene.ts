import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../data/stage';

export class TitleScene extends Phaser.Scene {
  private startKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'title-key-art').setDepth(0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1b0e08, 0.22);

    this.add.text(GAME_WIDTH / 2, 92, 'KUDAMONO', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '76px',
      fontStyle: '900',
      color: '#fff7d6',
      stroke: '#7a241c',
      strokeThickness: 10
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 162, 'BATTLE', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '86px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#1b5b57',
      strokeThickness: 10
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 238, 'Fruit fighters on the kitchen counter', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '24px',
      color: '#fff4dc',
      stroke: '#4c2718',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.createButton(GAME_WIDTH / 2, 610, 'START', () => {
      this.scene.start('CharacterSelectScene');
    });

    this.startKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  }

  update(): void {
    if (this.startKey && Phaser.Input.Keyboard.JustDown(this.startKey)) {
      this.scene.start('CharacterSelectScene');
    }
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add.rectangle(x, y, 260, 70, 0xff5b69, 0.92);
    button.setStrokeStyle(4, 0xffffff, 0.9);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', onClick);
    button.on('pointerover', () => button.setFillStyle(0xff7b84, 0.98));
    button.on('pointerout', () => button.setFillStyle(0xff5b69, 0.92));

    this.add.text(x, y, label, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '34px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
