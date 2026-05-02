import Phaser from 'phaser';
import { createFighterStats } from '../data/fighters';
import { DEFAULT_MATCH_CONFIG } from '../data/match';
import { DEATH_BOUNDS, GAME_HEIGHT, GAME_WIDTH, STAGES } from '../data/stage';
import { CpuController } from '../entities/CpuController';
import { Fighter } from '../entities/Fighter';
import { TouchControls } from '../input/TouchControls';
import type { AttackRuntime, FighterIntent, MatchConfig, ResultPayload } from '../types';

type KeyboardMap = Record<'left' | 'right' | 'up' | 'down' | 'normal' | 'special' | 'dodge' | 'restart', Phaser.Input.Keyboard.Key>;

export class GameScene extends Phaser.Scene {
  private player!: Fighter;
  private cpu!: Fighter;
  private cpuController!: CpuController;
  private keys!: KeyboardMap;
  private attacks: AttackRuntime[] = [];
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private damageText!: Phaser.GameObjects.Text;
  private stockText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private touchControls!: TouchControls;
  private matchConfig: MatchConfig = DEFAULT_MATCH_CONFIG;
  private ended = false;

  constructor() {
    super('GameScene');
  }

  create(config: MatchConfig = DEFAULT_MATCH_CONFIG): void {
    this.matchConfig = config;
    const stage = STAGES[this.matchConfig.stage];
    this.ended = false;
    this.attacks = [];
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, stage.backgroundTexture).setDepth(0);
    this.createStage();
    this.createFighters();
    this.createInput();
    this.touchControls = new TouchControls(this);
    this.createHud();
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
      this.scene.restart();
      return;
    }

    if (this.ended) {
      return;
    }

    const playerAttack = this.player.update(this.readPlayerIntent());
    const cpuAttack = this.cpu.update(this.cpuController.update());

    if (playerAttack) {
      this.attacks.push(this.player.startAttack(playerAttack));
    }

    if (cpuAttack) {
      this.attacks.push(this.cpu.startAttack(cpuAttack));
    }

    this.updateAttacks();
    this.updateHud();
    this.checkWinner();
  }

  private createStage(): void {
    this.platforms = this.physics.add.staticGroup();
    const stage = STAGES[this.matchConfig.stage];

    for (const platformDef of stage.platforms) {
      const collider = this.add.zone(platformDef.x, platformDef.y, platformDef.width, platformDef.height);
      this.physics.add.existing(collider, true);
      const body = collider.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(platformDef.width, platformDef.height);
      body.updateFromGameObject();
      this.platforms.add(collider);
    }

    const dangerLine = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + 8, GAME_WIDTH, 4, 0xff3f6d, 0.78);
    dangerLine.setDepth(5);
  }

  private createFighters(): void {
    const stage = STAGES[this.matchConfig.stage];
    this.player = new Fighter(this, createFighterStats(this.matchConfig.playerCharacter, 'player', stage.playerSpawn));
    this.cpu = new Fighter(this, createFighterStats(this.matchConfig.cpuCharacter, 'cpu', stage.cpuSpawn));
    this.player.resetForMatch();
    this.cpu.resetForMatch();
    this.cpuController = new CpuController(this, this.cpu, this.player);

    this.physics.add.collider(this.player.sprite, this.platforms);
    this.physics.add.collider(this.cpu.sprite, this.platforms);
    this.physics.add.collider(this.player.sprite, this.cpu.sprite, () => {
      const dx = this.player.sprite.x - this.cpu.sprite.x;
      this.player.sprite.setVelocityX(dx > 0 ? 90 : -90);
      this.cpu.sprite.setVelocityX(dx > 0 ? -90 : 90);
    });
  }

  private createInput(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error('Keyboard input is required for this game.');
    }

    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      normal: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      special: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      dodge: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      restart: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    };
  }

  private createHud(): void {
    this.stockText = this.add.text(34, 28, '', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '26px',
      fontStyle: '700',
      color: '#f2fbff'
    });
    this.stockText.setDepth(20);

    this.damageText = this.add.text(34, 68, '', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '22px',
      color: '#bfeaff'
    });
    this.damageText.setDepth(20);

    const controlsText = this.touchControls.enabled
      ? 'A attack  B special'
      : 'A/D move  W jump/up  S down  J attack  K special  L dodge  R restart';
    this.bannerText = this.add.text(GAME_WIDTH / 2, 34, controlsText, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '18px',
      color: '#d7faff'
    });
    this.bannerText.setOrigin(0.5, 0);
    this.bannerText.setDepth(20);
    this.bannerText.setAlpha(0.86);

    this.updateHud();
  }

  private readPlayerIntent(): FighterIntent {
    const touch = this.touchControls.consumeState();
    const keyboardX = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    const keyboardY = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);

    return {
      moveX: Phaser.Math.Clamp(touch.moveX || keyboardX, -1, 1),
      moveY: Phaser.Math.Clamp(touch.moveY || keyboardY, -1, 1),
      jump: this.keys.up.isDown || touch.jump,
      normalAttack: Phaser.Input.Keyboard.JustDown(this.keys.normal) || touch.normalAttack,
      specialAttack: Phaser.Input.Keyboard.JustDown(this.keys.special) || touch.specialAttack,
      dodge: Phaser.Input.Keyboard.JustDown(this.keys.dodge)
    };
  }

  private updateAttacks(): void {
    const now = this.time.now;
    const deltaSeconds = this.game.loop.delta / 1000;
    const retainedAttacks: AttackRuntime[] = [];

    for (const attack of this.attacks) {
      const owner = attack.ownerId === 'player' ? this.player : this.cpu;
      const target = attack.ownerId === 'player' ? this.cpu : this.player;
      const direction = owner.facing;
      const active = now >= attack.activeAt && now <= attack.expiresAt;
      const attackType = attack.spec.attackType ?? 'melee';

      if (!attack.fixedPosition) {
        attack.rect.setPosition(owner.sprite.x + direction * attack.spec.offsetX, owner.sprite.y + attack.spec.offsetY);
      } else if (active) {
        attack.rect.x += (attack.velocityX ?? 0) * deltaSeconds;
        attack.rect.y += (attack.velocityY ?? 0) * deltaSeconds;
      }

      attack.rect.setVisible(active);

      if (active && this.canAttackHit(attack, now) && this.attackOverlapsFighter(attack, target)) {
        target.receiveHit(owner, attack);
        this.registerAttackHit(attack, now);
        this.cameras.main.shake(attack.spec.button === 'special' ? 130 : 80, attack.spec.button === 'special' ? 0.007 : 0.004);
      }

      if (now <= attack.expiresAt && !(attackType === 'projectile' && attack.hit)) {
        retainedAttacks.push(attack);
      } else {
        attack.rect.destroy();
      }
    }

    this.attacks = retainedAttacks;
  }

  private canAttackHit(attack: AttackRuntime, now: number): boolean {
    if (attack.spec.attackType !== 'multiHit') {
      return !attack.hit;
    }

    return attack.hitsDone < (attack.spec.hitCount ?? 1) && now >= attack.nextHitAt;
  }

  private registerAttackHit(attack: AttackRuntime, now: number): void {
    if (attack.spec.attackType !== 'multiHit') {
      attack.hit = true;
      return;
    }

    attack.hitsDone += 1;
    attack.nextHitAt = now + (attack.spec.hitIntervalMs ?? 64);
    attack.hit = attack.hitsDone >= (attack.spec.hitCount ?? 1);
  }

  private attackOverlapsFighter(attack: AttackRuntime, fighter: Fighter): boolean {
    const attackBounds = attack.rect.getBounds();
    const fighterBody = fighter.sprite.body as Phaser.Physics.Arcade.Body;
    const fighterBounds = new Phaser.Geom.Rectangle(
      fighterBody.x,
      fighterBody.y,
      fighterBody.width,
      fighterBody.height
    );

    return Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, fighterBounds);
  }

  private updateHud(): void {
    this.stockText.setText(`${this.player.stats.shortName} ${'x'.repeat(Math.max(0, this.player.stocks))}    ${this.cpu.stats.shortName} ${'x'.repeat(Math.max(0, this.cpu.stocks))}`);
    this.damageText.setText(
      `1P ${Math.round(this.player.damage)}%    CPU ${Math.round(this.cpu.damage)}%`
    );

    const playerDanger = this.isNearDeathBounds(this.player);
    const cpuDanger = this.isNearDeathBounds(this.cpu);
    this.bannerText.setColor(playerDanger || cpuDanger ? '#ffb3c4' : '#d7faff');
  }

  private checkWinner(): void {
    if (this.player.stocks > 0 && this.cpu.stocks > 0) {
      return;
    }

    this.ended = true;
    const payload: ResultPayload = {
      winner: this.player.stocks === this.cpu.stocks ? 'draw' : this.player.stocks > this.cpu.stocks ? 'player' : 'cpu',
      playerDamage: this.player.damage,
      cpuDamage: this.cpu.damage,
      config: this.matchConfig
    };

    this.time.delayedCall(540, () => {
      this.scene.start('ResultScene', payload);
    });
  }

  private isNearDeathBounds(fighter: Fighter): boolean {
    return (
      fighter.sprite.x < DEATH_BOUNDS.left + 130 ||
      fighter.sprite.x > DEATH_BOUNDS.right - 130 ||
      fighter.sprite.y > DEATH_BOUNDS.bottom - 160 ||
      fighter.sprite.y < DEATH_BOUNDS.top + 130
    );
  }
}
