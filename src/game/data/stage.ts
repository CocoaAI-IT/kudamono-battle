export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const DEATH_BOUNDS = {
  left: -230,
  right: GAME_WIDTH + 230,
  top: -240,
  bottom: GAME_HEIGHT + 190
};

export const STAGE_CENTER = { x: GAME_WIDTH / 2, y: 500 };

export const PLATFORMS = [
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
] as const;
