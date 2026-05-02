import Phaser from 'phaser';
import './styles.css';
import { GameScene } from './game/scenes/GameScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { ResultScene } from './game/scenes/ResultScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#09111f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1400, x: 0 },
      debug: false
    }
  },
  scene: [PreloadScene, GameScene, ResultScene]
};

new Phaser.Game(config);
