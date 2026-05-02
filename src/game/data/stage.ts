export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const DEATH_BOUNDS = {
  left: -230,
  right: GAME_WIDTH + 230,
  top: -240,
  bottom: GAME_HEIGHT + 190
};

export const STAGE_CENTER = { x: GAME_WIDTH / 2, y: 430 };

export const PLATFORMS = [
  {
    id: 'main',
    x: 640,
    y: 518,
    width: 680,
    height: 38,
    color: 0x21375a,
    edge: 0x83e7ff
  },
  {
    id: 'left',
    x: 385,
    y: 390,
    width: 230,
    height: 24,
    color: 0x182946,
    edge: 0x72f6b4
  },
  {
    id: 'right',
    x: 895,
    y: 390,
    width: 230,
    height: 24,
    color: 0x182946,
    edge: 0xff7aa2
  }
] as const;
