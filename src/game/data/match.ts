import type { MatchConfig } from '../types';

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  playerCharacter: 'strawberry',
  cpuCharacter: 'banana',
  stage: 'kitchen'
};

export function getCpuCharacterFor(playerCharacter: MatchConfig['playerCharacter']): MatchConfig['cpuCharacter'] {
  return playerCharacter === 'strawberry' ? 'banana' : 'strawberry';
}
