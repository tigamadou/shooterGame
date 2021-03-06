// eslint-disable-next-line import/no-unresolved
import Phaser from 'phaser';
import Player from '../Components/Player';
import GunShip from '../Components/GunShip';
import ChaserShip from '../Components/ChaserShip';
import CarrierShip from '../Components/CarrierShip';
import ScrollingBackground from '../Components/ScrollingBackground';

const score = 0;
export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    // load images
    this.load.image('logo', 'src/Componentslogo.png');
    this.APP = this.game.APP;
  }

  create() {
    this.globals = this.sys.game.globals;

    this.backgrounds = [];
    for (let i = 0; i < 5; i += 1) { // create five scrolling backgrounds
      const bg = new ScrollingBackground(this, 'sprBg0', i * 10);
      this.backgrounds.push(bg);
    }

    this.createStats();
    this.player = new Player(
      this,
      this.game.config.width * 0.5,
      this.game.config.height * 0.5,
      'sprPlayer',
      this.APP.stage.player,
    );

    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.enemies = this.add.group();
    this.enemyLasers = this.add.group();
    this.playerLasers = this.add.group();

    this.createEnemies();
    this.createColisions(this.player);
    this.runTimer();
  }

  createStats() {
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '16px',
      fill: '#fff',
    });
  }

  runTimer() {
    this.timeLimit = 0;
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLimit += 1;
        if (this.APP.canLevelUp(this.timeLimit) && !this.player.getData('isDead')) {
          this.scene.start('Stage');
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  createColisions(player) {
    this.physics.add.overlap(this.playerLasers, this.enemies, (playerLaser, enemy) => {
      if (enemy && !enemy.getData('isDead')) {
        playerLaser.destroy();

        enemy.life -= playerLaser.fire;

        if (enemy.life <= 0) {
          if (enemy.onDestroy !== undefined) {
            enemy.onDestroy();
          }
          enemy.explode(true);

          this.APP.score(enemy.score);

          if (score >= 1000) {
            player.levelUp(2);
          }
          if (score >= 5000) {
            player.levelUp(3);
          }

          if (score >= 10000) {
            player.levelUp(4);
          }
        }
      }
    });

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (!player.getData('isDead')
        && !enemy.getData('isDead')) {
        player.explode(false);
        enemy.explode(true);
      }
    });

    this.physics.add.overlap(this.player, this.enemyLasers, (player, laser) => {
      if (!player.getData('isDead')
        && !laser.getData('isDead')) {
        player.explode(false);
        laser.destroy();
      }
    });
  }

  createEnemies() {
    this.APP.stage.enemies.forEach((stageEnemy) => {
      stageEnemy = this.APP.getEnemies(stageEnemy);

      this.time.addEvent({
        delay: stageEnemy.createDelay,
        callback() {
          let enemy = null;
          if (stageEnemy.name === 'GunShip') {
            if (this.getEnemiesByType('GunShip').length < stageEnemy.maxNumber) {
              enemy = new GunShip(
                this,
                Phaser.Math.Between(0, this.game.config.width),
                0,
                stageEnemy,
              );
            }
          } else if (stageEnemy.name === 'ChaserShip') {
            if (this.getEnemiesByType('ChaserShip').length < stageEnemy.maxNumber) {
              enemy = new ChaserShip(
                this,
                Phaser.Math.Between(0, this.game.config.width),
                0,
                stageEnemy,
              );
            }
          } else if (stageEnemy.name === 'CarrierShip') {
            if (this.getEnemiesByType('CarrierShip').length < stageEnemy.maxNumber) {
              enemy = new CarrierShip(
                this,
                Phaser.Math.Between(0, this.game.config.width),
                0,
                stageEnemy,
              );
            }
          }

          if (enemy !== null) {
            // enemy.setScale(2);
            this.enemies.add(enemy);
          }
        },
        callbackScope: this,
        loop: true,
      });
    });
  }

  update() {
    this.scoreText.setText(`Score: ${this.APP.model.score}`);

    for (let i = 0; i < this.backgrounds.length; i += 1) {
      this.backgrounds[i].update();
    }
    if (!this.player.getData('isDead')) {
      this.player.update();

      if (this.keyW.isDown || this.keyUp.isDown) {
        this.player.moveUp();
      } else if (this.keyS.isDown || this.keyDown.isDown) {
        this.player.moveDown();
      }

      if (this.keyA.isDown || this.keyLeft.isDown) {
        this.player.moveLeft();
      } else if (this.keyD.isDown || this.keyRight.isDown) {
        this.player.moveRight();
      }

      if (this.keySpace.isDown) {
        this.player.setData('isShooting', true);
      } else {
        this.player.setData('timerShootTick', this.player.getData('timerShootDelay') - 1);
        this.player.setData('isShooting', false);
      }
    } else {
      this.gameOver();
    }

    for (let z = 0; z < this.enemies.getChildren().length; z += 1) {
      const enemy = this.enemies.getChildren()[z];

      enemy.update();
      if (enemy.x < -enemy.displayWidth
        || enemy.x > this.game.config.width + enemy.displayWidth
        || enemy.y < -enemy.displayHeight * 4
        || enemy.y > this.game.config.height + enemy.displayHeight) {
        if (enemy) {
          if (enemy.onDestroy !== undefined) {
            enemy.onDestroy();
          }

          enemy.destroy();
        }
      }
    }

    for (let i = 0; i < this.enemyLasers.getChildren().length; i += 1) {
      const laser = this.enemyLasers.getChildren()[i];
      laser.update();

      if (laser.x < -laser.displayWidth
        || laser.x > this.game.config.width + laser.displayWidth
        || laser.y < -laser.displayHeight * 4
        || laser.y > this.game.config.height + laser.displayHeight) {
        if (laser) {
          laser.destroy();
        }
      }
    }

    for (let y = 0; y < this.playerLasers.getChildren().length; y += 1) {
      const playerLaser = this.playerLasers.getChildren()[y];
      playerLaser.update();

      if (playerLaser.x < -playerLaser.displayWidth
        || playerLaser.x > this.game.config.width + playerLaser.displayWidth
        || playerLaser.y < -playerLaser.displayHeight * 4
        || playerLaser.y > this.game.config.height + playerLaser.displayHeight) {
        if (playerLaser) {
          playerLaser.destroy();
        }
      }
    }
  }

  getEnemiesByType(type) {
    const arr = [];
    for (let i = 0; i < this.enemies.getChildren().length; i += 1) {
      const enemy = this.enemies.getChildren()[i];
      if (enemy.getData('type') === type) {
        arr.push(enemy);
      }
    }
    return arr;
  }

  gameOver() {
    if (!this.APP.model.gameOver) {
      this.APP.model.gameOver = true;

      setTimeout(() => {
        this.scene.start('GameOver');
      }, 3000);
    }
  }
}
