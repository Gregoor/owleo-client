const WIDTH = 500, HEIGHT = 500;
const HF_WIDTH = WIDTH / 2, HF_HEIGHT = HEIGHT / 2;
const BASE_RAD = 10;
const OUTER_STRENGTH = -.3;

export default {
	addPhysicsTo(layer) {
		let {concepts, links} = layer;
		let force = d3.layout.force().size([WIDTH, HEIGHT]);
		if (!this.forces) this.forces = [force];
		else this.forces.push(force);

		force.nodes(concepts).links(links).start();
		force.on('tick', () => {
			force
				.charge(d => -200 + Math.pow(d.r, 2) * -.19)
				.linkDistance(d => d.source.r + d.target.r + 2 * BASE_RAD)
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
