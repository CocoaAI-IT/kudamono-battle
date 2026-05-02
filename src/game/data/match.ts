import type { CharacterKey, MatchConfig, StageKey } from '../types';
import { CHARACTER_KEYS } from './fighters';
import { STAGE_KEYS } from './stage';

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  playerCharacter: 'strawberry',
  cpuCharacter: 'banana',
  stage: 'kitchen'
};

const CPU_RIVALS: Record<MatchConfig['playerCharacter'], MatchConfig['cpuCharacter']> = {
  strawberry: 'banana',
  banana: 'grape',
  grape: 'cherry',
  watermelon: 'grape',
  pineapple: 'strawberry',
  cherry: 'banana'
};

export function getCpuCharacterFor(playerCharacter: MatchConfig['playerCharacter']): MatchConfig['cpuCharacter'] {
  const rival = CPU_RIVALS[playerCharacter];

  if (rival !== playerCharacter) {
    return rival;
  }

  return CHARACTER_KEYS.find((character) => character !== playerCharacter) ?? 'banana';
}

export function normalizeMatchConfig(config: Partial<MatchConfig> = {}): MatchConfig {
  const playerCharacter = isCharacterKey(config.playerCharacter)
    ? config.playerCharacter
    : DEFAULT_MATCH_CONFIG.playerCharacter;
  const cpuCharacter = isCharacterKey(config.cpuCharacter) && config.cpuCharacter !== playerCharacter
    ? config.cpuCharacter
    : getCpuCharacterFor(playerCharacter);
  const stage = isStageKey(config.stage) ? config.stage : DEFAULT_MATCH_CONFIG.stage;

  return {
    playerCharacter,
    cpuCharacter,
    stage
  };
}

function isCharacterKey(value: unknown): value is CharacterKey {
  return typeof value === 'string' && (CHARACTER_KEYS as readonly string[]).includes(value);
}

function isStageKey(value: unknown): value is StageKey {
  return typeof value === 'string' && (STAGE_KEYS as readonly string[]).includes(value);
}
