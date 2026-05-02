import Phaser from 'phaser';
import { DEATH_BOUNDS, STAGE_CENTER } from '../data/stage';
import type {
  AttackKind,
  AttackRuntime,
  Facing,
  FighterId,
  FighterIntent,
  FighterMotion,
  FighterStats,
  MoveDirection
} from '../types';

const EMPTY_INTENT: FighterIntent = {
  moveX: 0,
  moveY: 0,
  jump: false,
  normalAttack: false,
  specialAttack: false,
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
  private motion: FighterMotion = 'idle';
  private attackMotion: FighterMotion = 'quick';
  private hurtUntil = 0;

  constructor(scene: Phaser.Scene, stats: FighterStats) {
    this.scene = scene;
    this.id = stats.id;
    this.stats = stats;
    this.sprite = scene.physics.add.sprite(stats.spawn.x, stats.spawn.y, stats.textures.idle);
    this.sprite.setDisplaySize(126, 157);
    this.sprite.setDragX(1800);
    this.sprite.setMaxVelocity(760, 980);
    this.sprite.setDepth(8);
    this.sprite.setData('fighterId', stats.id);
    this.sprite.setCollideWorldBounds(false);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(144, 250);
    body.setOffset(56, 50);
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
    this.hurtUntil = 0;
    this.attackMotion = 'quick';
    this.sprite.enableBody(true, this.stats.spawn.x, this.stats.spawn.y, true, true);
    this.sprite.setVelocity(0, 0);
    this.sprite.setAlpha(1);
    this.sprite.setFlipX(this.facing === -1);
    this.setMotion('idle');
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

    if (intent.normalAttack && now >= this.attackLockedUntil && now >= this.stunUntil) {
      return `normal-${this.resolveMoveDirection(intent)}`;
    }

    if (intent.specialAttack && now >= this.attackLockedUntil && now >= this.stunUntil) {
      return `special-${this.resolveMoveDirection(intent)}`;
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

    this.updateMotion(grounded, body.velocity.x, now);

    return undefined;
  }

  startAttack(kind: AttackKind): AttackRuntime {
    const now = this.scene.time.now;
    const spec = this.stats.moves[kind];
    const attackType = spec.attackType ?? 'melee';
    const activeDuration = attackType === 'projectile'
      ? spec.projectileLifetimeMs ?? spec.activeMs
      : attackType === 'trap'
        ? spec.trapLifetimeMs ?? spec.activeMs
        : spec.activeMs;
    this.attackLockedUntil = now + spec.windupMs + spec.activeMs + spec.recoveryMs;
    this.stunUntil = Math.max(this.stunUntil, now + spec.selfFreezeMs);
    this.attackMotion = spec.motion;
    this.setMotion(spec.motion);

    if (spec.armorMs) {
      this.invincibleUntil = Math.max(this.invincibleUntil, now + spec.armorMs);
    }

    if (spec.selfVelocityX) {
      this.sprite.setVelocityX(this.facing * spec.selfVelocityX);
    }

    if (spec.selfVelocityY) {
      this.sprite.setVelocityY(spec.selfVelocityY);
      this.canDoubleJump = false;
    }

    const x = this.sprite.x + this.facing * spec.offsetX;
    const y = this.sprite.y + spec.offsetY;
    const color = this.getAttackColor(attackType, spec.button === 'normal' ? this.stats.tint : this.stats.accent);
    const rect = this.scene.add.rectangle(x, y, spec.reach, spec.height, color, 0);
    rect.setDepth(12);
    rect.setVisible(false);
    const visual = this.createAttackVisual(spec, attackType, x, y);

    return {
      ownerId: this.id,
      kind,
      startsAt: now,
      activeAt: now + spec.windupMs,
      expiresAt: now + spec.windupMs + activeDuration,
      rect,
      visual,
      hit: false,
      spec,
      fixedPosition: attackType === 'projectile' || attackType === 'trap',
      velocityX: attackType === 'projectile' ? this.facing * (spec.projectileSpeed ?? 0) : 0,
      velocityY: 0,
      hitsDone: 0,
      nextHitAt: now + spec.windupMs
    };
  }

  receiveHit(source: Fighter, attack: AttackRuntime): void {
    if (this.isInvincible || !this.alive) {
      return;
    }

    const now = this.scene.time.now;
    const multiHit = attack.spec.attackType === 'multiHit';
    const launchDirection: Facing = source.sprite.x <= this.sprite.x ? 1 : -1;
    const knockback = (attack.spec.baseKnockback + this.damage * attack.spec.knockbackGrowth) / this.stats.weight;
    const launchY = (attack.spec.launchY + this.damage * attack.spec.launchYGrowth) / this.stats.weight;
    this.damage = Math.min(999, this.damage + attack.spec.damage);
    this.stunUntil = now + (multiHit ? 80 + this.damage * 0.75 : 180 + this.damage * 2.1);
    this.invincibleUntil = now + (multiHit ? 38 : 260);
    this.hurtUntil = now + (multiHit ? 220 : 360);
    this.sprite.setVelocity(launchDirection * knockback, launchY);
    this.setMotion('hurt');
    this.flash(attack.spec.button === 'special' ? 0xffffff : source.stats.accent);
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
    const axis = Phaser.Math.Clamp(intent.moveX, -1, 1);
    const control = grounded ? 1 : this.stats.airControl;

    if (Math.abs(axis) > 0.12) {
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

  private getAttackColor(attackType: string, fallback: number): number {
    if (attackType === 'projectile') {
      return this.stats.accent;
    }

    if (attackType === 'trap') {
      return 0xffc857;
    }

    if (attackType === 'armor') {
      return 0xffffff;
    }

    return fallback;
  }

  private createAttackVisual(
    spec: FighterStats['moves'][AttackKind],
    attackType: string,
    x: number,
    y: number
  ): Phaser.GameObjects.Image {
    const role = this.resolveEffectRole(spec, attackType);
    const visual = this.scene.add.image(x, y, `effect-${this.stats.characterKey}-${role}`);
    visual.setDisplaySize(this.getEffectWidth(spec, role), this.getEffectHeight(spec, role));
    visual.setDepth(13);
    visual.setVisible(false);
    visual.setAlpha(0.92);
    visual.setFlipX(this.facing === -1);

    if (spec.direction === 'up') {
      visual.setAngle(this.facing === -1 ? -18 : 18);
    } else if (spec.direction === 'down') {
      visual.setAngle(this.facing === -1 ? 16 : -16);
    }

    return visual;
  }

  private resolveEffectRole(spec: FighterStats['moves'][AttackKind], attackType: string): string {
    if (attackType === 'projectile') {
      return 'projectile';
    }

    if (attackType === 'trap') {
      return 'trap';
    }

    if (attackType === 'armor') {
      return 'armor';
    }

    if (attackType === 'multiHit') {
      return 'combo';
    }

    return spec.motion === 'heavy' ? 'heavy' : 'quick';
  }

  private getEffectWidth(spec: FighterStats['moves'][AttackKind], role: string): number {
    if (role === 'projectile') {
      return Math.max(spec.reach * 1.55, 82);
    }

    if (role === 'trap') {
      return Math.max(spec.reach * 1.18, 116);
    }

    if (role === 'armor') {
      return Math.max(spec.reach * 1.25, 132);
    }

    return Math.max(spec.reach * 1.35, 116);
  }

  private getEffectHeight(spec: FighterStats['moves'][AttackKind], role: string): number {
    if (role === 'projectile') {
      return Math.max(spec.height * 1.65, 58);
    }

    if (role === 'trap') {
      return Math.max(spec.height * 1.7, 58);
    }

    if (role === 'armor') {
      return Math.max(spec.height * 1.32, 92);
    }

    return Math.max(spec.height * 1.35, 72);
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
    const afterimage = this.scene.add.image(this.sprite.x, this.sprite.y, this.sprite.texture.key);
    afterimage.setDisplaySize(126, 157);
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

  private updateMotion(grounded: boolean, velocityX: number, now: number): void {
    if (now < this.hurtUntil) {
      this.setMotion('hurt');
      return;
    }

    if (now < this.attackLockedUntil) {
      this.setMotion(this.attackMotion);
      return;
    }

    if (!grounded) {
      this.setMotion('jump');
      return;
    }

    if (Math.abs(velocityX) > 34) {
      this.setMotion('run');
      return;
    }

    this.setMotion('idle');
  }

  private setMotion(motion: FighterMotion): void {
    if (this.motion === motion) {
      return;
    }

    this.motion = motion;
    this.sprite.setTexture(this.stats.textures[motion]);
    this.sprite.setDisplaySize(126, 157);
  }

  private resolveMoveDirection(intent: FighterIntent): MoveDirection {
    const x = Phaser.Math.Clamp(intent.moveX, -1, 1);
    const y = Phaser.Math.Clamp(intent.moveY, -1, 1);
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absY > 0.55 && absY >= absX * 0.85) {
      return y < 0 ? 'up' : 'down';
    }

    if (absX > 0.35) {
      this.facing = x > 0 ? 1 : -1;
      this.sprite.setFlipX(this.facing === -1);
      return 'side';
    }

    return 'neutral';
  }
}
