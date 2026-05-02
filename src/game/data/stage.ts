import Phaser from 'phaser';
import type { StageKey, StageSelectCard } from '../types';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const DEATH_BOUNDS = {
  left: -230,
  right: GAME_WIDTH + 230,
  top: -240,
  bottom: GAME_HEIGHT + 190
};

export const STAGES = {
  kitchen: {
    key: 'kitchen',
    name: 'Kitchen Counter',
    subtitle: 'Cutting Board Clash',
    description: 'A warm countertop arena with a wide cutting board and two plate platforms.',
    backgroundTexture: 'background-kitchen',
    previewTexture: 'background-kitchen',
    center: { x: GAME_WIDTH / 2, y: 500 },
    playerSpawn: new Phaser.Math.Vector2(430, 378),
    cpuSpawn: new Phaser.Math.Vector2(850, 378),
    platforms: [
      {
        id: 'cutting-board',
        x: 640,
        y: 520,
        width: 1030,
        height: 42
      },
      {
        id: 'left-plate',
        x: 328,
        y: 398,
        width: 252,
        height: 24
      },
      {
        id: 'right-plate',
        x: 952,
        y: 398,
        width: 260,
        height: 24
      }
    ]
  },
  darkBoard: {
    key: 'darkBoard',
    name: 'Dark Board',
    subtitle: 'Final Cutting Board',
    description: 'A single flat dark cutting board with no floating side platforms.',
    backgroundTexture: 'background-dark-board',
    previewTexture: 'background-dark-board',
    center: { x: GAME_WIDTH / 2, y: 430 },
    playerSpawn: new Phaser.Math.Vector2(430, 286),
    cpuSpawn: new Phaser.Math.Vector2(850, 286),
    platforms: [
      {
        id: 'dark-cutting-board',
        x: 640,
        y: 424,
        width: 1088,
        height: 42
      }
    ]
  }
} as const;

export const STAGE_KEYS: StageKey[] = ['kitchen', 'darkBoard'];

export const STAGE_SELECT_CARDS: StageSelectCard[] = STAGE_KEYS.map((key) => ({
  key,
  name: STAGES[key].name,
  subtitle: STAGES[key].subtitle,
  description: STAGES[key].description,
  previewTexture: STAGES[key].previewTexture
}));

export const STAGE_CENTER = STAGES.kitchen.center;
export const PLATFORMS = STAGES.kitchen.platforms;
