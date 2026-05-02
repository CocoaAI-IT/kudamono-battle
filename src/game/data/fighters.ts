import Phaser from 'phaser';
import type { AttackKind, AttackSpec, FighterStats } from '../types';

export const PLAYER_STATS: FighterStats = {
  id: 'player',
  name: 'Strawberry Samurai',
  shortName: 'BERRY',
  textures: {
    idle: 'strawberry-idle',
    run: 'strawberry-run',
    jump: 'strawberry-jump',
    quick: 'strawberry-quick',
    heavy: 'strawberry-heavy',
    hurt: 'strawberry-hurt'
  },
  spawn: new Phaser.Math.Vector2(430, 378),
  tint: 0xff5b69,
  accent: 0x29f2f2,
  speed: 410,
  jumpVelocity: 650,
  airControl: 0.58,
  weight: 1
};

export const CPU_STATS: FighterStats = {
  id: 'cpu',
  name: 'Banana Brawler',
  shortName: 'NANA',
  textures: {
    idle: 'banana-idle',
    run: 'banana-run',
    jump: 'banana-jump',
    quick: 'banana-quick',
    heavy: 'banana-heavy',
    hurt: 'banana-hurt'
  },
  spawn: new Phaser.Math.Vector2(850, 378),
  tint: 0xffde4d,
  accent: 0xa8ff3e,
  speed: 380,
  jumpVelocity: 620,
  airControl: 0.52,
  weight: 1.08
};

export const ATTACKS: Record<AttackKind, AttackSpec> = {
  quick: {
    kind: 'quick',
    damage: 7,
    reach: 92,
    height: 58,
    windupMs: 70,
    activeMs: 105,
    recoveryMs: 180,
    baseKnockback: 330,
    knockbackGrowth: 6.8,
    upwardForce: 230,
    selfFreezeMs: 45
  },
  heavy: {
    kind: 'heavy',
    damage: 14,
    reach: 124,
    height: 72,
    windupMs: 150,
    activeMs: 135,
    recoveryMs: 360,
    baseKnockback: 470,
    knockbackGrowth: 9.6,
    upwardForce: 310,
    selfFreezeMs: 80
  }
};
