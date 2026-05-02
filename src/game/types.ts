export type FighterId = 'player' | 'cpu';

export type CharacterKey = 'strawberry' | 'banana' | 'grape' | 'watermelon' | 'pineapple' | 'cherry';

export type StageKey = 'kitchen';

export type Facing = -1 | 1;

export type MoveDirection = 'neutral' | 'side' | 'up' | 'down';

export type AttackButton = 'normal' | 'special';

export type AttackKind = `${AttackButton}-${MoveDirection}`;

export type AttackType = 'melee' | 'projectile' | 'trap' | 'armor' | 'multiHit';

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
  characterKey: CharacterKey;
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

export type CharacterSelectCard = {
  key: CharacterKey;
  name: string;
  shortName: string;
  role: string;
  trait: string;
  weapon: string;
  portraitTexture: string;
  tint: number;
  accent: number;
};

export type StageSelectCard = {
  key: StageKey;
  name: string;
  subtitle: string;
  description: string;
  previewTexture: string;
};

export type MatchConfig = {
  playerCharacter: CharacterKey;
  cpuCharacter: CharacterKey;
  stage: StageKey;
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
  attackType?: AttackType;
  selfVelocityX?: number;
  selfVelocityY?: number;
  projectileSpeed?: number;
  projectileLifetimeMs?: number;
  trapLifetimeMs?: number;
  armorMs?: number;
  hitCount?: number;
  hitIntervalMs?: number;
};

export type AttackRuntime = {
  ownerId: FighterId;
  kind: AttackKind;
  startsAt: number;
  activeAt: number;
  expiresAt: number;
  rect: Phaser.GameObjects.Rectangle;
  visual: Phaser.GameObjects.Image;
  hit: boolean;
  spec: AttackSpec;
  fixedPosition?: boolean;
  velocityX?: number;
  velocityY?: number;
  hitsDone: number;
  nextHitAt: number;
};

export type MatchWinner = FighterId | 'draw';

export type ResultPayload = {
  winner: MatchWinner;
  playerDamage: number;
  cpuDamage: number;
  config: MatchConfig;
};
