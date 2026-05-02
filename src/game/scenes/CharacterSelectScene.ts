import Phaser from 'phaser';
import { CHARACTER_SELECT_CARDS } from '../data/fighters';
import { DEFAULT_MATCH_CONFIG, getCpuCharacterFor } from '../data/match';
import { GAME_HEIGHT, GAME_WIDTH } from '../data/stage';
import type { CharacterKey, CharacterSelectCard, MatchConfig } from '../types';

type CardVisual = {
  key: CharacterKey;
  frame: Phaser.GameObjects.Rectangle;
  marker: Phaser.GameObjects.Text;
};

export class CharacterSelectScene extends Phaser.Scene {
  private config: MatchConfig = DEFAULT_MATCH_CONFIG;
  private selected: CharacterKey = DEFAULT_MATCH_CONFIG.playerCharacter;
  private visuals: CardVisual[] = [];
  private leftKey?: Phaser.Input.Keyboard.Key;
  private rightKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private escKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('CharacterSelectScene');
  }

  create(config: MatchConfig = DEFAULT_MATCH_CONFIG): void {
    this.config = config;
    this.selected = config.playerCharacter;
    this.visuals = [];
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background-kitchen').setDepth(0).setAlpha(0.74);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07101d, 0.48);

    this.add.text(70, 48, 'Choose Your Fruit Fighter', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '44px',
      fontStyle: '900',
      color: '#fff7d6'
    });

    this.add.text(72, 100, 'Player 1 selects a fighter. CPU uses the rival fruit for now.', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '20px',
      color: '#d8f4ff'
    });

    this.renderCards();
    this.createButton(170, 640, 'TITLE', () => this.scene.start('TitleScene'));
    this.createButton(1110, 640, 'NEXT', () => this.goNext(), 0x29b978);
    this.bindKeys();
    this.refreshSelection();
  }

  update(): void {
    if (this.leftKey && Phaser.Input.Keyboard.JustDown(this.leftKey)) {
      this.stepSelection(-1);
    }

    if (this.rightKey && Phaser.Input.Keyboard.JustDown(this.rightKey)) {
      this.stepSelection(1);
    }

    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.goNext();
    }

    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.start('TitleScene');
    }
  }

  private renderCards(): void {
    const cardWidth = 320;
    const gap = 42;
    const totalWidth = CHARACTER_SELECT_CARDS.length * cardWidth + (CHARACTER_SELECT_CARDS.length - 1) * gap;
    const startX = GAME_WIDTH / 2 - totalWidth / 2 + cardWidth / 2;

    CHARACTER_SELECT_CARDS.forEach((card, index) => {
      const x = startX + index * (cardWidth + gap);
      this.createCard(card, x, 360, cardWidth, 390);
    });
  }

  private createCard(card: CharacterSelectCard, x: number, y: number, width: number, height: number): void {
    const frame = this.add.rectangle(x, y, width, height, 0x10243a, 0.86);
    frame.setStrokeStyle(4, card.tint, 0.7);
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      this.selected = card.key;
      this.refreshSelection();
    });

    const portrait = this.add.image(x, y - 70, card.portraitTexture);
    portrait.setDisplaySize(232, 232);
    portrait.setInteractive({ useHandCursor: true });
    portrait.on('pointerdown', () => {
      this.selected = card.key;
      this.refreshSelection();
    });

    this.add.text(x, y + 74, card.name, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '24px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(x, y + 112, card.role, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '17px',
      color: '#d8f4ff'
    }).setOrigin(0.5);

    const trait = this.add.text(x, y + 158, card.trait, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '15px',
      color: '#f6e9c8',
      align: 'center',
      wordWrap: { width: width - 48 }
    });
    trait.setOrigin(0.5);

    const marker = this.add.text(x, y - height / 2 + 28, 'P1', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: '#ffffff'
    });
    marker.setOrigin(0.5);

    this.visuals.push({ key: card.key, frame, marker });
  }

  private bindKeys(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.leftKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private stepSelection(direction: -1 | 1): void {
    const index = CHARACTER_SELECT_CARDS.findIndex((card) => card.key === this.selected);
    const nextIndex = Phaser.Math.Wrap(index + direction, 0, CHARACTER_SELECT_CARDS.length);
    this.selected = CHARACTER_SELECT_CARDS[nextIndex].key;
    this.refreshSelection();
  }

  private refreshSelection(): void {
    for (const visual of this.visuals) {
      const selected = visual.key === this.selected;
      visual.frame.setStrokeStyle(selected ? 7 : 4, selected ? 0xffffff : 0x6f8796, selected ? 1 : 0.55);
      visual.marker.setVisible(selected);
    }
  }

  private goNext(): void {
    this.scene.start('StageSelectScene', {
      playerCharacter: this.selected,
      cpuCharacter: getCpuCharacterFor(this.selected),
      stage: this.config.stage
    });
  }

  private createButton(x: number, y: number, label: string, onClick: () => void, color = 0xff5b69): void {
    const button = this.add.rectangle(x, y, 190, 58, color, 0.92);
    button.setStrokeStyle(3, 0xffffff, 0.82);
    button.setInteractive({ useHandCursor: true });
    button.on('pointerdown', onClick);

    this.add.text(x, y, label, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '24px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
