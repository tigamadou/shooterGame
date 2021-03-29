import Entity from './Entity'
import EnemyLaser from './EnemyLaser'
export default class ChaserShip extends Entity {
  constructor(scene, x, y,params) {
    super(scene, x, y, "sprEnemy1", "ChaserShip");
    this.params = params;
    this.velocity = { x: 0, y: this.params.speed }
    this.body.velocity.y = this.velocity.y;
  

    this.life = 20
    this.score = this.life / 2
    this.setScale((params.rank/100)+2)
  }

  update() {
    if (!this.getData("isDead") && this.scene.player) {
      if (Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.scene.player.x,
        this.scene.player.y
      ) < 320) {

        this.params.state = this.states.CHASE;
      }

      if (this.params.state == this.states.CHASE) {
        var dx = this.scene.player.x - this.x;
        var dy = this.scene.player.y - this.y;

        var angle = Math.atan2(dy, dx);

        this.velocity = { x: Math.cos(angle) * this.params.speed, y: Math.sin(angle) * this.params.speed }
        this.body.setVelocity(
          this.velocity.x,
          this.velocity.y
        );
      }
      if (this.x < this.scene.player.x) {
        this.angle -= 5;
      }
      else {
        this.angle += 5;
      }
    }
  }
}