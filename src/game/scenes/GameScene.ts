import Phaser from 'phaser';
import { CPU_STATS, PLAYER_STATS } from '../data/fighters';
import { DEATH_BOUNDS, GAME_HEIGHT, GAME_WIDTH, PLATFORMS } from '../data/stage';
import { CpuController } from '../entities/CpuController';
import { Fighter } from '../entities/Fighter';
import type { AttackRuntime, FighterIntent, ResultPayload } from '../types';

type KeyboardMap = Record<'left' | 'right' | 'jump' | 'quick' | 'heavy' | 'dodge' | 'restart', Phaser.Input.Keyboard.Key>;

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
  private ended = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.ended = false;
    this.attacks = [];
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background').setDepth(0);
    this.createStage();
    this.createFighters();
    this.createInput();
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

    for (const platformDef of PLATFORMS) {
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
    this.player = new Fighter(this, PLAYER_STATS);
    this.cpu = new Fighter(this, CPU_STATS);
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
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      quick: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      heavy: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
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

    this.bannerText = this.add.text(GAME_WIDTH / 2, 34, 'A/D move  W jump  J quick  K heavy  L dodge  R restart', {
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
    return {
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      jump: this.keys.jump.isDown,
      quickAttack: Phaser.Input.Keyboard.JustDown(this.keys.quick),
      heavyAttack: Phaser.Input.Keyboard.JustDown(this.keys.heavy),
      dodge: Phaser.Input.Keyboard.JustDown(this.keys.dodge)
    };
  }

  private updateAttacks(): void {
    const now = this.time.now;
    const retainedAttacks: AttackRuntime[] = [];

    for (const attack of this.attacks) {
      const owner = attack.ownerId === 'player' ? this.player : this.cpu;
      const target = attack.ownerId === 'player' ? this.cpu : this.player;
      const direction = owner.facing;
      const active = now >= attack.activeAt && now <= attack.expiresAt;

      attack.rect.setPosition(owner.sprite.x + direction * (48 + attack.spec.reach / 2), owner.sprite.y - 8);
      attack.rect.setVisible(active);

      if (active && !attack.hit && this.attackOverlapsFighter(attack, target)) {
        target.receiveHit(owner, attack);
        attack.hit = true;
        this.cameras.main.shake(attack.kind === 'heavy' ? 130 : 80, attack.kind === 'heavy' ? 0.007 : 0.004);
      }

      if (now <= attack.expiresAt) {
        retainedAttacks.push(attack);
      } else {
        attack.rect.destroy();
      }
    }

    this.attacks = retainedAttacks;
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
      cpuDamage: this.cpu.damage
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
