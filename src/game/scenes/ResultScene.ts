import Phaser from 'phaser';
import { getCharacterSelectCard } from '../data/fighters';
import { DEFAULT_MATCH_CONFIG } from '../data/match';
import { GAME_HEIGHT, GAME_WIDTH, STAGES } from '../data/stage';
import type { ResultPayload } from '../types';

export class ResultScene extends Phaser.Scene {
  private restartKey?: Phaser.Input.Keyboard.Key;
  private characterSelectKey?: Phaser.Input.Keyboard.Key;
  private titleKey?: Phaser.Input.Keyboard.Key;
  private payload: ResultPayload = {
    winner: 'draw',
    playerDamage: 0,
    cpuDamage: 0,
    config: DEFAULT_MATCH_CONFIG
  };

  constructor() {
    super('ResultScene');
  }

  create(payload: ResultPayload): void {
    this.payload = payload;
    const stage = STAGES[payload.config.stage];
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, stage.backgroundTexture).setAlpha(0.7);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06101f, 0.5);

    const playerCard = getCharacterSelectCard(payload.config.playerCharacter);
    const cpuCard = getCharacterSelectCard(payload.config.cpuCharacter);
    const winnerCard = payload.winner === 'player' ? playerCard : payload.winner === 'cpu' ? cpuCard : undefined;
    const title = winnerCard ? `${winnerCard.shortName} WINS` : 'DRAW';
    const color = winnerCard ? `#${winnerCard.accent.toString(16).padStart(6, '0')}` : '#f4f7ff';

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

    this.createButton(GAME_WIDTH / 2 - 260, 462, 'REMATCH', () => {
      this.scene.start('GameScene', this.payload.config);
    });
    this.createButton(GAME_WIDTH / 2, 462, 'CHARACTER SELECT', () => {
      this.scene.start('CharacterSelectScene', this.payload.config);
    }, 300);
    this.createButton(GAME_WIDTH / 2 + 275, 462, 'TITLE', () => {
      this.scene.start('TitleScene');
    }, 190);

    this.add.text(GAME_WIDTH / 2, 548, 'R rematch   C character select   T title', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '20px',
      color: '#d8f4ff'
    }).setOrigin(0.5);

    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.characterSelectKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.titleKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.T);
  }

  update(): void {
    if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.start('GameScene', this.payload.config);
    }

    if (this.characterSelectKey && Phaser.Input.Keyboard.JustDown(this.characterSelectKey)) {
      this.scene.start('CharacterSelectScene', this.payload.config);
    }

    if (this.titleKey && Phaser.Input.Keyboard.JustDown(this.titleKey)) {
      this.scene.start('TitleScene');
    }
  }

  private createButton(x: number, y: number, label: string, onClick: () => void, width = 210): void {
    const button = this.add.rectangle(x, y, width, 58, 0xff5b69, 0.9);
    button.setStrokeStyle(3, 0xffffff, 0.82);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', onClick);

    this.add.text(x, y, label, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '22px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
