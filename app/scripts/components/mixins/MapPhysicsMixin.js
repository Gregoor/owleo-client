import _ from 'lodash';
import Vector from 'wacktor';


export default {

  addPhysicsTo(layer) {
    let {container, concepts, el} = layer;
    let force = d3.layout.force().size([this.WIDTH, this.HEIGHT]);
    if (!this.forces) this.forces = [force];
    else this.forces.push(force);

    force.nodes(concepts).start();

    let minReq = Infinity, maxReq = 0;
    el.each(d => {
      let {reqCount} = d;
      if (reqCount < minReq) minReq = reqCount;
      if (reqCount > maxReq) maxReq = reqCount;
    });


    force.on('tick', event => {

      force
        .charge(d => -210 + Math.pow(d.r, 2) * -.29)
        .gravity(.15)
        .linkDistance(d => d.source.r * 2 + d.target.r * 2)
        .start();

      el.each(d => {
        let {x, y} = d;
        let pos = new Vector(x, y);
        let force = pos.mul((7 * (d.reqCount - minReq) / maxReq) / pos.mag());
        pos = pos.add(force.mul(event.alpha));
        d.x = pos.x;
        d.y = pos.y;
      });
    });
  },

  startPhysics() {
    this.forces.forEach(f => f.start());
  },

  stopPhysics() {
    this.forces.forEach(f => f.stop());
  }

}
