import type { MatchConfig } from '../types';
import { CHARACTER_KEYS } from './fighters';

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
