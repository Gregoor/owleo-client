import d3 from 'd3';
import _ from 'lodash';
import Vector from 'wacktor';

const LINK_STRENGTH = .001;

export default {

	addPhysicsTo(layer) {
		let {container, concepts, el} = layer;
		let force = d3.layout.force().size([this.WIDTH, this.HEIGHT]);
		if (!this.forces) this.forces = [force];
		else this.forces.push(force);

		force.nodes(concepts).start();
		force.on('tick', e => {

			force
				.charge(d => -210 + Math.pow(d.r, 2) * -.29)
				.gravity(.15)
				.linkDistance(d => d.source.r * 2 + d.target.r * 2)
				.start();

			el.each(d => {
				let force = Vector.zero();
				let absPos = new Vector(d.absX, d.absY);

				let links = this.reqLinks.get(d.id);
				if (links) for (let link of links) {
					let {from, to} = d3.select(link).datum();
					let related = from.id == d.id ? to : from;

					let between = new Vector(related.absX, related.absY).sub(absPos);
					force = force.add(
						between.mul(LINK_STRENGTH)
					);
				}
				let pos = force.mul(e.alpha).add(d.x, d.y);
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
