export type FighterId = 'player' | 'cpu';

export type Facing = -1 | 1;

export type MoveDirection = 'neutral' | 'side' | 'up' | 'down';

export type AttackButton = 'normal' | 'special';

export type AttackKind = `${AttackButton}-${MoveDirection}`;

export type FighterMotion = 'idle' | 'run' | 'jump' | 'quick' | 'heavy' | 'hurt';

export type FighterIntent = {
  moveX: number;
  moveY: number;
  jump: boolean;
  normalAttack: boolean;
  specialAttack: boolean;
  dodge: boolean;
};

export type FighterStats = {
  id: FighterId;
  name: string;
  shortName: string;
  textures: Record<FighterMotion, string>;
  spawn: Phaser.Math.Vector2;
  tint: number;
  accent: number;
  speed: number;
  jumpVelocity: number;
  airControl: number;
  weight: number;
  moves: Record<AttackKind, AttackSpec>;
};

export type AttackSpec = {
  kind: AttackKind;
  name: string;
  button: AttackButton;
  direction: MoveDirection;
  motion: FighterMotion;
  damage: number;
  reach: number;
  height: number;
  offsetX: number;
  offsetY: number;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  baseKnockback: number;
  knockbackGrowth: number;
  launchY: number;
  launchYGrowth: number;
  selfFreezeMs: number;
  selfVelocityX?: number;
  selfVelocityY?: number;
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
