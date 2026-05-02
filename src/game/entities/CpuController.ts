import Phaser from 'phaser';
import { STAGE_CENTER } from '../data/stage';
import type { FighterIntent } from '../types';
import { Fighter } from './Fighter';

export class CpuController {
  private nextDecisionAt = 0;
  private jumpPulseUntil = 0;
  private quickPulseUntil = 0;
  private heavyPulseUntil = 0;
  private dodgePulseUntil = 0;
  private drift: -1 | 0 | 1 = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly cpu: Fighter,
    private readonly target: Fighter
  ) {}

  update(): FighterIntent {
    const now = this.scene.time.now;
    const distanceX = this.target.sprite.x - this.cpu.sprite.x;
    const distanceY = this.target.sprite.y - this.cpu.sprite.y;
    const absoluteDistanceX = Math.abs(distanceX);
    const recovering = this.cpu.wantsRecovery();

    if (now >= this.nextDecisionAt) {
      this.nextDecisionAt = now + Phaser.Math.Between(90, 180);
      this.drift = distanceX > 0 ? 1 : -1;

      if (recovering) {
        this.drift = this.cpu.sprite.x < STAGE_CENTER.x ? 1 : -1;
        this.jumpPulseUntil = now + 130;
      } else if (absoluteDistanceX < 86 && Math.abs(distanceY) < 82) {
        if (Phaser.Math.Between(0, 100) > 34) {
          this.quickPulseUntil = now + 120;
        } else {
          this.heavyPulseUntil = now + 120;
        }
        if (Phaser.Math.Between(0, 100) > 78) {
          this.dodgePulseUntil = now + 120;
        }
      } else if (absoluteDistanceX < 170 && Math.abs(distanceY) < 105) {
        this.quickPulseUntil = now + 95;
      } else if (this.target.sprite.y + 50 < this.cpu.sprite.y && absoluteDistanceX < 260) {
        this.jumpPulseUntil = now + 110;
      }
    }

    const targetIsRight = this.drift > 0;
    const wantsJump = now < this.jumpPulseUntil || (recovering && this.cpu.sprite.y > STAGE_CENTER.y - 40);

    return {
      left: !targetIsRight,
      right: targetIsRight,
      jump: wantsJump,
      quickAttack: now < this.quickPulseUntil,
      heavyAttack: now < this.heavyPulseUntil,
      dodge: now < this.dodgePulseUntil
    };
  }
}
