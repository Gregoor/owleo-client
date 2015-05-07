const OUTER_STRENGTH = -.3;

export default {
	addPhysicsTo(layer) {
		let {concepts, links} = layer;
		let force = d3.layout.force().size([this.WIDTH, this.HEIGHT]);
		if (!this.forces) this.forces = [force];
		else this.forces.push(force);

		force.nodes(concepts).links(links).start();
		force.on('tick', () => {
			force
				.charge(d => -200 + Math.pow(d.r, 2) * -.19)
				.linkDistance(d => d.source.r + d.target.r + 2 * this.BASE_RAD)
				.start();
		});
	},
	startPhysics() {
		this.forces.forEach(f => f.start());
	},
	stopPhysics() {
		this.forces.forEach(f => f.stop());
	}
}
