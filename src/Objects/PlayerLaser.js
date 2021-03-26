import Entity from './Entity'
export default class PlayerLaser extends Entity {
    constructor(scene, x, y) {
      super(scene, x, y, "sprLaserPlayer");
      this.body.velocity.y = -200;
      this.setScale(2)
      
      this.fire=25
    }
  }