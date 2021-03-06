// eslint-disable-next-line import/no-unresolved
import Phaser from 'phaser';

export default {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 480,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  dom: {
    createContainer: true,
  },
};
