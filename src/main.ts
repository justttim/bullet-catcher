import Phaser from 'phaser';
import { Game } from './scenes/Game';
import { UI } from './scenes/UI';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [Game, UI],
};

new Phaser.Game(config);
