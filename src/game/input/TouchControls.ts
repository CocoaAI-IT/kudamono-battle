import Phaser from 'phaser';

export type TouchControlState = {
  moveX: number;
  moveY: number;
  jump: boolean;
  normalAttack: boolean;
  specialAttack: boolean;
};

export class TouchControls {
  readonly enabled: boolean;

  private readonly scene: Phaser.Scene;
  private readonly base?: Phaser.GameObjects.Arc;
  private readonly knob?: Phaser.GameObjects.Arc;
  private readonly maxDistance = 58;
  private activePointerId?: number;
  private moveX = 0;
  private moveY = 0;
  private normalQueued = false;
  private specialQueued = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.enabled = this.shouldShowTouchControls();

    if (!this.enabled) {
      return;
    }

    const stickX = 152;
    const stickY = 580;
    this.base = scene.add.circle(stickX, stickY, 72, 0x10243a, 0.46);
    this.base.setStrokeStyle(4, 0xf8fff8, 0.6);
    this.base.setDepth(40);
    this.base.setScrollFactor(0);

    this.knob = scene.add.circle(stickX, stickY, 31, 0xffffff, 0.72);
    this.knob.setStrokeStyle(4, 0x29f2f2, 0.9);
    this.knob.setDepth(41);
    this.knob.setScrollFactor(0);

    const stickZone = scene.add.zone(stickX, stickY, 216, 216);
    stickZone.setDepth(42);
    stickZone.setScrollFactor(0);
    stickZone.setInteractive();
    stickZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.activePointerId = pointer.id;
      this.updateStick(pointer);
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.activePointerId) {
        this.updateStick(pointer);
      }
    });

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.activePointerId) {
        this.resetStick();
      }
    });

    scene.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.activePointerId) {
        this.resetStick();
      }
    });

    this.createButton(1082, 596, 'A', 0xff5b69, () => {
      this.normalQueued = true;
    });
    this.createButton(1192, 532, 'B', 0x29f2f2, () => {
      this.specialQueued = true;
    });
  }

  consumeState(): TouchControlState {
    const state = {
      moveX: this.moveX,
      moveY: this.moveY,
      jump: this.moveY < -0.56,
      normalAttack: this.normalQueued,
      specialAttack: this.specialQueued
    };

    this.normalQueued = false;
    this.specialQueued = false;

    return state;
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    onPress: () => void
  ): void {
    const outer = this.scene.add.circle(x, y, 50, 0x10243a, 0.5);
    outer.setStrokeStyle(4, color, 0.9);
    outer.setDepth(40);
    outer.setScrollFactor(0);
    outer.setInteractive();
    outer.on('pointerdown', () => {
      outer.setScale(0.92);
      onPress();
    });
    outer.on('pointerup', () => outer.setScale(1));
    outer.on('pointerout', () => outer.setScale(1));

    const text = this.scene.add.text(x, y, label, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '28px',
      fontStyle: '900',
      color: '#ffffff'
    });
    text.setOrigin(0.5);
    text.setDepth(41);
    text.setScrollFactor(0);
  }

  private updateStick(pointer: Phaser.Input.Pointer): void {
    if (!this.base || !this.knob) {
      return;
    }

    const dx = pointer.x - this.base.x;
    const dy = pointer.y - this.base.y;
    const distance = Math.min(Math.hypot(dx, dy), this.maxDistance);
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    this.knob.setPosition(this.base.x + x, this.base.y + y);
    this.moveX = Phaser.Math.Clamp(x / this.maxDistance, -1, 1);
    this.moveY = Phaser.Math.Clamp(y / this.maxDistance, -1, 1);
  }

  private resetStick(): void {
    this.activePointerId = undefined;
    this.moveX = 0;
    this.moveY = 0;
    this.knob?.setPosition(this.base?.x ?? 152, this.base?.y ?? 580);
  }

  private shouldShowTouchControls(): boolean {
    const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const hasTouch = navigator.maxTouchPoints > 0 || this.scene.game.device.input.touch;

    return hasTouch && hasCoarsePointer && !this.scene.game.device.os.desktop;
  }
}
