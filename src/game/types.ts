export type FighterId = 'player' | 'cpu';

export type Facing = -1 | 1;

export type AttackKind = 'quick' | 'heavy';

export type FighterIntent = {
  left: boolean;
  right: boolean;
  jump: boolean;
  quickAttack: boolean;
  heavyAttack: boolean;
  dodge: boolean;
};

export type FighterStats = {
  id: FighterId;
  name: string;
  texture: string;
  spawn: Phaser.Math.Vector2;
  tint: number;
  accent: number;
  speed: number;
  jumpVelocity: number;
  airControl: number;
  weight: number;
};

export type AttackSpec = {
  kind: AttackKind;
  damage: number;
  reach: number;
  height: number;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  baseKnockback: number;
  knockbackGrowth: number;
  upwardForce: number;
  selfFreezeMs: number;
};

export type AttackRuntime = {
  ownerId: FighterId;
  kind: AttackKind;
  startsAt: number;
  activeAt: number;
  expiresAt: number;
  rect: Phaser.GameObjects.Rectangle;
  hit: boolean;
  spec: AttackSpec;
};

export type MatchWinner = FighterId | 'draw';

export type ResultPayload = {
  winner: MatchWinner;
  playerDamage: number;
  cpuDamage: number;
};
