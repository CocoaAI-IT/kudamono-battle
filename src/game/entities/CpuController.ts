import Phaser from 'phaser';
import { STAGE_CENTER } from '../data/stage';
import type { FighterIntent } from '../types';
import { Fighter } from './Fighter';

export class CpuController {
  private nextDecisionAt = 0;
  private jumpPulseUntil = 0;
  private normalPulseUntil = 0;
  private specialPulseUntil = 0;
  private dodgePulseUntil = 0;
  private drift: -1 | 0 | 1 = 0;
  private attackMoveX = 0;
  private attackMoveY = 0;

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
        this.specialPulseUntil = now + 90;
        this.attackMoveX = 0;
        this.attackMoveY = -1;
      } else if (absoluteDistanceX < 86 && Math.abs(distanceY) < 82) {
        this.attackMoveX = Math.abs(distanceX) > 34 ? Math.sign(distanceX) : 0;
        this.attackMoveY = distanceY < -36 ? -1 : distanceY > 44 ? 1 : 0;

        if (Phaser.Math.Between(0, 100) > 38) {
          this.normalPulseUntil = now + 120;
        } else {
          this.specialPulseUntil = now + 120;
        }
        if (Phaser.Math.Between(0, 100) > 78) {
          this.dodgePulseUntil = now + 120;
        }
      } else if (absoluteDistanceX < 170 && Math.abs(distanceY) < 105) {
        this.attackMoveX = Math.sign(distanceX);
        this.attackMoveY = Math.abs(distanceY) > 58 ? Math.sign(distanceY) : 0;
        this.normalPulseUntil = now + 95;
      } else if (this.target.sprite.y + 50 < this.cpu.sprite.y && absoluteDistanceX < 260) {
        this.jumpPulseUntil = now + 110;
        this.attackMoveX = 0;
        this.attackMoveY = -1;
        this.normalPulseUntil = now + 90;
      }
    }

    const targetIsRight = this.drift > 0;
    const wantsJump = now < this.jumpPulseUntil || (recovering && this.cpu.sprite.y > STAGE_CENTER.y - 40);
    const attacking = now < this.normalPulseUntil || now < this.specialPulseUntil;

    return {
      moveX: attacking ? this.attackMoveX : targetIsRight ? 1 : -1,
      moveY: attacking ? this.attackMoveY : wantsJump ? -1 : 0,
      jump: wantsJump,
      normalAttack: now < this.normalPulseUntil,
      specialAttack: now < this.specialPulseUntil,
      dodge: now < this.dodgePulseUntil
    };
  }
}
