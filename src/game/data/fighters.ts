import Phaser from 'phaser';
import type { AttackKind, AttackSpec, FighterStats } from '../types';

export const PLAYER_STATS: FighterStats = {
  id: 'player',
  name: 'Astra Ronin',
  texture: 'player',
  spawn: new Phaser.Math.Vector2(430, 378),
  tint: 0x7cf4ff,
  accent: 0xffdf6e,
  speed: 410,
  jumpVelocity: 650,
  airControl: 0.58,
  weight: 1
};

export const CPU_STATS: FighterStats = {
  id: 'cpu',
  name: 'Volt Kensei',
  texture: 'cpu',
  spawn: new Phaser.Math.Vector2(850, 378),
  tint: 0xff7197,
  accent: 0x8dffb6,
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
