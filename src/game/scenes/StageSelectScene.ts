import Phaser from 'phaser';
import { DEFAULT_MATCH_CONFIG, normalizeMatchConfig } from '../data/match';
import { GAME_HEIGHT, GAME_WIDTH, STAGE_SELECT_CARDS } from '../data/stage';
import type { MatchConfig, StageKey, StageSelectCard } from '../types';

type StageVisual = {
  key: StageKey;
  frame: Phaser.GameObjects.Rectangle;
  marker: Phaser.GameObjects.Text;
};

export class StageSelectScene extends Phaser.Scene {
  private config: MatchConfig = DEFAULT_MATCH_CONFIG;
  private selected: StageKey = DEFAULT_MATCH_CONFIG.stage;
  private visuals: StageVisual[] = [];
  private leftKey?: Phaser.Input.Keyboard.Key;
  private rightKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;
  private escKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('StageSelectScene');
  }

  create(config: Partial<MatchConfig> = DEFAULT_MATCH_CONFIG): void {
    this.config = normalizeMatchConfig(config);
    this.selected = this.config.stage;
    this.visuals = [];
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'title-key-art').setDepth(0).setAlpha(0.68);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x07101d, 0.58);

    this.add.text(70, 48, 'Choose Stage', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '44px',
      fontStyle: '900',
      color: '#fff7d6'
    });

    this.add.text(72, 100, 'Pick a platform layout before the match starts.', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '20px',
      color: '#d8f4ff'
    });

    this.renderStages();
    this.createButton(170, 640, 'BACK', () => {
      this.scene.start('CharacterSelectScene', {
        ...this.config,
        stage: this.selected
      });
    });
    this.createButton(1072, 640, 'START MATCH', () => this.startMatch(), 0x29b978, 260);
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
      this.startMatch();
    }

    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.start('CharacterSelectScene', {
        ...this.config,
        stage: this.selected
      });
    }
  }

  private renderStages(): void {
    const cardWidth = 470;
    const gap = 36;
    const totalWidth = STAGE_SELECT_CARDS.length * cardWidth + (STAGE_SELECT_CARDS.length - 1) * gap;
    const startX = GAME_WIDTH / 2 - totalWidth / 2 + cardWidth / 2;

    STAGE_SELECT_CARDS.forEach((card, index) => {
      this.createStageCard(card, startX + index * (cardWidth + gap), 360, cardWidth, 370);
    });
  }

  private createStageCard(card: StageSelectCard, x: number, y: number, width: number, height: number): void {
    const frame = this.add.rectangle(x, y, width, height, 0x10243a, 0.88);
    frame.setStrokeStyle(4, 0xffde4d, 0.72);
    frame.setInteractive({ useHandCursor: true });
    frame.on('pointerdown', () => {
      this.selected = card.key;
      this.refreshSelection();
    });

    const preview = this.add.image(x, y - 52, card.previewTexture);
    preview.setDisplaySize(width - 44, 216);
    preview.setInteractive({ useHandCursor: true });
    preview.on('pointerdown', () => {
      this.selected = card.key;
      this.refreshSelection();
    });

    this.add.text(x, y + 90, card.name, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '28px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(x, y + 126, card.subtitle, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '18px',
      color: '#d8f4ff'
    }).setOrigin(0.5);

    const description = this.add.text(x, y + 166, card.description, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '16px',
      color: '#f6e9c8',
      align: 'center',
      wordWrap: { width: width - 64 }
    });
    description.setOrigin(0.5);

    const marker = this.add.text(x, y - height / 2 + 28, 'SELECTED', {
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
    const index = STAGE_SELECT_CARDS.findIndex((card) => card.key === this.selected);
    const nextIndex = Phaser.Math.Wrap(index + direction, 0, STAGE_SELECT_CARDS.length);
    this.selected = STAGE_SELECT_CARDS[nextIndex].key;
    this.refreshSelection();
  }

  private refreshSelection(): void {
    for (const visual of this.visuals) {
      const selected = visual.key === this.selected;
      visual.frame.setStrokeStyle(selected ? 7 : 4, selected ? 0xffffff : 0xffde4d, selected ? 1 : 0.58);
      visual.marker.setVisible(selected);
    }
  }

  private startMatch(): void {
    this.scene.start('GameScene', {
      ...this.config,
      stage: this.selected
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    color = 0xff5b69,
    width = 190
  ): void {
    const button = this.add.rectangle(x, y, width, 58, color, 0.92);
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
