import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../data/stage';
import type { ResultPayload } from '../types';

export class ResultScene extends Phaser.Scene {
  private restartKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('ResultScene');
  }

  create(payload: ResultPayload): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background').setAlpha(0.7);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06101f, 0.5);

    const title = payload.winner === 'player' ? 'ASTRA WINS' : payload.winner === 'cpu' ? 'VOLT WINS' : 'DRAW';
    const color = payload.winner === 'player' ? '#83f7ff' : payload.winner === 'cpu' ? '#ff91b1' : '#f4f7ff';

    this.add.text(GAME_WIDTH / 2, 245, title, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '72px',
      fontStyle: '900',
      color
    }).setOrigin(0.5);

    this.add.text(
      GAME_WIDTH / 2,
      338,
      `Final damage  1P ${Math.round(payload.playerDamage)}%   CPU ${Math.round(payload.cpuDamage)}%`,
      {
        fontFamily: 'Inter, Arial, sans-serif',
        fontSize: '24px',
        color: '#d8f4ff'
      }
    ).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 438, 'Press R to run it back', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  update(): void {
    if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.start('GameScene');
    }
  }
}
