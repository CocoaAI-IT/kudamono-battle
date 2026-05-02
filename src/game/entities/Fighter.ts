import Phaser from 'phaser';
import { ATTACKS } from '../data/fighters';
import { DEATH_BOUNDS, STAGE_CENTER } from '../data/stage';
import type {
  AttackKind,
  AttackRuntime,
  Facing,
  FighterId,
  FighterIntent,
  FighterStats
} from '../types';

const EMPTY_INTENT: FighterIntent = {
  left: false,
  right: false,
  jump: false,
  quickAttack: false,
  heavyAttack: false,
  dodge: false
};

export class Fighter {
  readonly id: FighterId;
  readonly stats: FighterStats;
  readonly sprite: Phaser.Physics.Arcade.Sprite;

  stocks = 3;
  damage = 0;
  facing: Facing = 1;
  canDoubleJump = true;
  stunUntil = 0;
  invincibleUntil = 0;
  attackLockedUntil = 0;
  dodgeCooldownUntil = 0;
  respawning = false;

  private readonly scene: Phaser.Scene;
  private jumpWasHeld = false;
  private attackEffect?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, stats: FighterStats) {
    this.scene = scene;
    this.id = stats.id;
    this.stats = stats;
    this.sprite = scene.physics.add.sprite(stats.spawn.x, stats.spawn.y, stats.texture);
    this.sprite.setDisplaySize(86, 112);
    this.sprite.setDragX(1800);
    this.sprite.setMaxVelocity(760, 980);
    this.sprite.setDepth(8);
    this.sprite.setData('fighterId', stats.id);
    this.sprite.setCollideWorldBounds(false);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(76, 122);
    body.setOffset(58, 64);
  }

  get isGrounded(): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return body.blocked.down || body.touching.down;
  }

  get isInvincible(): boolean {
    return this.scene.time.now < this.invincibleUntil;
  }

  get alive(): boolean {
    return this.stocks > 0;
  }

  resetForMatch(): void {
    this.stocks = 3;
    this.damage = 0;
    this.facing = this.id === 'player' ? 1 : -1;
    this.canDoubleJump = true;
    this.stunUntil = 0;
    this.invincibleUntil = this.scene.time.now + 1200;
    this.attackLockedUntil = 0;
    this.dodgeCooldownUntil = 0;
    this.respawning = false;
    this.sprite.enableBody(true, this.stats.spawn.x, this.stats.spawn.y, true, true);
    this.sprite.setVelocity(0, 0);
    this.sprite.setAlpha(1);
    this.sprite.setFlipX(this.facing === -1);
  }

  update(intent: FighterIntent = EMPTY_INTENT): AttackKind | undefined {
    if (!this.alive || !this.sprite.active) {
      return undefined;
    }

    const now = this.scene.time.now;
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const grounded = this.isGrounded;
    const locked = now < this.stunUntil || now < this.attackLockedUntil;

    if (grounded) {
      this.canDoubleJump = true;
    }

    if (!locked) {
      this.applyHorizontalMovement(intent, grounded);
      this.applyJump(intent, grounded);
      this.applyDodge(intent);
    }

    this.jumpWasHeld = intent.jump;

    if (intent.quickAttack && now >= this.attackLockedUntil && now >= this.stunUntil) {
      return 'quick';
    }

    if (intent.heavyAttack && now >= this.attackLockedUntil && now >= this.stunUntil) {
      return 'heavy';
    }

    if (this.isInvincible) {
      this.sprite.setAlpha(0.55 + Math.sin(now / 45) * 0.25);
    } else {
      this.sprite.setAlpha(1);
    }

    if (this.sprite.y > DEATH_BOUNDS.bottom || this.sprite.x < DEATH_BOUNDS.left || this.sprite.x > DEATH_BOUNDS.right || this.sprite.y < DEATH_BOUNDS.top) {
      this.loseStock();
    }

    if (Math.abs(body.velocity.x) > 20 && !locked) {
      this.facing = body.velocity.x > 0 ? 1 : -1;
      this.sprite.setFlipX(this.facing === -1);
    }

    return undefined;
  }

  startAttack(kind: AttackKind): AttackRuntime {
    const now = this.scene.time.now;
    const spec = ATTACKS[kind];
    this.attackLockedUntil = now + spec.windupMs + spec.activeMs + spec.recoveryMs;
    this.stunUntil = Math.max(this.stunUntil, now + spec.selfFreezeMs);

    const x = this.sprite.x + this.facing * (48 + spec.reach / 2);
    const y = this.sprite.y - 8;
    const color = kind === 'quick' ? this.stats.tint : this.stats.accent;
    const rect = this.scene.add.rectangle(x, y, spec.reach, spec.height, color, 0.18);
    rect.setStrokeStyle(2, color, 0.75);
    rect.setDepth(12);
    rect.setVisible(false);

    this.showAttackArc(kind, color);

    return {
      ownerId: this.id,
      kind,
      startsAt: now,
      activeAt: now + spec.windupMs,
      expiresAt: now + spec.windupMs + spec.activeMs,
      rect,
      hit: false,
      spec
    };
  }

  receiveHit(source: Fighter, attack: AttackRuntime): void {
    if (this.isInvincible || !this.alive) {
      return;
    }

    const now = this.scene.time.now;
    const launchDirection: Facing = source.sprite.x <= this.sprite.x ? 1 : -1;
    const knockback = (attack.spec.baseKnockback + this.damage * attack.spec.knockbackGrowth) / this.stats.weight;
    this.damage = Math.min(999, this.damage + attack.spec.damage);
    this.stunUntil = now + 180 + this.damage * 2.1;
    this.invincibleUntil = now + 260;
    this.sprite.setVelocity(launchDirection * knockback, -attack.spec.upwardForce - this.damage * 1.45);
    this.flash(attack.kind === 'heavy' ? 0xffffff : source.stats.accent);
  }

  wantsRecovery(): boolean {
    return this.sprite.y > STAGE_CENTER.y + 60 || this.sprite.x < 300 || this.sprite.x > 980;
  }

  loseStock(): void {
    if (this.respawning) {
      return;
    }

    this.stocks -= 1;
    this.damage = 0;
    this.respawning = true;
    this.sprite.disableBody(true, true);

    if (this.stocks <= 0) {
      return;
    }

    this.scene.time.delayedCall(760, () => {
      this.respawning = false;
      this.sprite.enableBody(true, this.stats.spawn.x, this.stats.spawn.y - 90, true, true);
      this.sprite.setVelocity(0, 0);
      this.invincibleUntil = this.scene.time.now + 1800;
      this.canDoubleJump = true;
    });
  }

  private applyHorizontalMovement(intent: FighterIntent, grounded: boolean): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const axis = Number(intent.right) - Number(intent.left);
    const control = grounded ? 1 : this.stats.airControl;

    if (axis !== 0) {
      body.setVelocityX(axis * this.stats.speed * control);
      this.facing = axis > 0 ? 1 : -1;
      this.sprite.setFlipX(this.facing === -1);
      return;
    }

    if (grounded && Math.abs(body.velocity.x) < 16) {
      body.setVelocityX(0);
    }
  }

  private applyJump(intent: FighterIntent, grounded: boolean): void {
    const justPressedJump = intent.jump && !this.jumpWasHeld;

    if (!justPressedJump) {
      return;
    }

    if (grounded) {
      this.sprite.setVelocityY(-this.stats.jumpVelocity);
      this.canDoubleJump = true;
      return;
    }

    if (this.canDoubleJump) {
      this.sprite.setVelocityY(-this.stats.jumpVelocity * 0.86);
      this.canDoubleJump = false;
      this.emitJumpBurst();
    }
  }

  private applyDodge(intent: FighterIntent): void {
    const now = this.scene.time.now;

    if (!intent.dodge || now < this.dodgeCooldownUntil) {
      return;
    }

    this.dodgeCooldownUntil = now + 820;
    this.invincibleUntil = now + 260;
    this.stunUntil = now + 120;
    this.sprite.setVelocityX(this.facing * 560);
    this.emitDodgeAfterimage();
  }

  private showAttackArc(kind: AttackKind, color: number): void {
    this.attackEffect?.destroy();
    const radius = kind === 'quick' ? 62 : 84;
    this.attackEffect = this.scene.add.arc(
      this.sprite.x + this.facing * 42,
      this.sprite.y - 6,
      radius,
      this.facing === 1 ? -45 : 135,
      this.facing === 1 ? 58 : 238,
      false,
      color,
      kind === 'quick' ? 0.26 : 0.36
    );
    this.attackEffect.setStrokeStyle(kind === 'quick' ? 8 : 12, color, 0.82);
    this.attackEffect.setDepth(11);
    this.scene.tweens.add({
      targets: this.attackEffect,
      alpha: 0,
      scale: 1.18,
      duration: kind === 'quick' ? 140 : 210,
      onComplete: () => this.attackEffect?.destroy()
    });
  }

  private emitJumpBurst(): void {
    const burst = this.scene.add.circle(this.sprite.x, this.sprite.y + 44, 22, this.stats.tint, 0.28);
    burst.setDepth(4);
    this.scene.tweens.add({
      targets: burst,
      alpha: 0,
      scale: 2.2,
      duration: 220,
      onComplete: () => burst.destroy()
    });
  }

  private emitDodgeAfterimage(): void {
    const afterimage = this.scene.add.image(this.sprite.x, this.sprite.y, this.stats.texture);
    afterimage.setDisplaySize(86, 112);
    afterimage.setFlipX(this.sprite.flipX);
    afterimage.setTint(this.stats.tint);
    afterimage.setAlpha(0.38);
    afterimage.setDepth(6);
    this.scene.tweens.add({
      targets: afterimage,
      alpha: 0,
      x: afterimage.x - this.facing * 34,
      duration: 220,
      onComplete: () => afterimage.destroy()
    });
  }

  private flash(color: number): void {
    this.sprite.setTintFill(color);
    this.scene.time.delayedCall(80, () => {
      this.sprite.clearTint();
    });
  }
}
